/* attendance — page behaviour. */
function toggleFaq(btn){const isOpen=btn.classList.contains('open');document.querySelectorAll('.faq-q').forEach(b=>{b.classList.remove('open');b.setAttribute('aria-expanded','false');});document.querySelectorAll('.faq-a').forEach(a=>a.classList.remove('open'));if(!isOpen){btn.classList.add('open');btn.setAttribute('aria-expanded','true');btn.nextElementSibling.classList.add('open');}}
const ro=new IntersectionObserver(entries=>{entries.forEach(e=>{if(e.isIntersecting)e.target.classList.add('vis');});},{threshold:0.07});
document.querySelectorAll('.reveal').forEach(el=>ro.observe(el));
document.querySelectorAll('a[href^="#"]').forEach(a=>{a.addEventListener('click',e=>{const t=document.querySelector(a.getAttribute('href'));if(t){e.preventDefault();window.scrollTo({top:t.getBoundingClientRect().top+window.pageYOffset-140,behavior:'smooth'});}});});
const barObs=new IntersectionObserver(entries=>{entries.forEach(e=>{if(e.isIntersecting){e.target.querySelectorAll('.sr-fill').forEach(bar=>{const w=bar.style.width;bar.style.width='0%';setTimeout(()=>{bar.style.width=w;},120);});}});},{threshold:0.3});
document.querySelectorAll('.hub-grid').forEach(el=>barObs.observe(el));

document.querySelectorAll('[data-page-action="action-001"]').forEach(element => {
  element.addEventListener("click", function(event) {
    const result = (function(event) { toggleFaq(this) }).call(this, event);
    if (result === false) { event.preventDefault(); event.stopPropagation(); }
  });
});
