import { test, expect } from '@playwright/test';

test.describe('Story 2 — Register visit and watch queue re-prioritize', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="queue-list"]', { timeout: 5000 });
  });

  test('registers a visit and queue reorders', async ({ page }) => {
    const cards = page.locator('[data-testid="family-card"]');
    await cards.first().waitFor({ timeout: 5000 });

    const firstFamilyId = await cards.first().getAttribute('data-family-id');
    const secondFamilyId = await cards.nth(1).getAttribute('data-family-id');

    await cards.first().click();

    await page.goto(`/family/${firstFamilyId}`);
    await page.waitForSelector('[data-testid="visit-form"]', { timeout: 5000 });

    const today = new Date().toISOString().slice(0, 10);
    await page.fill('[data-testid="visit-date"]', today);
    await page.fill('[data-testid="visit-notes"]', 'Visita registrada pelo teste automatizado');
    await page.click('[data-testid="submit-visit"]');

    await page.goto('/');
    await page.waitForSelector('[data-testid="family-card"]', { timeout: 5000 });

    const newFirstId = await page.locator('[data-testid="family-card"]').first().getAttribute('data-family-id');
    expect(newFirstId).toBe(secondFamilyId);
  });

  test('registered visit appears in family history', async ({ page }) => {
    const cards = page.locator('[data-testid="family-card"]');
    const firstFamilyId = await cards.first().getAttribute('data-family-id');

    await page.goto(`/family/${firstFamilyId}`);
    await page.waitForSelector('[data-testid="visit-form"]', { timeout: 5000 });

    const today = new Date().toISOString().slice(0, 10);
    await page.fill('[data-testid="visit-date"]', today);
    await page.fill('[data-testid="visit-notes"]', 'Nota de teste');
    await page.click('[data-testid="submit-visit"]');

    await page.waitForSelector('[data-testid="visit-history-item"]', { timeout: 5000 });
    const historyItems = page.locator('[data-testid="visit-history-item"]');
    expect(await historyItems.count()).toBeGreaterThan(0);
  });

  test('undo restores queue order', async ({ page }) => {
    const cards = page.locator('[data-testid="family-card"]');
    const firstFamilyId = await cards.first().getAttribute('data-family-id');

    await page.goto(`/family/${firstFamilyId}`);
    await page.waitForSelector('[data-testid="visit-form"]', { timeout: 5000 });

    const today = new Date().toISOString().slice(0, 10);
    await page.fill('[data-testid="visit-date"]', today);
    await page.click('[data-testid="submit-visit"]');

    await page.waitForSelector('[data-testid="undo-visit"]', { timeout: 5000 });
    await page.click('[data-testid="undo-visit"]');

    await page.goto('/');
    await page.waitForSelector('[data-testid="family-card"]', { timeout: 5000 });
    const restoredFirstId = await page.locator('[data-testid="family-card"]').first().getAttribute('data-family-id');
    expect(restoredFirstId).toBe(firstFamilyId);
  });

  test('future date shows pt-BR validation error and blocks submission', async ({ page }) => {
    const cards = page.locator('[data-testid="family-card"]');
    const firstFamilyId = await cards.first().getAttribute('data-family-id');

    await page.goto(`/family/${firstFamilyId}`);
    await page.waitForSelector('[data-testid="visit-form"]', { timeout: 5000 });

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const futureDate = tomorrow.toISOString().slice(0, 10);

    await page.fill('[data-testid="visit-date"]', futureDate);
    await page.click('[data-testid="submit-visit"]');

    await expect(page.locator('[data-testid="date-error"]')).toBeVisible();
    await expect(page.locator('[data-testid="date-error"]')).toContainText('futuro');
  });

  test('queue re-renders within 3000ms after visit submission', async ({ page }) => {
    const cards = page.locator('[data-testid="family-card"]');
    const firstFamilyId = await cards.first().getAttribute('data-family-id');

    await page.goto(`/family/${firstFamilyId}`);
    await page.waitForSelector('[data-testid="visit-form"]', { timeout: 5000 });

    const today = new Date().toISOString().slice(0, 10);
    await page.fill('[data-testid="visit-date"]', today);

    const start = Date.now();
    await page.click('[data-testid="submit-visit"]');
    await page.waitForSelector('[data-testid="visit-history-item"]', { timeout: 3000 });
    const elapsed = Date.now() - start;

    expect(elapsed).toBeLessThan(3000);
  });
});
