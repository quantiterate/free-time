
// Cloudflare Workers entry. The same engine also runs as a plain Node/Express
// app via server.mjs — see README. Feedback-updated profiles persist in KV
// because Worker isolates are ephemeral.
import { personas } from "./lib/data.mjs";
import { applyFeedback } from "./lib/engine.mjs";
import { localRecommend, aiExplain } from "./lib/recommend.mjs";

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {status, headers: {"content-type": "application/json"}});

async function getProfile(env, personaId) {
  const id = personas[personaId] ? personaId : "maria";
  const stored = await env.PROFILES.get(`profile:${id}`, "json").catch(() => null);
  return stored ?? structuredClone(personas[id]);
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    try {
      if (path === "/api/personas" && request.method === "GET") {
        return json(Object.values(personas).map(({id,name,summary})=>({id,name,summary})));
      }

      if (path === "/api/recommend" && request.method === "POST") {
        const {personaId = "maria", request: req} = await request.json();
        const profile = await getProfile(env, personaId);
        const result = localRecommend(profile, req);
        const ai = await aiExplain(profile, req, result, {
          apiKey: env.OPENAI_API_KEY,
          model: env.OPENAI_MODEL
        });
        return json({...result, ai});
      }

      if (path === "/api/feedback" && request.method === "POST") {
        const {personaId = "maria", event} = await request.json();
        const profile = await getProfile(env, personaId);
        const updated = applyFeedback(profile, event);
        await env.PROFILES.put(`profile:${personaId}`, JSON.stringify(updated));
        return json({ok:true, profile:updated});
      }

      if (path === "/api/health" && request.method === "GET") {
        return json({
          ok: true,
          model: env.OPENAI_MODEL || "gpt-5.6",
          aiEnabled: Boolean(env.OPENAI_API_KEY)
        });
      }

      return json({error: "Not found"}, 404);
    } catch (err) {
      console.error(err);
      return json({error: "Recommendation failed", detail: String(err?.message ?? err)}, 500);
    }
  }
};
