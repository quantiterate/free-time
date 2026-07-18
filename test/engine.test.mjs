
import test from "node:test";
import assert from "node:assert/strict";
import {feasible, scoreCandidate, applyFeedback, minutesBetween} from "../lib/engine.mjs";
import {personas, candidates} from "../lib/data.mjs";

test("minutesBetween computes a two-hour window",()=>assert.equal(minutesBetween("13:00","15:00"),120));

test("hard constraint rejects pet-incompatible activity",()=>{
  const result=feasible(candidates.find(c=>c.id==="pickleball"),{
    start:"13:00",end:"15:00",bufferMinutes:15,social:"Together",setting:"Outside",cost:"Pay",petComing:true
  },personas.maria);
  assert.equal(result.ok,false);
  assert.ok(result.reasons.some(r=>r.includes("Pet access")));
});

test("active persona scores active activity higher than quiet persona",()=>{
  const c=candidates.find(c=>c.id==="pickleball");
  const req={start:"13:00",end:"15:00",bufferMinutes:10,social:"Together",setting:"Outside",cost:"Pay",petComing:false};
  const james=scoreCandidate(c,req,personas.james,80).total;
  const maria=scoreCandidate(c,req,personas.maria,20).total;
  assert.ok(james>maria);
});

test("chair feedback adds reliable seating hard constraint",()=>{
  const updated=applyFeedback(personas.james,{type:"chair_unsuitable"});
  assert.equal(updated.requiresSeating,true);
  assert.ok(updated.hardConstraints.includes("reliable_seating"));
});
