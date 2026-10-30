# Control Centre plans, modern invoice templates, cleanup — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bill Easy enforces three Charis OS plans (Free / Premium / Pro), ships eight real invoice templates that look the same on screen and in PDF, talks to NVIDIA Nemotron for AI, and carries no legacy subscription code.

**Architecture:** Charis OS snapshot is the only source of plan data (`services/charisOsService.js`). One `services/usageLimits.js` turns any feature code into a gate (on/off, limit counted from records, or limit counted in a new `usage_counters` table). Invoice templates are data (`invoiceTemplates.json`, kept identical in backend and frontend) rendered by one React renderer and one pdfkit renderer.

**Tech Stack:** Node/Express 5, Sequelize (`sequelize.sync`), pdfkit, `node --test`; React 18 + Vite + Tailwind + shadcn/radix; Charis OS (FastAPI, local Docker stack in `../charis_deploy`).

**Spec:** `docs/superpowers/specs/2026-10-30-plans-templates-cleanup-design.md`

## Global Constraints

- Plan, price, coupon and feature decisions live only in Charis OS. No plan names (`'Free'`, `'Premium'`, `'Enterprise'`, …) in Bill Easy code paths that gate anything.
- Unknown or missing entitlement = denied. OS unreachable with expired cache = 503 (existing behaviour).
- Monthly limits reset at the start of the month in Asia/Kolkata (`startOfMonthIst`).
- Over-limit response: HTTP 403 `{ code: 'QUOTA_EXCEEDED', feature, limit, used, upgradeRequired: true, error }`; missing feature: 403 `{ code: 'FEATURE_NOT_AVAILABLE', feature, upgradeRequired: true, error }`.
- Report exports count; on-screen report views never count. AI messages count only when the model is called.
- Keys only in git-ignored `backend/.env` / Railway variables, never in `VITE_*`, code, docs or chat.
- No push, deploy, or real payment without the user's explicit go-ahead.

## Review Focus

- Two exports/AI messages fired in parallel at `limit - 1` must let exactly one through → concurrency test in Task 3.
- A user who downgrades from Pro to Free keeps a saved Pro template: invoices still render (fallback to `modern` for display) but saving settings again with it is refused → test in Task 8.
- Settings PATCH with a made-up `template_id` or `accent` that is not `#RRGGBB` → 400, test in Task 8.
- AI provider down / key missing → chat returns 503 "AI is unavailable" and does **not** consume an `ai_messages` unit → test in Task 6.
- A business at its godown limit can still edit/delete existing godowns and transfer stock → test in Task 4.

---

### Task 1: Backend cleanup — OS is the only subscription source

**Files:**
- Modify: `backend/server.js` (remove `@charis/sdk` init ~L340-380, `/api/webhooks/charis`, `/api/webhooks/razorpay` ~L386, `seedPlans` ~L475-600 and its call, "powered by Gemini" log; fail fast if OS variables missing)
- Modify: `backend/services/charisOsService.js` (`enabled()` always true when configured; drop `CHARIS_SUBSCRIPTION_MODE`)
- Modify: `backend/middleware/auth.js` (delete local branch of `checkSubscriptionQuota` and of `checkFeatureAccess`, the `isFreeAccount`/`isPremium` fallbacks; planName text comes from snapshot)
- Modify: `backend/middleware/reportAccess.js` (drop `SubscriptionGuard` branch)
- Modify: `backend/routes/subscription.js` (remove `/upgrade`, `/payment`, `/validate-coupon`, `/cancel`; keep OS catalog/quote/order/verify/sync)
- Delete: `backend/sdk/`, `backend/middleware/entitlementGuard.js`, `backend/utils/subscriptionGuard.js` (after `grep` shows no remaining users), local plan seed/migration code that only serves local plans
- Modify: `backend/package.json` (remove `@charis/sdk`)
- Test: `backend/tests/charisOsService.test.js`

