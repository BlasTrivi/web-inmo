# INMO Desarrollos · Guía de entrega para el equipo técnico

Sitio estático generado con [Astro](https://astro.build). No requiere servidor de aplicación ni base de datos: el build produce HTML, CSS, JS e imágenes listos para servir desde cualquier hosting estático o CDN.

## 1. Build

| Item | Valor |
|---|---|
| Node.js | `>= 22.12.0` (ver `.nvmrc` y `engines` en `package.json`) |
| Instalar | `npm ci` |
| Build | `npm run build` |
| Carpeta de salida | `dist/` |
| Previsualizar local | `npm run preview` |

> El primer build tarda varios minutos: genera variantes AVIF/WebP de ~150 fotos y las imágenes Open Graph. Conviene cachear `node_modules/.astro` entre builds si el CI lo permite.

## 2. Dominio

El dominio configurado es **`https://inmo.com.py`**. Si el sitio se publica en otro dominio, cambiar **una sola línea** antes del build:

- `SITE_URL` en `src/config/site.ts` (de ahí lo toma `astro.config.mjs`).

De ese valor dependen canonical, sitemap, `robots.txt`, `llms.txt`, Open Graph y datos estructurados. **Un dominio incorrecto rompe el SEO**, verificarlo antes de publicar.

## 3. Rutas y archivos generados

- Páginas: `/`, `/trinity-2/`, `/the-address/`, `/president-tower/`, `/boston-842/`, `/trinity-3/`, `/laguna-club/`, `/infinity/`
- Errores: `404.html`, `500.html`
- SEO / IA: `/sitemap.xml`, `/sitemap-index.xml`, `/robots.txt`, `/llms.txt`, `/llms-full.txt`, `/index.md`, `/<slug>.md`, `/og/*.png`, `/manifest.webmanifest`, `/humans.txt`, `/.well-known/security.txt`

Las URLs usan **barra final** (`/trinity-2/`). Los enlaces viejos con hash (`#/trinity-2`) se redirigen en el navegador; no requieren reglas en el servidor.

## 4. Recomendaciones de servidor

No se incluyen archivos de configuración de plataforma: quedan a criterio del hosting. Para mantener Lighthouse 95+ y buenas prácticas se recomienda:

### Obligatorio
- **HTTPS** con redirección 301 desde HTTP.
- **Página 404**: servir `/404.html` con status `404` para rutas inexistentes (y `/500.html` para errores del servidor, si aplica).
- **Barra final**: redirigir 301 `/ruta` → `/ruta/` cuando exista la carpeta, y `/ruta/index.html` → `/ruta/`.
- **Compresión** Brotli (o gzip) para HTML, CSS, JS, SVG, JSON, XML, TXT y MD.

### Caché
| Ruta | `Cache-Control` |
|---|---|
| `/_astro/*` (archivos con hash) | `public, max-age=31536000, immutable` |
| `/og/*` | `public, max-age=86400, stale-while-revalidate=604800` |
| `/favicon-*` | `public, max-age=604800` |
| HTML | `public, max-age=0, must-revalidate` |

### Tipos MIME
- `.md` → `text/markdown; charset=utf-8`
- `.txt` → `text/plain; charset=utf-8`
- `.webmanifest` → `application/manifest+json`
- `.avif` → `image/avif`, `.woff2` → `font/woff2`

### Headers de seguridad sugeridos
```
X-Content-Type-Options: nosniff
X-Frame-Options: SAMEORIGIN
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=()
Cross-Origin-Opener-Policy: same-origin
Strict-Transport-Security: max-age=31536000; includeSubDomains
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; frame-src https://*.urbania3d.app; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'self'; upgrade-insecure-requests
```
La CSP permite los scripts inline del sitio y el embebido de los showrooms 3D (`*.urbania3d.app`). Si se agregan analytics o tags de terceros, hay que sumar sus dominios.

## 5. Checklist post-deploy

- [ ] `https://<dominio>/` carga y los canonical apuntan al dominio real.
- [ ] Una URL inexistente devuelve status **404** con la página de marca.
- [ ] `/robots.txt`, `/sitemap.xml` y `/llms.txt` responden 200.
- [ ] Lighthouse (móvil) sobre la home y un proyecto: las 4 categorías ≥ 95.
- [ ] Compartir un link en WhatsApp muestra la imagen OG.
- [ ] Dar de alta el sitemap en Google Search Console y Bing Webmaster Tools.
- [ ] Renovar `Expires` de `security.txt` (en `src/config/site.ts`) antes de 2027-09-30.
