const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync(path.join(__dirname,'../assets/js/demo-role.js'),'utf8');
const names=['Sales Head','Distributor Owner','Accounts Head','Operations Head','Production Head'];
function exercise(saved,blocked=false){
  let nodes=[],last=-1,stored=saved;
  const buttons=names.map(name=>({querySelector:()=>({textContent:name})}));
  const document={querySelectorAll:()=>buttons,createElement:()=>({setAttribute(){}}),getElementById:()=>({after:(...n)=>nodes=n})};
  const window={setRole:(index,button)=>{assert.equal(button,buttons[index]);last=index;}};
  const sessionStorage={getItem:()=>{if(blocked)throw Error('Blocked');return saved;},setItem:(key,value)=>{if(blocked)throw Error('Blocked');stored=value;}};
  vm.runInContext(source,vm.createContext({document,window,sessionStorage}));
  const initial=!blocked && saved==='2'?2:0;
  assert.equal(last,initial);assert.equal(nodes[1].value,names[initial]);
  window.setRole(4,buttons[4]);assert.equal(last,4);assert.equal(nodes[1].value,'Production Head');
  if(!blocked)assert.equal(stored,'4');
  window.setRole(99,buttons[0]);assert.equal(last,4);
}
exercise('2');exercise('99');exercise(null,true);
console.log('PASS: demo role restoration, persistence, invalid selection and blocked session storage. Scheduler submission is not inferred.');
