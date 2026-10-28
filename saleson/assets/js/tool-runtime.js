/* Browser-only drafts. No lead collection or server submission. */
(() => {
  function createStorage(kind) {
    const memory = new Map();
    let persistent = true;
    return {
      get persistent() { return persistent; },
      getItem(key) {
        if (memory.has(key)) return memory.get(key);
        try { return window[kind].getItem(key); }
        catch (_) { persistent = false; return null; }
      },
      setItem(key, value) {
        const text = String(value); memory.set(key, text);
        try { window[kind].setItem(key, text); }
        catch (_) { persistent = false; }
        updateStorageNotice();
        return persistent;
      },
      removeItem(key) {
        memory.delete(key);
        try { window[kind].removeItem(key); }
        catch (_) { persistent = false; }
      }
    };
  }
  function updateStorageNotice() {
    const note = document.getElementById('tool-storage-notice');
    if (note) { note.hidden = window.SalesOnStorage.persistent; note.textContent = 'Browser storage is unavailable. Changes stay in this tab only; export before leaving.'; }
  }
  window.SalesOnStorage = createStorage('localStorage');
  window.SalesOnSessionStorage = createStorage('sessionStorage');
  window.SalesOnDates = Object.freeze({
    localDate(date) {
      const d = date || new Date();
      return [d.getFullYear(), String(d.getMonth() + 1).padStart(2, '0'), String(d.getDate()).padStart(2, '0')].join('-');
    },
    today() { return this.localDate(new Date()); }
  });
  // Verify storage without assuming that browsers grant persistent access.
  try { const s = window.localStorage; s.setItem('__saleson_probe', '1'); s.removeItem('__saleson_probe'); }
  catch (_) { window.SalesOnStorage.getItem('__saleson_probe'); }
  function startBlank() {
    if (!window.confirm('Start a blank workspace? Current entries will be cleared. Saved drafts are kept.')) return false;
    const controls = [...document.querySelectorAll('main input, main textarea, main select')];
    controls.forEach(el => {
      if (el.type === 'hidden' || el.type === 'button' || el.type === 'submit') return;
      if (el.type === 'file') { el.value = ''; return; }
      if (el.type === 'checkbox' || el.type === 'radio') return;
      if (el.tagName === 'SELECT') { el.selectedIndex = 0; return; }
      if (el.type === 'date') { el.value = /due|until/i.test(el.id) ? '' : SalesOnDates.today(); return; }
      el.value = el.type === 'number' ? (/qty|quantity/i.test(el.id) ? '1' : '0') : '';
    });
    // Access the tools' existing state, then redraw through their own calculations.
    if (typeof entries !== 'undefined') entries = [];
    if (typeof skuList !== 'undefined') skuList = [];
    if (typeof skuPlan !== 'undefined') skuPlan = [];
    if (typeof outletList !== 'undefined') outletList = [];
    if (typeof damageList !== 'undefined') damageList = [];
    if (typeof selectedIds !== 'undefined') selectedIds.clear();
    if (typeof logoDataURL !== 'undefined') logoDataURL = null;
    if (typeof sigDataURL !== 'undefined') sigDataURL = null;
    document.querySelectorAll('#itemsBody tr').forEach(row => row.remove());
    if (typeof itemRowCount !== 'undefined') itemRowCount = 0;
    if (typeof addItemRow === 'function') addItemRow({desc:'', hsn:'', qty:1, unit:'Nos', rate:0, disc:0, gst:0});
    if (typeof addRow === 'function' && !document.querySelector('#itemsBody tr')) addRow({name:'', qty:1, rate:0, gst:0, disc:0});
    document.querySelectorAll('img[id*="Preview"], img[id*="preview"]').forEach(img => { if (/logo|sig/i.test(img.id)) img.style.display = 'none'; });
    for (const name of ['renderSKUTable','renderOutletTable','renderDamageTable','updateKPIs','updateCollection','updateOutletKPIs','updateCategoryFilter','renderTable','renderDashboard','updateDashboard','updateFilterOptions','updateFilterDropdowns','updateBulkBar','renderPreview','calculate','liveCalc','generateMessage','updatePreview']) {
      try { if (typeof window[name] === 'function') window[name](); } catch (_) { /* A different tool owns this renderer. */ }
    }
    controls.filter(el => el.isConnected).forEach(el => {el.dispatchEvent(new Event('input', {bubbles:true}));el.dispatchEvent(new Event('change', {bubbles:true}));});
    const label = document.getElementById('tool-example-label');
    if (label) label.textContent = 'Blank workspace. Add and verify your own details before issuing a document.';
    return true;
  }
  document.addEventListener('DOMContentLoaded', () => {
    const workspace=document.querySelector('.quiet-tool');
    if(!workspace)return;
    const slug=location.pathname.replace(/\/index\.html$/,'').replace(/\/$/,'').split('/').pop();
    const adapters=window.SalesOnToolWorkspaces?.[slug]||{};
    let workspaceMode='sample';
    if(slug==='outstanding-payment-tracker' && typeof _saved!=='undefined' && _saved){try{SalesOnToolSafety.draft(_saved);workspaceMode='draft';document.getElementById('tool-example-label').textContent='Restored draft — review your saved entries.';}catch(_){}}
    const status=document.getElementById('tool-action-status');
    function invoke(call){const name=(call||'').split('(')[0];if(typeof window[name]==='function')return window[name]();}
    function redraw(){for(const name of ['renderSKUTable','renderOutletTable','renderDamageTable','updateKPIs','updateCollection','updateCategoryFilter','updateFilterOptions','renderDashboard','renderTable','updateDashboard','updateFilterDropdowns'])try{if(typeof window[name]==='function')window[name]();}catch(_){}}
    workspace.querySelectorAll('[data-workspace-action]').forEach(button=>button.addEventListener('click',()=>{
      try {
        let action=button.dataset.workspaceAction;
        if(action==='reset'&&slug!=='hsn-sac-gst-rate-finder')action=workspaceMode==='sample'?'sample':workspaceMode==='draft'?'restore':'blank';
        if(action==='blank'||action==='reset'){
          if(slug==='hsn-sac-gst-rate-finder'){resetAll();return;}
          if(startBlank())workspaceMode='blank';
        } else if(action==='sample'){
          if(!confirm('Load sample? This replaces your current workspace. Saved drafts are kept.'))return;
          // Initialise samples directly; reset and handoff routines must not re-consume transfers.
          if(typeof entries!=='undefined')entries=[];
          if(typeof skuList!=='undefined')skuList=[];
          if(typeof skuPlan!=='undefined')skuPlan=[];
          if(typeof outletList!=='undefined')outletList=[];
          if(typeof damageList!=='undefined')damageList=[];
          if(typeof selectedIds!=='undefined')selectedIds.clear();
          const rows=document.getElementById('itemsBody');if(rows)rows.replaceChildren();
          if(typeof itemRowCount!=='undefined')itemRowCount=0;
          if(typeof initSampleData==='function')initSampleData();
          else if(typeof loadSampleData==='function')loadSampleData();
          else if(typeof initDefaults==='function')initDefaults();
          else if(typeof initDefault==='function')initDefault();
          else invoke(adapters.sample);
          redraw();
          workspaceMode='sample';
          document.getElementById('tool-example-label').textContent='Sample workspace — replace example details before use.';
        } else {const completed=invoke(adapters[action]);if(action==='restore'&&completed===true){workspaceMode='draft';document.getElementById('tool-example-label').textContent='Restored draft — review your saved entries.';}}
        updateStorageNotice();
      }catch(error){status.textContent='Could not complete this action. Check the saved data and current fields. Your saved draft has been kept.';status.setAttribute('role','alert');}
    }));
    const modePicker=document.getElementById('calculator-mode');
    if(modePicker&&typeof window.setMode==='function'){
      const modes=['add','remove','split','igst','invoice'],originalMode=window.setMode;
      window.setMode=function(mode,card){const result=originalMode(mode,card);modePicker.value=mode;return result;};
      modePicker.addEventListener('change',()=>window.setMode(modePicker.value,document.querySelectorAll('.mode-card')[modes.indexOf(modePicker.value)]));
    }
    const preview=workspace.querySelector('#invoicePreview,#quotePreview,#poPreview,#receiptPreview,#challanPreview');
    if(preview){
      const header=workspace.querySelector('.preview-panel-header');
      if(header){const button=document.createElement('button');button.type='button';button.className='preview-enlarge';button.textContent='Enlarge preview';header.appendChild(button);
        button.addEventListener('click',()=>{const dialog=document.createElement('dialog');dialog.className='tool-preview-dialog';dialog.setAttribute('aria-label','Document preview');const close=document.createElement('button');close.type='button';close.className='dialog-close';close.textContent='Close preview';const content=document.createElement('div');content.className='dialog-document';const copy=preview.cloneNode(true);copy.removeAttribute('id');copy.querySelectorAll('[id]').forEach(node=>node.removeAttribute('id'));content.appendChild(copy);dialog.append(close,content);document.body.appendChild(dialog);close.addEventListener('click',()=>dialog.close());dialog.addEventListener('close',()=>{dialog.remove();button.focus();});dialog.showModal();});}
    }
    const documentTool=['gst-invoice-generator','quotation-generator','purchase-order-generator','payment-receipt-generator','delivery-challan-generator'].includes(slug);
    if(documentTool){
      workspace.querySelectorAll('label[for]').forEach(label=>{if(label.textContent.includes('*')){const input=document.getElementById(label.htmlFor);if(input)input.required=true;}});
      const original=window.triggerAction;
      if(typeof original==='function')window.triggerAction=function(action,...args){
        if(['pdf','print','wa'].includes(action)){
          const invalid=[...workspace.querySelectorAll('input,select,textarea')].find(input=>!input.disabled&&!input.checkValidity());
          if(invalid){const group=invalid.closest('details');if(group)group.open=true;invalid.reportValidity();invalid.focus();status.textContent='Check the highlighted field before exporting.';return false;}
        }
        return original(action,...args);
      };
    }
    updateStorageNotice();
    // Native validation must be visible even inside a collapsed optional group.
    workspace.addEventListener('invalid',e=>{const group=e.target.closest('details');if(group)group.open=true;status.textContent='Check the highlighted field before continuing.';status.setAttribute('role','alert');},true);
    function labelRows(){workspace.querySelectorAll('table input,table select').forEach(input=>{if(input.getAttribute('aria-label'))return;const cell=input.closest('td'),table=input.closest('table');const index=[...cell.parentNode.children].indexOf(cell);input.setAttribute('aria-label',table.querySelectorAll('thead th')[index]?.textContent.trim()||'Item field');});}
    labelRows();new MutationObserver(labelRows).observe(workspace,{childList:true,subtree:true});
  });
})();
