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

> El primer build tarda varios minutos: genera variantes WebP de ~150 fotos y las imágenes Open Graph. Conviene cachear `node_modules/.astro` entre builds si el CI lo permite.

## 2. Dominio

El dominio configurado es **`https://inmo.com.py`**. Si el sitio se publica en otro dominio, cambiar **una sola línea** antes del build:

- `SITE_URL` en `src/config/site.ts` (de ahí lo toma `astro.config.mjs`).

De ese valor dependen canonical, sitemap, `robots.txt`, `llms.txt`, Open Graph y datos estructurados. **Un dominio incorrecto rompe el SEO**, verificarlo antes de publicar.

## 3. Rutas y archivos generados

- Páginas: `/`, `/trinity-2/`, `/the-address/`, `/president-tower/`, `/boston-842/`, `/trinity-3/`, `/laguna-club/`, `/infinity/`, `/trinity-1/`
- Notas (blog): `/notas/`, `/notas/<slug>/` y el feed `/notas/rss.xml`
- Legales: `/terminos/`, `/privacidad/`, `/cookies/` (borradores, ver sección 8)
- Errores: `404.html`, `500.html`
- SEO / IA: `/sitemap.xml`, `/sitemap-index.xml`, `/robots.txt`, `/llms.txt`, `/llms-full.txt`, `/index.md`, `/<slug>.md`, `/og/*.png` (incluye `/og/notas/*.png`), `/manifest.webmanifest`, `/humans.txt`, `/.well-known/security.txt`

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
- `.woff2` → `font/woff2`

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
La CSP permite los scripts inline del sitio y el embebido de los showrooms 3D (`frame-src https://*.urbania3d.app`). Si se agregan analytics o tags de terceros (Google Analytics, Meta Pixel, etc.), hay que sumar sus dominios a `script-src`, `connect-src` e `img-src`, y condicionar su carga al consentimiento (sección 6).

## 5. Checklist post-deploy

- [ ] `https://<dominio>/` carga y los canonical apuntan al dominio real.
- [ ] Una URL inexistente devuelve status **404** con la página de marca.
- [ ] `/robots.txt`, `/sitemap.xml` y `/llms.txt` responden 200.
- [ ] Lighthouse (móvil) sobre la home y un proyecto: las 4 categorías ≥ 95.
- [ ] Compartir un link en WhatsApp muestra la imagen OG.
- [ ] Dar de alta el sitemap en Google Search Console y Bing Webmaster Tools.
- [ ] Los textos legales fueron revisados por un abogado y los datos de la sección 9 están completos.
- [ ] Los showrooms 3D cargan tras aceptar "Contenido de terceros" (si el proveedor bloquea el embebido, el visor ofrece "Abrir en pestaña nueva").
- [ ] Renovar `Expires` de `security.txt` (en `src/config/site.ts`) antes de 2027-09-30.

## 6. Cookies y consentimiento

El sitio **no usa cookies ni analytics hoy**. Hay un banner de consentimiento (`src/components/CookieConsent.astro`, lógica en `src/scripts/consent.js`) con cuatro categorías:

| Categoría | Estado | Qué controla |
|---|---|---|
| Necesarias | siempre activa | recordar la elección (`localStorage`, clave `inmo-consent`) |
| Analítica | apagada por defecto | nada cargado hoy; reservada para analytics |
| Marketing | apagada por defecto | nada cargado hoy; reservada para píxeles |
| Contenido de terceros | apagada por defecto | los **showrooms 3D** (iframes de urbania3d.app) **solo se cargan con este permiso** (o con el botón "Cargar showroom 3D") |

- La elección vence a los `LEGAL.consentMonths` (12) meses. Subir `LEGAL.consentVersion` en `src/config/site.ts` (hoy `2`) vuelve a preguntar a todos.
- El enlace "Preferencias de cookies" del pie reabre el panel.
- Para sumar analytics: cargar el script solo si `window.inmoConsent.has('analytics')` y escuchar el evento `consent-change`; actualizar la CSP y `src/data/legal.ts` (política de cookies y privacidad).

## 7. WhatsApp y formulario de contacto

- **Botón flotante de WhatsApp**: `src/components/Chrome.astro`. Los textos del mensaje están en `WA_MESSAGES` (`src/config/site.ts`); `{proyecto}` se reemplaza por el nombre del proyecto de la página.
- **Formulario de contacto** (home, `src/content/home/11-contacto.html`): arma el mensaje y **abre WhatsApp** con el texto listo. No hay backend y **no se guarda ningún dato**.
- Número, correo, dirección y redes: `src/config/site.ts`.

## 8. Dónde editar el contenido

| Qué | Dónde |
|---|---|
| Empresa, dominio, contacto, redes, textos de WhatsApp, versión de consentimiento | `src/config/site.ts` |
| Datos de proyectos (nombre, estado, textos SEO, ficha) | `src/data/projects.ts` |
| Orden de los proyectos | `PROJECT_ORDER` en `src/data/projects.ts` |
| Stock (`disponible` / `ultimas` / `agotado`) y segmento (`premium` / `residencial`) | campos `stock` y `segment` de cada proyecto |
| Secciones de cada proyecto | `src/content/projects/<slug>/NN-<id>.html` |
| Secciones de la home | `src/content/home/*.html` |
| Notas | `src/content/notas/*.md` |
| Textos legales (borradores) | `src/data/legal.ts` |
| Fotos | `src/assets/img/` (se convierten a WebP en el build) |

