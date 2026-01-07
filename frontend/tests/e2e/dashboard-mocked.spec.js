// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('Dashboard (Mocked)', () => {
  test('should load dashboard with mocked data', async ({ page }) => {
    // Mock the crops API
    // Matches http://localhost:5001/api/crops or similar
    await page.route('**/api/crops*', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          { id: 1, name: 'Wheat', category: 'Cereals', current_price: 2000, unit: 'Qtl', price_change_24h: 5 }
        ]),
      });
    });
    
    // Mock weather/others to avoid other errors impacting the main view if they are critical
    await page.route('**/api/weather*', async route => {
        await route.fulfill({ status: 200, body: JSON.stringify({}) });
    });

    await page.goto('/');
    
    // Debugging: Check for error message
    const errorMsg = page.locator('div.flex.flex-col h2:text("System Error") + p');
    if (await errorMsg.isVisible()) {
        console.log('Error displayed on Dashboard:', await errorMsg.textContent());
    }

    // Should NOT show System Error
    await expect(page.getByText('System Error')).not.toBeVisible();
    
    // Should show "Welcome Back"
    await expect(page.getByRole('heading', { name: /Welcome Back/i })).toBeVisible();
    
    // Should show the mock crop
    await expect(page.getByText('Wheat')).toBeVisible();
  });
});
