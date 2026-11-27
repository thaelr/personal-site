// Static prerendering for both locale overviews and every WORK route.
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { resolveSiteUrl } from './site-url.mjs'

const root = process.cwd()
const distDir = path.join(root, 'dist')
const template = await readFile(path.join(distDir, 'index.html'), 'utf8')
const {
  render,
  getRouteMeta,
  buildJsonLd,
  getLegacyLeadflowPath,
  getLlmsPath,
  getMarkdownPath,
  WORK_ROUTE_VIEWS,
  getWorkPath,
} = await import(pathToFileURL(path.join(root, 'dist-ssr/entry-server.js')).href)
const publicBase = process.env.FIGMA_PUBLIC_URL ? `${process.env.FIGMA_PUBLIC_URL}/` : '/'
const views = [{ kind: 'overview' }, ...WORK_ROUTE_VIEWS]
const locales = ['en', 'ru']

const siteUrl = await resolveSiteUrl(root)

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
  const markdownUrl = new URL(
    getMarkdownPath(view, locale, '/').replace(/^\//, ''),
    siteUrl,
  ).href
  const llmsUrl = new URL(getLlmsPath(locale, '/').replace(/^\//, ''), siteUrl).href
  const ogType =
    view.kind === 'overview' || view.kind === 'client-index' ? 'website' : 'article'
  const jsonLd = JSON.stringify(buildJsonLd(locale, view, siteUrl, meta)).replace(
    /</g,
    '\\u003c',
  )

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
    `<link rel="alternate" type="text/markdown" href="${markdownUrl}" title="${locale === 'ru' ? 'Markdown-версия' : 'Markdown version'}">`,
    `<link rel="describedby" href="${llmsUrl}" type="text/plain">`,
    `<meta property="og:type" content="${ogType}">`,
    `<meta property="og:url" content="${canonical}">`,
    `<meta property="og:locale" content="${locale === 'ru' ? 'ru_RU' : 'en_US'}">`,
    `<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1">`,
    `<script type="application/ld+json" data-jsonld>${jsonLd}</script>`,
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

for (const locale of locales) {
  const legacyPath = getLegacyLeadflowPath(locale, '/').replace(/^\//, '')
  const canonical = canonicalUrl(locale, { kind: 'client-index' })
  const redirectTarget = getWorkPath({ kind: 'client-index' }, locale, '/')
  const enUrl = canonicalUrl('en', { kind: 'client-index' })
  const ruUrl = canonicalUrl('ru', { kind: 'client-index' })
  const llmsUrl = new URL(getLlmsPath(locale, '/').replace(/^\//, ''), siteUrl).href
  const filePath = path.join(distDir, legacyPath, 'index.html')
  const redirectScript = `location.replace(${JSON.stringify(redirectTarget)} + location.search + location.hash)`
  const html = `<!doctype html>
<html lang="${locale}">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${locale === 'ru' ? 'LeadFlowAI — перенаправление' : 'LeadFlowAI — redirect'}</title>
    <meta name="robots" content="noindex, follow">
    <link rel="canonical" href="${canonical}">
    <link rel="alternate" hreflang="en" href="${enUrl}">
    <link rel="alternate" hreflang="ru" href="${ruUrl}">
    <link rel="alternate" hreflang="x-default" href="${enUrl}">
    <link rel="describedby" href="${llmsUrl}" type="text/plain">
    <meta http-equiv="refresh" content="0; url=${redirectTarget}">
    <script>${redirectScript}</script>
  </head>
  <body><p><a href="${canonical}">${locale === 'ru' ? 'Открыть актуальный кейс LeadFlowAI' : 'Open the current LeadFlowAI case'}</a></p></body>
</html>
`
  await mkdir(path.dirname(filePath), { recursive: true })
  await writeFile(filePath, html)
  written.push(filePath)
}

console.log(`prerender: wrote ${written.length} canonical and legacy locale/WORK documents`)
