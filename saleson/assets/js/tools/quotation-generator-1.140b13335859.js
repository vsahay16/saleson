
/* ─────────────────────────
   STATE
───────────────────────── */
let currentTemplate = 'classic';
let currentAccent = '#1a56db';
let logoDataURL = null;
let sigDataURL = null;
let pendingAction = null; // 'pdf' | 'print' | 'wa' | 'convert'
let convertedToInvoice = false; // track if user clicked Convert to Invoice (for lead scoring)

/* ─────────────────────────
   INIT DEFAULTS — sample data so preview never looks empty
───────────────────────── */
function initDefaults() {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');

  sv('bizName',     'Shree Balaji Distributors');
  sv('bizGSTIN',    '10ABCDE1234F1Z5');
  sv('bizAddress',  'MG Road, Fraser Road, Patna, Bihar - 800001');
  sv('bizPhone',    '+91-9876543210');
  sv('bizEmail',    'sales@example.com');
  sv('bizWebsite',  'www.example.com');

  sv('custName',    'Mohan Retail Store');
  sv('custCompany', 'Mohan Enterprises');
  sv('custAddress', 'Boring Road, Patna, Bihar - 800001');
  sv('custPhone',   '+91-9800000001');

  sv('quoteNumber', 'QT-' + yyyy + mm + dd + '-001');
  sv('quoteDate',   yyyy + '-' + mm + '-' + dd);
  sv('preparedBy',  'Ramesh Gupta');
  sv('projectTitle','Monthly FMCG Supply Quotation');
  sv('salesperson', 'Suresh Kumar');

  // Set validity 30 days from today
  setValidity(30, true);

  sv('paymentTerms', '50% Advance, 50% Before Delivery');
  sv('signatoryName','Authorized Signatory');

  // Add one sample item
  addItemRow({ desc: 'FMCG Product Box', hsn: '3401', qty: 10, unit: 'Box', rate: 500, disc: 0, gst: 18 });

  renderPreview();
}

/* ─────────────────────────
   VALIDITY QUICK SELECTOR
───────────────────────── */
function setValidity(days, silent) {
  const dateInput = document.getElementById('quoteDate');
  const base = dateInput.value ? new Date(dateInput.value) : new Date();
  const future = new Date(base.getTime() + days * 24 * 60 * 60 * 1000);
  const y = future.getFullYear();
  const m = String(future.getMonth() + 1).padStart(2, '0');
  const d = String(future.getDate()).padStart(2, '0');
  document.getElementById('validUntil').value = y + '-' + m + '-' + d;
  if (!silent) renderPreview();
}

/* ─────────────────────────
   ITEM ROWS
───────────────────────── */
let itemRowCount = 0;

function addItemRow(defaults) {
  itemRowCount++;
  const id = 'row_' + itemRowCount;
  const d = defaults || {};
  const tbody = document.getElementById('itemsBody');
  const tr = document.createElement('tr');
  tr.id = id;
  tr.innerHTML = `
    <td><input type="text" value="" placeholder="Product / Service" oninput="recalcRow('${id}')"></td>
    <td><input type="text" value="" placeholder="3401"></td>
    <td><input type="number" value="" min="0" step="any" oninput="recalcRow('${id}')"></td>
    <td><input type="text" value="" placeholder="Box"></td>
    <td><input type="number" value="" min="0" step="any" oninput="recalcRow('${id}')"></td>
    <td><input type="number" value="" min="0" max="100" step="any" oninput="recalcRow('${id}')"></td>
    <td>
      <select oninput="recalcRow('${id}')">
        <option value="0">0%</option>
        <option value="3">3%</option>
        <option value="5">5%</option>
        <option value="12">12%</option>
        <option value="18" ${(d.gst || 0) == 18 ? 'selected' : ''}>18%</option>
        <option value="28">28%</option>
        <option value="40">40% (De-merit)</option>
      </select>
    </td>
    <td class="computed" id="${id}_taxable">—</td>
    <td class="computed" id="${id}_gstamt">—</td>
    <td class="computed" id="${id}_total">—</td>
    <td><button class="btn-remove-row" onclick="removeItemRow('${id}')" title="Remove row">✕</button></td>
  `;
  tr.querySelectorAll('input').forEach((input, i) => { input.value = String([d.desc || '',d.hsn || '',d.qty !== undefined ? d.qty : 1,d.unit || 'Nos',d.rate !== undefined ? d.rate : 0,d.disc !== undefined ? d.disc : 0][i] ?? ""); });
  SalesOnToolSafety.setGST(tr.querySelector("select"), d.gst ?? 0);

  tbody.appendChild(tr);
  recalcRow(id);
}

