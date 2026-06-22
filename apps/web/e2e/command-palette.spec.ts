import { test, expect } from '@playwright/test'

// Regression for the focus-steal race: command-palette results are
// non-focusable rows, so a mouse click's mousedown would blur the search
// input, fire focusout on the overlay, and close the palette before the click
// could select — selecting only worked from the keyboard. This exercises the
// mouse path in a real browser (jsdom can't reproduce the focus theft).
test('selecting a result with a mouse click navigates (focusout race)', async ({ page }) => {
  await page.goto('/')

  // Open via the sidebar trigger (waits for hydration; avoids OS-modifier shortcuts).
  const trigger = page.locator('.search-trigger')
  await trigger.click()

  const input = page.getByRole('combobox')
  await expect(input).toBeVisible()

  // Narrow to a stable navigation result, then click it with the mouse.
  await input.fill('fleet')
  await page.getByRole('option', { name: 'Fleet', exact: true }).click()

  // The click must have fired select (router.push) — not just closed the overlay.
  // (/fleet redirects to its default subroute.)
  await expect(page).toHaveURL(/\/fleet(\/|$)/)
  await expect(input).toBeHidden()
})
