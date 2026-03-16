import { test, expect } from '@playwright/test'

test('smoke — happy path through core interactions', async ({ page }) => {
  await page.goto('/')

  // App shell renders
  await expect(page.locator('h1')).toContainText('Product Roadmap Q1')

  // Outline items render
  const items = page.locator('.outline-item-row')
  await expect(items.first()).toBeVisible()

  // Has a focused item
  await expect(page.locator('.outline-item-row.is-focused')).toBeVisible()

  // Screenshot: initial state
  await expect(page).toHaveScreenshot('01-initial.png')

  // Navigate down
  await page.keyboard.press('j')
  await page.keyboard.press('j')
  await expect(page).toHaveScreenshot('02-after-nav.png')

  // Indent
  await page.keyboard.press('Tab')
  await expect(page).toHaveScreenshot('03-after-indent.png')

  // Edit: F2 to start, type, Enter to save
  await page.keyboard.press('F2')
  const input = page.locator('.outline-item-row.is-focused input')
  await expect(input).toBeFocused()
  await input.fill('Edited by Playwright')
  await page.keyboard.press('Enter')

  // Verify edit saved
  await expect(page.locator('.outline-item-row.is-focused')).toContainText('Edited by Playwright')
  await expect(page).toHaveScreenshot('04-after-edit.png')

  // Command palette: open and close
  await page.keyboard.press('Control+k')
  await expect(page.locator('.command-palette-item').first()).toBeVisible()
  await expect(page).toHaveScreenshot('05-command-palette.png')
  await page.keyboard.press('Escape')

  // Theme switch via command palette
  await page.keyboard.press('Control+k')
  const paletteInput = page.locator('input[placeholder="Type a command..."]')
  await paletteInput.fill('Theme: Paper')
  await page.keyboard.press('Enter')
  await expect(page).toHaveScreenshot('06-paper-theme.png')
})