function removeItemRow(id) {
  const row = document.getElementById(id);
  if (row) { row.remove(); renderPreview(); }
}

function recalcRow(id) {
  const row = document.getElementById(id);
  if (!row) return;
  const inputs = row.querySelectorAll('input, select');
  const qty    = parseFloat(inputs[2].value) || 0;
  const rate   = parseFloat(inputs[4].value) || 0;
  const disc   = parseFloat(inputs[5].value) || 0;
  const gstPct = parseFloat(inputs[6].value) || 0;
  const inclTax = document.getElementById('priceInclTax').checked;

  let taxable, gstAmt, total;
  if (inclTax && gstPct > 0) {
    const gross = qty * rate * (1 - disc / 100);
    taxable = gross / (1 + gstPct / 100);
    gstAmt  = gross - taxable;
    total   = gross;
  } else {
    taxable = qty * rate * (1 - disc / 100);
    gstAmt  = taxable * gstPct / 100;
    total   = taxable + gstAmt;
  }

  document.getElementById(id + '_taxable').textContent = fmtINR(taxable);
  document.getElementById(id + '_gstamt').textContent  = gstAmt > 0 ? fmtINR(gstAmt) : '—';
  document.getElementById(id + '_total').textContent   = fmtINR(total);
  renderPreview();
}

function recalcAll() {
  document.querySelectorAll('#itemsBody tr').forEach(row => recalcRow(row.id));
}

/* ─────────────────────────
   COLLECT ITEMS DATA
───────────────────────── */
function getItemsData() {
  const rows = document.querySelectorAll('#itemsBody tr');
  const inclTax = document.getElementById('priceInclTax').checked;
  const items = [];

  rows.forEach(row => {
    const inp    = row.querySelectorAll('input, select');
    const qty    = parseFloat(inp[2].value) || 0;
    const rate   = parseFloat(inp[4].value) || 0;
    const disc   = parseFloat(inp[5].value) || 0;
    const gstPct = parseFloat(inp[6].value) || 0;

    let taxable, gstAmt, total;
    if (inclTax && gstPct > 0) {
      const gross = qty * rate * (1 - disc / 100);
      taxable = gross / (1 + gstPct / 100);
      gstAmt  = gross - taxable;
      total   = gross;
    } else {
      taxable = qty * rate * (1 - disc / 100);
      gstAmt  = taxable * gstPct / 100;
      total   = taxable + gstAmt;
    }

    items.push({
      desc: inp[0].value || '—', hsn: inp[1].value || '',
      qty, unit: inp[3].value || 'Nos', rate, disc, gstPct,
      taxable, gstAmt, total
    });
  });
  return items;
}

/* ─────────────────────────
   COMPUTE TOTALS
───────────────────────── */
function computeTotals(items) {
  let subTotal = 0, totalDiscount = 0, totalTaxable = 0, totalGST = 0, grandRaw = 0;

  items.forEach(it => {
    subTotal      += it.qty * it.rate;
    totalDiscount += it.qty * it.rate * it.disc / 100;
    totalTaxable  += it.taxable;
    totalGST      += it.gstAmt;
    grandRaw      += it.total;
  });

  const otherCharges = Math.max(0, parseFloat(document.getElementById('otherCharges').value) || 0);
  grandRaw += otherCharges;

  const doRound  = document.getElementById('roundOff').checked;
  const roundOff = doRound ? Math.round(grandRaw) - grandRaw : 0;
  const grandTotal = doRound ? Math.round(grandRaw) : grandRaw;

  const advancePct = Math.min(100, Math.max(0, parseFloat(document.getElementById('advancePct').value) || 0));
  const advanceAmt = SalesOnMoney.minorUnits(grandTotal * advancePct / 100) / 100;
  const balanceAmt = Math.max(0, SalesOnMoney.minorUnits(grandTotal - advanceAmt) / 100);

  return { subTotal, totalDiscount, totalTaxable, totalGST, otherCharges, grandRaw, roundOff, grandTotal, advancePct, advanceAmt, balanceAmt };
}

