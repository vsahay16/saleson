
/* ─────────────────────────────────────
   STATE
───────────────────────────────────── */
let currentResult   = null;   // { type, headline, reason, nextSteps }
let pendingAction   = null;   // 'copy' | 'challan' | 'invoice' | 'wa' | 'save'
let checkCount      = 0;      // to trigger lead modal after 3 checks

/* Special case Y/N state — keyed by data-key */
const specialCases = {
  handDelivery: 'no', nonMotorized: 'no', exempted: 'no',
  shortLocal: 'no', jobworker: 'no', exhibition: 'no',
  unreg2reg: 'no', multiVehicle: 'no', multiInvoice: 'no'
};

/* ─────────────────────────────────────
   STATES LIST
───────────────────────────────────── */
const STATES = [
  'Andaman & Nicobar','Andhra Pradesh','Arunachal Pradesh','Assam','Bihar',
  'Chandigarh','Chhattisgarh','Dadra & Nagar Haveli','Daman & Diu','Delhi',
  'Goa','Gujarat','Haryana','Himachal Pradesh','Jammu & Kashmir','Jharkhand',
  'Karnataka','Kerala','Ladakh','Lakshadweep','Madhya Pradesh','Maharashtra',
  'Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Puducherry','Punjab',
  'Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh',
  'Uttarakhand','West Bengal'
];

function populateStates() {
  ['fromState','toState'].forEach(id => {
    const sel = document.getElementById(id);
    STATES.forEach(s => {
      const o = document.createElement('option');
      o.value = s; o.textContent = s; sel.appendChild(o);
    });
  });
}

/* ─────────────────────────────────────
   SPECIAL CASE YES/NO TOGGLES
───────────────────────────────────── */
function setYN(btn, val) {
  const key  = btn.getAttribute('data-key');
  const pair = btn.closest('.yn-btns');
  pair.querySelectorAll('.yn-btn').forEach(b => {
    b.classList.remove('active-yes','active-no');
  });
  btn.classList.add(val === 'yes' ? 'active-yes' : 'active-no');
  specialCases[key] = val;
  runChecker();
}

/* ─────────────────────────────────────
   COLLAPSIBLE SECTION TOGGLE
───────────────────────────────────── */
function toggleSection(btn) {
  const body = btn.nextElementSibling;
  const open = btn.classList.toggle('open');
  body.classList.toggle('open', open);
}

/* ─────────────────────────────────────
   READ FORM VALUES
───────────────────────────────────── */
function getFormData() {
  return {
    consignmentValue: parseFloat(document.getElementById('consignmentValue').value) || null,
    goodsDesc:        document.getElementById('goodsDesc').value.trim(),
    hsnCode:          document.getElementById('hsnCode').value.trim(),
    quantity:         document.getElementById('quantity').value.trim(),
    fromState:        document.getElementById('fromState').value,
    toState:          document.getElementById('toState').value,
    movementType:     document.getElementById('movementType').value,
    distance:         parseFloat(document.getElementById('distance').value) || null,
    movementDate:     document.getElementById('movementDate').value,
    supplierType:     document.getElementById('supplierType').value,
    recipientType:    document.getElementById('recipientType').value,
    moverType:        document.getElementById('moverType').value,
    reason:           document.getElementById('reasonForMovement').value,
    documentType:     document.getElementById('documentType').value,
    vehicleNumber:    document.getElementById('vehicleNumber').value.trim(),
    transporterID:    document.getElementById('transporterID').value.trim(),
    lrNumber:         document.getElementById('lrNumber').value.trim(),
    ...specialCases
  };
}

/* ─────────────────────────────────────
   RULE-BASED CHECKER LOGIC
───────────────────────────────────── */
const RESULT = {
  REQUIRED:   'required',
  MAYBE_NOT:  'maybeno',
  SPECIAL:    'special',
  INCOMPLETE: 'incomplete'
};

