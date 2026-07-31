# CodeArena

Real-time competitive coding battles, quizzes, and leaderboards — built with
Next.js 16 (App Router), React 19, MongoDB Atlas, Clerk, and Firebase
Realtime Database. No Express, no Socket.io — everything runs inside Next.js
route handlers, and all realtime state is synced through Firebase RTDB.

## ✅ Day 1 — Foundation & Architecture

What was built today:

- **Project scaffold** — App Router only, everything under `app/`, no `src/`.
  `.jsx` for all frontend files, `.js` for all backend/lib/config files.
- **Dependency baseline** — every package pinned to the latest version
  published on npm as of today, verified individually for compatibility
  with Next.js 16 / React 19:
  - `next@16.2.12`, `react@19.2.8`, `react-dom@19.2.8`
  - `@clerk/nextjs@7.6.2`, `mongoose@9.8.1`, `firebase@12.16.0`
  - `tailwindcss@4.3.3` (CSS-first config, no `tailwind.config.js` needed)
  - `framer-motion@12.42.2`, `lucide-react@1.27.0`
  - `react-hook-form@7.83.0` + `zod@4.4.3` (+ `@hookform/resolvers`)
  - `sonner@2.0.7`, `recharts@3.10.1`
  - `class-variance-authority`, `clsx`, `tailwind-merge`, `next-themes` (shadcn/ui foundation)
- **Auth** — Clerk middleware (`middleware.js`) protecting every route except
  the landing page, sign-in/up, and webhooks. `AppProviders` wires
  `ClerkProvider` app-wide.
- **Database** — `lib/db.js`: cached Mongoose connection helper (survives
  Next.js dev hot-reload and serverless cold starts).
- **Realtime layer** — `lib/firebase.js`: Firebase RTDB client singleton.
  `lib/realtime-paths.js`: canonical path builders for rooms, matchmaking,
  presence, live battle state, and live leaderboards — a single source of
  truth so no feature ever hand-writes an RTDB path string.
- **Design system** — Tailwind v4 CSS-first theme in `app/globals.css` using
  OKLCH tokens for dark/light mode, a brand gradient, and a `.glass-panel`
  utility for glassmorphism surfaces. `ThemeProvider` (next-themes) +
  `ThemeToggle` component wired end-to-end.
- **Reusable UI primitives** — `components/ui/button.jsx`,
  `components/ui/card.jsx` (shadcn/ui conventions, `cva` variants).
- **Proof-of-life pages** — landing page (`app/page.jsx`) using the full
  design system, Clerk sign-in/up pages, a protected `/dashboard` placeholder,
  and a `/api/health` route that confirms MongoDB connectivity.

### Folder structure

```
codearena/
├── app/
│   ├── (auth)/
│   │   ├── sign-in/[[...sign-in]]/page.jsx
│   │   └── sign-up/[[...sign-up]]/page.jsx
│   ├── api/
│   │   └── health/route.js
│   ├── dashboard/page.jsx
│   ├── globals.css
│   ├── layout.jsx
│   └── page.jsx
├── components/
│   ├── providers/
│   │   ├── app-providers.jsx
│   │   └── theme-provider.jsx
│   ├── shared/
│   │   └── theme-toggle.jsx
│   ├── layout/            (navbar/sidebar — Day 2+)
│   └── ui/
│       ├── button.jsx
│       └── card.jsx
├── config/
│   └── site.js
├── hooks/                  (custom hooks — Day 2+)
├── lib/
│   ├── db.js
│   ├── firebase.js
│   ├── realtime-paths.js
│   └── utils.js
├── models/                 (Mongoose schemas — Day 2)
├── middleware.js
├── components.json
├── next.config.js
├── postcss.config.mjs
├── jsconfig.json
├── .env.example
└── package.json
```

### Running locally

```bash
npm install
cp .env.example .env.local   # fill in Clerk, MongoDB, Firebase keys
npm run dev
```

## 🗺️ Roadmap (build one day at a time)

- **Day 2** — MongoDB schema design: `User`, `Room`, `Quiz`, `Question`,
  `Battle`, `BattleResult`, `Submission`, `Leaderboard`, `Achievement`,
  `Notification` models + Clerk webhook to sync users into MongoDB.
- **Day 3** — App shell: responsive navbar, collapsible sidebar, animated
  page transitions, skeleton loaders, empty states.
- **Day 4** — Dashboard: stats cards, recent battles, rank card, charts
  (Recharts), quick-match CTA.
- **Day 5** — Matchmaking: Firebase-backed queue, skill-tier pairing, live
  "searching for opponent" UI.
- **Day 6** — Battle room: live problem view, code editor, opponent
  presence, synced countdown timer via Firebase RTDB.
- **Day 7** — Judging: submission pipeline, test-case execution/validation,
  live pass/fail feedback.
- **Day 8** — Live leaderboard + battle results screen with animated score
  reveal.
- **Day 9** — Quiz mode (Kahoot/Quizizz-style): quiz creation, live rounds,
  per-question timers, synced scoring.
- **Day 10** — Ranking system: ELO calculation, tiers/divisions, profile
  rank history chart.
- **Day 11** — Notifications + achievements system.
- **Day 12** — Admin/creator tools: question bank management, quiz builder.
- **Day 13** — Accessibility pass, performance/Core Web Vitals audit, SEO
  metadata across all routes.
- **Day 14** — Deployment hardening: environment separation, error
  boundaries, rate limiting, production checklist.

Say **"day 2"** when you're ready to continue.


✅ Production checklist

Things to walk through before an actual public deploy — not code changes, just verification steps:

Clerk

 Switch from your Clerk development instance to a production instance in the dashboard (separate API keys — don't reuse dev keys in prod)
 Update the webhook endpoint URL from your ngrok tunnel to your real production domain
 Re-verify the webhook signing secret matches after switching instances

MongoDB Atlas

 Use a separate production database (or at least separate from anything you've been testing/breaking in) — consider a fresh cluster or a distinct MONGODB_DB_NAME
 Network Access → restrict IP allowlist to your deployment platform's IPs instead of 0.0.0.0/0 (open to the world), if your host supports static egress IPs
 Confirm a real database user with a strong password, not a shared/test credential

Firebase

 Apply the security rules above in your actual project (not just locally testing)
 Consider a separate Firebase project for production vs. development, same as Clerk

Judge provider

 local (Node vm) is not appropriate for production with real strangers submitting code — it's genuinely not sandboxed. Before public launch, either get RapidAPI/Judge0 working, get glot.io working, or self-host Judge0 via Docker

Environment

 Every var in .env.example set correctly in your host's environment variable settings
 instrumentation.js validation passes on deploy (check your platform's build/boot logs)

General

 Remove/guard any leftover /api/admin/seed-* or /api/admin/sync-users-style one-off routes — they're currently reachable by anyone with a valid session, not just admins. Worth wrapping the seed routes in requireAdmin() from Day 12 now that it exists, or deleting them entirely since the real admin UI replaces their purpose
 Confirm NODE_ENV=production is set by your deploy platform (most set this automatically)
 Test the full user journey once on the production URL: sign up → webhook fires → dashboard loads → matchmaking → battle → settlement → notifications