// Bookshelf: finds covers that aren't saved in the site, and sorts the shelf.

(function () {
  const shelf = document.getElementById('shelf');
  if (!shelf) return;

  // ---------------------------------------------------------------------
  // Covers. Order of attempts for each book:
  //   1. the "cover" from books.yml, if there is one
  //   2. Open Library search by ISBN
  //   3. Open Library search by title and author
  //   4. a plain text card with the title (shown if all else fails)
  // Searching (rather than asking for a cover by ISBN directly) means we
  // only ever show a cover Open Library has actually matched to the book.
  // ---------------------------------------------------------------------
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

  async function findCover(book, isbn) {
    const title = book.dataset.title.split(':')[0]; // main title, without subtitle
    const author = book.dataset.author;
    try {
      if (isbn) {
        const byIsbn = await searchCover({ isbn }, title, author);
        if (byIsbn) return byIsbn;
      }
      return await searchCover({ title, author }, title, author);
    } catch (e) {
      return null;
    }
  }

  shelf.querySelectorAll('.book').forEach((book) => {
    const img = book.querySelector('img');
    const cover = book.querySelector('.book-cover');
    let searched = false;

    function loaded() {
      if (img.naturalWidth > 10) cover.classList.add('loaded'); // skip 1×1 placeholders
      else fallBack();
    }

    async function fallBack() {
      if (searched) { cover.classList.add('no-image'); return; }
      searched = true;
      const url = await findCover(book, img.dataset.isbn);
      if (url) img.src = url;
      else cover.classList.add('no-image');
    }

    img.addEventListener('load', loaded);
    img.addEventListener('error', fallBack);
    if (!img.getAttribute('src')) fallBack();
    else if (img.complete) img.naturalWidth ? loaded() : fallBack();
  });

  // ---------------------------------------------------------------------
  // Sorting
  // ---------------------------------------------------------------------
  const select = document.getElementById('shelf-sort');
  if (!select) return;

  function lastName(name) {
    const parts = name.trim().split(/\s+/);
    return parts[parts.length - 1];
  }

  function stripArticle(title) {
    return title.replace(/^(the|a|an)\s+/i, '');
  }

  select.addEventListener('change', () => {
    const books = [...shelf.children];
    const by = select.value;
    books.sort((a, b) => {
      if (by === 'title') {
        return stripArticle(a.dataset.title).localeCompare(stripArticle(b.dataset.title));
      }
      if (by === 'author') {
        return lastName(a.dataset.author).localeCompare(lastName(b.dataset.author));
      }
      return b.dataset.finished.localeCompare(a.dataset.finished); // newest first
    });
    books.forEach((book) => shelf.appendChild(book));
  });
})();
