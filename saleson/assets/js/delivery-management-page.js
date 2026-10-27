/* FAQ decisions are local presentation; no shipment or trip mutations occur. */
function tFaq(btn){const open=btn.classList.contains('open');document.querySelectorAll('.fqb').forEach(b=>{b.classList.remove('open');b.setAttribute('aria-expanded','false');});document.querySelectorAll('.fa').forEach(a=>a.classList.remove('open'));if(!open){btn.classList.add('open');btn.setAttribute('aria-expanded','true');btn.nextElementSibling.classList.add('open');}}
document.querySelectorAll('[data-page-action="action-001"]').forEach(element=>element.addEventListener('click',function(){tFaq(this);}));
(()=>{
 const root=document.getElementById('delivery-desk');if(!root)return;
 const views=root.querySelectorAll('[data-dl-view]'),panels=root.querySelectorAll('[data-dl-panel]');
 views.forEach(button=>button.addEventListener('click',()=>{views.forEach(b=>b.setAttribute('aria-pressed',String(b===button)));panels.forEach(p=>{p.hidden=p.dataset.dlPanel!==button.dataset.dlView;});}));
 const examples={
 delivered:{label:'Delivered',title:'Review the completed handover.',description:'The shipment is recorded as delivered. Check its delivery proof when a customer or the office needs confirmation.',next:'Check the handover record if confirmation is needed.'},
 reattempt:{label:'Reattempt',title:'Give the shipment a next action.',description:'The delivery needs another attempt. Review the reason, customer availability and responsible user before arranging the follow-up.',next:'Agree the next attempt with the delivery supervisor.'},
 cancelled:{label:'Cancelled',title:'Keep cancellation separate from delivery.',description:'This shipment is recorded as cancelled. Review the reason and any related order or invoice action with the responsible team.',next:'Confirm the cancellation and any connected document action.'}
 };
 const buttons=root.querySelectorAll('[data-dl-outcome]');buttons.forEach(button=>button.addEventListener('click',()=>{const record=examples[button.dataset.dlOutcome];if(!record)return;buttons.forEach(b=>b.setAttribute('aria-pressed',String(b===button)));[['dl-status-label','label'],['dl-outcome-title','title'],['dl-outcome-description','description'],['dl-next-action','next']].forEach(([id,key])=>{root.querySelector('#'+id).textContent=record[key];});}));
})();
