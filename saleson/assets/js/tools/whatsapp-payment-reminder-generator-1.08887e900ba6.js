
/* ─────────────────────────
   STATE
───────────────────────── */
let currentVariation  = 0;   // 0–4 → V1–V5
let generatedMessages = [];  // array of 5 variations
let pendingAction     = null; // 'copy' | 'wa' | 'sequence' | 'callscript'
let generatedSequence = false;
let generatedCallScript = false;

/* ─────────────────────────
   INIT DEFAULTS
───────────────────────── */
function initDefaults() {
  sv('bizName',       'Shree Balaji Distributors');
  sv('senderName',    'Ramesh');
  sv('upiId',         'saleson@exampleupi');
  sv('custName',      'Mohan');
  sv('custShop',      'Mohan Retail Store');
  sv('custPhone',     '9876543210');
  sv('paymentAgainst','GST Invoice');
  sv('invNumber',     'INV-2026-001');
  sv('pendingAmount', '12500');
  sv('totalAmount',   '25000');
  sv('paidAmount',    '12500');
  sv('paymentMode',   'UPI');

  // Invoice date: today
  const today = new Date();
  sv('invDate', fmtDateInput(today));

  // Due date: 7 days before today (so it's overdue)
  const due = new Date(today);
  due.setDate(due.getDate() - 7);
  sv('dueDate', fmtDateInput(due));

  document.getElementById('inclUPI').checked      = true;
  document.getElementById('inclThankYou').checked = true;

  updateDaysOverdue();
  generateMessage();
}

