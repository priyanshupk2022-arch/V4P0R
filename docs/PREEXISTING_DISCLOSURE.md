# VAPOR Pre-Existing Codebase & Hackathon Work Disclosure

Date: 2026-08-02  

## 1. Pre-Existing Foundation (Prior to Node N0)
* **Domain Engine Scaffolding:** `centsMath.ts` (BigInt integer cents parser), `stateMachine.ts` (Transaction state machine), `evaluator.ts` (Policy evaluator), `hmacValidator.ts` (HMAC & timestamp validator).
* **Initial Adapters & Routes:** Basic Prava Create Session & Lock Card adapters, Linq webhook route shell, and Supabase client wrapper.
* **Initial Test Suite:** 66 unit & integration tests covering domain logic and offline mock fallbacks.

## 2. Work Created During Hackathon (Nodes N0–N9)
* **Node N0 (Current):** Truth baseline audit, Master Roadmap & Execution Contract, feature classification, and frozen demo scenarios.
* **Node N1–N9 (Planned Execution):** Real Prava public API session lifecycle, Senso RAG merchant trust search, Linq native Tapback approval webhook router, judge-facing Next.js 15 UI, E2E Playwright tests, and submission package.
