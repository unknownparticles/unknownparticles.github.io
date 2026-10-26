(function () {
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.querySelector('.site-nav');

  function closeNavigation() {
    if (!toggle || !nav) return;
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', '打开导航');
    nav.setAttribute('data-open', 'false');
    document.body.classList.remove('nav-open');
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
      if (event.target.closest('a')) closeNavigation();
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') {
        closeNavigation();
        toggle.focus();
      }
    });

    window.addEventListener('resize', function () {
      if (window.innerWidth > 720) closeNavigation();
    });
  }

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
