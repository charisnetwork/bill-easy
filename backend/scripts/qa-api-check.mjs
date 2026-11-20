#!/usr/bin/env node
/**
 * Bill Easy API security checks that a browser tester can't run (role checks, cross-business
 * access, malformed IDs, password echo, CORS). Read-only except one QA staff record it creates
 * in business A and removes at the end.
 *
 * Needs three QA logins (all @example.com):
 *   A_EMAIL / A_PASSWORD          owner of business A
 *   B_EMAIL / B_PASSWORD          owner of a different business B (a different owner account)
 *   STAFF_EMAIL / STAFF_PASSWORD  a Staff login in business A with only "Mark attendance" ticked
 * Optional: BE_API (default https://bill-easy-production.up.railway.app),
 *           BE_ORIGIN (default https://charisbilleasy.store)
 *
 * Run:  A_EMAIL=… A_PASSWORD=… B_EMAIL=… B_PASSWORD=… STAFF_EMAIL=… STAFF_PASSWORD=… node scripts/qa-api-check.mjs
 * Prints PASS/FAIL per check; never prints passwords or tokens. Exit code 1 if anything fails.
 */

const API = (process.env.BE_API || 'https://bill-easy-production.up.railway.app').replace(/\/+$/, '');
const ORIGIN = process.env.BE_ORIGIN || 'https://charisbilleasy.store';
const accounts = {
  A: [process.env.A_EMAIL, process.env.A_PASSWORD],
  B: [process.env.B_EMAIL, process.env.B_PASSWORD],
  STAFF: [process.env.STAFF_EMAIL, process.env.STAFF_PASSWORD],
};
for (const [name, [email, password]] of Object.entries(accounts)) {
  if (!email || !password) { console.error(`Set ${name}_EMAIL and ${name}_PASSWORD`); process.exit(2); }
  if (!/@example\.com$/i.test(email)) { console.error(`${name}_EMAIL must be a QA address ending in @example.com`); process.exit(2); }
}

