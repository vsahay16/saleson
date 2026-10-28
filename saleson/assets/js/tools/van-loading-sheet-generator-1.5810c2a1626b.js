
/* ============================
   STATE
============================ */
let skuList = [];        // Array of SKU objects
let outletList = [];     // Outlet-wise rows
let damageList = [];     // Damage/return rows
let nextSKUID = 1;       // SKU ID counter
let nextOutletID = 1;
let nextDamageID = 1;
let outletEnabled = false;
let damageEnabled = false;
let logoDataURL = null;
let leadCaptured = true;
let pendingAction = null; // Action to run after lead modal

/* ============================
   INIT
============================ */
document.addEventListener('DOMContentLoaded', () => {
  // Set today's date
  document.getElementById('reportDate').value = SalesOnDates.today();

  // Check if lead was already captured
  leadCaptured = !!true;

  // Logo upload
  document.getElementById('bizLogo').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => { logoDataURL = ev.target.result; };
    reader.readAsDataURL(file);
  });

  // Live recalculation on SKU form
  ['skuOpenStock','skuLoaded','skuSold','skuReturnGood','skuDamaged','skuSample','skuRate'].forEach(id => {
    document.getElementById(id).addEventListener('input', recalcSKUForm);
  });

  // Load sample data
  loadSampleData();

  // Initial renders
  renderSKUTable();
  updateKPIs();
  updateCollection();
});

/* ============================
   SAMPLE DATA
============================ */
function loadSampleData() {
  const samples = [
    { name:'FMCG Product Box', code:'FMCG-001', cat:'FMCG', unit:'Box', open:10, loaded:50, sold:42, retGood:5, damaged:1, sample:0, rate:500, credit:5000, cash:15000, upi:1000 },
    { name:'Detergent Pack', code:'FMCG-002', cat:'Detergent', unit:'Packet', open:25, loaded:100, sold:80, retGood:10, damaged:2, sample:3, rate:100, credit:0, cash:5000, upi:3000 },
    { name:'Tea Packet', code:'FMCG-003', cat:'Beverages', unit:'Packet', open:50, loaded:150, sold:120, retGood:15, damaged:0, sample:5, rate:120, credit:0, cash:8000, upi:6400 },
  ];
  samples.forEach(s => {
    const totalAvail = s.open + s.loaded;
    const closing = totalAvail - s.sold - s.retGood - s.damaged - s.sample;
    const salesVal = s.sold * s.rate;
    skuList.push({
      id: nextSKUID++,
      name: s.name, code: s.code, cat: s.cat, unit: s.unit,
      open: s.open, loaded: s.loaded, totalAvail,
      sold: s.sold, retGood: s.retGood, damaged: s.damaged, sample: s.sample,
      closing, rate: s.rate, salesVal,
      creditSales: s.credit, cashSales: s.cash, upiSales: s.upi,
      checked: false
    });
  });
}

/* ============================
   SKU FORM RECALCULATION
============================ */
function recalcSKUForm() {
  const open = parseFloat(document.getElementById('skuOpenStock').value) || 0;
  const loaded = parseFloat(document.getElementById('skuLoaded').value) || 0;
  const sold = parseFloat(document.getElementById('skuSold').value) || 0;
  const retGood = parseFloat(document.getElementById('skuReturnGood').value) || 0;
  const damaged = parseFloat(document.getElementById('skuDamaged').value) || 0;
  const sample = parseFloat(document.getElementById('skuSample').value) || 0;
  const rate = parseFloat(document.getElementById('skuRate').value) || 0;

  const totalAvail = open + loaded;
  const closing = totalAvail - sold - retGood - damaged - sample;
  const salesVal = sold * rate;

  document.getElementById('skuTotalAvail').value = totalAvail;
  document.getElementById('skuClosingStock').value = closing;
  document.getElementById('skuSalesValue').value = salesVal;

  // Inline error
  const errEl = document.getElementById('skuErrorMsg');
  const closeEl = document.getElementById('skuClosingStock');
  if (closing < 0) {
    errEl.style.display = 'block';
    errEl.textContent = `⚠️ Closing stock cannot be negative. Sold/return/damage/sample quantity (${sold+retGood+damaged+sample}) is more than available stock (${totalAvail}).`;
    closeEl.classList.add('error-field');
  } else {
    errEl.style.display = 'none';
    closeEl.classList.remove('error-field');
  }
}

