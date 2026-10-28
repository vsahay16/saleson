
/* ================================================================
   SalesOn HSN/SAC GST Rate Finder – Complete JavaScript
   Disclaimer: All codes and rates are common starter references
   for everyday business use. Verify with the official GST portal,
   CBIC notifications, or your accountant before issuing invoices.
   SalesOn does not provide tax or legal advice.
================================================================ */

// ───────────────────────────────────────────────────────────────
// 1. CURATED HSN HEADING CANDIDATES — NO AUTOMATIC TAX RATES
// ───────────────────────────────────────────────────────────────
const DB = [
  {
    "code": "3401",
    "type": "HSN",
    "desc": "Soap and skin-washing preparations",
    "category": "FMCG",
    "rate": null,
    "useCase": "Soap and skin-washing preparations",
    "notes": "Heading-level search candidate only. Confirm the exact subheading, product description, applicable conditions and current rate with the official GST source before billing."
  },
  {
    "code": "3402",
    "type": "HSN",
    "desc": "Washing and cleaning preparations",
    "category": "FMCG",
    "rate": null,
    "useCase": "Washing and cleaning preparations",
    "notes": "Heading-level search candidate only. Confirm the exact subheading, product description, applicable conditions and current rate with the official GST source before billing."
  },
  {
    "code": "3303",
    "type": "HSN",
    "desc": "Perfumes and toilet waters",
    "category": "FMCG",
    "rate": null,
    "useCase": "Perfumes and toilet waters",
    "notes": "Heading-level search candidate only. Confirm the exact subheading, product description, applicable conditions and current rate with the official GST source before billing."
  },
  {
    "code": "3304",
    "type": "HSN",
    "desc": "Beauty, make-up and skin-care preparations",
    "category": "FMCG",
    "rate": null,
    "useCase": "Beauty, make-up and skin-care preparations",
    "notes": "Heading-level search candidate only. Confirm the exact subheading, product description, applicable conditions and current rate with the official GST source before billing."
  },
  {
    "code": "3305",
    "type": "HSN",
    "desc": "Preparations for use on the hair",
    "category": "FMCG",
    "rate": null,
    "useCase": "Preparations for use on the hair",
    "notes": "Heading-level search candidate only. Confirm the exact subheading, product description, applicable conditions and current rate with the official GST source before billing."
  },
  {
    "code": "1905",
    "type": "HSN",
    "desc": "Bread, pastry, cakes and biscuits",
    "category": "Food Products",
    "rate": null,
    "useCase": "Bread, pastry, cakes and biscuits",
    "notes": "Heading-level search candidate only. Confirm the exact subheading, product description, applicable conditions and current rate with the official GST source before billing."
  },
  {
    "code": "2009",
    "type": "HSN",
    "desc": "Fruit and vegetable juices",
    "category": "Food Products",
    "rate": null,
    "useCase": "Fruit and vegetable juices",
    "notes": "Heading-level search candidate only. Confirm the exact subheading, product description, applicable conditions and current rate with the official GST source before billing."
  },
  {
    "code": "0901",
    "type": "HSN",
    "desc": "Coffee and coffee husks",
    "category": "Food Products",
    "rate": null,
    "useCase": "Coffee and coffee husks",
    "notes": "Heading-level search candidate only. Confirm the exact subheading, product description, applicable conditions and current rate with the official GST source before billing."
  },
  {
    "code": "0902",
    "type": "HSN",
    "desc": "Tea",
    "category": "Food Products",
    "rate": null,
    "useCase": "Tea",
    "notes": "Heading-level search candidate only. Confirm the exact subheading, product description, applicable conditions and current rate with the official GST source before billing."
  },
  {
    "code": "1701",
    "type": "HSN",
    "desc": "Cane or beet sugar",
    "category": "Food Products",
    "rate": null,
    "useCase": "Cane or beet sugar",
    "notes": "Heading-level search candidate only. Confirm the exact subheading, product description, applicable conditions and current rate with the official GST source before billing."
  },
  {
    "code": "3004",
    "type": "HSN",
    "desc": "Medicaments in measured doses or retail packs",
    "category": "Pharma",
    "rate": null,
    "useCase": "Medicaments in measured doses or retail packs",
    "notes": "Heading-level search candidate only. Confirm the exact subheading, product description, applicable conditions and current rate with the official GST source before billing."
  },
  {
    "code": "3002",
    "type": "HSN",
    "desc": "Blood products, vaccines and immunological products",
    "category": "Pharma",
    "rate": null,
    "useCase": "Blood products, vaccines and immunological products",
    "notes": "Heading-level search candidate only. Confirm the exact subheading, product description, applicable conditions and current rate with the official GST source before billing."
  },
  {
    "code": "8517",
    "type": "HSN",
    "desc": "Telephone sets and communication apparatus",
    "category": "Electronics",
    "rate": null,
    "useCase": "Telephone sets and communication apparatus",
    "notes": "Heading-level search candidate only. Confirm the exact subheading, product description, applicable conditions and current rate with the official GST source before billing."
  },
  {
    "code": "8471",
    "type": "HSN",
    "desc": "Automatic data processing machines and units",
    "category": "Electronics",
    "rate": null,
    "useCase": "Automatic data processing machines and units",
    "notes": "Heading-level search candidate only. Confirm the exact subheading, product description, applicable conditions and current rate with the official GST source before billing."
  },
  {
    "code": "8443",
    "type": "HSN",
    "desc": "Printing machinery and printers",
    "category": "Electronics",
    "rate": null,
    "useCase": "Printing machinery and printers",
    "notes": "Heading-level search candidate only. Confirm the exact subheading, product description, applicable conditions and current rate with the official GST source before billing."
  },
  {
    "code": "8415",
    "type": "HSN",
    "desc": "Air-conditioning machines",
    "category": "Electricals",
    "rate": null,
    "useCase": "Air-conditioning machines",
    "notes": "Heading-level search candidate only. Confirm the exact subheading, product description, applicable conditions and current rate with the official GST source before billing."
  },
  {
    "code": "8418",
    "type": "HSN",
    "desc": "Refrigerators and freezers",
    "category": "Electricals",
    "rate": null,
    "useCase": "Refrigerators and freezers",
    "notes": "Heading-level search candidate only. Confirm the exact subheading, product description, applicable conditions and current rate with the official GST source before billing."
  },
  {
    "code": "8544",
    "type": "HSN",
    "desc": "Insulated wire and cable",
    "category": "Electricals",
    "rate": null,
    "useCase": "Insulated wire and cable",
    "notes": "Heading-level search candidate only. Confirm the exact subheading, product description, applicable conditions and current rate with the official GST source before billing."
  },
  {
    "code": "4819",
    "type": "HSN",
    "desc": "Paper and paperboard packing containers",
    "category": "Packaging",
    "rate": null,
    "useCase": "Paper and paperboard packing containers",
    "notes": "Heading-level search candidate only. Confirm the exact subheading, product description, applicable conditions and current rate with the official GST source before billing."
  },
  {
    "code": "3923",
    "type": "HSN",
    "desc": "Plastic packing containers",
    "category": "Packaging",
    "rate": null,
    "useCase": "Plastic packing containers",
    "notes": "Heading-level search candidate only. Confirm the exact subheading, product description, applicable conditions and current rate with the official GST source before billing."
  },
  {
    "code": "7318",
    "type": "HSN",
    "desc": "Iron or steel screws, bolts, nuts and washers",
    "category": "Hardware",
    "rate": null,
    "useCase": "Iron or steel screws, bolts, nuts and washers",
    "notes": "Heading-level search candidate only. Confirm the exact subheading, product description, applicable conditions and current rate with the official GST source before billing."
  },
  {
    "code": "8301",
    "type": "HSN",
    "desc": "Base-metal padlocks and locks",
    "category": "Hardware",
    "rate": null,
    "useCase": "Base-metal padlocks and locks",
    "notes": "Heading-level search candidate only. Confirm the exact subheading, product description, applicable conditions and current rate with the official GST source before billing."
  },
  {
    "code": "3208",
    "type": "HSN",
    "desc": "Paints and varnishes in a non-aqueous medium",
    "category": "Hardware",
    "rate": null,
    "useCase": "Paints and varnishes in a non-aqueous medium",
    "notes": "Heading-level search candidate only. Confirm the exact subheading, product description, applicable conditions and current rate with the official GST source before billing."
  },
  {
    "code": "6203",
    "type": "HSN",
    "desc": "Men’s or boys’ woven suits, jackets and trousers",
    "category": "Textile",
    "rate": null,
    "useCase": "Men’s or boys’ woven suits, jackets and trousers",
    "notes": "Heading-level search candidate only. Confirm the exact subheading, product description, applicable conditions and current rate with the official GST source before billing."
  },
  {
    "code": "6204",
    "type": "HSN",
    "desc": "Women’s or girls’ woven suits, dresses and skirts",
    "category": "Textile",
    "rate": null,
    "useCase": "Women’s or girls’ woven suits, dresses and skirts",
    "notes": "Heading-level search candidate only. Confirm the exact subheading, product description, applicable conditions and current rate with the official GST source before billing."
  },
  {
    "code": "7113",
    "type": "HSN",
    "desc": "Jewellery of precious metal",
    "category": "Other",
    "rate": null,
    "useCase": "Jewellery of precious metal",
    "notes": "Heading-level search candidate only. Confirm the exact subheading, product description, applicable conditions and current rate with the official GST source before billing."
  },
  {
    "code": "7108",
    "type": "HSN",
    "desc": "Gold in unwrought or semi-manufactured forms",
    "category": "Other",
    "rate": null,
    "useCase": "Gold in unwrought or semi-manufactured forms",
    "notes": "Heading-level search candidate only. Confirm the exact subheading, product description, applicable conditions and current rate with the official GST source before billing."
  },
  {
    "code": "4901",
    "type": "HSN",
    "desc": "Printed books, brochures and similar printed matter",
    "category": "Other",
    "rate": null,
    "useCase": "Printed books, brochures and similar printed matter",
    "notes": "Heading-level search candidate only. Confirm the exact subheading, product description, applicable conditions and current rate with the official GST source before billing."
  }
];
DB.forEach(r => { r.keywords = [r.code, r.desc, r.category].join(" ").toLowerCase(); });

