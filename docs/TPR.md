# Bill Easy and Charis Control Centre — Test Plan and Results Report

## Scope

Registration, company settings, international localisation, catalog pricing, coupons, subscriptions, Razorpay payments, entitlements, webhooks, and Control Centre integration.

## Current results (read-only test, 2026-09-08)

| Area | Result | Evidence |
| --- | --- | --- |
| Bill Easy landing page | Pass | Public page loads without browser console errors. |
| Registration screen | Partial | Form loads; country/state/postal code/language/currency fields are absent. |
| Live registration submission | Fail | Two approved QA registration attempts returned HTTP 400 without creating an account. Source review identified a frontend `phone` / backend `mobileNumber` contract mismatch and unsafe duplicate lookup when no mobile number is supplied. A source fix is pending deployment. |
| Control Centre CORS | Pass | API health permits the Cloudflare Pages origin. |
| Public pricing catalog | Fail | Deployed Control Centre returns 404 for the Bill Easy catalog route. |
| Bill Easy control adapter | Fail | Deployed Bill Easy backend returns 404 for `/control/health`. |
| Subscription pricing | Fail | Live pricing falls back to unavailable because catalog integration is absent; local payment code is INR-only. |
| Coupon lifecycle | Blocked / fail | Control Centre coupon-create source uses a field that is not in the Prisma model; no safe live mutation was performed. |
| Feature enforcement | Fail | Bill Easy route-level entitlement enforcement is not consistently present. |
| Automated coverage | Insufficient | Only the SDK entitlement test exists; no API/UI/integration payment test suite exists. |

## Staging test cases required before release

1. Register an India company: state, six-digit PIN lookup, GST validation, INR default, English locale.
2. Register Sri Lanka and Pakistan companies: correct address schema, no India GST/PIN constraint, configured LKR/PKR currency only when the payment account supports it.
3. Edit all registration location/locale fields in Settings and re-login to confirm persistence.
4. Quote each plan in INR and every enabled international currency; verify source amount, conversion, rounding, quote expiry, and immutable stored snapshot.
5. Validate coupons: valid, expired, product-scoped, plan-scoped, per-customer, exhausted, concurrent redemption, and zero-total paths.
6. Create and verify payment orders in Razorpay test mode; activate only after signature/webhook verification; test duplicate and delayed webhook delivery.
7. Verify the Control Centre catalog, Bill Easy `/control` endpoints, and signed entitlement retrieval with configured non-production credentials.
8. Attempt invoice, product, user, report, e-way bill, AI, multi-business, and quota actions below and above plan limits. Confirm the backend returns a structured upgrade/quota response.
9. Verify cancellation, renewal, upgrade, downgrade, failed payment, expiry, and webhook retry behavior.
10. Run security tests for unauthenticated access, role separation, secrets, CORS, SSRF-safe integration URLs, replay protection, and rate limits.

## Release exit criteria

Every blocking result above must pass in an isolated staging environment with test-mode payment credentials and disposable test tenants. Record test evidence without storing credentials, payment data, or personal data in this document.
