const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const source=fs.readFileSync(path.join(root,'production.html'),'utf8');
const tabs=['bom','orders','cost'].map((id,i)=>({id,attrs:{'aria-controls':'pm-'+id},listeners:{},setAttribute(k,v){this.attrs[k]=v;},getAttribute(k){return this.attrs[k];},addEventListener(k,fn){this.listeners[k]=fn;},focus(){this.focused=true;},tabIndex:i? -1:0}));
const panels=Object.fromEntries(tabs.map((t,i)=>['pm-'+t.id,{hidden:i!==0}]));
vm.runInNewContext(fs.readFileSync(path.join(root,'assets/js/production-page.js'),'utf8'),{document:{getElementById:id=>id==='production-studio'?{querySelectorAll:()=>tabs}:panels[id]}});
for(const tab of tabs){tab.listeners.click();for(const t of tabs){assert.equal(panels['pm-'+t.id].hidden,t!==tab);assert.equal(t.attrs['aria-selected'],String(t===tab));}}
let prevented=false;tabs[2].listeners.keydown({key:'ArrowRight',preventDefault(){prevented=true;}});assert.ok(prevented&&tabs[0].focused);assert.equal(panels['pm-bom'].hidden,false);
tabs[0].listeners.keydown({key:'End',preventDefault(){}});assert.ok(tabs[2].focused);assert.equal(panels['pm-cost'].hidden,false);
tabs[2].listeners.keydown({key:'Home',preventDefault(){}});assert.equal(panels['pm-bom'].hidden,false);
const bom=source.match(/id="pm-bom"[\s\S]*?<\/table>/)[0];
const rowCosts=Array.from(bom.matchAll(/<tr><th>(?:Wheat flour|Sugar|Edible oil|Packaging)<\/th>[\s\S]*?<td>₹([\d,]+)<\/td><\/tr>/g),m=>Number(m[1].replaceAll(',','')));
assert.equal(rowCosts.length,4);assert.equal(rowCosts.reduce((a,b)=>a+b,0),10630);
assert.equal((10630+1800+1000)/1000,13.43);assert.equal(((10720+1870+1000)/980).toFixed(2),'13.87');
assert.equal((source.match(/<main\b/g)||[]).length,1);assert.ok(source.includes('does not support offline use'));
assert.ok(source.includes('Interactive illustration · Sample data'));assert.ok(!source.includes('40%'));
const css=fs.readFileSync(path.join(root,'css/production-page.css'),'utf8');assert.ok(!css.includes('@import'));assert.ok(css.includes('@media(max-width:700px)'));
console.log('PASS: production tabs, keyboard navigation, illustrative costing arithmetic, online-only copy and isolated responsive CSS.');
