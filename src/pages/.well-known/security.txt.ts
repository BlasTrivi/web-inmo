import type { APIRoute } from 'astro';
import { SITE, absoluteUrl } from '../../config/site';

/** RFC 9116. Actualizá `securityExpires` en src/config/site.ts al menos una vez al año. */
export const GET: APIRoute = () => {
  const body = `Contact: mailto:${SITE.email}
Expires: ${SITE.securityExpires}
Preferred-Languages: es, en
Canonical: ${absoluteUrl('/.well-known/security.txt')}
`;
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
