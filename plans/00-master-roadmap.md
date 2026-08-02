# VAPOR Master Roadmap

Status: planning baseline, not an implementation or compliance claim  
Baseline commit: `af31250`  
Planning date: 2026-08-02  
Primary objective: submit a narrow, honest, complete hackathon product, then evolve it into a controlled pilot and eventually a real-money product.

## 1. Product decision

VAPOR will be presented as a **message-native agentic procurement and spend-governance product for startups and small finance teams**. iMessage is the primary request/approval experience; the web app is the audit, evidence and transaction-status surface.

The golden flow is:

1. An employee messages a purchase intent through a Linq-powered business number.
2. VAPOR checks budget and deterministic company policy.
3. Senso-derived, tenant-authorized evidence helps compare and trust merchants.
4. Low-risk requests continue according to policy; high-risk requests are sent to an approver through Linq and decided by a native 👍/👎 Tapback.
5. After approval, VAPOR starts and completes the documented Prava sandbox checkout flow.
6. VAPOR shows the merchant/payment result and persists a redacted audit trail.

This preserves the original spend-control idea while avoiding unsupported claims that VAPOR is already an issuer, card network, or bank.

## 2. Current honest baseline

| Dimension | Current estimate | Why |
|---|---:|---|
| Code/backend scaffold | 55% | Domain skeleton, routes, migrations and 66 passing tests exist. |
| Hackathon judging readiness | 35% | No complete browser flow, real provider proof, pitch evidence or usable product page. |
| Controlled sandbox pilot | 15–20% | Trust boundaries, persistence, migrations, RLS and operations are not production-safe. |
| Real-money production | 5–10% | Provider contracts, security review, incident operations and legal responsibilities are unresolved. |
| “Bank-grade” readiness | <5% | No independent ASVS/PCI/legal assessment, pen test, operational history or regulated-program approval. |

Passing tests and a successful build prove only that the present test suite and compiler pass. They do not prove coverage, financial correctness, provider interoperability, security, or compliance.
