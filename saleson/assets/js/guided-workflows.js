/* Public guidance only. No account records, conversion events or customer data. */
(() => {
 'use strict';
 const cases={
  orders:{tab:'orders',title:'Orders from the field to the office',agenda:'Review the catalogue, record a customer order and discuss invoicing and collections.',url:'/order-taking-app',plan:'Discuss Pro for core order workflows.'},
  stock:{tab:'dms',title:'Stock and distribution',agenda:'Review stock visibility, godown movements and the records your office needs.',url:'/distribution-management-system',plan:'Discuss Enterprise for DMS and stock workflows.'},
  field:{tab:'field',title:'Field activity and customer visits',agenda:'Review customer visits, attendance, tracking and the office view of recorded activity.',url:'/field-sales',plan:'Discuss Pro for core field sales workflows.'},
  van:{tab:'van',title:'Van sales and settlement',agenda:'Review van loading, sales, returns and end-of-day settlement.',url:'/van-sales',plan:'Discuss Enterprise for van sales workflows.'}
 };
 const businesses={distributor:'distributor',manufacturer:'manufacturer'};
 const teams={small:'2–10 users',medium:'11–25 users',large:'26 or more users'};
 const valid=s=>!!(s&&Object.hasOwn(businesses,s.business)&&Object.hasOwn(teams,s.team)&&Object.hasOwn(cases,s.workflow));
 const context=s=>`For a ${businesses[s.business]} team with ${teams[s.team]}. ${cases[s.workflow].agenda}`;
 const planner=document.getElementById('workflow-planner');
 if(planner) planner.addEventListener('submit',event=>{
  event.preventDefault();if(!planner.reportValidity())return;
  const s=Object.fromEntries(new FormData(planner));if(!valid(s))return;
  const c=cases[s.workflow],result=document.getElementById('workflow-result');
  result.querySelector('h3').textContent=c.title;
  result.querySelector('[data-workflow-summary]').textContent=context(s)+' '+c.plan;
  result.querySelector('[data-workflow-feature]').href=c.url;
  const query=new URLSearchParams(s).toString();
  result.querySelector('[data-workflow-demo]').href='/request-demo?'+query;
  result.querySelector('[data-workflow-sample]').href='/request-demo?'+query+'#sample-workflow';
  result.hidden=false;document.querySelector(`[data-explore-tab="${c.tab}"]`)?.click();result.focus();
 });
 const agenda=document.getElementById('workflow-demo-agenda');
 if(agenda){const query=new URLSearchParams(location.search),s={business:query.get('business'),team:query.get('team'),workflow:query.get('workflow')};if(valid(s)){agenda.textContent='Suggested demo: '+context(s)+' Mention this workflow when you meet the team.';agenda.hidden=false;}}
 const checklist=document.getElementById('onboarding-checklist');
 if(checklist){
  const boxes=[...checklist.querySelectorAll('[data-onboarding-step]')],status=checklist.querySelector('[data-checklist-status]'),storage=checklist.querySelector('[data-checklist-storage]'),key='saleson-onboarding-checklist-v1';
  let available=true;
  try{localStorage.setItem(key+'-probe','1');localStorage.removeItem(key+'-probe');const saved=JSON.parse(localStorage.getItem(key)||'null');if(saved&&saved.version===1&&Array.isArray(saved.done))boxes.forEach(b=>b.checked=saved.done.includes(b.dataset.onboardingStep));}catch(_){available=false;}
  function render(save=false){
   const done=boxes.filter(b=>b.checked).map(b=>b.dataset.onboardingStep);checklist.querySelector('progress').value=done.length;
   status.textContent=`${done.length} of ${boxes.length} marked by you.`+(done.length===boxes.length?' Review the first order with your administrator.':'');
   if(save&&available)try{localStorage.setItem(key,JSON.stringify({version:1,done}));}catch(_){available=false;}
   storage.textContent=available?'Saved only in this browser. This checklist does not verify activity in your SalesOn account.':'Browser storage is unavailable. Changes stay on this page and do not verify account activity.';
  }
  boxes.forEach(b=>b.addEventListener('change',()=>render(true)));
  checklist.querySelector('[data-clear-checklist]').addEventListener('click',()=>{if(boxes.some(b=>b.checked)&&!window.confirm('Clear the checkmarks saved in this browser? Your SalesOn records will not change.'))return;boxes.forEach(b=>b.checked=false);render(true);});render();
 }
 const sample=document.getElementById('sample-workflow');
 if(!sample)return;
 if(location.hash==='#sample-workflow')sample.open=true;
 const form=sample.querySelector('form'),quantity=form.elements.quantity,price=form.elements.price,payment=form.elements.payment;
 const error=sample.querySelector('[data-sample-error]'),status=sample.querySelector('[data-sample-status]');
 const buttons=[...sample.querySelectorAll('[data-sample-action]')];
 let stage=0,order=null,received=0;
 const currency=n=>new Intl.NumberFormat('en-IN',{style:'currency',currency:'INR',maximumFractionDigits:2}).format(n/100);
 const money=s=>/^\d{1,7}(?:\.\d{1,2})?$/.test(s)?Math.round(Number(s)*100):null;
 const show=(name,value)=>{sample.querySelector(`[data-sample-value="${name}"]`).textContent=value;};
 function render(){
  quantity.disabled=price.disabled=stage>0;payment.disabled=stage!==2;
  buttons.forEach(b=>{const n=Number(b.dataset.sampleAction);b.disabled=n!==stage;});
  show('order',stage>=1?`${order.quantity} × Example product at ${currency(order.price)}`:'No sample order yet');
  show('invoice',stage>=2?`${currency(order.subtotal)} + ${currency(order.tax)} example GST = ${currency(order.total)}`:'No sample invoice yet');
  show('payment',stage>=3?`${currency(received)} received; ${currency(order.total-received)} outstanding`:'No sample payment yet');
  show('stock',stage===4?`20 − ${order.quantity} = ${20-order.quantity} units`:'20 example units before the sample movement');
  sample.querySelector('progress').value=stage;
 }
 form.addEventListener('submit',e=>e.preventDefault());
 buttons.forEach(button=>button.addEventListener('click',()=>{
  error.textContent='';const n=Number(button.dataset.sampleAction);if(n!==stage)return;
  if(n===0){
   const q=Number(quantity.value),p=money(price.value.trim());
   if(!/^\d+$/.test(quantity.value)||!Number.isSafeInteger(q)||q<1||q>20||p===null||p<1){error.textContent='Enter a whole quantity from 1 to 20 and a positive unit price with at most two decimal places.';return;}
   const subtotal=q*p,tax=Math.round(subtotal*18/100);order={quantity:q,price:p,subtotal,tax,total:subtotal+tax};
  }
  if(n===2){received=money(payment.value.trim());if(received===null||received<1||received>order.total){error.textContent='Enter a payment greater than zero and no greater than the sample invoice total.';return;}}
  stage++;render();status.textContent=['','Sample order created on this page.','Sample invoice generated on this page.','Sample payment recorded on this page.','Sample stock calculation applied on this page.'][stage];
 }));
 sample.querySelector('[data-sample-reset]').addEventListener('click',()=>{
  if(stage>0&&!window.confirm('Replace this sample workflow and start again?'))return;
  stage=0;order=null;received=0;form.reset();error.textContent='';status.textContent='Sample reset. No SalesOn records were changed.';render();
 });render();
})();
