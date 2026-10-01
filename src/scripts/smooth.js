// @ts-nocheck
/**
 * Scroll suave con inercia (Lenis). Módulo compartido entre main.js y motion.js.
 * - Solo rueda de mouse: en táctiles queda el scroll nativo (syncTouch: false).
 * - Nunca se inicia con prefers-reduced-motion (`html.reduce`).
 * - Un único bucle rAF propio hasta que GSAP toma el control (attachGsap), sin doble raf.
 */
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';

var lenis = null;
var rafId = 0;

function loop(t) {
  if (!lenis) return;
  lenis.raf(t);
  rafId = requestAnimationFrame(loop);
}

/** Contenedores con scroll propio: se desplazan nativos, Lenis no los intercepta. */
function prevent(node) {
  return !!(node.matches && node.matches('.menu .mcol, #gv, #sr, #srF'));
}

export function initSmooth() {
  if (lenis || document.documentElement.classList.contains('reduce')) return lenis;
  // táctiles: scroll nativo (Lenis no aporta y sus clases/listeners pueden interferir con iframes interactivos)
  if (window.matchMedia('(hover: none), (pointer: coarse)').matches) return null;
  lenis = new Lenis({
    lerp: 0.09,
    smoothWheel: true,
    syncTouch: false,
    autoRaf: false,
    prevent: prevent,
  });
  rafId = requestAnimationFrame(loop);
  return lenis;
}

export function getLenis() {
  return lenis;
}

/** GSAP pasa a manejar el tick: ScrollTrigger se actualiza con cada scroll de Lenis. */
export function attachGsap(gsap, ScrollTrigger) {
  if (!lenis) return;
  cancelAnimationFrame(rafId);
  rafId = 0;
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add(function (t) {
    lenis.raf(t * 1000);
  });
  gsap.ticker.lagSmoothing(0);
}

/** Salto/desplazamiento programático: Lenis si está activo, nativo si no. */
export function scrollToY(y, opts) {
  opts = opts || {};
  if (lenis) {
    lenis.scrollTo(y, opts.immediate ? { immediate: true, force: true } : {});
  } else {
    window.scrollTo({ top: y, behavior: opts.immediate ? 'auto' : 'smooth' });
  }
}
