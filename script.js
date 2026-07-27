/* Shankara POP — minimal interactivity */

(function () {
  'use strict';

  // Sticky header shadow on scroll
  const header = document.getElementById('siteHeader');
  const onScroll = () => {
    if (window.scrollY > 8) header.classList.add('is-scrolled');
    else header.classList.remove('is-scrolled');
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Mobile nav toggle
  const navToggle = document.getElementById('navToggle');
  const mobileNav = document.getElementById('mobileNav');

  const closeNav = () => {
    navToggle.classList.remove('is-open');
    navToggle.setAttribute('aria-expanded', 'false');
    mobileNav.hidden = true;
    header.classList.remove('is-solid');
  };
  const openNav = () => {
    navToggle.classList.add('is-open');
    navToggle.setAttribute('aria-expanded', 'true');
    mobileNav.hidden = false;
    header.classList.add('is-solid');
  };

  navToggle.addEventListener('click', () => {
    if (mobileNav.hidden) openNav(); else closeNav();
  });

  mobileNav.querySelectorAll('a').forEach((a) => {
    a.addEventListener('click', closeNav);
  });

  // Close mobile nav on resize to desktop
  window.addEventListener('resize', () => {
    if (window.innerWidth > 720 && !mobileNav.hidden) closeNav();
  });

  // Contact form — submits to Web3Forms
  const form = document.getElementById('contactForm');
  const status = document.getElementById('formStatus');
  const submitBtn = document.getElementById('formSubmit');

  // WhatsApp numbers (digits only, no '+'). Popup lets the user choose which one to chat with.
  const WHATSAPP_NUMBERS = [
    { number: '919050666673', display: '+91 90506 66673' },
    { number: '919050666659', display: '+91 90506 66659' },
  ];

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const data = new FormData(form);
      const name = (data.get('name') || '').toString().trim();
      const phone = (data.get('phone') || '').toString().trim();

      if (!name || !phone) {
        status.style.color = '#c0392b';
        status.textContent = 'Please enter your name and phone number.';
        return;
      }

      submitBtn.disabled = true;
      const originalText = submitBtn.textContent;
      submitBtn.textContent = 'Sending…';
      status.style.color = '';
      status.textContent = '';

      try {
        const res = await fetch(form.action, {
          method: 'POST',
          body: data,
          headers: { Accept: 'application/json' },
        });
        const result = await res.json().catch(() => ({}));
        if (res.ok && result.success !== false) {
          status.style.color = '';
          status.textContent = 'Thanks — we will get back to you within one business day.';
          form.reset();
        } else {
          status.style.color = '#c0392b';
          status.textContent = (result && result.message)
            ? result.message
            : 'Something went wrong. Please try WhatsApp or call us instead.';
        }
      } catch (err) {
        status.style.color = '#c0392b';
        status.textContent = 'Network error. Please try WhatsApp or call us instead.';
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
      }
    });
  }

  // WhatsApp choice popup — lets the user pick which number to chat with.
  // Intercepts every WhatsApp entry point (floating button, footer link, form submit)
  // and shows a small popup listing both numbers.
  const waPopup = document.createElement('div');
  waPopup.className = 'wa-choice-popup';
  waPopup.hidden = true;
  waPopup.innerHTML =
    '<div class="wa-choice-backdrop" data-wa-close></div>' +
    '<div class="wa-choice-panel" role="dialog" aria-label="Chat on WhatsApp">' +
      '<button type="button" class="wa-choice-close" data-wa-close aria-label="Close">&times;</button>' +
      '<h4>Chat on WhatsApp</h4>' +
      '<p>Choose a number to continue:</p>' +
      WHATSAPP_NUMBERS.map((n) =>
        '<a class="wa-choice-option" data-wa-base="https://wa.me/' + n.number + '" ' +
        'href="https://wa.me/' + n.number + '" target="_blank" rel="noopener">' +
          '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">' +
            '<path fill="currentColor" d="M19.05 4.91A10 10 0 0 0 4.1 17.39L3 21.5a.5.5 0 0 0 .62.62l4.21-1.06A10 10 0 1 0 19.05 4.91Z"/>' +
          '</svg>' +
          '<span>' + n.display + '</span>' +
        '</a>'
      ).join('') +
    '</div>';
  document.body.appendChild(waPopup);

  function showWaPopup(prefilledMessage) {
    const encoded = prefilledMessage ? encodeURIComponent(prefilledMessage) : '';
    waPopup.querySelectorAll('.wa-choice-option').forEach((a) => {
      const base = a.getAttribute('data-wa-base');
      a.href = encoded ? base + '?text=' + encoded : base;
    });
    waPopup.hidden = false;
    document.body.classList.add('wa-choice-open');
  }
  function hideWaPopup() {
    waPopup.hidden = true;
    document.body.classList.remove('wa-choice-open');
  }

  // Delegated listener — intercept any WhatsApp entry point
  document.addEventListener('click', (e) => {
    // Close popup on backdrop / close button click
    if (e.target.closest('[data-wa-close]')) {
      hideWaPopup();
      return;
    }
    // Ignore clicks inside the popup panel (the wa-choice-option links go through normally)
    if (e.target.closest('.wa-choice-panel a')) return;

    // Intercept: floating WhatsApp button, form's WhatsApp submit, any wa.me link on the page
    const trigger = e.target.closest('.wa-fab, #whatsappBtn, a[href*="wa.me/"]');
    if (!trigger) return;

    e.preventDefault();

    // If it's the contact-form's WhatsApp button, pre-fill a message from the form
    let message = null;
    if (trigger.id === 'whatsappBtn' && form) {
      const name = (form.elements.name && form.elements.name.value || '').trim();
      const phone = (form.elements.phone && form.elements.phone.value || '').trim();
      const details = (form.elements.message && form.elements.message.value || '').trim();
      const lines = ['Hi Shankra Plaster, I need a quote for gypsum plaster.'];
      if (name)    lines.push('Name: ' + name);
      if (phone)   lines.push('Phone: ' + phone);
      if (details) lines.push('Details: ' + details);
      message = lines.join('\n');
    }

    showWaPopup(message);
  });

  // Escape key closes popup
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !waPopup.hidden) hideWaPopup();
  });

  // Footer year
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();
