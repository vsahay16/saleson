const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
for(const component of ['site-header','site-footer'])for(const [pageRegion,saved,expected,blocked] of [[undefined,'US','/pricing/us',false],['US',null,'/pricing/us',false],['IN','US','/pricing',false],[undefined,null,'/pricing',true]]){
  let Registered;
  const link={href:'/pricing',setAttribute(k,v){if(k==='href')this.href=v;}};
  class Element{
    attachShadow(){this.shadowRoot={innerHTML:'',querySelectorAll:()=>[link]};}
    getAttribute(){return null;}
  }
  const context=vm.createContext({HTMLElement:Element,customElements:{define:(name,C)=>Registered=C},document:{documentElement:{dataset:{pricingRegion:pageRegion}}},localStorage:{getItem(){if(blocked)throw Error('Blocked');return saved;}}});
  vm.runInContext(fs.readFileSync(path.join(root,'components',component+'.js'),'utf8'),context);
  if(component==='site-header'){Registered.prototype._bindEvents=()=>{};Registered.prototype._highlightActive=()=>{};}
  new Registered().connectedCallback();
  assert.equal(link.href,expected,`${component}: ${pageRegion}/${saved}`);
}
console.log('PASS: shared header/footer pricing links retain saved USD choice, honor explicit INR/USD pages and work with blocked storage.');
