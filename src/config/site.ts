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

/**
 * Mensajes del botón flotante de WhatsApp.
 * TODO-CLIENTE: confirmar texto de los mensajes.
 * `{proyecto}` se reemplaza por el nombre del proyecto de la página.
 */
export const WA_MESSAGES = {
  home: 'Hola, estoy en la web de INMO Desarrollos y quiero hacer una consulta.',
  project: 'Hola, estoy en la web de INMO Desarrollos mirando {proyecto} y quiero más información.',
} as const;

export function waLink(text: string): string {
  return `${SITE.whatsapp}?text=${encodeURIComponent(text)}`;
}

/** Textos legales y de consentimiento. */
export const LEGAL = {
  /** Fecha de la versión vigente de los textos legales. */
  updated: '2026-10-09',
  updatedLabel: '9 de octubre de 2026',
  /**
   * Versión del consentimiento de cookies: subirla vuelve a pedir la elección a todos los visitantes,
   * salvo que consent.js sepa migrar la versión anterior (hoy: v1 -> v2 agrega `embeds`, se migra sin preguntar).
   */
  consentVersion: 2,
  /** Meses que se recuerda la elección de cookies antes de volver a preguntar. */
  consentMonths: 12,
} as const;

/** Convierte una ruta ("/trinity-2/") en URL absoluta. */
export function absoluteUrl(path = '/'): string {
  return new URL(path, SITE_URL).toString();
}
