# Deploying Bill Easy

Bill Easy is two parts: the **backend** (Node/Express + PostgreSQL, hosted on Railway) and the
**frontend** (React/Vite static site). Plans, coupons, partner codes and payments belong to
**Charis OS** (the Control Centre); Bill Easy only enforces what OS says.

Order: Charis OS first (see `charis_control_center/HOSTING_CHECKLIST.md`), then Bill Easy.

## 1. Backend on Railway

Railway builds from the repo root (`railway.toml`, `nixpacks.toml`) and starts
`node railway-monorepo.js`. Health check: `/health`.

Variables (Railway → service → Variables):

```env
NODE_ENV=production
DATABASE_URL=${{Postgres.DATABASE_URL}}
JWT_SECRET=<random, 64+ chars>
JWT_ACCESS_SECRET=<random, 64+ chars, different>
FRONTEND_URL=https://<frontend domain>
ALLOWED_ORIGINS=https://<frontend domain>

# Charis OS — required; the backend will not start without them
CHARIS_OS_URL=https://<Charis OS API domain>      # origin only, no /api/v1, no trailing path
CHARIS_OS_APP_ID=<Bill Easy application ID in Charis OS>
CHARIS_OS_APP_KEY=<Bill Easy app key from Charis OS>

# AI (Charis assistant)
AI_PROVIDER=nvidia
NVIDIA_API_KEY=<NVIDIA API key>
NVIDIA_MODEL=nvidia/nemotron-3.5-lightning-30b-a3b
NVIDIA_BASE_URL=https://integrate.api.nvidia.com/v1

# Files: local disk (attach a Railway volume and point UPLOAD_ROOT at it) or Google Cloud Storage
STORAGE_DRIVER=local
UPLOAD_ROOT=/data/uploads

# Email
SMTP_HOST=...
SMTP_USER=...
SMTP_PASS=...
SMTP_FROM=support@charisbilleasy.store
```

Remove these old variables if they are still set — nothing reads them any more:
`CHARIS_SUBSCRIPTION_MODE`, `CONTROL_CENTER_*`, `RAZORPAY_*`, `GEMINI_API_CHAT`,
`GOOGLE_CLOUD_API_KEY`. Razorpay keys live on the Charis OS service.

## 2. Frontend

Build `frontend/` with `npm ci && npm run build`; publish `frontend/dist`.

```env
VITE_BACKEND_URL=https://<backend domain>     # no trailing slash
VITE_ADMIN_PORTAL_URL=https://<admin portal>
VITE_GA_MEASUREMENT_ID=                        # optional
```

## 3. Charis OS setup for Bill Easy

1. Register Bill Easy as an application and copy its ID and app key into the backend variables.
2. Start the backend once: it publishes its feature list to OS (OS → Bill Easy → Features).
3. Create the plans (Subscriptions → Plans), all visible, Pro recommended on the plan page:

   | Plan | Price | "Was" price | Badge |
   | --- | --- | --- | --- |
   | Free | ₹0 | — | — |
   | Premium Monthly / Yearly | ₹150 / ₹1,500 | ₹470 / ₹4,700 | Inaugural offer |
   | Pro Monthly / Yearly | ₹300 / ₹3,000 | ₹770 / ₹7,700 | Inaugural offer |

   Monthly and yearly of one tier share a pricing group. Features and limits:

   | Feature code | Free | Premium | Pro |
   | --- | --- | --- | --- |
   | `invoices` (per month) | 50 | 500 | unlimited |
   | `purchase_bills` (per month) | 50 | 500 | unlimited |
   | `products` | 100 | 500 | unlimited |
   | `report_exports` (per month) | 10 | unlimited | unlimited |
   | `ai_messages` (per month) | 10 | 50 | unlimited |
   | `godowns` | 1 | 2 | unlimited |
   | `businesses` | 1 | 2 | unlimited |
   | `purchase_orders` | off | on | on |
   | `gst_billing`, `inventory_management`, `quotations`, `reports`, `advanced_reports`, `ai_assistant` | on | on | on |
   | `premium_templates` | off | on | on |
   | `pro_templates`, `ai_invoice_design` | off | off | on |
   | `eway_bills`, `staff_attendance_payroll`, `recurring_invoices`, `bulk_download_print_invoices`, `enterprise_reports` | off | off | on |

4. Coupons → `WELCOME`, percentage discount, paid plans, promotion (not a partner code).
5. Existing customers: `cd backend && npm run charis-os:sync` (report), then `-- --apply`.
6. Point the Razorpay webhook at Charis OS (`charis_control_center/RAZORPAY.md`).

If OS cannot be reached and its 60-second cache has expired, gated actions return 503 rather than
allowing access. See `CHARIS_OS_INTEGRATION.md` for the full contract.
