---
name: vapor-engine
description: Execute VAPOR's authoritative production DAG with role-based specialist subagents, mandatory relevant skills, focused context, resumable missing inputs, deterministic graph validation, evidence-gated verification, autonomous commits/deployment/sandbox calls, and three fresh professor audits. Use for any VAPOR implementation, integration, verification, deployment, audit, or release-control work.
---

# VAPOR Engine

## Load authority

1. Read `plans/07-vapor-master-execution-system.md` completely.
2. Read `orchestration/generated/vapor-graph-summary.md`, `orchestration/generated/vapor-graph-index.json`, `orchestration/state.json`, and `orchestration/missing-inputs.json`.
3. Read `vapor-contracts` for every provider, credential, webhook, or checkout node.
4. Read `vapor-release-gates` for every implementation, verification, audit, deployment, and completion decision.
5. Treat plans 03-06 and historical readiness narratives as non-authoritative when they conflict with plan 07 or current evidence.

If the generated graph is missing, run:

```powershell
node scripts/vapor-graph.mjs build
node scripts/vapor-graph.mjs validate
```

Never use `--reset-state` unless the previous run log has been preserved and the parent deliberately starts a new graph epoch.

## Select work

Run `node scripts/vapor-graph.mjs ready --limit 25`. Select all independent ready nodes that fit platform capacity and have disjoint write scopes/resource locks. Serialize migrations, identity, package lock, payment state, graph source, and shared provider contracts.

The parent orchestrator coordinates and integrates. It does not implement feature code or accept narrative completion claims.

## Compile a current-node packet

Run `node scripts/vapor-graph.mjs context <node-id>` and read `references/context-pack.md`. Add only:

- accepted predecessor evidence;
- authoritative current contracts;
- relevant source, symbols, and tests;
- exact current failures;
- assigned role and required skills;
- exact writable and forbidden paths;
- positive, negative, timeout, duplicate, race, restart, security, and browser oracles that apply;
- evidence destination and revalidation impact.

Keep focused context below roughly 2,000 relevant lines. Never include secret values, payment credentials, huge raw logs, the entire expanded registry, or builder conclusions.

## Route skills before execution

Read every skill selected by `orchestration/skill-router.json` completely before starting the node. Record a routing receipt containing skill names, resolved paths/versions, reason, conflicts, and missing capabilities.

When a capability is missing, inspect installed skills, use `find-skills` when available, search Skills.sh, security-review the candidate, and install only a vetted relevant skill. If no safe skill exists, create and validate one from official sources. Do not silently substitute a generic workflow.

## Dispatch responsible specialist subagents

Use `orchestration/roles.json`. Every subagent acts as a PhD-level principal specialist with 30+ years equivalent professional judgment, but must prove work through artifacts.

For each implementation package, use separate focused actors for:

1. contract/source research;
2. implementation and tests within one write scope;
3. reliability/oracle verification;
4. security review when auth, data, provider, payment, browser, deployment, secret, or skill supply chain is touched;
5. integration review after related packages assemble.

The implementer never approves the same node. Fresh reviewers receive the requirement, raw diff/artifacts, and oracles—not the intended answer or fix narrative.

## Execute and recover

Use the graph state machine:

`LOCKED -> READY -> RUNNING -> VERIFYING -> PASS`

On failure use `RETRYING`, `FAILED_DIAGNOSIS`, `FAIL`, or `REVALIDATE`. Change the hypothesis after deterministic failure; never repeat blindly.

If a credential, access grant, or external artifact is missing:

1. add only its name, purpose, secure destination, validation method, and dependent nodes to `orchestration/missing-inputs.json`;
2. mark dependent nodes `WAITING_INPUT`;
3. continue every unrelated ready node;
4. present one consolidated missing-input checklist;
5. validate supplied values by presence/behavior without printing them;
6. resume waiting nodes automatically.

A local network failure pauses only the affected runtime branch. Try the already-authorized deployed or browser execution plane where appropriate. Never replace required live proof with a mock.

## Verify and record

Resolve exact commands/observations in the context packet before `RUNNING`. Require current redacted evidence under `docs/EVIDENCE/`. A node may pass only through a different reviewer and a valid graph transition.

Record append-only events in the active `orchestration/runs/<run-id>.jsonl`. Keep generated registry files immutable. After accepted work:

- integrate isolated changes;
- run focused and impact tests;
- commit with a bounded message;
- push/CI/deploy when it advances an authorized graph node;
- update project map, evidence, contract decisions, and impact edges;
- move affected prior evidence to `REVALIDATE`.

Antigravity is authorized to edit, test, commit, push, deploy, and call sandbox providers. Stop only immediately before a real consequential production payment (`H_PRODUCTION_PAYMENT`) or final Devfolio publication (`H_FINAL_SUBMISSION`).

## Complete the builder graph

Continue until G00-G15 and every mandatory descendant pass. Passing compiler/tests alone is insufficient. Require the real Prava sandbox merchant-decline chain, real Linq and Senso evidence, public HTTPS browser proof, security scans, observability, backup/restore, rollback, and the complete release battery.

## Run three fresh professor audits

Read `orchestration/audit-protocol.json`. Seal one source/deployment/evidence snapshot, then run:

1. G16: architecture, data, identity, and security professor.
2. G17: providers, runtime, concurrency, and recovery professor.
3. G18: product, deployment, operations, and claims professor.

Auditors are read-only, mutually blind, fresh-context, and cannot be builders, fixers, integrators, or each other. Any release-blocking finding routes to bounded repair and independent retest, seals a new snapshot, resets the clean-pass counter, and restarts all three audits.

## Terminal language

After three consecutive clean audits and a complete G19 handoff package, emit exactly:

`READY_FOR_CODEX_INDEPENDENT_AUDIT`

Then stop. Do not invoke Codex and do not call the product bank-grade, certified, or production-payment proven without external evidence.

After the user obtains Codex PASS, G20 may resume for production access, bounded smoke, demo assets, and final submission subject to the two human gates.
