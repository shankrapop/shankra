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

  // WhatsApp number used by the secondary submit button (digits only, no '+').
  // e.g. '919876543210' for +91 98765 43210
  const WHATSAPP_NUMBER = 'YOUR_WHATSAPP_NUMBER';

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

  // WhatsApp secondary submit — opens wa.me with pre-filled message.
  // Hidden until a real WHATSAPP_NUMBER is configured above.
  const whatsappBtn = document.getElementById('whatsappBtn');
  if (whatsappBtn && (!WHATSAPP_NUMBER || WHATSAPP_NUMBER === 'YOUR_WHATSAPP_NUMBER')) {
    whatsappBtn.hidden = true;
  }
  if (whatsappBtn && form && !whatsappBtn.hidden) {
    whatsappBtn.addEventListener('click', () => {
      const name = (form.elements.name.value || '').trim();
      const phone = (form.elements.phone.value || '').trim();
      const message = (form.elements.message.value || '').trim();
      const lines = ['Hi Shankra Plaster, I need a quote for gypsum plaster.'];
      if (name) lines.push('Name: ' + name);
      if (phone) lines.push('Phone: ' + phone);
      if (message) lines.push('Details: ' + message);
      const text = encodeURIComponent(lines.join('\n'));
      window.open('https://wa.me/' + WHATSAPP_NUMBER + '?text=' + text, '_blank', 'noopener');
    });
  }

  // Footer year
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();
