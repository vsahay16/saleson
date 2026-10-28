
/* ─────────────────────────
   STATE
───────────────────────── */
let currentMode    = 'add';      // 'add' | 'remove' | 'split' | 'igst' | 'invoice'
let currentGstType = 'intra';    // 'intra' | 'inter'
let calcCount      = 0;          // track how many times user has calculated
let pendingAction  = null;
let usedInInvoice  = false;
let usedInQuot     = false;
let calcMoreThan5  = false;

// Stored result for copy/handoff
let lastResult     = null;

/* ─────────────────────────
   MODE SELECTOR
───────────────────────── */
function setMode(mode, el) {
  currentMode = mode;
  document.querySelectorAll('.mode-card').forEach(c => c.classList.remove('active'));
  el.classList.add('active');

  const isInvoice = mode === 'invoice';
  document.getElementById('basicFields').style.display    = isInvoice ? 'none' : '';
  document.getElementById('invoiceFields').style.display  = isInvoice ? ''     : 'none';

  const labelMap = { add:'Add GST', remove:'Remove GST', split:'CGST/SGST Split', igst:'IGST Calculation', invoice:'Invoice Total' };
  document.getElementById('modeBadge').textContent = labelMap[mode] || mode;

  const amtLbl = { add:'Base Amount (₹)', remove:'GST-Inclusive Amount (₹)', split:'Base Amount (₹)', igst:'Base Amount (₹)' };
  if (!isInvoice) document.getElementById('amountLabel').textContent = amtLbl[mode] || 'Amount (₹)';

  // Sync GST type for invoice mode
  if (mode === 'igst') { setGstType('inter', document.querySelectorAll('.radio-opt')[1]); }

  runCalculation();
}

/* ─────────────────────────
   GST TYPE
───────────────────────── */
function setGstType(type, el) {
  currentGstType = type;
  document.querySelectorAll('.radio-opt').forEach(r => r.classList.remove('active'));
  el.classList.add('active');
  calculate();
}

/* ─────────────────────────
   RATE BUTTONS
───────────────────────── */
function setRate(rate) {
  document.getElementById('gstRate').value = rate;
  syncRateBtns();
  calculate();
}

function syncRateBtns() {
  const rate = document.getElementById('gstRate').value;
  document.querySelectorAll('.rate-btn').forEach(b => {
    b.classList.toggle('active', b.textContent === rate + '%');
  });
}

/* ─────────────────────────
   AMOUNT IN WORDS
───────────────────────── */
function amountToWords(value) { return SalesOnMoney.toWords(value); }

function fmtINR(n) {
  return '₹' + Number(n.toFixed(2)).toLocaleString('en-IN', {minimumFractionDigits:2});
}

/* ─────────────────────────
   RENDER RESULT ROWS
───────────────────────── */
function renderResult(rows, total, formulaHtml) {
  const rowsHtml = rows.map(r => {
    if (r.divider) return `<div style="border-top:1px dashed var(--border);margin:6px 0;"></div>`;
    const cls = r.total ? 'res-row total' : 'res-row';
    const valStyle = r.green ? 'color:var(--green);' : r.blue ? 'color:var(--brand);' : '';
    return `<div class="${cls}">
      <span class="res-label">${r.label}</span>
      <span class="res-val" style="${valStyle}">${r.val}</span>
    </div>`;
  }).join('');

  document.getElementById('resultRows').innerHTML = rowsHtml;
  document.getElementById('wordsBox').innerHTML   = `<strong>Amount in Words:</strong> ${amountToWords(total)}`;
  document.getElementById('formulaBox').innerHTML = formulaHtml;

  lastResult = { rows, total, formulaHtml };
}

