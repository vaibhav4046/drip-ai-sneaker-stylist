// Real mobile screenshots of the live app for the README / portfolio.
import { chromium } from 'playwright'
import { mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const out = resolve(__dirname, '..', 'docs', 'screenshots')
mkdirSync(out, { recursive: true })
const URL = 'https://drip-two-rho.vercel.app/'

const browser = await chromium.launch({ args: ['--no-sandbox'] })
try {
  const ctx = await browser.newContext({
    viewport: { width: 430, height: 932 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true,
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
  })
  const page = await ctx.newPage()
  page.setDefaultTimeout(7000)
  const settle = async (ms) => { await page.waitForTimeout(ms) }
  const shot = async (n) => { try { await page.screenshot({ path: resolve(out, n) }); console.log('OK', n) } catch (e) { console.log('FAIL', n, e.message) } }
  const click = async (sel) => { try { await page.click(sel, { timeout: 5000 }); return true } catch { return false } }

  await page.goto(URL + '?s=1', { waitUntil: 'domcontentloaded', timeout: 25000 }).catch(() => {})
  await settle(5000)
  await shot('home.png')

  await click('button:has-text("Got it")')
  await settle(1200)
  await page.evaluate(() => window.scrollTo(0, 760)).catch(() => {})
  await settle(3000)
  await shot('feed.png')

  await page.evaluate(() => window.scrollTo(0, 0)).catch(() => {})
  await settle(1000)
  await click('button:has-text("DROP OF THE DAY")')
  await settle(4000)
  await shot('detail.png')
  await page.keyboard.press('Escape').catch(() => {})
  await settle(800)

  if (await click('nav button[aria-label="Stylist"]')) {
    await settle(1000)
    try { await page.fill('input[aria-label="Message the stylist"]', 'wedding fit with my jordan chicago') } catch {}
    await click('button[aria-label="Send"]')
    await settle(7000)
    await shot('stylist.png')
  }

  if (await click('nav button[aria-label="Closet"]')) { await settle(3000); await shot('closet.png') }
  if (await click('nav button[aria-label="Scan"]')) { await settle(1500); await shot('scan.png') }
} catch (e) {
  console.log('ERR', e.message)
} finally {
  await browser.close()
  console.log('done')
}