/* ─────────────────────────
   FORMAT HELPERS
───────────────────────── */
function fmtINR(n) {
  return '₹' + Number(n.toFixed(2)).toLocaleString('en-IN', { minimumFractionDigits: 2 });
}

function amountToWords(value) { return SalesOnMoney.toWords(value); }

function formatDate(d) {
  if (!d) return '';
  const [y, m, day] = d.split('-');
  return day + '/' + m + '/' + y;
}

/* ─────────────────────────
   RENDER QUOTATION PREVIEW
───────────────────────── */
function renderPreview() {
  const items = getItemsData();
  const T = computeTotals(items);

  // Business
  const bName    = SalesOnToolSafety.escape(v('bizName')    || 'Your Company Name');
  const bGSTIN   = SalesOnToolSafety.escape(v('bizGSTIN')   || '');
  const bAddr    = SalesOnToolSafety.escape(v('bizAddress') || '');
  const bPhone   = SalesOnToolSafety.escape(v('bizPhone')   || '');
  const bEmail   = SalesOnToolSafety.escape(v('bizEmail')   || '');
  const bWeb     = SalesOnToolSafety.escape(v('bizWebsite') || '');

  // Customer
  const cName    = SalesOnToolSafety.escape(v('custName')    || 'Customer Name');
  const cCompany = SalesOnToolSafety.escape(v('custCompany') || '');
  const cAddr    = SalesOnToolSafety.escape(v('custAddress') || '');
  const cGSTIN   = SalesOnToolSafety.escape(v('custGSTIN')   || '');
  const cPhone   = SalesOnToolSafety.escape(v('custPhone')   || '');
  const cEmail   = SalesOnToolSafety.escape(v('custEmail')   || '');

  // Quotation meta
  const qNum    = SalesOnToolSafety.escape(v('quoteNumber') || '—');
  const qDate   = formatDate(v('quoteDate'));
  const qValid  = formatDate(v('validUntil'));
  const qPrep   = SalesOnToolSafety.escape(v('preparedBy')  || '');
  const qRef    = SalesOnToolSafety.escape(v('refNumber')   || '');
  const qTitle  = SalesOnToolSafety.escape(v('projectTitle')|| '');
  const qSales  = SalesOnToolSafety.escape(v('salesperson') || '');
  const qBeat   = SalesOnToolSafety.escape(v('beatRoute')   || '');

  // Optional sections
  const scope    = SalesOnToolSafety.escape(v('scopeOfWork')      || '');
  const delivery = SalesOnToolSafety.escape(v('deliveryTimeline') || '');
  const warranty = SalesOnToolSafety.escape(v('warranty')         || '');
  const excl     = SalesOnToolSafety.escape(v('exclusions')       || '');
  const notes    = SalesOnToolSafety.escape(v('quoteNotes')       || '');
  const terms    = SalesOnToolSafety.escape(v('quoteTerms')       || '');
  const sigName  = SalesOnToolSafety.escape(v('signatoryName')    || 'Authorized Signatory');

  // Advanced
  const payTerms    = SalesOnToolSafety.escape(v('paymentTerms')    || '');
  const otherLabel  = SalesOnToolSafety.escape(v('otherChargesLabel')|| 'Other Charges');

  // Logo and signature HTML
  const logoHTML = logoDataURL
    ? `<img class="qt-logo" src="${logoDataURL}" alt="Company Logo">`
    : `<div style="font-family:'DM Serif Display',serif;font-size:20px;color:var(--accent);">${bName}</div>`;

  const sigImgStyle = sigDataURL ? 'display:block;' : 'display:none;';

  // Items rows HTML
  const itemRowsHTML = items.map((it, i) => `
    <tr>
      <td>${i + 1}</td>
      <td style="font-weight:600;color:var(--ink);">${SalesOnToolSafety.escape(it.desc)}</td>
      <td>${it.hsn || '—'}</td>
      <td style="text-align:center;">${it.qty}</td>
      <td style="text-align:center;">${SalesOnToolSafety.escape(it.unit)}</td>
      <td style="text-align:right;">${fmtINR(it.rate)}</td>
      <td style="text-align:center;">${it.disc > 0 ? it.disc + '%' : '—'}</td>
      <td style="text-align:center;">${it.gstPct > 0 ? it.gstPct + '%' : '—'}</td>
      <td style="text-align:right;">${fmtINR(it.taxable)}</td>
      <td style="text-align:right;">${it.gstAmt > 0 ? fmtINR(it.gstAmt) : '—'}</td>
      <td style="text-align:right;font-weight:700;color:var(--ink);">${fmtINR(it.total)}</td>
    </tr>`).join('');

  // Summary HTML
  let summaryHTML = `
    <div class="qt-summary-row"><span class="s-label">Subtotal</span><span class="s-val">${fmtINR(T.subTotal)}</span></div>
    ${T.totalDiscount > 0 ? `<div class="qt-summary-row"><span class="s-label">Discount</span><span class="s-val" style="color:var(--green);">− ${fmtINR(T.totalDiscount)}</span></div>` : ''}
    <div class="qt-summary-row"><span class="s-label">Taxable Value</span><span class="s-val">${fmtINR(T.totalTaxable)}</span></div>
    ${T.totalGST > 0 ? `<div class="qt-summary-row"><span class="s-label">GST Total</span><span class="s-val">${fmtINR(T.totalGST)}</span></div>` : ''}
    ${T.otherCharges > 0 ? `<div class="qt-summary-row"><span class="s-label">${otherLabel || 'Other Charges'}</span><span class="s-val">${fmtINR(T.otherCharges)}</span></div>` : ''}
    ${T.roundOff !== 0 ? `<div class="qt-summary-row"><span class="s-label">Round Off</span><span class="s-val">${T.roundOff >= 0 ? '+' : ''}${T.roundOff.toFixed(2)}</span></div>` : ''}
    <div class="qt-summary-row total"><span class="s-label">Grand Total</span><span class="s-val">${fmtINR(T.grandTotal)}</span></div>
    ${T.advancePct > 0 ? `
      <div class="qt-summary-row"><span class="s-label">Advance (${T.advancePct}%)</span><span class="s-val" style="color:var(--green);">${fmtINR(T.advanceAmt)}</span></div>
      <div class="qt-summary-row" style="font-weight:800;"><span class="s-label" style="color:var(--ink);">Balance Amount</span><span class="s-val" style="color:${T.balanceAmt > 0 ? '#1a56db' : 'var(--green)'};">${fmtINR(T.balanceAmt)}</span></div>
    ` : ''}
  `;

  // Template class
  const tplClass = 'qt-' + currentTemplate;

  const html = `
  <div class="${tplClass}" style="--accent:${currentAccent};">
    <div class="qt-header">
      <div>
        ${logoHTML}
        <div class="qt-seller-name">${bName}</div>
        <div class="qt-seller-detail">
          ${bGSTIN ? 'GSTIN: ' + bGSTIN + '<br>' : ''}
          ${bAddr ? bAddr + '<br>' : ''}
          ${bPhone ? '📞 ' + bPhone + '&nbsp;&nbsp;' : ''}${bEmail ? '✉️ ' + bEmail : ''}
          ${bWeb ? '<br>🌐 ' + bWeb : ''}
        </div>
      </div>
      <div>
        <div class="qt-doc-title">QUOTATION</div>
        <div class="qt-doc-meta">
          No: <strong>${qNum}</strong><br>
          Date: ${qDate || '—'}<br>
          ${qValid ? 'Valid Until: <strong>' + qValid + '</strong><br>' : ''}
          ${qPrep ? 'Prepared By: ' + qPrep + '<br>' : ''}
          ${qRef ? 'Ref: ' + qRef + '<br>' : ''}
          ${qSales ? 'Salesperson: ' + qSales : ''}
        </div>
      </div>
    </div>

    <div class="qt-body">
      <div class="qt-bill-row">
        <div>
          <div class="qt-bill-label">Quotation For</div>
          <div class="qt-bill-name">${cName}</div>
          <div class="qt-bill-detail">
            ${cCompany ? '<em>' + cCompany + '</em><br>' : ''}
            ${cGSTIN ? 'GSTIN: ' + cGSTIN + '<br>' : ''}
            ${cAddr}
            ${cPhone ? '<br>📞 ' + cPhone : ''}
            ${cEmail ? '<br>✉️ ' + cEmail : ''}
          </div>
        </div>
        <div>
          ${qTitle ? `<div class="qt-bill-label">Subject</div><div class="qt-project-title" style="border:none;padding:0;margin:0;">${qTitle}</div>` : ''}
          ${qBeat ? `<div class="qt-bill-label" style="margin-top:10px;">Beat / Route</div><div class="qt-bill-detail">${qBeat}</div>` : ''}
          ${payTerms ? `<div class="qt-bill-label" style="margin-top:10px;">Payment Terms</div><div class="qt-bill-detail" style="font-weight:600;color:var(--ink);">${payTerms}</div>` : ''}
        </div>
      </div>

      <table class="qt-items-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Item / Service</th>
            <th>HSN/SAC</th>
            <th>Qty</th>
            <th>Unit</th>
            <th>Rate</th>
            <th>Disc</th>
            <th>GST%</th>
            <th>Taxable</th>
            <th>GST Amt</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>${itemRowsHTML}</tbody>
      </table>

      <div class="qt-summary">
        <div class="qt-summary-table">${summaryHTML}</div>
      </div>

      <div class="qt-words">
        <strong>Amount in Words:</strong> ${amountToWords(T.grandTotal)}
      </div>

      ${scope ? `<div class="qt-section-block"><strong>Scope of Work</strong><p>${scope}</p></div>` : ''}
      ${delivery ? `<div class="qt-section-block"><strong>Delivery Timeline</strong><p>${delivery}</p></div>` : ''}
      ${warranty ? `<div class="qt-section-block"><strong>Warranty / Guarantee</strong><p>${warranty}</p></div>` : ''}
      ${excl ? `<div class="qt-section-block"><strong>Exclusions</strong><p>${excl}</p></div>` : ''}

      ${(notes || terms) ? `
      <div class="qt-section-block">
        ${notes ? `<strong>Notes</strong><p>${notes}</p>` : ''}
        ${terms ? `<strong style="margin-top:8px;display:block;">Terms &amp; Conditions</strong><p>${terms}</p>` : ''}
      </div>` : ''}

      <div class="qt-sig-row">
        <div class="qt-sig-box">
          <img class="qt-sig-img" src="${sigDataURL || 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs='}" alt="Signature" style="${sigImgStyle}">
          <div class="qt-sig-line"></div>
          <div class="qt-sig-name">${sigName}</div>
          <div class="qt-sig-label">For ${bName}</div>
        </div>
      </div>
    </div>

    <div class="qt-disclaimer">
      ⚠️ SalesOn Free Tools help you create professional document formats. Please verify tax and legal compliance with your accountant before issuing official documents.
    </div>

    <div class="qt-footer-strip">
      Created using SalesOn Free Business Tools · saleson.co.in
    </div>
  </div>`;

  document.getElementById('quotePreview').innerHTML = SalesOnToolSafety.html(html);
}

