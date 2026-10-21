/**
 * Versión compacta de la página de un proyecto 100% vendido (`stock: 'agotado'`).
 * Parte de los mismos fragmentos HTML de `src/content/projects/<slug>/` y los recorta:
 * sin niveles, showroom ni barra "Consultar" (se quita `data-ctx`).
 */
import { parse } from 'node-html-parser';
import type { NavItem } from '../data/projects';

/** Secciones que sobreviven en la versión compacta (el resto se descarta). */
export const COMPACT_SECTIONS = ['proyecto', 'galeria', 'tipologias', 'ficha'] as const;
export const COMPACT_GALLERY_MAX = 6;

const stripCtx = (html: string): string => html.replace(/\sdata-ctx="[^"]*"/g, '');

/** "El proyecto": titular + texto + cifras clave; sin las fotos grandes (van a la galería). */
export function compactProyecto(html: string): string {
  const root = parse(stripCtx(html), { comment: false });
  root.querySelectorAll('.feature, .layer').forEach((n) => n.remove());
  return root.toString();
}

/** Galería chica: hasta `max` fotos (sin planos) para el visor de galería existente. */
export function compactGaleria(html: string, max = COMPACT_GALLERY_MAX): string {
  const root = parse(stripCtx(html), { comment: false });
  const strip = root.querySelector('.strip3');
  if (strip) {
    const figs = strip.querySelectorAll('figure');
    figs.filter((f) => f.classList.contains('plan')).forEach((f) => f.remove());
    strip.querySelectorAll('figure').slice(max).forEach((f) => f.remove());
  }
  return root.toString();
}

/**
 * Tipologías (pestañas + plano en el modal #pd). Un proyecto vendido no muestra fotos de "interior" que no
 * existen: se sacan las fotos de cada panel (queda el plano + datos) y el CTA / titular gigante.
 * Las fotos propias del fragmento (`.ph`) solo se conservan si el fragmento las marca con `data-keep`.
 */
export function compactTipologias(html: string): string {
  const root = parse(stripCtx(html), { comment: false });
  root.querySelectorAll('.pane .ph:not([data-keep])').forEach((n) => n.remove());
  root.querySelectorAll('.pane .pair').forEach((pair) => {
    const kids = pair.childNodes.filter((c) => (c as { tagName?: string }).tagName);
    if (kids.length === 1) pair.replaceWith(kids[0]);
  });
  root.querySelectorAll('.pair-hint, .cta, .giant2').forEach((n) => n.remove());
  const hint = root.querySelector('.tsel .hint');
  if (hint) hint.set_content('Tocá una tipología para ver sus datos y, si hay, el plano');
  return root.toString();
}

export const compactFicha = stripCtx;

/** Índice reducido de la portada (solo las secciones que quedan). */
export function compactNav(nav: NavItem[]): NavItem[] {
  return nav.filter((n) => (COMPACT_SECTIONS as readonly string[]).includes(n.id));
}
