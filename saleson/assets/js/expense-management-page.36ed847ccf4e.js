/* expense-management — page behaviour. */
function toggleFaq(btn){const isOpen=btn.classList.contains('open');document.querySelectorAll('.faq-q').forEach(b=>{b.classList.remove('open');b.setAttribute('aria-expanded','false');});document.querySelectorAll('.faq-a').forEach(a=>a.classList.remove('open'));if(!isOpen){btn.classList.add('open');btn.setAttribute('aria-expanded','true');btn.closest('.ex-faq-item').querySelector('.faq-a').classList.add('open');}}
document.querySelectorAll('[data-page-action="action-001"]').forEach(element => {
  element.addEventListener("click", function(event) {
    const result = (function(event) { toggleFaq(this) }).call(this, event);
    if (result === false) { event.preventDefault(); event.stopPropagation(); }
  });
});

// Sample UI only. Does not create claims or change approvals or payments.
(() => {
 const root=document.getElementById('expense-desk');if(!root)return;
 const claims={
 travel:['EX-1048 · Travel','Rahul Kumar','₹620','62 km × ₹10/km','Matches the travel rate','26 October · Local travel','Within policy limit','Check the journey details before recording your decision.','Supporting detail','Local travel record','62 km submitted for the day’s field travel.'],
 allowance:['EX-1049 · Daily allowance','Asha Mehta','₹350','₹350 claim / ₹300 daily cap','₹50 above the daily cap','26 October · Daily allowance','Needs manager review','The claim exceeds the sample daily cap by ₹50. Review the reason before deciding.','Claim explanation','Daily allowance note','₹350 submitted for the field day. Review against the applicable allowance policy.'],
 lodging:['EX-1050 · Lodging','Neha Singh','₹1,500','1 night × ₹1,500','Within the ₹2,000 lodging cap','25 October · Overnight stay','Within policy limit','Check the stay date and attached bill before recording your decision.','Receipt example','Lodging bill','One overnight stay, ₹1,500. Sample receipt information for the review.']
 };
 const fields=['ex-claim-id','ex-person','ex-amount','ex-calculation','ex-policy','ex-date','ex-status','ex-note','ex-doc-label','ex-doc-title','ex-doc-copy'];
 const buttons=root.querySelectorAll('[data-ex-claim]');
 buttons.forEach(button=>button.addEventListener('click',()=>{
  const key=button.dataset.exClaim;if(!claims[key])return;
  buttons.forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
  fields.forEach((id,i)=>{root.querySelector('#'+id).textContent=claims[key][i];});
  root.querySelector('#ex-status').classList.toggle('is-exception',key==='allowance');
 }));
})();
