
export const HARD_CONSTRAINTS = new Set([
  "no_flashing_lights",
  "low_crowd",
  "pet_access",
  "reliable_seating",
  "wheelchair_access",
  "accessible_restroom",
  "parking_near_entrance",
  "no_alcohol_centered",
  "quiet_environment"
]);

export function minutesBetween(start, end) {
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  return (eh * 60 + em) - (sh * 60 + sm);
}

export function feasible(candidate, request, profile) {
  const available = minutesBetween(request.start, request.end);
  const total = candidate.outboundMinutes + candidate.activityMinutes +
    candidate.returnMinutes + (request.bufferMinutes ?? 15);

  const reasons = [];
  if (available <= 0) reasons.push("Invalid time window");
  if (total > available) reasons.push(`Needs ${total} minutes but only ${available} are available`);
  if (candidate.social !== request.social) reasons.push(`Requires ${candidate.social}`);
  if (candidate.setting !== request.setting) reasons.push(`Is ${candidate.setting}`);
  if (candidate.costClass !== request.cost) reasons.push(`Cost class is ${candidate.costClass}`);

  for (const constraint of profile.hardConstraints ?? []) {
    if (constraint === "no_flashing_lights" && candidate.flashingLights) reasons.push("Flashing lights conflict");
    if (constraint === "low_crowd" && candidate.crowdLevel === "high") reasons.push("Crowd level too high");
    if (constraint === "pet_access" && !candidate.petFriendly) reasons.push("Pet access unavailable");
    if (constraint === "reliable_seating" && !candidate.reliableSeating) reasons.push("Reliable seating unavailable");
    if (constraint === "wheelchair_access" && !candidate.wheelchairAccessible) reasons.push("Wheelchair access unavailable");
    if (constraint === "accessible_restroom" && !candidate.accessibleRestroom) reasons.push("Accessible restroom unavailable");
    if (constraint === "parking_near_entrance" && !candidate.parkingNearEntrance) reasons.push("Parking too far from entrance");
    if (constraint === "no_alcohol_centered" && candidate.alcoholCentered) reasons.push("Alcohol-centered venue");
    if (constraint === "quiet_environment" && ["high","very_high"].includes(candidate.noiseLevel)) reasons.push("Too noisy");
  }

  if (profile.maxWalkingMiles != null && candidate.walkingMiles > profile.maxWalkingMiles) {
    reasons.push(`Walking ${candidate.walkingMiles} mi exceeds limit ${profile.maxWalkingMiles} mi`);
  }

  return {
    ok: reasons.length === 0,
    reasons,
    availableMinutes: available,
    requiredMinutes: total
  };
}

function clamp(n, min=0, max=100) { return Math.max(min, Math.min(max, n)); }

export function scoreCandidate(candidate, request, profile, neighborBoost = 0) {
  let physical = 100;
  if (profile.maxWalkingMiles != null && candidate.walkingMiles > profile.maxWalkingMiles * 0.8) physical -= 22;
  if (profile.preferredIntensity && candidate.intensity !== profile.preferredIntensity) physical -= 12;
  if (profile.requiresSeating && !candidate.reliableSeating) physical -= 50;

  let mental = 100;
  if (profile.noiseTolerance === "low" && candidate.noiseLevel !== "low") mental -= 30;
  if (profile.crowdTolerance === "low" && candidate.crowdLevel !== "low") mental -= 28;
  if (profile.prefersPredictable && !candidate.predictable) mental -= 18;

  let practical = 100;
  practical -= Math.max(0, candidate.outboundMinutes - (profile.preferredDriveMinutes ?? 15)) * 2;
  if (request.petComing && !candidate.petFriendly) practical -= 60;
  if (!candidate.cardAccepted) practical -= 20;

  let preference = 50;
  if ((profile.categories ?? []).includes(candidate.category)) preference += 35;
  if ((profile.dislikes ?? []).includes(candidate.category)) preference -= 45;
  if (candidate.novelty === profile.noveltyPreference) preference += 10;

  const timeEfficiency = clamp(100 - Math.max(0, candidate.outboundMinutes + candidate.returnMinutes - 20) * 1.5);
  const uncertaintyPenalty = candidate.confidence === "high" ? 0 : candidate.confidence === "medium" ? 8 : 18;

  const total = clamp(
    physical * 0.24 +
    mental * 0.22 +
    practical * 0.20 +
    preference * 0.18 +
    timeEfficiency * 0.11 +
    neighborBoost * 0.05 -
    uncertaintyPenalty
  );

  return {
    total: Math.round(total),
    dimensions: {
      physical: Math.round(clamp(physical)),
      mental: Math.round(clamp(mental)),
      practical: Math.round(clamp(practical)),
      preference: Math.round(clamp(preference)),
      timeEfficiency: Math.round(clamp(timeEfficiency)),
      neighbor: Math.round(clamp(neighborBoost))
    }
  };
}

export function applyFeedback(profile, event) {
  const next = structuredClone(profile);
  next.feedback = [...(next.feedback ?? []), event];

  if (event.type === "too_loud") next.noiseTolerance = "low";
  if (event.type === "too_crowded") next.crowdTolerance = "low";
  if (event.type === "too_far") {
    next.preferredDriveMinutes = Math.max(5, (next.preferredDriveMinutes ?? 15) - 3);
  }
  if (event.type === "chair_unsuitable") {
    next.requiresSeating = true;
    next.hardConstraints = Array.from(new Set([...(next.hardConstraints ?? []), "reliable_seating"]));
  }
  if (event.type === "liked" && event.category) {
    next.categories = Array.from(new Set([...(next.categories ?? []), event.category]));
  }
  return next;
}

export function applyIntakeHints(profile, hints = []) {
  const next = structuredClone(profile);
  const constraints = new Set(next.hardConstraints ?? []);

  if (hints.includes("limited_walking")) {
    next.maxWalkingMiles = Math.min(next.maxWalkingMiles ?? 0.5, 0.5);
    next.preferredIntensity = "low";
  }
  if (hints.includes("reliable_seating")) {
    next.requiresSeating = true;
    constraints.add("reliable_seating");
  }
  if (hints.includes("quiet_environment")) {
    next.noiseTolerance = "low";
    constraints.add("quiet_environment");
  }
  if (hints.includes("low_crowd")) {
    next.crowdTolerance = "low";
    constraints.add("low_crowd");
  }
  if (hints.includes("wheelchair_access")) constraints.add("wheelchair_access");

  next.hardConstraints = [...constraints];
  return next;
}
