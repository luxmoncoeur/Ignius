# Ignius v2 improvement plan

Branch: `luxmoncoeur-11/13/26-v1` · antislop mode: **after** (build first, then a numbered audit)

## Where things stand

| Area | Now | Problem |
| --- | --- | --- |
| Styling | Bootstrap 5 + react-bootstrap (19 files), a 3,526-line `globals.css`, bootstrap-icons | Hard to keep consistent. Tailwind v4 is installed but unused. |
| Layout | App lives in `temperature-and-heat/`, both `package-lock.json` and `pnpm-lock.yaml` | ci-cd-template's `ci-reusable.yml` has no `working-directory` input, and two lockfiles break cached installs. |
| Scripts | `dev`, `build`, `start`, `lint` | The CI template expects `lint`, `typecheck`, `test`, `build`. There are no tests at all. |
| Chatbot UI | Custom floating panel, waits for the whole answer | Long pause on every answer, no stop / copy / retry, chat history lost on reload. |
| Chatbot backend | Groq `gpt-oss-120b`, `max_completion_tokens: 700`, re-tokenizes every lesson on each request | Slow, and tokens are wasted on reasoning for simple questions. Only the previous turn is used as memory. No rate limit. |
| Lessons | Units hold 2 / 2 / 4 / 1 lessons | Unit 3 is heavy and Unit 4 is a single lesson, so the learn page looks lopsided. |

## Phases

Each phase is a separate branch-sized chunk with its own commits. Nothing in a later phase starts until the
earlier one builds cleanly.

### Phase 0: repo foundation and CI/CD
1. Move the app from `temperature-and-heat/` to the repo root. Ignius is standalone now, and root-level makes
   CI, Vercel and Docker simpler.
2. Use pnpm only: delete `package-lock.json` and add `"packageManager": "pnpm@x.y.z"`.
3. Add scripts: `typecheck` (`tsc --noEmit` on a `tsconfig.json` with `allowJs`), `test` (Vitest with coverage
   `json-summary`, so the CI summary table shows up).
4. Add the first tests: `lib/assistant.js` (conversions, Q = mcΔT, retrieval ranking) and `lib/progress.js`.
5. Add `.github/workflows/ci.yml` that calls
   `luxmoncoeur/ci-cd-template/.github/workflows/ci-reusable.yml` and `release-reusable.yml` (pinned to the
   `v1.0.0` tag), with `release-preview` on PRs and `release` on `main`. Copy `deploy.yml` for the optional Vercel deploy.
6. Add commitlint + husky (same config as the template) so commit messages drive releases.
7. **Docker is left to you** for practice. The plan only makes the app Docker-ready with `output: "standalone"`
   in `next.config.mjs`.

### Phase 1: design system
1. Update `DESIGN.md` for Ignius. **Direction (decided): keep the existing palette** (ember, navy ink, warm
   neutrals, cool blue) and add a **thermal gradient** motif, cool `--cool` → `--flame-glow` → `--ember`. It is used on
   progress bars, unit timeline, hero headline accent, and the chat launcher ring, never behind body text.
   Motion goes from 1 to 2: hero, page enter, chat streaming, all off under `prefers-reduced-motion`.
2. Wire up Tailwind v4 and `shadcn init` (JS, `tsx: false`, CSS variables). Map the tokens to shadcn's theme
   variables for both light and dark. Check every text/background pair with the existing
   `.codex/skills/antislop-human/contrast-check.py`: 4.5:1 for body text, 3:1 for large text and UI.
3. Load fonts with `next/font` in place of the Google Fonts `<link>`. Move icons from bootstrap-icons to `lucide-react`.
4. Keep the no-flash theme script and the returning-visitor redirect.

### Phase 2: app shell
- Navbar: shadcn `NavigationMenu` on desktop, `Sheet` on mobile, theme toggle, user menu (`DropdownMenu`).
- Search: shadcn `Command` (⌘K palette) in place of `SiteSearch`, reusing `lib/search.js`.
- Footer, `Sonner` toasts (progress saved, login, errors), 404 and empty states.

### Phase 3: landing page and lesson distribution
- Landing: a new hero with one ReactBits text effect and one background effect, a "how it works" strip, a live
  simulation preview, and a units overview. Every effect respects `prefers-reduced-motion`.
- Rebalance the units without rewriting lesson content (only the `unit` field and the unit list change):
  | Unit | Lessons |
  | --- | --- |
  | 1. Temperature & Heat | 1 Temperature Scales, 2 Heat and Temperature |
  | 2. How Heat Moves | 3 Conduction, 4 Convection and Radiation |
  | 3. Heat Capacity | 5 Specific Heat Capacity, 6 Calorimetry |
  | 4. Changes of State | 7 Changes of State, 8 Specific Latent Heat |
  | 5. Gases | 9 Gas Laws and Temperature |
- `/learn`: a unit timeline with progress per unit and one clear "Continue" card.

### Phase 4: content pages
- Lesson page: sticky table of contents, reading progress bar, shadcn `Tabs` for explanation / formulas /
  examples, `Accordion` for worked examples.
- Simulations: shadcn `Slider`, `Switch`, `ToggleGroup` for the controls. The canvas and Three.js code stay as they are.
- Quizzes: `Card`, `RadioGroup`, `Progress`, and a results screen.
- Formulas: searchable cards with copy-as-LaTeX.
- Dashboard: shadcn charts (Recharts) for progress over time and quiz scores.

### Phase 5: Cinder chatbot
**UI**
- Rebuilt on shadcn `Sheet` (full height on mobile, side panel on desktop). The launcher keeps the mascot.
- Answers stream token by token, with a typing indicator, a Stop button, and Copy / Retry on each answer.
- Suggestion chips change with the page (a lesson page suggests questions about that lesson).
- Chat history persists per user/guest in `sessionStorage`. Add a "New chat" button.
- Source chips link to the exact lesson section.

**Answers and tokens**
- Build the retrieval index once at module load (it is rebuilt on every request now) and rank with BM25
  scoring in place of plain term counts, so matches are better and requests are faster.
- Route by difficulty: greetings, navigation and calculations stay local (already free). Simple concept
  questions go to `openai/gpt-oss-20b` with `reasoning_effort: "low"`. Multi-step questions go to `gpt-oss-120b`.
- Shorter system prompt, deduplicated excerpts, a cap on excerpt characters, and the last 3 turns summarised
  instead of only the previous one.
- Stream with Server-Sent Events from the route, keeping the existing course fallback when Groq fails.
- Small in-memory LRU cache for repeated questions, and a per-IP rate limit.
- Log token usage (`usage` from Groq) in dev so the savings can be measured before and after.

### Phase 6: delivery
- antislop **after**-mode audit: `anti-slop/audit-004-<date>.md` with numbered findings. You pick the numbers to fix.
- Lighthouse pass (performance, accessibility) on landing, lesson, and dashboard.
- README updated for Ignius: badges from the CI template, setup, env vars.

## Out of scope unless you ask
- Rewriting lesson text or quiz questions.
- Changing the database schema or auth.
- Writing the Dockerfile (yours to practice; I can review it).
