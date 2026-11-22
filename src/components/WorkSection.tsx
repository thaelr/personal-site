import { useEffect } from "react"
import { useSiteContent } from "../content"
import type {
  AboutChapterContent,
  InlinePart,
  WorkCaseContent,
  WorkTagContent,
} from "../content/types"
import { getWorkChapters, type WorkView } from "../work"
import workChart from "../work-chart.png"

type WorkSectionProps = {
  view: WorkView
  onOpenView: (view: WorkView, originId: string) => void
  onActiveChapterChange: (chapterId: string | null) => void
}

type WorkPreviewProps = {
  id: string
  index: string
  title: string
  description?: string
  tags?: WorkTagContent[]
  evidence?: string[]
  media?: { src: string; alt: string }
  onOpen: () => void
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
    <p className="work-document__statement work-mono">
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

function WorkPreview({
  id,
  index,
  title,
  description,
  tags,
  evidence,
  media,
  onOpen,
}: WorkPreviewProps) {
  return (
    <article className="work-preview">
      <div className="work-preview__main">
        <div className="work-preview__index work-mono">{index}</div>
        <button
          id={id}
          type="button"
          className="work-preview__open"
          onClick={onOpen}
        >
          <span className="work-preview__title">{title}</span>
          {description ? <span className="work-preview__description">{description}</span> : null}
        </button>
        {tags?.length ? (
          <div className="work-preview__tags">
            {tags.map((tag) => (
              <WorkTag key={tag.text} {...tag} />
            ))}
          </div>
        ) : null}
      </div>

      {media || evidence?.length ? (
        <div className="work-preview__evidence">
          {media ? (
            <img src={media.src} alt={media.alt} className="work-preview__media" />
          ) : null}
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
  onOpenView,
}: Pick<WorkSectionProps, "onOpenView">) {
  const { work, about } = useSiteContent()
  const midnight = work.cases[0]
  const leadflow = work.cases[1]
  const ecommerce = about.chapters.find((chapter) => chapter.id === "ecommerce")
  const ecommerceDescription = ecommerce?.intro?.[0] ?? ecommerce?.summary?.map((part) => part.text).join("")

  return (
    <div className="work-section__grid">
      <div className="work-section__eyebrow work-mono">{work.eyebrow}</div>
      <h2 className="work-section__title">{work.title}</h2>
      <p className="work-section__intro">{work.intro}</p>

      <div className="work-overview__entries">
        <WorkPreview
          id="work-preview-midnight-persona"
          index="01 / PRODUCT"
          title="Midnight Persona"
          description={midnight.lead}
          tags={midnight.tags}
          media={{ src: workChart, alt: work.chartAlt }}
          onOpen={() =>
            onOpenView(
              { kind: "case", id: "midnight-persona" },
              "work-preview-midnight-persona",
            )
          }
        />
        <WorkPreview
          id="work-preview-ecommerce"
          index="02 / CASE"
          title="E-commerce in a Wartime Economy"
          description={ecommerceDescription}
          evidence={ecommerce?.tags}
          onOpen={() =>
            onOpenView({ kind: "case", id: "ecommerce" }, "work-preview-ecommerce")
          }
        />
        <WorkPreview
          id="work-preview-client-work"
          index="03 / COLLECTION"
          title="Client Work"
          description={leadflow.lead}
          evidence={leadflow.capabilities?.map((item) => item.title)}
          onOpen={() =>
            onOpenView({ kind: "client-index" }, "work-preview-client-work")
          }
        />
      </div>
    </div>
  )
}

function ClientIndex({
  onOpenView,
}: Pick<WorkSectionProps, "onOpenView">) {
  const { work } = useSiteContent()
  const leadflow = work.cases[1]

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
          onOpen={() =>
            onOpenView({ kind: "client-case", id: "leadflowai" }, "work-preview-leadflowai")
          }
        />
      </div>
    </div>
  )
}

function MidnightBody({ caseData }: { caseData: WorkCaseContent }) {
  const chapterCopy: Record<string, string[]> = {
    product: caseData.body.slice(0, 1),
    dialogue: caseData.body.slice(1, 2),
    engineering: caseData.body.slice(2, 3),
    "generative-media": [],
    "art-direction": [],
  }

  return (
    <div className="work-document__chapters">
      {getWorkChapters({ kind: "case", id: "midnight-persona" }).map((chapter) => (
        <section id={chapter.id} key={chapter.id} className="work-document__chapter">
          <div className="work-document__chapter-label work-mono">{chapter.label}</div>
          <h2 className="work-document__chapter-title">
            {chapter.label.replace(/^\d+\s*\/\s*/, "")}
          </h2>
          {chapterCopy[chapter.id]?.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
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
  const { work, about } = useSiteContent()
  const midnight = work.cases[0]
  const leadflow = work.cases[1]
  const ecommerce = about.chapters.find((chapter) => chapter.id === "ecommerce")
  const isMidnight = view.kind === "case" && view.id === "midnight-persona"
  const isEcommerce = view.kind === "case" && view.id === "ecommerce"
  const caseData = view.kind === "client-case" ? leadflow : midnight
  const title = isMidnight
    ? "Midnight Persona"
    : isEcommerce
      ? "E-commerce in a Wartime Economy"
      : "LeadFlowAI"
  const eyebrow = isMidnight ? "01 / PRODUCT" : isEcommerce ? "02 / CASE" : leadflow.index
  const subtitle = isEcommerce
    ? ecommerce?.intro?.[0] ?? ""
    : caseData.lead

  return (
    <article className="work-shell work-document">
      <header className="work-shell__header work-document__header">
        <div className="work-shell__eyebrow work-mono">{eyebrow}</div>
        <h1 id="work-document-title" className="work-shell__title" tabIndex={-1}>
          {title}
        </h1>
        {subtitle ? <p className="work-document__subtitle">{subtitle}</p> : null}
      </header>

      {isMidnight ? (
        <div className="work-document__first-screen">
          <img src={workChart} alt={work.chartAlt} className="work-document__media" />
          <InlineStatement parts={midnight.statement} />
        </div>
      ) : isEcommerce ? (
        ecommerce?.summary?.length ? <InlineStatement parts={ecommerce.summary} /> : null
      ) : (
        <div className="work-document__first-screen">
          <InlineStatement parts={leadflow.statement} />
        </div>
      )}

      {isMidnight ? (
        <MidnightBody caseData={midnight} />
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
          <WorkOverview onOpenView={onOpenView} />
        ) : view.kind === "client-index" ? (
          <ClientIndex onOpenView={onOpenView} />
        ) : (
          <CaseDocument view={view} />
        )}
      </div>
    </section>
  )
}
