
/* ─────────────────────────
   STATE
───────────────────────── */
let currentTemplate = 'classic';
let currentAccent   = '#1a56db';
let logoDataURL     = null;
let sigDataURL      = null;
let pendingAction   = null; // 'pdf' | 'print' | 'wa' | 'reminder'
let reminderClickedThisSession = false;
let multiInvRowCount = 0;

/* ─────────────────────────
   INIT
───────────────────────── */
window.addEventListener('DOMContentLoaded', () => {
  initDefaults();
  applyOutstandingReceiptHandoff();
  onPayModeChange(); // set correct conditional fields
});

function initDefaults() {
  const today = new Date();
  const yyyy  = today.getFullYear();
  const mm    = String(today.getMonth()+1).padStart(2,'0');
  const dd    = String(today.getDate()).padStart(2,'0');
  const todayStr = `${yyyy}-${mm}-${dd}`;

  // Receipt number
  document.getElementById('rcptNumber').value = 'RCPT-' + yyyy + mm + dd + '-001';
  document.getElementById('rcptDate').value   = todayStr;

  // Business sample data
  document.getElementById('bizName').value    = 'Shree Balaji Distributors';
  document.getElementById('bizGSTIN').value   = '10ABCDE1234F1Z5';
  document.getElementById('bizAddress').value = '12 Market Road, Patna, Bihar - 800001';
  document.getElementById('bizPhone').value   = '+91-9876543210';
  document.getElementById('bizEmail').value   = 'accounts@example.com';

  // Customer sample
  document.getElementById('custName').value    = 'Mohan Retail Store';
  document.getElementById('custAddress').value = 'Boring Road, Patna, Bihar - 800001';
  document.getElementById('custPhone').value   = '+91-9800000001';

  // Receipt details
  document.getElementById('payAgainst').value   = 'Partial Payment';
  document.getElementById('relatedInvoice').value = 'INV-2026-001';
  document.getElementById('payMode').value      = 'UPI';
  document.getElementById('upiId').value        = 'shrееbalaji@upi';
  document.getElementById('txnRef').value       = 'UPI-20260601-001234';

  // Amounts
  document.getElementById('amtReceived').value    = '5000';
  document.getElementById('amtTotal').value       = '12000';
  document.getElementById('amtOutstanding').value = '3000';
  document.getElementById('amtDiscount').value    = '0';

  // Other
  document.getElementById('signatoryName').value = 'Authorized Signatory';
  document.getElementById('rcptNotes').value     = 'Thank you for your payment.';
  document.getElementById('rcptTerms').value     = 'Subject to Patna jurisdiction.';

  calcBalance();
  renderPreview();
}

/* ─────────────────────────
   CALCULATE BALANCE
───────────────────────── */
function calcBalance() {
  const received    = parseFloat(document.getElementById('amtReceived').value)    || 0;
  const total       = parseFloat(document.getElementById('amtTotal').value)       || 0;
  const outstanding = parseFloat(document.getElementById('amtOutstanding').value) || 0;
  const discount    = parseFloat(document.getElementById('amtDiscount').value)    || 0;
  const payAgainst  = document.getElementById('payAgainst').value;

  const payable = (total > 0 || outstanding > 0)
    ? Math.max(0, total + outstanding - discount)
    : 0;

  const balanceDue  = payable > 0 ? payable - received : 0;
  const overpaid    = balanceDue < 0 ? Math.abs(balanceDue) : 0;
  const actualBalance = payable > 0 ? Math.max(balanceDue, 0) : 0;

  // Auto-determine status
  let status = '';
  if (payAgainst === 'Advance') {
    status = 'Advance';
  } else if (payable > 0) {
    if (received <= 0) {
      status = 'Balance Due';
    } else if (balanceDue <= 0 && overpaid > 0) {
      status = 'Overpaid';
    } else if (balanceDue <= 0) {
      status = 'Paid';
    } else {
      status = 'Partial';
    }
  } else if (received > 0) {
    status = 'Paid';
  }

  // Show in form
  const payableEl  = document.getElementById('amtPayable');
  const balanceEl  = document.getElementById('amtBalance');
  const wordsEl    = document.getElementById('amtWords');
  const statusEl   = document.getElementById('payStatus');

  payableEl.value  = payable  > 0 ? fmtINR(payable)  : '—';
  balanceEl.value  = actualBalance > 0 ? fmtINR(actualBalance)
                   : overpaid > 0 ? 'Overpaid: ' + fmtINR(overpaid)
                   : (status === 'Paid' ? '₹0.00 — Fully Paid' : '—');
  wordsEl.value    = received > 0 ? amountToWords(received) : '—';
  statusEl.value   = status || '—';

  // Colour the balance field
  balanceEl.className = 'fi ' + (
    status === 'Paid' || status === 'Overpaid' ? 'fi-calc-green' :
    status === 'Partial' || status === 'Advance' ? 'fi-calc-amber' :
    status === 'Balance Due' ? 'fi-calc-red' : 'fi-calc'
  );

  return { received, total, outstanding, discount, payable, balanceDue: actualBalance, overpaid, status };
}

