// Production-build verification for routes, metadata, discovery resources and text.
import { readFile, readdir } from 'node:fs/promises'
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
  getRouteMeta,
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

function viewKey(view) {
  if (view.kind === 'overview') return 'overview'
  if (view.kind === 'client-index') return 'client-work'
  if (view.kind === 'client-case') return 'leadflowai'
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
  for (const agent of ['GPTBot', 'ClaudeBot', 'PerplexityBot', 'Google-Extended']) {
    assert(robots.includes(agent), `robots.txt must mention ${agent}`)
  }
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

for (const locale of locales) {
  for (const view of views) {
    const canonical = absolute(getWorkPath(view, locale, '/'))
    const enUrl = absolute(getWorkPath(view, 'en', '/'))
    const ruUrl = absolute(getWorkPath(view, 'ru', '/'))
    assert(locs.includes(canonical), `sitemap.xml missing ${canonical}`)
    if (sitemap) {
      assert(
        sitemap.includes(`hreflang="en" href="${enUrl}"`),
        `sitemap.xml missing en alternate for ${canonical}`,
      )
      assert(
        sitemap.includes(`hreflang="ru" href="${ruUrl}"`),
        `sitemap.xml missing ru alternate for ${canonical}`,
      )
      assert(
        sitemap.includes(`hreflang="x-default" href="${enUrl}"`),
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
      html.includes(`href="${getLlmsPath(locale, '/')}"`),
      `${canonical}: missing llms.txt link`,
    )
    assert(
      html.includes('id="text-representations"'),
      `${canonical}: missing hidden text representation nav`,
    )
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
      'The model writes. The engine controls.',
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
  leadflowai: {
    en: ['LeadFlowAI', 'FREE-FORM CUSTOMER INPUT', 'Conversational automation'],
    ru: ['LeadFlowAI', 'СВОБОДНЫЙ ВВОД КЛИЕНТА', 'Разговорная автоматизация'],
  },
}

for (const locale of locales) {
  for (const view of views) {
    const markdownPath = getMarkdownPath(view, locale, '/').replace(/^\//, '')
    const markdown = await readDist(markdownPath)
    assert(markdown, `missing markdown for ${getWorkPath(view, locale, '/')}`)
    if (!markdown) continue

    for (const needle of requiredMarkdown[viewKey(view)][locale]) {
      assert(
        markdown.includes(needle),
        `${markdownPath} missing ${JSON.stringify(needle)}`,
      )
    }
    assert(!markdown.includes('[object Object]'), `${markdownPath} contains [object Object]`)
    assert(!/\bundefined\b/.test(markdown), `${markdownPath} contains undefined`)
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
    for (const view of views) {
      const markdownUrl = absolute(getMarkdownPath(view, locale, '/'))
      assert(
        llms.includes(markdownUrl),
        `${llmsPath} missing markdown link ${markdownUrl}`,
      )
    }
  }

  if (llmsFull) {
    assert(
      llmsFull.includes(getRouteMeta(locale, { kind: 'overview' }).name),
      `${llmsFullPath} missing the overview page`,
    )
    assert(
      llmsFull.includes('Midnight Persona'),
      `${llmsFullPath} missing Midnight Persona`,
    )
  }
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
