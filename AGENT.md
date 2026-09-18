# AGENT.md: ArchLens Engineering & Architecture Protocol

> **System Pitch:** *"Every tool lets you break a system. ArchLens teaches you to **debug** one."*  
> **Challenge:** CodeMyFYP Hackathon 2026 · Challenge 01: AI for Learning  
> **Core Architecture:** Deterministic Simulation Engine (Ground Truth) + Responsible AI Tutor/Mentor + The Verge Design System.

This document is the **definitive engineering manual** for any AI agent or human developer building, extending, or refactoring **ArchLens**. Every line of code written in this repository must adhere to the standards, patterns, and guardrails outlined here.

---

## 1. Product Vision & Non-Negotiable Core Principles

### 1.1 The Problem & The Moat
Standard system-design simulators (e.g., Paperdraw, SysSimulator, SystemForge) are passive sandboxes or mock interview graders. They let users click components and watch things fail, but **they do not teach**.
ArchLens closes this educational gap with:
1. **The 6-Step Pedagogical Loop**: Context $\rightarrow$ **Predict** (structured commitment before seeing outcome) $\rightarrow$ **Break / Observe** (deterministic execution) $\rightarrow$ **Explain** (Socratic AI tutor grounded in simulation deltas) $\rightarrow$ **Fix** (curated palette to achieve SLOs) $\rightarrow$ **Mastery Map** (analytics tracking 6 foundational concepts).
2. **Incident Mode (Demo Climax)**: Inverts the loop for real-world on-call debugging. A hidden failure occurs; the system looks degraded; nodes are neutral/grey until inspected; student uses an inspection budget to examine metrics in the **Glass Box**, works through upstream red herrings, diagnoses the root cause, applies a fix, and reviews a post-mortem cascade.
3. **Daily Incident & Spaced Retention**: 90-second incident variant targeting the learner's weakest concept using Leitner-box scheduling (`localStorage` powered).
4. **Authentic Indian Blueprints**: Inspired by public talks and engineering blogs ("Tatkal at 10 AM" ticket booking, "The Final Over" live cricket streaming), clearly cited, labelled as simplified for learning.

### 1.2 The Golden Rule of Ground Truth
> **The Simulation Engine is the sole source of truth. The AI may ONLY explain what the engine computes.**  
> Under NO circumstances should an LLM invent system metrics, grade predictions, or dictate simulation dynamics. If the AI is down or unconfigured, the application MUST remain 100% functional via built-in deterministic template fallbacks.

---

## 2. Technology Stack & Directory Structure

### 2.1 Tech Stack Standard
- **Language / Runtime:** TypeScript 5.x (Strict Mode: `noImplicitAny`, `strictNullChecks`, `noUncheckedIndexedAccess`).
- **Framework & Build:** React 18 / 19 + Vite.
- **Canvas / Topology:** `@xyflow/react` (React Flow v12).
- **Global State:** `zustand` (selector-based, modular slices, strictly typed).
- **Data Validation:** `zod` (runtime schema validation for all blueprints, missions, incidents, and API envelopes).
- **Styling:** Vanilla CSS / Tailwind CSS tailored precisely to **The Verge Design System** tokens (see Section 5).
- **Icons:** `lucide-react`.
- **Backend / LLM Gateway:** Vercel Serverless Function (`/api/tutor`) with server-side API keys, request schema validation, and rate limiting.
- **Testing:** `vitest` (unit tests for engine math, grading, Leitner scheduling, and validator logic) + `@playwright/test` (E2E smoke test for full mission execution).

### 2.2 Directory Organization