const LS_RECENT    = 'saleson_hsn_recent_searches';      // recent search terms (standard key)
const LS_RECENT_OLD = 'saleson_hsn_recent';               // legacy key fallback
const LS_SELECTED  = 'saleson_hsn_selected';              // last selected record code
const LS_INVOICE   = 'saleson_selected_hsn_for_invoice';  // standard GST Invoice handoff key
const LS_QUOTATION = 'saleson_selected_hsn_for_quotation';// standard Quotation handoff key
const MAX_RECENT   = 6;

const INVOICE_URL    = '/tools/gst-invoice-generator';
const QUOTATION_URL  = '/tools/quotation-generator';




// ───────────────────────────────────────────────────────────────
// 3. ELEMENT REFERENCES
// ───────────────────────────────────────────────────────────────
const $  = id => document.getElementById(id);
const $$ = sel => document.querySelectorAll(sel);

const searchName   = $('searchName');
const searchCode   = $('searchCode');
const filterCat    = $('filterCategory');
const filterType   = $('filterType');
const filterRate   = $('filterRate');
const btnSearch    = $('btnSearch');
const btnReset     = $('btnReset');
const btnCommon    = $('btnCommon');
const resultsGrid  = $('resultsGrid');
const noResults    = $('noResults');
const resultsHead  = $('resultsHeading');
const resultsCount = $('resultsCount');
const recentChips  = $('recentChips');
const detailPanel  = $('detailPanel');
const toast        = $('toast');
const mobileBar    = $('mobileBar');

