// @ts-nocheck
/**
 * Comportamiento del sitio (puerto del script original de una sola página a páginas reales).
 *
 * - Todo lo que NO necesita GSAP vive acá (menú, visores, selector de tipologías, formulario,
 *   acordeón, showroom 3D, telón de transición entre páginas, preloader).
 * - Las animaciones (GSAP + ScrollTrigger) están en ./motion.js y se cargan como un chunk aparte,
 *   recién cuando el navegador está libre (idle) o ante la primera interacción. Así no compiten
 *   con el LCP. Con `prefers-reduced-motion` no se descargan.
 */
import { initSmooth, getLenis, scrollToY } from './smooth.js';
import { initPlans } from './plans.js';
import './consent.js';

(function () {
  var html = document.documentElement;
  var body = document.body;
  var reduce = html.classList.contains('reduce');
  var pad = function (n) {
    return (n < 10 ? '0' : '') + n;
  };
  var main = document.getElementById('main');
  // scroll suave (Lenis): null con reduced-motion
  // Lenis se inicia junto con GSAP (idle / primera interacción): su constructor fuerza un reflow que retrasaba el primer paint
  function ensureLenis() {
    return initSmooth();
  }
  // overlays: detienen/reanudan el scroll de la página (además del overflow:hidden)
  function lenisLock(on) {
    var l = getLenis();
    if (!l) return;
    if (on) l.stop();
    else if (!overlayOpen()) l.start();
  }
  function overlayOpen() {
    return (
      (menu && menu.classList.contains('open')) ||
      document.getElementById('gv').classList.contains('open') ||
      document.getElementById('sr').classList.contains('open') ||
      (document.getElementById('pd') && document.getElementById('pd').open) ||
      html.classList.contains('pre-on')
    );
  }
  var motion = null; // módulo ./motion.js cuando está cargado
  var ready = false; // preloader / telón terminados (las animaciones de entrada esperan esto)
  var store = {
    get: function (k) {
      try {
        return window.sessionStorage.getItem(k);
      } catch (e) {
        return null;
      }
    },
    set: function (k, v) {
      try {
        window.sessionStorage.setItem(k, v);
      } catch (e) {}
    },
    del: function (k) {
      try {
        window.sessionStorage.removeItem(k);
      } catch (e) {}
    },
  };
  var routes = {};
  try {
    routes = JSON.parse(body.getAttribute('data-routes') || '{}');
  } catch (e) {}

  var rfT;
  function rf() {
    if (!motion) return;
    clearTimeout(rfT);
    rfT = setTimeout(function () {
      motion.refresh();
    }, 180);
  }

  /* ---- menú ---- */
  var menu = document.getElementById('menu');
  var burger = document.getElementById('burger');
  var trans = document.getElementById('trans');
  var transTxt = document.getElementById('transTxt');
  function setMenu(open) {
    menu.classList.toggle('open', open);
    setTimeout(hdrTick, 20);
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    burger.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
    body.style.overflow = open ? 'hidden' : '';
    lenisLock(open);
    if (open) menu.classList.add('warm');
    else showMenuImg(null);
    var bars = burger.querySelectorAll('i');
    bars[0].style.transform = open ? 'translateY(3.75px) rotate(45deg)' : '';
    bars[1].style.transform = open ? 'translateY(-3.75px) rotate(-45deg)' : '';
    bars[1].style.width = open ? '26px' : '';
    burger.querySelector('.bl').textContent = open ? 'Cerrar' : 'Menú';
    if (open) loadMenuImgs();
  }
  /* foto del panel lateral: cambia según el edificio con hover/foco; las capas se cargan al abrir el menú por primera vez (solo en pantallas anchas) */
  var mCap = document.getElementById('menuCap');
  var mLayers = menu.querySelectorAll('.mimg .ml');
  var mWide = window.matchMedia('(min-width:901px)');
  var mLoaded = false;
  var mCur = '0';
  function loadMenuImgs() {
    if (mLoaded || !mWide.matches) return;
    mLoaded = true;
    mLayers.forEach(function (im) {
      if (im.dataset.srcset) im.srcset = im.dataset.srcset;
    });
  }
  function showMenuImg(a) {
    var k = a && a.dataset.k && menu.querySelector('.mimg .ml[data-k="' + a.dataset.k + '"]') ? a.dataset.k : '0';
    if (k === mCur) return;
    mCur = k;
    loadMenuImgs();
    mLayers.forEach(function (im) {
      im.classList.toggle('on', im.dataset.k === k);
    });
    mCap.textContent = (k !== '0' && a.dataset.cap) || mCap.dataset.def;
  }
  var mCol = menu.querySelector('.mn') || menu.querySelector('ul').parentNode;
  mCol.querySelectorAll('a').forEach(function (a) {
    a.addEventListener('mouseenter', function () {
      showMenuImg(a);
    });
    a.addEventListener('focus', function () {
      if (a.matches(':focus-visible')) showMenuImg(a);
    });
  });
  mCol.addEventListener('mouseleave', function () {
    showMenuImg(null);
  });
  mCol.addEventListener('focusout', function (e) {
    if (!e.relatedTarget || !e.currentTarget.contains(e.relatedTarget)) showMenuImg(null);
  });
  burger.addEventListener('click', function () {
    setMenu(!menu.classList.contains('open'));
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && menu.classList.contains('open')) setMenu(false);
  });

  /* ---- telón de transición + navegación entre páginas ---- */
  function curtain(title, mid) {
    transTxt.textContent = title;
    if (reduce) {
      mid();
      return;
    }
    trans.classList.remove('out');
    trans.classList.add('in');
    setTimeout(mid, 760);
    setTimeout(function () {
      trans.classList.remove('in');
      trans.classList.add('out');
    }, 1000);
    setTimeout(function () {
      trans.classList.remove('out');
    }, 1750);
  }

  function titleFor(u) {
    if (u.hash && routes[u.pathname + u.hash]) return routes[u.pathname + u.hash];
    var el = u.hash ? document.getElementById(decodeURIComponent(u.hash.slice(1))) : null;
    if (el && el.getAttribute('data-title')) return el.getAttribute('data-title');
    return routes[u.pathname] || 'INMO Desarrollos';
  }

  // salto inmediato (durante el telón); con Lenis se sincroniza su posición interna
  function jump(y) {
    var l = getLenis();
    if (l) l.scrollTo(y, { immediate: true, force: true });
    else window.scrollTo(0, y);
  }
  function scrollToSec(id) {
    var el = id ? document.getElementById(id) : null;
    if (!el) {
      jump(0);
      return;
    }
    var off = parseFloat(el.getAttribute('data-anchor-offset')) || 0; // anclas dentro de una sección: dejan lugar al header
    var go = function () {
      jump(el.getBoundingClientRect().top + window.scrollY - off);
    };
    go();
    if (motion) {
      motion.refreshNow();
      go();
    }
    // el layout puede seguir moviéndose (acordeón, fuentes, alturas de secciones fijadas):
    // corregimos la posición un par de veces mientras la persona no haya vuelto a desplazar
    userMoved = false;
    [500, 1200].forEach(function (ms) {
      setTimeout(function () {
        var d = el.getBoundingClientRect().top - off;
        if (!userMoved && Math.abs(d) > 3 && Math.abs(d) < 700) go();
      }, ms);
    });
  }
  var userMoved = false;
  ['wheel', 'touchstart', 'keydown', 'pointerdown'].forEach(function (ev) {
    window.addEventListener(
      ev,
      function () {
        userMoved = true;
      },
      { passive: true },
    );
  });

  document.addEventListener('click', function (e) {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    var a = e.target.closest && e.target.closest('a[href]');
    if (!a || a.target === '_blank' || a.hasAttribute('download')) return;
    var href = a.getAttribute('href');
    if (!href || /^(mailto:|tel:|javascript:)/.test(href)) return;
    var u;
    try {
      u = new URL(a.href, location.href);
    } catch (err) {
      return;
    }
    if (u.origin !== location.origin) return;
    if (/\.(md|txt|xml|png|webmanifest)$/.test(u.pathname)) return;

    // botón "volver arriba": desplazamiento suave sin telón
    if (a.classList.contains('up')) {
      e.preventDefault();
      if (getLenis()) getLenis().scrollTo(0);
      else window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
      return;
    }
    if (menu.classList.contains('open')) setMenu(false);

    if (u.pathname === location.pathname) {
      // misma página: ancla interna o "inicio"
      e.preventDefault();
      var id = u.hash ? decodeURIComponent(u.hash.slice(1)) : '';
      if (u.hash && !document.getElementById(id)) return;
      curtain(titleFor(u), function () {
        if (id) {
          history.pushState(null, '', u.pathname + u.hash);
          scrollToSec(id);
        } else {
          if (location.hash) history.pushState(null, '', u.pathname);
          jump(0);
        }
      });
      return;
    }
    // otra página: telón que cubre y continúa en la página siguiente
    if (reduce) return;
    e.preventDefault();
    store.set('inmo-curtain', titleFor(u));
    transTxt.textContent = titleFor(u);
    trans.classList.remove('out');
    trans.classList.add('in');
    setTimeout(function () {
      location.href = u.href;
    }, 720);
  });
  // bfcache: al volver con "atrás" el telón no debe quedar puesto
  window.addEventListener('pageshow', function (e) {
    if (e.persisted) {
      html.classList.remove('curtain-in');
      trans.classList.remove('in', 'out');
    }
  });

  /* ---- cursor personalizado con acción contextual ----
     Una sola fuente de verdad: data-cursor="Texto" en cualquier elemento (data-cursor="" lo silencia) o, si no lo tiene,
     la tabla CURSOR_RULES (selector -> texto o función). Se resuelve subiendo desde el elemento bajo el puntero:
     gana el ancestro más cercano; a igual nivel, la primera regla. Solo en mouseover (no en cada mousemove). */
  var cur = document.getElementById('cur');
  var cx = 0,
    cy = 0,
    tx = 0,
    ty = 0;
  var expanded = function (el, yes, no) {
    return el.getAttribute('aria-expanded') === 'true' ? yes : no;
  };
  var CURSOR_RULES = [
    // visores y modales
    ['.sre-shield', 'Explorar 3D'],
    ['.sre-exit', 'Salir'],
    ['#srX, #gvX, #pdX, .gv .x', 'Cerrar'],
    ['#pdPrev, #psPrev', 'Anterior'],
    ['#pdNext, #psNext', 'Siguiente'],
    ['#pdZoom', 'Acercar'],
    ['.pdstage', function () { return document.getElementById('pdStage').classList.contains('zoomed') ? 'Mover' : 'Acercar'; }],
    ['.emb-btn', 'Cargar 3D'],
    ['a[href*="urbania3d"]:not([data-no-modal])', 'Explorar 3D'],
    // cabecera y menú
    ['#burger', function (el) { return expanded(el, 'Cerrar', 'Abrir menú'); }],
    ['.topnav a', 'Elegir'],
    ['.brand', 'Inicio'],
    ['.mn-co a', 'Ir'],
    ['.mn-l a', 'Ver proyecto'],
    // contacto
    ['.wa, #ctxLnk, [data-asesor], a[href*="wa.me"], a[href*="api.whatsapp.com"]', 'Escribinos'],
    ['#fMail, #fWa, .form button[type="submit"]', 'Enviar'],
    ['a[href^="mailto:"]', 'Escribir'],
    ['a[href^="tel:"]', 'Llamar'],
    // cookies
    ['[data-cb="accept"]', 'Aceptar'],
    ['[data-cb="reject"]', 'Rechazar'],
    ['[data-cb="config"], [data-cb="back"], [data-cookie-prefs]', 'Ajustar'],
    // navegación de página
    ['.up', 'Subir'],
    ['.cue', 'Bajar'],
    // selects propios y pestañas
    ['.sel-btn, .sel-list li, .sel-wrap', 'Elegir'],
    ['.tsel .tabs li', 'Elegir'],
    // planos y galerías
    ['.plan-btn', 'Ver plano'],
    ['[data-gallery] figure', 'Ampliar'],
    // acordeones
    ['.auth-more summary', function (el) { return el.parentNode.open ? 'Cerrar' : 'Leer'; }],
    ['summary', function (el) { return el.parentNode.open ? 'Cerrar' : 'Abrir'; }],
    ['.mvv-b', function (el) { return expanded(el, 'Cerrar', 'Abrir'); }],
    ['.done>li.ex', function (el) { return el.classList.contains('open') ? 'Cerrar' : 'Abrir'; }],
    // tarjetas de proyecto y notas
    ['.ncard-a', 'Leer nota'],
    ['.hero .card.k', 'Leer'],
    ['.pslider a, .more a, .feature a, .hero .card, .done .ficha a[href^="/"]', 'Ver proyecto'],
    // enlaces sin acción propia: externos "Abrir ↗", internos "Ir"
    ['a[target="_blank"]', 'Abrir ↗'],
    ['a[href]', 'Ir'],
    // contenedores: arrastre horizontal y secciones fijadas por scroll vertical
    ['.pslider, .strip2, .strip3', 'Arrastrá'],
    ['.hs, .gal, .day', 'Scroll ↓']
  ];
  var cursorLabel = function (t) {
    for (var el = t; el && el.nodeType === 1; el = el.parentNode) {
      if (el.hasAttribute('data-cursor')) return el.getAttribute('data-cursor');
      for (var i = 0; i < CURSOR_RULES.length; i++) {
        if (el.matches(CURSOR_RULES[i][0])) {
          var v = CURSOR_RULES[i][1];
          return typeof v === 'function' ? v(el) : v;
        }
      }
    }
    return null;
  };
  var interactive = 'a,button,select,label,summary,.done li.ex,.tsel .tabs li,.sel-list li';
  if (window.matchMedia('(hover:hover) and (pointer:fine)').matches) {
    var lbl = cur.querySelector('.lbl');
    var shown = '';
    var vw = window.innerWidth;
    var flip = false;
    var curPd = document.getElementById('pd');
    window.addEventListener('resize', function () {
      vw = window.innerWidth;
    });
    document.addEventListener('mousemove', function (e) {
      tx = e.clientX;
      ty = e.clientY;
      if (cur.classList.contains('off')) {
        // primera aparición / regreso a la ventana: sin recorrido desde la última posición
        cx = tx;
        cy = ty;
        cur.classList.remove('off');
      }
    });
    // dentro de un iframe (showroom 3D) o fuera de la ventana la página no recibe mousemove:
    // ocultamos el cursor para que no quede congelado encima
    document.addEventListener('mouseout', function (e) {
      if (!e.relatedTarget || e.relatedTarget.tagName === 'IFRAME') cur.classList.add('off');
    });
    document.addEventListener('mouseover', function (e) {
      var t = e.target;
      if (!t || t.nodeType !== 1) return;
      var text = cursorLabel(t);
      var isBig = !!t.closest(interactive);
      cur.classList.toggle('big', isBig || !!text);
      cur.classList.toggle('lab', !!text);
      if (text && text !== shown) {
        lbl.textContent = text;
        shown = text;
      }
    });
    // el burger / acordeones cambian de estado sin mover el puntero: re-resolvemos al terminar el clic
    document.addEventListener('click', function (e) {
      var t = document.elementFromPoint(e.clientX, e.clientY);
      if (!t) return;
      var text = cursorLabel(t);
      if (text && text !== shown) {
        lbl.textContent = text;
        shown = text;
      }
    });
    (function loop() {
      cx += reduce ? tx - cx : (tx - cx) * 0.18;
      cy += reduce ? ty - cy : (ty - cy) * 0.18;
      // el rótulo va a la derecha del puntero; cerca del borde derecho pasa a la izquierda
      var f = tx > vw - 190;
      if (f !== flip) {
        flip = f;
        cur.classList.toggle('flip', f);
      }
      cur.style.transform = 'translate(' + cx + 'px,' + cy + 'px) translate(-50%,-50%)';
      requestAnimationFrame(loop);
    })();
    // <dialog> modal (planos) vive en la top layer y taparía el cursor: mientras está abierto, el cursor se muda adentro
    if (curPd) {
      new MutationObserver(function () {
        var host = curPd.hasAttribute('open') ? curPd : document.body;
        if (cur.parentNode !== host) host.appendChild(cur);
      }).observe(curPd, { attributes: true, attributeFilter: ['open'] });
    }
    document.addEventListener('pointerdown', function () {
      cur.classList.add('grabbing');
    });
    document.addEventListener('pointerup', function () {
      cur.classList.remove('grabbing');
    });
    // soltar fuera de la ventana / cancelar / perder el foco no dispara pointerup: no dejamos el cursor "agarrando"
    ['pointercancel', 'blur'].forEach(function (ev) {
      window.addEventListener(ev, function () {
        cur.classList.remove('grabbing');
      });
    });
    document.documentElement.addEventListener('mouseleave', function () {
      cur.classList.remove('grabbing', 'lab', 'big');
    });
  }

  /* ---- flecha "Bajar" del hero de proyecto: baja a la siguiente sección ---- */
  var heroCue = document.querySelector('.phero .cue');
  if (heroCue) {
    heroCue.addEventListener('click', function () {
      var ph = heroCue.closest('.phero');
      scrollToY(ph ? ph.getBoundingClientRect().bottom + window.scrollY : window.innerHeight);
    });
  }

  /* ---- arrastrar para desplazar: slider de proyectos + tiras ---- */
  function dragScroll(el, snap) {
    var down = false,
      sx = 0,
      sl = 0,
      moved = false,
      endTimer = 0,
      pid = null;
    el.addEventListener('dragstart', function (e) {
      e.preventDefault();
    });
    el.addEventListener('pointerdown', function (e) {
      // solo mouse: en táctil/lápiz el navegador ya hace el scroll nativo (arrastrar a mano duplicaría el movimiento)
      if (e.pointerType !== 'mouse' || e.button !== 0) return;
      down = true;
      moved = false;
      pid = e.pointerId;
      sx = e.clientX;
      sl = el.scrollLeft;
      clearTimeout(endTimer);
      cur.classList.add('grabbing');
    });
    window.addEventListener('pointermove', function (e) {
      if (!down) return;
      var dx = e.clientX - sx;
      if (!moved && Math.abs(dx) > 4) {
        moved = true;
        // recién al superar el umbral es un arrastre: se apaga el hover de las tarjetas (sin parpadeos)
        el.classList.add('dragging');
        try {
          el.setPointerCapture(pid);
        } catch (_) {}
      }
      if (moved) el.scrollLeft = sl - dx;
    });
    function end() {
      if (!down) return;
      down = false;
      cur.classList.remove('grabbing');
      try {
        el.releasePointerCapture(pid);
      } catch (_) {}
      if (snap && moved) {
        var a = el.querySelector('a,figure');
        var step = a.getBoundingClientRect().width + 10;
        var n = el.querySelectorAll('a,figure').length;
        var dxT = el.scrollLeft - sl;
        var i0 = Math.round(sl / step);
        var i = Math.abs(dxT) > 60 ? (dxT > 0 ? i0 + 1 : i0 - 1) : i0;
        i = Math.max(0, Math.min(n - 1, i));
        el.scrollTo({ left: i * step, behavior: 'smooth' });
      }
      // el estado "arrastrando" (sin hover, sin snap) dura lo que tarda el scroll suave; luego se limpia todo,
      // incluido `moved`, para que un clic o Enter posterior no se ignore
      endTimer = setTimeout(function () {
        el.classList.remove('dragging');
        moved = false;
      }, 750);
    }
    window.addEventListener('pointerup', end);
    window.addEventListener('pointercancel', end);
    window.addEventListener('blur', end);
    document.documentElement.addEventListener('mouseleave', end);
    el.addEventListener(
      'click',
      function (e) {
        if (moved) {
          e.preventDefault();
          e.stopPropagation();
        }
      },
      true,
    );
  }
  /* secciones fijadas (amenities, galería): arrastrar o rueda horizontal mueve el scroll de la página */
  document.querySelectorAll('.hs,.gal').forEach(function (sec) {
    var down = false,
      lx = 0,
      moved = false;
    sec.addEventListener('dragstart', function (e) {
      e.preventDefault();
    });
    sec.addEventListener('pointerdown', function (e) {
      if (e.button !== 0) return;
      down = true;
      moved = false;
      lx = e.clientX;
      cur.classList.add('grabbing');
    });
    window.addEventListener('pointermove', function (e) {
      if (!down) return;
      var dx = e.clientX - lx;
      lx = e.clientX;
      if (Math.abs(dx) > 1) {
        moved = true;
        jump(window.scrollY - dx * 1.5);
      }
    });
    window.addEventListener('pointerup', function () {
      if (down) {
        down = false;
        cur.classList.remove('grabbing');
      }
    });
    sec.addEventListener(
      'click',
      function (e) {
        if (moved) {
          e.preventDefault();
          e.stopPropagation();
        }
      },
      true,
    );
    sec.addEventListener(
      'wheel',
      function (e) {
        if (Math.abs(e.deltaX) > Math.abs(e.deltaY) && Math.abs(e.deltaX) > 2) {
          e.preventDefault();
          jump(window.scrollY + e.deltaX);
        }
      },
      { passive: false },
    );
    var lead = sec.querySelector('.slide.lead .r');
    if (lead)
      lead.addEventListener('click', function () {
        if (moved) return;
        var dy = Math.round(window.innerWidth * 0.9);
        if (getLenis()) getLenis().scrollTo(getLenis().targetScroll + dy);
        else window.scrollBy({ top: dy, behavior: 'smooth' });
      });
  });
  var ps = document.getElementById('pslider');
  if (ps) {
    dragScroll(ps, true);
    var psDots = document.querySelectorAll('#psDots i');
    var psStep = function () {
      var a = ps.querySelector('a');
      return a.getBoundingClientRect().width + 10;
    };
    document.getElementById('psPrev').addEventListener('click', function () {
      ps.scrollBy({ left: -psStep(), behavior: 'smooth' });
    });
    document.getElementById('psNext').addEventListener('click', function () {
      ps.scrollBy({ left: psStep(), behavior: 'smooth' });
    });
    ps.addEventListener(
      'scroll',
      function () {
        var i = Math.round(ps.scrollLeft / psStep());
        psDots.forEach(function (d, k) {
          d.classList.toggle('on', k === Math.min(i, psDots.length - 1));
        });
      },
      { passive: true },
    );
  }
  document.querySelectorAll('.strip3').forEach(function (s) {
    dragScroll(s, false);
  });

  /* ---- manifiesto: tachados ---- */
  var fin = document.getElementById('fin');
  if (fin) {
    new IntersectionObserver(
      function (es, o) {
        es.forEach(function (e) {
          if (e.isIntersecting) {
            fin.querySelectorAll('li').forEach(function (li, i) {
              setTimeout(function () {
                li.classList.add('cut');
              }, 400 + i * 650);
            });
            o.unobserve(fin);
          }
        });
      },
      { threshold: 0.4 },
    ).observe(fin);
  }

  /* ---- barra de contexto (proyecto visible + WhatsApp) ---- */
  var ctx = document.getElementById('ctx'),
    ctxNm = document.getElementById('ctxNm'),
    ctxSt = document.getElementById('ctxSt'),
    ctxLnk = document.getElementById('ctxLnk'),
    active = {},
    ctxTimer;
  function ctxUpdate() {
    var keys = Object.keys(active).filter(function (k) {
      return active[k] > 0;
    });
    clearTimeout(ctxTimer);
    if (keys.length) {
      var parts = keys[0].split('|');
      ctxNm.textContent = parts[0].replace(/ (?=\d)/g, '\u00a0'); // "Trinity 2": el número no se separa del nombre
      ctxSt.textContent = parts[1];
      // "Contactá a tu asesor" (mismo mensaje que asesorLink() de src/config/site.ts); oculto en 100% vendido
      ctxLnk.textContent = 'Contactá a tu asesor';
      ctxLnk.hidden = /vendido/i.test(parts[1] || '');
      ctxLnk.href = 'https://wa.me/595981044061?text=' + encodeURIComponent('Hola, estoy en la web mirando ' + decodeURIComponent(parts[2]) + ' y quiero hablar con un asesor.');
      ctx.classList.add('on');
    } else {
      ctxTimer = setTimeout(function () {
        ctx.classList.remove('on');
      }, 150);
    }
  }
  /* la barra se aparta (se oculta) cuando taparía el final de la lista de niveles/tipologías o su pista */
  var dodgeEls = document.querySelectorAll('.tsel .tabs li:last-child, .tsel .hint');
  var dodgeRaf = 0;
  function ctxDodge() {
    dodgeRaf = 0;
    if (!ctx || !dodgeEls.length) return;
    var bottom = parseFloat(getComputedStyle(ctx).bottom) || 0;
    var top = window.innerHeight - bottom - ctx.offsetHeight - 14;
    var left = ctx.offsetLeft,
      right = ctx.offsetLeft + ctx.offsetWidth + 14;
    var hit = false;
    dodgeEls.forEach(function (el) {
      var r = el.getBoundingClientRect();
      if (r.bottom > top && r.top < window.innerHeight && r.right > left && r.left < right) hit = true;
    });
    ctx.classList.toggle('dodge', hit);
  }
  function ctxDodgeSoon() {
    if (!dodgeRaf) dodgeRaf = requestAnimationFrame(ctxDodge);
  }
  if (dodgeEls.length) {
    window.addEventListener('scroll', ctxDodgeSoon, { passive: true });
    window.addEventListener('resize', ctxDodgeSoon);
    ctxDodgeSoon();
  }
  (function () {
    var els = document.querySelectorAll('[data-ctx]');
    if (!els.length) return;
    var io = new IntersectionObserver(
      function (es) {
        es.forEach(function (e) {
          var k = e.target.getAttribute('data-ctx');
          active[k] = (active[k] || 0) + (e.isIntersecting ? 1 : -1);
          if (active[k] < 0) active[k] = 0;
        });
        ctxUpdate();
      },
      { rootMargin: '-40% 0px -40% 0px', threshold: 0 },
    );
    els.forEach(function (el) {
      io.observe(el);
    });
  })();

  /* ---- visor vertical de galería ([data-gallery]) ---- */
  var gv = document.getElementById('gv'),
    gvCol = document.getElementById('gvCol'),
    gvLab = gv.querySelector('.lab');
  var gvIo = new IntersectionObserver(
    function (es) {
      es.forEach(function (e) {
        e.target.classList.toggle('on', e.isIntersecting);
      });
    },
    { root: gv, threshold: 0.5 },
  );
  function gvOpen(figs, label, idx) {
    gvCol.innerHTML = '';
    gvLab.textContent = label;
    var items = [];
    figs.forEach(function (f, i) {
      var img = f.querySelector('img');
      var fig = document.createElement('figure');
      if (f.classList.contains('plan')) fig.className = 'plan';
      var im = document.createElement('img');
      im.src = img.getAttribute('data-full') || img.currentSrc || img.src;
      im.alt = img.alt;
      im.decoding = 'async';
      if (img.naturalWidth) {
        im.width = img.naturalWidth;
        im.height = img.naturalHeight;
      }
      var c = document.createElement('figcaption');
      c.className = 't-label mid';
      c.textContent = pad(i + 1) + ' · ' + img.alt;
      fig.appendChild(im);
      fig.appendChild(c);
      gvCol.appendChild(fig);
      items.push(fig);
      gvIo.observe(fig);
    });
    gv.classList.add('open');
    gv.removeAttribute('inert');
    body.style.overflow = 'hidden';
    lenisLock(true);
    document.getElementById('gvX').focus({ preventScroll: true });
    setTimeout(function () {
      items[idx].scrollIntoView({ block: 'center' });
    }, 30);
  }
  document.querySelectorAll('[data-gallery]').forEach(function (wrap) {
    var figs = wrap.querySelectorAll('figure'),
      label = wrap.getAttribute('data-gallery'),
      sx = 0;
    wrap.addEventListener('pointerdown', function (e) {
      sx = e.clientX;
    });
    figs.forEach(function (f, i) {
      // el rol/foco va en la <img>: <figure role="button"> no es un rol ARIA permitido
      var fimg = f.querySelector('img');
      fimg.setAttribute('tabindex', '0');
      fimg.setAttribute('role', 'button');
      fimg.setAttribute('aria-label', 'Ampliar: ' + (fimg.alt || 'imagen ' + (i + 1)));
      f.addEventListener('click', function (e) {
        if (Math.abs(e.clientX - sx) > 6) return;
        gvOpen(figs, label, i);
      });
      fimg.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          gvOpen(figs, label, i);
        }
      });
    });
  });
  function gvClose() {
    if (gv.contains(document.activeElement)) document.activeElement.blur();
    gv.classList.remove('open');
    gv.setAttribute('inert', '');
    body.style.overflow = '';
    lenisLock(false);
  }
  document.getElementById('gvX').addEventListener('click', gvClose);
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && gv.classList.contains('open')) gvClose();
  });

  /* ---- selector de tipologías ---- */
  document.querySelectorAll('[data-tsel]').forEach(function (w) {
    var tabs = w.querySelectorAll('.tabs li'),
      panes = w.querySelectorAll('.pane');
    function go(i) {
      tabs.forEach(function (t, j) {
        t.classList.toggle('on', j === i);
        t.setAttribute('aria-selected', j === i ? 'true' : 'false');
      });
      panes.forEach(function (p, j) {
        p.classList.toggle('on', j === i);
        p.setAttribute('role', 'tabpanel');
        if (j === i) p.removeAttribute('aria-hidden');
        else p.setAttribute('aria-hidden', 'true');
      });
    }
    tabs.forEach(function (t, i) {
      t.setAttribute('role', 'tab');
      t.addEventListener('click', function () {
        go(i);
      });
      t.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          go(i);
        }
      });
      t.setAttribute('tabindex', '0');
    });
    go(0);
  });

  /* ---- planos en modal (<dialog>) ---- */
  initPlans({ lock: lenisLock });

  /* ---- botón flotante de WhatsApp: entra suave cuando terminó el preloader / telón ---- */
  (function () {
    var wa = document.getElementById('wa');
    if (!wa) return;
    var tries = 0;
    function enter() {
      if ((html.classList.contains('pre-on') || html.classList.contains('curtain-in')) && tries++ < 20) {
        setTimeout(enter, 400);
        return;
      }
      wa.classList.add('on');
    }
    // en la home el botón queda por encima de las tarjetas de la portada mientras estas se ven abajo
    var heroEl = document.querySelector('.hero');
    if (heroEl) {
      var lift = function () {
        wa.classList.toggle('wa-hero', heroEl.getBoundingClientRect().bottom > window.innerHeight - 24);
      };
      window.addEventListener('scroll', lift, { passive: true });
      window.addEventListener('resize', lift);
      lift();
    }
    var go = function () {
      setTimeout(enter, reduce ? 0 : 900);
    };
    if (document.readyState === 'complete') go();
    else window.addEventListener('load', go);
  })();

  /* ---- línea de tiempo ---- */
  var tlEl = document.getElementById('tl');
  if (tlEl) {
    var tgt = document.getElementById('tlwrap') || tlEl;
    new IntersectionObserver(
      function (es, o) {
        es.forEach(function (e) {
          if (e.isIntersecting) {
            tlEl.classList.add('on');
            o.unobserve(tgt);
          }
        });
      },
      { threshold: 0.05 },
    ).observe(tgt);
    var tlw = document.getElementById('tlwrap');
    if (tlw)
      tlw.addEventListener(
        'scroll',
        function () {
          var m = tlw.scrollWidth - tlw.clientWidth;
          if (m > 0) tlEl.style.setProperty('--tlp', Math.round(38 + (62 * tlw.scrollLeft) / m) + '%');
        },
        { passive: true },
      );
  }

  /* ---- formulario → WhatsApp (validación en línea, sin alert) ---- */
  var form = document.getElementById('form');
  if (form) {
    var setInvalid = function (input, errId, bad) {
      input.setAttribute('aria-invalid', bad ? 'true' : 'false');
      var el = document.getElementById(errId);
      if (el) el.hidden = !bad;
    };
    var checkName = function () {
      var bad = !form.nombre.value.trim();
      setInvalid(form.nombre, 'fNombreErr', bad);
      return !bad;
    };
    var checkPriv = function () {
      var bad = !form.priv.checked;
      setInvalid(form.priv, 'fPrivErr', bad);
      return !bad;
    };
    form.nombre.addEventListener('input', function () {
      if (form.nombre.getAttribute('aria-invalid') === 'true') checkName();
    });
    form.priv.addEventListener('change', function () {
      if (form.priv.getAttribute('aria-invalid') === 'true') checkPriv();
    });
    /* valida y arma el mensaje; send(canal) abre WhatsApp o el cliente de correo */
    var buildMsg = function () {
      var f = form;
      if (!checkName()) {
        f.nombre.focus();
        return null;
      }
      if (!checkPriv()) {
        f.priv.focus();
        return null;
      }
      var none = 'Ninguno en particular';
      return {
        n: f.nombre.value.trim(),
        t: f.tel.value.trim(),
        tema: f.tema ? f.tema.value : '',
        p: f.proyecto.value === none ? '' : f.proyecto.value,
        m: f.msg.value.trim(),
      };
    };
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var d = buildMsg();
      if (!d) return;
      var txt =
        'Hola, soy ' + d.n + (d.t ? ' (' + d.t + ')' : '') + '.' +
        (d.tema ? ' Tema: ' + d.tema + '.' : '') +
        (d.p ? ' Me interesa ' + d.p + '.' : '') +
        (d.m ? ' ' + d.m : '');
      window.open('https://wa.me/595981044061?text=' + encodeURIComponent(txt), '_blank', 'noopener');
    });
    var mailBtn = document.getElementById('fMail');
    if (mailBtn)
      mailBtn.addEventListener('click', function () {
        var d = buildMsg();
        if (!d) return;
        var to = form.dataset.mail || '';
        var subject = 'Consulta desde la web' + (d.tema ? ' · ' + d.tema : '') + (d.p ? ' · ' + d.p : '');
        var body =
          'Hola, soy ' + d.n + '.\n\n' +
          (d.tema ? 'Tema de interés: ' + d.tema + '\n' : '') +
          (d.p ? 'Proyecto de interés: ' + d.p + '\n' : '') +
          (d.t ? 'Teléfono: ' + d.t + '\n' : '') +
          (d.m ? '\n' + d.m + '\n' : '') +
          '\nEnviado desde inmo.com.py';
        window.location.href = 'mailto:' + to + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
      });
  }

  /* ---- numeración de amenities (sin GSAP) ---- */
  function numberHs(sec) {
    var sl = sec.querySelectorAll('.slide:not(.lead)');
    var lead = sec.querySelector('.slide.lead .n');
    if (lead) lead.textContent = 'Amenities · ' + pad(sl.length);
    sl.forEach(function (s, i) {
      s.querySelector('.n').textContent = pad(i + 1) + ' · ' + pad(sl.length);
    });
  }
  document.querySelectorAll('[data-hs]').forEach(numberHs);

  /* ---- imágenes de secciones fijadas: pasar a eager cuando la sección se acerca ---- */
  (function () {
    var secs = document.querySelectorAll('.hs,.gal,.day');
    if (!secs.length) return;
    var io = new IntersectionObserver(
      function (es) {
        es.forEach(function (e) {
          if (!e.isIntersecting) return;
          e.target.querySelectorAll('img[loading="lazy"]').forEach(function (im) {
            im.loading = 'eager';
          });
          io.unobserve(e.target);
        });
      },
      { rootMargin: '100% 0px 100% 0px' },
    );
    secs.forEach(function (s) {
      io.observe(s);
    });
  })();

  /* ---- misión / visión / valores (hover en desktop, tap/teclado en el resto) ---- */
  (function () {
    var root = document.getElementById('mvv');
    if (!root) return;
    var items = root.querySelectorAll('.mvv-item');
    // hover: solo con mouse real (fine pointer). Se abre al instante al mover el mouse sobre la fila completa.
    // El reflujo de layout (un panel que colapsa arriba) no cuenta: solo actuamos si cambian clientX/clientY.
    var hoverMq = window.matchMedia('(hover:hover) and (pointer:fine)');
    var LOCK = window.matchMedia('(prefers-reduced-motion:reduce)').matches ? 80 : 380; // ventana de animación; durante ella solo se recuerda la última fila realmente apuntada
    var lastX = -1,
      lastY = -1,
      lockUntil = 0,
      pending = null,
      pTimer = 0;
    function setOpen(it, open) {
      it.classList.toggle('open', open);
      it.querySelector('.mvv-b').setAttribute('aria-expanded', open ? 'true' : 'false');
    }
    function openOnly(it, byHover) {
      if (it.classList.contains('open')) return;
      lockUntil = byHover ? Date.now() + LOCK : 0;
      items.forEach(function (o) {
        setOpen(o, o === it);
      });
      var n = 0;
      var t = setInterval(function () {
        var l = getLenis();
        if (l && l.resize) l.resize();
        if (++n > 8) {
          clearInterval(t);
          rf();
        }
      }, 70);
      if (byHover) {
        clearTimeout(pTimer);
        pTimer = setTimeout(function () {
          var q = pending;
          pending = null;
          if (q && q !== it && hoverMq.matches) openOnly(q, true);
        }, LOCK + 20);
      }
    }
    root.classList.add('on');
    items.forEach(function (it) {
      var b = it.querySelector('.mvv-b');
      b.addEventListener('click', function () {
        pending = null;
        openOnly(it, false);
      });
      it.addEventListener('pointermove', function (e) {
        if (e.pointerType !== 'mouse' || !hoverMq.matches) return;
        var moved = e.clientX !== lastX || e.clientY !== lastY;
        lastX = e.clientX;
        lastY = e.clientY;
        if (!moved) return;
        if (Date.now() < lockUntil) {
          pending = it;
          return;
        }
        pending = null;
        openOnly(it, true);
      });
    });
  })();

  /* ---- acordeón (Entregados) ---- */
  (function () {
    var items = document.querySelectorAll('.done>li.ex');
    if (!items.length) return;
    function setOpen(li, open) {
      li.classList.toggle('open', open);
      var btn = li.querySelector('.nm'),
        fi = li.querySelector('.ficha');
      if (btn) btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      if (fi) {
        if (open) fi.removeAttribute('inert');
        else fi.setAttribute('inert', '');
      }
      setTimeout(rf, 950);
    }
    items.forEach(function (li) {
      function toggle() {
        var was = li.classList.contains('open');
        items.forEach(function (o) {
          if (o !== li) setOpen(o, false);
        });
        setOpen(li, !was);
      }
      li.addEventListener('click', function (e) {
        if (e.target.closest('.ficha')) return;
        toggle();
      });
      if (window.matchMedia('(hover:hover) and (pointer:fine)').matches) {
        li.addEventListener('mouseenter', function () {
          if (!li.classList.contains('open')) {
            items.forEach(function (o) {
              if (o !== li) setOpen(o, false);
            });
            setOpen(li, true);
          }
        });
      }
    });
  })();

  /* ---- select personalizado ---- */
  document.querySelectorAll('select[data-custom]').forEach(function (sel) {
    var wrap = document.createElement('div');
    wrap.className = 'sel';
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'sel-btn';
    btn.setAttribute('aria-haspopup', 'listbox');
    btn.setAttribute('aria-expanded', 'false');
    var labelEl = sel.closest('label');
    var labelTxt = labelEl && labelEl.querySelector('span');
    if (labelTxt) btn.setAttribute('aria-label', labelTxt.textContent + ': ');
    var lbl = document.createElement('span');
    var ic = document.createElement('i');
    btn.appendChild(lbl);
    btn.appendChild(ic);
    var list = document.createElement('ul');
    list.className = 'sel-list';
    list.setAttribute('role', 'listbox');
    list.setAttribute('aria-label', labelTxt ? labelTxt.textContent : 'Opciones');
    var opts = [];
    Array.prototype.forEach.call(sel.options, function (o, i) {
      var li = document.createElement('li');
      li.textContent = o.textContent;
      li.setAttribute('role', 'option');
      li.dataset.i = i;
      list.appendChild(li);
      opts.push(li);
    });
    function sync() {
      lbl.textContent = sel.options[sel.selectedIndex].textContent;
      if (labelTxt) btn.setAttribute('aria-label', labelTxt.textContent + ': ' + lbl.textContent);
      opts.forEach(function (li, i) {
        li.classList.toggle('on', i === sel.selectedIndex);
        li.setAttribute('aria-selected', i === sel.selectedIndex ? 'true' : 'false');
      });
    }
    function open(o) {
      wrap.classList.toggle('open', o);
      btn.setAttribute('aria-expanded', o ? 'true' : 'false');
      if (o)
        opts.forEach(function (li, i) {
          li.classList.toggle('hl', i === sel.selectedIndex);
        });
    }
    btn.addEventListener('click', function () {
      open(!wrap.classList.contains('open'));
    });
    list.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      var li = e.target.closest('li');
      if (!li) return;
      sel.selectedIndex = +li.dataset.i;
      sel.dispatchEvent(new Event('change', { bubbles: true }));
      sync();
      open(false);
      btn.focus();
    });
    btn.addEventListener('keydown', function (e) {
      var i = sel.selectedIndex;
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        i = Math.max(0, Math.min(opts.length - 1, i + (e.key === 'ArrowDown' ? 1 : -1)));
        sel.selectedIndex = i;
        sync();
        open(true);
      } else if (e.key === 'Escape') {
        open(false);
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        open(!wrap.classList.contains('open'));
      }
    });
    document.addEventListener('click', function (e) {
      if (!wrap.contains(e.target)) open(false);
    });
    sel.parentNode.insertBefore(wrap, sel);
    wrap.appendChild(btn);
    wrap.appendChild(list);
    sel.setAttribute('tabindex', '-1');
    sel.setAttribute('aria-hidden', 'true');
    sync();
  });

  /* ---- pista móvil bajo los pares plano/foto ---- */
  document.querySelectorAll('.pane .pair').forEach(function (pr) {
    if (pr.children.length < 2) return; /* solo plano, sin foto: no hay nada que deslizar */
    var h = document.createElement('div');
    h.className = 'pair-hint';
    h.textContent = 'Deslizá para ver el plano y la foto →';
    pr.setAttribute('tabindex', '0');
    pr.setAttribute('role', 'region');
    pr.setAttribute('aria-label', 'Plano y foto de la tipología');
    pr.parentNode.insertBefore(h, pr.nextSibling);
  });

  /* ---- header: banda sólida detrás del logo según el tema de la sección ---- */
  var hdrEl = document.getElementById('hdr'),
    brandEl = document.querySelector('.brand'),
    hdrRaf = false;
  function hdrSize() {
    var b = brandEl.getBoundingClientRect();
    hdrEl.style.setProperty('--hdrh', Math.round(b.bottom + 10) + 'px');
  }
  function hdrTheme() {
    hdrRaf = false;
    if (
      menu.classList.contains('open') ||
      document.getElementById('gv').classList.contains('open') ||
      document.getElementById('sr').classList.contains('open')
    ) {
      body.setAttribute('data-hdr', 'media');
      return;
    }
    var view = main;
    if (!view) return;
    var y = parseFloat(getComputedStyle(hdrEl).getPropertyValue('--hdrh')) || 150,
      t = 'dark',
      secs = view.children;
    for (var i = 0; i < secs.length; i++) {
      var r = secs[i].getBoundingClientRect();
      if (r.top <= y && r.bottom > y) {
        var e = secs[i];
        if (e.matches('.hero,.phero,.intro,.hs,.gal,.day')) t = 'media';
        else if (e.classList.contains('light')) t = 'light';
        else t = 'dark';
        break;
      }
    }
    if (t === 'dark') {
      var s0 = view.children[0];
      if (s0 && s0.getBoundingClientRect().top > y) t = 'media';
    }
    body.setAttribute('data-hdr', t);
  }
  function hdrTick() {
    if (!hdrRaf) {
      hdrRaf = true;
      requestAnimationFrame(hdrTheme);
    }
  }
  window.addEventListener('scroll', hdrTick, { passive: true });
  window.addEventListener('resize', function () {
    hdrSize();
    hdrTick();
  });
  // la medición del header fuerza layout: se hace cuando ya cargaron fuentes y página (no durante el primer render)
  function hdrInit() {
    hdrSize();
    hdrTheme();
  }
  function hdrWhenSettled() {
    var ready = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
    ready.then(function () {
      setTimeout(hdrInit, 120);
    });
  }
  if (document.readyState === 'complete') hdrWhenSettled();
  else window.addEventListener('load', hdrWhenSettled);
  setInterval(function () {
    if (!document.hidden) hdrTheme();
  }, 1500);

  /* ---- showrooms 3D embebidos (con alternativa "abrir en pestaña nueva") ---- */
  var sr = document.getElementById('sr'),
    srF = document.getElementById('srF'),
    srExt = document.getElementById('srExt'),
    srT = document.getElementById('srT'),
    srC = document.getElementById('srC'),
    srCExt = document.getElementById('srCExt'),
    srUrl = '',
    srOpener = null;
  // contenido de terceros: el iframe del modal solo se carga con el permiso 'embeds'
  function srAllowed() {
    return !!(window.inmoConsent && window.inmoConsent.has('embeds'));
  }
  function srApply() {
    var ok = srAllowed();
    sr.classList.toggle('sr-blocked', !ok);
    srC.hidden = ok;
    if (!sr.classList.contains('open')) return;
    if (ok) {
      if (srUrl && srF.getAttribute('src') !== srUrl) srF.src = srUrl;
    } else if (srF.getAttribute('src') !== 'about:blank') {
      srF.src = 'about:blank';
    }
  }
  window.addEventListener('consent-change', function () {
    var wasBlocked = sr.classList.contains('sr-blocked');
    srApply();
    // el botón "Cargar showroom 3D" desaparece: devolvemos el foco al modal
    if (wasBlocked && srAllowed() && sr.classList.contains('open')) document.getElementById('srX').focus({ preventScroll: true });
  });
  function srOpen(url, title) {
    srUrl = url;
    srExt.href = url;
    srCExt.href = url;
    srT.textContent = title || 'Showroom virtual 3D';
    srF.title = title || 'Showroom virtual 3D';
    sr.removeAttribute('inert');
    sr.classList.add('open');
    srApply();
    cur.classList.add('off');
    body.style.overflow = 'hidden';
    lenisLock(true);
    hdrTick();
    setTimeout(function () {
      document.getElementById('srX').focus();
    }, 400);
  }
  function srClose() {
    if (sr.contains(document.activeElement)) document.activeElement.blur();
    sr.classList.remove('open');
    sr.setAttribute('inert', '');
    body.style.overflow = '';
    lenisLock(false);
    setTimeout(function () {
      if (!sr.classList.contains('open')) {
        srF.src = 'about:blank';
        srUrl = '';
      }
    }, 450);
    hdrTick();
    if (srOpener && srOpener.focus) srOpener.focus({ preventScroll: true });
  }
  document.getElementById('srX').addEventListener('click', srClose);
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && sr.classList.contains('open')) srClose();
  });
  document.querySelectorAll('a[href*="urbania3d.app"]:not([data-no-modal])').forEach(function (a) {
    a.addEventListener('click', function (e) {
      e.preventDefault();
      srOpener = a;
      var ctxEl = a.closest('[data-ctx]');
      var nm = ctxEl ? ctxEl.getAttribute('data-ctx').split('|')[0] : '';
      srOpen(a.href, 'Showroom virtual 3D' + (nm ? ' · ' + nm : ''));
    });
  });

  /* iOS: bloquear el scroll de la página detrás de los overlays (menú, galería, showroom) */
  document.addEventListener(
    'touchmove',
    function (e) {
      var open =
        menu.classList.contains('open') ||
        document.getElementById('gv').classList.contains('open') ||
        document.getElementById('sr').classList.contains('open');
      if (!open) return;
      var inner = e.target.closest && e.target.closest('.gv,.sr iframe,.menu .mcol');
      if (!inner) {
        e.preventDefault();
        return;
      }
      if (inner.classList.contains('mcol') && inner.scrollHeight <= inner.clientHeight + 1) e.preventDefault();
    },
    { passive: false },
  );

  /* ---- preloader (solo la primera visita de la sesión en la home) y telón entrante ---- */
  var pre = document.getElementById('pre'),
    preNum = document.getElementById('preNum'),
    preBar = document.getElementById('preBar'),
    pv = 0,
    preDone = false;
  function preTick() {
    if (preDone) return;
    pv = Math.min(pv + (96 - pv) * 0.06 + 0.2, 96);
    var shown = pad(Math.round(pv));
    if (preNum.textContent !== shown) preNum.textContent = shown;
    preBar.style.transform = 'scaleX(' + pv / 100 + ')';
    requestAnimationFrame(preTick);
  }
  function setReady() {
    ready = true;
    if (motion) motion.playEnter();
  }
  function preFinish() {
    if (preDone) return;
    preDone = true;
    preNum.textContent = '100';
    preBar.style.transform = 'scaleX(1)';
    store.set('inmo-pre', '1');
    setTimeout(function () {
      pre.classList.add('off');
      html.classList.remove('pre-on');
      body.style.overflow = '';
      lenisLock(false);
      setReady();
    }, 300);
  }
  if (html.classList.contains('curtain-in')) {
    // venimos de otra página del sitio: el telón ya cubre la pantalla; lo levantamos al cargar
    transTxt.textContent = store.get('inmo-curtain') || 'INMO Desarrollos';
    store.del('inmo-curtain');
    var lift = function () {
      html.classList.remove('curtain-in');
      trans.classList.remove('in');
      trans.classList.add('out');
      setTimeout(setReady, 350);
      setTimeout(function () {
        trans.classList.remove('out');
      }, 800);
    };
    var lifted = false;
    var liftOnce = function () {
      if (lifted) return;
      lifted = true;
      lift();
    };
    if (document.readyState === 'complete') setTimeout(liftOnce, 120);
    else window.addEventListener('load', function () {
      setTimeout(liftOnce, 120);
    });
    setTimeout(liftOnce, 1800);
  } else if (html.classList.contains('pre-on')) {
    body.style.overflow = 'hidden';
    var lenis = ensureLenis();
    if (lenis) lenis.stop();
    preTick();
    if (document.readyState === 'complete') setTimeout(preFinish, 500);
    else window.addEventListener('load', function () {
      setTimeout(preFinish, 450);
    });
    setTimeout(preFinish, 2600);
  } else {
    ready = true;
  }

  /* ---- animaciones (GSAP) en un chunk aparte, sin competir con el LCP ---- */
  var started = false;
  // content-visibility: se libera sección por sección (un cuadro cada una) para que el layout completo
  // no caiga en una única tarea larga; al terminar se quita `cv` y todo queda como siempre.
  var cvP = null;
  function cvOff() {
    if (cvP) return cvP;
    if (!html.classList.contains('cv')) return (cvP = Promise.resolve());
    var secs = Array.prototype.slice.call(document.querySelectorAll('#main>section,.foot'));
    var frame = function () {
      return new Promise(function (res) {
        requestAnimationFrame(function () {
          setTimeout(res, 0);
        });
        setTimeout(res, 150); // pestaña en segundo plano: rAF no corre
      });
    };
    cvP = secs
      .reduce(function (p, sec) {
        return p.then(function () {
          sec.classList.add('cvx');
          return frame();
        });
      }, Promise.resolve())
      .then(function () {
        html.classList.remove('cv');
      });
    return cvP;
  }
  function startMotion() {
    if (started || reduce) return;
    started = true;
    cvOff().then(loadMotion);
  }
  function loadMotion() {
    ensureLenis();
    import('./motion.js')
      .then(function (m) {
        motion = m;
        return m
          .initMotion({
            pad: pad,
            numberHs: numberHs,
            isReady: function () {
              return ready;
            },
            hdrTick: hdrTick,
          })
          .then(function () {
            // tras fijar las alturas de las secciones fijadas, volvemos a la ancla de la URL
            if (location.hash) {
              var id = decodeURIComponent(location.hash.slice(1));
              if (document.getElementById(id)) {
                setTimeout(function () {
                  scrollToSec(id);
                }, 60);
              }
            }
            if (ready) m.playEnter();
          });
      })
      .catch(function () {
        // sin GSAP todo se muestra estático
        html.classList.add('reduce');
        document.querySelectorAll('[data-hs]').forEach(numberHs);
      });
  }
  var idle =
    window.requestIdleCallback ||
    function (cb) {
      return setTimeout(cb, 200);
    };
  if (reduce) {
    window.addEventListener('load', function () {
      idle(cvOff, { timeout: 1500 });
    });
    ['pointerdown', 'keydown', 'wheel', 'touchstart', 'scroll'].forEach(function (ev) {
      window.addEventListener(ev, cvOff, { once: true, passive: true });
    });
  }
  if (!reduce) {
    var kick = function () {
      idle(startMotion, { timeout: 1200 });
    };
    if (document.readyState === 'complete') kick();
    else window.addEventListener('load', kick);
    ['pointerdown', 'keydown', 'wheel', 'touchstart', 'scroll'].forEach(function (ev) {
      window.addEventListener(ev, startMotion, { once: true, passive: true });
    });
  }
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(rf);
  window.addEventListener('load', function () {
    rf();
    // precarga de la imagen del menú (queda oculta hasta la primera apertura)
    idle(
      function () {
        menu.classList.add('warm');
      },
      { timeout: 3000 },
    );
    setTimeout(function () {
      idle(
        function () {
          html.classList.add('snap-on');
        },
        { timeout: 4000 },
      );
    }, 2500);
  });
  // enlace directo con ancla (sin GSAP): el navegador ya posiciona la página
})();