/* ============================
   ADD / UPDATE SKU
============================ */
function addOrUpdateSKU() {
  const errEl = document.getElementById('skuErrorMsg');
  const name = document.getElementById('skuName').value.trim();
  if (!name) { showToast('Please enter a product name.'); return; }

  const open = parseFloat(document.getElementById('skuOpenStock').value) || 0;
  const loaded = parseFloat(document.getElementById('skuLoaded').value) || 0;
  const sold = parseFloat(document.getElementById('skuSold').value) || 0;
  const retGood = parseFloat(document.getElementById('skuReturnGood').value) || 0;
  const damaged = parseFloat(document.getElementById('skuDamaged').value) || 0;
  const sample = parseFloat(document.getElementById('skuSample').value) || 0;
  const rate = parseFloat(document.getElementById('skuRate').value) || 0;

  const totalAvail = open + loaded;
  const closing = totalAvail - sold - retGood - damaged - sample;

  if (closing < 0) {
    errEl.style.display = 'block';
    errEl.textContent = `⚠️ Closing stock cannot be negative. Sold/return/damage/sample (${sold+retGood+damaged+sample}) > available (${totalAvail}).`;
    return;
  }

  const sku = {
    id: null,
    name, code: document.getElementById('skuCode').value.trim(),
    cat: document.getElementById('skuCategory').value.trim(),
    unit: document.getElementById('skuUnit').value,
    open, loaded, totalAvail, sold, retGood, damaged, sample,
    closing, rate, salesVal: sold * rate,
    creditSales: parseFloat(document.getElementById('skuCreditSales').value) || 0,
    cashSales: parseFloat(document.getElementById('skuCashSales').value) || 0,
    upiSales: parseFloat(document.getElementById('skuUPISales').value) || 0,
    checked: false
  };

  const editId = document.getElementById('editingSkuId').value;
  if (editId) {
    const idx = skuList.findIndex(s => s.id === parseInt(editId));
    if (idx !== -1) {
      sku.id = parseInt(editId);
      sku.checked = skuList[idx].checked;
      skuList[idx] = sku;
      showToast('SKU updated.');
    }
  } else {
    sku.id = nextSKUID++;
    skuList.push(sku);
    showToast('SKU added.');
  }

  clearSKUForm();
  renderSKUTable();
  updateKPIs();
  updateCollection();
  updateCategoryFilter();
}

/* ============================
   CLEAR SKU FORM
============================ */
function clearSKUForm() {
  ['skuName','skuCode','skuCategory'].forEach(id => document.getElementById(id).value = '');
  ['skuOpenStock','skuLoaded','skuSold','skuReturnGood','skuDamaged','skuSample','skuRate','skuCreditSales','skuCashSales','skuUPISales'].forEach(id => document.getElementById(id).value = 0);
  document.getElementById('skuUnit').value = 'PCS';
  document.getElementById('skuTotalAvail').value = '';
  document.getElementById('skuClosingStock').value = '';
  document.getElementById('skuSalesValue').value = '';
  document.getElementById('editingSkuId').value = '';
  document.getElementById('skuAddBtn').textContent = '➕ Add SKU';
  document.getElementById('skuErrorMsg').style.display = 'none';
  document.getElementById('skuClosingStock').classList.remove('error-field');
  // Remove editing highlight from table
  document.querySelectorAll('#skuTbody tr').forEach(r => r.classList.remove('editing'));
}

/* ============================
   EDIT SKU
============================ */
function editSKU(id) {
  const sku = skuList.find(s => s.id === id);
  if (!sku) return;
  document.getElementById('skuName').value = sku.name;
  document.getElementById('skuCode').value = sku.code || '';
  document.getElementById('skuCategory').value = sku.cat || '';
  document.getElementById('skuUnit').value = sku.unit;
  document.getElementById('skuOpenStock').value = sku.open;
  document.getElementById('skuLoaded').value = sku.loaded;
  document.getElementById('skuSold').value = sku.sold;
  document.getElementById('skuReturnGood').value = sku.retGood;
  document.getElementById('skuDamaged').value = sku.damaged;
  document.getElementById('skuSample').value = sku.sample;
  document.getElementById('skuRate').value = sku.rate;
  document.getElementById('skuCreditSales').value = sku.creditSales || 0;
  document.getElementById('skuCashSales').value = sku.cashSales || 0;
  document.getElementById('skuUPISales').value = sku.upiSales || 0;
  document.getElementById('editingSkuId').value = sku.id;
  document.getElementById('skuAddBtn').textContent = '✏️ Update SKU';
  recalcSKUForm();
  document.getElementById('skuBody').scrollIntoView({ behavior: 'smooth' });
  // Highlight row
  document.querySelectorAll('#skuTbody tr').forEach(r => {
    r.classList.toggle('editing', r.dataset.skuid == id);
  });
}

/* ============================
   DELETE SKU
============================ */
function deleteSKU(id) {
  if (!confirm('Delete this SKU?')) return;
  skuList = skuList.filter(s => s.id !== id);
  renderSKUTable();
  updateKPIs();
  updateCollection();
  updateCategoryFilter();
  showToast('SKU deleted.');
}

/* ============================
   COPY SKU
============================ */
function copySKU(id) {
  const sku = skuList.find(s => s.id === id);
  if (!sku) return;
  const copy = Object.assign({}, sku, { id: nextSKUID++, name: sku.name + ' (Copy)', checked: false });
  skuList.push(copy);
  renderSKUTable();
  updateKPIs();
  showToast('SKU row copied.');
}

/* ============================
   TOGGLE CHECK
============================ */
function toggleChecked(id) {
  const sku = skuList.find(s => s.id === id);
  if (sku) sku.checked = !sku.checked;
  renderSKUTable();
}

