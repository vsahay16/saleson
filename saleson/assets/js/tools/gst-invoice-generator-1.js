
/* ─────────────────────────
   STATE
───────────────────────── */
let currentTemplate = 'classic';
let currentAccent = '#1a56db';
let logoDataURL = null;
let sigDataURL = null;
let pendingAction = null; // 'pdf' | 'print' | 'wa'

/* ─────────────────────────
   INDIAN STATES
───────────────────────── */
const INDIAN_STATES = [
  ['01','Jammu & Kashmir'],['02','Himachal Pradesh'],['03','Punjab'],
  ['04','Chandigarh'],['05','Uttarakhand'],['06','Haryana'],['07','Delhi'],
  ['08','Rajasthan'],['09','Uttar Pradesh'],['10','Bihar'],['11','Sikkim'],
  ['12','Arunachal Pradesh'],['13','Nagaland'],['14','Manipur'],['15','Mizoram'],
  ['16','Tripura'],['17','Meghalaya'],['18','Assam'],['19','West Bengal'],
  ['20','Jharkhand'],['21','Odisha'],['22','Chhattisgarh'],['23','Madhya Pradesh'],
  ['24','Gujarat'],['25','Daman & Diu'],['26','Dadra & Nagar Haveli'],
  ['27','Maharashtra'],['28','Andhra Pradesh'],['29','Karnataka'],['30','Goa'],
  ['31','Lakshadweep'],['32','Kerala'],['33','Tamil Nadu'],['34','Puducherry'],
  ['35','Andaman & Nicobar'],['36','Telangana'],['37','Andhra Pradesh (New)'],
  ['38','Ladakh'],['97','Other Territory'],['99','Centre Jurisdiction']
];

function populateStates() {
  ['sellerState','buyerState','placeOfSupply'].forEach(id => {
    const sel = document.getElementById(id);
    if (!sel) return;
    INDIAN_STATES.forEach(([code, name]) => {
      const opt = document.createElement('option');
      opt.value = code;
      opt.textContent = code + ' — ' + name;
      sel.appendChild(opt);
    });
  });
  // auto fill state code on selection
  document.getElementById('sellerState').addEventListener('change', function() {
    document.getElementById('sellerStateCode').value = this.value;
    renderPreview();
  });
  document.getElementById('buyerState').addEventListener('change', function() {
    document.getElementById('buyerStateCode').value = this.value;
    renderPreview();
  });
  document.getElementById("placeOfSupply").addEventListener("change", renderPreview);
}

