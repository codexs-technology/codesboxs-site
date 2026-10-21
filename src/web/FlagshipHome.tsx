import { useState } from "react";
import {
  ArrowUpRight,
  ArrowDown,
  Check,
  Code2,
  ShieldCheck,
} from "lucide-react";
import { type SiteData } from "../shared/content";
import { Button, Section, ServiceCards } from "./components";
import { ContactForm } from "./forms";
import { Marketplace } from "./Commerce";
import {
  SignatureEngagements,
  SignatureProcess,
  SignatureWorkflow,
} from "./SignatureSystems";
import { ProductVisual } from "./ProductVisual";

const disciplines = [
  [
    "Product engineering",
    "React · TypeScript · APIs",
    "Interfaces with intent. Architecture with room to grow. We connect considered user experiences to tested, maintainable systems.",
  ],
  [
    "Applied intelligence",
    "Retrieval · Bounded agents · Human oversight",
    "Relevant sources, deliberate evaluation and human review where decisions matter. Intelligence designed around your business, not the hype.",
  ],
  [
    "Cloud & reliability",
    "Workers · D1 · Observability",
    "Clear data ownership, observable execution and explicit deployment and recovery plans. Infrastructure that supports your next chapter.",
  ],
];

export function FlagshipHome({ data }: { data: SiteData }) {
  const [active, setActive] = useState(0);
  return (
    <>
      <section className="flagship-hero" aria-labelledby="flagship-title">
        <div className="flagship-hero-grid">
          <div className="flagship-copy">
            <p className="eyebrow">
              <span className="status-dot" /> CODESBOXS — DIGITAL ENGINEERING
              STUDIO
            </p>
            <h1 id="flagship-title">
              We Build Digital Experiences That{" "}
              <span>Move Businesses Forward.</span>
            </h1>
            <p className="flagship-description">
              We design and develop powerful websites, intelligent AI solutions,
              custom software, and scalable digital products for ambitious
              businesses worldwide.
            </p>
            <div className="button-row">
              <Button href="/services">Explore Our Services</Button>
              <Button secondary href="/start-project">
                Start Your Project
              </Button>
            </div>
            <div className="hero-assurances">
              <span>
                <ShieldCheck size={16} /> Business-first thinking
              </span>
              <span>
                <Code2 size={16} /> Design meets engineering
              </span>
            </div>
          </div>
          <ProductVisual />
        </div>
        <div className="flagship-baseline">
          <span>SOFTWARE. INTELLIGENCE. POSSIBILITY.</span>
          <a href="#expertise">
            Discover what we build <ArrowDown size={15} />
          </a>
          <span>Built with purpose. Made for people.</span>
        </div>
      </section>
      <section
        className="credibility-strip"
        aria-label="Our delivery principles"
      >
        <p>
          A clear path from
          <br />
          <strong>ambition to implementation.</strong>
        </p>
        {[
          ["01", "Strategy before software"],
          ["02", "Transparent project delivery"],
          ["03", "Maintainable by design"],
        ].map(([n, label]) => (
          <div key={n}>
            <span>{n}</span>
            <strong>{label}</strong>
          </div>
        ))}
      </section>
      <Section
        id="expertise"
        className="flagship-services"
        eyebrow="OUR EXPERTISE / BUILT AROUND YOUR BUSINESS"
      >
        <div className="section-heading-row">
          <h2>
            The right expertise.
            <br />
            <span className="copper-text">An exceptional experience.</span>
          </h2>
          <div>
            <p>
              From your first digital presence to the systems behind your next
              stage of growth. Strategy, design and development, connected.
            </p>
            <a href="/services" className="text-link">
              Explore all services <ArrowUpRight size={17} />
            </a>
          </div>
        </div>
        <ServiceCards limit={10} managed={data.serviceContent} />
      </Section>
      <Section
        id="solutions"
        className="flagship-solutions ivory"
        eyebrow="DIGITAL SOLUTIONS / IDEAS MADE TANGIBLE"
      >
        <div className="section-heading-row">
          <h2>
            Complex challenges.
            <br />
            Beautifully useful solutions.
          </h2>
          <p>
            Explore our product thinking through original interface concepts.
            These demonstrations are not completed client engagements.
          </p>
        </div>
        <div className="solution-pair">
          <ProductVisual variant={1} />
          <div className="solution-description">
            <h3>Intelligence built into every workflow.</h3>
            <p>
              Connect conversations, knowledge and business operations. AI voice
              agents, support assistants and automation designed with clear
              boundaries and human oversight.
            </p>
            <ul className="feature-list">
              {[
                "AI voice agents & conversational interfaces",
                "Knowledge-grounded chatbots & support",
                "Lead qualification & workflow automation",
                "Custom integrations with human approval",
              ].map((text) => (
                <li key={text}>
                  <Check size={17} />
                  {text}
                </li>
              ))}
            </ul>
            <Button href="/ai-solutions">Explore AI Solutions</Button>
          </div>
        </div>
        <div className="solution-capabilities">
          {[
            [
              "SaaS platforms",
              "Purposeful dashboards and scalable product architecture.",
              "/services/saas-development",
            ],
            [
              "Commerce experiences",
              "Considered storefronts and manageable catalogs.",
              "/services/ecommerce-development",
            ],
            [
              "Connected operations",
              "CRM systems and APIs that work as one.",
              "/services/erp-crm",
            ],
          ].map(([title, copy, href]) => (
            <a href={href} key={title}>
              <h3>
                {title}
                <ArrowUpRight size={20} />
              </h3>
              <p>{copy}</p>
            </a>
          ))}
        </div>
      </Section>
      <Section
        className="flagship-work"
        eyebrow="SELECTED CONCEPTS / OUR THINKING, VISUALIZED"
      >
        <div className="section-heading-row">
          <h2>
            A closer look at
            <br />
            what’s possible.
          </h2>
          <div>
            <p>
              Original product and architecture studies. No fictional clients.
              No invented outcomes.
            </p>
            <a className="text-link" href="/portfolio">
              View the concept archive <ArrowUpRight size={17} />
            </a>
          </div>
        </div>
        {data.projects.length ? (
          <div className="flagship-projects">
            {data.projects.slice(0, 3).map((project, i) => (
              <a
                key={project.id}
                href={`/portfolio/${project.slug}`}
                className="flagship-project"
              >
                <ProductVisual compact variant={i} />
                <div className="project-caption">
                  <span className="eyebrow">
                    CONCEPT STUDY / {project.category}
                  </span>
                  <h3>
                    {project.title}
                    <ArrowUpRight size={22} />
                  </h3>
                  <p>{project.summary}</p>
                  <span className="text-link">
                    Explore case study <ArrowUpRight size={16} />
                  </span>
                </div>
              </a>
            ))}
          </div>
        ) : (
          <div className="concept-empty">
            <ProductVisual compact variant={2} />
            <div>
              <h3>Product thinking, on display.</h3>
              <p>
                Explore the interactive demonstrations above while our published
                concept archive is being prepared. No client work is implied.
              </p>
              <Button href="/start-project">Discuss Your Product</Button>
            </div>
          </div>
        )}
      </Section>
      <Section
        className="flagship-intelligence"
        eyebrow="RESPONSIBLE AUTOMATION / PEOPLE STAY IN CONTROL"
      >
        <div className="section-heading-row">
          <h2>
            Useful intelligence.
            <br />
            Clear boundaries.
          </h2>
          <p>
            Follow a sample retrieval workflow. Select each step to explore how
            information is sourced, evaluated and reviewed. Fictional data; no
            live model or account actions.
          </p>
        </div>
        <SignatureWorkflow />
      </Section>
      <Section
        className="flagship-about ivory"
        eyebrow="ABOUT CODESBOXS / YOUR NEXT TECHNOLOGY PARTNER"
      >
        <div className="about-layout">
          <div className="about-material">
            <span>DESIGN WITH INTENT</span>
            <strong>
              Engineer
              <br />
              what matters.
            </strong>
            <span className="about-monogram" aria-hidden="true">
              {"{ cb }"}
            </span>
            <span>SOFTWARE + AI + DIGITAL EXPERIENCES</span>
          </div>
          <div>
            <h2>
              Good technology starts
              <br />
              with your business.
            </h2>
            <p className="large-copy">
              CodesBoxs SMC Pvt Ltd brings design thinking and software
              engineering together to build purposeful digital products.
            </p>
            <p>
              We focus on understanding your operations, making the important
              decisions clear, and delivering in reviewable stages. From
              websites and mobile experiences to intelligent internal systems,
              the work starts with what your business actually needs.
            </p>
            <div className="about-principles">
              {[
                "Clear scope & ownership",
                "Long-term maintainability",
                "Transparent collaboration",
              ].map((text) => (
                <span key={text}>
                  <Check size={17} />
                  {text}
                </span>
              ))}
            </div>
            <a href="/about" className="text-link">
              Get to know CodesBoxs <ArrowUpRight size={17} />
            </a>
          </div>
        </div>
      </Section>
      <Section
        className="flagship-process"
        eyebrow="OUR PROCESS / A CLEAR PATH TO LAUNCH"
      >
        <div className="section-heading-row">
          <h2>
            From the first question
            <br />
            to your next release.
          </h2>
          <p>
            Discover. Strategize. Design. Develop. Test. Launch and support. A
            practical delivery process with shared decisions at every stage.
          </p>
        </div>
        <SignatureProcess />
      </Section>
      <Section
        className="flagship-capabilities"
        eyebrow="THE ENGINEERING / BEHIND THE EXPERIENCE"
      >
        <div className="capability-layout">
          <h2>
            Designed to impress.
            <br />
            <span className="copper-text">Engineered to last.</span>
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
                  <span>{title}</span>
                  <ArrowUpRight size={20} />
                </button>
              ))}
            </div>
            <div className="capability-copy" aria-live="polite">
              <p className="eyebrow">{disciplines[active][1]}</p>
              <p>{disciplines[active][2]}</p>
              <a href="/technologies" className="text-link">
                Our technology approach <ArrowUpRight size={16} />
              </a>
            </div>
          </div>
        </div>
      </Section>
      <Section
        className="flagship-pricing ivory"
        eyebrow="PACKAGES & PRICING / CLARITY BEFORE COMMITMENT"
      >
        <div className="section-heading-row">
          <h2>
            The right scope.
            <br />
            An informed investment.
          </h2>
          <p>
            Compare published packages or request a tailored proposal.
            Deliverables, revisions, delivery windows and payment terms are
            agreed before work begins.
          </p>
        </div>
        <Marketplace data={data} />
      </Section>
      <SignatureEngagements />
      <Section
        id="inquiry"
        className="flagship-contact"
        eyebrow="LET’S BUILD WHAT’S NEXT"
      >
        <div className="contact-layout">
          <div>
            <h2>
              Your next chapter
              <br />
              starts with a<br />
              <span className="copper-text">conversation.</span>
            </h2>
            <p>
              Tell us what you’re building, what’s getting in the way, and where
              you want to go. We’ll help shape a practical next step.
            </p>
            <div className="contact-expectations">
              <span>01 / Share your goals</span>
              <span>02 / Discuss scope and priorities</span>
              <span>03 / Agree a tailored proposal</span>
            </div>
            <a href="/contact" className="text-link">
              More ways to get in touch <ArrowUpRight size={17} />
            </a>
          </div>
          <ContactForm data={data} />
        </div>
      </Section>
      <div className="flagship-closing">
        <Code2 size={23} />
        <span>Thoughtfully designed. Purposefully engineered.</span>
        <a href="/services">
          Explore our capabilities <ArrowUpRight size={16} />
        </a>
      </div>
    </>
  );
}
