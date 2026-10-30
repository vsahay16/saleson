const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const root=path.resolve(__dirname,'..');let scripts=0,cases=0;
function files(dir){return fs.readdirSync(dir,{withFileTypes:true}).filter(e=>e.name!=='node_modules').flatMap(e=>e.isDirectory()?files(path.join(dir,e.name)):[path.join(dir,e.name)]);}
for(const file of files(root).filter(f=>f.endsWith('.html')))for(const m of fs.readFileSync(file,'utf8').matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)){if(/\bsrc\s*=|application\/ld\+json/.test(m[1]))continue;new vm.Script(m[2],{filename:file});scripts++;}
const elements=Object.fromEntries(['calc-users','calc-plan','calc-cycle','res-monthly','res-annual','res-save','res-payment','res-payment-label','res-annual-label','res-payment-note','calc-note','seat-note'].map(id=>[id,{value:'',listeners:{},addEventListener(k,f){this.listeners[k]=f;}}]));
elements['calc-users'].value='10';elements['calc-plan'].value='250';elements['calc-cycle'].value='annual';
const buttons=['monthly','annual'].map(b=>({dataset:{billing:b},attrs:{},listeners:{},setAttribute(k,v){this.attrs[k]=v;},addEventListener(k,f){this.listeners[k]=f;}}));
const prices={};for(const key of ['250','400']){prices[`[data-plan-price="${key}"]`]={nextElementSibling:{}};prices[`[data-plan-equivalent="${key}"]`]={};}
const taxNote={};
const context=vm.createContext({window:{},document:{getElementById:id=>elements[id],querySelectorAll:s=>s==='[data-plan-tax-note]'?[taxNote]:buttons,querySelector:s=>prices[s]}});
for(const f of ['pricing-config','pricing-page'])vm.runInContext(fs.readFileSync(path.join(root,'assets/js',f+'.js'),'utf8'),context);
const cfg=context.window.SalesOnPricing.IN;assert.deepEqual(Object.keys(context.window.SalesOnPricing),['IN','USD','EN']);assert.equal(cfg.minimumUsers,2);
const calc=context.window.SalesOnPricingCalculator.calculate;
for(const key of Object.keys(cfg.plans))for(const users of [-5,0,1,2,2.2,10,101,10001,'abc',''])for(const cycle of ['monthly','annual']){
 const r=calc(users,key,cycle),n=Math.min(10000,Math.max(2,Math.ceil(Number(users)||2))),p=cfg.plans[key];
 assert.equal(r.seats,n);assert.equal(r.yearly,n*(cycle==='annual'?p.annual:p.monthly*12));assert.equal(r.payment,n*(cycle==='annual'?p.annual:p.monthly));assert.equal(r.saving,cycle==='annual'?n*(12*p.monthly-p.annual):0);cases++;
}
assert.equal(calc(1,'250','monthly').payment,500);assert.equal(calc(1,'400','monthly').payment,800);assert.equal(calc(10,'250','annual').payment,25000);assert.equal(calc(10,'400','annual').payment,40000);
buttons[0].listeners.click();assert.ok(prices['[data-plan-equivalent="250"]'].textContent.includes('Minimum 2 users: ₹500/month'));assert.ok(prices['[data-plan-equivalent="400"]'].textContent.includes('₹800/month'));assert.equal(elements['calc-cycle'].value,'monthly');assert.equal(elements['res-payment'].textContent,'₹2,500');assert.equal(buttons[0].attrs['aria-pressed'],'true');
elements['calc-cycle'].value='annual';elements['calc-cycle'].listeners.change();assert.ok(prices['[data-plan-equivalent="250"]'].textContent.includes('₹5,000/year, paid upfront'));assert.ok(prices['[data-plan-equivalent="400"]'].textContent.includes('₹8,000/year, paid upfront'));assert.equal(buttons[1].attrs['aria-pressed'],'true');assert.equal(elements['res-payment'].textContent,'₹25,000');
elements['calc-users'].value='1';elements['calc-users'].listeners.change();assert.equal(elements['calc-users'].value,'2');assert.equal(elements['res-payment'].textContent,'₹5,000');

for(const tier of ['USD','EN']){
 context.window.SalesOnPricingCalculator.setRegion(tier);
 const regional=context.window.SalesOnPricing[tier];
 for(const key of ['250','400'])for(const seats of [1,2,10])for(const cycle of ['monthly','annual']){
  const r=calc(seats,key,cycle),n=Math.max(2,seats),p=regional.plans[key];
  assert.equal(r.payment,n*(cycle==='annual'?p.annual:p.monthly));
  assert.equal(r.saving,cycle==='annual'?n*p.monthly*2:0);cases++;
 }
 elements['calc-users'].value='2';elements['calc-plan'].value='400';buttons[0].listeners.click();
 assert.equal(elements['res-payment'].textContent,'$'+(regional.plans['400'].monthly*2));
 assert.ok(elements['res-payment-note'].textContent.endsWith('before taxes'));
 assert.equal(taxNote.textContent,'Prices in USD · Taxes extra where applicable · $0 SalesOn account setup');
}
context.window.SalesOnPricingCalculator.setRegion('IN');
const html=fs.readFileSync(path.join(root,'pricing.html'),'utf8');assert.ok(!/no minimum users|noindex|pricing\/us/i.test(html));assert.equal((html.match(/<h1\b/g)||[]).length,1);assert.equal((html.match(/<details>/g)||[]).length,8);
const van=cfg.comparison.find(f=>f.name.startsWith('Van sales'));assert.deepEqual(Array.from(van.plans),['400']);assert.ok(html.includes('<th scope="row">Van sales and end-of-day settlement</th><td>—</td><td>Included</td>'));
const faq=JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);for(const q of faq.mainEntity){assert.ok(html.includes(q.name));assert.ok(html.includes(q.acceptedAnswer.text));}
for(const region of ['us','in']){const s=fs.readFileSync(path.join(root,'pricing',region+'.html'),'utf8');assert.ok(s.includes('0;url=/pricing'));assert.ok(s.includes('https://saleson.co.in/pricing'));}
const redirects=JSON.parse(fs.readFileSync(path.join(root,'..','vercel.json'))).redirects;for(const region of ['us','in'])assert.ok(redirects.some(r=>r.source==='/pricing/'+region&&r.destination==='/pricing'&&r.permanent));
console.log(`PASS: ${scripts} inline scripts compile; ${cases} pricing cases, two-seat minimum, billing toggle synchronization, exact annual payments, Enterprise-only van sales, FAQ/schema and regional consolidation.`);

