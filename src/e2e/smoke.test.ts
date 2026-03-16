import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import puppeteer, { type Browser, type Page } from 'puppeteer'

const BASE_URL = 'https://localhost:5174'

let browser: Browser
let page: Page

beforeAll(async () => {
  browser = await puppeteer.launch({ headless: true, args: ['--ignore-certificate-errors'] })
  page = await browser.newPage()
  await page.goto(BASE_URL, { waitUntil: 'networkidle0' })
}, 30_000)

afterAll(async () => {
  await browser?.close()
})

describe('smoke', () => {
  it('renders the app shell', async () => {
    const title = await page.$eval('header', (el) => el.textContent)
    expect(title).toContain('VistaNest')
  })

  it('renders outline items', async () => {
    const items = await page.$$('.outline-item-row')
    expect(items.length).toBeGreaterThan(0)
  })

  it('has a focused item', async () => {
    const focused = await page.$('.outline-item-row.is-focused')
    expect(focused).not.toBeNull()
  })
})
