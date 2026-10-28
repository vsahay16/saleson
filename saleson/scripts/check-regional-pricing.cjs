const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const source=fs.readFileSync(path.join(root,'assets/js/pricing-config.js'),'utf8');
const c=vm.createContext({window:{}});vm.runInContext(source,c);const prices=c.window.SalesOnPricing;
assert.deepEqual(Object.keys(prices),['IN','USD','EN']);
for(const [tier,rates] of [['IN',[250,400]],['USD',[3,5]],['EN',[6,10]]]){
 assert.equal(prices[tier].minimumUsers,2);
 for(const [index,key] of ['250','400'].entries()){
  const p=prices[tier].plans[key];assert.equal(p.monthly,rates[index]);assert.equal(p.annual,p.monthly*10);
  assert.equal(p.monthly*12-p.annual,p.monthly*2);
 }
}
for(const key of ['250','400'])assert.equal(prices.EN.plans[key].monthly,prices.USD.plans[key].monthly*2);
let rules;
for(const configPath of [path.join(root,'..','vercel.json'),path.join(root,'vercel.json')]){
 const config=JSON.parse(fs.readFileSync(configPath));const routes=config.rewrites.filter(r=>r.source==='/api/pricing');
 if(rules)assert.deepEqual(routes,rules);rules=routes;assert.equal(routes.length,3);
 function resolve(country){const rule=routes.find(r=>!r.has||r.has.every(h=>new RegExp('^(?:'+h.value+')$').test(country||'')));return JSON.parse(fs.readFileSync(path.join(root,rule.destination))).tier;}
 for(const code of ['US','GB','CA','AU','NZ','IE'])assert.equal(resolve(code),'EN',code);
 assert.equal(resolve('IN'),'IN');
 for(const code of ['AE','VN','DE','FR','SG','ZA','NG','PH','JP','XX','','USX'])assert.equal(resolve(code),'USD',code);
 assert.ok(config.headers.some(h=>h.source==='/api/pricing'&&h.headers.some(v=>v.key==='Cache-Control'&&v.value.includes('private, no-store'))));
}
const loader=fs.readFileSync(path.join(root,'assets/js/regional-pricing.js'),'utf8');
async function detect(fetch){
 const w={};const context=vm.createContext({window:w,fetch,AbortController,setTimeout,clearTimeout});
 vm.runInContext(loader,context);return w.SalesOnRegionalPricing.ready;
}
(async()=>{
 for(const tier of ['IN','USD','EN']){
  const r=await detect(async(url,options)=>{assert.equal(url,'/api/pricing');assert.equal(options.cache,'no-store');return {ok:true,json:async()=>({tier})};});
  assert.equal(r.tier,tier);assert.equal(r.detected,true);
 }
 for(const fetch of [async()=>{throw Error('offline');},async()=>({ok:false}),async()=>({ok:true,json:async()=>({tier:'bad'})}),async()=>({ok:true,json:async()=>{throw Error('bad JSON');}})]){
  const r=await detect(fetch);assert.equal(r.tier,'USD');assert.equal(r.detected,false);
 }
 const r=await detect(()=>new Promise(()=>{}));assert.equal(r.tier,'USD');assert.equal(r.detected,false);
 for(const tier of ['IN','USD','EN']){
  const nodes=Object.fromEntries(['data-home-pro-total','data-home-unit-note','data-home-setup','data-home-minimum','data-home-region-note'].map(x=>['['+x+']',{}]));
  const w={SalesOnPricing:prices,SalesOnRegionalPricing:{ready:Promise.resolve({tier,detected:true})}};
  const context=vm.createContext({window:w,document:{querySelector:s=>nodes[s]}});
  vm.runInContext(fs.readFileSync(path.join(root,'assets/js/homepage-pricing.js'),'utf8'),context);
  await Promise.resolve();
  assert.equal(nodes['[data-home-pro-total]'].innerHTML,prices[tier].symbol+(prices[tier].plans['250'].monthly*2)+'<span>/month</span>');
  assert.ok(nodes['[data-home-unit-note]'].textContent.startsWith(prices[tier].symbol+prices[tier].plans['250'].monthly));
  assert.equal(nodes['[data-home-minimum]'].textContent,'2 users');
 }

 assert.ok(!/localStorage|sessionStorage|navigator\.language|ipapi|ipinfo/.test(loader));
 console.log('PASS: both hosting roots, all six higher-price countries, India/rest/unknown routing, exact doubling, two-month annual savings, no-store fetch and network/HTTP/JSON/timeout fallbacks.');
})().catch(e=>{console.error(e);process.exitCode=1;});
