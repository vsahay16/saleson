
/* ─────────────────────────
   STATE
───────────────────────── */
let skuPlan       = [];          // array of all added SKUs with computed values
let currentMethod = 'simple';   // calculation method
let editingId     = null;        // id of SKU being edited
let selectedIds   = new Set();  // selected row ids for bulk actions
let logoDataURL   = null;        // uploaded logo
let calcCount     = 0;           // track calculation count
let skuCount      = 0;           // track added SKU count
let pendingAction = null;        // pending action after lead
let usedPO        = false;
let usedCSV       = false;
let criticalCount = 0;

/* ─────────────────────────
   DATE HELPERS
───────────────────────── */
function todayStr() {
  const d = new Date();
  return SalesOnDates.localDate(d);
}
function addDays(n) {
  const d = new Date();
  d.setDate(d.getDate() + Math.round(n));
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}
function fmtDate(str) {
  if (!str) return '—';
  const [y, m, d] = str.split('-');
  return `${d}/${m}/${y}`;
}
function fmtINR(n) {
  if (!n && n !== 0) return '—';
  return '₹' + Number(n.toFixed(0)).toLocaleString('en-IN');
}

/* ─────────────────────────
   METHOD DISPLAY
───────────────────────── */
const methodFormulas = {
  simple:   `<strong>Simple:</strong> Reorder Level = Avg Daily Sales × Lead Time + Safety Stock`,
  safety:   `<strong>Safety Stock:</strong> Safety Stock = (Max Daily Sales × Max Lead Time) − (Avg Daily Sales × Lead Time)<br>Reorder Level = Avg Daily Sales × Lead Time + Safety Stock`,
  maxusage: `<strong>Max Usage:</strong> Reorder Level = Max Daily Sales × Max Lead Time`,
  target:   `<strong>Target Cover:</strong> Target Stock = Avg Daily Sales × Target Cover Days<br>Reorder Qty = Target Stock − Current Stock`,
};

function setMethod(m, el) {
  currentMethod = m;
  document.querySelectorAll('.method-pill').forEach(p => p.classList.remove('active'));
  el.classList.add('active');
  document.getElementById('methodFormula').innerHTML = methodFormulas[m] || '';
  liveCalc();
}

/* ─────────────────────────
   CORE CALCULATION ENGINE
───────────────────────── */
function calcSku(data) {
  const avg     = parseFloat(data.avgDailySales)  || 0;
  const maxD    = parseFloat(data.maxDailySales)   || avg * 1.3;
  const lead    = parseFloat(data.leadTime)        || 0;
  const maxLead = parseFloat(data.maxLeadTime)     || lead * 1.5;
  const cur     = parseFloat(data.currentStock)    || 0;
  const moq     = parseFloat(data.moq)             || 0;
  const pack    = parseFloat(data.packSize)        || 0;
  const cost    = parseFloat(data.costPerUnit)     || 0;
  const sell    = parseFloat(data.sellingPrice)    || 0;
  const target  = parseFloat(data.targetCoverDays) || 30;
  const ssOverride = parseFloat(data.safetyStockOverride);

  const method = data.method || currentMethod;

  // Safety stock
  let safetyStock;
  if (!isNaN(ssOverride) && ssOverride >= 0) {
    safetyStock = ssOverride;
  } else {
    safetyStock = Math.max(0, (maxD * maxLead) - (avg * lead));
  }

  // Reorder level
  let reorderLevel;
  switch (method) {
    case 'maxusage':
      reorderLevel = maxD * maxLead;
      break;
    case 'target':
      reorderLevel = avg * target;
      break;
    case 'safety':
    case 'simple':
    default:
      reorderLevel = (avg * lead) + safetyStock;
  }

  // Days remaining
  const daysRemaining = cur < 0 ? 0 : (avg > 0 ? cur / avg : 9999);
  const stockoutDate  = avg > 0 ? addDays(daysRemaining) : '—';

  // Suggested reorder quantity
  // For 'safety'/'simple'/default: reorderLevel already includes safetyStock (avg*lead + safetyStock),
  // so qty = reorderLevel - cur. For 'maxusage': reorderLevel = maxD*maxLead (no safetyStock inside),
  // so add it once. 'target' is overridden below.
  let suggestedQty = (method === 'maxusage')
    ? Math.max(0, reorderLevel + safetyStock - cur)
    : Math.max(0, reorderLevel - cur);
  // Target cover override
  if (method === 'target') {
    suggestedQty = Math.max(0, (avg * target) - cur);
  }
  // MOQ is a minimum order, while pack size is the ordering increment.
  if (moq > 0 && suggestedQty > 0) suggestedQty = Math.max(suggestedQty, moq);
  // Round to pack size
  if (pack > 0 && suggestedQty > 0) suggestedQty = Math.ceil(suggestedQty / pack) * pack;

  // Risk assessment
  let risk;
  const targetStock = avg * target;
  if (cur < 0) {
    risk = 'Critical';
  } else if (avg === 0) {
    risk = 'Healthy';
  } else if (daysRemaining <= lead) {
    risk = 'Critical';
  } else if (daysRemaining <= lead + 3) {
    risk = 'High Risk';
  } else if (daysRemaining <= lead + 7) {
    risk = 'Medium Risk';
  } else if (target > 0 && cur > targetStock * 1.5) {
    risk = 'Overstock';
  } else {
    risk = 'Healthy';
  }

  const reorderValue = suggestedQty * cost;
  const salesValue   = suggestedQty * sell;

  return { safetyStock, reorderLevel, daysRemaining, stockoutDate, suggestedQty, risk, reorderValue, salesValue, avg, lead, method };
}

