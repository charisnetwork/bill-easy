# Bill Easy: Control Centre plans, modern invoice templates, cleanup — design

Date: 2026-10-30 · Status: awaiting review

## Why

Bill Easy is the product pitched to Microsoft for Startups (Founders Hub) as an AI-powered billing
and GST app for Indian small businesses. Reviewers will click through it, so it must look modern
and every visible option must be real. Charis OS (the Control Centre) is the only place plans,
prices, coupons and feature access are decided; Bill Easy only enforces what OS says.

## What the user decided

- Three plans only: **Free**, **Premium**, **Pro**, monthly and yearly.
- Reports limit counts **each download/export/print**; viewing on screen is free.
- AI limit counts **only real AI answers**; a plain database quick search (invoice no., customer
  name) never counts.
- Invoice and purchase-bill limits **reset monthly** (India time); items are a total cap.
- Pro yearly offer price is **₹3,000**.
- AI provider for now: **NVIDIA Nemotron**, swappable later (Azure OpenAI after credits).
- Local QA of both apps in the browser before anything is pushed or hosted.

## Sub-projects (built in this order)

### 1. Cleanup

Remove, after showing the user the list:

- Legacy Control Centre SDK: `@charis/sdk` init and `/api/webhooks/charis` in `backend/server.js`,
  `backend/sdk/`, all `CONTROL_CENTER_*` variables.
- Local subscription mode: `CHARIS_SUBSCRIPTION_MODE` off-path, local plan tables' use for gating,
  hard-coded plan-name limits in `middleware/auth.js` (`isFreeAccount`, 50/200/1000 fallbacks),
  unverified `/subscription/upgrade`, `/payment`, `/validate-coupon`, `/cancel`, local Razorpay
  webhook and `RAZORPAY_*` use. Bill Easy always talks to OS. `CHARIS_SUBSCRIPTION_MODE` is dropped;
  missing OS variables fail startup with a clear message.
- Unused code: `middleware/entitlementGuard.js`, the second `customForm` in `SettingsPage.jsx`,
  frontend plan-name locking (`getPlanName`, `freeTemplates`, `premiumTemplates`).
- Repo hygiene: `frontend/dist/` out of git, `frontend/.env` out of git (keep `.env.example`),
  stale deploy docs merged into one `DEPLOYMENT.md` (Railway + OS), `GEMINI.md`, `audit-tools/`,
  `downloads.html` reviewed and removed if unused. Android project stays.
- Frontend: plan-gated UI reads `hasFeature(code)` / limits from the subscription snapshot only.

### 2. Plans and enforcement

New feature codes published in `BILLEASY_FEATURES` (OS shows them in the plan editor):

| Code | Kind | Enforced at |
| --- | --- | --- |
| `invoices` | limit, monthly | create invoice (existing) |
| `products` | limit, total | create product (existing) |
| `purchase_orders` | on/off | all purchase-order routes |
| `purchase_bills` | limit, monthly | create purchase bill (`routes/purchases.js`) |
| `report_exports` | limit, monthly | report PDF/Excel export and print endpoints |
| `ai_messages` | limit, monthly | `/api/ai/chat`, only when the AI model is called |
| `premium_templates` | on/off | saving a premium template / branding options |
| `ai_invoice_design` | on/off | AI template suggestion |
| existing: `eway_bills`, `multi_godowns`, `staff_attendance_payroll`, `recurring_invoices`, `bulk_download_print_invoices`, `advanced_reports`, `enterprise_reports`, `ai_assistant`, `businesses` | | unchanged |

Counting: invoices, products and purchase bills are counted from Bill Easy's own records. Report
exports and AI messages use a new Bill Easy table `usage_counters (company_id, feature_code,
period 'YYYY-MM', count)` with an atomic check-and-increment, so two parallel requests cannot
exceed the limit. An over-limit request returns 403 `LIMIT_REACHED` with the limit and the plan
page link; the frontend shows an upgrade prompt.

Plans created in the **local** OS through its web UI (the six existing local plans are archived):

