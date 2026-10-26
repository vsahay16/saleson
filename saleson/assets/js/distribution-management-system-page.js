/* distribution-management-system — page behaviour. */
function tFaq(btn) {
    const isOpen = btn.classList.contains('open');
    document.querySelectorAll('.faq-q').forEach(b => { b.classList.remove('open'); b.setAttribute('aria-expanded','false'); });
    document.querySelectorAll('.faq-a').forEach(a => a.classList.remove('open'));
    if (!isOpen) { btn.classList.add('open'); btn.setAttribute('aria-expanded','true'); btn.nextElementSibling.classList.add('open'); }
  }

  const ro = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) e.target.classList.add('vis'); }), { threshold: 0.07 });
  document.querySelectorAll('.reveal').forEach(el => ro.observe(el));

document.querySelectorAll('[data-page-action="action-001"]').forEach(element => {
  element.addEventListener("click", function(event) {
    const result = (function(event) { tFaq(this) }).call(this, event);
    if (result === false) { event.preventDefault(); event.stopPropagation(); }
  });
});
