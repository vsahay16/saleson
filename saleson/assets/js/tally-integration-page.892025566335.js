/* Presentation only: no accounting records are posted or modified. */
function toggleFaq(btn){const wasOpen=btn.classList.contains('open');document.querySelectorAll('.faq-q').forEach(q=>{q.classList.remove('open');q.setAttribute('aria-expanded','false');q.closest('.faq-item').querySelector('.faq-a').classList.remove('open');});if(!wasOpen){btn.classList.add('open');btn.setAttribute('aria-expanded','true');btn.closest('.faq-item').querySelector('.faq-a').classList.add('open');}}
function toggleTech(btn){const open=btn.classList.toggle('open');const details=document.getElementById('techDetails');details.classList.toggle('open',open);btn.setAttribute('aria-expanded',open?'true':'false');details.setAttribute('aria-hidden',open?'false':'true');}
document.querySelectorAll('[data-page-action="action-001"]').forEach(b=>b.addEventListener('click',function(){toggleTech(this);}));
document.querySelectorAll('[data-page-action="action-002"]').forEach(b=>b.addEventListener('click',function(){toggleFaq(this);}));
(()=>{
 const root=document.getElementById('tally-workspace');if(!root)return;
 const records={
 sale:['SalesOn → Tally','SalesOn record','Sales invoice INV-1048','Customer','Sample Retailer','Invoice total','₹5,900','Match the customer, item and tax ledgers before posting the sales voucher.','Expected Tally entry','Sales voucher','Compare the source invoice reference and amount with the resulting accounting entry.'],
 receipt:['SalesOn → Tally','SalesOn record','Receipt RCPT-021','Customer','Sample Retailer','Receipt amount','₹2,000','Review the customer and the cash or bank ledger used for the receipt.','Expected Tally entry','Receipt voucher','Compare the source receipt and ledger with the corresponding accounting entry.'],
 item:['Tally → SalesOn','Tally master','Product A','Item reference','ITEM-001','Unit','pcs','Match the item reference and unit with the SalesOn product master.','Expected SalesOn record','Mapped item master','Review the product identity and unit before the field team uses the master.']
 };
 const fields=['ti-direction','ti-source-label','ti-record-title','ti-record-key','ti-record-value','ti-amount-label','ti-amount','ti-map-description','ti-destination-label','ti-destination-title','ti-destination-description'];
 const buttons=root.querySelectorAll('[data-ti-example]');buttons.forEach(button=>button.addEventListener('click',()=>{const record=records[button.dataset.tiExample];if(!record)return;buttons.forEach(b=>b.setAttribute('aria-pressed',String(b===button)));fields.forEach((id,i)=>{root.querySelector('#'+id).textContent=record[i];});}));
})();