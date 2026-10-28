/* Content stays readable when optional animation/vendor scripts fail. */
(() => {
  function revealContent() {
    document.querySelectorAll('#preloader').forEach(el => el.remove());
    document.querySelectorAll('.reveal, .animate-in').forEach(el => {
      el.style.opacity = '1'; el.style.transform = 'none';
    });
  }
  window.addEventListener('error', event => { if (event.target?.tagName === 'SCRIPT') revealContent(); }, true);
  window.addEventListener('load', revealContent, {once:true});
  window.setTimeout(revealContent, 4000);
})();
