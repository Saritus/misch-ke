(() => {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(pointer: fine)').matches;

  // Current year.
  const year = document.querySelector('#year');
  if (year) year.textContent = new Date().getFullYear();

  // Email kept out of the static HTML.
  const email = ['SebastianMischke', 'gmx.de'].join('@');
  const emailLink = document.querySelector('#email-link');
  const emailLabel = document.querySelector('#email-label');
  if (emailLink) emailLink.href = `mailto:${email}`;
  if (emailLabel) emailLabel.textContent = email;

  // Prefer the self-hosted portrait. Fall back to the existing GitHub Pages asset
  // until tools/fetch-assets.ps1 has been run and assets/profile.png committed.
  const profile = document.querySelector('#profile-image');
  if (profile) {
    profile.addEventListener('error', () => {
      const fallback = profile.dataset.fallback;
      if (fallback && profile.src !== fallback) profile.src = fallback;
    }, { once: true });
  }

  // Reveal sections on scroll.
  const reveals = [...document.querySelectorAll('.reveal')];
  if (!reducedMotion && 'IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      }
    }, { threshold: 0.11, rootMargin: '0px 0px -30px' });
    reveals.forEach((el) => revealObserver.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add('visible'));
  }

  // Header state and reading progress.
  const topbar = document.querySelector('#topbar');
  const progress = document.querySelector('.scroll-progress span');
  const updateScrollState = () => {
    const y = window.scrollY;
    if (topbar) topbar.classList.toggle('scrolled', y > 30);

    if (progress) {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const pct = max > 0 ? Math.min(1, y / max) : 0;
      progress.style.width = `${pct * 100}%`;
    }
  };
  updateScrollState();
  window.addEventListener('scroll', updateScrollState, { passive: true });

  // Mobile menu.
  const menuButton = document.querySelector('.menu-button');
  const mobileMenu = document.querySelector('#mobile-menu');
  const setMenu = (open) => {
    if (!menuButton || !mobileMenu) return;
    menuButton.setAttribute('aria-expanded', String(open));
    mobileMenu.setAttribute('aria-hidden', String(!open));
    mobileMenu.classList.toggle('open', open);
    document.body.classList.toggle('menu-open', open);
  };
  menuButton?.addEventListener('click', () => {
    setMenu(menuButton.getAttribute('aria-expanded') !== 'true');
  });
  mobileMenu?.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => setMenu(false));
  });
  window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') setMenu(false);
  });

  // Desktop cursor.
  if (finePointer && !reducedMotion) {
    const dot = document.querySelector('.cursor-dot');
    const ring = document.querySelector('.cursor-ring');
    let mouseX = 0, mouseY = 0, ringX = 0, ringY = 0;

    const move = (event) => {
      mouseX = event.clientX;
      mouseY = event.clientY;
      document.body.classList.add('cursor-active');
      if (dot) {
        dot.style.left = `${mouseX}px`;
        dot.style.top = `${mouseY}px`;
      }
    };
    window.addEventListener('pointermove', move, { passive: true });

    const animateRing = () => {
      ringX += (mouseX - ringX) * 0.16;
      ringY += (mouseY - ringY) * 0.16;
      if (ring) {
        ring.style.left = `${ringX}px`;
        ring.style.top = `${ringY}px`;
      }
      requestAnimationFrame(animateRing);
    };
    animateRing();

    document.querySelectorAll('a, button, summary').forEach((el) => {
      el.addEventListener('pointerenter', () => document.body.classList.add('cursor-hover'));
      el.addEventListener('pointerleave', () => document.body.classList.remove('cursor-hover'));
    });

    // Magnetic links/buttons.
    document.querySelectorAll('.magnetic').forEach((el) => {
      el.addEventListener('pointermove', (event) => {
        const rect = el.getBoundingClientRect();
        const x = event.clientX - rect.left - rect.width / 2;
        const y = event.clientY - rect.top - rect.height / 2;
        el.style.transform = `translate(${x * 0.08}px, ${y * 0.08}px)`;
      });
      el.addEventListener('pointerleave', () => {
        el.style.transform = '';
      });
    });

    // Portrait tilt.
    const portraitCard = document.querySelector('#portrait-card');
    if (portraitCard) {
      portraitCard.addEventListener('pointermove', (event) => {
        const rect = portraitCard.getBoundingClientRect();
        const nx = (event.clientX - rect.left) / rect.width - 0.5;
        const ny = (event.clientY - rect.top) / rect.height - 0.5;
        portraitCard.style.transform =
          `rotateX(${(-ny * 6).toFixed(2)}deg) rotateY(${(nx * 8).toFixed(2)}deg) translateZ(5px)`;
      });
      portraitCard.addEventListener('pointerleave', () => {
        portraitCard.style.transform = '';
      });
    }
  }

  // Animated background: low-cost "system graph" particles.
  const canvas = document.querySelector('#system-field');
  if (canvas && !reducedMotion) {
    const ctx = canvas.getContext('2d');
    let width = 0, height = 0, dpr = 1;
    let points = [];

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const count = width < 700 ? 22 : Math.min(48, Math.floor(width / 30));
      points = Array.from({ length: count }, (_, i) => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.12,
        vy: (Math.random() - 0.5) * 0.12,
        r: Math.random() * 1.2 + 0.45
      }));
    };

    const frame = () => {
      ctx.clearRect(0, 0, width, height);

      for (const p of points) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;
        if (p.y < -10) p.y = height + 10;
        if (p.y > height + 10) p.y = -10;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(168,255,96,.16)';
        ctx.fill();
      }

      const maxDist = width < 700 ? 115 : 145;
      for (let i = 0; i < points.length; i++) {
        for (let j = i + 1; j < points.length; j++) {
          const a = points[i], b = points[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          const dist = Math.hypot(dx, dy);
          if (dist < maxDist) {
            const alpha = (1 - dist / maxDist) * 0.055;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(114,244,210,${alpha})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }

      requestAnimationFrame(frame);
    };

    resize();
    window.addEventListener('resize', resize, { passive: true });
    frame();
  }

  // Active desktop navigation.
  const navLinks = [...document.querySelectorAll('.desktop-nav a')];
  const sections = navLinks
    .map((link) => document.querySelector(link.getAttribute('href')))
    .filter(Boolean);

  if ('IntersectionObserver' in window && sections.length) {
    const sectionObserver = new IntersectionObserver((entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visible) return;

      navLinks.forEach((link) => {
        link.style.color =
          link.getAttribute('href') === `#${visible.target.id}` ? '#f2f5f7' : '';
      });
    }, { threshold: [0.15, 0.3, 0.5], rootMargin: '-18% 0px -64% 0px' });

    sections.forEach((section) => sectionObserver.observe(section));
  }
})();