/* ─────────────────────────
   PAYMENT MODE SHOW/HIDE
───────────────────────── */
function onPayModeChange() {
  const mode = document.getElementById('payMode').value;
  document.getElementById('chequeFields').style.display = mode === 'Cheque'                 ? 'block' : 'none';
  document.getElementById('upiFields').style.display    = mode === 'UPI'                    ? 'block' : 'none';
  document.getElementById('bankFields').style.display   = mode === 'Bank Transfer / NEFT / RTGS' ? 'block' : 'none';
}

/* ─────────────────────────
   MULTI-INVOICE TOGGLE
───────────────────────── */
function toggleMultiInv() {
  const checked = document.getElementById('multiInvToggle').checked;
  const section = document.getElementById('multiInvSection');
  section.style.display = checked ? 'block' : 'none';
  if (checked && document.getElementById('multiInvBody').children.length === 0) {
    addMultiInvRow({ invNum: 'INV-2026-001', invDate: '', invAmt: 12000, received: 5000 });
  }
}

function addMultiInvRow(d) {
  multiInvRowCount++;
  const id = 'mrow_' + multiInvRowCount;
  const row = document.createElement('tr');
  row.id = id;
  d = d || {};
  row.innerHTML = `
    <td><input type="text" value="${d.invNum||''}" placeholder="INV-001" oninput="calcMultiRowBalance('${id}');renderPreview()"></td>
    <td><input type="date" value="${d.invDate||''}" oninput="renderPreview()"></td>
    <td><input type="number" value="${d.invAmt||''}" placeholder="0" min="0" step="0.01" oninput="calcMultiRowBalance('${id}');renderPreview()"></td>
    <td><input type="number" value="${d.received||''}" placeholder="0" min="0" step="0.01" oninput="calcMultiRowBalance('${id}');renderPreview()"></td>
    <td class="mbal-${id}" style="padding:4px 6px;font-size:11.5px;color:var(--ink-soft);">—</td>
    <td><button class="btn-remove-row" onclick="document.getElementById('${id}').remove();renderPreview()">✕</button></td>`;
  document.getElementById('multiInvBody').appendChild(row);
  calcMultiRowBalance(id);
}

function calcMultiRowBalance(id) {
  const row  = document.getElementById(id);
  if (!row) return;
  const inputs = row.querySelectorAll('input');
  const amt   = parseFloat(inputs[2].value) || 0;
  const rcvd  = parseFloat(inputs[3].value) || 0;
  const bal   = amt - rcvd;
  const cell  = row.querySelector('.mbal-' + id);
  if (cell) cell.textContent = bal > 0 ? fmtINR(bal) : (bal === 0 ? '₹0.00 Paid' : '—');
}

/* ─────────────────────────
   FORMAT HELPERS
───────────────────────── */
function fmtINR(n) {
  return '₹' + Number(Number(n).toFixed(2)).toLocaleString('en-IN', { minimumFractionDigits: 2 });
}

function amountToWords(value) { return SalesOnMoney.toWords(value); }

function formatDate(d) {
  if (!d) return '';
  const [y,m,day] = d.split('-');
  return day + '/' + m + '/' + y;
}

