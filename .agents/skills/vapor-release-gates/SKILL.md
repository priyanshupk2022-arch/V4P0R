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
node scripts/vapor-graph.mjs validate
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

The release evidence must also prove the public HTTPS deployment, real Prava sandbox merchant checkout, live-safe Linq and Senso behavior, accessibility/responsive behavior, health/observability, backup/restore, and rollback. Local simulated browser tests are not provider or deployment proof.

## Prava production-access gate

PASS requires redacted evidence of:

1. real product/merchant decision;
2. exact Prava approval/mandate;
3. Passkey/user approval;
4. one-time card generation;
5. end-merchant checkout attempt;
6. expected sandbox test-card/insufficient-funds decline;
7. safe correlation between provider, checkout, and VAPOR audit states.

After independent Codex verification and fixes pass, prepare the production request. After access arrives, run configuration, health, and non-consequential production smoke checks; do not reuse sandbox credentials or evidence.

Stop immediately before any real consequential production purchase/payment. Require a current single-use `H_PRODUCTION_PAYMENT` receipt bound to the exact gated node, graph hash, source commit, Codex PASS, provider account, environment, operation, merchant, amount, currency, item count, maximum attempts, expiry, and named human approver. Atomically reserve and consume the approval immediately before the one authorized action; no retry is authorized. Any mismatch, expiry, material change, uncertain result, or prior consumption invalidates the approval and forbids retry.

## Public demo and Devfolio gate

Before recording or preparing submission assets, independently verify:

1. the public HTTPS product link opens in a fresh browser context without team access;
2. the deployed environment has only appropriate public configuration and no secrets/payment data in page, logs, screenshots, or traces;
3. the demo is a pitch with a human explanation and a real product flow, targeted under two minutes and never longer than three;
4. GitHub, public product URL, YouTube demo, and screenshots are present; the strongest cover image is uploaded first;
5. track selections match actual shipped integrations and evidence, including OpenAI only when the product calls the OpenAI API;
6. the final description is a concise human-authored 3–4 line explanation and challenge notes name only real observed failures and fixes;
7. all team members are added, the project is published, and Devfolio dashboard status is explicitly checked as `Submitted`.

Record this in `docs/EVIDENCE/SUBMISSION_MANIFEST.md`. A saved draft is FAIL, not submission evidence.

Demo recording, upload, screenshots, and factual submission preparation are autonomous. Stop immediately before Devfolio publication. Require a current single-use `H_FINAL_SUBMISSION` receipt bound to the exact gated node, graph hash, source commit, Codex PASS, project, public/GitHub/YouTube URLs, submission-manifest hash, expiry, and named human approver. After the approved publish action, consume the gate and independently confirm the dashboard status is `Submitted`.

## Completion language

Agents may say only:

- `WAITING_INPUT` with the exact missing name, secure destination, validation method, and dependent nodes while unrelated work continues;
- `FAIL` with failing oracle/evidence;
- `PASS` only when the independent verifier signs the node manifest.

Project-level completion additionally requires three consecutive clean fresh-context professor audits against the same sealed snapshot. Any material fix resets the audit counter and reruns all three passes.

Antigravity's only successful terminal status is `READY_FOR_CODEX_INDEPENDENT_AUDIT`. It may emit that status only after G00-G19 and their mandatory leaves pass, no pre-Codex input remains unresolved, all release evidence is current, and the handoff package is sealed. The G20-only `CODEX_INDEPENDENT_PASS` input remains intentionally pending. Antigravity must then stop without invoking Codex.

“100% complete,” “production-ready,” “bank-grade,” and compliance claims are forbidden unless their separately defined external evidence exists.
