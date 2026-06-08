/**
 * Vex Guild — script.js
 * Parallax · Scroll reveal · Burger menu · FAQ accordion · Canvas particles
 */

'use strict';

/* ═══════════════════════════════════════════════
   DOM REFERENCES
═══════════════════════════════════════════════ */
const heroBg      = document.getElementById('heroBg');
const heroCanvas  = document.getElementById('heroCanvas');
const burger      = document.getElementById('burger');
const mainNav     = document.getElementById('main-nav');
const header      = document.querySelector('.site-header');
const faqItems    = document.querySelectorAll('.faq-item');
const navLinks    = document.querySelectorAll('.main-nav a');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

/* ═══════════════════════════════════════════════
   1. HEADER — scroll state
═══════════════════════════════════════════════ */
let headerTicking = false;
let headerScrolled = false;

function updateHeader() {
  if (!header) return;
  const nextScrolled = window.scrollY > 60;

  if (nextScrolled !== headerScrolled) {
    headerScrolled = nextScrolled;
    header.classList.toggle('scrolled', nextScrolled);
  }

  headerTicking = false;
}

function requestHeaderUpdate() {
  if (headerTicking) return;
  headerTicking = true;
  requestAnimationFrame(updateHeader);
}

window.addEventListener('scroll', requestHeaderUpdate, { passive: true });
updateHeader();

/* ═══════════════════════════════════════════════
   2. PARALLAX HERO BACKGROUND
═══════════════════════════════════════════════ */
let ticking = false;
const parallaxViewport = window.matchMedia('(min-width: 720px)');

function canUseParallax() {
  return heroBg && parallaxViewport.matches && !reduceMotion.matches;
}

function applyParallax() {
  if (!heroBg) return;

  const y = window.scrollY;
  const heroHeight = heroBg.closest('.hero')?.offsetHeight || window.innerHeight;
  if (y < heroHeight * 1.1) {
    heroBg.style.setProperty('--hero-parallax', `${Math.round(y * 0.12)}px`);
  }
  ticking = false;
}

window.addEventListener('scroll', () => {
  if (!canUseParallax()) return;
  if (!ticking) {
    requestAnimationFrame(applyParallax);
    ticking = true;
  }
}, { passive: true });

if (heroBg && !canUseParallax()) {
  heroBg.style.setProperty('--hero-parallax', '0px');
}

/* ═══════════════════════════════════════════════
   3. SCROLL REVEAL via IntersectionObserver
═══════════════════════════════════════════════ */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, {
  rootMargin: '0px 0px -60px 0px',
  threshold: 0.1,
});

document.querySelectorAll('[data-reveal]').forEach((el, i) => {
  /* Stagger within the same grid/group */
  const parent = el.parentElement;
  const siblings = parent ? [...parent.querySelectorAll('[data-reveal]')] : [];
  const idx = siblings.indexOf(el);
  if (idx > 0) {
    el.style.transitionDelay = `${idx * 0.08}s`;
  }
  revealObserver.observe(el);
});

/* ═══════════════════════════════════════════════
   4. BURGER MENU
═══════════════════════════════════════════════ */
function openNav() {
  if (!mainNav || !burger) return;
  mainNav.classList.add('is-open');
  burger.classList.add('is-open');
  burger.setAttribute('aria-expanded', 'true');
}

function closeNav() {
  if (!mainNav || !burger) return;
  mainNav.classList.remove('is-open');
  burger.classList.remove('is-open');
  burger.setAttribute('aria-expanded', 'false');
}

if (burger && mainNav) {
  burger.addEventListener('click', () => {
    const isOpen = mainNav.classList.contains('is-open');
    isOpen ? closeNav() : openNav();
  });

  /* Close on nav link click */
  navLinks.forEach(link => link.addEventListener('click', closeNav));

  /* Close on outside click */
  document.addEventListener('click', (e) => {
    if (!header.contains(e.target)) closeNav();
  });

  /* Close on Escape */
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeNav();
  });
}

/* ═══════════════════════════════════════════════
   5. FAQ ACCORDION
═══════════════════════════════════════════════ */
faqItems.forEach(item => {
  const btn    = item.querySelector('.faq-question');
  const answer = item.querySelector('.faq-answer');
  if (!btn || !answer) return;

  /* Remove hidden attr so CSS max-height transition works */
  answer.removeAttribute('hidden');

  btn.addEventListener('click', () => {
    const isOpen = item.classList.contains('is-open');

    /* Close all others */
    faqItems.forEach(other => {
      other.classList.remove('is-open');
      other.querySelector('.faq-question')?.setAttribute('aria-expanded', 'false');
    });

    /* Toggle clicked */
    if (!isOpen) {
      item.classList.add('is-open');
      btn.setAttribute('aria-expanded', 'true');
    }
  });
});

/* ═══════════════════════════════════════════════
   6. SMOOTH SCROLL — JS fallback for older Safari
═══════════════════════════════════════════════ */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', (e) => {
    const targetId = anchor.getAttribute('href');
    if (targetId === '#') return;

    const target = document.querySelector(targetId);
    if (!target) return;

    e.preventDefault();
    const headerOffset = header ? header.offsetHeight : 72;
    const top = targetId === '#hero' || targetId === '#top'
      ? 0
      : target.getBoundingClientRect().top + window.scrollY - headerOffset + 1;

    window.scrollTo({ top, behavior: 'smooth' });
  });
});

