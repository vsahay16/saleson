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
    if (note) note.hidden = window.SalesOnStorage.persistent;
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
    if (!window.confirm('Start a blank document? Unsaved entries on this page will be cleared. Saved drafts are kept.')) return;
    const controls = [...document.querySelectorAll('input, textarea, select')];
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
    for (const name of ['renderSKUTable','renderOutletTable','renderDamageTable','updateKPIs','updateCollection','updateOutletKPIs','updateCategoryFilter','renderTable','renderDashboard','updateDashboard','updateFilterOptions','updateFilterDropdowns','updateBulkBar','renderPreview','calculate','updatePreview']) {
      try { if (typeof window[name] === 'function') window[name](); } catch (_) { /* A different tool owns this renderer. */ }
    }
    controls.filter(el => el.isConnected).forEach(el => el.dispatchEvent(new Event('change', {bubbles:true})));
    const label = document.getElementById('tool-example-label');
    if (label) label.textContent = 'Blank workspace. Add and verify your own details before issuing a document.';
  }
  document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('#searchName') && document.querySelector('#searchCode')) return;
    const heading = document.querySelector('h1');
    if (!heading) return;
    const panel = document.createElement('aside'); panel.className = 'tool-workspace-controls';
    const note = document.createElement('p'); note.id = 'tool-example-label';
    note.textContent = 'Example entries may be shown to explain the tool. Review every field before printing or sharing, or start blank.';
    const button = document.createElement('button'); button.type = 'button'; button.textContent = 'Start blank';
    button.addEventListener('click', startBlank);
    const reset = document.createElement('button'); reset.type = 'button'; reset.textContent = 'Load example';
    reset.addEventListener('click', () => {
      if (!window.confirm('Load example entries? Unsaved entries on this page will be cleared.')) return;
      if (typeof initSampleData === 'function') {
        initSampleData(); renderDashboard(); renderTable(); updateFilterDropdowns();
      } else if (typeof loadSampleData === 'function') {
        if (typeof skuList !== 'undefined') skuList = [];
        if (typeof skuPlan !== 'undefined') skuPlan = [];
        if (typeof outletList !== 'undefined') outletList = [];
        if (typeof damageList !== 'undefined') damageList = [];
        loadSampleData();
        for (const name of ['renderSKUTable','renderOutletTable','renderDamageTable','updateKPIs','updateCollection','updateCategoryFilter','updateFilterOptions','renderTable','updateDashboard']) {
          if (typeof window[name] === 'function') window[name]();
        }
      } else { window.location.reload(); }
      if (typeof selectedIds !== 'undefined') selectedIds.clear();
      note.textContent = 'Example workspace. Replace all example details before printing or sharing.';
    });
    const storage = document.createElement('p'); storage.id = 'tool-storage-notice'; storage.hidden = true;
    storage.setAttribute('role', 'status'); storage.textContent = 'Browser storage is unavailable. Changes stay in this tab only; download or print before leaving.';
    panel.append(note, button, reset, storage);
    (heading.closest('section') || heading.parentElement).after(panel);
    updateStorageNotice();
  });
})();
