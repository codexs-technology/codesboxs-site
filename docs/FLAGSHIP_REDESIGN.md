# Digital flagship redesign — October 21, 2026

## Audit and scope

React 19 / TypeScript, Vite, Hono, Workers and D1 remain the application stack.
The Pages build uses `src/worker/pages.ts`, producing `dist/_worker.js/index.js`.
Existing API endpoints, schemas, password verification, session cookies, CSRF,
origin checks, lead storage, outbox, portfolio CRUD and commerce are retained.
No migration, production data, secret or deployment binding was changed.

The new homepage uses original CSS/interface concepts and inline SVG art rather
than proprietary reference assets. Product previews and waveform animation are
local demonstrations, not live AI, voice synthesis, clients or business results.
The previous home component remains in source for comparison, but is not routed.
Branding adds one static service route; it requires no database migration.
Existing managed service title/summary overrides remain supported in cards.

## Verification

Run from the repository root:

```powershell
npm ci
npm run typecheck
npm run lint
npm run format:check
npm test
npm run build
npm run test:e2e
```

`npm run build` includes a Worker dry-run, not a deployment. E2E creates an isolated
local D1 database and temporarily prepares/restores local test configuration.
On Windows, `scripts/validate-flagship.cmd` records individual logs and exit codes.
Never interpret a launched background process as a passed test.

Tests cover the new preview controls, reduced motion and 320/375/390/768/1024/
1440/1920 widths alongside existing public routes, admin, CRUD and commerce tests.
Lighthouse targets are goals until a current report is collected.

The unit launcher normalizes Windows drive casing to avoid duplicate Vitest module
instances and runs one worker. Password hashing still performs 600,000 iterations;
its test timeout allows for CPU contention without weakening the password checks.

## Approved deployment procedure — not executed by this redesign

1. Review and merge the redesign branch only after owner approval. Keep `main`
   unchanged until approved. If Pages is Git-connected, review its automatic
   preview branch settings before pushing; a branch push can trigger a preview.
2. Back up the intended production database and verify account/database identity.
3. The redesign adds no migrations. For a new commerce installation only, apply
   the existing migrations to the **approved** database:

   ```powershell
   npx wrangler d1 migrations apply codesboxs --remote
   ```

   This is an operator command, not authorization to run it against production.
4. Pages: framework None, build `npm run build:web`, output `dist`, root repository
   root. Attach D1 as `DB`. Preserve the generated advanced-mode Worker directory.
5. Set `PUBLIC_SITE_URL`, `TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY` and a private
   temporary `ADMIN_BOOTSTRAP_SECRET`. Use dashboard secrets, never committed files.
   Configure verified email settings from `.env.example` and the existing email
   operations documentation; remove bootstrap secret after setup.
6. Never enable `LOCAL_TEST_MODE` in production. Pages adapter disables it.
7. Validate HTML, CSS, fonts, deep links, APIs, lead persistence, protected admin,
   consent, HTTPS and real 404s on the approved deployment URL.

Pages has no scheduled handler execution for the email retry/cleanup cron. Use
the existing full Worker deployment or a separately approved scheduled Worker.
The current root Wrangler vars remain development settings; do not blindly run
`npm run deploy` as a production release. See `docs/PAGES_DEPLOYMENT.md`.

## Local validation results

- Unit tests: 25/25 passed (`npm test`, normalized Windows path launcher).
- Browser tests: 20/20 passed, 0 failed (4.4 minutes), including accessibility,
  live local D1/admin CRUD, contact journeys, links and screenshot captures.
- Production frontend, Pages Worker and Worker dry-run: passed.
- TypeScript, lint and formatting checks: passed; final check logs are ignored.
- E2E uses installed Chrome via `PLAYWRIGHT_CHANNEL=chrome`; the bundled
  Playwright headless executable was absent on this machine.
- All three existing migrations applied successfully to isolated local D1.
- Automated accessibility catches were fixed, including light form panels and
  currency attribution contrast within the nested pricing section.
- Lighthouse attempt did not produce scores: the measurement Worker did not start.
- No remote D1 migration or deployment was performed.

## Owner inputs / explicit readiness limits

- Verify registered address, business identity and support contacts.
- Review legal drafts, refund/cancellation rules, delivery terms and billing.
- Configure approved prices, deliverables, revision policies and project windows.
- Supply genuine client case studies, testimonials, team material and approved media.
- Configure production D1, Turnstile, email/domain verification and scheduling.
- Complete official RapidGateway onboarding/integration. Live payments stay off.
- Customer order emails and fuller delivery/refund administration are not completed
  by this visual redesign. Existing inquiry email outbox is not proof of delivery.
- Admin is preserved, not a newly built dashboard. A full security penetration
  test and production performance certification are outside this local verification.
- No production deployment or public URL verification is implied by a Git push.