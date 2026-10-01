/**
 * Configuración central del sitio.
 *
 * >>> Para cambiar el dominio, editá SOLO `SITE_URL` (astro.config.mjs lo importa desde acá). <<<
 */
export const SITE_URL = 'https://inmo.com.py';

export const SITE = {
  url: SITE_URL,
  name: 'INMO Desarrollos',
  legalName: 'INMO Group SA',
  tagline: 'Departamentos grandes, en serio',
  defaultTitle: 'INMO Desarrollos · Departamentos grandes, en serio',
  titleSuffix: 'INMO Desarrollos',
  description:
    'INMO Desarrollos, desarrolladora inmobiliaria en Asunción. Trinity 2, The Address, President Tower, Boston 842. Diez años construyendo patrimonio.',
  lang: 'es-PY',
  locale: 'es_PY',
  themeColor: '#000000',
  foundingDate: '2016-09-01',
  email: 'recepcion@inmo.com.py',
  phone: '+595981044061',
  phoneDisplay: '+595 981 044 061',
  whatsapp: 'https://wa.me/595981044061',
  address: {
    street: 'Av. Santa Teresa 2106, Torre 2, Piso 17, Torres del Paseo',
    locality: 'Asunción',
    country: 'PY',
    countryName: 'Paraguay',
  },
  social: {
    instagram: 'https://www.instagram.com/inmo.desarrollospy/',
    facebook: 'https://www.facebook.com/INMOPy/',
    tiktok: 'https://www.tiktok.com/@inmodesarrollos.py',
    linkedin: 'https://www.linkedin.com/company/inmo-group-s-a/',
  },
  founders: ['Diego Prieto', 'Giovanni Masulli'],
  /** Fecha de la última revisión de contenido (sitemap, security.txt, humans.txt). */
  lastModified: '2026-09-30',
  /** Vencimiento de security.txt (RFC 9116). */
  securityExpires: '2027-09-30T00:00:00.000Z',
} as const;

/** Convierte una ruta ("/trinity-2/") en URL absoluta. */
export function absoluteUrl(path = '/'): string {
  return new URL(path, SITE_URL).toString();
}