/* ─────────────────────────
   BASIC CALCULATION
───────────────────────── */
function calculate() {
  if (currentMode === 'invoice') { calculateInvoice(); return; }

  const amountInput=document.getElementById('amount');
  if(amountInput.value==='' || !amountInput.checkValidity()){
    lastResult=null;document.getElementById('resultRows').textContent='Enter a valid non-negative amount.';document.getElementById('wordsBox').textContent='';document.getElementById('formulaBox').textContent='';return;
  }
  const raw      = parseFloat(amountInput.value);
  const gstRate  = parseFloat(document.getElementById('gstRate').value) || 0;
  const qty      = parseFloat(document.getElementById('qty').value)  || 1;
  const discount = parseFloat(document.getElementById('discount').value) || 0;
  const shipping = parseFloat(document.getElementById('shipping').value) || 0;
  const doRound  = document.getElementById('roundOff').checked;
  const gstType  = currentGstType;
  const mode     = currentMode;

  const baseAmt = raw * qty;

  let taxable, gstAmt, cgst, sgst, igst, grandRaw;

  if (mode === 'remove') {
    // Reverse GST
    taxable = (baseAmt - discount) * 100 / (100 + gstRate);
    gstAmt  = (baseAmt - discount) - taxable;
  } else {
    taxable = baseAmt - discount;
    gstAmt  = taxable * gstRate / 100;
  }

  if (gstType === 'intra') {
    cgst = gstAmt / 2;
    sgst = gstAmt / 2;
    igst = 0;
  } else {
    cgst = 0;
    sgst = 0;
    igst = gstAmt;
  }

  if (mode === 'remove') {
    grandRaw = taxable + gstAmt + shipping;
  } else {
    grandRaw = taxable + gstAmt + shipping;
  }

  const roundOff = doRound ? Math.round(grandRaw) - grandRaw : 0;
  const grand    = doRound ? Math.round(grandRaw) : grandRaw;

  // Build rows
  const rows = [];
  if (qty > 1) {
    rows.push({ label: `Unit Price × ${qty}`, val: fmtINR(baseAmt) });
  }
  if (discount > 0) {
    rows.push({ label: 'Discount', val: '− ' + fmtINR(discount) });
  }
  rows.push({ label: 'Taxable Value', val: fmtINR(taxable) });
  if (gstRate > 0) {
    rows.push({ label: `GST @ ${gstRate}%`, val: fmtINR(gstAmt), blue: true });
    if (gstType === 'intra') {
      rows.push({ label: `CGST @ ${gstRate/2}%`, val: fmtINR(cgst) });
      rows.push({ label: `SGST @ ${gstRate/2}%`, val: fmtINR(sgst) });
    } else {
      rows.push({ label: `IGST @ ${gstRate}%`, val: fmtINR(igst) });
    }
  }
  if (shipping > 0) {
    rows.push({ label: 'Shipping / Other', val: fmtINR(shipping) });
  }
  if (roundOff !== 0) {
    rows.push({ label: 'Round Off', val: (roundOff >= 0 ? '+' : '') + roundOff.toFixed(2) });
  }
  rows.push({ divider: true });
  rows.push({ label: 'Grand Total', val: fmtINR(grand), total: true, green: true });

  // Formula
  let formula = '';
  if (mode === 'remove') {
    formula = `<strong>Reverse GST Formula:</strong><br>
      Taxable = Inclusive Amount × 100 ÷ (100 + ${gstRate})<br>
      = ${fmtINR(baseAmt - discount)} × 100 ÷ ${100 + gstRate} = <code>${fmtINR(taxable)}</code><br>
      GST = Inclusive − Taxable = <code>${fmtINR(gstAmt)}</code>`;
  } else {
    formula = `<strong>GST Formula (Add):</strong><br>
      GST = Taxable × ${gstRate} ÷ 100<br>
      = ${fmtINR(taxable)} × ${gstRate} ÷ 100 = <code>${fmtINR(gstAmt)}</code><br>
      Total = Taxable + GST = <code>${fmtINR(grand)}</code>`;
    if (gstType === 'intra') {
      formula += `<br>CGST = SGST = GST ÷ 2 = <code>${fmtINR(cgst)}</code> each`;
    }
  }

  renderResult(rows, grand, formula);

  // Store result state for copy/handoff
  lastResult.mode     = mode;
  lastResult.amount   = raw;
  lastResult.qty      = qty;
  lastResult.gstRate  = gstRate;
  lastResult.gstType  = gstType;
  lastResult.taxable  = taxable;
  lastResult.gstAmt   = gstAmt;
  lastResult.cgst     = cgst;
  lastResult.sgst     = sgst;
  lastResult.igst     = igst;
  lastResult.discount = discount;
  lastResult.shipping = shipping;
  lastResult.grand    = grand;
}