function applyRules(d) {
  const reasons  = [];
  const steps    = [];
  let   verdict  = RESULT.MAYBE_NOT;

  /* ── 0. Incomplete state ── */
  if (d.consignmentValue === null) {
    return {
      type: RESULT.INCOMPLETE,
      headline: 'Enter consignment value to check',
      reason: 'Please enter the total consignment value (₹) to get a result. This is the main trigger for e-way bill requirement.',
      nextSteps: ['Enter consignment value', 'Fill from and to state', 'Select reason for movement'],
      inputs: []
    };
  }

  /* ── 1. Value threshold — base rule ── */
  const val = d.consignmentValue;
  if (val > 50000) {
    verdict = RESULT.REQUIRED;
    reasons.push(`Consignment value ₹${val.toLocaleString('en-IN')} exceeds the ₹50,000 threshold.`);
  } else {
    verdict = RESULT.MAYBE_NOT;
    reasons.push(`Consignment value ₹${val.toLocaleString('en-IN')} is within/at the ₹50,000 threshold. E-way bill may not be required, but verify voluntary generation and state-specific rules.`);
  }

  /* ── 2. Interstate movement — stronger signal ── */
  const interstate = (d.movementType === 'interstate') ||
    (d.fromState && d.toState && d.fromState !== d.toState);
  if (interstate && val > 50000) {
    reasons.push(`Interstate movement (${d.fromState||'?'} → ${d.toState||'?'}) above ₹50,000 — e-way bill is mandatory.`);
    verdict = RESULT.REQUIRED;
  } else if (interstate && val <= 50000) {
    reasons.push(`Interstate movement. Even for values ≤ ₹50,000, some states or scenarios may need e-way bill. Verify.`);
    if (verdict !== RESULT.REQUIRED) verdict = RESULT.SPECIAL;
  }

  /* ── 3. No document yet ── */
  if (d.documentType === 'nodocument') {
    reasons.push('No document has been prepared yet. Generate a tax invoice or delivery challan first before creating an e-way bill.');
    verdict = RESULT.SPECIAL;
  }

  /* ── 4. Reason-based rules ── */
  const specialReasons = ['stocktransfer','vanloading','deliverybefore','branchtransfer'];
  const jobWorkReasons = ['jobwork'];
  if (specialReasons.includes(d.reason) && val > 50000) {
    reasons.push(`Reason: ${d.reason.replace(/([A-Z])/g,' $1')} — requires delivery challan AND an e-way bill if value > ₹50,000.`);
    verdict = RESULT.REQUIRED;
  }
  if (jobWorkReasons.includes(d.reason) && val > 50000) {
    reasons.push('Job work movement above ₹50,000 — e-way bill is likely required. Verify special exemptions under GST for job work.');
    verdict = RESULT.REQUIRED;
  }
  if (d.reason === 'exhibition' || d.reason === 'approval') {
    reasons.push('Goods for exhibition/approval — delivery challan required. E-way bill required if value > ₹50,000. Verify return trip rules.');
    if (val > 50000) verdict = RESULT.REQUIRED;
    else verdict = RESULT.SPECIAL;
  }

  /* ── 5. Unregistered parties ── */
  if (d.supplierType === 'unregistered' || d.recipientType === 'unregistered') {
    reasons.push('One or both parties are unregistered. Special rules may apply. Verify with your accountant.');
    if (verdict !== RESULT.REQUIRED) verdict = RESULT.SPECIAL;
  }

  /* ── 6. Special case toggles ── */
  if (specialCases.handDelivery === 'yes') {
    reasons.push('Hand delivery — e-way bill may be exempt. Verify with official rules.');
    if (verdict !== RESULT.REQUIRED) verdict = RESULT.SPECIAL;
  }
  if (specialCases.nonMotorized === 'yes') {
    reasons.push('Non-motorized conveyance — typically exempt from e-way bill. Verify.');
    if (verdict !== RESULT.REQUIRED) verdict = RESULT.SPECIAL;
  }
  if (specialCases.exempted === 'yes') {
    reasons.push('Goods are exempted/nil-rated — e-way bill may not be required. Verify the exemption notification.');
    verdict = RESULT.SPECIAL;
  }
  if (specialCases.shortLocal === 'yes') {
    reasons.push('Short local distance — some states exempt intra-city movement below 10–50 km. Verify state rule.');
    if (verdict !== RESULT.REQUIRED) verdict = RESULT.SPECIAL;
  }
  if (specialCases.jobworker === 'yes') {
    reasons.push('Movement to/from job worker — verify GST Circular and e-way bill notification for job work exemptions.');
    if (verdict === RESULT.MAYBE_NOT) verdict = RESULT.SPECIAL;
  }
  if (specialCases.unreg2reg === 'yes') {
    reasons.push('Unregistered to registered person — registered person becomes responsible for e-way bill compliance. Verify rules.');
    if (verdict !== RESULT.REQUIRED) verdict = RESULT.SPECIAL;
  }
  if (specialCases.multiVehicle === 'yes') {
    reasons.push('Multi-vehicle/transshipment — update vehicle details on e-way bill portal for each vehicle change.');
    if (verdict === RESULT.REQUIRED) reasons.push('Part-B must be updated each time the vehicle changes.');
  }
  if (specialCases.multiInvoice === 'yes') {
    reasons.push('Multiple invoices in one vehicle — each consignment/invoice above ₹50,000 may need a separate e-way bill. Verify consolidated e-way bill rules.');
    if (verdict !== RESULT.REQUIRED && val > 50000) verdict = RESULT.SPECIAL;
  }
  if (specialCases.exhibition === 'yes') {
    reasons.push('Exhibition/demo movement — delivery challan required. E-way bill needed if value > ₹50,000. Return journey also needs e-way bill.');
    if (val > 50000) verdict = RESULT.REQUIRED;
  }

  /* ── 7. Build next steps ── */
  if (verdict === RESULT.REQUIRED) {
    steps.push('Prepare tax invoice or delivery challan (required to generate e-way bill).');
    steps.push('Log in to ewaybillgst.gov.in and generate e-way bill.');
    steps.push('Keep e-way bill printout or copy with the vehicle/driver throughout transit.');
    steps.push('If vehicle changes en route, update Part-B of the e-way bill with new vehicle number.');
    steps.push('If using SalesOn, track dispatch and create delivery challan from the free tool below.');
  } else if (verdict === RESULT.MAYBE_NOT) {
    steps.push('Keep invoice or delivery challan ready with the goods during movement.');
    steps.push('Verify if the specific state has a lower threshold than ₹50,000 for intra-state movement.');
    steps.push('For voluntary e-way bill generation, use ewaybillgst.gov.in.');
    steps.push('Track dispatch internally using SalesOn delivery challan tool.');
  } else if (verdict === RESULT.SPECIAL) {
    steps.push('Check official ewaybillgst.gov.in portal and CBIC notifications for your specific case.');
    steps.push('Consult your GST accountant or tax consultant before moving goods.');
    steps.push('Prepare all supporting documents: invoice/challan, GSTIN details, vehicle number, reason for movement.');
    steps.push('Do not move goods without verifying compliance.');
  }

  /* ── 8. Summary headline ── */
  const headlines = {
    [RESULT.REQUIRED]:   'E-Way Bill Likely Required',
    [RESULT.MAYBE_NOT]:  'E-Way Bill May Not Be Required',
    [RESULT.SPECIAL]:    'Special Case — Verify Manually',
    [RESULT.INCOMPLETE]: 'Incomplete Details'
  };

  /* ── Inputs considered chips ── */
  const inputs = [
    d.consignmentValue ? `₹${d.consignmentValue.toLocaleString('en-IN')}` : null,
    d.fromState && d.toState ? `${d.fromState} → ${d.toState}` : null,
    d.reason || null,
    d.documentType || null,
    d.movementType || null
  ].filter(Boolean);

  return { type: verdict, headline: headlines[verdict], reason: reasons.join(' '), nextSteps: steps, inputs };
}

