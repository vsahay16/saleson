const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
let scripts = 0, cases = 0;
function files(dir) {
  return fs.readdirSync(dir, {withFileTypes: true}).flatMap(e => e.isDirectory() ? files(path.join(dir,e.name)) : [path.join(dir,e.name)]);
}
for (const file of files(root).filter(f=>f.endsWith('.html'))) {
  for (const m of fs.readFileSync(file,'utf8').matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
    if (/\bsrc\s*=|application\/ld\+json/.test(m[1])) continue;
    new vm.Script(m[2], {filename:file}); scripts++;
  }
}
for (const [file, region] of [['pricing.html','IN'],['pricing/in.html','IN'],['pricing/us.html','US']]) {
  const html = fs.readFileSync(path.join(root,file),'utf8');
  const functionText = html.match(/function calcUpdate\(\) \{[\s\S]*?\n        \}/)[0];
  const elements = Object.fromEntries(['calc-users','calc-plan','calc-cycle','res-monthly','res-annual','res-save'].map(id=>[id,{}]));
  const context = vm.createContext({window:{}, document:{documentElement:{dataset:{pricingRegion:region}},getElementById:id=>elements[id]}});
  vm.runInContext(fs.readFileSync(path.join(root,'assets/js/pricing-config.js'),'utf8'),context);
  vm.runInContext(functionText,context);
  const plans = context.window.SalesOnPricing[region].plans;
  const symbol = context.window.SalesOnPricing[region].symbol;
  const number = s => Number(s.replace(symbol,'').replaceAll(',',''));
  for(const key of Object.keys(plans)) for(const users of [1,2,10,101]) for(const cycle of ['annual','monthly']) {
    elements['calc-users'].value=String(users);elements['calc-plan'].value=key;elements['calc-cycle'].value=cycle;
    vm.runInContext('calcUpdate()',context);
    const plan=plans[key], expected=users*(cycle==='annual'?plan.annual:plan.monthly*12);
    assert.equal(number(elements['res-annual'].textContent),expected,`${file} ${key} ${users} ${cycle}`);
    assert.equal(number(elements['res-save'].textContent),cycle==='annual'?users*plan.monthly*12-expected:0);
    assert.ok(Math.abs(number(elements['res-monthly'].textContent)-expected/12)<0.006);
    cases++;
  }
  elements['calc-users'].value='-2';elements['calc-plan'].value=Object.keys(plans)[0];elements['calc-cycle'].value='annual';
  vm.runInContext('calcUpdate()',context);
  assert.equal(number(elements['res-annual'].textContent),Object.values(plans)[0].annual);
}
console.log(`PASS: ${scripts} inline scripts compile; ${cases} pricing cases plus invalid-seat boundaries pass.`);
