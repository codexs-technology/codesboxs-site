-- Additive only: existing services, inquiries and administrator data are preserved.
CREATE TABLE service_categories (
 id TEXT PRIMARY KEY, parent_id TEXT REFERENCES service_categories(id),
 slug TEXT NOT NULL UNIQUE, name TEXT NOT NULL, published INTEGER NOT NULL DEFAULT 0 CHECK(published IN (0,1)),
 position INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE service_packages (
 id TEXT PRIMARY KEY, service_id TEXT NOT NULL REFERENCES services(id), category_id TEXT NOT NULL REFERENCES service_categories(id),
 name TEXT NOT NULL CHECK(name IN ('Basic','Standard','Premium','Custom')),
 description TEXT NOT NULL, deliverables TEXT NOT NULL, timeline TEXT NOT NULL,
 revisions TEXT NOT NULL, exclusions TEXT NOT NULL,
 pricing_type TEXT NOT NULL CHECK(pricing_type IN ('fixed','tiered','custom')),
 amount_minor INTEGER CHECK(amount_minor > 0 AND amount_minor <= 100000000),
 currency TEXT NOT NULL DEFAULT 'USD' CHECK(currency='USD'),
 approved INTEGER NOT NULL DEFAULT 0 CHECK(approved IN (0,1)),
 archived INTEGER NOT NULL DEFAULT 0 CHECK(archived IN (0,1)),
 created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
 CHECK(pricing_type='custom' OR amount_minor IS NOT NULL)
);
CREATE TABLE service_images (
 id TEXT PRIMARY KEY, service_id TEXT NOT NULL REFERENCES services(id), url TEXT NOT NULL, alt TEXT NOT NULL, position INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE customers (id TEXT PRIMARY KEY, name TEXT NOT NULL, email TEXT NOT NULL, country TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE orders (
 id TEXT PRIMARY KEY, access_hash TEXT NOT NULL, customer_id TEXT NOT NULL REFERENCES customers(id),
 idempotency_key TEXT NOT NULL UNIQUE, request_hash TEXT NOT NULL,
 status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','test_paid','failed','cancelled')),
 delivery_status TEXT NOT NULL DEFAULT 'not_started' CHECK(delivery_status IN ('not_started','in_progress','delivered')),
 amount_minor INTEGER NOT NULL CHECK(amount_minor>0), currency TEXT NOT NULL CHECK(currency='USD'),
 display_currency TEXT NOT NULL, requirements TEXT NOT NULL, terms_version TEXT NOT NULL,
 provider TEXT NOT NULL CHECK(provider='mock'), created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE order_items (
 id TEXT PRIMARY KEY, order_id TEXT NOT NULL REFERENCES orders(id), package_id TEXT NOT NULL REFERENCES service_packages(id),
 title TEXT NOT NULL, description TEXT NOT NULL, deliverables TEXT NOT NULL, timeline TEXT NOT NULL, revisions TEXT NOT NULL, exclusions TEXT NOT NULL,
 quantity INTEGER NOT NULL CHECK(quantity BETWEEN 1 AND 10), amount_minor INTEGER NOT NULL CHECK(amount_minor>0)
);
CREATE TABLE payment_attempts (
 id TEXT PRIMARY KEY, order_id TEXT NOT NULL UNIQUE REFERENCES orders(id), provider TEXT NOT NULL CHECK(provider='mock'),
 status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','test_paid','failed')), created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE payment_events (
 id TEXT PRIMARY KEY, attempt_id TEXT NOT NULL UNIQUE REFERENCES payment_attempts(id), status TEXT NOT NULL CHECK(status='test_paid'),
 created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE refund_records (
 id TEXT PRIMARY KEY, order_id TEXT NOT NULL REFERENCES orders(id), amount_minor INTEGER NOT NULL CHECK(amount_minor>0),
 status TEXT NOT NULL CHECK(status IN ('requested','reviewed','externally_verified')), note TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE currency_rates (
 currency TEXT PRIMARY KEY, rate_decimal TEXT NOT NULL, fetched_at INTEGER NOT NULL, provider TEXT NOT NULL
);
CREATE TABLE policy_versions (
 id TEXT PRIMARY KEY, slug TEXT NOT NULL, body TEXT NOT NULL, approved INTEGER NOT NULL DEFAULT 0 CHECK(approved IN (0,1)), created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX orders_created ON orders(created_at DESC);
CREATE INDEX items_order ON order_items(order_id);
-- Deliberately no invented catalog, prices, corporate details, or approved policies.