**Interfaces:**
- Produces: `charisOs.osConnection()` throws `Error('CHARIS_OS_URL, CHARIS_OS_APP_ID and CHARIS_OS_APP_KEY are required')` when unset; server startup calls it before `listen`.

- [ ] **Step 1:** Write test `startup requires OS connection`: `assert.throws(() => osConnection({}), /CHARIS_OS_URL/)`; and `no gating code mentions plan names`: read `middleware/auth.js`, `middleware/reportAccess.js` and assert they do not match `/'(Free|Premium|Enterprise)( Account)?'/`.
- [ ] **Step 2:** Run `cd backend && npm test` — expect both new tests to FAIL.
- [ ] **Step 3:** Make the edits listed under Files. `grep -rn "CONTROL_CENTER_\|CharisSDK\|SubscriptionGuard\|entitlementGuard\|CHARIS_SUBSCRIPTION_MODE" backend --include=*.js | grep -v node_modules` must return nothing.
- [ ] **Step 4:** `npm test` PASS; `node -e "require('./server')"` with `.env` pointing at local OS starts without errors (stop it after "listening").
- [ ] **Step 5:** Commit `Remove legacy SDK and local plans; Charis OS is the only subscription source`.

### Task 2: Repo and frontend cleanup

**Files:**
- Git-untrack: `frontend/dist/`, `frontend/.env` (add both to `frontend/.gitignore`; keep `frontend/.env.example`, add any missing `VITE_*` names to it with empty values)
- Delete after user confirms the list: `GEMINI.md`, `audit-tools/`, `downloads.html` (if no route/link references it), `DEPLOYMENT_ADMIN_SETUP.md`, `DEPLOYMENT_CLOUDFLARE.md`, `DEPLOYMENT_GUIDE.md`, `DEPLOYMENT_VERCEL_RAILWAY.md`, `RAILWAY_DEPLOYMENT.md`
- Create: `DEPLOYMENT.md` (one guide: Railway backend variables incl. `CHARIS_OS_*`, `AI_PROVIDER`, `NVIDIA_*`; frontend hosting; OS plan checklist from Task 10)
- Modify: `frontend/src/pages/SubscriptionPage.jsx` → only renders `CharisOsSubscription` (delete local plan UI, local Razorpay, local coupon code)
- Modify: `frontend/src/pages/SettingsPage.jsx` (delete unused `customForm`, `getPlanName`, `freeTemplates`, `premiumTemplates`, `isTemplateLocked` — the picker is rebuilt in Task 8)
- Modify: `README.md` (what Bill Easy is, how to run locally against the local OS)

- [ ] **Step 1:** Print the candidate delete list with `git ls-files` sizes and **ask the user to confirm** before deleting.
- [ ] **Step 2:** Apply; `grep -rn "getPlanName\|premiumTemplates\|plan_name === " frontend/src` returns nothing.
- [ ] **Step 3:** `cd frontend && npm run build` PASS.
- [ ] **Step 4:** Commit `Clean repo: untrack build output and env, one deployment guide, OS-only plan page`.

### Task 3: Usage counters and one gate for every feature code

**Files:**
- Modify: `backend/models/index.js` (define `UsageCounter`: `company_id UUID`, `feature_code STRING(64)`, `period STRING(7)` `'YYYY-MM'`, `count INTEGER default 0`; unique index on the three keys)
- Create: `backend/services/usageLimits.js`
- Modify: `backend/middleware/auth.js` (`checkSubscriptionQuota` and `checkFeatureAccess` become thin wrappers over `usageLimits`)
- Modify: `backend/services/charisOsService.js` (`BILLEASY_FEATURES` final list below; `usageFor` adds `purchase_bills`, `godowns`)
- Test: `backend/tests/usageLimits.test.js`

