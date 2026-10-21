export type Service = {
  slug: string;
  title: string;
  eyebrow: string;
  summary: string;
  description: string;
  capabilities: string[];
  benefits: string[];
  deliverables: string[];
  technologies: string[];
  question: string;
  answer: string;
  image: string;
};
export const business = {
  name: "CodesBoxs SMC Pvt Ltd",
  brand: "CodesBoxs",
  email: "codexstechnology@gmail.com",
  booking: "https://calendly.com/codexstechnology/30min",
  github: "https://github.com/codexs-technology",
};
export const services: Service[] = [
  {
    slug: "web-development",
    title: "Web Development",
    eyebrow: "The web, engineered better",
    summary:
      "Fast, accessible websites and web applications built around the people who use them.",
    description:
      "A good website is more than an attractive interface. We connect content strategy, interaction design and reliable engineering so your digital presence can become a useful business tool. From marketing sites to authenticated platforms, the architecture follows your workflows—not a template.",
    capabilities: [
      "Server-rendered business websites",
      "Interactive web applications",
      "Content platforms and publishing",
      "Accessibility and performance remediation",
    ],
    benefits: [
      "Clear paths from discovery to inquiry",
      "Content your team can maintain",
      "A foundation that can evolve without a rewrite",
    ],
    deliverables: [
      "Responsive design system",
      "Tested application and content workflows",
      "Deployment and maintenance documentation",
    ],
    technologies: ["React", "TypeScript", "Next.js", "Cloudflare"],
    question: "Can you improve an existing website?",
    answer:
      "Yes. We start with a technical and UX review, then agree which parts to retain, improve or replace. A complete rebuild is not always necessary.",
    image: "engineering",
  },
  {
    slug: "mobile-app-development",
    title: "Mobile App Development",
    eyebrow: "Useful everywhere",
    summary:
      "Thoughtful mobile experiences that connect your product to everyday life.",
    description:
      "Mobile products need to work within real-world constraints: interrupted networks, small screens and impatient users. We design task-focused flows and choose native or cross-platform approaches according to device features, release plans and your team’s maintenance needs.",
    capabilities: [
      "Cross-platform iOS and Android applications",
      "Offline-aware workflows",
      "Push notifications and device integrations",
      "App release preparation",
    ],
    benefits: [
      "Consistent workflows across devices",
      "Purposeful touch-first interactions",
      "A maintainable release process",
    ],
    deliverables: [
      "Interactive mobile prototype",
      "Application source and API integration",
      "Device test plan and store submission guidance",
    ],
    technologies: ["React Native", "Flutter", "TypeScript", "REST APIs"],
    question: "Will a cross-platform app suit my product?",
    answer:
      "Often, but not always. We assess hardware integrations, animation complexity and platform requirements before recommending an approach.",
    image: "mobile",
  },
  {
    slug: "custom-software",
    title: "Custom Software",
    eyebrow: "Built for your operating reality",
    summary:
      "Purpose-built systems that turn complicated operations into coherent workflows.",
    description:
      "When spreadsheets and disconnected tools no longer fit, custom software can make work easier to coordinate. We map the people, permissions and exceptions behind each process before designing a system that supports the way your organization operates.",
    capabilities: [
      "Internal operations platforms",
      "Approval and reporting workflows",
      "Legacy system modernization",
      "Role-based applications",
    ],
    benefits: [
      "Less repetitive administration",
      "Clear ownership of business data",
      "Better visibility into daily operations",
    ],
    deliverables: [
      "Workflow and domain model",
      "Custom application with permissions",
      "Migration, training and support plan",
    ],
    technologies: ["TypeScript", "Python", "PostgreSQL", "REST APIs"],
    question: "How do you avoid building unnecessary features?",
    answer:
      "Discovery identifies the smallest valuable workflow. We prioritize it, test it with users and expand only when evidence supports the next investment.",
    image: "engineering",
  },
  {
    slug: "ai-development",
    title: "AI Development",
    eyebrow: "Intelligence with a purpose",
    summary:
      "Practical AI applications grounded in your data, goals and risk boundaries.",
    description:
      "AI is most useful when it solves a defined task and its output can be evaluated. We help choose appropriate models, build retrieval and evaluation pipelines, and design human review where errors have consequences. Sensitive data handling and cost controls belong in the architecture from the beginning.",
    capabilities: [
      "LLM-powered applications",
      "Retrieval-augmented generation",
      "Document understanding",
      "Model evaluation and observability",
    ],
    benefits: [
      "Faster access to relevant information",
      "Repeatable evaluation of model quality",
      "Explicit controls around uncertainty",
    ],
    deliverables: [
      "Feasibility assessment and evaluation set",
      "AI application with guardrails",
      "Model cost and monitoring documentation",
    ],
    technologies: ["Python", "OpenAI-compatible APIs", "LLMs", "RAG"],
    question: "Can AI responses be guaranteed correct?",
    answer:
      "No. We design evaluations, source attribution, fallback behavior and human review rather than presenting model output as infallible.",
    image: "ai",
  },
  {
    slug: "ai-agents-automation",
    title: "AI Agents & Automation",
    eyebrow: "Automate with boundaries",
    summary:
      "Connected workflows and bounded agents that help teams focus on decisions.",
    description:
      "An agent should have a clear job, limited permissions and an observable execution trail. We connect tools and business systems with deliberate approval gates so automation can assist your team without silently taking irreversible actions.",
    capabilities: [
      "Lead qualification workflows",
      "Support triage and routing",
      "Tool-connected AI agents",
      "Human-in-the-loop approvals",
    ],
    benefits: [
      "Fewer manual handoffs",
      "Traceable automated decisions",
      "Controlled access to business tools",
    ],
    deliverables: [
      "Workflow map and permission policy",
      "Automated integrations with retries",
      "Runbook and execution monitoring",
    ],
    technologies: ["LLMs", "TypeScript", "Python", "Webhooks"],
    question: "Can an agent act without approval?",
    answer:
      "Only for actions explicitly approved in the project scope. High-impact actions should require human confirmation and have a rollback strategy.",
    image: "ai",
  },
  {
    slug: "saas-development",
    title: "SaaS Development",
    eyebrow: "From product thesis to platform",
    summary:
      "Multi-tenant products with thoughtful onboarding, permissions and growth foundations.",
    description:
      "A SaaS product has to serve users and operators at the same time. We plan tenant boundaries, billing integration, support tools and product analytics alongside the core experience. Early releases validate a focused problem before the roadmap grows.",
    capabilities: [
      "MVP and product platform engineering",
      "Tenant isolation and permissions",
      "Subscription and billing integration",
      "Product administration tools",
    ],
    benefits: [
      "A focused first release",
      "Clear tenant and data boundaries",
      "Operational tools for your product team",
    ],
    deliverables: [
      "Product roadmap and architecture",
      "Tested SaaS application",
      "Launch checklist and operator documentation",
    ],
    technologies: ["React", "TypeScript", "PostgreSQL", "Cloudflare"],
    question: "What belongs in the first version?",
    answer:
      "The smallest complete journey that solves the target customer’s core problem. Billing, reliability and support should be scoped intentionally, not added as afterthoughts.",
    image: "dashboard",
  },
  {
    slug: "ecommerce-development",
    title: "E-commerce Development",
    eyebrow: "Make every purchase feel easy",
    summary:
      "Commerce experiences that connect discovery, checkout and fulfillment.",
    description:
      "E-commerce involves more than a storefront. We consider product data, inventory, payment providers and fulfillment operations so the shopping experience remains consistent after the order is placed. Platform selection is based on your catalog, integrations and ownership requirements.",
    capabilities: [
      "Custom and headless storefronts",
      "Catalog and search experiences",
      "Payment provider integration",
      "Inventory and fulfillment connections",
    ],
    benefits: [
      "Clearer product discovery",
      "Reliable order handoffs",
      "A storefront aligned with your brand",
    ],
    deliverables: [
      "Commerce UX and storefront",
      "Tested payment and order workflows",
      "Operational handover and launch plan",
    ],
    technologies: ["React", "TypeScript", "REST APIs", "Webhooks"],
    question: "Do you store card information?",
    answer:
      "Projects should use appropriate payment-provider hosted or tokenized flows. Handling raw card data requires additional scope and compliance review.",
    image: "dashboard",
  },
  {
    slug: "ui-ux-design",
    title: "UI/UX Design",
    eyebrow: "Clarity is a competitive advantage",
    summary:
      "Research-led interfaces that make complex products understandable.",
    description:
      "We translate user needs and business constraints into usable product experiences. Mapping tasks, testing prototypes and specifying accessible states helps engineering teams build the right thing with fewer ambiguous handoffs.",
    capabilities: [
      "User journey and information architecture",
      "Wireframes and interactive prototypes",
      "Design systems",
      "Usability and accessibility reviews",
    ],
    benefits: [
      "More coherent product navigation",
      "Consistent reusable components",
      "Earlier feedback before expensive implementation",
    ],
    deliverables: [
      "Research findings and journey maps",
      "High-fidelity responsive designs",
      "Component specifications and handoff",
    ],
    technologies: [
      "Design systems",
      "Prototyping",
      "WCAG",
      "Responsive design",
    ],
    question: "Can design work happen before development?",
    answer:
      "Yes. A standalone discovery and design engagement can produce tested flows and a handoff package for your own engineering team.",
    image: "mobile",
  },
  {
    slug: "cloud-devops",
    title: "Cloud & DevOps",
    eyebrow: "Reliable from commit to production",
    summary:
      "Repeatable deployments, observable systems and practical infrastructure planning.",
    description:
      "Infrastructure should be understandable to the team responsible for it. We design deployment pipelines, environment boundaries and monitoring around your availability requirements and operational capacity. Cost, backups and recovery are part of the design conversation.",
    capabilities: [
      "Cloud architecture and migrations",
      "CI/CD pipelines",
      "Monitoring and incident runbooks",
      "Backup and recovery planning",
    ],
    benefits: [
      "Repeatable release processes",
      "Better visibility into failures",
      "Infrastructure choices matched to your workload",
    ],
    deliverables: [
      "Architecture and environment configuration",
      "Automated deployment pipeline",
      "Monitoring and recovery runbook",
    ],
    technologies: ["Cloudflare", "AWS", "Docker", "GitHub Actions"],
    question: "Which cloud provider should we use?",
    answer:
      "The answer depends on workload, data residency, existing expertise and cost. We compare appropriate options instead of defaulting every project to one vendor.",
    image: "cloud",
  },
  {
    slug: "api-integrations",
    title: "API & Integrations",
    eyebrow: "Systems that work together",
    summary:
      "Well-defined APIs and resilient integrations between the tools you depend on.",
    description:
      "Disconnected systems create duplicated work and inconsistent records. We define contracts, ownership and failure behavior so data can move predictably between products. Idempotency, authentication and webhook verification are considered from the outset.",
    capabilities: [
      "REST and GraphQL APIs",
      "Third-party system integrations",
      "Webhook processing",
      "Data synchronization and migration",
    ],
    benefits: [
      "Less duplicate data entry",
      "Explicit integration contracts",
      "Recoverable failures and traceable events",
    ],
    deliverables: [
      "API contracts and documentation",
      "Integration implementation and tests",
      "Monitoring and retry procedures",
    ],
    technologies: ["REST APIs", "GraphQL", "TypeScript", "Python"],
    question: "What happens when a third-party service fails?",
    answer:
      "We define timeout, retry and reconciliation behavior according to the workflow. Important events need durable records rather than silent best-effort calls.",
    image: "cloud",
  },
  {
    slug: "erp-crm",
    title: "ERP & CRM Solutions",
    eyebrow: "A clearer view of your business",
    summary:
      "Connected customer and operational systems built around accountable workflows.",
    description:
      "Business systems work best when the underlying processes are clear. We help map lead stages, inventory movements, approvals and reporting requirements before configuring or building ERP and CRM capabilities. Adoption and migration are first-class workstreams.",
    capabilities: [
      "CRM workflows and lead pipelines",
      "Operational modules and dashboards",
      "Data migration and deduplication",
      "Role-based reporting",
    ],
    benefits: [
      "Consistent records across teams",
      "Clear process ownership",
      "Reporting based on structured data",
    ],
    deliverables: [
      "Process specification and data model",
      "Configured or custom business system",
      "Migration and user training plan",
    ],
    technologies: ["PostgreSQL", "MySQL", "REST APIs", "React"],
    question: "Should we customize a platform or build our own?",
    answer:
      "We compare workflow fit, licensing, integrations and long-term maintenance. Custom development is useful when it solves gaps that configuration cannot reasonably cover.",
    image: "dashboard",
  },
  {
    slug: "cybersecurity",
    title: "Cybersecurity",
    eyebrow: "Security is an engineering discipline",
    summary:
      "Practical security reviews and hardening for applications and delivery workflows.",
    description:
      "We help identify application risks and improve the controls around authentication, data access and deployment. Work is scoped with authorization and clear boundaries. Security reviews reduce risk; they do not establish that a system is immune to every attack.",
    capabilities: [
      "Application threat modeling",
      "Authentication and authorization review",
      "Dependency and configuration review",
      "Secure development practices",
    ],
    benefits: [
      "Prioritized remediation work",
      "Clearer trust boundaries",
      "Repeatable security checks in delivery",
    ],
    deliverables: [
      "Scoped findings and risk register",
      "Remediation recommendations or implementation",
      "Verification and maintenance checklist",
    ],
    technologies: [
      "OWASP guidance",
      "Cloudflare",
      "Access controls",
      "Security headers",
    ],
    question: "Do you guarantee complete security?",
    answer:
      "No responsible review can guarantee that. Findings are bounded by scope and test coverage; continued monitoring and maintenance remain important.",
    image: "security",
  },
  {
    slug: "digital-marketing",
    title: "Digital Marketing",
    eyebrow: "A measurable path to discovery",
    summary:
      "Technical SEO, content foundations and conversion-focused digital experiences.",
    description:
      "A useful acquisition strategy connects the right audience to a credible product story. We support technical search foundations, landing page quality and measurement design. Goals and attribution limitations are agreed before evaluating campaign results.",
    capabilities: [
      "Technical SEO and content structure",
      "Conversion-focused landing pages",
      "Consent-aware analytics planning",
      "Campaign integration support",
    ],
    benefits: [
      "Better-organized discoverable content",
      "Clearer conversion journeys",
      "Measurement tied to business objectives",
    ],
    deliverables: [
      "Technical and content audit",
      "Landing pages and measurement plan",
      "Prioritized optimization roadmap",
    ],
    technologies: [
      "Structured data",
      "Web analytics",
      "Core Web Vitals",
      "Content strategy",
    ],
    question: "Can you guarantee rankings or revenue?",
    answer:
      "No. Search visibility and business results depend on competition, product-market fit and many external factors. We agree measurable work and report evidence transparently.",
    image: "engineering",
  },
  {
    slug: "branding-design",
    title: "Branding & Graphic Design",
    eyebrow: "An identity with intention",
    summary:
      "Distinctive visual identities, logos and campaign assets that give your business a coherent presence.",
    description:
      "We translate your positioning into a practical visual language. Logo exploration, typography, color and layout rules come together in a usable identity system, with digital and marketing assets scoped around the channels you actually use.",
    capabilities: [
      "Logo design and identity systems",
      "Brand guidelines and digital templates",
      "Banner and campaign design",
      "Social media creative",
    ],
    benefits: [
      "A consistent presence across touchpoints",
      "Reusable assets for your team",
      "Design decisions connected to positioning",
    ],
    deliverables: [
      "Agreed logo and identity assets",
      "Typography, color and usage guidelines",
      "Scoped banner, social or campaign files",
    ],
    technologies: [
      "Vector design",
      "Design systems",
      "Digital asset production",
    ],
    question: "Are revisions and ownership included?",
    answer:
      "Revision rounds, file formats, font and asset licensing, and ownership transfer are explicitly agreed in your proposal before design begins.",
    image: "engineering",
  },
];

