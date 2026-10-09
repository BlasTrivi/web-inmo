import type { APIRoute, GetStaticPaths } from 'astro';
import { SITE } from '../../../config/site';
import { hasImage } from '../../../lib/images';
import { formatDate, realNotas } from '../../../lib/notas';
import { renderOg } from '../../../lib/og';

// Imagen Open Graph de cada nota real (las de ejemplo usan la imagen general)
export const getStaticPaths = (async () => {
  const notas = await realNotas();
  return notas.map((nota) => ({ params: { slug: nota.id }, props: { nota } }));
}) satisfies GetStaticPaths;

export const GET: APIRoute = async ({ props }) => {
  const d = props.nota.data;
  const png = await renderOg({
    image: hasImage(d.cover) ? d.cover : 'address_pool.webp',
    title: d.title,
    subtitle: formatDate(d.date),
    footer: `${SITE.name} · Notas`,
  });
  return new Response(new Uint8Array(png), {
    headers: { 'Content-Type': 'image/png', 'Cache-Control': 'public, max-age=31536000, immutable' },
  });
};
