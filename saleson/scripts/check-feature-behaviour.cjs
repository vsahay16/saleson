// Execute the extracted event wiring with a small DOM model; this is not a layout test.
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
class Element {
  constructor(){
    this.classes=new Set();this.attrs={};this.listeners={};this.style={};this.dataset={};
    this.classList={contains:x=>this.classes.has(x),add:x=>this.classes.add(x),remove:x=>this.classes.delete(x),toggle:(x,on)=>{const next=on===undefined?!this.classes.has(x):on;if(next)this.classes.add(x);else this.classes.delete(x);return next;}};
  }
  setAttribute(k,v){this.attrs[k]=v;}
  getAttribute(k){return this.attrs[k];}
  addEventListener(k,fn){(this.listeners[k]||=[]).push(fn);}
  click(){for(const fn of this.listeners.click||[])fn.call(this,{target:this,preventDefault(){},stopPropagation(){}});}
  closest(){return {querySelector:()=>this.nextElementSibling};}
  focus(){this.focused=true;}
  scrollTo(){this.scrolled=true;}
}
let count=0;
for(const [slug,info] of Object.entries(JSON.parse(fs.readFileSync(path.join(root,'feature-pages-manifest.json'))))){
  const html=fs.readFileSync(path.join(root,slug+'.html'),'utf8');
  const faqAction=html.match(/<button\b(?=[^>]*class="(?:faq-q|fqb)(?:\s|"))[^>]*data-page-action="([^"]+)"/)[1];
  const techAction=slug==='tally-integration'?html.match(/<button\b(?=[^>]*id="techBtn")[^>]*data-page-action="([^"]+)"/)[1]:null;
  const buttons=[new Element(),new Element()];
  const answers=buttons.map(b=>b.nextElementSibling=new Element());
  const tech=new Element(),details=new Element();
  const document={
    querySelector:()=>null,
    getElementById:id=>id==='techDetails'?details:null,
    querySelectorAll:selector=>{
      if(['.faq-q','.fqb'].includes(selector))return buttons;
      if(selector==='.faq-q.open')return buttons.filter(b=>b.classList.contains('open'));
      if(['.faq-a','.fa'].includes(selector))return answers;
      if(selector===`[data-page-action="${faqAction}"]`)return buttons;
      if(techAction && selector===`[data-page-action="${techAction}"]`)return [tech];
      return [];
    }
  };
  const context=vm.createContext({document,window:{addEventListener(){}},IntersectionObserver:class{observe(){} unobserve(){}},setTimeout:fn=>fn()});
  vm.runInContext(fs.readFileSync(path.join(root,info.javascript),'utf8'),context);
  assert.ok(buttons[0].listeners.click?.length,slug+' FAQ handler not bound');
  buttons[0].click();assert.equal(buttons[0].attrs['aria-expanded'],'true');assert.ok(answers[0].classes.has('open'),slug+' first answer not opened');
  buttons[1].click();assert.equal(buttons[0].attrs['aria-expanded'],'false');assert.ok(!answers[0].classes.has('open'));assert.ok(answers[1].classes.has('open'));
  buttons[1].click();assert.equal(buttons[1].attrs['aria-expanded'],'false');assert.ok(!answers[1].classes.has('open'));
  if(slug==='tally-integration'){
    tech.click();assert.equal(details.attrs['aria-hidden'],'false');
    tech.click();assert.equal(details.attrs['aria-hidden'],'true');
  }
  count++;
}
const trigger=new Element();trigger.dataset={mediaSrc:'/assets/img/dms-hero.webp',mediaTitle:'DMS dashboard'};
const image=new Element(),title=new Element(),zoom=new Element(),close=new Element(),viewport=new Element(),dialog=new Element();
dialog.querySelector=selector=>({'img':image,'h2':title,'.feature-media-zoom':zoom,'.feature-media-close':close,'.feature-media-dialog-viewport':viewport}[selector]);
dialog.showModal=()=>{dialog.open=true;};
dialog.close=()=>{dialog.open=false;for(const fn of dialog.listeners.close||[])fn();};
const mediaContext=vm.createContext({document:{querySelectorAll:()=>[trigger],createElement:()=>dialog,body:{append(){}}},window:{open(){throw new Error('Unexpected fallback');}}});
vm.runInContext(fs.readFileSync(path.join(root,'assets/js/feature-media.js'),'utf8'),mediaContext);
trigger.click();assert.ok(dialog.open);assert.equal(image.src,trigger.dataset.mediaSrc);assert.equal(image.alt,trigger.dataset.mediaTitle);
zoom.click();assert.equal(zoom.attrs['aria-pressed'],'true');assert.ok(dialog.classes.has('is-zoomed'));
zoom.click();assert.equal(zoom.attrs['aria-pressed'],'false');
close.click();assert.ok(!dialog.open);assert.ok(trigger.focused);
console.log(`PASS: ${count} extracted FAQ bindings (open, switch, close), Tally technical toggle, and image dialog open/zoom/close/focus behaviour. Browser layout remains unverified.`);
