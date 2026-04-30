/**
 * Post-build script that generates static HTML pages for each blog article
 * with proper Open Graph meta tags for social media previews.
 *
 * Reads the webpack-built index.html, fetches all articles from Prismic,
 * and creates a copy per article at build/blog/<uid>/index.html with
 * article-specific OG tags. Firebase Hosting serves these files directly
 * for crawlers, while in-app navigation remains client-side.
 */

import { createClient, asText } from '@prismicio/client';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';

const apiEndpoint = process.env.PRISMIC_API_ENDPOINT;
if (!apiEndpoint) {
  console.error('PRISMIC_API_ENDPOINT is not set, skipping blog page generation');
  process.exit(0);
}

const buildDir = join(process.cwd(), 'build');
const indexPath = join(buildDir, 'index.html');

async function main() {
  // Read the webpack-built index.html
  const indexHtml = await readFile(indexPath, 'utf-8');

  const client = createClient(apiEndpoint!);

  // Fetch articles for both locales
  const locales = ['en-ca', 'fr-ca'];
  const articles = new Map<string, { title: string; description: string; image: string }>();

  for (const lang of locales) {
    const docs = await client.getAllByType('article', { lang });
    for (const doc of docs) {
      const uid = doc.uid;
      if (!uid) continue;
      // Skip if we already have this uid (en takes priority)
      if (articles.has(uid)) continue;

      const title = doc.data.meta_title ?? asText(doc.data.title) ?? '';
      const description = doc.data.meta_description ?? asText(doc.data.short_content) ?? '';
      const image = doc.data.meta_image?.url || doc.data.thumbnail?.url || '';

      articles.set(uid, { title, description, image });
    }
  }

  console.log(`Generating OG pages for ${articles.size} blog articles...`);

  for (const [uid, meta] of articles) {
    const html = injectOgTags(indexHtml, meta.title, meta.description, meta.image);
    const dir = join(buildDir, 'blog', uid);
    await mkdir(dir, { recursive: true });
    await writeFile(join(dir, 'index.html'), html);
  }

  console.log('Blog OG pages generated successfully.');
}

function injectOgTags(html: string, title: string, description: string, image: string): string {
  // Escape HTML entities in meta content
  const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  let result = html;

  // Replace existing OG tags
  result = result.replace(/<meta property="og:title"[^>]*>/, `<meta property="og:title" content="${esc(title)}">`);
  result = result.replace(/<meta property="og:description"[^>]*>/, `<meta property="og:description" content="${esc(description)}">`);
  result = result.replace(/<meta property="og:type"[^>]*>/, '<meta property="og:type" content="article">');
  result = result.replace(/<meta name="twitter:card"[^>]*>/, `<meta name="twitter:card" content="summary_large_image">`);

  // Add og:image and twitter tags if not already present
  if (image) {
    // Insert og:image after og:type
    if (!result.includes('og:image')) {
      result = result.replace(
        /(<meta property="og:type"[^>]*>)/,
        `$1<meta property="og:image" content="${esc(image)}">`
      );
    }
  }

  // Add twitter tags if not present
  if (!result.includes('twitter:title')) {
    result = result.replace(
      /(<meta name="twitter:card"[^>]*>)/,
      `$1<meta name="twitter:title" content="${esc(title)}"><meta name="twitter:description" content="${esc(description)}">${image ? `<meta name="twitter:image" content="${esc(image)}">` : ''}`
    );
  }

  // Replace the page title
  result = result.replace(/<title>[^<]*<\/title>/, `<title>${esc(title)} | TheCoin</title>`);

  // Replace the meta description
  result = result.replace(
    /<meta name="description"[^>]*>/,
    `<meta name="description" content="${esc(description)}">`
  );

  return result;
}

main().catch(err => {
  console.error('Failed to generate blog pages:', err);
  process.exit(1);
});
