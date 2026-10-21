# Commerce validation — 2026-10-21

**Checkpoint, not production acceptance.**

## Verified results

- Dependency install completed; npm reported 0 vulnerabilities at install time (not a security certification).
- TypeScript, Vite client build, Pages SSR build and Wrangler Worker deployment **dry-run passed**. Evidence: `build-final.log`. Existing Lucide `use client` bundler warnings remain non-fatal.
- ESLint passed after fixing the existing browser-helper global declaration and new effect initialization warnings. Evidence: `lint-final.log`.
- Prettier source/test/E2E check passed. Evidence: `format-check.log`.
- Initial unit run: **25/25 passed**. Two concurrent reruns exceeded the existing 30-second PBKDF2 test timeout while browser validation was running. Isolated rerun: **25/25 passed in 23.46 seconds**, PBKDF2 test 22.8 seconds. Evidence: `unit-isolated.log`. Hash parameters/test timeout were not weakened. Deployed CPU/latency assessment remains a launch blocker.
- First browser run: **17 passed, 1 failed in 7.1 minutes**. The failed assertion expected the previous hero headline; corrected to the requested new headline. Evidence: `e2e-final.log`. Complete corrected rerun: **18/18 passed in 5.5 minutes**, using installed Chrome and fresh isolated D1. Evidence: `e2e-rerun.log`. Wrangler logged one recovered image-proxy connection retry; the route/image and screenshot tests passed.
- Passing real Worker/D1 API test includes synthetic package/category creation, unauthorized/CSRF rejection, order creation with server totals, same-request idempotency, altered-request conflict, private order access, duplicate mock payment handling, readiness blocked state, package archival, existing content CRUD/login/logout/contact/newsletter flows.
- Passing browser checks include commerce routes, empty approved catalog, currency selection, cart mobile widths, existing contact/project persistence, representative axe scans, reduced-motion content, keyboard tabs, internal links/images, public 404 handling and screenshot captures. Screenshot captures are not a full manual accessibility or design certification.
- Reviewed actual desktop/mobile hero captures at 1440 and 390 pixels. Original ribbon imagery and editorial layout remain; the full requested Avista-inspired design/GSAP/photography scope is not complete.
- Real currency provider probe succeeded and returned all eight required currencies. Evidence: `rates-probe.log`, reproducible with `node scripts/probe-currency.mjs`. This verifies provider response availability, not production settlement or every conversion/error scenario.
- D1 migrations 0001–0003 applied successfully to a fresh isolated local database; no remote migrations occurred.
- `git diff --check` returned no findings. Git history retained. No commit/push/deployment/production URL verification performed at this checkpoint.

## Further tests required

Browser purchasing from an approved package through checkout and receipt; customer order email; provider outage/cache races; deeper category hierarchy; admin category/package UI CRUD; refund/delivery workflows; official signed webhook handling and refunds; cross-browser and manual accessibility; production-runtime password CPU; deployed HTTPS/DNS and real Turnstile/email.

The current catalog intentionally has no business-approved price seeds. Local integration fixtures are synthetic and are not deployed or advertised as business offerings.