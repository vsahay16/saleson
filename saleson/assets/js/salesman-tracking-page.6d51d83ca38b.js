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
        ? 'Team view: employee names and the latest recorded location time.'
        : 'Day view: a selected employee’s route, distance, total time and recorded events.';
    }));
    root.querySelectorAll('[data-st-video]').forEach(button => button.addEventListener('click', () => {
      const video = button.dataset.stVideo;
      if (!['V99B-tyjqbg','i5ypxxIW7TI'].includes(video)) return;
      const frame = document.createElement('iframe');
      frame.src = 'https://www.youtube-nocookie.com/embed/' + video + '?autoplay=1';
      frame.title = button.dataset.stVideoTitle;
      frame.allow = 'autoplay; encrypted-media; picture-in-picture';
      frame.setAttribute('allowfullscreen', '');
      frame.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
      button.replaceWith(frame);
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
