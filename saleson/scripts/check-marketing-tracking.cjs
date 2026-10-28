/* Tests run in a VM with stubbed networks; never send production traffic. */
const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert/strict');
const root=path.resolve(__dirname,'..');const src=fs.readFileSync(path.join(root,'assets/js/site-tag-manager.js'),'utf8');
function setup({host='saleson.co.in',release=true,stored=null,internal=false,blocked=false,route='/pricing'}={}){
 const network=[],state=new Map(),storage={getItem(k){if(blocked)throw Error('blocked');return state.get(k)||null;},setItem(k,v){if(blocked)throw Error('blocked');state.set(k,v);}};
 if(stored)state.set('saleson-consent-v1',JSON.stringify(stored));if(internal)state.set('saleson-internal','1');
 let reloads=0;
 const window={location:{hostname:host,protocol:'https:',reload(){reloads++;}},SalesOnTrackingConfig:{productionHosts:['saleson.co.in','www.saleson.co.in'],containerId:'GTM-WQNBHFQS',releaseApproved:release,consentVersion:1}};
 const document={querySelector(){return {dataset:{salesonPage:route}};},createElement(){return {};},getElementsByTagName(){return [{parentNode:{insertBefore(node){network.push(node.src);}}}];}};
 const c=vm.createContext({window,document,localStorage:storage,URL,Date});vm.runInContext(src,c);
 return {w:window,c,network,state,events:()=>window.dataLayer.filter(x=>x.event),reloads:()=>reloads};
}
let tests=0;
for(const host of ['saleson.co.in','www.saleson.co.in','preview.vercel.app','app.saleson.co.in','localhost','saleson.co.in.attacker.test']){
 const s=setup({host});assert.equal(s.network.length,0);s.w.SalesOnTracking.setConsent(true,true);assert.equal(s.network.length,['saleson.co.in','www.saleson.co.in'].includes(host)?1:0);tests++;
}
for(const options of [{release:false},{internal:true}]){const s=setup(options);s.w.SalesOnTracking.setConsent(true,true);assert.equal(s.network.length,0);assert.equal(s.events().length,0);tests++;}
const s=setup();let api=s.w.SalesOnTracking;
assert.equal(s.w.dataLayer[0][0],'consent');assert.equal(s.w.dataLayer[0][2].analytics_storage,'denied');
api.emit('demo_click');assert.equal(s.events().length,0);api.setConsent(false,false);assert.equal(s.network.length,0);tests++;
api.setConsent(true,false);assert.equal(s.network.length,1);assert.equal(s.events().filter(x=>x.event==='saleson_page_view').length,1);assert.equal(s.events().filter(x=>x.event==='saleson_pricing_view').length,1);
api.setConsent(true,true);api.setConsent(true,true);vm.runInContext(src,s.c);assert.equal(s.network.length,1);assert.equal(s.events().filter(x=>x.event==='saleson_page_view').length,1);tests++;
for(const event of ['demo_click','trial_click','whatsapp_click','phone_click','email_click','tool_download','video_start','video_progress','video_complete'])assert.equal(api.emit(event,{email:'private@example.test',document:'private invoice',page_location:'https://example.test/?email=private',video_kind:'customer',video_percent:50,file_type:'pdf'}),true);
for(const event of ['generate_lead','sign_up','demo_booked','signup_completed','purchase','random'])assert.equal(api.emit(event,{email:'private@example.test'}),false);
assert.ok(!JSON.stringify(s.events()).includes('private'));assert.ok(s.events().filter(x=>x.event.startsWith('saleson_')).every(x=>x.page_location==='https://saleson.co.in/pricing'&&x.page_referrer===''));tests++;
api.setConsent(false,false);assert.equal(s.reloads(),1);const count=s.events().length;api.emit('demo_click');assert.equal(s.events().length,count);tests++;
const ad=setup();ad.w.SalesOnTracking.setConsent(false,true);assert.equal(ad.network.length,1);assert.ok(!ad.events().some(x=>x.event==='saleson_page_view'));assert.equal(ad.w.SalesOnTracking.emit('demo_click'),false);tests++;
for(const stored of [{version:1,savedAt:Date.now(),analytics:true,advertising:false},{version:0,savedAt:Date.now(),analytics:true,advertising:true},{version:1,savedAt:0,analytics:true,advertising:true}]){const t=setup({stored});assert.equal(t.network.length,stored.version===1&&stored.savedAt>0?1:0);tests++;}
const blocked=setup({blocked:true});blocked.w.SalesOnTracking.setConsent(true,false);assert.equal(blocked.network.length,1);tests++;
console.log(`PASS: ${tests} tracking scenarios: consent, one bootstrap/page view, preview/internal/release exclusions, revocation, blocked storage, enum-only payloads and no fabricated conversions. Network stubbed; remote tags NOT certified.`);
// Handler-level tests: real gestures classify to intent without copying targets.
{
 const emitted=[],listeners={},wl={},vl={},video={id:'home-product-video',duration:100,currentTime:0,addEventListener(k,f){vl[k]=f;}};
 const window={location:{href:'https://saleson.co.in/tools/example',hostname:'saleson.co.in',pathname:'/tools/example'},SalesOnTracking:{emit(n,p){emitted.push({name:n,...p});return true;}},addEventListener(k,f){wl[k]=f;}};
 const document={body:{},addEventListener(k,f){listeners[k]=f;},querySelectorAll(){return [video];}};
 vm.runInNewContext(fs.readFileSync(path.join(root,'assets/js/marketing-events.js'),'utf8'),{window,document,URL,Date,WeakSet,MutationObserver:class{observe(){}}});
 const click=href=>listeners.click({composedPath:()=>[{tagName:'A',href,hasAttribute:()=>false}]});
 click('https://saleson.co.in/request-demo');click('https://saleson.co.in/request-demo');
 click('https://app.saleson.co.in/');click('https://app.saleson.co.in/login');
 click('https://wa.me/919999999999?text=PRIVATE');click('tel:+919999999999');click('mailto:PRIVATE@example.test');
 assert.deepEqual(emitted.map(e=>e.name),['demo_click','trial_click','whatsapp_click','phone_click','email_click']);
 assert.ok(!JSON.stringify(emitted).includes('PRIVATE'));
 vl.play();vl.play();for(const t of [30,60,90,95]){video.currentTime=t;vl.timeupdate();}vl.ended();vl.ended();
 assert.equal(emitted.filter(e=>e.name==='video_start').length,1);assert.deepEqual(emitted.filter(e=>e.name==='video_progress').map(e=>e.video_percent),[25,50,75]);assert.equal(emitted.filter(e=>e.name==='video_complete').length,1);
 wl.beforeprint();assert.equal(emitted.at(-1).name,'tool_download');assert.equal(emitted.at(-1).file_type,'print');
 console.log('PASS: delegated/shadow-compatible contact/demo/trial click classification and double-click dedup; no login-as-signup, no contact values; native video milestones/end dedup and print intent.');
}
