/* tally-integration — page behaviour. */
function toggleFaq(btn){const item=btn.closest('.faq-item');const ans=item.querySelector('.faq-a');const open=btn.classList.contains('open');document.querySelectorAll('.faq-q.open').forEach(q=>{q.classList.remove('open');q.nextElementSibling.classList.remove('open');q.setAttribute('aria-expanded','false');});if(!open){btn.classList.add('open');ans.classList.add('open');btn.setAttribute('aria-expanded','true');}}
function toggleTech(btn){const open=btn.classList.toggle('open');const details=document.getElementById('techDetails');details.classList.toggle('open',open);btn.setAttribute('aria-expanded',open?'true':'false');details.setAttribute('aria-hidden',open?'false':'true');}
const obs=new IntersectionObserver(entries=>{entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');obs.unobserve(e.target);}});},{threshold:0.06});
document.querySelectorAll('.reveal').forEach(el=>obs.observe(el));
document.querySelectorAll('a[href^="#"]').forEach(a=>{a.addEventListener('click',function(e){const t=document.querySelector(this.getAttribute('href'));if(t){e.preventDefault();window.scrollTo({top:t.getBoundingClientRect().top+window.pageYOffset-140,behavior:'smooth'});}});});

document.querySelectorAll('[data-page-action="action-001"]').forEach(element => {
  element.addEventListener("click", function(event) {
    const result = (function(event) { toggleTech(this) }).call(this, event);
    if (result === false) { event.preventDefault(); event.stopPropagation(); }
  });
});

document.querySelectorAll('[data-page-action="action-002"]').forEach(element => {
  element.addEventListener("click", function(event) {
    const result = (function(event) { toggleFaq(this) }).call(this, event);
    if (result === false) { event.preventDefault(); event.stopPropagation(); }
  });
});
