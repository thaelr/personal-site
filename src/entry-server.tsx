import { renderToString } from "react-dom/server"
import App from "./App"
import { en } from "./content/en"
import { ru } from "./content/ru"
import type { Locale } from "./content/types"
import {
  WORK_ROUTE_VIEWS,
  getLlmsFullPath,
  getLlmsPath,
  getLegacyLeadflowPath,
  getMarkdownPath,
  getWorkPath,
  type WorkView,
} from "./work"

export const CONTENT = { en, ru }
export {
  WORK_ROUTE_VIEWS,
  getLlmsFullPath,
  getLlmsPath,
  getLegacyLeadflowPath,
  getMarkdownPath,
  getWorkPath,
}
export { getRouteMeta } from "./content/meta"
export { buildJsonLd } from "./content/jsonld"
export { getLlmsFull, getLlmsIndex, getPageMarkdown } from "./content/text"
export { MIDNIGHT_CONTENT } from "./content/midnight"
export { LEADFLOW_SOURCE } from "./content/leadflow"

/** Build-time markup for a static locale document. */
export function render(locale: Locale, view: WorkView, base: string): string {
  return renderToString(<App locale={locale} base={base} initialWorkView={view} />)
}
