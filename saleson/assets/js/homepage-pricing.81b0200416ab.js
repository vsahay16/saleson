/* Keep the homepage's two-user example in the same tier as the pricing page. */
(() => {
  const total = document.querySelector('[data-home-pro-total]');
  if (!total || !window.SalesOnRegionalPricing) return;
  total.textContent = 'Checking price…';
  document.querySelector('[data-home-unit-note]').textContent = 'Selecting prices for your visiting region.';
  window.SalesOnRegionalPricing.ready.then(({tier, detected}) => {
    const cfg = window.SalesOnPricing[tier];
    const money = n => cfg.symbol + Number(n).toLocaleString(cfg.locale, {maximumFractionDigits: 2});
    const pro = cfg.plans['250'];
    total.innerHTML = money(pro.monthly * cfg.minimumUsers) + '<span>/month</span>';
    document.querySelector('[data-home-unit-note]').textContent = money(pro.monthly) + ' per user/month. Taxes extra where applicable.';
    document.querySelector('[data-home-setup]').textContent = money(cfg.setupFee);
    document.querySelector('[data-home-minimum]').textContent = cfg.minimumUsers + ' users';
    const note = document.querySelector('[data-home-region-note]');
    if (note) note.textContent = detected ? 'Prices in '+cfg.currency+' for your visiting region.' : 'Standard USD prices shown. Contact SalesOn to confirm your regional quote.';
  });
})();