**Publicar una nota**: crear `src/content/notas/<slug>.md` (el nombre del archivo es la URL) con este frontmatter (esquema en `src/content.config.ts`) y la portada en `src/assets/img/`:

```yaml
---
title: "Título"
description: "Resumen de 1-2 frases"
date: 2026-10-20
cover: archivo-portada.webp
coverAlt: "Descripción de la imagen"
author: "INMO Desarrollos"   # opcional
tags: ["Proyectos"]          # opcional
---
```

- `ejemplo: true` marca una nota de ejemplo (insignia, `noindex`, fuera de sitemap, llms.txt y RSS); `draft: true` la oculta por completo. **Para publicar, no incluir ninguna de las dos** (o borrar `ejemplo: true`).
- Las dos notas actuales son de ejemplo: **borrarlas o quitarles `ejemplo: true`** antes de publicar. Mientras no haya notas reales, `/notas/` queda `noindex` y fuera del sitemap.
- Los textos legales (`src/data/legal.ts`) son **borradores: requieren revisión de un abogado** antes de publicar.
- Favicon: `public/favicon.svg` (+ PNG 64/180/512) y logos en `public/brand/`.
- Imágenes: el build genera solo **WebP** (no se generan AVIF).

## 9. Pendientes del cliente

- **Datos legales**: razón social completa, RUC y datos registrales, domicilio legal, responsable de datos personales (correo), proveedor y ubicación del hosting, plazos de conservación de consultas, si habrá comunicaciones comerciales; **revisión legal** de términos, privacidad y cookies.
- Nombres y mensajes de los directores (sección Nosotros).
- Textos de los mensajes de WhatsApp (`WA_MESSAGES`).
- Contenido de las notas (hoy solo hay 2 de ejemplo).
- Confirmar el dominio **inmo.com.py**.
- The Address: planos de planta.
- President Tower: disponibilidad y áreas de los dúplex.
- Laguna Club y Trinity: confirmar datos de ficha, stock y segmento (ver `TODO-CLIENTE`).
- Validar los textos de "Por qué INMO" en la home.

### Marcadores `TODO-CLIENTE` en el código

```
src/data/projects.ts:19   stock de cada edificio
src/data/projects.ts:28   segmento de cada proyecto
src/data/projects.ts:44   campo stock
src/data/projects.ts:46   campo segmento
src/data/projects.ts:369  Trinity 1: confirmar stock (hoy 100% vendido)
src/components/Chrome.astro:35   texto del mensaje de WhatsApp
src/config/site.ts:46            textos de WA_MESSAGES
src/data/legal.ts:13             lista de datos legales pendientes
src/data/legal.ts:22             RUC y datos registrales
src/data/legal.ts:235            plazos de conservación
src/content/home/10-por-que-inmo.html:2   validar textos
```
Listarlos de nuevo: `rg TODO-CLIENTE src`.

## 10. Lighthouse

Medido sobre el build final (`dist/` servido en local, Lighthouse CLI, Chrome headless). Columnas: Performance / Accesibilidad / Buenas prácticas / SEO.

| Página | Móvil (P/A/BP/SEO) | Escritorio (P/A/BP/SEO) |
|---|---|---|
| Home `/` | 96 / 100 / 100 / 100 (mediana de 3: 96, 94, 98) | 99 / 100 / 100 / 100 |
| `/trinity-2/` | 98 / 100 / 100 / 100 (mediana de 3: 98, 92, 98) | 100 / 100 / 100 / 100 |
| `/the-address/` | 99 / 100 / 100 / 100 | 100 / 100 / 100 / 100 |
| `/president-tower/` | 99 / 100 / 100 / 100 | 100 / 100 / 100 / 100 |
| `/boston-842/` | 95 / 100 / 100 / 100 (1 corrida; antes mediana 95) | 100 / 100 / 100 / 100 |
| `/trinity-3/` | 98 / 100 / 100 / 100 | 99 / 100 / 100 / 100 |
| `/laguna-club/` | 96 / 100 / 100 / 100 | 99 / 100 / 100 / 100 |
| `/infinity/` | 97 / 100 / 100 / 100 (1 corrida; antes 92-99) | 100 / 100 / 100 / 100 |
| `/trinity-1/` | 97 / 100 / 100 / 100 | 99 / 100 / 100 / 100 |
| `/notas/` | 99 / 100 / 100 / 66 | 100 / 100 / 100 / 66 |
| `/notas/<nota de ejemplo>/` | 99 / 100 / 100 / 66 | 100 / 100 / 100 / 66 |
| `/privacidad/` | 100 / 100 / 100 / 100 | 100 / 100 / 100 / 100 |

Notas:
- SEO 66 en `/notas/` y en las notas de ejemplo es **intencional**: llevan `noindex` mientras no haya notas reales (falla solo la auditoría `is-crawlable`). Al publicar una nota real sin `ejemplo: true`, `/notas/` y esa nota pasan a 100.
- El Performance móvil varía 90-99 entre corridas de la misma página (TBT de 0 a ~300 ms; el sitio carga GSAP/Lenis en un chunk aparte tras el `load`, y las secciones bajo el pliegue usan `content-visibility:auto` hasta ese momento para abaratar el primer layout). En un hosting real con CDN y compresión Brotli el resultado suele ser mejor que en el servidor local de prueba. Accesibilidad, Buenas prácticas y SEO: 100 en todas las páginas indexables.
- `/404.html` no se audita con Lighthouse (responde con status 404).

