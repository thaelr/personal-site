import { en } from "./en"
import { ru } from "./ru"
import { MIDNIGHT_CONTENT } from "./midnight"
import type { Locale } from "./types"
import { getWorkPath, type WorkView } from "../work"

const CONTENT = { en, ru }

/** Title and description for a route; shared by prerender and client switching. */
export function getRouteMeta(locale: Locale, view: WorkView) {
  const content = CONTENT[locale]
  if (view.kind === "overview") return content.meta

  const midnight = content.work.cases[0]
  const leadflow = content.work.cases[1]
  const ecommerce = content.about.chapters.find((chapter) => chapter.id === "ecommerce")
  const name =
    view.kind === "client-index"
      ? "Client Work"
      : view.kind === "client-case"
        ? "LeadFlowAI"
        : view.id === "ecommerce"
          ? content.work.index.find((project) => project.id === "ecommerce")!.title
          : MIDNIGHT_CONTENT[locale][0]?.title ?? "Midnight Persona"
  const description =
    view.kind === "client-index" || view.kind === "client-case"
      ? leadflow.lead
      : view.id === "ecommerce"
        ? ecommerce?.intro?.[0] ?? content.meta.description
        : MIDNIGHT_CONTENT[locale][0]?.blocks.find((block) => block.kind === "paragraph")?.text ??
          midnight.lead

  return { title: `${name} — ${content.meta.title}`, description }
}

function setMetaContent(selector: string, content: string) {
  const element = document.querySelector<HTMLMetaElement>(selector)
  if (element) element.content = content
}

function setLinkHref(selector: string, href: string) {
  const element = document.querySelector<HTMLLinkElement>(selector)
  if (element) element.href = href
}

/** Absolute site origin, taken from the prerendered canonical link when available. */
function resolveSiteOrigin(): string {
  const canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]')
  if (canonical) {
    try {
      return new URL(canonical.href).origin
    } catch {
      // fall through to the current origin
    }
  }
  return window.location.origin
}

function toAbsolute(path: string, origin: string): string {
  return new URL(path.replace(/^\//, ""), `${origin}/`).href
}

/** Keep document metadata in sync after a client-side locale or route change. */
export function applyDocumentMeta(locale: Locale, view: WorkView, base: string) {
  if (typeof document === "undefined") return

  const meta = getRouteMeta(locale, view)
  document.documentElement.lang = locale
  document.title = meta.title
  setMetaContent('meta[name="description"]', meta.description)
  setMetaContent('meta[property="og:title"]', meta.title)
  setMetaContent('meta[property="og:description"]', meta.description)

  const origin = resolveSiteOrigin()
  const canonical = toAbsolute(getWorkPath(view, locale, base), origin)
  const enUrl = toAbsolute(getWorkPath(view, "en", base), origin)
  const ruUrl = toAbsolute(getWorkPath(view, "ru", base), origin)

  setLinkHref('link[rel="canonical"]', canonical)
  setLinkHref('link[rel="alternate"][hreflang="en"]', enUrl)
  setLinkHref('link[rel="alternate"][hreflang="ru"]', ruUrl)
  setLinkHref('link[rel="alternate"][hreflang="x-default"]', enUrl)
  setMetaContent('meta[property="og:url"]', canonical)
  setMetaContent('meta[property="og:locale"]', locale === "ru" ? "ru_RU" : "en_US")
}
