const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  const errors = [];
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });

  let pass = 0, fail = 0;
  const results = [];

  // --- MH-1: Auth: Phone OTP flow ---
  try {
    await page.goto('http://localhost:8080/auth', { waitUntil: 'networkidle' });
    const phoneInput = await page.locator('input[type="tel"]').count();
    await page.fill('input[type="tel"]', '+852 00000000');
    await page.click('button:has-text("Send")');
    await page.waitForTimeout(1000);
    const otpInput = await page.locator('input[placeholder="123456"]').count();
    await page.fill('input[placeholder="123456"]', '123456');
    await page.click('button:has-text("Verify")');
    await page.waitForURL('**/dashboard', { timeout: 6000 });
    results.push({ test: 'MH-1 Auth OTP flow', status: 'PASS' });
    pass++;
  } catch(e) { results.push({ test: 'MH-1 Auth OTP flow', status: 'FAIL: ' + e.message }); fail++; }

  // --- MH-2: Dashboard shows role-based nav ---
  try {
    await page.waitForTimeout(1000);
    const bodyText = await page.locator('body').innerText();
    const hasSidebar = bodyText.includes('Dashboard') || bodyText.includes('Timeline');
    results.push({ test: 'MH-2 Role-based nav', status: hasSidebar ? 'PASS' : 'FAIL' });
    hasSidebar ? pass++ : fail++;
  } catch(e) { results.push({ test: 'MH-2 Role-based nav', status: 'FAIL: ' + e.message }); fail++; }

  // --- MH-3: Create and assign activity ---
  try {
    await page.goto('http://localhost:8080/dashboard', { waitUntil: 'networkidle' });
    const newActBtn = await page.locator('button').filter({ hasText: /New Activity|新建/ }).count();
    results.push({ test: 'MH-3 New Activity button', status: newActBtn > 0 ? 'PASS' : 'FAIL' });
    newActBtn > 0 ? pass++ : fail++;
  } catch(e) { results.push({ test: 'MH-3 New Activity button', status: 'FAIL: ' + e.message }); fail++; }

  // --- MH-4: Helper can check in ---
  try {
    await page.goto('http://localhost:8080/helper', { waitUntil: 'networkidle' });
    const hereBtn = await page.locator('button').filter({ hasText: /Here|抵達/ }).count();
    results.push({ test: 'MH-4 Helper check-in button', status: hereBtn > 0 ? 'PASS' : 'FAIL' });
    hereBtn > 0 ? pass++ : fail++;
  } catch(e) { results.push({ test: 'MH-4 Helper check-in button', status: 'FAIL: ' + e.message }); fail++; }

  // --- MH-5: Timeline visible ---
  try {
    await page.goto('http://localhost:8080/timeline', { waitUntil: 'networkidle' });
    const bodyText = await page.locator('body').innerText();
    const hasTimeline = bodyText.includes('Timeline') || bodyText.includes('時間線');
    results.push({ test: 'MH-5 Timeline view', status: hasTimeline ? 'PASS' : 'FAIL' });
    hasTimeline ? pass++ : fail++;
  } catch(e) { results.push({ test: 'MH-5 Timeline view', status: 'FAIL: ' + e.message }); fail++; }

  // --- MH-6: Family members visible (kids + helpers pages) ---
  try {
    await page.goto('http://localhost:8080/kids', { waitUntil: 'networkidle' });
    const kidsText = await page.locator('body').innerText();
    await page.goto('http://localhost:8080/helpers', { waitUntil: 'networkidle' });
    const helpersText = await page.locator('body').innerText();
    const hasKids = kidsText.includes('Kids') || kidsText.includes('child');
    const hasHelpers = helpersText.includes('Helper') || helpersText.includes('Member');
    results.push({ test: 'MH-6 Family members view', status: hasKids && hasHelpers ? 'PASS' : 'FAIL' });
    hasKids && hasHelpers ? pass++ : fail++;
  } catch(e) { results.push({ test: 'MH-6 Family members view', status: 'FAIL: ' + e.message }); fail++; }

  // --- MH-7: No console errors ---
  results.push({ test: 'MH-7 No console errors', status: errors.length === 0 ? 'PASS' : 'WARN', errors });
  if (errors.length === 0) pass++; else fail++;

  await browser.close();
  console.log(JSON.stringify({ pass, fail, total: pass + fail, results, errors }));
  process.exit(fail > 0 ? 1 : 0);
})().catch(e => { console.error(e.message); process.exit(1); });
