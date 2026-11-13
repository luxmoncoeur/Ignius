<div align="center">

<img src="public/images/brand/calphy-logo.png" alt="Ignius logo" width="140" />

# Ignius

**An interactive physics learning platform for Temperature and Heat.**

[![CI](https://github.com/luxmoncoeur/Ignius/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/luxmoncoeur/Ignius/actions/workflows/ci.yml)
[![Release](https://img.shields.io/github/v/release/luxmoncoeur/Ignius?sort=semver)](https://github.com/luxmoncoeur/Ignius/releases)

[![Live site](https://img.shields.io/badge/Live_site-ignius.onrender.com-ea580c?style=for-the-badge&logo=render&logoColor=white)](https://ignius.onrender.com)

![Next.js](https://img.shields.io/badge/Next.js-16-000000?style=flat-square&logo=nextdotjs)
![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)
![shadcn/ui](https://img.shields.io/badge/shadcn%2Fui-000000?style=flat-square&logo=shadcnui&logoColor=white)
![Three.js](https://img.shields.io/badge/Three.js-3D-000000?style=flat-square&logo=threedotjs)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-optional-4169E1?style=flat-square&logo=postgresql&logoColor=white)

[Introduction](#introduction) · [Features](#features) · [Installation](#installation) · [Commands](#commands) · [Contributing](#contributing) · [Tech Stack](#tech-stack)

</div>

---

## Introduction

Ignius is a web app that teaches the Temperature and Heat unit of physics through short lessons, hands-on simulations, and practice quizzes. Students can go through the topics at their own pace. Cinder, the built-in study assistant, answers questions about the course content, and the app keeps track of each student's progress along the way.

The course has nine lessons in five units:

| Unit | Lessons |
| --- | --- |
| Temperature & Heat | Temperature Scales · Heat and Temperature |
| How Heat Moves | Conduction · Convection and Radiation |
| Heat Capacity | Specific Heat Capacity · Calorimetry |
| Changes of State | Changes of State · Specific Latent Heat |
| Gases | Gas Laws and Temperature |

## Features

- **Lessons**: Each lesson has an overview, learning objectives, key terms, worked examples, formulas, and a short video.
- **Interactive simulations**: Experiments such as a thermometer, a conduction rod, a heating curve of water, calorimetry, and a gas-law piston, each viewable in 2D or 3D.
- **Quizzes**: One quiz per lesson plus a final exam, with explanations after every answer and quick check-in questions inside the lessons.
- **Formula sheet**: Every formula and physical constant from the course, collected on one page.
- **Cinder assistant**: A chat helper that streams answers grounded in the course material, links to the source lesson, works through supported calculations locally, and keeps the conversation for the session.
- **Progress dashboard**: Shows which lessons are finished, which are in progress, and how you did on quizzes.
- **Accounts or guest mode**: Students can sign up so their progress is saved to their account, or use the app as a guest and keep progress in the browser.
- **Site search**: Press `/` or `⌘K` to find any lesson, simulation, quiz, or formula.
- **Mobile friendly**: Works on phones and tablets, and can be installed on the home screen like an app.

---

## Project Structure

```
Ignius/
├── app/                       # Pages and API routes
│   ├── api/                   # Server endpoints
│   │   ├── assistant/         #   Cinder chat assistant (streams answers)
│   │   ├── auth/              #   Login, logout, register, session
│   │   ├── progress/          #   Save and load student progress
│   │   ├── search/            #   Site-wide search
│   │   └── users/             #   Account details
│   ├── dashboard/  formulas/  learn/  simulations/
│   ├── lessons/[slug]/        # Individual lesson pages
│   ├── quizzes/[slug]/        # Individual quiz pages
│   ├── login/  register/      # Account pages
│   ├── globals.css            # Tailwind, theme tokens, shadcn mapping
│   ├── legacy.css             # Pre-v2 styles still used by the simulations
│   └── layout.jsx  page.jsx   # App shell and landing page
├── components/
│   ├── ui/                    #   shadcn/ui primitives
│   ├── reactbits/             #   ReactBits effects (particles, count-up)
│   ├── simulations/           #   2D simulations
│   └── sims/three/            #   3D simulations (Three.js)
├── lib/                       # Course content and helpers
│   ├── lessons.js  quizzes.js  simulations.js
│   ├── assistant.js           #   Retrieval (BM25), local answers, routing
│   ├── useCinderChat.js       #   Chat state and streaming client
│   ├── db.js  auth.js         #   Database and sessions
│   └── thermal.js  icons.js   #   Thermal-gradient colors, icon map
├── tests/                     # Vitest unit tests
├── .github/workflows/         # CI, release and deploy (ci-cd-template)
└── documentation/PostgreSQL/  # Database schema and setup notes
```

## Installation

### Requirements

- [Node.js](https://nodejs.org) 20 or newer
- [PostgreSQL](https://www.postgresql.org) (optional; only needed for user accounts)

### Steps

1. **Clone the repository**

   ```bash
   git clone https://github.com/luxmoncoeur/Ignius.git
   cd Ignius
   ```

2. **Install dependencies** (pnpm, via Corepack)

   ```bash
   corepack enable
   pnpm install
   ```

3. **Set up environment settings**

   Copy the template and fill in your own values:

   ```bash
   cp .env.example .env.local
   ```

   | Setting | Purpose | Required |
   | --- | --- | --- |
   | `DATABASE_URL` or `PGHOST`, `PGPORT`, `PGDATABASE`, `PGUSER`, `PGPASSWORD` | Connects to PostgreSQL for user accounts | No |
   | `SESSION_SECRET` | Secures login sessions; set a long random value | Recommended |
   | `GROQ_API_KEY` | Powers the Cinder assistant's written answers | No |
   | `GROQ_MODEL` | Model for multi-step questions (default: `openai/gpt-oss-120b`) | No |
   | `GROQ_MODEL_FAST` | Model for short concept questions (default: `openai/gpt-oss-20b`) | No |

   The app runs without any of these settings. Without a database, progress is saved in the browser. Without a Groq key, Cinder can still help with navigation, lesson previews, and supported calculations.

4. **Set up the database (optional)**

   Create a database named `db_users` with a `tbl_users` table. The table layout and setup steps are in [`documentation/PostgreSQL/`](documentation/PostgreSQL/).

5. **Start the app**

   ```bash
   pnpm dev
   ```

   Then open [http://localhost:3000](http://localhost:3000) in your browser. After changing `.env.local`, restart the server.

## Commands

| Command | Description |
| --- | --- |
| `pnpm install` | Install all dependencies |
| `pnpm dev` | Start the development server at `localhost:3000` |
| `pnpm build` | Create an optimized production build (`.next/standalone` for Docker) |
| `pnpm start` | Run the production build |
| `pnpm lint` | Check the code with ESLint |
| `pnpm typecheck` | Type-check with TypeScript |
| `pnpm test` | Run the Vitest unit tests with coverage |

## CI/CD

Workflows come from [luxmoncoeur/ci-cd-template](https://github.com/luxmoncoeur/ci-cd-template), pinned to `v1.1.0`.

- **Pull requests:** lint, typecheck, test and build run in parallel. The PR title must be a [Conventional Commit](https://www.conventionalcommits.org) (`feat: …`, `fix: …`), and a comment predicts the release it would make.
- **Merges to `main`:** semantic-release bumps the version, updates `CHANGELOG.md`, tags the commit and creates a GitHub Release.
- **Deploy:** optional Vercel deploy after CI passes, enabled by the `VERCEL_TOKEN`, `VERCEL_ORG_ID` and `VERCEL_PROJECT_ID` secrets.

Commit messages are checked locally by commitlint (husky `commit-msg` hook).

## Contributing

Work on a branch and open a pull request into `main`.

- **Branch name format:** `[Username]-[Month/Day/Year]-[Version]`, for example `luxmoncoeur-11/13/26-v1`
- **Commit messages:** Conventional Commits, for example `feat(chat): stream answers` or `fix: lesson link`.

---

## Tech Stack

| Area | Tools |
| --- | --- |
| Framework | [Next.js 16](https://nextjs.org) with [React 19](https://react.dev) |
| Styling | [Tailwind CSS 4](https://tailwindcss.com), [shadcn/ui](https://ui.shadcn.com) on Radix, [lucide](https://lucide.dev) icons |
| Motion | [Motion](https://motion.dev), [ReactBits](https://reactbits.dev) |
| Charts | [Recharts](https://recharts.org) via shadcn charts |
| 3D graphics | [Three.js](https://threejs.org) |
| Math display | [KaTeX](https://katex.org) with React Markdown |
| Database | [PostgreSQL](https://www.postgresql.org) via `node-postgres` |
| AI assistant | [Groq](https://groq.com) API |
| Code quality | ESLint, React Compiler, Vitest, commitlint |
| CI/CD | GitHub Actions ([ci-cd-template](https://github.com/luxmoncoeur/ci-cd-template)), semantic-release |

---

<div align="center">

<img src="public/images/brand/mascot-wave.png" alt="Cinder waving" width="90" />

**Ignius**: Temperature and Heat, made interactive.

Built as a final project for Calculus-Based Physics.

</div>
