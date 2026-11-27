import { sibvezCaseRu } from "../content/sibvez.ru"
import { LEADFLOW_SOURCE } from "../content/leadflow"
import { Fragment, useEffect, useRef, useState, type CSSProperties, type MouseEvent, type ReactNode } from "react"
import { createPortal } from "react-dom"
import { useLocale, useSiteContent } from "../content"
import { MidnightSlowScan } from "./MidnightSlowScan"
import { MidnightOrbit } from "./MidnightOrbit"
import { MidnightFilmstrip } from "./filmstrip/MidnightFilmstrip"
import { EcommerceNarrative } from "./AboutSection"
import sibvezLogo from "../sibvez.svg"
import redCore from "../favicon-red-core.svg"
import midnightMoon from "../moon.svg"
import midnightWordmark from "../midnight-persona.svg"
import midnightArchitecture from "../midnight-persona-system-architecture-polished.svg"
import type {
  InlinePart,
} from "../content/types"
import {
  MIDNIGHT_CONTENT,
  MIDNIGHT_INTERACTIONS,
  type MidnightAccent,
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

function getAccentClassName(accent?: MidnightAccent): string | undefined {
  if (!accent) return undefined
  if (accent === "full") return "work-midnight-prose--full-contrast"

  return `work-document__art-accent work-document__art-accent--${accent} work-midnight-prose--full-contrast`
}

function MidnightNoticeTrigger({ text }: { text: string }) {
  const { work } = useSiteContent()
  const notice = work.notice
  const [isOpen, setIsOpen] = useState(false)
  const [hasOpened, setHasOpened] = useState(false)
  const [isClosing, setIsClosing] = useState(false)
  const closeTimerRef = useRef<number | null>(null)
  const noticeRef = useRef<HTMLElement>(null)
  const [isMobileLayout, setIsMobileLayout] = useState(false)
  const [noticeTop, setNoticeTop] = useState(0)

  const sentenceEnd = text.indexOf(". ")
  const firstLine = sentenceEnd >= 0 ? text.slice(0, sentenceEnd + 1) : text
  const secondLine = sentenceEnd >= 0 ? text.slice(sentenceEnd + 2) : ""

  const clearCloseTimer = () => {
    if (closeTimerRef.current === null) return
    window.clearTimeout(closeTimerRef.current)
    closeTimerRef.current = null
  }

  const openNotice = (event: MouseEvent<HTMLButtonElement>) => {
    if (hasOpened) return
    clearCloseTimer()
    const scrollY = window.scrollY
    const phraseDocumentTop = event.currentTarget.getBoundingClientRect().top + scrollY
    setNoticeTop(phraseDocumentTop + scrollY)
    setIsMobileLayout(window.matchMedia("(max-width: 1023px)").matches)
    setIsClosing(false)
    setHasOpened(true)
    setIsOpen(true)
  }

  const closeNotice = () => {
    if (!isOpen || isClosing) return
    setIsClosing(true)
    closeTimerRef.current = window.setTimeout(() => {
      closeTimerRef.current = null
      setIsOpen(false)
      setIsClosing(false)
    }, 180)
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
    if (!isOpen) return
    const handleResize = () => {
      setIsMobileLayout(window.matchMedia("(max-width: 1023px)").matches)
    }
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [isOpen])

  useEffect(() => {
    if (!isOpen || isClosing || isMobileLayout) return

    const element = noticeRef.current
    const navigation = document.querySelector<HTMLElement>(".site-nav--desktop")
    if (!element || !navigation) return

    let frameId = 0
    let lastFrameTime = 0
    let opacity = 1
    let targetOpacity = 1
    const update = (time: number) => {
      frameId = 0
      if (navigation.getClientRects().length === 0) return

      if (targetOpacity > 0) {
        const distance = element.getBoundingClientRect().top
          - navigation.getBoundingClientRect().bottom
        targetOpacity = Math.min(1, Math.max(0, (distance + 90) / 120))
      }

      const elapsed = Math.min(Math.max(time - lastFrameTime, 0), 32)
      lastFrameTime = time
      opacity += (targetOpacity - opacity) * (1 - Math.exp(-elapsed / 45))
      if (Math.abs(targetOpacity - opacity) < 0.01) opacity = targetOpacity
      element.style.setProperty("--midnight-notice-scroll-opacity", String(opacity))

      if (opacity === 0) {
        clearCloseTimer()
        setIsOpen(false)
        setIsClosing(false)
      } else if (opacity !== targetOpacity) {
        frameId = window.requestAnimationFrame(update)
      }
    }
    const scheduleUpdate = () => {
      if (frameId) return
      lastFrameTime = performance.now()
      frameId = window.requestAnimationFrame(update)
    }

    window.addEventListener("scroll", scheduleUpdate, { passive: true })
    window.addEventListener("resize", scheduleUpdate)
    return () => {
      window.cancelAnimationFrame(frameId)
      window.removeEventListener("scroll", scheduleUpdate)
      window.removeEventListener("resize", scheduleUpdate)
    }
  }, [isOpen, isClosing, isMobileLayout])

  useEffect(() => {
    return () => {
      clearCloseTimer()
    }
  }, [])

  const noticeElement = (
    <aside
      ref={noticeRef}
      className="midnight-notice"
      data-closing={isClosing ? "true" : "false"}
      style={{ "--midnight-notice-top": `${noticeTop}px` } as CSSProperties}
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
  )

  const phrase = (
    <>
      {renderInlineMarkdown(firstLine)}
      {secondLine && <><br />{renderInlineMarkdown(secondLine)}</>}
    </>
  )

  return (
    <Fragment>
      <p>
        {hasOpened ? (
          <span className="work-midnight-notice-trigger">{phrase}</span>
        ) : (
          <button
            type="button"
            className="work-midnight-notice-trigger"
            aria-haspopup="dialog"
            aria-expanded={isOpen}
            onClick={openNotice}
          >
            <span className="work-midnight-notice-trigger__text">{phrase}</span>
          </button>
        )}
      </p>
      {isOpen
        ? isMobileLayout
          ? noticeElement
          : typeof document !== "undefined"
            ? createPortal(noticeElement, document.body)
            : null
        : null}
    </Fragment>
  )
}

function MidnightBlocks({
  chapterId,
  blocks,
  startIndex = 0,
  endIndex = blocks.length,
  enabled = true,
}: {
  chapterId: MidnightChapter["id"]
  blocks: MidnightBlock[]
  startIndex?: number
  endIndex?: number
  enabled?: boolean
}) {
  const locale = useLocale()

  return blocks.slice(startIndex, endIndex).map((block, offset) => {
    const index = startIndex + offset
    const key = `${block.kind}-${index}`
    const accentClass = "accent" in block ? getAccentClassName(block.accent) : undefined

    if (block.kind === "media-reference") {
      return chapterId === "engineering" && block.asset === "midnight-persona-system-architecture-polished.svg"
        ? <img key={key} className="work-midnight-architecture" src={midnightArchitecture}
            alt={locale === "ru" ? "Midnight Persona — схема архитектуры системы" : "Midnight Persona — System Architecture"} loading="lazy" />
        : null
    }
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
    if (block.notice) {
      return <MidnightNoticeTrigger key={key} text={block.text} />
    }

    const slowScan = block.interaction === "slow-scan-glass" || block.interaction === "slow-scan-liquid"
      ? block.interaction
      : undefined
    if (slowScan) {
      const phrase = MIDNIGHT_INTERACTIONS[locale][slowScan].targets[0]
      const start = block.text.indexOf(phrase)
      return (
        <p key={key} className={accentClass || undefined}>
          {renderInlineMarkdown(block.text.slice(0, start))}
          <MidnightSlowScan enabled={enabled} clip={slowScan === "slow-scan-glass" ? "glass" : "liquid"}>
            {phrase}
          </MidnightSlowScan>
          {renderInlineMarkdown(block.text.slice(start + phrase.length))}
        </p>
      )
    }

    const filmstripPhrase = MIDNIGHT_INTERACTIONS[locale].filmstrip.targets[0]
    if (block.interaction === "filmstrip") {
      return (
        <MidnightFilmstrip
          key={key}
          enabled={enabled}
          before={renderInlineMarkdown(block.text.slice(0, -filmstripPhrase.length))}
        >
          {filmstripPhrase}
        </MidnightFilmstrip>
      )
    }

    const [fluxPhrase, ponyPhrase] = MIDNIGHT_INTERACTIONS[locale]["orbit-comparison"].targets
    const fluxIndex = block.interaction === "orbit-comparison" ? block.text.indexOf(fluxPhrase) : -1
    const ponyIndex = block.interaction === "orbit-comparison" ? block.text.indexOf(ponyPhrase) : -1
    const galleries = ([
      { id: "flux", phrase: fluxPhrase, index: fluxIndex },
      { id: "pony", phrase: ponyPhrase, index: ponyIndex },
    ] as const).filter(({ index }) => index >= 0).sort((first, second) => first.index - second.index)

    let textStart = 0
    const orbitCopy = galleries.map(({ id, phrase, index }) => {
      const before = block.text.slice(textStart, index)
      textStart = index + phrase.length
      return (
        <Fragment key={id}>
          {renderInlineMarkdown(before)}
          <MidnightOrbit gallery={id}>{phrase}</MidnightOrbit>
        </Fragment>
      )
    })
    return (
      <p key={key} className={accentClass || undefined}>
        {orbitCopy}
        {renderInlineMarkdown(block.text.slice(textStart))}
      </p>
    )
  })
}

function WorkPreview({ index, status, evidence, children }: {
  index: string
  status: string
  evidence: string[]
  children: ReactNode
}) {
  const [open, setOpen] = useState(false)
  const { about, work } = useSiteContent()
  const clientMeta = work.caseMeta.clientWork
  const panel = useRef<HTMLDivElement>(null)
  const toggleButton = useRef<HTMLButtonElement>(null)
  const panelId = "leadflowai-inline-case"

  const toggle = () => {
    if (open && panel.current?.contains(document.activeElement)) {
      toggleButton.current?.focus()
    }
    setOpen(!open)
  }

  return (
    <article id="work-preview-leadflowai"
      className="work-preview work-leadflow-preview work-midnight-disclosure">
      <div className="work-preview__index work-mono">{index}</div>
      <div className="work-preview__main">
        <div className="work-preview__open">
          <h2 className="work-preview__title">LeadFlowAI</h2>
          <p className="work-preview__description">
            {clientMeta.service}{" "}
            <a href={clientMeta.clientUrl} target="_blank" rel="noreferrer">
              {clientMeta.clientName}
            </a>
          </p>
        </div>
        <div className="work-preview__tags">
          <span className="work-leadflow-preview__status">
            <span className="work-tag__lamp" aria-hidden="true" />
            {status}
          </span>
        </div>
      </div>
      <div className="work-preview__evidence">
        <ul className="work-preview__evidence-list">
          {evidence.map((item) => <li key={item}>{item}</li>)}
        </ul>
      </div>
      <div ref={panel} id={panelId} className="work-midnight-disclosure__panel"
        data-open={open} inert={!open}>
        <div className="work-midnight-disclosure__copy">{children}</div>
      </div>
      <button ref={toggleButton} type="button" className="work-midnight-disclosure__toggle"
        aria-expanded={open} aria-controls={panelId}
        aria-label={`${open ? about.chapterToggle.collapse : about.chapterToggle.expand} LeadFlowAI`}
        onClick={toggle}>
        <svg className="work-midnight-disclosure__arrow" viewBox="-36 -36 72 72" aria-hidden="true">
          <path d="M -9 -14.4 L 9 0 L -9 14.4" vectorEffect="non-scaling-stroke" />
        </svg>
      </button>
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

function ClientIndex() {
  const { work } = useSiteContent()
  const locale = useLocale()
  const leadflow = work.cases[1]
  const caseCopy = LEADFLOW_SOURCE[locale]

  return (
    <div className="work-shell work-client-index">
      <header className="work-shell__header">
        <h1 id="work-document-title" className="work-shell__title" tabIndex={-1}>
          Client Work
        </h1>
      </header>
      <div className="work-overview__entries">
        <WorkPreview
          index={locale === "ru" ? "01 / ОБРАБОТКА ЛИДОВ" : "01 / LEAD MANAGEMENT"}
          status={leadflow.tags[0].text}
          evidence={leadflow.capabilities?.map((item) => item.title) ?? []}
        >
          {caseCopy.trim().split(/\r?\n\r?\n/).map((block) => (
            block.startsWith("### ")
              ? <h3 key={block} className="work-document__subheading">{block.slice(4)}</h3>
              : <p key={block} className={block.startsWith("[GitHub /") ? "work-document__source" : undefined}>
                  {renderInlineMarkdown(block)}
                </p>
          ))}
        </WorkPreview>
      </div>
    </div>
  )
}

function MidnightDisclosure({ chapter }: { chapter: MidnightChapter }) {
  const [open, setOpen] = useState(false)
  const section = useRef<HTMLElement>(null)
  const panel = useRef<HTMLDivElement>(null)
  const { about } = useSiteContent()
  const isProduct = chapter.id === "product"
  const previewLength = chapter.previewEnd
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
            startIndex={previewLength} enabled={open} />
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
  const ecommerce = locale === "ru"
    ? sibvezCaseRu
    : about.chapters.find((chapter) => chapter.id === "ecommerce")
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
    ? work.caseMeta.midnightPersona.eyebrow
    : isEcommerce
      ? work.caseMeta.ecommerce.eyebrow
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
                ...work.caseMeta.midnightPersona.additionalMetrics,
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
                  {work.caseMeta.ecommerce.status.value}
                </span>
                <span>{work.caseMeta.ecommerce.status.label}</span>
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
          <ClientIndex />
        ) : (
          <CaseDocument view={view} />
        )}
      </div>
    </section>
  )
}
