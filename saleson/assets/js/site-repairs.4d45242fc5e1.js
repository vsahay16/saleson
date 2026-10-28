/* Progressive enhancements; no conversion is inferred from a link click. */
(() => {
  const main = document.querySelector('main, [role="main"]') || document.querySelector('body > section');
  if (main) {
    main.id ||= 'main-content';
    const skip = document.createElement('a');
    skip.href = '#' + main.id;
    skip.className = 'skip-link';
    skip.textContent = 'Skip to content';
    if (!document.querySelector('.skip-link')) document.body.prepend(skip);
  }
  document.querySelectorAll('table').forEach(table => {
    if (!table.parentElement.classList.contains('repair-table-scroll')) {
      const wrap = document.createElement('div');
      wrap.className = 'repair-table-scroll';
      wrap.tabIndex = 0;
      wrap.setAttribute('role', 'region');
      wrap.setAttribute('aria-label', table.caption?.textContent || 'Scrollable table');
      table.before(wrap);
      wrap.append(table);
    }
  });
  document.querySelectorAll('iframe:not([title])').forEach(frame => {
    frame.title = frame.src.includes('zcal') ? 'SalesOn demo booking calendar' : 'Embedded content';
  });
  function labelFields() {
    document.querySelectorAll('input,select,textarea').forEach((field,index) => {
      if (['hidden','submit','button'].includes(field.type)) return;
      if (field.labels?.length || field.hasAttribute('aria-label') || field.hasAttribute('aria-labelledby')) return;
      const label = field.parentElement.querySelector('label');
      if (label && !label.htmlFor) {
        field.id ||= 'saleson-field-'+index;
        label.htmlFor = field.id;
        return;
      }
      const cell=field.closest('td,th'), row=cell?.parentElement, table=cell?.closest('table');
      if (cell && table) {
        const column=[...row.children].indexOf(cell);
        const heading=table.querySelector('thead tr')?.children[column]?.textContent.trim();
        const context=row.querySelector('td')?.textContent.trim();
        const name=field.type==='checkbox' ? (cell.tagName==='TH' ? 'Select all rows' : 'Select row'+(context ? ': '+context : '')) : heading;
        if(name) {field.setAttribute('aria-label',name);return;}
      }
      const names={fSearch:'Search invoices',fStatus2:'Filter by payment status',fAge:'Filter by ageing',fSalesFilter:'Filter by salesperson',fBeatFilter:'Filter by beat',fSort:'Sort invoices',fMinBal:'Minimum balance',filterSearch:'Search records',filterRisk:'Filter by stock risk',filterCategory:'Filter by category',filterSupplier:'Filter by supplier',sortBy:'Sort records',filterIssue:'Filter by loading issue',filterSort:'Sort loading records',selectAllHead:'Select all rows'};
      const name=names[field.id] || field.placeholder?.replace(/^[^a-zA-Z]+/,'') || (field.tagName==='SELECT' ? field.options[0]?.textContent : '');
      if(name) field.setAttribute('aria-label',name);
    });
  }
  labelFields();
  // Generated rows and saved-draft restores need the same labels as initial rows.
  new MutationObserver(labelFields).observe(document.body,{childList:true,subtree:true});
  const faqButtons=[...document.querySelectorAll('button.faq-q,button.fqb')];
  function syncFaq() {
    faqButtons.forEach((button,index) => {
      const panel=button.nextElementSibling;
      if(!panel)return;
      panel.id ||= 'saleson-faq-panel-'+index;
      button.setAttribute('aria-controls',panel.id);
      button.setAttribute('aria-expanded',String(button.classList.contains('open') || panel.classList.contains('open')));
    });
  }
  faqButtons.forEach(button=>button.addEventListener('click',()=>queueMicrotask(syncFaq)));
  syncFaq();
})();