/* ============================
   RENDER SKU TABLE
============================ */
function renderSKUTable() {
  const search = (document.getElementById('filterSearch').value || '').toLowerCase();
  const catFilter = document.getElementById('filterCategory').value;
  const issueFilter = document.getElementById('filterIssue').value;
  const sortBy = document.getElementById('filterSort').value;

  let filtered = skuList.filter(sku => {
    if (search && !sku.name.toLowerCase().includes(search) && !(sku.code||'').toLowerCase().includes(search)) return false;
    if (catFilter && sku.cat !== catFilter) return false;
    if (issueFilter === 'neg' && sku.closing >= 0) return false;
    if (issueFilter === 'high_return' && sku.retGood < sku.sold * 0.3) return false;
    if (issueFilter === 'damaged' && sku.damaged === 0) return false;
    if (issueFilter === 'zero_sold' && sku.sold !== 0) return false;
    return true;
  });

  filtered.sort((a, b) => {
    if (sortBy === 'sales_desc') return b.salesVal - a.salesVal;
    if (sortBy === 'closing_desc') return b.closing - a.closing;
    if (sortBy === 'return_desc') return b.retGood - a.retGood;
    return a.name.localeCompare(b.name);
  });

  const tbody = document.getElementById('skuTbody');
  if (filtered.length === 0) {
    tbody.innerHTML = `<tr id="skuEmptyRow"><td colspan="13" style="text-align:center;padding:28px;color:var(--ink-muted);">${skuList.length === 0 ? 'No SKUs added yet. Add your first product above.' : 'No SKUs match the current filter.'}</td></tr>`;
    return;
  }

  tbody.innerHTML = filtered.map(sku => {
    const closingClass = sku.closing < 0 ? 'closing-neg' : '';
    return `<tr class="${sku.checked ? 'checked' : ''}" data-skuid="${sku.id}">
      <td>
        <div class="sku-name">${escHtml(sku.name)}</div>
        ${sku.code ? `<div class="sku-code">${escHtml(sku.code)}</div>` : ''}
        ${sku.cat ? `<span class="badge badge-blue">${escHtml(sku.cat)}</span>` : ''}
      </td>
      <td>${escHtml(sku.unit)}</td>
      <td>${sku.open}</td>
      <td>${sku.loaded}</td>
      <td>${sku.totalAvail}</td>
      <td><strong>${sku.sold}</strong></td>
      <td>${sku.retGood}</td>
      <td>${sku.damaged > 0 ? `<span class="badge badge-amber">${sku.damaged}</span>` : 0}</td>
      <td>${sku.sample}</td>
      <td class="${closingClass}">${sku.closing}${sku.closing < 0 ? ' ⚠️' : ''}</td>
      <td>₹${sku.rate}</td>
      <td><strong>₹${fmt(sku.salesVal)}</strong></td>
      <td>
        <div class="row-actions">
          <button class="btn btn-sm btn-secondary" onclick="editSKU(${sku.id})" title="Edit">✏️</button>
          <button class="btn btn-sm btn-red" onclick="deleteSKU(${sku.id})" title="Delete">🗑️</button>
          <button class="btn btn-sm btn-secondary" onclick="copySKU(${sku.id})" title="Copy">📋</button>
          <button class="btn btn-sm ${sku.checked ? 'btn-green' : 'btn-secondary'}" onclick="toggleChecked(${sku.id})" title="Mark checked">✓</button>
        </div>
      </td>
    </tr>`;
  }).join('');
}

/* ============================
   UPDATE CATEGORY FILTER
============================ */
function updateCategoryFilter() {
  const cats = [...new Set(skuList.map(s => s.cat).filter(Boolean))];
  const sel = document.getElementById('filterCategory');
  const current = sel.value;
  sel.innerHTML = '<option value="">All Categories</option>' + cats.map(c => `<option value="${c}"${c===current?' selected':''}>${c}</option>`).join('');
}

/* ============================
   UPDATE KPIs
============================ */
function updateKPIs() {
  const totalSKUs = skuList.length;
  const totalOpen = sum('open');
  const totalLoaded = sum('loaded');
  const totalAvail = sum('totalAvail');
  const totalSold = sum('sold');
  const totalClosing = sum('closing');
  const totalReturn = sum('retGood');
  const totalDamaged = sum('damaged');
  const totalSample = sum('sample');
  const totalSalesVal = sum('salesVal');

  const grid = document.getElementById('kpiGrid');
  grid.innerHTML = [
    { label: 'Total SKUs', value: totalSKUs, cls: '' },
    { label: 'Total Loaded Qty', value: fmt(totalLoaded), cls: '' },
    { label: 'Total Available', value: fmt(totalAvail), cls: '' },
    { label: 'Total Sold Qty', value: fmt(totalSold), cls: 'green' },
    { label: 'Total Closing Stock', value: fmt(totalClosing), cls: totalClosing < 0 ? 'red' : '' },
    { label: 'Total Returns', value: fmt(totalReturn), cls: 'amber' },
    { label: 'Total Damaged', value: fmt(totalDamaged), cls: totalDamaged > 0 ? 'red' : '' },
    { label: 'Free Samples', value: fmt(totalSample), cls: '' },
    { label: 'Total Sales Value', value: '₹' + fmt(totalSalesVal), cls: 'green' },
  ].map(k => `
    <div class="kpi-card">
      <div class="kpi-label">${k.label}</div>
      <div class="kpi-value ${k.cls}">${k.value}</div>
    </div>
  `).join('');
}

