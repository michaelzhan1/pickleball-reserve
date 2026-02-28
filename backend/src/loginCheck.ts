import { PlaywrightResult } from './types/types';
import { Page, chromium } from 'playwright';

export async function attemptLogin(
  username: string,
  password: string,
): Promise<PlaywrightResult> {
  const browser = await chromium.launch({
    headless: true,
  });
  const context = await browser.newContext();
  const page = await context.newPage();

  let errorMessage = null;
  try {
    // Navigate to the login page
    await page.goto('https://secure.rec1.com/TX/up-tx/catalog');

    // dialog handler on failed login
    page.on('dialog', async (dialog) => {
      errorMessage = dialog.message();
      console.error('Dialog message:', errorMessage);
      await dialog.dismiss();
    });

    // do login
    await login(page, username, password, { shouldLogout: true });

    return {
      success: true,
      errorMessage: '',
    };
  } catch (error) {
    return {
      success: false,
      errorMessage:
        errorMessage ||
        (typeof error === 'object' && error !== null && 'message' in error
          ? (error as { message?: string }).message
          : undefined) ||
        'An unexpected error occurred during reservation attempt.',
    };
  } finally {
    await page.close();
    await context.close();
    await browser.close();
  }
}

export async function login(
  page: Page,
  username: string,
  password: string,
  { shouldLogout }: { shouldLogout?: boolean },
): Promise<void> {
  const loginLink = page.getByRole('link').filter({ hasText: 'Sign In' });
  await loginLink.click();
  const usernameField = page.getByLabel('Email/Username');
  const passwordField = page.getByLabel('Password', { exact: true });
  await usernameField.fill(username);
  await passwordField.fill(password);

  const loginButton = page.getByRole('button', { name: 'Sign In' });
  await loginButton.click();

  const logoutButton = page.getByRole('link', { name: 'Log Out' });
  if (shouldLogout) {
    await logoutButton.click({ timeout: 5000 });
  } else {
    await logoutButton.waitFor({ state: 'visible', timeout: 5000 });
  }
}
