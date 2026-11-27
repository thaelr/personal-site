// Generates crawl/AI discovery resources from the same content used by the app.
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { resolveSiteUrl } from './site-url.mjs'

const root = process.cwd()
const distDir = path.join(root, 'dist')
const siteUrl = await resolveSiteUrl(root)
const {
  WORK_ROUTE_VIEWS,
  getWorkPath,
  getMarkdownPath,
  getLlmsPath,
  getLlmsFullPath,
  getPageMarkdown,
  getLlmsIndex,
  getLlmsFull,
} = await import(pathToFileURL(path.join(root, 'dist-ssr/entry-server.js')).href)

const views = [{ kind: 'overview' }, ...WORK_ROUTE_VIEWS]
const locales = ['en', 'ru']

function absolute(relativePath) {
  return new URL(relativePath.replace(/^\//, ''), siteUrl).href
}

function escapeXml(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

async function writeDist(relativePath, content) {
  const filePath = path.join(distDir, relativePath)
  await mkdir(path.dirname(filePath), { recursive: true })
  await writeFile(filePath, content)
}

const robots = `User-agent: *
Allow: /

Sitemap: ${absolute('sitemap.xml')}
`
await writeDist('robots.txt', robots)

const sitemapEntries = []
for (const locale of locales) {
  for (const view of views) {
    sitemapEntries.push({
      canonical: absolute(getWorkPath(view, locale, '/')),
      en: absolute(getWorkPath(view, 'en', '/')),
      ru: absolute(getWorkPath(view, 'ru', '/')),
    })
  }
}

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${sitemapEntries
  .map(
    ({ canonical, en, ru }) => `  <url>
    <loc>${escapeXml(canonical)}</loc>
    <xhtml:link rel="alternate" hreflang="en" href="${escapeXml(en)}"/>
    <xhtml:link rel="alternate" hreflang="ru" href="${escapeXml(ru)}"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="${escapeXml(en)}"/>
  </url>`,
  )
  .join('\n')}
</urlset>
`
await writeDist('sitemap.xml', sitemap)

for (const locale of locales) {
  for (const view of views) {
    const markdownPath = getMarkdownPath(view, locale, '/').replace(/^\//, '')
    await writeDist(markdownPath, getPageMarkdown(locale, view, siteUrl))
  }
}

for (const locale of locales) {
  await writeDist(
    getLlmsPath(locale, '/').replace(/^\//, ''),
    getLlmsIndex(locale, siteUrl),
  )
  await writeDist(
    getLlmsFullPath(locale, '/').replace(/^\//, ''),
    getLlmsFull(locale, siteUrl),
  )
}

console.log(
  `discovery: wrote robots.txt, sitemap.xml (${sitemapEntries.length} URLs), ` +
    `${locales.length * views.length} markdown pages, and llms.txt/llms-full.txt for ${locales.length} locales`,
)