/* ─────────────────────────
   LIVE CALCULATION (form changes)
───────────────────────── */
function liveCalc() {
  calcCount++;
  const data = getFormData();
  if (!data.avgDailySales || !data.leadTime) {
    // Show placeholder
    document.getElementById('metricGrid').innerHTML = `<div class="metric-card" style="grid-column:1/-1;text-align:center;color:var(--ink-mute);font-size:13px;padding:24px;">Enter Average Daily Sales and Lead Time to see reorder calculation.</div>`;
    return;
  }
  const r = calcSku(data);
  renderSkuResult(data, r);

  // Lead trigger after 5 calcs

}

function getFormData() {
  return {
    name:             v('skuName'),
    code:             v('skuCode'),
    category:         v('skuCat'),
    supplier:         v('skuSupplier'),
    currentStock:     v('currentStock'),
    avgDailySales:    v('avgDailySales'),
    maxDailySales:    v('maxDailySales'),
    leadTime:         v('leadTime'),
    maxLeadTime:      v('maxLeadTime'),
    safetyStockOverride: v('safetyStockOverride'),
    moq:              v('moq'),
    packSize:         v('packSize'),
    costPerUnit:      v('costPerUnit'),
    sellingPrice:     v('sellingPrice'),
    targetCoverDays:  v('targetCoverDays'),
    method:           currentMethod,
  };
}

/* ─────────────────────────
   RENDER SINGLE SKU RESULT
───────────────────────── */
const riskClasses = { 'Critical':'risk-critical','High Risk':'risk-high','Medium Risk':'risk-medium','Healthy':'risk-healthy','Overstock':'risk-overstock' };
const recClasses  = { 'Critical':'recommend-critical','High Risk':'recommend-high','Medium Risk':'recommend-medium','Healthy':'recommend-healthy','Overstock':'recommend-overstock' };
const recMsgs = {
  'Critical': '🚨 <strong>Reorder immediately.</strong> Your current stock may finish before new stock arrives from the supplier.',
  'High Risk':'⚠️ <strong>Place order soon.</strong> Your stock cover is close to your supplier lead time. Risk of stock-out is high.',
  'Medium Risk':'📊 <strong>Monitor closely.</strong> Plan your purchase this week to avoid running out of stock.',
  'Healthy':  '✅ <strong>Stock level looks healthy.</strong> Monitor and reorder before stock reaches reorder level.',
  'Overstock':'📦 <strong>Possible excess stock.</strong> You may be carrying more stock than needed. Avoid fresh purchase unless demand increases.',
};

function renderSkuResult(data, r) {
  const name = data.name || 'SKU';
  document.getElementById('rcSkuName').textContent = `SKU: ${name}`;

  // Risk badge
  const badge = document.getElementById('rcRiskBadge');
  badge.className = 'risk-badge ' + (riskClasses[r.risk] || 'risk-healthy');
  badge.textContent = r.risk;

  // Metric cards
  const dayClass = r.risk === 'Critical' ? 'danger' : r.risk === 'High Risk' ? 'danger' : r.risk === 'Medium Risk' ? 'warning' : r.risk === 'Overstock' ? '' : 'success';
  const reorderClass = r.suggestedQty > 0 ? 'highlight' : 'success';

  document.getElementById('metricGrid').innerHTML = `
    <div class="metric-card ${dayClass}">
      <div class="metric-label">Days of Stock Left</div>
      <div class="metric-value">${r.daysRemaining >= 9999 ? '∞' : Math.floor(r.daysRemaining)}</div>
      <div class="metric-sub">Stock-out: ${r.stockoutDate}</div>
    </div>
    <div class="metric-card highlight">
      <div class="metric-label">Reorder Level</div>
      <div class="metric-value">${Math.ceil(r.reorderLevel)}</div>
      <div class="metric-sub">units</div>
    </div>
    <div class="metric-card">
      <div class="metric-label">Safety Stock</div>
      <div class="metric-value">${Math.ceil(r.safetyStock)}</div>
      <div class="metric-sub">buffer units</div>
    </div>
    <div class="metric-card ${reorderClass}">
      <div class="metric-label">Suggested Order Qty</div>
      <div class="metric-value">${r.suggestedQty}</div>
      <div class="metric-sub">units to order now</div>
    </div>
    ${r.reorderValue > 0 ? `<div class="metric-card"><div class="metric-label">Est. PO Value</div><div class="metric-value" style="font-size:16px;">${fmtINR(r.reorderValue)}</div><div class="metric-sub">@ cost price</div></div>` : ''}
    ${r.salesValue > 0 ? `<div class="metric-card success"><div class="metric-label">Est. Sales Value</div><div class="metric-value" style="font-size:16px;">${fmtINR(r.salesValue)}</div><div class="metric-sub">@ selling price</div></div>` : ''}
  `;

  // Recommendation
  const recBox = document.getElementById('recommendBox');
  recBox.className = 'recommend-box ' + (recClasses[r.risk] || 'recommend-healthy');
  recBox.innerHTML = recMsgs[r.risk] || '';
  if (r.avg > 0) {
    recBox.innerHTML += `<br><small>At ${r.avg} units/day, stock may last ~${Math.floor(r.daysRemaining)} days. Supplier lead time is ${r.lead} days. Reorder at ${Math.ceil(r.reorderLevel)} units.</small>`;
  }

  // Formula
  const methodLabel = { simple:'Simple', safety:'Safety Stock', maxusage:'Max Usage', target:'Target Cover' };
  document.getElementById('resultFormulaBox').innerHTML = `
    <strong>Method: ${methodLabel[r.method] || r.method}</strong><br>
    ${r.method === 'maxusage'
      ? `Reorder Level = Max Daily Sales × Max Lead Time = <code>${Math.ceil(r.reorderLevel)}</code>`
      : r.method === 'target'
      ? `Target Stock = Avg Daily Sales × ${data.targetCoverDays || 30} days = <code>${Math.ceil(r.reorderLevel)}</code>`
      : `Safety Stock = (Max Daily Sales × Max Lead Time) − (Avg Daily Sales × Lead Time) = <code>${Math.ceil(r.safetyStock)}</code><br>
         Reorder Level = Avg Daily Sales × Lead Time + Safety Stock = <code>${Math.ceil(r.reorderLevel)}</code>`
    }<br>
    Days Remaining = Current Stock ÷ Avg Daily Sales = <code>${r.daysRemaining >= 9999 ? '∞' : Math.floor(r.daysRemaining)} days</code>
  `;

  document.getElementById('skuTimestamp').textContent = 'Calculated: ' + new Date().toLocaleTimeString('en-IN');
}

