// Static prerendering for the two locale documents.
// Runs after `vite build` (client) and `vite build --config vite.ssr.config.ts`.
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

const root = process.cwd()
const distDir = path.join(root, 'dist')

const template = await readFile(path.join(distDir, 'index.html'), 'utf8')
const siteConfig = JSON.parse(await readFile(path.join(root, '.figma/make/site.json'), 'utf8'))
const { render, CONTENT } = await import(
  pathToFileURL(path.join(root, 'dist-ssr/entry-server.js')).href
)

function ensureTrailingSlash(value) {
  return value.endsWith('/') ? value : `${value}/`
}

/** Public base used in canonical/hreflang URLs; never invents a new domain. */
function resolveSiteUrl() {
  if (process.env.SITE_URL) return ensureTrailingSlash(process.env.SITE_URL)

  if (process.env.GITHUB_ACTIONS === 'true' && process.env.GITHUB_REPOSITORY) {
    const [owner, repository] = process.env.GITHUB_REPOSITORY.split('/')
    return `https://${owner}.github.io/${repository}/`
  }

  const socialImage = siteConfig.openGraph?.image
  if (socialImage) return ensureTrailingSlash(socialImage.replace(/[^/]+$/, ''))

  return 'http://localhost:8443/'
}

const siteUrl = resolveSiteUrl()
const localeUrls = {
  en: siteUrl,
  ru: `${siteUrl}ru/`,
}

function escapeHtml(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

function escapeAttribute(value) {
  return escapeHtml(value).replace(/"/g, '&quot;')
}

function replaceOnce(html, pattern, replacement, label) {
  const regex = pattern instanceof RegExp ? pattern : new RegExp(pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
  if (!regex.test(html)) {
    throw new Error(`prerender: template slot not found: ${label}`)
  }
  // Function replacement keeps `$` sequences in the copy literal.
  return html.replace(regex, () => replacement)
}

function buildDocument(locale) {
  const meta = CONTENT[locale].meta
  const canonical = localeUrls[locale]

  let html = template
  html = replaceOnce(html, /<html lang="[^"]*">/, `<html lang="${locale}">`, 'html lang')
  html = replaceOnce(
    html,
    /<title>[\s\S]*?<\/title>/,
    `<title>${escapeHtml(meta.title)}</title>`,
    'title',
  )
  html = replaceOnce(
    html,
    /<meta name="description" content="[^"]*">/,
    `<meta name="description" content="${escapeAttribute(meta.description)}">`,
    'description',
  )
  html = replaceOnce(
    html,
    /<meta property="og:title" content="[^"]*">/,
    `<meta property="og:title" content="${escapeAttribute(meta.title)}">`,
    'og:title',
  )
  html = replaceOnce(
    html,
    /<meta property="og:description" content="[^"]*">/,
    `<meta property="og:description" content="${escapeAttribute(meta.description)}">`,
    'og:description',
  )
  html = replaceOnce(
    html,
    '<div id="root"></div>',
    `<div id="root">${render(locale)}</div>`,
    'root',
  )

  const headTags = [
    `<link rel="canonical" href="${canonical}">`,
    `<link rel="alternate" hreflang="en" href="${localeUrls.en}">`,
    `<link rel="alternate" hreflang="ru" href="${localeUrls.ru}">`,
    `<link rel="alternate" hreflang="x-default" href="${localeUrls.en}">`,
    `<meta property="og:url" content="${canonical}">`,
    `<meta property="og:locale" content="${locale === 'ru' ? 'ru_RU' : 'en_US'}">`,
  ].join('\n    ')

  return html.replace('</head>', `    ${headTags}\n  </head>`)
}

await mkdir(path.join(distDir, 'ru'), { recursive: true })
await writeFile(path.join(distDir, 'index.html'), buildDocument('en'))
await writeFile(path.join(distDir, 'ru', 'index.html'), buildDocument('ru'))

console.log(`prerender: wrote ${localeUrls.en} and ${localeUrls.ru}`)
