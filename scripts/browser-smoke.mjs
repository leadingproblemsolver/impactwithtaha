import { chromium } from 'playwright';

const base = (process.env.IMPACT_BASE_URL || 'https://impactwithtaha.vercel.app').replace(/\/$/, '');
const browser = await chromium.launch({ headless: true });
const errors = [];

try {
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();
  page.on('pageerror', error => errors.push(`pageerror: ${error.message}`));
  page.on('console', message => {
    if (message.type() === 'error') errors.push(`console: ${message.text()}`);
  });

  await page.goto(`${base}/lens`, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('#generate');
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForSelector('#generate');

  await page.fill('#role', 'Engineering Manager');
  await page.fill('#problem', 'Reduce silent failures in agent workflows and make release evidence inspectable.');
  await page.fill('#jd-text', 'We need an engineer who can debug API and agent reliability failures, define testable invariants, and ship bounded production fixes with inspectable evidence.');
  await page.click('#generate');
  await page.waitForSelector('#result .impact-card', { timeout: 15000 });

  const firstHeading = await page.locator('#result h2').innerText();
  if (!/Engineering Manager/i.test(firstHeading)) throw new Error('deterministic viewer heading did not reflect supplied role');
  if ((await page.locator('#result .impact-card').count()) < 1) throw new Error('no deterministic evidence cards rendered');
  if (!(await page.locator('#share').isEnabled())) throw new Error('share did not unlock after first value');

  await page.click('#correct');
  await page.fill('#role', 'GTM Lead');
  await page.fill('#problem', 'Turn public technical signals into prioritized, inspectable GTM actions.');
  await page.click('#generate');
  await page.waitForFunction(() => document.querySelector('#lens-progress')?.textContent?.includes('Correction applied'), null, { timeout: 15000 });
  const correctedHeading = await page.locator('#result h2').innerText();
  if (!/GTM Lead/i.test(correctedHeading)) throw new Error('corrected viewer state did not render');

  await page.fill('#paste', 'Implemented a retry-safe API workflow with deterministic failure states, CI checks, an external receipt, and an explicit boundary that no revenue outcome has been measured.');
  await page.click('#pastebtn');
  await page.waitForSelector('#artifact-result .impact-card', { timeout: 20000 });
  if ((await page.locator('#artifact-result').innerText()).length < 80) throw new Error('artifact view did not produce meaningful output');

  await page.goto(`${base}/proof-map`, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('h1');
  if (!/Inspect the receipt/i.test(await page.locator('h1').innerText())) throw new Error('/proof-map is not using the canonical V2 renderer');

  await page.goto(`${base}/proof/driftguard`, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('h1');
  if (!/DriftGuard/i.test(await page.locator('h1').innerText())) throw new Error('legacy proof route did not resolve to canonical evidence');

  await page.goto(`${base}/diagnostic`, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('h1');
  if (!/You generate the leads/i.test(await page.locator('h1').innerText())) throw new Error('buyer diagnostic headline missing');
  if (!/Illustrative example, not a client-result claim/i.test(await page.locator('body').innerText())) throw new Error('diagnostic claim boundary missing');
  if ((await page.locator('#send').count()) !== 1) throw new Error('diagnostic CTA target missing');
  if ((await page.locator('#prompt').count()) !== 1) throw new Error('diagnostic workflow prompt missing');
  await context.close();

  const mobileContext = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const mobile = await mobileContext.newPage();
  mobile.on('pageerror', error => errors.push(`mobile pageerror: ${error.message}`));
  await mobile.goto(`${base}/lens`, { waitUntil: 'domcontentloaded' });
  await mobile.waitForSelector('#generate');
  let overflow = await mobile.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  if (overflow > 2) throw new Error(`mobile horizontal overflow detected on /lens (${overflow}px)`);

  await mobile.goto(`${base}/diagnostic`, { waitUntil: 'domcontentloaded' });
  await mobile.waitForSelector('h1');
  overflow = await mobile.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  if (overflow > 2) throw new Error(`mobile horizontal overflow detected on /diagnostic (${overflow}px)`);
  if (!/You generate the leads/i.test(await mobile.locator('h1').innerText())) throw new Error('mobile diagnostic headline missing');
  await mobileContext.close();

  const materialErrors = errors.filter(error => !/favicon|Failed to load resource.*404/i.test(error));
  if (materialErrors.length) throw new Error(`browser console errors: ${materialErrors.join(' | ')}`);

  console.log(JSON.stringify({
    ok: true,
    base,
    deterministic_view: true,
    correction_state_change: true,
    artifact_view: true,
    share_after_value: true,
    proof_map: true,
    legacy_proof_route: true,
    diagnostic_route: true,
    diagnostic_claim_boundary: true,
    mobile_overflow: false
  }, null, 2));
} finally {
  await browser.close();
}
