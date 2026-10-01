/**
 * Generación de imágenes Open Graph 1200×630 con sharp.
 * El texto se convierte a trazados vectoriales (opentype.js) para no depender de las
 * fuentes instaladas en la máquina de build.
 */
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import opentype from 'opentype.js';
import { SITE } from '../config/site';

const W = 1200;
const H = 630;
const root = process.cwd();
const fontFile = (w: number) =>
  path.join(root, 'node_modules/@fontsource/host-grotesk/files', `host-grotesk-latin-${w}-normal.woff`);

const fonts = new Map<number, opentype.Font>();
function font(weight: 500 | 600): opentype.Font {
  let f = fonts.get(weight);
  if (!f) {
    const buf = fs.readFileSync(fontFile(weight));
    f = opentype.parse(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) as ArrayBuffer);
    fonts.set(weight, f);
  }
  return f;
}

/** Trazado SVG de una línea de texto con tracking (em) y ajuste a un ancho máximo. */
function textPath(text: string, weight: 500 | 600, size: number, tracking: number, x: number, y: number, maxWidth: number) {
  const f = font(weight);
  const advance = (ch: string, s: number) => (f.charToGlyph(ch).advanceWidth ?? 0) * (s / f.unitsPerEm) + tracking * s;
  const measure = (s: number) => {
    let w = 0;
    for (const ch of text) w += advance(ch, s);
    return w - tracking * s;
  };
  let s = size;
  const w0 = measure(s);
  if (w0 > maxWidth) s = (s * maxWidth) / w0;
  let cx = x;
  let d = '';
  for (const ch of text) {
    const g = f.charToGlyph(ch);
    d += g.getPath(cx, y, s).toPathData(2);
    cx += advance(ch, s);
  }
  return { d, size: s };
}

export interface OgOptions {
  /** Nombre de archivo en src/assets/img */
  image: string;
  title: string;
  subtitle: string;
  footer?: string;
}

export async function renderOg({ image, title, subtitle, footer }: OgOptions): Promise<Buffer> {
  const photo = await sharp(path.join(root, 'src/assets/img', image))
    .resize(W, H, { fit: 'cover', position: 'centre' })
    .toBuffer();

  const left = 64;
  const name = textPath(title.toUpperCase(), 600, 104, -0.02, left, H - 150, W - left * 2);
  const sub = textPath(subtitle.toUpperCase(), 500, 26, 0.12, left, H - 92, W - left * 2);
  const foot = textPath((footer ?? SITE.url.replace(/^https?:\/\//, '')).toUpperCase(), 500, 20, 0.14, left, H - 48, 700);

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#000" stop-opacity=".45"/>
      <stop offset=".35" stop-color="#000" stop-opacity=".05"/>
      <stop offset=".62" stop-color="#000" stop-opacity=".55"/>
      <stop offset="1" stop-color="#000" stop-opacity=".92"/>
    </linearGradient>
    <linearGradient id="gl" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#000" stop-opacity=".45"/>
      <stop offset=".7" stop-color="#000" stop-opacity="0"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#g)"/>
  <rect width="${W}" height="${H}" fill="url(#gl)"/>
  <rect x="${left}" y="${H - 268}" width="64" height="6" fill="#ff0006"/>
  <path d="${name.d}" fill="#fff"/>
  <path d="${sub.d}" fill="#e6e6e6"/>
  <path d="${foot.d}" fill="#bdbdbd"/>
</svg>`;

  const logo = await sharp(path.join(root, 'src/assets/img/logo_white.webp')).resize({ width: 230 }).png().toBuffer();

  return sharp(photo)
    .composite([
      { input: Buffer.from(svg), top: 0, left: 0 },
      { input: logo, top: 52, left },
    ])
    .png({ palette: true, quality: 82, effort: 7, dither: 1, compressionLevel: 9 })
    .toBuffer();
}
