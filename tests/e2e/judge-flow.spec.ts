import { test, expect } from '@playwright/test';

test.describe('VAPOR Judge Golden Path E2E Flow', () => {
  test('should render judge UI, execute purchase scenario, and display Senso, Policy, Prava card & Redacted Audit', async ({ page }) => {
    // 1. Open VAPOR judge dashboard
    await page.goto('/');

    // 2. Verify header titles and environment status badges
    await expect(page.getByRole('heading', { name: 'VAPOR' })).toBeVisible();
    await expect(page.getByText('SANDBOX PROVIDER PROOF REQUIRED')).toBeVisible();

    // 3. Click "Execute Purchase Request Journey" button
    const executeBtn = page.getByRole('button', { name: /Execute Purchase Request Journey/i });
    await expect(executeBtn).toBeVisible();
    await executeBtn.click();

    // 4. Verify Senso AI evidence card populates
    await expect(page.getByText('Senso AI Evidence Grounding')).toBeVisible();
    await expect(page.getByText(/Grounding doc retrieved/i)).toBeVisible({ timeout: 5000 });

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

  test('should trigger Linq iMessage approval for high-value scenario', async ({ page }) => {
    await page.goto('/');

    // Select Scenario 2 ($4,999.00 USD - High Value)
    await page.getByText(/High-Value SaaS/i).click();

    // Click Execute
    const executeBtn = page.getByRole('button', { name: /Execute Purchase Request Journey/i });
    await executeBtn.click();

    // Verify Linq Approval Required
    await expect(page.getByText('DECISION: REQUIRES_LINQ_APPROVAL', { exact: true })).toBeVisible({ timeout: 5000 });
    await expect(page.getByText(/Linq iMessage Native Approval/i)).toBeVisible();

    // Click 👍 Tapback Approval button
    const approveBtn = page.getByRole('button', { name: /Tapback Like \(Approve\)/i });
    await expect(approveBtn).toBeVisible();
    await approveBtn.click();

    // Verify Prava Card Issued & Checkout Complete
    await expect(page.getByText('Credential isolated from VAPOR UI')).toBeVisible({ timeout: 8000 });
    await expect(page.getByText(/Sandbox Checkout Attempted/i)).toBeVisible({ timeout: 8000 });
  });
});
