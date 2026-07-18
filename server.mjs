
import express from "express";
import OpenAI from "openai";
import { personas, candidates, neighbors } from "./lib/data.mjs";
import { feasible, scoreCandidate, applyFeedback } from "./lib/engine.mjs";
import { neighborBoost } from "./lib/knn.mjs";

const app = express();
app.use(express.json({limit:"1mb"}));
app.use(express.static("public"));

const profiles = new Map(Object.entries(personas).map(([k,v])=>[k, structuredClone(v)]));

function localRecommend(profile, request) {
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

async function aiExplain(profile, request, result) {
  if (!process.env.OPENAI_API_KEY) {
    return {
      mode:"demo",
      summary:"Demo mode: deterministic filtering and local ranking are active. Add OPENAI_API_KEY to enable GPT-5.6 explanations.",
      plans:result.accepted.map(p=>({
        id:p.id,
        explanation:`Recommended because it passed all hard constraints and scored ${p.fitScore}% for whole-person fit.`,
        dontForget:["Wallet, keys, and phone","Leave with the protected return buffer","Bring any saved pet or accessibility items"]
      }))
    };
  }

  const client = new OpenAI({apiKey:process.env.OPENAI_API_KEY});
  const response = await client.responses.create({
    model: process.env.OPENAI_MODEL || "gpt-5.6",
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

app.get("/api/personas",(req,res)=>res.json(Object.values(personas).map(({id,name,summary})=>({id,name,summary}))));

app.post("/api/recommend", async (req,res)=>{
  try {
    const {personaId="maria", request} = req.body;
    const profile = profiles.get(personaId) ?? profiles.get("maria");
    const result = localRecommend(profile, request);
    const ai = await aiExplain(profile, request, result);
    res.json({...result, ai});
  } catch (err) {
    console.error(err);
    res.status(500).json({error:"Recommendation failed", detail:String(err.message ?? err)});
  }
});

app.post("/api/feedback",(req,res)=>{
  const {personaId="maria", event} = req.body;
  const current = profiles.get(personaId) ?? profiles.get("maria");
  const updated = applyFeedback(current, event);
  profiles.set(personaId, updated);
  res.json({ok:true, profile:updated});
});

app.get("/api/health",(req,res)=>res.json({
  ok:true,
  model:process.env.OPENAI_MODEL || "gpt-5.6",
  aiEnabled:Boolean(process.env.OPENAI_API_KEY)
}));

const port = process.env.PORT || 3000;
app.listen(port,()=>console.log(`FREE Time running at http://localhost:${port}`));
