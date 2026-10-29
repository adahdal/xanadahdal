/*
 * xanadahdal.com - consentimiento de cookies, carga condicionada de GA4 / Meta Pixel y eventos de medicion.
 * Un solo archivo compartido por todas las paginas. No carga ninguna etiqueta no esencial
 * hasta que el visitante la acepta. Idiomas: es, en, ca (segun <html lang>).
 */
(function () {
  'use strict';

  var GA_ID = 'G-Q0LPF6KP6H';
  var PX_ID = '1562064505622800';
  var KEY = 'xd_consent_v2';
  var VERSION = 2;
  var MAX_AGE_MS = 180 * 24 * 60 * 60 * 1000; // se vuelve a preguntar a los 6 meses
  var WA_NUMBER_RE = /^https?:\/\/(wa\.me|api\.whatsapp\.com)\//i;

  var lang = (document.documentElement.getAttribute('lang') || 'es').slice(0, 2).toLowerCase();
  if (lang !== 'es' && lang !== 'en' && lang !== 'ca') { lang = 'es'; }

  var TXT = {
    es: {
      banner: 'Uso cookies necesarias para que la web funcione. Con tu permiso, también uso cookies analíticas (Google Analytics, para saber qué páginas se visitan) y publicitarias (Meta Pixel, para medir la publicidad). Puedes cambiar tu elección cuando quieras.',
      more: 'Más información en la',
      cookiesLink: 'Política de cookies', cookiesHref: 'politica-cookies.html',
      privacyLink: 'Política de privacidad', privacyHref: 'politica-privacidad.html',
      accept: 'Aceptar todas', reject: 'Rechazar todas', config: 'Configurar', save: 'Guardar preferencias',
      title: 'Preferencias de cookies', close: 'Cerrar',
      necTitle: 'Necesarias', necDesc: 'Permiten que la web funcione y recuerdan tu elección sobre cookies. Siempre activas.',
      anaTitle: 'Analíticas', anaDesc: 'Google Analytics (GA4): cuenta visitas y páginas vistas para mejorar la web.',
      mktTitle: 'Publicitarias', mktDesc: 'Meta Pixel: mide el resultado de la publicidad en Facebook e Instagram.',
      footer: 'Preferencias de cookies', region: 'Aviso de cookies'
    },
    en: {
      banner: 'I use cookies that are necessary for the site to work. With your permission, I also use analytics cookies (Google Analytics, to see which pages are visited) and advertising cookies (Meta Pixel, to measure advertising). You can change your choice at any time.',
      more: 'More information in the',
      cookiesLink: 'Cookie policy', cookiesHref: 'cookies-en.html',
      privacyLink: 'Privacy policy', privacyHref: 'privacy-en.html',
      accept: 'Accept all', reject: 'Reject all', config: 'Settings', save: 'Save preferences',
      title: 'Cookie preferences', close: 'Close',
      necTitle: 'Necessary', necDesc: 'They let the site work and remember your cookie choice. Always on.',
      anaTitle: 'Analytics', anaDesc: 'Google Analytics (GA4): counts visits and page views to improve the site.',
      mktTitle: 'Advertising', mktDesc: 'Meta Pixel: measures the results of advertising on Facebook and Instagram.',
      footer: 'Cookie preferences', region: 'Cookie notice'
    },
    ca: {
      banner: 'Faig servir galetes necessàries perquè el web funcioni. Amb el teu permís, també faig servir galetes analítiques (Google Analytics, per saber quines pàgines es visiten) i publicitàries (Meta Pixel, per mesurar la publicitat). Pots canviar la teva elecció quan vulguis.',
      more: 'Més informació a la',
      cookiesLink: 'Política de galetes', cookiesHref: 'politica-cookies.html',
      privacyLink: 'Política de privacitat', privacyHref: 'politica-privacidad.html',
      accept: 'Acceptar-les totes', reject: 'Rebutjar-les totes', config: 'Configurar', save: 'Desar preferències',
      title: 'Preferències de galetes', close: 'Tancar',
      necTitle: 'Necessàries', necDesc: 'Permeten que el web funcioni i recorden la teva elecció sobre galetes. Sempre actives.',
      anaTitle: 'Analítiques', anaDesc: 'Google Analytics (GA4): compta visites i pàgines vistes per millorar el web.',
      mktTitle: 'Publicitàries', mktDesc: 'Meta Pixel: mesura el resultat de la publicitat a Facebook i Instagram.',
      footer: 'Preferències de galetes', region: 'Avís de galetes'
    }
  };
  var L = TXT[lang];

  /* ---------- almacenamiento de la eleccion ---------- */
  function readState() {
    try {
      var raw = window.localStorage.getItem(KEY);
      if (!raw) { return null; }
      var s = JSON.parse(raw);
      if (!s || s.v !== VERSION || typeof s.ts !== 'number') { return null; }
      if (Date.now() - s.ts > MAX_AGE_MS) { return null; }
      return { analytics: !!s.analytics, marketing: !!s.marketing, ts: s.ts };
    } catch (e) { return null; }
  }
  function writeState(analytics, marketing) {
    var s = { v: VERSION, analytics: !!analytics, marketing: !!marketing, ts: Date.now() };
    try { window.localStorage.setItem(KEY, JSON.stringify(s)); } catch (e) { /* sin almacenamiento: se volvera a preguntar */ }
    return s;
  }

  var state = readState();
  var gaLoaded = false;
  var pxLoaded = false;

  /* ---------- carga condicionada de etiquetas ---------- */
  function loadGA() {
    if (gaLoaded) { return; }
    gaLoaded = true;
    window['ga-disable-' + GA_ID] = false;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('consent', 'default', {
      analytics_storage: 'granted',
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied'
    });
    window.gtag('js', new Date());
    /* Depuracion solo para una sesion de prueba: abrir cualquier pagina con ?xd_debug=1
       (para desactivarla, ?xd_debug=0). Los visitantes normales no tienen ese parametro. */
    var dbg = false;
    try {
      var m = /[?&]xd_debug=([01])/.exec(location.search);
      if (m) { window.sessionStorage.setItem('xd_debug', m[1]); }
      dbg = window.sessionStorage.getItem('xd_debug') === '1';
    } catch (err) { dbg = false; }
    if (dbg) { window.gtag('config', GA_ID, { debug_mode: true }); }
    else { window.gtag('config', GA_ID); }
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
    document.head.appendChild(s);
  }

  function loadPixel() {
    if (pxLoaded) { return; }
    pxLoaded = true;
    /* snippet estandar de Meta Pixel, ejecutado solo con consentimiento publicitario */
    (function (f, b, e, v, n, t, s) {
      if (f.fbq) { return; }
      n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); };
      if (!f._fbq) { f._fbq = n; }
      n.push = n; n.loaded = true; n.version = '2.0'; n.queue = [];
      t = b.createElement(e); t.async = true; t.src = v;
      s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s);
    })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
    window.fbq('init', PX_ID);
    window.fbq('track', 'PageView');
  }

  function deleteCookie(name) {
    var host = location.hostname;
    var parts = host.split('.');
    var domains = ['', host, '.' + host];
    if (parts.length > 2) { domains.push('.' + parts.slice(-2).join('.')); }
    if (parts.length === 2) { domains.push('.' + host); }
    for (var i = 0; i < domains.length; i++) {
      document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/' + (domains[i] ? '; domain=' + domains[i] : '');
    }
  }
  function clearAnalyticsCookies() {
    window['ga-disable-' + GA_ID] = true;
    var all = document.cookie ? document.cookie.split(';') : [];
    for (var i = 0; i < all.length; i++) {
      var n = all[i].split('=')[0].replace(/^\s+/, '');
      if (n === '_ga' || n === '_gid' || n === '_gat' || n.indexOf('_ga_') === 0) { deleteCookie(n); }
    }
  }
  function clearMarketingCookies() {
    if (window.fbq) { try { window.fbq('consent', 'revoke'); } catch (e) { /* nada */ } }
    deleteCookie('_fbp'); deleteCookie('_fbc'); deleteCookie('fr');
  }

  /* aplica la eleccion; devuelve true si hay que recargar para descargar etiquetas ya cargadas */
  function apply(prev) {
    var reload = false;
    if (state && state.analytics) { loadGA(); }
    else if (prev && prev.analytics) { clearAnalyticsCookies(); if (gaLoaded) { reload = true; } }
    if (state && state.marketing) { loadPixel(); }
    else if (prev && prev.marketing) { clearMarketingCookies(); if (pxLoaded) { reload = true; } }
    return reload;
  }

  /* ---------- interfaz ---------- */
  var cssInjected = false;
  function injectCss() {
    if (cssInjected) { return; }
    cssInjected = true;
    var css = '' +
      '#xd-cc-banner{position:fixed;left:0;right:0;bottom:0;z-index:100000;background:#111;color:rgba(255,255,255,.88);padding:20px 48px;display:flex;align-items:center;justify-content:space-between;gap:20px 28px;flex-wrap:wrap;border-top:2px solid #b8945a;font-family:inherit;box-shadow:0 -6px 24px rgba(0,0,0,.25)}' +
      '#xd-cc-banner p{margin:0;font-size:13px;line-height:1.7;max-width:760px;flex:1 1 360px}' +
      '#xd-cc-banner a,#xd-cc-modal a{color:#d4aa72;text-decoration:underline}' +
      '.xd-cc-actions{display:flex;gap:10px;flex-wrap:wrap;align-items:center}' +
      '.xd-cc-btn{font:inherit;font-size:10px;font-weight:600;letter-spacing:2px;text-transform:uppercase;padding:12px 22px;cursor:pointer;border:1px solid #b8945a;background:transparent;color:#fff;border-radius:0;line-height:1.2}' +
      '.xd-cc-btn.xd-fill{background:#b8945a;color:#fff}' +
      '.xd-cc-btn:hover{background:#b8945a;color:#fff}' +
      '.xd-cc-btn.xd-link{border-color:transparent;text-decoration:underline;padding-left:8px;padding-right:8px}' +
      '.xd-cc-btn:focus-visible,#xd-cc-modal input:focus-visible,.xd-cc-x:focus-visible{outline:2px solid #d4aa72;outline-offset:2px}' +
      '#xd-cc-overlay{position:fixed;inset:0;z-index:100001;background:rgba(0,0,0,.6);display:flex;align-items:center;justify-content:center;padding:16px}' +
      '#xd-cc-modal{background:#faf8f5;color:#1e1c18;max-width:560px;width:100%;max-height:90vh;overflow:auto;padding:28px 28px 24px;border-top:3px solid #b8945a;font-family:inherit;position:relative}' +
      '#xd-cc-modal h2{font-size:22px;margin:0 28px 6px 0;font-weight:500;line-height:1.25}' +
      '#xd-cc-modal p.xd-cc-intro{font-size:13px;line-height:1.7;color:#6b6560;margin:0 0 18px}' +
      '.xd-cc-x{position:absolute;top:12px;right:12px;background:none;border:0;font-size:26px;line-height:1;cursor:pointer;color:#1e1c18;padding:4px 10px}' +
      '.xd-cc-row{display:flex;gap:16px;align-items:flex-start;justify-content:space-between;padding:14px 0;border-top:1px solid rgba(184,148,90,.3)}' +
      '.xd-cc-row strong{display:block;font-size:14px;margin-bottom:3px}' +
      '.xd-cc-row span.xd-cc-d{font-size:12.5px;line-height:1.6;color:#6b6560}' +
      '.xd-cc-row input[type=checkbox]{width:22px;height:22px;flex:none;margin-top:2px;accent-color:#b8945a;cursor:pointer}' +
      '.xd-cc-row input[disabled]{cursor:not-allowed;opacity:.6}' +
      '#xd-cc-modal .xd-cc-actions{margin-top:18px;padding-top:16px;border-top:1px solid rgba(184,148,90,.3)}' +
      '#xd-cc-modal .xd-cc-btn{color:#1e1c18}' +
      '#xd-cc-modal .xd-cc-btn.xd-fill,#xd-cc-modal .xd-cc-btn:hover{color:#fff}' +
      '.xd-cc-foot{font-size:inherit;color:inherit;background:none;border:0;padding:0;cursor:pointer;text-decoration:underline;font-family:inherit;opacity:.85}' +
      '@media (max-width:600px){#xd-cc-banner{padding:14px 16px;gap:12px}#xd-cc-banner p{font-size:12.5px;line-height:1.55}.xd-cc-btn{padding:11px 14px}.xd-cc-actions{width:100%}.xd-cc-actions .xd-cc-btn{flex:1 1 46%;text-align:center}#xd-cc-modal{padding:22px 18px 18px}}';
    var st = document.createElement('style');
    st.id = 'xd-cc-css';
    st.appendChild(document.createTextNode(css));
    document.head.appendChild(st);
  }

  function el(tag, attrs, html) {
    var n = document.createElement(tag);
    if (attrs) { for (var k in attrs) { if (attrs.hasOwnProperty(k)) { n.setAttribute(k, attrs[k]); } } }
    if (html) { n.innerHTML = html; }
    return n;
  }

  function removeBanner() {
    var b = document.getElementById('xd-cc-banner');
    if (b && b.parentNode) { b.parentNode.removeChild(b); }
  }
  function closeModal() {
    var o = document.getElementById('xd-cc-overlay');
    if (o && o.parentNode) { o.parentNode.removeChild(o); }
    document.body.style.overflow = '';
    var bn = document.getElementById('xd-cc-banner');
    if (bn) { bn.style.display = ''; }
    if (lastFocus && lastFocus.focus) { try { lastFocus.focus(); } catch (e) { /* nada */ } }
  }
  var lastFocus = null;

  function choose(analytics, marketing) {
    var prev = state;
    state = writeState(analytics, marketing);
    removeBanner();
    closeModal();
    if (apply(prev)) { window.location.reload(); }
  }

  function showBanner() {
    if (document.getElementById('xd-cc-banner')) { return; }
    injectCss();
    var b = el('div', { id: 'xd-cc-banner', role: 'region', 'aria-label': L.region });
    b.innerHTML =
      '<p>' + L.banner + ' ' + L.more + ' <a href="' + L.cookiesHref + '">' + L.cookiesLink + '</a> / <a href="' + L.privacyHref + '">' + L.privacyLink + '</a>.</p>' +
      '<div class="xd-cc-actions">' +
      '<button type="button" class="xd-cc-btn" data-xd="reject">' + L.reject + '</button>' +
      '<button type="button" class="xd-cc-btn xd-fill" data-xd="accept">' + L.accept + '</button>' +
      '<button type="button" class="xd-cc-btn xd-link" data-xd="config">' + L.config + '</button>' +
      '</div>';
    document.body.appendChild(b);
  }

  function showModal() {
    if (document.getElementById('xd-cc-overlay')) { return; }
    injectCss();
    lastFocus = document.activeElement;
    var bn = document.getElementById('xd-cc-banner');
    if (bn) { bn.style.display = 'none'; }
    var a = state ? state.analytics : false;
    var m = state ? state.marketing : false;
    var o = el('div', { id: 'xd-cc-overlay' });
    o.innerHTML =
      '<div id="xd-cc-modal" role="dialog" aria-modal="true" aria-labelledby="xd-cc-title">' +
      '<button type="button" class="xd-cc-x" data-xd="close" aria-label="' + L.close + '">&times;</button>' +
      '<h2 id="xd-cc-title">' + L.title + '</h2>' +
      '<p class="xd-cc-intro">' + L.more + ' <a href="' + L.cookiesHref + '">' + L.cookiesLink + '</a> / <a href="' + L.privacyHref + '">' + L.privacyLink + '</a>.</p>' +
      '<div class="xd-cc-row"><label for="xd-cc-nec"><strong>' + L.necTitle + '</strong><span class="xd-cc-d">' + L.necDesc + '</span></label><input type="checkbox" id="xd-cc-nec" checked disabled></div>' +
      '<div class="xd-cc-row"><label for="xd-cc-ana"><strong>' + L.anaTitle + '</strong><span class="xd-cc-d">' + L.anaDesc + '</span></label><input type="checkbox" id="xd-cc-ana"' + (a ? ' checked' : '') + '></div>' +
      '<div class="xd-cc-row"><label for="xd-cc-mkt"><strong>' + L.mktTitle + '</strong><span class="xd-cc-d">' + L.mktDesc + '</span></label><input type="checkbox" id="xd-cc-mkt"' + (m ? ' checked' : '') + '></div>' +
      '<div class="xd-cc-actions">' +
      '<button type="button" class="xd-cc-btn" data-xd="reject">' + L.reject + '</button>' +
      '<button type="button" class="xd-cc-btn xd-fill" data-xd="save">' + L.save + '</button>' +
      '<button type="button" class="xd-cc-btn" data-xd="accept">' + L.accept + '</button>' +
      '</div></div>';
    document.body.appendChild(o);
    document.body.style.overflow = 'hidden';
    var first = document.getElementById('xd-cc-ana');
    if (first) { first.focus(); }
  }

  document.addEventListener('click', function (e) {
    var t = e.target;
    var btn = t && t.closest ? t.closest('[data-xd]') : null;
    if (btn) {
      var act = btn.getAttribute('data-xd');
      if (act === 'accept') { choose(true, true); }
      else if (act === 'reject') { choose(false, false); }
      else if (act === 'config') { showModal(); }
      else if (act === 'close') { closeModal(); }
      else if (act === 'save') {
        var an = document.getElementById('xd-cc-ana');
        var mk = document.getElementById('xd-cc-mkt');
        choose(!!(an && an.checked), !!(mk && mk.checked));
      }
      return;
    }
    var link = t && t.closest ? t.closest('[data-xd-cookie-settings]') : null;
    if (link) { e.preventDefault(); showModal(); }
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && document.getElementById('xd-cc-overlay')) { closeModal(); }
  });

  function addFooterLink() {
    if (document.querySelector('[data-xd-cookie-settings]')) { return; }
    var footer = document.querySelector('footer');
    if (!footer) {
      /* paginas sin pie: se anade un enlace discreto al final */
      var bar = el('div', { style: 'text-align:center;padding:18px 16px;font-size:13px;' });
      var lb = el('button', { type: 'button', class: 'xd-cc-foot', 'data-xd-cookie-settings': '' }, L.footer);
      bar.appendChild(lb);
      document.body.appendChild(bar);
      return;
    }
    var holder = footer.querySelector('.f-links, .footer-links') || footer;
    var b = el('button', { type: 'button', class: 'xd-cc-foot', 'data-xd-cookie-settings': '' }, L.footer);
    if (holder === footer) {
      var wrap = el('div', { style: 'margin-top:.6rem' });
      wrap.appendChild(b);
      footer.appendChild(wrap);
    } else {
      holder.style.flexWrap = 'wrap';
      holder.style.rowGap = '8px';
      holder.appendChild(b);
    }
  }

  /* ---------- medicion: solo si hay consentimiento analitico ---------- */
  function trainingFor(path, href) {
    var f = path.split('/').pop() || 'index.html';
    if (/^prenatal(-en)?\.html$/.test(f)) { return 'prenatal'; }
    if (/^programa-prenatal(-en)?\.html$/.test(f)) { return 'prenatal_program'; }
    if (/^ytt(-en)?\.html$/.test(f)) { return 'ytt_200h'; }
    var h = decodeURIComponent(href || '').toLowerCase();
    if (/prenatal/.test(h)) { return 'prenatal'; }
    if (/200/.test(h) && /(profesor|teacher)/.test(h)) { return 'ytt_200h'; }
    return 'none';
  }
  function isFixed(node) {
    for (var i = 0; node && node.nodeType === 1 && i < 4; i++, node = node.parentElement) {
      var cs = window.getComputedStyle(node);
      if (cs && cs.position === 'fixed') { return true; }
    }
    return false;
  }
  function locationFor(a) {
    if (isFixed(a)) { return 'floating'; }
    if (a.closest('nav, .xd-nav, .xd-mobile-menu')) { return 'nav'; }
    if (a.closest('footer')) { return 'footer'; }
    if (a.closest('form, .form-wrap, .formulario')) { return 'form'; }
    if (a.closest('.hero, .hero-texto, .hero-btns')) { return 'hero'; }
    if (a.closest('.cta-bloque, .cta-strip, .cta-final')) { return 'cta_section'; }
    if (a.closest('#contacto, .contact')) { return 'contact_section'; }
    return 'body';
  }
  function track(name, params) {
    if (state && state.analytics && gaLoaded && window.gtag) { window.gtag('event', name, params); }
  }
  window.xdTrack = track;

  document.addEventListener('click', function (e) {
    var a = e.target && e.target.closest ? e.target.closest('a[href]') : null;
    if (!a) { return; }
    var href = a.getAttribute('href') || '';
    var isWa = WA_NUMBER_RE.test(href);
    var isMail = /^mailto:/i.test(href);
    if (!isWa && !isMail) { return; }
    track(isWa ? 'click_whatsapp' : 'click_email', {
      link_location: locationFor(a),
      training: trainingFor(location.pathname, href),
      language: lang,
      transport_type: 'beacon'
    });
  }, true);

  /* El formulario no se modifica: solo se anota que se ha enviado, para que la pagina de gracias
     cuente la solicitud una unica vez (visitas directas y recargas no cuentan). */
  var LEAD_KEY = 'xd_lead_pending';
  document.addEventListener('submit', function (e) {
    var f = e.target;
    if (!f || !f.action || String(f.action).indexOf('sibforms.com') === -1) { return; }
    var form = /^ytt(-en)?\.html$/.test((location.pathname.split('/').pop() || '')) ? 'ytt_200h' : 'prenatal';
    try { window.sessionStorage.setItem('xd_last_lang', lang); } catch (err) { /* nada */ }
    if (state && state.analytics) {
      try { window.sessionStorage.setItem(LEAD_KEY, JSON.stringify({ form: form, lang: lang, ts: Date.now() })); } catch (err) { /* nada */ }
    }
  }, true);

  function handleThanks() {
    var form = document.body && document.body.getAttribute('data-xd-thanks');
    if (!form) { return; }
    if (!(state && state.analytics && gaLoaded)) { return; }
    var raw = null;
    try { raw = window.sessionStorage.getItem(LEAD_KEY); } catch (err) { raw = null; }
    if (!raw) { return; }
    var p = null;
    try { p = JSON.parse(raw); } catch (err) { p = null; }
    try { window.sessionStorage.removeItem(LEAD_KEY); } catch (err) { /* nada */ }
    if (!p || p.form !== form || typeof p.ts !== 'number' || Date.now() - p.ts > 30 * 60 * 1000) { return; }
    track('generate_lead', {
      form_name: form,
      training: form === 'ytt_200h' ? 'ytt_200h' : 'prenatal',
      language: p.lang === 'en' ? 'en' : (p.lang === 'ca' ? 'ca' : 'es'),
      method: 'brevo_form'
    });
  }

  /* ---------- arranque ---------- */
  function init() {
    addFooterLink();
    if (state) { apply(null); handleThanks(); }
    else { showBanner(); }
  }
  if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', init); }
  else { init(); }
})();
