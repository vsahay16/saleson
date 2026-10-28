
/* ════════════════════════════════════════════════════════
   SalesOn Delivery Challan Generator
   Vanilla JS — no backend, no frameworks.
   Draft + leads are stored in localStorage and console.log'd
   so this can later be wired to Supabase / WordPress API / Sheets / CRM.
   ════════════════════════════════════════════════════════ */

/* ── tiny helpers ── */
function v(id) { const el = document.getElementById(id); return el ? el.value : ''; }
function sv(id, val) { const el = document.getElementById(id); if (el) el.value = val; }
function escapeHTML(str) {
  return String(str === undefined || str === null ? '' : str)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/* ── Indian GST state codes (used to auto-fill State Code) ── */
const STATE_LIST = [
  ['01','Jammu and Kashmir'],['02','Himachal Pradesh'],['03','Punjab'],['04','Chandigarh'],
  ['05','Uttarakhand'],['06','Haryana'],['07','Delhi'],['08','Rajasthan'],['09','Uttar Pradesh'],
  ['10','Bihar'],['11','Sikkim'],['12','Arunachal Pradesh'],['13','Nagaland'],['14','Manipur'],
  ['15','Mizoram'],['16','Tripura'],['17','Meghalaya'],['18','Assam'],['19','West Bengal'],
  ['20','Jharkhand'],['21','Odisha'],['22','Chhattisgarh'],['23','Madhya Pradesh'],['24','Gujarat'],
  ['26','Dadra and Nagar Haveli and Daman and Diu'],['27','Maharashtra'],['29','Karnataka'],
  ['30','Goa'],['31','Lakshadweep'],['32','Kerala'],['33','Tamil Nadu'],['34','Puducherry'],
  ['35','Andaman and Nicobar Islands'],['36','Telangana'],['37','Andhra Pradesh'],['38','Ladakh'],
  ['97','Other Territory']
];
const STATE_CODE_BY_NAME = {};
STATE_LIST.forEach(([code, name]) => { STATE_CODE_BY_NAME[name] = code; });

function populateStateSelects() {
  const optionsHTML = '<option value="">Select State</option>' +
    STATE_LIST.map(([code, name]) => `<option value="${name}">${name}</option>`).join('');
  document.getElementById('consignorState').innerHTML = optionsHTML;
  document.getElementById('consigneeState').innerHTML = optionsHTML;
}

function onStateChange(which) {
  const stateVal = v(which + 'State');
  const code = STATE_CODE_BY_NAME[stateVal];
  if (code) sv(which + 'StateCode', code);
  renderPreview();
}

/* ── app state ── */
let currentTemplate = 'classic';
let currentAccent = '#1a56db';
let logoDataURL = null;
let sigDataURL = null;
let pendingAction = null;
let convertedToInvoice = false;
let itemRowCount = 0;

/* ── default / sample data so the preview is never empty ── */
function initDefaults() {
  populateStateSelects();

  const today = new Date();
  const todayStr = today.getFullYear() + '-' + String(today.getMonth() + 1).padStart(2, '0') + '-' + String(today.getDate()).padStart(2, '0');
  const challanNo = 'DC-' + today.getFullYear() + String(today.getMonth() + 1).padStart(2, '0') + String(today.getDate()).padStart(2, '0') + '-001';

  sv('consignorName', 'Shree Balaji Distributors');
  sv('consignorGSTIN', '10ABCDE1234F1Z5');
  sv('consignorAddress', 'MG Road, Fraser Road, Patna');
  sv('consignorState', 'Bihar');
  sv('consignorStateCode', '10');
  sv('consignorPhone', '+91-9876543210');
  sv('consignorEmail', 'dispatch@example.com');

  sv('consigneeName', 'Mohan Retail Store');
  sv('consigneeCompany', 'Mohan Enterprises');
  sv('consigneeAddress', 'Boring Road, Patna, Bihar - 800001');
  sv('consigneeState', 'Bihar');
  sv('consigneeStateCode', '10');
  sv('consigneeGSTIN', '10AAACM1234B1Z6');
  sv('consigneePhone', '+91-9800000001');

  sv('challanNumber', challanNo);
  sv('challanDate', todayStr);
  sv('reasonTransport', 'Stock Transfer');
  sv('placeOfSupply', 'Bihar');
  sv('dispatchFrom', 'Patna, Bihar');
  sv('shipTo', 'Boring Road, Patna, Bihar');
  sv('salespersonName', 'Suresh Kumar');
  sv('beatRouteName', 'Boring Road Beat');

  sv('transporterName', 'Kumar Roadways');
  sv('vehicleNumber', 'BR01AB1234');
  sv('modeOfTransport', 'Road');
  sv('ewayBillNumber', '381005123456');
  sv('approxDistance', '18');
  sv('dispatchDate', todayStr);
  sv('expectedDeliveryDate', todayStr);

  sv('signatoryName', 'Authorized Signatory');

  document.getElementById('itemsBody').innerHTML = '';
  itemRowCount = 0;
  addItemRow({ desc: 'FMCG Product Box', hsn: '3401', qty: 10, unit: 'Box', rate: 500, gst: 18 });

  renderPreview();
}

/* ── items table (form side) ── */
function addItemRow(defaults) {
  itemRowCount++;
  const id = 'drow_' + itemRowCount;
  const d = defaults || {};
  const tbody = document.getElementById('itemsBody');
  const tr = document.createElement('tr');
  tr.id = id;
  tr.innerHTML =
    '<td><input type="text" value="' + escapeHTML(d.desc || '') + '" placeholder="Product / Goods" oninput="recalcRow(\'' + id + '\')"></td>' +
    '<td><input type="text" value="' + escapeHTML(d.hsn || '') + '" placeholder="3401" oninput="recalcRow(\'' + id + '\')"></td>' +
    '<td><input type="number" value="' + (d.qty !== undefined ? d.qty : 1) + '" min="0" step="any" oninput="recalcRow(\'' + id + '\')"></td>' +
    '<td><input type="text" value="' + escapeHTML(d.unit || 'Nos') + '" placeholder="Box" oninput="recalcRow(\'' + id + '\')"></td>' +
    '<td><input type="number" value="' + (d.rate !== undefined ? d.rate : 0) + '" min="0" step="any" oninput="recalcRow(\'' + id + '\')"></td>' +
    '<td><select oninput="recalcRow(\'' + id + '\')">' +
      [0,3,5,12,18,28].map(g => '<option value="' + g + '"' + (Number(d.gst) === g ? ' selected' : '') + '>' + g + '%</option>').join('') +
    '</select></td>' +
    '<td class="computed" id="' + id + '_taxable">—</td>' +
    '<td class="computed" id="' + id + '_gstamt">—</td>' +
    '<td class="computed" id="' + id + '_total">—</td>' +
    '<td><button class="btn-remove-row" onclick="removeItemRow(\'' + id + '\')" title="Remove row">✕</button></td>';
  tbody.appendChild(tr);
  recalcRow(id);
}

function removeItemRow(id) {
  const row = document.getElementById(id);
  if (!row) return;
  row.remove();
  renderPreview();
}

function recalcRow(id) {
  const row = document.getElementById(id);
  if (!row) return;
  const inp = row.querySelectorAll('input, select');
  const qty = parseFloat(inp[2].value) || 0;
  const rate = parseFloat(inp[4].value) || 0;
  const gstPct = parseFloat(inp[5].value) || 0;
  const taxable = qty * rate;
  const gstAmt = taxable * gstPct / 100;
  const total = taxable + gstAmt;
  document.getElementById(id + '_taxable').textContent = fmtINR(taxable);
  document.getElementById(id + '_gstamt').textContent = gstAmt > 0 ? fmtINR(gstAmt) : '—';
  document.getElementById(id + '_total').textContent = fmtINR(total);
  renderPreview();
}

function getItemsData() {
  const rows = document.querySelectorAll('#itemsBody tr');
  const items = [];
  rows.forEach(row => {
    const inp = row.querySelectorAll('input, select');
    const qty = parseFloat(inp[2].value) || 0;
    const rate = parseFloat(inp[4].value) || 0;
    const gstPct = parseFloat(inp[5].value) || 0;
    const taxable = qty * rate;
    const gstAmt = taxable * gstPct / 100;
    items.push({
      desc: inp[0].value || 'Item', hsn: inp[1].value || '',
      qty: qty, unit: inp[3].value || 'Nos', rate: rate, gstPct: gstPct,
      taxable: taxable, gstAmt: gstAmt, total: taxable + gstAmt
    });
  });
  return items;
}

function computeTotals(items) {
  const t = { totalQty: 0, totalTaxable: 0, totalGST: 0, grandTotal: 0 };
  items.forEach(it => {
    t.totalQty += it.qty;
    t.totalTaxable += it.taxable;
    t.totalGST += it.gstAmt;
    t.grandTotal += it.total;
  });
  return t;
}

/* ── formatting helpers ── */
function fmtINR(num) {
  num = Number(num) || 0;
  return '₹' + num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return parseInt(parts[2], 10) + ' ' + months[parseInt(parts[1], 10) - 1] + ' ' + parts[0];
}

function amountToWords(value) { return SalesOnMoney.toWords(value); }

/* ── copy label logic (Original / Duplicate / Triplicate) ── */
function getCopyLabel() {
  const sel = v('copySelector');
  if (sel === 'duplicate') return 'DUPLICATE FOR TRANSPORTER';
  if (sel === 'triplicate') return 'TRIPLICATE FOR CONSIGNOR';
  return 'ORIGINAL FOR CONSIGNEE'; // 'original' and 'all3' both default the on-screen preview to this
}

/* ── items table renderer (preview side) — columns adapt to toggles ── */
function buildItemsTableHTML(items, showValueCols, showGSTCols) {
  const cols = [
    { label: '#', get: (it, i) => i + 1 },
    { label: 'Item / Goods', get: it => '<span style="font-weight:600;color:var(--ink);">' + escapeHTML(it.desc) + '</span>' },
    { label: 'HSN/SAC', get: it => it.hsn || '—' },
    { label: 'Qty', numeric: true, get: it => it.qty },
    { label: 'Unit', get: it => escapeHTML(it.unit) }
  ];
  if (showValueCols) cols.push({ label: 'Rate', numeric: true, get: it => fmtINR(it.rate) });
  if (showGSTCols) cols.push({ label: 'GST%', numeric: true, get: it => it.gstPct > 0 ? it.gstPct + '%' : '—' });
  if (showValueCols) cols.push({ label: 'Taxable', numeric: true, get: it => fmtINR(it.taxable) });
  if (showValueCols && showGSTCols) cols.push({ label: 'GST Amt', numeric: true, get: it => it.gstAmt > 0 ? fmtINR(it.gstAmt) : '—' });
  if (showValueCols) cols.push({ label: 'Total', numeric: true, get: it => '<span style="font-weight:700;color:var(--ink);">' + fmtINR(it.total) + '</span>' });

  const theadHTML = '<tr>' + cols.map(c => '<th class="' + (c.numeric ? 'num' : '') + '">' + c.label + '</th>').join('') + '</tr>';
  const rowsHTML = items.length
    ? items.map((it, i) => '<tr>' + cols.map(c => '<td class="' + (c.numeric ? 'num' : '') + '">' + c.get(it, i) + '</td>').join('') + '</tr>').join('')
    : '<tr><td colspan="' + cols.length + '" style="text-align:center;color:var(--ink-mute);padding:14px;">No items added yet</td></tr>';

  return '<table class="dc-items-table"><thead>' + theadHTML + '</thead><tbody>' + rowsHTML + '</tbody></table>';
}

/* ── full challan document builder — parametrized by copy label so it can
   be called 3 times (Original / Duplicate / Triplicate) for the "Print All 3
   Copies" mode without duplicating any markup logic ── */
function buildChallanHTML(copyLabelOverride) {
  const items = getItemsData();
  const T = computeTotals(items);

  const showValueCols = document.getElementById('showValueCols').checked;
  const showGSTCols = document.getElementById('showGSTCols').checked;
  const showVehicleBlock = document.getElementById('showVehicleBlock').checked;
  const showEwayBlock = document.getElementById('showEwayBlock').checked;
  const showReceiverAck = document.getElementById('showReceiverAck').checked;
  const copyLabel = copyLabelOverride || getCopyLabel();

  const bName = v('consignorName') || 'Your Business Name';
  const bGSTIN = v('consignorGSTIN');
  const bAddr = v('consignorAddress');
  const bState = v('consignorState');
  const bStateCode = v('consignorStateCode');
  const bPhone = v('consignorPhone');
  const bEmail = v('consignorEmail');

  const cName = v('consigneeName') || 'Receiver Name';
  const cCompany = v('consigneeCompany');
  const cAddr = v('consigneeAddress');
  const cState = v('consigneeState');
  const cStateCode = v('consigneeStateCode');
  const cGSTIN = v('consigneeGSTIN');
  const cPhone = v('consigneePhone');
  const cEmail = v('consigneeEmail');

  const challanNo = v('challanNumber') || '—';
  const challanDateFmt = formatDate(v('challanDate'));
  const reasonTransport = v('reasonTransport') || 'Other';
  const placeOfSupply = v('placeOfSupply');
  const dispatchFrom = v('dispatchFrom');
  const shipTo = v('shipTo');
  const refInvoiceNumber = v('refInvoiceNumber');
  const refOrderNumber = v('refOrderNumber');
  const salespersonName = v('salespersonName');
  const beatRouteName = v('beatRouteName');

  const transporterName = v('transporterName');
  const transporterId = v('transporterId');
  const vehicleNumber = v('vehicleNumber');
  const lrrrNumber = v('lrrrNumber');
  const ewayBillNumber = v('ewayBillNumber');
  const modeOfTransport = v('modeOfTransport') || 'Road';
  const approxDistance = v('approxDistance');
  const dispatchDateFmt = formatDate(v('dispatchDate'));
  const expectedDeliveryFmt = formatDate(v('expectedDeliveryDate'));

  const remarks = v('challanRemarks');
  const sigName = v('signatoryName') || 'Authorized Signatory';

  const logoHTML = logoDataURL
    ? '<img class="dc-logo" src="/tools/delivery-challan-generator/' + logoDataURL + '" alt="Company Logo">'
    : '<div style="font-family:\'DM Serif Display\',serif;font-size:19px;color:var(--accent);">' + escapeHTML(bName) + '</div>';

  const sigImgHTML = '<img class="dc-sig-img" src="/tools/delivery-challan-generator/' + (sigDataURL || '') + '" alt="Signature" style="' + (sigDataURL ? 'display:block;' : 'display:none;') + '">';

  const itemsTableHTML = buildItemsTableHTML(items, showValueCols, showGSTCols);

  let summaryRows = '<div class="dc-summary-row"><span class="s-label">Total Quantity</span><span class="s-val">' + T.totalQty + '</span></div>';
  if (showValueCols) {
    summaryRows += '<div class="dc-summary-row"><span class="s-label">Taxable Value</span><span class="s-val">' + fmtINR(T.totalTaxable) + '</span></div>';
    if (showGSTCols && T.totalGST > 0) {
      summaryRows += '<div class="dc-summary-row"><span class="s-label">GST Total</span><span class="s-val">' + fmtINR(T.totalGST) + '</span></div>';
    }
    summaryRows += '<div class="dc-summary-row total"><span class="s-label">Estimated Value</span><span class="s-val">' + fmtINR(T.grandTotal) + '</span></div>';
  }

  const wordsHTML = (showValueCols && T.grandTotal > 0)
    ? '<div class="dc-words"><strong>Amount in Words:</strong> ' + amountToWords(T.grandTotal) + '</div>'
    : '';

  const metaGridHTML =
    '<div class="dc-meta-grid">' +
      '<div class="mg-item"><div class="mg-label">Reason for Transport</div><div class="mg-val">' + escapeHTML(reasonTransport) + '</div></div>' +
      '<div class="mg-item"><div class="mg-label">Place of Supply</div><div class="mg-val">' + (escapeHTML(placeOfSupply) || '—') + '</div></div>' +
      (refInvoiceNumber ? '<div class="mg-item"><div class="mg-label">Ref. Invoice No.</div><div class="mg-val">' + escapeHTML(refInvoiceNumber) + '</div></div>' : '') +
      (refOrderNumber ? '<div class="mg-item"><div class="mg-label">Ref. Order No.</div><div class="mg-val">' + escapeHTML(refOrderNumber) + '</div></div>' : '') +
      (salespersonName ? '<div class="mg-item"><div class="mg-label">Salesperson</div><div class="mg-val">' + escapeHTML(salespersonName) + '</div></div>' : '') +
      (beatRouteName ? '<div class="mg-item"><div class="mg-label">Beat / Route</div><div class="mg-val">' + escapeHTML(beatRouteName) + '</div></div>' : '') +
    '</div>';

  const transportHTML = showVehicleBlock
    ? '<div class="dc-transport-title">🚛 Transport Details</div>' +
      '<div class="dc-transport-strip">' +
        '<div class="ts-item"><div class="ts-label">Transporter</div><div class="ts-val">' + (escapeHTML(transporterName) || '—') + '</div></div>' +
        '<div class="ts-item"><div class="ts-label">Vehicle No.</div><div class="ts-val">' + (escapeHTML(vehicleNumber) || '—') + '</div></div>' +
        '<div class="ts-item"><div class="ts-label">Mode</div><div class="ts-val">' + escapeHTML(modeOfTransport) + '</div></div>' +
        (lrrrNumber ? '<div class="ts-item"><div class="ts-label">LR/RR No.</div><div class="ts-val">' + escapeHTML(lrrrNumber) + '</div></div>' : '') +
        (approxDistance ? '<div class="ts-item"><div class="ts-label">Distance</div><div class="ts-val">' + escapeHTML(approxDistance) + ' KM</div></div>' : '') +
        '<div class="ts-item"><div class="ts-label">Dispatch Date</div><div class="ts-val">' + (dispatchDateFmt || '—') + '</div></div>' +
        (expectedDeliveryFmt ? '<div class="ts-item"><div class="ts-label">Expected Delivery</div><div class="ts-val">' + expectedDeliveryFmt + '</div></div>' : '') +
        (transporterId ? '<div class="ts-item"><div class="ts-label">Transporter ID</div><div class="ts-val">' + escapeHTML(transporterId) + '</div></div>' : '') +
      '</div>'
    : '';

  const ewayHTML = (showEwayBlock && ewayBillNumber)
    ? '<div class="dc-section-block"><strong>📟 E-Way Bill Number</strong><p>' + escapeHTML(ewayBillNumber) + '</p></div>'
    : '';

  const remarksHTML = remarks
    ? '<div class="dc-section-block"><strong>Terms / Remarks</strong><p>' + escapeHTML(remarks) + '</p></div>'
    : '';

  const ackRowHTML = showReceiverAck
    ? '<div class="dc-ack-row">' +
        '<div class="dc-ack-box"><div class="ack-title">Receiver Acknowledgement</div><div class="ack-line">Received the above goods in good condition — Signature &amp; Date</div></div>' +
        '<div class="dc-sig-box">' + sigImgHTML + '<div class="dc-sig-line"></div><div class="dc-sig-name">' + escapeHTML(sigName) + '</div><div class="dc-sig-label">For ' + escapeHTML(bName) + '</div></div>' +
      '</div>'
    : '<div class="dc-ack-row" style="grid-template-columns:1fr;">' +
        '<div class="dc-sig-box">' + sigImgHTML + '<div class="dc-sig-line"></div><div class="dc-sig-name">' + escapeHTML(sigName) + '</div><div class="dc-sig-label">For ' + escapeHTML(bName) + '</div></div>' +
      '</div>';

  const tplClass = 'dc-' + currentTemplate;

  return (
    '<div class="' + tplClass + '" style="--accent:' + currentAccent + ';">' +
      '<div class="dc-copy-banner">' + copyLabel + '</div>' +
      '<div class="dc-header">' +
        '<div>' + logoHTML +
          '<div class="dc-seller-name">' + escapeHTML(bName) + '</div>' +
          '<div class="dc-seller-detail">' +
            (bGSTIN ? 'GSTIN: ' + escapeHTML(bGSTIN) + '<br>' : '') +
            (bAddr ? escapeHTML(bAddr) + (bState ? ', ' + escapeHTML(bState) : '') + '<br>' : '') +
            (bStateCode ? 'State Code: ' + escapeHTML(bStateCode) + '<br>' : '') +
            (bPhone ? '📞 ' + escapeHTML(bPhone) + '&nbsp;&nbsp;' : '') + (bEmail ? '✉️ ' + escapeHTML(bEmail) : '') +
          '</div>' +
        '</div>' +
        '<div>' +
          '<div class="dc-doc-title">DELIVERY CHALLAN</div>' +
          '<div class="dc-doc-meta">No: <strong>' + escapeHTML(challanNo) + '</strong><br>Date: ' + (challanDateFmt || '—') + '</div>' +
        '</div>' +
      '</div>' +
      '<div class="dc-body">' +
        '<div class="dc-bill-row">' +
          '<div>' +
            '<div class="dc-bill-label">Consignee / Receiver</div>' +
            '<div class="dc-bill-name">' + escapeHTML(cName) + '</div>' +
            '<div class="dc-bill-detail">' +
              (cCompany ? '<em>' + escapeHTML(cCompany) + '</em><br>' : '') +
              (cGSTIN ? 'GSTIN: ' + escapeHTML(cGSTIN) + '<br>' : '') +
              escapeHTML(cAddr) + (cState ? ', ' + escapeHTML(cState) : '') +
              (cStateCode ? '<br>State Code: ' + escapeHTML(cStateCode) : '') +
              (cPhone ? '<br>📞 ' + escapeHTML(cPhone) : '') +
              (cEmail ? '<br>✉️ ' + escapeHTML(cEmail) : '') +
            '</div>' +
          '</div>' +
          '<div>' +
            '<div class="dc-bill-label">Dispatch From</div>' +
            '<div class="dc-bill-detail" style="font-weight:600;color:var(--ink);margin-bottom:10px;">' + (escapeHTML(dispatchFrom) || '—') + '</div>' +
            '<div class="dc-bill-label">Ship To</div>' +
            '<div class="dc-bill-detail">' + (escapeHTML(shipTo) || '—') + '</div>' +
          '</div>' +
        '</div>' +
        metaGridHTML + transportHTML + ewayHTML + itemsTableHTML +
        '<div class="dc-summary"><div class="dc-summary-table">' + summaryRows + '</div></div>' +
        wordsHTML + remarksHTML + ackRowHTML +
      '</div>' +
      '<div class="dc-disclaimer">⚠️ SalesOn Free Tools help you create professional document formats. Please verify GST, tax and legal compliance with your accountant before issuing official documents.</div>' +
      '<div class="dc-footer-strip">Created using SalesOn Free Business Tools · saleson.co.in</div>' +
    '</div>'
  );
}

function renderPreview() {
  document.getElementById('challanPreview').innerHTML = buildChallanHTML();
}

/* ── collapsible sections ── */
function toggleSection(btn) {
  const body = btn.nextElementSibling;
  const isOpen = btn.classList.contains('open');
  btn.classList.toggle('open', !isOpen);
  body.classList.toggle('open', !isOpen);
}

/* ── template + accent ── */
function setTemplate(tpl, el) {
  currentTemplate = tpl;
  document.querySelectorAll('.tpl-pill').forEach(p => p.classList.remove('active'));
  el.classList.add('active');
  renderPreview();
}

function setAccent(color, el) {
  currentAccent = color;
  document.querySelectorAll('.accent-pill').forEach(p => p.classList.remove('active'));
  el.classList.add('active');
  renderPreview();
}

/* ── logo / signature uploads ── */
function handleLogoUpload(input) {
  const file = input.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    logoDataURL = e.target.result;
    const thumb = document.getElementById('logoPreviewThumb');
    thumb.src = logoDataURL;
    thumb.style.display = 'block';
    renderPreview();
  };
  reader.readAsDataURL(file);
}

