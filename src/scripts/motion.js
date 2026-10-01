// @ts-nocheck
/**
 * Animaciones (GSAP + ScrollTrigger, empaquetados desde npm). Se carga como chunk aparte
 * desde main.js cuando el navegador está libre y nunca con `prefers-reduced-motion`.
 */
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { attachGsap } from './smooth.js';

gsap.registerPlugin(ScrollTrigger);
gsap.defaults({ ease: 'power3.out' });
ScrollTrigger.config({ ignoreMobileResize: true });
// Lenis (si está activo) pasa a ser movido por gsap.ticker y avisa a ScrollTrigger en cada scroll
attachGsap(gsap, ScrollTrigger);

var enterTl = null;
var api = null;

export function refreshNow() {
  ScrollTrigger.refresh();
}
var rfT;
export function refresh() {
  clearTimeout(rfT);
  rfT = setTimeout(function () {
    ScrollTrigger.refresh();
  }, 0);
}
export function playEnter() {
  if (enterTl) enterTl.play();
}

/** Altura de las secciones fijadas (sticky) = alto visible + recorrido horizontal. */
function stkSize(sec) {
  var st = sec.querySelector(':scope>.stk, :scope>.wrap');
  if (!st) return 0;
  var h = st.getBoundingClientRect().height,
    d;
  if (sec.hasAttribute('data-day')) d = Math.round(window.innerHeight * 0.75 * 5);
  else {
    var tr = sec.querySelector('.track,.strip');
    d = tr ? Math.max(0, tr.scrollWidth - window.innerWidth) : 0;
  }
  sec.style.height = Math.round(h + d) + 'px';
  return d;
}

function splitWords(el) {
  if (el.dataset.split) return;
  el.dataset.split = '1';
  var nodes = Array.prototype.slice.call(el.childNodes),
    out = document.createDocumentFragment();
  nodes.forEach(function (n) {
    if (n.nodeType === 3) {
      n.textContent.split(/(\s+)/).forEach(function (part) {
        if (!part) return;
        if (/^\s+$/.test(part)) {
          out.appendChild(document.createTextNode(' '));
          return;
        }
        var w = document.createElement('span');
        w.className = 'w';
        var i = document.createElement('i');
        i.textContent = part;
        w.appendChild(i);
        out.appendChild(w);
      });
    } else if (n.nodeType === 1 && n.tagName === 'BR') {
      out.appendChild(n);
    } else if (n.nodeType === 1) {
      var w = document.createElement('span');
      w.className = 'w';
      var i = document.createElement('i');
      i.appendChild(n);
      w.appendChild(i);
      out.appendChild(w);
    }
  });
  el.textContent = '';
  el.appendChild(out);
  el.classList.add('splt');
}

/** Cede el hilo principal entre bloques de inicialización: tareas cortas = menos Total Blocking Time. */
function yieldMain() {
  return new Promise(function (resolve) {
    if (window.scheduler && window.scheduler.yield) window.scheduler.yield().then(resolve);
    else setTimeout(resolve, 0);
  });
}

