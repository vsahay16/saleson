const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const path=require('node:path'),root=path.resolve(__dirname,'..');
const html=fs.readFileSync(path.join(root,'expense-management.html'),'utf8');
const fields={};const buttons=['travel','allowance','lodging'].map(key=>({dataset:{exClaim:key},attrs:{},setAttribute(k,v){this.attrs[k]=v;},addEventListener(k,f){this[k]=f;}}));
const app={querySelectorAll:()=>buttons,querySelector:id=>fields[id]??=( {textContent:'',classList:{toggle(c,b){this[c]=b;}}})};
vm.runInNewContext(fs.readFileSync(path.join(root,'assets/js/expense-management-page.js'),'utf8'),{document:{querySelectorAll:()=>[],getElementById:()=>app}});
buttons[1].click();assert.equal(fields['#ex-amount'].textContent,'₹350');assert.equal(fields['#ex-policy'].textContent,'₹50 above the daily cap');assert.equal(fields['#ex-status'].classList['is-exception'],true);assert.equal(buttons[1].attrs['aria-pressed'],'true');
buttons[2].click();assert.equal(fields['#ex-amount'].textContent,'₹1,500');assert.equal(fields['#ex-status'].classList['is-exception'],false);assert.equal(buttons[1].attrs['aria-pressed'],'false');
buttons[0].click();assert.equal(fields['#ex-amount'].textContent,'₹620');assert.equal(620+350+1500,2470);
assert.ok(html.includes('index, follow'));assert.ok(!/noindex|₹10 Cr|400\+|Same-Day Reimbursement Engine/i.test(html));assert.ok(html.includes('does not support offline use'));
const graph=JSON.parse(html.match(/<script type="application\/ld\+json">(.*?)<\/script>/s)[1])['@graph'];const faq=graph.find(x=>x['@type']==='FAQPage');assert.equal(faq.mainEntity.length,9);
for(const q of faq.mainEntity)assert.ok(html.includes(q.name.replaceAll('&','&amp;')));
console.log('PASS: expense sample claim switching, exception reset, selected state, totals, FAQ/schema alignment and indexable online-only copy.');

assert.ok(html.includes("/assets/img/expense-management/expense-mobile-enhanced.webp"));assert.ok(html.includes("/assets/img/product-evidence/expenses.webp"));assert.ok(html.includes("/assets/img/product-evidence/expenses-full.webp"));
assert.equal((html.match(/class="ex-client-logo/g)||[]).length,0);
assert.equal((html.match(/id="expense-review"/g)||[]).length,1);
assert.equal((html.match(/<h1[ >]/g)||[]).length,1);