/* ─────────────────────────
   ADD / EDIT / DELETE SKU
───────────────────────── */
function addSkuToPlan() {
  const data = getFormData();
  if (!data.name) { showToast('Please enter a Product / SKU Name'); return; }
  if (!data.avgDailySales || parseFloat(data.avgDailySales) <= 0) { showToast('Please enter Average Daily Sales'); return; }
  if (!data.leadTime || parseFloat(data.leadTime) <= 0) { showToast('Please enter Lead Time in Days'); return; }

  const r = calcSku(data);
  const sku = { id: Date.now(), ...data, ...r, addedAt: new Date().toLocaleString('en-IN') };
  skuPlan.push(sku);
  skuCount++;

  updateFilterOptions();
  renderTable();
  updateDashboard();
  showToast(`${data.name} added to stock plan ✓`);

  // Lead modal trigger after 5 SKUs

}

function editSku(id) {
  const sku = skuPlan.find(s => s.id === id);
  if (!sku) return;
  editingId = id;

  // Fill form
  sv('skuName',    sku.name);
  sv('skuCode',    sku.code);
  sv('skuCat',     sku.category);
  sv('skuSupplier',sku.supplier);
  sv('currentStock',   sku.currentStock);
  sv('avgDailySales',  sku.avgDailySales);
  sv('maxDailySales',  sku.maxDailySales);
  sv('leadTime',       sku.leadTime);
  sv('maxLeadTime',    sku.maxLeadTime);
  sv('safetyStockOverride', sku.safetyStockOverride);
  sv('moq',         sku.moq);
  sv('packSize',    sku.packSize);
  sv('costPerUnit', sku.costPerUnit);
  sv('sellingPrice',sku.sellingPrice);
  sv('targetCoverDays', sku.targetCoverDays);

  document.getElementById('updateSkuBtn').style.display = '';
  document.getElementById('formPanel').scrollIntoView({ behavior: 'smooth', block: 'start' });
  liveCalc();
  showToast('Edit mode — update fields and click Update SKU');
}

function updateSelectedSku() {
  if (!editingId) return;
  const data = getFormData();
  const r = calcSku(data);
  const idx = skuPlan.findIndex(s => s.id === editingId);
  if (idx >= 0) {
    skuPlan[idx] = { ...skuPlan[idx], ...data, ...r };
  }
  editingId = null;
  document.getElementById('updateSkuBtn').style.display = 'none';
  clearSkuForm();
  renderTable();
  updateDashboard();
  showToast('SKU updated ✓');
}

function deleteSku(id) {
  skuPlan = skuPlan.filter(s => s.id !== id);
  selectedIds.delete(id);
  updateFilterOptions();
  renderTable();
  updateDashboard();
  showToast('SKU removed');
}

function markOrdered(id) {
  const sku = skuPlan.find(s => s.id === id);
  if (sku) {
    sku.ordered = !sku.ordered;
    renderTable();
    showToast(sku.ordered ? 'Marked as ordered ✓' : 'Mark removed');
  }
}

function clearSkuForm() {
  ['skuName','skuCode','skuCat','skuSupplier','currentStock','avgDailySales',
   'maxDailySales','leadTime','maxLeadTime','safetyStockOverride','moq','packSize',
   'costPerUnit','sellingPrice','targetCoverDays'].forEach(id => sv(id, ''));
  editingId = null;
  document.getElementById('updateSkuBtn').style.display = 'none';
  document.getElementById('metricGrid').innerHTML = '';
  document.getElementById('recommendBox').innerHTML = '';
  document.getElementById('resultFormulaBox').innerHTML = '';
  document.getElementById('rcRiskBadge').textContent = '';
  document.getElementById('rcSkuName').textContent = 'SKU Result';
}

