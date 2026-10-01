/**
 * Contenido en texto/Markdown para LLMs y agentes: /llms.txt, /llms-full.txt y las versiones .md
 * de cada página. Todo sale de `site.ts`, `projects.ts` y los fragmentos HTML de `src/content`.
 */
import { SITE, absoluteUrl } from '../config/site';
import { projects, projectPath, type Project } from '../data/projects';
import { getFragments, sectionToMarkdown } from './html';

export const mdPath = (slug?: string): string => (slug ? `/${slug}.md` : '/index.md');

const WA = SITE.whatsapp;

function contactBlock(): string {
  return [
    '## Contacto',
    '',
    `- WhatsApp: [${SITE.phoneDisplay}](${WA})`,
    `- Correo: ${SITE.email}`,
    `- Oficinas: Av. Santa Teresa 2106, Torre 2, Piso 17, Torres del Paseo, ${SITE.address.locality}, ${SITE.address.countryName}`,
    `- Instagram: ${SITE.social.instagram}`,
    `- Facebook: ${SITE.social.facebook}`,
    `- TikTok: ${SITE.social.tiktok}`,
    `- LinkedIn: ${SITE.social.linkedin}`,
  ].join('\n');
}

export function homeMarkdown(): string {
  const parts: string[] = [
    `# ${SITE.name} · ${SITE.tagline}`,
    '',
    `> ${SITE.description}`,
    '',
    `Sitio oficial: ${absoluteUrl('/')}`,
    '',
  ];
  for (const f of getFragments('home')) {
    if (f.id === 'contacto') continue; // el formulario no aporta; se resume abajo
    if (/-home$/.test(f.id)) continue; // teasers de proyectos: el detalle va en cada página
    const md = sectionToMarkdown(f.html, 1);
    if (md) parts.push(md, '');
  }
  parts.push('## Lista de proyectos', '');
  for (const p of projects) {
    parts.push(`- [${p.name}](${absoluteUrl(projectPath(p.slug))}) (${p.statusLabel}): ${p.description}`);
  }
  parts.push('', contactBlock(), '');
  return parts.join('\n');
}

export function projectMarkdown(p: Project): string {
  const parts: string[] = [
    `# ${p.name}`,
    '',
    `> ${p.description}`,
    '',
    `- Estado: ${p.statusLabel}`,
    `- Ubicación: ${p.loc}`,
    `- Página: ${absoluteUrl(projectPath(p.slug))}`,
    ...(p.showroom ? [`- Showroom virtual 3D: ${p.showroom}`] : []),
    `- Consultas por WhatsApp: ${WA}?text=${encodeURIComponent(`Hola, quiero información sobre ${p.name}`)}`,
    '',
  ];
  for (const f of getFragments(`projects/${p.slug}`)) {
    const md = sectionToMarkdown(f.html, 1);
    if (md) parts.push(md, '');
  }
  parts.push('## Amenities (resumen)', '', ...p.amenities.map((a) => `- ${a}`), '');
  parts.push(`Desarrolla y comercializa ${SITE.name} (${SITE.legalName}). ${SITE.address.locality}, ${SITE.address.countryName}.`, '');
  return parts.join('\n');
}

export function llmsTxt(): string {
  const lines: string[] = [
    `# ${SITE.name}`,
    '',
    `> ${SITE.description} ${SITE.legalName} nació el 1 de septiembre de 2016 y desarrolla y comercializa departamentos en Asunción, Paraguay.`,
    '',
    `Sitio en español (${SITE.lang}). Cada página tiene una versión en Markdown (misma ruta con extensión .md). El contenido completo está en ${absoluteUrl('/llms-full.txt')}.`,
    '',
    '## Empresa',
    '',
    `- [Inicio](${absoluteUrl(mdPath())}): Manifiesto, proyectos, proyectos entregados, historia de diez años y contacto.`,
    '',
    '## Proyectos',
    '',
    ...projects.map((p) => `- [${p.name}](${absoluteUrl(mdPath(p.slug))}): ${p.statusLabel}. ${p.description}`),
    '',
    '## Contacto',
    '',
    `- WhatsApp: ${WA}`,
    `- Correo: ${SITE.email}`,
    `- Oficinas: Av. Santa Teresa 2106, Torre 2, Piso 17, Torres del Paseo, ${SITE.address.locality}`,
    '',
    '## Optional',
    '',
    `- [Contenido completo en un solo archivo](${absoluteUrl('/llms-full.txt')}): Todo el sitio en Markdown.`,
    `- [Sitemap](${absoluteUrl('/sitemap.xml')}): Listado de URLs.`,
    `- [Sitio web](${absoluteUrl('/')}): Versión HTML interactiva.`,
    '',
  ];
  return lines.join('\n');
}

export function llmsFullTxt(): string {
  const chunks = [homeMarkdown(), ...projects.map((p) => projectMarkdown(p))];
  return `# ${SITE.name}: contenido completo\n\n> Todo el contenido público de ${absoluteUrl('/')} en Markdown.\n\n---\n\n${chunks.join('\n---\n\n')}`;
}
