/**
 * Fajita de stock (markup). Una sola función para todos los lugares donde aparece:
 * slider de la home, "Otros proyectos", Entregados y portada de proyecto.
 * La lógica (qué texto y tono) vive en `stockRibbon()` de `projects.ts`.
 */
import { stockRibbon, type Project } from '../data/projects';
import { escapeAttr } from './images';

export function ribbonHtml(p: Pick<Project, 'stock' | 'statusLabel'>, variant: 'card' | 'hero' = 'card'): string {
  const r = stockRibbon(p);
  return `<span class="rib rib--${r.tone}${variant === 'hero' ? ' rib--hero' : ''}" data-stock="${p.stock}">${escapeAttr(r.text)}</span>`;
}
