import { createContext, useContext, type ReactNode } from "react"
import { en } from "./en"
import { ru } from "./ru"
import type { Locale, SiteContent } from "./types"

export type { Locale, SiteContent } from "./types"

const CONTENT: Record<Locale, SiteContent> = { en, ru }

type ContentContextValue = {
  locale: Locale
  content: SiteContent
}

const ContentContext = createContext<ContentContextValue>({
  locale: "en",
  content: en,
})

export function ContentProvider({
  locale,
  children,
}: {
  locale: Locale
  children: ReactNode
}) {
  return (
    <ContentContext.Provider value={{ locale, content: CONTENT[locale] }}>
      {children}
    </ContentContext.Provider>
  )
}

export function useSiteContent(): SiteContent {
  return useContext(ContentContext).content
}

export function useLocale(): Locale {
  return useContext(ContentContext).locale
}

export const LOCALES = ["en", "ru"] as const

export function getLocalePath(locale: Locale, base: string): string {
  const normalizedBase = base.endsWith("/") ? base : `${base}/`
  return locale === "ru" ? `${normalizedBase}ru/` : normalizedBase
}

export function detectLocale(pathname: string, base: string): Locale {
  const normalizedBase = base.endsWith("/") ? base : `${base}/`
  return pathname.startsWith(`${normalizedBase}ru/`) ? "ru" : "en"
}

/** URL of the same page in the other locale, for a future approved switcher. */
export function getAlternateLocalePath(locale: Locale, base: string): string {
  return getLocalePath(locale === "ru" ? "en" : "ru", base)
}