`BILLEASY_FEATURES` (code · kind · reset):
`invoices` limit monthly · `products` limit total · `purchase_bills` limit monthly · `purchase_orders` on/off · `godowns` limit total · `businesses` limit total · `report_exports` limit monthly · `ai_messages` limit monthly · `ai_assistant` · `advanced_reports` · `enterprise_reports` · `eway_bills` · `staff_attendance_payroll` · `recurring_invoices` · `bulk_download_print_invoices` · `premium_templates` · `pro_templates` · `ai_invoice_design` · `gst_billing` · `inventory_management` · `quotations` · `reports`. `multi_godowns` is removed (replaced by `godowns`).

**Interfaces:**
- Produces:
  - `requireFeature(code) → express middleware` (403 FEATURE_NOT_AVAILABLE)
  - `requireRecordLimit(code) → middleware` for `invoices|products|purchase_bills|godowns` (count from `usageFor`)
  - `consumeMonthly(companyId: string, code: 'report_exports'|'ai_messages', now?: Date) → Promise<{ used: number, limit: number|null }>`; throws `QuotaError { status: 403, code: 'QUOTA_EXCEEDED', feature, limit, used }`; atomic: one `INSERT … ON CONFLICT (company_id, feature_code, period) DO UPDATE SET count = usage_counters.count + 1 WHERE usage_counters.count < :limit RETURNING count` (no row returned = over limit); `limit === null` still increments.
  - `refundMonthly(companyId, code, now?) → Promise<void>` (decrement, floor 0) for failed AI calls.
  - `usageSummary(companyId) → Promise<Record<code, { used, limit }>>` for the plan page.

- [ ] **Step 1:** Tests (real Postgres from `DATABASE_URL`, skip with `t.skip` when unset): `consumeMonthly allows exactly limit units` (limit 10 → 10 succeed, 11th throws QUOTA_EXCEEDED with `used: 10`); `parallel consumption at limit-1 lets one through` (`Promise.allSettled` of 5 calls with 9 used → 1 fulfilled); `new month starts at zero` (`now` = 2026-11-01T00:00+05:30); `unlimited still counts`; `requireRecordLimit` returns 403 body shape from Global Constraints with a stubbed snapshot.
- [ ] **Step 2:** `npm test` — FAIL.
- [ ] **Step 3:** Implement.
- [ ] **Step 4:** `npm test` PASS.
- [ ] **Step 5:** Commit `Usage counters and a single feature/limit gate`.

### Task 4: Apply gates to purchases, POs, godowns, businesses, reports

**Files:**
- Modify: `backend/routes/purchases.js` (`POST /` and `/parse-pdf` → `requireRecordLimit('purchase_bills')`)
- Modify: `backend/routes/purchaseOrders.js` (`router.use(requireFeature('purchase_orders'))`)
- Modify: `backend/routes/company.js` (`POST /godowns` → `requireRecordLimit('godowns')`; PUT/DELETE/transfer: no gate)
- Modify: `backend/controllers/companyController.js` / `authController.js` (business limit already via `businessLimit`; keep, confirm it reads `businesses`)
- Modify: `backend/routes/reports.js` (add `POST /exports` → `consumeMonthly('report_exports')` → `{ used, limit }`; `/gstr-1/download` also consumes)
- Modify: `backend/routes/subscription.js` (`GET /usage` → `usageSummary`)
- Modify frontend: `frontend/src/lib/api.js` (axios interceptor: 403 with `upgradeRequired` opens `UpgradeDialog`), create `frontend/src/components/UpgradeDialog.jsx` (feature name, "used X of Y this month", button to `/subscription`)
- Modify frontend: `ReportsPage.jsx`, `ProductsPage.jsx`, `InvoicePreview.jsx`, `QuotationPreview.jsx`, `PurchaseOrderPreview.jsx` — every report export/print calls `reportsAPI.recordExport()` first and stops if it rejects (invoice/quotation/PO prints are documents, not reports: they do **not** count — only `ReportsPage` exports count)
- Modify frontend: `components/dashboard/Sidebar.jsx` (Purchase Orders hidden behind `hasFeature('purchase_orders')` with lock like E-way; Stock Transfer shown when godown limit > 1; staff/recurring/e-way show lock for non-Pro via their codes)
- Test: `backend/tests/gates.test.js`

