// Bookshelf: finds covers that aren't saved in the site.
// (Books are sorted newest-first by Jekyll when the site is built.)

(function () {
  const shelf = document.getElementById('shelf');
  if (!shelf) return;

  // ---------------------------------------------------------------------
  // Covers. Order of attempts for each book:
  //   1. the "cover" from books.yml, if there is one
  //   2. Amazon's cover image for the ISBN (exact match, good quality)
  //   3. Open Library search by ISBN
  //   4. Open Library search by title and author
  //   5. a plain text card with the title (shown if all else fails)
  // Open Library is searched (rather than asked for a cover by ISBN) so we
  // only ever show a cover it has actually matched to the book.
  // ---------------------------------------------------------------------

  // Amazon files covers under the 10-digit ISBN; convert 13-digit "978…"
  // ISBNs (newer "979…" ones have no 10-digit form, so they're skipped).
  function isbn10(isbn) {
    const digits = String(isbn || '').replace(/[^0-9X]/gi, '').toUpperCase();
    if (digits.length === 10) return digits;
    if (digits.length !== 13 || !digits.startsWith('978')) return null;
    const core = digits.slice(3, 12);
    const sum = [...core].reduce((s, d, i) => s + (10 - i) * Number(d), 0);
    const check = (11 - (sum % 11)) % 11;
    return core + (check === 10 ? 'X' : String(check));
  }

  function amazonCover(isbn) {
    const id = isbn10(isbn);
    return id ? 'https://m.media-amazon.com/images/P/' + id + '.01.L.jpg' : null;
  }
  function normalize(text) {
    return text.toLowerCase().normalize('NFD').replace(/[^a-z0-9 ]/g, '').replace(/\s+/g, ' ').trim();
  }

  // Open Library's search is fuzzy, so only trust a result whose title and
  // author actually match the book; a wrong cover is worse than none.
  function matches(doc, title, author) {
    const want = normalize(title);
    const got = normalize(doc.title || '');
    const lastName = normalize(author).split(' ').pop();
    const authors = (doc.author_name || []).map(normalize).join(' ');
    return (got.startsWith(want) || want.startsWith(got)) && authors.includes(lastName);
  }

  async function searchCover(params, title, author) {
    const q = new URLSearchParams({ ...params, fields: 'title,author_name,cover_i', limit: '10' });
    const res = await fetch('https://openlibrary.org/search.json?' + q);
    if (!res.ok) return null;
    const data = await res.json();
    const hit = (data.docs || []).find((d) => d.cover_i && matches(d, title, author));
    return hit ? 'https://covers.openlibrary.org/b/id/' + hit.cover_i + '-L.jpg' : null;
  }

  shelf.querySelectorAll('.book').forEach((book) => {
    const img = book.querySelector('img');
    const cover = book.querySelector('.book-cover');
    const isbn = img.dataset.isbn;
    const title = book.dataset.title.split(':')[0]; // main title, without subtitle
    const author = book.dataset.author;

    // Each step returns an image address to try, or null to skip it
    const steps = [
      async () => amazonCover(isbn),
      async () => (isbn ? searchCover({ isbn }, title, author) : null),
      async () => searchCover({ title, author }, title, author),
    ];

    function loaded() {
      // Amazon and others send a tiny 1×1 image when they have no cover
      if (img.naturalWidth > 10) cover.classList.add('loaded');
      else fallBack();
    }

    async function fallBack() {
      while (steps.length) {
        let url = null;
        try { url = await steps.shift()(); } catch (e) { /* try the next step */ }
        if (url) { img.src = url; return; }
      }
      cover.classList.add('no-image');
    }

    img.addEventListener('load', loaded);
    img.addEventListener('error', fallBack);
    if (!img.getAttribute('src')) fallBack();
    else if (img.complete) img.naturalWidth ? loaded() : fallBack();
  });
})();
