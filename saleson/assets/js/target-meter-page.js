/* Illustrative commercial targets and reward points. No live account data or payout action. */
(()=>{
  const root=document.getElementById('target-desk');if(!root)return;
  const records={
    east:{name:'East',target:1000000,achieved:680000,categories:[{target:500000,achieved:400000},{target:300000,achieved:180000},{target:200000,achieved:100000}]},
    north:{name:'North',target:800000,achieved:720000,categories:[{target:400000,achieved:360000},{target:300000,achieved:270000},{target:100000,achieved:90000}]},
    west:{name:'West',target:1200000,achieved:1260000,categories:[{target:600000,achieved:660000},{target:400000,achieved:420000},{target:200000,achieved:180000}]}
  };
  const byId=id=>document.getElementById(id);
  const text=(id,value)=>{byId(id).textContent=value;};
  const shortMoney=value=>value<100000?'₹'+value.toLocaleString('en-IN',{maximumFractionDigits:0}):'₹'+(value/100000).toLocaleString('en-IN',{maximumFractionDigits:2})+'L';
  const territoryButtons=Array.from(root.querySelectorAll('[data-tm-territory]'));
  function territory(key){
    const r=records[key];if(!r)return;
    const percentage=Math.round(r.achieved/r.target*100),gap=Math.max(0,r.target-r.achieved),excess=Math.max(0,r.achieved-r.target);
    territoryButtons.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.tmTerritory===key)));
    text('tm-territory-name',r.name+' territory');text('tm-achievement',percentage+'%');
    text('tm-gap-title',excess?shortMoney(excess)+' above target':gap?shortMoney(gap)+' to target':'Target reached');
    text('tm-target',shortMoney(r.target));text('tm-achieved',shortMoney(r.achieved));
    text('tm-gap-label',excess?'Above target':'Remaining gap');text('tm-gap',shortMoney(excess||gap));
    text('tm-review-status',excess?'The total is ahead. Check individual category performance before your review.':'Review the category gaps before the next team follow-up.');
    const gauge=byId('tm-gauge');gauge.style.setProperty('--tm-progress',Math.min(100,percentage)+'%');
    gauge.setAttribute('aria-label',r.name+' territory sales target achievement');gauge.setAttribute('aria-valuenow',String(Math.min(100,percentage)));gauge.setAttribute('aria-valuetext',percentage+'% of target');
    r.categories.forEach((c,i)=>{const pct=Math.round(c.achieved/c.target*100);text('tm-cat-'+i+'-value',pct+'%');byId('tm-cat-'+i+'-bar').style.width=Math.min(100,pct)+'%';});
  }
  territoryButtons.forEach(button=>button.addEventListener('click',()=>territory(button.dataset.tmTerritory)));
  const slider=byId('tm-incentive-slider');
  function reward(){
    const n=Number(slider.value),value=Number.isFinite(n)?Math.max(0,Math.min(130,n)):0;
    const points=value>=110?1500:value>=100?1000:value>=80?500:0;
    text('tm-slider-value',value+'%');text('tm-reward-points',points.toLocaleString('en-IN'));
    slider.setAttribute('aria-valuetext',value+'% achievement');
    const message=value<80?'Reach 80% achievement for the first reward level.':value<100?'80% level reached. The next example level is 100%.':value<110?'Target reached. The next example level is 110%.':'Highest reward level in this example reached.';
    text('tm-reward-message',message);
    root.querySelectorAll('[data-tm-slab]').forEach(row=>row.classList.toggle('tm-slab-reached',value>=Number(row.dataset.tmSlab)));
  }
  slider.addEventListener('input',reward);reward();
})();