/* ─────────────────────────
   RENDER TABLE
───────────────────────── */
function getFilteredSorted() {
  const q    = (document.getElementById('filterSearch')?.value || '').toLowerCase();
  const risk = document.getElementById('filterRisk')?.value || '';
  const cat  = document.getElementById('filterCategory')?.value || '';
  const sup  = document.getElementById('filterSupplier')?.value || '';
  const sort = document.getElementById('sortBy')?.value || 'risk';

  const riskOrder = { 'Critical':0,'High Risk':1,'Medium Risk':2,'Healthy':3,'Overstock':4 };

  let list = skuPlan.filter(s =>
    (!q || s.name?.toLowerCase().includes(q) || s.supplier?.toLowerCase().includes(q) || s.code?.toLowerCase().includes(q)) &&
    (!risk || s.risk === risk) &&
    (!cat  || s.category === cat) &&
    (!sup  || s.supplier === sup)
  );

  list.sort((a, b) => {
    if (sort === 'risk')     return (riskOrder[a.risk] ?? 9) - (riskOrder[b.risk] ?? 9);
    if (sort === 'days')     return (a.daysRemaining || 9999) - (b.daysRemaining || 9999);
    if (sort === 'value')    return (b.reorderValue || 0) - (a.reorderValue || 0);
    if (sort === 'name')     return (a.name || '').localeCompare(b.name || '');
    if (sort === 'supplier') return (a.supplier || '').localeCompare(b.supplier || '');
    return 0;
  });
  return list;
}

function renderTable() {
  const list = getFilteredSorted();
  const tbody = document.getElementById('skuTableBody');
  document.getElementById('tableCount').textContent = `${list.length} of ${skuPlan.length} SKUs`;

  if (list.length === 0) {
    tbody.innerHTML = `<tr><td colspan="13" class="empty-table-msg">${skuPlan.length === 0 ? 'Add SKUs using the form to see reorder recommendations here.' : 'No SKUs match the current filter.'}</td></tr>`;
    updateBulkBar();
    return;
  }

  tbody.innerHTML = list.map(s => {
    const riskCls = (riskClasses[s.risk] || 'risk-healthy');
    const orderedStyle = s.ordered ? 'opacity:.5;text-decoration:line-through;' : '';
    const sel = selectedIds.has(s.id);
    return `
      <tr class="${sel ? 'selected' : ''}" id="row_${s.id}" style="${orderedStyle}">
        <td><input type="checkbox" ${sel ? 'checked' : ''} onchange="toggleSelect(${s.id}, this.checked)" onclick="event.stopPropagation()"></td>
        <td>
          <div class="sku-name-cell" title="${escH(s.name)}">${escH(s.name)}</div>
          <div class="sku-code-cell">${escH(s.code || '')}</div>
        </td>
        <td style="color:var(--ink-soft);font-size:12px;">${escH(s.supplier || '—')}</td>
        <td style="font-weight:700;">${Number(s.currentStock).toLocaleString('en-IN')}</td>
        <td>${Number(s.avgDailySales).toLocaleString('en-IN')}/day</td>
        <td>${s.leadTime}d</td>
        <td>${Math.ceil(s.safetyStock)}</td>
        <td style="font-weight:700;color:var(--brand);">${Math.ceil(s.reorderLevel)}</td>
        <td style="font-weight:800;color:${s.suggestedQty > 0 ? 'var(--red)' : 'var(--green)'};">${s.suggestedQty}</td>
        <td style="font-weight:700;color:${s.daysRemaining <= s.leadTime ? 'var(--red)' : 'var(--ink)'};">${s.daysRemaining >= 9999 ? '∞' : Math.floor(s.daysRemaining)}d</td>
        <td><span class="risk-badge ${riskCls}" style="font-size:10.5px;padding:3px 9px;">${s.risk}</span></td>
        <td style="font-weight:600;">${s.reorderValue > 0 ? fmtINR(s.reorderValue) : '—'}</td>
        <td>
          <div style="display:flex;gap:4px;flex-wrap:nowrap;">
            <button class="btn-sm btn-sm-blue" onclick="editSku(${s.id})" title="Edit">✏️</button>
            <button class="btn-sm btn-sm-green" onclick="createPOForSku(${s.id})" title="Create PO">🛒</button>
            <button class="btn-sm btn-sm-amber" onclick="markOrdered(${s.id})" title="Mark ordered">${s.ordered ? '↩️' : '✅'}</button>
            <button class="btn-sm btn-sm-red" onclick="deleteSku(${s.id})" title="Delete">🗑</button>
          </div>
        </td>
      </tr>`;
  }).join('');

  updateBulkBar();
}

/* ─────────────────────────
   SELECTION (bulk)
───────────────────────── */
function toggleSelect(id, checked) {
  if (checked) selectedIds.add(id); else selectedIds.delete(id);
  const row = document.getElementById('row_' + id);
  if (row) row.classList.toggle('selected', checked);
  updateBulkBar();
}

function toggleSelectAll(cb) {
  const list = getFilteredSorted();
  if (cb.checked) { list.forEach(s => selectedIds.add(s.id)); }
  else { list.forEach(s => selectedIds.delete(s.id)); }
  renderTable();
}

function clearSelection() {
  selectedIds.clear();
  document.getElementById('selectAll').checked = false;
  renderTable();
}

function updateBulkBar() {
  const bar = document.getElementById('bulkActionsBar');
  if (selectedIds.size > 0) {
    bar.style.display = 'flex';
    document.getElementById('selectedCountLabel').textContent = `${selectedIds.size} SKU${selectedIds.size > 1 ? 's' : ''} selected`;
  } else {
    bar.style.display = 'none';
  }
}

