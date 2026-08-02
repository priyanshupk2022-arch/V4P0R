# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: judge-flow.spec.ts >> VAPOR Real-Time Financial Circuit Breaker & Partner Flow E2E >> Dedicated Prava Partner Journey (/demo/prava): Virtual Card & Merchant Checkout Proof
- Location: tests\e2e\judge-flow.spec.ts:48:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText(/Grounding doc retrieved/i)
Expected: visible
Error: strict mode violation: getByText(/Grounding doc retrieved/i) resolved to 2 elements:
    1) <p>Grounding doc retrieved: "VAPOR Enterprise Procur…</p> aka getByText('Grounding doc retrieved: "VAPOR Enterprise Procurement Policy 2026"', { exact: true })
    2) <span>Grounding doc retrieved: "VAPOR Enterprise Procur…</span> aka getByText('Grounding doc retrieved: "VAPOR Enterprise Procurement Policy 2026" (Relevance')

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByText(/Grounding doc retrieved/i)

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e2]:
    - banner [ref=e3]:
      - generic [ref=e4]:
        - generic [ref=e5]:
          - generic [ref=e6]:
            - link [ref=e7] [cursor=pointer]:
              - /url: /
              - heading "VAPOR" [level=1] [ref=e8]
            - generic [ref=e9]: SANDBOX PROVIDER PROOF REQUIRED
          - paragraph [ref=e10]: Dedicated Prava virtual card, Senso RAG, and Linq iMessage checkout proof flow.
        - link "← Return to Circuit Breaker Homepage" [ref=e12] [cursor=pointer]:
          - /url: /
    - main [ref=e13]:
      - generic [ref=e15]:
        - generic [ref=e16]:
          - generic [ref=e17]: "1"
          - generic [ref=e18]: Scenario Select
        - generic [ref=e19]:
          - generic [ref=e20]: "2"
          - generic [ref=e21]: Senso RAG
        - generic [ref=e22]:
          - generic [ref=e23]: "3"
          - generic [ref=e24]: Spend Policy
        - generic [ref=e25]:
          - generic [ref=e26]: "4"
          - generic [ref=e27]: Linq iMessage
        - generic [ref=e28]:
          - generic [ref=e29]: "5"
          - generic [ref=e30]: Prava Card
        - generic [ref=e31]:
          - generic [ref=e32]: "6"
          - generic [ref=e33]: Checkout Automation
      - generic [ref=e34]:
        - heading "1. Select Purchase Scenario" [level=2] [ref=e35]
        - generic [ref=e36]:
          - button "Software & Cloud Tools Standard Developer Tool ($49.99) GitHub Enterprise Copilot License" [disabled] [ref=e37] [cursor=pointer]:
            - generic [ref=e38]: Software & Cloud Tools
            - heading "Standard Developer Tool ($49.99)" [level=3] [ref=e39]
            - paragraph [ref=e40]: GitHub Enterprise Copilot License
          - button "Software & Infrastructure High-Value SaaS ($4,999.00 - Linq Approval Needed) Datadog Enterprise Monitoring Tier" [disabled] [ref=e41] [cursor=pointer]:
            - generic [ref=e42]: Software & Infrastructure
            - heading "High-Value SaaS ($4,999.00 - Linq Approval Needed)" [level=3] [ref=e43]
            - paragraph [ref=e44]: Datadog Enterprise Monitoring Tier
          - button "Gambling & High Risk Policy Violating Merchant ($500.00 - Reject) Off-Policy Online Casino Credits" [disabled] [ref=e45] [cursor=pointer]:
            - generic [ref=e46]: Gambling & High Risk
            - heading "Policy Violating Merchant ($500.00 - Reject)" [level=3] [ref=e47]
            - paragraph [ref=e48]: Off-Policy Online Casino Credits
        - button "Executing Journey..." [disabled] [ref=e50]
      - generic [ref=e51]:
        - generic [ref=e52]:
          - heading "Senso AI Evidence Grounding" [level=2] [ref=e53]
          - generic [ref=e54]: "RELEVANCE: 96.4%"
        - paragraph [ref=e55]: "Grounding doc retrieved: \"VAPOR Enterprise Procurement Policy 2026\""
        - paragraph [ref=e56]: "Verified tenant policy v1.2: Category \"Software & Cloud Tools\" verified for approved spend."
      - generic [ref=e57]:
        - generic [ref=e58]:
          - heading "Immutable Audit Trail & Ledger" [level=2] [ref=e59]
          - generic [ref=e60]: 2 EVENTS
        - generic [ref=e61]:
          - generic [ref=e62]:
            - generic [ref=e63]: 12:46:11 AM
            - generic [ref=e64]: SENSO_EVIDENCE_RETRIEVED
            - generic [ref=e65]: "Grounding doc retrieved: \"VAPOR Enterprise Procurement Policy 2026\" (Relevance: 96.4%)"
          - generic [ref=e66]:
            - generic [ref=e67]: 12:46:10 AM
            - generic [ref=e68]: PURCHASE_REQUESTED
            - generic [ref=e69]: Employee initiated purchase for GitHub Enterprise Copilot License ($49.99 USD)
  - status [ref=e70]:
    - generic [ref=e75]:
      - text: Static route
      - button "Hide static indicator" [ref=e76] [cursor=pointer]
  - alert [ref=e80]
