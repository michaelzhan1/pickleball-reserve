import { chromium } from 'playwright';

export async function attemptLogin(username, password) {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Navigate to the login page
    await page.goto('https://secure.rec1.com/TX/up-tx/catalog');

    const catalog = page.getByText('Catalog');
    console.log(await catalog.textContent());

    // // Fill in the username and password fields
    // await page.fill('#username', username);
    // await page.fill('#password', password);

    // // Click the login button
    // await Promise.all([
    //   page.click('#loginButton'),
    //   page.waitForNavigation({ waitUntil: 'networkidle' }),
    // ]);

    // // Check if login was successful by looking for a specific element
    // const isLoggedIn = await page.isVisible('#logoutButton');

    // return isLoggedIn;
  } catch (error) {
    console.error('Login attempt failed:', error);
    return false;
  } finally {
    await browser.close();
  }
}