import { Fragment, useEffect, useRef, useState, type MouseEvent, type ReactNode } from "react"
import { useLocale, useSiteContent } from "../content"
import { EcommerceNarrative } from "./AboutSection"
import sibvezLogo from "../sibvez.svg"
import redCore from "../favicon-red-core.svg"
import midnightMoon from "../moon.svg"
import midnightWordmark from "../midnight-persona.svg"
import midnightArchitecture from "../midnight-persona-system-architecture-polished.svg"
import type {
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

function MidnightNoticeTrigger({ text }: { text: string }) {
  const { work } = useSiteContent()
  const notice = work.notice
  const [isOpen, setIsOpen] = useState(false)
  const [isClosing, setIsClosing] = useState(false)
  const hoverTimerRef = useRef<number | null>(null)
  const closeTimerRef = useRef<number | null>(null)
  const pointerInsideRef = useRef(false)
  const suppressHoverRef = useRef(false)

  const sentenceEnd = text.indexOf(". ")
  const firstLine = sentenceEnd >= 0 ? text.slice(0, sentenceEnd + 1) : text
  const secondLine = sentenceEnd >= 0 ? text.slice(sentenceEnd + 2) : ""

  const clearHoverTimer = () => {
    if (hoverTimerRef.current === null) return
    window.clearTimeout(hoverTimerRef.current)
    hoverTimerRef.current = null
  }

  const clearCloseTimer = () => {
    if (closeTimerRef.current === null) return
    window.clearTimeout(closeTimerRef.current)
    closeTimerRef.current = null
  }

  const openNotice = () => {
    clearHoverTimer()
    clearCloseTimer()
    setIsClosing(false)
    setIsOpen(true)
    suppressHoverRef.current = false
  }

  const closeNotice = () => {
    if (!isOpen || isClosing) return
    clearHoverTimer()
    suppressHoverRef.current = pointerInsideRef.current
    setIsClosing(true)
    closeTimerRef.current = window.setTimeout(() => {
      closeTimerRef.current = null
      setIsOpen(false)
      setIsClosing(false)
    }, 150)
  }

  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeNotice()
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  })

  useEffect(() => {
    return () => {
      clearHoverTimer()
      clearCloseTimer()
    }
  }, [])

  const handleMouseEnter = () => {
    pointerInsideRef.current = true
    if (isOpen || suppressHoverRef.current) return
    clearHoverTimer()
    hoverTimerRef.current = window.setTimeout(() => {
      hoverTimerRef.current = null
      setIsOpen(true)
    }, 400)
  }

  const handleMouseLeave = () => {
    pointerInsideRef.current = false
    suppressHoverRef.current = false
    clearHoverTimer()
  }

  return (
    <Fragment>
      <p>
        <button
          type="button"
          className="work-midnight-notice-trigger"
          aria-haspopup="dialog"
          aria-expanded={isOpen}
          onClick={openNotice}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {renderInlineMarkdown(firstLine)}
          {secondLine ? (
            <>
              <br />
              {renderInlineMarkdown(secondLine)}
            </>
          ) : null}
          <sup className="work-midnight-notice-trigger__star" aria-hidden="true">
            *
          </sup>
        </button>
      </p>
      {isOpen ? (
        <aside
          className="midnight-notice"
          data-closing={isClosing ? "true" : "false"}
          role="dialog"
          aria-labelledby="midnight-notice-title"
        >
          <div className="midnight-notice__header">
            <div id="midnight-notice-title" className="midnight-notice__title">
              {notice.title}
            </div>
            <button
              type="button"
              className="midnight-notice__close"
              onClick={closeNotice}
              aria-label={notice.close}
            >
              ×
            </button>
          </div>
          <div className="midnight-notice__body">
            {notice.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
          <div className="midnight-notice__footer">
            <button type="button" className="hero-cta midnight-notice__okay" onClick={closeNotice}>
              <span className="hero-cta__bracket hero-cta__bracket--left" aria-hidden="true">
                [
              </span>
              <span className="hero-cta__label">{notice.okay}</span>
              <span className="hero-cta__bracket hero-cta__bracket--right" aria-hidden="true">
                ]
              </span>
            </button>
          </div>
        </aside>
      ) : null}
    </Fragment>
  )
}

