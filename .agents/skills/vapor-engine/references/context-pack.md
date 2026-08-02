# VAPOR Context Pack Schema

For each node, compile this small transient packet:

```markdown
# Node <ID>: <name>

## Goal and observable result
## Graph hash, node hash and active run ID
## Accepted predecessor evidence
## Authoritative contracts and exact versions
## Relevant files and dependency edges
## Current failing outputs
## Assigned role and complete mandatory skill list
## Required inputs and safe presence-only validation
## File ownership and forbidden paths
## Positive, negative, race, failure and browser oracles
## Exact structured commands or bounded observations
## Risks, unknowns and stop conditions
## Revalidation and rollback impact
## Evidence manifest destination
```

Persistent memory belongs in:

- `docs/ENGINE_STATE.md`: current node, gate status, blockers, last verified commit, remaining time.
- `docs/PROJECT_MAP.md`: components, owners, important files, dependency and data-flow edges.
- `docs/EVIDENCE/NODE-<id>.md`: immutable node evidence and reviewer decision.
- `orchestration/state.json`: current derived execution status for the active graph hash.
- `orchestration/runs/<run-id>.jsonl`: append-only transition, actor, oracle and evidence events.
- `orchestration/missing-inputs.json`: names and safe validation metadata only, never values.

Do not store conversational summaries, guesses, secrets, payment credentials, or huge raw logs in memory. Link to bounded artifacts and record hashes/paths when useful.
