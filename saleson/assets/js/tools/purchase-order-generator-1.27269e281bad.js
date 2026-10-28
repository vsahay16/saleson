
/* ─────────────────────────────
   GLOBAL STATE
───────────────────────────── */
let currentTemplate = 'classic';
let currentAccent   = '#1143b6';
let logoDataURL     = null;
let pendingAction   = null;   // 'pdf' | 'print' | 'wa' | 'convert'
let itemRowCount    = 0;
let schedRowCount   = 0;
let delivSchedUsed  = false;  // tracked for lead scoring

/* ─────────────────────────────
   INDIAN STATES LIST
───────────────────────────── */
const STATES = [
  ['01','Jammu & Kashmir'],['02','Himachal Pradesh'],['03','Punjab'],['04','Chandigarh'],
  ['05','Uttarakhand'],['06','Haryana'],['07','Delhi'],['08','Rajasthan'],['09','Uttar Pradesh'],
  ['10','Bihar'],['11','Sikkim'],['12','Arunachal Pradesh'],['13','Nagaland'],['14','Manipur'],
  ['15','Mizoram'],['16','Tripura'],['17','Meghalaya'],['18','Assam'],['19','West Bengal'],
  ['20','Jharkhand'],['21','Odisha'],['22','Chhattisgarh'],['23','Madhya Pradesh'],['24','Gujarat'],
  ['25','Daman & Diu'],['26','Dadra & Nagar Haveli'],['27','Maharashtra'],['28','Andhra Pradesh'],
  ['29','Karnataka'],['30','Goa'],['31','Lakshadweep'],['32','Kerala'],['33','Tamil Nadu'],
  ['34','Puducherry'],['35','Andaman & Nicobar'],['36','Telangana'],['37','Andhra Pradesh (New)'],
  ['38','Ladakh'],['97','Other Territory'],['99','Centre Jurisdiction']
];

function populateStates() {
  ['buyerState','vendorState'].forEach(id => {
    const sel = document.getElementById(id);
    STATES.forEach(([code, name]) => {
      const opt = document.createElement('option');
      opt.value = code;
      opt.textContent = code + ' — ' + name;
      sel.appendChild(opt);
    });
  });
}

function autofillStateCode(stateId, codeId) {
  document.getElementById(codeId).value = document.getElementById(stateId).value;
}

/* ─────────────────────────────
   FORMAT HELPERS
───────────────────────────── */
function fmtINR(n) {
  return '₹' + Number(n.toFixed(2)).toLocaleString('en-IN', { minimumFractionDigits: 2 });
}

function formatDate(d) {
  if (!d) return '';
  const [y,m,day] = d.split('-');
  return day + '/' + m + '/' + y;
}

function amountToWords(value) { return SalesOnMoney.toWords(value); }

function applyReorderPurchaseOrderHandoff() {
  const incoming = SalesOnHandoff.takeLatest([
    {
      kind: "single",
      key: "saleson_reorder_to_purchase_order"
    },
    {
      kind: "bulk",
      key: "saleson_bulk_reorder_to_purchase_order"
    }
  ]);

  if (!incoming) return;

  const products = Array.isArray(incoming.data)
    ? incoming.data
    : [incoming.data];

  const body = document.getElementById("itemsBody");
  body.innerHTML = "";
  itemRowCount = 0;

  products.forEach(product => {
    const qty =
      Number(product.suggestedReorderQuantity) || 0;

    const rate =
      Number(product.costPerUnit) ||
      (qty
        ? Number(product.estimatedReorderValue || 0) / qty
        : 0);

    addItemRow({
      desc:
        product.productName +
        (product.skuCode
          ? ` (${product.skuCode})`
          : ""),
      hsn: "",
      qty,
      unit: "Nos",
      rate,
      disc: 0,

      // Reorder data does not contain a GST rate.
      gst: 0
    });

    const row = body.lastElementChild;
    const select = row?.querySelector("select");
    if (select) select.value = "0";
    if (row) recalcRow(row.id);
  });

  const suppliers = [
    ...new Set(
      products
        .map(product => product.supplierName)
        .filter(Boolean)
    )
  ];

  if (suppliers.length === 1) {
    SalesOnHandoff.set("vendorName", suppliers[0]);
  }

  renderPreview();
  showToast(`${products.length} reorder item(s) imported. Confirm HSN and GST rates.`);
}

