const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'van-sales.html'), 'utf8');
const source = fs.readFileSync(path.join(root, 'assets/js/van-sales-page.js'), 'utf8');
const node = () => ({value:'44',textContent:'',dataset:{},attrs:{},events:{},setAttribute(k,v){this.attrs[k]=v;},addEventListener(k,fn){this.events[k]=fn;}});
const count=node(), result=node(), status=node(), reset=node();
const nodes={'#vs-count':count,'#vs-variance':result,'#vs-count-status':status,'#vs-reset':reset};
const document={getElementById:()=>({querySelector:s=>nodes[s]}),querySelectorAll:()=>[]};
vm.runInNewContext(source,{document});
assert.equal(120-78+4-2,44);
assert.equal(result.textContent,'0');
assert.equal(result.dataset.state,'matched');
for (const [value,variance,phrase] of [['42','-2','2 units short'],['45','+1','1 unit over'],['0','-44','44 units short'],['100','+56','56 units over']]) {
  count.value=value;count.events.input();assert.equal(result.textContent,variance);assert.ok(status.textContent.includes(phrase));assert.equal(count.attrs['aria-invalid'],'false');
}
for (const value of ['', ' ', '-1', '44.5', 'NaN', '9007199254740992']) {
  count.value=value;count.events.input();assert.equal(count.attrs['aria-invalid'],'true');assert.equal(result.textContent,'—');
}
reset.events.click();assert.equal(count.value,'44');assert.equal(result.textContent,'0');assert.equal(count.attrs['aria-invalid'],'false');
const schema=JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
const faq=schema['@graph'].find(n=>n['@type']==='FAQPage');
assert.equal(faq.mainEntity.length,10);
assert.equal((html.match(/class="faq-item"/g)||[]).length,10);
assert.ok(html.includes('requires an internet connection and does not support offline use'));
assert.ok(html.includes('content="index, follow"'));
assert.ok(!html.toLowerCase().includes('noindex'));
assert.ok(html.includes('href="https://saleson.co.in/van-sales"'));
for(const link of ['/order-taking-app','/delivery-management','/invoicing','/payment-collection','/tally-integration','/distribution-management-system','/tools/van-loading-sheet-generator']) assert.ok(html.includes('href="'+link+'"'));
for(const file of ['van-stock-enhanced.webp','customer-actions-enhanced.webp']) assert.ok(html.includes('/assets/img/van-sales/'+file));
for(const bad of ['100% agreement','all major Bluetooth','Live in 1–2 days','1-Click','2 hours','No credit card']) assert.ok(!html.includes(bad),bad);
assert.equal((html.match(/<h1[ >]/g)||[]).length,1);
console.log('PASS: Van Sales count matching, shortage/surplus, invalid inputs, reset, FAQ/schema, scope links and indexable online-only content.');
