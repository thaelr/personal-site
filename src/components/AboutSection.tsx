import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react"
import enCareer from "../content/about-career.en.md?raw"
import ruCareer from "../content/about-career.ru.md?raw"
import { useLocale, useSiteContent } from "../content"
import { CHAPTER_PROGRESS } from "../content/structure"
import type {
  AboutChapterContent,
  ECommerceStepContent,
  InlinePart,
} from "../content/types"

type ParagraphTone = "default" | "primary" | "mono"

export function EcommerceNarrative({
  chapter,
  intro,
}: {
  chapter: Pick<AboutChapterContent, "intro" | "asideReveal" | "steps" | "authorComment">
  intro?: string[]
}) {
  return (
    <div className="ecommerce-narrative">
      <div className="about-prose about-prose--primary about-prose--ecommerce-intro">
        {intro
          ? intro.map((paragraph) => <p key={paragraph}>{paragraph}</p>)
          : <p>{`${chapter.intro?.[0] ?? ""} ${chapter.intro?.[1] ?? ""}`.trim()}</p>}
        {chapter.intro?.[2] && chapter.asideReveal ? (
          <ECommerceLeadLine
            text={chapter.intro[2]}
            aside={chapter.asideReveal}
          />
        ) : null}
      </div>
      <div className="about-step-card-list">
        {chapter.steps?.map((step) => (
          <ECommerceStepCard key={step.title} step={step} />
        ))}
      </div>
      {chapter.authorComment ? (
        <AuthorComment
          paragraphs={chapter.authorComment}
          collapseFirstGap
          ecommerceInteractive
        />
      ) : null}
    </div>
  )
}

function InlineHighlight({ text }: { text: string }) {
  return <span className="about-inline-highlight">{text}</span>
}

function renderInlineParts(parts: InlinePart[]) {
  return parts.map((part, idx) =>
    <span key={`${part.text}-${idx}`} className={part.text === " " ? "about-chapter__fact-space" : undefined}>
      {part.highlight ? <InlineHighlight text={part.text} /> : part.text}
      {part.breakAfter ? <br /> : null}
    </span>,
  )
}

function WhiteCallout({ text }: { text: ReactNode }) {
  return <div className="about-white-callout">{text}</div>
}

function ProseBlock({
  paragraphs,
  tone = "default",
  className = "",
}: {
  paragraphs: string[]
  tone?: ParagraphTone
  className?: string
}) {
  const toneClassName =
    tone === "primary"
      ? "about-prose--primary"
      : tone === "mono"
        ? "about-prose--mono"
        : ""

  return (
    <div className={`about-prose ${toneClassName} ${className}`.trim()}>
      {paragraphs.map((paragraph) => (
        <p key={paragraph}>{paragraph}</p>
      ))}
    </div>
  )
}

function TypeRevealInline({
  buttonText,
  revealedText,
  italic = false,
}: {
  buttonText: string
  revealedText: string
  italic?: boolean
}) {
  const [active, setActive] = useState(false)
  const [visibleChars, setVisibleChars] = useState(0)
  const [showCursor, setShowCursor] = useState(false)
  const [cursorVisible, setCursorVisible] = useState(false)

  useEffect(() => {
    if (!active || typeof window === "undefined") return

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setVisibleChars(revealedText.length)
      setShowCursor(false)
      setCursorVisible(false)
      return
    }

    const timeouts: number[] = []
    const typingInterval = 300

    setShowCursor(true)
    setCursorVisible(true)

    revealedText.split("").forEach((_, index) => {
      timeouts.push(
        window.setTimeout(() => {
          setVisibleChars(index + 1)
        }, 200 + index * typingInterval),
      )
    })

    const lastCharTime = 200 + Math.max(revealedText.length - 1, 0) * typingInterval

    timeouts.push(
      window.setTimeout(() => {
        setCursorVisible(false)
      }, lastCharTime + 120),
    )
    timeouts.push(
      window.setTimeout(() => {
        setCursorVisible(true)
      }, lastCharTime + 240),
    )
    timeouts.push(
      window.setTimeout(() => {
        setCursorVisible(false)
      }, lastCharTime + 360),
    )
    timeouts.push(
      window.setTimeout(() => {
        setCursorVisible(true)
      }, lastCharTime + 480),
    )
    timeouts.push(
      window.setTimeout(() => {
        setShowCursor(false)
        setCursorVisible(false)
      }, lastCharTime + 880),
    )

    return () => {
      timeouts.forEach((timeoutId) => {
        window.clearTimeout(timeoutId)
      })
    }
  }, [active, revealedText])

  const revealedValue = revealedText.slice(0, visibleChars)

  return (
    <span className="about-type-reveal">
      <button
        type="button"
        className={`about-type-reveal__button ${italic ? "about-type-reveal__button--italic" : ""}`}
        aria-pressed={active}
        data-plain={active}
        onClick={() => {
          if (active) return
          setActive(true)
        }}
      >
        {buttonText}
      </button>
      <span className="about-type-reveal__output" aria-live="polite">
        <span className="about-type-reveal__output-text">{revealedValue}</span>
        {showCursor ?
          <span
            className="about-type-reveal__cursor"
            aria-hidden="true"
            data-visible={cursorVisible}
          >
            |
          </span>
        : null}
      </span>
    </span>
  )
}