function handleSigUpload(input) {
  const file = input.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    sigDataURL = e.target.result;
    const thumb = document.getElementById('sigPreviewThumb');
    thumb.src = sigDataURL;
    thumb.style.display = 'block';
    renderPreview();
  };
  reader.readAsDataURL(file);
}

/* ── action buttons -> lead gate -> execute ── */
function triggerAction(action) {  executeAction(action); }

function executeAction(action) {
  if (action === 'pdf' || action === 'print') doPrint();
  else if (action === 'wa') openWaShare();
  else if (action === 'convert') doConvertToInvoice();
}


/* Build a print-only copy at body level. This prevents the hidden webpage from
   retaining its height and creating extra blank print pages. */
function prepareSalesOnPrint(sourceId, multiplePages) {
  const existing = document.getElementById('salesonPrintRoot');
  if (existing) existing.remove();

  const source = document.getElementById(sourceId);
  if (!source) return false;

  const root = document.createElement('div');
  root.id = 'salesonPrintRoot';

  if (multiplePages) {
    Array.from(source.children).forEach((page) => {
      const printablePage = page.cloneNode(true);
      printablePage.classList.add('saleson-print-document', 'saleson-print-page');
      root.appendChild(printablePage);
    });
  } else {
    const printable = source.cloneNode(true);
    printable.classList.add('saleson-print-document');
    root.appendChild(printable);
  }

  document.body.appendChild(root);
  void root.offsetHeight;
  return true;
}

