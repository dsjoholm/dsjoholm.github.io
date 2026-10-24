// Random cat for the home page, from cataas.com ("cat as a service").
// The [new cat] button swaps in another one without reloading the page.

(function () {
  const img = document.getElementById('cat-img');
  const button = document.getElementById('new-cat');
  if (!img) return;

  function loadCat() {
    img.classList.add('loading');
    if (button) button.disabled = true;
    img.src = 'https://cataas.com/cat?width=640&t=' + Date.now();
  }

  function done() {
    img.classList.remove('loading');
    if (button) button.disabled = false;
  }

  img.addEventListener('load', done);
  img.addEventListener('error', done);
  if (button) button.addEventListener('click', loadCat);
  loadCat();
})();
