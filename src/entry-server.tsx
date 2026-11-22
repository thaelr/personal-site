import { renderToString } from "react-dom/server"
import App from "./App"
import { en } from "./content/en"
import { ru } from "./content/ru"
import type { Locale } from "./content/types"

export const CONTENT = { en, ru }

/** Build-time markup for a static locale document. */
export function render(locale: Locale): string {
  return renderToString(<App locale={locale} />)
}
