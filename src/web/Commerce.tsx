import { useEffect, useState } from "react";
import {
  currencies,
  commercePages,
  convertMinor,
  money,
  type Currency,
  type Package,
  type Rates,
} from "../shared/commerce";
import type { SiteData } from "../shared/content";
import { Button, Section, Turnstile } from "./components";

type CartItem = { package_id: string; quantity: number };
async function api<T = Record<string, unknown>>(
  path: string,
  body?: unknown,
  headers: Record<string, string> = {},
) {
  const response = await fetch("/api/commerce" + path, {
    method: body ? "POST" : "GET",
    headers: { "Content-Type": "application/json", ...headers },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = (await response.json()) as T & { error?: string };
  if (!response.ok) throw new Error(data.error || "Request failed");
  return data;
}
function readCart(): CartItem[] {
  try {
    const value = JSON.parse(localStorage.getItem("codesboxs-cart") || "[]");
    return Array.isArray(value)
      ? value
          .filter(
            (i) =>
              typeof i.package_id === "string" &&
              Number.isInteger(i.quantity) &&
              i.quantity > 0 &&
              i.quantity <= 10,
          )
          .slice(0, 20)
      : [];
  } catch {
    return [];
  }
}
function saveCart(items: CartItem[]) {
  localStorage.setItem("codesboxs-cart", JSON.stringify(items));
}
export function CommerceTools() {
  const [currency, setCurrency] = useState("USD");
  useEffect(() => {
    queueMicrotask(() =>
      setCurrency(localStorage.getItem("codesboxs-currency") || "USD"),
    );
  }, []);
  return (
    <div className="commerce-tools">
      <label>
        Display currency
        <select
          aria-label="Display currency"
          value={currency}
          onChange={(e) => {
            setCurrency(e.target.value);
            localStorage.setItem("codesboxs-currency", e.target.value);
            window.dispatchEvent(new Event("currency-change"));
          }}
        >
          {currencies.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
      </label>
      <a href="/cart">Cart ↗</a>
    </div>
  );
}
export function Marketplace({
  data,
  serviceSlug,
}: {
  data: SiteData;
  serviceSlug?: string;
}) {
  const [items, setItems] = useState<Package[]>([]),
    [cart, setCart] = useState<CartItem[]>([]),
    [rates, setRates] = useState<Rates | null>(null),
    [currency, setCurrency] = useState<Currency>("USD");
  const [query, setQuery] = useState(""),
    [category, setCategory] = useState("All"),
    [sort, setSort] = useState("title"),
    [error, setError] = useState(""),
    [message, setMessage] = useState(""),
    [busy, setBusy] = useState(false);
  const [payment, setPayment] = useState("disabled"),
    [token, setToken] = useState("");
  useEffect(() => {
    queueMicrotask(() => setCart(readCart()));
    const update = () => {
      const c = localStorage.getItem("codesboxs-currency");
      setCurrency(currencies.includes(c as Currency) ? (c as Currency) : "USD");
    };
    queueMicrotask(update);
    window.addEventListener("currency-change", update);
    api<{ items: Package[]; payment: string }>("/catalog")
      .then((d) => {
        setItems(d.items);
        setPayment(d.payment);
      })
      .catch((e) => setError(e.message));
    api<Rates>("/currency")
      .then(setRates)
      .catch(() =>
        setMessage("Conversion unavailable. USD prices remain available."),
      );
    return () => window.removeEventListener("currency-change", update);
  }, []);
  const price = (amount: number) =>
    currency === "USD"
      ? money(amount)
      : rates?.rates[currency]
        ? money(convertMinor(amount, rates.rates[currency]!), currency)
        : "Conversion unavailable";
  const change = (next: CartItem[]) => {
    setCart(next);
    saveCart(next);
  };
  const selected = cart.map((i) => ({
    item: i,
    p: items.find((p) => p.id === i.package_id),
  }));
  const total = selected.reduce(
    (n, { item, p }) => n + (p?.amount_minor || 0) * item.quantity,
    0,
  );
  const checkout = data.path === "/checkout";
  if (data.path === "/cart" || checkout)
    return (
      <Section
        title={
          checkout ? "Review & begin your project" : "Your selected services"
        }
      >
        <p className="notice">
          {payment === "mock"
            ? "LOCAL TEST MODE — no real charge or service order."
            : "Live payments are disabled pending merchant activation. You can still request a quote."}
        </p>
        {!cart.length ? (
          <p>
            Your cart is empty. <a href="/pricing">Explore approved packages</a>{" "}
            or <a href="/start-project">request a custom quote</a>.
          </p>
        ) : (
          <>
            {selected.map(({ item, p }) => (
              <article className="panel cart-line" key={item.package_id}>
                <div>
                  <h2>
                    {p ? `${p.title} / ${p.name}` : "Package unavailable"}
                  </h2>
                  <p>{p?.deliverables}</p>
                  <p>
                    Delivery: {p?.timeline} · Revisions: {p?.revisions}
                  </p>
                  <p>Exclusions: {p?.exclusions}</p>
                </div>
                <label>
                  Quantity
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={item.quantity}
                    onChange={(e) =>
                      change(
                        cart.map((i) =>
                          i.package_id === item.package_id
                            ? {
                                ...i,
                                quantity: Math.max(
                                  1,
                                  Math.min(10, Number(e.target.value) || 1),
                                ),
                              }
                            : i,
                        ),
                      )
                    }
                  />
                </label>
                <strong>
                  {p?.amount_minor
                    ? price(p.amount_minor * item.quantity)
                    : "Quote required"}
                </strong>
                <button
                  onClick={() =>
                    change(cart.filter((i) => i.package_id !== item.package_id))
                  }
                >
                  Remove
                </button>
              </article>
            ))}
            <div className="panel">
              <h2>Total {price(total)}</h2>
              <p>
                Base total: {money(total)} USD. Test payment currency: USD. No
                additional fee or tax is applied in this local simulation; live
                tax treatment must be approved before launch.
              </p>
              {!checkout && <Button href="/checkout">Guest checkout</Button>}
            </div>
            {checkout && (
              <form
                className="form-panel"
                onSubmit={async (e) => {
                  e.preventDefault();
                  setBusy(true);
                  setError("");
                  const form = new FormData(e.currentTarget);
                  try {
                    const stored = sessionStorage.getItem("checkout-attempt");
                    const attempt = stored
                      ? JSON.parse(stored)
                      : {
                          key: crypto.randomUUID(),
                          access: crypto.randomUUID() + crypto.randomUUID(),
                        };
                    sessionStorage.setItem(
                      "checkout-attempt",
                      JSON.stringify(attempt),
                    );
                    const result = await api<{ id: string }>(
                      "/checkout",
                      {
                        name: form.get("name"),
                        email: form.get("email"),
                        country: String(form.get("country")).toUpperCase(),
                        requirements: form.get("requirements"),
                        display_currency: currency,
                        terms: form.get("terms") === "on",
                        items: cart,
                        turnstileToken: token,
                        website: "",
                      },
                      {
                        "Idempotency-Key": attempt.key,
                        "X-Order-Token": attempt.access,
                      },
                    );
                    sessionStorage.setItem(
                      "order:" + result.id,
                      attempt.access,
                    );
                    sessionStorage.removeItem("checkout-attempt");
                    saveCart([]);
                    window.location.assign(
                      "/order-confirmation?id=" + encodeURIComponent(result.id),
                    );
                  } catch (err) {
                    setError((err as Error).message);
                  } finally {
                    setBusy(false);
                  }
                }}
              >
                <h2>Customer information</h2>
                <label className="field">
                  Full name
                  <input
                    name="name"
                    autoComplete="name"
                    required
                    minLength={2}
                    maxLength={100}
                  />
                </label>
                <label className="field">
                  Email
                  <input
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    maxLength={254}
                  />
                </label>
                <label className="field">
                  Billing country (two-letter code)
                  <input
                    name="country"
                    autoComplete="country"
                    required
                    pattern="[A-Za-z]{2}"
                    placeholder="PK"
                    maxLength={2}
                  />
                </label>
                <label className="field">
                  Project requirements
                  <textarea
                    name="requirements"
                    required
                    minLength={10}
                    maxLength={6000}
                  />
                </label>
                <label>
                  <input name="terms" type="checkbox" required /> I understand
                  this is a test and accept the{" "}
                  <a href="/terms-and-conditions">draft terms</a>,{" "}
                  <a href="/refund-policy">refund policy</a> and{" "}
                  <a href="/privacy-policy">privacy policy</a>.
                </label>
                <Turnstile data={data} onToken={setToken} />
                <button
                  className="button"
                  disabled={
                    busy ||
                    payment !== "mock" ||
                    selected.some(({ p }) => !p || p.pricing_type === "custom")
                  }
                >
                  {busy ? "Creating order…" : "Create test order"}
                </button>
                <p>
                  Retry conflict?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      sessionStorage.removeItem("checkout-attempt");
                      setMessage("A new checkout attempt will be used.");
                    }}
                  >
                    Reset checkout attempt
                  </button>
                </p>
              </form>
            )}
          </>
        )}
        <p role="alert">{error}</p>
        <p role="status">{message}</p>
        <RateNote rates={rates} />
      </Section>
    );
  const filtered = items
    .filter(
      (p) =>
        (!serviceSlug || p.slug === serviceSlug) &&
        (category === "All" || p.category === category) &&
        `${p.title} ${p.description}`
          .toLowerCase()
          .includes(query.toLowerCase()),
    )
    .sort((a, b) =>
      sort === "price"
        ? (a.amount_minor ?? Infinity) - (b.amount_minor ?? Infinity)
        : a.title.localeCompare(b.title),
    );
  return (
    <Section
      title="Defined scope. Transparent packages."
      eyebrow="DIGITAL SERVICES / APPROVED CATALOG"
    >
      <p>
        Only business-approved packages appear here. Custom work is scoped and
        quoted before a price is agreed.
      </p>
      <div className="filter-bar">
        <label className="field">
          Search services
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
        <label className="field">
          Category
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {["All", ...new Set(items.map((p) => p.category))].map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </label>
        <label className="field">
          Sort
          <select value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="title">Service name</option>
            <option value="price">Price: low to high</option>
          </select>
        </label>
      </div>
      <div className="three-grid">
        {filtered.map((p) => (
          <article className="panel package-card" key={p.id}>
            <p className="eyebrow">
              {p.category} / {p.name}
            </p>
            <h3>
              <a href={"/services/" + p.slug}>{p.title}</a>
            </h3>
            <p>{p.description}</p>
            <strong className="package-price">
              {p.pricing_type === "custom"
                ? "Custom quote"
                : price(p.amount_minor!)}
            </strong>
            <dl>
              <dt>Deliverables</dt>
              <dd>{p.deliverables}</dd>
              <dt>Delivery estimate</dt>
              <dd>{p.timeline}</dd>
              <dt>Revisions</dt>
              <dd>{p.revisions}</dd>
              <dt>Exclusions</dt>
              <dd>{p.exclusions}</dd>
            </dl>
            {p.pricing_type === "custom" ? (
              <Button href="/start-project">Request a quote</Button>
            ) : (
              <button
                className="button"
                onClick={() => {
                  const old = cart.find((i) => i.package_id === p.id);
                  change(
                    old
                      ? cart.map((i) =>
                          i === old
                            ? { ...i, quantity: Math.min(10, i.quantity + 1) }
                            : i,
                        )
                      : [...cart, { package_id: p.id, quantity: 1 }],
                  );
                  setMessage(`${p.title} added to cart.`);
                }}
              >
                Add to cart
              </button>
            )}
          </article>
        ))}
      </div>
      {!filtered.length && (
        <div className="panel">
          <h3>Let’s define the right scope.</h3>
          <p>
            No approved package prices have been supplied for this selection. We
            do not invent prices or publish unapproved offers.
          </p>
          <Button href="/start-project">Request a custom quote</Button>
        </div>
      )}
      <p role="alert">{error}</p>
      <p role="status">{message}</p>
      <RateNote rates={rates} />
    </Section>
  );
}
function RateNote({ rates }: { rates: Rates | null }) {
  return (
    <p className="muted">
      Display conversion is indicative; payment currency remains USD in local
      tests.{" "}
      {rates?.fetched_at
        ? `Rate timestamp: ${new Date(rates.fetched_at * 1000).toISOString()}. ${rates.stale ? "Cached rates — checkout conversion blocked." : ""}`
        : "Live conversion not verified."}{" "}
      <a href="https://www.exchangerate-api.com">Rates By Exchange Rate API</a>.
    </p>
  );
}
export function OrderConfirmation() {
  const [order, setOrder] = useState<{
      id: string;
      status: string;
      amount_minor: number;
    } | null>(null),
    [error, setError] = useState("");
  async function load() {
    const id = new URLSearchParams(location.search).get("id") || "";
    return api<{ id: string; status: string; amount_minor: number }>(
      "/orders/" + encodeURIComponent(id),
      undefined,
      { "X-Order-Token": sessionStorage.getItem("order:" + id) || "" },
    );
  }
  useEffect(() => {
    load()
      .then(setOrder)
      .catch((e) => setError(e.message));
  }, []);
  return (
    <Section title="Verified server order status">
      <p role="alert">{error}</p>
      {order && (
        <div className="panel">
          <h2>Reference {order.id}</h2>
          <p>
            Status: <strong>{order.status}</strong>
          </p>
          <p>{money(order.amount_minor)} USD — simulation only.</p>
          {order.status === "pending" && (
            <button
              className="button"
              onClick={async () => {
                try {
                  await api(
                    "/orders/" + order.id + "/mock-payment",
                    {},
                    {
                      "X-Order-Token":
                        sessionStorage.getItem("order:" + order.id) || "",
                    },
                  );
                  setOrder(await load());
                } catch (e) {
                  setError((e as Error).message);
                }
              }}
            >
              Simulate verified test payment
            </button>
          )}
          <p>
            No real payment has been collected. For a real project, approved
            scope, payment activation and delivery arrangements are required.
          </p>
          <a href="/contact">Contact project support</a>
        </div>
      )}
    </Section>
  );
}
const policyCopy: Record<string, [string, string][]> = {
  "/refund-policy": [
    [
      "Eligibility & cancellation",
      "Before live sales, the business must approve eligibility, cancellation windows and treatment of work already started. No refund guarantee or fixed deadline is offered by this draft.",
    ],
    [
      "Work completed & third-party costs",
      "Partial completion and any lawful non-refundable third-party costs must be documented in the agreed scope before payment. Mandatory consumer rights must not be excluded.",
    ],
    [
      "Request procedure",
      "Contact the business through the contact form with your order reference and reason. Do not send card numbers or identity documents. Support contact ownership remains to be verified.",
    ],
    [
      "Processing & original payment method",
      "Approved requests must be recorded and returned through the original payment method where supported. The business and provider must confirm processing timelines before live checkout. No automatic refund capability is currently active.",
    ],
  ],
  "/terms-and-conditions": [
    [
      "Business & scope",
      "CodesBoxs SMC Pvt Ltd provides digital technology services. Registered address and contact verification are launch blockers. Deliverables, customer requirements, exclusions, timelines and revision conditions must be agreed in the selected package or signed quotation.",
    ],
    [
      "Pricing & payment",
      "Approved fixed packages show an exact USD base price. Display conversion is separate from payment currency. Local mock orders collect no funds. Live payment currencies, taxes and fees require provider and business approval.",
    ],
    [
      "Delivery & changes",
      "Work begins only after the agreed requirements and payment conditions are met. Scope changes and additional revisions require a separate agreement. Customer delays may change delivery estimates.",
    ],
    [
      "Intellectual property & disputes",
      "Ownership, licenses, handover conditions, applicable law and dispute procedure require business/legal approval in the final contract. This draft does not transfer third-party intellectual property or override mandatory legal rights. See the refund and delivery policies.",
    ],
  ],
  "/shipping-policy": [
    [
      "No physical shipping",
      "CodesBoxs primarily provides digital services. No physical shipping, carrier charges or physical products are offered by this checkout.",
    ],
    [
      "Initiation & delivery",
      "Following an approved real order, the team reviews requirements and confirms initiation. Delivery uses agreed digital channels, such as email, a private repository or a secure project workspace. Do not upload sensitive documents through public media.",
    ],
    [
      "Timelines & dependencies",
      "Published package estimates depend on receipt of required content, access and customer feedback. Any material delay must be communicated and a revised plan agreed. Support and revision limits are specified in the approved scope.",
    ],
  ],
  "/payment-policy": [
    [
      "Intended use",
      "CodesBoxs intends to use RapidGateway to accept eligible customer payments for digital services purchased through its website, subject to merchant approval and activation.",
    ],
    [
      "Customer journey",
      "Service Selection → Package Selection → Cart → Guest Checkout → Secure Payment → Order Confirmation → Digital Service Delivery.",
    ],
    [
      "Current status",
      "RapidGateway is not active. Only an explicitly enabled localhost mock provider can simulate payment. No card number or CVV is collected or stored. A browser redirect never marks an order paid. Official documentation, merchant credentials, supported currencies and verified callbacks are required before activation.",
    ],
  ],
  "/how-it-works": [
    [
      "Discover & select",
      "Explore the services catalog and select an approved fixed package. For custom development, AI agents, branding, SEO or marketing requirements, request a quote; availability and scope must be confirmed by the business.",
    ],
    [
      "Review & order",
      "Review deliverables, revisions, exclusions, timeline and exact package price. Use the cart and guest checkout without creating an account. Display currency conversion is indicative; payment currency is stated separately.",
    ],
    [
      "Payment & project initiation",
      "Live payments remain disabled. Once an approved provider is activated, verified payment and receipt of project requirements enable initiation under the agreed scope.",
    ],
    [
      "Deliver & support",
      "Receive agreed digital deliverables through the confirmed project channel. Request support through the contact form using your order reference. Cancellation and refund requests follow the approved policy and applicable rights.",
    ],
  ],
};
export function CommercePage({ data }: { data: SiteData }) {
  const page = commercePages[data.path];
  return (
    <>
      <Section eyebrow="CODESBOXS / DIGITAL SERVICES" title={page[0]}>
        <p className="hero-description">{page[1]}</p>
      </Section>
      {["/pricing", "/cart", "/checkout"].includes(data.path) ? (
        <Marketplace data={data} />
      ) : data.path === "/order-confirmation" ? (
        <OrderConfirmation />
      ) : (
        <Section>
          <div className="prose">
            {(policyCopy[data.path] || []).map(([title, text]) => (
              <article key={title}>
                <h2>{title}</h2>
                <p>{text}</p>
              </article>
            ))}
            <p>
              <a href="/contact">Contact & support</a> ·{" "}
              <a href="/refund-policy">Refunds</a> ·{" "}
              <a href="/privacy-policy">Privacy</a> ·{" "}
              <a href="/terms-and-conditions">Terms</a> ·{" "}
              <a href="/shipping-policy">Delivery</a>
            </p>
          </div>
        </Section>
      )}
    </>
  );
}
