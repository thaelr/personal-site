import type { SiteContent } from "./types"

/** English is the original copy. Strings are moved verbatim from the components. */
export const en: SiteContent = {
  meta: {
    title: "Nikolai Sekushenko — AI Product Engineer",
    description:
      "AI Product Engineer building conversational AI systems, end-to-end products and business automation. Previously grew an e-commerce business to $1.5M in annual revenue.",
  },
  nav: {
    ariaLabel: "Global site navigation",
    languageLabel: "Language",
    items: {
      home: "HOME",
      work: "WORK",
      about: "ABOUT",
      contact: "CONTACT",
    },
  },
  home: {
    name: "Nikolai Sekushenko",
    badge: "AI PRODUCT ENGINEER",
    careerLines: [
      "From a Siberian semiconductor lab to a $1.5M",
      "e-commerce business and conversational AI products.",
    ],
    actions: {
      work: "VIEW WORK",
      about: "ABOUT ME",
    },
    portraitAlt: "Black-and-white portrait of Nikolai Sekushenko",
  },
  work: {
    eyebrow: "SELECTED WORK / TWO SYSTEMS BUILT END TO END",
    title: "Work",
    index: [
      {
        id: "midnight-persona",
        index: "01 / PRODUCT",
        title: "Midnight Persona",
        description: "Product, Engineering & Art Direction — Built Independently",
        metrics: [
          { value: "2.6K+", label: "Users" },
          { value: "42%", label: "Repeat buyers" },
        ],
        status: { label: "CURRENT PHASE", value: "GROWTH VALIDATION" },
      },
      {
        id: "ecommerce",
        index: "02 / OPERATIONS",
        title: "E-commerce Operations & Growth",
        caseIntro: [
          "In late 2021, I took over what had once been a nationwide home-appliance retail brand — eight years earlier, its billboards had appeared across roughly half of Russia’s regions. What remained was a near-loss-making online store with an expensive but outdated website and database, fragmented operations, and no repeatable process for growing sales. The store carried just 600–800 products from a single dropshipping supplier, while its technical and operational setup had barely evolved since the retail-chain years.",
          "A few months later, Russia launched its full-scale invasion of Ukraine.",
        ],
        description: "4 Years of End-to-End Responsibility",
        metrics: [
          { value: "$1.5M", label: "Annual Revenue" },
          { value: "16×", label: "Revenue Growth" },
          { value: "7%+", label: "Profit Margin" },
        ],
      },
      {
        id: "client-work",
        index: "03 / CLIENT WORK",
        title: "Client Projects",
        description: "Custom software from business requirements to production",
        metrics: [],
      },
    ],
    intro:
      "Two products built to turn natural conversation into reliable product behavior and business operations.",
    chartAlt: "Distribution of dialogue engine beta-test conversation lengths",
    caseMeta: {
      midnightPersona: {
        eyebrow: "2025–2026 / PRODUCT, ENGINEERING, ART DIRECTION",
        additionalMetrics: [{ value: "20K+", label: "User messages" }],
      },
      ecommerce: {
        eyebrow: "2021–2025 / HEAD OF E-COMMERCE",
        status: { label: "CURRENT PHASE", value: "DISCONTINUED" },
      },
      clientWork: {
        title: "Client Work",
        caseEyebrow: "01 / LEAD MANAGEMENT",
        service: "Conversational AI / Business Process Automation & Integration for",
        clientName: "wooftattoo",
        clientUrl: "https://wooftattoo.com/",
      },
    },
    linkLabels: {
      presentation: "PDF PRESENTATION",
      github: "GITHUB",
    },
    notice: {
      title: "MIDNIGHT PERSONA / NOTICE 001",
      paragraphs: [
        "You may reasonably assume that what you're about to see is an elaborate joke.",
        "Unfortunately, it isn't.",
      ],
      okay: "OKAY",
      close: "Close notice",
    },
    cases: [
      {
        slug: "case-01",
        index: "01 / CONVERSATIONAL AI PRODUCT",
        title: "Conversational AI Engine",
        tags: [
          { text: "Used in own product", statusIndicator: true },
          { text: "B2B integration-ready", statusIndicator: true },
        ],
        lead:
          "Adaptive conversational AI engine built for high-engagement customer interactions.",
        statement: [
          { text: "For products where conversation is part of monetization: " },
          { text: "soft-skills training", highlight: true },
          { text: ", " },
          { text: "avatar products", highlight: true },
          { text: ", " },
          { text: "game studios", highlight: true },
          { text: ", " },
          { text: "and ", breakBefore: true },
          { text: "streamer chat automation", highlight: true },
        ],
        body: [
          "Built a highly customizable dialogue system for long, human-like conversations.",
          "The core of the product is an adaptive dialogue engine orchestrated through n8n and LLM APIs. It interprets user behavior, assembles the right instruction flow for each turn, and connects conversation state to media generation and delivery.",
          "The technology is the core of a proprietary product that successfully completed its first beta test.",
        ],
        metrics: [
          {
            title: "HANDLES 100+\nMESSAGES",
            description: "Keeps long\nconversations natural\nand engaging.",
          },
          {
            title: "ADAPTS TO CONTEXT &\nINTERACTION GOAL",
            description: "87.7% of replies used dynamic steering and goal control.",
          },
          {
            title: "STAYS COHERENT\nOVER TIME",
            description:
              "Memory and repetition\ncontrol keep long\nconversations consistent.",
          },
        ],
      },
      {
        slug: "case-02",
        index: "02 / B2B CONVERSATIONAL AUTOMATION",
        title: "Conversational Automation for SMBs",
        tags: [{ text: "B2B integration-ready", statusIndicator: true }],
        lead:
          "Conversational automation for handling first-line customer communication without rigid scripts or heavy per-client LLM tuning.",
        statement: [
          { text: "For businesses that need " },
          { text: "something smarter", highlight: true },
          { text: " than an " },
          { text: "online form", highlight: true },
          { text: " and teams overloaded " },
          { text: "with repetitive", highlight: true },
          { text: " " },
          { text: "customer questions", highlight: true },
        ],
        body: [
          "Built a B2B conversational system that understands customer requests in free form and handles most first-line support tasks. It answers common customer questions, collects the information needed for the next step, hands exceptional cases over to a human operator, or triggers the relevant application.",
          "One production deployment combined the WhatsApp Business API, Chatwoot, n8n, Google Calendar, a custom CRM layer, and a custom Node.js application orchestrating WhatsApp Flows with external business systems.",
        ],
        capabilities: [
          {
            title: "FREE-FORM CUSTOMER INPUT",
            description:
              "Understands customer requests in natural language and supports multiple languages when needed.",
          },
          {
            title: "REDUCES FIRST-LINE LOAD",
            description:
              "Handles routine customer questions, collects the required information, takes payments, or sends forms when needed.",
          },
          {
            title: "BUSINESS INTEGRATIONS",
            description:
              "Connects with the tools the business already uses: payment services, CRM systems, calendars, and messaging platforms.",
          },
        ],
      },
    ],
  },
  about: {
    eyebrow: "ABOUT / SCIENCE, BUSINESS, AND SYSTEMS",
    title: "A Career Built Around Systems",
    introLines: [
      "Physics taught me how to model what I could not observe. Public procurement taught me that decisions have a price.",
      "E-commerce taught me what starts breaking at scale. AI gave me a place to use all three.",
    ],
    chapterToggle: {
      expand: "Expand",
      collapse: "Collapse",
    },
    chapters: [
      {
        id: "physics",
        eyebrow: "2018-2020 / PHYSICS RESEARCH INSTITUTE",
        title: "The Rzhanov Institute in Siberia",
        summary: [
          { text: "Learned how to turn " },
          { text: "systems that cannot be observed directly", highlight: true },
          { text: " into ", breakAfter: true },
          { text: "computable models", highlight: true },
          { text: " and " },
          { text: "measurable signals", highlight: true },
        ],
        intro: [
          "I started my career during my third year at university, when I joined a theoretical physics laboratory. I had always been drawn to the fundamental side of science: abstractions and mathematical models.",
          "My first project involved studying a non-trivial quantum system: an exciton confined within a two-dimensional ring geometry. The task came down to solving the Schrödinger equation by reformulating it as a matrix problem and calculating the system’s allowed energy states.",
        ],
        callouts: [
          "In practice, the work consisted of turning an abstract quantum system into a computable model and extracting physically meaningful properties from it.",
          "The challenge was to understand what was happening inside the process from indirect measurements and identify the conditions that consistently produced high-quality material.",
        ],
        followup: [
          "In my second year at the institute, I moved to an experimental laboratory.",
          "There, I studied the growth conditions of mercury cadmium telluride, a semiconductor material used in high-sensitivity infrared detectors. Using optical measurement techniques, particularly ellipsometry, I monitored material growing inside a vacuum chamber.",
        ],
        authorComment: [
          "To be honest, I expected to become a theoretical physicist. But theoretical physics in Siberia turned out to be a fairly bleak place. My only colleague under fifty was a PhD student who said he punished himself by sleeping on the floor whenever his research went badly. =(",
          "So I defended my bachelor’s thesis in experimental laboratory and went off to make money.",
        ],
      },
      {
        id: "procurement",
        eyebrow: "2019-2021 / Public Procurement Entrepreneur",
        title: "Supplying the State",
        summary: [
          { text: "More than 100 completed contracts", highlight: true },
          { text: " " },
          { text: "Average contract value: $6,000", highlight: true },
        ],
        intro: [
          "During an academic break, I took a temporary job at a small company that worked with public tenders. My responsibilities were initially simple: find relevant procurement procedures and prepare applications.",
          "I learned the process quickly and realized that I could run the same business independently if I found the capital required to execute the contracts.",
          "The company’s founders were preparing to sell the business. We had a good relationship, so they explained in considerable detail how I could build the operation myself. Soon afterwards, I found financial partners and began executing my first contracts while preparing to defend my bachelor’s thesis.",
        ],
        callouts: [
          "On paper, this may sound fairly uneventful. In practice, it was an extremely concentrated business education: I learned quickly that decisions have a real price, and there was rarely time to get bored.",
        ],
        lifecycleLabel:
          "The main business was supplying home appliances. I managed the entire contract lifecycle myself:",
        lifecycleItems: [
          "1. Obtained accreditation on government procurement platforms, prepared documentation, and handled supplier compliance requirements.",
          "2. Identified tenders, estimated margins, selected suppliers, locked in pricing before bidding, and decided which opportunities were commercially worth pursuing.",
          "3. Prepared bid packages, participated in electronic auctions, won contracts, and managed the signing process.",
          "4. Purchased goods, organized logistics, resolved problems during delivery and acceptance, and maintained relationships with customers after completion.",
          "5. Advised other companies on supplier registration, bank guarantees, contract security, procurement software, and how to escape whatever tender-related catastrophe they had managed to create.",
        ],
        authorComment: [
          "By the end of 2021, the low barrier to entry had driven competition up, and maintaining margins meant taking on increasingly complex contracts. That kind of contract business was stressful and hard to scale, so I went to one of my financial partners, who ran a home-appliance e-commerce business, and proposed taking it over.",
        ],
      },
      {
        id: "ecommerce",
        eyebrow: "2021-2025 / LLC SIBVEZ - Head of E-commerce",
        title: "E-commerce in a Wartime Economy",
        summary: [
          { text: "$1.5M in annual revenue", highlight: true },
          { text: " " },
          { text: "Thousands of SKUs", highlight: true },
          { text: " " },
          { text: "Four years of end-to-end responsibility" },
        ],
        intro: [
          "I took over what had once been a nationwide home-appliance retail brand — eight years earlier, its billboards had appeared across roughly half of Russia’s regions. By 2022, what remained was a near-loss-making online store with an expensive but outdated website and database, fragmented operations, and no repeatable process for growing sales.",
          "The store carried just 600–800 products from a single dropshipping supplier, while its technical and operational setup had barely evolved since the retail-chain years.",
          "Eventually, I turned the store into a profitable business in five simple steps.",
        ],
        asideReveal: {
          buttonText: "*Wow.*",
          revealedText: ":0",
        },
        steps: [
          {
            title: "1. Rebuilt the operational foundation",
            paragraphs: [
              "Started with an outdated, inflexible back office and migrated the business database to a modern platform covering inventory, pricing, API integrations, and bulk product-content operations.",
            ],
          },
          {
            title: "2. Connected the internal systems",
            paragraphs: [
              "Implemented a CRM for order and status management and used it as an additional integration layer with ready-made commercial modules.",
              "Connected the company’s internal systems with major Russian marketplaces, external services, and later its own website.",
            ],
            note: "← Crisis-manager mode: on\nsince February 24.2022",
          },
          {
            title: "3. Launched the website and product-content pipeline",
            paragraphs: [
              "Built and launched an OpenCart store with payments, product bundles, promotions, and other commercial features, then connected it to the internal back office.",
              "Built a custom pipeline for collecting and processing product content, and supervised scraper development for protected sources — including, amusingly, official supplier portals.",
            ],
          },
          {
            title: "4. Expanded the assortment and supply model",
            paragraphs: [
              "Grew the catalogue to several thousand SKUs.",
              "Negotiated agreements with new suppliers, secured payment deferrals aligned with marketplace payout cycles, expanded the dropshipping model, and selected priority brands for direct purchasing.",
              "Some products were stored in our own warehouse, while others were placed in regional marketplace warehouses.",
            ],
          },
          {
            title: "5. Automated what started breaking under scale",
            paragraphs: [
              "Developed customer-support procedures, optimized logistics costs, tested new sales channels, and ran the business with a constant focus on reducing operational overhead through automation.",
              "That started with Excel-based inventory controls and evolved into",
              "- a custom n8n application for tracking returns and damaged goods, supporting their resale",
              "- managing warehouse workflows",
              "- feeding marketplace dashboards tied to my unit-economics model.",
            ],
            compact: true,
            drips: true,
          },
        ],
        authorComment: [
          "I owned assortment, pricing, promotion, logistics, product content, supplier relationships, business processes, and team operations.",
          "That also occasionally meant unloading truckloads of refrigerators when someone failed to show up for a shift or we needed to stay on schedule. *lol* =)",
          "That level of hands-on involvement made the underlying problem obvious: the business required too much manual work and lacked stable processes with clear control points. Wherever an off-the-shelf tool was sufficient, I implemented it. Where it was not, I redesigned the process or built the missing technical layer.",
          "Over four years, we took the company from a loss-making online store to a business generating approximately $1.5 million in annual revenue. By 2025, however, further investment in the project made very little commercial sense due to the deteriorating economic situation in the country. The brand owner and I decided to wind it down, and I moved into AI product development.",
        ],
      },
      {
        id: "ai",
        eyebrow: "2025- / Independent AI Engineer",
        title: "AI Product Engineer",
        tags: [
          "2 products in production",
          "Own startup ran a successful beta",
        ],
        intro: [
          "I entered AI product development with a strong background in business automation, system integrations, and process design. What I did not yet have was a solid understanding of how modern AI systems actually worked.",
          "So I started by studying the fundamentals of generative and language models, as well as the architectural principles behind AI system design. After completing several theoretical and practical courses, I began looking for projects where I could apply and develop these skills — and make money from them.",
        ],
        products: [
          {
            label: "Proprietary Conversational AI Product",
            paragraphs: [
              "My main project is a conversational AI product in which the dialogue system is directly connected to generative visual workflows.",
              "At its core is a dialogue engine built around LLM APIs and orchestrated through n8n. A separate interpretation layer evaluates user behavior and dynamically assembles the instructions used for the next response. Parts of this logic draw on ideas from hidden-state transitions and signal theory.",
              "Working with a marketer, I completed its first beta test. The purpose was not simply to see whether users would talk to the system, but to test whether it could maintain long sessions, adapt to user behavior, and remain coherent over time.\nDuring the first five days, 289 users created 359 sessions and generated 5,198 dialogue turns. A number of sessions went beyond 150 user messages, while the longest reached 317.\nSince the product depends on sustained attention and engagement, these long conversations were an important signal: users were not just trying the system, but staying inside the dialogue for extended periods.",
              "In this project, I work as a full-stack engineer who understands who the product is for and how it is sold. Around the dialogue engine, I built the commercial layer for payments and other revenue events, as well as the media pipeline — from LoRA training to large-scale content generation. I also contribute to product and strategic decisions.",
              "The dialogue technology is the core of the product and the part I can adapt for other businesses where conversation directly affects engagement or revenue.",
            ],
          },
          {
            label: "AI first-line support line for SMBs",
            paragraphs: [
              "Developed a conversational automation system designed for quick integration into small businesses without lengthy client-specific LLM tuning. A customer can describe a request in free form. The system interprets it, evaluates it through a scoring layer, and selects the next step with the least required user effort.",
              "That may involve sending a predefined information block, collecting the details needed for a business process, transferring the conversation to a human operator, or triggering the application responsible for the next action.",
              "In one production deployment, I integrated the system with WhatsApp Business API, Chatwoot, and a custom Node.js booking application that connected WhatsApp Flows, an external business system, and an n8n pipeline.",
            ],
          },
        ],
      },
    ],
    best: {
      title: "What I Do Best",
      tags: [
        { text: "End-to-end product development", statusIndicator: true },
        {
          text: "Adapting my technology to your business processes",
          statusIndicator: true,
        },
      ],
      paragraphs: [
        "A product that’s still part idea, part technical mess — that’s where I start.",
        "I can join the team, take it from idea to launch, and stay involved once real users start using it.",
        "Anyway, tell me what the product needs to achieve. We’ll work backwards from there.",
      ],
    },
  },
  contact: {
    eyebrow: "GET IN TOUCH / PRODUCTS, SYSTEMS, AND INTEGRATION",
    cta: "LET'S BUILD SOMETHING DIFFICULT",
    channelLabels: {
      email: "E-mail",
      telegram: "Telegram",
      linkedin: "LinkedIn",
      github: "Github",
    },
  },
}