let failures = 0;
const result = (ok, label, detail = '') => {
  if (!ok) failures += 1;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}${detail ? `  (${detail})` : ''}`);
};

async function call(method, path, { token, body, headers = {} } = {}) {
  const response = await fetch(API + path, {
    method,
    headers: { origin: ORIGIN, ...(body ? { 'content-type': 'application/json' } : {}), ...(token ? { authorization: `Bearer ${token}` } : {}), ...headers },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await response.text();
  let json = null;
  try { json = JSON.parse(text); } catch { /* not JSON */ }
  return { status: response.status, text, json, headers: response.headers };
}

async function login(name) {
  const [email, password] = accounts[name];
  const response = await call('POST', '/api/auth/login', { body: { email, password } });
  if (response.status !== 200 || !response.json?.accessToken) {
    console.error(`Could not sign in as ${name} (HTTP ${response.status}: ${response.json?.error || response.json?.message || 'no message'})`);
    process.exit(2);
  }
  return { token: response.json.accessToken, companyId: response.json.company?.id };
}

/** The first record id in a list response, whatever its shape. */
function firstId(json) {
  const list = Array.isArray(json) ? json : Object.values(json || {}).find(Array.isArray);
  return list?.find((row) => row && typeof row.id === 'string')?.id ?? null;
}

const denied = (status) => [401, 403, 404].includes(status);

const main = async () => {
  console.log(`Bill Easy API checks against ${API}\n`);

  // 1. Password is never echoed back in errors.
  const secret = 'EchoCheck-Pass-7291!';
  for (const [path, body] of [
    ['/api/auth/login', { email: 'not-an-email', password: secret }],
    ['/api/auth/login', { email: 'nobody-qa@example.com', password: secret }],
    ['/api/auth/register', { email: 'not-an-email', password: secret, name: 'QA-TEST' }],
  ]) {
    const response = await call('POST', path, { body });
    result(!response.text.includes(secret), `no password echo: POST ${path} (${body.email})`, `HTTP ${response.status}`);
  }
  const unknown = await call('POST', '/api/auth/login', { body: { email: 'nobody-qa@example.com', password: secret } });
  result(!/not found|no account|doesn.t exist|not registered/i.test(unknown.text), 'login error does not say whether the email exists', `HTTP ${unknown.status}`);

  // 2. CORS: a foreign site gets no credentialed access.
  for (const method of ['OPTIONS', 'GET']) {
    const response = await fetch(`${API}/api/auth/me`, { method, headers: { origin: 'https://evil.example.com', 'access-control-request-method': 'GET' } });
    const allow = response.headers.get('access-control-allow-origin');
    result(allow !== 'https://evil.example.com' && allow !== '*', `CORS refuses a foreign origin (${method})`, `allow-origin: ${allow ?? 'none'}`);
  }

  const A = await login('A');
  const B = await login('B');
  const STAFF = await login('STAFF');
  result(A.companyId && B.companyId && A.companyId !== B.companyId, 'A and B are different businesses');

  // 3. A QA staff record in business A to aim at.
  const created = await call('POST', '/api/staff', { token: A.token, body: { name: 'QA-TEST API Check', salary_type: 'monthly', salary: 1000, weekly_offs: [0] } });
  const staffId = created.json?.id;
  result(created.status === 201 && staffId, 'owner A can add a staff member', `HTTP ${created.status}${created.json?.error ? `: ${created.json.error}` : ''}`);
  const today = new Date(Date.now() + 330 * 60_000).toISOString().slice(0, 10);
  const month = today.slice(0, 7);

  try {
    // 4. Staff login with only "Mark attendance".
    const staffList = await call('GET', '/api/staff', { token: STAFF.token });
    result(staffList.status === 200 && Array.isArray(staffList.json) && staffList.json.every((s) => s.salary === undefined), 'staff login sees the list without salaries', `HTTP ${staffList.status}`);
    for (const [method, path, body] of [
      ['GET', `/api/staff/payroll?month=${month}`],
      ['GET', `/api/staff/payroll/export?month=${month}`],
      ['GET', `/api/staff/payments?month=${month}`],
      ['POST', '/api/staff/payments', { staff_id: staffId, type: 'advance', amount: 1, month }],
      ['POST', '/api/staff', { name: 'QA-TEST Sneaky', salary: 1 }],
      ['PUT', `/api/staff/${staffId}`, { salary: 99999 }],
      ['DELETE', `/api/staff/${staffId}`],
      ['GET', '/api/company/users'],
      ['GET', '/api/subscription/current'],
    ]) {
      const response = await call(method, path, { token: STAFF.token, body });
      result(denied(response.status), `staff login refused: ${method} ${path.split('?')[0]}`, `HTTP ${response.status}`);
    }
    if (staffId) {
      const old = new Date(Date.parse(`${today}T00:00:00Z`) - 10 * 86400_000).toISOString().slice(0, 10);
      const locked = await call('PUT', '/api/staff/attendance', { token: STAFF.token, body: { date: old, entries: [{ staff_id: staffId, status: 'present' }] } });
      result([400, 403].includes(locked.status), 'staff login cannot change attendance 10 days back', `HTTP ${locked.status}`);
    }

    // 5. Business B can't reach A's staff.
    if (staffId) {
      for (const [method, path, body] of [
        ['PUT', `/api/staff/${staffId}`, { salary: 1 }],
        ['DELETE', `/api/staff/${staffId}`],
        ['GET', `/api/staff/${staffId}/attendance?month=${month}`],
        ['PUT', '/api/staff/attendance', { date: today, entries: [{ staff_id: staffId, status: 'absent' }] }],
        ['POST', '/api/staff/payments', { staff_id: staffId, type: 'advance', amount: 1, month }],
      ]) {
        const response = await call(method, path, { token: B.token, body });
        result(denied(response.status), `business B refused: ${method} ${path.split('?')[0]} (A's staff)`, `HTTP ${response.status}`);
      }
      const payments = await call('GET', `/api/staff/payments?month=${month}&staff_id=${staffId}`, { token: B.token });
      result(denied(payments.status) || (Array.isArray(payments.json) && payments.json.length === 0), "business B sees none of A's staff payments", `HTTP ${payments.status}`);
    }

    // 6. Business B can't read A's records anywhere, or switch into A with the company header.
    for (const resource of ['customers', 'suppliers', 'products', 'invoices', 'quotations', 'purchases', 'expenses']) {
      const list = await call('GET', `/api/${resource}`, { token: A.token });
      const id = firstId(list.json);
      if (!id) { console.log(`SKIP  ${resource}: business A has none to test with`); continue; }
      const response = await call('GET', `/api/${resource}/${id}`, { token: B.token });
      result(denied(response.status), `business B refused: GET /api/${resource}/:id (A's record)`, `HTTP ${response.status}`);
    }
    const header = await call('GET', '/api/customers', { token: B.token, headers: { 'x-company-id': A.companyId } });
    result(denied(header.status), "business B can't switch into A with X-Company-Id", `HTTP ${header.status}`);

    // 7. Bad input gives clean errors, never a 500 or database text.
    for (const id of ['abc', 'null', "' OR 1=1--", '../../etc/passwd']) {
      const response = await call('GET', `/api/staff/${encodeURIComponent(id)}/attendance`, { token: A.token });
      result(response.status >= 400 && response.status < 500 && !/sequelize|syntax|pg_|SELECT|stack/i.test(response.text), `malformed id gives a clean error: ${id}`, `HTTP ${response.status}`);
    }
    const future = new Date(Date.parse(`${today}T00:00:00Z`) + 3 * 86400_000).toISOString().slice(0, 10);
    if (staffId) {
      const response = await call('PUT', '/api/staff/attendance', { token: A.token, body: { date: future, entries: [{ staff_id: staffId, status: 'present' }] } });
      result(response.status === 400, 'attendance for a future date is refused (API)', `HTTP ${response.status}`);
      const times = await call('PUT', '/api/staff/attendance', { token: A.token, body: { date: today, entries: [{ staff_id: staffId, status: 'present', check_in: '18:00', check_out: '09:00' }] } });
      result(times.status === 400, 'check-out before check-in is refused (API)', `HTTP ${times.status}`);
      const type = await call('PUT', `/api/staff/${staffId}`, { token: A.token, body: { salary_type: 'weekly' } });
      result(type.status === 400, 'unknown salary type is refused (API)', `HTTP ${type.status}`);
      const name = await call('PUT', `/api/staff/${staffId}`, { token: A.token, body: { name: 'Q' } });
      result(name.status === 400, '1-letter name is refused (API)', `HTTP ${name.status}`);
    }
    const search = await call('GET', `/api/customers?search=${encodeURIComponent("'\"<script>{{7*7}}")}`, { token: A.token });
    result(search.status < 500 && !search.text.includes('{{49}}'), 'search with quotes/script/template text is handled', `HTTP ${search.status}`);

    // 8. Logout ends the session.
    const logout = await call('POST', '/api/auth/logout', { token: STAFF.token });
    const after = await call('GET', '/api/staff', { token: STAFF.token });
    result(after.status === 401, 'after logout the old access token stops working', `logout HTTP ${logout.status}, then HTTP ${after.status}`);
  } finally {
    if (staffId) {
      const removed = await call('DELETE', `/api/staff/${staffId}`, { token: A.token });
      console.log(`\nCleanup: QA staff record ${removed.status === 200 ? 'removed' : `NOT removed (HTTP ${removed.status})`}`);
    }
  }

  console.log(`\n${failures ? `${failures} check(s) FAILED` : 'All checks passed'}`);
  process.exit(failures ? 1 : 0);
};

main().catch((error) => { console.error('Stopped:', error.message); process.exit(2); });
