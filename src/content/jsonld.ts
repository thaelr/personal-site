import { en } from "./en"
import { ru } from "./ru"
import { CONTACT_CHANNELS } from "./structure"
import { getWorkPath, type WorkView } from "../work"
import type { Locale } from "./types"

const CONTENT = { en, ru }

type RouteMeta = {
  title: string
  description: string
  name: string
}

function ensureTrailingSlash(value: string): string {
  return value.endsWith("/") ? value : `${value}/`
}

function absolute(path: string, siteUrl: string): string {
  return new URL(path.replace(/^\//, ""), ensureTrailingSlash(siteUrl)).href
}

function channelHref(id: string): string | undefined {
  return CONTACT_CHANNELS.find((channel) => channel.id === id)?.href
}

/**
 * Structured data derived only from values that are already on the site.
 * The same graph is written at build time and kept in sync on client navigation.
 */
export function buildJsonLd(
  locale: Locale,
  view: WorkView,
  siteUrl: string,
  meta: RouteMeta,
) {
  const content = CONTENT[locale]
  const root = ensureTrailingSlash(siteUrl)
  const personId = new URL("#person", root).href
  const websiteId = new URL("#website", root).href
  const pageUrl = absolute(getWorkPath(view, locale, "/"), root)

  const sameAs = [channelHref("github"), channelHref("linkedin"), channelHref("telegram")]
    .filter((value): value is string => Boolean(value))

  const person = {
    "@type": "Person",
    "@id": personId,
    name: content.home.name,
    jobTitle: content.home.badge,
    url: absolute(getWorkPath({ kind: "overview" }, locale, "/"), root),
    email: CONTACT_CHANNELS.find((channel) => channel.id === "email")?.value,
    sameAs,
    description: content.home.careerLines.join(" "),
    knowsAbout: content.about.best.tags.map((tag) => tag.text),
  }

  const website = {
    "@type": "WebSite",
    "@id": websiteId,
    url: root,
    name: content.meta.title,
    inLanguage: ["en", "ru"],
    author: { "@id": personId },
  }

  const graph: object[] = [person, website]

  if (view.kind === "overview") {
    graph.push({
      "@type": "ProfilePage",
      "@id": `${pageUrl}#profilepage`,
      url: pageUrl,
      name: meta.title,
      description: meta.description,
      inLanguage: locale,
      isPartOf: { "@id": websiteId },
      mainEntity: { "@id": personId },
    })
  } else if (view.kind === "client-index") {
    graph.push({
      "@type": "CollectionPage",
      "@id": `${pageUrl}#collectionpage`,
      url: pageUrl,
      name: meta.name,
      description: meta.description,
      inLanguage: locale,
      isPartOf: { "@id": websiteId },
      mainEntity: {
        "@type": "ItemList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            item: {
              "@type": "CreativeWork",
              name: "LeadFlowAI",
              url: absolute(
                getWorkPath({ kind: "client-case", id: "leadflowai" }, locale, "/"),
                root,
              ),
            },
          },
        ],
      },
    })
  } else {
    graph.push({
      "@type": "CreativeWork",
      "@id": `${pageUrl}#creativework`,
      url: pageUrl,
      name: meta.name,
      description: meta.description,
      inLanguage: locale,
      isPartOf: { "@id": websiteId },
      author: { "@id": personId },
    })
  }

  return { "@context": "https://schema.org", "@graph": graph }
}
