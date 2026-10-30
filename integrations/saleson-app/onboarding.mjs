/* Host-app integration. The host must supply an authenticated, tenant-scoped server read. */
const tasks=[['products_added','Add or import products','setup'],['salesperson_invited','Invite a salesperson','setup'],['first_order','Complete your first real order','review']];
const videos={setup:{id:'1MabCdbqtescmE8p6TNDTeIbtxT5uMtpV',title:'Set up your SalesOn workspace'},review:{id:'1HY81zVL8Q0DhkwwNFJO_harDRm4dS_5c',title:'Review your business'},attendance:{id:'12vJyAHgic9JAJ3YHiXjCswymyDorTYvK',title:'Mark your attendance'},password:{id:'1Mz25ipiTQG5HTVJemhsAswAgizdqCv2g',title:'Forgot your password?'},checkout:{id:'1J0EeKtprE9Hf63r6xkafOklUNtRaoMEY',title:'Checked out by mistake?'},product:{id:'1Oi_Tx62Sz7Otdt6ppTJJ2JDyO2RMC_ze',title:'Cannot see the right product?'},route:{id:'1O90V4L2PUllnBT0XDLVWD64COpYqgw08',title:'Cannot see the right route?'},help:{id:'10IOkfSX_ugrWCAX-Kz6sx6B2SXV9Vh8l',title:'Find help inside SalesOn'}};
export function mountTaskHelp(root,task){
 const v=videos[task];if(!v)throw new TypeError('Unknown help task');
 const d=root.ownerDocument,w=d.defaultView,button=d.createElement('button');button.type='button';button.textContent='Watch this task';
 const fallback=d.createElement('a');fallback.textContent='Open video in Drive';fallback.href=`https://drive.google.com/file/d/${v.id}/view`;fallback.target='_blank';fallback.rel='noopener noreferrer';
 let dialog;
 button.addEventListener('click',()=>{
  if(!dialog){dialog=d.createElement('dialog');dialog.setAttribute('aria-label',v.title);const title=d.createElement('h2');title.textContent=v.title;const close=d.createElement('button');close.type='button';close.textContent='Close video';close.addEventListener('click',()=>dialog.close());dialog.append(title,close);d.body.append(dialog);dialog.addEventListener('close',()=>{dialog.querySelector('iframe')?.remove();button.focus();});}
  if(typeof dialog.showModal!=='function'){w.open(fallback.href,'_blank','noopener,noreferrer');return;}
  dialog.querySelector('iframe')?.remove();const frame=d.createElement('iframe');frame.src=`https://drive.google.com/file/d/${v.id}/preview`;frame.title=v.title;frame.allowFullscreen=true;frame.setAttribute('allow','fullscreen');frame.referrerPolicy='no-referrer';frame.style.cssText='display:block;width:min(800px,80vw);height:min(450px,65vh);border:0';dialog.append(frame);dialog.showModal();
 });
 root.append(button,d.createTextNode(' '),fallback);
 return {destroy(){dialog?.remove();button.remove();fallback.remove();}};
}
export function mountOnboarding(root,{loadMilestones,openTask}={}){
 if(typeof loadMilestones!=='function'||typeof openTask!=='function')throw new TypeError('Provide host-app milestone and navigation adapters');
 const d=root.ownerDocument,title=d.createElement('h2'),status=d.createElement('p'),progress=d.createElement('progress'),list=d.createElement('ul'),refresh=d.createElement('button');
 title.textContent='Your first steps';status.setAttribute('role','status');progress.max=3;progress.value=0;progress.hidden=true;progress.setAttribute('aria-label','Verified onboarding milestones');refresh.type='button';refresh.textContent='Refresh account progress';root.replaceChildren(title,status,progress,list,refresh);
 const rows=tasks.map(([key,label,video])=>{const li=d.createElement('li'),labelNode=d.createElement('p'),go=d.createElement('button'),help=d.createElement('span');labelNode.textContent=label;go.type='button';go.textContent='Open task';go.addEventListener('click',()=>openTask(key));li.append(labelNode,go,d.createTextNode(' '),help);list.append(li);return {key,label,labelNode,help:mountTaskHelp(help,video)};});
 let destroyed=false,generation=0;
 async function reload(){const current=++generation;refresh.disabled=true;status.textContent='Checking your account progress…';try{
  const state=await loadMilestones();if(destroyed||current!==generation)return;
  if(!state||state.source!=='server'||!state.milestones)throw Error('Invalid account progress');
  const now=Date.now();let complete=0;
  for(const row of rows){const record=state.milestones[row.key];if(!record||!Object.hasOwn(record,'completedAt'))throw Error('Incomplete account progress');const at=record.completedAt;if(at!==null&&(typeof at!=='string'||!Number.isFinite(Date.parse(at))||Date.parse(at)>now))throw Error('Invalid milestone date');}
  for(const row of rows){const done=state.milestones[row.key].completedAt!==null;if(done)complete++;row.labelNode.textContent=row.label+(done?' — completed in your account':' — not completed');}
  progress.hidden=false;progress.value=complete;status.textContent=`${complete} of 3 confirmed by account records.`;
 }catch(_){if(!destroyed&&current===generation){progress.hidden=true;rows.forEach(row=>row.labelNode.textContent=row.label+' — status unavailable');status.textContent='Account progress is unavailable. You can still open a task or watch its guide.';}}
 finally{if(!destroyed&&current===generation)refresh.disabled=false;}}
 refresh.addEventListener('click',reload);reload();
 return {refresh:reload,destroy(){destroyed=true;generation++;rows.forEach(r=>r.help.destroy());root.replaceChildren();}};
}
