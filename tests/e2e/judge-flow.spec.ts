import { test, expect } from '@playwright/test';

test.describe('VAPOR Real-Time Financial Circuit Breaker & Partner Flow E2E', () => {

  test('Primary Homepage: Real-Time Financial Circuit Breaker & Offboarding', async ({ page }) => {
    // 1. Open primary homepage
    await page.goto('/');

    // 2. Verify VAPOR brand and navigation
    await expect(page.getByText('VAPOR', { exact: true }).first()).toBeVisible();
    await expect(page.getByRole('link', { name: /Incidents/i })).toBeVisible();

    // 3. Verify telemetry metric cards and exposure metrics
    await expect(page.getByText('Protected Spend This Month')).toBeVisible();

    // 4. Test Navigation to Incidents Queue
    await page.goto('/incidents');
    await expect(page.getByText('Incident Queue')).toBeVisible();

    // 5. Test Navigation to Spend Inventory
    await page.goto('/spend');
    await expect(page.getByText('Subscriptions')).toBeVisible();

    // 6. Test Navigation to Audit Timeline
    await page.goto('/audit');
    await expect(page.getByText('Audit Timeline')).toBeVisible();
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
