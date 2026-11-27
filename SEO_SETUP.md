# SEO and AI-readability setup

This document covers the generated discovery resources, the production checks, and the
manual steps needed in Google Search Console, Bing Webmaster Tools, and IndexNow.

## What the build generates

`npm run build` (or `pnpm build`) runs the normal Vite build, the SSR build, prerendering,
discovery generation, and verification. After a successful build `dist/` contains:

- `robots.txt` — allows search engines and the major AI crawlers, and points to the sitemap.
- `sitemap.xml` — all ten canonical EN/RU routes with `hreflang` alternates.
- `index.md`, `work/*/index.md`, `ru/index.md`, `ru/work/*/index.md` — Markdown
  representations of every route.
- `llms.txt`, `llms-full.txt`, `ru/llms.txt`, `ru/llms-full.txt` — machine-readable
  indexes and full text for language models.
- `<indexnow-key>.txt` — copied from `public/`; the IndexNow ownership proof.

Every prerendered HTML document also gets:

- `<link rel="alternate" type="text/markdown" href="…/index.md">`;
- a visually hidden but crawlable link to the Markdown version and `llms.txt`;
- JSON-LD (`Person`, `WebSite`, plus `ProfilePage`, `CollectionPage`, or `CreativeWork`);
- `robots` metadata allowing indexing and large image previews.

The generated files are written at build time, not committed to `public/` (the IndexNow
key file is the exception). Rebuild and redeploy after changing content.

## Local verification

Use the production origin so generated absolute URLs are meaningful:

```bash
SITE_URL=https://thaelr.com/ npm run build
```

The build fails if a route, metadata tag, JSON-LD block, Markdown page, `llms.txt` file,
sitemap entry, or the IndexNow key is missing. To re-run only the checks:

```bash
SITE_URL=https://thaelr.com/ npm run verify:build
```

To inspect the result locally:

```bash
npx vite preview
```

Then open `http://localhost:4173/`, `/robots.txt`, `/sitemap.xml`, `/llms.txt`, and
`/work/midnight-persona/index.md`.

## Google Search Console

1. Open <https://search.google.com/search-console>.
2. Add a **Domain** property for `thaelr.com` (recommended) or a **URL prefix** property
   for `https://thaelr.com/`.
3. Verify ownership. For a Domain property, add the DNS TXT record Google provides.
   For a URL-prefix property on GitHub Pages, the HTML file or meta-tag method also works.
4. After verification, open **Sitemaps** and submit:

   ```text
   https://thaelr.com/sitemap.xml
   ```

5. Use **URL Inspection** for the key routes and click **Request indexing**:
   - `https://thaelr.com/`
   - `https://thaelr.com/work/midnight-persona/`
   - `https://thaelr.com/work/ecommerce/`
   - `https://thaelr.com/work/client-work/`
   - `https://thaelr.com/work/client-work/leadflowai/`
   - the same five URLs under `/ru/`.
6. Check **Pages** after a few days for indexing status and any manual actions.

Google may take days or weeks to crawl and index a new site. The sitemap submission does
not force immediate indexing.

## Bing Webmaster Tools

1. Open <https://www.bing.com/webmasters>.
2. Add `https://thaelr.com/`.
3. Verify ownership. You can import the site from Google Search Console, or use the DNS
   TXT / XML file / meta-tag method.
4. Open **Sitemaps** and submit `https://thaelr.com/sitemap.xml`.
5. Open **URL Submission** and submit the ten canonical URLs if you want to request
   crawling immediately.
6. Confirm the IndexNow key is reachable at:

   ```text
   https://thaelr.com/6f8e74037ad7c3c12b915ccd36367e73.txt
   ```

   The file must contain exactly the key (the filename without `.txt`).

## IndexNow

The repository contains a public IndexNow key file:

```text
public/6f8e74037ad7c3c12b915ccd36367e73.txt
```

IndexNow keys are public ownership proofs, not secrets. The filename and the file content
must match. To rotate the key, generate 32 lowercase hex characters, replace the file, and
update the key name in this document if you keep a copy here.

The GitHub Actions workflow runs `scripts/indexnow.mjs` in a separate `indexnow` job after
the GitHub Pages deployment succeeds. The script:

1. finds the single `public/<32-hex>.txt` key file (or uses `INDEXNOW_KEY`);
2. reads the deployed `https://thaelr.com/sitemap.xml` (with retries for CDN propagation);
3. submits every `<loc>` URL to `https://api.indexnow.org/indexnow`.

To run it manually after a deployment:

```bash
SITE_URL=https://thaelr.com/ node scripts/indexnow.mjs
```

IndexNow is supported by Bing, Yandex, Seznam, and other engines. It does not replace
Google Search Console.

## ChatGPT and other AI agents

The site is reachable over HTTP and the text representations are public. A ChatGPT web
tool returning `DisabledError` is not evidence that the site is down: it usually means the
tool or browsing capability is unavailable for that account, region, or request, or that
the content triggered a policy restriction. Verify availability independently:

```bash
curl -I https://thaelr.com/
curl -s https://thaelr.com/llms.txt | head
curl -s https://thaelr.com/work/midnight-persona/index.md | head
```

If a specific agent cannot open the HTML, point it at `/llms.txt` or the page-level
`index.md`. Those files contain the same authorial text without client-side JavaScript.

## What is intentionally not changed

The build additions do not change the visual design, typography, animations, routes,
product copy, metrics, images, DNS, or hosting. The hidden text links use a
`.visually-hidden` utility and are not visible in normal browsing.
