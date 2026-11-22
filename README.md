# The Late Edit · Newsroom portal

Production portal for the two-anchor, late-night-style Hinglish news show (Reema and Siddharth).

## Run

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Navigation

- **Dashboard**: output targets and coverage across both anchors
- **Reema / Siddharth**
  - **Dashboard**: persona, daily targets, next steps
  - **Videos**: long-form YouTube videos (daily 7-10 min episode, weekly 20-24 min)
  - **Shorts**: vertical shorts (3-15/day) with separate Instagram and YouTube status
  - **Scripts**: scripts for review, each with a John Oliver-style segment breakdown
  - **Library & Data Sources**: feed-monitoring sheet (source, anchor, beat, format, check frequency, monitored by); add, deactivate and reactivate sources

## Review flow

Scripts, videos and shorts each have Approve / Reject / Rework buttons. Anything not reviewed within
60 minutes of submission is auto-approved for publication. Rework requires a note; resubmitting restarts
the 60-minute window. Rejected items are cancelled.

## Where the content lives

- `src/lib/anchors.ts`: personas and publishing targets
- `src/lib/sources.ts`: the starting source library (copied into `data/sources.json` on first run; add and deactivate sources in the portal)
- `src/lib/scripts.ts`: episode segments and draft lines
- `src/lib/review.ts`: approval rules, including the 60-minute auto-approval
- `data/*.json`: saved sources, scripts, videos and shorts (created on first run, not committed)