function MidnightBlocks({
  chapterId,
  blocks,
  startIndex = 0,
  endIndex = blocks.length,
}: {
  chapterId: MidnightChapter["id"]
  blocks: MidnightBlock[]
  startIndex?: number
  endIndex?: number
}) {
  return blocks.slice(startIndex, endIndex).map((block, offset) => {
    const index = startIndex + offset
    const key = `${block.kind}-${index}`
    const accentClass = getArtDirectionAccentClass(chapterId, blocks, index)
    const fullContrast = accentClass || (index === 0 && chapterId === "dialogue")
    const paragraphClass = [
      accentClass,
      fullContrast && "work-midnight-prose--full-contrast",
    ].filter(Boolean).join(" ")

    if (block.kind === "media-reference") {
      return chapterId === "engineering" && block.asset === "midnight-persona-system-architecture-polished.svg"
        ? <img key={key} className="work-midnight-architecture" src={midnightArchitecture}
            alt="Midnight Persona — System Architecture" loading="lazy" />
        : null
    }
    if (block.kind === "subheading") {
      return <h3 key={key} className="work-document__subheading">{block.text}</h3>
    }
    if (block.kind === "emphasis") {
      return (
        <p key={key} className={`work-document__emphasis ${paragraphClass}`.trim()}>
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

    if (chapterId === "product" && index === 0) {
      return <MidnightNoticeTrigger key={key} text={block.text} />
    }

    return (
      <p key={key} className={paragraphClass || undefined}>
        {renderInlineMarkdown(block.text)}
      </p>
    )
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
              <span className="work-index-row__arrow" aria-hidden="true">↗</span>
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

const MIDNIGHT_PREVIEW_LENGTH: Record<MidnightChapter["id"], number> = {
  product: 3,
  dialogue: 3,
  engineering: 3,
  "generative-media": 2,
  "art-direction": 3,
}

function MidnightDisclosure({ chapter }: { chapter: MidnightChapter }) {
  const [open, setOpen] = useState(false)
  const section = useRef<HTMLElement>(null)
  const panel = useRef<HTMLDivElement>(null)
  const { about } = useSiteContent()
  const isProduct = chapter.id === "product"
  const previewLength = MIDNIGHT_PREVIEW_LENGTH[chapter.id]
  const panelId = `midnight-panel-${chapter.id}`

  const toggle = () => {
    if (open && panel.current && panel.current.getBoundingClientRect().top < 0) {
      section.current?.scrollIntoView({ block: "start", behavior: "instant" })
    }
    setOpen(!open)
  }

  return (
    <section
      ref={section}
      data-open={open}
      id={isProduct ? undefined : chapter.id}
      className={`work-document__chapter work-midnight-disclosure${isProduct ? " work-document__chapter--product-copy" : ""}`}
    >
      <div className="work-document__chapter-label work-mono">
        {isProduct ? "01 / PRODUCT OVERVIEW" : chapter.label}
      </div>
      {!isProduct && (
        <>
          <h2 className="work-document__chapter-title">{chapter.title}</h2>
          {chapter.subtitle && <p className="work-document__chapter-subtitle">{chapter.subtitle}</p>}
        </>
      )}
      <MidnightBlocks chapterId={chapter.id} blocks={chapter.blocks} endIndex={previewLength} />
      {chapter.id === "generative-media" && (
        <div className="work-midnight-disclosure__teaser" aria-hidden={open}>
          <div><span>cool story</span></div>
        </div>
      )}
      <div ref={panel} id={panelId} className="work-midnight-disclosure__panel"
        data-open={open} inert={!open}>
        <div className="work-midnight-disclosure__copy">
          <MidnightBlocks chapterId={chapter.id} blocks={chapter.blocks}
            startIndex={previewLength} />
        </div>
      </div>
      <button type="button" className="work-midnight-disclosure__toggle"
        aria-expanded={open} aria-controls={panelId}
        aria-label={`${open ? about.chapterToggle.collapse : about.chapterToggle.expand} ${chapter.label}`}
        onClick={toggle}>
        <svg className="work-midnight-disclosure__arrow" viewBox="-36 -36 72 72" aria-hidden="true">
          <path d="M -9 -14.4 L 9 0 L -9 14.4" vectorEffect="non-scaling-stroke" />
        </svg>
      </button>
    </section>
  )
}

function MidnightBody({ chapters }: { chapters: MidnightChapter[] }) {
  return (
    <div className="work-document__chapters">
      {chapters.map((chapter) => <MidnightDisclosure key={chapter.id} chapter={chapter} />)}
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
  const ecommerceProject = work.index.find((project) => project.id === "ecommerce")
  const midnightProject = work.index.find((project) => project.id === "midnight-persona")
  const isMidnight = view.kind === "case" && view.id === "midnight-persona"
  const isEcommerce = view.kind === "case" && view.id === "ecommerce"
  const caseData = view.kind === "client-case" ? leadflow : midnight
  const title = isMidnight
    ? productChapter?.title ?? "Midnight Persona"
    : isEcommerce
      ? ecommerceProject!.title
      : "LeadFlowAI"
  const eyebrow = isMidnight
    ? "2025–2026 / PRODUCT, ENGINEERING, ART DIRECTION"
    : isEcommerce
      ? "2021–2025 / HEAD OF E-COMMERCE"
      : leadflow.index
  const subtitle = isMidnight
    ? ""
    : isEcommerce
      ? ""
      : caseData.lead

  return (
    <article className={`work-shell work-document${isEcommerce ? " work-document--ecommerce" : ""}${isMidnight ? " work-document--midnight" : ""}`}>
      <header
        id={isMidnight ? "product" : undefined}
        className="work-shell__header work-document__header"
      >
        <div className="work-shell__eyebrow work-mono">{eyebrow}</div>
        <h1 id="work-document-title" className="work-shell__title" tabIndex={-1}>
          {isMidnight ? (
            <span className="work-midnight-logo">
              <img src={midnightMoon} alt="" />
              <img src={midnightWordmark} alt={title} />
            </span>
          ) : title}
        </h1>
        {subtitle ? <p className="work-document__subtitle">{subtitle}</p> : null}
        {isEcommerce && (
          <div className="work-ecommerce-brand">
            <img src={sibvezLogo} alt="" width={48} height={48} />
            <span>СИБВЕЗ</span>
          </div>
        )}
      </header>

      {!isMidnight && !isEcommerce && (
        <div className="work-document__first-screen">
          <InlineStatement parts={leadflow.statement} />
        </div>
      )}

      {isMidnight ? (
        <>
          <div className="work-midnight-results">
            <dl className="work-ecommerce-metrics">
              {midnightProject && [
                ...midnightProject.metrics.slice(0, 1),
                { value: "20K+", label: locale === "ru" ? "Сообщения пользователей" : "User messages" },
                ...midnightProject.metrics.slice(1),
              ].map(({ label, value }) => (
                <div key={label}>
                  <dt>{label}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
            {midnightProject?.status && (
              <div className="work-midnight-status">
                <span>
                  <span className="work-tag__lamp" aria-hidden="true" />
                  {midnightProject.status.value}
                </span>
                <span>{midnightProject.status.label}</span>
              </div>
            )}
          </div>
          <MidnightBody chapters={midnightContent} />
        </>
      ) : isEcommerce ? (
        ecommerce && (
          <div className="work-ecommerce-narrative">
            <div className="work-midnight-results work-ecommerce-results">
              <dl className="work-ecommerce-metrics">
                {ecommerceProject?.metrics.map(({ label, value }) => (
                  <div key={label}>
                    <dt>{label}</dt>
                    <dd>{value}</dd>
                  </div>
                ))}
              </dl>
              <div className="work-midnight-status">
                <span>
                  <img className="work-ecommerce-status-icon" src={redCore} alt="" />
                  {locale === "ru" ? "ЗАКРЫТ" : "DISCONTINUED"}
                </span>
                <span>{locale === "ru" ? "ТЕКУЩИЙ ЭТАП" : "CURRENT PHASE"}</span>
              </div>
            </div>
            <EcommerceNarrative chapter={ecommerce} intro={ecommerceProject?.caseIntro} />
          </div>
        )
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
