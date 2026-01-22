import { chromium } from 'playwright';

export async function attemptLogin(username, password) {
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
    })

    // Fill in the username and password fields
    const loginDropdown = page
      .getByRole('link')
      .filter({ hasText: 'Sign In' });
    await loginDropdown.click();
    const usernameField = page.getByLabel('Email/Username');
    const passwordField = page.getByLabel('Password');
    await usernameField.fill(username);
    await passwordField.fill(password);

    const loginButton = page.getByRole('button', { name: 'Log In' });
    await loginButton.click();

    const logoutButton = page.getByRole('link', { name: 'Log Out' });
    await logoutButton.click({ timeout: 5000 });

    return {
      success: true,
      errorMessage: '',
    }
  } catch (error) {
    return {
      success: false,
      errorMessage: errorMessage || error.message || 'An unexpected error occurred during login attempt.',
    };
  } finally {
    await browser.close();
  }
}
