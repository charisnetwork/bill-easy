# Bill Easy and Charis Control Centre — Detailed Project Report

## Purpose

Make Bill Easy a multi-country SaaS product while keeping Charis Control Centre as the commercial control plane. Bill Easy remains the system of record for operational business data; Control Centre owns the published catalog, coupons, subscriptions, entitlements, and webhook events.

## Current verified position

- Registration is live but collects no country, state, postal code, locale, or currency.
- Settings has an India-only state list and a six-digit India PIN-code rule.
- A company has a currency column, but the application formats and charges in INR.
- Subscription checkout uses Bill Easy-local plan and coupon data and creates Razorpay orders in INR.
- The deployed Control Centre public catalog and Bill Easy `/control` adapter are absent, so the intended integration is not live.
- Bill Easy feature checks are primarily UI/local-plan logic; Control Centre entitlement middleware is not consistently applied to product routes.

## Target design

1. Persist `countryCode` (ISO 3166-1 alpha-2), `currencyCode` (ISO 4217), `locale`, postal code, city, and region/state for every company.
2. Use country metadata to drive address labels, postal-code validation, state/province choices, phone prefixes, locale, and default currency. India retains GST-specific fields and workflows; other countries do not receive India-only validation.
3. Make Settings use the same reusable business-location form and persist the same fields as registration.
4. Publish country-aware catalog prices from Control Centre. A server-side quote selects an approved currency price or an auditable exchange-rate conversion, locks the quote, and stores currency, amount, rate source, timestamp, and rounding rule on the subscription/payment record.
5. Create Razorpay orders only with a currency enabled for the merchant account and the exact subunit precision required by that currency. Never trust a browser-supplied price or exchange rate.
6. Let Bill Easy enforce Control Centre entitlement tokens server-side for each protected feature and quota, while preserving a brief verified-token grace period for outages.

## Delivery sequence

1. Remove live deployment drift and unsafe bootstrap credentials before adding commercial features.
2. Add the shared location/locale model, migration, validation, registration UI, Settings UI, and country metadata tests.
3. Deploy the Control Centre public catalog and Bill Easy `/control` adapter; configure credentials only through deployment secrets.
4. Implement authoritative catalogue quote, payment currency capability checks, and verified Razorpay payment capture/webhook handling.
5. Replace local feature checks with Control Centre entitlement enforcement, then run staging test cases in TPR.

## Production gates

- No hard-coded credentials or automatic production seed data.
- No deployment uses `prisma db push` as a schema-management strategy.
- Catalogue and adapter health checks return authenticated expected responses.
- Every active country/currency has tested address validation, price/rounding, Razorpay account capability, and settlement reconciliation.
- Payment status is only activated after verified provider-side payment confirmation.
- Feature and quota denial is enforced server-side, not only in the UI.
