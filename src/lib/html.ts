/**
 * Procesamiento de los fragmentos HTML de `src/content/**`:
 *  - <img src="assets/x.webp"> → <picture> WebP responsive con width/height (astro:assets)
 *  - rel="noopener" en enlaces externos
 *  - conversión a Markdown (llms-full.txt y versiones .md)
 */
import { parse, HTMLElement, TextNode, type Node } from 'node-html-parser';
import { SITE_URL } from '../config/site';
import {
  CTX,
  WIDTHS,
  hasImage,
  pictureHtml,
  preloadInfo,
  type ImageCtx,
  type PreloadInfo,
} from './images';

// ---------------------------------------------------------------------------------------------
// Fragmentos (Vite ?raw)
// ---------------------------------------------------------------------------------------------
const rawFragments = import.meta.glob<string>('/src/content/**/*.html', {
  query: '?raw',
  import: 'default',
  eager: true,
});

/** Devuelve los fragmentos de un directorio (`home` o `projects/<slug>`), ordenados por nombre. */
export function getFragments(dir: string): { file: string; id: string; html: string }[] {
  const prefix = `/src/content/${dir}/`;
  return Object.entries(rawFragments)
    .filter(([p]) => p.startsWith(prefix))
    .map(([p, html]) => {
      const file = p.slice(prefix.length);
      return { file, id: file.replace(/^\d+-/, '').replace(/\.html$/, ''), html };
    })
    .sort((a, b) => a.file.localeCompare(b.file));
}

// ---------------------------------------------------------------------------------------------
// Contexto de tamaño por ancestro
// ---------------------------------------------------------------------------------------------
function ancestors(node: HTMLElement): HTMLElement[] {
  const out: HTMLElement[] = [];
  let p = node.parentNode as HTMLElement | null;
  while (p) {
    out.push(p);
    p = p.parentNode as HTMLElement | null;
  }
  return out;
}

const has = (list: HTMLElement[], cls: string): boolean =>
  list.some((el) => el.classList && el.classList.contains(cls));

function ctxFor(img: HTMLElement): ImageCtx {
  const up = ancestors(img);
  if (img.hasAttribute('data-lcp') || has(up, 'hero') || has(up, 'phero'))
    return CTX.hero;
  if (has(up, 'feature')) return { sizes: '100vw', widths: WIDTHS.lg };
  if (has(up, 'intro')) return { sizes: '(max-width: 900px) 100vw, 62vw', widths: WIDTHS.md };
  if (has(up, 'mimg')) return { sizes: '55vw', widths: WIDTHS.md };
  if (has(up, 'pslider')) return { sizes: '(max-width: 700px) 84vw, min(50vw, 780px)', widths: WIDTHS.md };
  if (has(up, 'more')) return { sizes: '(max-width: 700px) 50vw, 33vw', widths: WIDTHS.md };
  if (has(up, 'hs')) return { sizes: '(max-width: 900px) 100vw, 58vw', widths: WIDTHS.lg };
  if (has(up, 'gal')) return { sizes: '(max-width: 900px) 74vw, 36vw', widths: WIDTHS.md };
  if (has(up, 'day')) return { sizes: '(max-width: 900px) 100vw, 52vw', widths: WIDTHS.md };
  if (has(up, 'strip3') || has(up, 'strip2')) return { sizes: '(max-width: 900px) 78vw, 40vw', widths: WIDTHS.md };
  if (has(up, 'layer')) return { sizes: '(max-width: 700px) 82vw, 45vw', widths: WIDTHS.md };
  if (has(up, 'mpic')) return { sizes: '(max-width: 900px) 70vw, 45vw', widths: WIDTHS.md };
  if (has(up, 'mats')) return { sizes: '(max-width: 700px) 46vw, 30vw', widths: WIDTHS.sm };
  if (has(up, 'partners')) return { sizes: '(max-width: 900px) 50vw, 210px', widths: WIDTHS.sm };
  if (has(up, 'pane')) return { sizes: '(max-width: 900px) 84vw, 45vw', widths: WIDTHS.md };
  if (has(up, 'fx')) return { sizes: '(max-width: 900px) 100vw, 55vw', widths: WIDTHS.md };
  if (has(up, 'typo')) return { sizes: '(max-width: 900px) 100vw, 50vw', widths: WIDTHS.md };
  return { sizes: '(max-width: 900px) 100vw, 50vw', widths: WIDTHS.md };
}

