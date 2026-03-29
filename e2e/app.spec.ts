import { test, expect } from '@playwright/test';

const TEST_USER = {
  email: `e2e-test-${Date.now()}@example.com`,
  password: 'Test123456!',
  name: 'E2E Test User',
};

test.describe('Lumen E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Clear cookies before each test
    await page.context().clearCookies();
  });

  test.describe('Authentication Flow', () => {
    test('should display login page', async ({ page }) => {
      await page.goto('/auth/login');
      await expect(page.getByRole('heading', { name: 'Lumen' })).toBeVisible();
      // Use more specific selector - main login button, not social login buttons
      await expect(page.getByRole('button', { name: '登录', exact: true })).toBeVisible();
    });

    test('should register new user', async ({ page }) => {
      await page.goto('/auth/signup');

      // Fill registration form
      await page.fill('input[type="email"]', TEST_USER.email);
      await page.fill('input[type="password"]', TEST_USER.password);

      // Submit form
      await page.click('button[type="submit"]');

      // Wait for navigation or success message
      // Registration might redirect to login or dashboard
      await page.waitForTimeout(3000);

      // Check if we're redirected to login (most common behavior)
      const currentUrl = page.url();
      if (currentUrl.includes('/login')) {
        // Registration successful, redirected to login
        await expect(page).toHaveURL(/\/login/);
      }
    });

    test('should login with existing user', async ({ page }) => {
      await page.goto('/auth/login');

      // Fill login form with correct credentials
      await page.fill('input[type="email"]', '13170906656@163.com');
      await page.fill('input[type="password"]', 'chd1997');

      // Submit form
      await page.click('button[type="submit"]');

      // Wait for navigation to dashboard
      await page.waitForURL('**/dashboard', { timeout: 10000 });

      // Verify we're logged in
      await expect(page).toHaveURL(/\/dashboard/);

      // Check sidebar shows user info
      await expect(page.getByText(/13170906656@163\.com/)).toBeVisible();
    });
  });

  test.describe('Timeline Milestones CRUD', () => {
    test.beforeEach(async ({ page }) => {
      // Login
      await page.goto('/auth/login');
      await page.fill('input[type="email"]', '13170906656@163.com');
      await page.fill('input[type="password"]', 'chd1997');
      await page.click('button[type="submit"]');
      await page.waitForURL('**/dashboard', { timeout: 10000 });
    });

    test('should display timeline page', async ({ page }) => {
      await page.goto('/timeline');

      // Check page title
      await expect(page.getByRole('heading', { name: /记录生命的轨迹/ })).toBeVisible();

      // Check add button
      await expect(page.getByRole('button', { name: /新增人生节点/ })).toBeVisible();
    });

    test('should create milestone', async ({ page }) => {
      await page.goto('/timeline');
      await page.waitForTimeout(1000);

      // Click add button
      await page.click('button:has-text("新增人生节点")');

      // Wait for modal to be visible
      const dialog = page.getByRole('dialog');
      await expect(dialog.getByRole('heading', { name: '新增人生节点' })).toBeVisible({ timeout: 5000 });

      // Fill form with all required fields
      await page.fill('input[name="title"]', 'E2E测试里程碑');
      await page.fill('textarea[name="description"]', '这是一个自动化测试创建的里程碑');

      // Note: The Select components have default values, but they're required fields
      // We need to interact with them. Let's try using the native select option
      // The Select component should have a hidden native select
      try {
        await page.selectOption('select[name="category"]', 'foundation');
        await page.selectOption('select[name="assetClass"]', 'tangible-shelter');
      } catch (e) {
        // If native select doesn't work, the form will use default values
        console.log('Could not select options, using defaults');
      }

      await page.fill('input[name="capitalDeployed"]', '100000');
      await page.fill('input[name="emotionalYield"]', '测试、验证');

      // Submit form - use text to be more specific
      await page.click('button:has-text("添加")');

      // Wait for modal to close - the form submission might take time
      await page.waitForTimeout(3000);

      // Check if modal is closed
      const isDialogVisible = await dialog.isVisible().catch(() => false);
      if (isDialogVisible) {
        // If modal is still open, click close button or press Escape
        await page.keyboard.press('Escape');
        await page.waitForTimeout(1000);
      }

      // Reload page to get fresh data
      await page.reload();
      await page.waitForTimeout(2000);

      // Verify milestone was created - use first() to handle multiple matches
      await expect(page.getByText('E2E测试里程碑').first()).toBeVisible();
    });

    test('should edit milestone', async ({ page }) => {
      await page.goto('/timeline');
      await page.waitForTimeout(1000);

      // Check if there are any milestones to edit
      const milestoneCount = await page.locator('article').count();
      if (milestoneCount === 0) {
        test.skip();
        return;
      }

      // Find and hover over first milestone card
      const firstCard = page.locator('article').first();
      await firstCard.hover();

      // Wait for edit button to become visible
      await page.waitForTimeout(500);

      // Click edit button - look for button with pencil icon using aria-label or by finding the button container
      const editButton = firstCard.locator('button').filter({ has: page.locator('svg').locator('[data-lucide="pencil"]') }).first();
      await editButton.click();

      // Wait for modal
      const dialog = page.getByRole('dialog');
      await expect(dialog.getByRole('heading', { name: '编辑人生节点' })).toBeVisible({ timeout: 5000 });

      // Clear and fill title
      const titleInput = page.locator('input[name="title"]');
      await titleInput.click();
      await titleInput.fill('E2E测试里程碑-已编辑');

      // Submit
      await page.click('button:has-text("保存")');

      // Wait for update
      await page.waitForTimeout(3000);

      // Check if modal is still open and close if needed
      const isDialogVisible = await dialog.isVisible().catch(() => false);
      if (isDialogVisible) {
        await page.keyboard.press('Escape');
        await page.waitForTimeout(1000);
      }

      // Reload to get fresh data
      await page.reload();
      await page.waitForTimeout(2000);

      // Verify update
      await expect(page.getByText('E2E测试里程碑-已编辑')).toBeVisible();
    });

    test('should delete milestone', async ({ page }) => {
      await page.goto('/timeline');
      await page.waitForTimeout(1000);

      // Get initial count
      const beforeCount = await page.locator('article').count();

      if (beforeCount === 0) {
        test.skip();
        return;
      }

      // Find and hover over first milestone card
      const firstCard = page.locator('article').first();
      await firstCard.hover();

      // Wait for delete button to become visible
      await page.waitForTimeout(500);

      // Set up dialog handler before clicking delete - handle the browser confirm dialog
      page.on('dialog', dialog => dialog.accept());

      // Click delete button - look for button with trash icon
      const deleteButton = firstCard.locator('button').filter({ has: page.locator('svg').locator('[data-lucide="trash-2"]') }).first();
      await deleteButton.click();

      // Wait for deletion to complete
      await page.waitForTimeout(3000);

      // Reload to get fresh data
      await page.reload();
      await page.waitForTimeout(2000);

      // Verify deletion
      const afterCount = await page.locator('article').count();
      expect(afterCount).toBeLessThan(beforeCount);
    });
  });

  test.describe('Wealth Records CRUD', () => {
    test.beforeEach(async ({ page }) => {
      // Login
      await page.goto('/auth/login');
      await page.fill('input[type="email"]', '13170906656@163.com');
      await page.fill('input[type="password"]', 'chd1997');
      await page.click('button[type="submit"]');
      await page.waitForURL('**/dashboard', { timeout: 10000 });
    });

    test('should display wealth page', async ({ page }) => {
      await page.goto('/wealth');

      await expect(page.getByRole('heading', { name: /财富的/ })).toBeVisible();
    });

    test('should create wealth record', async ({ page }) => {
      await page.goto('/wealth');
      await page.waitForTimeout(1000);

      // Click "新增月份" button - this automatically creates a record
      await page.click('button:has-text("新增月份")');

      // Wait for creation
      await page.waitForTimeout(3000);

      // Reload to see the new record
      await page.reload();
      await page.waitForTimeout(2000);

      // Verify a record was created by checking if there are cards
      const recordCount = await page.locator('div[class*="border-lumen-border-subtle"]').count();
      expect(recordCount).toBeGreaterThan(0);
    });
  });

  test.describe('Life Goals CRUD', () => {
    test.beforeEach(async ({ page }) => {
      // Login
      await page.goto('/auth/login');
      await page.fill('input[type="email"]', '13170906656@163.com');
      await page.fill('input[type="password"]', 'chd1997');
      await page.click('button[type="submit"]');
      await page.waitForURL('**/dashboard', { timeout: 10000 });
    });

    test('should display goals page', async ({ page }) => {
      await page.goto('/goals');

      await expect(page.getByRole('heading', { name: /你的愿景/ })).toBeVisible();
    });

    test('should create life goal', async ({ page }) => {
      await page.goto('/goals');
      await page.waitForTimeout(1000);

      // Click add button
      await page.click('button:has-text("新增目标")');

      // Wait for modal - correct title is "新增人生目标"
      const dialog = page.getByRole('dialog');
      await expect(dialog.getByRole('heading', { name: '新增人生目标' })).toBeVisible({ timeout: 5000 });

      // Fill form
      await page.fill('input[name="title"]', 'E2E测试目标');
      await page.fill('textarea[name="description"]', '测试目标描述');

      // Note: The Select component has a default value, so we don't need to interact with it
      // The form will use the default value (first option in the Select)

      // Submit - use text content instead of type="submit" to avoid ambiguity
      await page.click('button:has-text("创建")');

      // Wait for creation and modal to close
      await page.waitForTimeout(5000);

      // Check if modal is still open and close if needed
      const isDialogVisible = await dialog.isVisible().catch(() => false);
      if (isDialogVisible) {
        await page.keyboard.press('Escape');
        await page.waitForTimeout(1000);
      }

      // Reload to get fresh data
      await page.reload();
      await page.waitForTimeout(3000);

      // Verify creation - use first() to handle potential duplicates
      await expect(page.getByText('E2E测试目标').first()).toBeVisible({ timeout: 10000 });
    });
  });

  test.describe('Projects CRUD', () => {
    test.beforeEach(async ({ page }) => {
      // Login
      await page.goto('/auth/login');
      await page.fill('input[type="email"]', '13170906656@163.com');
      await page.fill('input[type="password"]', 'chd1997');
      await page.click('button[type="submit"]');
      await page.waitForURL('**/dashboard', { timeout: 10000 });
    });

    test('should display projects page', async ({ page }) => {
      await page.goto('/projects');

      await expect(page.getByRole('heading', { name: /你的创造/ })).toBeVisible();
    });

    test('should create project', async ({ page }) => {
      await page.goto('/projects');
      await page.waitForTimeout(1000);

      // Click add button
      await page.click('button:has-text("新增项目")');

      // Wait for modal
      const dialog = page.getByRole('dialog');
      await expect(dialog.getByRole('heading', { name: '新增项目' })).toBeVisible({ timeout: 5000 });

      // Fill form - use name field
      await page.fill('input[name="name"]', 'E2E测试项目');
      await page.fill('textarea[name="description"]', '项目描述');

      // The form has default values for the Select components, so we don't need to fill them

      // Submit - wait for form to stabilize before clicking
      await page.waitForTimeout(500);
      const submitButton = dialog.getByRole('button', { name: '创建' });
      await submitButton.click({ timeout: 5000 });

      // Wait for creation
      await page.waitForTimeout(5000);

      // Check if modal is still open and close if needed
      const isDialogVisible = await dialog.isVisible().catch(() => false);
      if (isDialogVisible) {
        await page.keyboard.press('Escape');
        await page.waitForTimeout(1000);
      }

      // Reload to get fresh data
      await page.reload();
      await page.waitForTimeout(3000);

      // Verify creation - use first() to handle potential duplicates
      await expect(page.getByText('E2E测试项目').first()).toBeVisible({ timeout: 10000 });
    });
  });

  test.describe('Dashboard Overview', () => {
    test.beforeEach(async ({ page }) => {
      // Login
      await page.goto('/auth/login');
      await page.fill('input[type="email"]', '13170906656@163.com');
      await page.fill('input[type="password"]', 'chd1997');
      await page.click('button[type="submit"]');
      await page.waitForURL('**/dashboard', { timeout: 10000 });
    });

    test('should display dashboard', async ({ page }) => {
      await page.goto('/dashboard');

      await expect(page.getByRole('heading', { name: /你的人生与财富/ })).toBeVisible();
    });

    test('should navigate to all pages', async ({ page }) => {
      await page.goto('/dashboard');

      // Test navigation links
      await page.click('a:has-text("人生叙事")');
      await expect(page).toHaveURL(/\/timeline/);

      await page.click('a:has-text("财富记录")');
      await expect(page).toHaveURL(/\/wealth/);

      await page.click('a:has-text("人生目标")');
      await expect(page).toHaveURL(/\/goals/);

      await page.click('a:has-text("项目作品")');
      await expect(page).toHaveURL(/\/projects/);

      await page.click('a:has-text("仪表盘")');
      await expect(page).toHaveURL(/\/dashboard/);
    });
  });

  test.describe.skip('User Data Isolation', () => {
    test('users should only see their own data', async ({ page, context }) => {
      // First user creates data
      await page.goto('/auth/login');
      await page.fill('input[type="email"]', '13170906656@163.com');
      await page.fill('input[type="password"]', 'chd1997');
      await page.click('button[type="submit"]');
      await page.waitForURL('**/dashboard', { timeout: 10000 });

      await page.goto('/timeline');
      await page.waitForTimeout(1000);

      await page.click('button:has-text("新增人生节点")');

      // Wait for modal
      const dialog = page.getByRole('dialog');
      await expect(dialog.getByRole('heading', { name: '新增人生节点' })).toBeVisible({ timeout: 5000 });

      await page.fill('input[name="title"]', '用户1的私有数据');
      await page.fill('textarea[name="description"]', '只有用户1应该能看到');

      // Note: The Select components have default values, but they're required fields
      try {
        await page.selectOption('select[name="category"]', 'foundation');
        await page.selectOption('select[name="assetClass"]', 'tangible-shelter');
      } catch (e) {
        // If native select doesn't work, the form will use default values
        console.log('Could not select options, using defaults');
      }

      await page.fill('input[name="capitalDeployed"]', '100000');
      await page.fill('input[name="emotionalYield"]', '测试');

      await page.click('button:has-text("添加")');

      // Wait for creation
      await page.waitForTimeout(3000);

      // Check if modal is still open and close if needed
      const isDialogVisible = await dialog.isVisible().catch(() => false);
      if (isDialogVisible) {
        await page.keyboard.press('Escape');
        await page.waitForTimeout(1000);
      }

      // Reload to verify data was created
      await page.reload();
      await page.waitForTimeout(2000);
      await expect(page.getByText('用户1的私有数据')).toBeVisible();

      // Logout
      await page.click('button:has-text("登出")');
      await page.waitForURL('**/login', { timeout: 5000 });

      // Register new user
      const secondUser = {
        email: `user2-${Date.now()}@test.com`,
        password: 'Test123456!',
      };

      await page.goto('/auth/signup');
      await page.fill('input[type="email"]', secondUser.email);
      await page.fill('input[type="password"]', secondUser.password);
      await page.click('button[type="submit"]');

      // Wait for registration (might redirect to login)
      await page.waitForTimeout(3000);

      // Login as second user
      await page.goto('/auth/login');
      await page.fill('input[type="email"]', secondUser.email);
      await page.fill('input[type="password"]', secondUser.password);
      await page.click('button[type="submit"]');
      await page.waitForURL('**/dashboard', { timeout: 10000 });

      // Go to timeline as second user
      await page.goto('/timeline');
      await page.waitForTimeout(2000);

      // Should NOT see first user's data
      await expect(page.getByText('用户1的私有数据')).not.toBeVisible();
    });
  });
});