/* ─────────────────────────
   INVOICE TABLE CALCULATION
───────────────────────── */
let invRowCount = 0;

function addInvRow(d) {
  invRowCount++;
  const id = 'inv_' + invRowCount;
  const def = d || {};
  const tbody = document.getElementById('invItemsBody');
  const tr = document.createElement('tr');
  tr.id = id;
  tr.innerHTML = `
    <td><input type="text" value="" placeholder="Product name" oninput="recalcInvRow('${id}')"></td>
    <td><input type="number" value="" min="0" step="any" oninput="recalcInvRow('${id}')"></td>
    <td><input type="number" value="" min="0" step="any" oninput="recalcInvRow('${id}')"></td>
    <td>
      <select oninput="recalcInvRow('${id}')">
        <option value="0">0%</option><option value="3">3%</option><option value="5">5%</option>
        <option value="12">12%</option><option value="18" ${!def.gst||def.gst==18?'selected':''}>18%</option><option value="28">28%</option><option value="40">40%</option>
      </select>
    </td>
    <td><input type="number" value="" min="0" max="100" step="any" oninput="recalcInvRow('${id}')"></td>
    <td class="computed" id="${id}_t">—</td>
    <td class="computed" id="${id}_g">—</td>
    <td class="computed" id="${id}_tot">—</td>
    <td><button class="btn-rm-row" onclick="removeInvRow('${id}')">✕</button></td>`;
  tr.querySelectorAll('input').forEach((input,i)=>{input.value=String([def.name||'',def.qty??1,def.rate||0,def.disc||0][i] ?? '');});

  tbody.appendChild(tr);
  recalcInvRow(id);
}

function removeInvRow(id) {
  const r = document.getElementById(id);
  if (r) { r.remove(); calculateInvoice(); }
}

function clearInvTable() {
  document.getElementById('invItemsBody').innerHTML = '';
  invRowCount = 0;
  calculateInvoice();
}

function recalcInvRow(id) {
  const row = document.getElementById(id);
  if (!row) return;
  const inp = row.querySelectorAll('input,select');
  const qty  = parseFloat(inp[1].value)||0;
  const rate = parseFloat(inp[2].value)||0;
  const gst  = parseFloat(inp[3].value)||0;
  const disc = parseFloat(inp[4].value)||0;
  const taxable = qty * rate * (1 - disc/100);
  const gstAmt  = taxable * gst/100;
  const total   = taxable + gstAmt;
  document.getElementById(id+'_t').textContent   = fmtINR(taxable);
  document.getElementById(id+'_g').textContent   = gstAmt>0 ? fmtINR(gstAmt) : '—';
  document.getElementById(id+'_tot').textContent = fmtINR(total);
  calculateInvoice();
}