/* ─────────────────────────
   COLLAPSIBLE SECTIONS
───────────────────────── */
function toggleSection(btn) {
  const body = btn.nextElementSibling;
  const isOpen = btn.classList.contains('open');
  btn.classList.toggle('open', !isOpen);
  body.classList.toggle('open', !isOpen);
}

/* ─────────────────────────
   DESIGN: TEMPLATE + ACCENT
───────────────────────── */
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

/* ─────────────────────────
   UPLOADS
───────────────────────── */
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


/* Build a print-only copy at body level. This prevents the hidden webpage from
   retaining its height and creating extra blank print pages. */
function prepareSalesOnPrint(sourceId) {
  const existing = document.getElementById('salesonPrintRoot');
  if (existing) existing.remove();

  const source = document.getElementById(sourceId);
  if (!source) return false;

  const root = document.createElement('div');
  root.id = 'salesonPrintRoot';

  const printable = source.cloneNode(true);
  printable.classList.add('saleson-print-document');
  root.appendChild(printable);
  document.body.appendChild(root);

  // Force layout before opening the browser print dialog.
  void root.offsetHeight;
  return true;
}

function cleanupSalesOnPrint() {
  const root = document.getElementById('salesonPrintRoot');
  if (root) root.remove();
}

window.addEventListener('afterprint', cleanupSalesOnPrint);

