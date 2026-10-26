/* payment-collection — page behaviour. */
function toggleFaq(btn) {
    const isOpen = btn.classList.contains('open');
    document.querySelectorAll('.faq-q').forEach(b => { b.classList.remove('open'); b.setAttribute('aria-expanded','false'); });
    document.querySelectorAll('.faq-a').forEach(a => a.classList.remove('open'));
    if (!isOpen) { btn.classList.add('open'); btn.setAttribute('aria-expanded','true'); btn.nextElementSibling.classList.add('open'); }
  }

  const snls = document.querySelectorAll('.snl:not(.snl-cta)');
  const sids = ['pain-points','outstanding','collection-flow','credit-limit','alerts','comparison','faq'];
  const secs = sids.map(id => document.getElementById(id)).filter(Boolean);
  window.addEventListener('scroll', () => {
    const y = window.scrollY + 130;
    let cur = '';
    secs.forEach(s => { if (s.offsetTop <= y) cur = s.id; });
    snls.forEach(l => l.classList.toggle('active', l.getAttribute('href') === '#' + cur));
  }, { passive: true });

  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const t = document.querySelector(a.getAttribute('href'));
      if (t) { e.preventDefault(); window.scrollTo({ top: t.getBoundingClientRect().top + window.pageYOffset - 140, behavior: 'smooth' }); }
    });
  });

  const ro = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('vis'); });
  }, { threshold: 0.07 });
  document.querySelectorAll('.reveal').forEach(el => ro.observe(el));

document.querySelectorAll('[data-page-action="action-001"]').forEach(element => {
  element.addEventListener("click", function(event) {
    const result = (function(event) { toggleFaq(this) }).call(this, event);
    if (result === false) { event.preventDefault(); event.stopPropagation(); }
  });
});