/* ─────────────────────────────
   ITEM ROWS — FORM
───────────────────────────── */
function addItemRow(d) {
  itemRowCount++;
  const id = 'ir_' + itemRowCount;
  const def = d || {};
  const tr = document.createElement('tr');
  tr.id = id;
  tr.innerHTML = `
    <td><input type="text"   value=""  placeholder="Product / Service" oninput="recalcRow('${id}')"></td>
    <td><input type="text"   value=""   placeholder="3401"></td>
    <td><input type="number" value=""    min="0" step="any" oninput="recalcRow('${id}')"></td>
    <td><input type="text"   value="" placeholder="Nos"></td>
    <td><input type="number" value=""   min="0" step="any" oninput="recalcRow('${id}')"></td>
    <td><input type="number" value=""   min="0" max="100" step="any" oninput="recalcRow('${id}')"></td>
    <td>
      <select oninput="recalcRow('${id}')">
        <option value="0">0%</option>
        <option value="3">3%</option>
        <option value="5">5%</option>
        <option value="12">12%</option>
        <option value="18" ${(parseFloat(def.gst)||0)===18?'selected':''}>18%</option>
        <option value="28">28%</option>
        <option value="40">40% (De-merit)</option>
      </select>
    </td>
    <td class="computed" id="${id}_tax">—</td>
    <td class="computed" id="${id}_gstamt">—</td>
    <td class="computed" id="${id}_total">—</td>
    <td><button class="btn-remove-row" onclick="removeItemRow('${id}')">✕</button></td>`;
  tr.querySelectorAll('input').forEach((input, i) => { input.value = String([def.desc||'',def.hsn||'',def.qty??1,def.unit||'Box',def.rate||0,def.disc||0][i] ?? ""); });
  SalesOnToolSafety.setGST(tr.querySelector("select"), def.gst ?? 0);

  document.getElementById('itemsBody').appendChild(tr);
  recalcRow(id);
}

function removeItemRow(id) {
  const r = document.getElementById(id);
  if (r) { r.remove(); renderPreview(); }
}

function recalcRow(id) {
  const row = document.getElementById(id);
  if (!row) return;
  const inp = row.querySelectorAll('input, select');
  const qty    = parseFloat(inp[2].value) || 0;
  const rate   = parseFloat(inp[4].value) || 0;
  const disc   = parseFloat(inp[5].value) || 0;
  const gstPct = parseFloat(inp[6].value) || 0;
  const inclTax = document.getElementById('priceInclTax').checked;

  let taxable, gstAmt, total;
  if (inclTax && gstPct > 0) {
    const gross = qty * rate * (1 - disc/100);
    taxable = gross / (1 + gstPct/100);
    gstAmt  = gross - taxable;
    total   = gross;
  } else {
    taxable = qty * rate * (1 - disc/100);
    gstAmt  = taxable * gstPct / 100;
    total   = taxable + gstAmt;
  }

  document.getElementById(id+'_tax').textContent    = fmtINR(taxable);
  document.getElementById(id+'_gstamt').textContent = fmtINR(gstAmt);
  document.getElementById(id+'_total').textContent  = fmtINR(total);
  renderPreview();
}

/* ─────────────────────────────
   DELIVERY SCHEDULE ROWS
───────────────────────────── */
function toggleDelivSchedule() {
  const on = document.getElementById('showDelivSched').checked;
  document.getElementById('delivSchedWrap').style.display = on ? 'block' : 'none';
  delivSchedUsed = on;
  if (on && document.getElementById('schedBody').rows.length === 0) addSchedRow();
  renderPreview();
}

function addSchedRow(d) {
  schedRowCount++;
  const id  = 'sr_' + schedRowCount;
  const def = d || {};
  const tr  = document.createElement('tr');
  tr.id = id;
  tr.innerHTML = `
    <td><input type="text" value=""   placeholder="FMCG Product Box"></td>
    <td><input type="date" value=""   oninput="renderPreview()"></td>
    <td><input type="number" value=""  placeholder="50" min="0" oninput="renderPreview()"></td>
    <td><input type="text" value=""    placeholder="Main Warehouse, Patna" oninput="renderPreview()"></td>
    <td><button class="btn-remove-row" onclick="removeSchedRow('${id}')">✕</button></td>`;
  tr.querySelectorAll('input').forEach((input,i)=>{input.value=String([def.item||'',def.date||'',def.qty||'',def.loc||''][i] ?? '');});

  document.getElementById('schedBody').appendChild(tr);
  renderPreview();
}

function removeSchedRow(id) {
  const r = document.getElementById(id);
  if (r) { r.remove(); renderPreview(); }
}

/* ─────────────────────────────
   COLLECT DATA & COMPUTE TOTALS
───────────────────────────── */
function getItemsData() {
  const rows    = document.querySelectorAll('#itemsBody tr');
  const inclTax = document.getElementById('priceInclTax').checked;
  return Array.from(rows).map(row => {
    const inp    = row.querySelectorAll('input, select');
    const qty    = parseFloat(inp[2].value) || 0;
    const rate   = parseFloat(inp[4].value) || 0;
    const disc   = parseFloat(inp[5].value) || 0;
    const gstPct = parseFloat(inp[6].value) || 0;
    let taxable, gstAmt, total;
    if (inclTax && gstPct > 0) {
      const gross = qty * rate * (1 - disc/100);
      taxable = gross / (1 + gstPct/100);
      gstAmt  = gross - taxable;
      total   = gross;
    } else {
      taxable = qty * rate * (1 - disc/100);
      gstAmt  = taxable * gstPct / 100;
      total   = taxable + gstAmt;
    }
    return { desc: inp[0].value||'—', hsn: inp[1].value, qty, unit: inp[3].value||'Nos',
             rate, disc, gstPct, taxable, gstAmt, total };
  });
}