- [ ] **Step 1:** Tests with stubbed snapshot + supertest-style direct middleware calls: PO route 403 when `purchase_orders` off; godown create 403 at limit 2 with 2 godowns, but PUT on an existing godown passes; `POST /reports/exports` 11th call 403 on limit 10.
- [ ] **Step 2:** FAIL → implement → PASS (`npm test`), `npm run build` in frontend PASS.
- [ ] **Step 3:** Commit `Enforce purchase bills, POs, godowns and report export limits`.

### Task 5: Business switcher and godown selector

**Files:**
- Modify: `frontend/src/components/dashboard/Sidebar.jsx` (or top bar component that holds `switchCompany`): a visible business switcher — current business name + dropdown/segmented toggle listing the owner's businesses, "Add business" item shows `used / limit` and opens `UpgradeDialog` at limit
- Modify: stock-picking screens that choose a godown (`CreateInvoicePage.jsx`, `CreatePurchasePage.jsx`, `StockTransferPage.jsx`): godown select shown only when the business has more than one godown

- [ ] **Step 1:** Implement; `npm run build` PASS.
- [ ] **Step 2:** Manual check deferred to Task 11 (QA list item "switch business").
- [ ] **Step 3:** Commit `Business switcher and godown selector`.

### Task 6: AI provider — NVIDIA Nemotron with quick search

**Files:**
- Create: `backend/services/aiProvider.js`
- Create: `backend/services/aiQuickSearch.js`
- Modify: `backend/controllers/aiController.js` (remove `@google/genai`; tools become OpenAI-style `tools`/`tool_calls`; PDF parse uses the provider with extracted text)
- Modify: `backend/routes/ai.js` (chat: `requireFeature('ai_assistant')`, then controller handles `ai_messages`)
- Modify: `backend/package.json` (remove `@google/genai`)
- Modify: `backend/.env` (git-ignored): `AI_PROVIDER=nvidia`, `NVIDIA_API_KEY=<from the user's file in ~/Documents>`, `NVIDIA_MODEL=<chosen in Step 1>`, `NVIDIA_BASE_URL=https://integrate.api.nvidia.com/v1`
- Test: `backend/tests/ai.test.js`

**Interfaces:**
- Produces: `aiProvider.chat({ messages, tools?, temperature? }) → Promise<{ content: string, toolCalls: Array<{ name, arguments: object }> }>`; throws `AiUnavailableError` on missing key, network error or non-2xx. Uses global `fetch` POST `${NVIDIA_BASE_URL}/chat/completions`, 30 s timeout via `AbortSignal.timeout`.
- Produces: `aiQuickSearch.answer(companyId, text) → Promise<null | { reply: string, data: object }>` — matches invoice number (`/^(inv[-\s]?)?\d+$/i` or existing invoice_number), exact customer/supplier/product name, and the phrases "dues", "outstanding", "low stock", "today's sales"; returns `null` otherwise.
- Controller flow: quick search → if answer, reply (no counting); else `consumeMonthly('ai_messages')` → `aiProvider.chat` → on `AiUnavailableError` `refundMonthly` and 503 `{ code: 'AI_UNAVAILABLE' }`.

- [ ] **Step 1:** `curl -s -H "Authorization: Bearer $NVIDIA_API_KEY" https://integrate.api.nvidia.com/v1/models | jq -r '.data[].id' | grep -i nemotron` — pick the newest Nemotron instruct model that supports tool calling; record it in `.env` and `DEPLOYMENT.md`.
- [ ] **Step 2:** Tests (mock `fetch`): `quick search for 'INV-102' answers without calling fetch or consuming`; `AI answer consumes one unit`; `provider 500 refunds the unit and returns 503`; `missing NVIDIA_API_KEY → 503 AI_UNAVAILABLE`.
- [ ] **Step 3:** FAIL → implement → PASS.
- [ ] **Step 4:** Live check: one real chat question against the local backend returns an answer.
- [ ] **Step 5:** Commit `AI on NVIDIA Nemotron behind a provider adapter; quick search is free`.

