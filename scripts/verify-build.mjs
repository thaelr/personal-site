// Production-build verification for routes, metadata, discovery resources and text.
import { readFile, readdir, stat } from 'node:fs/promises'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { resolveSiteUrl } from './site-url.mjs'

const root = process.cwd()
const distDir = path.join(root, 'dist')
const siteUrl = await resolveSiteUrl(root)
const {
  WORK_ROUTE_VIEWS,
  MIDNIGHT_CONTENT,
  LEADFLOW_SOURCE,
  getLegacyLeadflowPath,
  getWorkPath,
  getMarkdownPath,
  getLlmsPath,
  getLlmsFullPath,
  getRouteMeta,
  getPageMarkdown,
  getLlmsIndex,
  getLlmsFull,
} = await import(pathToFileURL(path.join(root, 'dist-ssr/entry-server.js')).href)

const views = [{ kind: 'overview' }, ...WORK_ROUTE_VIEWS]
const locales = ['en', 'ru']
const failures = []

function fail(message) {
  failures.push(message)
}

function assert(condition, message) {
  if (!condition) fail(message)
}

function absolute(relativePath) {
  return new URL(relativePath.replace(/^\//, ''), siteUrl).href
}

function escapeHtml(value) {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

async function readDist(relativePath) {
  try {
    return await readFile(path.join(distDir, relativePath), 'utf8')
  } catch {
    return null
  }
}

async function distExists(relativePath) {
  try {
    await stat(path.join(distDir, relativePath))
    return true
  } catch {
    return false
  }
}

function normalizedText(value) {
  return value
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[*_`]/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/<[^>]*>/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

async function assertInternalMarkdownTargets(markdown, markdownPath) {
  const siteHost = new URL(siteUrl).host
  for (const match of markdown.matchAll(/!?\[[^\]]*\]\(([^)]+)\)/g)) {
    let url
    try {
      url = new URL(match[1])
    } catch {
      fail(`${markdownPath} contains a non-absolute link: ${match[1]}`)
      continue
    }
    if (!['http:', 'https:'].includes(url.protocol) || url.host !== siteHost) continue
    let target = decodeURIComponent(url.pathname).replace(/^\//, '')
    if (!target || target.endsWith('/')) target += 'index.html'
    assert(await distExists(target), `${markdownPath} links to missing build resource ${url.href}`)
  }
}

function viewKey(view) {
  if (view.kind === 'overview') return 'overview'
  if (view.kind === 'client-index') return 'client-work'
  return view.id
}

// --- robots.txt -----------------------------------------------------------
const robots = await readDist('robots.txt')
assert(robots, 'robots.txt is missing')
if (robots) {
  assert(/User-agent:\s*\*/.test(robots), 'robots.txt must allow all user agents')
  assert(/Sitemap:\s*\S+/.test(robots), 'robots.txt must declare a sitemap')
  assert(
    robots.includes(absolute('sitemap.xml')),
    'robots.txt sitemap URL must match the resolved site URL',
  )
  assert(!/Disallow:/i.test(robots), 'robots.txt must not block crawlers')
  assert((robots.match(/User-agent:/g) ?? []).length === 1, 'robots.txt should use one general policy')
}

// --- sitemap.xml ----------------------------------------------------------
const sitemap = await readDist('sitemap.xml')
assert(sitemap, 'sitemap.xml is missing')
const locs = sitemap
  ? [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1])
  : []
assert(
  locs.length === views.length * locales.length,
  `sitemap.xml must contain ${views.length * locales.length} URLs, found ${locs.length}`,
)
assert(new Set(locs).size === locs.length, 'sitemap.xml contains duplicate URLs')
assert(!sitemap?.includes('<lastmod>'), 'sitemap.xml must not use build-time lastmod values')
for (const locale of locales) {
  assert(
    !locs.includes(absolute(getLegacyLeadflowPath(locale, '/'))),
    'sitemap.xml must exclude the legacy LeadFlowAI route',
  )
}

for (const locale of locales) {
  for (const view of views) {
    const canonical = absolute(getWorkPath(view, locale, '/'))
    const enUrl = absolute(getWorkPath(view, 'en', '/'))
    const ruUrl = absolute(getWorkPath(view, 'ru', '/'))
    assert(locs.includes(canonical), `sitemap.xml missing ${canonical}`)
    if (sitemap) {
      const entry = [...sitemap.matchAll(/<url>([\s\S]*?)<\/url>/g)]
        .map((match) => match[1])
        .find((value) => value.includes(`<loc>${canonical}</loc>`)) ?? ''
      assert(
        entry.includes(`hreflang="en" href="${enUrl}"`),
        `sitemap.xml missing en alternate for ${canonical}`,
      )
      assert(
        entry.includes(`hreflang="ru" href="${ruUrl}"`),
        `sitemap.xml missing ru alternate for ${canonical}`,
      )
      assert(
        entry.includes(`hreflang="x-default" href="${enUrl}"`),
        `sitemap.xml missing x-default alternate for ${canonical}`,
      )
    }
  }
}

// --- HTML routes ----------------------------------------------------------
for (const locale of locales) {
  for (const view of views) {
    const routePath = getWorkPath(view, locale, '/').replace(/^\//, '')
    const htmlPath = `${routePath}index.html`
    const html = await readDist(htmlPath)
    const meta = getRouteMeta(locale, view)
    const canonical = absolute(getWorkPath(view, locale, '/'))
    const enUrl = absolute(getWorkPath(view, 'en', '/'))
    const ruUrl = absolute(getWorkPath(view, 'ru', '/'))
    const markdownUrl = absolute(getMarkdownPath(view, locale, '/'))
    const llmsUrl = absolute(getLlmsPath(locale, '/'))

    assert(html, `missing HTML for ${canonical}`)
    if (!html) continue

    assert(html.includes(`<html lang="${locale}">`), `${canonical}: html lang must be ${locale}`)
    assert(
      html.includes(`<title>${escapeHtml(meta.title)}</title>`),
      `${canonical}: title mismatch`,
    )
    assert(
      html.includes('<meta name="description" content="'),
      `${canonical}: missing meta description`,
    )
    assert(
      html.includes(`<link rel="canonical" href="${canonical}">`),
      `${canonical}: missing canonical link`,
    )
    assert(
      html.includes(`<link rel="alternate" hreflang="en" href="${enUrl}">`),
      `${canonical}: missing en hreflang`,
    )
    assert(
      html.includes(`<link rel="alternate" hreflang="ru" href="${ruUrl}">`),
      `${canonical}: missing ru hreflang`,
    )
    assert(
      html.includes(`<link rel="alternate" hreflang="x-default" href="${enUrl}">`),
      `${canonical}: missing x-default hreflang`,
    )
    assert(
      html.includes(`<link rel="alternate" type="text/markdown" href="${markdownUrl}"`),
      `${canonical}: missing markdown alternate link`,
    )
    assert(
      html.includes(`<link rel="describedby" href="${llmsUrl}" type="text/plain">`),
      `${canonical}: missing llms.txt describedby link`,
    )
    assert(!html.includes('id="text-representations"'), `${canonical}: contains hidden crawler navigation`)
    assert(!html.includes('localhost'), `${canonical}: contains a localhost URL`)
    assert(
      html.includes('application/ld+json'),
      `${canonical}: missing JSON-LD`,
    )

    const jsonLdMatch = html.match(
      /<script type="application\/ld\+json" data-jsonld>([\s\S]*?)<\/script>/,
    )
    assert(jsonLdMatch, `${canonical}: missing data-jsonld script`)
    if (jsonLdMatch) {
      try {
        const parsed = JSON.parse(jsonLdMatch[1])
        assert(
          parsed['@context'] === 'https://schema.org',
          `${canonical}: JSON-LD context must be schema.org`,
        )
        const types = (parsed['@graph'] ?? []).map((node) => node['@type'])
        assert(types.includes('Person'), `${canonical}: JSON-LD missing Person`)
        assert(types.includes('WebSite'), `${canonical}: JSON-LD missing WebSite`)
        const person = (parsed['@graph'] ?? []).find((node) => node['@type'] === 'Person')
        assert(person?.['@id'] === absolute('#person'), `${canonical}: unstable Person identifier`)
        const page = (parsed['@graph'] ?? []).find((node) =>
          ['ProfilePage', 'CollectionPage', 'CreativeWork'].includes(node['@type']),
        )
        assert(page?.url === canonical, `${canonical}: JSON-LD page URL differs from canonical`)
        if (view.kind === 'overview') {
          assert(types.includes('ProfilePage'), `${canonical}: JSON-LD missing ProfilePage`)
        } else if (view.kind === 'client-index') {
          assert(
            types.includes('CollectionPage'),
            `${canonical}: JSON-LD missing CollectionPage`,
          )
        } else {
          assert(types.includes('CreativeWork'), `${canonical}: JSON-LD missing CreativeWork`)
        }
      } catch (error) {
        fail(`${canonical}: JSON-LD is not valid JSON: ${error.message}`)
      }
    }

    const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1])
    assert(new Set(ids).size === ids.length, `${canonical}: duplicate id attributes`)
    const h1Count = (html.match(/<h1\b/g) ?? []).length
    assert(h1Count === 1, `${canonical}: expected exactly one h1, found ${h1Count}`)
    assert(
      /<nav[^>]*aria-label="[^"]+"/.test(html),
      `${canonical}: navigation without aria-label`,
    )

    const rootMarkup = html.match(/<div id="root">([\s\S]*)<\/div>\s*<\/body>/)?.[1] ?? ''
    const visibleText = normalizedText(rootMarkup)
    if (view.kind === 'case' && view.id === 'midnight-persona') {
      for (const chapter of MIDNIGHT_CONTENT[locale]) {
        for (const value of [chapter.title, chapter.id === 'product' ? '' : chapter.subtitle]) {
          if (value) assert(visibleText.includes(normalizedText(value)), `${canonical}: static HTML missing ${value}`)
        }
        for (const block of chapter.blocks) {
          if (
            block.kind === 'media-reference' ||
            (block.kind === 'paragraph' && (block.notice || block.interaction))
          ) continue
          assert(
            visibleText.includes(normalizedText(block.text)),
            `${canonical}: static HTML missing Midnight Persona ${block.kind}: ${block.text.slice(0, 80)}`,
          )
        }
      }
      const interactionBlocks = MIDNIGHT_CONTENT[locale].flatMap((chapter) =>
        chapter.blocks.filter((block) => block.kind === 'paragraph' && block.interaction),
      )
      for (const interaction of interactionBlocks) {
        const blockText = normalizedText(interaction.text)
        assert(blockText.length > 0 && visibleText.includes(blockText.slice(0, 48)), `${canonical}: static HTML missing interactive paragraph`)
      }
    }
    if (view.kind === 'client-index') {
      for (const block of LEADFLOW_SOURCE[locale].trim().split(/\n\s*\n/)) {
        const expected = normalizedText(block.replace(/^#+\s*/, ''))
        assert(visibleText.includes(expected), `${canonical}: static HTML missing LeadFlowAI content`)
      }
    }
  }
}

// --- Markdown pages -------------------------------------------------------
const requiredMarkdown = {
  overview: {
    en: [
      'Nikolai Sekushenko',
      'Midnight Persona',
      'E-commerce Operations & Growth',
      'A Career Built Around Systems',
      'The Rzhanov Institute in Siberia',
      'Supplying the State',
      'shenko.nik@gmail.com',
      'https://github.com/thaelr',
    ],
    ru: [
      'Николай Секушенко',
      'Midnight Persona',
      'Управление и развитие e-commerce',
      'Карьера, построенная вокруг систем',
      'Институт Ржанова в Сибири',
      'Поставки государству',
      'shenko.nik@gmail.com',
      'https://github.com/thaelr',
    ],
  },
  'midnight-persona': {
    en: [
      'Under the Hood',
      'The model writes The engine controls',
      'GitHub / EngageFlowAI',
      '16,000 photos and 500 videos',
      'Fogged-up glass with finger marks',
      'Architecture diagram',
    ],
    ru: [
      'Под капотом',
      'Модель пишет. Движок управляет.',
      'GitHub / EngageFlowAI',
      '16 000 фотографий и 500 видео',
      'Запотевшее стекло со следами пальцев',
      'Схема архитектуры',
    ],
  },
  ecommerce: {
    en: ['Rebuilt the operational foundation', '$1.5M', 'Wow'],
    ru: ['Перестроил инфраструктуру магазина', '$1,5 млн', 'Вау'],
  },
  'client-work': {
    en: ['LeadFlowAI', 'GitHub / LeadFlowAI', 'Booking Inside WhatsApp'],
    ru: ['LeadFlowAI', 'GitHub / LeadFlowAI', 'Запись внутри WhatsApp'],
  },
}

for (const locale of locales) {
  for (const view of views) {
    const markdownPath = getMarkdownPath(view, locale, '/').replace(/^\//, '')
    const markdown = await readDist(markdownPath)
    assert(markdown, `missing markdown for ${getWorkPath(view, locale, '/')}`)
    if (!markdown) continue

    assert(
      markdown === getPageMarkdown(locale, view, siteUrl),
      `${markdownPath} differs from the current content model`,
    )
    assert(
      markdown.includes(`Canonical source`) || markdown.includes(`Канонический источник`),
      `${markdownPath} missing canonical source URL`,
    )

    for (const needle of requiredMarkdown[viewKey(view)][locale]) {
      assert(
        markdown.includes(needle),
        `${markdownPath} missing ${JSON.stringify(needle)}`,
      )
    }
    assert(!markdown.includes('[object Object]'), `${markdownPath} contains [object Object]`)
    assert(!/\bundefined\b/.test(markdown), `${markdownPath} contains undefined`)
    assert(!markdown.includes('localhost'), `${markdownPath} contains a localhost URL`)
    await assertInternalMarkdownTargets(markdown, markdownPath)
  }
}

// --- llms.txt / llms-full.txt --------------------------------------------
for (const locale of locales) {
  const llmsPath = getLlmsPath(locale, '/').replace(/^\//, '')
  const llmsFullPath = getLlmsFullPath(locale, '/').replace(/^\//, '')
  const llms = await readDist(llmsPath)
  const llmsFull = await readDist(llmsFullPath)

  assert(llms, `missing ${llmsPath}`)
  assert(llmsFull, `missing ${llmsFullPath}`)

  if (llms) {
    assert(llms === getLlmsIndex(locale, siteUrl), `${llmsPath} differs from the current content model`)
    for (const view of views) {
      const markdownUrl = absolute(getMarkdownPath(view, locale, '/'))
      assert(
        llms.includes(markdownUrl),
        `${llmsPath} missing markdown link ${markdownUrl}`,
      )
    }
  }

  if (llmsFull) {
    assert(llmsFull === getLlmsFull(locale, siteUrl), `${llmsFullPath} differs from the current content model`)
    assert(
      llmsFull.includes(getRouteMeta(locale, { kind: 'overview' }).name),
      `${llmsFullPath} missing the overview page`,
    )
    assert(
      llmsFull.includes('Midnight Persona'),
      `${llmsFullPath} missing Midnight Persona`,
    )
    const legacy = absolute(getLegacyLeadflowPath(locale, '/'))
    assert(!llms.includes(legacy), `${llmsPath} contains the legacy LeadFlowAI route`)
    assert(!llmsFull.includes(legacy), `${llmsFullPath} contains the legacy LeadFlowAI route`)
    assert(!llmsFull.includes('Generated from'), `${llmsFullPath} contains a build-time date line`)
  }
}

// --- legacy LeadFlowAI compatibility --------------------------------------
for (const locale of locales) {
  const legacyPath = getLegacyLeadflowPath(locale, '/').replace(/^\//, '')
  const legacyUrl = absolute(getLegacyLeadflowPath(locale, '/'))
  const redirectTarget = getWorkPath({ kind: 'client-index' }, locale, '/')
  const canonical = absolute(getWorkPath({ kind: 'client-index' }, locale, '/'))
  const html = await readDist(`${legacyPath}index.html`)
  assert(html, `missing compatibility redirect for ${legacyUrl}`)
  if (html) {
    assert(html.includes('<meta name="robots" content="noindex, follow">'), `${legacyUrl}: missing noindex`)
    assert(html.includes(`<link rel="canonical" href="${canonical}">`), `${legacyUrl}: wrong canonical`)
    assert(html.includes(`http-equiv="refresh" content="0; url=${redirectTarget}"`), `${legacyUrl}: missing redirect`)
  }
  assert(!(await readDist(`${legacyPath}index.md`)), `${legacyUrl}: legacy Markdown export must not exist`)
}

// --- IndexNow key ---------------------------------------------------------
const distFiles = await readdir(distDir)
const keyFile = distFiles.find((name) => /^[a-f0-9]{32}\.txt$/.test(name))
assert(keyFile, 'IndexNow key file is missing from dist')
if (keyFile) {
  const key = keyFile.replace(/\.txt$/, '')
  const keyContent = await readDist(keyFile)
  assert(
    keyContent?.trim() === key,
    'IndexNow key file content must match its filename',
  )
}

// --- result ---------------------------------------------------------------
if (failures.length > 0) {
  console.error(`verify-build: ${failures.length} failure(s)`)
  for (const failure of failures) console.error(`- ${failure}`)
  process.exit(1)
}

console.log(
  `verify-build: OK — ${views.length * locales.length} routes, sitemap, robots, ` +
    'markdown, llms.txt, JSON-LD, accessibility landmarks and IndexNow key',
)
