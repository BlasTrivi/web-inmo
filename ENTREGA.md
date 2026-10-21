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

## Actualizar unidades disponibles

Las unidades de "Unidades disponibles" salen de `src/data/units.ts` (clave = slug del proyecto), generado desde la lista de precios mensual (Excel, una hoja por proyecto).

1. `pip install openpyxl` (una vez).
2. Desde la raíz: `python -I scripts/units-from-xlsx.py "ruta/al/excel.xlsx"`
3. Revisar el resumen que imprime (unidades por proyecto) y el diff de `src/data/units.ts`. Hojas nuevas: agregarlas a `SHEET_TO_SLUG` en el script.

Trinity 2 y Laguna Club no tienen hoja: muestran el aviso "consultá con un asesor".

**Precios**: están cargados pero no se publican. El flag `SHOW_PRICES` (`src/config/site.ts`, marcado `TODO-CLIENTE`) está en `false`; con `true` se muestran precios ("USD 245.000") y condiciones comerciales (forma de pago, cochera/baulera, vigencia). Con `false` el HTML no contiene ningún precio.

## Funciones recientes (notas técnicas)

- **`SHOW_PRICES`** (`src/config/site.ts`): flag que decide si se publican precios y condiciones comerciales en "Unidades disponibles". En `false` (hoy) el HTML no contiene ningún precio; ver el detalle arriba. Marcado `TODO-CLIENTE`.
- **`src/data/units.ts` y script mensual**: las unidades disponibles son datos generados (no editar a mano). Cada mes: `python -I scripts/units-from-xlsx.py "<excel>"` (ver "Actualizar unidades disponibles"). Los proyectos sin hoja muestran el aviso "consultá con un asesor". La sección es `src/components/Disponibles.astro`: tabla en escritorio, tarjetas en móvil, "Ver todas" pliega/despliega a partir de 8 unidades, y el botón "Contactá a tu asesor" abre WhatsApp con el proyecto ya indicado (`ASESOR` / `asesorLink` en `site.ts`).
- **`src/scripts/rotator.js`**: rotador de fotos con fundido cruzado (portada de la home y bloques del manifiesto). Se arma con `data-rot` (+ `data-rot-int`, ms) en el contenedor y `<img class="rs">` por foto; las fotos extra llevan `data-defer` y no se piden hasta que el rotador entra en juego. No rota con `prefers-reduced-motion` ni con ahorro de datos. La leyenda de la portada se actualiza con `data-rcap`. Para sumar una foto basta con agregar otro `<img class="rs" data-defer …>`.
- **Planos en miniatura ("Más planos")**: en `.mplans .mp-row` de cada tipología, `<figure class="plan mini" data-title="título del modal">`. Al hacer clic se abre el visor `#pd` (misma navegación anterior/siguiente que los planos principales). Ver el comentario de `src/scripts/plans.js`.
- **Campo `phase` del menú** (`src/data/projects.ts`): cada proyecto declara `phase: 'curso' | 'terminado'`; el menú agrupa automáticamente en "Proyectos en curso" y "Proyectos terminados y entregados" (`menuGroups`). Para mover un proyecto de grupo, cambiar solo ese campo.
- **`CURSOR_RULES`** (`src/scripts/main.js`): tabla `selector → texto` del cursor personalizado (escritorio). Alternativa por elemento: `data-cursor="Texto"` (o `data-cursor=""` para silenciarlo). Gana el ancestro más cercano.
- **Imágenes de portada**: `CTX.hero` (`src/lib/images.ts`) usa en celular (≤700px) candidatos de hasta 1280w (`<source media>`), y el preload de la primera foto emite los mismos `imagesrcset`/`imagesizes` con su `media`. Si se agrega otra portada, no hay que tocar nada.

## 10. Lighthouse