export interface ProcessResult {
  html: string;
  /** Imágenes LCP para <link rel="preload"> */
  preloads: PreloadInfo[];
}

const FILE_RE = /([A-Za-z0-9_\-]+\.(?:webp|png|jpg))$/;

/** Los <img> que están dentro de contenedores que el visor de galería abre. */
function isGalleryImage(img: HTMLElement): boolean {
  return ancestors(img).some((el) => el.hasAttribute && el.hasAttribute('data-gallery'));
}

export async function processHtml(html: string): Promise<ProcessResult> {
  const root = parse(html, { comment: false });
  const preloads: PreloadInfo[] = [];
  const imgs = root.querySelectorAll('img');
  const jobs: Promise<void>[] = [];

  for (const img of imgs) {
    const src = img.getAttribute('src') ?? '';
    const m = FILE_RE.exec(src);
    if (!m || !hasImage(m[1])) continue;
    const name = m[1];
    const ctx: ImageCtx = name.startsWith('logo_') ? { sizes: '120px', widths: [160, 320, 480] } : ctxFor(img);
    const attrs: Record<string, string | true> = {};
    for (const [k, v] of Object.entries(img.attributes)) {
      if (['src', 'alt', 'loading', 'decoding', 'width', 'height', 'srcset', 'sizes', 'data-lcp'].includes(k)) continue;
      attrs[k] = v;
    }
    if (img.hasAttribute('data-lcp')) attrs['data-lcp'] = true;
    const alt = img.getAttribute('alt') ?? '';
    jobs.push(
      (async () => {
        const out = await pictureHtml(name, ctx, { alt, attrs, full: isGalleryImage(img) });
        if (ctx.eager) preloads.push(await preloadInfo(name, ctx));
        img.replaceWith(out);
      })(),
    );
  }
  await Promise.all(jobs);

  for (const a of root.querySelectorAll('a[target="_blank"]')) {
    const rel = new Set((a.getAttribute('rel') ?? '').split(/\s+/).filter(Boolean));
    rel.add('noopener');
    a.setAttribute('rel', [...rel].join(' '));
  }
  return { html: root.toString(), preloads };
}

// ---------------------------------------------------------------------------------------------
// HTML → Markdown (contenido para LLMs)
// ---------------------------------------------------------------------------------------------
const SKIP_TAGS = new Set(['script', 'style', 'img', 'svg', 'picture', 'button', 'form', 'select', 'iframe', 'noscript']);
const SKIP_CLASSES = ['hint', 'pair-hint', 'cue', 'mq', 'prog', 'arrow', 'dots', 'arrows', 'up', 'clock', 'imgs', 'mh', 'ind', 'giant', 'giant2', 'cur', 'thumb', 'cards', 'pslider', 'ctrl', 'time', 'cap', 'n'];
const BLOCK_TAGS = new Set(['div', 'section', 'ul', 'ol', 'dl', 'nav', 'main', 'article', 'header', 'footer', 'figure', 'p', 'li', 'h1', 'h2', 'h3', 'h4', 'dt', 'dd']);

const clean = (s: string): string =>
  s
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&times;/g, '×')
    .replace(/[ \t\r\n]+/g, ' ');

function abs(href: string): string {
  if (/^(https?:|mailto:|tel:)/.test(href)) return href;
  if (href.startsWith('#')) return href;
  try {
    return new URL(href, SITE_URL).toString();
  } catch {
    return href;
  }
}

