import workChart from "../work-chart.png"

type HighlightPart = {
  text: string
  highlight?: boolean
  breakBefore?: boolean
}

type MetricItem = {
  title: string
  description: string
}

type CapabilityItem = {
  title: string
  description: string
}

type WorkTagData = {
  text: string
  statusIndicator?: boolean
}

type CaseLink = {
  label: string
  wide?: boolean
}

type WorkCaseData = {
  slug: "case-01" | "case-02"
  index: string
  title: string
  tags: WorkTagData[]
  lead: string
  statement: HighlightPart[]
  body: string[]
  links: CaseLink[]
  metrics?: MetricItem[]
  capabilities?: CapabilityItem[]
}

const WORK_CASES: WorkCaseData[] = [
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
    links: [
      { label: "PDF PRESENTATION", wide: true },
      { label: "GITHUB" },
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
    links: [
      { label: "PDF PRESENTATION", wide: true },
      { label: "GITHUB" },
    ],
  },
]

function InlineHighlight({ text }: { text: string }) {
  return <span className="work-inline-highlight">{text}</span>
}

function WorkTag({ text, statusIndicator = false }: WorkTagData) {
  return (
    <span className={`work-tag ${statusIndicator ? "work-tag--status" : ""}`}>
      {statusIndicator ? <span className="work-tag__lamp" aria-hidden="true" /> : null}
      <span className="work-tag__text">{text}</span>
    </span>
  )
}

function CaseLinks({ links }: { links: CaseLink[] }) {
  return (
    <div className="work-case__links">
      {links.map((link) => (
        <a
          key={link.label}
          href="#"
          onClick={(event) => event.preventDefault()}
          className={`work-link ${link.wide ? "work-link--wide" : "work-link--narrow"}`}
        >
          <span aria-hidden="true">[</span>
          <span>{link.label}</span>
          <span aria-hidden="true">]</span>
        </a>
      ))}
    </div>
  )
}

function MetricGrid({ metrics }: { metrics: MetricItem[] }) {
  return (
    <div className="work-case__metrics">
      {metrics.map((metric) => (
        <div key={metric.title} className="work-metric">
          <h3 className="work-metric__title">
            {metric.title.split("\n").map((line) => (
              <span key={line} className="work-metric__line">
                {line}
              </span>
            ))}
          </h3>
          <p className="work-metric__description">
            {metric.description.split("\n").map((line) => (
              <span key={line} className="work-metric__line">
                {line}
              </span>
            ))}
          </p>
        </div>
      ))}
    </div>
  )
}

function CapabilityList({ items }: { items: CapabilityItem[] }) {
  return (
    <div className="work-case__capabilities">
      {items.map((item) => (
        <div key={item.title} className="work-capability">
          <h3 className="work-capability__title">{item.title}</h3>
          <p className="work-capability__description">{item.description}</p>
        </div>
      ))}
    </div>
  )
}

function WorkHeader() {
  return (
    <>
      <div className="work-section__eyebrow work-mono">
        SELECTED WORK / TWO SYSTEMS BUILT END TO END
      </div>
      <h2 className="work-section__title">Selected Work</h2>
      <p className="work-section__intro">
        Two products built to turn natural conversation into reliable product
        behavior and business operations.
      </p>
    </>
  )
}

function WorkCase({ caseData }: { caseData: WorkCaseData }) {
  return (
    <article className={`work-case work-case--${caseData.slug}`}>
      <div className="work-case__main">
        <div className="work-case__index work-mono">{caseData.index}</div>
        <h3 className="work-case__title">{caseData.title}</h3>
        <div className="work-case__tags">
          {caseData.tags.map((tag) => (
            <WorkTag key={tag.text} {...tag} />
          ))}
        </div>
        <p className="work-case__lead">{caseData.lead}</p>
        <p className="work-case__statement work-mono">
          {caseData.statement.map((part, idx) => (
            <span key={`${part.text}-${idx}`}>
              {part.breakBefore ? <br /> : null}
              {part.highlight ? (
                <InlineHighlight text={part.text} />
              ) : (
                <span>{part.text}</span>
              )}
            </span>
          ))}
        </p>
        <div className="work-case__body">
          {caseData.body.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </div>

      <div className="work-case__side">
        {caseData.metrics ? (
          <div className="work-case__visual">
            <div className="work-case__chart">
              <img
                src={workChart}
                alt="Distribution of dialogue engine beta-test conversation lengths"
                className="work-case__chart-image"
              />
            </div>
            <MetricGrid metrics={caseData.metrics} />
            <CaseLinks links={caseData.links} />
          </div>
        ) : null}

        {caseData.capabilities ? (
          <>
            <CapabilityList items={caseData.capabilities} />
            <CaseLinks links={caseData.links} />
          </>
        ) : null}
      </div>
    </article>
  )
}

export default function WorkSection() {
  return (
    <section id="work" className="work-section">
      <div className="work-section__inner">
        <div className="work-section__grid">
          <WorkHeader />
          {WORK_CASES.map((caseData) => (
            <WorkCase key={caseData.slug} caseData={caseData} />
          ))}
        </div>
      </div>
    </section>
  )
}
