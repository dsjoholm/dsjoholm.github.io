// Locked lists (_layouts/list.html, made by bin/lock-lists). The page holds
// the list only scrambled; the password unscrambles it here, in the browser,
// with the same AES-256 encryption the script used. A wrong password can't
// unscramble anything, so it gets an "ah ah ah!" instead.

(function () {
  const form = document.querySelector('form.locked');
  if (!form || !window.crypto || !crypto.subtle) return;
  const locked = JSON.parse(form.dataset.locked);
  const body = document.querySelector('.list-body');
  const input = form.querySelector('input');
  const button = form.querySelector('button');
  const nope = form.querySelector('.locked-nope');
  const bytes = (b64) => Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));

  async function unlock(password) {
    const base = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveKey']);
    const key = await crypto.subtle.deriveKey(
      { name: 'PBKDF2', salt: bytes(locked.salt), iterations: locked.iterations, hash: 'SHA-256' },
      base, { name: 'AES-GCM', length: 256 }, false, ['decrypt']);
    const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: bytes(locked.iv) }, key, bytes(locked.data));
    return new TextDecoder().decode(plain);
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    button.disabled = true;
    button.textContent = '[…]';
    try {
      body.innerHTML = await unlock(input.value);
      body.hidden = false;
      form.remove();
    } catch (err) {
      nope.hidden = false;
      nope.classList.remove('again');
      void nope.offsetWidth;         // restart the wag on every wrong try
      nope.classList.add('again');
      input.select();
    }
    button.disabled = false;
    button.textContent = '[unlock]';
  });
})();
