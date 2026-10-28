/* Full local DOM execution. External resources, telemetry and real browser dialogs are disabled. */
const {JSDOM,ResourceLoader,VirtualConsole}=require('jsdom');
const fs=require('fs'),path=require('path'),assert=require('node:assert/strict');
const R=path.resolve(__dirname,'..');
class LocalOnly extends ResourceLoader{fetch(url){const u=new URL(url);if(u.hostname!=='saleson.co.in'||!u.pathname.endsWith('.js'))return null;const f=path.join(R,u.pathname);return fs.existsSync(f)?Promise.resolve(fs.readFileSync(f)):null;}}
async function load(slug,{blocked=false,storage={},confirm=true,query=''}={}){
 const errors=[],prints=[],downloads=[],copies=[],alerts=[];const console=new VirtualConsole();console.on('jsdomError',e=>{if(!/navigation|Not implemented|Could not load/.test(e.message))errors.push(e.message);});
 const dom=new JSDOM(fs.readFileSync(path.join(R,'tools',slug,'index.html'),'utf8'),{url:'https://saleson.co.in/tools/'+slug+query,runScripts:'dangerously',resources:new LocalOnly(),pretendToBeVisual:true,virtualConsole:console,beforeParse(w){
  w.confirm=()=>confirm;w.alert=m=>alerts.push(m);w.print=()=>prints.push(true);w.open=()=>({});w.scrollTo=()=>{};w.HTMLElement.prototype.scrollIntoView=()=>{};
  w.IntersectionObserver=class{observe(){}};w.matchMedia=()=>({matches:false,addEventListener(){}});
  w.URL.createObjectURL=()=>{downloads.push(true);return 'blob:local-test';};w.URL.revokeObjectURL=()=>{};
  w.HTMLAnchorElement.prototype.click=function(){downloads.push(this.download);};
  Object.defineProperty(w.navigator,'clipboard',{value:{writeText:async text=>{copies.push(text);}}});
  if(blocked){Object.defineProperty(w,'localStorage',{get(){throw Error('Storage blocked');}});}else for(const [k,v] of Object.entries(storage))w.localStorage.setItem(k,v);
 }});
 await new Promise(resolve=>dom.window.addEventListener('load',()=>setTimeout(resolve,30),{once:true}));
 return {w:dom.window,d:dom.window.document,errors,prints,downloads,copies,alerts,close:()=>dom.window.close()};
}
(async()=>{
 const slugs=fs.readdirSync(path.join(R,'tools')).filter(x=>fs.existsSync(path.join(R,'tools',x,'index.html')));let scenarios=0;
 for(const slug of slugs){
  const t=await load(slug);assert.deepEqual(t.errors,[],slug+' initial errors');
  assert.equal(t.d.querySelectorAll('h1').length,1);assert.equal(t.d.querySelectorAll('.tool-related a').length,3);
  const actions=t.d.querySelectorAll('[data-workspace-action]');assert.ok(actions.length);
  for(const action of ['save','restore','sample','blank','reset']){
   const b=t.d.querySelector(`[data-workspace-action="${action}"]`);if(b){b.click();assert.deepEqual(t.errors,[],slug+' '+action);scenarios++;}
  }
  if(slug==='gst-calculator'){
   t.d.getElementById('amount').value='20000';t.d.getElementById('gstRate').value='18';t.w.calculate();assert.ok(t.d.getElementById('resultRows').textContent.includes('23,600'));scenarios++;
  }
  if(['gst-invoice-generator','quotation-generator','purchase-order-generator','delivery-challan-generator'].includes(slug)){
   const payload='Test "><img src=x onerror="alert(1)"><b>literal</b>';
   for(const rate of [0,0.1,0.25,1.5,3,5,6,7.5,12,18,28,40]){
    t.d.getElementById('itemsBody').replaceChildren();t.w.addItemRow({desc:payload,hsn:'3401',unit:'Box',qty:2,rate:1000,gst:rate});
    const row=t.d.querySelector('#itemsBody tr');assert.equal(row.querySelector('input').value,payload);assert.equal(row.querySelector('select').value,String(rate));assert.equal(row.querySelectorAll('img,b').length,0);
    t.w.renderPreview();const preview=t.d.querySelector('#invoicePreview,#quotePreview,#poPreview,#challanPreview');
    assert.ok(preview?.textContent.includes(payload),slug+' preserves literal preview text');assert.equal(preview.querySelectorAll('[onerror]').length,0);scenarios++;
   }
   assert.throws(()=>t.w.addItemRow({desc:'bad',gst:'not-a-rate'}),/GST rate/);scenarios++;
  }
  if(slug==='hsn-sac-gst-rate-finder'){
   assert.equal(t.d.getElementById('resultsGrid').children.length,8);t.d.getElementById('more-heading-results').click();assert.equal(t.d.getElementById('resultsGrid').children.length,16);
   t.d.getElementById('searchName').value='soap';t.w.runSearch();assert.ok(t.d.getElementById('resultsGrid').children.length>0);scenarios++;
  }
  if(slug==='whatsapp-payment-reminder-generator'){
   t.w.generateMessage();const message=t.d.getElementById('waBubble');assert.ok(message.value.includes('₹'));message.value='Edited reminder for testing';message.dispatchEvent(new t.w.Event('input',{bubbles:true}));t.w.executeAction('copy');await new Promise(r=>setTimeout(r,0));assert.equal(t.copies.at(-1),'Edited reminder for testing');scenarios++;
  }
  const field=t.d.querySelector('main input[type=text]:not([readonly])');
  if(field&&t.d.querySelector('[data-workspace-action=save]')&&t.d.querySelector('[data-workspace-action=restore]')&&!['e-way-bill-checker','gst-calculator','stock-reorder-level-calculator'].includes(slug)){
    field.value='Saved test entry';t.d.querySelector('[data-workspace-action=save]').click();field.value='Unsaved replacement';t.d.querySelector('[data-workspace-action=restore]').click();assert.equal(field.value,'Saved test entry',slug+' restore draft');if(slug==='whatsapp-payment-reminder-generator')assert.equal(t.d.getElementById('waBubble').value,'Edited reminder for testing');scenarios++;
  }
  t.d.querySelector('[data-workspace-action=sample]')?.click();
  const before=t.prints.length;
  if(['gst-invoice-generator','quotation-generator','purchase-order-generator','payment-receipt-generator','delivery-challan-generator'].includes(slug)) {
    t.w.triggerAction('pdf');assert.ok(t.prints.length>before,slug+' print not initiated');
    const original=t.d.querySelector('#itemsBody input[type=number]');if(original){original.value='-3';const count=t.prints.length;t.w.triggerAction('pdf');assert.equal(t.prints.length,count,slug+' exported invalid quantity '+t.w.triggerAction.toString().slice(0,80)+' '+original.outerHTML);}scenarios++;
  }
  if(slug==='van-loading-sheet-generator'){t.d.getElementById('csvPasteInput').value='Import test,SKU-TEST,General,PCS,5,5,1,0,0,0,100,0,100,0';t.w.importCSVPaste();assert.ok(t.d.getElementById('skuTbody').textContent.includes('Import test'));t.w.exportCSV();t.w.printSheet();await new Promise(r=>setTimeout(r,300));assert.ok(t.downloads.length&&t.prints.length);scenarios++;}
  if(slug==='stock-reorder-level-calculator'){t.d.getElementById('csvPasteArea').value='Import test,SKU-TEST,General,Supplier,5,2,3,4,5,0,1,1,10,12,10';t.w.importCSV();assert.ok(t.d.querySelector('main').textContent.includes('Import test'));t.w.exportCSV();t.w.printReport();await new Promise(r=>setTimeout(r,300));assert.ok(t.downloads.length&&t.prints.length);scenarios++;}
  if(slug==='outstanding-payment-tracker'){t.d.getElementById('importTextarea').value='Import test,,INV-TEST,2026-10-01,2026-10-02,1000,400,0,Rep,Route,Note';t.w.processImport();assert.ok(t.d.getElementById('tableBody').textContent.includes('Import test'));t.w.executeAction('csv');t.w.executeAction('print');await new Promise(r=>setTimeout(r,300));assert.ok(t.downloads.length&&t.prints.length);scenarios++;}
  if(slug==='gst-calculator'){await t.w.copyText(t.w.buildCopyText());await new Promise(r=>setTimeout(r,0));assert.ok(t.copies.length);scenarios++;}
  if(t.w.SalesOnToolSafety){
    assert.throws(()=>t.w.SalesOnToolSafety.draft('{bad'));
    assert.throws(()=>t.w.SalesOnToolSafety.draft('{"items":{"bad":true}}'));
    assert.throws(()=>t.w.SalesOnToolSafety.draft('{"items":[null]}'));
    assert.throws(()=>t.w.SalesOnToolSafety.draft('{"logoDataURL":"javascript:bad"}'));
    t.w.navigator.clipboard.writeText=async()=>{throw Error('blocked');};t.d.execCommand=()=>false;assert.equal(await t.w.SalesOnToolSafety.copy('Test'),false);scenarios++;
  }
  // Check storage-denied paths on every tool. Neither save nor restore should crash.
  t.close();const b=await load(slug,{blocked:true});assert.deepEqual(b.errors,[],slug+' blocked-storage initialization');
  b.d.querySelector('[data-workspace-action="save"]')?.click();assert.deepEqual(b.errors,[],slug+' blocked save');
  if(b.d.querySelector('[data-workspace-action="save"]'))assert.ok(!/saved\s*[✓!]/i.test(b.d.getElementById('toast')?.textContent||''),slug+' false saved toast');
  b.close();const cancel=await load(slug,{confirm:false});const input=cancel.d.querySelector('main input[type=text]');if(input){input.value='Keep this entry';cancel.d.querySelector('[data-workspace-action=sample]')?.click();cancel.d.querySelector('[data-workspace-action=blank]')?.click();assert.equal(input.value,'Keep this entry',slug+' cancelled overwrite');}cancel.close();scenarios++;
 }
 for(const slug of ['gst-invoice-generator','quotation-generator']){
   const literal='Imported <b>literal</b> \"quote';
   const query='?'+new URLSearchParams({hsn_code:'3401',hsn_type:'HSN',item_desc:literal,gst_rate:'0.1'});
   const t=await load(slug,{query});assert.deepEqual(t.errors,[]);assert.equal(t.d.querySelector('#itemsBody input').value,literal);assert.equal(t.d.querySelector('#itemsBody select').value,'0.1');assert.equal(t.d.querySelectorAll('#itemsBody b').length,0);t.close();scenarios++;
 }
 const recent=await load('hsn-sac-gst-rate-finder',{storage:{saleson_hsn_recent_searches:JSON.stringify(['<b>literal</b>',null,{},'x'.repeat(1000)])}});
 assert.deepEqual(recent.errors,[]);assert.equal(recent.d.querySelectorAll('#recentChips b').length,0);assert.equal(recent.d.querySelector('.recent-chip').textContent,'<b>literal</b>');recent.close();scenarios++;
 console.log(`PASS: ${slugs.length} tools execute locally; ${scenarios} workspace, fractional-GST, literal-import/preview, calculation, copy and blocked-storage scenarios. Browser layout/real print dialogs remain separate.`);
})().catch(e=>{console.error(e);process.exit(1);});
