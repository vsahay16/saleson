/* Illustrative workflow tabs. No data submission or business-state mutations. */
(()=>{
  const root=document.getElementById('production-studio');
  if(!root)return;
  const tabs=Array.from(root.querySelectorAll('.pm-tabs [role="tab"]'));
  function select(tab,focus){
    tabs.forEach(t=>{
      const active=t===tab;
      t.setAttribute('aria-selected',String(active));t.tabIndex=active?0:-1;
      const panel=document.getElementById(t.getAttribute('aria-controls'));
      if(panel)panel.hidden=!active;
    });
    if(focus)tab.focus();
  }
  tabs.forEach((tab,i)=>{
    tab.addEventListener('click',()=>select(tab,false));
    tab.addEventListener('keydown',event=>{
      let next;
      if(event.key==='ArrowRight')next=(i+1)%tabs.length;
      else if(event.key==='ArrowLeft')next=(i+tabs.length-1)%tabs.length;
      else if(event.key==='Home')next=0;
      else if(event.key==='End')next=tabs.length-1;
      else return;
      event.preventDefault();select(tabs[next],true);
    });
  });
})();