function fmtDateInput(d) {
  const y  = d.getFullYear();
  const m  = String(d.getMonth() + 1).padStart(2, '0');
  const dy = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dy}`;
}

function formatDisplayDate(dateStr) {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-');
  return `${d}/${m}/${y}`;
}

/* ─────────────────────────
   DAYS OVERDUE CALCULATION
───────────────────────── */
function updateDaysOverdue() {
  const dueDateStr = v('dueDate');
  if (!dueDateStr) { document.getElementById('statusRow').innerHTML = ''; return; }

  const dueDate = new Date(dueDateStr);
  const today   = new Date();
  today.setHours(0, 0, 0, 0);
  dueDate.setHours(0, 0, 0, 0);

  const diff = Math.floor((today - dueDate) / (1000 * 60 * 60 * 24));

  let stage, cls, label, toneDefault;
  if (diff < 0) {
    stage = 'before';
    cls   = 'status-soon';
    label = `Due in ${Math.abs(diff)} day${Math.abs(diff) !== 1 ? 's' : ''} 📅`;
    toneDefault = 'polite';
  } else if (diff === 0) {
    stage = 'today';
    cls   = 'status-today';
    label = 'Due Today ⚠️';
    toneDefault = 'friendly';
  } else if (diff <= 7) {
    stage = '1to7';
    cls   = 'status-overdue';
    label = `${diff} day${diff !== 1 ? 's' : ''} overdue 🔴`;
    toneDefault = 'polite';
  } else if (diff <= 15) {
    stage = '8to15';
    cls   = 'status-overdue';
    label = `${diff} days overdue 🔴`;
    toneDefault = 'firm';
  } else if (diff <= 30) {
    stage = '16to30';
    cls   = 'status-long';
    label = `${diff} days overdue — Long Pending 🚨`;
    toneDefault = 'urgent';
  } else {
    stage = '30plus';
    cls   = 'status-critical';
    label = `${diff} days overdue — Critical 🆘`;
    toneDefault = 'final';
  }

  document.getElementById('statusRow').innerHTML =
    `<span class="status-pill ${cls}">${label}</span>`;

  sv('reminderStage', stage);
  sv('tone', toneDefault);
}

function syncStageToTone() {
  const stageToTone = { before: 'polite', today: 'friendly', '1to7': 'polite', '8to15': 'firm', '16to30': 'urgent', '30plus': 'final' };
  const stage = v('reminderStage');
  if (stageToTone[stage]) sv('tone', stageToTone[stage]);
}

/* ─────────────────────────
   MESSAGE GENERATION
───────────────────────── */
function getData() {
  return {
    biz:       v('bizName')        || 'Your Business',
    sender:    v('senderName')     || '',
    upi:       v('upiId')          || '',
    payLink:   v('paymentLink')    || '',
    bank:      v('bankDetails')    || '',
    bizPhone:  v('bizPhone')       || '',
    cust:      v('custName')       || 'Customer',
    custShop:  v('custShop')       || '',
    custPhone: v('custPhone')      || '',
    against:   v('paymentAgainst') || 'Invoice',
    invNum:    v('invNumber')      || '—',
    invDate:   formatDisplayDate(v('invDate')),
    dueDate:   formatDisplayDate(v('dueDate')),
    pending:   parseFloat(v('pendingAmount')) || 0,
    total:     parseFloat(v('totalAmount'))   || 0,
    paid:      parseFloat(v('paidAmount'))    || 0,
    mode:      v('paymentMode')    || 'Any Mode',
    lang:      v('language')       || 'english',
    tone:      v('tone')           || 'polite',
    stage:     v('reminderStage')  || 'before',
    rel:       v('relationship')   || 'regular',
    inclUPI:   document.getElementById('inclUPI').checked,
    inclPayLink: document.getElementById('inclPayLink').checked,
    inclBank:  document.getElementById('inclBank').checked,
    inclTY:    document.getElementById('inclThankYou').checked,
    inclFooter: document.getElementById('inclFooter').checked,
  };
}

function fmtAmt(n) {
  return '₹' + n.toLocaleString('en-IN');
}

function buildPaymentBlock(d) {
  const lines = [];
  if (d.mode !== 'Any Mode') lines.push(`💳 Payment Mode: ${d.mode}`);
  if (d.inclUPI && d.upi)      lines.push(`📲 UPI: ${d.upi}`);
  if (d.inclPayLink && d.payLink) lines.push(`🔗 Pay here: ${d.payLink}`);
  if (d.inclBank && d.bank)    lines.push(`🏦 ${d.bank}`);
  if (d.bizPhone)              lines.push(`📞 ${d.bizPhone}`);
  return lines.length ? '\n\n' + lines.join('\n') : '';
}

function buildPaymentBlockHindi(d) {
  const lines = [];
  if (d.inclUPI && d.upi)      lines.push(`📲 UPI: ${d.upi}`);
  if (d.inclPayLink && d.payLink) lines.push(`🔗 भुगतान लिंक: ${d.payLink}`);
  if (d.inclBank && d.bank)    lines.push(`🏦 ${d.bank}`);
  if (d.bizPhone)              lines.push(`📞 ${d.bizPhone}`);
  return lines.length ? '\n\n' + lines.join('\n') : '';
}

/* Generate English messages by tone */
function englishMessage(d, toneOverride, variation) {
  const tone   = toneOverride || d.tone;
  const amt    = fmtAmt(d.pending);
  const ref    = `${d.against} ${d.invNum}`.trim();
  const dueStr = d.dueDate ? ` due on ${d.dueDate}` : '';
  const ty     = d.inclTY ? '\n\nThank you.' : '';
  const footer = d.inclFooter ? '\n\n_Generated via SalesOn Free Tools — saleson.co.in_' : '';
  const pay    = buildPaymentBlock(d);

  const greeting = d.rel === 'important' ? `Respected ${d.cust} ji` :
                   d.rel === 'new'       ? `Dear ${d.cust}` :
                   variation % 2 === 0   ? `Hi ${d.cust} ji` : `Dear ${d.cust}`;

  const bizFrom = d.sender ? `${d.sender} from ${d.biz}` : d.biz;

  const variants = {
    polite: [
      `${greeting}, hope you are doing well.\n\nThis is a gentle reminder from ${bizFrom} that ${amt} is pending against ${ref}${dueStr}. Kindly clear the payment at your earliest convenience.${pay}${ty}${footer}`,
      `${greeting}, greetings from ${d.biz}.\n\nA quick reminder that ${amt} is outstanding against ${ref}${dueStr}. Request you to kindly process the payment when convenient.${pay}${ty}${footer}`,
      `${greeting}, this is ${bizFrom}.\n\nHope business is going well. Just a gentle reminder about the pending amount of ${amt} against ${ref}${dueStr}. Kindly look into it.${pay}${ty}${footer}`,
    ],
    friendly: [
      `Hi ${d.cust}, just a quick reminder from ${bizFrom}! 😊\n\n${amt} is pending against ${ref}${dueStr}. Please share the payment update when convenient.${pay}${ty}${footer}`,
      `Hi ${d.cust}! Hope you're well. ${bizFrom} here — a small reminder that ${amt} is due against ${ref}. Please arrange payment when possible.${pay}${ty}${footer}`,
      `Hey ${d.cust}, ${d.biz} reminder 👋 — ${amt} is pending for ${ref}${dueStr}. Do share a payment update whenever possible!${pay}${ty}${footer}`,
    ],
    firm: [
      `Dear ${d.cust}, payment of ${amt} against ${ref} is still pending${dueStr}. Kindly clear the dues at the earliest or share a confirmed payment date.${pay}${ty}${footer}`,
      `Dear ${d.cust}, this is a reminder from ${d.biz}. ${amt} against ${ref} remains unpaid${dueStr}. Please clear the payment or let us know the expected date.${pay}${ty}${footer}`,
      `Dear ${d.cust}, ${d.biz} here. ${amt} is overdue against ${ref}. Request you to please clear or confirm payment date by return message.${pay}${ty}${footer}`,
    ],
    urgent: [
      `Dear ${d.cust}, ${amt} is overdue against ${ref}. Please arrange the payment urgently or confirm the expected payment date today. This is affecting our business operations.${pay}${ty}${footer}`,
      `Dear ${d.cust}, urgent reminder from ${d.biz}: ${amt} against ${ref} has been pending for several days. Kindly clear immediately or contact us with a definite payment date.${pay}${ty}${footer}`,
      `Dear ${d.cust}, ${d.biz} requires immediate payment of ${amt} against ${ref}. Kindly arrange payment today and share confirmation. Please treat this as priority.${pay}${ty}${footer}`,
    ],
    final: [
      `Dear ${d.cust}, this is a final reminder from ${d.biz} for pending payment of ${amt} against ${ref}. Kindly clear the payment immediately or contact us today with a confirmed settlement date. Further delay may require us to take appropriate steps.${pay}${footer}`,
      `Dear ${d.cust}, despite repeated follow-ups, ${amt} against ${ref} from ${d.biz} remains unpaid. This is our final reminder. Please settle immediately or call us today.${pay}${footer}`,
      `Dear ${d.cust}, ${d.biz} final notice: ${amt} against ${ref} is long overdue. If payment is not received, we may need to put your account on hold. Please respond today.${pay}${footer}`,
    ],
  };

  const msgs = variants[tone] || variants.polite;
  return msgs[variation % msgs.length];
}

