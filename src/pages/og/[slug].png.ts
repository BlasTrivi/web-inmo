import type { APIRoute, GetStaticPaths } from 'astro';
import { projects } from '../../data/projects';
import { SITE } from '../../config/site';
import { renderOg } from '../../lib/og';

export const getStaticPaths = (() => [
  { params: { slug: 'default' } },
  ...projects.map((p) => ({ params: { slug: p.slug } })),
]) satisfies GetStaticPaths;

export const GET: APIRoute = async ({ params }) => {
  const project = projects.find((p) => p.slug === params.slug);
  const png = project
    ? await renderOg({ image: project.hero.image, title: project.name, subtitle: project.ogTagline })
    : await renderOg({
        image: 'address_pool.webp',
        title: SITE.tagline,
        subtitle: 'Asunción, Paraguay · 2016–2026',
        footer: `${SITE.name} · ${SITE.url.replace(/^https?:\/\//, '')}`,
      });
  return new Response(new Uint8Array(png), {
    headers: { 'Content-Type': 'image/png', 'Cache-Control': 'public, max-age=31536000, immutable' },
  });
};
