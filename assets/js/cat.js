// Random cat for the home page. The [new cat] button swaps in another one
// without reloading the page.
//
// Cats come from free services that are sometimes down, so it tries:
//   1. cataas.com ("cat as a service")
//   2. The Cat API, if cataas fails or takes longer than 8 seconds
//   3. the site's own pixel cat, if both are down

(function () {
  const img = document.getElementById('cat-img');
  const button = document.getElementById('new-cat');
  const caption = document.querySelector('.cat figcaption span');
  if (!img) return;

  const CAPTION = caption ? caption.textContent : '';
  const TIMEOUT_MS = 8000;

  const sources = [
    async () => 'https://cataas.com/cat?width=640&t=' + Date.now(),
    async () => {
      const res = await fetch('https://api.thecatapi.com/v1/images/search');
      const data = await res.json();
      return data[0].url;
    },
  ];

  // Resolves once the image has fully downloaded; fails on error or timeout
  function preload(url) {
    return new Promise((resolve, reject) => {
      const probe = new Image();
      const timer = setTimeout(() => { probe.src = ''; reject(new Error('timeout')); }, TIMEOUT_MS);
      probe.onload = () => { clearTimeout(timer); resolve(url); };
      probe.onerror = () => { clearTimeout(timer); reject(new Error('failed')); };
      probe.src = url;
    });
  }

  async function loadCat() {
    img.classList.add('loading');
    if (button) button.disabled = true;

    let found = null;
    for (const source of sources) {
      try {
        found = await preload(await source());
        break;
      } catch (e) {
        // try the next source
      }
    }

    img.classList.toggle('pixel-cat', !found);
    img.src = found || img.dataset.fallback;
    if (caption) caption.textContent = found ? CAPTION : 'the cat servers are napping';
    img.classList.remove('loading');
    if (button) button.disabled = false;
  }

  if (button) button.addEventListener('click', loadCat);
  loadCat();
})();