function inline(node: Node): string {
  if (node instanceof TextNode) return clean(node.rawText);
  if (!(node instanceof HTMLElement)) return '';
  const tag = node.tagName?.toLowerCase();
  if (!tag) return node.childNodes.map(inline).join('');
  if (SKIP_TAGS.has(tag)) return '';
  if (node.getAttribute('aria-hidden') === 'true') return '';
  if (SKIP_CLASSES.some((c) => node.classList.contains(c))) return '';
  if (tag === 'br') return ' ';
  const text = node.childNodes.map(inline).join('');
  // separar nodos hijos "pegados" (<b>16</b>niveles)
  if (tag === 'a') {
    const href = node.getAttribute('href');
    const t = text.replace(/\s+/g, ' ').trim();
    if (!href || !t) return text;
    return `[${t}](${abs(href)})`;
  }
  if (tag === 'b' || tag === 'strong') return text.trim() ? ` **${text.trim()}** ` : '';
  if (tag === 'small' || tag === 'span' || tag === 'i' || tag === 'em' || tag === 'sup') return ` ${text} `;
  return text;
}

function flatten(node: HTMLElement): string {
  return node.childNodes
    .map(inline)
    .join('')
    .replace(/\s+/g, ' ')
    .replace(/\s+([.,:;])/g, '$1')
    .replace(/\*\* \*\*/g, ' ')
    .trim();
}

function blocks(node: Node, out: string[], depth = 0): void {
  if (node instanceof TextNode) {
    const t = clean(node.rawText).trim();
    if (t) out.push(t);
    return;
  }
  if (!(node instanceof HTMLElement)) return;
  const tag = node.tagName?.toLowerCase();
  if (!tag) {
    node.childNodes.forEach((c) => blocks(c, out, depth));
    return;
  }
  if (SKIP_TAGS.has(tag)) return;
  if (node.getAttribute('aria-hidden') === 'true') return;
  if (SKIP_CLASSES.some((c) => node.classList.contains(c))) return;
  if (node.hasAttribute('inert')) return;

  if (/^h[1-4]$/.test(tag)) {
    const n = Math.min(4, Number(tag[1]) + 0);
    const t = flatten(node);
    if (t) out.push(`\n${'#'.repeat(n)} ${t}\n`);
    return;
  }
  if (tag === 'p') {
    const t = flatten(node);
    if (t) out.push(`\n${t}\n`);
    return;
  }
  if (tag === 'li' && node.classList.contains('ex')) {
    // ficha desplegable de "Entregados"
    const name = node.querySelector('.nm');
    const metas = node.querySelectorAll(':scope > span.mid, :scope > span.st').map((n) => flatten(n));
    out.push(`
### ${name ? flatten(name) : 'Proyecto'}
`);
    metas.forEach((m) => m && out.push(`- ${m}`));
    const desc = node.querySelector('.desc');
    if (desc) out.push(`
${flatten(desc)}
`);
    const specs = node.querySelector('.specs');
    if (specs) blocks(specs, out, depth);
    const acts = node.querySelector('.acts');
    if (acts) blocks(acts, out, depth);
    return;
  }
  if (node.classList.contains('slide')) {
    const lab = node.querySelector('.lab');
    const desc = node.querySelector('.desc');
    if (node.classList.contains('lead')) {
      if (desc) out.push(`
${flatten(desc)}
`);
    } else if (lab) {
      out.push(`- **${flatten(lab)}**${desc ? ': ' + flatten(desc) : ''}`);
    }
    return;
  }
  if (tag === 'li') {
    const t = flatten(node);
    if (t) out.push(`- ${t}`);
    return;
  }
  if (tag === 'dl') {
    for (const r of node.querySelectorAll('div.r')) {
      const dt = r.querySelector('dt');
      const dd = r.querySelector('dd');
      if (dt && dd) out.push(`- **${flatten(dt)}**: ${flatten(dd)}`);
    }
    if (!node.querySelector('div.r')) {
      const dts = node.querySelectorAll('dt');
      const dds = node.querySelectorAll('dd');
      dts.forEach((dt, i) => dds[i] && out.push(`- **${flatten(dt)}**: ${flatten(dds[i])}`));
    }
    return;
  }
  if (tag === 'ul' || tag === 'ol') {
    out.push('');
    node.childNodes.forEach((c) => blocks(c, out, depth + 1));
    out.push('');
    return;
  }
  if (node.classList.contains('specs') || node.classList.contains('cond') || node.classList.contains('pill')) {
    out.push('');
    for (const c of node.childNodes) {
      if (c instanceof HTMLElement) {
        const t = flatten(c);
        if (t) out.push(`- ${t}`);
      }
    }
    out.push('');
    return;
  }
  if (node.classList.contains('acts') || node.classList.contains('lk') || node.classList.contains('social')) {
    const links = node.querySelectorAll('a').map((a) => inline(a).trim()).filter(Boolean);
    if (links.length) out.push('\n' + links.join(' · ') + '\n');
    return;
  }
  if (node.classList.contains('num')) {
    const t = flatten(node);
    if (t) out.push(`\n**${t}**\n`);
    return;
  }
  if (node.classList.contains('tabs')) {
    out.push('');
    for (const li of node.querySelectorAll('li')) {
      const t = flatten(li);
      if (t) out.push(`- ${t}`);
    }
    out.push('');
    return;
  }
  if (node.classList.contains('tsel')) {
    // tabs + paneles con detalle (los planos/fotos se omiten)
    const tabs = node.querySelector('.tabs');
    if (tabs) blocks(tabs, out, depth);
    for (const det of node.querySelectorAll('.det')) {
      const h = det.querySelector('h3');
      const items = det.querySelectorAll('ul li').map((li) => flatten(li));
      const dl = det.querySelector('dl');
      const facts: string[] = [];
      if (dl) {
        const dts = dl.querySelectorAll('dt');
        const dds = dl.querySelectorAll('dd');
        dts.forEach((dt, i) => dds[i] && facts.push(`${flatten(dt)}: ${flatten(dds[i])}`));
      }
      out.push(`\n### ${h ? flatten(h) : 'Detalle'}\n`);
      items.forEach((t) => out.push(`- ${t}`));
      facts.forEach((t) => out.push(`- ${t}`));
    }
    return;
  }
  if (tag === 'figure') {
    const cap = node.querySelector('figcaption');
    if (cap && node.querySelector('img') === null) out.push(flatten(cap));
    return;
  }
  if (node.classList.contains('foot')) return;
  if (node.classList.contains('cap') && tag !== 'div') return;
  // contenedores genéricos: recorrer hijos; los bloques hoja de texto suelto se emiten como línea
  const hasBlockChild = node.childNodes.some(
    (c) => c instanceof HTMLElement && (BLOCK_TAGS.has(c.tagName?.toLowerCase()) || c.classList.contains('specs')),
  );
  if (!hasBlockChild) {
    const t = flatten(node);
    if (t) out.push(`\n${t}\n`);
    return;
  }
  node.childNodes.forEach((c) => blocks(c, out, depth));
}