function cleanupSalesOnPrint() {
  const root = document.getElementById('salesonPrintRoot');
  if (root) root.remove();
  document.body.classList.remove('print-triplicate');
}

window.addEventListener('afterprint', cleanupSalesOnPrint);

/* ── print / PDF, including "Print All 3 Copies" with page breaks ── */
function doPrint() {
  const copySel = v('copySelector');
  if (copySel === 'all3') {
    const labels = ['ORIGINAL FOR CONSIGNEE', 'DUPLICATE FOR TRANSPORTER', 'TRIPLICATE FOR CONSIGNOR'];
    const pagesHTML = labels.map(l => '<div class="print-copy-page">' + buildChallanHTML(l) + '</div>').join('');
    document.getElementById('triplicatePrintArea').innerHTML = pagesHTML;
    prepareSalesOnPrint('triplicatePrintArea', true);
  } else {
    prepareSalesOnPrint('challanPreview', false);
  }
  window.print();
}

/* ── convert to invoice ── */
function doConvertToInvoice() {
  const rows = document.querySelectorAll('#itemsBody tr');
  const itemsArr = [];
  rows.forEach(row => {
    const inp = row.querySelectorAll('input, select');
    itemsArr.push({ desc: inp[0].value, hsn: inp[1].value, qty: inp[2].value, unit: inp[3].value, rate: inp[4].value, gst: inp[5].value });
  });

  const payload = {
    sellerName: v('consignorName'), sellerGSTIN: v('consignorGSTIN'), sellerAddress: v('consignorAddress'),
    sellerState: v('consignorState'), sellerStateCode: v('consignorStateCode'),
    sellerPhone: v('consignorPhone'), sellerEmail: v('consignorEmail'),
    buyerName: v('consigneeName'), buyerGSTIN: v('consigneeGSTIN'), buyerBillingAddress: v('consigneeAddress'),
    buyerState: v('consigneeState'), buyerPhone: v('consigneePhone'), buyerEmail: v('consigneeEmail'),
    refNumber: v('refInvoiceNumber') || v('challanNumber'),
    vehicleNumber: v('vehicleNumber'), transporterName: v('transporterName'), ewayBillNumber: v('ewayBillNumber'),
    invNotes: v('challanRemarks'), signatoryName: v('signatoryName'),
    logoDataURL: logoDataURL, sigDataURL: sigDataURL,
    items: itemsArr,
    convertedFromChallan: v('challanNumber'),
    convertedAt: new Date().toISOString(),
    buyerName: v("consigneeName"),
    buyerGSTIN: v("consigneeGSTIN"),
    buyerBillingAddress: v("consigneeAddress"),
    buyerState: v("consigneeState"),
    buyerStateCode: v("consigneeStateCode"),
    buyerPhone: v("consigneePhone"),
    buyerEmail: v("consigneeEmail"),
    placeOfSupply: v("placeOfSupply"),
  };

  if (!SalesOnStorage.setItem('saleson_challan_to_invoice_data', JSON.stringify(payload))) { alert('Transfer unavailable because browser storage is blocked or full. Download or print this document instead.'); return; }
  convertedToInvoice = true;

  const el = document.getElementById('convertSuccess');
  el.classList.add('show');
  el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  console.log('[SalesOn] Challan saved for invoice conversion:', payload);
}

