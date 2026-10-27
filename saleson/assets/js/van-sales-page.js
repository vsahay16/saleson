/* Illustrative closing-stock calculation. No business records are changed. */
(function () {
  'use strict';
  const root = document.getElementById('van-route-desk');
  if (root) {
    const count = root.querySelector('#vs-count');
    const result = root.querySelector('#vs-variance');
    const status = root.querySelector('#vs-count-status');
    const reset = root.querySelector('#vs-reset');
    function reviewCount() {
      const raw = count.value.trim();
      const value = Number(raw);
      if (!raw || !Number.isSafeInteger(value) || value < 0) {
        result.textContent = '—';
        status.textContent = 'Enter a whole number of zero or more.';
        count.setAttribute('aria-invalid', 'true');
        result.dataset.state = 'invalid';
        return;
      }
      count.setAttribute('aria-invalid', 'false');
      const difference = value - 44;
      result.textContent = difference > 0 ? '+' + difference : String(difference);
      result.dataset.state = difference === 0 ? 'matched' : 'review';
      status.textContent = difference === 0
        ? 'The saleable count matches the expected 44 units.'
        : Math.abs(difference) + (Math.abs(difference) === 1 ? ' unit ' : ' units ') + (difference < 0 ? 'short. Review the stock movements before closing.' : 'over. Review the stock movements before closing.');
    }
    count.addEventListener('input', reviewCount);
    reset.addEventListener('click', function () { count.value = '44'; reviewCount(); });
    reviewCount();
  }
  document.querySelectorAll('[data-page-action="action-001"]').forEach(function (button) {
    button.addEventListener('click', function () {
      const wasOpen = button.classList.contains('open');
      document.querySelectorAll('.faq-q').forEach(function (q) {
        q.classList.remove('open');
        q.setAttribute('aria-expanded', 'false');
      });
      document.querySelectorAll('.faq-a').forEach(function (answer) { answer.classList.remove('open'); });
      if (!wasOpen) {
        button.classList.add('open');
        button.setAttribute('aria-expanded', 'true');
        button.closest('.faq-item').querySelector('.faq-a').classList.add('open');
      }
    });
  });
})();
