const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const html=fs.readFileSync(path.join(root,'salesman-tracking.html'),'utf8');
const script=fs.readFileSync(path.join(root,'assets/js/salesman-tracking-page.js'),'utf8');
function element(dataset={}){return {dataset,attrs:{},listeners:{},textContent:'',hidden:false,setAttribute(k,v){this.attrs[k]=v;},addEventListener(k,f){this.listeners[k]=f;},click(){this.listeners.click();},replaceWith(x){this.replacement=x;}};}
const views=['team','day'].map(v=>element({stView:v})),panels=['team','day'].map(v=>element({stPanel:v})),label=element();
const videos=['i5ypxxIW7TI','V99B-tyjqbg','untrusted-id'].map(v=>element({stVideo:v,stVideoTitle:'Product video'}));
const app={querySelectorAll:s=>s==='[data-st-view]'?views:s==='[data-st-panel]'?panels:s==='[data-st-video]'?videos:[],querySelector:()=>label};
const document={getElementById:()=>app,querySelectorAll:()=>[],createElement:tag=>{assert.equal(tag,'iframe');return element();}};
vm.runInNewContext(script,{document});
views[1].click();assert.equal(panels[0].hidden,true);assert.equal(panels[1].hidden,false);assert.equal(views[1].attrs['aria-pressed'],'true');assert.ok(label.textContent.includes('route'));
views[0].click();assert.equal(panels[0].hidden,false);assert.equal(panels[1].hidden,true);assert.equal(views[1].attrs['aria-pressed'],'false');
const embeds=[...html.matchAll(/<iframe\b([^>]+)>/g)];
assert.equal(embeds.length,2);
for(const [i,id] of ['i5ypxxIW7TI','V99B-tyjqbg'].entries()) {
 assert.ok(embeds[i][1].includes('https://www.youtube-nocookie.com/embed/'+id));
 assert.ok(embeds[i][1].includes('loading="lazy"'));
 assert.ok(embeds[i][1].includes('referrerpolicy="strict-origin-when-cross-origin"'));
 assert.ok(embeds[i][1].includes('allowfullscreen'));
 assert.ok(html.includes('https://www.youtube.com/watch?v='+id));
}
for(const name of ['team-location.webp','daily-route.webp','activity-detail-enhanced.webp'])assert.ok(html.includes('/assets/img/salesman-tracking/'+name));
assert.ok(html.includes('does not support offline use'));
assert.ok(html.includes('content="index, follow"'));assert.ok(!html.toLowerCase().includes('noindex'));
assert.ok(html.includes('href="https://saleson.co.in/salesman-tracking"'));
assert.equal((html.match(/<h1[ >]/g)||[]).length,1);
assert.ok(html.includes('Salesman Tracking App for <span>Live Location</span> and Daily Activity Logs'));
assert.ok(html.includes('How to choose a salesman tracking app'));
assert.ok(html.includes('Start Free 7-Day Trial'));
assert.equal((html.match(/class="st-client-logo/g)||[]).length,0);
const schema=JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
assert.equal(schema['@graph'].find(n=>n['@type']==='FAQPage').mainEntity.length,11);
assert.equal((html.match(/class="faq-item"/g)||[]).length,11);
for(const link of ['/field-sales','/order-taking-app','/attendance','/expense-management','/payment-collection','/delivery-management','/pricing'])assert.ok(html.includes('href="'+link+'"'));
for(const term of ['getCurrentPosition','watchPosition','setInterval'])assert.ok(!script.includes(term));
console.log('PASS: tracking screenshot switching/reset, selected state, visible lazy video embeds and direct fallbacks, indexability, FAQ count and specialist links.');
