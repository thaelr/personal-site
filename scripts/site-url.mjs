// Shared public base URL resolution for prerender and discovery generation.
import { readFile } from 'node:fs/promises'
import path from 'node:path'

function ensureTrailingSlash(value) {
  return value.endsWith('/') ? value : `${value}/`
}

export async function resolveSiteUrl(root) {
  if (process.env.SITE_URL) return ensureTrailingSlash(process.env.SITE_URL)
  if (process.env.GITHUB_ACTIONS === 'true' && process.env.GITHUB_REPOSITORY) {
    const [owner, repository] = process.env.GITHUB_REPOSITORY.split('/')
    return `https://${owner}.github.io/${repository}/`
  }

  const siteConfig = JSON.parse(
    await readFile(path.join(root, '.figma/make/site.json'), 'utf8'),
  )
  const socialImage = siteConfig.openGraph?.image
  if (socialImage) return ensureTrailingSlash(socialImage.replace(/[^/]+$/, ''))
  return 'http://localhost:8443/'
}