/* ─────────────────────────
   DASHBOARD KPIs
───────────────────────── */
function updateDashboard() {
  if (!skuPlan.length) {
    ['kpiTotal','kpiNeedReorder','kpiCritical','kpiHighRisk','kpiOverstock','kpiHealthy'].forEach(id => { document.getElementById(id).textContent = '0'; });
    document.getElementById('kpiReorderValue').textContent = '₹0';
    document.getElementById('kpiTopSupplier').textContent  = '—';
    return;
  }
  const total       = skuPlan.length;
  const needReorder = skuPlan.filter(s => s.suggestedQty > 0).length;
  const critical    = skuPlan.filter(s => s.risk === 'Critical').length;
  const highRisk    = skuPlan.filter(s => s.risk === 'High Risk').length;
  const overstock   = skuPlan.filter(s => s.risk === 'Overstock').length;
  const healthy     = skuPlan.filter(s => s.risk === 'Healthy').length;
  const totalValue  = skuPlan.reduce((a, s) => a + (s.reorderValue || 0), 0);
  criticalCount     = critical;

  // Top supplier by reorder value
  const supplierMap = {};
  skuPlan.forEach(s => { if (s.supplier) supplierMap[s.supplier] = (supplierMap[s.supplier] || 0) + (s.reorderValue || 0); });
  const topSup = Object.entries(supplierMap).sort((a, b) => b[1] - a[1])[0];

  document.getElementById('kpiTotal').textContent       = total;
  document.getElementById('kpiNeedReorder').textContent = needReorder;
  document.getElementById('kpiCritical').textContent    = critical;
  document.getElementById('kpiHighRisk').textContent    = highRisk;
  document.getElementById('kpiOverstock').textContent   = overstock;
  document.getElementById('kpiHealthy').textContent     = healthy;
  document.getElementById('kpiReorderValue').textContent= fmtINR(totalValue);
  document.getElementById('kpiTopSupplier').textContent = topSup ? topSup[0] : '—';
}

/* ─────────────────────────
   FILTER DROPDOWN OPTIONS
───────────────────────── */
function updateFilterOptions() {
  const cats = [...new Set(skuPlan.map(s => s.category).filter(Boolean))];
  const sups = [...new Set(skuPlan.map(s => s.supplier).filter(Boolean))];

  const catSel = document.getElementById('filterCategory');
  const supSel = document.getElementById('filterSupplier');
  const catVal = catSel.value, supVal = supSel.value;

  catSel.innerHTML = `<option value="">All Categories</option>` + cats.map(c => `<option value="${escH(c)}" ${c===catVal?'selected':''}>${escH(c)}</option>`).join('');
  supSel.innerHTML = `<option value="">All Suppliers</option>` + sups.map(s => `<option value="${escH(s)}" ${s===supVal?'selected':''}>${escH(s)}</option>`).join('');
}

function setSortBy(val) {
  document.getElementById('sortBy').value = val;
  renderTable();
}

/* ─────────────────────────
   PURCHASE ORDER HANDOFF
───────────────────────── */
function createPOForSku(id) {
  pendingAction = 'po_id_' + id;
  triggerAction('po_single_id', id);
}

