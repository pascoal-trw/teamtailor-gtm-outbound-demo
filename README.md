# GTM Outbound Generator

A live AI demo built on Teamtailor's public data. Audition piece for the
Forward Deployed AI Accelerator role at Teamtailor.

Type any prospect company name, the page streams back a cold email an
AE at Teamtailor could send to that company's Head of Talent today. The
model is constrained to only name real Teamtailor customers and features.

## Stack

- Next.js 16 (App Router) + React 19
- Tailwind v4 + GSAP 3
- Claude Opus 4.7 via the Anthropic SDK, streamed
- Prompt caching on the static Teamtailor context block (~90% cost reduction on repeat runs)
- Firecrawl + Python + Claude Haiku 4.5 for the one-time context build

## Architecture (3 layers)

**Layer 1, scrape (run once, locally):**
`scrape_teamtailor_context.py` pulls Teamtailor's public surfaces (customers
page, product page, integrations directory, homepage) via Firecrawl and
extracts structured data with Haiku into `app/teamtailor_context.json`.

**Layer 2, the page:**
A cinematic single-page React app with a hero, the live demo, three
animated feature cards (industry matcher, live reasoning feed, meeting
scheduler), a sticky-stacking Protocol section, manifesto, and CTA.

**Layer 3, the API:**
`app/api/generate/route.ts` is a Node runtime endpoint that streams Opus
4.7. The Teamtailor context is split into two cacheable system blocks,
the user message just carries the prospect company and target role.

## Run locally

```bash
echo "ANTHROPIC_API_KEY=sk-ant-..." > .env.local
npm install
npm run dev
```

Open http://localhost:3000

## Deploy

```bash
npx vercel
```

Add `ANTHROPIC_API_KEY` as an env var in the Vercel project settings.

## Why this exists

The role asks for someone who builds AI tools fluently, embeds in GTM
workflows, and ships internal tools, with a bias toward action over
theoretical presentations. The smallest honest answer to "what would you
ship in week one" is a tool that already runs in week zero.

Built by Pascoal Dias, [pascoal-dias.netlify.app](https://pascoal-dias.netlify.app).
