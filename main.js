// main.js

function init() {
  initStickyHeader();
  initMobileMenu();
  initFlipCards();
  initStatsCounter();
  initScrollReveals();
}

// As a module script this runs deferred (after the DOM is parsed), so
// DOMContentLoaded may already have fired — guard for both cases.
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

function initStickyHeader() {
  const header = document.getElementById('siteHeader');
  if (!header) return;

  const SCROLL_THRESHOLD = 20;

  const updateScrolledState = () => {
    header.classList.toggle('scrolled', window.scrollY > SCROLL_THRESHOLD);
  };

  updateScrolledState();
  window.addEventListener('scroll', updateScrolledState, { passive: true });
}

function initMobileMenu() {
  const hamburger = document.getElementById('hamburgerBtn');
  const mobileMenu = document.getElementById('mobileMenu');
  if (!hamburger || !mobileMenu) return;

  const closeMenu = () => {
    hamburger.setAttribute('aria-expanded', 'false');
    mobileMenu.classList.remove('open');
  };

  const openMenu = () => {
    hamburger.setAttribute('aria-expanded', 'true');
    mobileMenu.classList.add('open');
  };

  hamburger.addEventListener('click', () => {
    const isOpen = hamburger.getAttribute('aria-expanded') === 'true';
    if (isOpen) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  mobileMenu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', closeMenu);
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeMenu();
  });

  document.addEventListener('click', (event) => {
    const isOpen = hamburger.getAttribute('aria-expanded') === 'true';
    if (!isOpen) return;
    if (mobileMenu.contains(event.target) || hamburger.contains(event.target)) return;
    closeMenu();
  });
}

function initFlipCards() {
  const cards = document.querySelectorAll('.flip-card');

  cards.forEach((card) => {
    const front = card.querySelector('.flip-front');
    const back = card.querySelector('.flip-back');

    const setFlipped = (flipped) => {
      card.classList.toggle('is-flipped', flipped);
      card.setAttribute('aria-pressed', String(flipped));
      if (front) front.setAttribute('aria-hidden', String(flipped));
      if (back) back.setAttribute('aria-hidden', String(!flipped));
    };

    const toggle = () => setFlipped(!card.classList.contains('is-flipped'));

    // Touch handling: some mobile browsers (notably iOS Safari) don't reliably
    // fire `click` on a non-native control like this <div role="button">. Handle
    // the tap explicitly, ignoring gestures that are actually scrolls, and call
    // preventDefault so the browser's synthesized click doesn't double-toggle.
    let startX = 0;
    let startY = 0;
    let moved = false;

    card.addEventListener(
      'touchstart',
      (event) => {
        const t = event.changedTouches[0];
        startX = t.clientX;
        startY = t.clientY;
        moved = false;
      },
      { passive: true }
    );

    card.addEventListener(
      'touchmove',
      (event) => {
        const t = event.changedTouches[0];
        if (Math.abs(t.clientX - startX) > 10 || Math.abs(t.clientY - startY) > 10) {
          moved = true;
        }
      },
      { passive: true }
    );

    card.addEventListener('touchend', (event) => {
      if (moved) return; // it was a scroll, not a tap
      event.preventDefault(); // suppress the synthesized click (avoids double toggle)
      toggle();
    });

    card.addEventListener('click', toggle);

    card.addEventListener('keydown', (event) => {
      if (event.key !== 'Enter' && event.key !== ' ' && event.key !== 'Spacebar') return;
      event.preventDefault();
      toggle();
    });
  });
}

function formatStatValue(value, prefix) {
  return (prefix || '') + value.toLocaleString('es-AR');
}

function animateStatNumber(el) {
  const target = parseInt(el.dataset.target, 10);
  const prefix = el.dataset.prefix || '';
  const duration = 1500;
  const start = performance.now();

  const step = (now) => {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = Math.round(eased * target);
    el.textContent = formatStatValue(current, prefix);
    if (progress < 1) {
      requestAnimationFrame(step);
    }
  };

  requestAnimationFrame(step);
}

function initStatsCounter() {
  const section = document.querySelector('.stats');
  if (!section) return;

  const numbers = section.querySelectorAll('.stat-number');

  const setFinalValues = () => {
    numbers.forEach((el) => {
      const target = parseInt(el.dataset.target, 10);
      const prefix = el.dataset.prefix || '';
      el.textContent = formatStatValue(target, prefix);
    });
  };

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion || !('IntersectionObserver' in window)) {
    setFinalValues();
    return;
  }

  let started = false;
  const start = () => {
    if (started) return;
    started = true;
    numbers.forEach((el) => animateStatNumber(el));
    window.removeEventListener('scroll', onScroll);
    observer.disconnect();
  };

  // Fires as soon as any part of the section reaches the lower portion of the
  // viewport — more reliable on mobile than requiring a 30% intersection ratio.
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) start();
      });
    },
    { threshold: 0, rootMargin: '0px 0px -12% 0px' }
  );
  observer.observe(section);

  // Fallback: if the observer somehow never fires, a scroll check will.
  const onScroll = () => {
    const rect = section.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.9 && rect.bottom > 0) start();
  };
  window.addEventListener('scroll', onScroll, { passive: true });

  // In case the section is already within view on load.
  onScroll();
}

function initScrollReveals() {
  const items = document.querySelectorAll('[data-reveal]');
  if (!items.length) return;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion || !('IntersectionObserver' in window)) {
    // Leave content visible; the hidden state is only applied under .js-reveal.
    return;
  }

  // Activating hidden state only now guarantees no-JS / reduced-motion users see content.
  document.documentElement.classList.add('js-reveal');

  // Stagger items that share a parent so grids/rows cascade in.
  const indexInGroup = new Map();
  items.forEach((el) => {
    const parent = el.parentElement;
    const next = (indexInGroup.get(parent) || 0);
    indexInGroup.set(parent, next + 1);
    el.style.setProperty('--reveal-delay', `${Math.min(next, 5) * 90}ms`);
  });

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        obs.unobserve(entry.target);
      });
    },
    { threshold: 0.15, rootMargin: '0px 0px -8% 0px' }
  );

  items.forEach((el) => observer.observe(el));
}