/* ═══════════════════════════════════════════════
   7. CANVAS PARTICLES
═══════════════════════════════════════════════ */
(function initParticles() {
  if (!heroCanvas) return;

  const ctx = heroCanvas.getContext('2d');
  if (!ctx) return;

  let W, H, particles;
  const COUNT = 70;
  let animationId = 0;
  let isRunning = false;
  let isHeroVisible = true;

  /* Colour palette: white · blue · gold · purple */
  const COLORS = [
    'rgba(255,255,255,',
    'rgba(156,183,217,',
    'rgba(245,154,35,',
    'rgba(125,107,166,',
  ];

  function randomColor() {
    return COLORS[Math.floor(Math.random() * COLORS.length)];
  }

  function createParticle() {
    return {
      x:     Math.random() * W,
      y:     Math.random() * H,
      r:     Math.random() * 1.5 + 0.4,
      vx:    (Math.random() - 0.5) * 0.18,
      vy:    (Math.random() - 0.5) * 0.18 - 0.04,
      alpha: Math.random() * 0.55 + 0.15,
      color: randomColor(),
      /* twinkle */
      twinkleSpeed: Math.random() * 0.012 + 0.004,
      twinkleDir:   Math.random() < 0.5 ? 1 : -1,
      /* pixel chance: square instead of circle */
      pixel: Math.random() < 0.25,
    };
  }

  function resize() {
    W = heroCanvas.width  = heroCanvas.offsetWidth;
    H = heroCanvas.height = heroCanvas.offsetHeight;
    particles = Array.from({ length: COUNT }, createParticle);
  }

  function draw() {
    if (!isRunning) return;

    ctx.clearRect(0, 0, W, H);

    particles.forEach(p => {
      /* Update position */
      p.x += p.vx;
      p.y += p.vy;

      /* Twinkle alpha */
      p.alpha += p.twinkleSpeed * p.twinkleDir;
      if (p.alpha > 0.75) { p.alpha = 0.75; p.twinkleDir = -1; }
      if (p.alpha < 0.05) { p.alpha = 0.05; p.twinkleDir =  1; }

      /* Wrap around */
      if (p.x < -4) p.x = W + 4;
      if (p.x > W + 4) p.x = -4;
      if (p.y < -4) p.y = H + 4;
      if (p.y > H + 4) p.y = -4;

      /* Draw */
      ctx.fillStyle = p.color + p.alpha + ')';
      if (p.pixel) {
        const s = p.r * 2;
        ctx.fillRect(Math.round(p.x - s / 2), Math.round(p.y - s / 2), s, s);
      } else {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    animationId = requestAnimationFrame(draw);
  }

  function startParticles() {
    if (isRunning || !isHeroVisible || document.hidden) return;
    isRunning = true;
    animationId = requestAnimationFrame(draw);
  }

  function stopParticles() {
    if (!isRunning) return;
    isRunning = false;
    cancelAnimationFrame(animationId);
    animationId = 0;
  }

  /* Resize observer keeps canvas crisp */
  const ro = new ResizeObserver(() => resize());
  ro.observe(heroCanvas);

  const heroSection = heroCanvas.closest('.hero');
  if (heroSection) {
    const canvasObserver = new IntersectionObserver((entries) => {
      isHeroVisible = entries.some(entry => entry.isIntersecting);
      isHeroVisible ? startParticles() : stopParticles();
    }, { threshold: 0 });

    canvasObserver.observe(heroSection);
  }

  document.addEventListener('visibilitychange', () => {
    document.hidden ? stopParticles() : startParticles();
  });

  resize();
  startParticles();
})();

/* ═══════════════════════════════════════════════
   8. ACTIVE NAV LINK — highlight on scroll
═══════════════════════════════════════════════ */
(function trackActiveSection() {
  const sections = document.querySelectorAll('section[id]');
  if (!sections.length || !navLinks.length) return;

  const headerH  = header ? header.offsetHeight : 72;

  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        navLinks.forEach(link => {
          const href = link.getAttribute('href');
          link.classList.toggle('is-active', href === '#' + id);
        });
      }
    });
  }, {
    rootMargin: `-${headerH}px 0px -60% 0px`,
    threshold: 0,
  });

  sections.forEach(s => sectionObserver.observe(s));
})();

/* ═══════════════════════════════════════════════
   9. GUIDE TOC — active section highlight
═══════════════════════════════════════════════ */
(function trackGuideToc() {
  const tocLinks = document.querySelectorAll('.guide-toc a[href^="#"]');
  if (!tocLinks.length) return;

  const targets = [...tocLinks]
    .map(link => document.querySelector(link.getAttribute('href')))
    .filter(Boolean);

  if (!targets.length) return;

  const headerH = header ? header.offsetHeight : 72;

  const tocObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = '#' + entry.target.id;
        tocLinks.forEach(link => {
          link.classList.toggle('is-active', link.getAttribute('href') === id);
        });
      }
    });
  }, {
    rootMargin: `-${headerH + 16}px 0px -55% 0px`,
    threshold: 0,
  });

  targets.forEach(el => tocObserver.observe(el));
})();
