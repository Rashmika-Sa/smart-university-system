import { test, expect } from '@playwright/test';

test('auth login and canteen selection flow saves screenshots', async ({ page }, testInfo) => {
  await page.goto('/login');

  await expect(page.getByRole('heading', { name: /secure login/i })).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath('login-page.png'), fullPage: true });

  await page.getByPlaceholder('it12345678@my.sliit.lk').fill('canteen@sliit.lk');
  await page.getByPlaceholder('Enter your password').fill('SuperAdmin@123');
  await page.getByRole('button', { name: /initiate login/i }).click();

  await expect(page).toHaveURL(/canteen-dashboard|student-dashboard|admin-dashboard/);

  await page.goto('/canteen-selection');
  await expect(page.getByRole('heading', { name: /select your dining spot/i })).toBeVisible();
  await expect(page.getByText('Main Canteen')).toBeVisible();

  await page.screenshot({ path: testInfo.outputPath('canteen-selection-page.png'), fullPage: true });
});