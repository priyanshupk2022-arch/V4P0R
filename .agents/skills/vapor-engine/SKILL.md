---
name: vapor-engine
description: Orchestrate VAPOR as an evidence-gated multi-agent build graph with research, focused context compilation, isolated implementation, test oracles, independent verification, commits, CI, impact analysis, and memory updates. Use for executing any VAPOR roadmap node or the time-boxed hackathon build.
---

# VAPOR Engine

## Load order

1. Read `plans/04-vapor-engine-workflow.md` and `docs/ENGINE_STATE.md` if present.
2. Read only the current node from `plans/01-hackathon-critical-path.md`.
3. Read `vapor-contracts` for provider work and `vapor-release-gates` for every node.
4. Build a focused context pack from relevant source, tests, dependency edges, current failures, and accepted predecessor evidence. Keep it below roughly 2,000 lines.

## Execute one current node

1. **Research:** verify unstable external contracts and inspect current code. Record sources and conflicts.
2. **Plan:** define file ownership, dependencies, acceptance oracles, commands, and cut/rollback path.
3. **Parallelize safely:** use isolated worktrees and disjoint write scopes. Never let agents concurrently own migrations, auth, package lock, or the same state machine.
4. **Implement:** use Gemini 3.6 Flash as the fast executor. The parent orchestrates and integrates; it does not accept child completion claims without artifacts.
5. **Verify internally:** run focused tests, security checks, static analysis, and browser tests through separate agents.
6. **Independent review:** use a fresh-context verifier. On FAIL, diagnose from raw evidence, research only the failed area, fix, and reverify.
7. **Evidence:** write `docs/EVIDENCE/NODE-<id>.md` with commit, sources, changed files, commands/exit codes, safe provider/browser evidence, risks, and reviewer decision.
8. **Commit and CI:** allow clearly labeled local checkpoint commits for isolated worktree integration after focused checks. Create the final node/release commit only after independent PASS. Push/PR/deploy only with explicit authorization.
9. **Impact and memory:** update `docs/ENGINE_STATE.md`, `docs/PROJECT_MAP.md`, dependency/contract changes, and next unlocked node.

## Time-boxed build mode

When the user asks for the full hackathon build, the parent orchestrator must run the current-node loop automatically through bootstrap, contract feasibility, parallel implementation, integration, and internal verification. After each internally accepted node, update memory and unlock the next node without asking the user for another prompt. Pause only for an external blocker, a required authority/credential, or a material product choice not covered by the bootstrap packet. End only at `READY FOR INDEPENDENT REVIEW` or `BLOCKED`.

## Handoff sequence

Antigravity may finish with `READY FOR INDEPENDENT REVIEW`, never final PASS. Then:

1. Codex independently audits and fixes the integrated sandbox build.
2. Re-run full release gates and the Prava sandbox golden flow.
3. Request Prava production access.
4. When access arrives, configure separate production secrets and run a bounded smoke test.
5. Record demo and submit.

## Failure rules

- On a transient error, retry within an explicit limit.
- On a deterministic error, change the hypothesis or implementation; do not repeat blindly.
- On a contract conflict, stop only the affected branch and notify the orchestrator.
- On time pressure, cut breadth according to the workflow plan; never cut real Prava proof, independent verification, demo recording, or submission buffer.

Read `references/context-pack.md` when creating or refreshing memory/context artifacts.
