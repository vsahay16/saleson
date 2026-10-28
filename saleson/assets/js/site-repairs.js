/* Progressive enhancements; no conversion is inferred from a link click. */
(() => {
  const main = document.querySelector('main, [role="main"]') || document.querySelector('body > section');
  if (main) {
    main.id ||= 'main-content';
    const skip = document.createElement('a');
    skip.href = '#' + main.id;
    skip.className = 'skip-link';
    skip.textContent = 'Skip to content';
    document.body.prepend(skip);
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
  document.querySelectorAll('input,select,textarea').forEach((field,index) => {
    if (field.type === 'hidden' || field.type === 'submit' || field.type === 'button') return;
    if (field.labels?.length || field.hasAttribute('aria-label') || field.hasAttribute('aria-labelledby')) return;
    // Reuse a visible label from the same form group where older markup omitted for.
    const label = field.parentElement.querySelector('label');
    if (label && !label.htmlFor) {
      field.id ||= 'saleson-field-'+index;
      label.htmlFor = field.id;
    }
  });
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
  // Pricing uses one canonical INR price list for every visitor.
})();
