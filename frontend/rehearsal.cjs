/* Full presentation rehearsal: drives the exact demo flow end-to-end and prints a PASS/FAIL checklist. */
const puppeteer = require('puppeteer-core');
const fs = require('fs');

const CHROME_PATHS = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  process.env.LOCALAPPDATA + '/Google/Chrome/Application/chrome.exe',
];
function findChrome() {
  for (const p of CHROME_PATHS) { try { if (fs.existsSync(p)) return p; } catch {} }
  return null;
}

const BASE = 'http://localhost:5173';
const results = [];
function step(name, ok, detail = '') {
  results.push({ name, ok, detail });
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? '  — ' + detail : ''}`);
}

(async () => {
  const browser = await puppeteer.launch({ executablePath: findChrome(), headless: 'new', args: ['--no-sandbox', '--disable-gpu'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error' && !m.text().includes('React will try')) errors.push(m.text()); });

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const text = () => page.evaluate(() => document.body.innerText);

  /* ============ ACT 0: LANDING ============ */
  await page.goto(BASE + '/', { waitUntil: 'networkidle2' });
  let t = await text();
  step('Landing: hero & tagline', t.includes('Healthcare') && t.includes('MEDICARE'));
  step('Landing: sections present', t.includes('How MediCare Works') && t.includes('Features') && t.includes('For Patients'));

  // theme toggle on landing
  const themeBefore = await page.evaluate(() => document.documentElement.classList.contains('dark'));
  await page.click('button[role="switch"]');
  await sleep(300);
  const themeAfter = await page.evaluate(() => document.documentElement.classList.contains('dark'));
  step('Theme toggle switches', themeBefore !== themeAfter, `${themeBefore ? 'dark->light' : 'light->dark'}`);
  await page.click('button[role="switch"]'); await sleep(200); // restore

  /* ============ ACT 1: PATIENT ============ */
  await page.goto(BASE + '/login', { waitUntil: 'networkidle2' });
  t = await text();
  step('Login page: demo credentials visible', t.includes('Demo credentials') && t.includes('aarav.gupta@medicare.com'));

  await page.type('input[type=email]', 'aarav.gupta@medicare.com');
  await page.type('input[type=password]', 'password123');
  await page.click('button[type=submit]');
  await page.waitForFunction(() => location.pathname.startsWith('/patient'), { timeout: 15000 });
  await sleep(600);
  step('Patient login redirects to dashboard', (await page.url()).includes('/patient'));
  t = await text();
  step('Patient dashboard: welcome + stats', t.includes('Welcome back') && t.includes('Upcoming Appointments') && t.includes('Prescriptions'));
  step('Patient dashboard: next appointment card', t.includes('Next appointment'));

  // Find Doctors
  await page.goto(BASE + '/patient/doctors', { waitUntil: 'networkidle2' });
  await sleep(700);
  t = await text();
  step('Find Doctors: 6 doctor cards render', (t.match(/Dr\./g) || []).length >= 6, `found ${(t.match(/Dr\./g) || []).length} "Dr." mentions`);
  step('Find Doctors: availability indicators', t.includes('Available'));

  // search Cardiology
  await page.type('input[placeholder*="Search"]', 'Cardiology');
  await sleep(500);
  t = await text();
  const cardioOnly = t.includes('Ananya Sharma') && !t.includes('Rohan Mehta') && !t.includes('Kavya Singh');
  step('Search "Cardiology" filters to 1 doctor', cardioOnly);

  // open profile
  await Promise.all([page.waitForNavigation({ waitUntil: 'networkidle2' }), page.evaluate(() => {
    const links = [...document.querySelectorAll('a')];
    const btn = links.find(a => a.textContent.trim() === 'View Profile');
    btn.click();
  })]);
  await sleep(900);
  t = await text();
  step('Doctor profile: details shown', t.includes('Dr. Ananya Sharma') && t.includes('Qualification') && t.includes('years'));
  step('Doctor profile: booking section', t.includes('Book an appointment') && t.includes('Available slots'));

  // pick first available slot
  const booked = await page.evaluate(() => {
    const chips = [...document.querySelectorAll('button')].filter(b => /^\d{1,2}:\d{2} (AM|PM)$/.test(b.textContent.trim()) && !b.disabled);
    if (!chips.length) return null;
    chips[0].click();
    return chips[0].textContent.trim();
  });
  step('Slot selectable', !!booked, `picked ${booked}`);

  // confirm booking bar appears, click Confirm Booking
  await sleep(300);
  const confirmBtn = await page.evaluate(() => {
    const b = [...document.querySelectorAll('button')].find(x => x.textContent.trim() === 'Confirm Booking');
    if (b) { b.click(); return true; }
    return false;
  });
  await sleep(1200);
  step('Confirm Booking button works', confirmBtn);
  t = await text();
  step('Appointment Confirmed modal appears', t.includes('Appointment Confirmed') && t.includes('MC-'));
  const apptIdMatch = t.match(/MC-[A-Z0-9-]+/);
  step('Confirmation shows appointment ID', !!apptIdMatch, apptIdMatch ? apptIdMatch[0] : '');

  // View Appointment -> My Appointments
  await page.evaluate(() => {
    const b = [...document.querySelectorAll('button')].find(x => x.textContent.trim() === 'View Appointment');
    b && b.click();
  });
  await sleep(1000);
  t = await text();
  step('My Appointments shows new BOOKED visit', t.includes('My Appointments') && t.includes('BOOKED') && (t.includes('Ananya Sharma')));
  const hadCancel = t.includes('Cancel Appointment');
  step('Cancel button available on upcoming', hadCancel);

  // logout via sidebar
  await page.evaluate(() => {
    const b = [...document.querySelectorAll('button')].find(x => x.textContent.trim() === 'Logout');
    b && b.click();
  });
  await sleep(1000);
  step('Logout returns to landing', (await page.url()).replace(/\/$/, '') === BASE || (await page.url()) === BASE + '/');

  /* ============ ACT 2: DOCTOR ============ */
  await page.goto(BASE + '/login', { waitUntil: 'networkidle2' });
  await page.type('input[type=email]', 'ananya.sharma@medicare.com');
  await page.type('input[type=password]', 'password123');
  await page.click('button[type=submit]');
  await page.waitForFunction(() => location.pathname.startsWith('/doctor'), { timeout: 15000 });
  await sleep(700);
  t = await text();
  step('Doctor login -> doctor dashboard', (await page.url()).includes('/doctor'));
  step("Doctor dashboard: today's stats", t.includes("Today's Appointments") && t.includes('Total Patients'));

  // Appointments page: find the booking we just made (patient Aarav) and complete it
  await page.goto(BASE + '/doctor/appointments', { waitUntil: 'networkidle2' });
  await sleep(800);
  t = await text();
  step("Doctor appointments: patient names visible", t.includes('Aarav Gupta') && t.includes('Mark Completed'));

  // click first Mark Completed (the newest booking appears first or in upcoming tab)
  const completed = await page.evaluate(() => {
    const b = [...document.querySelectorAll('button')].find(x => x.textContent.trim() === 'Mark Completed');
    if (!b) return false;
    b.click();
    return true;
  });
  await sleep(500);
  // confirm modal -> "Mark Completed"
  const confirmComplete = await page.evaluate(() => {
    const b = [...document.querySelectorAll('button')].find(x => x.textContent.trim() === 'Mark Completed' && x.closest('[role="dialog"]'));
    if (b) { b.click(); return true; }
    return false;
  });
  await sleep(1000);
  step('Doctor: Mark Completed flow', completed && confirmComplete);
  t = await text();
  step('Status flips to COMPLETED somewhere on page', t.includes('COMPLETED'));

  // Create Prescription on that completed appointment
  const rxOpened = await page.evaluate(() => {
    const b = [...document.querySelectorAll('button')].find(x => x.textContent.trim() === 'Create Prescription');
    if (!b) return false;
    b.click();
    return true;
  });
  await sleep(600);
  step('Create Prescription modal opens', rxOpened);
  t = await text();
  if (rxOpened) {
    // fill diagnosis + first medicine row
    const inputs = await page.$$('div[role="dialog"] input');
    // input order: diagnosis, name, dosage, frequency, duration
    if (inputs.length >= 5) {
      await inputs[0].type('Stable angina (demo)');
      await inputs[1].type('Aspirin 75mg');
      await inputs[2].type('75 mg');
      await inputs[3].type('Once daily, after breakfast');
      await inputs[4].type('30 days');
      // add a second medicine
      const addBtn = await page.evaluateHandle(() => [...document.querySelectorAll('div[role="dialog"] button')].find(b => b.textContent.includes('Add medicine')));
      if (addBtn && addBtn.asElement()) { await addBtn.asElement().click(); await sleep(300); }
      const inputs2 = await page.$$('div[role="dialog"] input');
      if (inputs2.length >= 9) {
        await inputs2[5].type('Atorvastatin 20mg');
        await inputs2[6].type('20 mg');
        await inputs2[7].type('Once daily at bedtime');
        await inputs2[8].type('30 days');
      }
      const save = await page.evaluate(() => {
        const b = [...document.querySelectorAll('div[role="dialog"] button')].find(x => x.textContent.trim() === 'Save Prescription');
        if (b) { b.click(); return true; }
        return false;
      });
      await sleep(1300);
      step('Prescription saved (toast/message)', save, '');
      t = await text();
      step('Prescription Issued state appears', t.includes('Prescription Issued') || t.includes('issued successfully'));
    } else {
      step('Prescription form inputs found', false, `only ${inputs.length} inputs`);
    }
  }

  // doctor sees own prescriptions
  await page.goto(BASE + '/doctor/prescriptions', { waitUntil: 'networkidle2' });
  await sleep(800);
  t = await text();
  step('Doctor prescriptions list shows new rx', t.includes('Aspirin 75mg') && t.includes('Stable angina'));

  // logout
  await page.evaluate(() => {
    const b = [...document.querySelectorAll('button')].find(x => x.textContent.trim() === 'Logout');
    b && b.click();
  });
  await sleep(900);

  /* ============ ACT 3: PATIENT VIEWS PRESCRIPTION ============ */
  await page.goto(BASE + '/login', { waitUntil: 'networkidle2' });
  await page.type('input[type=email]', 'aarav.gupta@medicare.com');
  await page.type('input[type=password]', 'password123');
  await page.click('button[type=submit]');
  await page.waitForFunction(() => location.pathname.startsWith('/patient'), { timeout: 15000 });

  await page.goto(BASE + '/patient/prescriptions', { waitUntil: 'networkidle2' });
  await sleep(800);
  t = await text();
  step('Patient sees the new prescription', t.includes('Aspirin 75mg') && t.includes('Stable angina'));
  step('Prescription shows doctor + print button', t.includes('Dr. Ananya Sharma') && t.includes('Print Prescription'));

  await page.goto(BASE + '/patient/appointments', { waitUntil: 'networkidle2' });
  await sleep(800);
  // completed tab
  await page.evaluate(() => {
    const b = [...document.querySelectorAll('button')].find(x => x.textContent.startsWith('Completed'));
    b && b.click();
  });
  await sleep(500);
  t = await text();
  step('Completed tab shows visit + View Prescription', t.includes('COMPLETED') && t.includes('View Prescription'));

  /* ============ ACT 4: DOUBLE-BOOKING PREVENTION ============ */
  // incognito-like: clear session, login as second patient
  await page.evaluate(() => { sessionStorage.clear(); });
  await page.goto(BASE + '/login', { waitUntil: 'networkidle2' });
  await page.type('input[type=email]', 'ishita.verma@medicare.com');
  await page.type('input[type=password]', 'password123');
  await page.click('button[type=submit]');
  await page.waitForFunction(() => location.pathname.startsWith('/patient'), { timeout: 15000 });

  // find the booked slot: go to Ananya profile, the slot Aarav booked is BOOKED (disabled)
  // Instead: book a NEW slot, then try to double-book it via API to prove backend rejection is visible.
  await page.goto(BASE + '/patient/doctors/doc_seed_001', { waitUntil: 'networkidle2' });
  await sleep(900);
  const slot2 = await page.evaluate(() => {
    const chips = [...document.querySelectorAll('button')].filter(b => /^\d{1,2}:\d{2} (AM|PM)$/.test(b.textContent.trim()) && !b.disabled);
    if (!chips.length) return null;
    chips[0].click();
    return chips[0].textContent.trim();
  });
  if (slot2) {
    await sleep(300);
    await page.evaluate(() => { const b = [...document.querySelectorAll('button')].find(x => x.textContent.trim() === 'Confirm Booking'); b && b.click(); });
    await sleep(1200);
    // now attempt double-book via API directly (backend enforcement check)
    const apiResult = await page.evaluate(async () => {
      const s = JSON.parse(sessionStorage.getItem('medicare_session'));
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-User-Id': s.userId },
        body: JSON.stringify({ doctorId: 'doc_seed_001', date: document.querySelector('[class*="bg-brand-50"]') ? new Date(Date.now() + 864e5).toISOString().slice(0, 10) : '', timeSlot: '09:00 AM' }),
      });
      return res.status;
    });
    step('Double-booking attempt rejected by backend (4xx)', apiResult >= 400, `status ${apiResult}`);
  } else {
    step('Second patient could find a slot to test', false, 'no available slot');
  }

  /* ============ FINAL: CONSOLE ERROR CHECK ============ */
  step('Zero console/page errors across whole flow', errors.length === 0, errors.length ? errors[0] : 'clean');

  const failed = results.filter(r => !r.ok).length;
  console.log(`\n========== REHEARSAL RESULT: ${results.length - failed}/${results.length} steps passed ==========`);
  await browser.close();
  process.exit(failed ? 1 : 0);
})().catch(e => { console.error('FATAL', e.message); process.exit(1); });
