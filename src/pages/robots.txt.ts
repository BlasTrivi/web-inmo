import type { APIRoute } from 'astro';
import { absoluteUrl } from '../config/site';

/** Crawlers de IA / búsqueda permitidos de forma explícita (GEO). */
const AI_BOTS = [
  'GPTBot',
  'OAI-SearchBot',
  'ChatGPT-User',
  'ClaudeBot',
  'Claude-User',
  'Claude-SearchBot',
  'Claude-Web',
  'anthropic-ai',
  'PerplexityBot',
  'Perplexity-User',
  'Google-Extended',
  'Googlebot',
  'Bingbot',
  'Applebot',
  'Applebot-Extended',
  'Amazonbot',
  'DuckAssistBot',
  'Meta-ExternalAgent',
  'MistralAI-User',
  'cohere-ai',
  'CCBot',
  'YouBot',
];

export const GET: APIRoute = () => {
  const lines = [
    '# robots.txt de INMO Desarrollos',
    '',
    'User-agent: *',
    'Allow: /',
    'Disallow: /404/',
    'Disallow: /500/',
    '',
    '# Crawlers de IA y buscadores: permitidos explícitamente',
    ...AI_BOTS.flatMap((bot) => [`User-agent: ${bot}`, 'Allow: /', '']),
    `Sitemap: ${absoluteUrl('/sitemap.xml')}`,
    '',
    `# Contenido para LLMs: ${absoluteUrl('/llms.txt')}`,
    '',
  ];
  return new Response(lines.join('\n'), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
