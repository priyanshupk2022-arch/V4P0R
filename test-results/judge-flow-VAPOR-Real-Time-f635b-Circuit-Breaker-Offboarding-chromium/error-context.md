# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: judge-flow.spec.ts >> VAPOR Real-Time Financial Circuit Breaker & Partner Flow E2E >> Primary Homepage: Real-Time Financial Circuit Breaker & Offboarding
- Location: tests\e2e\judge-flow.spec.ts:5:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText('Subscriptions')
Expected: visible
Error: strict mode violation: getByText('Subscriptions') resolved to 3 elements:
    1) <p>Monitor corporate cards, subscriptions, and manda…</p> aka getByText('Monitor corporate cards,')
    2) <button>subscriptions</button> aka getByRole('button', { name: 'subscriptions' })
    3) <h2>Active Subscriptions</h2> aka getByRole('heading', { name: 'Active Subscriptions' })

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByText('Subscriptions')

```

# Page snapshot

```yaml
- generic [active] [ref=f2e1]:
  - generic [ref=f2e2]:
    - complementary [ref=f2e3]:
      - generic [ref=f2e4]: VAPOR
      - navigation [ref=f2e5]:
        - link "Overview" [ref=f2e6] [cursor=pointer]:
          - /url: /
        - link "Incidents" [ref=f2e7] [cursor=pointer]:
          - /url: /incidents
        - link "Spend" [ref=f2e8] [cursor=pointer]:
          - /url: /spend
        - link "Cards" [ref=f2e9] [cursor=pointer]:
          - /url: /cards
        - link "Audit" [ref=f2e10] [cursor=pointer]:
          - /url: /audit
    - generic [ref=f2e11]:
      - banner [ref=f2e12]:
        - generic [ref=f2e13]:
          - generic [ref=f2e14]: Acme Corp
          - generic [ref=f2e15]: SANDBOX
        - generic [ref=f2e17]:
          - generic [ref=f2e18]:
            - generic [ref=f2e20]: Senso
            - generic [ref=f2e21]: LIVE
          - generic [ref=f2e22]:
            - generic [ref=f2e24]: Linq
            - generic [ref=f2e25]: LIVE
          - generic [ref=f2e26]:
            - generic [ref=f2e28]: Prava
            - generic [ref=f2e29]: SANDBOX
      - main [ref=f2e31]:
        - generic [ref=f2e32]:
          - generic [ref=f2e33]:
            - heading "Spend Inventory" [level=1] [ref=f2e34]
            - paragraph [ref=f2e35]: Monitor corporate cards, subscriptions, and mandate states.
          - generic [ref=f2e36]:
            - button "subscriptions" [ref=f2e37] [cursor=pointer]
            - button "Cloud & API" [ref=f2e38] [cursor=pointer]
            - button "employees" [ref=f2e39] [cursor=pointer]
            - button "agents" [ref=f2e40] [cursor=pointer]
          - generic [ref=f2e41]:
            - generic [ref=f2e42]:
              - heading "Active Subscriptions" [level=2] [ref=f2e43]
              - button "Offboard Employee Preview" [ref=f2e44] [cursor=pointer]
            - table [ref=f2e45]:
              - rowgroup [ref=f2e46]:
                - row [ref=f2e47]:
                  - columnheader "MERCHANT" [ref=f2e48]
                  - columnheader "OWNER" [ref=f2e49]
                  - columnheader "RENEWAL DATE" [ref=f2e50]
                  - columnheader "AMOUNT" [ref=f2e51]
                  - columnheader "EMPLOYEE STATUS" [ref=f2e52]
                  - columnheader "PERMISSION STATUS" [ref=f2e53]
              - rowgroup [ref=f2e54]:
                - row [ref=f2e55]:
                  - cell "Figma Enterprise" [ref=f2e56]
                  - cell "Alex Vance" [ref=f2e57]
                  - cell "2026-08-15" [ref=f2e58]
                  - cell "$450.00/mo" [ref=f2e59]
                  - cell "OFFBOARDED" [ref=f2e60]
                  - cell "ACTIVE" [ref=f2e62]
                - row [ref=f2e64]:
                  - cell "AWS Cloud Engine" [ref=f2e65]
                  - cell "Sarah Chen" [ref=f2e66]
                  - cell "2026-08-01" [ref=f2e67]
                  - cell "$18,450.00/mo" [ref=f2e68]
                  - cell "ACTIVE" [ref=f2e69]
                  - cell "ACTIVE" [ref=f2e71]
                - row [ref=f2e73]:
                  - cell "OpenAI API Platform" [ref=f2e74]
                  - cell "Elena Rostova" [ref=f2e75]
                  - cell "2026-08-10" [ref=f2e76]
                  - cell "$5,000.00/mo" [ref=f2e77]
                  - cell "ACTIVE" [ref=f2e78]
                  - cell "ACTIVE" [ref=f2e80]
                - row [ref=f2e82]:
                  - cell "Zoom Communications" [ref=f2e83]
                  - cell "Marcus Brody" [ref=f2e84]
                  - cell "2026-09-01" [ref=f2e85]
                  - cell "$12,000.00/yr" [ref=f2e86]
                  - cell "ACTIVE" [ref=f2e87]
                  - cell "BLOCKED" [ref=f2e89]
  - button "Open Next.js Dev Tools" [ref=f2e96] [cursor=pointer]
  - alert [ref=f2e100]
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('VAPOR Real-Time Financial Circuit Breaker & Partner Flow E2E', () => {
  4  | 
  5  |   test('Primary Homepage: Real-Time Financial Circuit Breaker & Offboarding', async ({ page }) => {
  6  |     // 1. Open primary homepage
  7  |     await page.goto('/');
  8  | 
  9  |     // 2. Verify VAPOR brand and navigation
  10 |     await expect(page.getByText('VAPOR', { exact: true }).first()).toBeVisible();
  11 |     await expect(page.getByRole('link', { name: /Incidents/i })).toBeVisible();
  12 | 
  13 |     // 3. Verify telemetry metric cards and exposure metrics
  14 |     await expect(page.getByText('Protected Spend This Month')).toBeVisible();
  15 | 
  16 |     // 4. Test Navigation to Incidents Queue
  17 |     await page.goto('/incidents');
  18 |     await expect(page.getByText('Incident Queue')).toBeVisible();
  19 | 
  20 |     // 5. Test Navigation to Spend Inventory
  21 |     await page.goto('/spend');
> 22 |     await expect(page.getByText('Subscriptions')).toBeVisible();
     |                                                   ^ Error: expect(locator).toBeVisible() failed
  23 | 
  24 |     // 6. Test Navigation to Audit Timeline
  25 |     await page.goto('/audit');
  26 |     await expect(page.getByText('Audit Timeline')).toBeVisible();
  27 |   });
  28 | 
  29 |   test('Dedicated Prava Partner Journey (/demo/prava): Virtual Card & Merchant Checkout Proof', async ({ page }) => {
  30 |     // Enable E2E UI navigation mode
  31 |     await page.addInitScript(() => {
  32 |       (window as any).__E2E_MOCK_PASSKEY__ = true;
  33 |     });
  34 | 
  35 |     // 1. Open dedicated Prava partner flow
  36 |     await page.goto('/demo/prava');
  37 | 
  38 |     // 2. Verify header titles and environment status badges
  39 |     await expect(page.getByRole('heading', { name: 'VAPOR' })).toBeVisible();
  40 |     await expect(page.getByText('SANDBOX PROVIDER PROOF REQUIRED')).toBeVisible();
  41 | 
  42 |     // 3. Click "Execute Purchase Request Journey" button
  43 |     const executeBtn = page.getByRole('button', { name: /Execute Purchase Request Journey/i });
  44 |     await expect(executeBtn).toBeVisible();
  45 |     await executeBtn.click();
  46 | 
  47 |     // 4. Verify Senso AI evidence card populates
  48 |     await expect(page.getByText('Senso AI Evidence Grounding')).toBeVisible();
  49 |     await expect(page.locator('p').filter({ hasText: /Grounding doc retrieved/i })).toBeVisible({ timeout: 5000 });
  50 | 
  51 |     // 5. Verify Deterministic Spend Policy Engine decision
  52 |     await expect(page.getByText('Deterministic Spend Policy Engine')).toBeVisible();
  53 |     await expect(page.getByText('DECISION: APPROVED', { exact: true })).toBeVisible({ timeout: 5000 });
  54 | 
  55 |     // 6. Verify Prava Virtual Card Issuance
  56 |     await expect(page.getByText('Prava Single-Use Virtual Credential')).toBeVisible();
  57 |     await expect(page.getByText('Credential isolated from VAPOR UI')).toBeVisible({ timeout: 5000 });
  58 | 
  59 |     // 7. Verify Playwright Merchant Checkout Automation & Expected Sandbox Decline
  60 |     await expect(page.getByText('Playwright Merchant Checkout Automation')).toBeVisible();
  61 |     await expect(page.getByText(/Sandbox Checkout Attempted/i)).toBeVisible({ timeout: 8000 });
  62 | 
  63 |     // 8. Verify Immutable Audit Trail
  64 |     await expect(page.getByText('Immutable Audit Trail & Ledger')).toBeVisible();
  65 |     await expect(page.getByText(/PRAVA_STATUS_REPORTED/i)).toBeVisible({ timeout: 8000 });
  66 |   });
  67 | 
  68 |   test('Prava Partner Journey: Linq iMessage approval for high-value scenario', async ({ page }) => {
  69 |     await page.addInitScript(() => {
  70 |       (window as any).__E2E_MOCK_PASSKEY__ = true;
  71 |     });
  72 |     await page.goto('/demo/prava');
  73 | 
  74 |     // Select Scenario 2 ($4,999.00 USD - High Value)
  75 |     await page.getByText(/High-Value SaaS/i).click();
  76 | 
  77 |     // Click Execute
  78 |     const executeBtn = page.getByRole('button', { name: /Execute Purchase Request Journey/i });
  79 |     await executeBtn.click();
  80 | 
  81 |     // Verify Linq Approval Required
  82 |     await expect(page.getByText('DECISION: REQUIRES_LINQ_APPROVAL', { exact: true })).toBeVisible({ timeout: 5000 });
  83 |     await expect(page.getByText(/Linq iMessage Native Approval/i)).toBeVisible();
  84 | 
  85 |     // Click 👍 Tapback Approval button
  86 |     const approveBtn = page.getByRole('button', { name: /Approve purchase via Linq/i });
  87 |     await expect(approveBtn).toBeVisible();
  88 |     await approveBtn.click();
  89 | 
  90 |     // Verify Prava Card Issued & Checkout Complete
  91 |     await expect(page.getByText('Credential isolated from VAPOR UI')).toBeVisible({ timeout: 8000 });
  92 |     await expect(page.getByText(/Sandbox Checkout Attempted/i)).toBeVisible({ timeout: 8000 });
  93 |   });
  94 | 
  95 | });
  96 | 
```