function calculateInvoice() {
  const rows = document.querySelectorAll('#invItemsBody tr');
  const gstType = document.getElementById('invGstType').value;
  const shipping = parseFloat(document.getElementById('invShipping').value)||0;
  const doRound  = document.getElementById('invRound').checked;

  let subTotal=0, totDisc=0, totTaxable=0, totGST=0, grandRaw=0;

  rows.forEach(row => {
    const inp  = row.querySelectorAll('input,select');
    const qty  = parseFloat(inp[1].value)||0;
    const rate = parseFloat(inp[2].value)||0;
    const gst  = parseFloat(inp[3].value)||0;
    const disc = parseFloat(inp[4].value)||0;
    const gross   = qty*rate;
    const discAmt = gross*disc/100;
    const taxable = gross - discAmt;
    const gstAmt  = taxable*gst/100;
    subTotal   += gross;
    totDisc    += discAmt;
    totTaxable += taxable;
    totGST     += gstAmt;
    grandRaw   += taxable + gstAmt;
  });

  grandRaw += shipping;
  const roundOff = doRound ? Math.round(grandRaw) - grandRaw : 0;
  const grand    = doRound ? Math.round(grandRaw) : grandRaw;
  const cgst = gstType==='intra' ? totGST/2 : 0;
  const sgst = gstType==='intra' ? totGST/2 : 0;
  const igst = gstType==='inter' ? totGST   : 0;

  const resultRows = [
    { label:'Subtotal', val: fmtINR(subTotal) },
    totDisc>0 ? { label:'Total Discount', val:'− '+fmtINR(totDisc) } : null,
    { label:'Total Taxable Value', val: fmtINR(totTaxable) },
    totGST>0 ? { label:'Total GST', val: fmtINR(totGST), blue:true } : null,
    gstType==='intra' && totGST>0 ? { label:'CGST', val: fmtINR(cgst) } : null,
    gstType==='intra' && totGST>0 ? { label:'SGST', val: fmtINR(sgst) } : null,
    gstType==='inter' && totGST>0 ? { label:'IGST', val: fmtINR(igst) } : null,
    shipping>0 ? { label:'Shipping / Other', val: fmtINR(shipping) } : null,
    roundOff!==0 ? { label:'Round Off', val:(roundOff>=0?'+':'')+roundOff.toFixed(2) } : null,
    { divider:true },
    { label:'Grand Total', val: fmtINR(grand), total:true, green:true },
  ].filter(Boolean);

  const formula = `<strong>Invoice Total Formula:</strong><br>
    Subtotal = Sum of (Qty × Rate)<br>
    Taxable = Subtotal − Discount = <code>${fmtINR(totTaxable)}</code><br>
    Total GST = Sum of (Taxable × GST%) = <code>${fmtINR(totGST)}</code><br>
    ${gstType==='intra'?`CGST = SGST = GST ÷ 2 = <code>${fmtINR(cgst)}</code>`:
      `IGST = Total GST = <code>${fmtINR(igst)}</code>`}<br>
    Grand Total = Taxable + GST + Shipping = <code>${fmtINR(grand)}</code>`;

  renderResult(resultRows, grand, formula);

  lastResult = { ...lastResult, mode:'invoice', taxable:totTaxable, gstAmt:totGST, cgst, sgst, igst, shipping, grand, gstType };
}

/* ─────────────────────────
   RUN CALCULATION (button)
───────────────────────── */
function runCalculation() {
  calculate();
  calcCount++;

  // Save to recent
  if (lastResult && lastResult.grand > 0) {
    saveToRecent();
  }

}

/* ─────────────────────────
   COPY / FORMULA
───────────────────────── */
function buildCopyText() {
  if (!lastResult) return '';
  const r = lastResult;
  let text = `GST Calculation — SalesOn Free Tools\n${'─'.repeat(36)}\n`;
  text += `Mode: ${r.mode || currentMode}\n`;
  if (r.amount) text += `Amount: ${fmtINR(r.amount)}\n`;
  if (r.gstRate >= 0) text += `GST Rate: ${r.gstRate}%\n`;
  text += `Taxable Value: ${fmtINR(r.taxable || 0)}\n`;
  text += `GST Amount: ${fmtINR(r.gstAmt || 0)}\n`;
  if (r.cgst) text += `CGST: ${fmtINR(r.cgst)}\n`;
  if (r.sgst) text += `SGST: ${fmtINR(r.sgst)}\n`;
  if (r.igst) text += `IGST: ${fmtINR(r.igst)}\n`;
  text += `Grand Total: ${fmtINR(r.grand || 0)}\n`;
  text += `\nGenerated via SalesOn GST Calculator — tools.saleson.co.in`;
  return text;
}

function copyText(text) {
  return SalesOnToolSafety.copy(text).then(ok => showToast(ok ? 'Copied to clipboard.' : 'Copy failed. Select and copy the text manually.'));
}

function copyFormula() {
  const box = document.getElementById('formulaBox');
  copyText(box ? box.innerText : '');
}

function buildCalculatorHandoffItems() {
  const items = [];

  if (currentMode === "invoice") {
    document
      .querySelectorAll("#invItemsBody tr")
      .forEach(row => {
        const fields = row.querySelectorAll("input, select");

        items.push({
          desc: fields[0].value || "Item / Service",
          hsn: "",
          qty: Number(fields[1].value) || 0,
          unit: "Nos",
          rate: Number(fields[2].value) || 0,
          gst: Number(fields[3].value) || 0,
          disc: Number(fields[4].value) || 0
        });
      });
  } else {
    const qty =
      Number(document.getElementById("qty").value) || 1;

    const rate =
      Number(document.getElementById("amount").value) || 0;

    const gross = qty * rate;

    const discountAmount =
      Number(document.getElementById("discount").value) || 0;

    items.push({
      desc: "Item / Service",
      hsn: "",
      qty,
      unit: "Nos",
      rate,
      disc: gross
        ? (discountAmount / gross) * 100
        : 0,
      gst:
        Number(document.getElementById("gstRate").value) || 0
    });
  }

  const shipping = currentMode === "invoice"
    ? Number(document.getElementById("invShipping").value) || 0
    : Number(document.getElementById("shipping").value) || 0;

  if (shipping > 0) {
    items.push({
      desc: "Shipping / Other",
      hsn: "",
      qty: 1,
      unit: "Nos",
      rate: shipping,
      disc: 0,
      gst: 0
    });
  }

  return items;
}