/* ============================
   UPDATE COLLECTION
============================ */
function updateCollection() {
  const cash = parseFloat(document.getElementById('colCash').value) || 0;
  const upi = parseFloat(document.getElementById('colUPI').value) || 0;
  const cheque = parseFloat(document.getElementById('colCheque').value) || 0;
  const bank = parseFloat(document.getElementById('colBank').value) || 0;
  const credit = parseFloat(document.getElementById('colCredit').value) || 0;
  const expenses = parseFloat(document.getElementById('colExpenses').value) || 0;

  const totalSalesVal = sum('salesVal');
  const totalCreditSKU = sum('creditSales');
  const effectiveCredit = credit || totalCreditSKU;

  const actualCollection = cash + upi + cheque + bank;
  const expectedCollection = totalSalesVal - effectiveCredit;
  const diff = actualCollection - expectedCollection;
  const cashToDeposit = cash - expenses;

  // Status
  let statusClass = 'status-review', statusIcon = '📊', statusText;
  if (totalSalesVal === 0 && actualCollection === 0) {
    statusText = 'Enter SKU and collection data to see reconciliation status.';
  } else if (Math.abs(diff) < 1) {
    statusClass = 'status-matched'; statusIcon = '✅';
    statusText = 'Collection Matched — Actual collection equals expected sales collection.';
  } else if (diff < 0) {
    statusClass = 'status-short'; statusIcon = '⚠️';
    statusText = `Short by ₹${fmt(Math.abs(diff))} — Actual collection is less than expected.`;
  } else if (diff > 0) {
    statusClass = 'status-excess'; statusIcon = '💡';
    statusText = `Excess of ₹${fmt(Math.abs(diff))} — Actual collection is more than expected. Verify entries.`;
  }

  const card = document.getElementById('reconStatusCard');
  card.className = `status-card ${statusClass}`;
  card.innerHTML = `<span>${statusIcon}</span><span id="reconStatusText">${statusText}</span>`;

  // Collection KPIs
  const cgrid = document.getElementById('collectionKPIGrid');
  cgrid.innerHTML = [
    { label: 'Total Sales Value', value: '₹' + fmt(totalSalesVal), cls: 'green' },
    { label: 'Cash Collected', value: '₹' + fmt(cash), cls: '' },
    { label: 'UPI Collected', value: '₹' + fmt(upi), cls: '' },
    { label: 'Credit Sales', value: '₹' + fmt(effectiveCredit), cls: 'amber' },
    { label: 'Expected Collection', value: '₹' + fmt(expectedCollection), cls: '' },
    { label: 'Actual Collection', value: '₹' + fmt(actualCollection), cls: '' },
    { label: 'Difference', value: (diff >= 0 ? '+' : '') + '₹' + fmt(diff), cls: diff < 0 ? 'red' : diff > 0 ? 'amber' : 'green' },
    { label: 'Cash to Deposit', value: '₹' + fmt(cashToDeposit), cls: '' },
    { label: 'Status', value: diff === 0 && totalSalesVal > 0 ? 'Matched' : diff < 0 ? 'Short' : diff > 0 ? 'Excess' : '—', cls: diff === 0 && totalSalesVal > 0 ? 'green' : diff < 0 ? 'red' : 'amber' },
  ].map(k => `
    <div class="kpi-card">
      <div class="kpi-label">${k.label}</div>
      <div class="kpi-value ${k.cls}" style="font-size:16px;">${k.value}</div>
    </div>
  `).join('');
}

/* ============================
   OUTLET SECTION
============================ */
function toggleOutlet() {
  outletEnabled = !outletEnabled;
  document.getElementById('outletToggle').className = 'toggle-switch' + (outletEnabled ? ' on' : '');
  document.getElementById('outletSection').style.display = outletEnabled ? 'block' : 'none';

  updateOutletKPIs();
}

function addOutlet() {
  const name = document.getElementById('outletName').value.trim();
  if (!name) { showToast('Enter a shop/retailer name.'); return; }
  outletList.push({
    id: nextOutletID++,
    name, area: document.getElementById('outletArea').value.trim(),
    invoice: document.getElementById('outletInvoice').value.trim(),
    sales: parseFloat(document.getElementById('outletSales').value) || 0,
    cash: parseFloat(document.getElementById('outletCash').value) || 0,
    upi: parseFloat(document.getElementById('outletUPI').value) || 0,
    credit: parseFloat(document.getElementById('outletCredit').value) || 0,
    ret: parseFloat(document.getElementById('outletReturn').value) || 0,
    remarks: document.getElementById('outletRemarks').value.trim(),
  });
  renderOutletTable();
  clearOutletForm();
  updateOutletKPIs();
  showToast('Outlet added.');
}

function renderOutletTable() {
  const tbody = document.getElementById('outletTbody');
  const wrapper = document.getElementById('outletTableWrapper');
  if (outletList.length === 0) { wrapper.style.display = 'none'; return; }
  wrapper.style.display = 'block';
  tbody.innerHTML = outletList.map(o => `<tr>
    <td>${escHtml(o.name)}</td><td>${escHtml(o.area)}</td><td>${escHtml(o.invoice)}</td>
    <td>₹${fmt(o.sales)}</td><td>₹${fmt(o.cash)}</td><td>₹${fmt(o.upi)}</td>
    <td>₹${fmt(o.credit)}</td><td>₹${fmt(o.ret)}</td><td>${escHtml(o.remarks)}</td>
    <td><button class="btn btn-sm btn-red" onclick="deleteOutlet(${o.id})">🗑️</button></td>
  </tr>`).join('');
}

function deleteOutlet(id) {
  outletList = outletList.filter(o => o.id !== id);
  renderOutletTable(); updateOutletKPIs();
}

function clearOutletForm() {
  ['outletName','outletArea','outletInvoice','outletRemarks'].forEach(id => document.getElementById(id).value = '');
  ['outletSales','outletCash','outletUPI','outletCredit','outletReturn'].forEach(id => document.getElementById(id).value = 0);
}