/* ─────────────────────────
   ACTION TRIGGER — checks lead first
───────────────────────── */
function triggerAction(action) {  executeAction(action); }

function executeAction(action) {
  if (action === 'pdf' || action === 'print') {
    prepareSalesOnPrint('quotePreview');
    window.print();
  } else if (action === 'wa') {
    openWaShare();
  } else if (action === 'convert') {
    doConvertToInvoice();
  }
}

/* ─────────────────────────
   CONVERT TO INVOICE
───────────────────────── */
function doConvertToInvoice() {
  const items = getItemsData();
  const rows  = document.querySelectorAll('#itemsBody tr');
  const itemsArr = [];
  rows.forEach(row => {
    const inp = row.querySelectorAll('input, select');
    itemsArr.push({
      desc: inp[0].value, hsn: inp[1].value,
      qty: inp[2].value, unit: inp[3].value,
      rate: inp[4].value, disc: inp[5].value, gst: inp[6].value
    });
  });

  const payload = {
    sellerName:    v('bizName'),
    sellerGSTIN:   v('bizGSTIN'),
    sellerAddress: v('bizAddress'),
    sellerPhone:   v('bizPhone'),
    sellerEmail:   v('bizEmail'),
    buyerName:     v('custName'),
    buyerGSTIN:    v('custGSTIN'),
    buyerBillingAddress: v('custAddress'),
    buyerPhone:    v('custPhone'),
    projectTitle:  v('projectTitle'),
    refNumber:     v('refNumber'),
    paymentTerms:  v('paymentTerms'),
    invNotes:      v('quoteNotes'),
    invTerms:      v('quoteTerms'),
    signatoryName: v('signatoryName'),
    logoDataURL,
    sigDataURL,
    items: itemsArr,
    convertedFromQuote: v('quoteNumber'),
    convertedAt: new Date().toISOString()
  };

  if (!SalesOnStorage.setItem('saleson_quote_to_invoice_data', JSON.stringify(payload))) { alert('Transfer unavailable because browser storage is blocked or full. Download or print this document instead.'); return; }
  convertedToInvoice = true;

  // Show success message
  const el = document.getElementById('convertSuccess');
  el.classList.add('show');
  el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  showToast('Quotation data saved. Open GST Invoice Generator ✓');
}