/* ── WhatsApp share ── */
function openWaShare() {
  const cName = v('consigneeName') || 'Customer';
  const dcNum = v('challanNumber') || '—';
  const bName = v('consignorName') || 'Your Business';
  const reason = v('reasonTransport') || 'goods movement';
  const vehicle = v('vehicleNumber') || 'Not specified';

  const msg = 'Hi ' + cName + ', delivery challan ' + dcNum + ' has been created by ' + bName + ' for ' + reason + '. Vehicle: ' + vehicle + '. Created using SalesOn Free Business Tools — saleson.co.in';

  document.getElementById('waMessageBox').textContent = msg;
  document.getElementById('waOpenBtn').href = 'https://wa.me/?text=' + encodeURIComponent(msg);
  document.getElementById('waModal').classList.add('open');
}

function copyWaMessage() {
  const msg = document.getElementById('waMessageBox').textContent;
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(msg).then(() => showToast('Message copied ✓')).catch(() => fallbackCopy(msg));
  } else {
    fallbackCopy(msg);
  }
}
function fallbackCopy(msg) {
  const ta = document.createElement('textarea');
  ta.value = msg;
  document.body.appendChild(ta);
  ta.select();
  try { document.execCommand('copy'); showToast('Message copied ✓'); } catch (e) { showToast('Could not copy — please select manually'); }
  document.body.removeChild(ta);
}

