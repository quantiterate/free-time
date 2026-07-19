# FREE Time

**Feeling Relieved Experience Engine**

FREE Time recommends complete, time-feasible experiences that fit the whole person: physical capability, mental and sensory comfort, companions, pets, venue characteristics, cost, travel, and the exact return deadline.

## Why it is different

Most local discovery products answer **what is nearby**. FREE Time answers:

> Given this exact block of free time, what can this person realistically do, enjoy, afford, and return from on time?

## Working vertical slice

- Three contrasting demo personas
- Only three binary user choices: Alone/Together, Inside/Outside, Free/Pay
- Exact start and return deadline
- Deterministic hard-constraint filtering
- Whole-person scoring
- Anonymous-neighbor boost using cosine similarity
- GPT-5.6 explanation layer through the OpenAI Responses API
- Feedback events that update the profile
- “And don’t forget…” readiness checklist
- Honest demo fallback when no API key is configured
- Automated tests

## Run locally

```bash
npm install
cp .env.example .env
# Add OPENAI_API_KEY to .env, or run in demo mode without it
npm start
```

Open `http://localhost:3000`.

Node.js 20 or newer is required.

## Run tests

```bash
npm test
```

## Live demo

The app is deployed on Cloudflare Workers:

**https://free-time.matthewjgossjr.workers.dev**

The same engine runs in two interchangeable ways:

- `server.mjs` — plain Node.js/Express server (local development, judges cloning the repo)
- `worker.mjs` — Cloudflare Workers entry (production). Feedback-updated profiles persist in Workers KV because Worker isolates are ephemeral. Deploy with `npx wrangler deploy`; set the API key with `npx wrangler secret put OPENAI_API_KEY`.

Both share `lib/recommend.mjs` (candidate filtering, ranking, and the GPT-5.6 explanation layer) and the deterministic engine in `lib/engine.mjs`.

## GPT-5.6

The server calls the OpenAI Responses API from `lib/recommend.mjs`. The model provides nuanced, non-diagnostic explanations and a personalized readiness checklist. It does **not** enforce time arithmetic or hard constraints.

## Deterministic safeguards

The code in `lib/engine.mjs` enforces:

- time-window feasibility,
- return buffer,
- selected social/setting/cost combination,
- accessibility and sensory exclusions,
- pet access,
- walking tolerance,
- seating requirements.

A language model cannot overrule those filters.

## Machine learning proof of concept

`lib/knn.mjs` implements cosine-similarity nearest neighbors over anonymous, derived feature vectors. Neighbor evidence affects ranking only after hard constraints pass.

## Privacy boundary

The prototype uses synthetic personas. Production design principles:

- explicit consent,
- minimum necessary data,
- editable and deletable profile,
- approximate location for discovery,
- precise location only for routing,
- wearable data as optional contextual signals,
- no diagnosis,
- no emergency-monitoring claim,
- no sale of health- or location-derived data.

## Known limitations

- Candidate venues are curated sample data.
- Live hours, routing, weather, seating, crowd, and pet rules are not yet connected.
- Wearable integrations are architectural, not production-certified.
- This is not a medical device or clinical decision system.

## How Codex and GPT-5.6 built this

**GPT-5.6** does the cognitive work in two places at runtime:

1. **Natural-language intake** (`/api/intake`): free text like *"I've got about two hours, my knee is acting up, and the dog's coming"* is structured by GPT-5.6 into a typed request — duration, energy, stimulation, pet, and conservative functional-constraint hints from a fixed whitelist. The model interprets; the deterministic engine enforces. Parsed hints become temporary hard constraints via `applyIntakeHints` and never bypass the filter.
2. **Explanation layer**: GPT-5.6 (OpenAI Responses API) writes the plain-language explanation, uncertainty framing, and the personalized "And don't forget…" checklist for each plan. It never performs time arithmetic or constraint enforcement, and the app fails soft to deterministic output if the model is unavailable.

**Codex** (CLI, in this repository) built the feature layer on top of the initial engine scaffold:

- the `/api/intake` endpoint and the GPT-5.6 intake parser with whitelist validation and clamping,
- `applyIntakeHints` in the engine, with its automated test,
- the explainability UI: per-plan score-dimension bars, the "Why not the others?" rejected-plans panel with recorded reasons, and the visible profile-update notes after feedback,
- the fourth persona (Priya) and six additional venues chosen to exercise the constraint engine (including deliberately failing cases),
- interface fixes and polish.

Key decisions — the deterministic-filter-before-AI architecture, the whitelist boundary on model-inferred constraints, and what the app must *not* claim (no diagnosis, no medical fitness) — were product calls made by the author and enforced in code. Deployment (Cloudflare Workers + KV) and release verification were automated with Claude Code.

## Repository map

- `server.mjs` — Express API and OpenAI integration
- `lib/engine.mjs` — feasibility, scoring, and feedback
- `lib/knn.mjs` — nearest-neighbor model
- `lib/data.mjs` — demo personas, candidates, and neighbors
- `public/index.html` — judge-facing application
- `test/` — automated tests
- `docs/` — architecture, demo, submission, and handoff materials
