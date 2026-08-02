---
name: vapor-release-gates
description: Enforce VAPOR's evidence-based completion gates for code, security, partner sandbox behavior, browser E2E, CI, and release claims. Use before marking a node complete, committing, requesting Prava production access, recording the demo, or submitting.
---

# VAPOR Release Gates

## Frozen invariants

1. Core provider outcomes are real sandbox/production responses; no offline or random fallback may enter the golden path.
2. Use only the selected contract recorded by `vapor-contracts`.
3. Verify identity cryptographically and derive tenant/role from durable membership.
4. Never expose secrets, PAN, CVV, payment tokens, Passkey data, or unrestricted PII in source, fixtures, logs, traces, screenshots, prompts, or artifacts.
5. Store money as integer minor units plus ISO currency internally.
6. Make provider operations, approval decisions, and state transitions durable, atomic, idempotent, and fail closed.
7. AI may explain evidence but cannot make the final consequential financial decision.
8. If a ledger is shipped, enforce atomic balanced posting and append-only corrections. Otherwise call the artifact an immutable transaction/audit timeline, not a double-entry ledger.
9. Never equate passing tests with coverage or production readiness.

## Node test oracles

Every node defines machine-observable acceptance criteria before implementation. Test:

- happy path;
- invalid input and unauthorized/cross-tenant access;
- provider/DB timeout and failure;
- duplicate, replay, race, and restart behavior;
- secret/payment-data redaction;
- current-node browser behavior when it changes UX.

The authoring agent cannot approve its own node. Use a fresh-context verifier that reads the spec, diff, raw command outputs, and artifacts.

## Full release battery

Run sequentially from a clean install/environment and record exact exit codes:

```powershell
npm ci
npm run lint
npx tsc --noEmit --incremental false
npm test
npm run test:coverage
npm run build
npm run test:e2e -- --project=chromium
npm audit --omit=dev --audit-level=high
git diff --check
```

If a required script does not exist, the release is not green. Add the smallest correct configuration in its owning node. Also run repository secret/payment-data scanning and provider-specific contract tests.

## Prava production-access gate

PASS requires redacted evidence of:

1. real product/merchant decision;
2. exact Prava approval/mandate;
3. Passkey/user approval;
4. one-time card generation;
5. end-merchant checkout attempt;
6. expected sandbox test-card/insufficient-funds decline;
7. safe correlation between provider, checkout, and VAPOR audit states.

After independent Codex verification and fixes pass, prepare the production request. After access arrives, run a bounded production smoke test; do not reuse sandbox credentials or evidence.

## Completion language

Agents may say only:

- `BLOCKED` with exact external blocker;
- `FAIL` with failing oracle/evidence;
- `READY FOR INDEPENDENT REVIEW` after self-checks;
- `PASS` only when the independent verifier signs the node manifest.

“100% complete,” “production-ready,” “bank-grade,” and compliance claims are forbidden unless their separately defined external evidence exists.