function applyOutstandingReceiptHandoff() {
  const data = SalesOnHandoff.take(
    "saleson_outstanding_to_receipt_data"
  );

  if (!data) return;

  SalesOnHandoff.set("custName", data.partyName);
  SalesOnHandoff.set("custPhone", data.mobile);
  SalesOnHandoff.set("relatedInvoice", data.invoiceNumber);
  SalesOnHandoff.set("salesperson", data.salesperson);
  SalesOnHandoff.set("beatRoute", data.beatRoute);

  SalesOnHandoff.set(
    "payAgainst",
    Number(data.balanceAmount) > 0
      ? "Partial Payment"
      : "Full Payment"
  );

  SalesOnHandoff.set("amtTotal", data.invoiceAmount);
  SalesOnHandoff.set("amtReceived", data.paidAmount);
  SalesOnHandoff.set("amtOutstanding", 0);
  SalesOnHandoff.set("amtDiscount", data.adjustment || 0);

  calcBalance();
  renderPreview();
  showToast("Outstanding entry imported into the receipt.");
}

/* ─────────────────────────
   RENDER PREVIEW
───────────────────────── */
function renderPreview() {
  const T = calcBalance();

  // Business
  const bizName    = document.getElementById('bizName').value    || 'Your Business Name';
  const bizGSTIN   = document.getElementById('bizGSTIN').value   || '';
  const bizAddress = document.getElementById('bizAddress').value || '';
  const bizPhone   = document.getElementById('bizPhone').value   || '';
  const bizEmail   = document.getElementById('bizEmail').value   || '';
  const bizWeb     = document.getElementById('bizWebsite').value || '';

  // Customer
  const custName    = document.getElementById('custName').value    || 'Customer Name';
  const custCompany = document.getElementById('custCompany').value || '';
  const custAddress = document.getElementById('custAddress').value || '';
  const custPhone   = document.getElementById('custPhone').value   || '';
  const custEmail   = document.getElementById('custEmail').value   || '';
  const custGSTIN   = document.getElementById('custGSTIN').value   || '';

  // Receipt
  const rcptNum      = document.getElementById('rcptNumber').value    || '—';
  const rcptDate     = formatDate(document.getElementById('rcptDate').value);
  const payAgainst   = document.getElementById('payAgainst').value    || '';
  const relInvoice   = document.getElementById('relatedInvoice').value || '';
  const relOrder     = document.getElementById('relatedOrder').value   || '';
  const salesperson  = document.getElementById('salesperson').value    || '';
  const beatRoute    = document.getElementById('beatRoute').value      || '';

  // Payment
  const payMode    = document.getElementById('payMode').value     || '';
  const txnRef     = document.getElementById('txnRef').value      || '';
  const chequeNum  = document.getElementById('chequeNum').value   || '';
  const bankName   = document.getElementById('bankName').value    || document.getElementById('bankName2').value || '';
  const chequeDate = formatDate(document.getElementById('chequeDate').value);
  const upiId      = document.getElementById('upiId').value       || '';
  const bankIFSC   = document.getElementById('bankIFSC').value    || '';

  // Other
  const notes       = document.getElementById('rcptNotes').value    || '';
  const terms       = document.getElementById('rcptTerms').value    || '';
  const sigName     = document.getElementById('signatoryName').value || 'Authorized Signatory';
  const showAck     = document.getElementById('ackToggle').checked;
  const showMulti   = document.getElementById('multiInvToggle').checked;

  // Logo / Sig
  const logoHTML = logoDataURL
    ? `<img class="rcp-logo" src="${logoDataURL}" alt="Logo">`
    : `<div style="font-family:'DM Serif Display',serif;font-size:17px;color:var(--accent);">${bizName}</div>`;
  const sigImgStyle = sigDataURL ? 'display:block;' : 'display:none;';
  const sigSrc = sigDataURL || 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=';

  // Payment details info items
  let payInfoItems = `
    <div class="rcp-pay-info-item"><strong>Payment Mode</strong><span>${payMode}</span></div>
    ${txnRef ? `<div class="rcp-pay-info-item"><strong>Txn / Reference No.</strong><span>${txnRef}</span></div>` : ''}
    ${upiId ? `<div class="rcp-pay-info-item"><strong>UPI ID</strong><span>${upiId}</span></div>` : ''}
    ${chequeNum ? `<div class="rcp-pay-info-item"><strong>Cheque No.</strong><span>${chequeNum}</span></div>` : ''}
    ${chequeDate ? `<div class="rcp-pay-info-item"><strong>Cheque Date</strong><span>${chequeDate}</span></div>` : ''}
    ${bankName ? `<div class="rcp-pay-info-item"><strong>Bank</strong><span>${bankName}</span></div>` : ''}
    ${bankIFSC ? `<div class="rcp-pay-info-item"><strong>IFSC</strong><span>${bankIFSC}</span></div>` : ''}
  `;

  // Status badge HTML
  const statusClass = {
    'Paid':       'status-paid',
    'Partial':    'status-partial',
    'Advance':    'status-advance',
    'Balance Due':'status-balance',
    'Overpaid':   'status-overpaid',
  }[T.status] || 'status-balance';
  const statusDot = {
    'Paid':'✓','Partial':'◑','Advance':'⟳','Balance Due':'!','Overpaid':'★'
  }[T.status] || '?';
  const statusBadge = T.status
    ? `<span class="status-badge ${statusClass}">${statusDot} ${T.status}</span>`
    : '';

  // Summary rows
  let sumRows = `<div class="rcp-summary-row header-row"><span>Payment Summary</span><span style="opacity:.75;">Receipt: ${rcptNum}</span></div>`;

  if (T.received > 0)
    sumRows += `<div class="rcp-summary-row"><span class="rs-label">Amount Received</span><span class="rs-val" style="color:var(--green);font-size:15px;font-weight:800;">${fmtINR(T.received)}</span></div>`;

  if (T.total > 0)
    sumRows += `<div class="rcp-summary-row"><span class="rs-label">Invoice / Order Amount</span><span class="rs-val">${fmtINR(T.total)}</span></div>`;
  if (T.outstanding > 0)
    sumRows += `<div class="rcp-summary-row"><span class="rs-label">Previous Outstanding</span><span class="rs-val">${fmtINR(T.outstanding)}</span></div>`;
  if (T.discount > 0)
    sumRows += `<div class="rcp-summary-row"><span class="rs-label">Discount / Adjustment</span><span class="rs-val" style="color:var(--green);">− ${fmtINR(T.discount)}</span></div>`;
  if (T.payable > 0)
    sumRows += `<div class="rcp-summary-row total-row"><span class="rs-label">Total Payable</span><span class="rs-val">${fmtINR(T.payable)}</span></div>`;
  if (T.balanceDue > 0)
    sumRows += `<div class="rcp-summary-row balance-row"><span class="rs-label" style="color:var(--red);">Balance Due</span><span class="rs-val" style="color:var(--red);">${fmtINR(T.balanceDue)}</span></div>`;
  if (T.overpaid > 0)
    sumRows += `<div class="rcp-summary-row balance-row"><span class="rs-label" style="color:#7c3aed;">Overpaid (to be adjusted)</span><span class="rs-val" style="color:#7c3aed;">${fmtINR(T.overpaid)}</span></div>`;

  // Multi-invoice table in preview
  let multiHTML = '';
  if (showMulti) {
    const rows = document.querySelectorAll('#multiInvBody tr');
    if (rows.length > 0) {
      let rowsHTML = '';
      rows.forEach(row => {
        const inputs = row.querySelectorAll('input');
        const invNum  = inputs[0]?.value || '—';
        const invDate = formatDate(inputs[1]?.value);
        const invAmt  = parseFloat(inputs[2]?.value) || 0;
        const rcvd    = parseFloat(inputs[3]?.value) || 0;
        const bal     = Math.max(0, invAmt - rcvd);
        rowsHTML += `<tr>
          <td style="font-weight:600;color:var(--ink);">${invNum}</td>
          <td>${invDate || '—'}</td>
          <td style="text-align:right;">${invAmt > 0 ? fmtINR(invAmt) : '—'}</td>
          <td style="text-align:right;color:var(--green);font-weight:700;">${rcvd > 0 ? fmtINR(rcvd) : '—'}</td>
          <td style="text-align:right;color:${bal>0?'var(--red)':'var(--green)'};font-weight:700;">${invAmt > 0 ? fmtINR(bal) : '—'}</td>
        </tr>`;
      });
      multiHTML = `
        <div style="margin-bottom:12px;">
          <div style="font-size:9.5px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:var(--ink-mute);margin-bottom:6px;">Invoice-wise Payment Details</div>
          <table class="rcp-multi-table">
            <thead><tr><th>Invoice No.</th><th>Date</th><th>Inv. Amount</th><th>Received</th><th>Balance</th></tr></thead>
            <tbody>${rowsHTML}</tbody>
          </table>
        </div>`;
    }
  }

  // Template class
  const tplClass = 'rcp-' + currentTemplate;

  const html = `
  <div class="${tplClass}" style="--accent:${currentAccent};">
    <div class="rcp-header">
      <div>
        ${logoHTML}
        <div class="rcp-biz-name">${bizName}</div>
        <div class="rcp-biz-detail">
          ${bizGSTIN ? 'GSTIN: ' + bizGSTIN + '<br>' : ''}
          ${bizAddress ? bizAddress + '<br>' : ''}
          ${bizPhone ? '📞 ' + bizPhone + '&nbsp;&nbsp;' : ''}${bizEmail ? '✉️ ' + bizEmail : ''}
          ${bizWeb ? '<br>🌐 ' + bizWeb : ''}
        </div>
      </div>
      <div>
        <div class="rcp-doc-title">PAYMENT RECEIPT</div>
        <div class="rcp-doc-meta">
          No: <strong>${rcptNum}</strong><br>
          Date: ${rcptDate}<br>
          ${payAgainst ? 'Against: ' + payAgainst + '<br>' : ''}
          ${relInvoice ? 'Invoice: ' + relInvoice + '<br>' : ''}
          ${relOrder ? 'Order: ' + relOrder + '<br>' : ''}
          ${statusBadge ? '<br>' + statusBadge : ''}
        </div>
      </div>
    </div>

    <div class="rcp-body ${currentTemplate === 'compact' ? '' : ''}">
      <div class="rcp-grid2">
        <div>
          <div class="rcp-box-label">Received From</div>
          <div class="rcp-box-name">${custName}</div>
          <div class="rcp-box-detail">
            ${custCompany ? custCompany + '<br>' : ''}
            ${custGSTIN ? 'GSTIN: ' + custGSTIN + '<br>' : ''}
            ${custAddress || ''}
            ${custPhone ? '<br>📞 ' + custPhone : ''}
            ${custEmail ? '<br>✉️ ' + custEmail : ''}
          </div>
        </div>
        <div>
          ${salesperson || beatRoute ? `
          <div class="rcp-box-label">Collection Details</div>
          <div class="rcp-box-detail">
            ${salesperson ? '<strong style="color:var(--ink);">Collector:</strong> ' + salesperson + '<br>' : ''}
            ${beatRoute ? '<strong style="color:var(--ink);">Beat / Route:</strong> ' + beatRoute : ''}
          </div>` : ''}
        </div>
      </div>

      <!-- Payment info -->
      <div class="rcp-pay-info">${payInfoItems}</div>

      <!-- Summary -->
      <div class="rcp-summary">${sumRows}</div>

      <!-- Amount in words -->
      ${T.received > 0 ? `
      <div class="rcp-words">
        <strong>Received Amount in Words:</strong> ${amountToWords(T.received)}
      </div>` : ''}

      <!-- Multi-invoice -->
      ${multiHTML}

      <!-- Acknowledgement -->
      ${showAck ? `
      <div class="rcp-ack">
        Received from <strong>${custName}</strong> the sum of <strong>${T.received > 0 ? amountToWords(T.received) : '—'}</strong> (${T.received > 0 ? fmtINR(T.received) : '—'}) via <strong>${payMode}</strong>${txnRef ? ' (Ref: ' + txnRef + ')' : ''} against ${payAgainst}${relInvoice ? ' No. ' + relInvoice : ''}.
      </div>` : ''}

      <!-- Notes / Terms -->
      ${(notes || terms) ? `
      <div class="rcp-notes">
        ${notes ? `<strong>Notes:</strong> ${notes}<br>` : ''}
        ${terms ? `<strong>Terms:</strong> ${terms}` : ''}
      </div>` : ''}

      <!-- Signature -->
      <div class="rcp-sig-row">
        <div class="rcp-sig-box">
          <img class="rcp-sig-img" src="${sigSrc}" alt="Signature" style="${sigImgStyle}">
          <div class="rcp-sig-line"></div>
          <div class="rcp-sig-name">${sigName}</div>
          <div class="rcp-sig-label">For ${bizName}</div>
        </div>
      </div>
    </div>

    <div class="rcp-footer-strip">
      Created using SalesOn Free Business Tools &nbsp;|&nbsp; saleson.co.in
    </div>
    <div class="rcp-disclaimer">
      SalesOn Free Tools help you create professional document formats. Please verify tax, accounting and legal compliance with your accountant before issuing official documents.
    </div>
  </div>`;

  document.getElementById('receiptPreview').innerHTML = html;
}