/* Generate Hindi messages */
function hindiMessage(d, toneOverride, variation) {
  const tone = toneOverride || d.tone;
  const amt  = fmtAmt(d.pending);
  const ref  = `${d.against} ${d.invNum}`.trim();
  const pay  = buildPaymentBlockHindi(d);
  const ty   = d.inclTY ? '\n\nधन्यवाद।' : '';
  const footer = d.inclFooter ? '\n\n_SalesOn Free Tools — saleson.co.in_' : '';

  const msgs = {
    polite: [
      `नमस्ते ${d.cust} जी,\n\n${d.biz} की ओर से विनम्र निवेदन है कि ${ref} के विरुद्ध ${amt} की राशि अभी बाकी है। कृपया जल्द भुगतान करने की कृपा करें।${pay}${ty}${footer}`,
      `${d.cust} जी, नमस्ते।\n\n${d.biz} से याद दिला रहे हैं कि ${ref} की ${amt} राशि अभी pending है। सुविधानुसार भुगतान कर दें।${pay}${ty}${footer}`,
    ],
    friendly: [
      `हाय ${d.cust} जी! 😊\n\n${d.biz} से एक छोटा reminder — ${ref} के ${amt} अभी बाकी हैं। जब भी convenient हो, payment करके बताएं।${pay}${ty}${footer}`,
      `${d.cust} जी, ${d.biz} यहाँ से। ${ref} के ${amt} pending हैं। Payment का update दें जब हो सके।${pay}${ty}${footer}`,
    ],
    firm: [
      `${d.cust} जी, ${d.biz} की ओर से सूचित किया जाता है कि ${ref} के विरुद्ध ${amt} की राशि अभी तक प्राप्त नहीं हुई है। कृपया शीघ्र भुगतान करें या payment date बताएं।${pay}${ty}${footer}`,
      `प्रिय ${d.cust}, ${ref} का ${amt} बाकी है। कृपया जल्द से जल्द payment करें या निश्चित date बताएं।${pay}${ty}${footer}`,
    ],
    urgent: [
      `${d.cust} जी, ${d.biz} से urgent reminder। ${ref} का ${amt} काफी समय से outstanding है। कृपया आज ही payment करें या हमसे संपर्क करें।${pay}${footer}`,
      `प्रिय ${d.cust}, ${ref} के ${amt} का भुगतान अत्यंत आवश्यक है। कृपया तत्काल payment करें या आज ही date confirm करें।${pay}${footer}`,
    ],
    final: [
      `${d.cust} जी, यह ${d.biz} की अंतिम सूचना है। ${ref} के ${amt} का भुगतान तुरंत करें अन्यथा हमें उचित कदम उठाने पड़ेंगे।${pay}${footer}`,
      `प्रिय ${d.cust}, ${ref} का ${amt} बहुत समय से outstanding है। यह final reminder है। आज ही payment करें।${pay}${footer}`,
    ],
  };

  const arr = msgs[tone] || msgs.polite;
  return arr[variation % arr.length];
}

