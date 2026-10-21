import { useState, Component, type ReactNode } from "react";
import {
  ArrowUpRight,
  Check,
  Sparkles,
  Command,
  ShieldCheck,
} from "lucide-react";
import {
  business,
  engagementModels,
  faqs,
  industries,
  pages,
  services,
  stages,
  type ContentRecord,
  type SiteData,
} from "../shared/content";
import {
  Art,
  Button,
  ConsultationCTA,
  Footer,
  Header,
  Section,
  ServiceCards,
  Turnstile,
} from "./components";
import { ContactForm, ProjectForm, request } from "./forms";
import { applicationSchema } from "../shared/validation";
import { FlagshipHome } from "./FlagshipHome";
import { SignatureProcess, SignatureWorkflow } from "./SignatureSystems";
import { commercePages } from "../shared/commerce";
import { CommercePage, Marketplace } from "./Commerce";

class ErrorBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? (
      <main className="section">
        <h1>Something went wrong.</h1>
        <p>Please reload the page or contact us by email.</p>
        <a href={`mailto:${business.email}`}>{business.email}</a>
      </main>
    ) : (
      this.props.children
    );
  }
}
function Hero({
  title,
  description,
  eyebrow = "ENGINEERING DIGITAL EXCELLENCE",
  image,
}: {
  title: string;
  description: string;
  eyebrow?: string;
  image?: string;
}) {
  return (
    <section className={`hero ${image ? "split-hero" : "page-hero"}`}>
      <div>
        <p className="eyebrow">
          <span className="status-dot" />
          {eyebrow}
        </p>
        <h1>{title}</h1>
        <p className="hero-description">{description}</p>
        <div className="button-row">
          <Button href="/start-project">Start Your Project</Button>
          <Button secondary href={image ? "/services" : business.booking}>
            {image ? "Explore Our Services" : "Book a Free Consultation"}
          </Button>
        </div>
        {image && (
          <div className="hero-note">
            <span>
              <ShieldCheck size={15} /> Thoughtful by design
            </span>
            <span>
              <Command size={15} /> Built for what’s next
            </span>
          </div>
        )}
      </div>
      {image && (
        <div className="hero-art">
          <div className="orbital-label label-top">
            <span className="status-dot" /> IDEAS → INTELLIGENT PRODUCTS
          </div>
          <Art
            name={image}
            alt="Original architectural geometry in titanium and warm charcoal"
            eager
          />
          <div className="orbital-label label-bottom">
            <CodeLabel />
            <span>
              Designed to connect.
              <br />
              <strong>Engineered to scale.</strong>
            </span>
          </div>
        </div>
      )}
    </section>
  );
}
function CodeLabel() {
  return <span className="code-label">&lt;/&gt;</span>;
}
function FAQ({ preview = false }: { preview?: boolean }) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const items = faqs
    .filter(
      (f) =>
        (category === "All" || f.category === category) &&
        `${f.q} ${f.a}`.toLowerCase().includes(search.toLowerCase()),
    )
    .slice(0, preview ? 4 : undefined);
  return (
    <>
      {!preview && (
        <div className="filter-bar">
          <label className="field">
            Search questions
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </label>
          <label className="field">
            Category
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {["All", ...new Set(faqs.map((f) => f.category))].map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </label>
        </div>
      )}
      <div className="faq-list">
        {items.map((f) => (
          <details key={f.q}>
            <summary>
              {f.q}
              <span aria-hidden="true">+</span>
            </summary>
            <p>{f.a}</p>
          </details>
        ))}
        {!items.length && (
          <p role="status">
            No matching questions. <a href="/contact">Ask us directly.</a>
          </p>
        )}
      </div>
      {preview && (
        <a className="text-link" href="/faq">
          All frequently asked questions <ArrowUpRight size={16} />
        </a>
      )}
    </>
  );
}
function Process({ compact = false }: { compact?: boolean }) {
  const [active, setActive] = useState(0);
  return (
    <div className="process">
      <div role="tablist" aria-label="Delivery stages" className="process-tabs">
        {stages.map(([title], i) => (
          <button
            key={title}
            id={`stage-${i}`}
            role="tab"
            aria-selected={active === i}
            aria-controls="stage-panel"
            tabIndex={active === i ? 0 : -1}
            onKeyDown={(e) => {
              if (
                [
                  "ArrowDown",
                  "ArrowRight",
                  "ArrowUp",
                  "ArrowLeft",
                  "Home",
                  "End",
                ].includes(e.key)
              ) {
                e.preventDefault();
                const next =
                  e.key === "Home"
                    ? 0
                    : e.key === "End"
                      ? 6
                      : (active +
                          (["ArrowDown", "ArrowRight"].includes(e.key)
                            ? 1
                            : 6)) %
                        7;
                setActive(next);
                document.getElementById(`stage-${next}`)?.focus();
              }
            }}
            onClick={() => setActive(i)}
          >
            <span>{String(i + 1).padStart(2, "0")}</span>
            {title}
            <ArrowUpRight size={16} />
          </button>
        ))}
      </div>
      <div
        id="stage-panel"
        className="process-panel"
        role="tabpanel"
        aria-labelledby={`stage-${active}`}
        tabIndex={0}
      >
        <span className="large-number" aria-hidden="true">
          0{active + 1}
        </span>
        <h3>{stages[active][1]}</h3>
        <p>{stages[active][2]}</p>
        {!compact && (
          <p className="muted">
            Each stage ends with shared decisions and a reviewable outcome.
            Scope and responsibilities are agreed for your engagement.
          </p>
        )}
        <Art
          name={active % 2 === 0 ? "engineering" : "cloud"}
          alt="Layered software components linked through a shared engineering workflow"
        />
      </div>
    </div>
  );
}
function AIShowcase() {
  const [mode, setMode] = useState("Knowledge assistant");
  const [prompt, setPrompt] = useState("");
  const [answer, setAnswer] = useState("");
  return (
    <div className="ai-demo">
      <div>
        <p className="eyebrow">INTERACTIVE SAMPLE · NO LIVE MODEL</p>
        <h3>A clearer path through information.</h3>
        <p>
          This deterministic demonstration uses fictional sample data. It does
          not send your text to an AI provider or make business decisions.
        </p>
        <label className="field">
          Demo workflow
          <select
            value={mode}
            onChange={(e) => {
              setMode(e.target.value);
              setAnswer("");
            }}
          >
            {[
              "Knowledge assistant",
              "Lead qualification",
              "Support triage",
            ].map((v) => (
              <option key={v}>{v}</option>
            ))}
          </select>
        </label>
        <label className="field">
          Sample question
          <input
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            maxLength={200}
            placeholder="Try: How does onboarding work?"
          />
        </label>
        <button
          className="button"
          onClick={() =>
            setAnswer(
              mode === "Knowledge assistant"
                ? "Sample answer: onboarding has three steps—create a workspace, invite collaborators and review access permissions. Source: fictional onboarding guide, section 2."
                : mode === "Lead qualification"
                  ? "Sample routing: a request for a new product goes to discovery review. Budget and decision-maker details still require human confirmation."
                  : "Sample triage: account access questions go to the support queue. No account changes are performed by this demo.",
            )
          }
        >
          <Sparkles size={16} />
          Run sample workflow
        </button>
      </div>
      <div className="demo-output">
        <div className="demo-toolbar">
          <span className="status-dot" />
          WORKFLOW SANDBOX<span>sample.json</span>
        </div>
        <SignatureWorkflow />
        <div className="sample-answer" role="status">
          {answer ||
            "Choose a workflow and run the sample to see how an explicit, bounded response can look."}
        </div>
        <div className="demo-tags">
          <span>Source-aware</span>
          <span>Human reviewed</span>
          <span>Bounded tools</span>
        </div>
      </div>
    </div>
  );
}
function Collection({
  items,
  type,
}: {
  items: ContentRecord[];
  type: "portfolio" | "blog";
}) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const filtered = items.filter(
    (p) =>
      (category === "All" || p.category === category) &&
      `${p.title} ${p.summary}`.toLowerCase().includes(search.toLowerCase()),
  );
  return (
    <>
      <div className="filter-bar">
        <label className="field">
          Search {type === "blog" ? "articles" : "concepts"}
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>
        <div className="filter-chips" aria-label="Category filters">
          {[
            "All",
            ...new Set(items.map((p) => p.category || "Engineering")),
          ].map((c) => (
            <button
              className={category === c ? "active" : ""}
              aria-pressed={category === c}
              onClick={() => setCategory(c)}
              key={c}
            >
              {c}
            </button>
          ))}
        </div>
      </div>
      <div className="project-grid">
        {filtered.map((p) => (
          <a key={p.id} className="project-card" href={`/${type}/${p.slug}`}>
            <img
              src={p.image || "/images/dashboard.svg"}
              width={800}
              height={600}
              loading="lazy"
              alt={`${p.title} ${type === "portfolio" ? "original concept illustration" : "editorial illustration"}`}
            />
            <div>
              <span className="eyebrow">
                {type === "portfolio" ? "CONCEPT PROJECT · " : ""}
                {p.category}
              </span>
              <h3>
                {p.title}
                <ArrowUpRight size={21} />
              </h3>
              <p>{p.summary}</p>
              <div className="tags">
                {(type === "portfolio"
                  ? p.technologies || ""
                  : `${Math.max(1, Math.ceil(p.body.split(/\s+/).length / 200))} min read,${p.author}`
                )
                  .split(",")
                  .map((t) => (
                    <span key={t}>{t}</span>
                  ))}
              </div>
            </div>
          </a>
        ))}
      </div>
      {!filtered.length && (
        <p role="status">
          No matching{" "}
          {type === "blog" ? "published articles" : "concept projects"}.
        </p>
      )}
    </>
  );
}
function ServicePage({ slug, data }: { slug: string; data: SiteData }) {
  const service = services.find((s) => s.slug === slug);
  const managed = data.serviceContent.find((s) => s.slug === slug);
  if (!service)
    return managed ? (
      <>
        <Hero
          title={managed.title}
          description={managed.summary}
          eyebrow="SOFTWARE & TECHNOLOGY SERVICES"
        />
        <Section title="How we can help">
          <article className="prose">
            {managed.body
              .replace(/\r\n/g, "\n")
              .split("\n\n")
              .map((paragraph, index) =>
                paragraph.startsWith("## ") ? (
                  <h2 key={index}>{paragraph.slice(3)}</h2>
                ) : (
                  <p key={index}>{paragraph}</p>
                ),
              )}
          </article>
        </Section>
        <Marketplace data={data} serviceSlug={slug} />
        <ConsultationCTA />
      </>
    ) : (
      <NotFound />
    );
  return (
    <>
      <div className="breadcrumbs">
        <a href="/">Home</a>
        <span>/</span>
        <a href="/services">Services</a>
        <span>/</span>
        <span>{service.title}</span>
      </div>
      <Hero
        title={managed?.title || service.title}
        description={managed?.summary || service.summary}
        eyebrow={service.eyebrow}
        image={service.image}
      />
      <Marketplace data={data} serviceSlug={slug} />
      <Section eyebrow="THE OPPORTUNITY" title={service.eyebrow}>
        <p className="large-copy">{managed?.body || service.description}</p>
      </Section>
      <Section
        eyebrow="WHAT WE CAN BUILD"
        title="Capabilities with a clear purpose."
      >
        <div className="two-grid">
          {service.capabilities.map((c, i) => (
            <div className="panel" key={c}>
              <span className="eyebrow">0{i + 1}</span>
              <h3>{c}</h3>
              <p>
                Scoped around your requirements, reviewed through delivery and
                documented for handover.
              </p>
            </div>
          ))}
        </div>
      </Section>
      <Section title="Business value, thoughtfully scoped.">
        <div className="two-grid">
          <div className="panel">
            <h3>Potential benefits</h3>
            <ul className="check-list">
              {service.benefits.map((v) => (
                <li key={v}>
                  <Check size={17} />
                  {v}
                </li>
              ))}
            </ul>
          </div>
          <div className="panel">
            <h3>Typical deliverables</h3>
            <ul className="check-list">
              {service.deliverables.map((v) => (
                <li key={v}>
                  <Check size={17} />
                  {v}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>
      <Section title="A collaborative path to delivery.">
        <Process compact />
      </Section>
      <Section title="Tools chosen for the job.">
        <div className="technology-pills">
          {service.technologies.map((t) => (
            <span key={t}>{t}</span>
          ))}
        </div>
      </Section>
      <Section title="A question worth asking.">
        <div className="faq-list">
          <details open>
            <summary>{service.question}</summary>
            <p>{service.answer}</p>
          </details>
          <details>
            <summary>
              What happens before {service.title.toLowerCase()} starts?
            </summary>
            <p>
              We review your goals, existing systems and constraints, then
              define the scope and acceptance criteria. Typical deliverables
              include {service.deliverables.join(", ").toLowerCase()}; the final
              agreement specifies what is included.
            </p>
          </details>
          <details>
            <summary>
              How do you choose the technologies for this service?
            </summary>
            <p>
              We compare your integration requirements, team experience and
              maintenance expectations before selecting tools.{" "}
              {service.technologies.join(", ")} are relevant options, not a
              commitment to use every tool or a claim of official partnership.
            </p>
          </details>
        </div>
      </Section>
      <Section title="Connected expertise.">
        <div className="three-grid">
          {services
            .filter((s) => s.slug !== slug)
            .slice(0, 3)
            .map((s) => (
              <a className="panel" href={`/services/${s.slug}`} key={s.slug}>
                <h3>{s.title}</h3>
                <p>{s.summary}</p>
              </a>
            ))}
        </div>
      </Section>
      <ConsultationCTA />
    </>
  );
}
function Detail({
  item,
  type,
  items,
}: {
  item: ContentRecord;
  type: "blog" | "portfolio";
  items: ContentRecord[];
}) {
  return (
    <>
      <div className="breadcrumbs">
        <a href="/">Home</a>
        <span>/</span>
        <a href={`/${type}`}>{type}</a>
        <span>/</span>
        <span>{item.title}</span>
      </div>
      <Hero
        title={item.title}
        description={item.summary}
        eyebrow={
          type === "portfolio"
            ? "CONCEPT PROJECT · NOT CLIENT WORK"
            : item.category
        }
      />
      <Section>
        <img
          className="detail-image"
          src={item.image}
          width={800}
          height={600}
          alt={`${item.title} original illustration`}
        />
        {type === "blog" && (
          <p className="muted">
            {item.author} · {item.published_at?.slice(0, 10)} ·{" "}
            {Math.max(1, Math.ceil(item.body.split(/\s+/).length / 200))} min
            read
          </p>
        )}
        <article className="prose">
          {item.body
            .replace(/\r\n/g, "\n")
            .split("\n\n")
            .map((p, i) =>
              p.startsWith("## ") ? (
                <h2 key={i}>{p.slice(3)}</h2>
              ) : (
                <p key={i}>{p}</p>
              ),
            )}
        </article>
        {type === "portfolio" && (
          <>
            <p className="notice">
              Illustrative design and architecture only. No client, revenue,
              deployment or performance outcomes are claimed.
            </p>
            <div className="technology-pills">
              {item.technologies?.split(",").map((t) => (
                <span key={t}>{t}</span>
              ))}
            </div>
            {!!item.gallery?.length && (
              <div className="two-grid" aria-label="Concept project gallery">
                {item.gallery.map((image, i) => (
                  <figure key={`${image.url}-${i}`}>
                    <img
                      className="art"
                      src={image.url}
                      alt={image.alt}
                      width={800}
                      height={600}
                      loading="lazy"
                      decoding="async"
                    />
                    <figcaption>{image.alt}</figcaption>
                  </figure>
                ))}
              </div>
            )}
          </>
        )}
      </Section>
      <Section
        title={type === "blog" ? "Keep exploring." : "Related concepts."}
      >
        <Collection items={items.filter((p) => p.id !== item.id)} type={type} />
      </Section>
      <ConsultationCTA />
    </>
  );
}
function Careers({ data }: { data: SiteData }) {
  const [job, setJob] = useState("");
  const [token, setToken] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  return (
    <>
      <Section title="How we approach the work.">
        <div className="three-grid">
          {[
            [
              "Write things down",
              "Clear decisions and useful documentation make remote collaboration easier.",
            ],
            [
              "Stay curious",
              "Question assumptions, learn from reviews and choose tools deliberately.",
            ],
            [
              "Own the quality",
              "Care about the experience, the implementation and the person maintaining it next.",
            ],
          ].map(([title, text]) => (
            <div className="panel" key={title}>
              <h3>{title}</h3>
              <p>{text}</p>
            </div>
          ))}
        </div>
        <Art
          name="team"
          alt="Original illustration of a shared digital collaboration workspace, not a photograph of actual employees"
        />
      </Section>
      <Section title="Published opportunities">
        {!data.jobs.length ? (
          <div className="empty-state">
            <h3>No open positions are currently published.</h3>
            <p>
              We do not list speculative roles or collect applications for
              nonexistent openings. Check back for owner-published
              opportunities.
            </p>
          </div>
        ) : (
          <>
            <div className="two-grid">
              {data.jobs.map((j) => (
                <div className="panel" key={j.id}>
                  <h3>{j.title}</h3>
                  <p>
                    {j.location} · {j.employment_type}
                  </p>
                  <p>{j.summary}</p>
                  <p>{j.body}</p>
                  <button className="button" onClick={() => setJob(j.id)}>
                    Apply for this position
                  </button>
                </div>
              ))}
            </div>
            {job && (
              <form
                className="form-panel"
                onSubmit={async (e) => {
                  e.preventDefault();
                  setBusy(true);
                  setMessage("");
                  const fields = new FormData(e.currentTarget);
                  try {
                    const parsed = applicationSchema.safeParse({
                      name: fields.get("name"),
                      email: fields.get("email"),
                      cover_letter: fields.get("cover_letter"),
                      portfolio_url: fields.get("portfolio_url") || "",
                      consent: fields.get("consent") === "on",
                      turnstileToken: token,
                    });
                    if (!parsed.success) {
                      setMessage(
                        parsed.error.issues
                          .map((issue) => issue.message)
                          .join(" "),
                      );
                      return;
                    }
                    await request(`/api/jobs/${job}/apply`, parsed.data);
                    setMessage(
                      "Your application has been stored. Email delivery is not yet confirmed.",
                    );
                  } catch (err) {
                    setMessage((err as Error).message);
                  } finally {
                    setBusy(false);
                  }
                }}
              >
                <h3>Application</h3>
                {[
                  ["name", "Full name"],
                  ["email", "Email"],
                  ["portfolio_url", "HTTPS portfolio URL (optional)"],
                ].map(([name, label]) => (
                  <label className="field" key={name}>
                    {label}
                    <input
                      name={name}
                      type={
                        name === "email"
                          ? "email"
                          : name === "portfolio_url"
                            ? "url"
                            : "text"
                      }
                      required={name !== "portfolio_url"}
                      maxLength={
                        name === "name" ? 100 : name === "email" ? 254 : 500
                      }
                    />
                  </label>
                ))}
                <label className="field">
                  Cover letter
                  <textarea
                    name="cover_letter"
                    required
                    minLength={30}
                    maxLength={10000}
                    rows={6}
                  />
                </label>
                <p className="notice">
                  Resume uploads are not configured. Use a portfolio link; do
                  not submit confidential documents.
                </p>
                <label className="checkbox">
                  <input type="checkbox" name="consent" required />I consent to
                  processing this application.
                </label>
                <Turnstile data={data} onToken={setToken} />
                <button
                  className="button"
                  disabled={busy || (!data.localTestMode && !token)}
                >
                  {busy ? "Saving…" : "Submit Application"}
                </button>
                <p role="status">{message}</p>
              </form>
            )}
          </>
        )}
      </Section>
    </>
  );
}
function Legal({ path }: { path: string }) {
  const sections =
    path === "/privacy-policy"
      ? [
          [
            "Information you provide",
            "Inquiry forms collect your name, email, company, optional phone, service interests, budget, timeline and project description. Newsletter registration records an email address and consent. Guest test checkout stores name, email, billing country, project requirements, order items, totals and test payment events in D1. Card numbers and CVV are never collected. Published job applications collect the displayed fields.",
          ],
          [
            "Purpose and processors",
            "Information is used to review inquiries, manage communication and administer applications or subscriptions. The planned infrastructure includes Cloudflare for hosting and database processing and a configured email provider for notifications. The owner must verify the final processors, contractual terms and applicable transfer safeguards.",
          ],
          [
            "Storage and protection",
            "Cart and display-currency preferences use local storage; private order access tokens use session storage. Admin login uses an HttpOnly session cookie. APIs use validation, prepared SQL, origin checks and access tokens. No optional analytics or advertising scripts are enabled. Cloudflare processes hosting, D1 and Turnstile data; configured email notifications use Resend. The currency provider receives server-side rate requests, not checkout customer details. RapidGateway receives no payment data while disabled.",
          ],
          [
            "Retention and rights",
            "Retention periods, lawful bases, data-controller details and jurisdiction-specific rights have not been finalized. The business owner must approve these before launch. Contact codexstechnology@gmail.com for privacy inquiries; avoid providing highly sensitive information.",
          ],
        ]
      : path === "/terms-of-service"
        ? [
            [
              "Website information",
              "The website describes potential services and illustrative concepts. It is not a binding quotation, performance guarantee or statement of certification. Concept projects are not client case studies.",
            ],
            [
              "Project agreements",
              "Scope, fees, intellectual property, licensing, delivery, confidentiality and support must be addressed in a separate signed agreement. Submitting an inquiry does not create a service contract.",
            ],
            [
              "Required legal decisions",
              "Applicable law, dispute resolution, liability provisions, legal entity particulars and enforceable acceptable-use terms require owner and qualified legal review. These draft notes must not be treated as final legal terms.",
            ],
          ]
        : [
            [
              "Essential cookies",
              "An authenticated administrator session uses an HTTP-only cookie to secure dashboard access. Cloudflare Turnstile may process browser information for abuse prevention; review its current configuration and applicable notice requirements before launch.",
            ],
            [
              "Optional technologies",
              "No analytics, advertising or optional tracking scripts are enabled by default. A decorative consent banner is therefore not included. If optional tracking is introduced, implement prior consent where required and enforce preferences before loading those technologies.",
            ],
            [
              "Owner review",
              "The owner must confirm the deployed cookie inventory, purposes, lifetimes and third-party behavior. This draft describes the intended implementation, not a verified production audit.",
            ],
          ];
  return (
    <Section>
      <div className="notice">
        <strong>OWNER / LEGAL REVIEW REQUIRED.</strong> This is an editable
        draft, not legal advice or an approved policy. Production publication is
        blocked until reviewed.
      </div>
      <article className="prose">
        {sections.map(([title, text]) => (
          <div key={title}>
            <h2>{title}</h2>
            <p>{text}</p>
          </div>
        ))}
      </article>
    </Section>
  );
}
function NotFound() {
  return (
    <>
      <Hero
        title={pages["/404"][0]}
        description={pages["/404"][1]}
        eyebrow="404 · PAGE NOT FOUND"
      />
      <Section>
        <Button href="/">Back to Home</Button>
      </Section>
    </>
  );
}
function Unsubscribe() {
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  return (
    <Section>
      <p>
        Confirm that you want to stop newsletter updates. This does not remove a
        separate project inquiry.
      </p>
      <button
        className="button"
        disabled={busy}
        onClick={async () => {
          const token = new URLSearchParams(window.location.search).get(
            "token",
          );
          if (!token) {
            setMessage(
              "The private unsubscribe token is missing. Contact us by email for help.",
            );
            return;
          }
          setBusy(true);
          try {
            const result = await request("/api/newsletter/unsubscribe", {
              token,
            });
            setMessage(String(result.message));
          } catch (error) {
            setMessage((error as Error).message);
          } finally {
            setBusy(false);
          }
        }}
      >
        {busy ? "Processing…" : "Confirm unsubscribe"}
      </button>
      <p role="status">{message}</p>
      <a href={`mailto:${business.email}`}>
        Contact us about your subscription
      </a>
    </Section>
  );
}
function PublicPage({ data }: { data: SiteData }) {
  const path = data.path;
  if (commercePages[path]) return <CommercePage data={data} />;
  if (path === "/") return <FlagshipHome data={data} />;
  if (path.startsWith("/services/"))
    return <ServicePage slug={path.split("/")[2]} data={data} />;
  if (path.startsWith("/blog/") || path.startsWith("/portfolio/")) {
    const type = path.startsWith("/blog/") ? "blog" : "portfolio";
    const items = type === "blog" ? data.posts : data.projects;
    const item = items.find((p) => p.slug === path.split("/")[2]);
    return item ? (
      <Detail item={item} type={type} items={items} />
    ) : (
      <NotFound />
    );
  }
  if (!pages[path]) return <NotFound />;
  if (path === "/404") return <NotFound />;
  const [title, description] = pages[path];
  return (
    <>
      <Hero
        title={
          path === "/contact" ? "Let’s build something extraordinary." : title
        }
        description={description}
        eyebrow={path.slice(1).replaceAll("-", " ").toUpperCase()}
      />
      {path === "/newsletter/unsubscribe" && <Unsubscribe />}
      {path === "/services" && (
        <Section>
          <ServiceCards managed={data.serviceContent} />
        </Section>
      )}
      {path === "/about" && (
        <>
          <Section title="From bold ideas to intelligent digital products.">
            <div className="two-grid">
              <div>
                <p className="large-copy">
                  CodesBoxs SMC Pvt Ltd is positioned as a software, AI and
                  digital transformation partner for businesses building their
                  next chapter.
                </p>
                <p>
                  Our approach connects product thinking, design and
                  engineering. We prioritize clear scope, practical technology
                  decisions and transparent collaboration over unverified
                  claims.
                </p>
              </div>
              <Art
                name="team"
                alt="Original collaborative workspace illustration, not a representation of verified team members"
              />
            </div>
          </Section>
          <Section title="What guides the work.">
            <div className="three-grid">
              {[
                [
                  "Mission",
                  "Help ambitious businesses turn useful ideas into maintainable digital products.",
                ],
                [
                  "Vision",
                  "Make intelligent technology more understandable, purposeful and accessible to the organizations using it.",
                ],
                [
                  "Values",
                  "Clarity, craft, accountability and curiosity guide how decisions are made and reviewed.",
                ],
              ].map(([h, p]) => (
                <div className="panel" key={h}>
                  <h3>{h}</h3>
                  <p>{p}</p>
                </div>
              ))}
            </div>
          </Section>
          <Section title="Engineering philosophy and quality standards.">
            <p className="large-copy">
              Start with the problem. Make trade-offs explicit. Build in
              reviewable increments. Test critical journeys. Document what the
              next person needs.
            </p>
            <p>
              Technology expertise spans web, mobile, APIs, cloud and AI
              workflows. Project-specific security and quality requirements are
              agreed during discovery.
            </p>
          </Section>
          <Section title="People, truthfully represented.">
            <p className="notice">
              Verified leadership names, biographies and team photography have
              not been supplied. No invented profiles are published.
            </p>
          </Section>
        </>
      )}
      {path === "/ai-solutions" && (
        <>
          <Section>
            <AIShowcase />
          </Section>
          <Section title="A toolkit for practical intelligence.">
            <div className="two-grid">
              {[
                [
                  "AI chatbots",
                  "Conversation interfaces grounded in approved knowledge and escalation paths.",
                ],
                [
                  "Autonomous AI agents",
                  "Bounded tool use with deliberate permissions and human approval for consequential actions.",
                ],
                [
                  "LLM applications",
                  "Model-powered product features with explicit cost, latency and evaluation constraints.",
                ],
                [
                  "RAG systems",
                  "Retrieval pipelines connecting model responses to relevant, authorized source material.",
                ],
                [
                  "Business automation",
                  "Structured handoffs that reduce repetitive work while preserving traceability.",
                ],
                [
                  "AI customer support",
                  "Assistance for triage, drafting and knowledge lookup—not unreviewed account changes.",
                ],
                [
                  "AI lead qualification",
                  "Organize supplied lead information for review without pretending to know missing facts.",
                ],
                [
                  "Workflow integrations",
                  "Connect business tools through authenticated APIs and observable execution.",
                ],
                [
                  "AI-powered SaaS",
                  "Tenant-aware AI features with scoped data access and product administration.",
                ],
                [
                  "Custom AI integrations",
                  "Evaluate model/provider choices against your requirements and risk boundaries.",
                ],
              ].map(([h, p]) => (
                <div className="panel" key={h}>
                  <Sparkles size={22} />
                  <h3>{h}</h3>
                  <p>{p}</p>
                </div>
              ))}
            </div>
          </Section>
        </>
      )}
      {path === "/portfolio" && (
        <Section>
          <Collection items={data.projects} type="portfolio" />
        </Section>
      )}
      {path === "/blog" && (
        <Section>
          <Collection items={data.posts} type="blog" />
        </Section>
      )}
      {path === "/industries" && (
        <Section>
          <div className="two-grid">
            {industries.map(([h, p]) => (
              <div className="panel" key={h}>
                <h2>{h}</h2>
                <p>{p}</p>
                <a className="text-link" href="/start-project">
                  Discuss your workflow <ArrowUpRight size={16} />
                </a>
              </div>
            ))}
          </div>
          <p className="notice">
            These are potential support areas, not claims of previous industry
            clients or compliance certification.
          </p>
        </Section>
      )}
      {path === "/process" && (
        <Section>
          <SignatureProcess />
        </Section>
      )}
      {path === "/technologies" && (
        <Section>
          <div className="two-grid">
            {Object.entries({
              Frontend: ["React", "Next.js", "TypeScript", "Tailwind CSS"],
              Backend: ["Node.js", "Python", "REST APIs", "GraphQL"],
              Databases: ["PostgreSQL", "MySQL", "MongoDB", "Cloudflare D1"],
              Cloud: ["Cloudflare", "AWS", "Docker"],
              AI: [
                "OpenAI-compatible APIs",
                "LLMs",
                "RAG",
                "AI agents",
                "Automation",
              ],
              Mobile: ["React Native", "Flutter"],
            }).map(([category, tools]) => (
              <div className="panel" key={category}>
                <h2>{category}</h2>
                <div className="technology-pills">
                  {tools.map((t) => (
                    <span key={t}>
                      <CodeLabel />
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <p className="notice">
            Technology names describe capabilities and options, not official
            partnerships or certifications. This website’s backend runs on
            Cloudflare Workers, not a traditional Node server.
          </p>
        </Section>
      )}
      {path === "/engagement-models" && (
        <Section>
          <div className="two-grid">
            {engagementModels.map(([h, sub, p]) => (
              <div className="panel" key={h}>
                <p className="eyebrow">{sub}</p>
                <h2>{h}</h2>
                <p>{p}</p>
                <Button secondary href="/start-project">
                  Discuss this model
                </Button>
              </div>
            ))}
          </div>
          <p>
            No guaranteed prices, staffing availability or timelines are
            implied. Terms are agreed after discovery.
          </p>
        </Section>
      )}
      {path === "/faq" && (
        <Section>
          <FAQ />
        </Section>
      )}
      {path === "/careers" && <Careers data={data} />}
      {path === "/contact" && (
        <Section>
          <div className="contact-layout">
            <aside>
              <h2>A useful conversation starts here.</h2>
              <p>
                Tell us about the problem, the people it affects and what
                success could look like.
              </p>
              <a className="contact-email" href={`mailto:${business.email}`}>
                {business.email}
              </a>
              <Button secondary href={business.booking}>
                Book a Free Consultation
              </Button>
              <p className="muted">
                Response times and project availability are discussed directly;
                no unapproved service-level promise is made.
              </p>
            </aside>
            <div>
              {data.settings.contact_note && (
                <p className="notice">{data.settings.contact_note}</p>
              )}
              <ContactForm data={data} />
            </div>
          </div>
        </Section>
      )}
      {path === "/start-project" && (
        <Section>
          <ProjectForm data={data} />
        </Section>
      )}
      {["/privacy-policy", "/terms-of-service", "/cookie-policy"].includes(
        path,
      ) && <Legal path={path} />}
      {path === "/thank-you" && (
        <Section>
          <p>
            This page does not verify a submission. A successful form response
            includes your stored record reference. If you did not receive that
            response, contact us before assuming your inquiry was received.
          </p>
          <Button href="/contact">Contact Us</Button>
        </Section>
      )}
      {![
        "/contact",
        "/start-project",
        "/thank-you",
        "/privacy-policy",
        "/terms-of-service",
        "/cookie-policy",
      ].includes(path) && <ConsultationCTA />}
    </>
  );
}
export function App({ data }: { data: SiteData }) {
  return (
    <ErrorBoundary>
      <Header announcement={data.settings.announcement} />
      <main
        id="main"
        className={`signature-page page-${data.path.split("/")[1] || "home"}`}
      >
        <PublicPage data={data} />
      </main>
      <Footer note={data.settings.footer_note} settings={data.settings} />
    </ErrorBoundary>
  );
}
