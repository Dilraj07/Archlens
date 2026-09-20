# ArchLens · Adaptive System Design & Incident Simulator

> *"Every tool lets you break a system. ArchLens teaches you to **debug** one."*  
> **Challenge:** CodeMyFYP Hackathon 2026 · Challenge 01: AI for Learning  
> **Core Architecture:** Deterministic Simulation Engine (Ground Truth) + Responsible AI Mentor + The Verge Design System

<p align="center">
  <img src="./docs/assets/archlens-preview.png" alt="ArchLens Platform Interface" width="100%" />
</p>

---

## Problem: System Design Has No Feedback Loop

Students and engineers prepare for system design by reading static articles or clicking around passive sandboxes (e.g., Paperdraw, SysSimulator). But passive sandboxes do not build intuition because:
1. **No Pre-Commitment:** Users flip toggles without predicting outcomes; being *wrong* about a prediction is what forces deep mental-model updates.
2. **AI Hallucinations:** Generic LLMs invent arbitrary numbers, hallucinate bottleneck causes, and lack mathematical grounding.
3. **No Realistic Debugging:** Sandboxes train people to trigger failures they already know about. Real engineering demands debugging: seeing degraded symptoms (surging latency, 5xx errors) and reasoning back to the root cause under uncertainty.

---

## The ArchLens Solution

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

### 3. Guided Architecture Walkthroughs (Interactive Level Tours)
To bridge the gap before running high-stress simulations, each architecture includes a step-by-step interactive tour:
- **Spotlight Navigation:** Highlights relevant nodes and data paths at each stage (e.g., Edge Ingress -> API Gateway -> Microservices -> Cache/Broker -> Primary DB).
- **Stage Explanations:** Explains the engineering rationale, failover strategies, and bottleneck risks at each layer.
- **Audio Narration Support:** Integrates directly with voice narration for audio-guided learning.

### 4. Design Studio (Drag-and-Drop Architecture Sandbox)
A full-featured visual architecture editor allowing learners and system architects to:
- **Start from Scratch or Templates:** Build custom topologies from a blank canvas or jumpstart from industry templates.
- **Node Library:** Drag and drop clients, reverse proxies, microservices, distributed caches, event brokers, and relational/document databases.
- **Real-Time Traffic Tuning:** Adjust concurrent user load (RPS) via interactive sliders and immediately watch M/M/1 queuing math calculate per-node utilization, latency spikes, and packet drop rates.
- **Dynamic Wiring:** Connect source and target handles with real-time cycle detection and topological validation.

### 5. Voice AI Narration (Web Speech API)
- Hands-free Socratic mentorship powered by native speech synthesis (`speechNarrator.ts`).
- Provides spoken briefings during high-intensity incident simulations and real-time audio guidance through tutor explanations.
- Features play, pause, resume, and rate/pitch controls with instant cancellation.

### 6. Glass Box Transparency
Unlike black-box simulators, the **Glass Box** inspector displays the exact M/M/1 queueing theory equations ($\lambda, \mu, \rho$, latency, drops) for any selected node.

### 7. Spaced Retention & Daily Incident
- 90-second incident variant targeting the learner's weakest concept.
- Powered by a Leitner-box spaced repetition algorithm persisted in `localStorage`.

### 8. System Design Knowledge Base & Component Catalog
- **Interactive Theory Hub:** Comprehensive learning modules covering Horizontal vs. Vertical Scaling, CAP Theorem, Database Sharding, Caching Topologies, and Message Queuing.
- **Component Catalog:** Deep-dive cards detailing operational characteristics, failure modes, latency baselines, and architectural tradeoffs for each infrastructure component.

---

## Authentic Industry Blueprints & Brand System