/* Hinglish message */
function hinglishMessage(d, toneOverride, variation) {
  const tone = toneOverride || d.tone;
  const amt  = fmtAmt(d.pending);
  const ref  = `${d.against} ${d.invNum}`.trim();
  const pay  = buildPaymentBlock(d);
  const ty   = d.inclTY ? '\n\nThanks!' : '';
  const footer = d.inclFooter ? '\n\n_SalesOn Free Tools — saleson.co.in_' : '';

  const msgs = {
    polite: [
      `Hi ${d.cust} bhai, ${d.biz} se Ramesh bol raha hoon.\n\n${ref} ka ${amt} abhi bhi pending hai. Jab bhi time mile, clear kar dena.${pay}${ty}${footer}`,
      `${d.cust} ji, ek chota sa reminder — ${d.biz} ki taraf se. ${ref} ke ${amt} baki hain. Convenient ho tab payment kar dena.${pay}${ty}${footer}`,
    ],
    friendly: [
      `${d.cust} bhai! ${d.biz} yaad dila raha hai 😊 — ${ref} ka ${amt} pending hai. Payment update dena jab ho sake!${pay}${ty}${footer}`,
      `Hi ${d.cust}! ${d.biz} se reminder — ${ref} ke ${amt} abhi baki hain. Please update karo jab bhi convenient ho.${pay}${ty}${footer}`,
    ],
    firm: [
      `${d.cust} ji, ${d.biz} se ek zaroori reminder. ${ref} ka ${amt} kaafi time se pending hai. Jald se jald clear karo ya payment date batao.${pay}${ty}${footer}`,
      `${d.cust} bhai, ${ref} ka ${amt} abhi tak nahi aaya. Please jaldi payment karo ya pakki date do.${pay}${ty}${footer}`,
    ],
    urgent: [
      `${d.cust} ji, ${d.biz} se urgent baat — ${ref} ka ${amt} bahut time se pending hai. Aaj hi payment karo ya humse baat karo.${pay}${footer}`,
      `${d.cust} bhai, please urgent — ${ref} ka ${amt} bahut overdue ho gaya hai. Aaj pakki date de do ya payment kar do.${pay}${footer}`,
    ],
    final: [
      `${d.cust} ji, ${d.biz} ka yeh final reminder hai. ${ref} ka ${amt} turant clear karo warna hume aage step lena padega.${pay}${footer}`,
      `${d.cust} bhai last chance — ${ref} ka ${amt} aaj clear karo. Agla step formal hoga.${pay}${footer}`,
    ],
  };

  const arr = msgs[tone] || msgs.polite;
  return arr[variation % arr.length];
}

