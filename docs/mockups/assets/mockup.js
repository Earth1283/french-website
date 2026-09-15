/* Mockup helpers: theme from ?theme=dark (press "d" to toggle), frozen time via ?time=HH:MM,
   and the split-flap clock. Loaded in <head> so the theme applies before first paint. */
(function () {
  var params = new URLSearchParams(location.search);
  if (params.get('theme') === 'dark') document.documentElement.classList.add('dark');

  document.addEventListener('keydown', function (e) {
    var t = e.target && e.target.tagName;
    if (e.key === 'd' && t !== 'INPUT' && t !== 'TEXTAREA') document.documentElement.classList.toggle('dark');
  });

  function now() {
    var fixed = params.get('time');
    var d = new Date();
    if (fixed && /^\d{1,2}:\d{2}$/.test(fixed)) {
      var parts = fixed.split(':');
      d.setHours(+parts[0], +parts[1], 0, 0);
      d.setFullYear(2026, 8, 15);
    }
    return d;
  }

  function pad(n) { return (n < 10 ? '0' : '') + n; }

  function greeting(h) {
    if (h >= 5 && h < 12) return ['Bonjour', 'Good morning'];
    if (h >= 12 && h < 18) return ['Bon après-midi', 'Good afternoon'];
    return ['Bonsoir', 'Good evening'];
  }

  function render(first) {
    var d = now();
    var digits = pad(d.getHours()) + pad(d.getMinutes());
    document.querySelectorAll('[data-flap-clock]').forEach(function (clock) {
      var cells = clock.querySelectorAll('.flap');
      cells.forEach(function (cell, i) {
        var next = digits[i];
        if (cell.textContent === next) return;
        if (first) { cell.textContent = next; return; }
        cell.classList.remove('is-flipping');
        void cell.offsetWidth;
        cell.classList.add('is-flipping');
        setTimeout(function () { cell.textContent = next; }, 120);
      });
      var sr = clock.parentNode.querySelector('[data-clock-sr]');
      if (sr) sr.textContent = pad(d.getHours()) + ':' + pad(d.getMinutes());
    });

    var fr = d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
    var en = d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });
    document.querySelectorAll('[data-date]').forEach(function (el) {
      el.dataset.fr = fr;
      el.dataset.en = en;
      if (first) el.textContent = fr;
    });

    var g = greeting(d.getHours());
    document.querySelectorAll('[data-greeting-fr]').forEach(function (el) { el.textContent = g[0]; });
    document.querySelectorAll('[data-greeting-en]').forEach(function (el) { el.textContent = g[1]; });

    var post = d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: '2-digit' }).replace(/\//g, '.');
    document.querySelectorAll('[data-postmark-date]').forEach(function (el) { el.textContent = post; });
  }

  document.addEventListener('DOMContentLoaded', function () {
    render(true);
    if (!params.get('time')) setInterval(function () { render(false); }, 1000);

    document.querySelectorAll('[data-date]').forEach(function (el) {
      function show(lang) { el.textContent = el.dataset[lang]; }
      el.addEventListener('mouseenter', function () { show('en'); });
      el.addEventListener('mouseleave', function () { show('fr'); });
      el.addEventListener('focus', function () { show('en'); });
      el.addEventListener('blur', function () { show('fr'); });
    });

    // Exercise demo: clicking an option reveals right/wrong.
    document.querySelectorAll('[data-options]').forEach(function (group) {
      var answer = group.getAttribute('data-answer');
      group.querySelectorAll('.option').forEach(function (btn) {
        btn.addEventListener('click', function () {
          if (group.dataset.done) return;
          group.dataset.done = '1';
          group.querySelectorAll('.option').forEach(function (b) {
            var right = b.getAttribute('data-value') === answer;
            if (right) b.classList.add('is-correct');
            else if (b === btn) b.classList.add('is-wrong');
            else b.classList.add('is-dim');
          });
          var fb = document.getElementById(group.getAttribute('data-feedback'));
          if (fb && btn.getAttribute('data-value') !== answer) fb.hidden = false;
        });
      });
    });
  });
})();
