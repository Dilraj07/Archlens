# ArchLens Real-World Engineering Sources & Citations

> **Pedagogical Disclaimer:** All blueprints in ArchLens are inspired by public conference talks, high-scale engineering blogs, and post-incident public reporting. They are simplified for learning systems thinking and queueing mechanics. Numerical metrics are illustrative and directionally representative.

---

## 1. Blueprint A: "Tatkal at 10 AM" (IRCTC-Inspired Ticketing)

### Public Context & Scale
- **Daily Peak Concurrency:** Over 1.5 million to 2.5 million users attempt concurrent ticket bookings within the first 5 minutes of the 10:00:00 AM (AC) and 11:00:00 AM (Non-AC) Tatkal booking windows.
- **Traffic Profile:** Instantaneous step-function traffic spike (15× to 20× increase in $<3$ seconds) leading to severe connection pooling contention, session cache stampedes, and hot-row record locking on popular express train routes.
- **Public References & Engineering Talks:**
  1. *Centre for Railway Information Systems (CRIS) Technical Architecture Disclosures & Infrastructure Modernization Reports.*
  2. Public analyses on relational database row-locking contention during peak seat inventory allocation.
  3. High-concurrency ticketing queueing patterns: Virtual waiting rooms, dynamic rate limiters, read-replica offloading, and decoupled async booking queues.

---

## 2. Blueprint B: "The Final Over" (Live Sports Streaming)

### Public Context & Scale
- **Record Concurrency:** High-profile cricket tournaments (e.g. World Cup Finals, IPL playoffs) routinely set global concurrent live-stream records exceeding 30–50 million simultaneous video viewers.
- **Traffic Profile:** Steady ramp-up during match play culminating in massive concurrency tidal waves during final overs and milestone deliveries.
- **Engineering Architecture Pattern:**
  - **Multi-CDN Edge Offload:** Edge video caching absorbs 98%+ of video chunk requests (HLS/DASH TS/fMP4 segments) to prevent origin packager collapse.
  - **Login Storm Mitigation:** Entitlement and token verification services protected by multi-tier Redis clusters to buffer sudden authentication rushes.
  - **Decoupled Telemetry Queues:** Real-time viewer quality-of-service pings and ad impression events routed into high-throughput Kafka clusters, completely decoupled from the synchronous video delivery critical path.

---

## 3. Educational Pedagogy: Predict-Observe-Explain (POE)

### Learning Science Rationale
- Standard architecture simulators are passive sandboxes: learners flip switches and watch lines move without forming testable mental models.
- ArchLens implements the **Predict $\rightarrow$ Observe $\rightarrow$ Explain** science-education framework:
  1. Forcing the student to commit to a structured prediction before the event reveals misconceptions.
  2. The simulation engine provides deterministic ground truth.
  3. The Socratic AI tutor only explains mathematical reality without hallucination.
