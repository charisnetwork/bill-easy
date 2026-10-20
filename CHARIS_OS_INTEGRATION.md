# Bill Easy ↔ Charis OS

Charis OS (the Control Centre, `charis_control_center`) creates and edits Bill Easy's plans,
coupons, partner (affiliate) codes and notifications, and verifies every payment. Bill Easy keeps
its own users and business data and enforces the plan in its own backend.

The integration is **off by default**. With `CHARIS_SUBSCRIPTION_MODE` unset or `off`, Bill Easy
behaves exactly as before (local plans, local coupons).

## Switching it on (Bill Easy backend only)

```env
CHARIS_SUBSCRIPTION_MODE=enforce
CHARIS_OS_URL=https://<Control OS API origin>      # HTTPS origin, no path
CHARIS_OS_APP_ID=<Bill Easy application ID in OS>
CHARIS_OS_APP_KEY=<one-time application key from OS>
```

Never put the app key in the frontend (`VITE_*`) or in git. The Razorpay keys and webhook belong to
Charis OS; in enforce mode Bill Easy ignores its own `RAZORPAY_*` variables and its legacy
`CONTROL_CENTER_*` SDK.

## Feature codes to create in OS for Bill Easy

| Code | Type | Controls |
| --- | --- | --- |
| `invoices` | limit, monthly reset | Invoices per calendar month (India time), per business |
| `products` | limit, total | Products per business |
| `businesses` | limit, total | Businesses one owner may add |
| `eway_bills` | on/off | E-way bill screens and generation |
| `multi_godowns` | on/off | Creating/editing godowns |
| `staff_attendance_payroll` | on/off | Staff, attendance and payroll |
| `recurring_invoices` | on/off | Recurring invoices |
| `ai_assistant` | on/off | Charis AI chat |
| `bulk_download_print_invoices` | on/off | Bulk invoice download/print |
| `advanced_reports` | on/off | Profit & loss and GST reports |
| `enterprise_reports` | on/off | Enterprise-tier reports |
| `gst_billing`, `inventory_management`, `quotations`, `reports` | on/off | Shown on the plan page |

Anything missing from a plan is **not included** (deny by default). Limits are checked against
Bill Easy's own records (invoices created this month, products saved).

## How it behaves

- **Signup** registers the business in OS and starts the catalog's free plan (a visible ₹0 plan),
  if OS offers one. If OS is down, signup still succeeds and the next login retries.
- **Multiple businesses:** an owner's first business is the OS customer. Businesses added later
  share its plan; invoice/product usage is still counted per business.
- **Plan page** (`/subscription`) shows OS plans, applies coupon/partner codes through OS, and pays
  with Razorpay. OS checks the signature, fetches the payment from Razorpay and only then activates
  the plan. A second order cannot be started while one is unpaid ("Resume payment").
- **Partner commission** is recorded when the payment is verified, not when the order is created,
  and is reversed automatically on a full refund.
- **Cached for up to 60 seconds.** OS changes (suspend, cancel, new plan) apply within a minute, or
  immediately after a purchase or `POST /api/subscription/sync`. If OS cannot be reached and the
  cache has expired, gated actions return 503 rather than allowing access.
- **Closed in enforce mode:** `POST /api/subscription/upgrade`, `/payment`, `/validate-coupon` and
  `/cancel` return 409 `MANAGED_BY_CHARIS_OS`. (In local mode `/upgrade` still activates a plan
  without verifying payment — another reason to move to enforce mode.)

## Go-live for existing customers

1. In OS: register Bill Easy, create the features above, the plans (including a ₹0 Free plan) and
   publish them on the storefront.
2. Deploy Bill Easy with the variables above.
3. Dry run, then apply:

   ```sh
   cd backend
   npm run charis-os:sync              # report only
   npm run charis-os:sync -- --apply   # register customers, start Free plans
   ```

   Customers with an **active paid local plan** are listed as `ASSIGN_PAID_PLAN_IN_OS`. Assign the
   matching plan to each in OS (Subscriptions, with a "migrated from Bill Easy" reason). The script
   never grants paid access or records revenue.
4. Point Razorpay's webhook at Charis OS (see `charis_control_center/RAZORPAY.md`).

## Tests

`npm test` (in `backend/`) runs the integration unit tests. Connected end-to-end checks were run
locally against a real OS and an in-memory Razorpay stand-in; see the OS repository notes.
