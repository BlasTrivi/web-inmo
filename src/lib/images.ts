/**
 * Utilidades de imágenes (astro:assets). Todas las fotos viven en `src/assets/img/`
 * y se sirven optimizadas (WebP, varios anchos, width/height explícitos).
 */
import { getImage } from 'astro:assets';
import type { ImageMetadata } from 'astro';

const modules = import.meta.glob<{ default: ImageMetadata }>('/src/assets/img/*.{webp,png,jpg}', {
  eager: true,
});

const byName = new Map<string, ImageMetadata>();
for (const [path, mod] of Object.entries(modules)) {
  byName.set(path.split('/').pop() as string, mod.default);
}

export const hasImage = (name: string): boolean => byName.has(name);

export function getMeta(name: string): ImageMetadata {
  const meta = byName.get(name);
  if (!meta) throw new Error(`Imagen no encontrada en src/assets/img: ${name}`);
  return meta;
}

/** Conjuntos de anchos para srcset (se recortan al ancho real de la foto). */
export const WIDTHS = {
  xs: [160, 320, 480],
  sm: [320, 480, 720, 960],
  md: [480, 768, 1080, 1440, 1920],
  lg: [640, 960, 1280, 1600, 2000, 2560],
} as const;

export interface ImageCtx {
  sizes: string;
  widths: readonly number[];
  /** Imagen LCP: carga inmediata, fetchpriority alto */
  eager?: boolean;
  /** Calidad WebP (por defecto 72) */
  quality?: number;
  /**
   * Variante para pantallas angostas (<source media>) con sus propios anchos, `sizes` y calidad WebP.
   * Sirve para portadas con object-fit:cover en celular: el ancho dibujado supera con creces 100vw, así que se ofrecen
   * anchos mayores pero con menos calidad (la foto va recortada y oscurecida por un degradé), para que pesen casi lo mismo.
   */
  mobile?: { media: string; sizes: string; widths: readonly number[]; quality: number };
}

export interface PictureData {
  name: string;
  width: number;
  height: number;
  sizes: string;
  webpSrcset: string;
  /** URL de respaldo para <img src> (ancho intermedio, WebP) */
  fallback: string;
  /** URL grande (visor de galería) */
  full: string;
  eager: boolean;
  /** Variante para pantallas angostas (ver ImageCtx.mobile) */
  mobile?: { media: string; sizes: string; srcset: string };
}

const cache = new Map<string, Promise<PictureData>>();

function fitWidths(all: readonly number[], natural: number): number[] {
  const list = all.filter((w) => w <= natural);
  if (!list.length) return [natural];
  // el ancho real de la foto entra como último candidato (si no, un 1536px nunca se serviría a un marco de 1500px)
  if (natural > list[list.length - 1] * 1.01) list.push(natural);
  return list;
}

export function pictureData(name: string, ctx: ImageCtx): Promise<PictureData> {
  const key = `${name}|${ctx.widths.join(',')}|${ctx.sizes}|${ctx.eager ? 1 : 0}|${ctx.quality ?? 0}|${ctx.mobile ? ctx.mobile.media + ctx.mobile.sizes + ctx.mobile.widths.join('.') + ctx.mobile.quality : ''}`;
  let hit = cache.get(key);
  if (!hit) {
    hit = build(name, ctx);
    cache.set(key, hit);
  }
  return hit;
}

async function build(name: string, ctx: ImageCtx): Promise<PictureData> {
  const meta = getMeta(name);
  const widths = fitWidths(ctx.widths, meta.width);
  const webp = await getImage({ src: meta, widths, sizes: ctx.sizes, format: 'webp', quality: ctx.quality ?? 72 });
  const values = webp.srcSet.values;
  const mid = values[Math.min(values.length - 1, Math.floor(values.length / 2))];
  const big = values.find((v) => /^(1[4-9]\d\d|2\d\d\d)w$/.test(v.descriptor ?? '')) ?? values[values.length - 1];
  return {
    name,
    width: meta.width,
    height: meta.height,
    sizes: ctx.sizes,
    webpSrcset: webp.srcSet.attribute,
    fallback: mid.url,
    full: big.url,
    eager: !!ctx.eager,
    mobile: ctx.mobile
      ? {
          media: ctx.mobile.media,
          sizes: ctx.mobile.sizes,
          srcset: (
            await getImage({
              src: meta,
              widths: ctx.mobile.widths.filter((w) => w <= meta.width).concat(meta.width < ctx.mobile.widths[0] ? [meta.width] : []),
              sizes: ctx.mobile.sizes,
              format: 'webp',
              quality: ctx.mobile.quality,
            })
          ).srcSet.attribute,
        }
      : undefined,
  };
}

