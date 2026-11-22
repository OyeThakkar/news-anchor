# The Late Edit: project brief

Repository: https://github.com/OyeThakkar/news-anchor

## 1. What we are building

**The Late Edit** is a short-form video news show in **Hinglish**, delivered in a late-night comedy format, in the
spirit of *Last Week Tonight with John Oliver*. Think Inshorts meets late-night TV.

Two AI anchors with opposing worldviews cover **the same stories every day**:

| | Reema | Siddharth |
|---|---|---|
| Role | Welfare-first sceptic | Market-first optimist |
| Worldview | Accountability, civil liberties, welfare, scepticism of power | Institutions, enterprise, self-reliance, continuity |
| Delivery | Crisp, data-led markets-desk delivery; dry, quick | Unhurried, warm baritone; Hindi/Urdu turns of phrase |
| Comedy | Deadpan, chart-driven punchlines, live fact-checks | Gentle irony, proverbs, history analogies, his daadi's wisdom |
| Set | Newsroom with blue data screens | Study with bookshelves, brass lamps, warm light |
| Catchphrase | "Pehle facts. Opinions baad mein." | "Pehle tathya, phir tark." |
| Accent colour in the portal | Sky blue | Amber |

Every story opens with the **same on-screen fact box and named sources** for both anchors; each then gives their take,
they trade a jab, and viewers vote "Aaj kaun jeeta?" in the app.

Both anchors are original AI characters, not likenesses of any real person.

## 2. Why it is needed

People under 35 have largely stopped reading the news. Long articles feel like homework and text summaries are quick but
dry, so attention has moved to short video, and many people now get their facts from memes, WhatsApp forwards and
influencer clips that are often wrong and almost always one-sided.

*Last Week Tonight* proves people will sit through complex topics when they are entertaining. India has no equivalent
that is short, in Hinglish and built for the feed. The Late Edit is:

- **Accurate:** every claim is sourced, and both anchors read the same facts on screen.
- **Balanced by design:** two opposing readings of the same facts, so viewers see how a story can be read, rather than
  being told what to think.
- **Sustainable:** an automated research-to-publish pipeline makes daily, multi-format output affordable, with a human
  editor keeping control.

## 3. Output per anchor

| Format | Length | Volume | Platforms |
|---|---|---|---|
| Daily episode | 7-10 min (scripts target 9:30) | 1 per day | YouTube |
| Shorts | about 75 sec, vertical | 3 per day minimum, up to 15 | Instagram Reels, YouTube Shorts |
| Weekly long-form | 20-24 min | 1 per week | YouTube |

### Episode structure (John Oliver style, 9:30)

| # | Segment | Time |
|---|---|---|
| 1 | Cold open: one joke that sets up the story | 0:00-0:30 |
| 2 | Headline and fact box (identical for both anchors) | 0:30-1:15 |
| 3 | How did we get here? (dated chronology, running gag planted) | 1:15-4:00 |
| 4 | What is happening now (official claim vs data, who is affected) | 4:00-6:00 |
| 5 | The other side: cameo from the other anchor, one point of agreement | 6:00-7:00 |
| 6 | What we can do moving forward | 7:00-8:45 |
| 7 | The big finish: callback, sign-off, "who won?" vote | 8:45-9:30 |

### Short structure (1:15)

Hook (5s) · Fact box (10s) · The take (40s) · The jab (10s) · Closer and vote (10s).

## 4. Editorial guardrails

- Every number, date and quote comes from a source shown on screen; nothing is invented.
- Satirise actions, policies and statements, never religions, castes, communities or victims.
- Each anchor concedes a point to the other, or roasts their own side, at least once a day.
- Both personas are written as people who genuinely hold their views (no strawmen).
- Allegations are attributed ("according to", "alleged").

## 5. The newsroom portal (this repo)

### Navigation

- **Dashboard**: output targets and coverage across both anchors
- **Reema / Siddharth**
  - **Dashboard**: persona, daily targets, next steps
  - **Videos**: long-form videos with Date, Serial, Topic, Duration, View video, Video status, Review
  - **Shorts**: Date, Serial, Topic, Duration, View video, IG status, YT status, Review
  - **Scripts**: Date, Serial, Topic, Duration, View script, Video status, Review
  - **Library & Data Sources**: feed-monitoring sheet
  - **Profile**: portrait, bio, worldview, voice, comedy, catchphrases, and lines they won't cross

### Pipeline

1. **Script** is reviewed with **Approve / Reject / Rework**. If nobody acts within **60 minutes**, it is
   **auto-approved**.
2. An approved script **automatically generates** its video (episode script) or short (short script). Generation takes
   about 2 minutes.
3. The **video or short** is reviewed the same way, with the same 60-minute auto-approval.
4. An approved video is **auto-published** to YouTube; an approved short is posted to Instagram Reels and YouTube Shorts.

Rework requires a note and sends the item back; resubmitting restarts the 60-minute window (videos are regenerated
first). Rejected items are cancelled. Auto-approval is derived from timestamps on read, so no background job is
needed.

The Scripts page shows each script's downstream progress: Awaiting approval, Generating video, Video awaiting approval,
Published.

### Script and video pages

- **Script page**: shared fact box, clickable sources, every segment with timings, beats and script text, review
  controls, and **Copy script / Download .txt** buttons.
- **Video page**: a preview player (16:9 for episodes, 9:16 for shorts) that plays the script as captions with the fact
  box as an on-screen graphic, next to a **teleprompter-style script panel** that highlights and auto-scrolls the line
  being spoken (click any line to jump). Also has Copy / Download, review controls, publishing status and sources.