/* ─────────────────────────
   TOGGLE HELPERS
───────────────────────── */
function toggleSection(btn) {
  const body = btn.nextElementSibling;
  const isOpen = btn.classList.contains('open');
  btn.classList.toggle('open', !isOpen);
  body.classList.toggle('open', !isOpen);
}

function toggleFAQ(btn) {
  const ans = btn.nextElementSibling;
  const open = btn.classList.contains('open');
  btn.classList.toggle('open', !open);
  ans.classList.toggle('open', !open);
}

function toggleMobileNav() {
  document.getElementById('mobileNav').classList.toggle('open');
}

/* ─────────────────────────
   TEMPLATE / ACCENT
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
    const thumb = document.getElementById('logoThumb');
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
    const thumb = document.getElementById('sigThumb');
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
   ACTION TRIGGER → checks lead first
───────────────────────── */
function triggerAction(action) { if (action === 'reminder') reminderClickedThisSession = true; executeAction(action); }

function executeAction(action) {
  if (action === 'pdf' || action === 'print') {
    prepareSalesOnPrint('receiptPreview');
    window.print();
  } else if (action === 'wa') {
    openWaShare();
  } else if (action === 'reminder') {
    openReminderModal();
  }
}

/* ─────────────────────────
   WHATSAPP SHARE
───────────────────────── */
function openWaShare() {
  const T        = calcBalance();
  const cust     = document.getElementById('custName').value    || 'Customer';
  const rcptNum  = document.getElementById('rcptNumber').value  || '—';
  const bizName  = document.getElementById('bizName').value     || 'Your Business';
  const payMode  = document.getElementById('payMode').value     || '';

  const msg = `Hi ${cust},\n\nPayment Receipt No. ${rcptNum} from ${bizName} has been created for ${fmtINR(T.received)}.\n\nPayment Mode: ${payMode}\nBalance Due: ${T.balanceDue > 0 ? fmtINR(T.balanceDue) : '₹0.00 (Fully Paid)'}\n\nCreated using SalesOn Free Business Tools — saleson.co.in`;

  document.getElementById('waMessageBox').textContent = msg;
  document.getElementById('waOpenBtn').href = `https://wa.me/?text=${encodeURIComponent(msg)}`;
  document.getElementById('waModal').classList.add('open');
}