/* ── lead capture ── */


function skipLead() {}

/* ── draft save / load ── */
function saveDraft() {
  const rows = document.querySelectorAll('#itemsBody tr');
  const itemsArr = [];
  rows.forEach(row => {
    const inp = row.querySelectorAll('input, select');
    itemsArr.push({ desc: inp[0].value, hsn: inp[1].value, qty: inp[2].value, unit: inp[3].value, rate: inp[4].value, gst: inp[5].value });
  });

  const fieldIds = [
    'consignorName','consignorGSTIN','consignorAddress','consignorState','consignorStateCode','consignorPhone','consignorEmail',
    'consigneeName','consigneeCompany','consigneeAddress','consigneeState','consigneeStateCode','consigneeGSTIN','consigneePhone','consigneeEmail',
    'challanNumber','challanDate','reasonTransport','placeOfSupply','dispatchFrom','shipTo',
    'refInvoiceNumber','refOrderNumber','salespersonName','beatRouteName',
    'transporterName','transporterId','vehicleNumber','lrrrNumber','ewayBillNumber','modeOfTransport',
    'approxDistance','dispatchDate','expectedDeliveryDate','challanRemarks','signatoryName','copySelector'
  ];
  const draft = {};
  fieldIds.forEach(id => { draft[id] = v(id); });

  draft.showValueCols = document.getElementById('showValueCols').checked;
  draft.showGSTCols = document.getElementById('showGSTCols').checked;
  draft.showVehicleBlock = document.getElementById('showVehicleBlock').checked;
  draft.showEwayBlock = document.getElementById('showEwayBlock').checked;
  draft.showReceiverAck = document.getElementById('showReceiverAck').checked;
  draft.template = currentTemplate;
  draft.accent = currentAccent;
  draft.logoDataURL = logoDataURL;
  draft.sigDataURL = sigDataURL;
  draft.items = itemsArr;
  draft.savedAt = new Date().toISOString();

  SalesOnStorage.setItem('saleson_delivery_challan_draft', JSON.stringify(draft));
  showToast('Draft saved ✓');
}