export async function initMotion(a) {
  api = a;
  var pad = a.pad;
  var root = document.getElementById('main');

  /* titulares: separar en palabras ANTES de construir las animaciones */
  document
    .querySelectorAll('.t-h,.chap-head .name,.cta .q,.finale,.mf .lead,.ten .t-lead,.hs .lead .t-h')
    .forEach(splitWords);
  await yieldMain();

  /* botones magnéticos (escritorio) */
  if (window.matchMedia('(hover:hover) and (pointer:fine)').matches) {
    document.querySelectorAll('.lnk,.arrows button,.burger,.tsel .tabs li,.card,.sel-btn').forEach(function (el) {
      el.classList.add('mag');
      var qx = gsap.quickTo(el, 'x', { duration: 0.5, ease: 'power3' }),
        qy = gsap.quickTo(el, 'y', { duration: 0.5, ease: 'power3' });
      el.addEventListener('mousemove', function (e) {
        var r = el.getBoundingClientRect();
        qx((e.clientX - (r.left + r.width / 2)) * 0.18);
        qy((e.clientY - (r.top + r.height / 2)) * 0.28);
      });
      el.addEventListener('mouseleave', function () {
        qx(0);
        qy(0);
      });
    });
  }

  ScrollTrigger.addEventListener('refreshInit', function () {
    document.querySelectorAll('[data-hs],[data-gal],[data-day]').forEach(stkSize);
  });
  await yieldMain();

  {
    enterTl = null;
    var hero = root.querySelector('.hero');
    if (hero) {
      enterTl = gsap.timeline({ delay: 0.1, paused: true });
      enterTl
        .to(hero.querySelectorAll('.tag .l span'), { y: 0, duration: 1.1, stagger: 0.09, ease: 'expo.out' })
        .to(hero.querySelectorAll('.card'), { y: 0, opacity: 1, duration: 0.9, stagger: 0.12 }, '-=.6')
        .to(hero.querySelectorAll('.meta'), { opacity: 1, duration: 0.8 }, '-=.5');
    }
    var ph = root.querySelector('.phero');
    if (ph) {
      enterTl = gsap.timeline({ delay: 0.15, paused: true });
      enterTl
        .fromTo(ph.querySelector('.cue'), { opacity: 0 }, { opacity: 1, duration: 0.8 });
      var pm = ph.querySelector('img,video');
      if (pm) gsap.fromTo(pm, { scale: 1.08 }, { scale: 1, duration: 2.2, ease: 'expo.out' });
      gsap.to(ph.querySelector('.in'), {
        y: -60,
        opacity: 0,
        ease: 'none',
        scrollTrigger: { trigger: ph, start: 'top top', end: 'bottom top', scrub: true },
      });
    }
    if (enterTl && a.isReady()) enterTl.play();
    await yieldMain();

    /* revelados (IntersectionObserver: dispara cuando el elemento está realmente en pantalla) */
    var io = new IntersectionObserver(
      function (es) {
        es.forEach(function (e) {
          if (e.isIntersecting) {
            io.unobserve(e.target);
            var fns = e.target.__rv || [];
            e.target.__rv = null;
            fns.forEach(function (fn) {
              fn();
            });
          }
        });
      },
      { rootMargin: '0px 0px -6% 0px', threshold: 0 },
    );
    function onSee(el, fn) {
      (el.__rv = el.__rv || []).push(fn);
      io.observe(el);
    }
    gsap.utils.toArray('[data-r]', root).forEach(function (el) {
      var m = el.getAttribute('data-r');
      if (m === 'clip') return;
      var from = m === 'x' ? { x: 90, opacity: 0 } : m === 'x2' ? { x: -90, opacity: 0 } : { y: 40, opacity: 0 };
      gsap.set(el, from);
      onSee(el, function () {
        gsap.to(el, { x: 0, y: 0, opacity: 1, duration: 1.3, ease: 'expo.out' });
      });
    });
    await yieldMain();
    /* parallax en imágenes */
    gsap.utils.toArray('[data-p]', root).forEach(function (img) {
      var s = parseFloat(img.getAttribute('data-p')) || 0.1,
        d = Math.round(s * (window.innerWidth < 900 ? 170 : 400));
      var trg =
        img.tagName === 'IMG'
          ? img.closest('.feature,.a,.b,.pic,figure') || img.parentElement
          : img.closest('.stage') || img.parentElement;
      gsap.fromTo(
        img,
        { y: -d },
        { y: d, ease: 'none', scrollTrigger: { trigger: trg, start: 'top bottom', end: 'bottom top', scrub: true } },
      );
    });
    await yieldMain();
    /* palabras gigantes */
    gsap.utils.toArray('[data-giant]', root).forEach(function (el) {
      if (el.getAttribute('data-giant') === 'rise') {
        gsap.fromTo(
          el,
          { yPercent: 60, opacity: 0.2 },
          { yPercent: 0, opacity: 1, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'top 55%', scrub: true } },
        );
      } else {
        gsap.fromTo(
          el,
          { xPercent: 6 },
          { xPercent: -6, ease: 'none', scrollTrigger: { trigger: el.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } },
        );
      }
    });
    /* revelado con máscara + tarjetas */
    gsap.utils.toArray('[data-r="clip"]', root).forEach(function (el) {
      var img = el.querySelector('img');
      onSee(el, function () {
        var t = gsap.timeline();
        t.to(el, { clipPath: 'inset(0% 0 0 0)', duration: 1.5, ease: 'expo.out' }, 0);
        if (img) t.to(img, { scale: 1, duration: 1.8, ease: 'expo.out' }, 0);
      });
    });
    gsap.utils.toArray('.cards', root).forEach(function (c) {
      var cs = c.querySelectorAll('.c');
      if (!cs.length) return;
      onSee(c, function () {
        gsap.to(cs, { y: 0, opacity: 1, duration: 1, stagger: 0.14, ease: 'expo.out' });
      });
    });

    await yieldMain();
    /* secciones fijadas: amenities, galerías, reloj */
    function buildHs(sec) {
      var track = sec.querySelector('.track'),
        slides = sec.querySelectorAll('.slide'),
        n = slides.length,
        prog = sec.querySelector('.prog i');
      a.numberHs(sec);
      stkSize(sec);
      gsap.to(track, {
        x: function () {
          return -(track.scrollWidth - window.innerWidth);
        },
        ease: 'none',
        scrollTrigger: {
          trigger: sec,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.6,
          invalidateOnRefresh: true,
          onUpdate: function (st) {
            prog.style.width = st.progress * 100 + '%';
            var i = Math.round(st.progress * (n - 1));
            slides.forEach(function (sl, k) {
              sl.classList.toggle('act', k === i);
            });
          },
        },
      });
      slides[0].classList.add('act');
    }
    function buildGal(sec) {
      var strip = sec.querySelector('.strip');
      stkSize(sec);
      gsap.to(strip, {
        x: function () {
          return -(strip.scrollWidth - window.innerWidth);
        },
        ease: 'none',
        scrollTrigger: { trigger: sec, start: 'top top', end: 'bottom bottom', scrub: 0.6, invalidateOnRefresh: true },
      });
    }
    function buildDay(sec) {
      var imgs = sec.querySelectorAll('.imgs img'),
        caps = sec.querySelectorAll('.cap p'),
        tEl = sec.querySelector('#dayTime'),
        hand = sec.querySelector('#dayHand'),
        arc = sec.querySelector('#dayArc');
      var times = ['07:00', '09:00', '13:00', '17:00', '21:00'],
        cur = -1;
      function setStep(i) {
        if (i === cur) return;
        cur = i;
        imgs.forEach(function (im, k) {
          im.classList.toggle('on', k === i);
        });
        caps.forEach(function (c, k) {
          c.classList.toggle('on', k === i);
        });
        tEl.textContent = times[i];
      }
      setStep(0);
      stkSize(sec);
      ScrollTrigger.create({
        trigger: sec,
        start: 'top top',
        end: 'bottom bottom',
        scrub: true,
        invalidateOnRefresh: true,
        onUpdate: function (st) {
          var p = st.progress;
          setStep(Math.min(times.length - 1, Math.floor(p * times.length)));
          hand.style.transform = 'rotate(' + ((7 + p * 14) / 24) * 360 + 'deg)';
          arc.style.strokeDashoffset = 1 - p * (14 / 24);
        },
      });
    }
    gsap.utils.toArray('[data-hs],[data-gal],[data-day]', root).forEach(function (sec) {
      if (sec.hasAttribute('data-hs')) buildHs(sec);
      else if (sec.hasAttribute('data-gal')) buildGal(sec);
      else buildDay(sec);
    });
    await yieldMain();
    /* titulares por palabras */
    gsap.utils.toArray('.splt', root).forEach(function (el) {
      var ws = el.querySelectorAll('.w i');
      if (!ws.length) return;
      gsap.set(ws, { y: '110%' });
      onSee(el, function () {
        gsap.to(ws, { y: 0, duration: 1.1, stagger: 0.045, ease: 'expo.out' });
      });
    });
    /* contadores */
    gsap.utils.toArray('.specs b,.big10,.num', root).forEach(function (el) {
      var node = el.childNodes[0];
      if (!node || node.nodeType !== 3) return;
      var raw = el.dataset.n || (el.dataset.n = node.textContent.trim());
      var m = /^(\d[\d.,]*)(.*)$/.exec(raw);
      if (!m) return;
      var target = parseFloat(m[1].replace(/\./g, '').replace(',', '.')),
        suffix = m[2];
      if (isNaN(target) || raw.indexOf('–') > -1) return;
      var o = { v: 0 };
      node.textContent = '0' + suffix;
      onSee(el, function () {
        gsap.to(o, {
          v: target,
          duration: 1.6,
          ease: 'expo.out',
          onUpdate: function () {
            node.textContent = (Number.isInteger(target) ? Math.round(o.v) : o.v.toFixed(1)).toString() + suffix;
          },
          onComplete: function () {
            node.textContent = raw;
          },
        });
      });
    });
    await yieldMain();
    /* progreso de scroll */
    var spi = document.querySelector('#sp i');
    if (spi) {
      gsap.set(spi, { scaleX: 0 });
      gsap.to(spi, { scaleX: 1, ease: 'none', scrollTrigger: { trigger: root, start: 'top top', end: 'bottom bottom', scrub: 0.3 } });
    }
    /* tiras arrastrables: entran deslizando */
    gsap.utils.toArray('.strip3', root).forEach(function (st) {
      var f = st.querySelectorAll('figure');
      gsap.set(f, { x: 80, opacity: 0 });
      onSee(st, function () {
        gsap.to(f, { x: 0, opacity: 1, duration: 1.2, stagger: 0.08, ease: 'expo.out' });
      });
    });
    /* otros proyectos + socios: entrada escalonada */
    gsap.utils.toArray('.more,.partners', root).forEach(function (g) {
      var f = g.querySelectorAll(g.classList.contains('more') ? 'a' : 'figure');
      if (!f.length) return;
      gsap.set(f, { y: 60, opacity: 0 });
      onSee(g, function () {
        gsap.to(f, { y: 0, opacity: 1, duration: 1.2, stagger: 0.1, ease: 'expo.out' });
      });
    });
    var intro = root.querySelector('.intro');
    if (intro)
      gsap.to(intro.querySelector('.pic img'), {
        yPercent: -8,
        ease: 'none',
        scrollTrigger: { trigger: intro, start: 'top top', end: 'bottom top', scrub: true },
      });
    await yieldMain();
    ScrollTrigger.sort();
    ScrollTrigger.refresh();
    // un único refresh tardío (fuentes/imágenes que cambian alturas); antes había dos más
    setTimeout(function () {
      ScrollTrigger.refresh();
    }, 1500);
  }
}
