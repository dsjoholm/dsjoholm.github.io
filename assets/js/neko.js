// Neko: a small pixel cat that runs to your mouse pointer, sits down next
// to it, and falls asleep if you leave it alone. Inspired by the 1980s
// desktop toy "Neko" (and oneko.js), drawn to match the site's pixel cat.
//
// - Turned off on touch screens and for visitors who ask for reduced motion.
// - The [hide cat] button in the footer turns it off or on (remembered).
// - About 1 visit in 8, it's a nyan cat with a rainbow trail instead.
// - On holidays it wears a hat and/or has a holiday item next to it.
//
// For testing, add to any address:  ?nyan=1  (or 0)  and/or  ?date=2026-12-07

(function () {
  const touchOnly = !window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const toggle = document.getElementById('neko-toggle');
  if (touchOnly || reducedMotion) return; // the toggle stays hidden too

  const params = new URLSearchParams(location.search);

  // ---- Colors (one letter per pixel in the drawings below) ----------------
  const PALETTE = {
    o: '#2b2233', // outline
    w: '#fffaf2', // white fur
    c: '#f2b366', // orange calico patch
    p: '#f7a8b8', // pink
    k: '#2b2233', // eyes
    T: '#f2c38b', // pop-tart crust
    q: '#ff9ad5', // pop-tart frosting
    R: '#ff3d8b', // sprinkles
    r: '#e63946', // red
    y: '#ffd23f', // yellow
    b: '#3a86ff', // blue
    g: '#2fb344', // green
    n: '#8b5a2b', // brown
    O: '#ff8c1a', // pumpkin orange
    W: '#ffffff', // white
    K: '#1b1b1b', // black
    G: '#e0b100', // gold
    f: '#ffb703', // candle flame
    m: '#e8c27a', // matzah
  };

  // ---- The cat (16×16) ------------------------------------------------------
  const HEAD = [
    '.o............o.',
    '.oco........opo.',
    '.occooooooooppo.',
    '.occwwwwwwwwwwo.',
    'owccwwwwwwwwwwwo',
    'owcwwwwwwwwwwwwo',
  ];
  const HEAD_BACK = HEAD.map((row, i) => (i ? row.replace(/[cp]/g, 'w') : row));
  const EYES = {
    open:  ['owwkkwwwwwwkkwwo', 'owwkkwwwwwwkkwwo'],
    happy: ['owwkkwwwwwwkkwwo', 'owkwwkwwwwkwwkwo'],
    sleep: ['owwwwwwwwwwwwwwo', 'owkkkwwwwwwkkkwo'],
    back:  ['owwwwwwwwwwwwwwo', 'owwwwwwwwwwwwwwo'],
  };
  const CHEEKS = 'owppwwwoowwwppwo';
  const NO_CHEEKS = 'owwwwwwwwwwwwwwo';
  const BODY = [
    '.owwwwwwwwwwwwo.',
    '..oowwwwwwwwoo..',
    '..owwwwwwwwwwo.o',
    '..owwwwwwwwwwoco',
  ];
  const LEGS = {
    sit: ['..owwowwwwowwoo.', '...oooo..oooo...'],
    a:   ['..owwo....owwo..', '...oo......oo...'],
    b:   ['...owwo..owwo...', '....oo....oo....'],
  };
  const front = (eyes, legs) => ['................', ...HEAD, ...EYES[eyes], CHEEKS, ...BODY, ...LEGS[legs]];
  const back = (legs) => ['................', ...HEAD_BACK, ...EYES.back, NO_CHEEKS, ...BODY, ...LEGS[legs]];
  const SIDE_A = [
    '........o....o..',
    '.......oco..opo.',
    '.......occoopppo',
    '.......occwwwwo.',
    '......owcwwwwwwo',
    '......owwwwwwwwo',
    '......owwwwwkkwo',
    '......owwwwwkkwo',
    '......owwwppwwoo',
    '.o....owwwwwwwo.',
    '.oooooowwwwwwo..',
    '..owwwwwwwwwwo..',
    '..owwwwwwwwwo...',
    '..owwwwwwwwwo...',
    '..owo....owo....',
    '..oo.....oo.....',
  ];
  const SIDE_B = [...SIDE_A.slice(0, 14), '.owo......owo...', 'oo..........oo..'];

  // Nyan: the side-view cat with a pop-tart for a body
  const POPTART = [
    '.TTTTTTTTT.',
    'TqqqqqqqqqT',
    'TqRqqqRqqqT',
    'TqqqqqqqRqT',
    'TqqRqqqqqqT',
    'TqqqqqRqqqT',
    'TqRqqqqqqqT',
    '.TTTTTTTTT.',
  ];
  function nyan(side, sleepy) {
    const rows = side.map((row) => [...row]);
    POPTART.forEach((line, dy) => {
      [...line].forEach((ch, dx) => { if (ch !== '.') rows[6 + dy][dx] = ch; });
    });
    side.forEach((line, y) => {   // head back on top of the pop-tart
      if (y > 9) return;
      [...line].forEach((ch, x) => { if (x >= 6 && ch !== '.') rows[y][x] = ch; });
    });
    if (sleepy) { rows[6][12] = rows[6][13] = 'w'; }
    return rows.map((r) => r.join(''));
  }

  const DRAWINGS = {
    sit: front('open', 'sit'),
    happy: front('happy', 'sit'),
    sleep: front('sleep', 'sit'),
    downA: front('open', 'a'),
    downB: front('open', 'b'),
    upA: back('a'),
    upB: back('b'),
    sideA: SIDE_A,
    sideB: SIDE_B,
    nyanA: nyan(SIDE_A),
    nyanB: nyan(SIDE_B),
    nyanSleep: nyan(SIDE_A, true),
  };

  // ---- Holiday hats and items -----------------------------------------------
  const HATS = {
    party:  ['..y..', '..r..', '.rbr.', '.brb.', 'rbrbr'],               // birthday
    topHat: ['.KKKK.', '.KKKK.', '.GGGG.', '.KKKK.', 'KKKKKK'],          // New Year
    crown:  ['G.G.G', 'GGGGG', 'GrGbG'],                                  // Purim (Queen Esther)
    kippah: ['.bWWb.', 'bWbbWb'],                                         // Yom Kippur (knitted)
    sprout: ['gg.gg', '.g.g.', '..n..', '..n..'],                         // Tu B'Shevat
  };
  const ITEMS = {
    pumpkin: ['..g...', '.OOOO.', 'OKOOKO', 'OOOOOO', 'OKKKKO', '.OOOO.'],
    flag:    ['nbbrrrr', 'nbbWWWW', 'nrrrrrr', 'nWWWWWW', 'n......', 'n......', 'n......'],
    pie:     ['..y.y..', '.nnnnn.', 'nyyyyyn', 'nnnnnnn'],
    apple:   ['..gn.', '.rrr.', 'rrrrr', 'rrrrr', '.rrr.', '.yyy.', 'yGGGy'],
    lulav:   ['.g...', '.g...', '.g...', '.g...', '.gyy.', '.gyyy', '.g.yy', '.n...'],
    matzah:  ['mmmmmm', 'mnmnmm', 'mmmmmm', 'mmnmnm', 'mmmmmm'],
    menorah: (night) => {
      const flames = [...'.........'].map((_, i) => {
        if (i === 4) return 'W';              // the taller middle candle (shamash)
        const order = i < 4 ? i : i - 1;      // candles left to right
        return order >= 8 - night ? 'f' : '.';
      }).join('');
      return ['....f....', flames, 'WWWWGWWWW', 'GGGGGGGGG', '....G....', '..GGGGG..'];
    },
  };

  // ---- Which holiday is it? -------------------------------------------------
  const today = (() => {
    const forced = params.get('date');
    const d = forced ? new Date(forced + 'T12:00:00') : new Date();
    return isNaN(d) ? new Date() : d;
  })();

  const hebrewFormat = new Intl.DateTimeFormat('en-u-ca-hebrew', { month: 'long', day: 'numeric' });
  function hebrew(date) {
    const parts = hebrewFormat.formatToParts(date);
    return {
      month: parts.find((p) => p.type === 'month').value,
      day: Number(parts.find((p) => p.type === 'day').value),
    };
  }

  // Day number (1, 2, ...) if today falls in a Hebrew-calendar holiday that
  // starts on month/day and lasts `length` days; otherwise 0. (Dates follow
  // the daytime calendar; the evening the holiday begins isn't counted.)
  function hebrewHoliday(months, day, length) {
    for (let i = 0; i < length; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const h = hebrew(d);
      if (months.includes(h.month) && h.day === day) return i + 1;
    }
    return 0;
  }

  const md = (month, day) => today.getMonth() + 1 === month && today.getDate() === day;

  // Listed in priority order: when two holidays want the same spot (hat or
  // item) on the same day, the first one wins. Hat + item can both show.
  const HOLIDAYS = [
    { name: 'birthday',        hat: 'party',   on: () => md(3, 15) },
    { name: 'new year',        hat: 'topHat',  on: () => md(1, 1) },
    { name: 'rosh hashanah',   item: 'apple',  on: () => hebrewHoliday(['Tishri'], 1, 2) },
    { name: 'yom kippur',      hat: 'kippah',  on: () => hebrewHoliday(['Tishri'], 10, 1) },
    { name: 'sukkot',          item: 'lulav',  on: () => hebrewHoliday(['Tishri'], 15, 7) },
    { name: 'hanukkah',        item: 'menorah', on: () => hebrewHoliday(['Kislev'], 25, 8) },
    { name: "tu b'shevat",     hat: 'sprout',  on: () => hebrewHoliday(['Shevat'], 15, 1) },
    { name: 'purim',           hat: 'crown',   on: () => hebrewHoliday(['Adar', 'Adar II'], 14, 1) },
    { name: 'passover',        item: 'matzah', on: () => hebrewHoliday(['Nisan'], 15, 8) },
    { name: 'pi day',          item: 'pie',    on: () => md(3, 14) },
    { name: 'fourth of july',  item: 'flag',   on: () => md(7, 4) },
    { name: 'halloween',       item: 'pumpkin', on: () => today.getMonth() === 9 && today.getDate() >= 24 },
  ];

  const outfit = { hat: null, item: null, names: [] };
  HOLIDAYS.forEach((h) => {
    const day = h.on();
    if (!day) return;
    if (h.hat && !outfit.hat) { outfit.hat = HATS[h.hat]; outfit.names.push(h.name); }
    if (h.item && !outfit.item) {
      outfit.item = h.item === 'menorah' ? ITEMS.menorah(day) : ITEMS[h.item];
      outfit.names.push(h.name);
    }
  });
  window.nekoOutfit = outfit.names; // handy for checking: which holidays are on

  // ---- Nyan, about 1 visit in 8 (decided once per visit) --------------------
  const isNyan = (() => {
    if (params.has('nyan')) return params.get('nyan') !== '0';
    try {
      let roll = sessionStorage.getItem('neko-nyan');
      if (roll === null) {
        roll = Math.random() < 0.125 ? '1' : '0';
        sessionStorage.setItem('neko-nyan', roll);
      }
      return roll === '1';
    } catch (e) {
      return Math.random() < 0.125;
    }
  })();

  // ---- Painting -------------------------------------------------------------
  // The canvas has room above the cat for a hat and to its right for an item.
  const SCALE = 2;
  const HEADROOM = 4;           // rows above the cat
  const COLS = 26;              // 16 for the cat + 10 for an item
  const ROWS = 16 + HEADROOM;
  const W = COLS * SCALE;
  const H = ROWS * SCALE;

  function stamp(ctx, rows, left, top, mirror) {
    rows.forEach((row, y) => {
      [...row].forEach((ch, x) => {
        const color = PALETTE[ch];
        if (!color) return;
        const px = mirror ? left + (row.length - 1 - x) : left + x;
        ctx.fillStyle = color;
        ctx.fillRect(px * SCALE, (top + y) * SCALE, SCALE, SCALE);
      });
    });
  }

  // Where the hat sits: centered on the head, resting on its top outline
  const HAT_SPOT = {
    front: { x: 8, y: 3 },
    right: { x: 11, y: 2 },
    left:  { x: 5, y: 2 },
  };

  const cache = {};
  function sprite(drawing, facing, withItem) {
    const key = drawing + facing + withItem;
    if (cache[key]) return cache[key];
    const c = document.createElement('canvas');
    c.width = W;
    c.height = H;
    const ctx = c.getContext('2d');
    stamp(ctx, DRAWINGS[drawing], 0, HEADROOM, facing === 'left');
    if (outfit.hat && facing !== 'back') {
      const spot = HAT_SPOT[facing];
      const hat = outfit.hat;
      stamp(ctx, hat, spot.x - Math.floor(hat[0].length / 2), HEADROOM + spot.y - hat.length + 1, false);
    }
    if (withItem && outfit.item) {
      stamp(ctx, outfit.item, 17, ROWS - outfit.item.length, false);
    }
    return (cache[key] = c);
  }

  // ---- On / off -------------------------------------------------------------
  const KEY = 'neko';
  const isOn = () => { try { return localStorage.getItem(KEY) !== 'off'; } catch (e) { return true; } };

  if (toggle) {
    toggle.hidden = false;
    const label = () => { toggle.textContent = isOn() ? '[hide cat]' : '[show cat]'; };
    label();
    toggle.addEventListener('click', () => {
      try { localStorage.setItem(KEY, isOn() ? 'off' : 'on'); } catch (e) { /* ignore */ }
      label();
      isOn() ? start() : stop();
    });
  }

  // ---- The cat on the page --------------------------------------------------
  const canvas = document.createElement('canvas');
  canvas.className = 'neko';
  canvas.width = W;
  canvas.height = H;
  canvas.style.width = W + 'px';
  canvas.style.height = H + 'px';
  canvas.setAttribute('aria-hidden', 'true');
  const ctx = canvas.getContext('2d');

  const zzz = document.createElement('span');
  zzz.className = 'neko-z';
  zzz.setAttribute('aria-hidden', 'true');

  // Nyan's rainbow, drawn on a see-through layer covering the window
  const trail = document.createElement('canvas');
  trail.className = 'neko-trail';
  trail.setAttribute('aria-hidden', 'true');
  const tctx = trail.getContext('2d');
  const RAINBOW = ['#ff0000', '#ff9900', '#ffee00', '#33dd00', '#0099ff', '#6633ff'];
  const points = [];            // where the rainbow has been
  const MAX_POINTS = 40;

  const SPEED = 10;             // pixels per step
  const STEP_MS = 100;
  const NEAR = 28;              // stops this far from the pointer

  let saved = null;
  try { saved = JSON.parse(sessionStorage.getItem('neko-pos')); } catch (e) { /* ignore */ }
  let x = saved ? saved.x : 48;
  let y = saved ? saved.y : window.innerHeight - 48;
  let target = null;
  let idle = saved ? saved.idle : 0;
  let facing = 'right';         // nyan only flies sideways
  let frame = 0;
  let timer = null;

  function show(drawing, face, withItem) {
    ctx.clearRect(0, 0, W, H);
    ctx.drawImage(sprite(drawing, face, withItem), 0, 0);
  }

  function place() {
    x = Math.min(Math.max(x, 16), window.innerWidth - 16);
    y = Math.min(Math.max(y, 16), window.innerHeight - 16);
    canvas.style.left = (x - 16) + 'px';
    canvas.style.top = (y - 16 - HEADROOM * SCALE) + 'px';
    zzz.style.left = (x + 12) + 'px';
    zzz.style.top = (y - 26 - (outfit.hat ? 8 : 0)) + 'px';
  }

  function drawTrail() {
    if (trail.width !== window.innerWidth || trail.height !== window.innerHeight) {
      trail.width = window.innerWidth;
      trail.height = window.innerHeight;
    }
    tctx.clearRect(0, 0, trail.width, trail.height);
    points.forEach((p, i) => {
      const wave = (i + frame) % 4 < 2 ? 0 : 2;          // the classic wobble
      RAINBOW.forEach((color, s) => {
        tctx.fillStyle = color;
        tctx.fillRect(p.x - 5, p.y - 9 + s * 3 + wave, 11, 3);
      });
    });
  }

  // ---- Walking around maps instead of over them ---------------------------
  const PAD = 30;               // how far from a map's edge the cat walks

  // Does the line from a to b pass through the box r?
  function crosses(ax, ay, bx, by, r) {
    const p = [ax - bx, bx - ax, ay - by, by - ay];
    const q = [ax - r.left, r.right - ax, ay - r.top, r.bottom - ay];
    let t0 = 0, t1 = 1;
    for (let i = 0; i < 4; i++) {
      if (p[i] === 0) { if (q[i] <= 0) return false; continue; }
      const t = q[i] / p[i];
      if (p[i] < 0) { if (t > t1) return false; if (t > t0) t0 = t; }
      else { if (t < t0) return false; if (t < t1) t1 = t; }
    }
    return t0 < t1;
  }

  // If the way to the goal crosses a map, the corner of the map to walk to
  // first (the one making the shortest trip); otherwise null
  function detour(goal) {
    for (const map of document.querySelectorAll('.post-map')) {
      const b = map.getBoundingClientRect();
      const r = { left: b.left - PAD + 1, right: b.right + PAD - 1, top: b.top - PAD + 1, bottom: b.bottom + PAD - 1 };
      if (x > r.left && x < r.right && y > r.top && y < r.bottom) continue; // on it already: just leave
      if (!crosses(x, y, goal.x, goal.y, r)) continue;
      const len = (a, c) => Math.hypot(c.x - a.x, c.y - a.y);
      const corners = [[b.left - PAD, b.top - PAD], [b.right + PAD, b.top - PAD],
        [b.left - PAD, b.bottom + PAD], [b.right + PAD, b.bottom + PAD]]
        .map(([cx, cy]) => ({ x: cx, y: cy }))
        .filter((c) => c.x >= 16 && c.x <= window.innerWidth - 16 && c.y >= 16 && c.y <= window.innerHeight - 16);
      const clear = (a, c) => !crosses(a.x, a.y, c.x, c.y, r);
      // the rest of the trip from corner c: straight on, or via a second corner
      const onward = (c) => (clear(c, goal) ? len(c, goal) : Math.min(Infinity,
        ...corners.filter((d) => d !== c && clear(c, d) && clear(d, goal)).map((d) => len(c, d) + len(d, goal))));
      const me = { x, y };
      let best = null;
      let cost = Infinity;
      corners.forEach((c) => {
        if (len(me, c) < 1 || !clear(me, c)) return;
        const total = len(me, c) + onward(c);
        if (total < cost) { cost = total; best = c; }
      });
      return best;
    }
    return null;
  }

  function step() {
    frame++;
    const corner = target && detour(target);
    const goal = corner || target;
    const stopAt = corner ? 0 : NEAR;   // walk right up to a corner, then on
    const dx = goal ? goal.x - x : 0;
    const dy = goal ? goal.y - y : 0;
    const dist = Math.hypot(dx, dy);

    if (dist > stopAt) {
      idle = 0;
      zzz.hidden = true;
      const move = corner ? Math.min(SPEED * 1.8, dist)   // trots around maps
        : Math.min(SPEED, dist - NEAR + 1);
      x += (dx / dist) * move;
      y += (dy / dist) * move;
      const ab = frame % 2 ? 'A' : 'B';
      if (Math.abs(dx) > 2) facing = dx > 0 ? 'right' : 'left';

      if (isNyan) {
        show('nyan' + ab, facing, false);
        points.push({ x: x + (facing === 'right' ? -14 : 14), y: y + 4 });
        if (points.length > MAX_POINTS) points.shift();
      } else if (Math.abs(dx) > Math.abs(dy)) {
        show('side' + ab, facing, false);
      } else {
        show((dy > 0 ? 'down' : 'up') + ab, dy > 0 ? 'front' : 'back', false);
      }
      place();
      if (isNyan) drawTrail();
      return;
    }

    // Close enough: sit, blink happily now and then, then nap
    idle++;
    if (isNyan) {
      if (points.length) { points.shift(); drawTrail(); }   // rainbow fades away
      show(idle > 80 ? 'nyanSleep' : 'nyan' + (frame % 4 < 2 ? 'A' : 'B'), facing, true);
    } else if (idle > 80) {
      show('sleep', 'front', true);
    } else if (idle > 20 && idle % 25 < 3) {
      show('happy', 'front', true);
    } else {
      show('sit', 'front', true);
    }
    if (idle > 80) {
      zzz.hidden = false;
      zzz.textContent = frame % 10 < 5 ? 'z' : 'zZ';
    }
  }

  // Over a map, wait just outside its nearest edge instead of walking on it
  function onMove(e) {
    target = { x: e.clientX, y: e.clientY };
    const map = e.target.closest && e.target.closest('.post-map');
    if (!map) return;
    const r = map.getBoundingClientRect();
    const out = NEAR + 22;
    const edges = [
      { d: e.clientX - r.left, x: r.left - out, y: e.clientY },
      { d: r.right - e.clientX, x: r.right + out, y: e.clientY },
      { d: e.clientY - r.top, x: e.clientX, y: r.top - out },
      { d: r.bottom - e.clientY, x: e.clientX, y: r.bottom + out },
    ];
    const fits = (p) => p.x >= 16 && p.x <= window.innerWidth - 16 &&
      p.y >= 16 && p.y <= window.innerHeight - 16;     // room on that side
    const choices = edges.filter(fits).length ? edges.filter(fits) : edges;
    const nearest = choices.reduce((a, b) => (b.d < a.d ? b : a));
    target = { x: nearest.x, y: nearest.y };
  }

  function save() {
    try { sessionStorage.setItem('neko-pos', JSON.stringify({ x, y, idle })); } catch (e) { /* ignore */ }
  }

  function start() {
    if (timer) return;
    document.body.append(trail, canvas, zzz);
    zzz.hidden = true;
    place();
    if (isNyan) show(idle > 80 ? 'nyanSleep' : 'nyanA', facing, true);
    else show(idle > 80 ? 'sleep' : 'sit', 'front', true);
    document.addEventListener('mousemove', onMove);
    timer = setInterval(step, STEP_MS);
  }

  function stop() {
    clearInterval(timer);
    timer = null;
    document.removeEventListener('mousemove', onMove);
    points.length = 0;
    canvas.remove();
    zzz.remove();
    trail.remove();
  }

  window.addEventListener('pagehide', save);
  window.addEventListener('resize', place);
  if (isOn()) start();
})();