function loadDraft() {
  const raw = SalesOnStorage.getItem('saleson_delivery_challan_draft');
  if (!raw) { showToast('No saved draft found'); return; }
  let d;
  try { d = JSON.parse(raw); } catch (e) { showToast('Saved draft is corrupted'); return; }

  [
    'consignorName','consignorGSTIN','consignorAddress','consignorState','consignorStateCode','consignorPhone','consignorEmail',
    'consigneeName','consigneeCompany','consigneeAddress','consigneeState','consigneeStateCode','consigneeGSTIN','consigneePhone','consigneeEmail',
    'challanNumber','challanDate','reasonTransport','placeOfSupply','dispatchFrom','shipTo',
    'refInvoiceNumber','refOrderNumber','salespersonName','beatRouteName',
    'transporterName','transporterId','vehicleNumber','lrrrNumber','ewayBillNumber','modeOfTransport',
    'approxDistance','dispatchDate','expectedDeliveryDate','challanRemarks','signatoryName','copySelector'
  ].forEach(id => { if (d[id] !== undefined) sv(id, d[id]); });

  if (document.getElementById('showValueCols')) document.getElementById('showValueCols').checked = d.showValueCols !== false;
  if (document.getElementById('showGSTCols')) document.getElementById('showGSTCols').checked = d.showGSTCols !== false;
  if (document.getElementById('showVehicleBlock')) document.getElementById('showVehicleBlock').checked = d.showVehicleBlock !== false;
  if (document.getElementById('showEwayBlock')) document.getElementById('showEwayBlock').checked = d.showEwayBlock !== false;
  if (document.getElementById('showReceiverAck')) document.getElementById('showReceiverAck').checked = d.showReceiverAck !== false;

  if (d.logoDataURL) {
    logoDataURL = d.logoDataURL;
    const thumb = document.getElementById('logoPreviewThumb');
    thumb.src = logoDataURL; thumb.style.display = 'block';
  }
  if (d.sigDataURL) {
    sigDataURL = d.sigDataURL;
    const thumb = document.getElementById('sigPreviewThumb');
    thumb.src = sigDataURL; thumb.style.display = 'block';
  }
  if (d.template) {
    currentTemplate = d.template;
    document.querySelectorAll('.tpl-pill').forEach(p => p.classList.toggle('active', p.textContent.trim().toLowerCase() === d.template));
  }
  if (d.accent) {
    currentAccent = d.accent;
    document.querySelectorAll('.accent-pill').forEach(p => p.classList.toggle('active', (p.getAttribute('onclick') || '').indexOf(d.accent) !== -1));
  }

  document.getElementById('itemsBody').innerHTML = '';
  itemRowCount = 0;
  (d.items || []).forEach(it => addItemRow(it));
  if (!d.items || !d.items.length) addItemRow({});

  renderPreview();
  showToast('Draft loaded ✓');
}