function computeTotals(items) {
  let subTotal=0, totalDisc=0, totalTaxable=0, totalGST=0, grandRaw=0;
  items.forEach(it => {
    subTotal    += it.qty * it.rate;
    totalDisc   += it.qty * it.rate * it.disc/100;
    totalTaxable += it.taxable;
    totalGST    += it.gstAmt;
    grandRaw    += it.total;
  });
  const otherCharges = parseFloat(document.getElementById('otherCharges').value) || 0;
  grandRaw += otherCharges;
  const doRound = document.getElementById('roundOff').checked;
  const roundOff  = doRound ? Math.round(grandRaw) - grandRaw : 0;
  const grandTotal = doRound ? Math.round(grandRaw) : parseFloat(grandRaw.toFixed(2));
  const advPct    = parseFloat(document.getElementById('advancePct').value) || 0;
  const advAmt    = parseFloat((grandTotal * advPct / 100).toFixed(2));
  const balance   = parseFloat((grandTotal - advAmt).toFixed(2));
  return { subTotal, totalDisc, totalTaxable, totalGST, otherCharges, grandRaw, roundOff, grandTotal, advPct, advAmt, balance };
}

function getSchedData() {
  return Array.from(document.querySelectorAll('#schedBody tr')).map(row => {
    const inp = row.querySelectorAll('input');
    return { item: inp[0].value, date: inp[1].value, qty: inp[2].value, loc: inp[3].value };
  });
}