ArchLens features realistic topologies with authentic SVG company assets (`CompanyLogo.tsx`):
1. **IRCTC Tatkal at 10 AM** (`tatkal.json`): 11-node architecture modeling the extreme 10 AM ticket surge, CDN bypass, Redis seat cache eviction, database bottleneck, and payment gateway fanout.
2. **The Final Over (Live Cricket Streaming)** (`cricket.json`): 11-node architecture modeling CDN edge delivery, video segment transcoders, session cache stampede, and telemetry decoupling.
3. **Amazon E-Commerce Flash Sale**: Microservice architecture handling lightning deals, inventory reservation, asynchronous cart checkout, and distributed database locking.
4. **Netflix Video Streaming**: Global CDN distribution with edge compute, origin video transcoding pipelines, and user recommendation caches.
5. **Authentic Vector Brand Library**: Integrated SVG marks for Amazon, Netflix, IRCTC, Hotstar, Redis, Apache Kafka, Stripe, Uber, Airbnb, Cloudflare, Discord, GitHub, LinkedIn, X, and YouTube.

---

## Responsible AI & Guardrails (Ground Truth Guarantee)

Judges evaluate Responsible AI rigorously (15% of score). ArchLens enforces non-negotiable defensive constraints:
- **Strict Grounding:** The deterministic simulation engine is the sole source of truth. The AI may only explain what the engine computes.
- **Client-Side Numeric Validator (`validate.ts`):** Every number in the LLM response must match the engine's `StateDelta` within $\pm 2\%$ relative tolerance, and all referenced node IDs must exist in the active graph.
- **Spoiler Guard (`spoilerGuard.ts`):** Scans candidate mentor responses to strictly prohibit revealing root causes before diagnosis submission.
- **100% Offline Deterministic Fallback (`templates.ts`):** If the LLM API is unavailable, unconfigured, or fails validation, deterministic templates provide instant, verified feedback marked with `[template fallback]`.

---

## Comparison with Existing Tools

| Feature | Paperdraw / SysSimulator | Generic AI Tutors | ArchLens |
|---|---|---|---|
| **Simulation Truth** | Deterministic / Heuristic | Hallucinates numbers | **Deterministic M/M/1 Engine** |
| **Predict-Before-Seeing** | No (Passive Sandbox) | No | **Yes (Mandatory Structured Prediction)** |
| **Incident Mode** | No | No | **Yes (Fog of War + Inspection Budget)** |
| **Guided Architecture Tours** | No | No | **Yes (Multi-Step Node Highlighting)** |
| **Custom Sandbox / Canvas** | Partial | No | **Yes (Blank Canvas + Drag-and-Drop + Live Sim)** |
| **Voice AI Narration** | No | No | **Yes (Integrated Speech Synthesis)** |
| **Formula Transparency** | Hidden | No | **Yes (Glass Box Panel)** |
| **AI Grounding Guardrails** | No AI | Unchecked | **Yes (±2% Delta Validator + Spoiler Guard)** |
| **Spaced Repetition** | No | No | **Yes (Leitner-Box Daily Incidents)** |
| **Works Offline / No Key** | Yes | Fails | **Yes (100% Deterministic Fallback)** |

---

## Tech Stack & Engineering Standards

- **Runtime & Language:** TypeScript 5.x (Strict mode: `noImplicitAny`, `strictNullChecks`, `noUncheckedIndexedAccess`)
- **UI & Framework:** React 18/19, Vite, Tailwind CSS (The Verge 2024 Design System tokens)
- **Canvas / Topology:** `@xyflow/react` (React Flow v12) with custom nodes & SVG particle streams
- **State Management:** Zustand (selector-based subscriptions)
- **Validation:** Zod (runtime validation for graphs, missions, incidents, API envelopes)
- **Unit Testing:** Vitest (29 tests covering engine math, topological sorting, Leitner scheduler, and guardrails)

---

## Quick Start & Local Setup

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

## Authors & Acknowledgments

- **Author:** Dilraj ([@Dilraj07](https://github.com/Dilraj07))
- **Hackathon:** CodeMyFYP Hackathon 2026
- **Real-World Citations:** See [`docs/sources.md`](./docs/sources.md) for public engineering sources behind IRCTC and cricket streaming blueprints.
