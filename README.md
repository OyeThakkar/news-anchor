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
  - **Videos**: long-form YouTube videos (daily 7-10 min episode, weekly 20-24 min), generated from approved scripts
  - **Shorts**: vertical shorts (3-15/day) with separate Instagram and YouTube status, generated from approved scripts
  - **Scripts**: scripts for review, each with a John Oliver-style segment breakdown
  - **Library & Data Sources**: feed-monitoring sheet (source, anchor, beat, format, check frequency, monitored by); add, deactivate and reactivate sources

## Pipeline

1. **Script** is reviewed: Approve / Reject / Rework. Not reviewed within 60 minutes = auto-approved.
2. **Approved script** automatically generates its video (episode script) or short (short script).
3. **Video / short** is reviewed the same way, with the same 60-minute auto-approval.
4. **Approved video** is auto-published to YouTube; an approved short is posted to Instagram Reels and YouTube Shorts.

Rework requires a note; resubmitting restarts the window (videos are regenerated first). Rejected items are cancelled.
In this prototype, video generation (2 minutes) is simulated. Publishing is real once an anchor's YouTube / Instagram
API is connected on their Profile (see `.env.example`); otherwise it is simulated. "View video" opens a preview render
that plays the approved script with captions and fact-box graphics.

## Demo

The repo ships with researched Hinglish scripts for 19-22 Nov 2026 (`src/data/demo-scripts/`): each day,
one 9:30 episode and three 1:15 shorts per anchor, on the same stories, with a shared fact box and sources.
Earlier days load already published; the latest day loads pending so the review flow can be shown live.

Right before presenting, reset the data so the 60-minute review windows start fresh:

```bash
npm run reset-demo
npm run build && npm start
```

## Where the content lives

- `src/lib/anchors.ts`: personas and publishing targets
- `src/lib/sources.ts`: the starting source library (copied into `data/sources.json` on first run; add and deactivate sources in the portal)
- `src/lib/scripts.ts`: episode segments and draft lines
- `src/lib/review.ts`: approval rules, including the 60-minute auto-approval
- `src/lib/pipeline.ts`: script -> video -> publish statuses
- `src/data/demo-scripts/*.json`: the researched demo scripts, one file per day
- `data/*.json`: saved sources, scripts, videos and shorts (created on first run, not committed)