/* ─────────────────────────────────────
   RENDER RESULT CARD
───────────────────────────────────── */
function renderResult(res) {
  currentResult = res;

  const typeClass = {
    [RESULT.REQUIRED]:   'res-required',
    [RESULT.MAYBE_NOT]:  'res-maybe',
    [RESULT.SPECIAL]:    'res-special',
    [RESULT.INCOMPLETE]: 'res-incomplete'
  }[res.type];

  const icons = {
    [RESULT.REQUIRED]:   '🚨',
    [RESULT.MAYBE_NOT]:  '✅',
    [RESULT.SPECIAL]:    '⚠️',
    [RESULT.INCOMPLETE]: '📝'
  };

  const labels = {
    [RESULT.REQUIRED]:   'E-Way Bill Check Result',
    [RESULT.MAYBE_NOT]:  'E-Way Bill Check Result',
    [RESULT.SPECIAL]:    'E-Way Bill Check Result',
    [RESULT.INCOMPLETE]: 'Complete Your Details'
  };

  const inputChips = res.inputs.length
    ? `<div class="result-inputs">
        <div class="result-inputs-title">Inputs considered</div>
        <div class="result-input-chips">
          ${res.inputs.map(i=>`<span class="result-chip">${i}</span>`).join('')}
        </div>
       </div>` : '';

  const stepItems = res.nextSteps.map((s,i) =>
    `<li><span class="step-dot">${i+1}</span>${s}</li>`
  ).join('');

  const actionBtns = res.type !== RESULT.INCOMPLETE ? `
    <div class="result-actions">
      <button class="btn-res btn-challan" onclick="triggerAction('challan')">🚚 Create Delivery Challan</button>
      <button class="btn-res btn-invoice" onclick="triggerAction('invoice')">🧾 Create GST Invoice</button>
      <button class="btn-res btn-copy"    onclick="triggerAction('copy')">📋 Copy Result</button>
      <button class="btn-res btn-wa"      onclick="triggerAction('wa')">💬 Share</button>

    </div>` : `
    <div class="result-actions">
      <button class="btn-res btn-check" style="background:var(--brand);color:white;flex:1;" onclick="document.getElementById('consignmentValue').focus()">📝 Fill Details Above</button>
    </div>`;

  document.getElementById('resultCard').innerHTML = `
    <div class="result-card ${typeClass}">
      <div class="result-badge-bar">
        <span class="result-icon">${icons[res.type]}</span>
        <div class="result-title-block">
          <div class="result-label">${labels[res.type]}</div>
          <div class="result-headline">${res.headline}</div>
        </div>
      </div>
      <div class="result-body">
        <div class="result-reason">${res.reason}</div>
        ${inputChips}
        <div class="result-next">
          <div class="result-next-title">Suggested next steps</div>
          <ul class="result-next-list">${stepItems}</ul>
        </div>
        <div class="result-docs">
          <div class="result-docs-title">Documents to keep ready</div>
          <div class="docs-grid">
            <div class="doc-chip">📄 Tax Invoice / Bill of Supply / Delivery Challan</div>
            <div class="doc-chip">🔢 GSTIN details (supplier &amp; recipient)</div>
            <div class="doc-chip">📋 HSN code and goods description</div>
            <div class="doc-chip">💰 Consignment value</div>
            <div class="doc-chip">🚚 Vehicle number</div>
            <div class="doc-chip">🆔 Transporter ID (if applicable)</div>
            <div class="doc-chip">📍 From and to locations</div>
            <div class="doc-chip">🔗 E-way bill number (if generated)</div>
          </div>
        </div>
        <div class="result-disclaimer">
          <strong>⚠️ Important Disclaimer</strong>
          This tool gives a basic e-way bill requirement indication based on common GST rules. Please verify with the official e-way bill portal (ewaybillgst.gov.in), CBIC/GST notifications, or your accountant before moving goods. SalesOn does not provide tax or legal advice. Certain goods, states, distances, transport modes, and special cases may have different rules.
        </div>
        ${actionBtns}
      </div>
    </div>`;
}

