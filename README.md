# ⚡ VAPOR — Message-Native Agentic Procurement & Spend Governance

VAPOR is a message-native procurement and spend-governance product for startups and small finance teams.
Employees request purchases through iMessage (via Linq), Senso RAG supplies verified vendor trust evidence, finance managers approve via native iMessage **👍 (Thumbs Up)** Tapbacks, and Prava completes the controlled sandbox checkout flow.

---

## 🚀 Quickstart

### Prerequisites
* Node.js v18+
* npm v9+

### Installation & Test Suite
```bash
# Install dependencies
npm ci

# Run TypeScript strict compilation check
npx tsc --noEmit

# Run full Vitest test suite (66 tests)
npm test

# Run Next.js production build
npm run build
```

---

## 🏛️ Architecture & Governance
* **Primary Request/Approval Surface:** iMessage powered by Linq Webhook Router with native 👍/👎 Tapback mapping.
* **Vendor Trust RAG:** Senso Knowledge-Base Search for policy & vendor verification.
* **Checkout Engine:** Prava Session Creation & Payment Status Reporting.
* **Audit & Evidence Surface:** Next.js 15 Web Dashboard with immutable double-entry ledger timeline.

For full baseline documentation and hackathon roadmap, see:
* [plans/00-master-roadmap.md](file:///c:/Users/priya/OneDrive/Documents/vapor/plans/00-master-roadmap.md)
* [docs/CURRENT_STATE.md](file:///c:/Users/priya/OneDrive/Documents/vapor/docs/CURRENT_STATE.md)
* [docs/HACKATHON_SCOPE.md](file:///c:/Users/priya/OneDrive/Documents/vapor/docs/HACKATHON_SCOPE.md)
* [docs/PREEXISTING_DISCLOSURE.md](file:///c:/Users/priya/OneDrive/Documents/vapor/docs/PREEXISTING_DISCLOSURE.md)
* [PRODUCTION_READINESS.md](file:///c:/Users/priya/OneDrive/Documents/vapor/PRODUCTION_READINESS.md)
