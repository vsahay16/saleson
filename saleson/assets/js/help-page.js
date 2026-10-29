/* Task-focused help library. No remote player loads before an explicit choice. */
(() => {
  const search = document.getElementById('help-search');
  if (!search) return;
  const cards = [...document.querySelectorAll('.help-video-card')];
  const filters = [...document.querySelectorAll('[data-help-filter]')];
  let category = 'all';
  function filter() {
    const query = search.value.trim().toLocaleLowerCase();
    let count = 0;
    cards.forEach(card => {
      const show = (category === 'all' || card.dataset.helpCategory === category) && card.textContent.toLocaleLowerCase().includes(query);
      card.hidden = !show;
      if (show) count++;
    });
    document.querySelectorAll('[data-help-group]').forEach(group => { group.hidden = ![...group.querySelectorAll('.help-video-card')].some(card => !card.hidden); });
    document.getElementById('help-result-count').textContent = `${count} ${count === 1 ? 'guide' : 'guides'}`;
    document.getElementById('help-empty').hidden = count !== 0;
  }
  search.addEventListener('input', filter);
  filters.forEach(button => button.addEventListener('click', () => {
    category = button.dataset.helpFilter;
    filters.forEach(other => other.setAttribute('aria-pressed', String(other === button)));
    filter();
  }));
  const dialog = document.createElement('dialog');
  dialog.className = 'help-video-dialog';
  dialog.setAttribute('aria-labelledby', 'help-player-title');
  dialog.innerHTML = '<div class="help-dialog-head"><h2 id="help-player-title"></h2><button type="button" autofocus>Close video</button></div><div class="help-player"></div><div class="help-dialog-foot"><p class="help-player-status" role="status">Loading the Google Drive player…</p><p>Press play in the player. If it does not start, use the direct link.</p><a target="_blank" rel="noopener noreferrer">Open video in Google Drive ↗</a></div>';
  document.body.append(dialog);
  const title = dialog.querySelector('h2'), player = dialog.querySelector('.help-player'), fallback = dialog.querySelector('a'), status = dialog.querySelector('[role="status"]');
  let opener;
  document.querySelectorAll('[data-help-video]').forEach(button => button.addEventListener('click', () => {
    const id = button.dataset.helpVideo;
    if (!/^[A-Za-z0-9_-]{20,80}$/.test(id)) return;
    const url = `https://drive.google.com/file/d/${id}/view`;
    if (typeof dialog.showModal !== 'function') { window.open(url, '_blank', 'noopener,noreferrer'); return; }
    opener = button;
    title.textContent = button.dataset.helpTitle;
    fallback.href = url;
    status.textContent = 'Loading the Google Drive player…';
    const frame = document.createElement('iframe');
    frame.title = button.dataset.helpTitle + ' — Google Drive video player';
    frame.setAttribute('allow', 'fullscreen');
    frame.allowFullscreen = true;
    frame.referrerPolicy = 'no-referrer';
    frame.addEventListener('load', () => { status.textContent = 'Video hosted on Google Drive. Playback may depend on your browser settings.'; });
    frame.src = `https://drive.google.com/file/d/${id}/preview`;
    player.replaceChildren(frame);
    dialog.showModal();
  }));
  dialog.querySelector('button').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
  dialog.addEventListener('close', () => { player.replaceChildren(); if (opener) opener.focus(); });
})();