// Detail panel elements
const dpDescription = $('dpDescription');
const dpTypePill    = $('dpTypePill');
const dpCode        = $('dpCode');
const dpUseCase     = $('dpUseCase');
const dpNotes       = $('dpNotes');
const dpCategory    = $('dpCategory');
const dpCgst        = $('dpCgst');
const dpSgst        = $('dpSgst');
const dpIgst        = $('dpIgst');
const dpInvoiceLine = $('dpInvoiceLine');
const dpClose       = $('dpClose');
const dpCopyCode    = $('dpCopyCode');
const dpCopyRate    = $('dpCopyRate');
const dpCopyLine    = $('dpCopyLine');
const dpUseInvoice  = $('dpUseInvoice');
const dpUseQuote    = $('dpUseQuote');

// Mobile bar buttons
const mbSearch  = $('mbSearch');
const mbCopy    = $('mbCopy');
const mbInvoice = $('mbInvoice');

// Lead modal

// Footer year
const footerYear = $('footerYear');

// ───────────────────────────────────────────────────────────────
// 4. STATE
// ───────────────────────────────────────────────────────────────
let currentResults = [];
let selectedRecord = null;
let toastTimer     = null;

// ───────────────────────────────────────────────────────────────
// 5. INIT
// ───────────────────────────────────────────────────────────────
function init() {
  if (footerYear) footerYear.textContent = new Date().getFullYear();
  renderRecentChips();
  showCommonCodes();
  bindEvents();
}

