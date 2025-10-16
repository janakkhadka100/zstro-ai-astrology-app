// __tests__/e2e/astrology-flow.spec.ts
// End-to-end tests for astrology consultation flow

import { test, expect } from '@playwright/test';

test.describe('Astrology Consultation Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the astrology page
    await page.goto('/astrology');
  });

  test('should complete full astrology consultation flow', async ({ page }) => {
    // Wait for the page to load
    await expect(page.locator('h1')).toContainText('AI Astrology');

    // Fill in birth details
    await page.fill('[data-testid="birth-date"]', '1990-01-15');
    await page.fill('[data-testid="birth-time"]', '14:30');
    await page.fill('[data-testid="birth-place"]', 'Kathmandu, Nepal');
    await page.fill('[data-testid="question"]', 'What does my chart say about my career?');

    // Select language
    await page.selectOption('[data-testid="language-select"]', 'en');

    // Submit the form
    await page.click('[data-testid="submit-button"]');

    // Wait for the AI response
    await expect(page.locator('[data-testid="ai-response"]')).toBeVisible({ timeout: 30000 });

    // Verify the response contains astrological content
    const responseText = await page.textContent('[data-testid="ai-response"]');
    expect(responseText).toContain('chart');
    expect(responseText).toContain('planets');
  });

  test('should validate form inputs', async ({ page }) => {
    // Try to submit empty form
    await page.click('[data-testid="submit-button"]');

    // Check for validation errors
    await expect(page.locator('[data-testid="birth-date-error"]')).toBeVisible();
    await expect(page.locator('[data-testid="birth-time-error"]')).toBeVisible();
    await expect(page.locator('[data-testid="birth-place-error"]')).toBeVisible();
  });

  test('should handle invalid date format', async ({ page }) => {
    await page.fill('[data-testid="birth-date"]', 'invalid-date');
    await page.fill('[data-testid="birth-time"]', '14:30');
    await page.fill('[data-testid="birth-place"]', 'Kathmandu, Nepal');

    await page.click('[data-testid="submit-button"]');

    await expect(page.locator('[data-testid="birth-date-error"]')).toBeVisible();
  });

  test('should handle invalid time format', async ({ page }) => {
    await page.fill('[data-testid="birth-date"]', '1990-01-15');
    await page.fill('[data-testid="birth-time"]', 'invalid-time');
    await page.fill('[data-testid="birth-place"]', 'Kathmandu, Nepal');

    await page.click('[data-testid="submit-button"]');

    await expect(page.locator('[data-testid="birth-time-error"]')).toBeVisible();
  });

  test('should show loading state during processing', async ({ page }) => {
    await page.fill('[data-testid="birth-date"]', '1990-01-15');
    await page.fill('[data-testid="birth-time"]', '14:30');
    await page.fill('[data-testid="birth-place"]', 'Kathmandu, Nepal');
    await page.fill('[data-testid="question"]', 'What does my chart say about my career?');

    await page.click('[data-testid="submit-button"]');

    // Check for loading state
    await expect(page.locator('[data-testid="loading-spinner"]')).toBeVisible();
    await expect(page.locator('[data-testid="submit-button"]')).toBeDisabled();
  });

  test('should display error message on API failure', async ({ page }) => {
    // Mock API failure
    await page.route('**/api/astrology', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal server error' })
      });
    });

    await page.fill('[data-testid="birth-date"]', '1990-01-15');
    await page.fill('[data-testid="birth-time"]', '14:30');
    await page.fill('[data-testid="birth-place"]', 'Kathmandu, Nepal');

    await page.click('[data-testid="submit-button"]');

    // Check for error message
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
  });

  test('should support mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Check if form is responsive
    await expect(page.locator('[data-testid="birth-form"]')).toBeVisible();

    // Fill form on mobile
    await page.fill('[data-testid="birth-date"]', '1990-01-15');
    await page.fill('[data-testid="birth-time"]', '14:30');
    await page.fill('[data-testid="birth-place"]', 'Kathmandu, Nepal');

    // Submit on mobile
    await page.click('[data-testid="submit-button"]');

    // Wait for response
    await expect(page.locator('[data-testid="ai-response"]')).toBeVisible({ timeout: 30000 });
  });

  test('should support keyboard navigation', async ({ page }) => {
    // Navigate through form using Tab key
    await page.keyboard.press('Tab'); // Focus on birth date
    await page.keyboard.type('1990-01-15');

    await page.keyboard.press('Tab'); // Focus on birth time
    await page.keyboard.type('14:30');

    await page.keyboard.press('Tab'); // Focus on birth place
    await page.keyboard.type('Kathmandu, Nepal');

    await page.keyboard.press('Tab'); // Focus on question
    await page.keyboard.type('What does my chart say about my career?');

    await page.keyboard.press('Tab'); // Focus on submit button
    await page.keyboard.press('Enter'); // Submit form

    // Wait for response
    await expect(page.locator('[data-testid="ai-response"]')).toBeVisible({ timeout: 30000 });
  });

  test('should support accessibility features', async ({ page }) => {
    // Check for proper ARIA labels
    await expect(page.locator('[data-testid="birth-date"]')).toHaveAttribute('aria-label');
    await expect(page.locator('[data-testid="birth-time"]')).toHaveAttribute('aria-label');
    await expect(page.locator('[data-testid="birth-place"]')).toHaveAttribute('aria-label');

    // Check for proper form labels
    await expect(page.locator('label[for="birth-date"]')).toBeVisible();
    await expect(page.locator('label[for="birth-time"]')).toBeVisible();
    await expect(page.locator('label[for="birth-place"]')).toBeVisible();

    // Check for proper heading structure
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('h2')).toBeVisible();
  });

  test('should handle rate limiting', async ({ page }) => {
    // Mock rate limiting response
    await page.route('**/api/astrology', route => {
      route.fulfill({
        status: 429,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Too Many Requests' })
      });
    });

    await page.fill('[data-testid="birth-date"]', '1990-01-15');
    await page.fill('[data-testid="birth-time"]', '14:30');
    await page.fill('[data-testid="birth-place"]', 'Kathmandu, Nepal');

    await page.click('[data-testid="submit-button"]');

    // Check for rate limit message
    await expect(page.locator('[data-testid="rate-limit-message"]')).toBeVisible();
  });

  test('should cache responses for repeated requests', async ({ page }) => {
    // First request
    await page.fill('[data-testid="birth-date"]', '1990-01-15');
    await page.fill('[data-testid="birth-time"]', '14:30');
    await page.fill('[data-testid="birth-place"]', 'Kathmandu, Nepal');

    await page.click('[data-testid="submit-button"]');
    await expect(page.locator('[data-testid="ai-response"]')).toBeVisible({ timeout: 30000 });

    // Clear form and submit again
    await page.fill('[data-testid="birth-date"]', '');
    await page.fill('[data-testid="birth-time"]', '');
    await page.fill('[data-testid="birth-place"]', '');

    await page.fill('[data-testid="birth-date"]', '1990-01-15');
    await page.fill('[data-testid="birth-time"]', '14:30');
    await page.fill('[data-testid="birth-place"]', 'Kathmandu, Nepal');

    await page.click('[data-testid="submit-button"]');

    // Second request should be faster due to caching
    await expect(page.locator('[data-testid="ai-response"]')).toBeVisible({ timeout: 5000 });
  });
});