function updateOutletKPIs() {
  const card = document.getElementById('outletSummaryCard');
  if (!outletEnabled || outletList.length === 0) { card.style.display = 'none'; return; }
  card.style.display = 'block';
  const totalOutlets = outletList.length;
  const productive = outletList.filter(o => o.sales > 0).length;
  const creditOutlets = outletList.filter(o => o.credit > 0).length;
  const totalSales = outletList.reduce((a,o) => a + o.sales, 0);
  document.getElementById('outletKPIGrid').innerHTML = [
    { label:'Total Outlets', value: totalOutlets },
    { label:'Productive Outlets', value: productive, cls:'green' },
    { label:'Credit Outlets', value: creditOutlets, cls:'amber' },
    { label:'Total Outlet Sales', value:'₹'+fmt(totalSales), cls:'green' },
  ].map(k => `<div class="kpi-card"><div class="kpi-label">${k.label}</div><div class="kpi-value ${k.cls||''}">${k.value}</div></div>`).join('');
}

/* ============================
   DAMAGE SECTION
============================ */
function toggleDamage() {
  damageEnabled = !damageEnabled;
  document.getElementById('damageToggle').className = 'toggle-switch' + (damageEnabled ? ' on' : '');
  document.getElementById('damageSection').style.display = damageEnabled ? 'block' : 'none';
}

function addDamage() {
  const sku = document.getElementById('dmgSKU').value.trim();
  if (!sku) { showToast('Enter SKU/product name.'); return; }
  damageList.push({
    id: nextDamageID++,
    sku, qty: parseFloat(document.getElementById('dmgQty').value) || 0,
    reason: document.getElementById('dmgReason').value,
    value: parseFloat(document.getElementById('dmgValue').value) || 0,
    remarks: document.getElementById('dmgRemarks').value.trim(),
  });
  renderDamageTable(); clearDamageForm();
  showToast('Damage/return entry added.');
}

function renderDamageTable() {
  const tbody = document.getElementById('damageTbody');
  const wrapper = document.getElementById('damageTableWrapper');
  if (damageList.length === 0) { wrapper.style.display = 'none'; return; }
  wrapper.style.display = 'block';
  tbody.innerHTML = damageList.map(d => `<tr>
    <td>${escHtml(d.sku)}</td><td>${d.qty}</td>
    <td><span class="badge badge-amber">${escHtml(d.reason)}</span></td>
    <td>₹${fmt(d.value)}</td><td>${escHtml(d.remarks)}</td>
    <td><button class="btn btn-sm btn-red" onclick="deleteDamage(${d.id})">🗑️</button></td>
  </tr>`).join('');
}

function deleteDamage(id) { damageList = damageList.filter(d => d.id !== id); renderDamageTable(); }

function clearDamageForm() {
  ['dmgSKU','dmgRemarks'].forEach(id => document.getElementById(id).value = '');
  ['dmgQty','dmgValue'].forEach(id => document.getElementById(id).value = 0);
  document.getElementById('dmgReason').value = 'Expired';
}

/* ============================
   EXPORT CSV
============================ */
function exportCSV() {
  if (skuList.length === 0) { showToast('No SKUs to export.'); return; }
  const headers = ['Product Name','SKU Code','Category','Unit','Opening Stock','Loaded Quantity','Total Available','Sold Quantity','Returned Good','Damaged/Expired','Free Sample','Closing Stock','Rate','Sales Value','Credit Sales','Cash Sales','UPI Sales'];
  const rows = skuList.map(s => [
    s.name, s.code, s.cat, s.unit, s.open, s.loaded, s.totalAvail,
    s.sold, s.retGood, s.damaged, s.sample, s.closing,
    s.rate, s.salesVal, s.creditSales, s.cashSales, s.upiSales
  ]);
  const csv = [headers, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g,'""')}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Van-Loading-Sheet-${getDate()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
  showToast('CSV exported!');
  // Score: +10 for exporting
  updateLeadScore(10);
}

/* ============================
   DOWNLOAD SAMPLE CSV
============================ */
function downloadSampleCSV() {
  const csv = `Product Name,SKU Code,Category,Unit,Opening Stock,Loaded Quantity,Sold Quantity,Returned Good,Damaged/Expired,Free Sample,Rate,Credit Sales,Cash Sales,UPI Sales\n"Sample Product","SKU-001","FMCG","Box","10","50","42","5","1","0","500","5000","15000","1000"`;
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'SalesOn-Van-Loading-Sample.csv';
  a.click();
  URL.revokeObjectURL(url);
}

/* ============================
   IMPORT CSV PASTE
============================ */
function toggleImportArea() {
  const el = document.getElementById('importArea');
  el.style.display = el.style.display === 'none' ? 'block' : 'none';
}

