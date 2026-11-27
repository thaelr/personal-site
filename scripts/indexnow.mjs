// Manually submits only explicitly changed deployed URLs to IndexNow.
import { readFile, readdir } from 'node:fs/promises'
import path from 'node:path'

const root = process.cwd()
const siteUrl = (process.env.SITE_URL || 'https://thaelr.com/').replace(/\/?$/, '/')
const host = new URL(siteUrl).host
const publicDir = path.join(root, 'public')

async function findKey() {
  if (process.env.INDEXNOW_KEY) return process.env.INDEXNOW_KEY.trim()

  const files = await readdir(publicDir)
  const candidates = files.filter((name) => /^[a-f0-9]{32}\.txt$/.test(name))
  if (candidates.length === 0) return null
  if (candidates.length > 1) {
    throw new Error(`indexnow: expected one key file in public/, found ${candidates.length}`)
  }

  const fileName = candidates[0]
  const key = fileName.replace(/\.txt$/, '')
  const content = (await readFile(path.join(publicDir, fileName), 'utf8')).trim()
  if (content !== key) {
    throw new Error(`indexnow: ${fileName} must contain its own filename`)
  }
  return key
}

function getChangedUrls() {
  const input = process.env.INDEXNOW_URLS || process.argv.slice(2).join(',')
  const values = input.split(/[\s,]+/).map((value) => value.trim()).filter(Boolean)
  const urls = [...new Set(values.map((value) => new URL(value, siteUrl).href))]
  for (const url of urls) {
    if (new URL(url).host !== host) {
      throw new Error(`indexnow: URL must use ${host}: ${url}`)
    }
  }
  if (urls.length > 10_000) throw new Error('indexnow: at most 10,000 URLs may be submitted')
  return urls
}

const key = await findKey()
if (!key) {
  console.log('indexnow: no key file found in public/; skipping submission')
  process.exit(0)
}

const urlList = getChangedUrls()
if (urlList.length === 0) {
  console.log('indexnow: no changed URLs supplied; skipping submission')
  process.exit(0)
}
const keyLocation = new URL(`${key}.txt`, siteUrl).href
let response
for (let attempt = 1; attempt <= 3; attempt += 1) {
  try {
    response = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({ host, key, keyLocation, urlList }),
      signal: AbortSignal.timeout(15_000),
    })
  } catch (error) {
    if (attempt === 3) throw new Error(`indexnow: network failure: ${error.message}`)
    const delay = attempt * 2_000
    console.warn(`indexnow: network failure; retrying in ${delay / 1000}s`)
    await new Promise((resolve) => setTimeout(resolve, delay))
    continue
  }
  if (response.ok) break
  const retryable = response.status === 429 || response.status >= 500
  if (!retryable || attempt === 3) {
    const body = await response.text().catch(() => '')
    throw new Error(`indexnow: submission failed with HTTP ${response.status}${body ? `: ${body}` : ''}`)
  }
  const retryAfter = Number(response.headers.get('retry-after'))
  const delay = Number.isFinite(retryAfter) ? Math.min(retryAfter * 1000, 30_000) : attempt * 2_000
  console.warn(`indexnow: HTTP ${response.status}; retrying in ${delay / 1000}s`)
  await new Promise((resolve) => setTimeout(resolve, delay))
}

console.log(`indexnow: submitted ${urlList.length} URLs for ${host} (HTTP ${response.status})`)