/* ─────────────────────────────────────
   RUN CHECKER (main entry)
───────────────────────────────────── */
function runChecker(manual) {
  const data = getFormData();
  const res  = applyRules(data);
  renderResult(res);

  /* Count checks and trigger lead modal after 3 */
  if (manual) {
    checkCount++;

  }
}

/* ─────────────────────────────────────
   ACTION TRIGGER (lead gate)
───────────────────────────────────── */
function triggerAction(action) {  executeAction(action); }

function executeAction(action) {
  if (action === 'copy')    copyResult();
  if (action === 'wa')      openWaShare();
  if (action === 'challan') handoff('challan');
  if (action === 'invoice') handoff('invoice');
}

/* ─────────────────────────────────────
   COPY RESULT
───────────────────────────────────── */
function copyResult() {
  if (!currentResult) { showToast('Run a check first'); return; }
  const d    = getFormData();
  const text =
    `E-Way Bill Check Result\n` +
    `──────────────────────\n` +
    `Result:   ${currentResult.headline}\n` +
    `Goods:    ${d.goodsDesc || '—'}\n` +
    `Value:    ₹${d.consignmentValue?.toLocaleString('en-IN') || '—'}\n` +
    `Movement: ${d.fromState || '?'} → ${d.toState || '?'}\n` +
    `Reason:   ${d.reason || '—'}\n` +
    `Document: ${d.documentType || '—'}\n\n` +
    `Details:\n${currentResult.reason}\n\n` +
    `⚠️ DISCLAIMER: This is a basic indication only. Verify with ewaybillgst.gov.in or your accountant before moving goods.`;

  return SalesOnToolSafety.copy(text).then(ok => showToast(ok ? 'Copied to clipboard.' : 'Copy failed. Select and copy the text manually.'));
}

