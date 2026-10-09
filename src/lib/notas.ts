/**
 * Utilidades de la sección Notas (blog basado en archivos).
 */
import { getCollection, type CollectionEntry } from 'astro:content';
import { absoluteUrl } from '../config/site';

export type Nota = CollectionEntry<'notas'>;

export const notaPath = (n: Pick<Nota, 'id'>): string => `/notas/${n.id}/`;
export const notaUrl = (n: Pick<Nota, 'id'>): string => absoluteUrl(notaPath(n));

/** Todas las notas no borrador, de la más nueva a la más vieja. */
export async function allNotas(): Promise<Nota[]> {
  const list = await getCollection('notas', (n) => !n.data.draft);
  return list.sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
}

/** Notas reales (no ejemplo): son las únicas que entran en sitemap, llms.txt y RSS. */
export async function realNotas(): Promise<Nota[]> {
  return (await allNotas()).filter((n) => !n.data.ejemplo);
}

/**
 * Notas que se muestran en el listado y en "relacionadas": las reales; si todavía no hay ninguna,
 * las de ejemplo (para que la sección no quede vacía).
 */
export async function visibleNotas(): Promise<Nota[]> {
  const real = await realNotas();
  return real.length ? real : await allNotas();
}

export function readingMinutes(body: string | undefined): number {
  const words = (body ?? '').replace(/[#>*_`\[\]()!-]/g, ' ').split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

const fmt = new Intl.DateTimeFormat('es-PY', { dateStyle: 'long', timeZone: 'UTC' });
export const formatDate = (d: Date): string => fmt.format(d);
export const isoDate = (d: Date): string => d.toISOString().slice(0, 10);

/** Relacionadas: primero las que comparten más etiquetas, después las más nuevas. */
export function relatedNotas(current: Nota, pool: Nota[], max = 3): Nota[] {
  const tags = new Set(current.data.tags.map((t) => t.toLowerCase()));
  return pool
    .filter((n) => n.id !== current.id)
    .map((n) => ({ n, score: n.data.tags.filter((t) => tags.has(t.toLowerCase())).length }))
    .sort((a, b) => b.score - a.score || b.n.data.date.getTime() - a.n.data.date.getTime())
    .slice(0, max)
    .map((x) => x.n);
}