/* ─────────────────────────
   WHATSAPP SHARE
───────────────────────── */
function openWaShare() {
  const items = getItemsData();
  const T = computeTotals(items);
  const cName  = v('custName')    || 'Customer';
  const qNum   = v('quoteNumber') || '—';
  const bName  = v('bizName')     || 'Your Business';
  const qValid = formatDate(v('validUntil'));

  const msg = `Hi ${cName},\n\nPlease find Quotation No. ${qNum} from ${bName} for ${fmtINR(T.grandTotal)}.\n\n${qValid ? 'This quotation is valid until ' + qValid + '.\n\n' : ''}Created using SalesOn Free Business Tools — saleson.co.in`;

  document.getElementById('waMessageBox').textContent = msg;
  const encoded = encodeURIComponent(msg);
  document.getElementById('waOpenBtn').href = `https://wa.me/?text=${encoded}`;
  document.getElementById('waModal').classList.add('open');
}

function copyWaMessage() {
  const msg = document.getElementById('waMessageBox').textContent;
  return SalesOnToolSafety.copy(msg).then(ok => showToast(ok ? 'Copied to clipboard.' : 'Copy failed. Select and copy the text manually.'));
}

/* ─────────────────────────
   LEAD MODAL
───────────────────────── */


function skipLead() {}

