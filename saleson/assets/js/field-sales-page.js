/* field-sales — page behaviour. */
function toggleFaq(btn) {
    const isOpen = btn.classList.contains('open');
    document.querySelectorAll('.faq-q').forEach(b => { b.classList.remove('open'); b.setAttribute('aria-expanded','false'); });
    document.querySelectorAll('.faq-a').forEach(a => a.classList.remove('open'));
    if (!isOpen) { btn.classList.add('open'); btn.setAttribute('aria-expanded','true'); btn.nextElementSibling.classList.add('open'); }
  }
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const t = document.querySelector(a.getAttribute('href'));
      if (t) { e.preventDefault(); window.scrollTo({ top: t.getBoundingClientRect().top + window.pageYOffset - 140, behavior: 'smooth' }); }
    });
  });
  const subNav = document.getElementById('sub-nav');
  const hero = document.querySelector('.hero');
  const subNavLinks = document.querySelectorAll('.sub-nav-link');
  function updateSubNav() {
    if (!hero || !subNav) return;
    subNav.classList.toggle('visible', hero.getBoundingClientRect().bottom < 0);
    const anchors = ['#features','#outlet-management','#activity-logs','#manager-reports','#faq'];
    let current = '';
    anchors.forEach(id => { const el = document.querySelector(id); if (el && el.getBoundingClientRect().top <= 140) current = id; });
    subNavLinks.forEach(link => link.classList.toggle('active', link.getAttribute('href') === current));
  }
  window.addEventListener('scroll', updateSubNav, { passive: true });
  updateSubNav();
  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.style.opacity = '1'; e.target.style.transform = 'translateY(0)'; } });
  }, { threshold: 0.08 });
  document.querySelectorAll('.cf-card, .pain-card, .adv-card, .related-card').forEach(el => {
    el.style.opacity = '0'; el.style.transform = 'translateY(16px)'; el.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
    observer.observe(el);
  });

document.querySelectorAll('[data-page-action="action-001"]').forEach(element => {
  element.addEventListener("click", function(event) {
    const result = (function(event) { toggleFaq(this) }).call(this, event);
    if (result === false) { event.preventDefault(); event.stopPropagation(); }
  });
});
