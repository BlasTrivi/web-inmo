import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

/**
 * Notas (blog). Una nota = un archivo `.md` en `src/content/notas/` + su imagen de portada en `src/assets/img/`.
 * El nombre del archivo es la URL: `mi-nota.md` -> /notas/mi-nota/
 */
const notas = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/notas' }),
  schema: z.object({
    title: z.string(),
    /** Resumen para el listado, el buscador y las redes (1–2 frases) */
    description: z.string(),
    /** Fecha de publicación (AAAA-MM-DD) */
    date: z.coerce.date(),
    /** Nombre de archivo de la portada dentro de src/assets/img (ej. boston_facade.webp) */
    cover: z.string(),
    coverAlt: z.string(),
    author: z.string().default('INMO Desarrollos'),
    tags: z.array(z.string()).default([]),
    /** true = no se publica (ni siquiera se genera la página) */
    draft: z.boolean().default(false),
    /** true = nota de ejemplo: lleva la insignia "Nota de ejemplo", noindex y no entra en sitemap, llms ni RSS */
    ejemplo: z.boolean().default(false),
  }),
});

export const collections = { notas };
