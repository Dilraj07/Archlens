# ArchLens: Winning Build Plan
### CodeMyFYP Hackathon 2026 · Challenge 01: AI for Learning

> **One-line pitch:** Every tool lets you break a system. ArchLens teaches you to **debug** one: the skill you actually need when IRCTC goes down at 10 AM. You predict, break, diagnose and fix real-world-inspired Indian systems; a deterministic engine is the ground truth, an AI on-call mentor may only explain its numbers, and we measured that it works.

> **v2 upgrades in this plan (the 9.5→10 changes):**
> 1. **Incident Mode**: hidden-fault, diagnose-from-dashboards missions with an AI "senior on-call" mentor (§4.4). The demo climax and the one thing no competitor does.
> 2. **Indian hero systems**: IRCTC Tatkal and live-cricket streaming replace Netflix as the blueprints (§4).
> 3. **A/B learning study**: ArchLens vs reading an article, same quiz (§11).
> 4. **Daily Incident** retention loop with streaks, covering "retain" in the brief (§4.5).
> 5. **Execution polish bar** (§10.1).

---

## 0. Read This First: Hard Facts From the Hackathon Page

| Fact | What it means for you |
|---|---|
| Registration closes **Sep 18, 2026, 11:59 PM IST** | That is today. Register before midnight or you're out. |
| Your **48-hour clock starts the moment registration is confirmed** | Do all thinking, design and data prep *before* you register if you still have time; once you register, it's build time only. |
| Event concludes Sep 22 | Your personal deadline (in the participant portal) is the one that matters. |
| Team of 1–4 | Plan below assigns roles A–D. If you have fewer people, merge roles (A+C, B+D). |
| Submission needs: live demo URL, public GitHub, README URL, AI-use declaration, problem & solution text, optional demo video | Each has a dedicated task in the timeline. None are optional in practice. |
| README must cover: problem, users, architecture, setup, screenshots, limitations, roadmap | Template in §12. |
| "Evidence of quality": tests/validation, error states, accessibility, basic security | This is 20% of your score and most teams skip it. You won't. §10. |
| **Two-minute pitch** (not 3–5 min) | Your original demo script is too long. New script in §13. |
| Quality gate: projects that don't run, expose keys, or misrepresent copied work can be disqualified | Server-side key, `.env.example`, AI declaration, credits for libraries. |

**Judging weights:** Problem clarity 20% · Working product 30% · Engineering quality 20% · Responsible AI 15% · Impact & presentation 15%.

---

## 1. Honest Assessment of the Idea

### What's strong
- The core insight ("system design has no feedback loop") is real and easy for any judge to feel.
- "Break a system every judge has suffered (IRCTC at 10 AM) live" is a genuinely memorable demo moment.
- A rule-based engine + AI narration is the right architecture: it keeps the AI from inventing behavior.

### What's already been built (your "break it" feature is NOT new)
Your competitor table misses the closest competitors. Several tools already let you drag components, simulate traffic and inject failures:

- **paperdraw.dev**: drag LB/gateway/cache/DB/queue, press play, see latency/error rate/throughput, and flip chaos switches (traffic spikes, cache-miss storms, partitions, crashes).
- **SysSimulator (syssimulator.com)**: set RPS, watch p50/p95/p99 on the canvas, inject cache stampede / node failure / partition and see cascades.
- **SystemForge (github.com/vijaygupta18/system-design-simulator)**: 35 components, topological-sort traffic propagation, bottleneck and cascade visualisation, auto-scoring, timed 45-min mock.
- Plus LeetDesign (load-simulation grading), Codemia, LeetSys, System Design School.

If you pitch "you can break an architecture and watch it fail," a judge who has seen any of these will mark you down on problem clarity and impact. **Simulation is table stakes. It's not your moat.**

### What's genuinely missing (your real gap)
Every one of those tools is a **sandbox or an interview grader**. None of them is a **teacher**. Specifically, none:

1. **Make the student commit to a prediction before revealing the result.** Predict → Observe → Explain is one of the best-established techniques in science education for building mental models, precisely because being *wrong* about a prediction is what forces learning. Sandboxes let you click and watch passively.
2. **Diagnose the misconception** behind a wrong prediction ("you think a cache reduces write load; it mostly reduces read load").
3. **Track concept mastery** over time (learning analytics: which of caching, replication, queuing, sharding, CDN, rate limiting you actually understand).
4. **Guarantee the AI doesn't hallucinate** about system behavior. Generic LLM tutors confidently make up numbers.
5. **Anchor lessons in a real, cited production system** instead of an abstract box diagram.

### The repositioning
> **Old pitch:** "An interactive breakable architecture explorer."
> **New pitch:** "An adaptive system-design tutor built on a deterministic simulator. The simulator is the ground truth; the AI is only allowed to explain it."
>
> **v2 sharpening:** "Every tool lets you break a system. ArchLens teaches you to *debug* one." Sandboxes train the student to cause failures they already know about. Incident Mode trains the real skill: seeing only symptoms (latency up, errors at 12%) and reasoning back to the root cause. That is the gap no simulator, course or interview grader fills.

