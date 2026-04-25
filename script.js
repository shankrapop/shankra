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

  // Contact form (no backend — graceful client-side handler)
  const form = document.getElementById('contactForm');
  const status = document.getElementById('formStatus');

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const data = new FormData(form);
      const name = (data.get('name') || '').toString().trim();
      const phone = (data.get('phone') || '').toString().trim();
      const message = (data.get('message') || '').toString().trim();

      if (!name || !phone || !message) {
        status.textContent = 'Please fill in all fields before sending.';
        status.style.color = '#c0392b';
        return;
      }

      status.style.color = '';
      status.textContent = 'Thanks — we’ll get back to you shortly.';
      form.reset();
    });
  }

  // Footer year
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();
