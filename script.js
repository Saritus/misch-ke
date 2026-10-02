(() => {
  const year = document.querySelector('#year');
  if (year) year.textContent = new Date().getFullYear();

  // Keep the email out of the static HTML while still presenting a normal mailto link.
  const emailUser = 'SebastianMischke';
  const emailHost = 'gmx.de';
  const email = `${emailUser}@${emailHost}`;
  const emailLink = document.querySelector('#email-link');
  const emailLabel = document.querySelector('#email-label');
  if (emailLink) emailLink.href = `mailto:${email}`;
  if (emailLabel) emailLabel.textContent = email;

  const reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      }
    }, { threshold: 0.12, rootMargin: '0px 0px -30px' });

    reveals.forEach((el) => observer.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add('visible'));
  }

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const card = document.querySelector('.tilt-card');

  if (card && !reducedMotion && window.matchMedia('(pointer: fine)').matches) {
    card.addEventListener('pointermove', (event) => {
      const rect = card.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      card.style.transform = `rotateX(${(-y * 5).toFixed(2)}deg) rotateY(${(x * 7).toFixed(2)}deg)`;
    });

    card.addEventListener('pointerleave', () => {
      card.style.transform = '';
    });
  }

  // Highlight the current nav section without changing the URL.
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
        const active = link.getAttribute('href') === `#${visible.target.id}`;
        link.style.color = active ? '#f7f8fb' : '';
      });
    }, { threshold: [0.2, 0.4, 0.6], rootMargin: '-20% 0px -55% 0px' });

    sections.forEach((section) => sectionObserver.observe(section));
  }
})();
