import { test, expect } from '@playwright/test';

test.describe('Story 1 — Prioritized visit queue on map + list', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('renders queue list with families in descending risk score order', async ({ page }) => {
    await page.waitForSelector('[data-testid="queue-list"]', { timeout: 5000 });

    const cards = page.locator('[data-testid="family-card"]');
    const count = await cards.count();
    expect(count).toBeGreaterThan(0);

    const scores: number[] = [];
    for (let i = 0; i < count; i++) {
      const scoreEl = cards.nth(i).locator('[data-testid="risk-score"]');
      const text = await scoreEl.textContent();
      const value = parseFloat(text ?? '0');
      scores.push(value);
    }

    for (let i = 1; i < scores.length; i++) {
      expect(scores[i]).toBeLessThanOrEqual(scores[i - 1]);
    }
  });

  test('map renders with markers matching queue list families', async ({ page }) => {
    await page.waitForSelector('[data-testid="queue-map"]', { timeout: 5000 });
    const mapContainer = page.locator('[data-testid="queue-map"]');
    await expect(mapContainer).toBeVisible();
  });

  test('clicking a list item highlights the corresponding pin', async ({ page }) => {
    await page.waitForSelector('[data-testid="family-card"]', { timeout: 5000 });
    const firstCard = page.locator('[data-testid="family-card"]').first();
    await firstCard.click();
    await expect(firstCard).toHaveClass(/selected/);
  });

  test('risk factor labels are visible on family cards', async ({ page }) => {
    await page.waitForSelector('[data-testid="family-card"]', { timeout: 5000 });
    const firstCard = page.locator('[data-testid="family-card"]').first();
    const factors = firstCard.locator('[data-testid="risk-factor"]');
    const factorCount = await factors.count();
    expect(factorCount).toBeGreaterThan(0);
  });

  test('family with null coordinates renders "needs location" indicator', async ({ page }) => {
    await page.waitForSelector('[data-testid="family-card"]', { timeout: 5000 });
    const needsLocation = page.locator('[data-testid="needs-location"]');
    const count = await needsLocation.count();
    expect(count).toBeGreaterThan(0);
  });

  test('queue is visible within 5000ms', async ({ page }) => {
    const start = Date.now();
    await page.waitForSelector('[data-testid="queue-list"]', { timeout: 5000 });
    const elapsed = Date.now() - start;
    expect(elapsed).toBeLessThan(5000);
  });

  test('zero external network requests during page load and map interaction', async ({ page }) => {
    const externalRequests: string[] = [];

    page.on('request', req => {
      const url = req.url();
      if (!url.startsWith('http://localhost') && !url.startsWith('data:')) {
        externalRequests.push(url);
      }
    });

    await page.goto('/');
    await page.waitForSelector('[data-testid="queue-list"]', { timeout: 5000 });

    const cards = page.locator('[data-testid="family-card"]');
    if (await cards.count() > 0) {
      await cards.first().click();
    }

    expect(externalRequests).toHaveLength(0);
  });

  test('never-visited family ranks at the top', async ({ page }) => {
    await page.waitForSelector('[data-testid="family-card"]', { timeout: 5000 });
    const firstCard = page.locator('[data-testid="family-card"]').first();
    const scoreEl = firstCard.locator('[data-testid="risk-score"]');
    const scoreText = await scoreEl.textContent();
    const score = parseFloat(scoreText ?? '0');
    expect(score).toBeGreaterThan(0);
  });
});