This maps directly onto the challenge brief's own examples ("adaptive tutor, assessment engine, study copilot or learning analytics"): you'll have all four, which almost no other team will.

---

## 2. The Learning Loop (the heart of the product)

Every interaction in ArchLens follows one loop. Build this and nothing else first.

```
   ┌────────────┐   ┌────────────┐   ┌────────────┐   ┌────────────┐   ┌────────────┐
   │ 1. CONTEXT │──▶│ 2. PREDICT │──▶│ 3. BREAK / │──▶│ 4. EXPLAIN │──▶│  5. FIX    │
   │ Mission +  │   │ Student    │   │  OBSERVE   │   │ AI tutor,  │   │ Student    │
   │ system map │   │ commits an │   │ Engine runs│   │ grounded   │   │ adds a     │
   │            │   │ answer     │   │ animation  │   │ in engine  │   │ component, │
   └────────────┘   └────────────┘   └────────────┘   │ output,    │   │ re-runs,   │
         ▲                                            │ Socratic   │   │ must pass  │
         │                                            └────────────┘   └─────┬──────┘
         └──────────── 6. MASTERY MAP updates, next mission adapts ◀─────────┘
```

1. **Context:** a short mission brief ("It's IPL final night. 10M people hit Play at 7:30 PM.") over a live system map.
2. **Predict:** before anything happens, the student answers a structured question: *"Which component fails first?"* (click a node), *"Will p95 latency go up, down, or stay the same?"*, *"Roughly how many requests reach the database?"* (slider). Structured answers mean they can be graded deterministically, with no AI needed.
3. **Break / Observe:** the student triggers the event. Request particles flow, nodes go green→amber→red, gauges move. The engine's result is the answer key.
4. **Explain:** the grade appears (correct / off by how much). If wrong, the AI tutor asks one Socratic question first ("What fraction of requests does the cache absorb? So what hits Cassandra now?"), then explains. Every number it uses must come from the engine (§6).
5. **Fix:** the student gets a small palette (add cache, add replica, add queue, enable CDN, add rate limiter) and a success criterion ("p95 < 300 ms and error rate < 1% at 10M users"). They iterate until the engine says pass. *This replaces the free-form sandbox*: far cheaper to build, far better for learning, and a clear pass/fail for the demo.
6. **Mastery:** each prediction is tagged with concepts; results update a mastery map. The next mission is picked for the weakest concept.

**Incident variant of the loop.** In Incident Mode, steps 2–3 invert: the failure has *already* happened and is hidden. The student sees symptoms → **investigates** (inspects nodes and the Glass Box) → **diagnoses** (names the root-cause node and cause type) → fixes → mastery update. Same engine, same grader, same tutor; only the mission config differs. That's why it's cheap to build.

---

## 3. MVP Scope (what you actually ship in 48 h)

### Must ship (the demo depends on these)
| # | Feature | Why |
|---|---|---|
| M1 | Simulation engine (pure TS, unit-tested) | Ground truth for everything; engineering-quality points |
| M2 | Canvas: render blueprint from JSON, animated request particles on the critical path, health colours + icons + labels | The "wow" |
| M3 | **Two Indian blueprints**: IRCTC Tatkal booking and live-cricket streaming (simplified, cited, labelled "inspired by") | Every judge has felt these failures |
| M4 | **3 guided missions** (Predict → Break → Explain → Fix) | Teaches the concepts |
| M5 | **Incident Mode mission** (hidden fault → investigate → diagnose → fix) + AI on-call mentor | Your novelty and demo climax |
| M6 | AI tutor with grounding + numeric validator + offline template fallback | Responsible AI (15%) |
| M7 | Mastery map (6 concepts) + session summary | Learning analytics |
| M8 | **Daily Incident** card + streak (localStorage) | Covers "retain" in the brief |
| M9 | Glass Box panel (formula + inputs for any node) | Transparency |
| M10 | Landing page, Vercel deploy, README, tests, a11y, AI declaration | Submission requirements |
| M11 | **A/B learning study** results in README | Impact (15%) |

### Should ship (only after the H36 checkpoint)
- S1: Second incident scenario (so the Daily Incident rotates across 2+ hidden faults).
- S2: A tiny "Level 0" warm-up (Client → Server → DB) for absolute beginners.
- S3: Free-text "What if…?" box (AI answers, engine verifies when mappable).

### Cut (say so in "Roadmap")
- Netflix / WhatsApp / Uber blueprints (Netflix moves to the roadmap).
- Free-form drag-and-drop sandbox from an empty canvas.
- Standalone component library pages (concept cards appear *inside* missions).
- Accounts / login / database. Progress and streaks live in `localStorage`.
- Multiplayer, cloud deploy of designs.

**Rule:** the effort budget is the same as v1. You're *swapping* Netflix for Indian systems and one guided mission for an incident mission, not adding a product.

---

## 4. Content: Indian Hero Systems, Missions and Incident Mode