/* ─────────────────────────
   HANDOFF TO INVOICE / QUOTATION
───────────────────────── */
function doHandoffInvoice() {
  if(!lastResult){showToast('Calculate a valid amount before transferring.');return;}
  const data = {
    mode:        lastResult?.mode || currentMode,
    amount:      lastResult?.amount || 0,
    gstRate:     lastResult?.gstRate ?? parseFloat(document.getElementById('gstRate')?.value || 18),
    gstType:     lastResult?.gstType || currentGstType,
    taxableValue: lastResult?.taxable || 0,
    gstAmount:   lastResult?.gstAmt  || 0,
    cgst:        lastResult?.cgst    || 0,
    sgst:        lastResult?.sgst    || 0,
    igst:        lastResult?.igst    || 0,
    total:       lastResult?.grand   || 0,
    selectedAt:  new Date().toISOString(),
    items: buildCalculatorHandoffItems(),
    priceIncludesTax: currentMode === "remove",
  };
  if (!SalesOnStorage.setItem('saleson_gst_calculator_to_invoice', JSON.stringify(data))) { alert('Transfer unavailable because browser storage is blocked or full. Download or print this document instead.'); return; }
  usedInInvoice = true;
  document.getElementById('invBanner').classList.add('show');
  showToast('Calculation saved for GST Invoice ✓');
}

function doHandoffQuot() {
  if(!lastResult){showToast('Calculate a valid amount before transferring.');return;}
  const data = {
    mode:        lastResult?.mode || currentMode,
    amount:      lastResult?.amount || 0,
    gstRate:     lastResult?.gstRate ?? parseFloat(document.getElementById('gstRate')?.value || 18),
    taxableValue: lastResult?.taxable || 0,
    gstAmount:   lastResult?.gstAmt  || 0,
    total:       lastResult?.grand   || 0,
    selectedAt:  new Date().toISOString(),
    items: buildCalculatorHandoffItems(),
    priceIncludesTax: currentMode === "remove",
  };
  if (!SalesOnStorage.setItem('saleson_gst_calculator_to_quotation', JSON.stringify(data))) { alert('Transfer unavailable because browser storage is blocked or full. Download or print this document instead.'); return; }
  usedInQuot = true;
  document.getElementById('quotBanner').classList.add('show');
  showToast('Calculation saved for Quotation ✓');
}

/* ─────────────────────────
   RECENT CALCULATIONS
───────────────────────── */
function saveToRecent() {
  const recent = JSON.parse(SalesOnStorage.getItem('saleson_gst_recent_calculations') || '[]');
  const entry = {
    id:      Date.now(),
    mode:    currentMode,
    amount:  lastResult?.amount  || 0,
    gstRate: lastResult?.gstRate ?? 18,
    grand:   lastResult?.grand   || 0,
    taxable: lastResult?.taxable || 0,
    gstAmt:  lastResult?.gstAmt  || 0,
    cgst:    lastResult?.cgst    || 0,
    sgst:    lastResult?.sgst    || 0,
    igst:    lastResult?.igst    || 0,
    gstType: currentGstType,
    at: new Date().toLocaleString('en-IN'),
  };
  recent.unshift(entry);
  const trimmed = recent.slice(0, 5);
  SalesOnStorage.setItem('saleson_gst_recent_calculations', JSON.stringify(trimmed));
  renderRecent();
}

