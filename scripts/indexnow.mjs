// Submits the deployed sitemap URLs to IndexNow after a successful deployment.
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

async function fetchSitemapUrls() {
  const sitemapUrl = new URL('sitemap.xml', siteUrl).href
  let lastError = null

  for (let attempt = 1; attempt <= 5; attempt += 1) {
    try {
      const response = await fetch(sitemapUrl, { headers: { accept: 'application/xml' } })
      if (!response.ok) throw new Error(`HTTP ${response.status}`)

      const xml = await response.text()
      const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1])
      if (urls.length === 0) throw new Error('sitemap has no <loc> entries')
      return urls
    } catch (error) {
      lastError = error
      console.warn(`indexnow: sitemap attempt ${attempt} failed: ${error.message}`)
      if (attempt < 5) {
        await new Promise((resolve) => setTimeout(resolve, 10_000))
      }
    }
  }

  throw new Error(`indexnow: could not read ${sitemapUrl}: ${lastError?.message ?? 'unknown error'}`)
}

const key = await findKey()
if (!key) {
  console.log('indexnow: no key file found in public/; skipping submission')
  process.exit(0)
}

const urlList = await fetchSitemapUrls()
const keyLocation = new URL(`${key}.txt`, siteUrl).href
const response = await fetch('https://api.indexnow.org/indexnow', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
  body: JSON.stringify({ host, key, keyLocation, urlList }),
})

if (!response.ok) {
  const body = await response.text().catch(() => '')
  console.error(`indexnow: submission failed with HTTP ${response.status}${body ? `: ${body}` : ''}`)
  process.exit(1)
}

console.log(`indexnow: submitted ${urlList.length} URLs for ${host} (HTTP ${response.status})`)
