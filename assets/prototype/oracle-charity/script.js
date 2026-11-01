/* Oracle Charity · home.
   The soft light behind the page shifts with each section; the chapter list follows where you are.
   The slideshow, chapter list, cause cards, collage, stories and photo arch are all hands-on. */
(function () {
  var root = document.documentElement;
  root.classList.add('ready');
  var body = document.body;
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var smooth = reduce ? 'auto' : 'smooth';
  if (reduce) $$('.tile svg').forEach(function (s) { try { s.pauseAnimations(); } catch (e) {} });

  // Unsplash photos used on the page (all downloads registered with Unsplash)
  var P = {
    A: ['1599059813005-11265ba4b4ce', 'Joel Muniz'],
    B: ['1593113616828-6f22bca04804', 'Joel Muniz'],
    C: ['1565803974275-dccd2f933cbb', 'Brian Yurasits'],
    D: ['1618521715147-29e4b97e2ebd', 'Steve Jewett'],
    E: ['1618477461853-cf6ed80faba5', 'OCG Saving The Ocean'],
    G: ['1763570645098-371723617ee9', 'Kwami Fattah Al Sissi'],
    H: ['1574471436709-3419c6de861d', 'Nayeli Dalton'],
    I: ['1545886082-e66c6b9e011a', 'Dieu Huyen Hoang'],
    J: ['1593113646773-028c64a8f1b8', 'Joel Muniz'],
    K: ['1679236703546-8a26e1d83918', 'Joshua Leong'],
    M: ['1648365304143-9aa30adbf8e4', 'Singapore Stock Photos'],
    N: ['1490424660416-359912d314b3', 'Z'],
    P: ['1544928938-6852c1925194', 'victoria gonzales'],
    Q: ['1695654688908-19ca8d17baa6', 'Grab'],
    R: ['1774094135149-bbeeb1767bfa', 'Jeremy Brady'],
    kopi: ['1787329681980-ec5bc70596ea', 'Annie Hatuanh'],
    halo: ['1792778715366-8c34d7b6ca39', 'David Jun'],
    shore: ['1610093703375-6d8fd641294b', 'OCG Saving The Ocean'],
    purple: ['1790800276545-36ab70ee739f', 'Clara García'],
    // the photo each calendar day opens on
    y1: ['1593113630400-ea4288922497', 'Joel Muniz'],
    y2: ['1643321610692-719deb378a33', 'Claudia Raya'],
    y3: ['1764173040319-4db683637611', 'Centre for Ageing Better'],
    y4: ['1772205252001-d349b226581e', 'Mobio Marketing'],
    y5: ['1531844251246-9a1bfaae09fc', 'Omar Lopez'],
    y7: ['1601566674556-3ac2a27fec9f', 'Richard Burlton'],
    y8: ['1616680213669-92c78de95f38', 'OCG Saving The Ocean'],
    y10: ['1772734462837-9524ce7af714', 'Robin Vintevogel'],
    // from the field
    s1: ['1616680214084-22670de1bc82', 'OCG Saving The Ocean'],
    s2: ['1593113598332-cd288d649433', 'Joel Muniz'],
    s3: ['1768478563694-b9b38533f2f4', 'Armand Mckenzie'],
    s4: ['1724828238215-8ef53f5de8eb', 'Leslie Set'],
    // moments arch
    w1: ['1615897570286-da936a5dfb81', 'Aaron Doucett'],
    w2: ['1588822534638-028d5ddc07ac', 'Joel Muniz'],
    w3: ['1488820098099-8d4a4723a490', 'Z'],
    w4: ['1763630837260-6f82f1ca9206', 'Mobio Marketing'],
    w5: ['1634151389979-2dea7604b36f', 'Alex Diaz'],
    w6: ['1732919258502-023e94fc1109', 'Jonathan Caliguire'],
    w7: ['1610093674388-cee0337f2684', 'OCG Saving The Ocean'],
    w8: ['1592591281804-7257039c166f', 'Roman Holoschchuk'],
    w9: ['1661100545029-cc3fd140dbfa', 'Blake Wisz'],
    w10: ['1558023598-0afa967eac90', 'Anubhav Shekhar'],
    w11: ['1610093641855-31ffd617a94a', 'OCG Saving The Ocean'],
    // used only in the page markup (statement, collage, feature, give, footer)
    x1: ['1628717341663-0007b0ee2597', 'Ismael Paramo'],
    x2: ['1526795443948-005b48ce4791', 'Jixiao Huang'],
    x3: ['1777150895644-2ca253ee1c93', 'Hammilton Ojijo'],
    x4: ['1589696484849-fe06c15e42f6', 'Clayton Cardinalli'],
    x5: ['1672084891746-29828996afd6', 'Steve Jewett'],
    x6: ['1617817546276-80b86dd60151', 'Ismael Paramo'],
    x7: ['1778315599241-030773aa636b', 'Harrison Lin'],
    x8: ['1626607007733-d09228471d9f', 'Donna Spearman'],
    x9: ['1763994682395-3a85ae0eef0c', 'Fenghua'],
    x10: ['1618477460930-d8bffff64172', 'OCG Saving The Ocean'],
    x11: ['1598335624134-5bceb5de202d', 'Eyoel Kahssay'],
    h1: ['1732194438313-40cb4261f49b', 'Raj Tuladhar'],
    h2: ['1704475686860-ab71b444df6b', 'Adelson Gomz'],
    h3: ['1758599669406-d5179ccefcb9', 'Vitaly Gariev'],
    h4: ['1588106832140-87523dd73ed0', 'OCG Saving The Ocean'],
    h5: ['1732194438700-c7eb8cc16cb6', 'Raj Tuladhar'],
    x12: ['1609139010253-40ad2ad5216d', 'Melanie Lim'],
    x13: ['1709563942266-79a602b65695', 'Amistad Cristiana'],
    x14: ['1758599669199-a858720a9689', 'Vitaly Gariev'],
    x15: ['1569937684907-3c79f075b202', 'Elevate'],
    // active volunteers (portraits are stock models; names and quotes are samples)
    v1: ['1669266586569-5489c4f5c7ba', 'Redicul Pict'],
    v2: ['1764546373114-2d7a87221733', 'khaled elshamy'],
    v3: ['1585071507245-d11f6c6b12f0', 'Yeremia Krisnamurti'],
    v4: ['1626499370263-b2a0501f2773', 'M. Ghufanil Muta Ali']
  };
  function full(k, w) { return 'https://images.unsplash.com/photo-' + P[k][0] + '?auto=format&fit=max&w=' + w + '&q=72'; }
  function img(k, w, h) { return 'https://images.unsplash.com/photo-' + P[k][0] + '?auto=format&fit=crop&w=' + w + '&h=' + h + '&q=70'; }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  var ICON = { Food: 'bowl-food', Seniors: 'coffee', Youth: 'graduation-cap', Nature: 'leaf', Inclusion: 'wheelchair' };
  function icon(n) { return '<i class="ph-light ph-' + n + '" aria-hidden="true"></i>'; }
  // who each event helps, and what to bring
  var WHO = { ffth: 'Families on food support', wh: 'Seniors and families who need a hot meal', kopi: 'Seniors who live alone', phone: 'Older residents going digital', halogen: 'Young people finding their feet', read: 'Pre-schoolers learning to read', coast: 'The East Coast shoreline', purple: 'Persons with disabilities' };
  var BRING = { Food: 'Closed shoes. Gloves and aprons provided.', Seniors: 'Just yourself, and some patience.', Youth: 'A laptop helps for workshops.', Nature: 'Hat, water bottle and sunblock.', Inclusion: 'Something purple.' };
  var TONE = { Food: 'var(--peach)', Seniors: 'var(--sand)', Youth: 'var(--sky)', Nature: 'var(--mint)', Inclusion: 'var(--lilac)' };

  // Real partners and programmes; dates, places and spots are samples
  var CAUSES = [
    { id: 'ffth', tags: 'groceries hunger families packing', name: 'Food from the Heart', k: 'Food', p: 'J', yp: 'y1', line: 'Pack groceries for families who need them.', when: 'Sat 14 Nov · 9am to 12pm', where: 'Food from the Heart, Yishun', spots: 18, about: 'Colleagues packed 151 cartons in the last drive. This round packs grocery bags for the monthly distribution.' },
    { id: 'wh', tags: 'meals cooking kitchen hunger', name: 'Willing Hearts', k: 'Food', p: 'G', yp: 'y2', line: 'Cook and pack meals at the soup kitchen.', when: 'Tue 17 Nov · 7am to 11am', where: 'Willing Hearts kitchen', spots: 12, about: 'New joiners often start here: chop, cook and pack meals that go out across the island the same day.' },
    { id: 'kopi', tags: 'elderly chess befriending', name: 'Kopi with seniors', k: 'Seniors', p: 'kopi', yp: 'y3', line: 'Chess, chat and kopi at a void deck.', when: 'Sat 21 Nov · 3pm to 5pm', where: 'Jurong East void deck', spots: 12, about: 'An afternoon of company for older residents who live alone. Bring patience; the chess players are good.', sample: true },
    { id: 'phone', tags: 'elderly digital skills scams', name: 'Phone help for seniors', k: 'Seniors', p: 'Q', yp: 'y4', line: 'Show older residents how to pay, call and stay safe online.', when: 'Wed 25 Nov · 6pm to 8pm', where: 'Jurong West community club', spots: 10, about: 'One volunteer, one resident, one phone. Scams, PayNow, video calls with the grandchildren.', sample: true },
    { id: 'halogen', tags: 'students leadership coaching', name: 'Halogen Foundation', k: 'Youth', p: 'halo', yp: 'y5', line: 'Coach young people through leadership workshops.', when: 'Thu 19 Nov · 2pm to 5pm', where: 'Halogen Foundation', spots: 8, about: 'Run a workshop table and coach a small group of students through a leadership challenge.' },
    { id: 'read', tags: 'children kids books', name: 'Reading buddies', k: 'Youth', p: 'N', yp: 'y7', line: 'Read with pre-schoolers, one morning a month.', when: 'Fri 27 Nov · 9am to 11am', where: 'Pre-school, Jurong West', spots: 6, about: 'Sit on a very small chair and read aloud. Books are provided; voices for the animals are encouraged.', sample: true },
    { id: 'coast', tags: 'beach sea ocean plastic environment', name: 'Coastal clean-up', k: 'Nature', p: 'shore', yp: 'y8', line: 'Clear plastic from the shore before the tide takes it.', when: 'Sun 15 Nov · 7:30am to 10am', where: 'East Coast Park', spots: 30, about: 'Gloves, bags and pickers provided. We log what we collect so the data goes to the coastal survey.' },
    { id: 'purple', tags: 'disability special needs', name: 'The Purple Parade', k: 'Inclusion', p: 'purple', yp: 'y10', line: 'Stand with persons with disabilities.', when: 'Sat 7 Nov · from 4pm', where: 'The Purple Parade', spots: 40, about: 'Oracle matched USD 4,000 in team gifts last year. Walk with colleagues, or help at a booth.' }
  ];

  // Moments arch: [photo, caption, column, focus]; the first four also open from the chapters' expand buttons
  var WALL = [
    ['w1', 'Stocking the pantry shelves', 4, '50% 35%'], ['w2', 'Boxes ready to go out', 3, '50% 40%'], ['w3', 'A smile worth the early start', 2, '50% 30%'], ['R', 'Help that reaches whoever needs it next', 5, '50% 25%'],
    ['K', 'A Jurong East community space', 1, '50% 50%'], ['w4', 'A walk in the park, together', 1, '50% 40%'],
    ['w5', 'Seedlings sorted for planting', 2, '50% 45%'], ['w6', 'Spades out', 2, '50% 35%'],
    ['w7', 'Plastic off the beach, one bag at a time', 6, '45% 50%'],
    ['w8', 'Friends who signed up together', 7, '50% 35%'], ['w9', 'From the community garden', 7, '50% 50%'], ['D', 'Buckets and pickers, ready', 7, '50% 40%'],
    ['w10', 'One team, one shift', 8, '50% 35%'], ['w11', 'Every bottle counted', 8, '50% 40%']
  ];

  // Two verified quotes; every other card is a reported figure
  var STORIES = [
    { p: 's2', n: '151', t: 'cartons packed for Food from the Heart in one food drive.', src: 'Oracle Singapore, 2025' },
    { n: 'USD 4,000', t: 'in team gifts to The Purple Parade, matched by the company.', src: 'Oracle Singapore, 2025' },
    { p: 's3', n: 'Day one', t: 'New joiners are encouraged to start with a shift at Willing Hearts.', src: 'Oracle Singapore' },
    { p: 's4', n: '10,000', t: 'people to be trained in digital skills by 2027, through the TIP Alliance with IMDA.', src: 'Oracle Singapore' },
    { p: 's1', n: '45,006', t: 'Oracle Volunteers worldwide gave 167,141 hours in FY25.', src: 'Oracle Social Impact, FY25' }
  ];

  
  // ---------- storage, a convenience only ----------
  var mine = [];
  try { mine = JSON.parse(localStorage.getItem('oc-mine') || '[]'); } catch (e) { mine = []; }
  function saveMine() { try { localStorage.setItem('oc-mine', JSON.stringify(mine)); } catch (e) {} }

  // ---------- section state: the soft light behind the page moves with it ----------
  var state = -1;
  function setState(i) { if (i !== state) { state = i; body.dataset.s = i; } }

  // ---------- hero stage: the next causes wait as cards; the chosen card opens out into the new background ----------
  var show = $('.show'), slides = $$('.slide'), cards = $$('.deck .dcard'), n = slides.length, ri = 0, showN = $('.show-n'), prog = $('.prog i'), wasT, clipT;
  function deck(i) {
    // cards follow the current cause in order; the open one leaves the deck
    cards.forEach(function (c, j) { c.style.order = (j - i - 1 + n) % n; c.style.setProperty('--o', c.style.order); c.hidden = j === i; });
    showN.textContent = (i < 9 ? '0' : '') + (i + 1);
  }
  function setSlide(i) {
    if (i === ri) return;
    var prev = ri, s = slides[i], c = cards[i];
    var before = cards.map(function (k) { return k.hidden ? null : k.getBoundingClientRect(); });
    if (!reduce) {
      // start the new photo clipped to its card, then let it open to the whole stage
      var r = show.getBoundingClientRect(), q = c.getBoundingClientRect();
      if (q.width) s.style.clipPath = 'inset(' + (q.top - r.top) + 'px ' + (r.right - q.right) + 'px ' + (r.bottom - q.bottom) + 'px ' + (q.left - r.left) + 'px round 16px)';
    }
    ri = i;
    slides.forEach(function (k, j) { k.classList.toggle('was', j === prev); if (j !== i) k.classList.remove('is-on'); });
    s.style.transition = 'none';
    s.classList.add('is-on');
    s.offsetWidth;
    s.style.transition = '';
    s.style.clipPath = 'inset(0px 0px 0px 0px round 0px)';
    clearTimeout(clipT); clipT = setTimeout(function () { s.style.clipPath = ''; }, 1000);
    clearTimeout(wasT); wasT = setTimeout(function () { slides[prev].classList.remove('was'); }, 1000);
    deck(i);
    if (!reduce) cards.forEach(function (k, j) {
      if (k.hidden) return;
      var b = before[j], a = k.getBoundingClientRect();
      // the cards behind slide along to their new places; the card for the photo that just closed joins at the end
      k.animate(b ? [{ transform: 'translateX(' + (b.left - a.left) + 'px)' }, { transform: 'none' }] : [{ opacity: 0, transform: 'translateX(40px) scale(.94)' }, { opacity: 1, transform: 'none' }],
        { duration: b ? 700 : 600, delay: b ? 0 : 250, easing: 'cubic-bezier(0.22, 1, 0.36, 1)', fill: 'backwards' });
    });
    restart();
  }
  function restart() { show.classList.remove('run'); prog.offsetWidth; startCycle(); }
  deck(0);
  cards.forEach(function (c, j) { c.addEventListener('click', function () { setSlide(j); }); });
  prog.addEventListener('animationend', function () { setSlide((ri + 1) % n); });
  $$('.arw').forEach(function (b) { b.addEventListener('click', function () { step(+b.dataset.step); }); });
  $$('.show-go').forEach(function (b) { b.addEventListener('click', function () { pick(b.dataset.k, true); }); });
  var paused = reduce, pauseB = $('.show-pause');
  function setPaused(v) {
    paused = v;
    pauseB.setAttribute('aria-pressed', v ? 'true' : 'false');
    pauseB.setAttribute('aria-label', v ? 'Play slideshow' : 'Pause slideshow');
    if (v) stopCycle(); else startCycle();
  }
  pauseB.addEventListener('click', function () { setPaused(!paused); });
  function step(d) { setSlide((ri + d + n) % n); }
  var sx = null;
  show.addEventListener('pointerdown', function (e) { if (e.pointerType !== 'mouse' && !e.target.closest('.deck')) sx = e.clientX; });
  show.addEventListener('pointerup', function (e) { if (sx === null) return; var dx = e.clientX - sx; sx = null; if (Math.abs(dx) > 40) step(dx < 0 ? 1 : -1); });
  show.addEventListener('keydown', function (e) { if (e.target.closest('.find')) return; if (e.key === 'ArrowRight') step(1); if (e.key === 'ArrowLeft') step(-1); });
  function startCycle() { if (!paused) show.classList.add('run'); }
  function stopCycle() { show.classList.remove('run'); }

  // ---------- causes: filter, search, tiles ----------
  var grid = $('[data-grid]'), found = $('[data-found]'), tabs = $$('.tabs button'), qIn = $('#q'), causesSec = $('#causes');
  var cat = 'All', query = '';
  var PAGE = 8, shown = 0, pool = [], moreB = $('[data-more]');
  function matches(c) {
    if (cat !== 'All' && c.k !== cat) return false;
    if (!query) return true;
    return (c.name + ' ' + c.k + ' ' + c.tags + ' ' + c.line + ' ' + c.where + ' ' + c.about).toLowerCase().indexOf(query) > -1;
  }
  // cause cards share the collage's pastels, one per kind of cause
  var PASTEL = { Food: 'peach', Seniors: 'sky', Youth: 'lilac', Nature: 'mint', Inclusion: 'rose' };
  // keep: re-render in place (joining a cause) without folding the grid back to the first 8
  function render(keep) {
    if (grid.children.length) dealt = true;
    var list = CAUSES.filter(matches);
    tabs.forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.f === cat ? 'true' : 'false'); });
    found.textContent = list.length + (list.length === 1 ? ' cause' : ' causes') + (query ? ' for “' + query + '”' : '');
    if (!list.length) {
      grid.innerHTML = '<li class="empty">Nothing matches “' + esc(query) + '” yet. Try food, seniors or beach.<button type="button" data-all>Show every cause</button></li>';
      $('[data-all]', grid).addEventListener('click', function () { query = ''; qIn.value = ''; cat = 'All'; swap(); });
      pool = []; shown = 0; syncMore();
      return;
    }
    pool = list; shown = Math.min(keep ? Math.max(shown, PAGE) : PAGE, list.length);
    grid.innerHTML = list.slice(0, shown).map(card).join('');
    syncMore();
  }
  // one tile; i staggers its entrance
  function card(c, i) {
      var going = mine.indexOf(c.id) > -1;
      return '<li style="--i:' + i + '"><article class="cause lt" data-id="' + c.id + '" style="--tint:var(--pa-' + PASTEL[c.k] + ')">' +
        '<div class="ph"><img src="' + img(c.p, 640, 480) + '" alt="" width="640" height="480" loading="lazy" crossorigin="anonymous">' + (going ? '<span class="going">' + icon('check') + 'You\u2019re going</span>' : '') +
        '<span class="peek" aria-hidden="true">See details' + icon('arrow-right') + '</span>' +
        '<span class="spots">' + c.spots + ' spots</span></div>' +
        '<div class="cb"><h3><button type="button" class="open">' + esc(c.name) + '</button></h3>' +
        '<p class="l">' + esc(c.line) + '</p>' +
        '<div class="tags"><span>' + icon(ICON[c.k]) + c.k + '</span><span>' + icon('calendar-blank') + esc(c.when.split(' \u00b7 ')[0]) + '</span></div>' +
        '<button type="button" class="join' + (going ? ' on' : '') + '" aria-pressed="' + going + '">' + (going ? icon('check') + 'You\u2019re going' : icon('user-plus') + 'Join') + '</button></div></article></li>';
  }
  // first 8 causes, the rest arrive as the grid's end scrolls into view (the button is the fallback)
  function syncMore() {
    var left = pool.length - shown;
    moreB.hidden = left <= 0;
    moreB.querySelector('span').textContent = 'Show ' + left + ' more ' + (left === 1 ? 'cause' : 'causes');
  }
  function more() {
    if (shown >= pool.length) return;
    var next = pool.slice(shown, shown + PAGE);
    grid.insertAdjacentHTML('beforeend', next.map(function (c, j) { return card(c, j); }).join(''));
    shown += next.length;
    syncMore();
  }
  moreB.addEventListener('click', more);
  new IntersectionObserver(function (es) { if (es[0].isIntersecting && dealt) more(); }, { rootMargin: '0px 0px 160px 0px' }).observe(moreB);
  // the cards wait unseen until the heading and filters have risen, then fade in: dealt from one stack on wide screens, a soft rise elsewhere
  var dealt = reduce, wide = innerWidth >= 1100;
  function stack() {
    if (dealt) return;
    var lis = $$('li', grid), g = grid.getBoundingClientRect(), cx = g.width / 2, cy = lis.length ? lis[0].offsetHeight / 2 + 40 : 0;
    lis.forEach(function (li, i) {
      li.style.transition = 'none';
      li.style.opacity = '0';
      if (wide) {
        var r = li.getBoundingClientRect();
        li.style.translate = (cx - (r.left - g.left) - r.width / 2) + 'px ' + (cy - (r.top - g.top) - r.height / 2) + 'px';
        li.style.rotate = ((i % 2 ? 1 : -1) * (3 + (i * 7) % 9)) + 'deg';
        li.style.zIndex = lis.length - i;
      } else li.style.translate = '0 28px';
    });
  }
  function deal() {
    if (dealt) return; dealt = true;
    $$('li', grid).forEach(function (li, i) {
      var d = 320 + i * 60;
      li.style.transition = 'opacity 600ms var(--ease-out) ' + d + 'ms, translate 1100ms var(--ease-soft) ' + d + 'ms, rotate 1100ms var(--ease-soft) ' + d + 'ms';
      li.style.opacity = ''; li.style.translate = ''; li.style.rotate = '';
      setTimeout(function () { li.style.zIndex = ''; li.style.transition = ''; }, 1200 + d);
    });
  }
  // nav turns white once the hero has scrolled out from under it
  var navBar = $('.nav');
  // the bar stays clear over the hero and turns white once the hero has scrolled away
  new IntersectionObserver(function (es) { navBar.classList.toggle('is-solid', !es[0].isIntersecting); }, { rootMargin: '-' + navBar.offsetHeight + 'px 0px 0px 0px' }).observe($('.hero'));
  new IntersectionObserver(function (es, o) { es.forEach(function (e) { if (e.isIntersecting) { requestAnimationFrame(deal); o.disconnect(); } }); }, { rootMargin: '0px 0px -8% 0px' }).observe($('.causes-head'));
  // filtering: the old cards fade out, the new set fades up one after another
  function swap() {
    if (reduce || !grid.children.length) return render();
    grid.classList.add('swap');
    setTimeout(function () {
      render(); grid.classList.remove('swap');
      var lis = $$('li', grid);
      lis.forEach(function (li) { li.style.transition = 'none'; li.style.opacity = '0'; li.style.translate = '0 14px'; });
      grid.getBoundingClientRect();
      lis.forEach(function (li, i) {
        li.style.transition = 'opacity 420ms var(--ease-out) ' + i * 40 + 'ms, translate 640ms var(--ease-soft) ' + i * 40 + 'ms';
        li.style.opacity = ''; li.style.translate = '';
      });
    }, 180);
  }
  function pick(f, go) {
    cat = f; query = ''; qIn.value = ''; clearB.hidden = true;
    swap();
    if (go) causesSec.scrollIntoView({ behavior: smooth, block: 'start' });
  }
  tabs.forEach(function (b) {
    var n = b.dataset.f === 'All' ? CAUSES.length : CAUSES.filter(function (c) { return c.k === b.dataset.f; }).length;
    b.insertAdjacentHTML('beforeend', '<span class="c" aria-hidden="true">' + n + '</span>');
    b.addEventListener('click', function () { pick(b.dataset.f, false); });
  });

  // ---------- search suggestions: a combobox under the field ----------
  var sugg = $('#sugg'), clearB = $('.find .clear'), act = -1, hits = [];
  function closeS() { sugg.hidden = true; qIn.setAttribute('aria-expanded', 'false'); qIn.removeAttribute('aria-activedescendant'); act = -1; }
  function suggest() {
    var v = qIn.value.trim().toLowerCase();
    clearB.hidden = !v;
    if (!v) { closeS(); return; }
    hits = CAUSES.filter(function (c) { return (c.name + ' ' + c.k + ' ' + c.tags + ' ' + c.line + ' ' + c.where).toLowerCase().indexOf(v) > -1; }).slice(0, 4);
    sugg.innerHTML = hits.length ? hits.map(function (c, i) {
      return '<li role="option" id="sg-' + i + '" data-id="' + c.id + '" aria-selected="false"><img src="' + img(c.p, 96, 96) + '" alt="" width="44" height="44"><span><b>' + esc(c.name) + '</b><em>' + c.k + ' \u00b7 ' + esc(c.when.split(' \u00b7 ')[0]) + '</em></span></li>';
    }).join('') : '<li class="none" role="option" aria-disabled="true">No cause matches \u201c' + esc(v) + '\u201d yet. Try food, seniors or beach.</li>';
    sugg.hidden = false; qIn.setAttribute('aria-expanded', 'true'); act = -1; qIn.removeAttribute('aria-activedescendant');
  }
  function moveS(d) {
    if (sugg.hidden || !hits.length) return;
    act = (act + d + hits.length) % hits.length;
    $$('[role="option"]', sugg).forEach(function (o, i) { o.setAttribute('aria-selected', i === act ? 'true' : 'false'); });
    qIn.setAttribute('aria-activedescendant', 'sg-' + act);
  }
  qIn.addEventListener('input', suggest);
  qIn.addEventListener('focus', function () { if (qIn.value.trim()) suggest(); });
  qIn.addEventListener('blur', function () { setTimeout(closeS, 120); });
  qIn.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowDown') { e.preventDefault(); if (sugg.hidden) suggest(); moveS(1); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); moveS(-1); }
    else if (e.key === 'Escape') { if (!sugg.hidden) { e.preventDefault(); closeS(); } else if (qIn.value) { qIn.value = ''; suggest(); } }
    else if (e.key === 'Enter' && act > -1) { e.preventDefault(); var id = hits[act].id; closeS(); openDrawer(id); }
  });
  sugg.addEventListener('mousedown', function (e) { e.preventDefault(); });
  sugg.addEventListener('click', function (e) { var o = e.target.closest('[data-id]'); if (o) { closeS(); openDrawer(o.dataset.id); } });
  clearB.addEventListener('click', function () { qIn.value = ''; suggest(); qIn.focus(); if (query) { query = ''; swap(); } });
  $('.find').addEventListener('submit', function (e) {
    e.preventDefault();
    closeS();
    var v = qIn.value.trim().toLowerCase();
    var asCat = Object.keys(TONE).filter(function (k) { return k.toLowerCase() === v; })[0];
    if (asCat) { pick(asCat, true); return; }
    cat = 'All'; query = v;
    swap();
    causesSec.scrollIntoView({ behavior: smooth, block: 'start' });
  });
  $$('[data-cause]').forEach(function (b) { b.addEventListener('click', function () { openDrawer(b.dataset.cause, b.closest('.foot-next') || b); }); });
  grid.addEventListener('click', function (e) {
    var card = e.target.closest('.cause');
    if (!card) return;
    var c = CAUSES.filter(function (x) { return x.id === card.dataset.id; })[0];
    if (e.target.closest('.join')) {
      var on = mine.indexOf(c.id) < 0;
      setMine(c, on);
      toast(on ? 'You\u2019re in. ' + c.when.split(' \u00b7 ')[0] + ' is in My events.' : 'Removed ' + c.name + '.', function () { setMine(c, !on); });
      var b = $('.cause[data-id="' + c.id + '"] .join', grid); if (b) b.focus();
      return;
    }
    openDrawer(c.id, card);
  });



  render(); stack();

  // ---------- event drawer ----------
  var drawer = $('[data-drawer]'), joinBtn = $('[data-join]'), current = null, count = $('[data-mine]');
  var mineLink = $('[data-mine-link]'), icsB = $('[data-ics]');
  function syncCount() { count.textContent = mine.length; mineLink.setAttribute('aria-label', 'My events, ' + mine.length + ' joined'); }
  function openDrawer(id, fromEl) {
    current = CAUSES.filter(function (c) { return c.id === id; })[0];
    if (!current) return;
    var im = $('[data-dr-img]');
    im.src = img(current.p, 960, 640); im.alt = '';
    $('[data-dr-k]').textContent = current.k + (current.sample ? ' · sample event' : '');
    $('[data-dr-h]').textContent = current.name;
    $('[data-dr-p]').textContent = current.about;
    var t = current.when.split(' · ');
    $('[data-dr-facts]').innerHTML = [
      ['calendar-blank', t[0], t[1]], ['map-pin', current.where, ''], ['hand-heart', WHO[current.id], 'Who you’ll help'],
      ['users', current.spots + ' spots left', 'Join a waitlist when it’s full'], ['backpack', BRING[current.k], 'What to bring'], ['clock', 'Counts toward your 20 paid hours', '']
    ].map(function (f) { return '<li>' + icon(f[0]) + '<span>' + esc(f[1]) + (f[2] ? '<small>' + esc(f[2]) + '</small>' : '') + '</span></li>'; }).join('');
    syncJoin();
    // the card grows into the dialog: start at the tapped card (or whatever opened it) and settle in the centre
    var from = (fromEl && fromEl.getBoundingClientRect) ? fromEl : (grid.querySelector('.cause[data-id="' + id + '"]') || document.activeElement);
    drawer.classList.remove('out');
    drawer.showModal();
    if (reduce || !from || !from.getBoundingClientRect) return;
    var fr = from.getBoundingClientRect(), dr = drawer.getBoundingClientRect();
    if (!fr.width || fr.bottom < 0 || fr.top > innerHeight) return;
    var k = Math.max(.2, Math.min(1, fr.width / dr.width));
    drawer.style.transition = 'none';
    drawer.style.transform = 'translate(' + (fr.left - dr.left) + 'px,' + (fr.top - dr.top) + 'px) scale(' + k.toFixed(3) + ')';
    drawer.style.opacity = '.4';
    drawer.getBoundingClientRect();
    drawer.style.transition = 'transform 620ms var(--ease-soft), opacity 300ms var(--ease-out)';
    drawer.style.transform = ''; drawer.style.opacity = '';
  }
  function closeDrawer() {
    if (!drawer.open || drawer.classList.contains('out')) return;
    drawer.style.transition = ''; drawer.classList.add('out');
    setTimeout(function () { drawer.close(); drawer.classList.remove('out'); }, reduce ? 0 : 200);
  }
  drawer.addEventListener('cancel', function (e) { e.preventDefault(); closeDrawer(); });
  $('.x', drawer).addEventListener('click', function (e) { e.preventDefault(); closeDrawer(); });
  function syncJoin() { var on = mine.indexOf(current.id) > -1; $('span', joinBtn).textContent = on ? 'Leave this event' : 'Join this event'; icsB.hidden = !on; }
  joinBtn.addEventListener('click', function () {
    var c = current, i = mine.indexOf(c.id);
    if (i > -1) { setMine(c, false); toast('Removed ' + c.name + ' from My events.', function () { setMine(c, true); }); }
    else { setMine(c, true); toast('You’re in. ' + c.when.split(' · ')[0] + ' is in My events.', function () { setMine(c, false); }); }
  });
  function setMine(c, on) {
    var i = mine.indexOf(c.id);
    if (on && i < 0) mine.push(c.id);
    if (!on && i > -1) mine.splice(i, 1);
    saveMine(); syncCount(); render(true);
    if (current && current.id === c.id) syncJoin();
    count.classList.add('bump'); setTimeout(function () { count.classList.remove('bump'); }, 300);
  }
  // a real calendar file for the joined event (Singapore time)
  function hhmm(x) { var r = x.match(/(\d+)(?::(\d+))?(am|pm)/); var h = +r[1] % 12 + (r[3] === 'pm' ? 12 : 0); return ('0' + h).slice(-2) + (r[2] || '00') + '00'; }
  icsB.addEventListener('click', function () {
    var c = current, m = c.when.match(/(\d+) (Nov|Dec)/), d = '2026' + (m[2] === 'Nov' ? '11' : '12') + ('0' + m[1]).slice(-2);
    var t = c.when.split(' \u00b7 ')[1].match(/\d+(?::\d+)?(am|pm)/g), st = hhmm(t[0]);
    var en = t[1] ? hhmm(t[1]) : ('0' + Math.min(23, +st.slice(0, 2) + 3)).slice(-2) + st.slice(2);
    var ics = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Oracle Charity concept//EN', 'BEGIN:VEVENT', 'UID:' + c.id + '-' + d + '@oracle-charity.example', 'DTSTAMP:20261030T000000Z',
      'DTSTART;TZID=Asia/Singapore:' + d + 'T' + st, 'DTEND;TZID=Asia/Singapore:' + d + 'T' + en, 'SUMMARY:' + c.name + ' (Oracle Charity)', 'LOCATION:' + c.where, 'DESCRIPTION:' + c.about, 'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
    var a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([ics], { type: 'text/calendar' }));
    a.download = c.id + '-' + d + '.ics';
    document.body.appendChild(a); a.click(); a.remove();
    toast('Calendar file saved. Open it to add the event.');
  });
  drawer.addEventListener('click', function (e) { if (e.target === drawer) closeDrawer(); });
  syncCount();

  var toastEl = $('[data-toast]'), toastT;
  function toast(msg, undo) {
    toastEl.innerHTML = '<span>' + esc(msg) + '</span>' + (undo ? '<button type="button">Undo</button>' : '');
    if (undo) $('button', toastEl).addEventListener('click', function () { undo(); toastEl.classList.remove('is-on'); });
    toastEl.classList.add('is-on');
    clearTimeout(toastT);
    toastT = setTimeout(function () { toastEl.classList.remove('is-on'); }, undo ? 5000 : 2800);
  }

  // ---------- who can help: words ink in with the scroll ----------
  var say = $('[data-say]'), sayBits = [];
  if (!reduce) {
    root.classList.add('js-say');
    Array.prototype.slice.call(say.childNodes).forEach(function (n) {
      if (n.nodeType === 3) {
        var f = document.createDocumentFragment();
        n.textContent.split(/(\s+)/).forEach(function (w) { if (!w) return; if (/^\s+$/.test(w)) f.appendChild(document.createTextNode(w)); else { var sp = document.createElement('span'); sp.className = 'w'; sp.textContent = w; f.appendChild(sp); sayBits.push(sp); } });
        say.replaceChild(f, n);
      } else sayBits.push(n);
    });
  }
  function sayStep() {
    if (!sayBits.length) return;
    var r = say.getBoundingClientRect(), vh = innerHeight;
    var k = Math.min(1, Math.max(0, (vh * .85 - r.top) / (vh * .85 - vh * .3 + r.height * .4)));
    var n = Math.round(k * sayBits.length);
    sayBits.forEach(function (b, i) { b.classList.toggle('on', i < n); });
  }

  // ---------- our year: 2025 as a calendar, one lit day per project ----------
  // Days are illustrative; the count (28) and the three noted facts are Oracle Singapore's own.
  var DAYS = [
    ['01-18', 'coast'], ['01-25', 'ffth'], ['02-05', 'kopi'], ['02-20', 'halogen'],
    ['03-04', 'wh', 'New joiners start here: a first shift in the soup kitchen.'], ['03-15', 'coast'], ['03-28', 'read'],
    ['04-09', 'ffth'], ['04-26', 'coast'], ['05-10', 'read'], ['05-14', 'phone'], ['05-28', 'wh'],
    ['06-12', 'halogen'], ['06-27', 'kopi'], ['07-12', 'ffth', '151 cartons packed for families in a single food drive.'], ['07-25', 'read'],
    ['08-09', 'coast'], ['08-23', 'coast'], ['09-06', 'halogen'], ['09-10', 'phone'], ['09-24', 'wh'],
    ['10-14', 'kopi'], ['10-25', 'purple', 'USD 4,000 in team gifts, matched by the company.'], ['11-06', 'halogen'],
    ['11-13', 'ffth'], ['11-22', 'coast'], ['12-05', 'read'], ['12-13', 'wh']
  ];
  var byId = {}; CAUSES.forEach(function (c) { byId[c.id] = c; });
  var MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'], WD = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  var litDay = {}; DAYS.forEach(function (d, i) { litDay[d[0]] = i; });
  var cal = $('[data-cal]'), html = '';
  for (var m = 0; m < 12; m++) {
    var first = (new Date(2025, m, 1).getDay() + 6) % 7, dim = new Date(2025, m + 1, 0).getDate(), cells = '';
    for (var k = 0; k < first; k++) cells += '<span class="pad" aria-hidden="true"></span>';
    for (var d = 1; d <= dim; d++) {
      var key = String(m + 1).padStart(2, '0') + '-' + String(d).padStart(2, '0'), j = litDay[key];
      if (j === undefined) cells += '<span aria-hidden="true"></span>';
      else { var c = byId[DAYS[j][1]]; cells += '<button type="button" data-day="' + j + '" style="--c:var(--k-' + c.k.toLowerCase() + ');--d:' + (j * 45) + 'ms" aria-label="' + WD[new Date(2025, m, d).getDay()] + ' ' + d + ' ' + MON[m] + ': ' + esc(c.name) + '"></button>'; }
    }
    html += '<div class="mo"><span class="mo-n">' + MON[m] + '</span><div class="mo-g">' + cells + '</div></div>';
  }
  cal.innerHTML = html;
  var dayBtns = $$('[data-day]', cal), yv = $('[data-yv]'), yvImgs = $$('img', yv), yvA = 0, cur = 0, yKind = 'All';
  function yvShow(i) {
    cur = (i + DAYS.length) % DAYS.length;
    var dd = DAYS[cur], c = byId[dd[1]], mm = +dd[0].slice(0, 2) - 1, dn = +dd[0].slice(3), dt = new Date(2025, mm, dn);
    dayBtns.forEach(function (b, j) { b.classList.toggle('is-on', j === cur); b.setAttribute('aria-pressed', j === cur ? 'true' : 'false'); });
    yv.style.setProperty('--c', 'var(--k-' + c.k.toLowerCase() + ')');
    $('[data-yv-d]').textContent = WD[dt.getDay()] + ' ' + dn + ' ' + MON[mm] + ' 2025';
    $('[data-yv-t]').textContent = c.name;
    $('[data-yv-l]').textContent = dd[2] || c.line;
    $('[data-yv-go]').dataset.cause = c.id;
    var next = yvImgs[1 - yvA], prev = yvImgs[yvA];
    next.onload = function () { next.classList.add('is-on'); prev.classList.remove('is-on'); };
    next.alt = c.name; next.src = img(c.yp, 1600, 700);
    yvA = 1 - yvA;
  }
  cal.addEventListener('click', function (e) {
    var b = e.target.closest('[data-day]'); if (!b) return;
    yvShow(+b.dataset.day);
    if (yv.getBoundingClientRect().bottom > innerHeight) yv.scrollIntoView({ behavior: smooth, block: 'nearest' });
  });
  $$('[data-yv-step]').forEach(function (b) {
    b.addEventListener('click', function () {
      var st = +b.dataset.yvStep, i = cur;
      do { i = (i + st + DAYS.length) % DAYS.length; } while (yKind !== 'All' && byId[DAYS[i][1]].k !== yKind && i !== cur);
      yvShow(i);
    });
  });
  $('[data-yv-go]').addEventListener('click', function (e) { openDrawer(e.currentTarget.dataset.cause, yv); });
  $$('[data-yk]').forEach(function (b) {
    b.addEventListener('click', function () {
      yKind = b.dataset.yk; cal.dataset.k = yKind;
      $$('[data-yk]').forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
      dayBtns.forEach(function (x) { x.classList.toggle('match', byId[DAYS[+x.dataset.day][1]].k === yKind); });
      if (yKind !== 'All' && byId[DAYS[cur][1]].k !== yKind) { for (var i = 0; i < DAYS.length; i++) if (byId[DAYS[i][1]].k === yKind) { yvShow(i); break; } }
    });
  });
  yvShow(DAYS.length - 4);
  new IntersectionObserver(function (es, o) { es.forEach(function (e) { if (e.isIntersecting) { cal.classList.add('is-in'); o.disconnect(); } }); }, { rootMargin: '0px 0px -20% 0px' }).observe(cal);
  // full-bleed photo and the giving photo zoom out as they pass through the screen
  var fImg = $('.feature-frame img'), gImg = $('.give-pic img');
  function zoom(el, from, to, prop) {
    var r = el.parentNode.getBoundingClientRect(), vh = innerHeight;
    if (r.bottom < 0 || r.top > vh) return;
    var k = Math.min(1, Math.max(0, (vh - r.top) / (vh + r.height)));
    el.style.setProperty(prop, (from + (to - from) * k).toFixed(3));
  }
  var fCopy = $('.feature-copy');
  function featStep() {
    // the photo holds still behind the frame (a reveal) and settles from a slow zoom; the words rise past it
    zoom(fImg, 1.2, 1, '--ps'); zoom(gImg, 1.25, 1.02, '--gz');
    var r = fImg.parentNode.getBoundingClientRect(), vh = innerHeight;
    if (r.bottom < 0 || r.top > vh) return;
    var k = Math.min(1, Math.max(0, (vh - r.top) / (vh + r.height)));
    fCopy.style.setProperty('--cy', (80 - 160 * k).toFixed(1) + 'px');
  }

  // ---------- how it works: each layer of the collage drifts at its own depth ----------
  var how = $('.how'), layers = $$('.collage [data-depth]'), deep = matchMedia('(min-width: 900px)');
  function howStep() {
    if (!deep.matches) return;
    var r = how.getBoundingClientRect();
    if (r.bottom < 0 || r.top > innerHeight) return;
    var off = r.top + r.height / 2 - innerHeight / 2;
    layers.forEach(function (l) { l.style.setProperty('--dy', (off * -l.dataset.depth).toFixed(1) + 'px'); });
  }

  // ---------- from the field: one lead photo card, then smaller tiles ----------
  var LOOK = ['photo', 'red', 'light', 'photo'];
  var lead = STORIES[STORIES.length - 1], rest = STORIES.slice(0, -1);
  function num(n) { var v = n.replace(/,/g, ''); return /^\d+$/.test(v) ? '<p class="n" data-count="' + v + '">' + n + '</p>' : '<p class="n">' + n + '</p>'; }
  // the year's numbers join the how-it-works collage as separate pieces: a pastel card overlapping its photo, like the steps above
  // [story, card class, card tint, card depth, photo class, photo depth]
  var PIECES = [[lead, 'a-lc', 'sky', '-0.03', 'a-lp', '0.06'], [rest[0], 'a-1c', 'peach', '-0.02', 'a-1p', '0.07'], [rest[1], 'a-2c', 'lilac', '-0.04'], [rest[2], 'a-3c', 'mint', '-0.03'], [rest[3], 'a-4c', 'rose', '-0.02', 'a-4p', '0.05']];
  $('.collage').insertAdjacentHTML('beforeend', PIECES.map(function (x) {
    var s = x[0], face = s === rest[2] ? '<img class="face" src="' + img(s.p, 160, 160) + '" alt="" width="56" height="56" loading="lazy">' : '';
    var pic = x[4] ? '<figure class="cl pic ' + x[4] + '" data-depth="' + x[5] + '"><img src="' + img(s.p, 900, 700) + '" alt="" width="900" height="700" loading="lazy"></figure>' : '';
    return pic + '<div class="cl card stat ' + x[2] + ' ' + x[1] + '" data-depth="' + x[3] + '">' + face + num(s.n) + '<p class="t">' + esc(s.t) + '</p></div>';
  }).join(''));
  layers = $$('.collage [data-depth]');

  // ---------- moments wall and lightbox ----------
  var arch = $('[data-arch]'), colsHtml = '';
  for (var c = 1; c <= 8; c++) {
    colsHtml += '<div class="acol c' + c + '">' + WALL.map(function (w, i) {
      if (w[2] !== c) return '';
      return '<button type="button" data-i="' + i + '" aria-label="Open photo: ' + esc(w[1]) + '"><img src="' + img(w[0], 420, c > 2 && c < 7 ? 900 : 560) + '" alt="" width="420" height="560" loading="lazy" style="object-position:' + w[3] + '"></button>';
    }).join('') + '</div>';
  }
  arch.insertAdjacentHTML('afterbegin', colsHtml);
  $$('.acol', arch).forEach(function (col, i) {
    var d = 3.5 - i;
    col.style.setProperty('--k', Math.abs(Math.round(d)));
    col.style.setProperty('--fx', d * 40 + 'px');
    col.style.setProperty('--fr', -d * 4 + 'deg');
  });
  new IntersectionObserver(function (es, o) { es.forEach(function (e) { if (e.isIntersecting) { arch.classList.add('is-in'); o.disconnect(); } }); }, { rootMargin: '0px 0px -20% 0px' }).observe(arch);
  var sub = $('.arch-sub'), subDefault = sub.textContent, subT;
  function caption(t) {
    clearTimeout(subT);
    sub.classList.add('swap');
    subT = setTimeout(function () { sub.textContent = t; sub.classList.remove('swap'); }, 160);
  }
  function lit(b) {
    $$('.acol button', arch).forEach(function (x) { x.classList.toggle('lit', x === b); });
    arch.classList.toggle('peek', !!b);
    if (b) { var w = WALL[+b.dataset.i]; caption(w[1] + ' \u00b7 Photo: ' + P[w[0]][1]); } else caption(subDefault);
  }
  $$('.acol button', arch).forEach(function (b) {
    if (fine) { b.addEventListener('mouseenter', function () { lit(b); }); b.addEventListener('mouseleave', function () { lit(null); }); }
    b.addEventListener('focus', function () { lit(b); });
    b.addEventListener('blur', function () { lit(null); });
  });
  arch.addEventListener('click', function (e) { var b = e.target.closest('button[data-i]'); if (b) showLb(+b.dataset.i); });
  // ---------- thank-you deck: pick a morning, the name types itself in until you type your own ----------
  var td = $('[data-tdeck]');
  if (td) (function () {
    var MORN = [
      ['w1', 'Thank you for Saturday,', 'From the Food from the Heart crew', '3 hours', ['w10', 'w8']],
      ['w7', 'Thanks for the beach clean-up,', 'From the coastal clean-up crew', '4 hours', ['w11', 'w6']],
      ['w4', 'Thank you for the walk in the park,', 'From the Kopi with seniors crew', '2 hours', ['w3', 'w9']]
    ];
    // sample colleagues, so the card has someone to thank before you type
    var PEOPLE = [['Wei Ling', 'Tan Wei Ling'], ['Arjun', 'Arjun Mehta'], ['Nurul', 'Nurul Huda']];
    var nameEl = $('.tname', td), chipName = $('.tchip-name', td), chipA = $('.tchip-a', td), chipB = $('.tchip-b', td), tilt = $('.tdeck-tilt', td), sheen = $('.tsheen', td);
    var imgs = [$('.tfront img', td), $('.tb1 img', td), $('.tb2 img', td)], input = $('#thanks-name'), err = $('#thanks-err'), form = $('[data-thanks]');
    var picks = $$('.thanks-pick button'), cur = 0, own = false, seen = false, timers = [];
    function later(fn, ms) { timers.push(setTimeout(function () { seen && !document.hidden ? fn() : later(fn, 400); }, ms)); }
    function stop() { timers.forEach(clearTimeout); timers = []; td.classList.remove('is-typing'); }
    function setMorning(i, first) {
      cur = i; var m = MORN[i];
      picks.forEach(function (b, j) { b.setAttribute('aria-checked', j === i ? 'true' : 'false'); b.tabIndex = j === i ? 0 : -1; });
      [m[0], m[4][0], m[4][1]].forEach(function (k, j) {
        var el = imgs[j], src = img(k, j ? 480 : 520, j ? 720 : 780);
        if (first) { el.src = src; return; }
        el.classList.add('swap'); setTimeout(function () { el.src = src; el.classList.remove('swap'); }, 200 + j * 60);
      });
      $('[data-tline]', td).textContent = m[1]; $('[data-tfrom]', td).textContent = m[2]; $('[data-thours]', td).textContent = m[3];
    }
    function type(word, done) { var i = 0; (function step() { nameEl.textContent = word.slice(0, i); if (i++ < word.length) later(step, 85); else done(); })(); }
    function erase(done) { (function step() { var t = nameEl.textContent; if (!t) return done(); nameEl.textContent = t.slice(0, -1); later(step, 45); })(); }
    function cycle(n) {
      var p = PEOPLE[n % PEOPLE.length];
      chipName.textContent = p[1]; td.classList.add('is-typing');
      type(p[0], function () {
        td.classList.remove('is-typing');
        later(function () { chipA.classList.add('is-on'); }, 300);
        later(function () { chipB.classList.add('is-on'); }, 1300);
        later(function () {
          chipA.classList.remove('is-on'); chipB.classList.remove('is-on');
          later(function () { td.classList.add('is-typing'); erase(function () { later(function () { cycle(n + 1); }, 250); }); }, 450);
        }, 4400);
      });
    }
    setMorning(0, true);
    if (reduce) { nameEl.textContent = PEOPLE[0][0]; chipName.textContent = PEOPLE[0][1]; }
    new IntersectionObserver(function (es) {
      var was = seen; seen = es[0].isIntersecting;
      if (seen) td.classList.add('is-in');
      if (seen && !was && !own && !reduce && !timers.length) later(function () { cycle(0); }, 400);
    }, { threshold: 0.3 }).observe(td);
    picks.forEach(function (b, i) {
      b.addEventListener('click', function () { setMorning(i); });
      b.addEventListener('keydown', function (e) {
        var d = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0;
        if (!d) return; e.preventDefault(); var k = (i + d + picks.length) % picks.length; setMorning(k); picks[k].focus();
      });
    });
    // your own name takes over the card; clearing the field hands it back to the samples
    input.addEventListener('input', function () {
      var v = input.value.trim();
      input.removeAttribute('aria-invalid'); err.textContent = '';
      if (v) { if (!own) { own = true; stop(); chipA.classList.add('is-on'); chipB.classList.remove('is-on'); } nameEl.textContent = v.split(' ')[0]; }
      else if (own) { own = false; nameEl.textContent = ''; chipA.classList.remove('is-on'); if (!reduce) cycle(0); }
    });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var v = input.value.trim();
      if (!v) { input.setAttribute('aria-invalid', 'true'); err.textContent = 'Add the name of the colleague you want to thank.'; input.focus(); return; }
      chipName.textContent = v; chipB.classList.add('is-on');
      toast('Thanks sent to ' + v);
    });
    if (fine && !reduce) {
      var tx = 0, ty = 0, cx = 0, cy = 0, traf = 0, wrap = td.parentNode;
      wrap.addEventListener('pointermove', function (e) { var r = td.getBoundingClientRect(); tx = (e.clientX - r.left) / r.width - .5; ty = (e.clientY - r.top) / r.height - .5; if (!traf) traf = requestAnimationFrame(tloop); });
      wrap.addEventListener('pointerleave', function () { tx = ty = 0; if (!traf) traf = requestAnimationFrame(tloop); });
      function tloop() {
        cx += (Math.max(-.6, Math.min(.6, tx)) - cx) * .08; cy += (Math.max(-.6, Math.min(.6, ty)) - cy) * .08;
        tilt.style.transform = 'rotateY(' + (cx * 10).toFixed(2) + 'deg) rotateX(' + (-cy * 7).toFixed(2) + 'deg)';
        sheen.style.backgroundPosition = (50 + cx * 120).toFixed(1) + '% 0';
        traf = Math.abs(tx - cx) + Math.abs(ty - cy) > .001 ? requestAnimationFrame(tloop) : 0;
      }
    }
  })();

  var lb = $('[data-lightbox]'), lbImg = $('[data-lb-img]'), lbCap = $('[data-lb-cap]'), li = 0;
  function showLb(i) {
    li = (i + WALL.length) % WALL.length;
    var w = WALL[li];
    lbImg.src = full(w[0], 1800);
    lbImg.alt = w[1];
    lbCap.textContent = w[1] + ' · Photo: ' + P[w[0]][1] + ' on Unsplash';
    $('[data-lb-count]').textContent = (li + 1) + ' / ' + WALL.length;
    [li + 1, li - 1].forEach(function (k) { new Image().src = full(WALL[(k + WALL.length) % WALL.length][0], 1800); });
    if (!lb.open) lb.showModal();
  }
  $$('[data-lb-go]').forEach(function (b) { b.addEventListener('click', function () { showLb(li + +b.dataset.lbGo); }); });
  var lx = null, lfig = $('figure', lb);
  lfig.addEventListener('pointerdown', function (e) { if (e.pointerType !== 'mouse') lx = e.clientX; });
  lfig.addEventListener('pointerup', function (e) { if (lx === null) return; var dx = e.clientX - lx; lx = null; if (Math.abs(dx) > 40) showLb(li + (dx < 0 ? 1 : -1)); });
  lb.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowRight') showLb(li + 1);
    if (e.key === 'ArrowLeft') showLb(li - 1);
  });

  // ---------- give: pick an amount, see the match ----------
  var amt = 50, gOut = {};
  $$('[data-g]').forEach(function (b) { gOut[b.dataset.g] = b; });
  function money(n) { return '$' + n.toLocaleString('en-SG'); }
  function setAmt(n) {
    amt = n;
    $$('.amts button').forEach(function (b) { var on = +b.dataset.amt === n; b.setAttribute('aria-checked', on ? 'true' : 'false'); b.tabIndex = on ? 0 : -1; });
    [['you', n], ['match', n], ['total', n * 2], ['tax', n * 2.5]].forEach(function (x) {
      var el = gOut[x[0]]; el.textContent = money(x[1]);
      if (!reduce && x[0] !== 'tax') { el.classList.remove('pop'); void el.offsetWidth; el.classList.add('pop'); setTimeout(function () { el.classList.remove('pop'); }, 400); }
    });
  }
  var amtBtns = $$('.amts button');
  amtBtns.forEach(function (b, i) {
    b.addEventListener('click', function () { setAmt(+b.dataset.amt); });
    b.addEventListener('keydown', function (e) {
      var d = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0;
      if (!d) return;
      e.preventDefault();
      var n = amtBtns[(i + d + amtBtns.length) % amtBtns.length];
      setAmt(+n.dataset.amt); n.focus();
    });
  });
  setAmt(50);
  $('[data-give]').addEventListener('click', function () { toast('This is a concept. In the live portal, ' + money(amt) + ' would go to checkout with the match filed for you.'); });

  // ---------- newsletter ----------
  $('[data-news]').addEventListener('submit', function (e) {
    e.preventDefault();
    var em = $('#em'), msg = $('[data-news-ok]');
    if (!em.checkValidity()) {
      em.setAttribute('aria-invalid', 'true');
      msg.classList.add('err');
      msg.textContent = em.value ? 'That email doesn\u2019t look right. Try name@oracle.com.' : 'Enter your work email to get the list.';
      em.focus();
      return;
    }
    em.removeAttribute('aria-invalid');
    msg.classList.remove('err');
    msg.textContent = 'Thanks. The December list goes to ' + em.value + ' on the first Monday.';
    e.target.reset();
  });

  $('#em').addEventListener('input', function () { if (this.hasAttribute('aria-invalid') && this.checkValidity()) { this.removeAttribute('aria-invalid'); $('[data-news-ok]').textContent = ''; } });

  // ---------- credits ----------
  var names = [];
  Object.keys(P).forEach(function (k) { if (names.indexOf(P[k][1]) < 0) names.push(P[k][1]); });
  $('[data-credits]').textContent = 'Photographs on Unsplash by ' + names.slice(0, -1).join(', ') + ' and ' + names[names.length - 1] + '.';

  // ---------- count-up ----------
  function countUp(el) {
    var to = +el.dataset.count;
    if (reduce || !to) return;
    var t0 = performance.now(), d = 1400;
    (function tick(t) {
      var k = Math.min(1, (t - t0) / d), e = 1 - Math.pow(1 - k, 3);
      el.textContent = Math.round(to * e).toLocaleString('en-SG');
      if (k < 1) requestAnimationFrame(tick);
    })(t0);
  }

  // ---------- entrances: heading, then text, then pictures ----------
  var riseSel = ['.hero h1', '.lede', '.find', '.show', '.yr-head > *', '.yr-legend', '.yr-view', '.causes-head > *', '.tabs', '.feature-copy > *', '.collage > .cl', '.stories-head > *', '.bx', '.crew-head > *', '.vol', '.arch-head', '.thanks-copy > *', '.tdeck', '.faq-head > *', '.faq details', '.give-copy > *', '.give-pic', '.foot-top > *', '.foot-cols > *'];
  var groups = new Map();
  riseSel.forEach(function (sel) {
    $$(sel).forEach(function (el) {
      var sec = el.closest('[data-sec]') || body;
      var n = groups.get(sec) || 0;
      groups.set(sec, n + 1);
      el.dataset.rise = '';
      el.style.setProperty('--d', Math.min(n, 8) * 75 + 'ms');
    });
  });
  var rio = new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (!e.isIntersecting) return;
      e.target.classList.add('is-in');
      $$('[data-count]', e.target).forEach(countUp);
      if (e.target.hasAttribute('data-count')) countUp(e.target);
      rio.unobserve(e.target);
    });
  }, { rootMargin: '0px 0px -8% 0px' });
  $$('[data-rise]').forEach(function (el) { rio.observe(el); });
  var cio = new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { $$('[data-count]', e.target).forEach(countUp); cio.unobserve(e.target); } });
  });
  $$('.big').forEach(function (el) { cio.observe(el); });

  // ---------- which section is in the middle of the screen ----------
  var sio = new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (!e.isIntersecting) return;
      var s = +e.target.dataset.sec;
      setState(s);
      if (e.target.classList.contains('hero')) startCycle(); else stopCycle();
    });
  }, { rootMargin: '-50% 0px -50% 0px' });
  $$('[data-sec]').forEach(function (el) { sio.observe(el); });
  setState(0);
  sayStep();
  startCycle();

  // ---------- preloader: the line fills with real progress (hero photo, fonts, page) while the glass hue turns, then it hands over ----------
  var pre = $('.pre');
  if (pre && root.classList.contains('js-pre')) (function () {
    var nEl = $('[data-pre-n]'), line = $('.pre-line'), t0 = performance.now(), shown = 0, target = 0.08, done = false;
    var first = $('.slide.is-on img'), parts = [false, false, false];
    function mark(i) { parts[i] = true; target = Math.max(target, parts.filter(Boolean).length / parts.length); }
    if (first.complete) mark(0); else { first.addEventListener('load', function () { mark(0); }); first.addEventListener('error', function () { mark(0); }); }
    (document.fonts ? document.fonts.ready : Promise.resolve()).then(function () { mark(1); });
    if (document.readyState === 'complete') mark(2); else addEventListener('load', function () { mark(2); });
    setTimeout(function () { target = 1; }, 4500);
    function tick(now) {
      // never faster than ~1.6s, so the fill reads as a moment rather than a flash
      var cap = Math.min(1, (now - t0) / 1600);
      shown += (Math.min(target, cap) - shown) * 0.12;
      if (Math.min(target, cap) >= 1 && shown > 0.995) shown = 1;
      nEl.textContent = Math.round(shown * 100);
      line.style.setProperty('--f', shown.toFixed(3));
      root.style.setProperty('--gh', (shown * 140).toFixed(1) + 'deg');
      if (shown < 1) requestAnimationFrame(tick); else finish();
    }
    function finish() {
      if (done) return; done = true;
      setTimeout(function () {
        // a reload used to land part-way down with the banner under the nav; always open at the top unless a link asked for a section
        if (!location.hash) scrollTo(0, 0);
        root.classList.add('pre-out');
        restart();
        setTimeout(function () { root.classList.remove('js-pre', 'pre-out'); pre.remove(); glassStep(); }, 2000);
      }, 220);
    }
    requestAnimationFrame(tick);
  })();

  // the logo takes you home: on this page that means a smooth slide back to the top
  $('.brand').addEventListener('click', function (e) { e.preventDefault(); scrollTo({ top: 0, behavior: smooth }); history.replaceState(null, '', location.pathname); });

  var raf;
  // glass light behind the page: depth drift plus a slow colour morph (pink-violet-sky swinging toward peach and mint) with scroll
  function glassStep() {
    var max = root.scrollHeight - innerHeight, p = max > 0 ? scrollY / max : 0;
    root.style.setProperty('--gp', p.toFixed(4));
    root.style.setProperty('--gh', (Math.sin(p * Math.PI * 2) * 70).toFixed(1) + 'deg');
  }
  if (!reduce && !root.classList.contains('js-pre')) glassStep();
  addEventListener('scroll', function () { cancelAnimationFrame(raf); raf = requestAnimationFrame(function () { if (!reduce) { featStep(); howStep(); sayStep(); glassStep(); } }); }, { passive: true });
  })();