// ───────────────────────────────────────────────────────────────
// 6. SEARCH & FILTER
// ───────────────────────────────────────────────────────────────
function runSearch() {
  const nameTerm = searchName.value.trim().toLowerCase();
  const codeTerm = searchCode.value.trim().toLowerCase();
  const cat      = filterCat.value;
  const type     = filterType.value;
  const rate     = filterRate.value;

  let results = DB.filter(r => {
    const searchable = (r.keywords || `${r.code} ${r.type} ${r.desc} ${r.category} ${r.useCase} ${r.notes}`).toLowerCase();
    if (nameTerm && !searchable.includes(nameTerm)) return false;
    if (codeTerm && !r.code.toLowerCase().startsWith(codeTerm)) return false;
    if (cat !== 'All'  && r.category !== cat)    return false;
    if (type !== 'Both' && r.type !== type)       return false;

    return true;
  });

  currentResults = results;

  // Save to recent searches
  if (nameTerm) saveRecent(nameTerm);
  else if (codeTerm) saveRecent(codeTerm);

  renderResults(results);

  // Fire lead modal every 3rd search after 1st action


}

function showCommonCodes() {
  currentResults = DB;
  resultsHead.textContent = 'Common Codes';
  renderResults(DB, false);
}

function resetAll() {
  searchName.value = '';
  searchCode.value = '';
  filterCat.value  = 'All';
  filterType.value = 'Both';
  filterRate.value = 'Any';
  closeDetailPanel();
  showCommonCodes();
}

// ───────────────────────────────────────────────────────────────
// 7. RENDER RESULT CARDS
// ───────────────────────────────────────────────────────────────
function renderResults(results, isSearch = true) {
  resultsGrid.innerHTML = '';

  if (isSearch) {
    resultsHead.textContent = 'Search Results';
    resultsCount.textContent = results.length
      ? `${results.length} result${results.length !== 1 ? 's' : ''} found`
      : '';
  } else {
    resultsCount.textContent = `${results.length} codes`;
  }

  if (!results.length) {
    noResults.style.display = 'block';
    return;
  }

  noResults.style.display = 'none';
  const frag = document.createDocumentFragment();

  results.forEach(r => {
    const card = document.createElement('div');
    card.className = 'result-card';
    if (selectedRecord && selectedRecord.code === r.code && selectedRecord.type === r.type) {
      card.classList.add('selected');
    }
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');
    card.setAttribute('aria-label', `${r.desc} – ${r.type} ${r.code} – Rate requires confirmation`);

    card.innerHTML = `
      <div class="rc-top">
        <span class="rc-code">${r.code}</span>
        <span class="type-pill ${r.type.toLowerCase()}">${r.type}</span>
      </div>
      <div class="rc-desc">${r.desc}</div>
      <div class="rc-meta">
        <span class="rate-pill">Rate requires confirmation</span>
        <span class="cat-pill">${r.category}</span>
        <span class="verify-badge">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
          Verify
        </span>
      </div>
      <div class="rc-notes">${r.notes}</div>
      <div class="rc-actions">
        <button type="button" data-action="copy-code" aria-label="Copy code ${r.code}">Copy Code</button>
        <button type="button" data-action="use-invoice" class="primary-action">Use in Invoice</button>
        <button type="button" data-action="details">View Details</button>
      </div>`;

    // Card click → open detail
    card.addEventListener('click', e => {
      if (e.target.closest('[data-action]')) return;
      selectRecord(r);
    });
    card.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); selectRecord(r); }
    });

    // Action buttons inside card
    card.querySelector('[data-action="copy-code"]').addEventListener('click', e => {
      e.stopPropagation();
      copyText(r.code, 'Code copied: ' + r.code);
    });
    card.querySelector('[data-action="use-invoice"]').addEventListener('click', e => {
      e.stopPropagation();
      handoffTo('invoice', r);
    });
    card.querySelector('[data-action="details"]').addEventListener('click', e => {
      e.stopPropagation();
      selectRecord(r);
    });

    frag.appendChild(card);
  });

  resultsGrid.appendChild(frag);
}