function ECommerceLeadLine({
  text,
  aside,
}: {
  text: string
  aside: { buttonText: string; revealedText: string }
}) {
  return (
    <p className="about-ecommerce-leadline">
      <span>{text}</span>
      <span className="about-inline-spacer about-inline-spacer--five" aria-hidden="true" />
      <span className="about-ecommerce-leadline__aside about-ecommerce-leadline__aside--italic">
        <TypeRevealInline
          buttonText={aside.buttonText}
          revealedText={aside.revealedText}
          italic
        />
      </span>
    </p>
  )
}

function ECommerceStepCard({ step }: { step: ECommerceStepContent }) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [dripProgress, setDripProgress] = useState(0)
  const [leftDripHeight, setLeftDripHeight] = useState(0)

  useLayoutEffect(() => {
    if (!step.drips) return

    let frameId = 0

    const measure = () => {
      frameId = 0

      if (!cardRef.current || window.innerWidth < 1024) {
        setDripProgress(0)
        setLeftDripHeight(0)
        return
      }

      const rect = cardRef.current.getBoundingClientRect()
      const cardStyles = window.getComputedStyle(cardRef.current)
      const aboutScale = Number.parseFloat(cardStyles.getPropertyValue("--about-scale")) || 1
      const authorCommentText = cardRef.current
        .closest(".ecommerce-narrative")
        ?.querySelector<HTMLElement>(".about-author-comment__text")
      const viewportHeight = window.innerHeight
      const startLine = viewportHeight * 0.85
      const endLine = viewportHeight * 0.25
      const nextProgress = Math.min(
        Math.max((startLine - rect.bottom) / (startLine - endLine), 0),
        1,
      )
      const nextLeftHeight = authorCommentText
        ? Math.max(authorCommentText.getBoundingClientRect().bottom - rect.bottom + 50 * aboutScale, 0)
        : 0

      setDripProgress((current) =>
        Math.abs(current - nextProgress) < 0.001 ? current : nextProgress,
      )
      setLeftDripHeight((current) =>
        Math.abs(current - nextLeftHeight) < 0.5 ? current : nextLeftHeight,
      )
    }

    const requestMeasure = () => {
      if (frameId) return
      frameId = window.requestAnimationFrame(measure)
    }

    requestMeasure()
    window.addEventListener("scroll", requestMeasure, { passive: true })
    window.addEventListener("resize", requestMeasure)

    return () => {
      if (frameId) {
        window.cancelAnimationFrame(frameId)
      }
      window.removeEventListener("scroll", requestMeasure)
      window.removeEventListener("resize", requestMeasure)
    }
  }, [step.drips])

  const cardStyle = step.drips
    ? ({
        "--about-drip-progress": dripProgress.toString(),
        "--about-drip-left-height": `${leftDripHeight}px`,
      } as CSSProperties)
    : undefined

  return (
    <div
      ref={cardRef}
      className={`about-step-card ${step.note ? "about-step-card--with-note" : ""} ${
        step.drips ? "about-step-card--with-drips" : ""
      }`}
      style={cardStyle}
    >
      <div className="about-step-card__title">{step.title}</div>
      <div
        className={`about-step-card__body ${
          step.compact ? "about-step-card__body--compact" : ""
        }`}
      >
        {step.paragraphs.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>
      {step.note ? <div className="about-step-card__note">{step.note}</div> : null}
      {step.drips ? (
        <div className="about-step-card__drips" aria-hidden="true">
          <span className="about-step-card__drip about-step-card__drip--left" />
          <span className="about-step-card__drip about-step-card__drip--right" />
          <span className="about-step-card__drip about-step-card__drip--mid-long" />
          <span className="about-step-card__drip about-step-card__drip--mid-short" />
        </div>
      ) : null}
    </div>
  )
}

