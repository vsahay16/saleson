/* Homepage interactions: no autoplay, no background video download, no simulated live data. */
(() => {
 const root=document.querySelector('.saleson-home');if(!root)return;
 function bindTabs(selector,keyAttribute){
  const tabs=[...root.querySelectorAll(selector)];
  function select(tab,focus=false){
   tabs.forEach(t=>{const active=t===tab;t.setAttribute('aria-selected',String(active));t.tabIndex=active?0:-1;const panel=document.getElementById(t.getAttribute('aria-controls'));if(panel)panel.hidden=!active;});
   if(focus)tab.focus();
  }
  tabs.forEach((tab,index)=>{
   tab.addEventListener('click',()=>select(tab));
   tab.addEventListener('keydown',e=>{let i=index;if(e.key==='ArrowRight')i=(index+1)%tabs.length;else if(e.key==='ArrowLeft')i=(index+tabs.length-1)%tabs.length;else if(e.key==='Home')i=0;else if(e.key==='End')i=tabs.length-1;else return;e.preventDefault();select(tabs[i],true);});
  });
 }
 bindTabs('[data-dash-tab]');bindTabs('[data-explore-tab]');
 const shells=[...root.querySelectorAll('[data-home-video]')];
 shells.forEach(shell=>{
  const video=shell.querySelector('video'),button=shell.querySelector('.video-play'),source=video.querySelector('source');
  button.addEventListener('click',()=>{
   shells.forEach(other=>{if(other!==shell)other.querySelector('video').pause();});
   if(!source.src){source.src=source.dataset.src;video.load();}
   shell.classList.add('is-playing');
   const playing=video.play();if(playing?.catch)playing.catch(()=>{shell.classList.remove('is-playing');});
  });
  video.addEventListener('ended',()=>shell.classList.remove('is-playing'));
  video.addEventListener('error',()=>shell.classList.remove('is-playing'));
 });
})();

/* Accessible enlargement for the supplied product screenshots. */
(() => {
  const triggers = [...document.querySelectorAll('[data-media-src]')];
  if (!triggers.length) return;
  const dialog = document.createElement('dialog');
  dialog.className = 'feature-media-dialog';
  dialog.setAttribute('aria-labelledby', 'feature-media-title');
  dialog.innerHTML = '<div class="feature-media-dialog-header"><h2 id="feature-media-title" class="feature-media-dialog-title"></h2><div class="feature-media-dialog-actions"><button type="button" class="feature-media-zoom" aria-pressed="false">Zoom in</button><button type="button" class="feature-media-close" autofocus>Close image</button></div></div><div class="feature-media-dialog-viewport" tabindex="0" role="region" aria-label="Product image; scroll to explore"><img class="feature-media-dialog-image" alt=""></div>';
  document.body.append(dialog);
  const image = dialog.querySelector('img');
  const title = dialog.querySelector('h2');
  const zoom = dialog.querySelector('.feature-media-zoom');
  const close = dialog.querySelector('.feature-media-close');
  const viewport = dialog.querySelector('.feature-media-dialog-viewport');
  let opener = null;
  triggers.forEach(trigger => trigger.addEventListener('click', () => {
    opener = trigger;
    image.src = trigger.dataset.mediaSrc;
    image.alt = trigger.dataset.mediaTitle;
    title.textContent = trigger.dataset.mediaTitle;
    dialog.classList.remove('is-zoomed');
    zoom.setAttribute('aria-pressed', 'false');
    zoom.textContent = 'Zoom in';
    if (typeof dialog.showModal === 'function') dialog.showModal();
    else { window.open(trigger.dataset.mediaSrc, '_blank', 'noopener'); return; }
    viewport.scrollTo(0, 0);
  }));
  close.addEventListener('click', () => dialog.close());
  zoom.addEventListener('click', () => {
    const enlarged = dialog.classList.toggle('is-zoomed');
    zoom.setAttribute('aria-pressed', String(enlarged));
    zoom.textContent = enlarged ? 'Fit image' : 'Zoom in';
  });
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const bounds = dialog.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
  });
  dialog.addEventListener('close', () => opener?.focus());
})();