function importCSVPaste() {
  const text = document.getElementById('csvPasteInput').value.trim();
  if (!text) { showToast('Paste CSV rows first.'); return; }
  const lines = text.split('\n').filter(l => l.trim());
  let added = 0;
  lines.forEach(line => {
    const cols = line.split(',').map(c => c.replace(/^"|"$/g,'').trim());
    if (cols.length < 8) return;
    const open = parseFloat(cols[4]) || 0;
    const loaded = parseFloat(cols[5]) || 0;
    const sold = parseFloat(cols[6]) || 0;
    const retGood = parseFloat(cols[7]) || 0;
    const damaged = parseFloat(cols[8]) || 0;
    const sample = parseFloat(cols[9]) || 0;
    const rate = parseFloat(cols[10]) || 0;
    const totalAvail = open + loaded;
    const closing = totalAvail - sold - retGood - damaged - sample;
    skuList.push({
      id: nextSKUID++,
      name: cols[0] || 'Imported SKU', code: cols[1] || '', cat: cols[2] || '',
      unit: cols[3] || 'PCS',
      open, loaded, totalAvail, sold, retGood, damaged, sample, closing,
      rate, salesVal: sold * rate,
      creditSales: parseFloat(cols[11]) || 0,
      cashSales: parseFloat(cols[12]) || 0,
      upiSales: parseFloat(cols[13]) || 0,
      checked: false
    });
    added++;
  });
  document.getElementById('csvPasteInput').value = '';
  document.getElementById('importArea').style.display = 'none';
  renderSKUTable(); updateKPIs(); updateCollection(); updateCategoryFilter();
  showToast(`${added} SKU(s) imported.`);
}

/* ============================
   PRINT SHEET
============================ */
function printSheet() {
  // Build print area content
  const biz = document.getElementById('bizName').value || 'Business Name';
  const date = document.getElementById('reportDate').value || getDate();
  const van = document.getElementById('vanNumber').value;
  const vehicle = document.getElementById('vehicleNumber').value;
  const salesman = document.getElementById('salesmanName').value;
  const route = document.getElementById('routeName').value;
  const warehouse = document.getElementById('warehouseName').value;
  const addr = document.getElementById('bizAddress').value;
  const phone = document.getElementById('bizPhone').value;

  document.getElementById('printLogo').textContent = biz;
  document.getElementById('printMeta').innerHTML = `
    <strong>${addr}</strong> | Ph: ${phone}<br>
    Date: ${date} | Van: ${van} | Vehicle: ${vehicle} | Salesman: ${salesman}<br>
    Route/Beat: ${route} | Warehouse: ${warehouse}
  `;

  // SKU table
  const skuRows = skuList.map(s => `<tr>
    <td>${escHtml(s.name)}${s.code ? ' ('+escHtml(s.code)+')' : ''}</td>
    <td>${s.unit}</td><td>${s.open}</td><td>${s.loaded}</td><td>${s.totalAvail}</td>
    <td>${s.sold}</td><td>${s.retGood}</td><td>${s.damaged}</td><td>${s.sample}</td>
    <td>${s.closing}</td><td>₹${s.rate}</td><td>₹${fmt(s.salesVal)}</td>
  </tr>`).join('');

  document.getElementById('printSKUSection').innerHTML = `
    <div class="print-section">
      <h3>Van Loading Sheet</h3>
      <table class="print-table">
        <thead><tr><th>Product</th><th>Unit</th><th>Open</th><th>Loaded</th><th>Avail</th><th>Sold</th><th>Ret.</th><th>Dmg.</th><th>Sample</th><th>Closing</th><th>Rate</th><th>Sales ₹</th></tr></thead>
        <tbody>${skuRows}</tbody>
        <tfoot>
          <tr style="font-weight:700;background:#f5f5f5;">
            <td colspan="5">TOTAL</td>
            <td>${sum('sold')}</td><td>${sum('retGood')}</td><td>${sum('damaged')}</td><td>${sum('sample')}</td>
            <td>${sum('closing')}</td><td></td><td>₹${fmt(sum('salesVal'))}</td>
          </tr>
        </tfoot>
      </table>
    </div>`;

  // Collection
  const cash = parseFloat(document.getElementById('colCash').value) || 0;
  const upi = parseFloat(document.getElementById('colUPI').value) || 0;
  const cheque = parseFloat(document.getElementById('colCheque').value) || 0;
  const bank = parseFloat(document.getElementById('colBank').value) || 0;
  const credit = parseFloat(document.getElementById('colCredit').value) || 0;
  const expenses = parseFloat(document.getElementById('colExpenses').value) || 0;
  const deposited = parseFloat(document.getElementById('colDeposited').value) || 0;
  const remarks = document.getElementById('colRemarks').value;
  const totalSalesVal = sum('salesVal');
  const actualCol = cash + upi + cheque + bank;
  const expectedCol = totalSalesVal - credit;
  const diff = actualCol - expectedCol;

  document.getElementById('printCollectionSection').innerHTML = `
    <div class="print-section">
      <h3>Collection Summary</h3>
      <table class="print-table" style="max-width:400px;">
        <tr><td>Cash Collected</td><td>₹${fmt(cash)}</td></tr>
        <tr><td>UPI Collected</td><td>₹${fmt(upi)}</td></tr>
        <tr><td>Cheque Collected</td><td>₹${fmt(cheque)}</td></tr>
        <tr><td>Bank Transfer</td><td>₹${fmt(bank)}</td></tr>
        <tr><td>Credit Sales</td><td>₹${fmt(credit)}</td></tr>
        <tr><td>Expenses</td><td>₹${fmt(expenses)}</td></tr>
        <tr><td>Cash Deposited</td><td>₹${fmt(deposited)}</td></tr>
        ${remarks ? `<tr><td>Remarks</td><td>${escHtml(remarks)}</td></tr>` : ''}
      </table>
    </div>`;

  document.getElementById('printEODSection').innerHTML = `
    <div class="print-section">
      <h3>EOD Reconciliation</h3>
      <div class="print-kpi-row">
        <div class="print-kpi"><strong>₹${fmt(totalSalesVal)}</strong>Total Sales Value</div>
        <div class="print-kpi"><strong>₹${fmt(expectedCol)}</strong>Expected Collection</div>
        <div class="print-kpi"><strong>₹${fmt(actualCol)}</strong>Actual Collection</div>
        <div class="print-kpi"><strong>${diff >= 0 ? '+' : ''}₹${fmt(diff)}</strong>Difference</div>
        <div class="print-kpi"><strong>${Math.abs(diff) < 1 ? 'MATCHED' : diff < 0 ? 'SHORT' : 'EXCESS'}</strong>Status</div>
      </div>
    </div>`;

  // Outlet
  if (outletEnabled && outletList.length > 0) {
    const outletRows = outletList.map(o => `<tr>
      <td>${escHtml(o.name)}</td><td>${escHtml(o.area)}</td><td>${escHtml(o.invoice)}</td>
      <td>₹${fmt(o.sales)}</td><td>₹${fmt(o.cash)}</td><td>₹${fmt(o.upi)}</td>
      <td>₹${fmt(o.credit)}</td><td>₹${fmt(o.ret)}</td>
    </tr>`).join('');
    document.getElementById('printOutletSection').innerHTML = `
      <div class="print-section">
        <h3>Outlet-wise Sales Summary</h3>
        <table class="print-table">
          <thead><tr><th>Shop</th><th>Area</th><th>Invoice</th><th>Sales</th><th>Cash</th><th>UPI</th><th>Credit</th><th>Return</th></tr></thead>
          <tbody>${outletRows}</tbody>
        </table>
      </div>`;
  } else {
    document.getElementById('printOutletSection').innerHTML = '';
  }

  // Damage
  if (damageEnabled && damageList.length > 0) {
    const dmgRows = damageList.map(d => `<tr>
      <td>${escHtml(d.sku)}</td><td>${d.qty}</td><td>${escHtml(d.reason)}</td><td>₹${fmt(d.value)}</td><td>${escHtml(d.remarks)}</td>
    </tr>`).join('');
    document.getElementById('printDamageSection').innerHTML = `
      <div class="print-section">
        <h3>Damage / Return Summary</h3>
        <table class="print-table">
          <thead><tr><th>SKU</th><th>Qty</th><th>Reason</th><th>Value</th><th>Remarks</th></tr></thead>
          <tbody>${dmgRows}</tbody>
        </table>
      </div>`;
  } else {
    document.getElementById('printDamageSection').innerHTML = '';
  }

  window.print();
  updateLeadScore(10);
}

