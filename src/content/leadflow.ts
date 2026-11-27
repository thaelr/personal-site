import leadflowEn from "./leadflow.en.md?raw"
import leadflowRu from "./leadflow.ru.md?raw"
import type { Locale } from "./types"

export const LEADFLOW_SOURCE: Record<Locale, string> = {
  en: leadflowEn,
  ru: leadflowRu,
}

/** The authored case summary is the second prose paragraph under Introduction. */
export function getLeadflowDescription(locale: Locale): string {
  const blocks = LEADFLOW_SOURCE[locale].trim().split(/\n\s*\n/)
  const description = blocks[2]
  if (!description || description.startsWith("#")) {
    throw new Error(`leadflow: missing authored introduction summary for ${locale}`)
  }
  return description
}
