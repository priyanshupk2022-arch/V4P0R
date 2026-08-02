# VAPOR Antigravity Bootstrap Packet

## Mission and why

Build a judge-ready, message-native procurement agent for the Agentic Commerce Hackathon within the available time. The value proposition is controlled autonomous purchasing for startup/SMB finance teams:

`employee request -> Senso evidence -> deterministic policy -> Linq human approval -> Prava one-time payment credential -> merchant checkout attempt -> redacted audit result`

The objective is a truthful, repeatable end-to-end sandbox demo. The post-sandbox sequence is:

`Codex independent verification/fixes -> Prava production request -> bounded production smoke test -> demo recording -> submission`

## Absolute product proof

The hackathon-team requirement supplied by the user is authoritative:

1. AI agent discovers or decides on one product.
2. Prava session/mandate approves that exact purchase.
3. A one-time card is issued after approval.
4. Browser automation attempts the checkout at the end merchant.
5. The merchant declines the sandbox/test card for insufficient funds; this expected decline is successful sandbox proof.

Do not call session/intent creation a completed order. Do not treat the expected merchant decline as an application success or hide it.

## Contract selection rule

Read `$vapor-contracts` before any provider implementation. First verify which Prava contract the current account/SDK supports:

- SDK intent/mandate path: card selection/enrollment -> `registerIntent()` -> Passkey -> `invokeIntent()` -> one-time credential -> merchant checkout; or
- session path: only if the account-specific documentation exposes it.

Select one path, record it in `docs/EVIDENCE/CONTRACT_MANIFEST.md`, and never mix endpoint/header/response assumptions from both paths.

## Current repository truth

Baseline commit: `af31250`. Existing code is a partial scaffold, not trusted production evidence.

- `src/adapters/prava/createCard.ts` and `lockCard.ts` use unsupported/fake fallback behavior.
- `src/adapters/prava/createSession.ts` uses stale response assumptions and fabricated fallback behavior.
- `src/app/api/checkout/session/route.ts` and `src/app/api/reconciliation/route.ts` currently return synthetic/static paths.
- `src/app/api/webhook/linq/route.ts` uses an invented/optional webhook contract and lacks real Tapback ownership checks.
- `services/vapor-ai-python/main.py` uses incorrect Senso behavior and fabricated verified outputs.
- `src/infrastructure/auth/authMiddleware.ts` trusts caller headers and invalid bearer-token logic.
- `src/infrastructure/database/supabaseClient.ts` has non-atomic financial writes and success-on-failure fallback.
- `migrations/001_initial_schema.sql` and `migrations/002_sandbox_pilot_schema.sql` conflict; RLS is enabled without explicit policies.
- There is no judge-facing page, browser E2E suite, CI, coverage gate, or trustworthy deployment evidence yet.
- Credential-like values and test payment data require removal/rotation. Never repeat their values in reports.

`README.md`, `PRODUCTION_READINESS.md`, and the prior N0 manifest contain claims that need evidence correction. Do not use them as proof.

## Technology map

| Area | Location | Current status |
|---|---|---|
| Next.js API and future UI | `src/app/` | API scaffold only; UI absent |
| Domain policy/state | `src/domain/` | Useful partial logic; verify against new flow |
| Provider adapters | `src/adapters/` | Replace contract-incompatible behavior |
| Auth/database | `src/infrastructure/` | Unsafe/incomplete; owner is trust-data workstream |
| SQL | `migrations/` | Reconcile before applying remotely |
| Tests | `tests/` | 66 tests; passing is not integration proof |
| Extra Rust/Go/Python services | `services/` | Non-critical unless a real demo flow requires one |
| Plans/skills | `plans/`, `.agents/skills/` | Source of execution workflow |

## Required behavior boundaries

- Use integer minor units plus ISO currency in durable business state.
- Verify identity; derive tenant/role from membership, never request headers.
- Make approval/provider operations idempotent, durable and fail closed.
- AI can summarize evidence but cannot be the final financial approver.
- Never persist, log, screenshot, trace, return, commit, or prompt with PAN/CVV/payment token/API key/Passkey data.
- All golden-path provider behavior must be live sandbox/production behavior; demo fixtures are only clearly labeled fallback UI.
- Do not begin production access/request until Codex independently signs the sandbox result.

## Execution graph and source files

Read these in order:

1. `plans/04-vapor-engine-workflow.md` — orchestration graph, timebox and workstream ownership.
2. `plans/00-master-roadmap.md` — product/judging contract and frozen invariants.
3. Current node only from `plans/01-hackathon-critical-path.md`.
4. `$vapor-contracts` — provider truth.
5. `$vapor-release-gates` — completion tests.
6. `docs/ENGINE_STATE.md` and `docs/PROJECT_MAP.md` — current memory.

## Required artifacts

Create/update only with real evidence:

- `docs/EVIDENCE/CONTRACT_MANIFEST.md`
- `docs/EVIDENCE/NODE-<id>.md`
- `docs/ENGINE_STATE.md`
- `docs/PROJECT_MAP.md`
- browser trace/video and redacted screenshots

## Completion protocol

Parent orchestrator owns the integrated repository. Subagents receive only a focused context pack and return artifacts. The parent runs test oracles. A fresh-context internal verifier may return `READY FOR INDEPENDENT REVIEW` only when all sandbox nodes, raw command outputs, browser E2E, redacted Prava proof, and release gates exist.

That status is a handoff to Codex, not a final approval. Codex independently tests and fixes. Only after Codex sandbox PASS may the team request production access.