### Task 7: Template engine — eight templates, screen and PDF from one definition

**Files:**
- Create: `frontend/src/lib/invoiceTemplates.json` and identical `backend/config/invoiceTemplates.json`
- Create: `frontend/src/components/invoice/InvoiceDocument.jsx` (single renderer; replaces the four files in `components/invoice-templates/` and the inline JSX blocks in `InvoicePreview.jsx` and the settings preview)
- Create: `frontend/src/components/invoice/TemplateThumbnail.jsx` (renders `InvoiceDocument` with sample data scaled to a card)
- Create: `backend/services/invoicePdf/` — `index.js` (`generateInvoicePdf(invoice, company)` same export), `layout.js` (shared primitives: header variants, party block, items table, tax summary, totals, bank/UPI/QR, signature, footer), `paper.js` (A4 595×842 pt, A5 420×595 pt, thermal 80 mm = 227 pt wide, height grows with rows)
- Delete: `backend/services/invoicePdfService.js` (after switch), `backend/services/invoiceTemplates/*` if only used by the old service (grep first), `frontend/src/components/invoice-templates/`
- Modify: `backend/controllers/invoiceController.js` (import path), `frontend/src/pages/InvoicePreview.jsx` (use `InvoiceDocument`)
- Test: `backend/tests/invoiceTemplates.test.js`

Template definition shape (each entry in the JSON array):
`{ id, name, tier: 'free'|'premium'|'pro', header: 'band'|'split'|'centered'|'compact', table: 'lined'|'striped'|'boxed'|'plain', accent: '#RRGGBB', font: 'inter'|'serif'|'mono', density: 'normal'|'compact', papers: ['A4','A5','thermal'] }`

| id | name | tier | header | table | accent | font | papers |
| --- | --- | --- | --- | --- | --- | --- | --- |
| modern | Modern | free | band | striped | #4F46E5 | inter | A4, A5 |
| classic-gst | Classic GST | free | split | boxed | #0F766E | inter | A4, A5 |
| minimal | Minimal | free | split | plain | #0F172A | inter | A4, A5 |
| thermal | Thermal | free | compact | plain | #000000 | mono | thermal |
| bold | Bold | premium | band | boxed | #DC2626 | inter | A4, A5 |
| elegant | Elegant | premium | centered | lined | #8B5CF6 | serif | A4, A5 |
| corporate | Corporate | pro | split | striped | #1D4ED8 | inter | A4 |
| creative | Creative | pro | centered | striped | #E66E26 | inter | A4 |

Settings that every renderer honours (company `settings`): `template_id`, `accent`, `font`, `paper`, `logo_position: 'left'|'right'|'center'`, `columns: { hsn, discount, tax_split, batch, expiry, free_qty, description, alt_unit }`, `party: { phone, gstin, shipping_address, place_of_supply }`, `show: { bank, upi_qr, signature, terms, po_number, eway_bill, vehicle_number, time, party_balance }`, `footer_note`. Old keys (`theme_color`, `show_item_description`, `show_phone_number`, …) map onto these in a one-time read adapter `normalizeInvoiceSettings(settings)` exported from both renderers' shared helper (frontend `lib/invoiceSettings.js`, backend `services/invoicePdf/settings.js`, same tests).

