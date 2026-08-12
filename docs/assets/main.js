/* Szkoła Jazdy KIERUNEK — demo: nawigacja, liczniki, reveal, formularz */
(function () {
  'use strict';

  /* --- rok w stopce --- */
  var year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  /* --- menu mobilne --- */
  var burger = document.getElementById('burger');
  var nav = document.getElementById('nav');

  burger.addEventListener('click', function () {
    var open = nav.classList.toggle('is-open');
    burger.setAttribute('aria-expanded', String(open));
  });

  nav.addEventListener('click', function (e) {
    if (e.target.tagName === 'A') {
      nav.classList.remove('is-open');
      burger.setAttribute('aria-expanded', 'false');
    }
  });

  /* --- cień headera po scrollu --- */
  var hdr = document.getElementById('hdr');
  var onScroll = function () {
    hdr.classList.toggle('is-stuck', window.scrollY > 8);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* --- reveal sekcji --- */
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var targets = document.querySelectorAll(
    '.sec__head, .cat, .route__step, .feat, .plan, .term, .person, .quote, .faq__list, .fleet__copy, .fleet__grid, .form, .contact__copy, .extras'
  );

  if (!reduced && 'IntersectionObserver' in window) {
    targets.forEach(function (el, i) {
      el.classList.add('reveal');
      el.style.transitionDelay = (i % 4) * 70 + 'ms';
    });

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -60px' });

    targets.forEach(function (el) { io.observe(el); });
  }

  /* --- liczniki + wskaźnik zdawalności --- */
  var GAUGE_TARGET = 87;      // % zdawalności — do podmiany na realną liczbę
  var GAUGE_LEN = 258;

  function animate(from, to, ms, step) {
    var t0 = performance.now();
    function frame(now) {
      var p = Math.min((now - t0) / ms, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      step(from + (to - from) * eased);
      if (p < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  function runStats() {
    var arc = document.getElementById('gaugeArc');
    var num = document.getElementById('gaugeNum');

    if (reduced) {
      arc.setAttribute('stroke-dashoffset', String(GAUGE_LEN * (1 - GAUGE_TARGET / 100)));
      num.textContent = GAUGE_TARGET;
    } else {
      animate(0, GAUGE_TARGET, 1400, function (v) {
        num.textContent = Math.round(v);
        arc.setAttribute('stroke-dashoffset', String(GAUGE_LEN * (1 - v / 100)));
      });
    }

    document.querySelectorAll('[data-count]').forEach(function (el) {
      var to = parseInt(el.dataset.count, 10);
      if (reduced) { el.textContent = to.toLocaleString('pl-PL'); return; }
      animate(0, to, 1600, function (v) {
        el.textContent = Math.round(v).toLocaleString('pl-PL');
      });
    });
  }

  var card = document.querySelector('.hero__card');
  if (card && 'IntersectionObserver' in window) {
    var statObs = new IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting) { runStats(); statObs.disconnect(); }
    }, { threshold: 0.4 });
    statObs.observe(card);
  } else {
    runStats();
  }

  /* --- formularz (demo, bez wysyłki) --- */
  var form = document.getElementById('form');
  var info = document.getElementById('formInfo');

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var name = form.name.value.trim();
    var phone = form.phone.value.replace(/\s/g, '');

    if (name.length < 3) { info.style.color = '#C0231F'; info.textContent = 'Podaj imię i nazwisko.'; return; }
    if (phone.length < 9) { info.style.color = '#C0231F'; info.textContent = 'Podaj poprawny numer telefonu.'; return; }
    if (!form.rodo.checked) { info.style.color = '#C0231F'; info.textContent = 'Zaznacz zgodę na kontakt.'; return; }

    info.style.color = '#1E8A4C';
    info.textContent = 'Dziękujemy! Oddzwonimy tego samego dnia roboczego. (demo — zgłoszenie nie zostało wysłane)';
    form.reset();
  });
})();