### Library & Data Sources

A feed-monitoring sheet with columns: Source, Anchor, Beat, Format, Check frequency, Monitored by, Tier, Status.

- About 67 sources: a **shared layer** (wires, primary documents, data, fact-checkers) plus each anchor's own analysis
  library.
- Filters: search, status (Active / Deactivated / All), anchor layer, format, frequency, monitor.
- **Add source** (to an anchor or to the shared layer) and **Deactivate / Reactivate** (shared sources ask for
  confirmation because they affect both anchors).
- Monitoring is owned by **both** a tool (feeds and alerts) and a researcher (verification and story picks).
- Every story needs one primary source, one wire report and one analysis source.

### Demo content

The repo ships with **32 researched Hinglish scripts for 19-22 Nov 2026**: each day, one 9:30 episode and three 1:15
shorts per anchor, on the same four stories, with a shared fact box and sources.

| Day | Episode | Shorts |
|---|---|---|
| 19 Nov | PM Modi questions India Inc at FICCI on wages, jobs, quality | Cyclone Akvan evacuations · Rare-earth magnet scheme · India-Japan 2+2 |
| 20 Nov | Trump-Xi-Putin meet in Shenzhen; where India stands | CERT-In payment-fraud warning · Akvan landfall · Nepal PM Balendra Shah's visit |
| 21 Nov | Youth Congress vs Meta over account takedowns | Delimitation bill · Adani's Bagheera missile test · Akvan weakens |
| 22 Nov | Siang dam: Amit Shah's push vs local protests | BrahMos made in UP · India denies Nepal airspace request · Army/ITBP buying from border farmers |

Earlier days load as fully published; the latest day loads pending, so the review flow can be shown live.

## 6. What is real and what is simulated

| Area | Status |
|---|---|
| Portal, review flow, 60-minute auto-approval, source management | Working |
| Researched scripts and fact boxes | Working (static demo data in `src/data/demo-scripts/`) |
| Video generation | Simulated: a 2-minute delay, then a preview render of the script |
| Publishing to YouTube / Instagram | Simulated: status changes to Published / Posted on approval |
| Automated source monitoring and script drafting | Not built yet; the library is a managed list |
| Anchor portraits | Added in `public/anchors/`: Reema (still + looping "live" video, Hailuo) and Siddharth (still, Leonardo Lucid Origin). Prompts in `public/anchors/PROMPTS.md` |
| Storage | Local JSON files in `data/` (fine for a single instance; move to a database for production) |
| Authentication | None yet |

The portal shows a small notice that video generation and publishing are simulated.

## 7. Tech stack and code map

- **Next.js 16** (App Router, server actions, Turbopack), **React 19**, **TypeScript**, **Tailwind CSS v4**
- Node.js **20.9 or newer**
- No database: JSON files in `data/`, seeded on first run

| Path | Purpose |
|---|---|
| `src/app/page.tsx` | Main dashboard |
| `src/app/[anchor]/...` | Per-anchor dashboard, profile, videos, shorts, scripts, library (and `[id]` detail pages) |
| `src/components/` | Sidebar, UI primitives, review table and controls, video preview, portrait, script actions |
| `src/lib/anchors.ts` | Personas, profile content, colours, publishing targets |
| `src/lib/sources.ts` | Default source library and option lists |
| `src/lib/scripts.ts` | Episode and short segment templates |
| `src/lib/review.ts` | Approval rules: 60-minute auto-approval, 2-minute generation time |
| `src/lib/pipeline.ts` | Script to video to publish status logic |
| `src/lib/store.ts` | JSON storage, seeding, and auto-creation of videos/shorts from approved scripts |
| `src/lib/actions.ts` | Server actions: review, resubmit, add source, activate/deactivate source |
| `src/lib/demo-scripts.ts` | Loads the demo scripts and sets their review state |
| `src/data/demo-scripts/*.json` | The researched scripts, one file per day |
| `src/lib/script-text.ts` | Plain-text export for Copy / Download |

Note: `next.config.ts` turns Cache Components off on purpose. Pages render fully on the server instead of streaming,
because some embedded browsers never reveal streamed content.

## 8. Running it on Replit

1. Create a Repl by importing the GitHub repo `OyeThakkar/news-anchor` (Node.js / Next.js template).
2. Install and build:
   ```bash
   npm install
   npm run build
   ```
3. Run on Replit's port and host:
   ```bash
   npx next start -H 0.0.0.0 -p ${PORT:-3000}
   ```
   For development use `npx next dev -H 0.0.0.0 -p ${PORT:-3000}`.
4. Before a demo, reset the data so the 60-minute review windows start fresh, then restart:
   ```bash
   npm run reset-demo
   ```

The `data/` folder is created automatically on first page load and is not committed. On Replit deployments the
filesystem may reset between deploys, which resets the demo state; that is expected for this prototype.

## 9. Suggested next steps

1. Animate Siddharth's portrait (like Reema's live clip) and give both anchors a consistent voice.
2. Connect a real video-generation provider (AI avatar and voice) behind the existing "generate on approval" step.
3. Connect the YouTube Data API and Instagram Graph API for real publishing.
4. Automate source monitoring (RSS and alerts) and first-draft script generation from the library.
5. Move storage to a database and add editor login and an audit log.
6. Add the weekly 20-24 minute long-form format and the viewer "who won?" vote.