/* ── reset ── */
function resetForm() {
  if (!confirm('Reset all fields back to sample data? This cannot be undone.')) return;
  logoDataURL = null;
  sigDataURL = null;
  convertedToInvoice = false;
  document.getElementById('logoPreviewThumb').style.display = 'none';
  document.getElementById('sigPreviewThumb').style.display = 'none';
  document.getElementById('convertSuccess').classList.remove('show');
  document.getElementById('showValueCols').checked = true;
  document.getElementById('showGSTCols').checked = true;
  document.getElementById('showVehicleBlock').checked = true;
  document.getElementById('showEwayBlock').checked = true;
  document.getElementById('showReceiverAck').checked = true;
  sv('copySelector', 'original');
  currentTemplate = 'classic';
  currentAccent = '#1a56db';
  document.querySelectorAll('.tpl-pill').forEach((p, i) => p.classList.toggle('active', i === 0));
  document.querySelectorAll('.accent-pill').forEach((p, i) => p.classList.toggle('active', i === 0));
  initDefaults();
  showToast('Form reset ✓');
}

/* ── FAQ accordion ── */
function toggleFaq(btn) {
  const a = btn.nextElementSibling;
  const willOpen = !btn.classList.contains('open');
  document.querySelectorAll('.faq-q').forEach(b => {
    b.classList.remove('open');
    b.nextElementSibling.classList.remove('open');
  });
  if (willOpen) { btn.classList.add('open'); a.classList.add('open'); }
}

