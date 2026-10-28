/* Screenshot presentation and illustrative review controls only. No GPS is read. */
(function () {
  'use strict';
  const root = document.getElementById('tracking-observatory');
  if (root) {
    const views = root.querySelectorAll('[data-st-view]');
    const panels = root.querySelectorAll('[data-st-panel]');
    const label = root.querySelector('#st-view-status');
    views.forEach(button => button.addEventListener('click', () => {
      const selected = button.dataset.stView;
      views.forEach(b => b.setAttribute('aria-pressed', String(b === button)));
      panels.forEach(panel => { panel.hidden = panel.dataset.stPanel !== selected; });
      label.textContent = selected === 'team'
        ? 'Sample location records'
        : 'Sample route and activity records';
    }));

  }
  document.querySelectorAll('[data-page-action="action-001"]').forEach(button => button.addEventListener('click', () => {
    const open = button.classList.contains('open');
    document.querySelectorAll('.faq-q').forEach(q => { q.classList.remove('open'); q.setAttribute('aria-expanded','false'); });
    document.querySelectorAll('.faq-a').forEach(a => a.classList.remove('open'));
    if (!open) {
      button.classList.add('open'); button.setAttribute('aria-expanded','true');
      button.closest('.faq-item').querySelector('.faq-a').classList.add('open');
    }
  }));
})();
