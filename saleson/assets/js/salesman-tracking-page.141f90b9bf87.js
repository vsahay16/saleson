/* salesman-tracking — page behaviour. */
function toggleFaq(btn){
      const isOpen=btn.classList.contains('open');
      document.querySelectorAll('.faq-q').forEach(b=>{b.classList.remove('open');b.setAttribute('aria-expanded','false');});
      document.querySelectorAll('.faq-a').forEach(a=>a.classList.remove('open'));
      if(!isOpen){btn.classList.add('open');btn.setAttribute('aria-expanded','true');btn.nextElementSibling.classList.add('open');}
    }
    const subNav=document.getElementById('sub-nav');
    const hero=document.querySelector('.hero');
    if(subNav&&hero){const obs=new IntersectionObserver(entries=>{entries.forEach(e=>subNav.classList.toggle('visible',!e.isIntersecting));},{threshold:0});obs.observe(hero);}
    const links=[...document.querySelectorAll('.sub-nav-link')];
    const sections=links.map(a=>document.querySelector(a.getAttribute('href'))).filter(Boolean);
    if(sections.length){const spy=new IntersectionObserver(entries=>{entries.forEach(e=>{if(e.isIntersecting){links.forEach(a=>a.classList.toggle('active',a.getAttribute('href')==='#'+e.target.id));}});},{rootMargin:'-25% 0px -65% 0px'});sections.forEach(s=>spy.observe(s));}

document.querySelectorAll('[data-page-action="action-001"]').forEach(element => {
  element.addEventListener("click", function(event) {
    const result = (function(event) { toggleFaq(this) }).call(this, event);
    if (result === false) { event.preventDefault(); event.stopPropagation(); }
  });
});
