const assert=require('node:assert/strict'),fs=require('fs'),vm=require('vm');
const events=[],timers=[],body={appendChild:a=>{a.connected=true;events.push('append');}};
const context={window:{SalesOnTracking:{emit:(name,data)=>events.push([name,data])}},URL:{createObjectURL:()=>{events.push('create');return 'blob:test';},revokeObjectURL:()=>events.push('revoke')},document:{body,createElement:()=>({click(){assert.ok(this.connected);events.push('click');},remove(){events.push('remove');}})},setTimeout:(f,ms)=>timers.push({f,ms})};
vm.runInNewContext(fs.readFileSync(require('path').join(__dirname,'../assets/js/tool-safety.js'),'utf8'),context);
const api=context.window.SalesOnToolSafety;
assert.equal(api.csvCell(0),'"0"');assert.equal(api.csvCell(null),'""');assert.equal(api.csvCell('A, "B"\nC'),'"A, ""B""\nC"');
api.download({},'test.csv','csv');assert.deepEqual(events.slice(0,3),['create','append','click']);assert.ok(!events.includes('revoke'));assert.ok(timers[0].ms>=1000);timers[0].f();assert.deepEqual(events.slice(-2),['remove','revoke']);
assert.equal(events.filter(x=>Array.isArray(x)&&x[0]==='tool_download').length,1);
console.log('PASS: CSV zero/quote/newline preservation, connected download anchor, deferred cleanup and intent-only tracking.');
