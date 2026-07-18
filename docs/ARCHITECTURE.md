# Architecture

```text
User selections + exact time window
        +
Personal Fit profile + daily state
        ↓
Candidate venue/activity set
        ↓
Deterministic hard-constraint filter
        ↓
Anonymous-neighbor score
        ↓
Whole-person ranking
        ↓
GPT-5.6 explanation + readiness checklist
        ↓
Outcome feedback updates profile
```

## Design rule

AI interprets nuance. Code enforces non-negotiable constraints.

## Main schemas

- `UserFitProfile`
- `DailyState`
- `CandidateExperience`
- `ConstraintDecision`
- `FitScore`
- `FeedbackEvent`
- `AnonymousNeighborVector`
- `ReadinessChecklist`

## Production adapters

- Venue/event discovery
- Maps/routing
- Weather
- Calendar
- Saved errands
- Apple Health / HealthKit
- Android Health Connect
- Companion-app exports such as VeryFit where available
