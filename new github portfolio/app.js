(() => {
  'use strict';
  const menu = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.main-nav');
  const closeMenu = () => { nav?.classList.remove('is-open'); menu?.setAttribute('aria-expanded', 'false'); menu?.setAttribute('aria-label', 'Open navigation'); };
  menu?.addEventListener('click', () => {
    const open = !nav.classList.contains('is-open');
    nav.classList.toggle('is-open', open);
    menu.setAttribute('aria-expanded', String(open));
    menu.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
  });
  nav?.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });
  window.matchMedia('(min-width: 761px)').addEventListener('change', e => { if (e.matches) closeMenu(); });

  document.querySelectorAll('[data-media-viewer]').forEach(viewer => {
    const tabs = [...viewer.querySelectorAll('[data-media-tab]')];
    const activate = tab => tabs.forEach(t => {
      const selected = t === tab;
      t.setAttribute('aria-selected', String(selected));
      t.tabIndex = selected ? 0 : -1;
      document.getElementById(t.getAttribute('aria-controls')).hidden = !selected;
    });
    tabs.forEach((tab, index) => {
      tab.addEventListener('click', () => activate(tab));
      tab.addEventListener('keydown', e => {
        let next;
        if (e.key === 'ArrowRight') next = tabs[(index + 1) % tabs.length];
        if (e.key === 'ArrowLeft') next = tabs[(index + tabs.length - 1) % tabs.length];
        if (e.key === 'Home') next = tabs[0];
        if (e.key === 'End') next = tabs[tabs.length - 1];
        if (next) { e.preventDefault(); activate(next); next.focus(); next.scrollIntoView({ block: 'nearest', inline: 'nearest' }); }
      });
    });
  });

  const filters = [...document.querySelectorAll('[data-archive-filter]')];
  const archiveItems = [...document.querySelectorAll('[data-archive-category]')];
  const archiveStatus = document.getElementById('archive-status');
  filters.forEach(button => button.addEventListener('click', () => {
    filters.forEach(b => b.setAttribute('aria-pressed', String(b === button)));
    let visible = 0;
    archiveItems.forEach(item => {
      item.hidden = button.dataset.archiveFilter !== 'all' && item.dataset.archiveCategory !== button.dataset.archiveFilter;
      if (!item.hidden) visible++;
    });
    if (archiveStatus) archiveStatus.textContent = `${visible} ${visible === 1 ? 'photograph' : 'photographs'} shown.`;
  }));

  const dialog = document.querySelector('.lightbox');
  const galleryButtons = [...document.querySelectorAll('[data-lightbox]')];
  let activeGallery = galleryButtons;
  let current = 0;
  let opener = null;
  const showImage = index => {
    current = (index + activeGallery.length) % activeGallery.length;
    const button = activeGallery[current];
    const img = dialog.querySelector('.lightbox-image');
    img.src = button.dataset.lightbox;
    img.alt = button.querySelector('img').alt;
    dialog.querySelector('.lightbox-caption').textContent = button.dataset.caption;
    dialog.querySelector('.lightbox-count').textContent = `${String(current + 1).padStart(2, '0')} / ${String(activeGallery.length).padStart(2, '0')}`;
    dialog.querySelector('.lightbox-prev').hidden = activeGallery.length < 2;
    dialog.querySelector('.lightbox-next').hidden = activeGallery.length < 2;
  };
  if (dialog && galleryButtons.length) {
    galleryButtons.forEach(button => button.addEventListener('click', () => {
      const group = button.closest('[data-gallery]') || document;
      activeGallery = [...group.querySelectorAll('[data-lightbox]')].filter(b => !b.closest('[data-archive-category]')?.hidden);
      opener = button;
      showImage(activeGallery.indexOf(button));
      dialog.showModal(); document.body.classList.add('modal-open'); dialog.querySelector('.lightbox-close').focus();
    }));
    const close = () => dialog.close();
    dialog.querySelector('.lightbox-close').addEventListener('click', close);
    dialog.querySelector('.lightbox-prev').addEventListener('click', () => showImage(current - 1));
    dialog.querySelector('.lightbox-next').addEventListener('click', () => showImage(current + 1));
    dialog.addEventListener('click', e => { if (e.target === dialog) { const r = dialog.getBoundingClientRect(); if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) close(); } });
    dialog.addEventListener('keydown', e => { if (e.key === 'ArrowLeft') { e.preventDefault(); showImage(current - 1); } if (e.key === 'ArrowRight') { e.preventDefault(); showImage(current + 1); } });
    dialog.addEventListener('close', () => { document.body.classList.remove('modal-open'); opener?.focus(); });
  }

  document.querySelectorAll('[data-copy-email]').forEach(button => button.addEventListener('click', async () => {
    const status = button.closest('.contact-details').querySelector('.copy-status');
    try { await navigator.clipboard.writeText('merajnah@iastate.edu'); button.textContent = 'Email copied'; status.textContent = 'merajnah@iastate.edu copied to clipboard.'; }
    catch { status.textContent = 'Email: merajnah@iastate.edu'; }
  }));

  const progress = document.querySelector('.scroll-progress');
  const toTop = document.querySelector('.back-to-top');
  let queued = false;
  const updateScroll = () => {
    const available = document.documentElement.scrollHeight - window.innerHeight;
    if (progress) progress.style.width = `${available > 0 ? Math.min(100, window.scrollY / available * 100) : 0}%`;
    toTop?.classList.toggle('visible', window.scrollY > 900); queued = false;
  };
  window.addEventListener('scroll', () => { if (!queued) { queued = true; requestAnimationFrame(updateScroll); } }, { passive: true });
  window.addEventListener('resize', updateScroll);
  updateScroll();
  if ('IntersectionObserver' in window) {
    const sectionLinks = [...document.querySelectorAll('.case-nav a[href^="#"]')];
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => { if (entry.isIntersecting) sectionLinks.forEach(a => a.classList.toggle('is-active', a.hash === `#${entry.target.id}`)); });
    }, { rootMargin: '-110px 0px -55% 0px' });
    document.querySelectorAll('.case-section[id]').forEach(s => observer.observe(s));
  }
})();