/* ─────────────────────────
   DRAFT SAVE / LOAD
───────────────────────── */
function saveDraft() {
  const rows = document.querySelectorAll('#itemsBody tr');
  const itemsArr = [];
  rows.forEach(row => {
    const inp = row.querySelectorAll('input, select');
    itemsArr.push({
      desc: inp[0].value, hsn: inp[1].value,
      qty: inp[2].value, unit: inp[3].value,
      rate: inp[4].value, disc: inp[5].value, gst: inp[6].value
    });
  });

  const draft = {
    bizName: v('bizName'), bizGSTIN: v('bizGSTIN'), bizAddress: v('bizAddress'),
    bizPhone: v('bizPhone'), bizEmail: v('bizEmail'), bizWebsite: v('bizWebsite'),
    custName: v('custName'), custCompany: v('custCompany'), custAddress: v('custAddress'),
    custGSTIN: v('custGSTIN'), custPhone: v('custPhone'), custEmail: v('custEmail'),
    quoteNumber: v('quoteNumber'), quoteDate: v('quoteDate'), validUntil: v('validUntil'),
    preparedBy: v('preparedBy'), refNumber: v('refNumber'), salesperson: v('salesperson'),
    projectTitle: v('projectTitle'), beatRoute: v('beatRoute'),
    priceInclTax: document.getElementById('priceInclTax').checked,
    roundOff: document.getElementById('roundOff').checked,
    otherCharges: v('otherCharges'), otherChargesLabel: v('otherChargesLabel'),
    advancePct: v('advancePct'), paymentTerms: v('paymentTerms'),
    scopeOfWork: v('scopeOfWork'), deliveryTimeline: v('deliveryTimeline'),
    warranty: v('warranty'), exclusions: v('exclusions'),
    quoteNotes: v('quoteNotes'), quoteTerms: v('quoteTerms'),
    signatoryName: v('signatoryName'),
    template: currentTemplate, accent: currentAccent,
    logoDataURL, sigDataURL,
    items: itemsArr,
    savedAt: new Date().toISOString()
  };

  SalesOnStorage.setItem('saleson_quotation_draft', JSON.stringify(draft));
  showToast(SalesOnStorage.persistent ? 'Draft saved ✓' : 'Not saved to browser storage. Keep this tab open or export your work.');
}

function loadDraft() {
  const raw = SalesOnStorage.getItem('saleson_quotation_draft');
  if (!raw) { showToast('No saved draft found'); return; }
  const d = SalesOnToolSafety.draft(raw);
  if (!confirm('Restore saved draft? This replaces the current workspace.')) return;

  [
    'bizName','bizGSTIN','bizAddress','bizPhone','bizEmail','bizWebsite',
    'custName','custCompany','custAddress','custGSTIN','custPhone','custEmail',
    'quoteNumber','quoteDate','validUntil','preparedBy','refNumber','salesperson',
    'projectTitle','beatRoute','otherCharges','otherChargesLabel','advancePct','paymentTerms',
    'scopeOfWork','deliveryTimeline','warranty','exclusions','quoteNotes','quoteTerms','signatoryName'
  ].forEach(id => { if (d[id] !== undefined) sv(id, d[id]); });

  document.getElementById('priceInclTax').checked = !!d.priceInclTax;
  document.getElementById('roundOff').checked = d.roundOff !== false;

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
    document.querySelectorAll('.tpl-pill').forEach(p => {
      p.classList.remove('active');
      if (p.textContent.toLowerCase().trim() === d.template) p.classList.add('active');
    });
  }
  if (d.accent) {
    currentAccent = d.accent;
    document.querySelectorAll('.accent-pill').forEach(p => {
      p.classList.remove('active');
      const onclick = p.getAttribute('onclick') || '';
      if (onclick.includes(d.accent)) p.classList.add('active');
    });
  }

  document.getElementById('itemsBody').innerHTML = '';
  itemRowCount = 0;
  (d.items || []).forEach(it => addItemRow({ desc: it.desc, hsn: it.hsn, qty: it.qty, unit: it.unit, rate: it.rate, disc: it.disc, gst: it.gst }));

  renderPreview();
  showToast('Draft loaded ✓');
  return true;
}