test.describe('Chart Visualization', () => {
  test('should display chart toggle options', async ({ page }) => {
    await page.goto('/astrology');

    // Check for chart style toggle
    await expect(page.locator('[data-testid="chart-style-toggle"]')).toBeVisible();
    await expect(page.locator('[data-testid="north-indian-chart"]')).toBeVisible();
    await expect(page.locator('[data-testid="south-indian-chart"]')).toBeVisible();
  });

  test('should switch between chart styles', async ({ page }) => {
    await page.goto('/astrology');

    // Click on South Indian chart style
    await page.click('[data-testid="south-indian-chart"]');

    // Verify the selection
    await expect(page.locator('[data-testid="south-indian-chart"]')).toHaveClass(/selected/);

    // Switch back to North Indian
    await page.click('[data-testid="north-indian-chart"]');

    // Verify the selection
    await expect(page.locator('[data-testid="north-indian-chart"]')).toHaveClass(/selected/);
  });
});

test.describe('User Preferences', () => {
  test('should save user preferences', async ({ page }) => {
    await page.goto('/preferences');

    // Check for theme toggle
    await expect(page.locator('[data-testid="theme-toggle"]')).toBeVisible();

    // Toggle to dark mode
    await page.click('[data-testid="theme-toggle"]');

    // Verify dark mode is applied
    await expect(page.locator('html')).toHaveClass(/dark/);

    // Toggle back to light mode
    await page.click('[data-testid="theme-toggle"]');

    // Verify light mode is applied
    await expect(page.locator('html')).not.toHaveClass(/dark/);
  });

  test('should save language preferences', async ({ page }) => {
    await page.goto('/preferences');

    // Check for language selector
    await expect(page.locator('[data-testid="language-selector"]')).toBeVisible();

    // Select Hindi
    await page.selectOption('[data-testid="language-selector"]', 'hi');

    // Verify the selection
    await expect(page.locator('[data-testid="language-selector"]')).toHaveValue('hi');
  });
});