function copyWaMessage() {
  const msg = document.getElementById('waMessageBox').textContent;
  navigator.clipboard.writeText(msg).then(() => showToast('✓ Message copied!'));
}

/* ─────────────────────────
   PAYMENT REMINDER MODAL
───────────────────────── */
function openReminderModal() {
  const T       = calcBalance();
  const cust    = document.getElementById('custName').value    || 'Customer';
  const bizName = document.getElementById('bizName').value     || 'Your Business';
  const relInv  = document.getElementById('relatedInvoice').value || document.getElementById('rcptNumber').value || '—';
  const relOrd  = document.getElementById('relatedOrder').value || '';

  const ref = relInv || relOrd || '—';

  let msg;
  if (T.balanceDue > 0) {
    msg = `Hi ${cust}, this is a reminder that ${fmtINR(T.balanceDue)} is pending against ${ref} with ${bizName}. Kindly clear the payment at the earliest. Thank you.\n\n— ${bizName}`;
  } else {
    msg = `Hi ${cust}, your payment of ${fmtINR(T.received)} against ${ref} has been received and the account is fully settled. Thank you for your prompt payment.\n\n— ${bizName}`;
  }

  document.getElementById('reminderMessageBox').textContent = msg;
  document.getElementById('reminderOpenBtn').href = `https://wa.me/?text=${encodeURIComponent(msg)}`;
  document.getElementById('reminderModal').classList.add('open');
}

