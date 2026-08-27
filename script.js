/* ======================================================================
   ABDUL RAFAY AKHTAR — CINEMATIC PORTFOLIO
   script.js
   Contents: Utilities / Navigation / Appearance Switcher / Custom Cursor /
   Scroll Reveal / Parallax Depth / Tilt Cards / Magnetic Buttons /
   Typing Text / Number Counters / Skill Bars / Portfolio Tabs /
   Contact Form / Back to Top / Footer Year
   ====================================================================== */

(() => {
  'use strict';

  const isTouch = window.matchMedia('(hover: none), (pointer: coarse)').matches;
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
  const lerp = (a, b, t) => a + (b - a) * t;

  document.addEventListener('DOMContentLoaded', () => {
    initFooterYear();
    initNavigation();
    initAppearanceSwitcher();
    if (!isTouch) initCustomCursor();
    else document.body.classList.add('no-cursor');
    initScrollReveal();
    initSectionTransitions();
    if (!isTouch && !prefersReducedMotion) initParallaxDepth();
    if (!isTouch) initTiltCards();
    if (!isTouch) initProfileImageInteraction();
    initMagneticButtons();
    initTypingText();
    initCounters();
    initSkillBars();
    initPortfolioTabs();
    initContactForm();
    initBackToTop();
  });

  /* ============================== FOOTER YEAR ============================== */
  function initFooterYear() {
    const el = document.getElementById('year');
    if (el) el.textContent = new Date().getFullYear();
  }

  /* ============================== NAVIGATION ============================== */
  function initNavigation() {
    const navbar = document.getElementById('navbar');
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.getElementById('navLinks');
    const links = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('main > section[id]');

    const onScroll = () => {
      navbar.classList.toggle('is-scrolled', window.scrollY > 40);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    if (hamburger && navLinks) {
      hamburger.addEventListener('click', () => {
        navLinks.classList.toggle('is-open');
        const icon = hamburger.querySelector('i');
        if (icon) icon.className = navLinks.classList.contains('is-open') ? 'fas fa-xmark' : 'fas fa-bars';
      });
      navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
        navLinks.classList.remove('is-open');
        const icon = hamburger.querySelector('i');
        if (icon) icon.className = 'fas fa-bars';
      }));
    }

    // Smooth scroll for in-page links
    document.querySelectorAll('a[href^="#"]').forEach(a => {
      a.addEventListener('click', e => {
        const id = a.getAttribute('href');
        if (id.length > 1) {
          const target = document.querySelector(id);
          if (target) {
            e.preventDefault();
            target.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'start' });
          }
        }
      });
    });

    // Active link on scroll
    if ('IntersectionObserver' in window && sections.length) {
      const obs = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            links.forEach(l => l.classList.toggle('active', l.dataset.section === entry.target.id));
          }
        });
      }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });
      sections.forEach(s => obs.observe(s));
    }
  }

  /* ============================== APPEARANCE SWITCHER (DROPDOWN) ============================== */
  function initAppearanceSwitcher() {
    const body = document.body;
    const buttons = document.querySelectorAll('.appearance-btn');
    const toggle = document.getElementById('appearanceToggle');
    const dropdown = document.getElementById('appearanceDropdown');
    const currentThemeName = document.getElementById('currentThemeName');
    const STORAGE_KEY = 'portfolio-appearance';

    // Toggle dropdown
    if (toggle && dropdown) {
      toggle.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdown.classList.toggle('is-open');
        toggle.classList.toggle('is-open');
      });

      // Close dropdown when clicking outside
      document.addEventListener('click', () => {
        dropdown.classList.remove('is-open');
        toggle.classList.remove('is-open');
      });
    }

    let flash = document.querySelector('.world-transition');
    if (!flash) {
      flash = document.createElement('div');
      flash.className = 'world-transition';
      document.body.appendChild(flash);
    }

    const setAppearance = (theme, animate = true) => {
      if (animate && !prefersReducedMotion) {
        flash.classList.remove('is-active');
        void flash.offsetWidth;
        flash.classList.add('is-active');
      }
      body.setAttribute('data-appearance', theme);
      buttons.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.appearance === theme);
      });
      localStorage.setItem(STORAGE_KEY, theme);

      // Update dropdown label
      if (currentThemeName) {
        const activeBtn = document.querySelector(`.appearance-btn[data-appearance="${theme}"]`);
        if (activeBtn) {
          currentThemeName.textContent = activeBtn.querySelector('.appearance-name').textContent;
        }
      }

      window.dispatchEvent(new CustomEvent('appearance-change', { detail: { theme } }));
    };

    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      setAppearance(saved, false);
    } else {
      // Set initial label
      if (currentThemeName) {
        const activeBtn = document.querySelector('.appearance-btn.active');
        if (activeBtn) {
          currentThemeName.textContent = activeBtn.querySelector('.appearance-name').textContent;
        }
      }
    }

    buttons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        setAppearance(btn.dataset.appearance);
        // Close dropdown after selection
        if (dropdown) dropdown.classList.remove('is-open');
        if (toggle) toggle.classList.remove('is-open');
      });
    });

    window.getAppearance = () => body.getAttribute('data-appearance') || 'cosmos';
  }

  /* ============================== CUSTOM CURSOR ============================== */
  function initCustomCursor() {
    const dot = document.getElementById('cursorDot');
    const ring = document.getElementById('cursorRing');
    const label = document.getElementById('cursorLabel');
    if (!dot || !ring) return;

    let mouseX = window.innerWidth / 2, mouseY = window.innerHeight / 2;
    let ringX = mouseX, ringY = mouseY;

    window.addEventListener('mousemove', e => {
      mouseX = e.clientX; mouseY = e.clientY;
      dot.style.left = mouseX + 'px';
      dot.style.top = mouseY + 'px';
      label.style.left = mouseX + 'px';
      label.style.top = mouseY + 'px';
    });

    const tick = () => {
      ringX = lerp(ringX, mouseX, 0.18);
      ringY = lerp(ringY, mouseY, 0.18);
      ring.style.left = ringX + 'px';
      ring.style.top = ringY + 'px';
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);

    const setLabel = (text) => {
      if (text) { label.textContent = text; label.classList.add('is-active'); }
      else { label.classList.remove('is-active'); label.textContent = ''; }
    };

    const hoverMap = [
      { sel: '.project-showcase-card', text: 'View', hover: true },
      { sel: '.video-frame', text: '', hover: true },
      { sel: '.techstack-item', text: '', hover: true },
      { sel: '.tilt-card', text: '', hover: true },
      { sel: 'a, button, [data-hover]', text: '', hover: true },
    ];

    hoverMap.forEach(({ sel, text }) => {
      document.querySelectorAll(sel).forEach(el => {
        el.addEventListener('mouseenter', () => {
          document.body.classList.add('cursor-hover');
          setLabel(text);
        });
        el.addEventListener('mouseleave', () => {
          document.body.classList.remove('cursor-hover');
          setLabel('');
        });
      });
    });

    document.addEventListener('mouseleave', () => { dot.style.opacity = 0; ring.style.opacity = 0; });
    document.addEventListener('mouseenter', () => { dot.style.opacity = 1; ring.style.opacity = 0.6; });
  }

  /* ============================== SCROLL REVEAL ============================== */
  function initScrollReveal() {
    const items = document.querySelectorAll('[data-animate]');
    if (!items.length) return;

    if (!('IntersectionObserver' in window)) {
      items.forEach(el => el.classList.add('is-visible'));
      return;
    }

    const obs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const delay = parseInt(entry.target.dataset.delay || '0', 10);
          setTimeout(() => entry.target.classList.add('is-visible'), delay);
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });

    items.forEach(el => obs.observe(el));
  }

  /* ============================== SECTION SCROLL TRANSITIONS ============================== */
  function initSectionTransitions() {
    const sections = document.querySelectorAll('.section-padding');
    if (!sections.length) return;

    if (!('IntersectionObserver' in window)) {
      sections.forEach(s => s.classList.add('in-view'));
      return;
    }

    const obs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        entry.target.classList.toggle('in-view', entry.isIntersecting);
      });
    }, { threshold: 0.18, rootMargin: '0px 0px -6% 0px' });

    sections.forEach(s => obs.observe(s));
  }

  /* ============================== PROFILE IMAGE INTERACTION ============================== */
  function initProfileImageInteraction() {
    const wrap = document.getElementById('profileImage');
    if (!wrap) return;
    const MAX_TILT = 9;

    wrap.addEventListener('mousemove', (e) => {
      const rect = wrap.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width;
      const py = (e.clientY - rect.top) / rect.height;
      wrap.style.setProperty('--mx', (px * 100).toFixed(1) + '%');
      wrap.style.setProperty('--my', (py * 100).toFixed(1) + '%');
      const rotY = (px - 0.5) * MAX_TILT * 2;
      const rotX = (0.5 - py) * MAX_TILT * 2;
      wrap.style.transform = `perspective(1000px) rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg) scale(1.02)`;
    });

    wrap.addEventListener('mouseleave', () => {
      wrap.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)';
    });
  }

  /* ============================== PARALLAX DEPTH ============================== */
  function initParallaxDepth() {
    const items = Array.from(document.querySelectorAll('.floating-element[data-depth]')).map(el => ({
      el, depth: parseInt(el.dataset.depth || '20', 10), x: 0, y: 0, tx: 0, ty: 0,
    }));
    if (!items.length) return;

    let mx = 0, my = 0;
    window.addEventListener('mousemove', e => {
      mx = (e.clientX / window.innerWidth) - 0.5;
      my = (e.clientY / window.innerHeight) - 0.5;
    });

    const tick = () => {
      items.forEach(item => {
        const strength = item.depth / 8;
        item.tx = lerp(item.tx, mx * strength, 0.06);
        item.ty = lerp(item.ty, my * strength, 0.06);
        item.el.style.transform = `translate3d(${item.tx.toFixed(2)}px, ${item.ty.toFixed(2)}px, 0)`;
      });
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  /* ============================== TILT CARDS ============================== */
  function initTiltCards() {
    const cards = document.querySelectorAll('[data-tilt]');
    const MAX_TILT = 5;

    cards.forEach(card => {
      card.addEventListener('mousemove', e => {
        const rect = card.getBoundingClientRect();
        const px = (e.clientX - rect.left) / rect.width - 0.5;
        const py = (e.clientY - rect.top) / rect.height - 0.5;
        card.style.transform = `perspective(900px) rotateX(${(-py * MAX_TILT).toFixed(2)}deg) rotateY(${(px * MAX_TILT).toFixed(2)}deg) translateZ(0)`;
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg)';
      });
    });
  }

  /* ============================== MAGNETIC BUTTONS ============================== */
  function initMagneticButtons() {
    if (isTouch) return;
    const items = document.querySelectorAll('[data-magnetic]');
    const STRENGTH = 0.35;

    items.forEach(btn => {
      btn.addEventListener('mousemove', e => {
        const rect = btn.getBoundingClientRect();
        const x = (e.clientX - rect.left - rect.width / 2) * STRENGTH;
        const y = (e.clientY - rect.top - rect.height / 2) * STRENGTH;
        btn.style.transform = `translate(${x}px, ${y}px)`;
      });
      btn.addEventListener('mouseleave', () => { btn.style.transform = 'translate(0,0)'; });
    });
  }

  /* ============================== TYPING TEXT ============================== */
  function initTypingText() {
    const el = document.getElementById('typingText');
    if (!el) return;
    const roles = ['Computer Science Student','Software Engineer', 'AI Full Stack Developer', 'React.js Enthusiast', 'Creative Coder', 'Problem Solver'];
    let roleIndex = 0, charIndex = 0, deleting = false;

    const tick = () => {
      const current = roles[roleIndex];
      if (!deleting) {
        charIndex++;
        el.textContent = current.slice(0, charIndex);
        if (charIndex === current.length) { deleting = true; setTimeout(tick, 1600); return; }
      } else {
        charIndex--;
        el.textContent = current.slice(0, charIndex);
        if (charIndex === 0) { deleting = false; roleIndex = (roleIndex + 1) % roles.length; }
      }
      setTimeout(tick, deleting ? 40 : 85);
    };
    tick();
  }

  /* ============================== NUMBER COUNTERS ============================== */
  function initCounters() {
    const counters = document.querySelectorAll('[data-count]');
    if (!counters.length) return;

    const animateCount = (el) => {
      const target = parseInt(el.dataset.count, 10) || 0;
      const duration = 1500;
      const start = performance.now();
      const step = (now) => {
        const progress = clamp((now - start) / duration, 0, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.round(eased * target);
        if (progress < 1) requestAnimationFrame(step);
        else el.textContent = target;
      };
      requestAnimationFrame(step);
    };

    if (!('IntersectionObserver' in window)) { counters.forEach(animateCount); return; }
    const obs = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) { animateCount(entry.target); obs.unobserve(entry.target); }
      });
    }, { threshold: 0.5 });
    counters.forEach(c => obs.observe(c));
  }

  /* ============================== SKILL BARS ============================== */
  function initSkillBars() {
    const bars = document.querySelectorAll('.skill-bar-item[data-skill]');
    if (!bars.length) return;

    const activate = (item) => {
      const fill = item.querySelector('.skill-bar-fill');
      const glow = item.querySelector('.skill-bar-glow');
      if (!fill) return;
      const width = fill.dataset.width || '0';
      fill.style.width = width + '%';
      if (glow) glow.style.left = `calc(${width}% - 7px)`;
    };

    if (!('IntersectionObserver' in window)) { bars.forEach(activate); return; }
    const obs = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) { activate(entry.target); obs.unobserve(entry.target); }
      });
    }, { threshold: 0.4 });
    bars.forEach(b => obs.observe(b));
  }

  /* ============================== PORTFOLIO TABS ============================== */
  function initPortfolioTabs() {
    const tabs = document.querySelectorAll('.portfolio-tab');
    const contents = document.querySelectorAll('.portfolio-content');
    if (!tabs.length) return;

    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        const target = document.getElementById(`tab-${tab.dataset.tab}`);
        contents.forEach(c => c.classList.remove('active'));
        if (target) target.classList.add('active');
      });
    });
  }

  /* ============================== CONTACT FORM ============================== */
  function initContactForm() {
    const contactForm = document.getElementById('contactForm');
    const formFeedback = document.getElementById('formFeedback');
    
    if (!contactForm || !formFeedback) return;

    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('name').value.trim();
      const email = document.getElementById('email').value.trim();
      const message = document.getElementById('message').value.trim();

      if (!name || !email || !message) {
        formFeedback.textContent = '⚠️ All fields are required.';
        formFeedback.style.color = '#b8865a';
        return;
      }
      if (!email.includes('@') || !email.includes('.')) {
        formFeedback.textContent = '⚠️ Please enter a valid email address.';
        formFeedback.style.color = '#b8865a';
        return;
      }

      // Show loading state
      formFeedback.textContent = '⏳ Sending...';
      formFeedback.style.color = '#888';

      fetch(contactForm.action, {
        method: 'POST',
        body: new FormData(contactForm),
        headers: { 'Accept': 'application/json' }
      })
      .then(response => {
        if (response.ok) {
          formFeedback.textContent = '✅ Message sent successfully!';
          formFeedback.style.color = '#6b8c6b';
          contactForm.reset();
        } else {
          formFeedback.textContent = '⚠️ Something went wrong. Please try again.';
          formFeedback.style.color = '#b8865a';
        }
      })
      .catch(() => {
        formFeedback.textContent = '⚠️ Something went wrong. Please try again.';
        formFeedback.style.color = '#b8865a';
      });

      setTimeout(() => {
        formFeedback.textContent = '';
      }, 4000);
    });
  }

  /* ============================== BACK TO TOP ============================== */
  function initBackToTop() {
    const btn = document.getElementById('backToTop');
    if (!btn) return;
    const toggle = () => btn.style.opacity = window.scrollY > 500 ? '1' : '0';
    btn.style.transition = 'opacity .3s ease';
    toggle();
    window.addEventListener('scroll', toggle, { passive: true });
    btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' }));
  }

})();