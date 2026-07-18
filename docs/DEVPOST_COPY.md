# Devpost Submission Copy

## Project name
FREE Time

## Subtitle
Feeling Relieved Experience Engine

## One-sentence description
FREE Time turns an exact opening in a person’s schedule into a complete, whole-person experience plan that fits their abilities, health and sensory needs, companions, pet, budget, travel, venue, and return deadline.

## Inspiration
Recommendation apps know what people clicked. They rarely know whether the chair fits, the room is too loud, a pet can enter, the walk is manageable, the user has enough energy today, or the entire outing can be completed before a hard deadline.

## What it does
Users choose only Alone/Together, Inside/Outside, Free/Pay and an exact time window. FREE Time applies deterministic constraints, whole-person scoring, anonymous-neighbor evidence, and GPT-5.6 reasoning to produce feasible plans with explanations, uncertainty, and an “And don’t forget…” readiness checklist.

## How we built it
- Node.js and Express
- OpenAI Responses API with GPT-5.6
- Deterministic time and hard-constraint engine
- Cosine-similarity nearest neighbors
- Responsive browser UI
- Automated tests
- Codex used to build, test, document, and iterate on the repository

## Challenges
The central challenge was separating nuanced AI reasoning from constraints that must never be left to probabilistic generation. We made time, return buffers, accessibility, sensory exclusions, pet access, and user-selected modes deterministic.

## Accomplishments
- Whole-person rather than stereotype-based personalization
- Explainable accept/reject decisions
- Feedback that changes the profile
- Honest uncertainty handling
- Readiness checklist using plan, weather, route, pet, and saved-errand context

## What we learned
Trust comes from visible boundaries. A recommendation engine should say what is verified, inferred, and unknown, and should never present itself as medical or emergency care.

## What’s next
Live venue adapters, route and weather verification, privacy-preserving user learning, and opt-in integrations with HealthKit and Android Health Connect.
