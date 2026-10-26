// Reading progress for posts, drawn as a metro line across the top of the
// screen. The post's title is the first station, each section heading (##)
// is a station along the way, and the end of the post is the terminus. The
// line fills in as you read; click a station to jump to that section.

(function () {
  const article = document.querySelector('article');
  const title = article && article.querySelector('h1');
  if (!title) return;

  const end = article.querySelector('.post-tags') || article.lastElementChild;

  // ---- Build the bar ----------------------------------------------------
  // The line is named after the post's first letter, like a metro line
  const letter = (title.textContent.trim()[0] || '•').toUpperCase();

  const bar = document.createElement('nav');
  bar.className = 'subway';
  bar.setAttribute('aria-label', 'Sections of this post');
  bar.innerHTML =
    '<div class="subway-inner">' +
    '  <span class="subway-bullet" aria-hidden="true">' + letter + '</span>' +
    '  <div class="subway-track"><div class="subway-fill"></div></div>' +
    '  <span class="subway-next"></span>' +
    '</div>';
  document.body.appendChild(bar);

  const track = bar.querySelector('.subway-track');
  const fill = bar.querySelector('.subway-fill');
  const next = bar.querySelector('.subway-next');

  // Stations: the title, each visible section heading (in a multilingual
  // post, only the language being shown), and the end. Rebuilt when the
  // language changes.
  let stations = [];

  function visibleTitle() {
    const spans = [...title.querySelectorAll('.lang-title')];
    const shown = spans.find((s) => !s.hidden);
    return (shown || title).textContent.trim();
  }

  function buildStations() {
    track.querySelectorAll('.subway-stop').forEach((stop) => stop.remove());
    const headings = [...article.querySelectorAll(':scope > h2, :scope > .lang-block > h2')]
      .filter((h) => !h.closest('[hidden]'));
    stations = [
      { name: visibleTitle(), el: title },
      ...headings.map((h) => ({ name: h.textContent.trim(), el: h })),
      { name: 'end of the line', el: end, terminus: true },
    ];
    stations.forEach((station, i) => {
      const stop = document.createElement('button');
      stop.type = 'button';
      stop.className = 'subway-stop' + (i === 0 || station.terminus ? ' terminus' : '');
      stop.title = station.name;
      stop.setAttribute('aria-label', 'Go to: ' + station.name);
      stop.addEventListener('click', () => {
        const top = station.el.getBoundingClientRect().top + window.scrollY - 64;
        window.scrollTo({ top: station.terminus ? document.body.scrollHeight : top, behavior: 'smooth' });
      });
      track.appendChild(stop);
      station.stop = stop;
    });
  }

  buildStations();
  document.addEventListener('languagechange', () => { buildStations(); measure(); });

  // ---- Positions --------------------------------------------------------
  // A station is "reached" when its heading passes 30% down the screen.
  let start = 0;
  let finish = 1;

  function measure() {
    const reachAt = (el) => el.getBoundingClientRect().top + window.scrollY - window.innerHeight * 0.3;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    start = 0;
    finish = Math.max(1, Math.min(maxScroll, reachAt(end)));
    stations.forEach((s, i) => {
      if (i === 0) s.at = 0;
      else if (s.terminus) s.at = 1;
      else s.at = Math.min(1, Math.max(0, (reachAt(s.el) - start) / (finish - start)));
      s.stop.style.left = (s.at * 100) + '%';
    });
    update();
  }

  function update() {
    const progress = Math.min(1, Math.max(0, (window.scrollY - start) / (finish - start)));
    fill.style.width = (progress * 100) + '%';
    let current = 0;
    stations.forEach((s, i) => {
      const passed = s.at <= progress + 0.001;
      s.stop.classList.toggle('passed', passed);
      if (passed) current = i;
    });
    stations.forEach((s, i) => s.stop.classList.toggle('current', i === current));

    const upcoming = stations[current + 1];
    next.textContent = upcoming ? 'next stop: ' + upcoming.name : 'end of the line';

    // Only show the bar once the title has scrolled out of view
    bar.classList.toggle('visible', title.getBoundingClientRect().bottom < 0);
  }

  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', measure);
  window.addEventListener('load', measure);
  // Images loading further down change where sections are
  if ('ResizeObserver' in window) new ResizeObserver(measure).observe(article);
  measure();
})();