/* ── toast ── */
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(window._toastTimer);
  window._toastTimer = setTimeout(() => t.classList.remove('show'), 2600);
}

function applyVanChallanHandoff() {
  const data = SalesOnHandoff.take(
    "saleson_van_loading_to_delivery_challan"
  );

  if (!data) return;

  SalesOnHandoff.set("consignorName", data.businessName);
  SalesOnHandoff.set("vehicleNumber", data.vehicleNumber);
  SalesOnHandoff.set("salespersonName", data.salesmanName);
  SalesOnHandoff.set("beatRouteName", data.routeName);
  SalesOnHandoff.set("dispatchFrom", data.warehouseName);
  SalesOnHandoff.set("shipTo", data.routeName);
  SalesOnHandoff.set("challanDate", data.date);
  SalesOnHandoff.set("dispatchDate", data.date);

  // Do not leave a fake sample customer in an imported challan.
  [
    "consigneeName",
    "consigneeCompany",
    "consigneeAddress",
    "consigneeGSTIN",
    "consigneePhone",
    "consigneeEmail"
  ].forEach(id => SalesOnHandoff.set(id, ""));

  SalesOnHandoff.set(
    "challanRemarks",
    [
      data.vanNumber && `Van: ${data.vanNumber}`,
      data.routeName && `Route: ${data.routeName}`
    ].filter(Boolean).join(" | ")
  );

  const body = document.getElementById("itemsBody");
  body.innerHTML = "";
  itemRowCount = 0;

  (data.items || []).forEach(item => {
    addItemRow({
      desc: item.name,
      hsn: "",
      qty: item.qty,
      unit: item.unit || "Nos",
      rate: item.rate || 0,

      // Van payload does not contain GST classification.
      gst: 0
    });
  });

  renderPreview();
  showToast(
    "Van items imported. Enter consignee, HSN and GST details."
  );
}

/* ── boot ── */
initDefaults();
applyVanChallanHandoff();

