# Commerce setup and operational boundaries

Worktree: `D:\company site\codesboxs-site`.

## Local test mode

Use the existing local setup in README, then run `node scripts/prepare-local-tests.mjs`. This generates private ignored test configuration and sets `PAYMENT_PROVIDER=mock`. Mock checkout additionally requires the existing localhost-only development guard. Never configure local bypass or mock payment for a production domain.

`npm run test:e2e` runs additive migrations in an isolated ignored database and restores the previous local test configuration. The commerce integration test creates explicitly synthetic packages only inside that isolated database; these are not business-approved pricing seeds.

## Admin workflow

Follow README's secure bootstrap procedure with your own generated secret and strong password. `/admin/login` and `/admin/dashboard` redirect to the existing session-aware `/admin` application. Existing administrator authentication and CSRF checks guard `/api/admin/commerce/*`.

From Overview → Commerce:

1. Create or edit a service in the existing Services module; publish only confirmed offerings.
2. Save a category using a stable lowercase ID/slug; tick publish only when an approved package will populate it.
3. Add a package, choose the service/category, tier and fixed/tiered/custom type. Supply complete scope, timeline, revisions and exclusions. Fixed/tiered prices use integer USD cents; custom offers request a quote.
4. Confirm approval only after business sign-off. Archive packages instead of deleting historical purchase references.
5. Review recent stored orders and payment attempts. `test_paid` means simulation, not money received.

Company settings are centrally stored in `site_settings`. Verification values use the exact string `true`. The registered-address value must exactly equal the private reviewer-entered document-address string, including punctuation. Store only the address text, never the corporate document. Phone/email verification is an owner attestation requiring separate evidence. These flags never enable live checkout.

## Deployment

The existing Wrangler D1 UUID and workflows were retained, not re-created. A successful `wrangler deploy --dry-run` is a bundle check, NOT deployment. Production requires the owner-approved domain, bindings, real email/Turnstile configuration and the deployment safeguards in existing runbooks. No RapidGateway endpoint should be added without official documentation. Do not issue remote migrations or change DNS as a side effect of local validation.