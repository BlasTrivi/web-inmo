import type { APIRoute, GetStaticPaths } from 'astro';
import { projects } from '../data/projects';
import { projectMarkdown } from '../lib/content';

export const getStaticPaths = (() =>
  projects.map((p) => ({ params: { slug: p.slug }, props: { project: p } }))) satisfies GetStaticPaths;

export const GET: APIRoute = ({ props }) =>
  new Response(projectMarkdown(props.project), { headers: { 'Content-Type': 'text/markdown; charset=utf-8' } });
