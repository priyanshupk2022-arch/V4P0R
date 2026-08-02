# VAPOR Always-On Build Rule

Read @docs/ANTIGRAVITY_BOOTSTRAP.md before planning, coding, running a provider flow, or claiming progress.

Use `$vapor-engine`, `$vapor-contracts`, and `$vapor-release-gates` for VAPOR work. Treat current repository code and old readiness documents as untrusted implementation evidence; provider contracts come only from the selected account-enabled flow and current official documentation.

For every node:

1. Load only the current-node context pack, relevant source/tests, and accepted predecessor evidence.
2. Define machine-observable positive, negative, failure, duplicate/race, and browser oracles before writing.
3. Give every subagent a focused context pack and disjoint file ownership; subagents do not inherit the parent conversation.
4. Never accept an agent narrative as proof. Require raw command output, diff, browser trace, and redacted provider evidence.
5. Return only `BLOCKED`, `FAIL`, or `READY FOR INDEPENDENT REVIEW`. Codex alone performs the final independent sandbox PASS.

Never invent provider APIs, return synthetic success, log/store payment credentials, trust caller-controlled roles, or claim production readiness/compliance without evidence.
