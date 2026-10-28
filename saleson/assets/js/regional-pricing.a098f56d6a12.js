/* Same-origin country selection. No third-party IP lookup or saved country override. */
(() => {
  if (window.SalesOnRegionalPricing) return;
  const ready = (async () => {
    const controller = new AbortController();
    let timer;
    try {
      const result = await Promise.race([
        (async () => {
          const response = await fetch('/api/pricing', {cache: 'no-store', credentials: 'same-origin', signal: controller.signal});
          if (!response.ok) throw new Error('Regional pricing unavailable');
          return await response.json();
        })(),
        new Promise((_, reject) => { timer = setTimeout(() => { controller.abort(); reject(new Error('Regional pricing timeout')); }, 4000); })
      ]);
      if (!['IN', 'USD', 'EN'].includes(result.tier)) throw new Error('Invalid regional pricing response');
      return {tier: result.tier, detected: true};
    } catch (_) {
      // Conservative international display if the hosting country route is unavailable.
      return {tier: 'USD', detected: false};
    } finally {
      clearTimeout(timer);
    }
  })();
  window.SalesOnRegionalPricing = {ready};
})();
