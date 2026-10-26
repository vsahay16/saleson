const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),source=fs.readFileSync(path.join(root,'assets/js/target-meter-page.js'),'utf8');
class E{constructor(){this.attrs={};this.dataset={};this.events={};this.style={setProperty(k,v){this[k]=v;}};this.classes=new Set();this.classList={toggle:(name,on)=>on?this.classes.add(name):this.classes.delete(name)};}setAttribute(k,v){this.attrs[k]=v;}addEventListener(k,fn){this.events[k]=fn;}}
const ids=new Map();const get=id=>{if(!ids.has(id))ids.set(id,new E());return ids.get(id);};
const buttons=['east','north','west'].map(key=>{const e=new E();e.dataset.tmTerritory=key;return e;});
const slabs=[80,100,110].map(n=>{const e=new E();e.dataset.tmSlab=String(n);return e;});
get('tm-incentive-slider').value='68';
const context=vm.createContext({document:{getElementById:id=>id==='target-desk'?{querySelectorAll:s=>s==='[data-tm-territory]'?buttons:s==='[data-tm-slab]'?slabs:[]}:get(id)}});
vm.runInContext(source,context);
const records=vm.runInNewContext('('+source.match(/const records=(\{[\s\S]*?\n  \});/)[1]+')');
for(const [index,key] of ['east','north','west'].entries()){
 const record=records[key];assert.equal(record.categories.reduce((sum,c)=>sum+c.target,0),record.target);assert.equal(record.categories.reduce((sum,c)=>sum+c.achieved,0),record.achieved);
 buttons[index].events.click();const pct=Math.round(record.achieved/record.target*100);
 assert.equal(get('tm-achievement').textContent,pct+'%');assert.equal(get('tm-gauge').attrs['aria-valuenow'],String(Math.min(100,pct)));assert.equal(buttons[index].attrs['aria-pressed'],'true');
 record.categories.forEach((c,i)=>assert.equal(get('tm-cat-'+i+'-value').textContent,Math.round(c.achieved/c.target*100)+'%'));
}
assert.equal(get('tm-gap').textContent,'₹60,000');assert.equal(get('tm-gap-label').textContent,'Above target');
for(const [value,points] of [[0,0],[79,0],[80,500],[99,500],[100,1000],[109,1000],[110,1500],[130,1500],[-5,0],['bad',0]]){
 get('tm-incentive-slider').value=String(value);get('tm-incentive-slider').events.input();assert.equal(get('tm-reward-points').textContent,points.toLocaleString('en-IN'));
}
assert.equal(225000+200000+150000+105000,records.east.achieved);
const html=fs.readFileSync(path.join(root,'target-meter.html'),'utf8');assert.ok(!/noindex/i.test(html));assert.equal((html.match(/<main\b/g)||[]).length,1);assert.ok(html.includes('does not support offline use'));
assert.ok(!/<style\b|\sstyle=|<script(?![^>]*type="application\/ld\+json")[^>]*>(?!<\/script>)/.test(html));
console.log('PASS: target territory totals, over-target handling, ARIA progress, incentive boundaries and indexable online-only page.');
