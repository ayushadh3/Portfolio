/* Aayush Adhikari — portfolio scripts: cookie consent + gated analytics,
   mobile nav, contact form validation. No dependencies, loaded with defer. */
(function () {
  'use strict';

  /* Production domain for privacy-respecting analytics (Plausible).
     This is not a secret — change it to match your live domain. */
  var ANALYTICS_DOMAIN = 'aayushadhikari.com.np';
  var CONSENT_KEY = 'aa-cookie-consent';

  /* ---------- Cookie consent + consent-gated analytics ---------- */
  var banner = document.getElementById('cookie-banner');

  function readConsent() {
    try { return localStorage.getItem(CONSENT_KEY); } catch (e) { return null; }
  }
  function writeConsent(value) {
    try { localStorage.setItem(CONSENT_KEY, value); } catch (e) { /* storage unavailable */ }
  }

  var analyticsLoaded = false;
  function loadAnalytics() {
    if (analyticsLoaded || !ANALYTICS_DOMAIN) return;
    analyticsLoaded = true;
    var s = document.createElement('script');
    s.defer = true;
    s.setAttribute('data-domain', ANALYTICS_DOMAIN);
    s.src = 'https://plausible.io/js/script.js';
    document.head.appendChild(s);
  }

  if (banner) {
    var stored = readConsent();
    if (stored === 'accepted') {
      loadAnalytics();
    } else if (!stored) {
      banner.hidden = false;
    }
    banner.addEventListener('click', function (e) {
      var btn = e.target.closest('button[data-consent]');
      if (!btn) return;
      var choice = btn.getAttribute('data-consent');
      writeConsent(choice);
      banner.hidden = true;
      if (choice === 'accepted') loadAnalytics();
    });
  }

  /* ---------- Mobile navigation ---------- */
  var navToggle = document.getElementById('nav-toggle');
  var navMenu = document.getElementById('nav-menu');
  if (navToggle && navMenu) {
    navToggle.addEventListener('click', function () {
      var open = document.body.classList.toggle('nav-open');
      navToggle.setAttribute('aria-expanded', String(open));
    });
    navMenu.addEventListener('click', function (e) {
      if (e.target.closest('a')) {
        document.body.classList.remove('nav-open');
        navToggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* ---------- Contact form ---------- */
  var form = document.getElementById('contact-form');
  if (!form) return;

  var startedInput = document.getElementById('f-started');
  var renderTime = Date.now();
  if (startedInput) startedInput.value = String(renderTime);

  var submitBtn = form.querySelector('button[type="submit"]');
  var status = document.getElementById('form-status');

  var validators = {
    name: function (v) {
      var t = v.trim();
      return (t.length >= 2 && t.length <= 100) ? '' : 'Please enter your name (2\u2013100 characters).';
    },
    email: function (v) {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? '' : 'Please enter a valid email address.';
    },
    projectType: function (v) {
      return v ? '' : 'Please choose what this inquiry is about.';
    },
    message: function (v) {
      return v.trim().length >= 20 ? '' : 'Please write at least 20 characters so I can respond properly.';
    }
  };

  function fieldErrorEl(name) {
    return document.getElementById('f-' + name + '-error');
  }

  function validateField(name) {
    var input = form.elements[name];
    if (!input) return true;
    var msg = validators[name] ? validators[name](input.value) : '';
    var errEl = fieldErrorEl(name);
    input.setAttribute('aria-invalid', msg ? 'true' : 'false');
    if (errEl) errEl.textContent = msg;
    return !msg;
  }

  ['name', 'email', 'projectType', 'message'].forEach(function (name) {
    var input = form.elements[name];
    if (!input) return;
    input.addEventListener('blur', function () { validateField(name); });
    input.addEventListener('input', function () {
      if (input.getAttribute('aria-invalid') === 'true') validateField(name);
    });
    input.addEventListener('change', function () { validateField(name); });
  });

  function setStatus(text, kind) {
    if (!status) return;
    status.textContent = text;
    status.className = 'form-status' + (kind ? ' is-' + kind : '');
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    var allValid = true;
    var firstBad = null;
    ['name', 'email', 'projectType', 'message'].forEach(function (name) {
      if (!validateField(name) && !firstBad) firstBad = form.elements[name];
      allValid = allValid && validateField(name);
    });
    if (!allValid) {
      if (firstBad) firstBad.focus();
      setStatus('Please fix the highlighted fields and try again.', 'error');
      return;
    }

    /* Human-only timing mirror of the server check — bots that fire instantly fail here too */
    if (Date.now() - renderTime < 2500) {
      setStatus('Thanks for the enthusiasm — please take a moment to write your message.', 'error');
      return;
    }

    if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Sending\u2026'; }
    setStatus('Sending your message\u2026');

    fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(Object.fromEntries(new FormData(form)))
    })
      .then(function (res) { return res.json().catch(function () { return { ok: false }; }); })
      .then(function (data) {
        if (data.ok) {
          form.reset();
          if (startedInput) startedInput.value = String(Date.now());
          setStatus('Thank you \u2014 your message has been sent. Aayush typically replies within two working days.', 'ok');
        } else if (data.errors) {
          Object.keys(data.errors).forEach(function (name) {
            var input = form.elements[name];
            var errEl = fieldErrorEl(name);
            if (input) input.setAttribute('aria-invalid', 'true');
            if (errEl && data.errors[name]) errEl.textContent = data.errors[name];
          });
          setStatus('Please fix the highlighted fields and try again.', 'error');
        } else {
          setStatus(data.error || 'Something went wrong. Please email hello@aayushadhikari.com.np directly.', 'error');
        }
      })
      .catch(function () {
        setStatus('Network error \u2014 please check your connection or email hello@aayushadhikari.com.np directly.', 'error');
      })
      .finally(function () {
        if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Start a Project'; }
      });
  });
})();
