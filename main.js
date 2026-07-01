// main.js

document.addEventListener('DOMContentLoaded', () => {
  initStickyHeader();
  initMobileMenu();
  initFlipCards();
  initStatsCounter();
  initScrollReveals();
});

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

    card.addEventListener('click', () => {
      setFlipped(!card.classList.contains('is-flipped'));
    });

    card.addEventListener('keydown', (event) => {
      if (event.key !== 'Enter' && event.key !== ' ' && event.key !== 'Spacebar') return;
      event.preventDefault();
      setFlipped(!card.classList.contains('is-flipped'));
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

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        numbers.forEach((el) => animateStatNumber(el));
        obs.unobserve(entry.target);
      });
    },
    { threshold: 0.3 }
  );

  observer.observe(section);
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