```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test';
  2   | 
  3   | test.describe('VAPOR Real-Time Financial Circuit Breaker & Partner Flow E2E', () => {
  4   | 
  5   |   test('Primary Homepage: Real-Time Financial Circuit Breaker & Offboarding', async ({ page }) => {
  6   |     // 1. Open primary homepage
  7   |     await page.goto('/');
  8   | 
  9   |     // 2. Verify VAPOR brand, tagline, and navigation
  10  |     await expect(page.getByText('VAPOR', { exact: true })).toBeVisible();
  11  |     await expect(page.getByText(/Real-time financial circuit breaker for employee SaaS/i)).toBeVisible();
  12  |     await expect(page.getByText(/SANDBOX CIRCUIT BREAKER/i)).toBeVisible();
  13  |     await expect(page.getByRole('link', { name: /Prava Partner Journey/i })).toBeVisible();
  14  | 
  15  |     // 3. Verify telemetry metric cards
  16  |     await expect(page.getByText('Prevented Financial Loss')).toBeVisible();
  17  |     await expect(page.getByText('Circuit Breaker Status')).toBeVisible();
  18  | 
  19  |     // 4. Test Spend-Spike Anomaly Circuit Breaker Trip
  20  |     const tripBtn = page.getByRole('button', { name: /Trip Circuit Breaker/i });
  21  |     await expect(tripBtn).toBeVisible();
  22  |     await tripBtn.click();
  23  | 
  24  |     // 5. Verify Deterministic Policy Block & Prevented Loss Explanation
  25  |     await expect(page.getByText('DETERMINISTIC EVALUATION RESULT')).toBeVisible({ timeout: 5000 });
  26  |     await expect(page.getByText(/DECISION: BLOCKED/i)).toBeVisible();
  27  |     await expect(page.getByText(/CIRCUIT BREAKER TRIPPED — PREVENTED FINANCIAL LOSS/i)).toBeVisible();
  28  | 
  29  |     // 6. Test Navigation Tabs (Inventory & Employee Offboarding)
  30  |     const inventoryTab = page.getByRole('button', { name: /Subscription & Mandate Inventory/i });
  31  |     await inventoryTab.click();
  32  |     await expect(page.getByRole('cell', { name: 'AWS Cloud Engine' })).toBeVisible();
  33  |     await expect(page.getByText('Alex Vance (Designer)')).toBeVisible();
  34  | 
  35  |     const offboardingTab = page.getByRole('button', { name: /Employee Offboarding Protocol/i });
  36  |     await offboardingTab.click();
  37  |     await expect(page.getByText('Target Employee: Alex Vance')).toBeVisible();
  38  | 
  39  |     const revokeBtn = page.getByRole('button', { name: /Deauthorize & Revoke All Mandates/i });
  40  |     await revokeBtn.click();
  41  |     await expect(page.getByText(/Revocation Confirmed: Prevented \$570\.00\/mo ghost SaaS loss/i)).toBeVisible();
  42  | 
  43  |     // 7. Verify Redacted Audit Timeline
  44  |     await expect(page.getByText('Durable Redacted Audit Timeline')).toBeVisible();
  45  |     await expect(page.getByText(/EMPLOYEE_OFFBOARDED/i)).toBeVisible();
  46  |   });
  47  | 
  48  |   test('Dedicated Prava Partner Journey (/demo/prava): Virtual Card & Merchant Checkout Proof', async ({ page }) => {
  49  |     // Enable E2E UI navigation mode
  50  |     await page.addInitScript(() => {
  51  |       (window as any).__E2E_MOCK_PASSKEY__ = true;
  52  |     });
  53  | 
  54  |     // 1. Open dedicated Prava partner flow
  55  |     await page.goto('/demo/prava');
  56  | 
  57  |     // 2. Verify header titles and environment status badges
  58  |     await expect(page.getByRole('heading', { name: 'VAPOR' })).toBeVisible();
  59  |     await expect(page.getByText('SANDBOX PROVIDER PROOF REQUIRED')).toBeVisible();
  60  | 
  61  |     // 3. Click "Execute Purchase Request Journey" button
  62  |     const executeBtn = page.getByRole('button', { name: /Execute Purchase Request Journey/i });
  63  |     await expect(executeBtn).toBeVisible();
  64  |     await executeBtn.click();
  65  | 
  66  |     // 4. Verify Senso AI evidence card populates
  67  |     await expect(page.getByText('Senso AI Evidence Grounding')).toBeVisible();
> 68  |     await expect(page.getByText(/Grounding doc retrieved/i)).toBeVisible({ timeout: 5000 });
      |                                                              ^ Error: expect(locator).toBeVisible() failed
  69  | 
  70  |     // 5. Verify Deterministic Spend Policy Engine decision
  71  |     await expect(page.getByText('Deterministic Spend Policy Engine')).toBeVisible();
  72  |     await expect(page.getByText('DECISION: APPROVED', { exact: true })).toBeVisible({ timeout: 5000 });
  73  | 
  74  |     // 6. Verify Prava Virtual Card Issuance
  75  |     await expect(page.getByText('Prava Single-Use Virtual Credential')).toBeVisible();
  76  |     await expect(page.getByText('Credential isolated from VAPOR UI')).toBeVisible({ timeout: 5000 });
  77  | 
  78  |     // 7. Verify Playwright Merchant Checkout Automation & Expected Sandbox Decline
  79  |     await expect(page.getByText('Playwright Merchant Checkout Automation')).toBeVisible();
  80  |     await expect(page.getByText(/Sandbox Checkout Attempted/i)).toBeVisible({ timeout: 8000 });
  81  | 
  82  |     // 8. Verify Immutable Audit Trail
  83  |     await expect(page.getByText('Immutable Audit Trail & Ledger')).toBeVisible();
  84  |     await expect(page.getByText(/PRAVA_STATUS_REPORTED/i)).toBeVisible({ timeout: 8000 });
  85  |   });
  86  | 
  87  |   test('Prava Partner Journey: Linq iMessage approval for high-value scenario', async ({ page }) => {
  88  |     await page.addInitScript(() => {
  89  |       (window as any).__E2E_MOCK_PASSKEY__ = true;
  90  |     });
  91  |     await page.goto('/demo/prava');
  92  | 
  93  |     // Select Scenario 2 ($4,999.00 USD - High Value)
  94  |     await page.getByText(/High-Value SaaS/i).click();
  95  | 
  96  |     // Click Execute
  97  |     const executeBtn = page.getByRole('button', { name: /Execute Purchase Request Journey/i });
  98  |     await executeBtn.click();
  99  | 
  100 |     // Verify Linq Approval Required
  101 |     await expect(page.getByText('DECISION: REQUIRES_LINQ_APPROVAL', { exact: true })).toBeVisible({ timeout: 5000 });
  102 |     await expect(page.getByText(/Linq iMessage Native Approval/i)).toBeVisible();
  103 | 
  104 |     // Click 👍 Tapback Approval button
  105 |     const approveBtn = page.getByRole('button', { name: /Approve purchase via Linq/i });
  106 |     await expect(approveBtn).toBeVisible();
  107 |     await approveBtn.click();
  108 | 
  109 |     // Verify Prava Card Issued & Checkout Complete
  110 |     await expect(page.getByText('Credential isolated from VAPOR UI')).toBeVisible({ timeout: 8000 });
  111 |     await expect(page.getByText(/Sandbox Checkout Attempted/i)).toBeVisible({ timeout: 8000 });
  112 |   });
  113 | 
  114 | });
  115 | 
```