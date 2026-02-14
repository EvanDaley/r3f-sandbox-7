import { expect, test } from '@playwright/test';

test('rpg scene boots and player can move', async ({ page }) => {
  await page.goto('/');

  await page.waitForFunction(() => {
    return typeof (window as Window & { __RPG_SMOKE_TEST__?: unknown }).__RPG_SMOKE_TEST__ !== 'undefined';
  });

  const before = await page.evaluate(() => {
    const harness = (window as Window & {
      __RPG_SMOKE_TEST__?: { getPlayerPosition?: () => { x: number; y: number; z: number } | null };
    }).__RPG_SMOKE_TEST__;
    return harness?.getPlayerPosition?.() ?? null;
  });

  expect(before).not.toBeNull();

  await page.keyboard.down('KeyW');
  await page.waitForTimeout(1200);
  await page.keyboard.up('KeyW');

  const after = await page.evaluate(() => {
    const harness = (window as Window & {
      __RPG_SMOKE_TEST__?: { getPlayerPosition?: () => { x: number; y: number; z: number } | null };
    }).__RPG_SMOKE_TEST__;
    return harness?.getPlayerPosition?.() ?? null;
  });

  expect(after).not.toBeNull();

  const movedDistance = Math.hypot(after!.x - before!.x, after!.z - before!.z);
  expect(movedDistance).toBeGreaterThan(0.1);
});
