import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  ArrowUpRight,
  ChevronDown,
  Menu,
  X,
  Code2,
  Cpu,
  Layers,
  Cloud,
  ShieldCheck,
  Smartphone,
} from "lucide-react";
import { business, services, type SiteData } from "../shared/content";
import { CommerceTools } from "./Commerce";

export const icons = [
  Code2,
  Smartphone,
  Layers,
  Cpu,
  Cpu,
  Layers,
  Layers,
  Smartphone,
  Cloud,
  Cloud,
  Layers,
  ShieldCheck,
  Code2,
];
export function Button({
  href,
  children,
  secondary = false,
}: {
  href: string;
  children: ReactNode;
  secondary?: boolean;
}) {
  return (
    <a className={`button ${secondary ? "button-secondary" : ""}`} href={href}>
      {children}
      <ArrowUpRight size={17} aria-hidden="true" />
    </a>
  );
}
export function Section({
  eyebrow,
  title,
  children,
  className = "",
  id,
}: {
  eyebrow?: string;
  title?: string;
  children: ReactNode;
  className?: string;
  id?: string;
}) {
  const section = useRef<HTMLElement>(null);
  useEffect(() => {
    const node = section.current;
    if (
      !node ||
      !("IntersectionObserver" in window) ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    )
      return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        node.animate(
          [{ transform: "translateY(16px)" }, { transform: "translateY(0)" }],
          { duration: 480, easing: "cubic-bezier(.2,.7,.2,1)" },
        );
        observer.disconnect();
      },
      { threshold: 0.08 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  return (
    <section ref={section} id={id} className={`section ${className}`}>
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      {title && <h2>{title}</h2>}
      {children}
    </section>
  );
}
export function Art({
  name,
  alt,
  eager = false,
}: {
  name: string;
  alt: string;
  eager?: boolean;
}) {
  return (
    <img
      className="art"
      src={`/images/${name}.svg`}
      width={1200}
      height={1000}
      alt={alt}
      loading={eager ? "eager" : "lazy"}
      decoding="async"
      fetchPriority={eager ? "high" : "auto"}
    />
  );
}
export function Header({ announcement }: { announcement?: string }) {
  const [open, setOpen] = useState(false);
  const drawer = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    drawer.current?.querySelector<HTMLElement>("a,button")?.focus();
    function key(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        trigger.current?.focus();
      }
      if (event.key === "Tab") {
        const items = Array.from(
          drawer.current?.querySelectorAll<HTMLElement>("a,button,summary") ||
            [],
        ).filter((item) => item.getClientRects().length > 0);
        if (!items?.length) return;
        const first = items[0],
          last = items[items.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        }
        if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    }
    document.addEventListener("keydown", key);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", key);
    };
  }, [open]);
  const links = [
    ["Home", "/"],
    ["Pricing", "/pricing"],
    ["Portfolio", "/portfolio"],
    ["How It Works", "/how-it-works"],
    ["About", "/about"],
    ["Contact", "/contact"],
  ];
  const resources = [
    ["Blog", "/blog"],
    ["Technologies", "/technologies"],
    ["Our Process", "/process"],
    ["FAQs", "/faq"],
    ["Careers", "/careers"],
  ];
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      {announcement && (
        <div className="announcement">
          {announcement}{" "}
          <a href={business.booking}>
            Let’s talk <ArrowUpRight size={13} />
          </a>
        </div>
      )}
      <header className="header">
        <a href="/" className="brand" aria-label="CodesBoxs home">
          <span className="brand-mark">
            <Code2 size={22} />
          </span>
          Codes<span>Boxs</span>
          <span className="brand-dot">.</span>
        </a>
        <nav className="desktop-nav" aria-label="Main navigation">
          <a href="/">Home</a>
          <details className="nav-dropdown">
            <summary>
              Services <ChevronDown size={13} />
            </summary>
            <div className="mega-menu">
              <div>
                <p className="eyebrow">WHAT WE BUILD</p>
                <h3>
                  From possibility
                  <br />
                  to production.
                </h3>
                <a href="/services">
                  Explore all services <ArrowUpRight size={16} />
                </a>
              </div>
              <div className="mega-links">
                {services.map((s, i) => {
                  const Icon = icons[i];
                  return (
                    <a href={`/services/${s.slug}`} key={s.slug}>
                      <Icon size={17} />
                      {s.title}
                    </a>
                  );
                })}
              </div>
            </div>
          </details>
          {links.slice(1, 5).map(([label, href]) => (
            <a key={href} href={href}>
              {label}
            </a>
          ))}
          <details className="nav-dropdown">
            <summary>
              Resources <ChevronDown size={13} />
            </summary>
            <div className="resource-menu">
              {resources.map(([label, href]) => (
                <a href={href} key={href}>
                  {label}
                </a>
              ))}
            </div>
          </details>
          <a href="/contact">Contact</a>
        </nav>
        <CommerceTools />
        <a href="/start-project" className="header-cta">
          Start a Project <ArrowUpRight size={15} />
        </a>
        <button
          ref={trigger}
          className="menu-toggle"
          aria-label="Open navigation"
          aria-expanded={open}
          aria-controls="mobile-navigation"
          onClick={() => setOpen(true)}
        >
          <Menu />
        </button>
      </header>
      {open && (
        <div className="drawer-backdrop">
          <div
            id="mobile-navigation"
            ref={drawer}
            className="drawer"
            role="dialog"
            aria-modal="true"
            aria-label="Navigation"
          >
            <button
              aria-label="Close navigation"
              className="drawer-close"
              onClick={() => {
                setOpen(false);
                trigger.current?.focus();
              }}
            >
              <X />
            </button>
            {links.map(([label, href]) => (
              <a href={href} key={href}>
                {label}
              </a>
            ))}
            <details>
              <summary>Services</summary>
              {services.map((s) => (
                <a key={s.slug} href={`/services/${s.slug}`}>
                  {s.title}
                </a>
              ))}
            </details>
            {resources.map(([label, href]) => (
              <a href={href} key={href}>
                {label}
              </a>
            ))}
            <Button href="/start-project">Start Your Project</Button>
            <a href={business.booking}>Book Consultation</a>
          </div>
        </div>
      )}
    </>
  );
}
export function Footer({
  note,
  settings = {},
}: {
  note?: string;
  settings?: Record<string, string>;
}) {
  const groups = {
    Company: [
      ["About", "/about"],
      ["Industries", "/industries"],
      ["Careers", "/careers"],
      ["Engagement Models", "/engagement-models"],
    ],
    Services: services.slice(0, 6).map((s) => [s.title, `/services/${s.slug}`]),
    Solutions: services.slice(6).map((s) => [s.title, `/services/${s.slug}`]),
    Resources: [
      ["AI Solutions", "/ai-solutions"],
      ["Portfolio", "/portfolio"],
      ["Blog", "/blog"],
      ["Technologies", "/technologies"],
      ["Our Process", "/process"],
      ["FAQs", "/faq"],
    ],
    Legal: [
      ["Privacy Draft", "/privacy-policy"],
      ["Terms Draft", "/terms-of-service"],
      ["Cookie Draft", "/cookie-policy"],
      ["Refund Policy", "/refund-policy"],
      ["Terms & Conditions", "/terms-and-conditions"],
      ["Digital Delivery", "/shipping-policy"],
      ["Payment Policy", "/payment-policy"],
      ["How It Works", "/how-it-works"],
      ["Pricing", "/pricing"],
    ],
  };
  return (
    <footer>
      <div className="footer-wordmark" aria-hidden="true">
        CodesBoxs<span> / ENGINEERING STUDIO</span>
      </div>
      <div className="footer-top">
        <div>
          <a className="brand" href="/">
            <span className="brand-mark">
              <Code2 size={22} />
            </span>
            Codes<span>Boxs</span>.
          </a>
          <p>Engineering Digital Excellence.</p>
          <p className="muted">
            Thoughtful products.
            <br />
            Intelligent foundations.
          </p>
          <a href={`mailto:${business.email}`}>{business.email}</a>
          <p>{business.name}</p>
          <p>
            {settings.business_email_verified === "true"
              ? settings.business_email
              : "Business email verification pending"}
          </p>
          <p>
            {settings.business_phone_verified === "true"
              ? settings.business_phone
              : "Verified phone pending"}
          </p>
          <p>
            {settings.address_verified === "true" &&
            settings.registered_address &&
            settings.registered_address === settings.document_address
              ? settings.registered_address
              : "Registered address verification pending — merchant launch blocked"}
          </p>
          <a className="footer-booking" href={business.booking}>
            Book a Free Consultation <ArrowUpRight size={14} />
          </a>
          <a href={business.github}>GitHub organization</a>
        </div>
        {Object.entries(groups).map(([name, items]) => (
          <div key={name}>
            <h3>{name}</h3>
            {items.map(([label, href]) => (
              <a key={href} href={href}>
                {label}
              </a>
            ))}
          </div>
        ))}
      </div>
      <div className="footer-bottom">
        <span>
          © {new Date().getUTCFullYear()} {business.name}
        </span>
        <span>{note || "Designed with intent. Engineered with care."}</span>
        <a href="#main" className="text-link">
          Back to top ↑
        </a>
      </div>
    </footer>
  );
}
export function ServiceCards({
  limit,
  managed = [],
}: {
  limit?: number;
  managed?: SiteData["serviceContent"];
}) {
  const entries = [
    ...services.map((service) => ({
      ...service,
      ...managed.find((entry) => entry.slug === service.slug),
    })),
    ...managed.filter(
      (entry) => !services.some((service) => service.slug === entry.slug),
    ),
  ];
  return (
    <div className="service-grid editorial-services">
      {entries.slice(0, limit).map((s, i) => {
        const Icon = icons[i] || Code2;
        return (
          <a className="service-card" href={`/services/${s.slug}`} key={s.slug}>
            <span className="icon-box" aria-hidden="true">
              <Icon size={24} />
            </span>
            <span className="card-number">
              {String(i + 1).padStart(2, "0")}
            </span>
            <h3>{s.title}</h3>
            <p>{s.summary}</p>
            <img
              className="service-preview"
              src={`/images/${services[i % services.length].image}.svg`}
              width={1200}
              height={1000}
              alt=""
              loading="lazy"
            />
            <span className="text-link">
              Explore capability <ArrowUpRight size={16} />
            </span>
          </a>
        );
      })}
    </div>
  );
}
export function ConsultationCTA() {
  return (
    <Section className="cta-section">
      <div className="cta-glow" aria-hidden="true" />
      <p className="eyebrow">YOUR NEXT CHAPTER</p>
      <h2>
        Great products start
        <br />
        with a conversation.
      </h2>
      <p>Bring the ambition. We’ll help you shape the next step.</p>
      <div className="button-row">
        <Button href="/start-project">Start Your Project</Button>
        <Button secondary href={business.booking}>
          Book a Free Consultation
        </Button>
      </div>
    </Section>
  );
}
export function Turnstile({
  data,
  onToken,
}: {
  data: SiteData;
  onToken: (token: string) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const callback = useRef(onToken);
  useEffect(() => {
    callback.current = onToken;
  }, [onToken]);
  useEffect(() => {
    if (data.localTestMode || !data.turnstileSiteKey) return;
    let widget: string | undefined;
    const interval = window.setInterval(() => {
      const api = (
        window as unknown as {
          turnstile?: {
            render: (node: HTMLElement, options: object) => string;
            remove: (id: string) => void;
          };
        }
      ).turnstile;
      if (!api || !ref.current || widget) return;
      widget = api.render(ref.current, {
        sitekey: data.turnstileSiteKey,
        theme: "dark",
        callback: (token: string) => callback.current(token),
        "expired-callback": () => callback.current(""),
        "error-callback": () => callback.current(""),
      });
      window.clearInterval(interval);
    }, 200);
    return () => {
      window.clearInterval(interval);
      const api = (
        window as unknown as { turnstile?: { remove: (id: string) => void } }
      ).turnstile;
      if (widget) api?.remove(widget);
    };
  }, [data.turnstileSiteKey, data.localTestMode]);
  if (data.localTestMode)
    return (
      <p className="notice">
        Local development security bypass active. Not for production.
      </p>
    );
  if (!data.turnstileSiteKey)
    return (
      <p className="notice">
        Form security is not configured. Please contact us by email instead.
      </p>
    );
  return <div ref={ref} className="turnstile" />;
}
