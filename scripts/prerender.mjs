// Static prerendering for both locale overviews and every WORK route.
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

const root = process.cwd()
const distDir = path.join(root, 'dist')
const template = await readFile(path.join(distDir, 'index.html'), 'utf8')
const siteConfig = JSON.parse(await readFile(path.join(root, '.figma/make/site.json'), 'utf8'))
const { render, getRouteMeta, WORK_ROUTE_VIEWS, getWorkPath } = await import(
  pathToFileURL(path.join(root, 'dist-ssr/entry-server.js')).href
)
const publicBase = process.env.FIGMA_PUBLIC_URL ? `${process.env.FIGMA_PUBLIC_URL}/` : '/'
const views = [{ kind: 'overview' }, ...WORK_ROUTE_VIEWS]
const locales = ['en', 'ru']

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

function escapeHtml(value) {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function escapeAttribute(value) {
  return escapeHtml(value).replace(/"/g, '&quot;')
}

function replaceOnce(html, pattern, replacement, label) {
  const regex = pattern instanceof RegExp
    ? pattern
    : new RegExp(pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
  if (!regex.test(html)) throw new Error(`prerender: template slot not found: ${label}`)
  return html.replace(regex, () => replacement)
}

function canonicalUrl(locale, view) {
  const relativePath = getWorkPath(view, locale, '/').replace(/^\//, '')
  return new URL(relativePath, siteUrl).href
}

function buildDocument(locale, view) {
  const meta = getRouteMeta(locale, view)
  const canonical = canonicalUrl(locale, view)
  const enUrl = canonicalUrl('en', view)
  const ruUrl = canonicalUrl('ru', view)

  let html = template
  html = replaceOnce(html, /<html lang="[^"]*">/, `<html lang="${locale}">`, 'html lang')
  html = replaceOnce(html, /<title>[\s\S]*?<\/title>/, `<title>${escapeHtml(meta.title)}</title>`, 'title')
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
    `<div id="root">${render(locale, view, publicBase)}</div>`,
    'root',
  )

  const headTags = [
    `<link rel="canonical" href="${canonical}">`,
    `<link rel="alternate" hreflang="en" href="${enUrl}">`,
    `<link rel="alternate" hreflang="ru" href="${ruUrl}">`,
    `<link rel="alternate" hreflang="x-default" href="${enUrl}">`,
    `<meta property="og:url" content="${canonical}">`,
    `<meta property="og:locale" content="${locale === 'ru' ? 'ru_RU' : 'en_US'}">`,
  ].join('\n    ')

  return html.replace('</head>', `    ${headTags}\n  </head>`)
}

function outputPath(locale, view) {
  const routePath = getWorkPath(view, locale, '/').replace(/^\//, '').replace(/\/$/, '')
  return path.join(distDir, routePath, 'index.html')
}

const written = []
for (const locale of locales) {
  for (const view of views) {
    const filePath = outputPath(locale, view)
    await mkdir(path.dirname(filePath), { recursive: true })
    await writeFile(filePath, buildDocument(locale, view))
    written.push(filePath)
  }
}

console.log(`prerender: wrote ${written.length} locale/WORK documents`)