function doCreatePOForSku(id) {
  const sku = skuPlan.find(s => s.id === id);
  if (!sku) return;
  const payload = {
    productName: sku.name, skuCode: sku.code, category: sku.category,
    supplierName: sku.supplier, currentStock: sku.currentStock,
    averageDailySales: sku.avgDailySales, leadTime: sku.leadTime,
    safetyStock: Math.ceil(sku.safetyStock), reorderLevel: Math.ceil(sku.reorderLevel),
    suggestedReorderQuantity: sku.suggestedQty,
    estimatedReorderValue: sku.reorderValue, risk: sku.risk,
    selectedAt: new Date().toISOString(),
    costPerUnit: sku.costPerUnit,
    packSize: sku.packSize,
  };
  if (!SalesOnStorage.setItem('saleson_reorder_to_purchase_order', JSON.stringify(payload))) { alert('Transfer unavailable because browser storage is blocked or full. Download or print this document instead.'); return; }
  usedPO = true;
  document.getElementById('poBanner').classList.add('show');
  showToast('PO data saved ✓ Open Purchase Order Generator');
  document.getElementById('poBanner').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function bulkCreatePO() {
  if (!selectedIds.size) { showToast('Select at least one SKU first'); return; }
  pendingAction = 'bulk_po';

  executeBulkPO();
}

function executeBulkPO() {
  const selected = skuPlan.filter(s => selectedIds.has(s.id));
  const payload = selected.map(s => ({
    productName: s.name, skuCode: s.code, category: s.category,
    supplierName: s.supplier, currentStock: s.currentStock,
    averageDailySales: s.avgDailySales, leadTime: s.leadTime,
    safetyStock: Math.ceil(s.safetyStock), reorderLevel: Math.ceil(s.reorderLevel),
    suggestedReorderQuantity: s.suggestedQty,
    estimatedReorderValue: s.reorderValue, risk: s.risk,
    selectedAt: new Date().toISOString(),
    costPerUnit: s.costPerUnit,
    packSize: s.packSize,
  }));
  if (!SalesOnStorage.setItem('saleson_bulk_reorder_to_purchase_order', JSON.stringify(payload))) { alert('Transfer unavailable because browser storage is blocked or full. Download or print this document instead.'); return; }
  usedPO = true;
  document.getElementById('poBanner').classList.add('show');
  clearSelection();
  showToast(`${payload.length} SKUs saved for PO ✓`);
  document.getElementById('poBanner').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/* ─────────────────────────
   CSV EXPORT
───────────────────────── */
function exportCSV() {
  if (!skuPlan.length) { showToast('Add SKUs to export'); return; }
  const headers = ['SKU Name','SKU Code','Category','Supplier','Current Stock','Avg Daily Sales','Lead Time (Days)','Safety Stock','Reorder Level','Suggested Reorder Qty','Days Remaining','Stock-out Date','Risk','Est. Reorder Value (₹)'];
  const rows = getFilteredSorted().map(s => [
    s.name, s.code, s.category, s.supplier,
    s.currentStock, s.avgDailySales, s.leadTime,
    Math.ceil(s.safetyStock), Math.ceil(s.reorderLevel), s.suggestedQty,
    s.daysRemaining >= 9999 ? '∞' : Math.floor(s.daysRemaining),
    s.stockoutDate, s.risk,
    s.reorderValue > 0 ? s.reorderValue.toFixed(0) : '',
  ].map(c => `"${String(c || '').replace(/"/g, '""')}"`));

  const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url;
  a.download = `stock-reorder-plan-${SalesOnDates.today()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
  usedCSV = true;
  showToast('CSV exported ✓');
}

function downloadSampleCSV() {
  const sample = `SKU Name,SKU Code,Category,Supplier,Current Stock,Avg Daily Sales,Max Daily Sales,Lead Time,Max Lead Time,Safety Stock Override,MOQ,Pack Size,Cost Per Unit,Selling Price,Target Cover Days
FMCG Product Box,FMCG-001,FMCG,Mohan Suppliers,120,25,40,5,8,50,50,12,450,500,15
Detergent Pack,FMCG-002,Household,Clean India,35,12,20,7,10,30,,,80,100,20`;
  const blob = new Blob([sample], { type: 'text/csv' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a'); a.href = url;
  a.download = 'stock-reorder-sample.csv'; a.click();
  URL.revokeObjectURL(url);
}

/* ─────────────────────────
   CSV IMPORT
───────────────────────── */
function toggleCsvImport() {
  const area = document.getElementById('csvImportArea');
  area.classList.toggle('open');
}

function importCSV() {
  const text = document.getElementById('csvPasteArea').value.trim();
  if (!text) { showToast('Paste CSV rows first'); return; }
  const lines = text.split('\n').filter(l => l.trim());
  let added = 0;
  lines.forEach(line => {
    const cols = line.split(',').map(c => c.trim().replace(/^"|"$/g, ''));
    if (cols.length < 4) return;
    const data = {
      name: cols[0], code: cols[1], category: cols[2], supplier: cols[3],
      currentStock: cols[4], avgDailySales: cols[5], maxDailySales: cols[6],
      leadTime: cols[7], maxLeadTime: cols[8], safetyStockOverride: cols[9],
      moq: cols[10], packSize: cols[11], costPerUnit: cols[12],
      sellingPrice: cols[13], targetCoverDays: cols[14], method: currentMethod,
    };
    if (!data.name || !parseFloat(data.avgDailySales) || !parseFloat(data.leadTime)) return;
    const r = calcSku(data);
    skuPlan.push({ id: Date.now() + added, ...data, ...r });
    added++;
  });
  if (added) {
    updateFilterOptions(); renderTable(); updateDashboard();
    showToast(`${added} SKUs imported ✓`);
    document.getElementById('csvPasteArea').value = '';
    toggleCsvImport();
  } else {
    showToast('No valid rows found. Check format.');
  }
}

/* ─────────────────────────
   PRINT REPORT
───────────────────────── */
function printReport() {
  // Build print area
  document.getElementById('printBizName').textContent = v('bizName') || 'Stock Reorder Report';
  document.getElementById('printBizMeta').textContent = [v('bizType'), v('bizCity')].filter(Boolean).join(' · ');
  document.getElementById('printDate').textContent = 'Report Date: ' + fmtDate(v('reportDate') || todayStr());

  const logo = document.getElementById('printLogo');
  if (logoDataURL) { logo.src = logoDataURL; logo.style.display = 'block'; }

  // KPIs
  const critical = skuPlan.filter(s => s.risk === 'Critical').length;
  const totalVal = skuPlan.reduce((a, s) => a + (s.reorderValue || 0), 0);
  document.getElementById('printKpis').innerHTML = `
    <div style="background:#f7f9fc;border:1px solid #e2e8f0;border-radius:8px;padding:10px 14px;"><div style="font-size:10px;font-weight:700;color:#7a8898;text-transform:uppercase;">Total SKUs</div><div style="font-size:20px;font-weight:800;color:#1a56db;">${skuPlan.length}</div></div>
    <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:8px;padding:10px 14px;"><div style="font-size:10px;font-weight:700;color:#7a8898;text-transform:uppercase;">Critical SKUs</div><div style="font-size:20px;font-weight:800;color:#991b1b;">${critical}</div></div>
    <div style="background:#fff7ed;border:1px solid #fde68a;border-radius:8px;padding:10px 14px;"><div style="font-size:10px;font-weight:700;color:#7a8898;text-transform:uppercase;">Need Reorder</div><div style="font-size:20px;font-weight:800;color:#d97706;">${skuPlan.filter(s=>s.suggestedQty>0).length}</div></div>
    <div style="background:#d1fae5;border:1px solid #a7f3d0;border-radius:8px;padding:10px 14px;"><div style="font-size:10px;font-weight:700;color:#7a8898;text-transform:uppercase;">Est. Reorder Value</div><div style="font-size:18px;font-weight:800;color:#059669;">${fmtINR(totalVal)}</div></div>
  `;

  // Table
  const head = document.getElementById('printTableHead');
  head.innerHTML = ['SKU','Code','Supplier','Stock','Avg/Day','Lead','Safety','Reorder Lvl','Order Qty','Days Left','Risk','PO Value'].map(h=>`<th style="padding:7px 8px;text-align:left;font-size:10px;">${h}</th>`).join('');

  const list = getFilteredSorted();
  document.getElementById('printTableBody').innerHTML = list.map((s, i) => `
    <tr style="background:${i%2===0?'#f7f9fc':'white'};">
      <td style="padding:6px 8px;font-size:10.5px;font-weight:600;">${escH(s.name)}</td>
      <td style="padding:6px 8px;font-size:10px;color:#7a8898;">${escH(s.code||'')}</td>
      <td style="padding:6px 8px;font-size:10.5px;">${escH(s.supplier||'')}</td>
      <td style="padding:6px 8px;font-size:10.5px;">${s.currentStock}</td>
      <td style="padding:6px 8px;font-size:10.5px;">${s.avgDailySales}</td>
      <td style="padding:6px 8px;font-size:10.5px;">${s.leadTime}d</td>
      <td style="padding:6px 8px;font-size:10.5px;">${Math.ceil(s.safetyStock)}</td>
      <td style="padding:6px 8px;font-size:10.5px;font-weight:700;color:#1a56db;">${Math.ceil(s.reorderLevel)}</td>
      <td style="padding:6px 8px;font-size:10.5px;font-weight:800;color:${s.suggestedQty>0?'#dc2626':'#059669'};">${s.suggestedQty}</td>
      <td style="padding:6px 8px;font-size:10.5px;font-weight:700;color:${s.daysRemaining<=s.leadTime?'#dc2626':'#0f1623'};">${s.daysRemaining>=9999?'∞':Math.floor(s.daysRemaining)}d</td>
      <td style="padding:6px 8px;font-size:10px;">${s.risk}</td>
      <td style="padding:6px 8px;font-size:10.5px;font-weight:600;">${s.reorderValue>0?fmtINR(s.reorderValue):'—'}</td>
    </tr>`).join('');

  document.getElementById('printArea').style.display = 'block';
  usedCSV = true;
  setTimeout(() => {
    window.print();
    setTimeout(() => { document.getElementById('printArea').style.display = 'none'; }, 1500);
  }, 100);
}

/* ─────────────────────────
   SAVE / LOAD PLAN
───────────────────────── */
function savePlan() {
  const plan = {
    bizName: v('bizName'), bizType: v('bizType'), bizCity: v('bizCity'),
    reportDate: v('reportDate'), logoDataURL, skuPlan,
    savedAt: new Date().toISOString(),
  };
  SalesOnStorage.setItem('saleson_stock_reorder_plan_data', JSON.stringify(plan));
  showToast('Stock plan saved ✓');
}

function loadPlan() {
  const raw = SalesOnStorage.getItem('saleson_stock_reorder_plan_data');
  if (!raw) { showToast('No saved plan found'); return; }
  const plan = JSON.parse(raw);
  sv('bizName',   plan.bizName   || '');
  sv('bizType',   plan.bizType   || '');
  sv('bizCity',   plan.bizCity   || '');
  sv('reportDate',plan.reportDate|| '');
  if (plan.logoDataURL) {
    logoDataURL = plan.logoDataURL;
    const img = document.getElementById('logoPreview'); img.src = logoDataURL; img.style.display = 'block';
  }
  skuPlan = plan.skuPlan || [];
  updateFilterOptions(); renderTable(); updateDashboard();
  showToast('Stock plan loaded ✓');
}

function resetAll() {
  if (!confirm('Reset all SKUs and form data?')) return;
  skuPlan = []; selectedIds.clear(); editingId = null;
  clearSkuForm();
  sv('bizName',''); sv('bizCity',''); sv('reportDate','');
  document.getElementById('logoPreview').style.display = 'none'; logoDataURL = null;
  document.getElementById('poBanner').classList.remove('show');
  updateFilterOptions(); renderTable(); updateDashboard();
  loadSampleData();
  applyVanReorderHandoff();
  showToast('Reset complete ✓');
}



/* ─────────────────────────
   SAMPLE DATA
───────────────────────── */
function loadSampleData() {
  sv('bizName',  'Shree Balaji Distributors');
  sv('bizType',  'Distributor');
  sv('bizCity',  'Patna, Bihar');
  sv('reportDate', todayStr());

  const samples = [
    { name:'FMCG Product Box', code:'FMCG-001', category:'FMCG', supplier:'Mohan FMCG Suppliers', currentStock:'120', avgDailySales:'25', maxDailySales:'40', leadTime:'5', maxLeadTime:'8', safetyStockOverride:'50', moq:'50', packSize:'12', costPerUnit:'450', sellingPrice:'500', targetCoverDays:'15' },
    { name:'Detergent Pack', code:'FMCG-002', category:'Household', supplier:'Clean India Suppliers', currentStock:'35', avgDailySales:'12', maxDailySales:'20', leadTime:'7', maxLeadTime:'10', safetyStockOverride:'30', moq:'', packSize:'', costPerUnit:'80', sellingPrice:'100', targetCoverDays:'20' },
    { name:'Tea Packet', code:'FMCG-003', category:'Beverages', supplier:'Assam Tea Agency', currentStock:'600', avgDailySales:'20', maxDailySales:'30', leadTime:'5', maxLeadTime:'7', safetyStockOverride:'50', moq:'', packSize:'', costPerUnit:'90', sellingPrice:'120', targetCoverDays:'15' },
  ];

  samples.forEach(d => {
    const r = calcSku({ ...d, method: currentMethod });
    skuPlan.push({ id: Date.now() + Math.random(), ...d, ...r });
  });

  // Pre-fill form with first sample
  Object.keys(samples[0]).forEach(k => {
    const map = { name:'skuName', code:'skuCode', category:'skuCat', supplier:'skuSupplier', currentStock:'currentStock', avgDailySales:'avgDailySales', maxDailySales:'maxDailySales', leadTime:'leadTime', maxLeadTime:'maxLeadTime', safetyStockOverride:'safetyStockOverride', moq:'moq', packSize:'packSize', costPerUnit:'costPerUnit', sellingPrice:'sellingPrice', targetCoverDays:'targetCoverDays' };
    if (map[k]) sv(map[k], samples[0][k]);
  });

  updateFilterOptions(); renderTable(); updateDashboard(); liveCalc();
}

function applyVanReorderHandoff() {
  const key = "saleson_van_loading_to_stock_reorder";
  const data = SalesOnHandoff.take(key);

  if (!data || !Array.isArray(data.items)) return;

  const leadTime = Number(
    window.prompt(
      "Enter supplier lead time in days for the imported van SKUs:",
      "7"
    )
  );

  if (!Number.isFinite(leadTime) || leadTime <= 0) {
    // Keep the payload available for the next attempt.
    SalesOnHandoff.put(key, data);
    showToast("Import paused because lead time is required.");
    return;
  }

  skuPlan = [];
  selectedIds.clear();

  SalesOnHandoff.set("bizName", data.businessName);

  data.items.forEach((item, index) => {
    const skuData = {
      name: item.productName || item.name,
      code: item.skuCode || item.code,
      category: item.category || item.cat || "",
      supplier: "",
      currentStock:
        item.currentStock ?? item.closing ?? 0,
      avgDailySales:
        item.averageDailySales ?? item.sold ?? 0,
      maxDailySales:
        item.averageDailySales ?? item.sold ?? 0,
      leadTime: String(leadTime),
      maxLeadTime: String(leadTime),
      safetyStockOverride: "",
      moq: "",
      packSize: "",
      costPerUnit: item.costPerUnit ?? item.rate ?? 0,
      sellingPrice: item.costPerUnit ?? item.rate ?? 0,
      targetCoverDays: "30",
      method: currentMethod
    };

    const calculated = calcSku(skuData);

    skuPlan.push({
      id: Date.now() + index,
      ...skuData,
      ...calculated,
      addedAt: new Date().toLocaleString("en-IN")
    });
  });

  updateFilterOptions();
  renderTable();
  updateDashboard();
  showToast(`${skuPlan.length} van SKU(s) imported.`);
}


/* ─────────────────────────
   LOGO UPLOAD
───────────────────────── */
function handleLogoUpload(input) {
  const file = input.files[0]; if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    logoDataURL = e.target.result;
    const img = document.getElementById('logoPreview'); img.src = logoDataURL; img.style.display = 'block';
  };
  reader.readAsDataURL(file);
}

/* ─────────────────────────
   ACTION TRIGGER
───────────────────────── */
function triggerAction(action, payload) {  executeAction(action, payload); }

function executeAction(action, payload) {
  if (action === 'csv')     exportCSV();
  if (action === 'print')   printReport();
  if (action === 'save')    savePlan();
  if (action === 'po_single') {
    const data = getFormData();
    const r = calcSku(data);
    const tempSku = { id: 0, ...data, ...r };
    // Store immediately
    const p = { productName:data.name, skuCode:data.code, category:data.category, supplierName:data.supplier, currentStock:data.currentStock, averageDailySales:data.avgDailySales, leadTime:data.leadTime, safetyStock:Math.ceil(r.safetyStock), reorderLevel:Math.ceil(r.reorderLevel), suggestedReorderQuantity:r.suggestedQty, estimatedReorderValue:r.reorderValue, risk:r.risk, selectedAt:new Date().toISOString() };
    if (!SalesOnStorage.setItem('saleson_reorder_to_purchase_order', JSON.stringify(p))) { alert('Transfer unavailable because browser storage is blocked or full. Download or print this document instead.'); return; }
    usedPO = true;
    document.getElementById('poBanner').classList.add('show');
    showToast('PO data saved ✓');
    document.getElementById('poBanner').scrollIntoView({ behavior:'smooth', block:'start' });
  }
  if (action && action.startsWith('po_single_id')) {
    const id = Number(payload ?? action.split('_').pop());
    doCreatePOForSku(id);
  }
  if (action === 'bulk_po') executeBulkPO();
}

/* ─────────────────────────
   LEAD MODAL
───────────────────────── */
function showLeadModal(callback) { if (typeof callback === "function") callback(); }



function skipLead() {}

/* ─────────────────────────
   COLLAPSIBLE SECTIONS
───────────────────────── */
function toggleSec(btn) {
  const body = btn.nextElementSibling;
  const isOpen = btn.classList.contains('open');
  btn.classList.toggle('open', !isOpen);
  body.classList.toggle('open', !isOpen);
}

/* ─────────────────────────
   FAQ
───────────────────────── */
function toggleFaq(btn) {
  const a = btn.nextElementSibling;
  const isOpen = btn.classList.contains('open');
  document.querySelectorAll('.faq-q').forEach(b => { b.classList.remove('open'); b.nextElementSibling.classList.remove('open'); });
  if (!isOpen) { btn.classList.add('open'); a.classList.add('open'); }
}

/* ─────────────────────────
   TOAST
───────────────────────── */
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg; t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2800);
}

/* ─────────────────────────
   HELPERS
───────────────────────── */
function v(id)       { const el = document.getElementById(id); return el ? el.value.trim() : ''; }
function sv(id, val) { const el = document.getElementById(id); if (el) el.value = val; }
function escH(str)   { return String(str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

/* ─────────────────────────
   INIT
───────────────────────── */
document.getElementById('methodFormula').innerHTML = methodFormulas.simple;
document.getElementById('reportDate').value = todayStr();
loadSampleData();
applyVanReorderHandoff();