### 4.0 Honesty rules for real-world systems (non-negotiable)
Neither IRCTC's nor any streaming platform's internal architecture is fully public. So:
- On screen, every blueprint says: **"Inspired by public reporting and engineering talks. Simplified for learning. Numbers are illustrative."**
- Every node has a `sources` array (engineering blog posts, conference talks, news articles on Tatkal load or record cricket-stream concurrency) and every number has `illustrative: true` unless it's directly cited.
- **Verify every real-world figure before it appears on screen or in the pitch** (e.g., peak concurrent viewers for a cricket final, Tatkal requests per minute). If you can't cite it, don't state it as fact; phrase it as "millions of users within minutes."
- Use generic component names ("Seat inventory DB", "Edge CDN") rather than claiming a specific company runs a specific product unless a source says so.

This protects you from any judge who knows the real systems, and it's a Responsible AI talking point in itself.

### 4.1 Blueprint A: "Tatkal at 10 AM" (IRCTC-inspired ticket booking, ~11 nodes)
`Client (web/app)` → `CDN (static assets)`
`Client` → `Load balancer` → `Web/app servers (N replicas)` → `Session / login service`
`App servers` → `Rate limiter / virtual waiting room` (disabled at baseline)
`App servers` → `Seat availability cache` → `Seat inventory DB (primary)` + `Read replica`
`App servers` → `Booking queue` → `Payment service` → `Payment gateway (external, slow)`
`Booking queue` → `Confirmation / SMS worker` (async)

**Why it's perfect for teaching:** a massive, perfectly predictable spike (the whole country clicks at 10:00:00), hot-row contention on a few popular trains, and a slow external dependency. It naturally teaches spikes, rate limiting / waiting rooms, caching, read replicas, and queues.

### 4.2 Blueprint B: "The Final Over" (live-cricket streaming, ~11 nodes)
`Client` → `DNS / geo routing` → `Edge CDN` ↘ (miss) `Origin / packager`
`Live encoder` → `Origin / packager`
`Client` → `API gateway` → `Auth / entitlement service` → `Entitlement cache` → `User DB`
`Client` → `Scorecard / ads service` → `Cache`
`Player events` → `Event queue` → `Analytics consumer` (async)

**Why:** extreme concurrency with a tidal wave at the last over, CDN offload, the "login storm" when everyone opens the app at once, and async analytics that users never feel.

### 4.3 Guided missions (Predict → Break → Explain → Fix)
| # | Mission | Blueprint | Prediction asked | Fix goal | Concepts |
|---|---|---|---|---|---|
| G1 | **10:00:00 AM** | Tatkal | "At 10:00, which node goes red first?" (click) | p95 < 800 ms and errors < 2% during spike (enable waiting room / rate limiter, scale app servers) | Spikes, rate limiting, bottleneck reasoning |
| G2 | **The Final Over, No CDN** | Cricket | "What % of video traffic now reaches origin?" (slider) | Origin utilisation < 70% | CDN / edge caching |
| G3 | **Slow Analytics** | Cricket | "Do viewers notice? Yes/No" | Keep backlog bounded | Async queues, decoupling, backpressure |

G3 is the "aha": most students say yes, the answer is no, because the queue is async.

### 4.4 Incident Mode (the demo climax)