Medido sobre el build final (`dist/` servido en local con `npx serve`, Lighthouse CLI, Chrome headless). Las filas de `/trinity-3/` en adelante son de la medición anterior (no se repitieron). Columnas: Performance / Accesibilidad / Buenas prácticas / SEO.

| Página | Móvil (P/A/BP/SEO) | Escritorio (P/A/BP/SEO) |
|---|---|---|
| Home `/` | 94 / 100 / 100 / 100 (mediana de 3: 93, 98, 94; en 9 corridas 93-98) | 100 / 100 / 100 / 100 |
| `/trinity-2/` | 96 / 100 / 100 / 100 (mediana de 3: 98, 96, 96) | 100 / 100 / 100 / 100 |
| `/the-address/` | 97 / 100 / 100 / 100 | 100 / 100 / 100 / 100 |
| `/president-tower/` | 97 / 100 / 100 / 100 | 100 / 100 / 100 / 100 |
| `/boston-842/` | 98 / 100 / 100 / 100 | 100 / 100 / 100 / 100 |
| `/trinity-3/` | 98 / 100 / 100 / 100 | 99 / 100 / 100 / 100 |
| `/laguna-club/` | 96 / 100 / 100 / 100 | 99 / 100 / 100 / 100 |
| `/infinity/` | 97 / 100 / 100 / 100 (1 corrida; antes 92-99) | 100 / 100 / 100 / 100 |
| `/trinity-1/` | 97 / 100 / 100 / 100 | 99 / 100 / 100 / 100 |
| `/notas/` | 99 / 100 / 100 / 66 | 100 / 100 / 100 / 66 |
| `/notas/<nota de ejemplo>/` | 99 / 100 / 100 / 66 | 100 / 100 / 100 / 66 |
| `/privacidad/` | 100 / 100 / 100 / 100 | 100 / 100 / 100 / 100 |

Notas:
- Las filas de Home a Boston 842 se midieron sobre el build final de esta versión (con rotadores, tablas de unidades y planos en miniatura). Las demás son de la medición anterior.
- Home móvil queda en 93-98 (mediana 94): el TBT ronda 120-225 ms (parseo del HTML de la home + inicialización de GSAP/Lenis tras el `load`), no los rotadores ni las tablas. Las páginas de proyecto con tablas de unidades y planos en miniatura dan 96-98.
- Portadas en celular: antes pedían ~480w (sizes="100vw" sobre un recorte `cover` alto) y se veían blandas. Ahora `CTX.hero` (`src/lib/images.ts`) ofrece 750/960/1080/1280w a calidad 45 vía `<source media="(max-width:700px)">`: 750w a 1x y 1.75x, 960w a 2x, 1280w a 3x, y cada archivo pesa menos que el de 750w que se servía antes. El preload de la primera foto lleva los mismos `imagesrcset`/`imagesizes` con su `media`.
- Importante al medir: cada corrida de Lighthouse deja procesos de Chrome huérfanos si no se los cierra, y con unas decenas abiertas el TBT se dispara (de ~100 ms a 1.500-3.000 ms) y el Performance móvil cae a 60-80. Cerrar Chrome entre corridas.
- SEO 66 en `/notas/` y en las notas de ejemplo es **intencional**: llevan `noindex` mientras no haya notas reales (falla solo la auditoría `is-crawlable`). Al publicar una nota real sin `ejemplo: true`, `/notas/` y esa nota pasan a 100.
- El Performance móvil varía 90-99 entre corridas de la misma página (TBT de 0 a ~300 ms; el sitio carga GSAP/Lenis en un chunk aparte tras el `load`, y las secciones bajo el pliegue usan `content-visibility:auto` hasta ese momento para abaratar el primer layout). En un hosting real con CDN y compresión Brotli el resultado suele ser mejor que en el servidor local de prueba. Accesibilidad, Buenas prácticas y SEO: 100 en todas las páginas indexables.
- `/404.html` no se audita con Lighthouse (responde con status 404).