function copyReminderMessage() {
  const msg = document.getElementById('reminderMessageBox').textContent;
  navigator.clipboard.writeText(msg).then(() => showToast('✓ Reminder copied!'));
}

/* ─────────────────────────
   LEAD CAPTURE
───────────────────────── */


function skipLead() {}

/* ─────────────────────────
   SAVE / LOAD DRAFT
───────────────────────── */
function saveDraft() {
  const ids = [
    'bizName','bizGSTIN','bizAddress','bizPhone','bizEmail','bizWebsite',
    'custName','custCompany','custPhone','custEmail','custAddress','custGSTIN',
    'rcptNumber','rcptDate','payAgainst','relatedInvoice','relatedOrder','salesperson','beatRoute',
    'payMode','txnRef','chequeNum','bankName','chequeDate','upiId','bankName2','bankIFSC',
    'amtReceived','amtTotal','amtOutstanding','amtDiscount',
    'rcptNotes','rcptTerms','signatoryName'
  ];
  const draft = {};
  ids.forEach(id => {
    const el = document.getElementById(id);
    if (el) draft[id] = el.value;
  });
  draft.template = currentTemplate;
  draft.accent   = currentAccent;
  draft.logoDataURL = logoDataURL;
  draft.sigDataURL  = sigDataURL;
  draft.ackToggle   = document.getElementById('ackToggle').checked;
  draft.multiInvToggle = document.getElementById('multiInvToggle').checked;

  SalesOnStorage.setItem('saleson_payment_receipt_draft', JSON.stringify(draft));
  showToast('💾 Draft saved!');
}