**I1: "Pager Duty: Tatkal Is Down"**
1. **Page:** "10:02 AM. Users report bookings timing out. Error rate 12% and climbing. You're on call."
2. **What the student sees:** only system dashboards (overall p95, error rate, throughput) and the architecture map with **all nodes grey/neutral**. Node health is hidden until inspected.
3. **Investigate:** clicking a node "runs a check" and reveals its metrics (ρ, latency, dropped req/s) in the Glass Box. Each inspection costs 1 of a limited budget (e.g., 5 checks) and advances a small "minutes elapsed" clock. This forces reasoning instead of clicking every node.
4. **Hidden root cause (engine-injected):** the seat-availability cache's hit rate collapsed (bad deploy flushed it), so reads pile onto the inventory DB primary, which saturates. Upstream app servers look unhealthy too, as a **red herring**, because they're waiting on the DB.
5. **Diagnose:** the student submits `{ rootCauseNode, causeType }` where `causeType ∈ {capacity, dependency failure, cache miss storm, traffic spike, slow external service}`. Graded deterministically.
6. **Fix:** palette (warm/restore cache, route reads to replica, scale DB, enable rate limiter). Must pass the goal.
7. **Post-mortem card:** timeline of what the student checked, what the root cause was, how symptoms propagated (the engine's cascade path), and one "lesson for next time." Real engineers write post-mortems; learners love this.

**Scoring:** diagnosis correct (50), checks used efficiently (20), fix passes goal (20), hints used (−5 each, max 3), time bonus (10).

**AI on-call mentor rules (enforced in prompt + validator):**
- It sees the full engine state, but **must never name the root-cause node or cause type before diagnosis is submitted.** The validator rejects any response containing the hidden node's id/name or cause type pre-diagnosis → falls back to a template question.
- It asks questions like a senior engineer: "The app servers are slow. Are they slow because they're overloaded, or because they're waiting on something?" "What changed recently?"
- After diagnosis, it explains the cascade using only engine numbers.

**Engine support needed (small):** `hidden: true` on the scenario event; a `revealedNodes` set in the UI store; the `cascadePath` already computed by `diff()`; a `gradeDiagnosis()` function. Estimated 4–6 hours total including UI.

**I2 (should-ship S1): "The Login Storm"**, on the cricket blueprint: entitlement cache TTL misconfigured to near zero → auth service and user DB melt when the toss happens. Red herring: the CDN looks busy but is healthy.

### 4.5 Daily Incident (retention)
- Home screen card: **"Today's Incident · 90 seconds"**. Picks a short hidden-fault variant targeting the student's **weakest concept** from the mastery map (with only I1 built, rotate hidden-fault parameters: which cache, which spike size).
- Streak counter and "concepts reviewed this week," in `localStorage`.
- Spacing rule: a concept answered wrong comes back the next day; answered right, it comes back after 3 days, then 7. Simple Leitner-box logic: ~40 lines, fully testable.
- Pitch line: "The brief says understand, practise **or retain**. We do all three."

### 4.6 Concepts tracked (mastery map)
Spike handling & rate limiting · Caching · CDN / edge · Async queues & backpressure · Replication & read scaling · **Root-cause diagnosis** (only earned in Incident Mode).

---

## 5. Simulation Engine Spec

Pure TypeScript, no React imports, fully deterministic, fully unit-tested. Your original "latency × (1 + util² × 10)" works but isn't explainable. Use a simple queueing-inspired model that you can show on screen and defend in the Q&A.

### 5.1 Model
- Architecture = directed graph. Each node has `type`, `serviceRatePerReplica (req/s)`, `replicas`, `baseLatencyMs`, `enabled`, and type-specific params.
- Input: `usersConcurrent`, `requestsPerUserPerSec` → arrival rate `λ_in` at `Client`.
- Process nodes in **topological order** (Kahn's algorithm). Detect cycles and reject them with an error message.

For each node:
```
capacity  μ   = serviceRatePerReplica × replicas            (0 if disabled/failed)
offered   λ   = sum of incoming flows
served        = min(λ, μ)
dropped       = max(0, λ − μ)            → counts as errors
ρ (util)      = λ / μ                    (∞ if μ = 0)
latency       = baseLatency / (1 − min(ρ, 0.95))   (M/M/1-style, capped so it stays finite)
health        = ρ < 0.7 green · ρ < 1.0 amber · ρ ≥ 1.0 red
```

Type rules for outgoing flow:
- **Cache / CDN:** `hitRate h`. Forward `(1 − h) × served` downstream. If disabled, forward `λ` (everything misses). This is what makes Mission 1 and 3 work.
- **Load balancer:** split `served` evenly across enabled children (or weighted).
- **Service:** forward `served × fanout[child]` to each child.
- **Queue (async edge):** accepts `λ`, drains at consumer rate; `backlog(t+1) = max(0, backlog + (λ − μ_consumer)·Δt)`. Async edges are **excluded from user-facing latency**. This powers Mission 4.
- **Replicas / failover:** killing a replica reduces `replicas`; if a node has a `failover` target, dropped traffic can reroute there.

System metrics:
```
userLatency(path) = Σ latency over the synchronous critical path of the chosen flow
errorRate         = 1 − Π (1 − dropped_i / λ_i) along the path
throughput        = successfully served requests at the path's sink
```

Run the engine once per UI change (it's microseconds) and use a separate animation tick for particles and queue backlog.

### 5.2 Why this is good for judges
- Every number has a traceable formula → the **Glass Box panel** shows `λ = 12,400 req/s, μ = 10,000 req/s, ρ = 1.24 → overloaded, 2,400 req/s dropped`.
- It's deterministic → predictions can be graded exactly → tests are easy to write.
- Say clearly in the README: *"Directionally correct, not a real benchmark. We model steady-state throughput, not network jitter, GC pauses, or retry storms."* Limitations stated upfront score better than limitations discovered by a judge.

### 5.3 Engine API
```ts
simulate(graph: ArchGraph, scenario: Scenario): SimResult
// SimResult: { nodes: Record<id, NodeMetrics>, system: SystemMetrics, criticalPath: id[], events: SimEvent[] }
diff(before: SimResult, after: SimResult): StateDelta   // feeds the AI tutor
gradePrediction(pred: Prediction, result: SimResult): Grade  // deterministic
checkGoal(goal: MissionGoal, result: SimResult): { pass: boolean; failing: string[] }
gradeDiagnosis(dx: Diagnosis, incident: Incident, checksUsed: number, hintsUsed: number): IncidentScore
cascadePath(before: SimResult, after: SimResult): id[]   // root → symptoms, for the post-mortem
nextReview(history: ReviewLog, today: Date): ConceptId[] // Leitner scheduling for Daily Incident
```

Additional model rule for incidents: **cache hit-rate collapse** is just `hitRate` dropping (e.g., 0.9 → 0.1), which the existing cache rule already propagates downstream. **Dependency wait** is modelled by adding downstream latency to the caller's latency, so upstream nodes look slow (the red herring) without being overloaded.

---

## 6. AI Tutor Design (your Responsible AI score)

### 6.1 Principle
**The engine decides what happened. The AI only explains why, in words a learner understands.** The AI never grades, never invents metrics, never designs the solution for the student.

### 6.2 Roles
| Role | Input | Output | Constraint |
|---|---|---|---|
| Socratic nudge (after a wrong prediction) | Mission, student's prediction, engine `StateDelta` | One guiding question | Must not reveal the answer |
| Explanation | Same + the question + student's reply | 2–4 sentences | Only numbers present in `StateDelta` |
| Node context | Node metadata + blueprint context | "What this does *here* and why it was chosen" | Must use the node's `sources` fact list only |
| Hint ladder (Fix phase) | Goal, failing metrics | Hint 1 (concept) → Hint 2 (which node) → Hint 3 (which action) | Revealed one at a time on request |
| **On-call mentor (Incident Mode)** | Full engine state, what the student has inspected so far | One investigative question at a time | **Must not reveal root-cause node or cause type before diagnosis**; enforced by a forbidden-terms validator |

### 6.3 Hallucination mitigation (implement all four; list them in README)
1. **Grounded context:** the prompt contains the `StateDelta` as JSON and the instruction *"Use only numbers from FACTS. If you need a number not in FACTS, say you don't know."*
2. **Structured output:** request JSON `{ "text": string, "numbers_used": number[], "node_ids": string[] }`.
3. **Spoiler guard (Incident Mode):** before diagnosis, reject any response mentioning the hidden node's id, name, aliases, or cause type; fall back to a template question.
4. **Post-validation in code:** every number in `text` must match a value in `StateDelta` (±2% tolerance) and every `node_id` must exist in the graph. If validation fails → retry once → else fall back to a **templated explanation** generated from the delta (`"{node} went from {ρ_before} to {ρ_after} utilisation because {cause}."`). Show a tiny badge on each message: `✓ verified against simulation` or `template fallback`.

The fallback also means **the app works fully with no API key or when rate-limited**, which protects your 30% "working product" score during judging.

### 6.4 Security
- LLM key lives only in a Vercel serverless function (`/api/tutor`). Never in the client bundle. `.env.example` committed, `.env` git-ignored. Run `gitleaks` or `git log -p | grep -i key` before submitting.
- The function whitelists request shape (zod schema), caps input size, and rate-limits per IP (simple in-memory token bucket is fine for a demo).
- Student free-text is placed in a delimited block and treated as data, not instructions.

### 6.5 Model choice
Any capable model works: Claude (Sonnet or Haiku) or Gemini's free tier. Pick whichever you have credits for, and keep it behind one `tutorClient.ts` interface so it's swappable. Name it in the AI declaration.

---

## 7. Tech Stack (trimmed for 48 h)

| Layer | Choice | Change vs your doc |
|---|---|---|
| Build | Vite + React 18 + TypeScript | same |
| Canvas | `@xyflow/react` (React Flow v12) | same |
| State | Zustand | new: simple global store for graph, scenario, sim result, mastery |
| Animation | Framer Motion for UI; SVG `animateMotion` or a rAF loop for particles along edges | particles via SVG are cheaper than Framer per-dot |
| Styling | Tailwind | same |
| Validation | zod (blueprint JSON, mission JSON, API payloads) | new |
| Tests | Vitest (engine, grading, validator) + Playwright (1 smoke test of a full mission) | new |
| Backend | **Vercel serverless function** for `/api/tutor` | replaces FastAPI: one deploy, one repo, fewer failure points |
| Storage | `localStorage` for progress | explicit |
| Deploy | Vercel | same |

---

## 8. Repository Structure

```
archlens/
├── src/
│   ├── engine/            # pure TS, no React
│   │   ├── simulate.ts
│   │   ├── topology.ts    # Kahn sort, cycle detection
│   │   ├── nodeModels.ts  # cache, lb, service, queue, db rules
│   │   ├── grade.ts       # gradePrediction, checkGoal
│   │   ├── diff.ts
│   │   └── __tests__/
│   ├── content/
│   │   ├── blueprints/tatkal.json
│   │   ├── blueprints/cricket.json
│   │   ├── missions/*.json   # g1, g2, g3
│   │   ├── incidents/*.json  # i1 (+ i2 if S1)
│   │   └── schemas.ts     # zod
│   ├── tutor/
│   │   ├── tutorClient.ts # calls /api/tutor
│   │   ├── validate.ts    # numeric + node-id validator
│   │   ├── templates.ts   # offline fallback explanations
│   │   └── __tests__/
│   ├── features/
│   │   ├── canvas/        # nodes, edges, particles, health styling
│   │   ├── mission/       # Brief, PredictStep, ObserveStep, ExplainStep, FixStep
│   │   ├── glassbox/
│   │   ├── incident/      # Pager, InspectBudget, DiagnosisForm, PostMortem
│   │   ├── daily/         # DailyIncidentCard, streak, Leitner scheduler UI
│   │   └── mastery/
│   ├── store/useArchStore.ts
│   └── pages/ (Landing, Missions, Mission, Summary)
├── api/tutor.ts           # Vercel function, key server-side
├── e2e/mission1.spec.ts
├── docs/ (screenshots, architecture.png, user-study.md, sources.md)
├── .env.example
├── README.md
└── AI_DECLARATION.md
```

### 8.1 Guided mission JSON example
```json
{
  "id": "g1-tatkal-10am",
  "blueprint": "tatkal",
  "title": "10:00:00 AM",
  "concepts": ["spikes", "bottleneck"],
  "brief": "It's 9:59. Lakhs of people are refreshing. At 10:00 Tatkal opens.",
  "baseline": { "users": 50000 },
  "event": { "type": "traffic_spike", "users": 2000000, "rampSeconds": 5 },
  "prediction": {
    "kind": "select_node",
    "prompt": "At 10:00, which component turns red first?",
    "answerFrom": "firstOverloadedOnCriticalPath"
  },
  "fix": {
    "palette": ["enable:waiting_room", "add_replica:app", "add_replica:read_replica"],
    "goal": { "p95LatencyMsMax": 800, "errorRateMax": 0.02 }
  },
  "misconceptions": {
    "cdn": "The CDN serves static files like JS and images. Bookings are dynamic requests it can't absorb.",
    "payment_gateway": "Payment is downstream of the queue. Most requests fail long before reaching it."
  }
}
```
`answerFrom` means the correct answer is computed by the engine, not hard-coded.

### 8.2 Incident JSON example
```json
{
  "id": "i1-tatkal-down",
  "blueprint": "tatkal",
  "title": "Pager Duty: Tatkal Is Down",
  "concepts": ["diagnosis", "caching", "replication"],
  "page": "10:02 AM. Bookings timing out. Error rate 12% and climbing.",
  "baseline": { "users": 1200000 },
  "hiddenEvent": { "type": "set_param", "node": "seat_cache", "param": "hitRate", "value": 0.1 },
  "answer": { "rootCauseNode": "seat_cache", "causeType": "cache_miss_storm" },
  "spoilerTerms": ["seat_cache", "seat availability cache", "cache miss", "hit rate"],
  "inspectBudget": 5,
  "redHerrings": ["app_servers"],
  "fix": {
    "palette": ["restore:seat_cache", "route_reads:read_replica", "add_replica:inventory_db", "enable:waiting_room"],
    "goal": { "p95LatencyMsMax": 800, "errorRateMax": 0.02 }
  },
  "postMortemLesson": "When everything upstream looks slow, follow the waits downstream. The first saturated node is rarely the loudest one."
}
```

## 9. 48-Hour Timeline

Roles: **A** = engine & tests · **B** = canvas & animation · **C** = missions, incident flow & AI · **D** = content research, design, README, study, pitch. Solo? Do A → C → B → D, build G1 + G3 + I1 only, and skip particles until H36.

### Before you register (tonight, if time allows; otherwise hours 0–2)
- D: collect public sources on Tatkal load and cricket-streaming scale; write `docs/sources.md`. Verify every number you plan to show.
- Write `tatkal.json`, `cricket.json`, G1–G3 and I1 JSON on paper.
- Draft the 5-question quiz and the reading article for the A/B study (§11).
- Create the GitHub repo, Vite scaffold, Vercel project, `.env.example`.

### Hours 0–6: Foundations
- A: `topology.ts`, `simulate.ts` (service, db, cache, lb, rate limiter, dependency-wait latency); first 10 tests.
- B: canvas renders `tatkal.json`; node component with icon + label + health ring.
- C: zod schemas for blueprints, missions, incidents; mission state machine.
- D: visual system (colour-blind-safe), landing page with the "Tatkal at 10 AM" hook.
- **H6 checkpoint:** Tatkal blueprint renders; engine returns numbers.

### Hours 6–14: G1 playable end-to-end, no AI
- A: `grade.ts`, `checkGoal`, `diff.ts`, `cascadePath`; G1 answer-key tests.
- B: health colours, gauges, particles on the critical path, traffic spike ramp.
- C: Predict UIs, templated Explain, Fix palette.
- D: Glass Box panel; recruit 10–12 study participants for H30–H36.
- **H14 checkpoint:** G1 fully playable. Deploy. From now on main is always deployable.

### Hours 14–22: AI tutor, cricket blueprint, G2–G3
- C: `/api/tutor`, JSON output, number validator, retry, template fallback, "verified" badge.
- A: queue backlog + async edges (G3); CDN rule (G2); tests.
- B: cricket blueprint renders; backlog visual on queue node.
- D: G2–G3 copy and misconception text.
- **H22 checkpoint:** G1–G3 playable with AI and fallback.

### Hours 22–28: Sleep in shifts.

### Hours 28–36: Incident Mode + Daily Incident + study
- C: I1 flow (pager, hidden health, inspect budget, diagnosis form, post-mortem), on-call mentor prompt, **spoiler guard** + tests.
- A: `gradeDiagnosis`, hidden-event support, `nextReview` (Leitner) + tests; Playwright E2E for I1.
- B: grey-until-inspected nodes, "check" animation, post-mortem cascade replay.
- D: Daily Incident card + streak; **run the A/B study** on the deployed build (G1 + G3 are enough for the study).
- **H36 checkpoint:** I1 playable end-to-end. Feature freeze.

### Hours 36–42: Hardening (+ S1 only if green)
- Polish bar (§10.1), Lighthouse a11y ≥ 90, error states, secret scan, mobile doesn't break.
- S1 (I2 Login Storm) only if everything above is done.

### Hours 42–48: Submission
- README with GIF, architecture, study results, limitations, sources; `AI_DECLARATION.md`.
- Record the 2-minute demo video (backup).
- Rehearse the pitch 5× with a timer.
- Submit with ≥ 2 hours spare; check all links in incognito.

---

## 10. Quality Evidence Checklist (Engineering 20%)

- [ ] ≥ 25 Vitest tests: engine math (cache hit forwarding, LB split, overload drop, cycle rejection, async exclusion), grading, goal check, AI validator (accepts true numbers, rejects invented ones), zod schema rejects bad content.
- [ ] 1 Playwright E2E: complete Mission 1.
- [ ] GitHub Actions: lint + typecheck + tests on every push (badge in README).
- [ ] Meaningful commits (small, descriptive; no single "final" commit).
- [ ] Error states: tutor unavailable → fallback shown; malformed content → friendly error; empty progress → onboarding.
- [ ] Accessibility: keyboard-operable predictions, health shown by icon + text not just colour, reduced motion, contrast ≥ 4.5:1, Lighthouse a11y score in README.
- [ ] Security: key server-side, input validation, rate limit, no secrets in git history, dependency audit (`npm audit`) noted.
- [ ] Spoiler-guard tests: mentor responses naming the hidden node pre-diagnosis are rejected.
- [ ] Leitner scheduler tests (wrong → tomorrow; right → 3 days → 7 days).

### 10.1 Execution polish bar (what separates 9 from 10)
- **Instant feel:** the engine runs synchronously on every change; no spinners on the canvas. AI text streams in *beside* the canvas and never blocks it.
- **Works with no API key** on a judge's laptop: every AI touchpoint has a template path.
- The **"✓ verified against simulation"** badge is visible on every AI message in the demo.
- Consistent visual language: one icon set, one colour scale, text status on every node.
- No dead ends: every screen has a next action; the session summary links to the Daily Incident.
- Tested in a clean incognito browser on a slow laptop the day before submission.

---

## 11. Measuring Impact: The A/B Learning Study (the 15% most teams leave empty)

"Students liked it" is weak evidence. "Students learned more than with the alternative" is strong evidence, and almost no hackathon team has it.

### 11.1 Protocol (~2 hours total, run H30–H36)
- **Participants:** 10–12 classmates who haven't formally studied system design. Randomly assign to two equal groups (coin flip or alternate by sign-up order).
- **Pre-quiz (3 min, both groups):** 5 multiple-choice questions covering spikes/rate limiting, caching, CDN, async queues, and diagnosis ("Upstream services are slow but not overloaded. Where do you look first?").
- **Treatment (12 min):**
  - Group A (control): reads a good, well-known article/explainer on caching, CDNs, queues and rate limiting (credit the source).
  - Group B: uses ArchLens: G1 + G3 + I1.
- **Post-quiz (4 min, both groups):** same 5 concepts, **different wording and numbers** from the pre-quiz, plus 1 transfer question on a system neither group saw (e.g., "A food-delivery app is slow at 8 PM; the order DB is at 40% utilisation. Is the DB the problem?").
- **Survey:** confidence explaining each concept (1–5) and "Which would you choose to learn from next time?"

### 11.2 Report (`docs/user-study.md` and README)
- Mean pre → post score per group, and **learning gain** (post − pre) per group.
- Confidence change per group.
- The transfer-question result (strongest evidence of real understanding).
- 2–3 anonymised quotes.
- **Honest caveats:** tiny sample, no statistical significance claimed, same-college participants, 12-minute exposure, and the team built the quiz. Stating these is what makes judges trust the numbers.
- Put the materials (quiz, article link, assignment method) in the repo so it's reproducible.

### 11.3 In-app evidence
The session summary shows first-attempt prediction accuracy across missions and the incident score. Aggregate these from study participants (with consent, no personal data) as a second, independent signal.

Use your real numbers only. If the result is mixed, say so and explain what you learned. A truthful small effect beats a suspicious perfect one.

---

## 12. README Outline

1. Title, one-line pitch ("Every tool lets you break a system. ArchLens teaches you to debug one."), live demo link, 30-sec GIF of Incident Mode
2. The problem (with the "no feedback loop" insight)
3. Who it's for
4. What's different: comparison table incl. paperdraw / SysSimulator / SystemForge; the learning loop; **Incident Mode**; Daily Incident retention
5. How it works: learning loop diagram
6. Architecture diagram + engine formulas
7. Responsible AI: grounding, validator, fallback, what the AI is *not* allowed to do
8. Setup (`npm i`, `.env.example`, `npm run dev`, `npm test`)
9. Testing & quality evidence (test count, CI badge, Lighthouse score)
10. A/B study results with caveats (§11)
11. Screenshots
12. Limitations (simplified model, illustrative numbers, "inspired by" blueprints not real internals, localStorage only, small study)
13. Roadmap
14. Credits & sources: libraries, `docs/sources.md` for all public material behind the blueprints, AI tools

### AI_DECLARATION.md template
| Tool | Used for | What we verified ourselves |
|---|---|---|
| e.g. Claude | Planning, boilerplate for React Flow nodes, drafting mission copy | Rewrote engine math by hand; every formula covered by tests; every blueprint fact checked against the cited source |
| e.g. Copilot | Autocomplete | Reviewed all diffs |
| Runtime LLM (name/model) | Tutor explanations | Output validated against engine numbers; fallback templates written by us |

---

## 13. Two-Minute Pitch (timed)

| Time | Say / show |
|---|---|
| 0:00–0:12 | "Everyone in this room has watched IRCTC die at 10 AM. Why does it happen? Most CS students can't tell you, because system design is the one topic you can't run and test." |
| 0:12–0:22 | "Tools exist that let you break an architecture. But breaking a system you already know is broken teaches very little. Real engineers get paged with symptoms, not answers." |
| 0:22–0:50 | **Live, G1:** "10:00 AM. Predict what fails first." Click the CDN (wrong, on purpose). Spike. App servers go red, particles pile up. Mentor asks one question, then explains with verified numbers. Enable the waiting room → green. |
| 0:50–1:30 | **Live, Incident Mode (climax):** "Now you're on call." Pager: errors 12%. Everything is grey. Inspect app servers: slow, but not overloaded. Mentor: "Slow because busy, or because waiting?" Inspect DB: saturated. Inspect cache: hit rate 10%. Diagnose → correct → post-mortem replays the cascade. |
| 1:30–1:42 | "Only the engine decides what happened. The AI may only explain its numbers, and it's blocked from spoiling the answer. It even runs with no AI." |
| 1:42–1:55 | "We tested it: N students read an article, N used ArchLens. Learning gain: X vs Y." Flash Daily Incident + streak: "Understand, practise, retain." |
| 1:55–2:00 | "Every tool lets you break a system. ArchLens teaches you to debug one." |

---

## 14. Risks & Mitigations

| Risk | Mitigation |
|---|---|
| Animation eats all your time | Particles only on the critical path; max ~40 dots; ship static health colours first (H14 checkpoint doesn't need particles) |
| Engine numbers feel wrong | Tune blueprint parameters, not formulas; write tests for each mission's expected outcome first |
| LLM down or rate-limited during judging | Template fallback is a first-class path; demo video backup |
| Judge knows IRCTC / streaming internals, or a number is wrong | "Inspired by, simplified, illustrative" label on screen; every shown number verified and in `docs/sources.md`; generic component names |
| Incident Mode too hard for beginners | 3-hint ladder; inspect budget can be generous (5 checks for ~11 nodes); G1–G3 teach the concepts first |
| Mentor accidentally spoils the answer | Spoiler guard validator + tests; template fallback |
| A/B study shows little difference | Report honestly with caveats; still show in-app accuracy gains; a truthful result still scores |
| Can't recruit 10 people | Run it online over a call in two batches of 3; even 6 people is useful if caveated |
| Scope creep | §3 cut list is final. Stretch only after H36 checkpoint |
| Deployment breaks at hour 47 | Deploy from H14 onward on every merge; freeze at H44 |
| Registration timing | Register today before 11:59 PM IST; the clock starts on confirmation |

---

## 15. Scoring Map (why this wins)

| Criterion | What judges will see |
|---|---|
| **Problem clarity 20%** | An instantly relatable hook (IRCTC at 10 AM) plus a precise gap from honest competitor research: simulators let you break systems; nothing teaches you to diagnose them. Clear user: first-time learners. |
| **Working product 30%** | 3 guided missions + 1 incident, Daily Incident, no dead ends, deployed, works without AI, demo-video backup. |
| **Engineering 20%** | Pure, tested engine (incl. diagnosis grading, cascade paths, Leitner scheduler); zod-validated content; CI; E2E tests; error states; a11y score; server-side keys. |
| **Responsible AI 15%** | Engine is ground truth; grounded JSON output; number validator; spoiler guard; visible "verified" badge; template fallback; Socratic-first so AI supports thinking rather than replacing it; cited, clearly labelled real-world content. |
| **Impact 15%** | A/B study with learning gains and a transfer question, in-app learning analytics, retention loop, and a pitch built around a moment every judge has lived through. |

---

## 16. Roadmap (for README)
More incidents and blueprints (UPI at festival peak, food delivery at dinner rush, Netflix, WhatsApp) · free-form sandbox graded by the same engine · multiplayer "war room" incidents for teams · instructor dashboard for university courses · community-contributed blueprints with citation review · richer simulation (retries, timeouts, circuit breakers, regional failover) · larger, properly controlled learning study.
