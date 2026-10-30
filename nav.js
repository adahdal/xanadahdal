/* Xana Dahdal: comportamiento de los submenús (desktop y móvil). Sin dependencias. */
(function () {
  var toggles = Array.prototype.slice.call(document.querySelectorAll('.xd-sub-toggle'));
  if (!toggles.length) return;
  var desktop = window.matchMedia('(min-width:1320px)');

  function set(btn, open) { btn.setAttribute('aria-expanded', open ? 'true' : 'false'); }
  function closeAll(except, scope) {
    toggles.forEach(function (b) {
      if (b !== except && (!scope || scope.contains(b))) set(b, false);
    });
  }

  toggles.forEach(function (btn) {
    var inDesktop = !!btn.closest('.xd-nav-links');
    var li = btn.parentNode;

    btn.addEventListener('click', function () {
      var open = btn.getAttribute('aria-expanded') !== 'true';
      if (inDesktop) closeAll(btn, btn.closest('.xd-nav-links'));
      set(btn, open);
    });

    btn.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        set(btn, true);
        var first = li.querySelector('ul a');
        if (first) first.focus();
      }
    });

    if (inDesktop) {
      var timer;
      li.addEventListener('mouseenter', function () {
        if (!desktop.matches) return;
        clearTimeout(timer);
        closeAll(btn, li.parentNode);
        set(btn, true);
      });
      li.addEventListener('mouseleave', function () {
        timer = setTimeout(function () { set(btn, false); }, 160);
      });
      li.addEventListener('focusout', function (e) {
        if (!li.contains(e.relatedTarget)) set(btn, false);
      });
      li.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && btn.getAttribute('aria-expanded') === 'true') {
          set(btn, false);
          btn.focus();
          e.stopPropagation();
        }
      });
    }
  });

  document.addEventListener('click', function (e) {
    var nav = document.querySelector('.xd-nav-links');
    if (nav && !nav.contains(e.target)) closeAll(null, nav);
  });

  /* Escape cierra el menú móvil y devuelve el foco al botón */
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    var menu = document.getElementById('xd-mobile-menu');
    if (menu && menu.classList.contains('is-open')) {
      var burger = document.querySelector('.xd-hamburger');
      if (burger) burger.click();
      if (burger) burger.focus();
    }
  });

  /* Al cerrar el menú móvil, los acordeones vuelven a estar plegados */
  var burgers = document.querySelectorAll('.xd-hamburger');
  burgers.forEach(function (b) {
    b.addEventListener('click', function () {
      if (b.getAttribute('aria-expanded') === 'false') {
        closeAll(null, document.getElementById('xd-mobile-menu'));
      }
    });
  });
  document.querySelectorAll('#xd-mobile-menu a').forEach(function (a) {
    a.addEventListener('click', function () { closeAll(null, document.getElementById('xd-mobile-menu')); });
  });


  /* Menú móvil: estado global (botones flotantes, scroll, etiqueta accesible) */
  (function () {
    var menu = document.getElementById('xd-mobile-menu');
    var burger = document.querySelector('.xd-hamburger');
    if (!menu || !burger) return;
    var root = document.documentElement;
    var en = (root.lang || '').toLowerCase().indexOf('en') === 0;
    document.querySelectorAll('a[href^="https://wa.me/"], a[href^="mailto:"]').forEach(function (a) {
      var p = a.parentNode;
      if (p && p !== document.body && /position\s*:\s*fixed/.test(p.getAttribute('style') || '')) p.classList.add('xd-float');
    });
    function sync() {
      var open = menu.classList.contains('is-open');
      root.classList.toggle('xd-menu-open', open);
      burger.setAttribute('aria-label', open ? (en ? 'Close menu' : 'Cerrar menú') : (en ? 'Open menu' : 'Abrir menú'));
      if (open) menu.removeAttribute('inert'); else menu.setAttribute('inert', '');
      if (!open) document.body.style.overflow = '';
    }
    new MutationObserver(sync).observe(menu, { attributes: true, attributeFilter: ['class'] });
    sync();
    /* Si se pasa a escritorio con el menú abierto, se cierra y se restaura el scroll */
    desktop.addEventListener ? desktop.addEventListener('change', function (e) {
      if (e.matches && menu.classList.contains('is-open')) burger.click();
    }) : desktop.addListener(function (e) { if (e.matches && menu.classList.contains('is-open')) burger.click(); });
  })();

  /* Página actual */
  var here = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.xd-nav-links a, #xd-mobile-menu a').forEach(function (a) {
    var h = a.getAttribute('href');
    if (h && h.indexOf('#') === -1 && h === here) a.setAttribute('aria-current', 'page');
  });
})();
