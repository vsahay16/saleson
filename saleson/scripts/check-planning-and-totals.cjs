const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),assert=require('node:assert/strict');

const originalToolRead=fs.readFileSync.bind(fs);fs.readFileSync=function(file,...args){const value=originalToolRead(file,...args);if(typeof value!=='string'||!String(file).includes(path.sep+'tools'+path.sep)||!String(file).endsWith('.html'))return value;return value+'\n'+[...value.matchAll(/<script[^>]*src=["'](\/assets\/js\/tools\/[^"']+)["'][^>]*>/g)].map(m=>originalToolRead(path.join(root,m[1]),'utf8')).join('\n');};
const root=path.resolve(__dirname,'..');
function source(slug){return fs.readFileSync(path.join(root,'tools',slug,'index.html'),'utf8');}
function extract(text,name){
  const start=text.indexOf('function '+name+'(');assert.ok(start>=0,name);
  const open=text.indexOf('{',start);let depth=0,quote=null,escape=false,comment=null;
  for(let i=open;i<text.length;i++){
    const ch=text[i],next=text[i+1];
    if(comment==='line'){if(ch==='\n')comment=null;continue;}
    if(comment==='block'){if(ch==='*'&&next==='/'){comment=null;i++;}continue;}
    if(quote){if(escape)escape=false;else if(ch==='\\')escape=true;else if(ch===quote)quote=null;continue;}
    if(ch==='"'||ch==="'"||ch==='`'){quote=ch;continue;}
    if(ch==='/'&&next==='/'){comment='line';i++;continue;}
    if(ch==='/'&&next==='*'){comment='block';i++;continue;}
    if(ch==='{')depth++;
    if(ch==='}'&&--depth===0)return text.slice(start,i+1);
  }
  throw Error('Unclosed '+name);
}
const ctx=vm.createContext({currentMethod:'simple',addDays:n=>'day+'+n});
vm.runInContext(extract(source('stock-reorder-level-calculator'),'calcSku'),ctx);
const calc=data=>ctx.calcSku({avgDailySales:10,leadTime:5,currentStock:40,safetyStockOverride:0,method:'simple',...data});
assert.equal(calc({}).suggestedQty,10);
assert.equal(calc({leadTime:10,currentStock:-5,moq:100,packSize:12}).suggestedQty,108);
assert.equal(calc({currentStock:200,moq:100,packSize:12}).suggestedQty,0);
assert.equal(calc({avgDailySales:0,currentStock:20}).risk,'Healthy');
assert.equal(calc({avgDailySales:0,currentStock:-5}).risk,'Critical');
assert.equal(calc({avgDailySales:0,currentStock:-5}).daysRemaining,0);
assert.equal(calc({method:'target',targetCoverDays:30,currentStock:100}).suggestedQty,200);
assert.equal(calc({safetyStockOverride:'',maxDailySales:15,maxLeadTime:7}).suggestedQty,65);

const originalTZ=process.env.TZ;
process.env.TZ='Asia/Kolkata';
const RealDate=Date,instant=new RealDate('2026-10-26T00:30:00+05:30').valueOf();
class FixedDate extends RealDate{constructor(...args){super(...(args.length?args:[instant]));}static now(){return instant;}}
const dueContext=vm.createContext({Date:FixedDate});
const outstanding=source('outstanding-payment-tracker');
for(const name of ['today','parseDate','diffDays','computeStatus','computeDaysOverdue','computeAgeing','fmtINR'])vm.runInContext(extract(outstanding,name),dueContext);
assert.equal(dueContext.today(),'2026-10-26');
assert.equal(dueContext.computeDaysOverdue(100,'2026-10-25'),1);
assert.equal(dueContext.computeStatus(100,50,'2026-10-25'),'Overdue');
assert.equal(dueContext.computeStatus(100,50,'2026-10-26'),'Partial');
assert.equal(dueContext.computeStatus(0,100,'2026-10-25'),'Paid');
assert.equal(dueContext.computeAgeing(100,'2026-10-18'),'8-15 Days');
assert.equal(dueContext.fmtINR(10.5),'₹10.50');
if(originalTZ===undefined)delete process.env.TZ;else process.env.TZ=originalTZ;

const fields={roundOff:{checked:false},amountPaid:{value:'100'},otherCharges:{value:'10'},advancePct:{value:'25'}};
const totalsContext=vm.createContext({window:{},document:{getElementById:id=>fields[id]}});
vm.runInContext(fs.readFileSync(path.join(root,'assets/js/money.js'),'utf8'),totalsContext);
totalsContext.SalesOnMoney=totalsContext.window.SalesOnMoney;
const items=[{qty:2,rate:100,disc:10,taxable:180,cgst:16.2,sgst:16.2,igst:0,taxAmt:32.4,gstAmt:32.4,total:212.4},{qty:1,rate:50,disc:0,taxable:50,cgst:1.25,sgst:1.25,igst:0,taxAmt:2.5,gstAmt:2.5,total:52.5}];
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-8,`${a} != ${b}`);
vm.runInContext(extract(source('gst-invoice-generator'),'computeTotals'),totalsContext);
let totals=totalsContext.computeTotals(items);
near(totals.subTotal,250);near(totals.totalTaxable,230);near(totals.totalTax,34.9);near(totals.grandTotal,264.9);near(totals.balanceDue,164.9);
fields.roundOff.checked=true;totals=totalsContext.computeTotals(items);near(totals.grandTotal,265);
fields.amountPaid.value='-10';assert.equal(totalsContext.computeTotals(items).amtPaid,0);
fields.amountPaid.value='500';assert.equal(totalsContext.computeTotals(items).balanceDue,0);
fields.roundOff.checked=false;
vm.runInContext(extract(source('quotation-generator'),'computeTotals'),totalsContext);
totals=totalsContext.computeTotals(items);near(totals.grandTotal,274.9);near(totals.advanceAmt,68.73);near(totals.balanceAmt,206.17);
fields.advancePct.value='150';totals=totalsContext.computeTotals(items);assert.equal(totals.advancePct,100);assert.equal(totals.balanceAmt,0);
console.log('PASS: reorder/MOQ/pack/zero/negative-stock scenarios, local-midnight ageing, partial/paid balances, invoice totals and quotation advance rounding. Tax classifications and legal rules are not certified.');
