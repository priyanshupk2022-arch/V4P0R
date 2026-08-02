# VAPOR Context Pack Schema

For each node, compile this small transient packet:

```markdown
# Node <ID>: <name>

## Goal and observable result
## Accepted predecessor evidence
## Authoritative contracts and exact versions
## Relevant files and dependency edges
## Current failing outputs
## File ownership and forbidden paths
## Positive, negative, race, failure and browser oracles
## Required commands
## Risks, unknowns and stop conditions
## Evidence manifest destination
```

Persistent memory belongs in:

- `docs/ENGINE_STATE.md`: current node, gate status, blockers, last verified commit, remaining time.
- `docs/PROJECT_MAP.md`: components, owners, important files, dependency and data-flow edges.
- `docs/EVIDENCE/NODE-<id>.md`: immutable node evidence and reviewer decision.

Do not store conversational summaries, guesses, secrets, payment credentials, or huge raw logs in memory. Link to bounded artifacts and record hashes/paths when useful.
