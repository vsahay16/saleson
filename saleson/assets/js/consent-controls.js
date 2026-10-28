(function(w,d){
  'use strict';var api=w.SalesOnTracking;if(!api)return;
  var box=d.createElement('aside');box.className='saleson-consent';box.setAttribute('aria-label','Cookie preferences');
  box.innerHTML='<div class="consent-panel" hidden><h2>Cookie preferences</h2><p>Choose whether SalesOn can measure site use or advertising results. Essential features work without optional tracking. <a href="/privacy-policy">Privacy policy</a></p><label><input type="checkbox" name="analytics"> Analytics, including Clarity session insights</label><label><input type="checkbox" name="advertising"> Advertising, including Google Ads, Meta and LinkedIn</label><div class="consent-actions"><button type="button" data-choice="reject">Reject optional</button><button type="button" data-choice="save">Save choices</button><button type="button" data-choice="accept">Accept all</button></div><p role="status" class="consent-status"></p></div><button class="consent-open" type="button" aria-expanded="false">Cookie preferences</button>';
  d.body.appendChild(box);var panel=box.querySelector('.consent-panel'),open=box.querySelector('.consent-open');
  function show(){var c=api.getConsent();panel.querySelector('[name="analytics"]').checked=c.analytics;panel.querySelector('[name="advertising"]').checked=c.advertising;panel.hidden=false;open.setAttribute('aria-expanded','true');panel.querySelector('input').focus();}
  open.addEventListener('click',function(){if(panel.hidden)show();else{panel.hidden=true;open.setAttribute('aria-expanded','false');}});
  box.querySelectorAll('[data-choice]').forEach(function(b){b.addEventListener('click',function(){var choice=b.dataset.choice;api.setConsent(choice==='accept'||choice==='save'&&panel.querySelector('[name="analytics"]').checked,choice==='accept'||choice==='save'&&panel.querySelector('[name="advertising"]').checked);panel.hidden=true;open.setAttribute('aria-expanded','false');open.focus();});});
  var saved=false;try{var v=JSON.parse(localStorage.getItem('saleson-consent-v1'));saved=v&&v.version===1&&Date.now()-v.savedAt<180*86400000;}catch(e){}
  if(!saved)show();
})(window,document);