function loadDraft() {
  const raw = SalesOnStorage.getItem('saleson_payment_receipt_draft');
  if (!raw) { showToast('⚠ No saved draft found'); return; }
  const draft = JSON.parse(raw);

  Object.keys(draft).forEach(id => {
    const el = document.getElementById(id);
    if (el && el.tagName !== 'IMG') el.value = draft[id];
  });

  if (draft.template) {
    currentTemplate = draft.template;
    document.querySelectorAll('.tpl-pill').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.tpl-pill').forEach(p => {
      if (p.textContent.toLowerCase() === draft.template) p.classList.add('active');
    });
  }
  if (draft.accent) {
    currentAccent = draft.accent;
    document.querySelectorAll('.accent-pill').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.accent-pill').forEach(p => {
      if (p.style.background === draft.accent) p.classList.add('active');
    });
  }
  if (draft.logoDataURL) {
    logoDataURL = draft.logoDataURL;
    const t = document.getElementById('logoThumb');
    t.src = logoDataURL; t.style.display = 'block';
  }
  if (draft.sigDataURL) {
    sigDataURL = draft.sigDataURL;
    const t = document.getElementById('sigThumb');
    t.src = sigDataURL; t.style.display = 'block';
  }
  document.getElementById('ackToggle').checked = !!draft.ackToggle;
  if (draft.multiInvToggle) {
    document.getElementById('multiInvToggle').checked = true;
    toggleMultiInv();
  }
  onPayModeChange();
  calcBalance();
  renderPreview();
  showToast('📂 Draft loaded!');
}

/* ─────────────────────────
   RESET FORM
───────────────────────── */
function resetForm() {
  if (!confirm('Reset all fields to sample data?')) return;
  logoDataURL = null; sigDataURL = null;
  document.getElementById('logoThumb').style.display = 'none';
  document.getElementById('sigThumb').style.display  = 'none';
  document.getElementById('multiInvBody').innerHTML  = '';
  multiInvRowCount = 0;
  document.getElementById('multiInvToggle').checked = false;
  document.getElementById('multiInvSection').style.display = 'none';
  document.getElementById('ackToggle').checked = true;
  // Restore template/accent defaults
  currentTemplate = 'classic';
  currentAccent   = '#1a56db';
  document.querySelectorAll('.tpl-pill').forEach((p,i) => p.classList.toggle('active', i===0));
  document.querySelectorAll('.accent-pill').forEach((p,i) => p.classList.toggle('active', i===0));
  initDefaults();
  showToast('↺ Form reset to sample data');
}

/* ─────────────────────────
   TOAST
───────────────────────── */
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2800);
}

