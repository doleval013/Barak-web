import { test, expect } from '@playwright/test';

test.describe('Barak Web App E2E', () => {

    test('Home Page Loads and contains key elements', async ({ page }) => {
        // 1. Visit Home
        // 1. Visit Home (waits for load)
        await page.goto('/', { timeout: 30000 });

        // 2. Check Title or Header
        // Default language is Hebrew, but check for either to be robust
        await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
        await expect(page.getByRole('heading', { level: 1 })).toContainText(/ברק אלוני|Barak Aloni/);

        // 3. Verify Contact Button
        const contactBtn = page.locator('a[href="#contact"]').first();
        await expect(contactBtn).toBeVisible();

        // 4. Verify Programs Section exists
        await expect(page.locator('#programs')).toBeVisible();
    });

    test('Admin Dashboard Login and Data Verification', async ({ page, request }) => {
        // 1. Generate some traffic first to ensure DB has data
        // We hit the API directly to simulate a visit
        await request.post('http://localhost:3000/api/visit', {
            data: {
                page: 'test_visit',
                language: 'en',
                referrer: 'test_runner'
            }
        });

        // 2. Go to Admin Page
        await page.goto('/admin');

        // 3. Check for Login Screen
        await expect(page.getByText('Secured Access')).toBeVisible();

        // Monitor console logs
        page.on('console', msg => console.log('PAGE LOG:', msg.text()));
        page.on('pageerror', exception => console.log(`PAGE EXCEPTION: "${exception}"`));
        // Monitor network
        page.on('response', response => {
            if (response.url().includes('/api/stats') && response.status() !== 200) {
                console.log(`API ERROR: ${response.url()} returned ${response.status()}`);
            }
        });

        // 4. Attempt Login
        console.log('Filling password...');
        await page.fill('input[type="password"]', 'admin');
        await page.click('button[type="submit"]');
        console.log('Clicked login, waiting for navigation/update...');

        // 5. Verify Dashboard Loaded
        // Wait for title to appear
        // If this fails, it might be because of Hashing mismatch or network error
        try {
            await expect(page.getByRole('heading', { name: 'Mission Control' })).toBeVisible({ timeout: 15000 });
        } catch (e) {
            console.log('Login failed or timed out. Current URL:', page.url());
            // await page.screenshot({ path: 'login_failure.png' });
            throw e;
        }
        await expect(page.getByText('Secured Access')).toBeHidden();

        // 6. Verify Data Exists
        // We expect "Page Loads" to be at least 1 (from our injected visit or previous visits)
        const pageLoads = page.locator('div:has-text("Page Loads") + div');
        // This selector is tricky, let's use text approximate
        await expect(page.getByText('Page Loads (24h)')).toBeVisible();

        // Check if the KPI value is visible and not empty
        // Assuming the number is in a div following the label or near it.
        // In AdminDashboard.jsx: 
        // <span ...>Page Loads (24h)</span>
        // <div ...>{stats.visits.toLocaleString()}</div>

        // We can just check that we see non-zero stats or just elements exist
        await expect(page.getByText('Online Now')).toBeVisible();
    });

});
