/* Mobile App: accessible FAQ only. No device permission or sign-in is requested. */
(() => {
 const root=document.querySelector('.mobile-app-review');
 if(!root)return;
 const buttons=[...root.querySelectorAll('.faq-q')];
 buttons.forEach(button=>button.addEventListener('click',()=>{
  const wasOpen=button.getAttribute('aria-expanded')==='true';
  buttons.forEach(b=>{b.setAttribute('aria-expanded','false');b.classList.remove('open');const a=b.closest('.faq-item').querySelector('.faq-a');a.hidden=true;a.classList.remove('open');});
  if(!wasOpen){button.setAttribute('aria-expanded','true');button.classList.add('open');const a=button.closest('.faq-item').querySelector('.faq-a');a.hidden=false;a.classList.add('open');}
 }));
})();
