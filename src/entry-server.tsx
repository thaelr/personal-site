import { renderToString } from "react-dom/server"
import App from "./App"
import { en } from "./content/en"
import { ru } from "./content/ru"
import { MIDNIGHT_CONTENT } from "./content/midnight"
import type { Locale } from "./content/types"
import { WORK_ROUTE_VIEWS, getWorkPath, type WorkView } from "./work"

export const CONTENT = { en, ru }
export { WORK_ROUTE_VIEWS, getWorkPath }

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
          ? "E-commerce in a Wartime Economy"
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

/** Build-time markup for a static locale document. */
export function render(locale: Locale, view: WorkView, base: string): string {
  return renderToString(<App locale={locale} base={base} initialWorkView={view} />)
}
