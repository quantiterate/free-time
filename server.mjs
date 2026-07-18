
import express from "express";
import { personas } from "./lib/data.mjs";
import { applyFeedback } from "./lib/engine.mjs";
import { localRecommend, aiExplain } from "./lib/recommend.mjs";

const app = express();
app.use(express.json({limit:"1mb"}));
app.use(express.static("public"));

const profiles = new Map(Object.entries(personas).map(([k,v])=>[k, structuredClone(v)]));

app.get("/api/personas",(req,res)=>res.json(Object.values(personas).map(({id,name,summary})=>({id,name,summary}))));

app.post("/api/recommend", async (req,res)=>{
  try {
    const {personaId="maria", request} = req.body;
    const profile = profiles.get(personaId) ?? profiles.get("maria");
    const result = localRecommend(profile, request);
    const ai = await aiExplain(profile, request, result, {
      apiKey: process.env.OPENAI_API_KEY,
      model: process.env.OPENAI_MODEL
    });
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