// ───────────────────────────────────────────────────────────────
// 8. DETAIL / SELECTED PANEL
// ───────────────────────────────────────────────────────────────
function selectRecord(r) {
  selectedRecord = r;
  try {
    SalesOnStorage.setItem(LS_SELECTED, JSON.stringify({
      code: r.code,
      type: r.type,
      description: r.desc,
      gstRate: confirmedRate(),
      category: r.category,
      selectedAt: new Date().toISOString()
    }));
  } catch {}

  const selectedRate = confirmedRate();
  const half = selectedRate === null ? null : selectedRate / 2;
  const halfStr = half === null ? 'Confirm rate' : (Number.isInteger(half) ? half + '%' : half.toFixed(3).replace(/0+$/, '') + '%');

  dpDescription.textContent = r.desc;
  dpTypePill.textContent = r.type;
  dpTypePill.className = `type-pill ${r.type.toLowerCase()}`;
  dpCode.textContent = r.code;
  dpUseCase.textContent = r.useCase;
  dpNotes.textContent = r.notes;
  dpCategory.textContent = r.category;
  dpCgst.textContent = halfStr;
  dpSgst.textContent = halfStr;
  dpIgst.textContent = selectedRate === null ? 'Confirm rate' : selectedRate + '%';
  dpInvoiceLine.textContent = buildInvoiceLine(r);

  detailPanel.classList.add('visible');
  detailPanel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

  // Highlight selected card
  $$('.result-card').forEach(c => c.classList.remove('selected'));
  const allCards = resultsGrid.querySelectorAll('.result-card');
  allCards.forEach((c, i) => {
    if (currentResults[i] && currentResults[i].code === r.code && currentResults[i].type === r.type) {
      c.classList.add('selected');
    }
  });

  // Mobile bar – activate copy
  if (mbCopy) mbCopy.classList.add('active-action');
}

function closeDetailPanel() {
  detailPanel.classList.remove('visible');
  selectedRecord = null;
  $$('.result-card').forEach(c => c.classList.remove('selected'));
  if (mbCopy) mbCopy.classList.remove('active-action');
}

function buildInvoiceLine(r) { const rate = confirmedRate(); return `${r.type} ${r.code} | ${r.desc} | ${rate === null ? 'GST rate not confirmed' : 'GST ' + rate + '%'}`; }

// ───────────────────────────────────────────────────────────────
// 9. COPY HELPERS
// ───────────────────────────────────────────────────────────────
function copyText(text, message) {
  if (!text) { showToast('⚠ No item selected. Please select a code first.'); return; }
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(() => showToast('✓ ' + (message || 'Copied!')));
  } else {
    // Fallback for older browsers
    const el = document.createElement('textarea');
    el.value = text;
    el.style.cssText = 'position:fixed;top:-999px;left:-999px;opacity:0;';
    document.body.appendChild(el);
    el.select();
    try { document.execCommand('copy'); showToast('✓ ' + (message || 'Copied!')); }
    catch { showToast('⚠ Could not copy. Please copy manually.'); }
    document.body.removeChild(el);
  }
}