function AuthorComment({
  paragraphs,
  collapseFirstGap = false,
  withGuideLine = false,
  ecommerceInteractive = false,
}: {
  paragraphs: string[]
  collapseFirstGap?: boolean
  withGuideLine?: boolean
  ecommerceInteractive?: boolean
}) {
  const locale = useLocale()
  return (
    <div
      className={`about-author-comment ${
        collapseFirstGap ? "about-author-comment--collapse-first" : ""
      } ${withGuideLine ? "about-author-comment--with-line" : ""}`}
    >
      {withGuideLine ? <span className="about-author-comment__line" aria-hidden="true" /> : null}
      <div className="about-author-comment__text">
        {paragraphs.map((paragraph, index) => {
          if (
            ecommerceInteractive &&
            index === 1 &&
            paragraph.includes("*lol* =)")
          ) {
            const [beforeTrigger, afterTrigger = ""] = paragraph.split("*lol* =)")

            return (
              <p key={paragraph}>
                {locale === "ru" ? (
                  <>
                    {beforeTrigger.trimEnd()}{"\u2060"}
                    <span className="ecommerce-inline-reveal">
                      <TypeRevealInline buttonText="*lol*" revealedText="=)" />
                    </span>
                  </>
                ) : (
                  <>{beforeTrigger}<TypeRevealInline buttonText="*lol*" revealedText="=)" /></>
                )}
                {afterTrigger}
              </p>
            )
          }

          return <p key={paragraph}>{paragraph}</p>
        })}
      </div>
    </div>
  )
}

const careerProse = { en: enCareer, ru: ruCareer }

function AboutEcommerceCopy({ copy }: { copy: string }) {
  const [before, callout, after, comment] = copy.split(/<!-- (?:callout|prose|comment) -->/)
  const [statement, punchline] = callout.trim().split("\n")
  const period = useRef<HTMLSpanElement>(null)
  const line = useRef<HTMLSpanElement>(null)
  const text = useRef<HTMLSpanElement>(null)

  useLayoutEffect(() => {
    const anchor = period.current
    const row = line.current
    const word = text.current
    if (!anchor || !row || !word) return

    const align = () => {
      const offset = anchor.getBoundingClientRect().left - row.getBoundingClientRect().left
      const available = row.clientWidth - word.getBoundingClientRect().width
      row.style.paddingLeft = `${Math.max(0, Math.min(offset, available))}px`
    }
    const observer = new ResizeObserver(align)
    observer.observe(row, { box: "border-box" })
    observer.observe(word)
    align()
    return () => observer.disconnect()
  }, [statement, punchline])

  return (
    <>
      <ProseBlock paragraphs={before.trim().split(/\n\s*\n/)} tone="primary" />
      <WhiteCallout text={<>
        {statement.slice(0, -1)}<span ref={period}>{statement.slice(-1)}</span>
        <span ref={line} className="about-ecommerce-punchline">
          <span ref={text}><span aria-hidden="true">{"    "}</span>{punchline}</span>
        </span>
      </>} />
      <ProseBlock paragraphs={after.trim().split(/\n\s*\n/)} tone="primary" className="about-prose--after-callout" />
      <div className="about-career-ending">
        <AuthorComment paragraphs={comment.trim().split(/\n\s*\n/)} withGuideLine />
      </div>
    </>
  )
}

