// @ts-check
const { test, expect } = require('@playwright/test');
const AxeBuilder = require('@axe-core/playwright').default;

test.describe('Accessibility', () => { 
  test('dashboard should not have any automatically detectable accessibility issues', async ({ page }) => {
    await page.goto('/');
    
    // Allow some time for content to load
    // Using networkidle might be flaky if there's polling, so verify a key element is present
    // Wait for either welcome message, error message, or just body
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000); // Give it a sec specifically for animations/loaders

    const accessibilityScanResults = await new AxeBuilder({ page })
        // .exclude('selector-to-ignore') // Use if specific third-party widgets fail
        .analyze();
    
    // Attach violations to test report if any
    if (accessibilityScanResults.violations.length > 0) {
        console.log('Accessibility Violations:', JSON.stringify(accessibilityScanResults.violations, null, 2));
    }

    expect(accessibilityScanResults.violations).toEqual([]);
  });
});