// ───────────────────────────────────────────────────────────────
// 10. HANDOFF TO INVOICE / QUOTATION
// ───────────────────────────────────────────────────────────────
function confirmedRate() { const value = filterRate.value; const allowed = [0, .1, .25, 1.5, 3, 5, 6, 7.5, 12, 18, 28, 40]; return value !== "" && value !== "Any" && allowed.includes(Number(value)) ? Number(value) : null; }

function buildHandoffPayload(r) {
  return {
    code: r.code,
    type: r.type,
    description: r.desc,
    itemDescription: r.desc,
    gstRate: confirmedRate(),
    category: r.category,
    notes: r.notes,
    sourceTool: 'HSN/SAC GST Rate Finder',
    selectedAt: new Date().toISOString()
  };
}

function saveHandoffData(target, r) {
  const payload = buildHandoffPayload(r);
  const key = target === 'invoice' ? LS_INVOICE : LS_QUOTATION;
  try {
    SalesOnStorage.setItem(key, JSON.stringify(payload));
    SalesOnStorage.setItem(LS_SELECTED, JSON.stringify(payload));
  } catch {}
  return payload;
}

function handoffTo(target, record) {
  const r = record || selectedRecord;
  if (!r) { showToast('⚠ Select a code first.'); return; }

  // Check if lead is captured; if not, show modal then handoff


  if (confirmedRate() === null) { showToast('Select a GST rate verified for this product before transfer.'); filterRate.focus(); return; }
  saveHandoffData(target, r);

  // Keep query params too, so tools can read either localStorage or URL fallback.
  const params = new URLSearchParams({
    hsn_code  : r.code,
    hsn_type  : r.type,
    item_desc : r.desc,
    gst_rate  : confirmedRate()
  });
  const url = (target === 'invoice' ? INVOICE_URL : QUOTATION_URL) + '?' + params.toString();
  showToast(`✓ Saved to ${target === 'invoice' ? 'GST Invoice' : 'Quotation'} Generator. Opening…`);
  setTimeout(() => { window.location.href = url; }, 900);
}

// ───────────────────────────────────────────────────────────────
// 11. RECENT SEARCHES (localStorage)
// ───────────────────────────────────────────────────────────────
function getRecent() {
  try {
    const current = JSON.parse(SalesOnStorage.getItem(LS_RECENT) || '[]');
    if (Array.isArray(current) && current.length) return current;
    const legacy = JSON.parse(SalesOnStorage.getItem(LS_RECENT_OLD) || '[]');
    if (Array.isArray(legacy) && legacy.length) {
      SalesOnStorage.setItem(LS_RECENT, JSON.stringify(legacy.slice(0, MAX_RECENT)));
      return legacy.slice(0, MAX_RECENT);
    }
    return [];
  } catch { return []; }
}

function saveRecent(term) {
  const t = term.trim().toLowerCase();
  if (!t) return;
  let arr = getRecent().filter(x => x !== t);
  arr.unshift(t);
  arr = arr.slice(0, MAX_RECENT);
  try { SalesOnStorage.setItem(LS_RECENT, JSON.stringify(arr)); }
  catch {}
  renderRecentChips();
}

