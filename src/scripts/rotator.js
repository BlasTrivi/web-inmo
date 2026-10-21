// @ts-nocheck
/**
 * Rotador de fotos con fundido cruzado (portada y manifiesto). Markup:
 *   <div data-rot data-rot-int="6500" data-rot-delay="0">      ← cualquier contenedor
 *     <picture><img class="rs on" …></picture>                 ← foto visible (la única que pide el HTML)
 *     <picture><img class="rs" data-defer data-n="…" data-h="…" …></picture>   ← sin src: data-src / data-srcset
 *     <a data-rcap></a>                                         ← (opcional) leyenda con el proyecto de la foto actual
 *   </div>
 * - Las fotos diferidas se piden recién cuando el rotador entra en juego (carga + idle, o viewport) y de a una: la siguiente.
 * - Solo rota con el contenedor en pantalla y la pestaña visible. Con prefers-reduced-motion o ahorro de datos no rota.
 * - El fundido es CSS (.rs / .rs.on en global.css).
 */
var html = document.documentElement;

function reduced() {
  return html.classList.contains('reduce') || (window.matchMedia && window.matchMedia('(prefers-reduced-motion:reduce)').matches);
}

function loadSlide(img) {
  if (img.__p) return img.__p;
  var ds = img.getAttribute('data-src');
  if (!ds) return (img.__p = Promise.resolve());
  img.__p = new Promise(function (res) {
    var pic = img.parentNode;
    var srcEl = pic && pic.tagName === 'PICTURE' ? pic.querySelector('source[data-srcset]') : null;
    img.addEventListener('load', function () { (img.decode ? img.decode() : Promise.resolve()).catch(function () {}).then(res); }, { once: true });
    img.addEventListener('error', res, { once: true });
    if (srcEl) {
      srcEl.setAttribute('srcset', srcEl.getAttribute('data-srcset'));
      srcEl.removeAttribute('data-srcset');
    }
    img.setAttribute('src', ds);
    img.removeAttribute('data-src');
  });
  return img.__p;
}

function setup(root) {
  var slides = [].slice.call(root.querySelectorAll('img.rs'));
  if (slides.length < 2 || root.__rot) return;
  root.__rot = true;
  var every = parseInt(root.getAttribute('data-rot-int'), 10) || 6500;
  var delay = parseInt(root.getAttribute('data-rot-delay'), 10) || 0;
  var cap = root.querySelector('[data-rcap]');
  var cur = 0;
  var timer = 0;
  var seen = false;
  var first = true;
  slides.forEach(function (s, i) {
    if (i) s.setAttribute('aria-hidden', 'true');
  });

  function show(i) {
    var prev = slides[cur];
    var nxt = slides[i];
    prev.classList.remove('on');
    prev.classList.add('out');
    prev.setAttribute('aria-hidden', 'true');
    setTimeout(function () { prev.classList.remove('out'); }, 1500);
    nxt.classList.remove('out');
    nxt.classList.add('on');
    nxt.removeAttribute('aria-hidden');
    cur = i;
    if (cap) {
      var n = nxt.getAttribute('data-n');
      var h = nxt.getAttribute('data-h');
      cap.classList.add('chg');
      setTimeout(function () {
        if (n) cap.querySelector('b').textContent = n;
        if (h) cap.setAttribute('href', h);
        cap.classList.remove('chg');
      }, 350);
    }
  }
  function run() {
    return seen && !document.hidden && !reduced();
  }
  function plan() {
    clearTimeout(timer);
    if (!run()) return;
    var nx = (cur + 1) % slides.length;
    loadSlide(slides[nx]); // la siguiente se pide con tiempo
    var wait = every + (first ? delay : 0);
    timer = setTimeout(function advance() {
      if (!run()) return;
      first = false;
      loadSlide(slides[nx]).then(function () {
        if (!run()) return;
        show(nx);
        plan();
      });
    }, wait);
  }
  var io = new IntersectionObserver(
    function (es) {
      seen = es[es.length - 1].isIntersecting;
      plan();
    },
    { threshold: 0.25 },
  );
  io.observe(root);
  document.addEventListener('visibilitychange', plan);
}

export function initRotators() {
  if (reduced()) return;
  var c = navigator.connection;
  if (c && c.saveData) return;
  if (!('IntersectionObserver' in window)) return;
  [].slice.call(document.querySelectorAll('[data-rot]')).forEach(setup);
}