export const stages = [
  [
    "Discovery",
    "Understand the problem before choosing the solution.",
    "We map goals, users, constraints and existing systems. You receive a shared brief, open questions and a definition of success.",
  ],
  [
    "Strategy",
    "Make architecture and scope deliberate.",
    "We compare technical options, prioritize the first useful release and agree risks, milestones and ownership.",
  ],
  [
    "UX/UI Design",
    "Turn complex workflows into clear experiences.",
    "Wireframes and interactive prototypes make decisions tangible. Accessible states and responsive behavior are specified before implementation.",
  ],
  [
    "Development",
    "Build in reviewable increments.",
    "Version-controlled work, code review and regular demonstrations keep progress visible. Integration and migration risks are addressed early.",
  ],
  [
    "Quality Assurance",
    "Test the journeys that matter.",
    "Functional, accessibility, security and performance checks are selected for the product. Findings are tracked, fixed and retested.",
  ],
  [
    "Deployment",
    "Launch with a plan, not a leap.",
    "Environment configuration, release checks and rollback procedures are verified. Production changes happen with agreed approval.",
  ],
  [
    "Support & Optimization",
    "Keep improving after launch.",
    "A scoped support arrangement can cover monitoring, maintenance and evidence-led iteration as the product evolves.",
  ],
];
export const industries = [
  [
    "Healthcare",
    "Patient-facing experiences, appointment workflows and internal tools—with privacy, access controls and applicable compliance reviewed during discovery.",
  ],
  [
    "Finance & FinTech",
    "Financial dashboards, secure integrations and approval workflows. Regulatory requirements and audit needs must be scoped with qualified stakeholders.",
  ],
  [
    "Retail & E-commerce",
    "Connected storefronts, product catalogs, inventory systems and order operations.",
  ],
  [
    "Education",
    "Learning platforms, enrollment journeys and administrative workflows designed for diverse users.",
  ],
  [
    "Real Estate",
    "Property discovery, inquiry routing and document workflows that make complex transactions easier to coordinate.",
  ],
  [
    "Logistics",
    "Shipment visibility, dispatch interfaces and integrations between operational systems.",
  ],
  [
    "Hospitality",
    "Booking experiences, guest communication and connected service operations.",
  ],
  [
    "Professional Services",
    "Client portals, project workflows and knowledge systems for service-led businesses.",
  ],
  [
    "Startups",
    "Focused MVPs, product validation and a technical foundation that can adapt to feedback.",
  ],
  [
    "Enterprise",
    "Modernization, integration and internal platforms with deliberate security and change-management boundaries.",
  ],
];
export const engagementModels = [
  [
    "Fixed-scope project",
    "For a well-defined outcome",
    "An agreed scope, delivery plan and change process keep expectations explicit. Suitable when requirements and acceptance criteria are clear.",
  ],
  [
    "Dedicated development team",
    "For an evolving product roadmap",
    "A scoped team works through prioritized milestones with regular reviews. Composition and availability are agreed for each engagement.",
  ],
  [
    "Staff augmentation",
    "For additional engineering capacity",
    "Integrate selected skills into your existing delivery process, with clear responsibilities, access boundaries and collaboration expectations.",
  ],
  [
    "MVP development",
    "For validating a focused product idea",
    "Define a small complete customer journey, learn from its use and make the next investment based on evidence.",
  ],
  [
    "Technology partnership",
    "For continuity beyond launch",
    "Plan ongoing improvements and support under an explicit agreement covering responsibilities, service scope and review cadence.",
  ],
];
export const faqs = [
  {
    category: "Working together",
    q: "How do we start a project?",
    a: "Send a project inquiry or book a consultation. We will discuss your goals, constraints and existing systems before proposing a scope and next steps.",
  },
  {
    category: "Working together",
    q: "Do you work with international businesses?",
    a: "Our collaboration approach supports remote discovery, documented decisions and milestone reviews. Communication windows and delivery arrangements are agreed for each project.",
  },
  {
    category: "Delivery",
    q: "How much does a project cost?",
    a: "Pricing depends on scope, integrations, complexity and engagement model. We do not publish a guaranteed price before understanding those factors.",
  },
  {
    category: "Delivery",
    q: "How long will development take?",
    a: "A timeline is estimated after discovery. Dependencies, approval turnaround and changes to scope can affect delivery; milestones should remain visible throughout the engagement.",
  },
  {
    category: "Engineering",
    q: "Can you work with our existing codebase?",
    a: "Yes. A technical review helps identify what can be preserved and where changes are needed. We do not assume that a rewrite is the right answer.",
  },
  {
    category: "AI",
    q: "How do you handle AI reliability?",
    a: "We evaluate defined tasks, design source attribution and fallbacks, and include human review where appropriate. AI output is not treated as inherently correct.",
  },
  {
    category: "Engineering",
    q: "Who owns the source code?",
    a: "Ownership, licenses and handover terms are defined in the project agreement. Clarify these terms before work begins.",
  },
  {
    category: "Delivery",
    q: "Is ongoing support available?",
    a: "Support can be scoped separately or as part of a partnership. Coverage, response expectations and maintenance responsibilities must be agreed rather than assumed.",
  },
  {
    category: "Privacy",
    q: "How is my inquiry information used?",
    a: "Inquiry information is used to evaluate and respond to your request. The privacy page is an owner-review draft; contact us before sending highly sensitive information.",
  },
];
export type ContentRecord = {
  gallery?: { url: string; alt: string }[];
  id: string;
  slug: string;
  title: string;
  summary: string;
  body: string;
  status: string;
  category?: string;
  author?: string;
  image?: string;
  technologies?: string;
  is_concept?: number;
  published_at?: string;
  location?: string;
  employment_type?: string;
};
export type SiteData = {
  path: string;
  posts: ContentRecord[];
  projects: ContentRecord[];
  jobs: ContentRecord[];
  serviceContent: ContentRecord[];
  turnstileSiteKey: string;
  siteUrl: string;
  localTestMode: boolean;
  settings: Record<string, string>;
};
export const pages: Record<string, [string, string]> = {
  "/newsletter/unsubscribe": [
    "Manage your newsletter subscription",
    "Use the private link from your subscription email to unsubscribe. No action is taken until you confirm.",
  ],
  "/": [
    "We Build Intelligent Digital Experiences.",
    "CodesBoxs helps ambitious businesses design, build, and scale powerful software, AI solutions, and digital platforms.",
  ],
  "/about": [
    "Engineering Digital Excellence.",
    "A technology partner focused on thoughtful design, reliable engineering and transparent collaboration.",
  ],
  "/services": [
    "Expertise that moves you forward.",
    "From the first product decision to the infrastructure underneath it, explore connected engineering capabilities.",
  ],
  "/ai-solutions": [
    "Practical intelligence. Meaningful impact.",
    "Explore AI systems designed around real workflows, measurable tasks and responsible human oversight.",
  ],
  "/portfolio": [
    "Ideas made tangible.",
    "Explore original concept projects demonstrating product thinking and architecture. These are not client case studies.",
  ],
  "/industries": [
    "Your context shapes the solution.",
    "Explore how thoughtful software and AI can support the specific workflows of different industries.",
  ],
  "/process": [
    "Clarity at every milestone.",
    "A collaborative delivery process from discovery through ongoing optimization.",
  ],
  "/technologies": [
    "The right tools. For the right reasons.",
    "Technology choices are guided by workload, maintainability and your team—not trends alone.",
  ],
  "/engagement-models": [
    "A partnership that fits your ambition.",
    "Choose a delivery model that matches the maturity, scope and operating needs of your product.",
  ],
  "/blog": [
    "Notes from the engineering desk.",
    "Original practical perspectives on software architecture, AI and digital product development.",
  ],
  "/careers": [
    "Build useful things. Thoughtfully.",
    "Explore our working approach and any owner-published opportunities. No unverified job openings are advertised.",
  ],
  "/faq": [
    "Good questions. Clear answers.",
    "Learn about project discovery, delivery, AI reliability and working with CodesBoxs.",
  ],
  "/contact": [
    "Let’s build what’s next.",
    "Tell us what you are working on. Share enough context to begin a useful conversation.",
  ],
  "/start-project": [
    "From bold idea to a clear brief.",
    "A guided project inquiry to capture your goals, service needs, timing and contact details.",
  ],
  "/privacy-policy": [
    "Privacy policy — review draft",
    "Editable privacy information requiring business owner and legal review before production publication.",
  ],
  "/terms-of-service": [
    "Terms of service — review draft",
    "Draft website terms. These do not replace a signed project agreement or legal advice.",
  ],
  "/cookie-policy": [
    "Cookie policy — review draft",
    "Information about essential security cookies and the absence of optional tracking by default.",
  ],
  "/thank-you": [
    "Your next chapter starts with a conversation.",
    "Submission confirmation appears only after a successful database response. This page alone is not a receipt.",
  ],
  "/404": [
    "This page is off the map.",
    "The page may have moved or the address may be incorrect. Return home or explore our services.",
  ],
};