```
c:/Users/Dillu/Desktop/CodeYourFYP/
├── docs/                        # Specifications & design documentation
│   ├── ArchLens-Build-Plan.md
│   ├── DESIGN-theverge.md
│   └── sources.md               # Real-world engineering citations
├── api/                         # Vercel Serverless Functions
│   └── tutor.ts                 # Secure LLM endpoint with Zod schema & rate-limiting
├── public/                      # Static assets & illustrations
├── src/
│   ├── engine/                  # PURE TypeScript Domain Engine (NO React/DOM dependencies)
│   │   ├── types.ts             # Graph, Node, Scenario, SimResult, Metric types
│   │   ├── topology.ts          # Kahn's topological sort, cycle detection
│   │   ├── nodeModels.ts        # Service, DB, Cache, Queue, LB calculation logic
│   │   ├── simulate.ts          # Top-level pure simulation runner
│   │   ├── diff.ts              # StateDelta computation between before/after runs
│   │   ├── grade.ts             # Deterministic grading of predictions & incident diagnosis
│   │   ├── scheduler.ts         # Leitner-box spaced repetition algorithm
│   │   └── __tests__/           # Vitest suite (≥ 25 unit tests)
│   │
│   ├── content/                 # Data Layer (Validated JSON Models)
│   │   ├── schemas.ts           # Zod schemas for Blueprints, Missions, Incidents
│   │   ├── blueprints/
│   │   │   ├── tatkal.json      # IRCTC-inspired ticket booking graph
│   │   │   └── cricket.json     # Live cricket streaming graph
│   │   ├── missions/            # Guided missions (G1, G2, G3)
│   │   └── incidents/           # Incident scenarios (I1, I2)
│   │
│   ├── tutor/                   # AI Tutor & Responsible Guardrails
│   │   ├── tutorClient.ts       # Frontend client calling /api/tutor
│   │   ├── validate.ts          # Numeric & Node ID validator against engine deltas
│   │   ├── spoilerGuard.ts      # Incident Mode spoiler prevention filter
│   │   ├── templates.ts         # Offline deterministic template fallbacks
│   │   └── prompts.ts           # Grounded Socratic & On-Call Mentor system prompts
│   │
│   ├── store/                   # Zustand Global State
│   │   ├── useArchStore.ts      # Root store composable
│   │   ├── slices/
│   │   │   ├── simSlice.ts      # Graph, baseline, scenario, simResult
│   │   │   ├── missionSlice.ts  # Current step (Predict -> Break -> Explain -> Fix)
│   │   │   ├── incidentSlice.ts # Incident mode state, budget, revealed nodes
│   │   │   └── masterySlice.ts  # Concept mastery levels & localStorage persistence
│   │
│   ├── features/                # Modular Feature Components
│   │   ├── canvas/              # React Flow nodes, edges, custom controls, particle overlay
│   │   ├── mission/             # Briefing, PredictionStep, ObserveStep, ExplainStep, FixPalette
│   │   ├── incident/            # PagerAlert, InspectBudgetBar, DiagnosisModal, PostMortemCard
│   │   ├── glassbox/            # Formula transparency inspector panel
│   │   ├── daily/               # Daily Incident streak card & retention view
│   │   └── mastery/             # Concept mastery radar/grid
│   │
│   ├── components/ui/           # Verge-styled atomic UI primitives (Pills, Cards, Badges)
│   ├── pages/                   # Application views (Landing, MissionPlayer, IncidentPlayer)
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css                # Verge design tokens & global CSS resets
├── tests/
│   └── e2e/                     # Playwright end-to-end tests
├── package.json
├── tsconfig.json
├── vite.config.ts
└── vitest.config.ts
```

---

## 3. The Simulation Engine Specification (Pure TypeScript)

The engine lives in `src/engine/` and MUST NEVER import anything from React, Zustand, or browser DOM APIs.

### 3.1 Mathematical Queueing Model (M/M/1-Inspired)
Given arrival rate $\lambda_{in}$ from concurrent users $U$ and request rate $r$ ($\lambda = U \times r$):
1. **Capacity ($\mu$):**
   $$\mu = \text{serviceRatePerReplica} \times \text{replicas} \quad (\mu = 0 \text{ if disabled/crashed})$$
2. **Offered Load ($\lambda$):**
   $$\lambda = \sum \text{incoming served flows forwarded to this node}$$
3. **Served & Dropped Requests:**
   $$\text{served} = \min(\lambda, \mu), \quad \text{dropped} = \max(0, \lambda - \mu)$$
4. **Utilization ($\rho$):**
   $$\rho = \frac{\lambda}{\mu} \quad (\infty \text{ if } \mu = 0)$$
5. **Latency Calculation (M/M/1 queueing delay with 0.95 cap to prevent infinity):**
   $$\text{latency} = \frac{\text{baseLatency}}{1 - \min(\rho, 0.95)} + \text{downstreamWait}$$
6. **Health Status Classification:**
   - $\rho < 0.70$: `HEALTHY` (Green)
   - $0.70 \le \rho < 1.00$: `DEGRADED` (Amber)
   - $\rho \ge 1.00$: `OVERLOADED` (Red / Critical)