function renderRecent() {
  const recent = JSON.parse(SalesOnStorage.getItem('saleson_gst_recent_calculations') || '[]');
  const list = document.getElementById('recentList');
  if (!recent.length) {
    list.innerHTML = `<div style="padding:16px;font-size:13px;color:var(--ink-mute);text-align:center;">No calculations yet.</div>`;
    return;
  }
  list.innerHTML = recent.map(r => `
    <div class="recent-item">
      <div class="recent-info">
        <div class="recent-amt">${fmtINR(r.grand)} <span style="font-size:12px;font-weight:400;color:var(--ink-mute);">@ ${r.gstRate}% GST</span></div>
        <div class="recent-meta">${r.mode} · Taxable ${fmtINR(r.taxable)} · ${r.at}</div>
      </div>
      <div class="recent-acts">
        <button class="btn-recent btn-load" onclick="loadRecent(${r.id})">Load</button>
        <button class="btn-recent btn-del"  onclick="deleteRecent(${r.id})">✕</button>
      </div>
    </div>`).join('');
}

function loadRecent(id) {
  const recent = JSON.parse(SalesOnStorage.getItem('saleson_gst_recent_calculations') || '[]');
  const r = recent.find(e => e.id === id);
  if (!r) return;
  if (document.getElementById('amount')) document.getElementById('amount').value = r.amount;
  if (document.getElementById('gstRate')) { document.getElementById('gstRate').value = r.gstRate; syncRateBtns(); }
  setGstType(r.gstType || 'intra', document.querySelectorAll('.radio-opt')[r.gstType==='inter'?1:0]);
  // Switch to mode
  const modeCard = [...document.querySelectorAll('.mode-card')].find(c => {
    const t = c.querySelector('.mode-card-title').textContent.toLowerCase();
    if (r.mode==='add' && t.includes('add')) return true;
    if (r.mode==='remove' && t.includes('remove')) return true;
    if (r.mode==='split' && t.includes('cgst')) return true;
    if (r.mode==='igst' && t.includes('igst')) return true;
    if (r.mode==='invoice' && t.includes('invoice')) return true;
    return false;
  });
  if (modeCard) setMode(r.mode, modeCard);
  calculate();
  showToast('Calculation loaded ✓');
}

function deleteRecent(id) {
  let recent = JSON.parse(SalesOnStorage.getItem('saleson_gst_recent_calculations') || '[]');
  recent = recent.filter(e => e.id !== id);
  SalesOnStorage.setItem('saleson_gst_recent_calculations', JSON.stringify(recent));
  renderRecent();
}

function clearRecentAll() {
  SalesOnStorage.removeItem('saleson_gst_recent_calculations');
  renderRecent();
}

/* ─────────────────────────
   SAVE / LOAD DRAFT
───────────────────────── */
function saveCalc() {
  if (!lastResult) return;
  const draft = {
    mode: currentMode, gstType: currentGstType,
    amount:   document.getElementById('amount')?.value || '',
    gstRate:  document.getElementById('gstRate')?.value || '18',
    qty:      document.getElementById('qty')?.value || '1',
    discount: document.getElementById('discount')?.value || '0',
    shipping: document.getElementById('shipping')?.value || '0',
    savedAt:  new Date().toISOString(),
  };
  SalesOnStorage.setItem('saleson_gst_calculator_last', JSON.stringify(draft));
  showToast(SalesOnStorage.persistent ? 'Calculation saved ✓' : 'Not saved to browser storage. Keep this tab open or export your work.');
}

function loadLastCalc() {
  const raw = SalesOnStorage.getItem('saleson_gst_calculator_last');
  if (!raw) { showToast('No saved calculation found'); return; }
  const d = SalesOnToolSafety.draft(raw);
  if (!confirm('Restore saved draft? This replaces the current workspace.')) return;
  if (document.getElementById('amount')) document.getElementById('amount').value = d.amount;
  if (document.getElementById('gstRate')) { document.getElementById('gstRate').value = d.gstRate; syncRateBtns(); }
  if (document.getElementById('qty')) document.getElementById('qty').value = d.qty;
  if (document.getElementById('discount')) document.getElementById('discount').value = d.discount;
  if (document.getElementById('shipping')) document.getElementById('shipping').value = d.shipping;
  setGstType(d.gstType||'intra', document.querySelectorAll('.radio-opt')[d.gstType==='inter'?1:0]);
  calculate();
  showToast('Last calculation loaded ✓');
  return true;
}