/* ─────────────────────────────────────
   WHATSAPP SHARE
───────────────────────────────────── */
function openWaShare() {
  if (!currentResult) { showToast('Run a check first'); return; }
  const d = getFormData();
  const msg =
    `E-Way Bill Check:\n` +
    `Goods: ${d.goodsDesc || '—'}\n` +
    `Value: ₹${d.consignmentValue?.toLocaleString('en-IN') || '—'}\n` +
    `Movement: ${d.fromState || '?'} to ${d.toState || '?'}\n` +
    `Reason: ${d.reason || '—'}\n` +
    `Result: ${currentResult.headline}\n\n` +
    `Note: Please verify with official GST/e-way bill portal (ewaybillgst.gov.in) or accountant before moving goods.`;

  document.getElementById('waMessageBox').textContent = msg;
  document.getElementById('waOpenBtn').href = `https://wa.me/?text=${encodeURIComponent(msg)}`;
  document.getElementById('waModal').classList.add('open');
}

function copyWaMessage() {
  const msg = document.getElementById('waMessageBox').textContent;
  return SalesOnToolSafety.copy(msg).then(ok => showToast(ok ? 'Copied to clipboard.' : 'Copy failed. Select and copy the text manually.'));
}

/* ─────────────────────────────────────
   HANDOFF TO CHALLAN / INVOICE
───────────────────────────────────── */
function handoff(type) {
  const d = getFormData();
  const payload = {
    consignmentValue: d.consignmentValue,
    goodsDescription: d.goodsDesc,
    hsnCode:          d.hsnCode,
    fromState:        d.fromState,
    toState:          d.toState,
    movementType:     d.movementType,
    reasonForMovement: d.reason,
    documentType:     d.documentType,
    vehicleNumber:    d.vehicleNumber,
    result:           currentResult?.headline || 'Unknown',
    checkedAt:        new Date().toISOString()
  };

  if (type === 'challan') {
    if (!SalesOnStorage.setItem('saleson_eway_to_challan_data', JSON.stringify(payload))) { alert('Transfer unavailable because browser storage is blocked or full. Download or print this document instead.'); return; }
    console.log('[SalesOn E-Way → Delivery Challan]', payload);
    showHandoffModal(
      'Data Saved for Delivery Challan',
      'Open the Delivery Challan Generator to continue. Your goods movement details have been saved.',
      '/tools/delivery-challan-generator',
      'Open Delivery Challan Generator →',
      '#059669'
    );
  } else {
    if (!SalesOnStorage.setItem('saleson_eway_to_invoice_data', JSON.stringify(payload))) { alert('Transfer unavailable because browser storage is blocked or full. Download or print this document instead.'); return; }
    console.log('[SalesOn E-Way → GST Invoice]', payload);
    showHandoffModal(
      'Data Saved for GST Invoice',
      'Open the GST Invoice Generator to continue. Your goods details have been saved.',
      '/tools/gst-invoice-generator',
      'Open GST Invoice Generator →',
      'var(--brand)'
    );
  }
}

