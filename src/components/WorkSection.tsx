import { useEffect, type MouseEvent, type ReactNode } from "react"
import { useLocale, useSiteContent } from "../content"
import type {
  AboutChapterContent,
  InlinePart,
  WorkTagContent,
} from "../content/types"
import {
  MIDNIGHT_CONTENT,
  type MidnightBlock,
  type MidnightChapter,
} from "../content/midnight"
import { getWorkChapters, type WorkView } from "../work"

type WorkSectionProps = {
  view: WorkView
  getViewHref: (view: WorkView) => string
  onOpenView: (
    event: MouseEvent<HTMLAnchorElement>,
    view: WorkView,
    originId: string,
  ) => void
  onActiveChapterChange: (chapterId: string | null) => void
}

type WorkPreviewProps = {
  id: string
  index: string
  title: string
  description?: string
  tags?: WorkTagContent[]
  evidence?: string[]
  href: string
  onOpen: (event: MouseEvent<HTMLAnchorElement>) => void
}

function WorkTag({ text, statusIndicator = false }: WorkTagContent) {
  return (
    <span className={`work-tag ${statusIndicator ? "work-tag--status" : ""}`}>
      {statusIndicator ? <span className="work-tag__lamp" aria-hidden="true" /> : null}
      <span className="work-tag__text">{text}</span>
    </span>
  )
}

function InlineStatement({ parts }: { parts: InlinePart[] }) {
  return (
    <p className="work-document__statement">
      {parts.map((part, index) => (
        <span key={`${part.text}-${index}`}>
          {part.breakBefore ? <br /> : null}
          {part.highlight ? (
            <span className="work-inline-highlight">{part.text}</span>
          ) : (
            part.text
          )}
          {part.breakAfter ? <br /> : null}
        </span>
      ))}
    </p>
  )
}

function renderInlineMarkdown(text: string): ReactNode[] {
  return text
    .split(/(\*\*[^*]+\*\*|\[[^\]]+\]\(https?:\/\/[^)]+\))/g)
    .filter(Boolean)
    .map((part, index) => {
      const bold = part.match(/^\*\*(.+)\*\*$/)
      if (bold) return <strong key={`${part}-${index}`}>{bold[1]}</strong>

      const link = part.match(/^\[([^\]]+)\]\((https?:\/\/[^)]+)\)$/)
      if (link) {
        return (
          <a key={`${part}-${index}`} href={link[2]} target="_blank" rel="noreferrer">
            {link[1]}
          </a>
        )
      }

      return part
    })
}

function getArtDirectionAccentClass(
  chapterId: MidnightChapter["id"],
  blocks: MidnightBlock[],
  index: number,
): string | undefined {
  if (chapterId !== "art-direction") return undefined

  const subheadingIndex = blocks.findIndex((block) => block.kind === "subheading")
  if (index === 2) return "work-document__art-accent work-document__art-accent--audience"
  if (index === subheadingIndex + 3) {
    return "work-document__art-accent work-document__art-accent--recognition"
  }
  if (index === blocks.length - 1) {
    return "work-document__art-accent work-document__art-accent--final"
  }

  return undefined
}

function MidnightBlocks({
  chapterId,
  blocks,
}: {
  chapterId: MidnightChapter["id"]
  blocks: MidnightBlock[]
}) {
  return blocks.map((block, index) => {
    const key = `${block.kind}-${index}`
    const accentClass = getArtDirectionAccentClass(chapterId, blocks, index)

    if (block.kind === "media-reference") return null
    if (block.kind === "subheading") {
      return <h3 key={key} className="work-document__subheading">{block.text}</h3>
    }
    if (block.kind === "emphasis") {
      return (
        <p key={key} className={`work-document__emphasis ${accentClass ?? ""}`.trim()}>
          <strong>{block.text}</strong>
        </p>
      )
    }
    if (block.kind === "link") {
      return (
        <p key={key} className="work-document__source">
          <a href={block.href} target="_blank" rel="noreferrer">{block.text}</a>
        </p>
      )
    }

    return <p key={key} className={accentClass}>{renderInlineMarkdown(block.text)}</p>
  })
}

