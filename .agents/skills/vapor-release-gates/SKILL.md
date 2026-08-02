---
name: vapor-release-gates
description: Enforces test suites, security checks, financial invariants, and the strict no-fake-success rule for all VAPOR code changes before merging or submitting.
---

# VAPOR Release Gates & Invariants Checklist

## 1. Frozen Invariants (Non-Negotiable)

1. **No Fake Success:** Offline fallbacks must be explicitly labeled and excluded from live proof manifests.
2. **No Undocumented Endpoints:** Use only public documented provider contracts.
3. **No Header-Controlled Auth:** User identity, organization, and role must be server-verified.
4. **No Secrets / PAN in Logs or Code:** Never log auth tokens, secrets, or full card data.
5. **No Integer Float Loss:** Money must use integer minor units (`BigInt` cents) exclusively.
6. **No Single-Entry Ledger:** Every transaction requires balanced `DEBIT == CREDIT` entries.

## 2. Release Gate Verification Commands

Run the full battery of release verification commands before claiming node completion:

```bash
# 1. Typecheck
npx tsc --noEmit

# 2. Unit & Integration Tests
npm test

# 3. Next.js Production Build
npm run build

# 4. Security & Dependency Audit
npm audit --omit=dev
```
