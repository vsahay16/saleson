/* One published INR price list. No quote, lead or purchase is submitted here. */
(() => {
 const cfg=window.SalesOnPricing.IN;
 const $=id=>document.getElementById(id);
 const money=n=>cfg.symbol+Number(n).toLocaleString(cfg.locale,{maximumFractionDigits:2,minimumFractionDigits:0});
 function calculate(users,planKey,cycle){
  const seats=Math.min(10000,Math.max(cfg.minimumUsers,Math.ceil(Number(users)||cfg.minimumUsers)));
  const plan=cfg.plans[planKey]||cfg.plans['250'];
  const annual=cycle==='annual';
  const yearly=seats*(annual?plan.annual:plan.monthly*12);
  return {seats,plan,yearly,monthly:yearly/12,payment:annual?yearly:seats*plan.monthly,saving:annual?seats*(plan.monthly*12-plan.annual):0,annual};
 }
 function calcUpdate(){
  const r=calculate($('calc-users').value,$('calc-plan').value,$('calc-cycle').value);
  $('res-monthly').textContent=money(r.monthly);$('res-annual').textContent=money(r.yearly);$('res-save').textContent=money(r.saving);$('res-payment').textContent=money(r.payment);
  $('res-payment-label').textContent=r.annual?'Pay yearly':'Pay monthly';
  $('res-annual-label').textContent=r.annual?'Annual payment':'12-month projected spend';
  $('res-payment-note').textContent=`For ${r.seats} ${r.plan.name} users, before GST`;
  $('calc-note').textContent=r.annual?'Annual billing is paid upfront for 12 months. The monthly equivalent is shown for comparison.':'Monthly billing is charged monthly. The 12-month figure is a projection at this team size and rate, not an annual upfront charge.';
  $('seat-note').textContent=Number($('calc-users').value)<cfg.minimumUsers?`Cost shown for the minimum ${cfg.minimumUsers} users.`:`Minimum ${cfg.minimumUsers} users.`;
  return r;
 }
 function setBilling(cycle){
  const annual=cycle==='annual';
  document.querySelectorAll('[data-billing]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.billing===cycle)));
  Object.entries(cfg.plans).forEach(([key,plan])=>{
   document.querySelector(`[data-plan-price="${key}"]`).textContent=money(annual?plan.annual:plan.monthly);
   document.querySelector(`[data-plan-price="${key}"]`).nextElementSibling.textContent=annual?'/user/year':'/user/month';
   document.querySelector(`[data-plan-equivalent="${key}"]`).textContent=annual?`Equivalent to ${money(plan.annual/12)}/user/month, billed annually.`:'Billed monthly for your subscribed users.';
  });
  $('calc-cycle').value=cycle;calcUpdate();
 }
 window.SalesOnPricingCalculator={calculate};
 window.calcUpdate=calcUpdate;
 if(!$('calc-users'))return;
 document.querySelectorAll('[data-billing]').forEach(b=>b.addEventListener('click',()=>setBilling(b.dataset.billing)));
 $('calc-users').addEventListener('input',calcUpdate);
 $('calc-users').addEventListener('change',()=>{const r=calcUpdate();$('calc-users').value=String(r.seats);});
 $('calc-plan').addEventListener('change',calcUpdate);
 $('calc-cycle').addEventListener('change',()=>setBilling($('calc-cycle').value));
 setBilling($('calc-cycle').value);
})();
