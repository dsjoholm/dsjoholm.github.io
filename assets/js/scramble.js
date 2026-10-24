// Text scramble effect: letters flicker through random characters, then
// settle back into the real text from left to right.
//
// - The page title and the top navigation scramble once when a page loads.
// - The top navigation and footer links scramble on hover (or keyboard
//   focus). Links inside posts and pages don't, so they stay easy to click.
// - Nothing happens for visitors who ask their device for reduced motion.

(function () {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const CHARS = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789{}[]|\\^_~<>/=+*';
  const FRAME_MS = 45;          // how often the random letters change
  const originals = new WeakMap(); // text node -> its real text
  const running = new WeakMap();   // element -> animation id

  function randomChar() {
    return CHARS[Math.floor(Math.random() * CHARS.length)];
  }

  function textNodes(el) {
    const nodes = [];
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) {
      if (walker.currentNode.nodeValue.trim()) nodes.push(walker.currentNode);
    }
    return nodes;
  }

  function scramble(el, duration) {
    if (running.has(el)) return;
    const nodes = textNodes(el);
    if (!nodes.length) return;

    nodes.forEach((n) => { if (!originals.has(n)) originals.set(n, n.nodeValue); });
    const total = nodes.reduce((sum, n) => sum + originals.get(n).length, 0);
    const start = performance.now();
    let lastFrame = 0;

    function frame(now) {
      const elapsed = now - start;
      if (elapsed >= duration) {
        nodes.forEach((n) => { n.nodeValue = originals.get(n); });
        running.delete(el);
        return;
      }
      if (now - lastFrame >= FRAME_MS) {
        lastFrame = now;
        const revealed = Math.floor((elapsed / duration) * total);
        let index = 0;
        nodes.forEach((n) => {
          const real = originals.get(n);
          let out = '';
          for (const ch of real) {
            out += (index < revealed || /\s/.test(ch)) ? ch : randomChar();
            index++;
          }
          n.nodeValue = out;
        });
      }
      running.set(el, requestAnimationFrame(frame));
    }

    running.set(el, requestAnimationFrame(frame));
  }

  // Scramble on page load
  document.querySelectorAll('.site-nav a, article h1').forEach((el) => scramble(el, 700));

  // Scramble on hover / keyboard focus
  document.querySelectorAll('.site-nav a, .footer-links a').forEach((link) => {
    const duration = Math.min(700, 250 + link.textContent.length * 15);
    link.addEventListener('mouseenter', () => scramble(link, duration));
    link.addEventListener('focus', () => scramble(link, duration));
  });
})();