/* ─────────────────────────────
   RENDER LIVE PREVIEW
───────────────────────────── */
function renderPreview() {
  const items = getItemsData();
  const T     = computeTotals(items);
  const tpl   = currentTemplate;

  /* ── Collect field values ── */
  const v = id => (document.getElementById(id)||{}).value || '';

  const bName    = SalesOnToolSafety.escape(v('buyerName')    || 'Your Company Name');
  const bGSTIN   = SalesOnToolSafety.escape(v('buyerGSTIN'));
  const bAddr    = SalesOnToolSafety.escape(v('buyerAddress'));
  const bPhone   = SalesOnToolSafety.escape(v('buyerPhone'));
  const bEmail   = SalesOnToolSafety.escape(v('buyerEmail'));
  const bWeb     = SalesOnToolSafety.escape(v('buyerWebsite'));

  const vnName   = SalesOnToolSafety.escape(v('vendorName')   || 'Vendor / Supplier Name');
  const vnComp   = SalesOnToolSafety.escape(v('vendorCompany'));
  const vnGSTIN  = SalesOnToolSafety.escape(v('vendorGSTIN'));
  const vnAddr   = SalesOnToolSafety.escape(v('vendorAddress'));
  const vnPhone  = SalesOnToolSafety.escape(v('vendorPhone'));
  const vnEmail  = SalesOnToolSafety.escape(v('vendorEmail'));
  const vnCtct   = SalesOnToolSafety.escape(v('vendorContact'));

  const poNum    = SalesOnToolSafety.escape(v('poNumber')     || '—');
  const poDate   = formatDate(v('poDate'));
  const delDate  = formatDate(v('deliveryDate'));
  const delLoc   = SalesOnToolSafety.escape(v('deliveryLocation'));
  const reqBy    = SalesOnToolSafety.escape(v('requestedBy'));
  const dept     = SalesOnToolSafety.escape(v('department'));
  const refQuot  = SalesOnToolSafety.escape(v('refQuotation'));
  const projRef  = SalesOnToolSafety.escape(v('projectRef'));
  const payTerms = SalesOnToolSafety.escape(v('paymentTerms'));
  const shipTerms= SalesOnToolSafety.escape(v('shippingTerms'));

  const delInstr = SalesOnToolSafety.escape(v('deliveryInstructions'));
  const qualNote = SalesOnToolSafety.escape(v('qualityNotes'));
  const termsC   = SalesOnToolSafety.escape(v('termsConditions'));
  const intRmk   = SalesOnToolSafety.escape(v('internalRemarks'));

  const showAppr  = document.getElementById('showApproval').checked;
  const showVA    = document.getElementById('showVendorAcceptance').checked;
  const showSched = document.getElementById('showDelivSched').checked;

  const prepBy    = SalesOnToolSafety.escape(v('preparedBy'));
  const chkBy     = SalesOnToolSafety.escape(v('checkedBy'));
  const appBy     = SalesOnToolSafety.escape(v('approvedBy'));
  const vaAuth    = SalesOnToolSafety.escape(v('vendorAuthPerson'));
  const vaDate    = formatDate(v('acceptanceDate'));

  /* ── Logo HTML ── */
  const logoHTML = logoDataURL
    ? `<img class="po-logo" src="${logoDataURL}" alt="Company Logo">`
    : `<div style="font-family:'DM Serif Display',serif;font-size:18px;color:var(--brand);">${bName}</div>`;

  /* ── Items table rows ── */
  const itemRows = items.map((it, i) => `
    <tr>
      <td>${i+1}</td>
      <td style="font-weight:600;color:var(--ink);">${SalesOnToolSafety.escape(it.desc)}</td>
      <td>${it.hsn||'—'}</td>
      <td style="text-align:center;">${it.qty}</td>
      <td style="text-align:center;">${SalesOnToolSafety.escape(it.unit)}</td>
      <td style="text-align:right;">${fmtINR(it.rate)}</td>
      <td style="text-align:center;">${it.disc>0?it.disc+'%':'—'}</td>
      <td style="text-align:center;">${it.gstPct}%</td>
      <td style="text-align:right;">${fmtINR(it.taxable)}</td>
      <td style="text-align:right;">${fmtINR(it.gstAmt)}</td>
      <td style="text-align:right;font-weight:700;">${fmtINR(it.total)}</td>
    </tr>`).join('');

  /* ── Summary ── */
  let sumHTML = `
    <div class="po-sum-row"><span class="s-label">Subtotal</span><span class="s-val">${fmtINR(T.subTotal)}</span></div>
    ${T.totalDisc>0?`<div class="po-sum-row"><span class="s-label">Discount</span><span class="s-val" style="color:var(--green);">− ${fmtINR(T.totalDisc)}</span></div>`:''}
    <div class="po-sum-row"><span class="s-label">Taxable Value</span><span class="s-val">${fmtINR(T.totalTaxable)}</span></div>
    <div class="po-sum-row"><span class="s-label">Total GST</span><span class="s-val">${fmtINR(T.totalGST)}</span></div>
    ${T.otherCharges>0?`<div class="po-sum-row"><span class="s-label">Freight / Other Charges</span><span class="s-val">${fmtINR(T.otherCharges)}</span></div>`:''}
    ${T.roundOff!==0?`<div class="po-sum-row"><span class="s-label">Round Off</span><span class="s-val">${T.roundOff>=0?'+':''}${T.roundOff.toFixed(2)}</span></div>`:''}
    <div class="po-sum-row total"><span class="s-label">Grand Total</span><span class="s-val">${fmtINR(T.grandTotal)}</span></div>
    ${T.advPct>0?`
    <div class="po-sum-row"><span class="s-label">Advance (${T.advPct}%)</span><span class="s-val" style="color:var(--amber);">${fmtINR(T.advAmt)}</span></div>
    <div class="po-sum-row balance" style="font-size:13px;"><span class="s-label" style="color:var(--ink);">Balance Payable</span><span class="s-val" style="color:var(--brand);">${fmtINR(T.balance)}</span></div>`:''}`;

  /* ── Delivery schedule in preview ── */
  const schedData = getSchedData();
  const schedHTML = (showSched && schedData.length>0) ? `
    <div style="margin-bottom:14px;">
      <div class="po-notes" style="margin-bottom:6px;"><strong>Delivery Schedule</strong></div>
      <table class="po-sched-table">
        <thead><tr><th>#</th><th>Item / Batch</th><th>Delivery Date</th><th>Quantity</th><th>Delivery Location</th></tr></thead>
        <tbody>
          ${schedData.map((r,i)=>`<tr><td>${i+1}</td><td>${r.item||'—'}</td><td>${formatDate(r.date)||'—'}</td><td>${r.qty||'—'}</td><td>${r.loc||'—'}</td></tr>`).join('')}
        </tbody>
      </table>
    </div>` : '';

  /* ── Approval section ── */
  const approvalHTML = showAppr ? `
    <div style="margin-bottom:14px;">
      <div class="po-notes" style="margin-bottom:6px;"><strong>Approval</strong></div>
      <table class="po-approval-table">
        <thead><tr><th>Prepared By</th><th>Checked By</th><th>Approved By</th></tr></thead>
        <tbody>
          <tr>
            <td><div class="sig-line"></div>${prepBy||'&nbsp;'}</td>
            <td><div class="sig-line"></div>${chkBy||'&nbsp;'}</td>
            <td><div class="sig-line"></div>${appBy||'&nbsp;'}</td>
          </tr>
        </tbody>
      </table>
    </div>` : '';

  /* ── Vendor acceptance section ── */
  const vaHTML = showVA ? `
    <div style="margin-bottom:14px;">
      <div class="po-notes" style="margin-bottom:6px;"><strong>Vendor Acceptance</strong></div>
      <table class="po-approval-table">
        <thead><tr><th>Vendor Authorised Person</th><th>Signature</th><th>Acceptance Date</th></tr></thead>
        <tbody>
          <tr>
            <td style="text-align:left;">${vaAuth||'&nbsp;'}</td>
            <td><div class="sig-line"></div></td>
            <td>${vaDate||'&nbsp;'}</td>
          </tr>
        </tbody>
      </table>
    </div>` : '';

  /* ── Meta strip items ── */
  const metaItems = [
    poDate      ? `<div class="po-meta-item"><div class="po-meta-key">PO Date</div><div class="po-meta-val">${poDate}</div></div>` : '',
    delDate     ? `<div class="po-meta-item"><div class="po-meta-key">Expected Delivery</div><div class="po-meta-val">${delDate}</div></div>` : '',
    delLoc      ? `<div class="po-meta-item"><div class="po-meta-key">Delivery Location</div><div class="po-meta-val">${delLoc}</div></div>` : '',
    payTerms    ? `<div class="po-meta-item"><div class="po-meta-key">Payment Terms</div><div class="po-meta-val">${payTerms}</div></div>` : '',
    shipTerms   ? `<div class="po-meta-item"><div class="po-meta-key">Shipping Terms</div><div class="po-meta-val">${shipTerms}</div></div>` : '',
    reqBy       ? `<div class="po-meta-item"><div class="po-meta-key">Requested By</div><div class="po-meta-val">${reqBy}</div></div>` : '',
    dept        ? `<div class="po-meta-item"><div class="po-meta-key">Department</div><div class="po-meta-val">${dept}</div></div>` : '',
    refQuot     ? `<div class="po-meta-item"><div class="po-meta-key">Ref. Quotation</div><div class="po-meta-val">${refQuot}</div></div>` : '',
    projRef     ? `<div class="po-meta-item"><div class="po-meta-key">Project / Ref.</div><div class="po-meta-val">${projRef}</div></div>` : '',
  ].filter(Boolean).join('');

  /* ── Template-specific header ── */
  const tplClass = `po-${tpl}`;
  const isProc   = tpl === 'procurement';

  const headerHTML = `
    <div class="po-header">
      <div>
        ${logoHTML}
        <div class="po-buyer-name">${bName}</div>
        <div class="po-buyer-detail">
          ${bGSTIN  ? 'GSTIN: '+bGSTIN+'<br>' : ''}
          ${bAddr   ? bAddr+'<br>' : ''}
          ${bPhone  ? '📞 '+bPhone+'  ' : ''}${bEmail ? '✉️ '+bEmail : ''}
          ${bWeb    ? '<br>🌐 '+bWeb : ''}
        </div>
      </div>
      <div>
        <div class="po-doc-title">PURCHASE ORDER</div>
        <div class="po-doc-meta">
          <strong>PO No: ${poNum}</strong><br>
          ${poDate  ? 'Date: '+poDate+'<br>' : ''}
          ${delDate ? 'Delivery by: '+delDate : ''}
        </div>
      </div>
    </div>`;

  /* ── Assemble full document HTML ── */
  const docHTML = `
  <div class="${tplClass}" style="--brand:${currentAccent};">
    ${headerHTML}
    <div class="po-body">

      <!-- Parties -->
      <div class="po-parties-row">
        <div class="po-party-box">
          <div class="po-party-label">Vendor / Supplier</div>
          <div class="po-party-name">${vnName}${vnComp?' — '+vnComp:''}</div>
          <div class="po-party-detail">
            ${vnGSTIN ? 'GSTIN: '+vnGSTIN+'<br>' : ''}
            ${vnAddr  ? vnAddr+'<br>' : ''}
            ${vnPhone ? '📞 '+vnPhone+'  ' : ''}${vnEmail ? '✉️ '+vnEmail : ''}
            ${vnCtct  ? '<br>Contact: '+vnCtct : ''}
          </div>
        </div>
        <div class="po-party-box">
          <div class="po-party-label">Bill To &amp; Ship To</div>
          <div class="po-party-name">${bName}</div>
          <div class="po-party-detail">
            ${bAddr ? bAddr+'<br>' : ''}
            ${delLoc ? 'Delivery: '+delLoc : ''}
          </div>
        </div>
      </div>

      <!-- Meta strip -->
      ${metaItems ? `<div class="po-meta-strip">${metaItems}</div>` : ''}

      <!-- Items table -->
      <table class="po-items-table">
        <thead>
          <tr>
            <th>#</th><th>Item / Description</th><th>HSN</th>
            <th>Qty</th><th>Unit</th><th>Rate</th><th>Disc</th>
            <th>GST%</th><th>Taxable</th><th>GST Amt</th><th>Total</th>
          </tr>
        </thead>
        <tbody>${itemRows}</tbody>
      </table>

      <!-- Summary -->
      <div class="po-summary">
        <div class="po-summary-table">${sumHTML}</div>
      </div>

      <!-- Amount in words -->
      <div class="po-words">
        <strong>Amount in Words:</strong> ${amountToWords(T.grandTotal)}
      </div>

      <!-- Notes blocks -->
      ${delInstr ? `<div class="po-notes"><strong>Delivery Instructions:</strong> ${delInstr}</div>` : ''}
      ${qualNote ? `<div class="po-notes"><strong>Quality / Specification Notes:</strong> ${qualNote}</div>` : ''}
      ${termsC   ? `<div class="po-notes"><strong>Terms &amp; Conditions:</strong> ${termsC}</div>` : ''}

      <!-- Delivery schedule -->
      ${schedHTML}

      <!-- Approval & Vendor acceptance -->
      ${approvalHTML}
      ${vaHTML}

    </div>

    <div class="po-footer-strip">
      Created using SalesOn Free Business Tools &nbsp;|&nbsp; saleson.co.in
    </div>
    <div class="po-disclaimer">
      This is a computer-generated document. Please verify tax, accounting and legal compliance with your accountant before issuing official documents.
    </div>
  </div>`;

  document.getElementById('poPreview').innerHTML = SalesOnToolSafety.html(docHTML);
}

