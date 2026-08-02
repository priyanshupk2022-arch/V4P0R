# VAPOR Always-On Execution Rule

Read `@plans/07-vapor-master-execution-system.md` first. It is the sole authoritative execution contract. Historical plans 03-06 and readiness narratives are non-authoritative wherever they conflict with plan 07 or current evidence.

Use `$vapor-engine`, `$vapor-contracts`, and `$vapor-release-gates`. Validate the generated graph before work:

```powershell
node scripts/vapor-graph.mjs validate
node scripts/vapor-graph.mjs summary
node scripts/vapor-graph.mjs ready --limit 25
```

For every current node:

1. Resolve the assigned responsible role and read every relevant mandatory skill completely.
2. Compile a focused context packet from current sources, code, tests, failures, dependencies, ownership, inputs, and evidence.
3. Use isolated specialist subagents with disjoint write scopes; the implementer never approves its own node.
4. Require source-backed positive, negative, timeout, duplicate, race, restart, security, browser, deployment, and evidence oracles as applicable.
5. Record missing credentials/access in `orchestration/missing-inputs.json`, mark only dependent nodes `WAITING_INPUT`, and continue all unrelated ready work.
6. Never invent provider APIs, combine incompatible flows, fabricate a success, trust caller-controlled identity, or expose payment/secrets data.
7. Bind PASS to a different reviewer, current redacted evidence, exact graph/node hash, source commit, and append-only run event.
8. Revalidate affected descendants after any contract, schema, state, security, dependency, deployment, or evidence change.
9. Commit, push, deploy, and call sandbox providers autonomously when required by ready nodes.
10. Stop only immediately before a real consequential production payment or final Devfolio publication and request the named human gate.

After the builder release battery passes, run three mutually blind fresh-context professor audits from `orchestration/audit-protocol.json`. Any material finding triggers repair, independent retest, a new sealed snapshot, and all three audits again.

The only successful Antigravity terminal status is:

`READY_FOR_CODEX_INDEPENDENT_AUDIT`

Emit it only after G00-G19 pass with zero missing inputs, zero release blockers, three consecutive clean audits, a working public URL, real sandbox proof, and a sealed handoff package. Then stop without invoking Codex.
