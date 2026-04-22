import { test, expect } from '@playwright/test';

const adminUser = {
  role: 'shuttle_admin',
  name: 'Shuttle Admin',
  email: 'shuttle@sliit.lk',
};

const studentUser = {
  role: 'student',
  name: 'Student User',
  email: 'student@sliit.lk',
};

const setupAuth = async (page, user) => {
  await page.addInitScript(({ token, userData }) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
  }, {
    token: 'test-token',
    userData: user,
  });
};

test('shuttle admin dashboard renders the main shuttle tabs', async ({ page }) => {
  await setupAuth(page, adminUser);

  await page.route('**/api/shuttles/buses', route => route.fulfill({ json: [] }));
  await page.route('**/api/shuttles/routes', route => route.fulfill({ json: [] }));
  await page.route('**/api/shuttles/schedules', route => route.fulfill({ json: [] }));
  await page.route('**/api/shuttles/bookings/all*', route => route.fulfill({ json: [] }));

  await page.goto('/shuttle-dashboard');

  await expect(page.getByRole('heading', { name: 'Shuttle Admin' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Fleet' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Routes' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Schedules' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Bookings' })).toBeVisible();

  await page.getByRole('button', { name: 'Routes' }).click();
  await expect(page.getByRole('heading', { name: 'Bus Routes' })).toBeVisible();

  await page.getByRole('button', { name: 'Schedules' }).click();
  await expect(page.getByRole('heading', { name: 'Schedules' })).toBeVisible();
});

test('student shuttle dashboard shows booking and schedule tabs', async ({ page }) => {
  await setupAuth(page, studentUser);

  await page.route('**/api/shuttles/schedules', route => route.fulfill({ json: [] }));
  await page.route('**/api/shuttles/my-bookings', route => route.fulfill({ json: [] }));

  await page.goto('/student-shuttle-dashboard');

  await expect(page.getByText('Find your bus, pick your seat, travel smart.')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Find a Bus' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'My Bookings' })).toBeVisible();

  await page.getByRole('button', { name: 'My Bookings' }).click();
  await expect(page.getByRole('heading', { name: 'My Bookings' })).toBeVisible();
});