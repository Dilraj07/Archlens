# 🔍 ArchLens · Adaptive System Design & Incident Simulator

> *"Every tool lets you break a system. ArchLens teaches you to **debug** one."*  
> **Challenge:** CodeMyFYP Hackathon 2026 · Challenge 01: AI for Learning  
> **Core Architecture:** Deterministic Simulation Engine (Ground Truth) + Responsible AI Mentor + The Verge Design System

---

## ⚡ Problem: System Design Has No Feedback Loop

Students and engineers prepare for system design by reading static articles or clicking around passive sandboxes (e.g., Paperdraw, SysSimulator). But passive sandboxes do not build intuition because:
1. **No Pre-Commitment:** Users flip toggles without predicting outcomes; being *wrong* about a prediction is what forces deep mental-model updates.
2. **AI Hallucinations:** Generic LLMs invent arbitrary numbers, hallucinate bottleneck causes, and lack mathematical grounding.
3. **No Realistic Debugging:** Sandboxes train people to trigger failures they already know about. Real engineering demands debugging: seeing degraded symptoms (surging latency, 5xx errors) and reasoning back to the root cause under uncertainty.

---

## 💡 The ArchLens Solution

ArchLens is an adaptive system-design tutor powered by a **pure deterministic M/M/1 queueing simulator** paired with an **in-situ Responsible AI mentor**.

### 1. The 6-Step Pedagogical Loop
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

### 2. Incident Mode (Real-World On-Call Simulation)
Inverts the learning loop:
- **Fog of War:** All nodes start in a neutral grey uninspected state during a live production crisis.
- **Inspection Budget:** The student has a limited budget (5 inspections) to interrogate node telemetry.
- **Root Cause Diagnosis:** Student submits their diagnosis (`{ rootCauseNode, causeType }`).
- **Post-Mortem Cascade:** Replays the chronological failure propagation across upstream and downstream dependencies.

### 3. Glass Box Transparency
Unlike black-box simulators, the **Glass Box** inspector displays the exact M/M/1 queueing theory equations ($\lambda, \mu, \rho$, latency, drops) for any selected node.

### 4. Spaced Retention & Daily Incident
- 90-second incident variant targeting the learner's weakest concept.
- Powered by a Leitner-box spaced repetition algorithm persisted in `localStorage`.

---

## 🇮🇳 Authentic Indian Blueprints & Missions

1. **IRCTC Tatkal at 10 AM** (`tatkal.json`): 11-node architecture modeling the extreme 10 AM ticket surge, CDN bypass, Redis seat cache eviction, database bottleneck, and payment gateway fanout.
2. **The Final Over (Live Cricket Streaming)** (`cricket.json`): 11-node architecture modeling CDN edge delivery, video segment transcoders, session cache stampede, and telemetry decoupling.

---

## 🛡️ Responsible AI & Guardrails (Ground Truth Guarantee)

Judges evaluate Responsible AI rigorously (15% of score). ArchLens enforces non-negotiable defensive constraints:
- **Strict Grounding:** The deterministic simulation engine is the sole source of truth. The AI may only explain what the engine computes.
- **Client-Side Numeric Validator (`validate.ts`):** Every number in the LLM response must match the engine's `StateDelta` within $\pm 2\%$ relative tolerance, and all referenced node IDs must exist in the active graph.
- **Spoiler Guard (`spoilerGuard.ts`):** Scans candidate mentor responses to strictly prohibit revealing root causes before diagnosis submission.
- **100% Offline Deterministic Fallback (`templates.ts`):** If the LLM API is unavailable, unconfigured, or fails validation, deterministic templates provide instant, verified feedback marked with `[template fallback]`.

---

## 📊 Comparison with Existing Tools

| Feature | Paperdraw / SysSimulator | Generic AI Tutors | **ArchLens** |
|---|---|---|---|
| **Simulation Truth** | Deterministic / Heuristic | Hallucinates numbers | **Deterministic M/M/1 Engine** |
| **Predict-Before-Seeing** | ❌ None (Passive Sandbox) | ❌ None | **✅ Mandatory Structured Prediction** |
| **Incident Mode** | ❌ None | ❌ None | **✅ Fog of War + Inspection Budget** |
| **Formula Transparency** | ❌ Hidden | ❌ None | **✅ Glass Box Panel** |
| **AI Grounding Guardrails** | ❌ No AI | ❌ Unchecked | **✅ ±2% Delta Validator + Spoiler Guard** |
| **Spaced Repetition** | ❌ None | ❌ None | **✅ Leitner-Box Daily Incidents** |
| **Works Offline / No Key** | ✅ | ❌ Fails | **✅ 100% Deterministic Fallback** |

---

## 🛠️ Tech Stack & Engineering Standards

- **Runtime & Language:** TypeScript 5.x (Strict mode: `noImplicitAny`, `strictNullChecks`, `noUncheckedIndexedAccess`)
- **UI & Framework:** React 18/19, Vite, Tailwind CSS (The Verge 2024 Design System tokens)
- **Canvas / Topology:** `@xyflow/react` (React Flow v12) with custom nodes & SVG particle streams
- **State Management:** Zustand (selector-based subscriptions)
- **Validation:** Zod (runtime validation for graphs, missions, incidents, API envelopes)
- **Unit Testing:** Vitest (29 tests covering engine math, topological sorting, Leitner scheduler, and guardrails)

---

## 🚀 Quick Start & Local Setup

### 1. Clone & Install
```bash
git clone https://github.com/Dilraj07/CodeYourFYP.git
cd CodeYourFYP
npm install
```

### 2. Environment Configuration (Optional)
ArchLens functions 100% offline out-of-the-box using deterministic templates. To enable the live AI tutor:
```bash
cp .env.example .env
# Add your GROQ_API_KEY or OPENAI_API_KEY in .env
```

### 3. Run Development Server
```bash
npm run dev
# Opens at http://localhost:5173
```

### 4. Run Test Suite
```bash
npm test
# 29 passed (engine math, cycle detection, Leitner scheduling, guardrails)
```

### 5. Production Build
```bash
npm run build
# Compiles TypeScript and bundles production assets via Vite
```

---

## 👥 Authors & Acknowledgments

- **Author:** Dilraj ([@Dilraj07](https://github.com/Dilraj07))
- **Hackathon:** CodeMyFYP Hackathon 2026
- **Real-World Citations:** See [`docs/sources.md`](./docs/sources.md) for public engineering sources behind IRCTC and cricket streaming blueprints.
