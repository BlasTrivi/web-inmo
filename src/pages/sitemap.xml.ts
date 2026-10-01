import type { APIRoute } from 'astro';
import { SITE, absoluteUrl } from '../config/site';
import { projects, projectPath } from '../data/projects';

/**
 * /sitemap.xml propio (también existe el sitemap-index.xml que genera @astrojs/sitemap en el build).
 * Las páginas de error (404/500) quedan fuera.
 */
export const GET: APIRoute = () => {
  const urls = [
    { loc: absoluteUrl('/'), priority: '1.0', changefreq: 'monthly' },
    ...projects.map((p) => ({
      loc: absoluteUrl(projectPath(p.slug)),
      priority: p.status === 'launch' || p.status === 'last-units' || p.status === 'upcoming' ? '0.9' : '0.7',
      changefreq: 'monthly',
    })),
  ];
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${SITE.lastModified}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`,
  )
  .join('\n')}
</urlset>
`;
  return new Response(body, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