/* Build message by language */
function buildMessage(d, toneOverride, variation) {
  const lang = d.lang;
  if (lang === 'hindi') return hindiMessage(d, toneOverride, variation);
  if (lang === 'hinglish') return hinglishMessage(d, toneOverride, variation);
  if (lang === 'both') {
    return englishMessage(d, toneOverride, variation) + '\n\n---\n\n' + hindiMessage(d, toneOverride, variation);
  }
  return englishMessage(d, toneOverride, variation);
}

/* ─────────────────────────
   MAIN GENERATE FUNCTION
───────────────────────── */
function generateMessage() {
  const d = getData();

  // Update WA contact name
  const contactName = d.custShop || d.cust;
  document.getElementById('waContactName').textContent = contactName;
  document.querySelector('.wa-contact-status').textContent =
    d.custPhone ? '+91 ' + d.custPhone.replace(/\D/g,'').slice(-10) : 'WhatsApp';

  // Generate 5 variations
  generatedMessages = [0, 1, 2, 3, 4].map(i => buildMessage(d, null, i));

  // Show current variation
  showVariation(currentVariation);

  // Update time
  const now = new Date();
  document.getElementById('waTime').textContent =
    now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
}

function showVariation(idx) {
  currentVariation = idx;
  const msg = generatedMessages[idx] || 'Generating...';
  document.getElementById('waBubble').value = msg;
}

function switchVariation(idx, el) {
  document.querySelectorAll('.var-tab').forEach(t => t.classList.remove('active'));
  el.classList.add('active');
  showVariation(idx);
}

