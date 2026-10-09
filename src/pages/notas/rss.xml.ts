import type { APIRoute } from 'astro';
import { SITE, absoluteUrl } from '../../config/site';
import { notaUrl, realNotas } from '../../lib/notas';

/** RSS de Notas: solo notas reales (sin borradores ni notas de ejemplo). */
const esc = (s: string): string =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export const GET: APIRoute = async () => {
  const notas = await realNotas();
  const items = notas
    .map(
      (n) => `    <item>
      <title>${esc(n.data.title)}</title>
      <link>${notaUrl(n)}</link>
      <guid isPermaLink="true">${notaUrl(n)}</guid>
      <pubDate>${n.data.date.toUTCString()}</pubDate>
      <description>${esc(n.data.description)}</description>
${n.data.tags.map((t) => `      <category>${esc(t)}</category>`).join('\n')}
    </item>`,
    )
    .join('\n');
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Notas · ${esc(SITE.name)}</title>
    <link>${absoluteUrl('/notas/')}</link>
    <description>${esc('Notas de INMO Desarrollos: guías, novedades y proyectos en Asunción.')}</description>
    <language>${SITE.lang}</language>
    <atom:link href="${absoluteUrl('/notas/rss.xml')}" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>
`;
  return new Response(body, { headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' } });
};