export const escapeAttr = (s: string): string =>
  s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export interface PictureHtmlOptions {
  alt: string;
  /** Atributos extra para el <img> (class, data-*, style…) */
  attrs?: Record<string, string | true>;
  /** Atributos extra para <picture> */
  pictureAttrs?: string;
  /** Agrega data-full (URL grande, usada por el visor de galería) */
  full?: boolean;
  /** Fuerza loading="eager" sin fetchpriority alto (logos por encima del pliegue) */
  loading?: 'eager' | 'lazy';
}

/** Devuelve el markup <picture>/<img> listo para insertar. */
export async function pictureHtml(name: string, ctx: ImageCtx, opts: PictureHtmlOptions): Promise<string> {
  const pd = await pictureData(name, ctx);
  const attrs = opts.attrs ?? {};
  const extra = Object.entries(attrs)
    .map(([k, v]) => (v === true || v === '' ? k : `${k}="${escapeAttr(String(v))}"`))
    .join(' ');
  const loading = pd.eager
    ? 'loading="eager" fetchpriority="high" decoding="sync"'
    : `loading="${opts.loading ?? 'lazy'}" decoding="async"`;
  const sizes = `sizes="${escapeAttr(pd.sizes)}"`;
  return (
    `<picture${opts.pictureAttrs ? ' ' + opts.pictureAttrs : ''}>` +
    (pd.mobile ? `<source media="${pd.mobile.media}" type="image/webp" srcset="${pd.mobile.srcset}" sizes="${escapeAttr(pd.mobile.sizes)}">` : '') +
    `<source type="image/webp" srcset="${pd.webpSrcset}" ${sizes}>` +
    `<img${extra ? ' ' + extra : ''} src="${pd.fallback}" width="${pd.width}" height="${pd.height}" alt="${escapeAttr(opts.alt)}" ${loading}${opts.full ? ` data-full="${pd.full}"` : ''}>` +
    `</picture>`
  );
}

export interface PreloadInfo {
  webpSrcset: string;
  sizes: string;
  /** Variante para pantallas angostas: se emite como otro <link rel=preload media=…> */
  mobile?: { media: string; srcset: string; sizes: string };
}

export async function preloadInfo(name: string, ctx: ImageCtx): Promise<PreloadInfo> {
  const pd = await pictureData(name, ctx);
  return { webpSrcset: pd.webpSrcset, sizes: pd.sizes, mobile: pd.mobile };
}

// ---------------------------------------------------------------------------------------------
// Contextos de tamaño reutilizables
// ---------------------------------------------------------------------------------------------
export const CTX = {
  // Portada a pantalla completa con object-fit:cover: en vertical la foto se escala por ALTURA y se recorta a los lados,
  // así que el ancho que realmente se dibuja es mucho mayor que 100vw. Celular (<=700px): candidatos de 750-1280w a
  // calidad 45 y `sizes` de 420px: 750w a 1x y 1.75x (Lighthouse), 960w a 2x, 1280w a 3x; cada candidato pesa menos que
  // el de 750w a calidad 72 que se servía antes. Tablet vertical: ~1000px.
  // El preload (Base.astro) emite los mismos srcset/sizes con su `media`.
  hero: {
    sizes: '(max-aspect-ratio: 1/1) 1000px, 100vw',
    widths: [480, 750, 960, 1280, 1600, 1920, 2560],
    eager: true,
    mobile: { media: '(max-width: 700px)', sizes: '420px', widths: [750, 960, 1080, 1280], quality: 45 },
  },
  full: { sizes: '100vw', widths: WIDTHS.lg },
  half: { sizes: '(max-width: 900px) 100vw, 55vw', widths: WIDTHS.md },
  card: { sizes: '(max-width: 700px) 50vw, 33vw', widths: WIDTHS.md },
  logo: { sizes: '250px', widths: WIDTHS.xs },
} satisfies Record<string, ImageCtx>;
