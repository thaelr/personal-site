import { en } from "./en"
import { ru } from "./ru"
import { MIDNIGHT_CONTENT, type MidnightBlock, type MidnightChapter } from "./midnight"
import { sibvezCaseRu } from "./sibvez.ru"
import leadflowEn from "./leadflow.en.md?raw"
import leadflowRu from "./leadflow.ru.md?raw"
import careerEn from "./about-career.en.md?raw"
import careerRu from "./about-career.ru.md?raw"
import type { AboutChapterContent, InlinePart, Locale, SiteContent } from "./types"
import { CONTACT_CHANNELS } from "./structure"
import { getRouteMeta } from "./meta"
import { getWorkPath, WORK_ROUTE_VIEWS, type WorkView } from "../work"
import architectureDiagram from "../midnight-persona-system-architecture-polished.svg"
import portrait from "../hero-portrait.png"

const CONTENT: Record<Locale, SiteContent> = { en, ru }
const CAREER: Record<Locale, string> = { en: careerEn, ru: careerRu }
const LEADFLOW: Record<Locale, string> = { en: leadflowEn, ru: leadflowRu }

const LABELS = {
  en: {
    home: "Home",
    about: "About",
    contact: "Contact",
    metrics: "Metrics",
    overview: "Overview",
    sections: "Sections",
    authorComment: "Author's comment",
    capabilities: "Capabilities",
  },
  ru: {
    home: "Главная",
    about: "О себе",
    contact: "Контакты",
    metrics: "Метрики",
    overview: "Обзор",
    sections: "Разделы",
    authorComment: "Комментарий автора",
    capabilities: "Возможности",
  },
} as const

const ALL_VIEWS: WorkView[] = [{ kind: "overview" }, ...WORK_ROUTE_VIEWS]

function ensureTrailingSlash(value: string): string {
  return value.endsWith("/") ? value : `${value}/`
}

