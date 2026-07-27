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

  // WhatsApp numbers (digits only, no '+'). Every click is silently load-balanced 50/50 between them.
  const WHATSAPP_NUMBERS = ['919050666673', '919050666659'];

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

  // Intercept every WhatsApp entry point (floating button, footer link, contact section,
  // form's WhatsApp submit) and route each click to a randomly-picked number so both team
  // members receive roughly half the messages over time.
  document.addEventListener('click', (e) => {
    const trigger = e.target.closest('.wa-fab, #whatsappBtn, a[href*="wa.me/"]');
    if (!trigger) return;

    e.preventDefault();

    // If it's the contact-form's WhatsApp button, build a message from the form fields.
    let message = null;
    if (trigger.id === 'whatsappBtn' && form) {
      const name    = (form.elements.name && form.elements.name.value || '').trim();
      const phone   = (form.elements.phone && form.elements.phone.value || '').trim();
      const details = (form.elements.message && form.elements.message.value || '').trim();
      const lines = ['Hi Shankra Plaster, I need a quote for gypsum plaster.'];
      if (name)    lines.push('Name: ' + name);
      if (phone)   lines.push('Phone: ' + phone);
      if (details) lines.push('Details: ' + details);
      message = lines.join('\n');
    }

    const number = WHATSAPP_NUMBERS[Math.floor(Math.random() * WHATSAPP_NUMBERS.length)];
    const url = 'https://wa.me/' + number + (message ? '?text=' + encodeURIComponent(message) : '');
    window.open(url, '_blank', 'noopener');
  });

  // Footer year
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();