/** Convierte un fragmento HTML (sección) a Markdown compacto. */
export function htmlToMarkdown(html: string, opts: { demoteHeadings?: number } = {}): string {
  const root = parse(html, { comment: false });
  const out: string[] = [];
  blocks(root, out);
  let md = out.join('\n').replace(/\n{3,}/g, '\n\n').replace(/[ \t]+\n/g, '\n').trim();
  if (opts.demoteHeadings) {
    md = md.replace(/^(#{1,5}) /gm, (_m, h: string) => '#'.repeat(Math.min(6, h.length + opts.demoteHeadings!)) + ' ');
  }
  return md;
}

/** Texto plano de una sola línea (para descripciones). */
export function htmlToText(html: string): string {
  const root = parse(html, { comment: false });
  return clean(root.textContent).trim();
}

/** Convierte una sección completa anteponiendo su título (data-title) como encabezado H2. */
export function sectionToMarkdown(html: string, demote = 1): string {
  const title = /data-title="([^"]*)"/.exec(html)?.[1];
  let md = htmlToMarkdown(html, { demoteHeadings: demote });
  if (!md) return '';
  if (!title) return md;
  const t = clean(title).trim();
  const lines = md.split('\n');
  const first = lines[0] ?? '';
  // evita repetir el título como primer encabezado
  if (/^#{2,6} /.test(first) && first.replace(/^#+ /, '').trim() === t) md = lines.slice(1).join('\n').trim();
  else if (first.trim() === t) md = lines.slice(1).join('\n').trim();
  return md ? '## ' + t + '\n\n' + md : '';
}
