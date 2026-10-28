
/* ─────────────────────────────────────────────
   STATE
───────────────────────────────────────────── */
let entries       = [];     // all invoice entries
let filteredIds   = [];     // currently visible entry ids after filter
let selectedIds   = new Set(); // bulk selected
let pendingAction = null;   // for lead gate
let entryCount    = 0;      // trigger lead after 5
let pendingWaEntry = null;  // entry for WA modal
let logoDataURL   = null;
let editingId     = null;

const STORAGE_KEY = 'saleson_outstanding_payment_tracker_data';


/* ─────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────── */
function fmtINR(n) {
  return '₹' + Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function today() { const d = new Date(); return [d.getFullYear(), String(d.getMonth()+1).padStart(2,'0'), String(d.getDate()).padStart(2,'0')].join('-'); }
function parseDate(s) { if (!s) return null; const [y,m,d] = s.split('-').map(Number); return new Date(y,m-1,d); }
function diffDays(from, to) {
  const a = Date.UTC(from.getFullYear(), from.getMonth(), from.getDate());
  const b = Date.UTC(to.getFullYear(), to.getMonth(), to.getDate());
  return Math.round((b-a) / 86400000);
}
function formatDisplayDate(s) {
  if (!s) return '';
  const [y,m,d] = s.split('-');
  return `${d}/${m}/${y}`;
}
function uid() { return Date.now() + Math.random().toString(36).slice(2,8); }

/* ─────────────────────────────────────────────
   BALANCE CALC (live form)
───────────────────────────────────────────── */
function calcBalance() {
  const inv  = parseFloat(document.getElementById('fInvAmt').value)  || 0;
  const paid = parseFloat(document.getElementById('fPaidAmt').value) || 0;
  const adj  = parseFloat(document.getElementById('fAdj').value)     || 0;
  const bal  = Math.max(0, inv - paid - adj);
  document.getElementById('fBalance').value = fmtINR(bal);
  // compute status preview
  const due  = document.getElementById('fDueDate').value;
  document.getElementById('fStatus').value  = computeStatus(bal, paid, due);
}

function computeStatus(bal, paid, dueDate) {
  if (bal <= 0) return 'Paid';
  if (paid > 0 && bal > 0) {
    if (dueDate && dueDate < today()) return 'Overdue';
    return 'Partial';
  }
  if (dueDate && dueDate < today()) return 'Overdue';
  return 'Unpaid';
}

function computeDaysOverdue(bal, dueDate) {
  if (bal <= 0 || !dueDate || dueDate >= today()) return 0;
  return diffDays(parseDate(dueDate), new Date());
}

function computeAgeing(bal, dueDate) {
  if (bal <= 0) return 'Paid';
  if (!dueDate || dueDate >= today()) return 'Not Due';
  const days = computeDaysOverdue(bal, dueDate);
  if (days <= 7)  return '0-7 Days';
  if (days <= 15) return '8-15 Days';
  if (days <= 30) return '16-30 Days';
  if (days <= 60) return '31-60 Days';
  return '60+ Days';
}

function computeRisk(ageing) {
  const map = { 'Paid':'', 'Not Due':'Low', '0-7 Days':'Low', '8-15 Days':'Medium', '16-30 Days':'High', '31-60 Days':'Critical', '60+ Days':'Critical' };
  return map[ageing] || '';
}

/* ─────────────────────────────────────────────
   ADD / UPDATE ENTRY
───────────────────────────────────────────── */
function addOrUpdateEntry() {
  const party  = document.getElementById('fParty').value.trim();
  const invNum = document.getElementById('fInvNum').value.trim();
  const invAmt = parseFloat(document.getElementById('fInvAmt').value) || 0;

  if (!party || !invNum || !invAmt) {
    showToast('Please fill Party Name, Invoice Number and Invoice Amount');
    return;
  }

  const paid  = parseFloat(document.getElementById('fPaidAmt').value) || 0;
  const adj   = parseFloat(document.getElementById('fAdj').value)     || 0;
  const bal   = Math.max(0, invAmt - paid - adj);
  const due   = document.getElementById('fDueDate').value;

  const entry = {
    id:         editingId || uid(),
    party:      party,
    company:    document.getElementById('fCompany').value.trim(),
    mobile:     document.getElementById('fMobile').value.trim(),
    city:       document.getElementById('fCity').value.trim(),
    salesperson:document.getElementById('fSales').value.trim(),
    beat:       document.getElementById('fBeat').value.trim(),
    invNum:     invNum,
    invDate:    document.getElementById('fInvDate').value,
    dueDate:    due,
    invAmount:  invAmt,
    paidAmount: paid,
    adjustment: adj,
    balance:    bal,
    status:     computeStatus(bal, paid, due),
    daysOverdue:computeDaysOverdue(bal, due),
    ageing:     computeAgeing(bal, due),
    promise:    document.getElementById('fPromise').value,
    lastFollowup: document.getElementById('fLastFollowup').value,
    nextFollowup: document.getElementById('fFollowup').value,
    notes:      document.getElementById('fNotes').value.trim(),
    createdAt:  editingId ? (entries.find(e=>e.id===editingId)?.createdAt || new Date().toISOString()) : new Date().toISOString(),
    updatedAt:  new Date().toISOString()
  };

  if (editingId) {
    const idx = entries.findIndex(e => e.id === editingId);
    if (idx >= 0) entries[idx] = entry;
    showToast('Entry updated ✓');
  } else {
    entries.unshift(entry);
    entryCount++;
    showToast('Entry added ✓');
    // Lead trigger after 5 entries

  }

  saveEntries();
  clearForm();
  renderDashboard();
  renderTable();
  updateFilterDropdowns();
}

function clearForm() {
  editingId = null;
  ['fParty','fCompany','fMobile','fCity','fSales','fBeat','fInvNum','fNotes'].forEach(id => document.getElementById(id).value = '');
  ['fInvDate','fDueDate','fPromise','fLastFollowup','fFollowup'].forEach(id => document.getElementById(id).value = '');
  document.getElementById('fInvAmt').value  = '';
  document.getElementById('fPaidAmt').value = '0';
  document.getElementById('fAdj').value     = '0';
  document.getElementById('fBalance').value = '';
  document.getElementById('fStatus').value  = '';
  document.getElementById('editingId').value = '';
  document.getElementById('btnUpdate').style.display = 'none';
  document.getElementById('formPanel').querySelector('.btn-add').textContent = '➕ Add Entry';
}

function editEntry(id) {
  const e = entries.find(x => x.id === id);
  if (!e) return;
  editingId = id;
  document.getElementById('editingId').value = id;
  document.getElementById('fParty').value   = e.party;
  document.getElementById('fCompany').value = e.company;
  document.getElementById('fMobile').value  = e.mobile;
  document.getElementById('fCity').value    = e.city;
  document.getElementById('fSales').value   = e.salesperson;
  document.getElementById('fBeat').value    = e.beat;
  document.getElementById('fInvNum').value  = e.invNum;
  document.getElementById('fInvDate').value = e.invDate;
  document.getElementById('fDueDate').value = e.dueDate;
  document.getElementById('fInvAmt').value  = e.invAmount;
  document.getElementById('fPaidAmt').value = e.paidAmount;
  document.getElementById('fAdj').value     = e.adjustment;
  document.getElementById('fPromise').value = e.promise;
  document.getElementById('fLastFollowup').value = e.lastFollowup;
  document.getElementById('fFollowup').value = e.nextFollowup;
  document.getElementById('fNotes').value   = e.notes;
  calcBalance();
  document.getElementById('btnUpdate').style.display = 'flex';
  document.getElementById('formPanel').querySelector('.btn-add').style.display = 'none';
  // Scroll to form
  document.getElementById('formPanel').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function deleteEntry(id) {
  if (!confirm('Delete this entry?')) return;
  entries = entries.filter(e => e.id !== id);
  selectedIds.delete(id);
  saveEntries();
  renderDashboard();
  renderTable();
  updateFilterDropdowns();
  showToast('Entry deleted');
}

function markPaid(id) {
  const e = entries.find(x => x.id === id);
  if (!e) return;
  e.paidAmount = e.invAmount;
  e.balance    = 0;
  e.status     = 'Paid';
  e.daysOverdue = 0;
  e.ageing     = 'Paid';
  e.updatedAt  = new Date().toISOString();
  saveEntries();
  renderDashboard();
  renderTable();
  showToast('Marked as Paid ✓');
}

/* ─────────────────────────────────────────────
   WHATSAPP REMINDER
───────────────────────────────────────────── */
function openWaReminder(id) {
  const e = entries.find(x => x.id === id);
  if (!e) return;
  pendingWaEntry = e;
  const biz = document.getElementById('bizName').value || 'Our Business';

  let msg;
  if (e.daysOverdue > 15) {
    msg = `Dear ${e.party}, payment of ${fmtINR(e.balance)} against invoice ${e.invNum} is overdue by ${e.daysOverdue} days. Please clear the dues at the earliest or confirm a payment date. Thank you — ${biz}.`;
  } else {
    msg = `Hi ${e.party}, this is a reminder that ${fmtINR(e.balance)} is pending against invoice ${e.invNum} from ${biz}. Due date: ${formatDisplayDate(e.dueDate)}. Kindly clear the payment or share expected payment date. Thank you.`;
  }

  document.getElementById('waMsg').textContent = msg;

  let mobile = (e.mobile||'').replace(/[\s+\-]/g, '');
  if (mobile.length === 10) mobile = '91' + mobile;
  const url = mobile
    ? `https://wa.me/${mobile}?text=${encodeURIComponent(msg)}`
    : `https://wa.me/?text=${encodeURIComponent(msg)}`;
  document.getElementById('waOpenBtn').href = url;
  document.getElementById('waModal').classList.add('open');
}

function copyWaMessage() {
  const msg = document.getElementById('waMsg').textContent;
  navigator.clipboard.writeText(msg)
    .then(() => showToast('Message copied!'))
    .catch(() => { const t=document.createElement('textarea'); t.value=msg; document.body.appendChild(t); t.select(); document.execCommand('copy'); document.body.removeChild(t); showToast('Copied!'); });
}

/* ─────────────────────────────────────────────
   PAYMENT RECEIPT HANDOFF
───────────────────────────────────────────── */
function createReceipt(id) {
  const e = entries.find(x => x.id === id);
  if (!e) return;
  const payload = {
    partyName: e.party, mobile: e.mobile, invoiceNumber: e.invNum,
    invoiceDate: e.invDate, dueDate: e.dueDate, invoiceAmount: e.invAmount,
    paidAmount: e.paidAmount, balanceAmount: e.balance,
    salesperson: e.salesperson, beatRoute: e.beat, selectedAt: new Date().toISOString(),
    adjustment: e.adjustment,
  };
  if (!SalesOnStorage.setItem('saleson_outstanding_to_receipt_data', JSON.stringify(payload))) { alert('Transfer unavailable because browser storage is blocked or full. Download or print this document instead.'); return; }
  console.log('[SalesOn Outstanding → Receipt]', payload);
  showHandoff('Payment Receipt Data Saved', 'Open the Payment Receipt Generator to create a receipt for this payment.', '/tools/payment-receipt-generator', 'Open Payment Receipt Generator →', '#d97706');
}

function showHandoff(title, sub, link, btnText, color) {
  document.getElementById('handoffHeader').style.background = color;
  document.getElementById('handoffTitle').textContent = title;
  document.getElementById('handoffSub').textContent   = sub;
  const lnk = document.getElementById('handoffLink');
  lnk.href = link; lnk.textContent = btnText;
  lnk.style.background = color;
  document.getElementById('handoffModal').classList.add('open');
}

/* ─────────────────────────────────────────────
   RENDER DASHBOARD (KPIs + Ageing)
───────────────────────────────────────────── */
function renderDashboard() {
  if (!entries.length) {
    document.getElementById('kpiGrid').innerHTML = '';
    document.getElementById('ageingGrid').innerHTML = '<div style="font-size:13px;color:var(--ink-mute);padding:8px;">Add entries to see ageing summary.</div>';
    return;
  }

  const totalInv = entries.reduce((s,e) => s + e.invAmount, 0);
  const totalPaid = entries.reduce((s,e) => s + e.paidAmount + e.adjustment, 0);
  const totalOut = entries.reduce((s,e) => s + e.balance, 0);
  const overdueAmt = entries.filter(e => e.status === 'Overdue').reduce((s,e) => s + e.balance, 0);
  const uniqueParties = new Set(entries.map(e => e.party)).size;
  const overdueParties = new Set(entries.filter(e=>e.status==='Overdue').map(e=>e.party)).size;

  // Highest outstanding party
  const partyMap = {};
  entries.forEach(e => { partyMap[e.party] = (partyMap[e.party]||0) + e.balance; });
  const topParty = Object.entries(partyMap).sort((a,b)=>b[1]-a[1])[0];

  // Avg days overdue (only overdue)
  const overdueEntries = entries.filter(e=>e.daysOverdue>0);
  const avgDays = overdueEntries.length ? Math.round(overdueEntries.reduce((s,e)=>s+e.daysOverdue,0)/overdueEntries.length) : 0;

  document.getElementById('kpiGrid').innerHTML = `
    <div class="kpi-card kpi-brand"><div class="kpi-label">Total Invoice</div><div class="kpi-value brand">${fmtINR(totalInv)}</div><div class="kpi-sub">${entries.length} invoices</div></div>
    <div class="kpi-card kpi-green"><div class="kpi-label">Total Received</div><div class="kpi-value green">${fmtINR(totalPaid)}</div><div class="kpi-sub">${entries.filter(e=>e.status==='Paid').length} paid</div></div>
    <div class="kpi-card kpi-amber"><div class="kpi-label">Total Outstanding</div><div class="kpi-value amber">${fmtINR(totalOut)}</div><div class="kpi-sub">${uniqueParties} parties</div></div>
    <div class="kpi-card kpi-red"><div class="kpi-label">Overdue Amount</div><div class="kpi-value red">${fmtINR(overdueAmt)}</div><div class="kpi-sub">${overdueParties} parties overdue</div></div>
    <div class="kpi-card"><div class="kpi-label">Total Parties</div><div class="kpi-value">${uniqueParties}</div><div class="kpi-sub">${overdueParties} overdue</div></div>
    <div class="kpi-card kpi-red"><div class="kpi-label">Overdue Parties</div><div class="kpi-value red">${overdueParties}</div><div class="kpi-sub">Need follow-up</div></div>
    <div class="kpi-card"><div class="kpi-label">Highest Outstanding</div><div class="kpi-value" style="font-size:14px;">${topParty?topParty[0]:'—'}</div><div class="kpi-sub">${topParty?fmtINR(topParty[1]):''}</div></div>
    <div class="kpi-card kpi-amber"><div class="kpi-label">Avg Days Overdue</div><div class="kpi-value amber">${avgDays}</div><div class="kpi-sub">days (overdue entries)</div></div>`;

  // Ageing buckets
  const buckets = {
    'Paid':{'label':'Paid','class':'age-paid','count':0,'amt':0},
    'Not Due':{'label':'Not Due','class':'age-low','count':0,'amt':0},
    '0-7 Days':{'label':'0–7 Days','class':'age-low','count':0,'amt':0},
    '8-15 Days':{'label':'8–15 Days','class':'age-medium','count':0,'amt':0},
    '16-30 Days':{'label':'16–30 Days','class':'age-high','count':0,'amt':0},
    '31-60 Days':{'label':'31–60 Days','class':'age-critical','count':0,'amt':0},
    '60+ Days':{'label':'60+ Days','class':'age-critical','count':0,'amt':0}
  };
  entries.forEach(e => {
    if (buckets[e.ageing]) { buckets[e.ageing].count++; buckets[e.ageing].amt += e.balance; }
  });
  document.getElementById('ageingGrid').innerHTML = Object.entries(buckets).map(([key,b]) => `
    <div class="age-bucket ${b.class}" onclick="filterByAgeing('${key}')">
      <div class="age-count">${b.count}</div>
      <div class="age-label">${b.label}</div>
      <div class="age-amount">${b.amt > 0 ? fmtINR(b.amt) : '—'}</div>
    </div>`).join('');
}

function filterByAgeing(bucket) {
  document.getElementById('fAge').value = bucket;
  renderTable();
  document.getElementById('collTable').scrollIntoView({behavior:'smooth',block:'start'});
}

/* ─────────────────────────────────────────────
   COLUMN HEADER SORT
───────────────────────────────────────────── */
let _sortCol = null;
let _sortAsc = true;

function setSortCol(col) {
  if (_sortCol === col) {
    _sortAsc = !_sortAsc;
  } else {
    _sortCol = col;
    _sortAsc = true;
  }
  // update header arrow indicators
  document.querySelectorAll('th.sortable').forEach(th => {
    th.classList.remove('sort-asc','sort-desc');
    const thCol = th.getAttribute('onclick').match(/setSortCol\('([^']+)'\)/);
    if (thCol && thCol[1] === _sortCol) {
      th.classList.add(_sortAsc ? 'sort-asc' : 'sort-desc');
    }
  });
  // sort entries in-place
  entries.sort((a, b) => {
    let av, bv;
    switch (col) {
      case 'party':   av = (a.party||'').toLowerCase(); bv = (b.party||'').toLowerCase(); break;
      case 'invoice': av = (a.invNum||'').toLowerCase(); bv = (b.invNum||'').toLowerCase(); break;
      case 'invdate': av = a.invDate||''; bv = b.invDate||''; break;
      case 'duedate': av = a.dueDate||''; bv = b.dueDate||''; break;
      case 'amount':  av = a.invAmount||0; bv = b.invAmount||0; break;
      case 'balance': av = a.balance||0; bv = b.balance||0; break;
      case 'days':    av = a.daysOverdue||0; bv = b.daysOverdue||0; break;
      default: return 0;
    }
    if (av < bv) return _sortAsc ? -1 : 1;
    if (av > bv) return _sortAsc ? 1 : -1;
    return 0;
  });
  renderTable();
}

/* ─────────────────────────────────────────────
   RENDER TABLE
───────────────────────────────────────────── */
function renderTable() {
  const search   = document.getElementById('fSearch').value.toLowerCase();
  const status   = document.getElementById('fStatus2').value;
  const ageing   = document.getElementById('fAge').value;
  const sales    = document.getElementById('fSalesFilter').value;
  const beat     = document.getElementById('fBeatFilter').value;
  const minBal   = parseFloat(document.getElementById('fMinBal').value) || 0;
  const sort     = document.getElementById('fSort').value;

  let filtered = entries.filter(e => {
    if (search && !(`${e.party} ${e.invNum} ${e.salesperson} ${e.company}`.toLowerCase().includes(search))) return false;
    if (status && e.status !== status) return false;
    if (ageing && e.ageing !== ageing) return false;
    if (sales  && e.salesperson !== sales) return false;
    if (beat   && e.beat !== beat) return false;
    if (minBal && e.balance < minBal) return false;
    return true;
  });

  // Sort
  filtered.sort((a,b) => {
    if (sort === 'highest') return b.balance - a.balance;
    if (sort === 'oldest')  return b.daysOverdue - a.daysOverdue;
    if (sort === 'newest')  return (b.invDate||'').localeCompare(a.invDate||'');
    if (sort === 'party')   return a.party.localeCompare(b.party);
    if (sort === 'sales')   return a.salesperson.localeCompare(b.salesperson);
    return 0;
  });

  filteredIds = filtered.map(e => e.id);
  document.getElementById('tableCount').textContent = `${filtered.length} of ${entries.length} entries`;

  if (!filtered.length) {
    document.getElementById('tableBody').innerHTML = `<tr><td colspan="16"><div class="empty-state"><div class="es-icon">🔍</div><div class="es-title">No entries match filters</div><div class="es-sub">Try clearing the filters.</div></div></td></tr>`;
    return;
  }

  const statusClass = { Paid:'row-paid', Overdue:'row-overdue', Partial:'row-partial', Unpaid:'' };
  const statusBadge = { Paid:'status-paid', Overdue:'status-overdue', Partial:'status-partial', Unpaid:'status-unpaid' };
  const riskBadge   = { Low:'risk-low', Medium:'risk-medium', High:'risk-high', Critical:'risk-critical' };

  document.getElementById('tableBody').innerHTML = filtered.map(e => {
    const risk = computeRisk(e.ageing);
    return `<tr class="${statusClass[e.status]||''} ${selectedIds.has(e.id)?'row-selected':''}" id="tr_${e.id}">
      <td><input type="checkbox" ${selectedIds.has(e.id)?'checked':''} onchange="toggleSelect('${e.id}',this.checked)" style="cursor:pointer;width:14px;height:14px;"></td>
      <td style="font-weight:700;color:var(--ink);">${e.party}${e.company?'<br><span style="font-size:10.5px;color:var(--ink-mute);">'+e.company+'</span>':''}</td>
      <td><a href="https://wa.me/${cleanMobile(e.mobile)}" target="_blank" style="color:var(--brand);text-decoration:none;font-size:12px;">${e.mobile}</a></td>
      <td style="font-weight:600;">${e.invNum}</td>
      <td>${formatDisplayDate(e.invDate)}</td>
      <td style="${e.daysOverdue>0?'color:var(--red);font-weight:600;':''}">${formatDisplayDate(e.dueDate)}</td>
      <td style="text-align:right;font-weight:600;">${fmtINR(e.invAmount)}</td>
      <td style="text-align:right;color:var(--green);">${fmtINR(e.paidAmount)}</td>
      <td style="text-align:right;font-weight:800;${e.balance>0?'color:var(--red);':'color:var(--green);'}">${fmtINR(e.balance)}</td>
      <td style="text-align:center;${e.daysOverdue>0?'color:var(--red);font-weight:700;':''}">${e.daysOverdue>0?e.daysOverdue:'—'}</td>
      <td><span class="status-badge status-${e.ageing==='Paid'?'paid':e.ageing==='Not Due'?'unpaid':e.daysOverdue<=7?'partial':e.daysOverdue<=15?'partial':'overdue'}">${e.ageing}</span>${risk?'<br><span class="risk-badge risk-'+risk.toLowerCase()+'">'+risk+'</span>':''}</td>
      <td>${e.salesperson||'—'}</td>
      <td>${e.beat||'—'}</td>
      <td style="font-size:11.5px;">${formatDisplayDate(e.nextFollowup)||'—'}</td>
      <td><span class="status-badge ${statusBadge[e.status]||'status-unpaid'}">${e.status}</span></td>
      <td>
        <div class="row-actions">
          <button class="btn-row btn-row-edit" onclick="editEntry('${e.id}')">✏️</button>
          <button class="btn-row btn-row-paid" onclick="markPaid('${e.id}')" title="Mark Paid">✓</button>
          <button class="btn-row btn-row-wa"   onclick="triggerAction('wa','${e.id}')">💬</button>
          <button class="btn-row btn-row-rcpt" onclick="triggerAction('receipt','${e.id}')" title="Create Receipt">🧾</button>
          <button class="btn-row btn-row-del"  onclick="deleteEntry('${e.id}')">🗑️</button>
        </div>
      </td>
    </tr>`;
  }).join('');
}

function cleanMobile(m) {
  if (!m) return '';
  let s = m.replace(/[\s+\-]/g,'');
  if (s.length===10) s = '91'+s;
  return s;
}

/* ─────────────────────────────────────────────
   FILTER DROPDOWNS — populate salesperson & beat
───────────────────────────────────────────── */
function updateFilterDropdowns() {
  const salesSet = new Set(entries.map(e=>e.salesperson).filter(Boolean));
  const beatSet  = new Set(entries.map(e=>e.beat).filter(Boolean));
  const sf = document.getElementById('fSalesFilter');
  const bef = document.getElementById('fBeatFilter');
  const sv = sf.value, bv = bef.value;
  sf.innerHTML  = '<option value="">All Salesmen</option>' + [...salesSet].map(s=>`<option value="${s}">${s}</option>`).join('');
  bef.innerHTML = '<option value="">All Beats</option>'    + [...beatSet].map(b=>`<option value="${b}">${b}</option>`).join('');
  if (sv) sf.value=sv;
  if (bv) bef.value=bv;
}

function resetFilters() {
  ['fSearch','fMinBal'].forEach(id => document.getElementById(id).value='');
  ['fStatus2','fAge','fSalesFilter','fBeatFilter'].forEach(id => document.getElementById(id).value='');
  document.getElementById('fSort').value = 'highest';
  renderTable();
}

/* ─────────────────────────────────────────────
   BULK ACTIONS
───────────────────────────────────────────── */
function toggleSelect(id, checked) {
  if (checked) selectedIds.add(id); else selectedIds.delete(id);
  updateBulkBar();
  const tr = document.getElementById('tr_'+id);
  if (tr) tr.classList.toggle('row-selected', checked);
}

function toggleSelectAll(checked) {
  filteredIds.forEach(id => {
    if (checked) selectedIds.add(id); else selectedIds.delete(id);
    const tr = document.getElementById('tr_'+id);
    if (tr) tr.classList.toggle('row-selected', checked);
    const cb = tr?.querySelector('input[type=checkbox]');
    if (cb) cb.checked = checked;
  });
  document.getElementById('selectAll').checked = checked;
  document.getElementById('selectAllHead').checked = checked;
  updateBulkBar();
}

function clearSelection() {
  selectedIds.clear();
  document.querySelectorAll('#tableBody input[type=checkbox]').forEach(cb => cb.checked=false);
  document.getElementById('selectAll').checked=false;
  document.getElementById('selectAllHead').checked=false;
  updateBulkBar();
}

function updateBulkBar() {
  const bar = document.getElementById('bulkBar');
  if (selectedIds.size > 0) {
    bar.classList.add('show');
    document.getElementById('bulkCount').textContent = `${selectedIds.size} selected`;
  } else {
    bar.classList.remove('show');
  }
}

function getSelectedEntries() {
  return entries.filter(e => selectedIds.has(e.id));
}

function bulkWhatsApp() {
  const sel = getSelectedEntries();
  if (!sel.length) return;
  const biz = document.getElementById('bizName').value || 'Our Business';
  sel.forEach((e, i) => {
    setTimeout(() => {
      let msg = e.daysOverdue > 15
        ? `Dear ${e.party}, payment of ${fmtINR(e.balance)} against invoice ${e.invNum} is overdue by ${e.daysOverdue} days. Please clear at the earliest — ${biz}.`
        : `Hi ${e.party}, reminder: ${fmtINR(e.balance)} pending on invoice ${e.invNum}. Due: ${formatDisplayDate(e.dueDate)}. Please pay at earliest — ${biz}.`;
      let mobile = cleanMobile(e.mobile);
      const url = mobile ? `https://wa.me/${mobile}?text=${encodeURIComponent(msg)}` : `https://wa.me/?text=${encodeURIComponent(msg)}`;
      window.open(url, '_blank');
    }, i * 1200);
  });
  showToast(`Opening WhatsApp for ${sel.length} parties…`);
}

function bulkExportCSV() { exportCSV(getSelectedEntries()); }
function bulkPrint()     { buildPrintArea(getSelectedEntries()); window.print(); }

function bulkMarkPaid() {
  if (!confirm(`Mark ${selectedIds.size} entries as paid?`)) return;
  getSelectedEntries().forEach(e => markPaid(e.id));
  clearSelection();
}

function bulkDelete() {
  if (!confirm(`Delete ${selectedIds.size} entries? This cannot be undone.`)) return;
  entries = entries.filter(e => !selectedIds.has(e.id));
  selectedIds.clear();
  saveEntries();
  renderDashboard();
  renderTable();
  updateFilterDropdowns();
  updateBulkBar();
  showToast('Entries deleted');
}

/* ─────────────────────────────────────────────
   ACTION TRIGGER (lead gate)
───────────────────────────────────────────── */
function triggerAction(action, entryId) {  executeAction(action, entryId); }

function executeAction(action, entryId) {
  if (action === 'csv')     exportCSV(entries);
  if (action === 'print')   { buildPrintArea(entries); window.print(); }
  if (action === 'save')    saveTrackerToStorage();
  if (action === 'wa')      openWaReminder(entryId);
  if (action === 'receipt') createReceipt(entryId);
}

/* ─────────────────────────────────────────────
   EXPORT CSV
───────────────────────────────────────────── */
function exportCSV(rows) {
  const headers = ['Party Name','Mobile','Invoice Number','Invoice Date','Due Date','Invoice Amount','Paid Amount','Adjustment','Balance Amount','Days Overdue','Ageing Bucket','Salesperson','Beat/Route','Next Follow-up','Status','Notes'];
  const csv = [headers.join(','), ...rows.map(e => [
    `"${e.party}"`, `"${e.mobile}"`, `"${e.invNum}"`,
    formatDisplayDate(e.invDate), formatDisplayDate(e.dueDate),
    e.invAmount, e.paidAmount, e.adjustment, e.balance,
    e.daysOverdue, `"${e.ageing}"`, `"${e.salesperson}"`, `"${e.beat}"`,
    formatDisplayDate(e.nextFollowup), e.status, `"${e.notes}"`
  ].join(','))].join('\n');

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url; a.download = `Outstanding_${SalesOnDates.today()}.csv`;
  document.body.appendChild(a); if (window.SalesOnTracking) window.SalesOnTracking.emit('tool_download', {file_type:'csv'}); a.click(); document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast('CSV exported ✓');
}

function downloadSampleCSV() {
  const sample = `Party Name,Mobile,Invoice Number,Invoice Date,Due Date,Invoice Amount,Paid Amount,Adjustment,Salesperson,Beat,Notes
Mohan Retail Store,9876543210,INV-2026-001,01/01/2026,15/01/2026,25000,12500,0,Ramesh,Boring Road,First reminder sent
Kumar General Store,9876543211,INV-2026-002,05/01/2026,20/01/2026,18000,0,0,Suresh,Kankarbagh,`;
  const blob = new Blob([sample], {type:'text/csv;charset=utf-8;'});
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href=url; a.download='SalesOn_Outstanding_Sample.csv';
  document.body.appendChild(a); if (window.SalesOnTracking) window.SalesOnTracking.emit('tool_download', {file_type:'csv'}); a.click(); document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function openImport() { document.getElementById('importModal').classList.add('open'); }

function processImport() {
  const raw = document.getElementById('importTextarea').value.trim();
  if (!raw) { showToast('Paste CSV rows first'); return; }
  const lines = raw.split('\n').filter(l=>l.trim());
  let added = 0;
  lines.forEach(line => {
    // skip header row
    if (line.toLowerCase().startsWith('party name')) return;
    const cols = line.split(',').map(c => c.replace(/^"|"$/g,'').trim());
    const [party, mobile, invNum, invDateRaw, dueDateRaw, invAmt, paidAmt, adj, salesperson, beat, notes] = cols;
    if (!party || !invNum) return;

    // Convert DD/MM/YYYY to YYYY-MM-DD
    const toISO = (s) => {
      if (!s) return '';
      const parts = s.split('/');
      if (parts.length===3) return `${parts[2]}-${parts[1].padStart(2,'0')}-${parts[0].padStart(2,'0')}`;
      return s;
    };
    const invDate = toISO(invDateRaw);
    const dueDate = toISO(dueDateRaw);
    const inv  = parseFloat(invAmt)  || 0;
    const paid = parseFloat(paidAmt) || 0;
    const adjN = parseFloat(adj)     || 0;
    const bal  = Math.max(0, inv - paid - adjN);

    entries.unshift({
      id: uid(), party, company:'', mobile, city:'', salesperson: salesperson||'', beat: beat||'',
      invNum, invDate, dueDate, invAmount: inv, paidAmount: paid, adjustment: adjN, balance: bal,
      status: computeStatus(bal, paid, dueDate), daysOverdue: computeDaysOverdue(bal, dueDate),
      ageing: computeAgeing(bal, dueDate), promise:'', lastFollowup:'', nextFollowup:'',
      notes: notes||'', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
    });
    added++;
  });

  if (added) {
    saveEntries();
    renderDashboard();
    renderTable();
    updateFilterDropdowns();
    document.getElementById('importTextarea').value = '';
    document.getElementById('importModal').classList.remove('open');
    showToast(`${added} entries imported ✓`);
  } else {
    showToast('No valid rows found — check format');
  }
}

/* ─────────────────────────────────────────────
   PRINT REPORT
───────────────────────────────────────────── */
function buildPrintArea(rows) {
  const biz    = document.getElementById('bizName').value    || 'Business Name';
  const phone  = document.getElementById('bizPhone').value   || '';
  const gstin  = document.getElementById('bizGSTIN').value   || '';
  const addr   = document.getElementById('bizAddress').value || '';
  const from   = formatDisplayDate(document.getElementById('reportFrom').value);
  const to     = formatDisplayDate(document.getElementById('reportTo').value);

  const totalInv  = rows.reduce((s,e)=>s+e.invAmount,0);
  const totalPaid = rows.reduce((s,e)=>s+e.paidAmount+e.adjustment,0);
  const totalOut  = rows.reduce((s,e)=>s+e.balance,0);
  const overdueAmt= rows.filter(e=>e.status==='Overdue').reduce((s,e)=>s+e.balance,0);

  const tableRows = rows.map((e,i)=>`
    <tr>
      <td>${i+1}</td>
      <td>${e.party}</td>
      <td>${e.mobile}</td>
      <td>${e.invNum}</td>
      <td>${formatDisplayDate(e.invDate)}</td>
      <td>${formatDisplayDate(e.dueDate)}</td>
      <td style="text-align:right;">${fmtINR(e.invAmount)}</td>
      <td style="text-align:right;">${fmtINR(e.paidAmount)}</td>
      <td style="text-align:right;font-weight:700;">${fmtINR(e.balance)}</td>
      <td style="text-align:center;">${e.daysOverdue||'—'}</td>
      <td>${e.ageing}</td>
      <td>${e.salesperson||'—'}</td>
      <td>${e.status}</td>
    </tr>`).join('');

  document.getElementById('printArea').innerHTML = `
    <div class="print-header">
      <div>
        ${logoDataURL?`<img src="${logoDataURL}" alt="Business logo" style="max-height:48px;max-width:120px;object-fit:contain;margin-bottom:6px;display:block;">`:``}
        <div class="print-biz-name">${biz}</div>
        <div class="print-biz-detail">${addr?addr+'&nbsp;|&nbsp;':''} ${gstin?'GSTIN: '+gstin+'&nbsp;|&nbsp;':''} ${phone}</div>
      </div>
      <div style="text-align:right;">
        <div class="print-report-title">OUTSTANDING PAYMENT REPORT</div>
        <div style="font-size:11px;color:#7a8898;margin-top:4px;">${from&&to?`Period: ${from} to ${to}`:''}</div>
        <div style="font-size:11px;color:#7a8898;">Printed: ${formatDisplayDate(today())}</div>
      </div>
    </div>
    <div class="print-kpi-row">
      <div class="print-kpi"><div class="print-kpi-label">Total Invoice</div><div class="print-kpi-val">${fmtINR(totalInv)}</div></div>
      <div class="print-kpi"><div class="print-kpi-label">Total Received</div><div class="print-kpi-val">${fmtINR(totalPaid)}</div></div>
      <div class="print-kpi"><div class="print-kpi-label">Total Outstanding</div><div class="print-kpi-val">${fmtINR(totalOut)}</div></div>
      <div class="print-kpi"><div class="print-kpi-label">Overdue Amount</div><div class="print-kpi-val">${fmtINR(overdueAmt)}</div></div>
    </div>
    <table class="print-table">
      <thead><tr>
        <th>#</th><th>Party</th><th>Mobile</th><th>Invoice</th><th>Inv Date</th><th>Due Date</th>
        <th>Inv Amt</th><th>Paid</th><th>Balance</th><th>Days</th><th>Ageing</th><th>Salesperson</th><th>Status</th>
      </tr></thead>
      <tbody>${tableRows}</tbody>
    </table>
    <div class="print-footer">
      <strong>Total: ${rows.length} entries &nbsp;|&nbsp; Outstanding: ${fmtINR(totalOut)} &nbsp;|&nbsp; Overdue: ${fmtINR(overdueAmt)}</strong><br>
      Created using SalesOn Free Business Tools — saleson.co.in/tools
    </div>`;
}

/* ─────────────────────────────────────────────
   SAVE / LOAD TRACKER
───────────────────────────────────────────── */
function saveEntries() {
  SalesOnStorage.setItem(STORAGE_KEY, JSON.stringify({ entries, bizName: document.getElementById('bizName').value, updatedAt: new Date().toISOString() }));
}

function saveTrackerToStorage() {
  saveEntries();
  showToast('Tracker saved ✓');
}

function loadTracker() {
  const raw = SalesOnStorage.getItem(STORAGE_KEY);
  if (!raw) { showToast('No saved tracker found'); return; }
  const data = JSON.parse(raw);
  entries = (data.entries || []).map(e => ({
    ...e,
    status:      computeStatus(e.balance, e.paidAmount, e.dueDate),
    daysOverdue: computeDaysOverdue(e.balance, e.dueDate),
    ageing:      computeAgeing(e.balance, e.dueDate)
  }));
  if (data.bizName) document.getElementById('bizName').value = data.bizName;
  renderDashboard();
  renderTable();
  updateFilterDropdowns();
  showToast('Tracker loaded ✓');
}

function resetTracker() {
  if (!confirm('Reset all entries? This clears all data.')) return;
  entries = []; selectedIds.clear(); entryCount = 0;
  clearForm();
  renderDashboard();
  renderTable();
  updateFilterDropdowns();
  updateBulkBar();
  showToast('Tracker reset ✓');
}

/* ─────────────────────────────────────────────
   LEAD MODAL
───────────────────────────────────────────── */


function skipLead() {}

/* ─────────────────────────────────────────────
   LOGO UPLOAD
───────────────────────────────────────────── */
function handleLogoUpload(input) {
  const file = input.files[0]; if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    logoDataURL = e.target.result;
    const t = document.getElementById('logoThumb'); t.src=logoDataURL; t.style.display='block';
  };
  reader.readAsDataURL(file);
}

/* ─────────────────────────────────────────────
   FAQ / SECTION TOGGLES
───────────────────────────────────────────── */
function toggleSection(btn) {
  const body = btn.nextElementSibling;
  const open = btn.classList.toggle('open');
  body.classList.toggle('open', open);
}

function toggleFaq(btn) {
  const a = btn.nextElementSibling;
  const isOpen = btn.classList.contains('open');
  document.querySelectorAll('.faq-q').forEach(b=>{b.classList.remove('open');b.nextElementSibling.classList.remove('open');});
  if (!isOpen) { btn.classList.add('open'); a.classList.add('open'); }
}

/* ─────────────────────────────────────────────
   TOAST
───────────────────────────────────────────── */
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg; t.classList.add('show');
  setTimeout(()=>t.classList.remove('show'), 2600);
}

/* ─────────────────────────────────────────────
   INIT — sample data
───────────────────────────────────────────── */
function initSampleData() {
  const t   = today();
  const ago = n => { const d=new Date(); d.setDate(d.getDate()-n); return SalesOnDates.localDate(d); };
  const fwd = n => { const d=new Date(); d.setDate(d.getDate()+n); return SalesOnDates.localDate(d); };

  document.getElementById('bizName').value    = 'Shree Balaji Distributors';
  document.getElementById('bizPhone').value   = '+91-9876543210';
  document.getElementById('bizAddress').value = 'Patna, Bihar';
  document.getElementById('bizEmail').value   = 'accounts@example.com';
  document.getElementById('reportFrom').value = ago(30);
  document.getElementById('reportTo').value   = t;

  const samples = [
    { party:'Mohan Retail Store',    mobile:'9876543210', invNum:'INV-2026-001', invDate:ago(20), dueDate:ago(7),  invAmount:25000, paidAmount:12500, adj:0, salesperson:'Ramesh', beat:'Boring Road',  notes:'Promised payment this week' },
    { party:'Kumar General Store',   mobile:'9876543211', invNum:'INV-2026-002', invDate:ago(30), dueDate:ago(20), invAmount:18000, paidAmount:0,     adj:0, salesperson:'Suresh', beat:'Kankarbagh',   notes:'Not responding to calls' },
    { party:'Raj Pharma',            mobile:'9876543212', invNum:'INV-2026-003', invDate:ago(15), dueDate:ago(5),  invAmount:40000, paidAmount:40000, adj:0, salesperson:'Amit',   beat:'Bailey Road',  notes:'Paid in full' },
    { party:'Suresh Electronics',    mobile:'9800000013', invNum:'INV-2026-004', invDate:ago(40), dueDate:ago(35), invAmount:32000, paidAmount:10000, adj:0, salesperson:'Ramesh', beat:'Boring Road',  notes:'Partial payment received' },
    { party:'Gupta Trading Co.',     mobile:'9800000014', invNum:'INV-2026-005', invDate:ago(5),  dueDate:fwd(10), invAmount:15500, paidAmount:0,     adj:0, salesperson:'Suresh', beat:'Rajendra Nagar', notes:'' },
  ];

  entries = samples.map(s => {
    const bal = Math.max(0, s.invAmount - s.paidAmount - s.adj);
    return {
      id: uid(), ...s, company:'', city:'Patna', adjustment: s.adj, balance: bal,
      status: computeStatus(bal, s.paidAmount, s.dueDate),
      daysOverdue: computeDaysOverdue(bal, s.dueDate),
      ageing: computeAgeing(bal, s.dueDate),
      promise:'', lastFollowup:'', nextFollowup: fwd(3), notes: s.notes,
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
    };
  });
}

function applyVanOutstandingHandoff(hadSavedTracker) {
  const data = SalesOnHandoff.take(
    "saleson_van_loading_to_outstanding_tracker"
  );

  if (!data) return;

  const outlets = Array.isArray(data.outlets)
    ? data.outlets
    : [];

  if (!outlets.length) {
    showToast("No outlet-level credit entries were found.");
    return;
  }

  // Remove demo rows, but preserve genuine saved tracker data.
  if (!hadSavedTracker) entries = [];

  SalesOnHandoff.set("bizName", data.businessName);

  const invoiceDate = data.date || today();

  outlets.forEach((outlet, index) => {
    const credit = Number(outlet.credit) || 0;
    const invoiceAmount = Math.max(
      credit,
      Number(outlet.sales) || 0
    );

    const paidAmount = Math.max(
      0,
      invoiceAmount - credit
    );

    entries.unshift({
      id: uid(),
      party: outlet.name,
      company: "",
      mobile: "",
      city: outlet.area || "",
      salesperson: data.salesmanName || "",
      beat: data.routeName || "",
      invNum:
        outlet.invoice ||
        VAN-`${invoiceDate.replaceAll("-", "")}-${index + 1}`,
      invDate: invoiceDate,
      dueDate: "",
      invAmount: invoiceAmount,
      paidAmount,
      adjustment: 0,
      balance: credit,
      status: computeStatus(credit, paidAmount, ""),
      daysOverdue: 0,
      ageing: computeAgeing(credit, ""),
      promise: "",
      lastFollowup: "",
      nextFollowup: "",
      notes: [
        data.vanNumber && `Van: ${data.vanNumber}`,
        outlet.remarks
      ].filter(Boolean).join(" | "),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  });

  entryCount += outlets.length;
  saveEntries();
}

/* ─────────────────────────────────────────────
   BOOT
───────────────────────────────────────────── */
// Try loading saved data, fall back to sample
const _saved = SalesOnStorage.getItem(STORAGE_KEY);
if (_saved) {
  try {
    const d = JSON.parse(_saved);
    entries = (d.entries||[]).map(e=>({...e, status:computeStatus(e.balance,e.paidAmount,e.dueDate), daysOverdue:computeDaysOverdue(e.balance,e.dueDate), ageing:computeAgeing(e.balance,e.dueDate)}));
    if (d.bizName) document.getElementById('bizName').value = d.bizName;
  } catch(ex) { initSampleData(); }
} else {
  initSampleData();
}
applyVanOutstandingHandoff(Boolean(_saved));
renderDashboard();
renderTable();
updateFilterDropdowns();

