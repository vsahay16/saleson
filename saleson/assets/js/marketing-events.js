/* Intent only. This marketing repository has no trusted booking/signup success signal. */
(function(w,d){
  'use strict';if(w.__salesonMarketingEvents)return;w.__salesonMarketingEvents=true;
  var api=w.SalesOnTracking;if(!api)return;
  var lastClick={};
  d.addEventListener('click',function(e){
    var a=e.composedPath().find(function(n){return n.tagName==='A';});if(!a)return;
    var u;try{u=new URL(a.href,w.location.href);}catch(err){return;}
    var name;
    if(u.hostname==='wa.me'||u.hostname==='api.whatsapp.com')name='whatsapp_click';
    else if(u.protocol==='tel:')name='phone_click';
    else if(u.protocol==='mailto:')name='email_click';
    else if((u.hostname==='saleson.co.in'||u.hostname===w.location.hostname)&&/^\/request-demo(?:\.html)?\/?$/.test(u.pathname)||u.hostname==='zcal.co')name='demo_click';
    else if(u.hostname==='app.saleson.co.in'&&!/\/(?:login|signin)(?:\/|$)/i.test(u.pathname))name='trial_click';
    if(name){var now=Date.now();if(now-(lastClick[name]||0)>750){api.emit(name);lastClick[name]=now;}}
    // An actual download link is intent, never a lead. Do not inspect document content.
    if(a.hasAttribute('download') && w.location.pathname.indexOf('/tools/')!==0){
      var ext=(a.download.match(/\.([a-z0-9]+)$/i)||[])[1];
      api.emit('tool_download',{file_type:['pdf','csv','json','xlsx','docx'].indexOf(ext)!==-1?ext:'download'});
    }
  },true);
  var bound=new WeakSet();
  function videos(){d.querySelectorAll('video').forEach(function(v){
    if(bound.has(v))return;bound.add(v);var seen={};
    var kind=v.id==='home-product-video'?'product':v.id==='home-customer-video'?'customer':'other';
    v.addEventListener('play',function(){if(!seen.start && api.emit('video_start',{video_kind:kind}))seen.start=true;});
    v.addEventListener('timeupdate',function(){if(!Number.isFinite(v.duration)||!v.duration)return;[25,50,75].forEach(function(p){if(v.currentTime/v.duration*100>=p&&!seen[p]&&api.emit('video_progress',{video_kind:kind,video_percent:p}))seen[p]=true;});});
    v.addEventListener('ended',function(){if(!seen.complete&&api.emit('video_complete',{video_kind:kind}))seen.complete=true;});
  });}
  videos();new MutationObserver(videos).observe(d.body,{childList:true,subtree:true});
  // Printing is a tool-document action, not a successful booking or signup.
  w.addEventListener('beforeprint',function(){if(w.location.pathname.indexOf('/tools/')===0)api.emit('tool_download',{file_type:'print'});});
})(window,document);
