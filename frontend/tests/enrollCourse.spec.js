import { expect, test } from '@playwright/test';

test('User can enroll in a course', async ({ page }) => {
    await page.goto('/courses');

    // Click on the first course
    await page.click('.course-item:first-of-type button');

    // Click enroll button
    await page.click('button.enroll');

    // Verify enrollment confirmation
    await expect(page.locator('.toast-message')).toHaveText('Successfully enrolled');
});
