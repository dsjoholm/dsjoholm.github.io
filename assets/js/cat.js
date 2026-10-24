// Random cat for the home page, redrawn as 1-bit pixel art in the site colors.
//
// A photo comes from cataas.com ("cat as a service"), gets shrunk to a small
// grid, and each pixel becomes either navy or white using Atkinson dithering
// (the technique early Macintosh screens used). The canvas is then shown
// enlarged with crisp, square pixels.

(function () {
  const canvas = document.getElementById('cat-canvas');
  const button = document.getElementById('new-cat');
  if (!canvas) return;

  const GRID = 144;                 // pixels across; smaller = chunkier
  const styles = getComputedStyle(document.documentElement);
  const DARK = hexToRgb(styles.getPropertyValue('--bg').trim() || '#000758');
  const LIGHT = hexToRgb(styles.getPropertyValue('--fg').trim() || '#ffffff');

  function hexToRgb(hex) {
    const n = parseInt(hex.replace('#', ''), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }

  function dither(img) {
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    canvas.width = GRID;
    canvas.height = GRID;

    // Crop the photo to a centered square and shrink it
    const side = Math.min(img.naturalWidth, img.naturalHeight);
    const sx = (img.naturalWidth - side) / 2;
    const sy = (img.naturalHeight - side) / 2;
    ctx.drawImage(img, sx, sy, side, side, 0, 0, GRID, GRID);

    const data = ctx.getImageData(0, 0, GRID, GRID);
    const px = data.data;

    // Brightness of every pixel, stretched so the darkest is 0 and lightest 255
    const lum = new Float32Array(GRID * GRID);
    let lo = 255, hi = 0;
    for (let i = 0; i < lum.length; i++) {
      const v = 0.299 * px[i * 4] + 0.587 * px[i * 4 + 1] + 0.114 * px[i * 4 + 2];
      lum[i] = v;
      if (v < lo) lo = v;
      if (v > hi) hi = v;
    }
    const range = Math.max(1, hi - lo);
    for (let i = 0; i < lum.length; i++) lum[i] = ((lum[i] - lo) / range) * 255;

    // Atkinson dithering: spread 6/8 of each pixel's rounding error to neighbors
    const spread = [[1, 0], [2, 0], [-1, 1], [0, 1], [1, 1], [0, 2]];
    for (let y = 0; y < GRID; y++) {
      for (let x = 0; x < GRID; x++) {
        const i = y * GRID + x;
        const on = lum[i] >= 128;
        const err = (lum[i] - (on ? 255 : 0)) / 8;
        for (const [dx, dy] of spread) {
          const nx = x + dx, ny = y + dy;
          if (nx >= 0 && nx < GRID && ny < GRID) lum[ny * GRID + nx] += err;
        }
        const [r, g, b] = on ? LIGHT : DARK;
        px[i * 4] = r; px[i * 4 + 1] = g; px[i * 4 + 2] = b; px[i * 4 + 3] = 255;
      }
    }
    ctx.putImageData(data, 0, 0);
    canvas.classList.remove('loading');
  }

  function loadCat() {
    canvas.classList.add('loading');
    if (button) button.disabled = true;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try { dither(img); } catch (e) { canvas.classList.remove('loading'); }
      if (button) button.disabled = false;
    };
    img.onerror = () => {
      canvas.classList.remove('loading');
      if (button) button.disabled = false;
    };
    img.src = 'https://cataas.com/cat?type=square&t=' + Date.now();
  }

  if (button) button.addEventListener('click', loadCat);
  loadCat();
})();
