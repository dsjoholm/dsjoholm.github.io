// Neko: a small pixel cat that runs to your mouse pointer, sits down next
// to it, and falls asleep if you leave it alone. Inspired by the 1980s
// desktop toy "Neko" (and oneko.js), drawn to match the site's pixel cat.
//
// - Turned off on touch screens and for visitors who ask for reduced motion.
// - The [cat] button in the footer turns it off or on (remembered per visitor).

(function () {
  const touchOnly = !window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const toggle = document.getElementById('neko-toggle');
  if (touchOnly || reducedMotion) return; // the toggle stays hidden too

  // ---- Drawings (16×16; one letter per pixel) ---------------------------
  // o outline · w white fur · c orange calico patch · p pink · k eyes
  const PALETTE = { o: '#2b2233', w: '#fffaf2', c: '#f2b366', p: '#f7a8b8', k: '#2b2233' };

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

  const DRAWINGS = {
    sit: front('open', 'sit'),
    happy: front('happy', 'sit'),
    sleep: front('sleep', 'sit'),
    downA: front('open', 'a'),
    downB: front('open', 'b'),
    upA: back('a'),
    upB: back('b'),
    rightA: SIDE_A,
    rightB: SIDE_B,
  };

  const SCALE = 2;             // each drawing pixel is 2×2 screen pixels
  const SIZE = 16 * SCALE;

  function paint(rows, mirror) {
    const c = document.createElement('canvas');
    c.width = c.height = SIZE;
    const ctx = c.getContext('2d');
    rows.forEach((row, y) => {
      [...row].forEach((ch, x) => {
        if (!PALETTE[ch]) return;
        ctx.fillStyle = PALETTE[ch];
        const px = mirror ? 15 - x : x;
        ctx.fillRect(px * SCALE, y * SCALE, SCALE, SCALE);
      });
    });
    return c;
  }

  const SPRITES = {};
  Object.entries(DRAWINGS).forEach(([name, rows]) => { SPRITES[name] = paint(rows, false); });
  SPRITES.leftA = paint(SIDE_A, true);
  SPRITES.leftB = paint(SIDE_B, true);

  // ---- On / off -----------------------------------------------------------
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

  // ---- The cat ------------------------------------------------------------
  const canvas = document.createElement('canvas');
  canvas.className = 'neko';
  canvas.width = canvas.height = SIZE;
  canvas.setAttribute('aria-hidden', 'true');
  const ctx = canvas.getContext('2d');

  const zzz = document.createElement('span');
  zzz.className = 'neko-z';
  zzz.setAttribute('aria-hidden', 'true');

  const SPEED = 10;            // pixels per step
  const STEP_MS = 100;
  const NEAR = 28;             // stops this far from the pointer

  // Where the cat was on the previous page, so it doesn't jump around
  let saved = null;
  try { saved = JSON.parse(sessionStorage.getItem('neko-pos')); } catch (e) { /* ignore */ }
  let x = saved ? saved.x : 48;
  let y = saved ? saved.y : window.innerHeight - 48;
  let target = null;           // the pointer; null until it first moves
  let idle = saved ? saved.idle : 0;
  let frame = 0;
  let timer = null;

  function show(name) {
    ctx.clearRect(0, 0, SIZE, SIZE);
    ctx.drawImage(SPRITES[name], 0, 0);
  }

  function place() {
    x = Math.min(Math.max(x, SIZE / 2), window.innerWidth - SIZE / 2);
    y = Math.min(Math.max(y, SIZE / 2), window.innerHeight - SIZE / 2);
    canvas.style.left = (x - SIZE / 2) + 'px';
    canvas.style.top = (y - SIZE / 2) + 'px';
    zzz.style.left = (x + SIZE / 2 - 4) + 'px';
    zzz.style.top = (y - SIZE / 2 - 10) + 'px';
  }

  function step() {
    frame++;
    const dx = target ? target.x - x : 0;
    const dy = target ? target.y - y : 0;
    const dist = Math.hypot(dx, dy);

    if (dist > NEAR) {
      // Run toward the pointer
      idle = 0;
      zzz.hidden = true;
      const move = Math.min(SPEED, dist - NEAR + 1);
      x += (dx / dist) * move;
      y += (dy / dist) * move;
      const ab = frame % 2 ? 'A' : 'B';
      if (Math.abs(dx) > Math.abs(dy)) show((dx > 0 ? 'right' : 'left') + ab);
      else show((dy > 0 ? 'down' : 'up') + ab);
      place();
      return;
    }

    // Close enough: sit, blink happily now and then, then nap
    idle++;
    if (idle > 80) {
      show('sleep');
      zzz.hidden = false;
      zzz.textContent = frame % 10 < 5 ? 'z' : 'zZ';
    } else if (idle > 20 && idle % 25 < 3) {
      show('happy');
    } else {
      show('sit');
    }
  }

  function onMove(e) { target = { x: e.clientX, y: e.clientY }; }

  function save() {
    try { sessionStorage.setItem('neko-pos', JSON.stringify({ x, y, idle })); } catch (e) { /* ignore */ }
  }

  function start() {
    if (timer) return;
    document.body.append(canvas, zzz);
    zzz.hidden = true;
    place();
    show(idle > 80 ? 'sleep' : 'sit');
    document.addEventListener('mousemove', onMove);
    timer = setInterval(step, STEP_MS);
  }

  function stop() {
    clearInterval(timer);
    timer = null;
    document.removeEventListener('mousemove', onMove);
    canvas.remove();
    zzz.remove();
  }

  window.addEventListener('pagehide', save);
  window.addEventListener('resize', place);
  if (isOn()) start();
})();
