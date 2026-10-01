import type { APIRoute } from 'astro';
import { SITE } from '../config/site';

export const GET: APIRoute = () => {
  const body = `/* EQUIPO */
Empresa: ${SITE.legalName} (${SITE.name})
Socios cofundadores: ${SITE.founders.join(', ')}
Contacto: ${SITE.email}
Ubicación: ${SITE.address.locality}, ${SITE.address.countryName}

/* SITIO */
Última actualización: ${SITE.lastModified}
Idioma: Español (${SITE.lang})
Estándares: HTML5, CSS3, JSON-LD (schema.org), Open Graph
Tecnología: Astro, GSAP, sharp
`;
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