/* ─────────────────────────
   INIT DEFAULTS
───────────────────────── */
function initDefaults() {
  // Invoice number
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth()+1).padStart(2,'0');
  const dd = String(today.getDate()).padStart(2,'0');
  document.getElementById('invNumber').value = 'INV-' + yyyy + mm + dd + '-001';
  document.getElementById('invDate').value = yyyy + '-' + mm + '-' + dd;
  // Due date +30 days
  const due = new Date(today.getTime() + 30*24*60*60*1000);
  document.getElementById('invDueDate').value = SalesOnDates.localDate(due);

  // Sample data
  document.getElementById('sellerName').value = 'Shree Balaji Distributors';
  document.getElementById('sellerGSTIN').value = '10ABCDE1234F1Z5';
  document.getElementById('sellerAddress').value = 'Station Road, Patna, Bihar - 800001';
  document.getElementById('sellerState').value = '10';
  document.getElementById('sellerStateCode').value = '10';
  document.getElementById('sellerPhone').value = '+91-9876543210';
  document.getElementById('sellerEmail').value = 'accounts@example.com';

  document.getElementById('buyerName').value = 'Mohan Retail Store';
  document.getElementById('buyerGSTIN').value = '10AAACM1234B1Z6';
  document.getElementById('buyerBillingAddress').value = 'Boring Road, Patna, Bihar - 800001';
  document.getElementById('buyerState').value = '10';
  document.getElementById('buyerStateCode').value = '10';
  document.getElementById('buyerPhone').value = '+91-9800000001';
  document.getElementById('placeOfSupply').value = '10';

  document.getElementById('paymentTerms').value = 'Net 30 days';
  document.getElementById('invNotes').value = 'Thank you for your business.';
  document.getElementById('invTerms').value = 'Goods once sold will not be taken back. Subject to Patna jurisdiction.';
  document.getElementById('signatoryName').value = 'Authorized Signatory';

  // Add one sample item row
  addItemRow({ desc:'FMCG Product Box', hsn:'3401', qty:10, unit:'Box', rate:500, disc:0, gst:18 });
  renderPreview();
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
        <option value="18" ${(d.gst||0)==18?'selected':''}>18%</option>
        <option value="28">28%</option>
        <option value="40">40% (De-merit)</option>
      </select>
    </td>
    <td class="computed" id="${id}_tax">—</td>
    <td class="computed" id="${id}_taxamt">—</td>
    <td class="computed" id="${id}_total">—</td>
    <td><button class="btn-remove-row" onclick="removeItemRow('${id}')">✕</button></td>
  `;
  tr.querySelectorAll('input').forEach((input, i) => { input.value = String([d.desc||'',d.hsn||'',d.qty??1,d.unit||'Nos',d.rate||0,d.disc||0][i] ?? ""); });
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
  const qty = parseFloat(inputs[2].value) || 0;
  const rate = parseFloat(inputs[4].value) || 0;
  const disc = parseFloat(inputs[5].value) || 0;
  const gstPct = parseFloat(inputs[6].value) || 0;
  const inclTax = document.getElementById('priceInclTax').checked;
  const bos = document.getElementById('billOfSupply').checked;

  let taxable, taxAmt, total;
  if (inclTax && gstPct > 0 && !bos) {
    // Inclusive: derive taxable from gross
    const gross = qty * rate * (1 - disc/100);
    taxable = gross / (1 + gstPct/100);
    taxAmt = gross - taxable;
    total = gross;
  } else {
    taxable = qty * rate * (1 - disc/100);
    taxAmt = bos ? 0 : taxable * gstPct / 100;
    total = taxable + taxAmt;
  }

  document.getElementById(id+'_tax').textContent = taxable.toFixed(2);
  document.getElementById(id+'_taxamt').textContent = bos ? '—' : taxAmt.toFixed(2);
  document.getElementById(id+'_total').textContent = fmtINR(total);
  renderPreview();
}

/* ─────────────────────────
   COLLECT ITEMS DATA
───────────────────────── */
function getItemsData() {
  const rows = document.querySelectorAll('#itemsBody tr');
  const bos = document.getElementById('billOfSupply').checked;
  const inclTax = document.getElementById('priceInclTax').checked;
  const interState = getInterState();
  const items = [];

  rows.forEach(row => {
    const inp = row.querySelectorAll('input, select');
    const qty = parseFloat(inp[2].value) || 0;
    const rate = parseFloat(inp[4].value) || 0;
    const disc = parseFloat(inp[5].value) || 0;
    const gstPct = parseFloat(inp[6].value) || 0;

    let taxable, taxAmt, cgst, sgst, igst, total;
    if (inclTax && gstPct > 0 && !bos) {
      const gross = qty * rate * (1 - disc/100);
      taxable = gross / (1 + gstPct/100);
      taxAmt = gross - taxable;
      total = gross;
    } else {
      taxable = qty * rate * (1 - disc/100);
      taxAmt = bos ? 0 : taxable * gstPct / 100;
      total = taxable + taxAmt;
    }

    cgst = (!bos && !interState) ? taxAmt/2 : 0;
    sgst = (!bos && !interState) ? taxAmt/2 : 0;
    igst = (!bos && interState) ? taxAmt : 0;

    items.push({
      desc: inp[0].value || '—',
      hsn: inp[1].value || '',
      qty, unit: inp[3].value || 'Nos', rate, disc, gstPct,
      taxable, cgst, sgst, igst, taxAmt, total
    });
  });
  return items;
}

function getInterState() {
  const supplierState =
    document.getElementById("sellerState").value.trim() ||
    document.getElementById("sellerStateCode").value.trim();

  const placeOfSupply =
    document.getElementById("placeOfSupply").value.trim();

  return Boolean(
    supplierState &&
    placeOfSupply &&
    supplierState !== placeOfSupply
  );
}

/* ─────────────────────────
   TOTALS
───────────────────────── */
function computeTotals(items) {
  let subTotal=0, totalDiscount=0, totalTaxable=0, totalCGST=0, totalSGST=0, totalIGST=0, totalTax=0, grandRaw=0;
  items.forEach(it => {
    subTotal += it.qty * it.rate;
    totalDiscount += it.qty * it.rate * it.disc/100;
    totalTaxable += it.taxable;
    totalCGST += it.cgst;
    totalSGST += it.sgst;
    totalIGST += it.igst;
    totalTax += it.taxAmt;
    grandRaw += it.total;
  });
  const doRound = document.getElementById('roundOff').checked;
  const roundOff = doRound ? Math.round(grandRaw) - grandRaw : 0;
  const grandTotal = doRound ? Math.round(grandRaw) : grandRaw;
  const amtPaid = Math.max(0, parseFloat(document.getElementById('amountPaid').value) || 0);
  const balanceDue = Math.max(0, grandTotal - amtPaid);
  return { subTotal, totalDiscount, totalTaxable, totalCGST, totalSGST, totalIGST, totalTax, grandRaw, roundOff, grandTotal, amtPaid, balanceDue };
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
  const [y,m,day] = d.split('-');
  return day + '/' + m + '/' + y;
}

/* ─────────────────────────
   RENDER INVOICE PREVIEW
───────────────────────── */
function renderPreview() {
  const bos = document.getElementById('billOfSupply').checked;
  const interState = getInterState();
  const items = getItemsData();
  const T = computeTotals(items);

  // Seller
  const sName = SalesOnToolSafety.escape(document.getElementById('sellerName').value || 'Your Business Name');
  const sGSTIN = SalesOnToolSafety.escape(document.getElementById('sellerGSTIN').value || '');
  const sAddr = SalesOnToolSafety.escape(document.getElementById('sellerAddress').value || '');
  const sPhone = SalesOnToolSafety.escape(document.getElementById('sellerPhone').value || '');
  const sEmail = SalesOnToolSafety.escape(document.getElementById('sellerEmail').value || '');

  // Buyer
  const bName = SalesOnToolSafety.escape(document.getElementById('buyerName').value || 'Customer Name');
  const bGSTIN = SalesOnToolSafety.escape(document.getElementById('buyerGSTIN').value || '');
  const bBillAddr = SalesOnToolSafety.escape(document.getElementById('buyerBillingAddress').value || '');
  const bShipAddr = SalesOnToolSafety.escape(document.getElementById('buyerShippingAddress').value || '');
  const bPhone = SalesOnToolSafety.escape(document.getElementById('buyerPhone').value || '');

  // Invoice
  const invNum = SalesOnToolSafety.escape(document.getElementById('invNumber').value || '—');
  const invDate = formatDate(document.getElementById('invDate').value);
  const invDue = formatDate(document.getElementById('invDueDate').value);
  const posState = SalesOnToolSafety.escape(document.getElementById('placeOfSupply').value);
  const posName = INDIAN_STATES.find(s=>s[0]===posState)?.[1] || posState;
  const revCharge = SalesOnToolSafety.escape(document.getElementById('reverseCharge').value);
  const notes = SalesOnToolSafety.escape(document.getElementById('invNotes').value);
  const terms = SalesOnToolSafety.escape(document.getElementById('invTerms').value);
  const sigName = SalesOnToolSafety.escape(document.getElementById('signatoryName').value || 'Authorized Signatory');
  const payMethod = SalesOnToolSafety.escape(document.getElementById('paymentMethod').value);
  const upiId = SalesOnToolSafety.escape(document.getElementById('upiId').value);

  // Logo / Sig HTML
  const logoHTML = logoDataURL ? `<img class="inv-logo" src="${logoDataURL}" alt="Business Logo">` : `<div style="font-family:'DM Serif Display',serif;font-size:20px;color:var(--accent);">${sName}</div>`;
  const sigImgStyle = sigDataURL ? 'display:block;' : 'display:none;';
  const sigSrc = sigDataURL || 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=';

  // Items rows
  let itemRows = '';
  items.forEach((it, i) => {
    const taxCol = bos ? '—' : (interState ?
      `<td style="text-align:right;color:var(--ink-soft);">${fmtINR(it.igst)}</td>` :
      `<td style="text-align:right;color:var(--ink-soft);">${fmtINR(it.cgst)}</td><td style="text-align:right;color:var(--ink-soft);">${fmtINR(it.sgst)}</td>`
    );
    const taxHeader = bos ? '' : (interState ? '<th>IGST</th>' : '<th>CGST</th><th>SGST</th>');
    itemRows += `
      <tr>
        <td style="color:var(--ink);font-weight:600;">${i+1}. ${SalesOnToolSafety.escape(it.desc)}</td>
        <td>${SalesOnToolSafety.escape(it.hsn)}</td>
        <td style="text-align:center;">${it.qty}</td>
        <td style="text-align:center;">${SalesOnToolSafety.escape(it.unit)}</td>
        <td style="text-align:right;">${fmtINR(it.rate)}</td>
        ${it.disc>0?`<td style="text-align:center;">${it.disc}%</td>`:'<td style="text-align:center;">—</td>'}
        <td style="text-align:center;">${bos?'—':it.gstPct+'%'}</td>
        <td style="text-align:right;">${fmtINR(it.taxable)}</td>
        ${bos ? '' : (interState ? `<td style="text-align:right;">${fmtINR(it.igst)}</td>` : `<td style="text-align:right;">${fmtINR(it.cgst)}</td><td style="text-align:right;">${fmtINR(it.sgst)}</td>`)}
        <td style="text-align:right;font-weight:700;color:var(--ink);">${fmtINR(it.total)}</td>
      </tr>`;
  });

  const taxHeaders = bos ? '' : (interState ? '<th>IGST</th>' : '<th>CGST</th><th>SGST</th>');

  // Summary rows
  let summaryHTML = `
    <div class="inv-summary-row"><span class="s-label">Subtotal</span><span class="s-val">${fmtINR(T.subTotal)}</span></div>
    ${T.totalDiscount>0?`<div class="inv-summary-row"><span class="s-label">Discount</span><span class="s-val" style="color:var(--green);">− ${fmtINR(T.totalDiscount)}</span></div>`:''}
    <div class="inv-summary-row"><span class="s-label">Taxable Value</span><span class="s-val">${fmtINR(T.totalTaxable)}</span></div>
  `;
  if (!bos) {
    if (interState) {
      summaryHTML += `<div class="inv-summary-row"><span class="s-label">IGST</span><span class="s-val">${fmtINR(T.totalIGST)}</span></div>`;
    } else {
      summaryHTML += `<div class="inv-summary-row"><span class="s-label">CGST</span><span class="s-val">${fmtINR(T.totalCGST)}</span></div>`;
      summaryHTML += `<div class="inv-summary-row"><span class="s-label">SGST</span><span class="s-val">${fmtINR(T.totalSGST)}</span></div>`;
    }
  }
  if (T.roundOff !== 0) {
    summaryHTML += `<div class="inv-summary-row"><span class="s-label">Round Off</span><span class="s-val">${T.roundOff>=0?'+':''}${T.roundOff.toFixed(2)}</span></div>`;
  }
  summaryHTML += `<div class="inv-summary-row total"><span class="s-label">Grand Total</span><span class="s-val">${fmtINR(T.grandTotal)}</span></div>`;
  if (T.amtPaid > 0) {
    summaryHTML += `<div class="inv-summary-row"><span class="s-label">Amount Paid</span><span class="s-val" style="color:var(--green);">− ${fmtINR(T.amtPaid)}</span></div>`;
    summaryHTML += `<div class="inv-summary-row" style="font-weight:800;"><span class="s-label" style="color:var(--ink);">Balance Due</span><span class="s-val" style="color:${T.balanceDue>0?'#dc2626':'var(--green)'};">${fmtINR(T.balanceDue)}</span></div>`;
  }

  const tplClass = 'inv-' + currentTemplate;

  const html = `
  <div class="${tplClass}" style="--accent:${currentAccent};">
    <div class="inv-header">
      <div>
        ${logoHTML}
        <div class="inv-seller-name" style="${currentTemplate!=='classic'?'':'font-family:DM Serif Display,serif;font-size:18px;color:var(--ink);'}">${sName}</div>
        <div class="inv-seller-detail">
          ${sGSTIN?'GSTIN: '+sGSTIN+'<br>':''}
          ${sAddr?sAddr+'<br>':''}
          ${sPhone?'📞 '+sPhone+'  ':''}${sEmail?'✉️ '+sEmail:''}
        </div>
      </div>
      <div>
        <div class="inv-doc-title">${bos?'BILL OF SUPPLY':'TAX INVOICE'}</div>
        <div class="inv-doc-meta">
          No: <strong>${invNum}</strong><br>
          Date: ${invDate}<br>
          ${invDue?'Due: '+invDue+'<br>':''}
          ${posName?'Place of Supply: '+posName+'<br>':''}
          ${revCharge==='Yes'?'<span style="color:var(--amber);font-weight:700;">Reverse Charge: Yes</span><br>':''}
        </div>
      </div>
    </div>

    <div class="inv-body">
      <div class="inv-bill-row">
        <div class="inv-bill-box">
          <div class="inv-bill-label">Bill To</div>
          <div class="inv-bill-name">${bName}</div>
          <div class="inv-bill-detail">
            ${bGSTIN?'GSTIN: '+bGSTIN+'<br>':''}
            ${bBillAddr}
            ${bPhone?'<br>📞 '+bPhone:''}
          </div>
        </div>
        ${(bShipAddr && bShipAddr !== bBillAddr) ? `
        <div class="inv-bill-box">
          <div class="inv-bill-label">Ship To</div>
          <div class="inv-bill-detail">${bShipAddr}</div>
        </div>
        ` : `<div></div>`}
      </div>

      <table class="inv-items-table">
        <thead>
          <tr>
            <th>#</th><th>Item / Service</th><th>HSN</th>
            <th>Qty</th><th>Unit</th><th>Rate</th><th>Disc</th><th>GST%</th>
            <th>Taxable</th>${taxHeaders}<th>Total</th>
          </tr>
        </thead>
        <tbody>
          ${items.map((it,i)=>`
          <tr>
            <td>${i+1}</td>
            <td style="font-weight:600;color:var(--ink);">${SalesOnToolSafety.escape(it.desc)}</td>
            <td>${it.hsn||'—'}</td>
            <td style="text-align:center;">${it.qty}</td>
            <td style="text-align:center;">${SalesOnToolSafety.escape(it.unit)}</td>
            <td style="text-align:right;">${fmtINR(it.rate)}</td>
            <td style="text-align:center;">${it.disc>0?it.disc+'%':'—'}</td>
            <td style="text-align:center;">${bos?'—':it.gstPct+'%'}</td>
            <td style="text-align:right;">${fmtINR(it.taxable)}</td>
            ${bos?'':(interState?`<td style="text-align:right;">${fmtINR(it.igst)}</td>`:`<td style="text-align:right;">${fmtINR(it.cgst)}</td><td style="text-align:right;">${fmtINR(it.sgst)}</td>`)}
            <td style="text-align:right;font-weight:700;">${fmtINR(it.total)}</td>
          </tr>`).join('')}
        </tbody>
      </table>

      <div class="inv-summary">
        <div class="inv-summary-table">${summaryHTML}</div>
      </div>

      <div class="inv-words">
        <strong>Amount in Words:</strong> ${amountToWords(T.grandTotal)}
      </div>

      ${(notes||terms) ? `
      <div class="inv-notes">
        ${notes?`<strong>Notes:</strong> ${notes}<br>`:''}
        ${terms?`<strong>Terms:</strong> ${terms}`:''}
      </div>` : ''}

      ${(payMethod||upiId) ? `
      <div class="inv-notes">
        ${payMethod?`<strong>Payment Method:</strong> ${payMethod}  `:''}
        ${upiId?`<strong>UPI ID:</strong> ${upiId}`:''}
      </div>` : ''}

      <div class="inv-sig-row">
        <div class="inv-sig-box">
          <img class="inv-sig-img" src="${sigSrc}" alt="Signature" style="${sigImgStyle}">
          <div class="inv-sig-line"></div>
          <div class="inv-sig-name">${sigName}</div>
          <div class="inv-sig-label">For ${sName}</div>
        </div>
      </div>
    </div>

    <div class="inv-footer-strip">
      Created using SalesOn Free Business Tools &nbsp;|&nbsp; saleson.co.in
    </div>
    <div class="inv-disclaimer">
      This is a computer-generated document. Please verify tax and legal compliance with your accountant before issuing official documents.
    </div>
  </div>`;

  document.getElementById('invoicePreview').innerHTML = SalesOnToolSafety.html(html);
}

/* ─────────────────────────
   TOGGLE SECTION
───────────────────────── */
function toggleSection(btn) {
  const body = btn.nextElementSibling;
  const isOpen = btn.classList.contains('open');
  btn.classList.toggle('open', !isOpen);
  body.classList.toggle('open', !isOpen);
}

/* ─────────────────────────
   DESIGN
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
   ACTION TRIGGER (checks lead first)
───────────────────────── */
function triggerAction(action) {  executeAction(action); }

function executeAction(action) {
  if (action === 'pdf' || action === 'print') {
    prepareSalesOnPrint('invoicePreview');
    window.print();
  } else if (action === 'wa') {
    openWaShare();
  }
}

/* ─────────────────────────
   WHATSAPP SHARE
───────────────────────── */
function openWaShare() {
  const items = getItemsData();
  const T = computeTotals(items);
  const bName = document.getElementById('buyerName').value || 'Customer';
  const invNum = document.getElementById('invNumber').value || '—';
  const sName = document.getElementById('sellerName').value || 'Your Business';
  const msg = `Hi ${bName},\n\nPlease find Invoice No. ${invNum} from ${sName} for ${fmtINR(T.grandTotal)}.\n\nAmount Due: ${fmtINR(T.balanceDue)}\n\nCreated using SalesOn Free Business Tools — saleson.co.in`;
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
    sellerName: v('sellerName'), sellerGSTIN: v('sellerGSTIN'), sellerAddress: v('sellerAddress'),
    sellerState: v('sellerState'), sellerStateCode: v('sellerStateCode'),
    sellerPhone: v('sellerPhone'), sellerEmail: v('sellerEmail'),
    buyerName: v('buyerName'), buyerGSTIN: v('buyerGSTIN'),
    buyerBillingAddress: v('buyerBillingAddress'), buyerShippingAddress: v('buyerShippingAddress'),
    buyerState: v('buyerState'), buyerStateCode: v('buyerStateCode'), buyerPhone: v('buyerPhone'),
    invNumber: v('invNumber'), invDate: v('invDate'), invDueDate: v('invDueDate'),
    placeOfSupply: v('placeOfSupply'), reverseCharge: v('reverseCharge'),
    paymentTerms: v('paymentTerms'), salesperson: v('salesperson'), beatRoute: v('beatRoute'),
    priceInclTax: document.getElementById('priceInclTax').checked,
    roundOff: document.getElementById('roundOff').checked,
    billOfSupply: document.getElementById('billOfSupply').checked,
    paymentMethod: v('paymentMethod'), amountPaid: v('amountPaid'), upiId: v('upiId'),
    invNotes: v('invNotes'), invTerms: v('invTerms'),
    signatoryName: v('signatoryName'),
    template: currentTemplate, accent: currentAccent,
    logoDataURL, sigDataURL, items: itemsArr,
    savedAt: new Date().toISOString()
  };
  SalesOnStorage.setItem('saleson_gst_invoice_draft', JSON.stringify(draft));
  showToast(SalesOnStorage.persistent ? 'Draft saved ✓' : 'Not saved to browser storage. Keep this tab open or export your work.');
}

function loadDraft() {
  const raw = SalesOnStorage.getItem('saleson_gst_invoice_draft');
  if (!raw) { showToast('No saved draft found'); return; }
  const d = SalesOnToolSafety.draft(raw);
  if (!confirm('Restore saved draft? This replaces the current workspace.')) return;

  ['sellerName','sellerGSTIN','sellerAddress','sellerState','sellerStateCode','sellerPhone','sellerEmail',
   'buyerName','buyerGSTIN','buyerBillingAddress','buyerShippingAddress','buyerState','buyerStateCode','buyerPhone',
   'invNumber','invDate','invDueDate','placeOfSupply','reverseCharge','paymentTerms','salesperson','beatRoute',
   'paymentMethod','amountPaid','upiId','invNotes','invTerms','signatoryName'
  ].forEach(id => { if (d[id]!==undefined) sv(id, d[id]); });

  document.getElementById('priceInclTax').checked = !!d.priceInclTax;
  document.getElementById('roundOff').checked = d.roundOff !== false;
  document.getElementById('billOfSupply').checked = !!d.billOfSupply;

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
  if (d.template) { currentTemplate = d.template; document.querySelectorAll('.tpl-pill').forEach(p=>p.classList.remove('active')); document.querySelectorAll('.tpl-pill').forEach(p=>{if(p.textContent.toLowerCase()===d.template)p.classList.add('active');}); }
  if (d.accent) { currentAccent = d.accent; document.querySelectorAll('.accent-pill').forEach(p=>{p.classList.remove('active'); if(p.style.background===d.accent||p.getAttribute('onclick')&&p.getAttribute('onclick').includes(d.accent))p.classList.add('active');}); }

  document.getElementById('itemsBody').innerHTML = '';
  itemRowCount = 0;
  (d.items||[]).forEach(it => addItemRow({ desc:it.desc, hsn:it.hsn, qty:it.qty, unit:it.unit, rate:it.rate, disc:it.disc, gst:it.gst }));

  renderPreview();
  showToast('Draft loaded ✓');
  return true;
}

function v(id) { const el=document.getElementById(id); return el?el.value:''; }
function sv(id, val) { const el=document.getElementById(id); if(el) el.value=val; }

/* ─────────────────────────
   RESET FORM
───────────────────────── */
function resetForm() {
  if (!confirm('Reset all fields to sample data?')) return;
  document.getElementById('itemsBody').innerHTML = '';
  itemRowCount = 0;
  logoDataURL = null;
  sigDataURL = null;
  document.getElementById('logoPreviewThumb').style.display = 'none';
  document.getElementById('sigPreviewThumb').style.display = 'none';
  initDefaults();
  showToast('Form reset ✓');
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
  setTimeout(() => t.classList.remove('show'), 2500);
}

function replaceInvoiceItems(items) {
  if (!Array.isArray(items) || !items.length) return;

  const body = document.getElementById("itemsBody");
  body.innerHTML = "";
  itemRowCount = 0;

  items.forEach(item => {
    const normalised = {
      desc:
        item.desc ||
        item.description ||
        item.itemDescription ||
        item.name ||
        "Item / Service",

      hsn:
        item.hsn ||
        item.hsnCode ||
        item.code ||
        "",

      qty: item.qty ?? item.quantity ?? 1,
      unit: item.unit || "Nos",
      rate: Number(item.rate ?? item.taxableValue ?? 0),
      disc: Number(item.disc ?? item.discountPercent ?? 0),
      gst: Number(item.gst ?? item.gstRate ?? 0)
    };

    addItemRow(normalised);

    // Keep the explicitly supplied rate in the imported row.
    const row = body.lastElementChild;
    const gstSelect = row?.querySelector("select");

    if (gstSelect) {
      gstSelect.value = String(normalised.gst);
    }

    if (row) recalcRow(row.id);
  });
}

function fillInvoicePartyData(data) {
  const H = window.SalesOnHandoff;

  const fields = [
    "sellerName",
    "sellerGSTIN",
    "sellerAddress",
    "sellerPhone",
    "sellerEmail",
    "buyerName",
    "buyerGSTIN",
    "buyerBillingAddress",
    "buyerShippingAddress",
    "buyerPhone",
    "buyerEmail",
    "refNumber",
    "paymentTerms",
    "salesperson",
    "beatRoute",
    "vehicleNumber",
    "transporterName",
    "ewayBillNumber",
    "invNotes",
    "invTerms",
    "signatoryName"
  ];

  fields.forEach(id => H.set(id, data[id]));

  const sellerCode = H.select(
    "sellerState",
    data.sellerStateCode || data.sellerState
  );

  if (sellerCode) H.set("sellerStateCode", sellerCode);

  const buyerCode = H.select(
    "buyerState",
    data.buyerStateCode || data.buyerState
  );

  if (buyerCode) H.set("buyerStateCode", buyerCode);

  H.select(
    "placeOfSupply",
    data.placeOfSupply ||
      data.buyerStateCode ||
      data.buyerState
  );

  if (data.logoDataURL) {
    logoDataURL = data.logoDataURL;
    const preview = document.getElementById("logoPreviewThumb");
    preview.src = logoDataURL;
    preview.style.display = "block";
  }

  if (data.sigDataURL) {
    sigDataURL = data.sigDataURL;
    const preview = document.getElementById("sigPreviewThumb");
    preview.src = sigDataURL;
    preview.style.display = "block";
  }
}

function applyInvoiceHandoff() {
  const H = window.SalesOnHandoff;

  let incoming = H.takeLatest([
    {
      kind: "challan",
      key: "saleson_challan_to_invoice_data"
    },
    {
      kind: "hsn",
      key: "saleson_selected_hsn_for_invoice"
    },
    {
      kind: "calculator",
      key: "saleson_gst_calculator_to_invoice"
    },
    {
      kind: "quotation",
      key: "saleson_quote_to_invoice_data"
    },
    {
      kind: "eway",
      key: "saleson_eway_to_invoice_data"
    }
  ]);

  const params = new URLSearchParams(location.search);

  // HSN Finder already provides URL parameters as a fallback.
  if (!incoming && params.get("hsn_code")) {
    incoming = {
      kind: "hsn",
      data: {
        code: params.get("hsn_code"),
        type: params.get("hsn_type"),
        description: params.get("item_desc"),
        gstRate: params.get("gst_rate")
      }
    };
  }

  if (!incoming) return false;

  const data = incoming.data || {};

  if (
    incoming.kind === "challan" ||
    incoming.kind === "quotation"
  ) {
    fillInvoicePartyData(data);
    replaceInvoiceItems(data.items);
  }

  if (incoming.kind === "hsn") {
    if(data.gstRate===null || data.gstRate===undefined || data.gstRate==='' || !Number.isFinite(Number(data.gstRate))){
      document.getElementById('tool-action-status').textContent='Import stopped: confirm a valid GST rate before transferring this item.';return false;
    }
    replaceInvoiceItems([
      {
        desc: data.description || data.itemDescription,
        hsn: data.code,
        qty: 1,
        unit: data.type === "SAC" ? "Service" : "Nos",
        rate: 0,
        gst: data.gstRate
      }
    ]);
  }

  if (incoming.kind === "calculator") {
    const hasDetailedItems =
      Array.isArray(data.items) && data.items.length;

    const items = hasDetailedItems
      ? data.items
      : [{
          desc: "Item / Service from GST Calculator",
          qty: 1,
          unit: "Nos",
          rate: Number(data.taxableValue || 0),
          disc: 0,
          gst: Number(data.gstRate || 0)
        }];

    replaceInvoiceItems(items);

    // Only use inclusive pricing when detailed source rows exist.
    H.set(
      "priceInclTax",
      hasDetailedItems && Boolean(data.priceIncludesTax)
    );
  }

  if (incoming.kind === "eway") {
    const quantity = Number(data.quantity) || 1;
    const totalValue = Number(data.consignmentValue) || 0;

    replaceInvoiceItems([
      {
        desc: data.goodsDescription || "Goods",
        hsn: data.hsnCode || "",
        qty: quantity,
        unit: "Nos",
        rate: quantity ? totalValue / quantity : totalValue,
        gst: 0
      }
    ]);

    const sellerCode = H.select("sellerState", data.fromState);
    if (sellerCode) H.set("sellerStateCode", sellerCode);

    const buyerCode = H.select("buyerState", data.toState);
    if (buyerCode) H.set("buyerStateCode", buyerCode);

    H.select("placeOfSupply", data.toState);
    H.set("vehicleNumber", data.vehicleNumber);

    H.set(
      "invNotes",
      [
        data.reasonForMovement,
        data.result
      ].filter(Boolean).join(" — ")
    );
  }

  renderPreview();

  if (typeof showToast === "function") {
    showToast(
      "Data imported from " +
      incoming.kind +
      ". Please verify GST, state and Place of Supply."
    );
  }

  // Prevent HSN query parameters from re-importing on refresh.
  ["hsn_code", "hsn_type", "item_desc", "gst_rate"]
    .forEach(key => params.delete(key));

  const query = params.toString();

  history.replaceState(
    null,
    "",
    location.pathname +
      (query ? "?" + query : "") +
      location.hash
  );

  return true;
}

/* ─────────────────────────
   INIT
───────────────────────── */
populateStates();
initDefaults();
applyInvoiceHandoff();

