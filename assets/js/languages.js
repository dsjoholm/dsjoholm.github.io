// Language switch for posts written in more than one language
// ({% lang xx %} sections, see _plugins/languages.rb).
//
// Shows one language at a time. Which one, in order of preference:
//   1. ?lang=fr in the address (handy for sharing a specific language)
//   2. the visitor's last choice on this site
//   3. the visitor's browser language
//   4. the post's first language
// Other scripts (the subway line) listen for the "languagechange" event.

(function () {
  const blocks = [...document.querySelectorAll('article .lang-block')];
  const langs = [...new Set(blocks.map((b) => b.lang))];
  if (langs.length < 2) return; // one language: nothing to switch

  const switcher = document.querySelector('.lang-switch');
  const titles = [...document.querySelectorAll('.lang-title')];

  // Each language's name in that language, e.g. "français", "中文"
  function nameOf(code) {
    try {
      const name = new Intl.DisplayNames([code], { type: 'language' }).of(code);
      return name ? name.toLocaleLowerCase(code) : code;
    } catch (e) {
      return code;
    }
  }

  function pick() {
    const fromAddress = new URLSearchParams(location.search).get('lang');
    if (langs.includes(fromAddress)) return fromAddress;
    let saved = null;
    try { saved = localStorage.getItem('lang'); } catch (e) { /* ignore */ }
    if (langs.includes(saved)) return saved;
    for (const pref of navigator.languages || [navigator.language]) {
      const base = String(pref).toLowerCase().split('-')[0];
      if (langs.includes(base)) return base;
    }
    return langs[0];
  }

  const buttons = langs.map((code) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.lang = code;
    b.textContent = '[' + nameOf(code) + ']';
    b.addEventListener('click', () => {
      show(code);
      try { localStorage.setItem('lang', code); } catch (e) { /* ignore */ }
    });
    return b;
  });

  function show(code) {
    blocks.forEach((b) => { b.hidden = b.lang !== code; });
    // the title in this language if there is one, otherwise the main title
    const match = titles.find((t) => t.lang === code);
    titles.forEach((t) => { t.hidden = match ? t !== match : !t.hasAttribute('data-default'); });
    buttons.forEach((b) => b.setAttribute('aria-pressed', String(b.lang === code)));
    document.documentElement.lang = code;
    document.dispatchEvent(new CustomEvent('languagechange', { detail: code }));
  }

  if (switcher) {
    switcher.append(...buttons);
    switcher.hidden = false;
  }
  show(pick());
})();
