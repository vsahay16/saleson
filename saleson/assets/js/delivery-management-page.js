/* delivery-management — page behaviour. */
function tFaq(btn){const o=btn.classList.contains('open');document.querySelectorAll('.fqb').forEach(b=>{b.classList.remove('open');b.setAttribute('aria-expanded','false');});document.querySelectorAll('.fa').forEach(a=>a.classList.remove('open'));if(!o){btn.classList.add('open');btn.setAttribute('aria-expanded','true');btn.nextElementSibling.classList.add('open');}}
document.querySelectorAll('a[href^="#"]').forEach(a=>{a.addEventListener('click',e=>{const t=document.querySelector(a.getAttribute('href'));if(t){e.preventDefault();window.scrollTo({top:t.getBoundingClientRect().top+window.pageYOffset-140,behavior:'smooth'});}});});
const ro=new IntersectionObserver(entries=>{entries.forEach(e=>{if(e.isIntersecting)e.target.classList.add('vis');});},{threshold:0.06});
document.querySelectorAll('.rev').forEach(el=>ro.observe(el));

document.querySelectorAll('[data-page-action="action-001"]').forEach(element => {
  element.addEventListener("click", function(event) {
    const result = (function(event) { tFaq(this) }).call(this, event);
    if (result === false) { event.preventDefault(); event.stopPropagation(); }
  });
});
