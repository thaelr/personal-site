import type { Locale } from "./content/types"

export type WorkView =
  | { kind: "overview" }
  | { kind: "case"; id: "midnight-persona" | "ecommerce" }
  | { kind: "client-index" }
  | { kind: "client-case"; id: "leadflowai" }

export type WorkChapter = {
  id: string
  label: string
  desktopLabel?: string
}

export const WORK_ROUTE_VIEWS: WorkView[] = [
  { kind: "case", id: "midnight-persona" },
  { kind: "case", id: "ecommerce" },
  { kind: "client-index" },
  { kind: "client-case", id: "leadflowai" },
]

function normalizeBase(base: string): string {
  const withLeadingSlash = base.startsWith("/") ? base : `/${base}`
  return withLeadingSlash.endsWith("/") ? withLeadingSlash : `${withLeadingSlash}/`
}

function getLocaleRoot(locale: Locale, base: string): string {
  const normalizedBase = normalizeBase(base)
  return locale === "ru" ? `${normalizedBase}ru/` : normalizedBase
}

function getWorkRouteSuffix(view: WorkView): string {
  if (view.kind === "overview") return ""
  if (view.kind === "case") return `work/${view.id}/`
  if (view.kind === "client-index") return "work/client-work/"
  return "work/client-work/leadflowai/"
}

export function getWorkPath(view: WorkView, locale: Locale, base: string): string {
  return `${getLocaleRoot(locale, base)}${getWorkRouteSuffix(view)}`
}

export function getWorkViewFromPathname(
  pathname: string,
  locale: Locale,
  base: string,
): WorkView | null {
  const views: WorkView[] = [{ kind: "overview" }, ...WORK_ROUTE_VIEWS]
  return views.find((view) => getWorkPath(view, locale, base) === pathname) ?? null
}

export function getParentWorkView(view: WorkView): WorkView | null {
  if (view.kind === "overview") return null
  if (view.kind === "client-case") return { kind: "client-index" }
  return { kind: "overview" }
}

export function getWorkOriginId(view: WorkView): string {
  if (view.kind === "case") return `work-preview-${view.id}`
  if (view.kind === "client-index") return "work-preview-client-work"
  if (view.kind === "client-case") return "work-preview-leadflowai"
  return "work"
}

export const MIDNIGHT_CHAPTERS: WorkChapter[] = [
  { id: "product", label: "01 / PRODUCT", desktopLabel: "01 PRODUCT" },
  { id: "dialogue", label: "02 / DIALOGUE ENGINE", desktopLabel: "02 DIALOGUE" },
  { id: "engineering", label: "03 / ENGINEERING", desktopLabel: "03 ENGINEERING" },
  {
    id: "generative-media",
    label: "04 / GENERATIVE MEDIA",
    desktopLabel: "04 MEDIA",
  },
  { id: "art-direction", label: "05 / ART DIRECTION", desktopLabel: "05 ART DIRECTION" },
]

export function getWorkChapters(view: WorkView): WorkChapter[] {
  return view.kind === "case" && view.id === "midnight-persona"
    ? MIDNIGHT_CHAPTERS
    : []
}

export function isWorkReadingView(view: WorkView): boolean {
  return view.kind !== "overview"
}
