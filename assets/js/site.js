// Small enhancements for links inside posts and pages.

// ---------------------------------------------------------------------
// Local time in the "currently" line, 24-hour (e.g. "19:03"), kept up to date
// ---------------------------------------------------------------------
(function () {
  document.querySelectorAll('.local-time').forEach((el) => {
    let format;
    try {
      format = new Intl.DateTimeFormat('en-GB', {
        timeZone: el.dataset.timezone, hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
      });
    } catch (e) {
      el.closest('span').remove(); // unknown time zone: leave the time out
      return;
    }
    const tick = () => {
      const now = format.format(new Date());
      if (el.textContent !== now) el.textContent = now;
    };
    tick();
    setInterval(tick, 1000);
    document.addEventListener('visibilitychange', tick); // catch up after the tab was hidden
  });
})();

// ---------------------------------------------------------------------
// Color picker in the footer: [navy] [blue] [green] ... The choice is
// remembered in this browser and applied on every page (see head.html).
// ---------------------------------------------------------------------
(function () {
  const schemes = window.siteSchemes;
  const buttons = document.querySelectorAll('.scheme-picker button');
  if (!schemes || !buttons.length) return;

  function mark(name) {
    buttons.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.scheme === name)));
  }

  buttons.forEach((button) => {
    button.addEventListener('click', () => {
      const name = button.dataset.scheme;
      schemes.apply(name);
      try {
        if (name === schemes.standard) localStorage.removeItem('scheme');
        else localStorage.setItem('scheme', name);
      } catch (e) { /* private browsing: the choice lasts for this page only */ }
      mark(name);
    });
  });

  mark(schemes.chosen() || schemes.standard);
})();

(function () {
  const article = document.querySelector('article');
  if (!article) return;

  // ---------------------------------------------------------------------
  // Website icons after links that go to other sites
  // ---------------------------------------------------------------------
  article.querySelectorAll('a[href^="http"]').forEach((link) => {
    let url;
    try { url = new URL(link.href); } catch (e) { return; }
    if (url.hostname === location.hostname) return; // same site: no icon
    if (link.querySelector('img')) return;           // image links: no icon

    const icon = document.createElement('img');
    icon.className = 'external-favicon';
    icon.alt = '';
    icon.loading = 'lazy';
    icon.decoding = 'async';
    icon.width = 16;
    icon.height = 16;
    icon.src = 'https://www.google.com/s2/favicons?sz=32&domain=' + url.hostname;
    icon.addEventListener('error', () => icon.remove()); // hide broken icons
    link.appendChild(icon);
  });

  // ---------------------------------------------------------------------
  // Preview box when hovering a link to another page of this site
  // ---------------------------------------------------------------------
  const box = document.getElementById('link-preview');
  if (!box || !window.matchMedia('(hover: hover)').matches) return;

  const cache = new Map();
  let current = null;

  async function loadPreview(href) {
    if (cache.has(href)) return cache.get(href);
    const res = await fetch(href);
    if (!res.ok) throw new Error(res.status);
    const doc = new DOMParser().parseFromString(await res.text(), 'text/html');
    const title = (doc.querySelector('h1') || doc.querySelector('title')).textContent.trim();
    const paragraphs = [...doc.querySelectorAll('article p')]
      .filter((p) => p.textContent.trim().length > 40 && !p.closest('footer, .subtitle'));
    const text = paragraphs.length ? paragraphs[0].textContent.trim() : '';
    const preview = { title, text: text.length > 280 ? text.slice(0, 280).trim() + '…' : text };
    cache.set(href, preview);
    return preview;
  }

  function place(e) {
    const margin = 16;
    const width = box.offsetWidth;
    let left = e.pageX + 12;
    if (left + width > window.scrollX + document.documentElement.clientWidth - margin) {
      left = e.pageX - width - 12;
    }
    box.style.left = Math.max(margin, left) + 'px';
    box.style.top = e.pageY + 16 + 'px';
  }

  article.querySelectorAll('a[href]').forEach((link) => {
    let url;
    try { url = new URL(link.href); } catch (e) { return; }
    if (url.origin !== location.origin) return;              // other sites
    if (url.pathname === location.pathname) return;          // same page / #anchors
    if (url.pathname.startsWith('/tags') || url.searchParams.has('tag')) return; // tag links
    if (/\.(jpe?g|png|gif|pdf|xml)$/i.test(url.pathname)) return;

    link.addEventListener('mouseenter', async (e) => {
      current = link;
      place(e);
      try {
        const { title, text } = await loadPreview(url.pathname);
        if (current !== link) return; // mouse already moved away
        box.replaceChildren();
        const h = document.createElement('h3');
        h.textContent = title;
        box.appendChild(h);
        if (text) {
          const p = document.createElement('p');
          p.textContent = text;
          box.appendChild(p);
        }
        box.classList.add('visible');
      } catch (err) {
        box.classList.remove('visible');
      }
    });

    link.addEventListener('mousemove', place);

    link.addEventListener('mouseleave', () => {
      current = null;
      box.classList.remove('visible');
    });
  });
})();
