const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');const html=fs.readFileSync(path.join(root,'invoicing.html'),'utf8');
const buttons=['a4','thermal'].map(value=>({dataset:{ivFormat:value},attrs:{},addEventListener(k,f){this[k]=f},setAttribute(k,v){this.attrs[k]=v}}));
const paper={classList:{toggle(name,value){this[name]=value}}},status={textContent:''};
vm.runInNewContext(fs.readFileSync(path.join(root,'assets/js/invoicing-page.js'),'utf8'),{document:{getElementById:()=>({querySelector:id=>id==='#iv-invoice'?paper:status,querySelectorAll:()=>buttons})}});
buttons[1].click();assert.equal(paper.classList['is-thermal'],true);assert.equal(buttons[1].attrs['aria-pressed'],'true');assert.ok(status.textContent.includes('thermal-style'));
buttons[0].click();assert.equal(paper.classList['is-thermal'],false);assert.equal(buttons[1].attrs['aria-pressed'],'false');assert.ok(status.textContent.includes('A4-style'));
assert.equal(10*200+15*200,5000);assert.equal(5000+900,5900);
const graph=JSON.parse(html.match(/<script type="application\/ld\+json">(.*?)<\/script>/s)[1])['@graph'];const faq=graph.find(x=>x['@type']==='FAQPage');assert.equal(faq.mainEntity.length,10);
for(const q of faq.mainEntity){assert.ok(html.includes(q.name.replaceAll('&','&amp;')));assert.ok(html.includes(q.acceptedAnswer.text.replaceAll('&','&amp;')));}
assert.ok(html.includes('does not support offline use'));assert.ok(html.includes('index, follow'));assert.ok(!/noindex|zero gst errors|100%|under 10 seconds|Nishtha FMCG/i.test(html));
for(const href of ['/order-taking-app','/payment-collection','/distribution-management-system','/van-sales','/tally-integration','/tools/gst-invoice-generator'])assert.ok(html.includes('href="'+href+'"'));
assert.equal((html.match(/<main\b/g)||[]).length,1);assert.equal((html.match(/<h1\b/g)||[]).length,1);
console.log('PASS: invoicing format switches, sample totals, FAQ/schema alignment, specialist links and indexable online-only copy.');
