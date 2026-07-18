
import OpenAI from "openai";
import { candidates, neighbors } from "./data.mjs";
import { feasible, scoreCandidate } from "./engine.mjs";
import { neighborBoost } from "./knn.mjs";

export function localRecommend(profile, request) {
  const rejected = [];
  const accepted = [];
  for (const c of candidates) {
    const check = feasible(c, request, profile);
    if (!check.ok) {
      rejected.push({candidateId:c.id,title:c.title,reasons:check.reasons});
      continue;
    }
    const nBoost = neighborBoost(profile.vector, c.id, neighbors);
    const score = scoreCandidate(c, request, profile, nBoost);
    accepted.push({
      ...c,
      fitScore: score.total,
      dimensions: score.dimensions,
      rationale: c.facts.join(", "),
      uncertainty: c.confidence === "high" ? "Low" : "Some venue details should be reconfirmed."
    });
  }
  accepted.sort((a,b)=>b.fitScore-a.fitScore);
  return {accepted:accepted.slice(0,3), rejected};
}

function deterministicPlans(result, summary, mode) {
  return {
    mode,
    summary,
    plans:result.accepted.map(p=>({
      id:p.id,
      explanation:`Recommended because it passed all hard constraints and scored ${p.fitScore}% for whole-person fit.`,
      dontForget:["Wallet, keys, and phone","Leave with the protected return buffer","Bring any saved pet or accessibility items"]
    }))
  };
}

export async function aiExplain(profile, request, result, {apiKey, model} = {}) {
  if (!apiKey) {
    return deterministicPlans(result,
      "Demo mode: deterministic filtering and local ranking are active. Add OPENAI_API_KEY to enable GPT-5.6 explanations.",
      "demo");
  }
  try {
    return await callModel(profile, request, result, {apiKey, model});
  } catch (err) {
    // Fail soft: the deterministic engine's results are still valid without
    // the GPT-5.6 explanation layer.
    console.error("aiExplain failed:", err?.message ?? err);
    return deterministicPlans(result,
      "GPT-5.6 explanations are temporarily unavailable; deterministic filtering and ranking are unaffected.",
      "fallback");
  }
}

async function callModel(profile, request, result, {apiKey, model}) {
  const client = new OpenAI({apiKey});
  const response = await client.responses.create({
    model: model || "gpt-5.6",
    input: [{
      role:"system",
      content:[{type:"input_text",text:
`You are the explanation layer for FREE Time, a whole-person experience recommender.
Never diagnose or provide medical advice. Explain recommendations using functional needs, current state, verified facts, and uncertainties.
Return concise JSON only with keys summary and plans. Each plan must have id, explanation, and dontForget (3-6 practical checklist items).`
      }]
    },{
      role:"user",
      content:[{type:"input_text",text:JSON.stringify({profile,request,accepted:result.accepted,rejected:result.rejected})}]
    }],
    text:{format:{type:"json_object"}}
  });
  return JSON.parse(response.output_text);
}
