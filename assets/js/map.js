// Interactive maps in posts ({% include map.html %}, see _includes/map.html).
//
// Made to behave on phones: one finger scrolls the page as usual (a hint
// says to use two fingers), two fingers move and zoom the map. On a
// computer, the scroll wheel only zooms after you've clicked the map.

(function () {
  if (!window.L) return;
  const touch = window.matchMedia('(pointer: coarse)').matches;

  document.querySelectorAll('.post-map').forEach((el) => {
    let places = [];
    try { places = JSON.parse(el.dataset.places) || []; } catch (e) { return; }
    places = places.filter((p) => Array.isArray(p.coords) && p.coords.length === 2);
    if (!places.length) return;

    const map = L.map(el, {
      dragging: !touch,        // phones: two-finger pinch moves and zooms
      scrollWheelZoom: false,  // computers: turned on by clicking the map
      zoomSnap: 0.5,
      attributionControl: true,
    });
    map.attributionControl.setPrefix(false);

    // OpenStreetMap's street map; CSS darkens it and tints it in the
    // current color scheme
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    const escape = (s) => String(s == null ? '' : s).replace(/[&<>"]/g,
      (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

    const markers = places.map((p) => {
      const icon = L.divIcon({
        className: 'map-pin' + (p.main ? ' map-pin-main' : ''),
        html: '<span></span>',
        iconSize: [32, 32],   // a big target for fingers; the square drawn is smaller
      });
      const directions = 'https://www.google.com/maps/search/?api=1&query=' + p.coords.join(',');
      return L.marker(p.coords, { icon, title: p.name, riseOnHover: true })
        .bindPopup(
          '<strong>' + escape(p.name) + '</strong>' +
          (p.text ? '<span>' + escape(p.text) + '</span>' : '') +
          '<a href="' + directions + '" target="_blank" rel="noopener">[open in maps]</a>',
          { maxWidth: 240, autoPanPadding: [16, 16] })
        .addTo(map);
    });

    // A light map for light color schemes (paper), a dark one otherwise;
    // updated when the visitor picks other colors
    const shade = () => {
      const bg = getComputedStyle(document.documentElement).getPropertyValue('--bg').trim();
      const [r, g, b] = (bg.match(/[0-9a-f]{2}/gi) || ['00', '00', '00']).map((h) => parseInt(h, 16));
      el.classList.toggle('map-light', 0.299 * r + 0.587 * g + 0.114 * b > 140);
    };
    shade();
    new MutationObserver(shade).observe(document.documentElement, { attributes: true, attributeFilter: ['style'] });

    const bounds = L.featureGroup(markers).getBounds();
    const showAll = () => map.fitBounds(bounds, {
      paddingTopLeft: [56, 56], paddingBottomRight: [36, 36], maxZoom: 16, // clear of the buttons
    });
    showAll();

    // [all] button: back to the view of every place
    const All = L.Control.extend({
      onAdd() {
        const b = L.DomUtil.create('button', 'map-all');
        b.type = 'button';
        b.textContent = '[all]';
        b.title = 'Show all places';
        L.DomEvent.disableClickPropagation(b);
        b.addEventListener('click', () => { map.closePopup(); showAll(); });
        return b;
      },
    });
    new All({ position: 'topright' }).addTo(map);

    if (touch) {
      // One finger sliding over the map scrolls the page; say how to move it
      const hint = el.querySelector('.map-hint');
      let timer;
      el.addEventListener('touchmove', (e) => {
        if (e.touches.length !== 1) return;
        hint.classList.add('show');
        clearTimeout(timer);
        timer = setTimeout(() => hint.classList.remove('show'), 1200);
      }, { passive: true });
      el.addEventListener('touchstart', (e) => {
        if (e.touches.length > 1) hint.classList.remove('show');
      }, { passive: true });
    } else {
      map.on('click focus', () => map.scrollWheelZoom.enable());
      el.addEventListener('mouseleave', () => map.scrollWheelZoom.disable());
    }
  });
})();
