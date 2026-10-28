/* Single GTM loader. Consent defaults precede the standard GTM bootstrap.
 * The release gate remains closed until account-side tags are verified. */
(function(w,d){
  'use strict';
  if(w.SalesOnTracking)return;
  var cfg=w.SalesOnTrackingConfig, key='saleson-consent-v1', internal=false;
  try { internal=localStorage.getItem('saleson-internal')==='1'; } catch(e){}
  var production=cfg.productionHosts.indexOf(w.location.hostname)!==-1 && w.location.protocol==='https:';
  var route=(d.querySelector('script[data-saleson-page]')||{}).dataset;
  route=route ? route.salesonPage : '/';
  if(!/^\/[a-zA-Z0-9_\/.-]*$/.test(route))route='/';
  // Only repository-owned canonical paths; query strings, hash and referrer never enter the layer.
  var pageLocation='https://saleson.co.in'+route;
  var consent={analytics:false,advertising:false}, loaded=false, pageSent=false;
  w.dataLayer=w.dataLayer||[];
  function command(){w.dataLayer.push(arguments);}
  command('consent','default',{analytics_storage:'denied',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',functionality_storage:'granted',security_storage:'granted'});
  command('set','ads_data_redaction',true);
  command('set','url_passthrough',false);
  try {
    var saved=JSON.parse(localStorage.getItem(key));
    if(saved && saved.version===cfg.consentVersion && Date.now()-saved.savedAt<180*86400000){consent.analytics=saved.analytics===true;consent.advertising=saved.advertising===true;}
  }catch(e){}
  function eligible(){return production && !internal && cfg.releaseApproved===true;}
  function update(){
    command('consent','update',{analytics_storage:consent.analytics?'granted':'denied',ad_storage:consent.advertising?'granted':'denied',ad_user_data:consent.advertising?'granted':'denied',ad_personalization:consent.advertising?'granted':'denied'});
  }
  function stateEvent(){
    if(!eligible() || !loaded)return;
    w.dataLayer.push({event:'saleson_consent_update',saleson_analytics:consent.analytics,saleson_advertising:consent.advertising,saleson_production:true,page_location:pageLocation,page_path:route,page_referrer:''});
  }
  function bootstrap(){
    if(loaded || !eligible() || !(consent.analytics||consent.advertising))return;
    loaded=true;
    // Standard Google Tag Manager head script, exactly once per document.
    (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(w,d,'script','dataLayer',cfg.containerId);
  }
  var allowed=['pricing_view','demo_click','trial_click','whatsapp_click','phone_click','email_click','video_start','video_progress','video_complete','tool_download'];
  function emit(name,detail){
    if(!eligible() || !consent.analytics || allowed.indexOf(name)===-1)return false;
    var payload={event:'saleson_'+name,page_location:pageLocation,page_path:route,page_referrer:'',saleson_production:true,saleson_analytics:true,saleson_advertising:consent.advertising};
    detail=detail||{};
    // Values are enum-only; never copy URL, link text, inputs or generated documents.
    if(['product','customer','other'].indexOf(detail.video_kind)!==-1)payload.video_kind=detail.video_kind;
    if([25,50,75].indexOf(detail.video_percent)!==-1)payload.video_percent=detail.video_percent;
    if(['pdf','csv','json','xlsx','docx','download','print'].indexOf(detail.file_type)!==-1)payload.file_type=detail.file_type;
    w.dataLayer.push(payload);return true;
  }
  function page(){
    if(!eligible() || !consent.analytics || pageSent)return;
    pageSent=true;
    w.dataLayer.push({event:'saleson_page_view',page_location:pageLocation,page_path:route,page_referrer:'',saleson_production:true,saleson_analytics:true,saleson_advertising:consent.advertising});
    if(route==='/pricing')emit('pricing_view');
  }
  function setConsent(analytics,advertising){
    var revoke=(consent.analytics&&!analytics)||(consent.advertising&&!advertising);
    consent={analytics:analytics===true,advertising:advertising===true};
    try{localStorage.setItem(key,JSON.stringify({version:cfg.consentVersion,savedAt:Date.now(),analytics:consent.analytics,advertising:consent.advertising}));}catch(e){}
    update();bootstrap();stateEvent();page();
    // A full reload unloads third-party scripts following withdrawal. GTM templates must
    // also revoke SDK consent and cookies (see runbook); no post-withdrawal events are queued.
    if(revoke && loaded)w.location.reload();
  }
  w.SalesOnTracking={emit:emit,setConsent:setConsent,getConsent:function(){return {analytics:consent.analytics,advertising:consent.advertising};},status:function(){return {production:production,internal:internal,releaseApproved:cfg.releaseApproved,loaded:loaded};}};
  update();bootstrap();stateEvent();page();
})(window,document);
