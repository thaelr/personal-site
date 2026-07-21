import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react"

type HighlightPart = {
  text: string
  highlight?: boolean
  breakAfter?: boolean
}

type ECommerceStep = {
  title: string
  paragraphs: string[]
  note?: string
  compact?: boolean
  drips?: boolean
}

type AiProduct = {
  label: string
  paragraphs: string[]
}

type CareerChapterData = {
  id: "physics" | "procurement" | "ecommerce" | "ai"
  eyebrow: string
  title: string
  progress: number
  summary?: HighlightPart[]
  tags?: string[]
  intro?: string[]
  callouts?: string[]
  followup?: string[]
  lifecycleLabel?: string
  lifecycleItems?: string[]
  asideNotes?: string[]
  steps?: ECommerceStep[]
  monoClosing?: string[]
  closing?: string[]
  products?: AiProduct[]
  authorComment?: string[]
}

type ParagraphTone = "default" | "primary" | "mono"

const CAREER_CHAPTERS: CareerChapterData[] = [
  {
    id: "physics",
    eyebrow: "2018-2020 / PHYSICS RESEARCH INSTITUTE",
    title: "The Rzhanov Institute in Siberia",
    progress: 0.25,
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
    progress: 0.5,
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
    progress: 0.75,
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
    asideNotes: ["*Wow.*", ":0"],
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
    progress: 1,
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
]

const BEST_TAGS = [
  {
    text: "End-to-end product development",
    statusIndicator: true,
  },
  {
    text: "Adapting my technology to your business processes",
    statusIndicator: true,
  },
]

const BEST_PARAGRAPHS = [
  "A product that’s still part idea, part business problem, part technical mess — that’s where I start.",
  "I can join the team, take it from idea to launch, and stay involved as it starts meeting real users. Or we can adapt my conversational systems to your product and business processes.",
  "Anyway, tell me what the product needs to achieve. We’ll work backwards from there.",
]

function InlineHighlight({ text }: { text: string }) {
  return <span className="about-inline-highlight">{text}</span>
}

function renderInlineParts(parts: HighlightPart[]) {
  return parts.map((part, idx) =>
    <span key={`${part.text}-${idx}`}>
      {part.highlight ? <InlineHighlight text={part.text} /> : part.text}
      {part.breakAfter ? <br /> : null}
    </span>,
  )
}

function WhiteCallout({ text }: { text: string }) {
  return <div className="about-white-callout">{text}</div>
}

function ProductLabel({ text }: { text: string }) {
  return <div className="about-product-label">{text}</div>
}

function AboutTag({
  text,
  statusIndicator = false,
}: {
  text: string
  statusIndicator?: boolean
}) {
  return (
    <span className={`about-tag ${statusIndicator ? "about-tag--status" : ""}`}>
      {statusIndicator ? <span className="work-tag__lamp" aria-hidden="true" /> : null}
      <span className="work-tag__text">{text}</span>
    </span>
  )
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

function ECommerceLeadLine() {
  return (
    <p className="about-ecommerce-leadline">
      <span>Eventually, I turned the store into a profitable business in five simple steps.</span>
      <span className="about-inline-spacer about-inline-spacer--five" aria-hidden="true" />
      <span className="about-ecommerce-leadline__aside about-ecommerce-leadline__aside--italic">
        <TypeRevealInline buttonText="*Wow.*" revealedText=":0" italic />
      </span>
    </p>
  )
}

function ECommerceStepCard({ step }: { step: ECommerceStep }) {
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
        .closest(".about-chapter__content")
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

function AboutHeader() {
  return (
    <>
      <div className="about-section__eyebrow about-mono">
        ABOUT / SCIENCE, BUSINESS, AND SYSTEMS
      </div>
      <h2 className="about-section__title">A Career Built Around Systems</h2>
      <p className="about-section__intro">
        <span className="about-section__intro-line">
          Physics taught me how to model what I could not observe. Public procurement taught me that decisions have a price.
        </span>
        <span className="about-section__intro-line">
          E-commerce taught me what starts breaking at scale. AI gave me a place to use all three.
        </span>
      </p>
    </>
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
  return (
    <div
      className={`about-author-comment ${
        collapseFirstGap ? "about-author-comment--collapse-first" : ""
      } ${withGuideLine ? "about-author-comment--with-line" : ""}`}
    >
      {withGuideLine ? <div className="about-author-comment__line" aria-hidden="true" /> : null}
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
                {beforeTrigger}
                <TypeRevealInline buttonText="*lol*" revealedText="=)" />
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

function CareerChapter({
  chapter,
  open,
  onToggle,
}: {
  chapter: CareerChapterData
  open: boolean
  onToggle: () => void
}) {
  const articleRef = useRef<HTMLElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const lineRef = useRef<HTMLDivElement>(null)
  const arrowButtonRef = useRef<HTMLSpanElement>(null)
  const [geometry, setGeometry] = useState({
    arrowBaseTop: 0,
    arrowShift: 0,
    lineOpenWidth: 0,
  })

  useLayoutEffect(() => {
    const measure = () => {
      if (
        !articleRef.current ||
        !titleRef.current ||
        !lineRef.current ||
        !arrowButtonRef.current
      ) {
        return
      }

      const articleRect = articleRef.current.getBoundingClientRect()
      const titleRect = titleRef.current.getBoundingClientRect()
      const lineRect = lineRef.current.getBoundingClientRect()
      const arrowRect = arrowButtonRef.current.getBoundingClientRect()

      const titleCenter = titleRect.top - articleRect.top + titleRect.height / 2
      const lineCenter = lineRect.top - articleRect.top + lineRect.height / 2
      const arrowBaseTop = titleCenter - arrowRect.height / 2
      const lineToArrowCenter =
        arrowRect.left + arrowRect.width / 2 - lineRect.left

      setGeometry({
        arrowBaseTop,
        arrowShift: lineCenter - titleCenter,
        lineOpenWidth: Math.max(lineToArrowCenter * chapter.progress, 0),
      })
    }

    measure()

    const resizeObserver = new ResizeObserver(() => measure())
    if (articleRef.current) resizeObserver.observe(articleRef.current)
    if (titleRef.current) resizeObserver.observe(titleRef.current)
    if (lineRef.current) resizeObserver.observe(lineRef.current)
    if (arrowButtonRef.current) resizeObserver.observe(arrowButtonRef.current)

    window.addEventListener("resize", measure)

    return () => {
      resizeObserver.disconnect()
      window.removeEventListener("resize", measure)
    }
  }, [chapter.progress, open])

  const chapterStyle = {
    "--chapter-progress": chapter.progress,
    "--chapter-arrow-base-top": `${geometry.arrowBaseTop}px`,
    "--chapter-arrow-shift": `${geometry.arrowShift}px`,
    "--chapter-line-open-width": `${geometry.lineOpenWidth}px`,
  } as CSSProperties

  const panelId = `about-panel-${chapter.id}`

  return (
    <article
      ref={articleRef}
      className={`about-chapter ${open ? "is-open" : ""}`}
      data-chapter-id={chapter.id}
      style={chapterStyle}
    >
      <button
        type="button"
        className="about-chapter__trigger"
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={`${open ? "Collapse" : "Expand"} ${chapter.title}`}
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
          <div ref={lineRef} className="about-chapter__progress-line" aria-hidden="true" />
        </div>
        <span ref={arrowButtonRef} className="about-chapter__arrow-button" aria-hidden="true">
          <span className="about-chapter__arrow">&gt;</span>
        </span>
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

            {chapter.id === "ecommerce" ? (
              <>
                <div className="about-prose about-prose--primary about-prose--ecommerce-intro">
                  <p>{`${chapter.intro?.[0] ?? ""} ${chapter.intro?.[1] ?? ""}`.trim()}</p>
                  <ECommerceLeadLine />
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
              </>
            ) : null}

            {chapter.id === "ai" ? (
              <>
                <ProseBlock paragraphs={chapter.intro ?? []} tone="primary" />
                {chapter.products?.map((product) => (
                  <div key={product.label} className="about-product-block">
                    <ProductLabel text={product.label} />
                    <div className="about-prose about-prose--primary about-product-block__prose">
                      {product.paragraphs.map((paragraph) => (
                        <p key={paragraph}>{paragraph}</p>
                      ))}
                    </div>
                  </div>
                ))}
              </>
            ) : null}
          </div>
        </div>
      </div>
    </article>
  )
}

export default function AboutSection() {
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
          <AboutHeader />

          <div className="about-section__chapters">
            {CAREER_CHAPTERS.map((chapter) => (
              <CareerChapter
                key={chapter.id}
                chapter={chapter}
                open={openIds.has(chapter.id)}
                onToggle={() => toggleChapter(chapter.id)}
              />
            ))}

            <section className="about-best">
              <h2 className="about-best__title">What I Do Best</h2>
              <div className="about-best__tags">
                {BEST_TAGS.map((tag) => (
                  <AboutTag key={tag.text} {...tag} />
                ))}
              </div>
              <div className="about-prose">
                {BEST_PARAGRAPHS.map((paragraph) => (
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
