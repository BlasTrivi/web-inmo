import type { APIRoute } from 'astro';
import { SITE } from '../config/site';

export const GET: APIRoute = () => {
  const manifest = {
    name: `${SITE.name} · ${SITE.tagline}`,
    short_name: SITE.name,
    description: SITE.description,
    lang: SITE.lang,
    dir: 'ltr',
    id: '/',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    orientation: 'any',
    background_color: '#000000',
    theme_color: SITE.themeColor,
    categories: ['business', 'lifestyle'],
    icons: [
      { src: '/favicon-64.png', sizes: '64x64', type: 'image/png', purpose: 'any' },
      { src: '/favicon-180.png', sizes: '180x180', type: 'image/png', purpose: 'any' },
      { src: '/favicon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/favicon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
  return new Response(JSON.stringify(manifest, null, 2), {
    headers: { 'Content-Type': 'application/manifest+json; charset=utf-8' },
  });
};