/* ============================
   SAVE / LOAD SHEET
============================ */
function saveSheet() {
  const data = {
    biz: {
      name: document.getElementById('bizName').value,
      gst: document.getElementById('bizGST').value,
      address: document.getElementById('bizAddress').value,
      phone: document.getElementById('bizPhone').value,
      email: document.getElementById('bizEmail').value,
      date: document.getElementById('reportDate').value,
    },
    van: {
      vanNumber: document.getElementById('vanNumber').value,
      vehicleNumber: document.getElementById('vehicleNumber').value,
      salesmanName: document.getElementById('salesmanName').value,
      helperName: document.getElementById('helperName').value,
      driverName: document.getElementById('driverName').value,
      routeName: document.getElementById('routeName').value,
      areaName: document.getElementById('areaName').value,
      startTime: document.getElementById('startTime').value,
      endTime: document.getElementById('endTime').value,
      warehouseName: document.getElementById('warehouseName').value,
      odometerOpen: document.getElementById('odometerOpen').value,
      odometerClose: document.getElementById('odometerClose').value,
    },
    collection: {
      cash: document.getElementById('colCash').value,
      upi: document.getElementById('colUPI').value,
      cheque: document.getElementById('colCheque').value,
      bank: document.getElementById('colBank').value,
      credit: document.getElementById('colCredit').value,
      expenses: document.getElementById('colExpenses').value,
      deposited: document.getElementById('colDeposited').value,
      remarks: document.getElementById('colRemarks').value,
    },
    skuList, outletList, damageList,
    nextSKUID, nextOutletID, nextDamageID,
    savedAt: new Date().toISOString()
  };
  SalesOnStorage.setItem('saleson_van_loading_sheet_data', JSON.stringify(data));
  // Also save to recent
  const recent = JSON.parse(SalesOnStorage.getItem('saleson_van_loading_recent_sheets') || '[]');
  recent.unshift({ savedAt: data.savedAt, bizName: data.biz.name, vanNumber: data.van.vanNumber, date: data.biz.date });
  SalesOnStorage.setItem('saleson_van_loading_recent_sheets', JSON.stringify(recent.slice(0, 5)));
  showToast('Sheet saved to browser storage!');
}

function loadSheet() {
  const raw = SalesOnStorage.getItem('saleson_van_loading_sheet_data');
  if (!raw) { showToast('No saved sheet found.'); return; }
  if (!confirm('Load saved sheet? This will replace current data.')) return;
  const data = JSON.parse(raw);
  // Restore biz
  Object.keys(data.biz).forEach(k => {
    const el = document.getElementById('biz' + k.charAt(0).toUpperCase() + k.slice(1));
    if (el) el.value = data.biz[k];
  });
  document.getElementById('reportDate').value = data.biz.date;
  // Restore van
  Object.keys(data.van).forEach(k => {
    const el = document.getElementById(k);
    if (el) el.value = data.van[k];
  });
  // Restore collection
  Object.keys(data.collection).forEach(k => {
    const el = document.getElementById('col' + k.charAt(0).toUpperCase() + k.slice(1));
    if (el) el.value = data.collection[k];
  });
  skuList = data.skuList || [];
  outletList = data.outletList || [];
  damageList = data.damageList || [];
  nextSKUID = data.nextSKUID || skuList.length + 1;
  nextOutletID = data.nextOutletID || outletList.length + 1;
  nextDamageID = data.nextDamageID || damageList.length + 1;
  renderSKUTable(); renderOutletTable(); renderDamageTable();
  updateKPIs(); updateCollection(); updateOutletKPIs(); updateCategoryFilter();
  showToast('Sheet loaded!');
}