function renderRecentChips() {
  const arr = getRecent();
  if (!arr.length) {
    recentChips.innerHTML = '<span class="recent-empty">Your recent searches will appear here.</span>';
    return;
  }
  recentChips.innerHTML = arr.map(t =>
    `<button class="recent-chip" type="button" data-term="${encodeURIComponent(t)}">${t}</button>`
  ).join('');

  recentChips.querySelectorAll('.recent-chip').forEach(btn => {
    btn.addEventListener('click', () => {
      const term = decodeURIComponent(btn.dataset.term);
      searchName.value = term;
      searchCode.value = '';
      runSearch();
      searchName.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  });
}

// ───────────────────────────────────────────────────────────────
// 12. TOAST
// ───────────────────────────────────────────────────────────────
function showToast(msg, duration = 3000) {
  if (toastTimer) clearTimeout(toastTimer);
  toast.innerHTML = msg;
  toast.classList.add('show');
  toastTimer = setTimeout(() => toast.classList.remove('show'), duration);
}

// ───────────────────────────────────────────────────────────────
// 13. LEAD MODAL
// ───────────────────────────────────────────────────────────────
function openLeadModal() { window.location.href = "/request-demo"; }

function closeLeadModal() {}












// ───────────────────────────────────────────────────────────────
// 14. FAQ ACCORDION
// ───────────────────────────────────────────────────────────────
function initFaq() {
  $$('.faq-item').forEach(item => {
    const btn = item.querySelector('.faq-q');
    if (!btn) return;
    btn.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      $$('.faq-item').forEach(i => i.classList.remove('open'));
      if (!isOpen) item.classList.add('open');
    });
  });
}

// ───────────────────────────────────────────────────────────────
// 15. MOBILE STICKY BAR
// ───────────────────────────────────────────────────────────────
function initMobileBar() {
  if (mbSearch) {
    mbSearch.addEventListener('click', () => {
      searchName.focus();
      searchName.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  }
  if (mbCopy) {
    mbCopy.addEventListener('click', () => {
      if (!selectedRecord) {
        showToast('⚠ Select a code card first, then tap Copy Code.');
        return;
      }
      copyText(selectedRecord.code, 'Code copied: ' + selectedRecord.code);
    });
  }
  if (mbInvoice) {
    mbInvoice.addEventListener('click', () => {
      if (!selectedRecord) {
        showToast('⚠ Select a code card first, then tap Create Invoice.');
        return;
      }
      handoffTo('invoice', selectedRecord);
    });
  }
}

// ───────────────────────────────────────────────────────────────
// 16. EVENT BINDINGS
// ───────────────────────────────────────────────────────────────
function bindEvents() {
  // Search
  btnSearch.addEventListener('click', runSearch);
  btnReset.addEventListener('click', resetAll);
  btnCommon.addEventListener('click', () => { resetAll(); });

  // Enter key in search inputs
  [searchName, searchCode].forEach(el => {
    el.addEventListener('keydown', e => { if (e.key === 'Enter') runSearch(); });
  });

  // Live filter on select changes
  [filterCat, filterType].forEach(el => {
    el.addEventListener('change', runSearch);
  });

  filterRate.addEventListener('change', () => { if (selectedRecord) selectRecord(selectedRecord); });

  // Detail panel actions
  dpClose.addEventListener('click', closeDetailPanel);
  dpCopyCode.addEventListener('click', () => {
    if (!selectedRecord) return;
    copyText(selectedRecord.code, 'Code copied: ' + selectedRecord.code);
  });
  dpCopyRate.addEventListener('click', () => {
    if (!selectedRecord) return;
    const rate = confirmedRate(); if (rate === null) { showToast('Confirm the current GST rate first.'); filterRate.focus(); return; } copyText(rate + '%', 'Confirmed rate copied');
  });
  dpCopyLine.addEventListener('click', () => {
    if (!selectedRecord) return;
    copyText(buildInvoiceLine(selectedRecord), 'Invoice line copied.');
  });
  dpUseInvoice.addEventListener('click', () => handoffTo('invoice'));
  dpUseQuote.addEventListener('click',   () => handoffTo('quotation'));

  // No-results manual button
  const btnCreateManually = $('btnCreateManually');
  if (btnCreateManually) {
    btnCreateManually.addEventListener('click', () => {

      window.location.href = INVOICE_URL;
    });
  }

  // CTA section buttons (hero area may have additional triggers)
  $$('[data-open-lead]').forEach(el => {
    el.addEventListener('click', () => openLeadModal());
  });

  // Mobile bar
  initMobileBar();

  // FAQ accordion
  initFaq();
}

// ───────────────────────────────────────────────────────────────
// 17. BOOT
// ───────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', init);