/* ─────────────────────────
   RESET
───────────────────────── */
function resetForm() {
  if (!confirm('Reset all fields to sample data?')) return;
  document.getElementById('itemsBody').innerHTML = '';
  itemRowCount = 0;
  logoDataURL = null;
  sigDataURL = null;
  convertedToInvoice = false;
  document.getElementById('logoPreviewThumb').style.display = 'none';
  document.getElementById('sigPreviewThumb').style.display  = 'none';
  document.getElementById('convertSuccess').classList.remove('show');
  document.getElementById('priceInclTax').checked = false;
  document.getElementById('roundOff').checked = true;
  initDefaults();
  showToast('Form reset ✓');
}

/* ─────────────────────────
   FAQ
───────────────────────── */
function toggleFaq(btn) {
  const a = btn.nextElementSibling;
  const isOpen = btn.classList.contains('open');
  document.querySelectorAll('.faq-q').forEach(b => {
    b.classList.remove('open');
    b.nextElementSibling.classList.remove('open');
  });
  if (!isOpen) { btn.classList.add('open'); a.classList.add('open'); }
}

/* ─────────────────────────
   TOAST
───────────────────────── */
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2500);
}

/* ─────────────────────────
   HELPERS
───────────────────────── */
function v(id)       { const el = document.getElementById(id); return el ? el.value : ''; }
function sv(id, val) { const el = document.getElementById(id); if (el) el.value = val; }

/* ─────────────────────────
   INIT
───────────────────────── */

function applyIncomingQuotation() {
  const params=new URLSearchParams(location.search);
  let incoming=SalesOnHandoff.takeLatest([{key:'saleson_selected_hsn_for_quotation',kind:'hsn'},{key:'saleson_gst_calculator_to_quotation',kind:'calculator'}]);
  if(!incoming&&params.has('hsn_code'))incoming={kind:'hsn',data:{code:params.get('hsn_code'),description:params.get('item_desc'),gstRate:params.get('gst_rate')}};
  if(!incoming)return;
  const data=incoming.data;
  const items=incoming.kind==='hsn'?[{desc:data.description||data.itemDescription,hsn:data.code,qty:1,unit:'Nos',rate:0,gst:data.gstRate}]:data.items;
  if(!Array.isArray(items)||!items.length)return;
  try {
    // Validate every rate before replacing sample rows or consuming user edits.
    for(const item of items)SalesOnToolSafety.setGST(document.createElement('select'),item.gst??item.gstRate);
    document.getElementById('itemsBody').replaceChildren();itemRowCount=0;
    items.forEach(item=>addItemRow({desc:item.desc||item.description||item.name||'',hsn:item.hsn||item.code||'',qty:item.qty??1,unit:item.unit||'Nos',rate:item.rate??0,disc:item.disc??0,gst:item.gst??item.gstRate}));
    document.getElementById('priceInclTax').checked=data.priceIncludesTax===true;renderPreview();
    document.getElementById('tool-example-label').textContent='Imported item — review the details and confirmed rate.';
    showToast('Item imported. Verify the code, rate and prices before use.');
    ['hsn_code','hsn_type','item_desc','gst_rate'].forEach(key=>params.delete(key));
    history.replaceState(null,'',location.pathname+(params.size?'?'+params.toString():'')+location.hash);
  }catch(error){document.getElementById('tool-action-status').textContent='Import stopped: confirm a valid GST rate before transferring this item.';}
}
initDefaults();


applyIncomingQuotation();