function absolute(path: string, siteUrl: string): string {
  return new URL(path.replace(/^\//, ""), ensureTrailingSlash(siteUrl)).href
}

function oneLine(value: string): string {
  return value.replace(/\s+/g, " ").trim()
}

function renderParagraphs(paragraphs: string[] | undefined): string {
  return (paragraphs ?? []).map((paragraph) => paragraph.trim()).filter(Boolean).join("\n\n")
}

function renderInlineParts(parts: InlinePart[] | undefined): string {
  return (parts ?? []).map((part) => part.text).join("").trim()
}

function renderMetrics(metrics: { value: string; label: string }[]): string {
  return metrics
    .map(({ label, value }) => `- **${oneLine(label)}**: ${oneLine(value)}`)
    .join("\n")
}

function renderContact(locale: Locale): string {
  const contact = CONTENT[locale].contact
  return CONTACT_CHANNELS.map((channel) => {
    const label = contact.channelLabels[channel.id]
    return channel.href
      ? `- ${label}: [${channel.value}](${channel.href})`
      : `- ${label}: ${channel.value}`
  }).join("\n")
}

function renderWorkIndex(locale: Locale, siteUrl: string): string {
  const { work } = CONTENT[locale]
  const labels = LABELS[locale]

  return work.index
    .map((project) => {
      const view: WorkView =
        project.id === "client-work"
          ? { kind: "client-index" }
          : { kind: "case", id: project.id }
      const href = absolute(getWorkPath(view, locale, "/"), siteUrl)
      const lines = [
        `### ${project.index} — ${project.title}`,
        "",
        project.description,
        "",
        `[${labels.overview}](${href})`,
      ]

      if (project.metrics.length > 0) {
        lines.push("", renderMetrics(project.metrics))
      }
      if (project.status) {
        lines.push(
          "",
          `- **${oneLine(project.status.label)}**: ${oneLine(project.status.value)}`,
        )
      }

      return lines.join("\n")
    })
    .join("\n\n")
}

function renderChapterHeader(chapter: AboutChapterContent): string {
  const lines = [`### ${chapter.title}`, "", `*${chapter.eyebrow}*`]

  if (chapter.summary) {
    lines.push("", renderInlineParts(chapter.summary))
  }
  if (chapter.tags?.length) {
    lines.push("", chapter.tags.map((tag) => `- ${tag}`).join("\n"))
  }

  return lines.join("\n")
}

function renderCareerCopy(copy: string, locale: Locale): string {
  const [before = "", callout = "", after = "", comment = ""] = copy.split(
    /<!-- (?:callout|prose|comment) -->/,
  )
  const lines: string[] = []
  const labels = LABELS[locale]

  if (before.trim()) {
    lines.push(renderParagraphs(before.trim().split(/\n\s*\n/)))
  }
  if (callout.trim()) {
    const [statement, punchline] = callout.trim().split("\n")
    const quote = [`> ${statement.trim()}`]
    if (punchline?.trim()) quote.push(`> ${punchline.trim()}`)
    lines.push("", quote.join("\n"))
  }
  if (after.trim()) {
    lines.push("", renderParagraphs(after.trim().split(/\n\s*\n/)))
  }
  if (comment.trim()) {
    lines.push(
      "",
      `#### ${labels.authorComment}`,
      "",
      renderParagraphs(comment.trim().split(/\n\s*\n/)),
    )
  }

  return lines.join("\n")
}

function renderAboutChapter(
  locale: Locale,
  chapter: AboutChapterContent,
): string {
  const labels = LABELS[locale]
  const lines = [renderChapterHeader(chapter)]

  if (chapter.id === "physics") {
    if (chapter.intro?.length) lines.push("", renderParagraphs(chapter.intro))
    if (chapter.callouts?.[0]) lines.push("", `> ${chapter.callouts[0]}`)
    if (chapter.followup?.length) lines.push("", renderParagraphs(chapter.followup))
    if (chapter.callouts?.[1]) lines.push("", `> ${chapter.callouts[1]}`)
    if (chapter.authorComment?.length) {
      lines.push("", `#### ${labels.authorComment}`, "", renderParagraphs(chapter.authorComment))
    }
    return lines.join("\n")
  }

  if (chapter.id === "procurement") {
    const intro = [chapter.intro?.[0], chapter.intro?.[1]].filter(Boolean).join(" ")
    if (intro) lines.push("", intro)
    if (chapter.intro?.[2]) lines.push("", chapter.intro[2])
    if (chapter.lifecycleLabel) lines.push("", chapter.lifecycleLabel)
    if (chapter.lifecycleItems?.length) {
      lines.push("", chapter.lifecycleItems.join("\n\n"))
    }
    if (chapter.callouts?.[0]) lines.push("", `> ${chapter.callouts[0]}`)
    if (chapter.authorComment?.length) {
      lines.push("", `#### ${labels.authorComment}`, "", renderParagraphs(chapter.authorComment))
    }
    return lines.join("\n")
  }

  const careerPart = chapter.id === "ecommerce" ? 0 : 1
  const copy = CAREER[locale].split("\n\n---\n\n")[careerPart] ?? ""
  if (copy.trim()) {
    lines.push("", renderCareerCopy(copy, locale))
  }

  return lines.join("\n")
}

function renderOverview(locale: Locale, siteUrl: string): string {
  const content = CONTENT[locale]
  const labels = LABELS[locale]
  const lines = [
    `# ${content.home.name} — ${content.home.badge}`,
    "",
    `> ${content.home.careerLines.join(" ")}`,
    "",
    `## ${labels.home}`,
    "",
    `![${content.home.portraitAlt}](${absolute(portrait, siteUrl)})`,
    "",
    `- [${content.home.actions.work}](${absolute(getWorkPath({ kind: "overview" }, locale, "/"), siteUrl)}#work)`,
    `- [${content.home.actions.about}](${absolute(getWorkPath({ kind: "overview" }, locale, "/"), siteUrl)}#about)`,
    "",
    `## ${content.work.title}`,
    "",
    renderWorkIndex(locale, siteUrl),
    "",
    `## ${labels.about}`,
    "",
    `### ${content.about.title}`,
    "",
    locale === "ru"
      ? "> Интерактив: каждый раздел карьеры сворачивается и разворачивается кнопкой «Развернуть» / «Свернуть»."
      : "> Interactive: each career chapter is a collapsible section with an Expand / Collapse toggle.",
    "",
  ]

  for (const chapter of content.about.chapters) {
    lines.push(renderAboutChapter(locale, chapter), "")
  }

  lines.push(
    `### ${content.about.best.title}`,
    "",
    content.about.best.tags.map((tag) => `- ${tag.text}`).join("\n"),
    "",
    renderParagraphs(content.about.best.paragraphs),
    "",
    `## ${labels.contact}`,
    "",
    `**${content.contact.cta}**`,
    "",
    renderContact(locale),
  )

  return `${lines.join("\n").replace(/\n{3,}/g, "\n\n").trim()}\n`
}

function renderNoticeDialog(locale: Locale): string {
  const notice = CONTENT[locale].work.notice
  const lines = [
    `> **${notice.title}**`,
    ">",
    ...notice.paragraphs.map((paragraph) => `> ${paragraph}`),
    ">",
    `> ${locale === "ru" ? "Кнопки" : "Buttons"}: ${notice.okay}, ${notice.close}.`,
  ]
  return lines.join("\n")
}

function renderMidnightBlock(
  locale: Locale,
  chapter: MidnightChapter,
  block: MidnightBlock,
  siteUrl: string,
): string | null {
  if (block.kind === "media-reference") {
    if (block.asset !== "midnight-persona-system-architecture-polished.svg") return null

    const description =
      locale === "ru"
        ? "Схема архитектуры: три уровня — Channels (Telegram bot client, Web React application, Supabase Auth), Runtime (n8n Telegram UI, n8n Dialogue Engine, модульный TypeScript-бэкенд с Fastify, Web API, Telegram-контрактами и общим транзакционным контекстом; семь доменных модулей в одном процессе: Accounts, Chats, Access, Products, Commerce, Media, Experiments) и Data & External Services (PostgreSQL/Supabase, платёжные провайдеры, медиахранилище)."
        : "Architecture diagram: three bands — Channels (Telegram bot client, Web React application, Supabase Auth), Runtime (n8n Telegram UI, n8n Dialogue Engine, a modular TypeScript backend with Fastify, Web API, Telegram contracts, and a shared transactional context; seven in-process domain modules: Accounts, Chats, Access, Products, Commerce, Media, Experiments), and Data & External Services (PostgreSQL/Supabase, payment providers, media storage)."

    return `![Midnight Persona — System Architecture](${absolute(architectureDiagram, siteUrl)})\n\n> ${description}`
  }

  if (block.kind === "subheading") return `### ${block.text}`
  if (block.kind === "emphasis") return `**${block.text}**`
  if (block.kind === "link") return `[${block.text}](${block.href})`

  if (block.kind === "paragraph") {
    if (block.notice) {
      return `${block.text}\n\n${renderNoticeDialog(locale)}`
    }

    const notes: string[] = []
    const text = block.text

    if (chapter.id === "generative-media") {
      const flux = locale === "ru"
        ? "FLUX давал убедительный реализм"
        : "FLUX produced convincing realism"
      const pony = locale === "ru"
        ? "Второй позволял генерировать откровенные сцены"
        : "Pony could generate explicit scenes"
      const filmstrip = locale === "ru"
        ? "Для Midnight Persona уже произведено более 16 000 фотографий и 500 видео."
        : "I've already produced more than 16,000 photos and 500 videos for Midnight Persona."

      if (text.includes(flux) && text.includes(pony)) {
        notes.push(
          locale === "ru"
            ? "> Визуал: наведение на фразу про FLUX открывает вращающуюся карусель из шести FLUX-изображений; наведение на фразу про Pony открывает такую же карусель из шести Pony-изображений."
            : "> Visual: hovering the FLUX phrase opens a rotating carousel of six FLUX images; hovering the Pony phrase opens a similar carousel of six Pony images.",
        )
      }
      if (text.endsWith(filmstrip)) {
        notes.push(
          locale === "ru"
            ? "> Визуал: финальная фраза открывает WebGL-киноленту из сгенерированных фотографий медиапайплайна Midnight Persona."
            : "> Visual: the final phrase opens a WebGL filmstrip of generated photographs from the Midnight Persona media pipeline.",
        )
      }
    }

    if (chapter.id === "art-direction") {
      const glass = locale === "ru"
        ? "Запотевшее стекло со следами пальцев"
        : "Fogged-up glass with finger marks"
      const liquid = locale === "ru"
        ? "Жидкая материя тянется, переплетается и обволакивает саму себя."
        : "Liquid matter stretches, intertwines, and wraps around itself."

      if (text.includes(glass)) {
        notes.push(
          locale === "ru"
            ? "> Визуал: фраза запускает медленное сканирование, которое раскрывает короткий видеофрагмент запотевшего стекла со следами пальцев."
            : "> Visual: the phrase triggers a slow scan that reveals a short video clip of fogged glass with finger marks.",
        )
      }
      if (text.includes(liquid)) {
        notes.push(
          locale === "ru"
            ? "> Визуал: фраза запускает медленное сканирование, которое раскрывает короткий видеофрагмент жидкой материи, тянущейся и обволакивающей саму себя."
            : "> Visual: the phrase triggers a slow scan that reveals a short video clip of liquid matter stretching and wrapping around itself.",
        )
      }
    }

    return notes.length > 0 ? `${text}\n\n${notes.join("\n\n")}` : text
  }

  return null
}

function renderMidnightCase(locale: Locale, siteUrl: string): string {
  const content = CONTENT[locale]
  const labels = LABELS[locale]
  const project = content.work.index.find((item) => item.id === "midnight-persona")!
  const chapters = MIDNIGHT_CONTENT[locale]
  const baseUrl = absolute(
    getWorkPath({ kind: "case", id: "midnight-persona" }, locale, "/"),
    siteUrl,
  )
  const midnightMetrics = [
    ...project.metrics.slice(0, 1),
    {
      value: "20K+",
      label: locale === "ru" ? "Сообщения пользователей" : "User messages",
    },
    ...project.metrics.slice(1),
  ]
  const lines = [
    "# Midnight Persona",
    "",
    `*2025–2026 / PRODUCT, ENGINEERING, ART DIRECTION*`,
    "",
    `## ${labels.metrics}`,
    "",
    renderMetrics(midnightMetrics),
    "",
    `- **${oneLine(project.status?.label ?? "")}**: ${oneLine(project.status?.value ?? "")}`,
    "",
    `## ${labels.sections}`,
    "",
    `- [01 / PRODUCT](${baseUrl}#product)`,
    `- [02 / DIALOGUE ENGINE](${baseUrl}#dialogue)`,
    `- [03 / ENGINEERING](${baseUrl}#engineering)`,
    `- [04 / GENERATIVE MEDIA](${baseUrl}#generative-media)`,
    `- [05 / ART DIRECTION](${baseUrl}#art-direction)`,
  ]

  for (const chapter of chapters) {
    const label = chapter.id === "product" ? "01 / PRODUCT OVERVIEW" : chapter.label
    lines.push("", `## ${label}`)

    if (chapter.id !== "product" && chapter.title) {
      lines.push("", `### ${chapter.title}`)
    }
    if (chapter.id !== "product" && chapter.subtitle) {
      lines.push("", `*${chapter.subtitle}*`)
    }

    chapter.blocks.forEach((block, index) => {
      if (index === chapter.previewEnd) {
        if (chapter.id === "generative-media") {
          lines.push(
            "",
            locale === "ru"
              ? "> Интерактив: остальная часть главы свёрнута за тизером «cool story». Кнопка разворачивает её."
              : '> Interactive: the rest of the chapter is collapsed behind a "cool story" teaser. The toggle expands it.',
          )
        } else {
          lines.push(
            "",
            locale === "ru"
              ? `> Интерактив: остальная часть главы свёрнута. Кнопка «Развернуть ${label}» разворачивает её.`
              : `> Interactive: the rest of the chapter is collapsed. The "Expand ${label}" toggle expands it.`,
          )
        }
      }

      const rendered = renderMidnightBlock(locale, chapter, block, siteUrl)
      if (rendered) lines.push("", rendered)
    })
  }

  return `${lines.join("\n").replace(/\n{3,}/g, "\n\n").trim()}\n`
}

function renderEcommerceCase(locale: Locale, _siteUrl: string): string {
  const content = CONTENT[locale]
  const labels = LABELS[locale]
  const project = content.work.index.find((item) => item.id === "ecommerce")!
  const chapter = locale === "ru"
    ? sibvezCaseRu
    : content.about.chapters.find((item) => item.id === "ecommerce")!
  const lines = [
    `# ${project.title}`,
    "",
    `*${locale === "ru" ? "2021–2025 / РУКОВОДИТЕЛЬ E-COMMERCE" : "2021–2025 / HEAD OF E-COMMERCE"}*`,
    "",
    `## ${labels.metrics}`,
    "",
    renderMetrics(project.metrics),
    "",
    `- **${locale === "ru" ? "ТЕКУЩИЙ ЭТАП" : "CURRENT PHASE"}**: ${locale === "ru" ? "ЗАКРЫТ" : "DISCONTINUED"}`,
    "",
    `## ${labels.overview}`,
    "",
  ]

  if (locale === "ru") {
    const [first, second, third] = sibvezCaseRu.intro
    lines.push(`${first} ${second}`.trim())
    if (third) lines.push("", third)
  } else {
    lines.push(renderParagraphs(project.caseIntro))
    if (chapter.intro?.[2]) lines.push("", chapter.intro[2])
  }

  if (chapter.asideReveal) {
    const buttonText = chapter.asideReveal.buttonText.replace(/\*/g, "")
    const revealedText = chapter.asideReveal.revealedText.replace(/\*/g, "")
    lines.push(
      "",
      locale === "ru"
        ? `*Интерактив: кнопка «${buttonText}» раскрывает «${revealedText}».*`
        : `*Interactive: the "${buttonText}" button reveals "${revealedText}".*`,
    )
  }

  if (chapter.steps?.length) {
    lines.push("", `## ${locale === "ru" ? "Пять шагов" : "Five steps"}`)
    for (const step of chapter.steps) {
      lines.push("", `### ${step.title}`, "", renderParagraphs(step.paragraphs))
      if (step.note) {
        lines.push("", step.note.split("\n").map((line) => `> ${line}`).join("\n"))
      }
    }
  }

  if (chapter.authorComment?.length) {
    lines.push(
      "",
      `## ${labels.authorComment}`,
      "",
      renderParagraphs(chapter.authorComment),
    )
  }

  return `${lines.join("\n").replace(/\n{3,}/g, "\n\n").trim()}\n`
}

function renderClientIndex(locale: Locale): string {
  const content = CONTENT[locale]
  const leadflow = content.work.cases[1]
  const lines = [
    "# Client Work",
    "",
    `## ${locale === "ru" ? "01 / ОБРАБОТКА ЛИДОВ" : "01 / LEAD MANAGEMENT"} — LeadFlowAI`,
    "",
    "Conversational AI / Business Process Automation & Integration for [wooftattoo](https://wooftattoo.com/)",
    "",
    `- **${oneLine(leadflow.tags[0].text)}**`,
    "",
    (leadflow.capabilities ?? []).map((item) => `- ${item.title}`).join("\n"),
    "",
    locale === "ru"
      ? "> Интерактив: кейс LeadFlowAI — сворачиваемая панель с кнопкой «Развернуть LeadFlowAI» / «Свернуть LeadFlowAI»."
      : "> Interactive: the LeadFlowAI case is a collapsible panel with an Expand LeadFlowAI / Collapse LeadFlowAI toggle.",
    "",
    LEADFLOW[locale].trim(),
  ]

  return `${lines.join("\n").replace(/\n{3,}/g, "\n\n").trim()}\n`
}

function renderLeadflowCase(locale: Locale, _siteUrl: string): string {
  const content = CONTENT[locale]
  const leadflow = content.work.cases[1]
  const lines = [
    "# LeadFlowAI",
    "",
    `*${leadflow.index}*`,
    "",
    `> ${leadflow.lead}`,
    "",
    renderInlineParts(leadflow.statement),
    "",
    `## ${LABELS[locale].overview}`,
    "",
    renderParagraphs(leadflow.body),
    "",
    `## ${LABELS[locale].capabilities}`,
    "",
    (leadflow.capabilities ?? [])
      .map((item) => `### ${item.title}\n\n${item.description}`)
      .join("\n\n"),
  ]

  return `${lines.join("\n").replace(/\n{3,}/g, "\n\n").trim()}\n`
}

/** Markdown representation of a single route, built from the rendered content model. */
export function getPageMarkdown(
  locale: Locale,
  view: WorkView,
  siteUrl: string,
): string {
  if (view.kind === "overview") return renderOverview(locale, siteUrl)
  if (view.kind === "case" && view.id === "midnight-persona") {
    return renderMidnightCase(locale, siteUrl)
  }
  if (view.kind === "case" && view.id === "ecommerce") {
    return renderEcommerceCase(locale, siteUrl)
  }
  if (view.kind === "client-index") return renderClientIndex(locale)
  return renderLeadflowCase(locale, siteUrl)
}

function pageDescription(locale: Locale, view: WorkView): string {
  if (view.kind === "overview") return CONTENT[locale].work.intro
  return getRouteMeta(locale, view).description
}

/** llms.txt index for one locale. */
export function getLlmsIndex(locale: Locale, siteUrl: string): string {
  const content = CONTENT[locale]
  const labels = LABELS[locale]
  const lines = [
    `# ${content.home.name} — ${content.home.badge}`,
    "",
    `> ${content.home.careerLines.join(" ")}`,
    "",
    locale === "ru"
      ? "Сайт доступен в виде структурированного текста для языковых моделей и AI-агентов."
      : "This site is available as structured text for language models and AI agents.",
    "",
    locale === "ru" ? "## Страницы" : "## Pages",
    "",
  ]

  for (const view of ALL_VIEWS) {
    const meta = getRouteMeta(locale, view)
    const url = absolute(getWorkPath(view, locale, "/"), siteUrl)
    lines.push(`- [${meta.name}](${url}): ${oneLine(pageDescription(locale, view))}`)
  }

  lines.push("", locale === "ru" ? "## Markdown-версии" : "## Markdown versions", "")

  for (const view of ALL_VIEWS) {
    const meta = getRouteMeta(locale, view)
    const url = absolute(`${getWorkPath(view, locale, "/")}index.md`, siteUrl)
    lines.push(`- [${meta.name}](${url})`)
  }

  const fullTextUrl = absolute(
    `${getWorkPath({ kind: "overview" }, locale, "/")}llms-full.txt`,
    siteUrl,
  )

  lines.push(
    "",
    locale === "ru" ? "## Полный текст" : "## Full text",
    "",
    `- [llms-full.txt](${fullTextUrl})`,
    "",
    `## ${labels.contact}`,
    "",
    renderContact(locale),
  )

  return `${lines.join("\n").trim()}\n`
}

/** Full-text companion to llms.txt, concatenating every page representation. */
export function getLlmsFull(locale: Locale, siteUrl: string): string {
  const content = CONTENT[locale]
  const lines = [
    `# ${content.home.name} — ${content.home.badge}`,
    "",
    `> ${content.home.careerLines.join(" ")}`,
    "",
    `Generated from ${ensureTrailingSlash(siteUrl)} on ${new Date().toISOString().slice(0, 10)}.`,
    "",
    "---",
    "",
  ]

  for (const view of ALL_VIEWS) {
    const meta = getRouteMeta(locale, view)
    lines.push(
      `<!-- ${meta.name} -->`,
      "",
      getPageMarkdown(locale, view, siteUrl),
      "",
      "---",
      "",
    )
  }

  return `${lines.join("\n").trim()}\n`
}
