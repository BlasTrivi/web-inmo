import type { APIRoute } from 'astro';
import { SITE, absoluteUrl } from '../config/site';
import { projects, projectPath } from '../data/projects';
import { legalList } from '../data/legal';
import { isoDate, notaPath, realNotas } from '../lib/notas';

/**
 * /sitemap.xml propio (también existe el sitemap-index.xml que genera @astrojs/sitemap en el build).
 * Las páginas de error (404/500) quedan fuera.
 */
export const GET: APIRoute = async () => {
  // solo notas reales: las de ejemplo y los borradores no entran
  const notas = await realNotas();
  const urls: { loc: string; priority: string; changefreq: string; lastmod?: string }[] = [
    { loc: absoluteUrl('/'), priority: '1.0', changefreq: 'monthly' },
    ...projects.map((p) => ({
      loc: absoluteUrl(projectPath(p.slug)),
      priority: p.status === 'launch' || p.status === 'last-units' || p.status === 'upcoming' ? '0.9' : '0.7',
      changefreq: 'monthly',
    })),
    ...legalList.map((d) => ({ loc: absoluteUrl(d.path), priority: '0.3', changefreq: 'yearly' })),
    ...(notas.length
      ? [
          { loc: absoluteUrl('/notas/'), priority: '0.6', changefreq: 'weekly' },
          ...notas.map((n) => ({ loc: absoluteUrl(notaPath(n)), priority: '0.6', changefreq: 'monthly', lastmod: isoDate(n.data.date) })),
        ]
      : []),
  ];
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${u.lastmod ?? SITE.lastModified}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`,
  )
  .join('\n')}
</urlset>
`;
  return new Response(body, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