/* ─────────────────────────
   RESET
───────────────────────── */
function resetCalc() {
  if (!confirm('Reset calculator?')) return;
  const amount = document.getElementById('amount');
  if (amount) amount.value = '';
  ['qty','discount','shipping'].forEach(id => { const el = document.getElementById(id); if (el) el.value = id==='qty'?1:0; });
  document.getElementById('gstRate').value = '18';
  syncRateBtns();
  document.getElementById('roundOff').checked = true;
  setGstType('intra', document.querySelectorAll('.radio-opt')[0]);
  document.getElementById('invBanner').classList.remove('show');
  document.getElementById('quotBanner').classList.remove('show');
  // Init with default sample
  initDefault();
  applyQuotationHandoff();
}

/* ─────────────────────────
   ACTION TRIGGER
───────────────────────── */
function triggerAction(action) {  executeAction(action); }

function executeAction(action) {
  if (action === 'copy')  copyText(buildCopyText());
  if (action === 'inv')   doHandoffInvoice();
  if (action === 'quot')  doHandoffQuot();
  if (action === 'save')  saveCalc();
}

/* ─────────────────────────
   LEAD MODAL
───────────────────────── */


function skipLead() {}

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

function replaceQuotationItems(items) {
  if (!Array.isArray(items) || !items.length) return;

  const body = document.getElementById("itemsBody");
  body.innerHTML = "";
  itemRowCount = 0;

  items.forEach(item => {
    const rowData = {
      desc:
        item.desc ||
        item.description ||
        item.itemDescription ||
        "Item / Service",
      hsn: item.hsn || item.hsnCode || item.code || "",
      qty: item.qty ?? 1,
      unit: item.unit || "Nos",
      rate: Number(item.rate ?? item.taxableValue ?? 0),
      disc: Number(item.disc || 0),
      gst: Number(item.gst ?? item.gstRate ?? 0)
    };

    addItemRow(rowData);

    const row = body.lastElementChild;
    const select = row?.querySelector("select");

    if (select) select.value = String(rowData.gst);
    if (row) recalcRow(row.id);
  });
}

function applyQuotationHandoff() {
  const H = window.SalesOnHandoff;

  let incoming = H.takeLatest([
    {
      kind: "hsn",
      key: "saleson_selected_hsn_for_quotation"
    },
    {
      kind: "calculator",
      key: "saleson_gst_calculator_to_quotation"
    }
  ]);

  const params = new URLSearchParams(location.search);

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

  if (!incoming) return;

  const data = incoming.data;

  if (incoming.kind === "hsn") {
    replaceQuotationItems([{
      desc: data.description || data.itemDescription,
      hsn: data.code,
      qty: 1,
      unit: data.type === "SAC" ? "Service" : "Nos",
      rate: 0,
      gst: data.gstRate
    }]);
  } else {
    const detailed =
      Array.isArray(data.items) && data.items.length;

    replaceQuotationItems(
      detailed
        ? data.items
        : [{
            desc: "Item / Service from GST Calculator",
            qty: 1,
            unit: "Nos",
            rate: Number(data.taxableValue || 0),
            gst: Number(data.gstRate || 0)
          }]
    );

    H.set(
      "priceInclTax",
      detailed && Boolean(data.priceIncludesTax)
    );
  }

  renderPreview();
  showToast("Data imported. Add the item price/details if required.");
}

/* ─────────────────────────
   INIT — default sample
───────────────────────── */
function initDefault() {
  if (document.getElementById('amount')) document.getElementById('amount').value = 10000;
  if (document.getElementById('gstRate')) { document.getElementById('gstRate').value = '18'; syncRateBtns(); }
  if (document.getElementById('qty')) document.getElementById('qty').value = 1;
  if (document.getElementById('discount')) document.getElementById('discount').value = 0;
  if (document.getElementById('shipping')) document.getElementById('shipping').value = 0;
  document.getElementById('roundOff').checked = true;
  // Add one default invoice row
  if (document.getElementById('invItemsBody').children.length === 0) {
    addInvRow({ name:'Product A', qty:5, rate:2000, gst:18, disc:0 });
  }
  calculate();
}

renderRecent();
initDefault();
applyQuotationHandoff();

