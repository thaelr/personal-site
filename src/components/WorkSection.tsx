import { useSiteContent } from "../content"
import { WORK_CASE_LINKS } from "../content/structure"
import type {
  CapabilityContent,
  MetricContent,
  WorkCaseContent,
  WorkTagContent,
} from "../content/types"
import workChart from "../work-chart.png"

type CaseLink = {
  label: string
  href: string
  wide?: boolean
}

function InlineHighlight({ text }: { text: string }) {
  return <span className="work-inline-highlight">{text}</span>
}

function WorkTag({ text, statusIndicator = false }: WorkTagContent) {
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
          href={link.href}
          className={`work-link ${link.wide ? "work-link--wide" : "work-link--narrow"}`}
          target="_blank"
          rel="noreferrer"
        >
          <span aria-hidden="true">[</span>
          <span>{link.label}</span>
          <span aria-hidden="true">]</span>
        </a>
      ))}
    </div>
  )
}

function MetricGrid({ metrics }: { metrics: MetricContent[] }) {
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

function CapabilityList({ items }: { items: CapabilityContent[] }) {
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

function WorkCase({ caseData }: { caseData: WorkCaseContent }) {
  const { work } = useSiteContent()
  const caseLinks: CaseLink[] = [
    {
      label: work.linkLabels.presentation,
      href: WORK_CASE_LINKS[caseData.slug].presentation,
      wide: true,
    },
    {
      label: work.linkLabels.github,
      href: WORK_CASE_LINKS[caseData.slug].github,
    },
  ]

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
          <>
            <div className="work-case__visual">
              <div className="work-case__chart">
                <img
                  src={workChart}
                  alt={work.chartAlt}
                  className="work-case__chart-image"
                />
              </div>
              <MetricGrid metrics={caseData.metrics} />
            </div>
            <CaseLinks links={caseLinks} />
          </>
        ) : null}

        {caseData.capabilities ? (
          <>
            <CapabilityList items={caseData.capabilities} />
            <CaseLinks links={caseLinks} />
          </>
        ) : null}
      </div>
    </article>
  )
}

export default function WorkSection() {
  const { work } = useSiteContent()

  return (
    <section id="work" className="work-section">
      <div className="work-section__inner">
        <div className="work-section__grid">
          <div className="work-section__eyebrow work-mono">{work.eyebrow}</div>
          <h2 className="work-section__title">{work.title}</h2>
          <p className="work-section__intro">{work.intro}</p>
          {work.cases.map((caseData) => (
            <WorkCase key={caseData.slug} caseData={caseData} />
          ))}
        </div>
      </div>
    </section>
  )
}
