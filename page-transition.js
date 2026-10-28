(() => {
  const layer = document.createElement('div');
  layer.className = 'hl-transition-layer';
  layer.setAttribute('aria-hidden', 'true');
  layer.innerHTML = '<img src="assets/hl-producciones-logo.png" alt="" />';
  document.body.appendChild(layer);

  const entering = sessionStorage.getItem('hl-page-transition');
  if (entering) {
    sessionStorage.removeItem('hl-page-transition');
    document.body.classList.add('is-page-entering');
    window.setTimeout(() => document.body.classList.remove('is-page-entering'), 850);
  }

  document.addEventListener('click', (event) => {
    const link = event.target.closest('a[href]');
    if (!link || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

    const target = new URL(link.href, window.location.href);
    if (target.origin !== window.location.origin || target.pathname === window.location.pathname) return;

    event.preventDefault();
    sessionStorage.setItem('hl-page-transition', '1');
    document.body.classList.add('is-page-leaving');
    window.setTimeout(() => { window.location.href = target.href; }, 560);
  });
})();
