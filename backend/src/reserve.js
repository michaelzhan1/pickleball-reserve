import { expect } from '@playwright/test';

import { generateTimeOptions } from './utils/time.util.js';
import { chromium } from 'playwright';

export async function attemptReserve(
  username,
  password,
  date,
  startTimeIdx,
  endTimeIdx,
  courtOrder,
) {
  const timeOptions = generateTimeOptions();
  const courts = courtOrder.split(',').map((court) => Number(court.trim()));

  const browser = await chromium.launch({
    headless: true,
  });
  const context = await browser.newContext();
  const page = await context.newPage();

  let errorMessage = null;
  try {
    // Navigate to the login page
    await page.goto('https://secure.rec1.com/TX/up-tx/catalog');

    // dialog handler on some failure
    page.on('dialog', async (dialog) => {
      errorMessage = dialog.message();
      console.error('Dialog message:', errorMessage);
      await dialog.dismiss();
    });

    // Log in
    const loginDropdown = page
      .getByRole('link')
      .filter({ hasText: 'Log In/Create Account' });
    await loginDropdown.click();
    const usernameField = page.getByLabel('Email/Username');
    const passwordField = page.getByLabel('Password');
    await usernameField.fill(username);
    await passwordField.fill(password);

    const loginButton = page.getByRole('button', { name: 'Log In' });
    await loginButton.click();

    const logoutButton = page.getByRole('link', { name: 'Log Out' });
    await logoutButton.waitFor({ state: 'visible', timeout: 5000 });

    // Navigate to reservations
    await page.getByRole('heading', { name: 'Court Reservations' }).click();
    await page.getByRole('heading', { name: 'Pickleball Courts' }).click();

    // Choose date
    const displayedDate = await page
      .locator('input.datepicker.interactive-grid-date')
      .inputValue();
    const daysBetween = Math.floor(
      (new Date(date.year, date.month, date.date) - new Date(displayedDate)) /
        (1000 * 60 * 60 * 24),
    );
    for (let i = 0; i < daysBetween; i++) {
      await page.locator('button.btn.interactive-grid-date-next').click();
    }

    // wait for page to load
    const dummyCell = page.getByRole('gridcell').first();
    await expect(dummyCell, 'Time cells did not load').not.toHaveText(
      'Not Loaded',
    );
    await page.waitForTimeout(500);

    // main loop: select court
    let done = false;
    for (
      let window = Math.min(3, endTimeIdx - startTimeIdx);
      window > 0;
      window--
    ) {
      for (const court of courts) {
        // click on the court cell
        const courtCell = page
          .getByRole('row')
          .nth(court)
          .getByRole('gridcell')
          .first();
        await courtCell.click();

        // select rate
        await page
          .locator('div.reservation-rate-types-control > div.selectmenu')
          .click();
        await page
          .locator('div.selectmenu-items.open')
          .locator('div.selectmenu-item', {
            hasText: 'Pickleball Court Rental',
          })
          .click();

        // select start time
        const timeSelectors = page
          .locator('div.reservation-hours-control')
          .locator('select');
        for (let i = startTimeIdx; i <= endTimeIdx - window; i++) {
          console.log(
            `Trying court ${court}, time ${timeOptions[i]} - ${timeOptions[i + window]}`,
          );
          // try start time
          const startSelector = timeSelectors.first();
          const startOptions = await startSelector
            .locator('option')
            .allTextContents();
          if (!startOptions.includes(timeOptions[i])) continue;
          await startSelector.selectOption(
            { label: timeOptions[i] },
            { force: true },
          );

          // try end time
          await page.waitForTimeout(500);
          const endSelector = timeSelectors.last();
          const endOptions = await endSelector
            .locator('option')
            .allTextContents();
          if (!endOptions.includes(timeOptions[i + window])) continue;
          await endSelector.selectOption(
            { label: timeOptions[i + window] },
            { force: true },
          );

          done = true;
          break;
        }

        if (done) break;

        // if no time found, deselect court and try next one
        await page.getByRole('button', { name: 'Close' }).click();
      }
      if (done) break;
    }

    if (!done) {
      console.error(
        'No available time slots found for the selected courts and time range.',
      );
      throw new Error(
        'No available time slots found for the selected courts and time range.',
      );
    }

    // confirm reservation
    await page.getByRole('button', { name: 'Add To Cart' }).click();
    await page.getByText('Checkout').click();
    await page.getByRole('button', { name: 'Review Transaction' }).click();
    await page.getByRole('button', { name: 'Complete Transaction' }).click();

    return {
      success: true,
      errorMessage: '',
    };
  } catch (error) {
    return {
      success: false,
      errorMessage:
        errorMessage ||
        error.message ||
        'An unexpected error occurred during reservation attempt.',
    };
  } finally {
    await browser.close();
  }
}