function WorkPreview({
  id,
  index,
  title,
  description,
  tags,
  evidence,
  href,
  onOpen,
}: WorkPreviewProps) {
  return (
    <article className="work-preview">
      <div className="work-preview__main">
        <div className="work-preview__index work-mono">{index}</div>
        <a
          id={id}
          href={href}
          className="work-preview__open"
          onClick={onOpen}
        >
          <span className="work-preview__title">{title}</span>
          {description ? <span className="work-preview__description">{description}</span> : null}
        </a>
        {tags?.length ? (
          <div className="work-preview__tags">
            {tags.map((tag) => (
              <WorkTag key={tag.text} {...tag} />
            ))}
          </div>
        ) : null}
      </div>

      {evidence?.length ? (
        <div className="work-preview__evidence">
          {evidence?.length ? (
            <ul className="work-preview__evidence-list">
              {evidence.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}
    </article>
  )
}

function WorkOverview({
  getViewHref,
  onOpenView,
}: Pick<WorkSectionProps, "getViewHref" | "onOpenView">) {
  const { work } = useSiteContent()

  return (
    <div className="work-section__grid">
      <h2 className="work-section__title">{work.title}</h2>
      <div className="work-overview__entries">
        {work.index.map((project) => {
          const view: WorkView = project.id === "client-work"
            ? { kind: "client-index" }
            : { kind: "case", id: project.id }
          const id = `work-preview-${project.id}`

          return (
            <a key={id} id={id} className="work-index-row" href={getViewHref(view)}
              onClick={(event) => onOpenView(event, view, id)}>
              <div className="work-index-row__main">
                <div className="work-index-row__index">{project.index}</div>
                <h3 className="work-index-row__title">{project.title}</h3>
                <p className="work-index-row__description">{project.description}</p>
              </div>
              {(project.metrics.length > 0 || project.status) && (
                <div className="work-index-row__aside">
                  <dl className="work-index-row__metrics">
                    {project.metrics.map(({ value, label }) => (
                      <div key={label}>
                        <dt>{label}</dt>
                        <dd>{value}</dd>
                      </div>
                    ))}
                  </dl>
                  {project.status && (
                    <span className="work-index-row__status">
                      <span className="work-index-row__status-label">{project.status.label}</span>
                      <span className="work-index-row__status-value">
                        <span className="work-tag__lamp" aria-hidden="true" />
                        <span>{project.status.value}</span>
                      </span>
                    </span>
                  )}
                </div>
              )}
            </a>
          )
        })}
      </div>
    </div>
  )
}

function ClientIndex({
  getViewHref,
  onOpenView,
}: Pick<WorkSectionProps, "getViewHref" | "onOpenView">) {
  const { work } = useSiteContent()
  const leadflow = work.cases[1]
  const leadflowView: WorkView = { kind: "client-case", id: "leadflowai" }

  return (
    <div className="work-shell work-client-index">
      <header className="work-shell__header">
        <div className="work-shell__eyebrow work-mono">03 / COLLECTION</div>
        <h1 id="work-document-title" className="work-shell__title" tabIndex={-1}>
          Client Work
        </h1>
      </header>
      <div className="work-overview__entries">
        <WorkPreview
          id="work-preview-leadflowai"
          index={leadflow.index}
          title="LeadFlowAI"
          description={leadflow.lead}
          tags={leadflow.tags}
          evidence={leadflow.capabilities?.map((item) => item.title)}
          href={getViewHref(leadflowView)}
          onOpen={(event) => onOpenView(event, leadflowView, "work-preview-leadflowai")}
        />
      </div>
    </div>
  )
}

function MidnightBody({ chapters }: { chapters: MidnightChapter[] }) {
  const product = chapters[0]

  return (
    <div className="work-document__chapters">
      {product ? (
        <section className="work-document__chapter work-document__chapter--product-copy">
          <MidnightBlocks chapterId={product.id} blocks={product.blocks} />
        </section>
      ) : null}
      {chapters.slice(1).map((chapter) => (
        <section id={chapter.id} key={chapter.id} className="work-document__chapter">
          <div className="work-document__chapter-label work-mono">{chapter.label}</div>
          <h2 className="work-document__chapter-title">{chapter.title}</h2>
          <p className="work-document__chapter-subtitle">{chapter.subtitle}</p>
          <MidnightBlocks chapterId={chapter.id} blocks={chapter.blocks} />
        </section>
      ))}
    </div>
  )
}

function EcommerceBody({ chapter }: { chapter?: AboutChapterContent }) {
  if (!chapter) return null

  return (
    <div className="work-document__body">
      {chapter.intro?.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
      {chapter.callouts?.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
      {chapter.steps?.map((step) => (
        <section key={step.title} className="work-document__content-section">
          <h2>{step.title}</h2>
          {step.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
        </section>
      ))}
      {chapter.followup?.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
    </div>
  )
}

function CaseDocument({ view }: { view: Exclude<WorkView, { kind: "overview" } | { kind: "client-index" }> }) {
  const locale = useLocale()
  const { work, about } = useSiteContent()
  const midnight = work.cases[0]
  const leadflow = work.cases[1]
  const midnightContent = MIDNIGHT_CONTENT[locale]
  const productChapter = midnightContent[0]
  const ecommerce = about.chapters.find((chapter) => chapter.id === "ecommerce")
  const isMidnight = view.kind === "case" && view.id === "midnight-persona"
  const isEcommerce = view.kind === "case" && view.id === "ecommerce"
  const caseData = view.kind === "client-case" ? leadflow : midnight
  const title = isMidnight
    ? productChapter?.title ?? "Midnight Persona"
    : isEcommerce
      ? "E-commerce in a Wartime Economy"
      : "LeadFlowAI"
  const eyebrow = isMidnight
    ? productChapter?.label ?? "01 / PRODUCT"
    : isEcommerce
      ? "02 / CASE"
      : leadflow.index
  const subtitle = isMidnight
    ? productChapter?.subtitle ?? ""
    : isEcommerce
      ? ecommerce?.intro?.[0] ?? ""
      : caseData.lead

  return (
    <article className="work-shell work-document">
      <header
        id={isMidnight ? "product" : undefined}
        className="work-shell__header work-document__header"
      >
        <div className="work-shell__eyebrow work-mono">{eyebrow}</div>
        <h1 id="work-document-title" className="work-shell__title" tabIndex={-1}>
          {title}
        </h1>
        {subtitle ? <p className="work-document__subtitle">{subtitle}</p> : null}
      </header>

      {isMidnight ? null : isEcommerce ? (
        ecommerce?.summary?.length ? <InlineStatement parts={ecommerce.summary} /> : null
      ) : (
        <div className="work-document__first-screen">
          <InlineStatement parts={leadflow.statement} />
        </div>
      )}

      {isMidnight ? (
        <MidnightBody chapters={midnightContent} />
      ) : isEcommerce ? (
        <EcommerceBody chapter={ecommerce} />
      ) : (
        <div className="work-document__body">
          {leadflow.body.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          {leadflow.capabilities?.map((item) => (
            <section key={item.title} className="work-document__content-section">
              <h2>{item.title}</h2>
              <p>{item.description}</p>
            </section>
          ))}
        </div>
      )}
    </article>
  )
}

export default function WorkSection({
  view,
  getViewHref,
  onOpenView,
  onActiveChapterChange,
}: WorkSectionProps) {
  const chapters = getWorkChapters(view)
  const readingMode = view.kind !== "overview"

  useEffect(() => {
    if (!chapters.length) {
      onActiveChapterChange(null)
      return
    }

    let frameId = 0

    const updateActiveChapter = () => {
      const atDocumentEnd =
        window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2
      if (atDocumentEnd) {
        onActiveChapterChange(chapters.at(-1)?.id ?? chapters[0].id)
        return
      }

      const controlLine = Math.max(96, window.innerHeight * 0.2)
      const active = chapters.reduce((current, chapter) => {
        const element = document.getElementById(chapter.id)
        return element && element.getBoundingClientRect().top <= controlLine
          ? chapter.id
          : current
      }, chapters[0].id)

      onActiveChapterChange(active)
    }

    const scheduleUpdate = () => {
      if (frameId) return
      frameId = window.requestAnimationFrame(() => {
        frameId = 0
        updateActiveChapter()
      })
    }

    updateActiveChapter()
    window.addEventListener("scroll", scheduleUpdate, { passive: true })
    window.addEventListener("resize", scheduleUpdate)

    return () => {
      if (frameId) window.cancelAnimationFrame(frameId)
      window.removeEventListener("scroll", scheduleUpdate)
      window.removeEventListener("resize", scheduleUpdate)
    }
  }, [chapters, onActiveChapterChange])

  return (
    <section
      id="work"
      className={`work-section ${readingMode ? "work-section--reading" : "work-section--overview"}`}
    >
      <div className="work-section__inner">
        {view.kind === "overview" ? (
          <WorkOverview getViewHref={getViewHref} onOpenView={onOpenView} />
        ) : view.kind === "client-index" ? (
          <ClientIndex getViewHref={getViewHref} onOpenView={onOpenView} />
        ) : (
          <CaseDocument view={view} />
        )}
      </div>
    </section>
  )
}
