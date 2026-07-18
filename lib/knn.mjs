
function dot(a,b){ return a.reduce((s,x,i)=>s+x*(b[i]??0),0); }
function norm(a){ return Math.sqrt(dot(a,a)); }

export function cosineSimilarity(a,b){
  const d = norm(a)*norm(b);
  return d === 0 ? 0 : dot(a,b)/d;
}

export function neighborBoost(userVector, candidateId, neighbors, k=3){
  const ranked = neighbors
    .map(n=>({...n, similarity: cosineSimilarity(userVector, n.vector)}))
    .sort((a,b)=>b.similarity-a.similarity)
    .slice(0,k);

  if (!ranked.length) return 0;
  let numerator = 0, denominator = 0;
  for (const n of ranked) {
    const rating = n.ratings[candidateId] ?? 0;
    numerator += n.similarity * rating;
    denominator += Math.abs(n.similarity);
  }
  if (denominator === 0) return 0;
  return Math.max(0, Math.min(100, 50 + (numerator/denominator)*10));
}
