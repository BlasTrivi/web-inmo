// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import fs from 'node:fs';
import { SITE, SITE_URL } from './src/config/site.ts';

// Notas de ejemplo / borrador (frontmatter `ejemplo: true` o `draft: true`): no entran en el sitemap-index.
// Si no hay ninguna nota real, tampoco el listado /notas/ (queda noindex).
const notasDir = new URL('./src/content/notas/', import.meta.url);
const notas = fs.existsSync(notasDir)
  ? fs
      .readdirSync(notasDir)
      .filter((f) => f.endsWith('.md'))
      .map((f) => {
        const raw = fs.readFileSync(new URL(f, notasDir), 'utf8');
        const end = raw.indexOf('---', 3);
        const fm = raw.startsWith('---') && end > 0 ? raw.slice(3, end) : '';
        return { slug: f.replace(/\.md$/, ''), hidden: /^(ejemplo|draft):\s*true\s*$/m.test(fm) };
      })
  : [];
const hiddenNotas = new Set(notas.filter((n) => n.hidden).map((n) => n.slug));
const hasRealNotas = notas.some((n) => !n.hidden);

// https://astro.build/config
export default defineConfig({
  site: SITE_URL,
  output: 'static',
  trailingSlash: 'always',
  build: {
    format: 'directory',
    // El CSS crítico de este sitio es chico: se incrusta en cada HTML (sin request bloqueante extra).
    inlineStylesheets: 'always',
  },
  compressHTML: true,
  prefetch: false,
  devToolbar: { enabled: false },
  integrations: [
    sitemap({
      // No indexar páginas de error. /sitemap.xml lo sirve un endpoint propio (src/pages/sitemap.xml.ts).
      filter: (page) => {
        if (/\/(404|500)\/?$/.test(page)) return false;
        const m = /\/notas\/([^/]*)\/?$/.exec(page);
        if (m) return m[1] === '' ? hasRealNotas : !hiddenNotas.has(m[1]);
        return true;
      },
      lastmod: new Date(SITE.lastModified),
      changefreq: 'monthly',
    }),
  ],
  image: {
    // Las fotos originales ya vienen a 2x; el resize/AVIF/WebP se hace en build.
    service: { entrypoint: 'astro/assets/services/sharp', config: { limitInputPixels: false } },
  },
});
