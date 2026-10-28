(function () {
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.querySelector('.site-nav');
  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function closeNavigation(restoreFocus) {
    if (!toggle || !nav) return;
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', '打开导航');
    nav.setAttribute('data-open', 'false');
    document.body.classList.remove('nav-open');
    if (restoreFocus) toggle.focus();
  }

  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var isOpen = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!isOpen));
      toggle.setAttribute('aria-label', isOpen ? '打开导航' : '关闭导航');
      nav.setAttribute('data-open', String(!isOpen));
      document.body.classList.toggle('nav-open', !isOpen);
    });

    nav.addEventListener('click', function (event) {
      if (event.target.closest('a')) closeNavigation(false);
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
        closeNavigation(true);
      }
    });

    window.addEventListener('resize', function () {
      if (window.innerWidth > 760) closeNavigation(false);
    });
  }

  var revealElements = document.querySelectorAll('[data-reveal]');
  if (reducedMotion || !('IntersectionObserver' in window)) {
    revealElements.forEach(function (element) {
      element.classList.add('is-revealed');
    });
  } else {
    var revealObserver = new IntersectionObserver(function (entries, observer) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-revealed');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

    revealElements.forEach(function (element) {
      revealObserver.observe(element);
    });

    // Fast trackpad or touch scrolling can skip an intersection frame.
    // Resolve any remaining off-screen elements so content never stays hidden.
    window.setTimeout(function () {
      revealElements.forEach(function (element) {
        element.classList.add('is-revealed');
        revealObserver.unobserve(element);
      });
    }, 1600);
  }

  var brand = document.querySelector('.site-brand');
  var taps = 0;
  var tapTimer;
  var sequence = '';

  if (brand) {
    brand.addEventListener('click', function (event) {
      if (event.metaKey || event.ctrlKey || event.shiftKey) return;
      event.preventDefault();
      taps += 1;
      window.clearTimeout(tapTimer);
      tapTimer = window.setTimeout(function () { taps = 0; }, 1400);
      if (taps >= 5) {
        document.documentElement.classList.toggle('debug-mode');
        taps = 0;
      }
    });
  }

  document.addEventListener('keydown', function (event) {
    if (event.target && /input|textarea/i.test(event.target.tagName)) return;
    sequence = (sequence + event.key.toLowerCase()).slice(-4);
    if (sequence === 'alun') {
      document.documentElement.classList.remove('easter-pulse');
      requestAnimationFrame(function () {
        document.documentElement.classList.add('easter-pulse');
        window.setTimeout(function () { document.documentElement.classList.remove('easter-pulse'); }, 1400);
      });
    }
  });

  document.querySelectorAll('.prose table').forEach(function (table) {
    if (table.parentElement && !table.parentElement.classList.contains('table-scroll')) {
      var wrapper = document.createElement('div');
      wrapper.className = 'table-scroll';
      wrapper.setAttribute('tabindex', '0');
      wrapper.setAttribute('role', 'region');
      wrapper.setAttribute('aria-label', '可横向滚动的数据表格');
      table.parentNode.insertBefore(wrapper, table);
      wrapper.appendChild(table);
    }
  });
})();
