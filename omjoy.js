/* OMJOY: ajustes de accesibilidad y maquetación solo para omjoy.html y omjoy-en.html. Sin dependencias. */
(function () {
  'use strict';
  var root = document.documentElement;

  /* 1. Altura del banner de cookies -> --om-cc-h, para que el pie y el foco no queden tapados por el banner */
  var current = null;
  var ro = window.ResizeObserver ? new ResizeObserver(measure) : null;
  var attrs = new MutationObserver(measure);
  function measure() {
    var b = document.getElementById('xd-cc-banner');
    var h = 0;
    if (b && window.getComputedStyle(b).display !== 'none') { h = Math.ceil(b.getBoundingClientRect().height); }
    root.style.setProperty('--om-cc-h', h + 'px');
  }
  function attach() {
    var b = document.getElementById('xd-cc-banner');
    if (b && b !== current) {
      current = b;
      if (ro) { ro.observe(b); }
      attrs.observe(b, { attributes: true, attributeFilter: ['style', 'class'] });
    }
    measure();
  }
  new MutationObserver(attach).observe(document.body, { childList: true });
  window.addEventListener('resize', measure);
  attach();

  /* 2. Con el menú móvil abierto, el contenido de fondo no recibe foco ni lectura (la capa lo cubre) */
  var menu = document.getElementById('xd-mobile-menu');
  if (menu) {
    var behind = function () { return document.querySelectorAll('#main-content, footer, .skip-link, .om-float'); };
    var sync = function () {
      var open = menu.classList.contains('is-open');
      Array.prototype.forEach.call(behind(), function (n) {
        if (open) { n.setAttribute('inert', ''); } else { n.removeAttribute('inert'); }
      });
    };
    new MutationObserver(sync).observe(menu, { attributes: true, attributeFilter: ['class'] });
    sync();
  }
})();
