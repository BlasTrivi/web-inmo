// @ts-nocheck
/**
 * Planos en un <dialog> modal accesible.
 *
 * Cada plano de las secciones de niveles / tipologías (`.tsel .pane figure.plan`) se envuelve en un botón
 * que abre `#pd`: imagen grande (versión `data-full`), título (+ m² si el panel los tiene), cerrar con
 * botón / Esc / clic en el fondo, foco atrapado y devuelto, zoom (clic = 2x con desplazamiento, rueda,
 * pellizco en táctiles) y anterior / siguiente entre los planos del mismo proyecto.
 * Para sumar planos nuevos alcanza con agregarlos al HTML de la sección con `<figure class="plan">`.
 */
export function initPlans(api) {
  var dlg = document.getElementById('pd');
  var figs = Array.prototype.slice.call(document.querySelectorAll('.tsel .pane figure.plan'));
  if (!dlg || !dlg.showModal || !figs.length) return;

  var stage = document.getElementById('pdStage');
  var paper = document.getElementById('pdPaper');
  var img = document.getElementById('pdImg');
  var tEl = document.getElementById('pdT');
  var sEl = document.getElementById('pdS');
  var nEl = document.getElementById('pdN');
  var bPrev = document.getElementById('pdPrev');
  var bNext = document.getElementById('pdNext');
  var bZoom = document.getElementById('pdZoom');
  var bClose = document.getElementById('pdX');
  var reduce = document.documentElement.classList.contains('reduce');

  var items = figs.map(function (fig) {
    var im = fig.querySelector('img');
    var pane = fig.closest('.pane');
    var cap = fig.querySelector('figcaption');
    var h3 = pane && pane.querySelector('.det h3');
    var title = (cap && cap.textContent.trim()) || (h3 && h3.textContent.trim()) || im.alt || 'Plano';
    var sub = [];
    var h = h3 && h3.textContent.trim();
    if (h && title.toLowerCase().indexOf(h.toLowerCase()) === -1) sub.push(h);
    if (pane) {
      var area = '';
      Array.prototype.forEach.call(pane.querySelectorAll('.det dd'), function (dd) {
        var t = dd.textContent.trim();
        if (/m²/.test(t) && (!area || dd.classList.contains('tot'))) area = t;
      });
      if (area) sub.push(area);
    }
    // botón accesible que envuelve la imagen (la figura conserva su estilo)
    var node = im.closest('picture') || im;
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'plan-btn';
    btn.setAttribute('aria-haspopup', 'dialog');
    btn.setAttribute('aria-label', 'Ampliar plano: ' + title);
    node.parentNode.insertBefore(btn, node);
    btn.appendChild(node);
    return { fig: fig, img: im, btn: btn, title: title, sub: sub.join(' · '), pane: pane };
  });

  var cur = 0;
  var from = 0;
  var opener = null;
  var s = 1;
  var tx = 0;
  var ty = 0;
  var MAX = 4;

  function src(it) {
    return it.img.getAttribute('data-full') || it.img.currentSrc || it.img.src;
  }
  function clamp() {
    var w = paper.offsetWidth;
    var h = paper.offsetHeight;
    // el plano puede desplazarse solo lo que se agrandó (los bordes no se separan del cuadro)
    var mx = Math.max(0, (w * (s - 1)) / 2);
    var my = Math.max(0, (h * (s - 1)) / 2);
    tx = Math.max(-mx, Math.min(mx, tx));
    ty = Math.max(-my, Math.min(my, ty));
    if (s <= 1) {
      tx = 0;
      ty = 0;
    }
  }
  function apply(anim) {
    clamp();
    paper.style.transition = anim && !reduce ? 'transform .35s cubic-bezier(.16,1,.3,1)' : 'none';
    paper.style.transform = 'translate3d(' + tx + 'px,' + ty + 'px,0) scale(' + s + ')';
    stage.classList.toggle('zoomed', s > 1.01);
    bZoom.setAttribute('aria-pressed', s > 1.01 ? 'true' : 'false');
    bZoom.setAttribute('aria-label', s > 1.01 ? 'Alejar' : 'Ampliar');
  }
  function zoomAt(ns, cx, cy, anim) {
    ns = Math.max(1, Math.min(MAX, ns));
    // cx, cy: punto del plano relativo al centro del cuadro; se mantiene bajo el cursor
    var k = ns / s;
    tx = cx - (cx - tx) * k;
    ty = cy - (cy - ty) * k;
    s = ns;
    apply(anim);
  }
  function reset() {
    s = 1;
    tx = 0;
    ty = 0;
    apply(false);
  }

  function render() {
    var it = items[cur];
    reset();
    img.src = src(it);
    img.alt = it.img.alt || it.title;
    tEl.textContent = it.title;
    sEl.textContent = it.sub;
    sEl.hidden = !it.sub;
    nEl.textContent = 'Plano ' + (cur + 1) + ' de ' + items.length;
    var many = items.length > 1;
    bPrev.hidden = !many;
    bNext.hidden = !many;
    // precarga los vecinos
    [cur - 1, cur + 1].forEach(function (j) {
      if (items[j]) {
        var p = new Image();
        p.src = src(items[j]);
      }
    });
  }
  function go(d) {
    if (items.length < 2) return;
    cur = (cur + d + items.length) % items.length;
    render();
  }
  function open(i, btn) {
    cur = from = i;
    opener = btn;
    render();
    dlg.showModal();
    document.body.style.overflow = 'hidden';
    api.lock(true);
    bClose.focus({ preventScroll: true });
  }

  items.forEach(function (it, i) {
    it.btn.addEventListener('click', function () {
      open(i, it.btn);
    });
  });

  // cerrar: Esc nativo (evento close), botón y clic en el fondo
  dlg.addEventListener('close', function () {
    document.body.style.overflow = '';
    api.lock(false);
    var it = items[cur];
    // si se cambió de plano dentro del modal, la página queda en el panel que se estaba viendo
    if (cur !== from && it.pane) {
      var wrap = it.pane.closest('[data-tsel]');
      var idx = wrap ? Array.prototype.indexOf.call(wrap.querySelectorAll('.pane'), it.pane) : -1;
      var tab = wrap && idx > -1 ? wrap.querySelectorAll('.tabs li')[idx] : null;
      if (tab) tab.click();
    }
    var back = items[cur].btn;
    setTimeout(function () {
      if (back && back.offsetParent !== null) back.focus({ preventScroll: true });
      else if (opener && opener.focus) opener.focus({ preventScroll: true });
    }, 30);
  });
  bClose.addEventListener('click', function () {
    dlg.close();
  });
  dlg.addEventListener('click', function (e) {
    if (e.target === dlg || (e.target === stage && s <= 1.01)) dlg.close();
  });
  bPrev.addEventListener('click', function () {
    go(-1);
  });
  bNext.addEventListener('click', function () {
    go(1);
  });
  bZoom.addEventListener('click', function () {
    if (s > 1.01) zoomAt(1, 0, 0, true);
    else zoomAt(2, 0, 0, true);
  });

  // teclado: flechas entre planos, +/- zoom, Tab atrapado dentro del modal
  dlg.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      go(-1);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      go(1);
    } else if (e.key === '+' || e.key === '=') {
      e.preventDefault();
      zoomAt(s * 1.5, 0, 0, true);
    } else if (e.key === '-' || e.key === '_') {
      e.preventDefault();
      zoomAt(s / 1.5, 0, 0, true);
    } else if (e.key === '0') {
      e.preventDefault();
      zoomAt(1, 0, 0, true);
    } else if (e.key === 'Tab') {
      var f = [bPrev, bNext, bZoom, bClose].filter(function (b) {
        return !b.hidden;
      });
      var first = f[0];
      var last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      } else if (!dlg.contains(document.activeElement)) {
        e.preventDefault();
        first.focus();
      }
    }
  });

  // puntero: clic = zoom 2x en ese punto, arrastre = mover, dos dedos = pellizco, rueda = zoom
  var ptrs = {};
  var n = 0;
  var moved = false;
  var sx = 0;
  var sy = 0;
  var stx = 0;
  var sty = 0;
  var d0 = 0;
  var s0 = 1;
  function center() {
    var r = stage.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  }
  paper.addEventListener('pointerdown', function (e) {
    if (e.button !== undefined && e.button !== 0 && e.pointerType === 'mouse') return;
    ptrs[e.pointerId] = { x: e.clientX, y: e.clientY };
    n = Object.keys(ptrs).length;
    try {
      paper.setPointerCapture(e.pointerId);
    } catch (_) {}
    if (n === 1) {
      moved = false;
      sx = e.clientX;
      sy = e.clientY;
      stx = tx;
      sty = ty;
    } else if (n === 2) {
      var k = Object.keys(ptrs);
      d0 = Math.hypot(ptrs[k[0]].x - ptrs[k[1]].x, ptrs[k[0]].y - ptrs[k[1]].y) || 1;
      s0 = s;
      moved = true;
    }
  });
  paper.addEventListener('pointermove', function (e) {
    if (!ptrs[e.pointerId]) return;
    ptrs[e.pointerId] = { x: e.clientX, y: e.clientY };
    if (n === 2) {
      var k = Object.keys(ptrs);
      var a = ptrs[k[0]];
      var b = ptrs[k[1]];
      var d = Math.hypot(a.x - b.x, a.y - b.y);
      var c = center();
      var ns = Math.max(1, Math.min(MAX, (s0 * d) / d0));
      var k2 = ns / s;
      var px = (a.x + b.x) / 2 - c.x;
      var py = (a.y + b.y) / 2 - c.y;
      tx = px - (px - tx) * k2;
      ty = py - (py - ty) * k2;
      s = ns;
      apply(false);
      return;
    }
    if (n === 1) {
      var dx = e.clientX - sx;
      var dy = e.clientY - sy;
      if (!moved && Math.hypot(dx, dy) > 5) moved = true;
      if (moved && s > 1.01) {
        tx = stx + dx;
        ty = sty + dy;
        apply(false);
        stage.classList.add('grabbing');
      }
    }
  });
  function up(e) {
    if (!ptrs[e.pointerId]) return;
    var wasSingle = n === 1;
    delete ptrs[e.pointerId];
    n = Object.keys(ptrs).length;
    stage.classList.remove('grabbing');
    if (n === 1) {
      // quedó un dedo: seguimos arrastrando desde donde está
      var k = Object.keys(ptrs)[0];
      sx = ptrs[k].x;
      sy = ptrs[k].y;
      stx = tx;
      sty = ty;
      moved = true;
    }
    if (wasSingle && !moved && e.type === 'pointerup') {
      var c = center();
      if (s > 1.01) zoomAt(1, 0, 0, true);
      else zoomAt(2, e.clientX - c.x, e.clientY - c.y, true);
    }
  }
  paper.addEventListener('pointerup', up);
  paper.addEventListener('pointercancel', up);
  stage.addEventListener(
    'wheel',
    function (e) {
      e.preventDefault();
      var c = center();
      zoomAt(s * Math.exp(-e.deltaY * (e.ctrlKey ? 0.01 : 0.0018)), e.clientX - c.x, e.clientY - c.y, false);
    },
    { passive: false },
  );
  window.addEventListener('resize', function () {
    if (dlg.open) apply(false);
  });
}
