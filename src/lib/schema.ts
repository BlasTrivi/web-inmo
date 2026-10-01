/**
 * Generadores de JSON-LD (schema.org). Todo sale de `site.ts` y `projects.ts`.
 */
import { SITE, SITE_URL, absoluteUrl } from '../config/site';
import { projects, projectPath, type Project } from '../data/projects';

export const ORG_ID = `${SITE_URL}/#organization`;
export const WEBSITE_ID = `${SITE_URL}/#website`;

type Json = Record<string, unknown>;

export function organizationSchema(): Json {
  return {
    '@type': ['Organization', 'RealEstateAgent'],
    '@id': ORG_ID,
    name: SITE.name,
    legalName: SITE.legalName,
    url: SITE_URL + '/',
    logo: {
      '@type': 'ImageObject',
      url: absoluteUrl('/favicon-512.png'),
      width: 512,
      height: 512,
    },
    image: absoluteUrl('/og/default.png'),
    description: SITE.description,
    slogan: SITE.tagline,
    email: SITE.email,
    telephone: SITE.phone,
    foundingDate: SITE.foundingDate,
    founder: SITE.founders.map((name) => ({ '@type': 'Person', name, jobTitle: 'Socio cofundador' })),
    address: {
      '@type': 'PostalAddress',
      streetAddress: SITE.address.street,
      addressLocality: SITE.address.locality,
      addressCountry: SITE.address.country,
    },
    areaServed: { '@type': 'City', name: 'Asunción' },
    contactPoint: [
      {
        '@type': 'ContactPoint',
        contactType: 'sales',
        telephone: SITE.phone,
        email: SITE.email,
        url: SITE.whatsapp,
        areaServed: 'PY',
        availableLanguage: ['es'],
      },
    ],
    sameAs: [SITE.social.facebook, SITE.social.instagram, SITE.social.linkedin, SITE.social.tiktok],
  };
}

export function websiteSchema(): Json {
  return {
    '@type': 'WebSite',
    '@id': WEBSITE_ID,
    url: SITE_URL + '/',
    name: SITE.name,
    description: SITE.description,
    inLanguage: SITE.lang,
    publisher: { '@id': ORG_ID },
  };
}

export interface Crumb {
  name: string;
  path: string;
}

export function breadcrumbSchema(crumbs: Crumb[], pagePath: string): Json {
  return {
    '@type': 'BreadcrumbList',
    '@id': `${absoluteUrl(pagePath)}#breadcrumb`,
    itemListElement: crumbs.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.name,
      item: absoluteUrl(c.path),
    })),
  };
}

export function webPageSchema(opts: {
  path: string;
  name: string;
  description: string;
  image?: string;
  type?: string;
  about?: string;
}): Json {
  const url = absoluteUrl(opts.path);
  return {
    '@type': opts.type ?? 'WebPage',
    '@id': `${url}#webpage`,
    url,
    name: opts.name,
    description: opts.description,
    inLanguage: SITE.lang,
    isPartOf: { '@id': WEBSITE_ID },
    publisher: { '@id': ORG_ID },
    breadcrumb: { '@id': `${url}#breadcrumb` },
    ...(opts.image ? { primaryImageOfPage: { '@type': 'ImageObject', url: opts.image } } : {}),
    ...(opts.about ? { about: { '@id': opts.about } } : {}),
  };
}

const AVAILABILITY: Record<NonNullable<Project['availability']>, string> = {
  InStock: 'https://schema.org/InStock',
  LimitedAvailability: 'https://schema.org/LimitedAvailability',
  PreSale: 'https://schema.org/PreSale',
  SoldOut: 'https://schema.org/SoldOut',
};

export function projectId(p: Project): string {
  return `${absoluteUrl(projectPath(p.slug))}#residence`;
}

export function projectSchema(p: Project, image: string): Json[] {
  const url = absoluteUrl(projectPath(p.slug));
  const residence: Json = {
    '@type': p.schemaType,
    '@id': projectId(p),
    name: p.name,
    description: p.description,
    url,
    image,
    address: {
      '@type': 'PostalAddress',
      streetAddress: p.address.street,
      addressLocality: p.address.locality,
      addressCountry: SITE.address.country,
    },
    ...(p.numberOfUnits ? { numberOfAccommodationUnits: p.numberOfUnits } : {}),
    amenityFeature: p.amenities.map((name) => ({
      '@type': 'LocationFeatureSpecification',
      name,
      value: true,
    })),
    additionalProperty: [
      { '@type': 'PropertyValue', name: 'Estado', value: p.statusLabel },
      ...p.facts.map((f) => ({ '@type': 'PropertyValue', name: f.name, value: f.value })),
    ],
    ...(p.showroom
      ? { subjectOf: { '@type': 'WebPage', name: `Showroom virtual 3D de ${p.name}`, url: p.showroom } }
      : {}),
  };
  const nodes: Json[] = [residence];
  if (p.availability) {
    nodes.push({
      '@type': 'Offer',
      '@id': `${url}#offer`,
      url,
      availability: AVAILABILITY[p.availability],
      itemOffered: { '@id': projectId(p) },
      seller: { '@id': ORG_ID },
    });
  }
  return nodes;
}

export function homeItemListSchema(): Json {
  return {
    '@type': 'ItemList',
    name: 'Proyectos de INMO Desarrollos',
    itemListElement: projects.map((p, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: p.name,
      url: absoluteUrl(projectPath(p.slug)),
    })),
  };
}

/** Envuelve una lista de nodos en un único <script type="application/ld+json">. */
export function graph(nodes: Json[]): string {
  return JSON.stringify({ '@context': 'https://schema.org', '@graph': nodes }).replace(/</g, '\\u003c');
}