function showHandoffModal(title, sub, link, btnText, color) {
  document.getElementById('handoffHeader').style.background = color;
  document.getElementById('handoffTitle').textContent = title;
  document.getElementById('handoffSub').textContent   = sub;
  document.getElementById('handoffMsg').textContent   = sub;
  const lnk = document.getElementById('handoffLink');
  lnk.href = link; lnk.textContent = btnText;
  document.getElementById('handoffModal').classList.add('open');
}

/* ─────────────────────────────────────
   SAVE / LOAD CHECK
───────────────────────────────────── */
function saveCheck() {
  if (!currentResult) { showToast('Run a check first'); return; }
  const d = getFormData();

  /* Add to recent checks array */
  const existing = JSON.parse(SalesOnStorage.getItem('saleson_eway_recent_checks') || '[]');
  const entry = {
    id:               Date.now(),
    goodsDesc:        d.goodsDesc || 'Unnamed goods',
    consignmentValue: d.consignmentValue,
    fromState:        d.fromState,
    toState:          d.toState,
    reason:           d.reason,
    documentType:     d.documentType,
    result:           currentResult.headline,
    resultType:       currentResult.type,
    formData:         d,
    specialCases:     { ...specialCases },
    checkedAt:        new Date().toISOString()
  };
  existing.unshift(entry);
  const limited = existing.slice(0, 5); // keep 5
  SalesOnStorage.setItem('saleson_eway_recent_checks', JSON.stringify(limited));
  renderRecentChecks();
  showToast(SalesOnStorage.persistent ? 'Check saved ✓' : 'Not saved to browser storage. Export before leaving.');
}

function loadLastCheck() {
  const existing = JSON.parse(SalesOnStorage.getItem('saleson_eway_recent_checks') || '[]');
  if (!existing.length) { showToast('No saved checks found'); return; }
  if(!confirm('Restore saved check? This replaces the current workspace.'))return;
  loadCheckEntry(existing[0]);
  return true;
}

function loadCheckEntry(entry) {
  const d = entry.formData;
  const sv = (id, val) => { const el=document.getElementById(id); if(el && val!==undefined) el.value=val; };

  sv('consignmentValue', d.consignmentValue);
  sv('goodsDesc', d.goodsDesc); sv('hsnCode', d.hsnCode); sv('quantity', d.quantity);
  sv('fromState', d.fromState); sv('toState', d.toState);
  sv('movementType', d.movementType); sv('distance', d.distance); sv('movementDate', d.movementDate);
  sv('supplierType', d.supplierType); sv('recipientType', d.recipientType); sv('moverType', d.moverType);
  sv('reasonForMovement', d.reason); sv('documentType', d.documentType);
  sv('vehicleNumber', d.vehicleNumber); sv('transporterID', d.transporterID); sv('lrNumber', d.lrNumber);

  /* Restore special cases */
  if (entry.specialCases) {
    Object.assign(specialCases, entry.specialCases);
    document.querySelectorAll('.yn-btn').forEach(btn => {
      const key = btn.getAttribute('data-key');
      const val = btn.getAttribute('data-val');
      btn.classList.remove('active-yes','active-no');
      if (specialCases[key] === val) {
        btn.classList.add(val === 'yes' ? 'active-yes' : 'active-no');
      }
    });
  }

  runChecker();
  showToast('Check loaded ✓');
}

