// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { SITE, SITE_URL } from './src/config/site.ts';

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
      filter: (page) => !/\/(404|500)\/?$/.test(page),
      lastmod: new Date(SITE.lastModified),
      changefreq: 'monthly',
    }),
  ],
  image: {
    // Las fotos originales ya vienen a 2x; el resize/AVIF/WebP se hace en build.
    service: { entrypoint: 'astro/assets/services/sharp', config: { limitInputPixels: false } },
  },
});
