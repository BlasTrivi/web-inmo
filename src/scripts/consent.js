// @ts-nocheck
/**
 * Consentimiento de cookies.
 *
 * - La elección se guarda en localStorage (`inmo-consent`) con versión y fecha. Si cambia la versión
 *   (LEGAL.consentVersion) o pasan LEGAL.consentMonths meses, se vuelve a preguntar.
 * - API pública para código futuro (analítica, píxeles, etc.):
 *     window.inmoConsent.has('analytics' | 'marketing')  -> boolean (las 'necessary' siempre true)
 *     window.inmoConsent.get()                            -> { v, ts, necessary, analytics, marketing } | null
 *     window.inmoConsent.open()                           -> reabre el panel de preferencias
 *     window.addEventListener('consent-change', e => e.detail.consent)
 *   Regla: NO cargar ningún script de terceros que use cookies/identificadores sin comprobar `has()`
 *   al iniciar y escuchar `consent-change` para activarlo (o desactivarlo) después.
 * - Hoy el sitio no carga ninguna herramienta de analítica ni de marketing.
 */
import { LEGAL } from '../config/site';

(function () {
  var KEY = 'inmo-consent';
  var html = document.documentElement;
  var box = document.getElementById('cb');
  if (!box) return;
  var main = document.getElementById('cbMain');
  var cfg = document.getElementById('cbCfg');
  var cfgBtn = box.querySelector('[data-cb="config"]');
  var state = null;
  var opener = null;
  var shown = false;
  var ro = null;

  function read() {
    try {
      var raw = window.localStorage.getItem(KEY);
      if (!raw) return null;
      var o = JSON.parse(raw);
      if (!o || o.v !== LEGAL.consentVersion || !o.ts) return null;
      var age = Date.now() - new Date(o.ts).getTime();
      if (!(age >= 0) || age > LEGAL.consentMonths * 30.5 * 864e5) return null;
      return { v: o.v, ts: o.ts, necessary: true, analytics: !!o.analytics, marketing: !!o.marketing };
    } catch (e) {
      return null;
    }
  }
  function write(o) {
    try {
      window.localStorage.setItem(KEY, JSON.stringify(o));
    } catch (e) {}
  }
  function copy(o) {
    return o ? { v: o.v, ts: o.ts, necessary: true, analytics: !!o.analytics, marketing: !!o.marketing } : null;
  }
  function emit(source) {
    window.dispatchEvent(new CustomEvent('consent-change', { detail: { consent: copy(state), source: source } }));
  }

  function measure() {
    html.style.setProperty('--cb-h', box.offsetHeight + 'px');
  }
  function setPanel(cfgOn) {
    cfg.hidden = !cfgOn;
    main.hidden = cfgOn;
    cfgBtn.setAttribute('aria-expanded', cfgOn ? 'true' : 'false');
    if (cfgOn) {
      var cur = state || { analytics: false, marketing: false };
      cfg.elements.analytics.checked = !!cur.analytics;
      cfg.elements.marketing.checked = !!cur.marketing;
    }
    measure();
  }
  function show(toConfig, focus) {
    box.hidden = false;
    setPanel(!!toConfig);
    html.classList.add('cb-open');
    // un frame después para que la transición de entrada arranque desde el estado oculto
    requestAnimationFrame(function () {
      measure();
      box.classList.add('on');
    });
    shown = true;
    if (window.ResizeObserver && !ro) {
      ro = new ResizeObserver(measure);
      ro.observe(box);
    }
    if (focus) {
      var t = toConfig ? cfg.elements.analytics : box.querySelector('[data-cb="accept"]');
      setTimeout(function () {
        if (t && t.focus) t.focus({ preventScroll: true });
      }, 60);
    }
  }
  function hide(restore) {
    if (!shown) return;
    shown = false;
    box.classList.remove('on');
    html.classList.remove('cb-open');
    html.style.removeProperty('--cb-h');
    setTimeout(function () {
      if (!shown) box.hidden = true;
    }, 450);
    if (restore && opener && opener.focus) opener.focus({ preventScroll: true });
    opener = null;
  }
  function set(prefs, source) {
    state = {
      v: LEGAL.consentVersion,
      ts: new Date().toISOString(),
      necessary: true,
      analytics: !!(prefs && prefs.analytics),
      marketing: !!(prefs && prefs.marketing),
    };
    write(state);
    hide(true);
    emit(source || 'set');
  }

  window.inmoConsent = {
    version: LEGAL.consentVersion,
    get: function () {
      return copy(state);
    },
    has: function (cat) {
      return cat === 'necessary' ? true : !!(state && state[cat]);
    },
    decided: function () {
      return !!state;
    },
    open: function () {
      show(true, true);
    },
    set: function (prefs) {
      set(prefs, 'api');
    },
    acceptAll: function () {
      set({ analytics: true, marketing: true }, 'accept');
    },
    rejectAll: function () {
      set({ analytics: false, marketing: false }, 'reject');
    },
  };

  box.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('[data-cb]');
    if (!b) return;
    var a = b.getAttribute('data-cb');
    if (a === 'accept') window.inmoConsent.acceptAll();
    else if (a === 'reject') window.inmoConsent.rejectAll();
    else if (a === 'config') {
      setPanel(true);
      cfg.elements.analytics.focus({ preventScroll: true });
    } else if (a === 'back') {
      setPanel(false);
      box.querySelector('[data-cb="accept"]').focus({ preventScroll: true });
    }
  });
  cfg.addEventListener('submit', function (e) {
    e.preventDefault();
    set({ analytics: cfg.elements.analytics.checked, marketing: cfg.elements.marketing.checked }, 'config');
  });
  // Esc cierra el panel solo si ya hay una elección guardada (si no, el aviso queda hasta decidir)
  box.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && state) {
      e.stopPropagation();
      hide(true);
    }
  });
  // "Preferencias de cookies" (pie de página): reabre el panel de configuración
  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('[data-cookie-prefs]');
    if (!b) return;
    e.preventDefault();
    opener = b;
    show(true, true);
  });

  state = read();
  if (state) {
    // elección vigente: avisamos a quien ya esté escuchando (los scripts futuros también pueden consultar has())
    setTimeout(function () {
      emit('stored');
    }, 0);
  } else {
    // sin elección: mostramos el aviso cuando termina el preloader (si lo hay) y la página cargó
    var wait = function () {
      if (html.classList.contains('pre-on') || html.classList.contains('curtain-in')) {
        setTimeout(wait, 400);
        return;
      }
      show(false, false);
    };
    var go = function () {
      setTimeout(wait, 1400);
    };
    if (document.readyState === 'complete') go();
    else window.addEventListener('load', go);
  }
})();
