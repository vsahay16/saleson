const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');

const originalToolRead=fs.readFileSync.bind(fs);fs.readFileSync=function(file,...args){const value=originalToolRead(file,...args);if(typeof value!=='string'||!String(file).includes(path.sep+'tools'+path.sep)||!String(file).endsWith('.html'))return value;return value+'\n'+[...value.matchAll(/<script[^>]*src=["'](\/assets\/js\/tools\/[^"']+)["'][^>]*>/g)].map(m=>originalToolRead(path.join(root,m[1]),'utf8')).join('\n');};
const root=path.resolve(__dirname,'..');
const moneyContext=vm.createContext({window:{}});
vm.runInContext(fs.readFileSync(path.join(root,'assets/js/money.js'),'utf8'),moneyContext);
const money=moneyContext.window.SalesOnMoney;
const rounding=[['0',0],['0.004',0],['0.005',1],['0.995',100],['1.005',101],['999.999',100000],['12,345.67',1234567],['1e3',100000],['1.23e-2',1],['-1.005',-101]];
rounding.forEach(([input,expected])=>assert.equal(money.minorUnits(input),expected));
assert.equal(money.toWords('0.995'),'One Rupee Only');
assert.equal(money.toWords('1.005'),'One Rupee and One Paisa Only');
assert.equal(money.toWords('100000'),'One Lakh Rupees Only');
assert.equal(money.toWords('12.50'),'Twelve Rupees and Fifty Paise Only');
for(const invalid of ['NaN','Infinity','abc','1e100'])assert.throws(()=>money.minorUnits(invalid));
assert.equal(money.toWords('abc'),'Amount unavailable');
const tools=['gst-calculator','gst-invoice-generator','quotation-generator','payment-receipt-generator','delivery-challan-generator','purchase-order-generator'];
moneyContext.SalesOnMoney=money;
for(const slug of tools){
  const html=fs.readFileSync(path.join(root,'tools',slug,'index.html'),'utf8');
  const wrapper=html.match(/function amountToWords\(value\) \{ return SalesOnMoney.toWords\(value\); \}/)[0];
  vm.runInContext(wrapper,moneyContext);
  assert.equal(vm.runInContext('amountToWords(999.999)',moneyContext),'One Thousand Rupees Only');
}
const now=1800000000000;
let storage=new Map();
const localStorage={getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,String(v)),removeItem:k=>storage.delete(k)};
const quiet={error(){}};
const ctx=vm.createContext({window:{},localStorage,Date:class extends Date{static now(){return now;}},console:quiet});
vm.runInContext(fs.readFileSync(path.join(root,'assets/js/tool-handoff.js'),'utf8'),ctx);
const H=ctx.window.SalesOnHandoff;
const original={quantity:3};assert.equal(H.put('draft',original),true);assert.equal(original.__salesonHandoffAt,undefined);
assert.equal(H.take('draft').quantity,3);assert.ok(!storage.has('draft'));
storage.set('old',JSON.stringify({quantity:1,__salesonHandoffAt:now-1000}));
storage.set('new',JSON.stringify({quantity:2,__salesonHandoffAt:now-100}));
storage.set('broken','{invalid');
const selected=H.takeLatest([{key:'old',kind:'old'},{key:'new',kind:'new'},{key:'broken'}]);
assert.equal(selected.kind,'new');assert.equal(selected.data.quantity,2);assert.ok(storage.has('old'));assert.ok(storage.has('broken'));assert.ok(!storage.has('new'));
storage=new Map([
 ['stale',JSON.stringify({quantity:1,__salesonHandoffAt:now-7*3600000})],
 ['future',JSON.stringify({quantity:1,__salesonHandoffAt:now+10*60000})],
 ['primitive','42'],['empty','[]'],['nulls','[null]']
]);
assert.equal(H.takeLatest([...storage.keys()].map(key=>({key}))),null);assert.equal(storage.size,5);
storage.set('legacy',JSON.stringify({quantity:7}));assert.equal(H.take('legacy').quantity,7);
assert.equal(H.put('bad',null),false);assert.equal(H.put('bad',[]),false);
localStorage.getItem=()=>{throw new Error('Storage denied');};
assert.equal(H.take('denied'),null);
localStorage.setItem=()=>{throw new Error('Quota exceeded');};
assert.equal(H.put('denied',{quantity:1}),false);
console.log(`PASS: decimal/paise boundaries, currency words in ${tools.length} tools, and handoff selection, draft preservation, malformed/stale/future data and blocked storage.`);