function deleteCheckEntry(id) {
  let existing = JSON.parse(SalesOnStorage.getItem('saleson_eway_recent_checks') || '[]');
  existing = existing.filter(e => e.id !== id);
  SalesOnStorage.setItem('saleson_eway_recent_checks', JSON.stringify(existing));
  renderRecentChecks();
}

/* ─────────────────────────────────────
   RENDER RECENT CHECKS
───────────────────────────────────── */
function renderRecentChecks() {
  const existing = JSON.parse(SalesOnStorage.getItem('saleson_eway_recent_checks') || '[]');
  const wrap     = document.getElementById('recentChecks');
  if (!existing.length) { wrap.innerHTML = ''; return; }

  const badgeClass = { required:'req', maybeno:'notreq', special:'special', incomplete:'incomplete' };
  const items = existing.map(e => `
    <div class="rc-item">
      <div class="rc-info">
        <div class="rc-goods">${e.goodsDesc}</div>
        <div class="rc-meta">
          ₹${(e.consignmentValue||0).toLocaleString('en-IN')} &nbsp;·&nbsp;
          ${e.fromState||'?'} → ${e.toState||'?'} &nbsp;·&nbsp;
          ${new Date(e.checkedAt).toLocaleDateString('en-IN')}
        </div>
      </div>
      <span class="rc-badge ${badgeClass[e.resultType]||'incomplete'}">${e.result}</span>
      <div class="rc-btns">
        <button class="rc-btn rc-btn-load" onclick='loadCheckEntry(${JSON.stringify(e).replace(/'/g,"&#39;")})'>Load</button>
        <button class="rc-btn rc-btn-del"  onclick="deleteCheckEntry(${e.id})">✕</button>
      </div>
    </div>`).join('');

  wrap.innerHTML = `<div class="rc-title">Recent Checks (${existing.length})</div><div class="rc-list">${items}</div>`;
}

/* ─────────────────────────────────────
   RESET FORM
───────────────────────────────────── */
function resetForm() {
  if (!confirm('Reset all fields to sample data?')) return;
  Object.keys(specialCases).forEach(k => specialCases[k] = 'no');
  document.querySelectorAll('.yn-btn').forEach(btn => {
    btn.classList.remove('active-yes','active-no');
    if (btn.getAttribute('data-val') === 'no') btn.classList.add('active-no');
  });
  checkCount = 0;
  initDefaults();
  showToast('Form reset ✓');
}

/* ─────────────────────────────────────
   LEAD MODAL
───────────────────────────────────── */


function skipLead() {}

/* ─────────────────────────────────────
   FAQ ACCORDION
───────────────────────────────────── */
function toggleFaq(btn) {
  const a = btn.nextElementSibling;
  const open = btn.classList.contains('open');
  document.querySelectorAll('.faq-q').forEach(b => { b.classList.remove('open'); b.nextElementSibling.classList.remove('open'); });
  if (!open) { btn.classList.add('open'); a.classList.add('open'); }
}

/* ─────────────────────────────────────
   TOAST
───────────────────────────────────── */
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg; t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2600);
}

/* ─────────────────────────────────────
   INIT DEFAULTS (sample data)
───────────────────────────────────── */
function initDefaults() {
  const today = SalesOnDates.today();
  document.getElementById('movementDate').value  = today;
  document.getElementById('consignmentValue').value = '75000';
  document.getElementById('goodsDesc').value     = 'FMCG Product Boxes';
  document.getElementById('hsnCode').value       = '3401';
  document.getElementById('fromState').value     = 'Bihar';
  document.getElementById('toState').value       = 'Jharkhand';
  document.getElementById('movementType').value  = 'interstate';
  document.getElementById('distance').value      = '120';
  document.getElementById('reasonForMovement').value = 'sale';
  document.getElementById('documentType').value  = 'taxinvoice';
  document.getElementById('vehicleNumber').value = 'BR01AB1234';
  runChecker();
}

/* ─────────────────────────────────────
   BOOT
───────────────────────────────────── */
populateStates();
initDefaults();
renderRecentChecks();

