/* Accessible enlargement for the supplied product screenshots. */
(() => {
  const triggers = [...document.querySelectorAll('[data-media-src]')];
  if (!triggers.length) return;
  const dialog = document.createElement('dialog');
  dialog.className = 'feature-media-dialog';
  dialog.setAttribute('aria-labelledby', 'feature-media-title');
  dialog.innerHTML = '<div class="feature-media-dialog-header"><h2 id="feature-media-title" class="feature-media-dialog-title"></h2><div class="feature-media-dialog-actions"><button type="button" class="feature-media-zoom" aria-pressed="false">Zoom in</button><button type="button" class="feature-media-close" autofocus>Close image</button></div></div><div class="feature-media-dialog-viewport" tabindex="0" role="region" aria-label="Product image; scroll to explore"><img class="feature-media-dialog-image" alt=""></div>';
  document.body.append(dialog);
  const image = dialog.querySelector('img');
  const title = dialog.querySelector('h2');
  const zoom = dialog.querySelector('.feature-media-zoom');
  const close = dialog.querySelector('.feature-media-close');
  const viewport = dialog.querySelector('.feature-media-dialog-viewport');
  let opener = null;
  triggers.forEach(trigger => trigger.addEventListener('click', () => {
    opener = trigger;
    image.src = trigger.dataset.mediaSrc;
    image.alt = trigger.dataset.mediaTitle;
    title.textContent = trigger.dataset.mediaTitle;
    dialog.classList.remove('is-zoomed');
    zoom.setAttribute('aria-pressed', 'false');
    zoom.textContent = 'Zoom in';
    if (typeof dialog.showModal === 'function') dialog.showModal();
    else { window.open(trigger.dataset.mediaSrc, '_blank', 'noopener'); return; }
    viewport.scrollTo(0, 0);
  }));
  close.addEventListener('click', () => dialog.close());
  zoom.addEventListener('click', () => {
    const enlarged = dialog.classList.toggle('is-zoomed');
    zoom.setAttribute('aria-pressed', String(enlarged));
    zoom.textContent = enlarged ? 'Fit image' : 'Zoom in';
  });
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const bounds = dialog.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
  });
  dialog.addEventListener('close', () => opener?.focus());
})();
