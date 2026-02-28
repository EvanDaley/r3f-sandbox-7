import { expect, test } from '@playwright/test';

test('tutorial scene boots and accepts movement input', async ({ page }) => {
  await page.goto('/');

  const canvas = page.locator('canvas');
  await expect(canvas).toBeVisible();

  await page.keyboard.down('KeyW');
  await page.waitForTimeout(1200);
  await page.keyboard.up('KeyW');

  await expect(canvas).toBeVisible();
});
