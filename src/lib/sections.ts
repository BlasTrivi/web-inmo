/**
 * Índice de secciones estandarizado de las páginas de proyecto (nav de la portada).
 * Mismo orden y mismos nombres para todos los edificios; las secciones que un proyecto no tiene se omiten.
 * El ORDEN de las secciones en la página sale del prefijo numérico de `src/content/projects/<slug>/NN-<id>.html`
 * (mantenerlo igual a este orden). "Recorrido virtual" (showroom 3D) y "Unidades disponibles" se generan en
 * `src/pages/[slug]/index.astro`.
 */
import type { NavItem, Project } from '../data/projects';

export const SECTION_ORDER: NavItem[] = [
  { id: 'proyecto', label: 'Proyecto' },
  { id: 'galeria', label: 'Galería' },
  { id: 'amenities', label: 'Amenities' },
  { id: 'tipologias', label: 'Tipologías' },
  { id: 'showroom', label: 'Recorrido virtual' },
  { id: 'ficha', label: 'Ficha / Ubicación' },
  { id: 'disponibles', label: 'Unidades disponibles' },
];

/** Proyectos con asesor y sección "Unidades disponibles": todos menos los 100% vendidos. */
export const hasAvailability = (p: Pick<Project, 'stock'>): boolean => p.stock !== 'agotado';

/** Arma el nav con las secciones que existen realmente en la página. */
export function buildNav(present: Iterable<string>): NavItem[] {
  const have = new Set(present);
  return SECTION_ORDER.filter((n) => have.has(n.id));
}