### 3.2 Topological Processing Rules
- **Cycle Detection:** Compute topological sort via Kahn's algorithm. If an in-degree cycle is detected, throw a typed `CycleDetectedError` detailing the cyclic node path.
- **Cache / CDN Behavior:** Node has hit rate $h \in [0, 1]$.
  - Forwarded to downstream backend: $(1 - h) \times \text{served}$.
  - Cache hits: $h \times \text{served}$ return immediately with cache base latency.
  - If disabled, $h = 0$, forwarding 100% of traffic.
- **Load Balancers:** Distributes incoming served requests evenly (or proportionally by weights) across healthy active downstream replicas.
- **Asynchronous Queues (Decoupling):**
  - Queues accept incoming $\lambda$, draining at consumer rate $\mu_{consumer}$.
  - Backlog accumulation: $\Delta \text{backlog} = \max(0, (\lambda - \mu_{consumer}) \times \Delta t)$.
  - **CRITICAL INVARIANT:** Asynchronous queue edges MUST be excluded from synchronous user-facing critical-path latency!

### 3.3 Engine Invariants & Code Structure
- **Deterministic Pure Functions:**
  ```ts
  export function simulate(graph: ArchGraph, scenario: Scenario): SimResult;
  export function diff(before: SimResult, after: SimResult): StateDelta;
  export function gradePrediction(prediction: UserPrediction, result: SimResult): GradeResult;
  export function gradeDiagnosis(dx: UserDiagnosis, incident: IncidentScenario, checksUsed: number): IncidentGrade;
  export function cascadePath(before: SimResult, after: SimResult): string[];
  ```
- **Every Formula Must Be Exposed to the Glass Box:** Every node metric returned in `SimResult` must preserve raw parameters ($\lambda, \mu, \rho$, dropped, downstreamWait) so the UI Glass Box panel can render the exact equation to the learner.

---

## 4. Responsible AI & Tutor Guardrail Architecture

Judges allocate **15% of the total score** to Responsible AI. Adhere strictly to these defensive mechanisms:

### 4.1 Strict Grounding & Role Constraints
The AI has two distinct personas:
1. **Socratic Tutor (Guided Missions):** Never directly gives away the fix or the prediction answer. Asks one guiding question nudging the student to think about bottlenecks, fanout, or cache miss penalties.
2. **Senior On-Call Mentor (Incident Mode):** Emulates an experienced Staff SRE sitting beside the junior engineer. Asks diagnostic questions based only on nodes the user has actually inspected.

### 4.2 Hallucination Defense & Post-Validation Pipeline
All LLM output from `/api/tutor` must adhere to a strict Zod contract:
```ts
export const TutorResponseSchema = z.object({
  text: z.string(),
  numbers_used: z.array(z.number()),
  node_ids_referenced: z.array(z.string()),
  badge: z.enum(["verified", "fallback"]).default("verified")
});
```

**Client-Side Validation Protocol (`src/tutor/validate.ts`):**
1. **Numeric Cross-Check:** For every number in `numbers_used` (and regex-extracted from `text`), verify that the value matches a number in `StateDelta` within a $\pm 2\%$ relative tolerance.
2. **Node ID Verification:** Ensure every referenced node ID exists in the active graph.
3. **Violation Handling:** If any validation check fails, discard the AI output and invoke `templates.ts` to generate a 100% accurate, deterministic template explanation. Mark with the UI badge: `[template fallback]`.

### 4.3 Incident Spoiler Guard (`src/tutor/spoilerGuard.ts`)
During Incident Mode, **before** the student submits their diagnosis:
- The system prompt forbids mentioning the root cause node ID, node name, or fault type.
- The validator scans the candidate LLM response against the incident's `spoilerTerms` blacklist (e.g., `["seat_cache", "cache miss storm", "hit rate collapsed"]`).
- If a spoiler is detected, the response is discarded immediately, falling back to a generic Socratic diagnostic question (e.g., *"Have you compared the latency of the upstream services with the queue depths downstream?"*).

---

## 5. Design System: Inspired by The Verge (2024 Redesign)

The user interface must **strictly mirror The Verge's visual theme** (`docs/DESIGN-theverge.md`). No generic corporate dashboard aesthetics.

### 5.1 Color Palette & Token Rules
- **Canvas Background:** `#131313` (Canvas Black). **CRITICAL:** There is NO LIGHT MODE anywhere in the application.
- **Hazard Accents:**
  - **Jelly Mint:** `#3cffd0` — Primary CTA fill, link underlines, active tab indicators, and critical alert highlights.
  - **Verge Ultraviolet:** `#5200ff` — Secondary hazard blocks, promotional spans, incident pager accents (used at 0.9 alpha).
