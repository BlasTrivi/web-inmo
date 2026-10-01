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
    burger.children[0].style.transform = open ? 'translateY(3.75px) rotate(45deg)' : '';
    burger.children[1].style.transform = open ? 'translateY(-3.75px) rotate(-45deg)' : '';
    burger.children[1].style.width = open ? '26px' : '';
  }
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
    var go = function () {
      jump(el.getBoundingClientRect().top + window.scrollY);
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
        var d = el.getBoundingClientRect().top;
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

  /* ---- cursor personalizado ---- */
  var cur = document.getElementById('cur');
  var cx = 0,
    cy = 0,
    tx = 0,
    ty = 0;
  if (window.matchMedia('(hover:hover) and (pointer:fine)').matches && !reduce) {
    document.addEventListener('mousemove', function (e) {
      tx = e.clientX;
      ty = e.clientY;
      cur.classList.remove('off');
    });
    // dentro de un iframe (showroom 3D) o fuera de la ventana la página no recibe mousemove:
    // ocultamos el cursor para que no quede congelado encima
    document.addEventListener('mouseout', function (e) {
      if (!e.relatedTarget || e.relatedTarget.tagName === 'IFRAME') cur.classList.add('off');
    });
    (function loop() {
      cx += (tx - cx) * 0.18;
      cy += (ty - cy) * 0.18;
      cur.style.transform = 'translate(' + cx + 'px,' + cy + 'px) translate(-50%,-50%)';
      requestAnimationFrame(loop);
    })();
    document.querySelectorAll('a,button,select,label,.done li.has,.tsel .tabs li').forEach(function (el) {
      el.addEventListener('mouseenter', function () {
        cur.classList.add('big');
      });
      el.addEventListener('mouseleave', function () {
        cur.classList.remove('big');
      });
    });
    var lbl = cur.querySelector('.lbl');
    document.querySelectorAll('.pslider,.strip2,.strip3').forEach(function (el) {
      el.addEventListener('mouseenter', function () {
        lbl.textContent = 'Arrastrá';
        cur.classList.add('drag');
      });
      el.addEventListener('mouseleave', function () {
        cur.classList.remove('drag', 'grabbing');
      });
    });
    document.querySelectorAll('.hs,.gal,.day').forEach(function (el) {
      el.addEventListener('mouseenter', function () {
        lbl.textContent = 'Scroll ↓';
        cur.classList.add('drag');
      });
      el.addEventListener('mouseleave', function () {
        cur.classList.remove('drag');
      });
    });
    document.addEventListener('pointerdown', function () {
      cur.classList.add('grabbing');
    });
    document.addEventListener('pointerup', function () {
      cur.classList.remove('grabbing');
    });
  }

  /* ---- arrastrar para desplazar: slider de proyectos + tiras ---- */
  function dragScroll(el, snap) {
    var down = false,
      sx = 0,
      sl = 0,
      moved = false;
    el.addEventListener('dragstart', function (e) {
      e.preventDefault();
    });
    el.addEventListener('pointerdown', function (e) {
      if (e.button !== 0) return;
      down = true;
      moved = false;
      sx = e.clientX;
      sl = el.scrollLeft;
      el.classList.add('dragging');
      cur.classList.add('grabbing');
    });
    window.addEventListener('pointermove', function (e) {
      if (!down) return;
      var dx = e.clientX - sx;
      if (Math.abs(dx) > 4) moved = true;
      el.scrollLeft = sl - dx;
    });
    window.addEventListener('pointerup', function () {
      if (!down) return;
      down = false;
      cur.classList.remove('grabbing');
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
      setTimeout(function () {
        el.classList.remove('dragging');
      }, 750);
    });
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
      ctxNm.textContent = parts[0];
      ctxSt.textContent = parts[1];
      ctxLnk.href = 'https://wa.me/595981044061?text=Hola%2C%20quiero%20informaci%C3%B3n%20sobre%20' + parts[2];
      ctx.classList.add('on');
    } else {
      ctxTimer = setTimeout(function () {
        ctx.classList.remove('on');
      }, 150);
    }
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

  /* ---- formulario → WhatsApp ---- */
  var form = document.getElementById('form');
  if (form)
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var f = e.target,
        n = f.nombre.value.trim(),
        t = f.tel.value.trim(),
        p = f.proyecto.value,
        m = f.msg.value.trim();
      if (!n) {
        f.nombre.focus();
        f.nombre.style.borderBottomColor = '#ff0006';
        return;
      }
      var txt = 'Hola, soy ' + n + (t ? ' (' + t + ')' : '') + '. Me interesa ' + p + '.' + (m ? ' ' + m : '');
      window.open('https://wa.me/595981044061?text=' + encodeURIComponent(txt), '_blank', 'noopener');
    });

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
    srOpener = null;
  function srOpen(url, title) {
    srF.src = url;
    srExt.href = url;
    srT.textContent = title || 'Showroom virtual 3D';
    srF.title = title || 'Showroom virtual 3D';
    sr.removeAttribute('inert');
    sr.classList.add('open');
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
      if (!sr.classList.contains('open')) srF.src = 'about:blank';
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
    preNum.textContent = pad(Math.round(pv));
    preBar.style.width = pv + '%';
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
    preBar.style.width = '100%';
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
  function startMotion() {
    if (started || reduce) return;
    started = true;
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
        html.classList.add('snap-on');
      },
      { timeout: 3000 },
    );
  });
  // enlace directo con ancla (sin GSAP): el navegador ya posiciona la página
})();
