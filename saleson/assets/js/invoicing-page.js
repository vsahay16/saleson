/* Illustrative format switch only. No invoice creation, tax filing or payment action. */
(()=>{
 const root=document.getElementById('invoice-studio');if(!root)return;
 const paper=root.querySelector('#iv-invoice'),status=root.querySelector('#iv-format-status');
 const controls=root.querySelectorAll('[data-iv-format]');
 controls.forEach(button=>button.addEventListener('click',()=>{
  const thermal=button.dataset.ivFormat==='thermal';
  paper.classList.toggle('is-thermal',thermal);
  controls.forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
  status.textContent=thermal?'Illustrative thermal-style layout. Example data, not a live product screen.':'Illustrative A4-style layout. Example data, not a live product screen.';
 }));
})();