- **Secondary Surfaces:**
  - **Surface Slate:** `#2d2d2d` — Default card background and secondary buttons.
  - **Image / Card Frame:** `#313131` or `#ffffff` 1px hairlines.
- **Interactive Links:** `#3860be` (Deep Link Blue) — Link hover color across ALL links.
- **Text Tokens:**
  - Headlines: `#ffffff` (Hazard White).
  - Body / Subtext: `#e9e9e9` (Muted White) or `#949494` (Secondary Meta Text).
  - On Mint / White tiles: `#000000` (Absolute Black).

### 5.2 Elevation & Depth: "Color-as-Elevation"
- **ABSOLUTELY NO TRADITIONAL DROP SHADOWS.**
- Depth is achieved exclusively via:
  1. **1px Hairline Borders:** `1px solid #ffffff`, `1px solid #3cffd0`, or `1px solid #5200ff`.
  2. **Solid Color-Block Accent Tiles:** Full-bleed Jelly Mint (`#3cffd0`) or Ultraviolet (`#5200ff`) background blocks.
  3. **Atmospheric 1px Ring:** `rgba(0, 0, 0, 0.33) 0px 0px 0px 1px` for stacked cards.
- **NO decorative gradients or glowing blurs.**

### 5.3 Typography Stack & Spacing Rules
- **Display Headlines:** Ultra-condensed bold display font (substitute: **Anton**, **Oswald**, or **Bebas Neue** with tight tracking and 0.85–0.95 line-height) at sizes $\ge 60\text{px}$ for hero headers. Never used for UI buttons.
- **Body & Secondary UI:** **Space Grotesk** / **Inter** (weights 400, 500, 700).
- **Mono Uppercase Elements:** **Space Mono** / **JetBrains Mono** used **EXCLUSIVELY IN ALL-CAPS** for:
  - Timestamps, category tags, kickers, telemetry labels, and button labels.
  - **Tracking (Letter Spacing):** Always apply `1.1px` to `1.9px` positive letter-spacing (`tracking-widest`). Lowercase monospace is forbidden.
- **Corner Radii Scale:**
  - `2px`: Typewriter tags, telemetry pills.
  - `20px`: Standard StoryStream cards, mission containers.
  - `24px`: Primary CTA pill buttons, feature hero cards.
  - `40px`: Outlined secondary pill buttons.
  - `50%`: Circular status indicators.

---

## 6. Coding Standards & Code Structure Practices

### 6.1 TypeScript Strictness & Type Hygiene
- **Never use `any`**. Use `unknown` with Zod parsing or type guards.
- Declare explicit return types on all exported engine functions and hooks.
- Use Discriminated Unions for mission states, prediction answers, and incident events:
  ```ts
  export type MissionStep =
    | { kind: "context"; missionId: string }
    | { kind: "predict"; prediction: PredictionSpec; userSelection?: string }
    | { kind: "observe"; simDelta: StateDelta; runningAnimation: boolean }
    | { kind: "explain"; tutorFeedback: TutorFeedback; isSocratic: boolean }
    | { kind: "fix"; palette: FixAction[]; targetGoal: MetricGoal; completed: boolean };
  ```

### 6.2 Component Architecture & State Hygiene
- **Feature Slicing:** Keep components co-located inside their respective `features/` directory (`canvas/`, `mission/`, `incident/`, `glassbox/`).
- **Selector-Based Zustand Subscriptions:** Always select primitive values or shallow-compared objects to avoid re-render cascades:
  ```ts
  // CORRECT:
  const activeNodeId = useArchStore(state => state.activeNodeId);
  // INCORRECT:
  const { activeNodeId, graph, runSimulation } = useArchStore();
  ```
- **Performance Invariant:** The simulation runs synchronously in $< 1\text{ms}$. Never wrap the engine simulation in asynchronous promises unless loading external blueprints. Particles on the canvas should run via CSS SVG motion or lightweight requestAnimationFrame ticks decoupled from React state updates.

### 6.3 Accessibility (a11y) & Resilience
- Every node health state must be conveyed through **both color AND an icon/text badge** (`HEALTHY [✓]`, `DEGRADED [!]`, `CRITICAL [✕]`) for color-blind accessibility.
- Keyboard navigation: All prediction cards, inspector triggers, and fix buttons must support Tab navigation and visible `:focus-visible` outlines in Focus Cyan (`#1eaedb`).
- Contrast ratio must meet WCAG AA standards ($\ge 4.5:1$ for normal text against `#131313` or accent surfaces).