/* ─────────────────────────────
   TOGGLE SECTION (collapsible)
───────────────────────────── */
function toggleSection(btn) {
  const body = btn.nextElementSibling;
  const open = btn.classList.toggle('open');
  body.classList.toggle('open', open);
}

/* ─────────────────────────────
   DESIGN: TEMPLATE & ACCENT
───────────────────────────── */
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

/* ─────────────────────────────
   LOGO UPLOAD
───────────────────────────── */
function handleLogoUpload(input) {
  const file = input.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    logoDataURL = e.target.result;
    const thumb = document.getElementById('logoThumb');
    thumb.src = logoDataURL; thumb.style.display = 'block';
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

/* ─────────────────────────────
   ACTION TRIGGER (lead gate)
───────────────────────────── */
function triggerAction(action) {  executeAction(action); }

function executeAction(action) {
  if (action === 'pdf' || action === 'print') {
    prepareSalesOnPrint('poPreview');
    window.print();
  } else if (action === 'wa') {
    openWaShare();
  } else if (action === 'convert') {
    convertToStockNote();
  }
}

/* ─────────────────────────────
   WHATSAPP SHARE
───────────────────────────── */
function openWaShare() {
  const items = getItemsData();
  const T     = computeTotals(items);
  const vnName  = document.getElementById('vendorName').value  || 'Vendor';
  const poNum   = document.getElementById('poNumber').value    || '—';
  const bName   = document.getElementById('buyerName').value   || 'Your Company';
  const delDate = formatDate(document.getElementById('deliveryDate').value) || '—';

  const msg = `Hi ${vnName},\n\nPlease find Purchase Order ${poNum} from ${bName} for ${fmtINR(T.grandTotal)}.\n\nExpected delivery date: ${delDate}\n\nCreated using SalesOn Free Business Tools — saleson.co.in`;
  document.getElementById('waMessageBox').textContent = msg;
  document.getElementById('waOpenBtn').href = `https://wa.me/?text=${encodeURIComponent(msg)}`;
  document.getElementById('waModal').classList.add('open');
}

function copyWaMessage() {
  const msg = document.getElementById('waMessageBox').textContent;
  return SalesOnToolSafety.copy(msg).then(ok => showToast(ok ? 'Copied to clipboard.' : 'Copy failed. Select and copy the text manually.'));
}

/* ─────────────────────────────
   CONVERT TO INWARD STOCK NOTE
───────────────────────────── */
function convertToStockNote() {
  const items = getItemsData();
  document.getElementById('stockDataBox').textContent = items.length + ' order line(s). Check quantity, condition and supplier invoice before recording receipt.';
  document.getElementById('stockModal').classList.add('open');
}

/* ─────────────────────────────
   LEAD MODAL
───────────────────────────── */


function skipLead() {}

/* ─────────────────────────────
   SAVE / LOAD DRAFT
───────────────────────────── */
function saveDraft() {
  /* Collect all item rows */
  const itemRows = Array.from(document.querySelectorAll('#itemsBody tr')).map(row => {
    const inp = row.querySelectorAll('input, select');
    return { desc: inp[0].value, hsn: inp[1].value, qty: inp[2].value,
             unit: inp[3].value, rate: inp[4].value, disc: inp[5].value, gst: inp[6].value };
  });
  /* Collect sched rows */
  const schedRows = Array.from(document.querySelectorAll('#schedBody tr')).map(row => {
    const inp = row.querySelectorAll('input');
    return { item: inp[0].value, date: inp[1].value, qty: inp[2].value, loc: inp[3].value };
  });

  const fv = id => (document.getElementById(id)||{}).value || '';
  const fb = id => !!(document.getElementById(id)||{}).checked;

  const draft = {
    buyerName: fv('buyerName'), buyerGSTIN: fv('buyerGSTIN'), buyerAddress: fv('buyerAddress'),
    buyerState: fv('buyerState'), buyerStateCode: fv('buyerStateCode'),
    buyerPhone: fv('buyerPhone'), buyerEmail: fv('buyerEmail'), buyerWebsite: fv('buyerWebsite'),
    vendorName: fv('vendorName'), vendorCompany: fv('vendorCompany'), vendorGSTIN: fv('vendorGSTIN'),
    vendorAddress: fv('vendorAddress'), vendorState: fv('vendorState'), vendorStateCode: fv('vendorStateCode'),
    vendorPhone: fv('vendorPhone'), vendorEmail: fv('vendorEmail'), vendorContact: fv('vendorContact'),
    poNumber: fv('poNumber'), poDate: fv('poDate'), deliveryDate: fv('deliveryDate'),
    deliveryLocation: fv('deliveryLocation'), requestedBy: fv('requestedBy'), department: fv('department'),
    refQuotation: fv('refQuotation'), projectRef: fv('projectRef'),
    paymentTerms: fv('paymentTerms'), shippingTerms: fv('shippingTerms'),
    priceInclTax: fb('priceInclTax'), roundOff: fb('roundOff'),
    advancePct: fv('advancePct'), otherCharges: fv('otherCharges'),
    deliveryInstructions: fv('deliveryInstructions'), qualityNotes: fv('qualityNotes'),
    termsConditions: fv('termsConditions'), internalRemarks: fv('internalRemarks'),
    showApproval: fb('showApproval'), preparedBy: fv('preparedBy'),
    checkedBy: fv('checkedBy'), approvedBy: fv('approvedBy'),
    showVendorAcceptance: fb('showVendorAcceptance'), vendorAuthPerson: fv('vendorAuthPerson'),
    acceptanceDate: fv('acceptanceDate'),
    showDelivSched: fb('showDelivSched'),
    template: currentTemplate, accent: currentAccent,
    logoDataURL,
    items: itemRows, schedRows,
    savedAt: new Date().toISOString()
  };

  SalesOnStorage.setItem('saleson_purchase_order_draft', JSON.stringify(draft));
  showToast(SalesOnStorage.persistent ? 'Draft saved ✓' : 'Not saved to browser storage. Keep this tab open or export your work.');
}

function loadDraft() {
  const raw = SalesOnStorage.getItem('saleson_purchase_order_draft');
  if (!raw) { showToast('No saved draft found'); return; }
  const d = SalesOnToolSafety.draft(raw);
  if (!confirm('Restore saved draft? This replaces the current workspace.')) return;

  /* Restore text/select fields */
  const fields = [
    'buyerName','buyerGSTIN','buyerAddress','buyerState','buyerStateCode','buyerPhone','buyerEmail','buyerWebsite',
    'vendorName','vendorCompany','vendorGSTIN','vendorAddress','vendorState','vendorStateCode','vendorPhone','vendorEmail','vendorContact',
    'poNumber','poDate','deliveryDate','deliveryLocation','requestedBy','department','refQuotation','projectRef',
    'paymentTerms','shippingTerms','advancePct','otherCharges','deliveryInstructions','qualityNotes',
    'termsConditions','internalRemarks','preparedBy','checkedBy','approvedBy','vendorAuthPerson','acceptanceDate'
  ];
  fields.forEach(id => { if (d[id]!==undefined) { const el=document.getElementById(id); if(el) el.value=d[id]; } });

  /* Restore toggles */
  const toggles = ['priceInclTax','roundOff','showApproval','showVendorAcceptance','showDelivSched'];
  toggles.forEach(id => {
    const el = document.getElementById(id);
    if (el && d[id]!==undefined) el.checked = !!d[id];
  });

  /* Approval fields visibility */
  if (d.showApproval) document.getElementById('approvalFields').style.display='block';
  if (d.showVendorAcceptance) document.getElementById('vendorAcceptFields').style.display='block';
  if (d.showDelivSched) {
    document.getElementById('delivSchedWrap').style.display='block';
    delivSchedUsed = true;
  }

  /* Logo */
  if (d.logoDataURL) {
    logoDataURL = d.logoDataURL;
    const t = document.getElementById('logoThumb'); t.src=logoDataURL; t.style.display='block';
  }

  /* Template & accent */
  if (d.template) {
    currentTemplate = d.template;
    document.querySelectorAll('.tpl-pill').forEach(p => {
      p.classList.toggle('active', p.textContent.toLowerCase()===d.template);
    });
  }
  if (d.accent) {
    currentAccent = d.accent;
    document.querySelectorAll('.accent-pill').forEach(p => {
      p.classList.toggle('active', p.getAttribute('onclick').includes(d.accent));
    });
  }

  /* Restore items */
  document.getElementById('itemsBody').innerHTML='';
  itemRowCount = 0;
  (d.items||[]).forEach(it => addItemRow({ desc:it.desc, hsn:it.hsn, qty:it.qty, unit:it.unit, rate:it.rate, disc:it.disc, gst:it.gst }));

  /* Restore schedule rows */
  document.getElementById('schedBody').innerHTML='';
  schedRowCount = 0;
  (d.schedRows||[]).forEach(r => addSchedRow({ item:r.item, date:r.date, qty:r.qty, loc:r.loc }));

  renderPreview();
  showToast('Draft loaded ✓');
  return true;
}

/* ─────────────────────────────
   RESET FORM
───────────────────────────── */
function resetForm() {
  if (!confirm('Reset all fields to sample data?')) return;
  document.getElementById('itemsBody').innerHTML='';
  document.getElementById('schedBody').innerHTML='';
  itemRowCount=0; schedRowCount=0;
  logoDataURL=null;
  document.getElementById('logoThumb').style.display='none';
  delivSchedUsed=false;
  initDefaults();
  showToast('Form reset ✓');
}

/* ─────────────────────────────
   INITIALISE DEFAULTS
───────────────────────────── */
function initDefaults() {
  const today = new Date();
  const yyyy  = today.getFullYear();
  const mm    = String(today.getMonth()+1).padStart(2,'0');
  const dd    = String(today.getDate()).padStart(2,'0');
  const todayStr = `${yyyy}-${mm}-${dd}`;

  /* Expected delivery date: +7 days */
  const del7 = new Date(today.getTime() + 7*24*60*60*1000);
  const delStr = SalesOnDates.localDate(del7);

  /* Auto-generate PO number */
  document.getElementById('poNumber').value = `PO-${yyyy}${mm}${dd}-001`;
  document.getElementById('poDate').value   = todayStr;
  document.getElementById('deliveryDate').value = delStr;

  /* Buyer */
  document.getElementById('buyerName').value    = 'Shree Balaji Distributors';
  document.getElementById('buyerGSTIN').value   = '10ABCDE1234F1Z5';
  document.getElementById('buyerAddress').value = 'Station Road, Patna, Bihar - 800001';
  document.getElementById('buyerState').value   = '10';
  document.getElementById('buyerStateCode').value = '10';
  document.getElementById('buyerPhone').value   = '+91-9876543210';
  document.getElementById('buyerEmail').value   = 'purchase@example.com';

  /* Vendor */
  document.getElementById('vendorName').value    = 'Mohan FMCG Suppliers';
  document.getElementById('vendorGSTIN').value   = '10AAACM1234B1Z6';
  document.getElementById('vendorAddress').value = 'Boring Road, Patna, Bihar - 800001';
  document.getElementById('vendorState').value   = '10';
  document.getElementById('vendorStateCode').value = '10';
  document.getElementById('vendorPhone').value   = '+91-9800000001';

  /* PO details */
  document.getElementById('deliveryLocation').value = 'Main Warehouse, Station Road, Patna';
  document.getElementById('requestedBy').value      = 'Purchase Manager';
  document.getElementById('paymentTerms').value     = 'Payment within 15 days';
  document.getElementById('shippingTerms').value    = 'Supplier delivery';
  document.getElementById('deliveryInstructions').value = 'Deliver between 9am–6pm on working days. Contact store manager on arrival.';
  document.getElementById('qualityNotes').value     = 'All goods must be within expiry. No damaged packaging accepted.';
  document.getElementById('termsConditions').value  = 'Goods accepted subject to quality inspection on receipt. Subject to Patna jurisdiction.';
  document.getElementById('roundOff').checked       = true;

  /* Approval defaults */
  document.getElementById('preparedBy').value  = 'Purchase Executive';
  document.getElementById('checkedBy').value   = 'Store Manager';
  document.getElementById('approvedBy').value  = 'Director';

  /* Sample item */
  addItemRow({ desc:'FMCG Product Box', hsn:'3401', qty:50, unit:'Box', rate:450, disc:0, gst:18 });

  renderPreview();
}

/* ─────────────────────────────
   APPROVAL / ACCEPTANCE TOGGLES
   (show/hide extra fields)
───────────────────────────── */
document.getElementById('showApproval').addEventListener('change', function() {
  document.getElementById('approvalFields').style.display = this.checked ? 'block' : 'none';
  renderPreview();
});
document.getElementById('showVendorAcceptance').addEventListener('change', function() {
  document.getElementById('vendorAcceptFields').style.display = this.checked ? 'block' : 'none';
  renderPreview();
});

/* ─────────────────────────────
   FAQ ACCORDION
───────────────────────────── */
function toggleFaq(btn) {
  const a = btn.nextElementSibling;
  const isOpen = btn.classList.contains('open');
  document.querySelectorAll('.faq-q').forEach(b => { b.classList.remove('open'); b.nextElementSibling.classList.remove('open'); });
  if (!isOpen) { btn.classList.add('open'); a.classList.add('open'); }
}

/* ─────────────────────────────
   TOAST
───────────────────────────── */
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg; t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2500);
}

/* ─────────────────────────────
   INIT
───────────────────────────── */
populateStates();
initDefaults();
applyReorderPurchaseOrderHandoff();

