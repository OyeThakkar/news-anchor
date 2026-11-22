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
  - **Videos**: publishing slots (1 episode of 7-10 min/day, 3-15 shorts/day, 1 long-form of 20-24 min/week)
  - **Scripts**: John Oliver-style structure for the daily episode
  - **Library & Data Sources**: feed-monitoring sheet (source, anchor, beat, format, check frequency, monitored by)

## Where the content lives

- `src/lib/anchors.ts`: personas and publishing targets
- `src/lib/sources.ts`: the source library and monitoring settings
- `src/lib/scripts.ts`: episode segments and draft lines