| | Free | Premium | Pro |
| --- | --- | --- | --- |
| Monthly / yearly price | ₹0 | ₹150 / ₹1,500 (was ₹470 / ₹4,700) | ₹300 / ₹3,000 (was ₹770 / ₹7,700) |
| Badge | — | Inaugural offer | Inaugural offer, recommended |
| Invoices / month | 50 | 500 | unlimited |
| Purchase orders | off | on | on |
| Purchase bills / month | 50 | 500 | unlimited |
| Items | 100 | 500 | unlimited |
| Report exports / month | 10 | unlimited | unlimited |
| AI messages / month | 10 | 50 | unlimited |
| E-way bills | off | off | on |
| Premium templates, AI design | off | off | on |
| Everything else | off | per OS editor (default: GST billing, inventory, quotations, reports on) | on |

"Was" prices use OS `compare_at_price`, so the plan card shows the strike-through. A separate
coupon (e.g. `INAUGURAL`) is created in OS for QA; its real discount value is the user's to set
in OS. Production OS on Railway gets the same plans by the user in the OS UI, following a
checklist in `DEPLOYMENT.md`.

### 3. AI provider

`backend/services/aiProvider.js` exposes one `chat(messages, options)`; provider chosen by
`AI_PROVIDER=nvidia` with `NVIDIA_API_KEY`, `NVIDIA_MODEL` (Nemotron, OpenAI-compatible endpoint
`https://integrate.api.nvidia.com/v1`). Gemini code removed. The chat controller first tries a
database quick search (invoice number, customer, product, "dues"); only if it needs the model does
it consume `ai_messages`. Keys never reach the frontend.

### 4. Industry and invoice templates

- Signup: industry / firm type picker with more options (retail, wholesale/distribution,
  manufacturing, services/consulting, healthcare/clinic, pharmacy, restaurant/café, hotel,
  automobile/garage, logistics/transport, construction/contractor, electronics & mobile, textile &
  garments, jewellery, education/coaching, freelancer, other). Stored as `business_category`;
  existing `config/industries.js` extra fields extended to the new types.
- Templates: one shared **template definition** (layout + style tokens) per template, rendered by
  React for screen and by the PDF service from the same definition, so screen and PDF match.
  Six real templates: **Modern**, **Classic GST** (Tally-style, full tax table), **Minimal**,
  **Bold**, **Elegant**, **Thermal 80 mm**. Paper size A4 / A5 / 80 mm is a setting, not a template.
  Free: Modern, Classic GST, Minimal, Thermal. Others need `premium_templates`.
- Industry → recommended template and default fields (e.g. pharmacy → Classic GST with batch/
  expiry columns; restaurant → Thermal; services → Minimal without HSN-heavy columns).
- Settings → **Invoice design** (one screen, live preview from the real renderer, real thumbnails):
  template, accent colour, font (3 choices), logo position, paper size, item-table columns (HSN,
  discount, tax split, batch/expiry, free qty), party fields, footer note, signature/stamp.
  The placeholder accordions are replaced with these real controls.
- Settings → **Business profile**: logo upload. Settings → **Bank & payments**: bank details,
  UPI ID / QR, terms. (Both exist; check they feed every template.)
- **AI design** (Pro): "Suggest a design" reads business type and logo colours and returns a
  template + accent + columns, shown as a preview the user can apply or discard.
- Backend validates `PATCH /company/settings`: unknown template id rejected; premium template or
  AI design saved only with the feature; otherwise 403.

### 5. Local QA

Run OS (Docker stack in `charis_deploy`) and Bill Easy locally; in the browser check: signup with
an industry → Free plan claimed → limits hit at 50 invoices / 100 items / 10 exports / 10 AI
messages → PO screens locked → plan page shows three plans with strike-through prices and coupon
→ upgrade with the Razorpay test stand-in → limits lift → template picker locks/unlocks with plan.
Civil regression run on its plan page. No push or deploy without the user's go-ahead.

## Testing

Backend unit tests for: limit counter (including concurrency), each new gate, settings
validation, AI quick-search-not-counted, provider adapter (mocked). Frontend build must pass.
Template parity checked by rendering each template to PDF and on screen in QA.

## Out of scope

Azure migration, Azure OpenAI, production deploy, real Razorpay payments, Microsoft application
text (offered separately).