function AboutAiCopy({ copy }: { copy: string }) {
  const [before, callout, after, comment] = copy.split(/<!-- (?:callout|prose|comment) -->/)
  return (
    <>
      <ProseBlock paragraphs={before.trim().split(/\n\s*\n/)} tone="primary" />
      <WhiteCallout text={callout.trim()} />
      <ProseBlock paragraphs={after.trim().split(/\n\s*\n/)} tone="primary" className="about-prose--after-callout" />
      <div className="about-career-ending">
        <AuthorComment paragraphs={[comment.trim()]} withGuideLine />
      </div>
    </>
  )
}

function CareerChapter({
  chapter,
  open,
  onToggle,
}: {
  chapter: AboutChapterContent
  open: boolean
  onToggle: () => void
}) {
  const { about } = useSiteContent()
  const locale = useLocale()
  const chapterCopy = chapter.id === "ecommerce" || chapter.id === "ai"
    ? careerProse[locale].split("\n\n---\n\n")[chapter.id === "ecommerce" ? 0 : 1]
    : undefined
  const progress = CHAPTER_PROGRESS[chapter.id]
  const triggerRef = useRef<HTMLButtonElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const trackRef = useRef<HTMLSpanElement>(null)
  const axisRef = useRef<HTMLSpanElement>(null)
  const [geometry, setGeometry] = useState({
    trackX: 0,
    axisX: 0,
    titleY: 0,
    trackY: 0,
    headHalfWidth: 0,
    headHalfHeight: 0,
  })

  useLayoutEffect(() => {
    const trigger = triggerRef.current
    const title = titleRef.current
    const track = trackRef.current
    const axis = axisRef.current
    if (!trigger || !title || !track || !axis) return

    const measure = () => {
      const origin = trigger.getBoundingClientRect()
      const heading = title.getBoundingClientRect()
      const line = track.getBoundingClientRect()
      const rail = axis.getBoundingClientRect()
      const headHalfHeight = rail.width / 5
      const scale = window.matchMedia("(min-width: 1024px)").matches ? rail.width / 72 : 1
      setGeometry({
        trackX: line.left - origin.left,
        axisX: rail.left - origin.left + rail.width / 2,
        titleY: heading.top - origin.top + heading.height / 2,
        trackY: origin.height - headHalfHeight - 2.5 * scale - 10,
        headHalfWidth: rail.width / 8,
        headHalfHeight,
      })
    }

    measure()
    const observer = new ResizeObserver(measure)
    for (const element of [trigger, title, track, axis]) observer.observe(element)
    window.addEventListener("resize", measure)
    return () => {
      observer.disconnect()
      window.removeEventListener("resize", measure)
    }
  }, [])

  const { axisX, titleY, trackX, trackY, headHalfWidth, headHalfHeight } = geometry
  const tipX = axisX + headHalfWidth
  const graphicStyle = {
    "--chapter-track-offset": 1 - progress,
    "--chapter-arrow-shift": `${trackY - titleY}px`,
  } as CSSProperties

  const panelId = `about-panel-${chapter.id}`

  return (
    <article
      className={`about-chapter ${open ? "is-open" : ""}`}
      data-chapter-id={chapter.id}
    >
      <button
        ref={triggerRef}
        type="button"
        className="about-chapter__trigger"
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={`${open ? about.chapterToggle.collapse : about.chapterToggle.expand} ${chapter.title}`}
        onClick={onToggle}
      >
        <div className="about-chapter__header">
          <div className="about-chapter__eyebrow">{chapter.eyebrow}</div>
          <h3 ref={titleRef} className="about-chapter__title">
            {chapter.title}
          </h3>
          {chapter.summary ? (
            <p className="about-chapter__summary">{renderInlineParts(chapter.summary)}</p>
          ) : null}
          {chapter.tags ? (
            <div className="about-chapter__tags">
              {chapter.tags.map((tag) => (
                <span key={tag} className="about-tag">
                  {tag}
                </span>
              ))}
            </div>
          ) : null}
          <span ref={trackRef} className="about-chapter__track-anchor" aria-hidden="true" />
        </div>
        <span ref={axisRef} className="about-chapter__arrow-axis" aria-hidden="true" />
        {axisX > 0 && (
          <svg className="about-chapter__graphic" aria-hidden="true" style={graphicStyle}>
            <path className="about-chapter__track" pathLength={1} d={`M ${trackX} ${trackY} H ${tipX}`} />
            <g className="about-chapter__arrow-motion">
              <g transform={`translate(${axisX} ${titleY})`}>
                <path className="about-chapter__arrowhead"
                  d={`M ${-headHalfWidth} ${-headHalfHeight} L ${headHalfWidth} 0 L ${-headHalfWidth} ${headHalfHeight}`} />
              </g>
            </g>
          </svg>
        )}
      </button>

      <div id={panelId} className="about-chapter__panel">
        <div className="about-chapter__panel-inner">
          <div className="about-chapter__content">
            {chapter.id === "physics" ? (
              <>
                <ProseBlock paragraphs={chapter.intro ?? []} />
                {chapter.callouts?.[0] ? <WhiteCallout text={chapter.callouts[0]} /> : null}
                <ProseBlock
                  paragraphs={chapter.followup ?? []}
                  className="about-prose--after-callout"
                />
                {chapter.callouts?.[1] ? <WhiteCallout text={chapter.callouts[1]} /> : null}
                {chapter.authorComment ? (
                  <AuthorComment paragraphs={chapter.authorComment} withGuideLine />
                ) : null}
              </>
            ) : null}

            {chapter.id === "procurement" ? (
              <>
                <ProseBlock
                  tone="primary"
                  className="about-prose--procurement-intro"
                  paragraphs={[
                    `${chapter.intro?.[0] ?? ""} ${chapter.intro?.[1] ?? ""}`.trim(),
                    chapter.intro?.[2] ?? "",
                    chapter.lifecycleLabel ?? "",
                  ].filter(Boolean)}
                />
                {chapter.lifecycleLabel ? (
                  <div className="about-prose about-prose--mono about-prose--dense about-prose--procurement-list">
                    {chapter.lifecycleItems?.map((item) => (
                      <p key={item}>{item}</p>
                    ))}
                  </div>
                ) : null}
                {chapter.callouts?.[0] ? <WhiteCallout text={chapter.callouts[0]} /> : null}
                {chapter.authorComment ? (
                  <AuthorComment paragraphs={chapter.authorComment} withGuideLine />
                ) : null}
              </>
            ) : null}

            {chapterCopy ? (
              chapter.id === "ecommerce"
                ? <AboutEcommerceCopy copy={chapterCopy} />
                : <AboutAiCopy copy={chapterCopy} />
            ) : null}
          </div>
        </div>
      </div>
    </article>
  )
}

export default function AboutSection() {
  const { about } = useSiteContent()
  const defaultOpenIds = useMemo(() => new Set<string>(), [])
  const [openIds, setOpenIds] = useState<Set<string>>(defaultOpenIds)

  const toggleChapter = (id: string) => {
    setOpenIds((current) => {
      const next = new Set(current)

      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }

      return next
    })
  }

  return (
    <section id="about" className="about-section">
      <div className="about-section__inner">
        <div className="about-section__grid">
          <h2 className="about-section__title">{about.title}</h2>

          <div className="about-section__chapters">
            {about.chapters.map((chapter) => (
              <CareerChapter
                key={chapter.id}
                chapter={chapter}
                open={openIds.has(chapter.id)}
                onToggle={() => toggleChapter(chapter.id)}
              />
            ))}

            <section className="about-best">
              <h2 className="about-best__title">
                <span className="work-tag__lamp" aria-hidden="true" />
                {about.best.title}
              </h2>
              <div className="about-best__tags">
                {about.best.tags.map((tag) => (
                  <p key={tag.text}>{tag.text}</p>
                ))}
              </div>
              <div className="about-prose">
                {about.best.paragraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
    </section>
  )
}
