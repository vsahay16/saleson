const fs=require('fs'),assert=require('assert'),path=require('path');
const root=path.resolve(__dirname,'..');
const clean=s=>s.replace(/<[^>]*>/g,'').replace(/&amp;/g,'&').replace(/\s+/g,' ').trim();
for(const [slug,title,count,anchors] of [
 ['attendance','Field Attendance App for Sales Teams | Photo &amp; GPS Check-In | SalesOn',7,['how-it-works','verified-checkin','work-hours','faq']],
 ['payment-collection','Payment Collection Software India | SalesOn',8,['outstanding','collection-flow','credit-limit','alerts','faq']]
]){
 const s=fs.readFileSync(path.join(root,slug+'.html'),'utf8');
 assert.equal(s.match(/<title>(.*?)<\/title>/s)[1],title);
 assert.equal((s.match(/<h1[ >]/g)||[]).length,1);
 assert.ok(s.includes('href="https://saleson.co.in/'+slug+'"'));
 assert.ok(s.includes('content="index, follow"'));assert.ok(!/noindex/i.test(s));
 const ids=[...s.matchAll(/<section[^>]*id="([^"]+)"/g)].map(x=>x[1]);assert.deepEqual(ids,anchors);
 const schema=[...s.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs)].map(x=>JSON.parse(x[1]));
 const questions=[...s.matchAll(/<button[^>]*class="faq-q"[^>]*>(.*?)<span/gs)].map(x=>clean(x[1]));
 const answers=[...s.matchAll(/<div class="faq-a"[^>]*><p>(.*?)<\/p>/gs)].map(x=>clean(x[1]));
 const faq=schema.find(x=>x['@type']==='FAQPage').mainEntity;
 assert.equal(faq.length,count);assert.deepEqual(faq.map(x=>x.name),questions);assert.deepEqual(faq.map(x=>clean(x.acceptedAnswer.text)),answers);
 assert.ok(answers.some(a=>a.includes('does not support offline use')));
 assert.ok(!schema.find(x=>x['@type']==='SoftwareApplication').offers.price);
 assert.equal((s.match(/class="review-client-logo/g)||[]).length,0);
 assert.equal((s.match(/data-media-src=/g)||[]).length,2);
}
const s=fs.readFileSync(path.join(root,'payment-collection.html'),'utf8');
const table=s.match(/<table><caption>Unpaid balances by invoice[\s\S]*?<\/table>/)[0];
const money=[...table.matchAll(/₹([\d,]+)/g)].map(x=>Number(x[1].replace(/,/g,'')));
assert.equal(money.slice(0,-1).reduce((a,b)=>a+b,0),money.at(-1));
const credit=s.match(/<dl>(.*?)<\/dl>/s)[1];const amounts=[...credit.matchAll(/₹([\d,]+)/g)].map(x=>Number(x[1].replace(/,/g,'')));assert.equal(amounts[0]-amounts[1],amounts[2]);
assert.ok(!s.includes('3d, 30d, 60d, 90d'));assert.ok(!s.includes('30<span>–40%'));
const at=fs.readFileSync(path.join(root,'attendance.html'),'utf8');assert.ok(!at.includes('No Spoofing'));assert.ok(!at.includes('60+ field staff'));assert.ok(at.includes('09:52')&&at.includes('52 minutes'));
console.log('PASS: Attendance/Collection preserved titles and focused section anchors, FAQ/schema alignment, indexability, screenshot enlargement and financial example consistency.');
