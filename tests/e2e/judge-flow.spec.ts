import { test, expect } from '@playwright/test';

test.describe('VAPOR Real-Time Financial Circuit Breaker & Partner Flow E2E', () => {

  test('Primary Homepage: Real-Time Financial Circuit Breaker & Offboarding', async ({ page }) => {
    // 1. Open primary homepage
    await page.goto('/');

    // 2. Verify VAPOR brand, tagline, and navigation
    await expect(page.getByText('VAPOR', { exact: true })).toBeVisible();
    await expect(page.getByText(/Real-time financial circuit breaker for employee SaaS/i)).toBeVisible();
    await expect(page.getByText(/SANDBOX CIRCUIT BREAKER/i)).toBeVisible();
    await expect(page.getByRole('link', { name: /Prava Partner Journey/i })).toBeVisible();

    // 3. Verify telemetry metric cards
    await expect(page.getByText('Prevented Financial Loss')).toBeVisible();
    await expect(page.getByText('Circuit Breaker Status')).toBeVisible();

    // 4. Test Spend-Spike Anomaly Circuit Breaker Trip
    const tripBtn = page.getByRole('button', { name: /Trip Circuit Breaker/i });
    await expect(tripBtn).toBeVisible();
    await tripBtn.click();

    // 5. Verify Deterministic Policy Block & Prevented Loss Explanation
    await expect(page.getByText('DETERMINISTIC EVALUATION RESULT')).toBeVisible({ timeout: 5000 });
    await expect(page.getByText(/DECISION: BLOCKED/i)).toBeVisible();
    await expect(page.getByText(/CIRCUIT BREAKER TRIPPED — PREVENTED FINANCIAL LOSS/i)).toBeVisible();

    // 6. Test Navigation Tabs (Inventory & Employee Offboarding)
    const inventoryTab = page.getByRole('button', { name: /Subscription & Mandate Inventory/i });
    await inventoryTab.click();
    await expect(page.getByRole('cell', { name: 'AWS Cloud Engine' })).toBeVisible();
    await expect(page.getByText('Alex Vance (Designer)')).toBeVisible();

    const offboardingTab = page.getByRole('button', { name: /Employee Offboarding Protocol/i });
    await offboardingTab.click();
    await expect(page.getByText('Target Employee: Alex Vance')).toBeVisible();

    const revokeBtn = page.getByRole('button', { name: /Deauthorize & Revoke All Mandates/i });
    await revokeBtn.click();
    await expect(page.getByText(/Revocation Confirmed: Prevented \$570\.00\/mo ghost SaaS loss/i)).toBeVisible();

    // 7. Verify Redacted Audit Timeline
    await expect(page.getByText('Durable Redacted Audit Timeline')).toBeVisible();
    await expect(page.getByText(/EMPLOYEE_OFFBOARDED/i)).toBeVisible();
  });

  test('Dedicated Prava Partner Journey (/demo/prava): Virtual Card & Merchant Checkout Proof', async ({ page }) => {
    // Enable E2E UI navigation mode
    await page.addInitScript(() => {
      (window as any).__E2E_MOCK_PASSKEY__ = true;
    });

    // 1. Open dedicated Prava partner flow
    await page.goto('/demo/prava');

    // 2. Verify header titles and environment status badges
    await expect(page.getByRole('heading', { name: 'VAPOR' })).toBeVisible();
    await expect(page.getByText('SANDBOX PROVIDER PROOF REQUIRED')).toBeVisible();

    // 3. Click "Execute Purchase Request Journey" button
    const executeBtn = page.getByRole('button', { name: /Execute Purchase Request Journey/i });
    await expect(executeBtn).toBeVisible();
    await executeBtn.click();

    // 4. Verify Senso AI evidence card populates
    await expect(page.getByText('Senso AI Evidence Grounding')).toBeVisible();
    await expect(page.locator('p').filter({ hasText: /Grounding doc retrieved/i })).toBeVisible({ timeout: 5000 });

    // 5. Verify Deterministic Spend Policy Engine decision
    await expect(page.getByText('Deterministic Spend Policy Engine')).toBeVisible();
    await expect(page.getByText('DECISION: APPROVED', { exact: true })).toBeVisible({ timeout: 5000 });

    // 6. Verify Prava Virtual Card Issuance
    await expect(page.getByText('Prava Single-Use Virtual Credential')).toBeVisible();
    await expect(page.getByText('Credential isolated from VAPOR UI')).toBeVisible({ timeout: 5000 });

    // 7. Verify Playwright Merchant Checkout Automation & Expected Sandbox Decline
    await expect(page.getByText('Playwright Merchant Checkout Automation')).toBeVisible();
    await expect(page.getByText(/Sandbox Checkout Attempted/i)).toBeVisible({ timeout: 8000 });

    // 8. Verify Immutable Audit Trail
    await expect(page.getByText('Immutable Audit Trail & Ledger')).toBeVisible();
    await expect(page.getByText(/PRAVA_STATUS_REPORTED/i)).toBeVisible({ timeout: 8000 });
  });

  test('Prava Partner Journey: Linq iMessage approval for high-value scenario', async ({ page }) => {
    await page.addInitScript(() => {
      (window as any).__E2E_MOCK_PASSKEY__ = true;
    });
    await page.goto('/demo/prava');

    // Select Scenario 2 ($4,999.00 USD - High Value)
    await page.getByText(/High-Value SaaS/i).click();

    // Click Execute
    const executeBtn = page.getByRole('button', { name: /Execute Purchase Request Journey/i });
    await executeBtn.click();

    // Verify Linq Approval Required
    await expect(page.getByText('DECISION: REQUIRES_LINQ_APPROVAL', { exact: true })).toBeVisible({ timeout: 5000 });
    await expect(page.getByText(/Linq iMessage Native Approval/i)).toBeVisible();

    // Click 👍 Tapback Approval button
    const approveBtn = page.getByRole('button', { name: /Approve purchase via Linq/i });
    await expect(approveBtn).toBeVisible();
    await approveBtn.click();

    // Verify Prava Card Issued & Checkout Complete
    await expect(page.getByText('Credential isolated from VAPOR UI')).toBeVisible({ timeout: 8000 });
    await expect(page.getByText(/Sandbox Checkout Attempted/i)).toBeVisible({ timeout: 8000 });
  });

});