/* ─────────────────────────
   FOLLOW-UP SEQUENCE
───────────────────────── */
function generateSequence() {
  const d    = getData();
  const card = document.getElementById('seqCard');
  const body = document.getElementById('seqBody');
  generatedSequence = true;

  const stages = [
    { label: 'Day 0 — Before Due Date',    tone: 'polite',   stage: 'before' },
    { label: 'Due Date',                   tone: 'friendly', stage: 'today' },
    { label: '3 Days Overdue',             tone: 'firm',     stage: '1to7'  },
    { label: '7 Days Overdue',             tone: 'firm',     stage: '1to7'  },
    { label: '15+ Days Overdue',           tone: 'urgent',   stage: '16to30'},
  ];

  body.innerHTML = stages.map((s, i) => {
    const msg = buildMessage({ ...d, stage: s.stage }, s.tone, i);
    const safeMsg = msg.replace(/'/g, '&#39;').replace(/"/g, '&quot;');
    return `
      <div class="seq-item">
        <div class="seq-badge">${i + 1}</div>
        <div style="flex:1;">
          <div class="seq-label">${s.label}</div>
          <div class="seq-msg">${escHtml(msg)}</div>
          <div class="seq-actions">
            <button class="btn-sm btn-sm-green" onclick="copyText('${safeMsg}')">📋 Copy</button>
            <button class="btn-sm btn-sm-wa"    onclick="openWA('${safeMsg}', '${d.custPhone}')">📲 WhatsApp</button>
          </div>
        </div>
      </div>`;
  }).join('');

  card.style.display = 'block';
  card.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/* ─────────────────────────
   CALL SCRIPT
───────────────────────── */
function generateCallScript() {
  const d    = getData();
  const card = document.getElementById('callCard');
  const body = document.getElementById('callBody');
  generatedCallScript = true;

  body.innerHTML = `
    <div class="call-step">
      <div class="call-step-label">Opening</div>
      Namaste, ${d.cust} ji. Main ${d.sender || d.biz} se bol raha/rahi hoon — ${d.biz} se. Kya aap abhi baat kar sakte hain?
    </div>
    <div class="call-step">
      <div class="call-step-label">Payment Reminder</div>
      Ji, main ${d.against} number ${d.invNum} ke baare mein baat karna chahta/ti tha/ti. ${fmtAmt(d.pending)} ki outstanding amount hai jo abhi pending hai${d.dueDate ? ' — due date ' + d.dueDate + ' thi' : ''}. Kya aap is baare mein update kar sakte hain?
    </div>
    <div class="call-step">
      <div class="call-step-label">Ask for Payment Date</div>
      ${d.cust} ji, kab tak payment ho sakti hai? Kya aap ek pakki date de sakte hain? Hum us date ko note kar lete hain — yeh sab record ke liye hai.
    </div>
    <div class="call-step">
      <div class="call-step-label">Payment Details (if needed)</div>
      ${d.upi ? 'Payment ke liye UPI: ' + d.upi : ''}${d.bank ? (d.upi ? ' ya ' : '') + 'Bank: ' + d.bank : ''}${!d.upi && !d.bank ? 'UPI ya bank transfer se payment kijiye, details WhatsApp par bhej deta/deti hoon.' : ''}
    </div>
    <div class="call-step">
      <div class="call-step-label">Polite Close</div>
      Bahut shukriya ${d.cust} ji. Aapke saath kaam karna accha lagta hai. Agar koi issue ho toh seedha bata dijiye — hum mil ke resolve karte hain. Payment hone ke baad WhatsApp par confirmation zaroor bhejein. Dhanyawad!
    </div>
  `;

  const scriptText = `CALL SCRIPT — ${d.biz}

Opening: Namaste ${d.cust} ji, main ${d.sender || d.biz} se bol raha hoon.
Reminder: ${d.against} ${d.invNum} — ${fmtAmt(d.pending)} pending${d.dueDate ? ', due ' + d.dueDate : ''}.
Ask: Kab tak payment ho sakti hai? Pakki date dijiye.
Payment: ${d.upi ? 'UPI: ' + d.upi : 'Details WhatsApp par bhejta hoon.'}
Close: Dhanyawad, payment ke baad WhatsApp confirmation zaroor bhejein.`;

  body.innerHTML += `
    <div style="margin-top:12px;border-top:1px solid var(--border);padding-top:12px;">
      <button class="btn-sm btn-sm-green" onclick="copyText(${JSON.stringify(scriptText)})">📋 Copy Full Script</button>
    </div>`;

  card.style.display = 'block';
  card.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/* ─────────────────────────
   SMS VERSION
───────────────────────── */
function generateSMSVersion() {
  const d    = getData();
  const card = document.getElementById('smsCard');
  const body = document.getElementById('smsBody');

  const sms = `${d.biz}: ${fmtAmt(d.pending)} pending vs ${d.invNum}. Pls pay ${d.upi ? 'UPI:'+d.upi+' ' : ''}or call ${d.bizPhone || 'us'}. Ignore if paid.`.substring(0, 160);

  body.innerHTML = `
    <div style="background:var(--surface);border:1px solid var(--border);border-radius:8px;padding:14px;font-size:13.5px;color:var(--ink-soft);line-height:1.7;white-space:pre-wrap;margin-bottom:10px;">${escHtml(sms)}</div>
    <div style="font-size:12px;color:var(--ink-mute);margin-bottom:10px;">${sms.length} / 160 characters</div>
    <button class="btn-sm btn-sm-green" onclick="copyText(${JSON.stringify(sms)})">📋 Copy SMS</button>
  `;

  card.style.display = 'block';
  card.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/* ─────────────────────────
   THANK-YOU MESSAGE
───────────────────────── */
function generateThankYou() {
  const d    = getData();
  const card = document.getElementById('thankCard');
  const body = document.getElementById('thankBody');

  const amt = fmtAmt(d.pending);
  const engMsg = `Hi ${d.cust} ji, thank you for your payment of ${amt}! We have received it successfully against ${d.against} ${d.invNum}. We truly appreciate your business with ${d.biz}. Looking forward to continued association. 🙏`;
  const hinMsg = `${d.cust} जी, ${amt} का भुगतान प्राप्त हो गया है। ${d.biz} की ओर से आपका बहुत-बहुत धन्यवाद! आपसे व्यापार करके प्रसन्नता होती है। 🙏`;

  body.innerHTML = `
    <div style="margin-bottom:14px;">
      <div style="font-size:12px;font-weight:700;color:var(--ink-mute);margin-bottom:6px;">English</div>
      <div style="background:var(--green-light);border:1px solid rgba(5,150,105,.2);border-radius:8px;padding:14px;font-size:13.5px;color:var(--ink);line-height:1.7;white-space:pre-wrap;margin-bottom:8px;">${escHtml(engMsg)}</div>
      <button class="btn-sm btn-sm-wa" onclick="openWA(${JSON.stringify(engMsg)}, '${d.custPhone}')">📲 WhatsApp</button>
      <button class="btn-sm btn-sm-green" style="margin-left:6px;" onclick="copyText(${JSON.stringify(engMsg)})">📋 Copy</button>
    </div>
    <div>
      <div style="font-size:12px;font-weight:700;color:var(--ink-mute);margin-bottom:6px;">Hindi</div>
      <div style="background:var(--green-light);border:1px solid rgba(5,150,105,.2);border-radius:8px;padding:14px;font-size:13.5px;color:var(--ink);line-height:1.7;white-space:pre-wrap;margin-bottom:8px;">${escHtml(hinMsg)}</div>
      <button class="btn-sm btn-sm-wa" onclick="openWA(${JSON.stringify(hinMsg)}, '${d.custPhone}')">📲 WhatsApp</button>
      <button class="btn-sm btn-sm-green" style="margin-left:6px;" onclick="copyText(${JSON.stringify(hinMsg)})">📋 Copy</button>
    </div>
  `;

  card.style.display = 'block';
  card.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/* ─────────────────────────
   WHATSAPP OPEN
───────────────────────── */
function openWA(msg, phone) {
  const encoded = encodeURIComponent(msg);
  const cleaned = (phone || '').replace(/[\s+\-()]/g, '');
  const num = cleaned.length === 10 ? '91' + cleaned : cleaned;
  const url = num ? `https://wa.me/${num}?text=${encoded}` : `https://wa.me/?text=${encoded}`;
  window.open(url, '_blank');
}

function copyText(text) {
  if (!text) { showToast('Select or generate a message first.'); return; }
  SalesOnToolSafety.copy(text).then(ok => showToast(ok ? 'Message copied. Paste it on WhatsApp.' : 'Copy failed. Select and copy the text manually.'));
}

function escHtml(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

/* ─────────────────────────
   ACTION TRIGGER — checks lead first
───────────────────────── */
function triggerAction(action) {  executeAction(action); }

function executeAction(action) {
  const d   = getData();
  const msg = generatedMessages[currentVariation] || '';

  if (action === 'copy') {
    copyText(msg);
  } else if (action === 'wa') {
    openWA(msg, d.custPhone);
  } else if (action === 'sequence') {
    generateSequence();
  } else if (action === 'callscript') {
    generateCallScript();
  }
}

/* ─────────────────────────
   LEAD MODAL
───────────────────────── */


function skipLead() {}

/* ─────────────────────────
   DRAFT SAVE / LOAD
───────────────────────── */
function saveDraft() {
  const draft = {
    editedMessage: document.getElementById('waBubble').value, messageVariation: currentVariation,
    bizName: v('bizName'), senderName: v('senderName'),
    bizPhone: v('bizPhone'), upiId: v('upiId'),
    paymentLink: v('paymentLink'), bankDetails: v('bankDetails'),
    custName: v('custName'), custShop: v('custShop'),
    custPhone: v('custPhone'), custCity: v('custCity'),
    custType: v('custType'), paymentAgainst: v('paymentAgainst'),
    invNumber: v('invNumber'), invDate: v('invDate'),
    dueDate: v('dueDate'), pendingAmount: v('pendingAmount'),
    totalAmount: v('totalAmount'), paidAmount: v('paidAmount'),
    paymentMode: v('paymentMode'), language: v('language'),
    tone: v('tone'), reminderStage: v('reminderStage'),
    relationship: v('relationship'),
    inclUPI: document.getElementById('inclUPI').checked,
    inclPayLink: document.getElementById('inclPayLink').checked,
    inclBank: document.getElementById('inclBank').checked,
    inclTY: document.getElementById('inclThankYou').checked,
    inclFooter: document.getElementById('inclFooter').checked,
    savedAt: new Date().toISOString()
  };
  SalesOnStorage.setItem('saleson_whatsapp_payment_reminder_draft', JSON.stringify(draft));
  showToast(SalesOnStorage.persistent ? 'Draft saved ✓' : 'Not saved to browser storage. Keep this tab open or export your work.');
}

function loadDraft() {
  const raw = SalesOnStorage.getItem('saleson_whatsapp_payment_reminder_draft');
  if (!raw) { showToast('No saved draft found'); return; }
  const d = SalesOnToolSafety.draft(raw);
  if (!confirm('Restore saved draft? This replaces the current workspace.')) return;

  ['bizName','senderName','bizPhone','upiId','paymentLink','bankDetails',
   'custName','custShop','custPhone','custCity','custType','paymentAgainst',
   'invNumber','invDate','dueDate','pendingAmount','totalAmount','paidAmount',
   'paymentMode','language','tone','reminderStage','relationship'
  ].forEach(id => { if (d[id] !== undefined) sv(id, d[id]); });

  if (d.inclUPI      !== undefined) document.getElementById('inclUPI').checked      = !!d.inclUPI;
  if (d.inclPayLink  !== undefined) document.getElementById('inclPayLink').checked  = !!d.inclPayLink;
  if (d.inclBank     !== undefined) document.getElementById('inclBank').checked     = !!d.inclBank;
  if (d.inclTY       !== undefined) document.getElementById('inclThankYou').checked = !!d.inclTY;
  if (d.inclFooter   !== undefined) document.getElementById('inclFooter').checked   = !!d.inclFooter;

  updateDaysOverdue();
  currentVariation=Number.isInteger(d.messageVariation)&&d.messageVariation>=0&&d.messageVariation<3?d.messageVariation:0;
  document.querySelectorAll('.var-tab').forEach((tab,i)=>tab.classList.toggle('active',i===currentVariation));
  generateMessage();
  if(typeof d.editedMessage==='string'){generatedMessages[currentVariation]=d.editedMessage;document.getElementById('waBubble').value=d.editedMessage;}
  showToast('Draft loaded ✓');
  return true;
}

/* ─────────────────────────
   RESET
───────────────────────── */
function resetForm() {
  if (!confirm('Reset all fields to sample data?')) return;
  generatedSequence   = false;
  generatedCallScript = false;
  currentVariation    = 0;
  document.querySelectorAll('.var-tab').forEach((t, i) => t.classList.toggle('active', i === 0));
  ['seqCard','callCard','smsCard','thankCard'].forEach(id => {
    document.getElementById(id).style.display = 'none';
  });
  initDefaults();
  showToast('Form reset ✓');
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
   FAQ
───────────────────────── */
function toggleFaq(btn) {
  const a = btn.nextElementSibling;
  const isOpen = btn.classList.contains('open');
  document.querySelectorAll('.faq-q').forEach(b => {
    b.classList.remove('open'); b.nextElementSibling.classList.remove('open');
  });
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
function v(id)       { const el = document.getElementById(id); return el ? el.value : ''; }
function sv(id, val) { const el = document.getElementById(id); if (el) el.value = val; }

/* ─────────────────────────
   INIT
───────────────────────── */
initDefaults();


document.getElementById('waBubble').addEventListener('input',function(){generatedMessages[currentVariation]=this.value;});