- [ ] **Step 1:** Tests: `backend and frontend template JSON are identical` (deep-equal both files); `every template renders a PDF for each of its papers` (generate with a 3-item fixture invoice, buffer starts with `%PDF`, page width matches `paper.js`); `thermal PDF is 227pt wide and grows with 40 items`; `normalizeInvoiceSettings maps theme_color to accent and unknown template to modern`; `CGST/SGST split when intra-state, IGST when inter-state` (fixture with company state KA, customer state KA vs MH).
- [ ] **Step 2:** FAIL → implement → PASS; `npm run build` PASS.
- [ ] **Step 3:** Visual parity check: render `modern`, `classic-gst`, `thermal` for the same invoice on screen (browser) and as PDF; screenshots side by side in scratchpad; fix layout differences visible at a glance.
- [ ] **Step 4:** Commit `One template engine: eight invoice templates, screen and PDF from one definition`.

### Task 8: Settings — Invoice design, business profile, bank, AI design

**Files:**
- Modify: `frontend/src/pages/SettingsPage.jsx` (replace the `invoice-customization` block with `<InvoiceDesignSettings />`; keep logo upload in Business profile and bank/UPI/QR/terms in Bank & payments, both feeding `InvoiceDocument`)
- Create: `frontend/src/components/settings/InvoiceDesignSettings.jsx` (left: live `InvoiceDocument` with the business's last invoice or sample data; right: template grid of `TemplateThumbnail` with lock + plan label from `hasFeature('premium_templates'|'pro_templates')`, accent swatches + custom colour, font, paper, logo position, column toggles, party fields, show toggles, footer note; Save / Revert)
- Create: `backend/services/invoiceDesign.js` (`validateInvoiceSettings(input, snapshot) → { value } | throws ValidationError(400) | QuotaError-style 403`) and `suggestDesign({ industry, logoColors }) → { template_id, accent, columns }`
- Modify: `backend/controllers/companyController.js` (`PATCH /company/settings` runs `validateInvoiceSettings` for invoice keys)
- Modify: `backend/routes/company.js` (`POST /company/invoice-design/suggest` → `requireFeature('ai_invoice_design')`; logo colours extracted server-side from the stored logo with `sharp` if already a dependency, else the browser sends up to 3 hex colours sampled from the logo canvas)
- Test: `backend/tests/invoiceDesign.test.js`

`suggestDesign` asks `aiProvider.chat` for JSON `{template_id, accent, columns}`, validates it with `validateInvoiceSettings`; on invalid JSON or `AiUnavailableError` falls back to the industry default from Task 9. Does not consume `ai_messages`.

- [ ] **Step 1:** Tests: unknown `template_id` → 400; accent `red` → 400; `bold` without `premium_templates` → 403 FEATURE_NOT_AVAILABLE; `bold` with it → ok; `corporate` with only `premium_templates` → 403; downgraded company with saved `corporate` can still save other keys when `template_id` is unchanged → ok, and PDF renders `corporate` (no silent change of past look); `suggestDesign` with garbage model output → industry default.
- [ ] **Step 2:** FAIL → implement → PASS; build PASS.
- [ ] **Step 3:** Commit `Invoice design settings with real controls, plan locks and AI suggestion`.

### Task 9: Industry / firm type at signup → recommended template

**Files:**
- Modify: `backend/config/industries.js` and `frontend/src/lib/industryConfig.js` (same list; add `recommendedTemplate` and default `columns` per group)
- Modify: `frontend/src/pages/RegisterPage.jsx` and `AddBusinessPage.jsx` (searchable grouped picker with icons; required)
- Modify: `backend/controllers/authController.js` (signup/add-business stores `business_category` and seeds `settings` from `recommendedTemplate` + columns)
- Test: `backend/tests/industries.test.js`

Industries (group → recommended template, default columns on):
Retail & shops: General Store, Supermarket/Kirana, Retail Shop, Cloth & Garments, Footwear, Electronics & Mobile, Hardware & Paints, Jewellery, Stationery & Books, Furniture → `modern` (hsn, discount)
Wholesale: Distribution, Wholesale Trader, FMCG Agency → `classic-gst` (hsn, tax_split, free_qty)
Manufacturing: Manufacturing, Printing & Packaging → `classic-gst` (hsn, tax_split)
Services: IT and Consultant, Consultant, Freelancer, Agency/Marketing, Education/Coaching, Salon & Spa, Events → `minimal` (description; hsn off)
Healthcare: Health Care/Clinic, Hospital, Diagnostic Lab → `minimal` (description)
Pharma: Pharma/Medical Store → `classic-gst` (batch, expiry, hsn)
Food & hospitality: Restaurants/Café, Bakery & Sweets, Hotel → `thermal` for Restaurants/Café and Bakery & Sweets, `modern` for Hotel (description)
Automobile: Automobile, Service Center/Garage → `modern` (hsn, description)
Logistics: Logistics, Transport → `classic-gst` (vehicle_number, eway_bill)
Construction: Construction/Contractor, Real Estate → `minimal` (description)
Other → `modern`
Existing industry names stay valid (old companies keep working).

- [ ] **Step 1:** Tests: backend and frontend industry names identical; every `recommendedTemplate` is a `free` tier template id (so Free signups never get a locked default); old names `Restaurants`, `Pharma`, `Hospital` still resolve.
- [ ] **Step 2:** FAIL → implement → PASS; build PASS.
- [ ] **Step 3:** Commit `Industry picker at signup seeds a matching invoice template`.

### Task 10: Plans and coupon in the local Charis OS

Done in the OS web UI (`http://os.localhost:8080`) in the built-in browser; the user signs in if a login is needed.

- [ ] **Step 1:** Restart Bill Easy backend so `BILLEASY_FEATURES` publishes; in OS → Bill Easy → features list shows the new codes (`purchase_bills`, `purchase_orders`, `godowns`, `report_exports`, `ai_messages`, `premium_templates`, `pro_templates`, `ai_invoice_design`).
- [ ] **Step 2:** Archive Free, Plus Monthly/Yearly, Pro Monthly/Yearly, Enterprise Yearly.
- [ ] **Step 3:** Create plans exactly as the spec table: `Free` ₹0; `Premium Monthly` ₹150 (compare ₹470), `Premium Yearly` ₹1,500 (compare ₹4,700), badge "Inaugural offer"; `Pro Monthly` ₹300 (compare ₹770), `Pro Yearly` ₹3,000 (compare ₹7,700), badge "Inaugural offer"; same pricing group per tier; entitlements and limits per spec; Pro recommended on the plan page; all visible.
- [ ] **Step 4:** Coupon `WELCOME`, percentage, 10 %, paid plans only, promotion (not partner).
- [ ] **Step 5:** Add the same checklist to `DEPLOYMENT.md` for the Railway OS; commit `Deployment checklist for Control Centre plans`.

### Task 11: Local QA of both apps

Start OS stack (`../charis_deploy`, already running) and Bill Easy backend + frontend from this repo (`.claude/launch.json`), then in the built-in browser:

- [ ] Sign up with industry Pharma → Free plan active → default template Classic GST with batch/expiry columns.
- [ ] Free limits: 51st invoice, 101st item, 51st purchase bill, 11th report export, 11th AI message each show the upgrade dialog; quick search "INV-1" never counts; Purchase Orders locked; second godown and second business blocked.
- [ ] Plan page: three plans, strike-through prices, Inaugural badge, `WELCOME` reduces the price in the quote; paid upgrade through the Razorpay test stand-in used in earlier OS QA (no real payment).
- [ ] Premium: Bold/Elegant unlocked, Corporate/Creative locked, 2 businesses with the switcher, 2 godowns, e-way bills and staff locked.
- [ ] Pro: everything unlocked, AI design suggestion applies.
- [ ] Every template on screen vs PDF download (A4, A5, thermal) look the same.
- [ ] Charis Civil plan page still loads its plans (regression).
- [ ] Record results and any fixes; `npm test` (backend) and `npm run build` (frontend) PASS at the end.
