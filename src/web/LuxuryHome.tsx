import { useState } from "react";
import { ArrowUpRight, ArrowDown } from "lucide-react";
import {
  business,
  industries,
  services,
  type SiteData,
} from "../shared/content";
import { Art, Button, Section, ServiceCards } from "./components";
import { Newsletter } from "./forms";
import { Marketplace } from "./Commerce";
import {
  SignatureEngagements,
  SignatureProcess,
  SignatureWorkflow,
} from "./SignatureSystems";

const disciplines = [
  [
    "Product engineering",
    "React · TypeScript · APIs",
    "Interfaces with intent. Architecture with room to grow. We connect a considered user experience to tested, maintainable systems.",
  ],
  [
    "Applied intelligence",
    "Python · Retrieval · Bounded agents",
    "Useful intelligence starts with boundaries: relevant sources, deliberate evaluation and human review where decisions matter.",
  ],
  [
    "Cloud & reliability",
    "Workers · D1 · Observability",
    "Build for the real world. Clear data ownership, observable execution and explicit deployment and recovery plans.",
  ],
];
function Capabilities() {
  const [active, setActive] = useState(0);
  return (
    <Section
      className="capability-section"
      eyebrow="06 / THE ENGINEERING BEHIND THE EXPERIENCE"
    >
      <div className="capability-layout">
        <h2>
          Depth.
          <br />
          Not <em>decoration.</em>
        </h2>
        <div>
          <div
            className="capability-controls"
            aria-label="Engineering disciplines"
          >
            {disciplines.map(([title], i) => (
              <button
                key={title}
                aria-pressed={active === i}
                onClick={() => setActive(i)}
              >
                {String(i + 1).padStart(2, "0")}
                <span>{title}</span>
                <ArrowUpRight size={20} />
              </button>
            ))}
          </div>
          <div className="capability-copy" aria-live="polite">
            <p className="eyebrow">{disciplines[active][1]}</p>
            <p>{disciplines[active][2]}</p>
            <a href="/technologies" className="text-link">
              Explore our technology approach <ArrowUpRight size={16} />
            </a>
          </div>
        </div>
      </div>
    </Section>
  );
}
export function LuxuryHome({ data }: { data: SiteData }) {
  return (
    <>
      <section className="cinematic-hero">
        <div className="hero-topline">
          <span>INDEPENDENT THINKING. PRECISE ENGINEERING.</span>
          <span>SOFTWARE / AI / DIGITAL EXPERIENCES</span>
        </div>
        <div className="sculpture-stage">
          <Art
            name="hero"
            alt="Original titanium ribbon sculpture with depth-projected reflective surfaces"
            eager
          />
          <span className="object-caption">
            OBJECT 001 — CONTINUOUS POSSIBILITY
          </span>
        </div>
        <div className="hero-editorial">
          <p className="eyebrow">CODESBOXS / ENGINEERING STUDIO</p>
          <h1>
            <span>Digital Ideas.</span>
            <span>Extraordinary</span>
            <span>
              <em>Results.</em>
            </span>
          </h1>
        </div>
        <div className="hero-baseline">
          <div>
            <p>
              Web Development, AI Agents, Creative Branding, and Digital
              Marketing — engineered to help businesses grow.
            </p>
            <div className="button-row">
              <Button href="/start-project">Start Your Project</Button>
              <Button secondary href="/services">
                Explore Services
              </Button>
            </div>
          </div>
          <a className="scroll-cue" href="#perspective">
            SCROLL TO DISCOVER <ArrowDown size={18} />
          </a>
        </div>
      </section>
      <div className="services-marquee" aria-label="Digital services">
        <span>
          WEB DEVELOPMENT • AI AGENTS • CREATIVE BRANDING • AUTOMATION • CLOUD
          •{" "}
        </span>
        <span aria-hidden="true">
          WEB DEVELOPMENT • AI AGENTS • CREATIVE BRANDING • AUTOMATION • CLOUD
          •{" "}
        </span>
      </div>
      <Marketplace data={data} />
      <Section
        id="perspective"
        className="brand-statement ivory"
        eyebrow="01 / A DIFFERENT PERSPECTIVE"
      >
        <div className="statement-layout">
          <span className="margin-note">
            AMBITION NEEDS
            <br />A BETTER FOUNDATION.
          </span>
          <div>
            <h2>
              Not just built.
              <br />
              <em>Considered.</em>
              <br />
              At every level.
            </h2>
            <p>
              We bring product thinking, design precision and engineering depth
              to the same table. Because exceptional digital experiences are
              never an accident.
            </p>
            <a className="text-link" href="/about">
              Meet the philosophy <ArrowUpRight size={18} />
            </a>
          </div>
        </div>
      </Section>
      <Section className="luxury-services" eyebrow="02 / WHAT WE MAKE POSSIBLE">
        <div className="section-heading-row">
          <h2>
            Engineering depth,
            <br />
            <em>with intention.</em>
          </h2>
          <p>
            From the first useful question to the last critical detail. A
            connected approach to building what comes next.
          </p>
        </div>
        <ServiceCards managed={data.serviceContent} limit={5} />
        <a href="/services" className="text-link">
          View all {services.length} capabilities <ArrowUpRight size={18} />
        </a>
      </Section>
      <section className="intelligence-scene">
        <Art
          name="ai"
          alt="Interlocking titanium geometry, an original abstract study of connected intelligence"
        />
        <div className="intelligence-copy">
          <p className="eyebrow">03 / INTELLIGENCE, WITH INTENTION</p>
          <h2>
            Less artificial.
            <br />
            More <em>useful.</em>
          </h2>
          <p>
            AI is not the destination. A better way to work is. We design
            bounded, source-aware systems around the people and processes that
            matter.
          </p>
          <Button secondary href="/ai-solutions">
            Explore applied AI
          </Button>
        </div>
        <SignatureWorkflow />
      </section>
      <Section
        className="featured-concepts ivory"
        eyebrow="04 / PRODUCT POSSIBILITIES"
      >
        <div className="section-heading-row">
          <h2>
            A glimpse of
            <br />
            <em>what could be.</em>
          </h2>
          <p>
            Original design and engineering explorations. Clearly labeled
            concepts—not completed client engagements.
          </p>
        </div>
        <div className="concept-editorial">
          {(data.projects.length
            ? data.projects.slice(0, 2).map((p) => ({
                title: p.title,
                summary: p.summary,
                href: `/portfolio/${p.slug}`,
                image: p.image,
              }))
            : [
                {
                  title: "Forma / A clearer workspace",
                  summary: "An original software product design exploration.",
                  href: "/portfolio",
                  image: "/images/dashboard.svg",
                },
                {
                  title: "Atelier / An intentional everyday",
                  summary: "An original mobile experience design exploration.",
                  href: "/portfolio",
                  image: "/images/mobile.svg",
                },
              ]
          ).map((p, i) => (
            <a className="concept-preview" href={p.href} key={p.title}>
              <div className="concept-image">
                <img
                  src={p.image || "/images/dashboard.svg"}
                  alt={`${p.title} — original concept mockup, not client work`}
                  width={1200}
                  height={1000}
                  loading="lazy"
                />
              </div>
              <div className="concept-meta">
                <span>CONCEPT STUDY / 0{i + 1}</span>
                <ArrowUpRight size={22} />
              </div>
              <h3>{p.title}</h3>
              <p>{p.summary}</p>
            </a>
          ))}
        </div>
        <a href="/portfolio" className="text-link">
          Explore the concept archive <ArrowUpRight size={18} />
        </a>
      </Section>
      <Capabilities />
      <Section
        className="story-process"
        eyebrow="07 / HOW AMBITION BECOMES REAL"
      >
        <div className="section-heading-row">
          <h2>
            From a question.
            <br />
            To <em>what’s next.</em>
          </h2>
          <a href="/process" className="text-link">
            Our complete process <ArrowUpRight size={18} />
          </a>
        </div>
        <SignatureProcess />
      </Section>
      <Section
        className="industry-editorial ivory"
        eyebrow="08 / BUILT AROUND YOUR WORLD"
      >
        <div className="industry-heading">
          <h2>
            Different worlds.
            <br />
            Shared <em>possibility.</em>
          </h2>
          <p>
            Technology earns its place by solving a real problem. These are
            potential areas of support, not claims of previous industry clients.
          </p>
        </div>
        <div className="industry-rows">
          {industries.slice(0, 6).map(([title, copy], i) => (
            <a href="/industries" key={title}>
              <span>0{i + 1}</span>
              <h3>{title}</h3>
              <p>{copy}</p>
              <ArrowUpRight size={20} />
            </a>
          ))}
        </div>
      </Section>
      <Section
        className="philosophy-section"
        eyebrow="09 / THE STANDARD WE HOLD"
      >
        <h2>
          Clarity is luxury.
          <br />
          <em>Craft is substance.</em>
        </h2>
        <div className="philosophy-bottom">
          <span>NO NOISE. NO INVENTED PROMISES.</span>
          <p>
            We believe the most impressive technology is the kind that makes
            complexity feel simple. Honest decisions. Thoughtful details. Work
            built to be understood, used and maintained.
          </p>
        </div>
      </Section>
      <SignatureEngagements />
      <Section
        className="luxury-contact ivory"
        eyebrow="10 / YOUR NEXT CHAPTER"
      >
        <a href="/start-project" className="contact-statement">
          <h2>
            YOUR NEXT BIG IDEA
            <br />
            DESERVES EXCEPTIONAL
            <br />
            <em>ENGINEERING.</em>
          </h2>
          <ArrowUpRight aria-hidden="true" />
        </a>
        <div className="button-row">
          <Button href="/start-project">Start a Project</Button>
          <Button secondary href={business.booking}>
            Book a Consultation
          </Button>
        </div>
        <div className="contact-baseline">
          <a href={`mailto:${business.email}`}>{business.email}</a>
          <a href={business.booking} className="text-link">
            Book a consultation <ArrowUpRight size={18} />
          </a>
        </div>
        <div className="editorial-newsletter">
          <Newsletter data={data} />
        </div>
      </Section>
    </>
  );
}