---

## 7. Step-by-Step Feature Implementation Priorities

When implementing features, follow this precise order of dependencies:

### Phase 1: Engine Foundation & Tests (Hours 0–8)
1. Write `src/engine/types.ts` defining `ArchGraph`, `NodeSpec`, `EdgeSpec`, `SimResult`, `StateDelta`.
2. Implement Kahn's topological sort and cycle detection in `src/engine/topology.ts`.
3. Implement `src/engine/nodeModels.ts` and `src/engine/simulate.ts` using the M/M/1 queueing equations.
4. Write $\ge 25$ Vitest unit tests covering:
   - Cache hit-rate traffic reduction.
   - Load balancer even splits.
   - Overload request dropping.
   - Cycle detection rejection.
   - Asynchronous queue latency decoupling.
   - Leitner spacing algorithm.

### Phase 2: Content Schemas & Blueprints (Hours 8–12)
1. Create `src/content/schemas.ts` with Zod definitions for blueprints, guided missions, and incidents.
2. Build `tatkal.json` (IRCTC-inspired ticket booking: ~11 nodes) and `cricket.json` (The Final Over live streaming: ~11 nodes) with authentic public citations in `docs/sources.md`.
3. Create Mission JSONs (`g1-tatkal-10am.json`, `g2-cricket-no-cdn.json`, `g3-slow-analytics.json`) and Incident JSON (`i1-tatkal-down.json`).

### Phase 3: The Verge Design System & Canvas UI (Hours 12–20)
1. Configure `index.css` and Tailwind theme tokens (Jelly Mint `#3cffd0`, Canvas Black `#131313`, Ultraviolet `#5200ff`, fonts, pill radii).
2. Implement custom React Flow nodes (`ServiceNode`, `DbNode`, `CacheNode`, `QueueNode`) featuring 1px hairlines, health status badges, and inspection states.
3. Build critical path SVG particle stream animation.

### Phase 4: The 6-Step Learning Loop & Glass Box (Hours 20–28)
1. Build `features/mission/` components: `ContextBrief`, `PredictionPanel`, `ObserveStage`, `ExplainPanel`, `FixPalette`.
2. Build `features/glassbox/GlassBoxPanel.tsx`: renders exact formula, $\lambda$, $\mu$, $\rho$, and dropped rate for any selected node.
3. Build deterministic grading and goal validation in `src/engine/grade.ts`.

### Phase 5: Incident Mode & AI Mentor (Hours 28–36)
1. Implement `features/incident/` state machine:
   - Neutral/grey node state on load.
   - Inspection budget counter (e.g., 5 inspections max).
   - Diagnosis modal: `{ rootCauseNode, causeType }`.
   - Post-mortem report with cascade timeline replay.
2. Implement `/api/tutor.ts` serverless route and client-side `validate.ts`, `spoilerGuard.ts`, and `templates.ts`.
3. Ensure the visible `[✓ verified against simulation]` badge appears on all validated mentor messages.

### Phase 6: Daily Incident, Retention & Final Polish (Hours 36–48)
1. Build `features/daily/DailyIncidentCard.tsx` with streak tracking and Leitner-box review logic in `localStorage`.
2. Build `features/mastery/MasteryRadar.tsx` covering the 6 core concepts.
3. Conduct end-to-end smoke tests, verify keyboard a11y, ensure zero secret leaks, and confirm full operation with no LLM API key.

---

## 8. Agent Checklist: Quality Assurance Verification

Before marking any task as complete, the agent must verify:
- [ ] `npm run test` passes 100% of Vitest unit tests without warnings.
- [ ] `npm run build` / TypeScript typecheck completes with zero errors.
- [ ] No `any` types or `@ts-ignore` comments were introduced.
- [ ] No client-side LLM keys or `.env` files are exposed in public code.
- [ ] The app renders properly in Canvas Black (`#131313`) with no light backgrounds or drop shadows.
- [ ] All mono text is strictly UPPERCASE with positive letter-spacing (`tracking-widest`).
- [ ] Offline fallback template handles simulation explanation seamlessly if LLM requests fail.
- [ ] Incident Mode spoiler guard prevents premature disclosure of root causes.

---

*This document serves as the permanent law of the ArchLens codebase. Treat these specifications as immutable constraints.*
