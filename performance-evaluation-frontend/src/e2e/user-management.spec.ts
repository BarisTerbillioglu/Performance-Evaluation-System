import { test, expect } from '@playwright/test';

test.describe('User Management', () => {
  test.beforeEach(async ({ page }) => {
    // Mock authentication
    await page.addInitScript(() => {
      localStorage.setItem('authToken', 'mock-token');
      localStorage.setItem('user', JSON.stringify({
        id: 1,
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@example.com',
        roles: ['ADMIN'],
      }));
    });

    await page.goto('/users');
  });

  test('should display user list page', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /user management/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /add user/i })).toBeVisible();
  });

  test('should load and display users', async ({ page }) => {
    // Mock users API
    await page.route('**/api/user/search', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: [
            {
              id: 1,
              firstName: 'John',
              lastName: 'Doe',
              email: 'john.doe@example.com',
              departmentName: 'Engineering',
              isActive: true,
              roleNames: ['Developer'],
              lastLoginDate: '2024-01-15T10:30:00Z',
            },
            {
              id: 2,
              firstName: 'Jane',
              lastName: 'Smith',
              email: 'jane.smith@example.com',
              departmentName: 'Marketing',
              isActive: true,
              roleNames: ['Manager'],
              lastLoginDate: '2024-01-14T15:45:00Z',
            },
          ],
          totalCount: 2,
          pageNumber: 1,
          pageSize: 10,
          totalPages: 1,
        }),
      });
    });

    await page.reload();

    await expect(page.getByText('John Doe')).toBeVisible();
    await expect(page.getByText('Jane Smith')).toBeVisible();
    await expect(page.getByText('john.doe@example.com')).toBeVisible();
    await expect(page.getByText('jane.smith@example.com')).toBeVisible();
  });

  test('should open add user modal', async ({ page }) => {
    await page.getByRole('button', { name: /add user/i }).click();
    
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByRole('heading', { name: /add new user/i })).toBeVisible();
    await expect(page.getByLabel(/first name/i)).toBeVisible();
    await expect(page.getByLabel(/last name/i)).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
  });

  test('should create a new user', async ({ page }) => {
    // Mock create user API
    await page.route('**/api/user', async route => {
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 3,
          firstName: 'Alice',
          lastName: 'Johnson',
          email: 'alice.johnson@example.com',
          departmentName: 'Engineering',
          isActive: true,
          roleNames: ['Developer'],
        }),
      });
    });

    await page.getByRole('button', { name: /add user/i }).click();
    
    await page.getByLabel(/first name/i).fill('Alice');
    await page.getByLabel(/last name/i).fill('Johnson');
    await page.getByLabel(/email/i).fill('alice.johnson@example.com');
    await page.getByLabel(/password/i).fill('password123');
    await page.getByLabel(/confirm password/i).fill('password123');
    
    await page.getByRole('button', { name: /create user/i }).click();

    await expect(page.getByText(/user created successfully/i)).toBeVisible();
  });

  test('should search users', async ({ page }) => {
    // Mock search API
    await page.route('**/api/user/search', async route => {
      const url = route.request().url();
      if (url.includes('searchTerm=john')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            data: [{
              id: 1,
              firstName: 'John',
              lastName: 'Doe',
              email: 'john.doe@example.com',
              departmentName: 'Engineering',
              isActive: true,
              roleNames: ['Developer'],
              lastLoginDate: '2024-01-15T10:30:00Z',
            }],
            totalCount: 1,
            pageNumber: 1,
            pageSize: 10,
            totalPages: 1,
          }),
        });
      } else {
        await route.continue();
      }
    });

    await page.getByPlaceholder(/search by name or email/i).fill('john');
    await page.keyboard.press('Enter');

    await expect(page.getByText('John Doe')).toBeVisible();
    await expect(page.getByText('Jane Smith')).not.toBeVisible();
  });

  test('should filter users by department', async ({ page }) => {
    await page.getByText(/department/i).click();
    await page.getByRole('option', { name: /engineering/i }).click();

    await expect(page.getByText('John Doe')).toBeVisible();
    await expect(page.getByText('Jane Smith')).not.toBeVisible();
  });

  test('should edit user', async ({ page }) => {
    // Mock update user API
    await page.route('**/api/user/1', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 1,
          firstName: 'John Updated',
          lastName: 'Doe',
          email: 'john.updated@example.com',
          departmentName: 'Engineering',
          isActive: true,
          roleNames: ['Developer'],
        }),
      });
    });

    await page.getByRole('button', { name: /edit/i }).first().click();
    
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByRole('heading', { name: /edit user/i })).toBeVisible();
    
    await page.getByLabel(/first name/i).clear();
    await page.getByLabel(/first name/i).fill('John Updated');
    await page.getByLabel(/email/i).clear();
    await page.getByLabel(/email/i).fill('john.updated@example.com');
    
    await page.getByRole('button', { name: /update user/i }).click();

    await expect(page.getByText(/user updated successfully/i)).toBeVisible();
  });

  test('should delete user', async ({ page }) => {
    // Mock delete user API
    await page.route('**/api/user/1', async route => {
      await route.fulfill({ status: 204 });
    });

    await page.getByRole('button', { name: /delete/i }).first().click();
    
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByText(/are you sure/i)).toBeVisible();
    
    await page.getByRole('button', { name: /confirm/i }).click();

    await expect(page.getByText(/user deleted successfully/i)).toBeVisible();
  });

  test('should handle pagination', async ({ page }) => {
    // Mock paginated response
    await page.route('**/api/user/search', async route => {
      const url = new URL(route.request().url());
      const page = url.searchParams.get('page');
      
      if (page === '2') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            data: [{
              id: 11,
              firstName: 'Page',
              lastName: 'Two',
              email: 'page.two@example.com',
              departmentName: 'Engineering',
              isActive: true,
              roleNames: ['Developer'],
              lastLoginDate: '2024-01-15T10:30:00Z',
            }],
            totalCount: 15,
            pageNumber: 2,
            pageSize: 10,
            totalPages: 2,
          }),
        });
      } else {
        await route.continue();
      }
    });

    await page.getByRole('button', { name: /next/i }).click();
    
    await expect(page.getByText('Page Two')).toBeVisible();
  });
});