function resetSheet() {
  if (!confirm('Reset all data? This cannot be undone.')) return;
  skuList = []; outletList = []; damageList = [];
  nextSKUID = 1; nextOutletID = 1; nextDamageID = 1;
  clearSKUForm(); clearOutletForm(); clearDamageForm();
  renderSKUTable(); renderOutletTable(); renderDamageTable();
  updateKPIs(); updateCollection(); updateOutletKPIs(); updateCategoryFilter();
  document.getElementById('outletSummaryCard').style.display = 'none';
  showToast('Sheet reset.');
}

/* ============================
   HANDOFF: DELIVERY CHALLAN
============================ */
function handoffDeliveryChallan() {
  const payload = {
    businessName: document.getElementById('bizName').value,
    vanNumber: document.getElementById('vanNumber').value,
    vehicleNumber: document.getElementById('vehicleNumber').value,
    salesmanName: document.getElementById('salesmanName').value,
    routeName: document.getElementById('routeName').value,
    warehouseName: document.getElementById('warehouseName').value,
    date: document.getElementById('reportDate').value,
    items: skuList.map(s => ({ name: s.name, code: s.code, unit: s.unit, qty: s.loaded, rate: s.rate })),
    selectedAt: new Date().toISOString()
  };
  if (!SalesOnStorage.setItem('saleson_van_loading_to_delivery_challan', JSON.stringify(payload))) { alert('Transfer unavailable because browser storage is blocked or full. Download or print this document instead.'); return; }
  document.getElementById('challanSuccess').style.display = 'block';
  showToast('Van loading data saved for Delivery Challan.');
  updateLeadScore(10);
}

/* ============================
   HANDOFF: STOCK REORDER
============================ */
function handoffReorder() {
  const payload = {
    businessName: document.getElementById('bizName').value,
    vanNumber: document.getElementById('vanNumber').value,
    routeName: document.getElementById('routeName').value,
    items: skuList.map(s => ({ name: s.name, code: s.code, unit: s.unit, closing: s.closing, sold: s.sold })),
    selectedAt: new Date().toISOString(),
    items: skuList.map(item => ({
      productName: item.name,
      skuCode: item.code,
      category: item.cat,
      unit: item.unit,
      currentStock: item.closing,
      averageDailySales: item.sold,
      costPerUnit: item.rate
    }))
  };
  if (!SalesOnStorage.setItem('saleson_van_loading_to_stock_reorder', JSON.stringify(payload))) { alert('Transfer unavailable because browser storage is blocked or full. Download or print this document instead.'); return; }
  document.getElementById('reorderSuccess').style.display = 'block';
  showToast('Van stock data saved for Reorder Calculator.');
}

/* ============================
   HANDOFF: OUTSTANDING TRACKER
============================ */
function handoffOutstanding() {
  const payload = {
    businessName: document.getElementById('bizName').value,
    vanNumber: document.getElementById('vanNumber').value,
    salesmanName: document.getElementById('salesmanName').value,
    routeName: document.getElementById('routeName').value,
    creditSales: parseFloat(document.getElementById('colCredit').value) || 0,
    outlets: outletList.filter(o => o.credit > 0),
    selectedAt: new Date().toISOString(),
    date: document.getElementById("reportDate").value,
  };
  if (!SalesOnStorage.setItem('saleson_van_loading_to_outstanding_tracker', JSON.stringify(payload))) { alert('Transfer unavailable because browser storage is blocked or full. Download or print this document instead.'); return; }
  document.getElementById('outstandingSuccess').style.display = 'block';
  showToast('Credit sales data saved for Outstanding Tracker.');
}

/* ============================
   LEAD MODAL
============================ */
function showLeadModal(callback) { if (typeof callback === "function") callback(); }

function closeLeadModal() {}



function updateLeadScore() {}

/* ============================
   CARD COLLAPSE
============================ */
function toggleCard(btn) {
  const body = btn.closest('.card').querySelector('.collapsible-body');
  if (!body) return;
  body.classList.toggle('collapsed');
  btn.textContent = body.classList.contains('collapsed') ? '▸' : '▾';
}

/* ============================
   FAQ
============================ */
function toggleFAQ(btn) {
  const a = btn.nextElementSibling;
  btn.classList.toggle('open');
  a.classList.toggle('open');
}

/* ============================
   HELPERS
============================ */
function sum(key) { return skuList.reduce((a, s) => a + (parseFloat(s[key]) || 0), 0); }
function fmt(n) { return Number(n).toLocaleString('en-IN', { maximumFractionDigits: 2 }); }
function getDate() { return SalesOnDates.today(); }
function escHtml(str) {
  if (str == null) return '';
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(showToast._timer);
  showToast._timer = setTimeout(() => t.classList.remove('show'), 3000);
}

