/* Aztec platform preview: dashboard behaviour. No dependencies, works from file://.
   Every number here is SAMPLE data. Nothing is sent anywhere and no money moves. */
(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const root = document.documentElement;
  const loader = document.querySelector('.loader');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const SVGNS = 'http://www.w3.org/2000/svg';
  const money = (n, sign = false) => (sign ? (n > 0 ? '+' : n < 0 ? '−' : '') : (n < 0 ? '−' : '')) + '$' + Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  /* ── sample data (one source for every screen) ── */
  const SAMPLE = {
    parts: [
      { id: 'cash', name: 'Cash', value: 2148.20, color: '#8AD4FF', plain: 'Money ready to spend or send.' },
      { id: 'assets', name: 'Digital assets', value: 1213.30, color: '#B9A8FF', plain: 'Crypto you own. Its value changes every day.' },
      { id: 'savings', name: 'Savings', value: 919.00, color: '#5E8CFF', plain: 'Money you’ve set aside for later.' }
    ],
    assets: [
      { sym: 'BTC', name: 'Bitcoin', glyph: '₿', cls: 'btc', amount: '0.0097 BTC', value: 620.00, price: 64210.40, week: 2.4, risk: 'High',
        plain: 'Digital money that isn’t issued by a bank or government. You can own a small part of one.',
        wrong: 'Its price can rise or fall sharply in a single day. Only put in what you could afford to lose.' },
      { sym: 'ETH', name: 'Ethereum', glyph: 'Ξ', cls: 'eth', amount: '0.12 ETH', value: 310.40, price: 2586.70, week: -1.8, risk: 'High',
        plain: 'Runs a shared network where apps and digital agreements work without a middle company.',
        wrong: 'Like Bitcoin, its price moves a lot, and network fees can change from minute to minute.' },
      { sym: 'USDC', name: 'USD Coin', glyph: '$', cls: 'usdc', amount: '282.90 USDC', value: 282.90, price: 1.00, week: 0, risk: 'Lower',
        plain: 'A stablecoin: a digital dollar designed to stay worth one US dollar.',
        wrong: 'It depends on the company behind it holding real dollars. If that company runs into trouble, it could lose value.' }
    ],
    cats: [
      { name: 'Home and bills', value: 612.00, icon: 'i-home', cls: 'd' },
      { name: 'Eating out', value: 384.50, icon: 'i-fork', cls: 'a' },
      { name: 'Travel', value: 310.80, icon: 'i-plane', cls: 'b' },
      { name: 'Transport', value: 64.20, icon: 'i-bus', cls: 'c' }
    ],
    activity: [
      { what: 'Corner Market', icon: 'i-bag', cls: 'd', date: 'Today, 18:20', type: 'Card payment', amount: -32.15, status: 'Completed' },
      { what: 'Coffee & Co.', icon: 'i-cup', cls: 'a', date: 'Today, 08:12', type: 'Card payment', amount: -4.80, status: 'Completed' },
      { what: 'From Maya Chen', icon: 'i-receive', cls: 'b', date: 'Yesterday, 19:40', type: 'Received', amount: 25.00, status: 'Completed' },
      { what: 'To Jon Park', icon: 'i-send', cls: 'c', date: '23 Nov, 12:05', type: 'Sent', amount: -18.00, status: 'Pending' },
      { what: 'Bitcoin', icon: 'i-coins', cls: 'd', date: '22 Nov, 09:30', type: 'Bought 0.00078 BTC', amount: -50.00, status: 'Completed' },
      { what: 'From Riverside Bank', icon: 'i-bank', cls: 'b', date: '21 Nov, 07:00', type: 'Added money', amount: 1200.00, status: 'Completed' },
      { what: 'Metro Transit', icon: 'i-bus', cls: 'c', date: '20 Nov, 08:45', type: 'Card payment', amount: -2.90, status: 'Completed' },
      { what: 'Rainy day fund', icon: 'i-star', cls: 'b', date: '20 Nov, 07:00', type: 'Moved to savings', amount: -100.00, status: 'Completed' },
      { what: 'Ethereum', icon: 'i-coins', cls: 'd', date: '19 Nov, 21:10', type: 'Bought 0.02 ETH', amount: -50.00, status: 'Completed' },
      { what: 'Harbour Kitchen', icon: 'i-fork', cls: 'a', date: '18 Nov, 20:30', type: 'Card payment', amount: -46.20, status: 'Completed' },
      { what: 'From Rae Santos', icon: 'i-receive', cls: 'b', date: '17 Nov, 13:15', type: 'Received', amount: 12.50, status: 'Completed' },
      { what: 'Skyline Air', icon: 'i-plane', cls: 'b', date: '15 Nov, 10:02', type: 'Card payment', amount: -310.80, status: 'Completed' },
      { what: 'USD Coin', icon: 'i-coins', cls: 'd', date: '14 Nov, 09:00', type: 'Sold 20 USDC', amount: 20.00, status: 'Completed' },
      { what: 'City Power', icon: 'i-home', cls: 'd', date: '12 Nov, 06:30', type: 'Direct debit', amount: -88.00, status: 'Completed' }
    ],
    more: [
      { sym: 'SOL', name: 'Solana', glyph: 'S', cls: 'sol', amount: '', value: 0, price: 148.30, week: 6.1, risk: 'High',
        plain: 'Runs a fast shared network for apps and payments, similar in idea to Ethereum.',
        wrong: 'It’s younger than Bitcoin and Ethereum and its price has swung more. Its network has also stopped working for hours at a time.' },
      { sym: 'LTC', name: 'Litecoin', glyph: 'Ł', cls: 'ltc', amount: '', value: 0, price: 82.15, week: -0.6, risk: 'High',
        plain: 'One of the oldest cryptocurrencies, made as a quicker, cheaper version of Bitcoin for everyday payments.',
        wrong: 'Fewer people use it than Bitcoin, and its price can still fall sharply in a day.' }
    ],
    guides: [
      { id: 'crypto', t: 'What is cryptocurrency?', min: 3, s: 'Money that exists only in digital form, with no bank in charge.',
        p: ['Cryptocurrency is money that exists only in digital form. No bank or government issues it. Instead, a large network of computers keeps a shared record of who owns what.', 'That shared record is called a blockchain. Each new batch of payments is added to the end, and once it’s added it’s very hard to change.', 'Bitcoin was the first, in 2009. Thousands now exist, and they don’t all work the same way.'],
        key: 'A cryptocurrency is worth what people are willing to pay for it. That’s why its price can move so much.' },
      { id: 'wallet', t: 'What is a digital wallet?', min: 3, s: 'Where your money lives in an app, and what keeps it yours.',
        p: ['A digital wallet is where your money lives in an app. In Aztec, your wallet holds your cash, your savings and any digital assets you own.', 'For crypto, a wallet doesn’t hold coins the way a purse holds notes. It holds the keys that prove the coins on the shared record are yours.', 'Aztec keeps those keys safe for you, so you don’t have to write down long codes. You protect your account with a passcode and Face ID instead.'],
        key: 'Whoever controls the keys controls the money. Never share your passcode or a code sent to your phone.' },
      { id: 'assets', t: 'What are digital assets?', min: 2, s: 'Crypto, stablecoins and why you can own a small part of one.',
        p: ['A digital asset is anything of value that exists in digital form and can be owned and moved. Cryptocurrencies are the best-known kind.', 'Stablecoins, like USD Coin, are digital assets designed to keep a steady value, usually one US dollar.', 'You can own a small part of a digital asset. You don’t need to buy a whole Bitcoin: $10 buys a tiny fraction of one.'],
        key: 'Owning a digital asset isn’t the same as having money in a bank. It usually doesn’t have the same protections.' },
      { id: 'payments', t: 'How do digital payments work?', min: 2, s: 'What happens between pressing Send and the money arriving.',
        p: ['When you send money on Aztec, the app checks you have enough, confirms who you’re paying, then updates both balances. Between two Aztec accounts this takes seconds.', 'Payments to a bank take longer because they pass through banking networks that settle in batches, often within one working day.', 'A payment shows as Pending while it’s on its way, and Completed once it has arrived.'],
        key: 'Always check the name before you send. A payment to the wrong person can be hard to get back.' },
      { id: 'risks', t: 'What are the risks of investing in cryptocurrency?', min: 3, s: 'Price swings, scams and missing protections, plainly.',
        p: ['Prices can fall fast. It’s normal for a cryptocurrency to lose 10% or more in a day, and some have lost almost all their value.', 'Scams are common. Nobody from Aztec will ever ask you to send crypto to “keep it safe”, or promise you a guaranteed return.', 'Digital assets usually aren’t protected the way bank deposits are. If something goes wrong, you may not get your money back.'],
        key: 'Only invest money you could afford to lose, and never borrow to buy crypto.' },
      { id: 'inflation', t: 'What is inflation?', min: 2, s: 'Why the same money buys a little less each year.',
        p: ['Inflation is the general rise in prices over time. When prices go up, each dollar buys a little less than it did before.', 'If prices rise 3% in a year, something that cost $100 now costs $103. Your $100 still says $100, but it buys a bit less.', 'That’s why money left sitting still slowly loses buying power, and why people look for savings that earn interest.'],
        key: 'To keep up, your savings need to grow at least as fast as prices do.' },
      { id: 'interest', t: 'How does interest work?', min: 3, s: 'What you earn on savings, and what you pay when you borrow.',
        p: ['Interest is the price of using money. When you save, the bank or app pays you interest. When you borrow, you pay it.', 'It’s shown as a yearly rate. $1,000 saved at 4% a year earns $40 in the first year.', 'With compound interest, you also earn interest on the interest you’ve already earned. After two years that $1,000 becomes $1,081.60, not $1,080. The same thing works against you on a debt you don’t pay off.'],
        key: 'Compounding helps savings grow and makes unpaid debt grow too. Pay off high-interest debt first.' },
      { id: 'spread', t: 'What does spreading risk mean?', min: 2, s: 'Why it’s safer not to put everything in one place.',
        p: ['Spreading risk means dividing your money between different things, so one bad result can’t wipe out everything.', 'If all your savings are in one cryptocurrency and its price halves, so does your money. If it’s one part of a mix, the damage is smaller.', 'A simple start is to keep your safety-net savings in cash, and only put money you won’t need soon into anything whose price moves.'],
        key: 'Don’t put all your eggs in one basket, especially a basket that can lose value fast.' },
      { id: 'scams', t: 'How do I spot a scam?', min: 3, s: 'The warning signs, and what to do if something feels off.',
        p: ['Scammers rush you. A message saying you must act now, or your account will be closed, is a warning sign.', 'They promise what nobody can. Guaranteed returns, doubling your crypto, or “risk-free” investing don’t exist.', 'They ask for what we never will: your passcode, your card PIN, a code we text you, or a transfer to a “safe account”. If anything feels off, stop, don’t reply, and contact us from inside the app.'],
        key: 'Real companies don’t rush you or ask for your codes. When in doubt, stop and check.' },
      { id: 'safety', t: 'How do I build a safety net?', min: 2, s: 'Money set aside for surprises, before anything else.',
        p: ['A safety net, sometimes called an emergency fund, is money you keep for surprises: a broken phone, a bill you didn’t expect, or a gap between jobs.', 'A common goal is enough to cover three to six months of essential costs. That can feel like a lot, so start small. Even $20 a week adds up to over $1,000 in a year.', 'Keep it somewhere you can reach quickly and whose value doesn’t swing, like a savings goal in cash, not crypto.'],
        key: 'Build your safety net before you invest. It stops a surprise from turning into debt.' }
    ],
    faq: [
      ['Is Aztec available yet?', 'Not yet. Aztec is still being built, and this preview shows how the app is planned to work. Join the waitlist on the Aztec website to hear first when it opens.'],
      ['Is my money safe with Aztec?', 'Before launch we’ll explain exactly how your cash is held and protected, and you’ll see it before you add any money. Digital assets are different: they usually aren’t protected the way bank deposits are.'],
      ['How long do payments take?', 'Between two Aztec accounts, a few seconds. To or from a bank, usually within one working day. While a payment is on its way it shows as Pending.'],
      ['Why do I need to confirm it’s me?', 'The law asks every money app to check who its customers are. It’s called KYC, short for “Know Your Customer”, and it stops other people opening accounts in your name.'],
      ['What fees does Aztec charge?', 'Sending money to other Aztec users is free, and so is adding money from a bank. Adding money by card and buying or selling digital assets have a small fee. We always show it before you confirm.'],
      ['I sent money to the wrong person. What now?', 'Chat with us straight away. Payments between Aztec accounts arrive instantly, so we can’t always stop them, but we’ll contact the other person for you. Checking the name before you send is the best protection.'],
      ['Can I lose money on digital assets?', 'Yes. Prices can fall quickly and some assets have lost almost all their value. Only put in money you could afford to lose, and read the risks guide in Learn first.'],
      ['How do I freeze my card?', 'Open Card and switch on Freeze card, or use Lost your card on this page. You can unfreeze it any time.']
    ],
    sets: {
      security: [['faceid', 'Sign in with Face ID', 'Use your face instead of your passcode on this device', true], ['twostep', '2-step verification', 'We text you a code when you sign in somewhere new', true], ['bigpay', 'Check large payments', 'Ask again before any payment over $500', true]],
      notify: [['npay', 'Payments in and out', 'Every time money moves', true], ['nprice', 'Big price moves', 'When an asset you own moves more than 5% in a day', true], ['ntips', 'Tips and guides', 'Short reads, about once a month', false], ['nnews', 'Product news', 'New features and the launch date', false]],
      prefs: [['hide', 'Hide balances', 'Blur amounts until you turn this off or tap the eye at the top', false]],
      card: [['online', 'Online payments', 'Shopping on websites and in apps', true], ['contactless', 'Contactless', 'Tap to pay in shops', true], ['atm', 'Cash machines', 'Taking out cash', false], ['abroad', 'Payments abroad', 'In other countries and currencies', true]]
    },
    devices: [{ n: 'This browser', s: 'Active now', me: true }, { n: 'iPhone 15', s: 'Aztec app, 2 days ago' }, { n: 'iPad Air', s: 'Aztec app, 3 weeks ago' }],
    limits: {
      no: [['Sending', '$500 a day'], ['Adding money', '$2,000 a month'], ['Buying digital assets', 'After you confirm it’s you']],
      yes: [['Sending', '$10,000 a day'], ['Adding money', '$25,000 a month'], ['Buying digital assets', '$5,000 a day']]
    },
    terms: [
      ['Blockchain', 'A shared record of payments kept by many computers at once, so no single company controls it.'],
      ['KYC', 'Short for “Know Your Customer”: the ID check that stops people opening accounts in your name.'],
      ['Stablecoin', 'A digital asset built to keep a steady value, usually one US dollar.'],
      ['Volatility', 'How much and how quickly a price moves up and down.'],
      ['Pending', 'A payment that’s on its way but hasn’t arrived yet.']
    ],
    start: [
      { id: 'account', title: 'Create your account', sub: 'Done when you signed up', done: true,
        body: '<p>Your Aztec account is ready. You can look around everything without adding any money.</p>' },
      { id: 'verify', title: 'Confirm it’s you', sub: 'About 3 minutes', body: '<p>Before you can hold money, we’ll ask for a photo ID and a quick selfie. Banks call this <b>KYC</b>, short for “Know Your Customer”. It stops other people opening accounts in your name.</p><p class="sheet__fine">In this preview no photos are taken or stored.</p>' },
      { id: 'add', title: 'Add your first money', sub: 'From a bank or a card', body: '<p>You can move money in from your bank (free, usually within a day) or a debit card (instant, with a small fee we show before you confirm).</p>' },
      { id: 'learn', title: 'Learn the basics', sub: 'Ten short guides', body: '<p>Ten short guides in plain English: digital money first (cryptocurrency, wallets, digital assets, payments and the risks), then the money basics (inflation, interest, spreading risk, spotting scams and building a safety net). Read all ten and this step ticks itself off.</p><a class="a-btn a-btn--ghost a-btn--block" href="#learn">Open Learn</a>' }
    ],
    contacts: [{ n: 'Maya Chen', i: 'M', tag: '@maya' }, { n: 'Jon Park', i: 'J', tag: '@jonp' }, { n: 'Rae Santos', i: 'R', tag: '@rae.s' }]
  };
  const TOTAL = SAMPLE.parts.reduce((s, p) => s + p.value, 0);
  const MARKET = SAMPLE.assets.concat(SAMPLE.more);
  const kindOf = t => /^(Bought|Sold)/.test(t.type) ? 'asset' : t.amount > 0 ? 'in' : 'out';
  const pct = w => `${w > 0 ? '+' : w < 0 ? '−' : ''}${Math.abs(w).toFixed(1)}%`;
  const dirCls = w => w > 0 ? 'is-pos' : w < 0 ? 'is-neg' : '';
  const PKEY = 'aztec.prefs';
  let prefs = {}; try { prefs = JSON.parse(localStorage.getItem(PKEY) || '{}'); } catch (e) {}
  prefs.sets = prefs.sets || {};
  const savePrefs = () => { try { localStorage.setItem(PKEY, JSON.stringify(prefs)); } catch (e) {} };
  const setOn = (k, def) => k in prefs.sets ? prefs.sets[k] : def;

  /* ── greeting by time of day ── */
  const hr = new Date().getHours();
  $('[data-greet]').textContent = hr < 12 ? 'Good morning' : hr < 18 ? 'Good afternoon' : 'Good evening';

  /* ── portfolio dial: the turn ── */
  const pf = $('[data-pf]');
  const ticks = $('[data-pf-ticks]'), arcs = $('[data-pf-arcs]'), legend = $('[data-pf-legend]');
  for (let i = 0; i < 72; i++) {
    const a = (i / 72) * Math.PI * 2 - Math.PI / 2, major = i % 6 === 0;
    const l = document.createElementNS(SVGNS, 'line');
    const r1 = major ? 146 : 150, r2 = 156;
    l.setAttribute('x1', 160 + r1 * Math.cos(a)); l.setAttribute('y1', 160 + r1 * Math.sin(a));
    l.setAttribute('x2', 160 + r2 * Math.cos(a)); l.setAttribute('y2', 160 + r2 * Math.sin(a));
    l.setAttribute('class', major ? 'is-major' : ''); l.style.setProperty('--i', i);
    ticks.append(l);
  }
  const GAP = 1.2; let start = 0;
  SAMPLE.parts.forEach(p => {
    const pct = p.value / TOTAL * 100;
    const c = document.createElementNS(SVGNS, 'circle');
    c.setAttribute('cx', 160); c.setAttribute('cy', 160); c.setAttribute('r', 124); c.setAttribute('pathLength', 100);
    c.setAttribute('class', 'pf__arc'); c.dataset.part = p.id;
    c.style.stroke = p.color;
    c.style.setProperty('--len', Math.max(0, pct - GAP));
    c.style.setProperty('--off', -start);
    arcs.append(c);
    start += pct;
    const li = document.createElement('li');
    li.dataset.part = p.id; li.tabIndex = 0;
    li.innerHTML = `<i style="background:${p.color}"></i><span><b>${p.name}</b><small>${p.plain}</small></span><span class="pf__amt"><b>${money(p.value)}</b><small>${Math.round(pct)}%</small></span>`;
    legend.append(li);
  });
  const focusPart = id => { pf.dataset.focus = id || ''; $$('li', legend).forEach(li => li.classList.toggle('is-dim', !!id && li.dataset.part !== id)); };
  $$('li', legend).forEach(li => {
    ['pointerenter', 'focus'].forEach(t => li.addEventListener(t, () => focusPart(li.dataset.part)));
    ['pointerleave', 'blur'].forEach(t => li.addEventListener(t, () => focusPart(null)));
  });
  $('[data-pf-total]').textContent = money(TOTAL);

  /* ── digital assets ── */
  $('[data-assets]').innerHTML = SAMPLE.assets.map((a, k) => `
    <button type="button" class="as__row" data-asset="${k}" data-q>
      <span class="a-coin as__coin as__coin--${a.cls}">${a.glyph}</span>
      <span class="as__name"><b>${a.name}</b><small>${a.amount}</small></span>
      <span class="as__plain">${a.plain}</span>
      <span class="as__risk as__risk--${a.risk.toLowerCase()}">${a.risk} risk</span>
      <span class="as__val"><b>${money(a.value)}</b><small class="${a.week > 0 ? 'is-pos' : a.week < 0 ? 'is-neg' : ''}">${a.week > 0 ? '+' : a.week < 0 ? '−' : ''}${Math.abs(a.week).toFixed(1)}% this week</small></span>
    </button>`).join('');

  /* ── spending categories ── */
  const maxCat = Math.max(...SAMPLE.cats.map(c => c.value));
  $('[data-cats]').innerHTML = SAMPLE.cats.map(c => `
    <li><span class="a-ico a-ico--${c.cls}"><svg class="ic"><use href="#${c.icon}"/></svg></span><span class="cat__t"><b>${c.name}</b><i style="--w:${(c.value / maxCat * 100).toFixed(1)}%"></i></span><b class="cat__v">${money(c.value)}</b></li>`).join('');

  /* ── recent activity ── */
  const txRow = (t, k) => `
    <tr data-q data-kind="${kindOf(t)}">
      <td><button type="button" class="tbl__what" data-tx="${k}"><span class="a-ico a-ico--${t.cls}"><svg class="ic"><use href="#${t.icon}"/></svg></span><span><b>${esc(t.what)}</b><small class="tbl__m">${t.type}, ${t.date}</small></span></button></td>
      <td class="tbl__d">${t.date}</td>
      <td class="tbl__d">${t.type}</td>
      <td class="num"><b class="${t.amount > 0 ? 'is-pos' : ''}">${money(t.amount, true)}</b></td>
      <td><span class="st st--${t.status.toLowerCase()}">${t.status}</span></td>
    </tr>`;
  $('[data-activity]').innerHTML = SAMPLE.activity.slice(0, 6).map(txRow).join('');
  $('[data-activity-all]').innerHTML = SAMPLE.activity.map(txRow).join('');

  /* ── getting started checklist (remembered on this device) ── */
  const KEY = 'aztec.start';
  let saved = {}; try { saved = JSON.parse(localStorage.getItem(KEY) || '{}'); } catch (e) {}
  const startEl = $('[data-start]');
  const isDone = s => s.done || !!(saved.done || {})[s.id];
  const drawStart = () => {
    const n = SAMPLE.start.filter(isDone).length;
    $$('[data-start-count]').forEach(e => { e.textContent = `${n} of ${SAMPLE.start.length} done`; });
    $$('[data-start-bar]').forEach(e => { e.style.width = (n / SAMPLE.start.length * 100) + '%'; });
    const html = SAMPLE.start.map((s, k) => `
      <li class="${isDone(s) ? 'is-done' : ''}"><button type="button" data-step="${k}">
        <span class="start__tick" aria-hidden="true"><svg class="ic"><use href="#i-check"/></svg></span>
        <span><b>${s.title}</b><small>${isDone(s) ? 'Done' : s.sub}</small></span>
        <svg class="ic start__go" aria-hidden="true"><use href="#i-chevr"/></svg>
        <span class="sr-only">${isDone(s) ? '(done)' : '(to do)'}</span>
      </button></li>`).join('');
    $$('[data-start-list]').forEach(e => { e.innerHTML = html; });
    drawVerify();
  };
  const verified = () => isDone(SAMPLE.start[1]);
  function drawVerify() {
    const v = verified(), b = $('[data-verify-badge]');
    b.textContent = v ? 'Verified' : 'Not verified yet'; b.className = 'st prof__st ' + (v ? 'st--on' : 'st--pending');
    $('[data-verify-cta]').hidden = v;
    $('[data-limit-note]').textContent = v ? 'You’ve confirmed it’s you, so these are your full limits.' : 'These rise once you’ve confirmed it’s you.';
    $('[data-limits]').innerHTML = SAMPLE.limits[v ? 'yes' : 'no'].map(([k, x]) => `<div><dt>${k}</dt><dd>${x}</dd></div>`).join('');
  }
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(saved)); } catch (e) {} };
  if (saved.hidden) startEl.hidden = true;
  drawStart();
  $('[data-start-hide]').addEventListener('click', () => { saved.hidden = true; save(); startEl.hidden = true; toast('Getting started is hidden. It’s always in Learn.'); });

  /* ── toast ── */
  const toastEl = $('[data-toast]'); let toastT;
  const toast = msg => { toastEl.textContent = msg; toastEl.classList.add('is-on'); clearTimeout(toastT); toastT = setTimeout(() => toastEl.classList.remove('is-on'), 3200); };

  /* ── preview sheets ── */
  const dlg = $('[data-dialog]'), dTitle = $('[data-sheet-title]'), dBody = $('[data-sheet-body]');
  let opener = null;
  const PREVIEW = '<p class="sheet__fine"><svg class="ic"><use href="#i-info"/></svg>This is a preview. No money moves and nothing is sent.</p>';
  const open = (title, html, after) => {
    const wasOpen = dlg.open;
    if (!wasOpen) opener = document.activeElement;
    dTitle.textContent = title; dBody.innerHTML = html; dlg.scrollTop = 0;
    if (!wasOpen) { if (typeof dlg.showModal === 'function') dlg.showModal(); else dlg.setAttribute('open', ''); }
    after && after();
  };
  const close = () => { dlg.close ? dlg.close() : dlg.removeAttribute('open'); };
  dlg.addEventListener('close', () => { opener && opener.focus && opener.focus(); });
  dlg.addEventListener('click', e => { if (e.target === dlg) close(); });
  $('[data-close]').addEventListener('click', close);

  const sendSheet = (w = 0) => {
    let who = typeof w === 'number' ? w : 0, amt = '25';
    const draw = () => {
      dBody.innerHTML = `
        <div class="send__to" role="radiogroup" aria-label="Send to">${SAMPLE.contacts.map((c, k) => `<button type="button" role="radio" aria-checked="${k === who}" data-who="${k}"><span class="a-avatar">${c.i}</span>${c.n.split(' ')[0]}</button>`).join('')}</div>
        <label class="send__amt"><span class="sr-only">Amount in US dollars</span><span aria-hidden="true">$</span><input inputmode="decimal" value="${amt}" data-amt aria-describedby="send-help"></label>
        <p class="send__help" id="send-help">Your cash balance is ${money(SAMPLE.parts[0].value)}.</p>
        <dl class="facts"><div><dt>Fee</dt><dd>$0.00</dd></div><div><dt>Arrives</dt><dd>Instantly</dd></div><div><dt>${SAMPLE.contacts[who].n.split(' ')[0]} gets</dt><dd data-gets>${money(+amt || 0)}</dd></div></dl>
        <button type="button" class="a-btn a-btn--block" data-send>Send ${money(+amt || 0)}</button>${PREVIEW}`;
      $$('[data-who]', dBody).forEach(b => b.addEventListener('click', () => { who = +b.dataset.who; draw(); }));
      const inp = $('[data-amt]', dBody);
      inp.addEventListener('input', () => {
        amt = inp.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');
        if (inp.value !== amt) inp.value = amt;
        const v = +amt || 0, over = v > SAMPLE.parts[0].value;
        $('[data-gets]', dBody).textContent = money(v);
        $('[data-send]', dBody).textContent = 'Send ' + money(v);
        $('[data-send]', dBody).disabled = !v || over;
        const help = $('#send-help', dBody);
        help.textContent = over ? `That’s more than your cash balance of ${money(SAMPLE.parts[0].value)}. Enter a smaller amount.` : `Your cash balance is ${money(SAMPLE.parts[0].value)}.`;
        help.classList.toggle('is-bad', over);
      });
      $('[data-send]', dBody).addEventListener('click', () => {
        const c = SAMPLE.contacts[who], v = money(+amt);
        dTitle.textContent = 'Sent';
        dBody.innerHTML = `<div class="done"><span class="done__ic"><svg class="ic"><use href="#i-check"/></svg></span><p><b>${v} sent to ${c.n}</b>In the real app, ${c.n.split(' ')[0]} would get it right away.</p></div><button type="button" class="a-btn a-btn--block" data-close-2>Done</button>${PREVIEW}`;
        $('[data-close-2]', dBody).addEventListener('click', close);
        $('[data-close-2]', dBody).focus();
      });
    };
    open('Send money', '', () => { draw(); $('[data-amt]', dBody).focus(); });
  };

  const qr = () => {
    // a decorative code pattern for the preview: it does not encode anything
    let seed = 7, cells = '';
    const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    const finder = (x, y) => `<rect x="${x}" y="${y}" width="7" height="7" rx="1.6" fill="none" stroke="currentColor" stroke-width="1"/><rect x="${x + 2}" y="${y + 2}" width="3" height="3" rx=".6"/>`;
    for (let y = 0; y < 25; y++) for (let x = 0; x < 25; x++) {
      const inF = (x < 8 && y < 8) || (x > 16 && y < 8) || (x < 8 && y > 16);
      if (!inF && rnd() > .55) cells += `<rect x="${x}" y="${y}" width="1" height="1" rx=".3"/>`;
    }
    return `<svg class="qr" viewBox="-1 -1 27 27" aria-hidden="true">${cells}${finder(.5, .5)}${finder(17.5, .5)}${finder(.5, 17.5)}</svg>`;
  };
  const receiveSheet = () => open('Receive money', `
    <div class="recv">${qr()}<p>People on Aztec can pay you with your tag or by scanning your code.</p>
    <div class="recv__tag"><span><small>Your Aztec tag</small><b>@alex.rivera</b></span><button type="button" class="a-pill" data-copy><svg class="ic"><use href="#i-copy"/></svg>Copy</button></div></div>${PREVIEW.replace('No money moves and nothing is sent.', 'The code is a placeholder and can’t be scanned.')}`, () => {
    $('[data-copy]', dBody).addEventListener('click', async () => {
      try { await navigator.clipboard.writeText('@alex.rivera'); } catch (e) {}
      toast('Copied @alex.rivera');
    });
  });

  /* amount field shared by Add money and Buy/Sell */
  const amtField = (v, label) => `<label class="send__amt"><span class="sr-only">${label}</span><span aria-hidden="true">$</span><input inputmode="decimal" value="${v}" data-amt aria-describedby="amt-help"></label>`;
  const bindAmt = fn => { const inp = $('[data-amt]', dBody); inp.addEventListener('input', () => { const c = inp.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1'); if (c !== inp.value) inp.value = c; fn(+c || 0); }); fn(+inp.value || 0); inp.focus(); inp.select(); };
  const doneView = (title, head, line, btn = 'Done') => { dTitle.textContent = title; dBody.innerHTML = `<div class="done"><span class="done__ic"><svg class="ic"><use href="#i-check"/></svg></span><p><b>${head}</b>${line}</p></div><button type="button" class="a-btn a-btn--block" data-close-2>${btn}</button>${PREVIEW}`; $('[data-close-2]', dBody).addEventListener('click', close); $('[data-close-2]', dBody).focus(); };

  const addSheet = () => {
    let how = 'bank';
    const M = { bank: ['Bank transfer', 'i-bank', 'b', 0, 'Usually within one working day'], card: ['Debit card', 'i-card', 'c', .015, 'Right away'] };
    open('Add money', `
      <div class="pick" role="radiogroup" aria-label="Add money from">${Object.entries(M).map(([k, m]) => `<button type="button" role="radio" aria-checked="${k === how}" data-how="${k}"><span class="a-ico a-ico--${m[2]}"><svg class="ic"><use href="#${m[1]}"/></svg></span><span><b>${m[0]}</b><small>${k === 'bank' ? 'Free' : '1.5% fee'}</small></span></button>`).join('')}</div>
      ${amtField(100, 'Amount to add in US dollars')}
      <p class="send__help" id="amt-help">You can add up to $2,000 this month.</p>
      <dl class="facts"><div><dt>Fee</dt><dd data-fee></dd></div><div><dt>Arrives</dt><dd data-arr></dd></div><div><dt>You get</dt><dd data-get></dd></div></dl>
      <button type="button" class="a-btn a-btn--block" data-go></button>
      <p class="sheet__fine"><svg class="ic"><use href="#i-lock"/></svg>We’ll never ask for your online banking password. You connect your bank on its own secure screen.</p>`, () => {
      let v = 0;
      const draw = () => {
        const m = M[how], fee = Math.round(v * m[3] * 100) / 100, over = v > 2000;
        $('[data-fee]', dBody).textContent = money(fee); $('[data-arr]', dBody).textContent = m[4]; $('[data-get]', dBody).textContent = money(v);
        const go = $('[data-go]', dBody); go.textContent = `Add ${money(v + fee)}`; go.disabled = !v || over;
        const h = $('#amt-help', dBody); h.textContent = over ? 'That’s more than your $2,000 monthly limit. Enter a smaller amount.' : 'You can add up to $2,000 this month.'; h.classList.toggle('is-bad', over);
      };
      $$('[data-how]', dBody).forEach(b => b.addEventListener('click', () => { how = b.dataset.how; $$('[data-how]', dBody).forEach(x => x.setAttribute('aria-checked', x === b)); draw(); }));
      bindAmt(x => { v = x; draw(); });
      $('[data-go]', dBody).addEventListener('click', () => doneView('Money added', `${money(v)} on its way`, how === 'bank' ? 'In the real app it would arrive within one working day.' : 'In the real app it would be in your cash balance right away.'));
    });
  };

  const tradeSheet = (k, side) => {
    const a = MARKET[k], buy = side === 'buy';
    if (buy && !verified()) return open(`Buy ${a.name}`, `<p>Before you can buy digital assets, we need to confirm it’s you. It takes about 3 minutes and you only do it once.</p><button type="button" class="a-btn a-btn--block" data-kyc-go>Confirm it’s you</button>`, () => $('[data-kyc-go]', dBody).addEventListener('click', kycSheet));
    const max = buy ? SAMPLE.parts[0].value : a.value;
    open(`${buy ? 'Buy' : 'Sell'} ${a.name}`, `
      ${amtField(buy ? 25 : Math.min(25, a.value), `Amount to ${side} in US dollars`)}
      <p class="send__help" id="amt-help"></p>
      <dl class="facts"><div><dt>Price</dt><dd>${money(a.price)}</dd></div><div><dt>Fee, 1%</dt><dd data-fee></dd></div><div><dt>${buy ? 'You get about' : 'You sell about'}</dt><dd data-get></dd></div></dl>
      ${buy ? `<div class="ack"><input type="checkbox" id="ack" data-ack><label for="ack">I understand the price of ${a.name} can fall and I could lose the money I put in.</label></div>` : ''}
      <button type="button" class="a-btn a-btn--block" data-go></button>
      <p class="sheet__fine"><svg class="ic"><use href="#i-info"/></svg>Prices are samples. In the real app the price is fixed for 30 seconds while you decide.</p>`, () => {
      let v = 0;
      const draw = () => {
        const fee = Math.round(v * 1) / 100, over = v > max, units = (buy ? v - fee : v) / a.price, ack = !buy || $('[data-ack]', dBody).checked;
        $('[data-fee]', dBody).textContent = money(fee);
        $('[data-get]', dBody).textContent = `${units < 1 ? units.toFixed(6) : units.toFixed(2)} ${a.sym}`;
        const h = $('#amt-help', dBody);
        h.textContent = over ? (buy ? `That’s more than your cash balance of ${money(max)}.` : `You own ${money(max)} of ${a.name}.`) : (buy ? `From your cash balance of ${money(max)}.` : `You own ${money(max)} of ${a.name}.`);
        h.classList.toggle('is-bad', over);
        const go = $('[data-go]', dBody); go.textContent = `${buy ? 'Buy' : 'Sell'} ${money(v)}`; go.disabled = !v || over || !ack;
      };
      bindAmt(x => { v = x; draw(); });
      buy && $('[data-ack]', dBody).addEventListener('change', draw);
      $('[data-go]', dBody).addEventListener('click', () => doneView(buy ? 'Bought' : 'Sold', `${buy ? 'Bought' : 'Sold'} ${money(v)} of ${a.name}`, buy ? 'In the real app it would appear in your digital assets right away.' : 'In the real app the cash would be in your balance right away.'));
    });
  };

  const kycSheet = () => {
    let step = 0, doc = 'passport', shot = false, selfie = false;
    const STEPS = ['Your details', 'Photo ID', 'A quick selfie'];
    const draw = () => {
      dTitle.textContent = step < 3 ? 'Confirm it’s you' : 'You’re verified';
      if (step === 3) {
        saved.done = Object.assign({}, saved.done, { verify: true }); save(); drawStart();
        return doneView('You’re verified', 'Thanks, Alex', 'In the real app this check usually takes a few minutes. Your limits are now higher and you can buy digital assets.');
      }
      const body = [
        `<dl class="kv"><div><dt>Legal name</dt><dd>Alex Rivera</dd></div><div><dt>Country</dt><dd>United States</dd></div></dl>
         <label class="fld"><span>Date of birth</span><input value="14 March 1994" autocomplete="bday" data-dob></label>
         <p class="sheet__p">Your name must match your ID exactly.</p>`,
        `<div class="pick pick--3" role="radiogroup" aria-label="Type of ID">${[['passport', 'Passport'], ['licence', 'Driving licence'], ['id', 'National ID card']].map(([k, n]) => `<button type="button" role="radio" aria-checked="${k === doc}" data-doc="${k}"><b>${n}</b></button>`).join('')}</div>
         <button type="button" class="cap ${shot ? 'is-ok' : ''}" data-shot><svg class="ic"><use href="#${shot ? 'i-check' : 'i-card'}"/></svg><span><b>${shot ? 'Photo added' : 'Take a photo of your ID'}</b><small>${shot ? 'Clear and readable' : 'Lay it flat in good light'}</small></span></button>`,
        `<button type="button" class="cap ${selfie ? 'is-ok' : ''}" data-selfie><svg class="ic"><use href="#${selfie ? 'i-check' : 'i-user'}"/></svg><span><b>${selfie ? 'Selfie added' : 'Take a selfie'}</b><small>${selfie ? 'It matches your ID photo' : 'We compare it with your ID photo'}</small></span></button>
         <p class="sheet__p">We use it only to check it’s really you, then delete it.</p>`
      ][step];
      dBody.innerHTML = `<div class="kyc"><div class="start__bar" aria-hidden="true"><i style="width:${(step + 1) / 3 * 100}%"></i></div><p class="kyc__n" aria-live="polite">Step ${step + 1} of 3: ${STEPS[step]}</p></div>${body}
        <div class="sheet__row">${step ? '<button type="button" class="a-btn a-btn--ghost" data-back>Back</button>' : ''}<button type="button" class="a-btn" data-next ${(step === 1 && !shot) || (step === 2 && !selfie) ? 'disabled' : ''}>${step === 2 ? 'Submit' : 'Continue'}</button></div>
        <p class="sheet__fine"><svg class="ic"><use href="#i-info"/></svg>In this preview no photos are taken or stored.</p>`;
      const on = (sel, fn) => { const e = $(sel, dBody); e && e.addEventListener('click', fn); };
      on('[data-next]', () => { step++; draw(); const f = $('[data-next], [data-close-2]', dBody); f && f.focus(); });
      on('[data-back]', () => { step--; draw(); });
      on('[data-shot]', () => { shot = true; draw(); $('[data-next]', dBody).focus(); });
      on('[data-selfie]', () => { selfie = true; draw(); $('[data-next]', dBody).focus(); });
      $$('[data-doc]', dBody).forEach(b => b.addEventListener('click', () => { doc = b.dataset.doc; shot = false; draw(); }));
    };
    open('Confirm it’s you', '', draw);
  };

  const setSwitches = group => SAMPLE.sets[group].map(([k, t, d, def]) => `<div class="wc__row"><span><b id="set-${k}">${t}</b><small>${d}</small></span><button type="button" class="sw" role="switch" aria-checked="${k === 'hide' ? !!prefs.hide : setOn(k, def)}" aria-labelledby="set-${k}" data-set="${k}"><i></i></button></div>`).join('');
  const statementSheet = () => open('Statements', `<ul class="opts">${[['November 2026', 'Ready on 1 December', false], ['October 2026', '18 transactions', true], ['September 2026', '23 transactions', true]].map(([m, d, ok]) => `<li class="opts__dl"><span class="a-ico a-ico--b"><svg class="ic"><use href="#i-doc"/></svg></span><span><b>${m}</b><small>${d}</small></span>${ok ? `<button type="button" class="a-pill" data-soon="Downloading statements">PDF</button>` : ''}</li>`).join('')}</ul>${PREVIEW}`);
  const chatSheet = () => {
    open('Chat with us', `<div class="chat" data-chat aria-live="polite"><p class="chat__m">Hi Alex, I’m Sam from Aztec support. What can I help with today?</p></div>
      <form class="chat__f" data-chat-f><label class="sr-only" for="chat-in">Your message</label><input id="chat-in" placeholder="Type your message" autocomplete="off"><button type="submit" class="a-iconbtn" aria-label="Send message"><svg class="ic"><use href="#i-send"/></svg></button></form>
      <p class="sheet__fine"><svg class="ic"><use href="#i-info"/></svg>Preview: replies are automatic and nothing is sent.</p>`, () => {
      const f = $('[data-chat-f]', dBody), inp = $('#chat-in', dBody), log = $('[data-chat]', dBody);
      inp.focus();
      f.addEventListener('submit', e => {
        e.preventDefault(); const t = inp.value.trim(); if (!t) return;
        log.insertAdjacentHTML('beforeend', `<p class="chat__m chat__m--me">${esc(t)}</p>`); inp.value = '';
        setTimeout(() => { log.insertAdjacentHTML('beforeend', '<p class="chat__m">Thanks for your message. In the real app a person would reply here. Until then, the answers on this Help page cover the most common questions.</p>'); log.scrollTop = log.scrollHeight; }, reduced ? 0 : 900);
      });
    });
  };
  const closeSheet = () => open('Close account', `<p>You can close your Aztec account at any time. First we’ll help you move out your cash and sell or send any digital assets, so nothing is left behind.</p><p class="sheet__p">Your statements stay available for 5 years after you close.</p><button type="button" class="a-btn a-btn--ghost a-btn--block" disabled>Start closing my account</button>${PREVIEW}`);

  const accountSheet = () => open('Alex Rivera', `
    <ul class="docs">
      <li><a href="#payments"><span class="a-ico a-ico--b"><svg class="ic"><use href="#i-swap"/></svg></span><span><b>Payments</b><small>Requests and repeating payments</small></span><svg class="ic start__go"><use href="#i-chevr"/></svg></a></li>
      <li><a href="#insights"><span class="a-ico a-ico--a"><svg class="ic"><use href="#i-chart"/></svg></span><span><b>Insights</b><small>Where your money went and budgets</small></span><svg class="ic start__go"><use href="#i-chevr"/></svg></a></li>
      <li><a href="#card"><span class="a-ico a-ico--c"><svg class="ic"><use href="#i-nfc"/></svg></span><span><b>Card</b><small>Freeze, limits and an online card</small></span><svg class="ic start__go"><use href="#i-chevr"/></svg></a></li>
      <li><a href="#fees"><span class="a-ico a-ico--d"><svg class="ic"><use href="#i-doc"/></svg></span><span><b>Fees</b><small>What you paid and every fee</small></span><svg class="ic start__go"><use href="#i-chevr"/></svg></a></li>
      <li><a href="#settings"><span class="a-ico a-ico--b"><svg class="ic"><use href="#i-gear"/></svg></span><span><b>Settings</b><small>Details, security and notifications</small></span><svg class="ic start__go"><use href="#i-chevr"/></svg></a></li>
      <li><a href="#help"><span class="a-ico a-ico--c"><svg class="ic"><use href="#i-help"/></svg></span><span><b>Help</b><small>Answers, chat and lost card</small></span><svg class="ic start__go"><use href="#i-chevr"/></svg></a></li>
    </ul>
    <div class="sheet__row"><button type="button" class="a-btn a-btn--ghost" data-signout>Sign out</button><a class="a-btn a-btn--ghost" href="../index.html">Aztec website</a></div>${PREVIEW}`);

  const bell = $('[data-bell]');
  const drawBell = () => { bell.classList.toggle('a-iconbtn--dot', !prefs.alertsRead); bell.setAttribute('aria-label', prefs.alertsRead ? 'Notifications' : 'Notifications, 2 new'); };
  const alertsSheet = () => open('Notifications', `
    <ul class="opts ${prefs.alertsRead ? '' : 'is-new'}">
      <li><span class="a-ico a-ico--b"><svg class="ic"><use href="#i-receive"/></svg></span><span><b>Maya Chen sent you $25.00</b><small>Yesterday, 19:40</small></span></li>
      <li><span class="a-ico a-ico--d"><svg class="ic"><use href="#i-info"/></svg></span><span><b>Bitcoin moved more than 5% this week</b><small>Prices can swing like this. Nothing to do unless you want to.</small></span></li>
      <li><span class="a-ico a-ico--c"><svg class="ic"><use href="#i-shield"/></svg></span><span><b>New sign-in on iPhone 15</b><small>2 days ago. Not you? Remove it in Settings.</small></span></li>
    </ul>
    ${prefs.alertsRead ? '<p class="sheet__p">You’re all caught up.</p>' : '<button type="button" class="a-btn a-btn--ghost a-btn--block" data-readall>Mark all as read</button>'}
    <a class="more" href="#settings">Choose what we notify you about</a>`, () => {
    const r = $('[data-readall]', dBody);
    r && r.addEventListener('click', () => { prefs.alertsRead = true; savePrefs(); drawBell(); close(); toast('All caught up'); });
  });
  drawBell();

  const txSheet = k => {
    const t = SAMPLE.activity[k], kind = kindOf(t);
    const what = { in: 'Money that arrived in your cash balance.', out: 'Money that left your cash balance.', asset: 'A digital asset you bought or sold. The amount is what it cost or what you got back in cash.' }[kind];
    open(t.what, `
      <div class="asd"><span class="a-ico a-ico--${t.cls}"><svg class="ic"><use href="#${t.icon}"/></svg></span><span><small>${t.type}</small><b class="${t.amount > 0 ? 'is-pos' : ''}">${money(t.amount, true)}</b></span></div>
      <dl class="facts"><div><dt>Status</dt><dd>${t.status}</dd></div><div><dt>Date</dt><dd>${t.date}</dd></div><div><dt>Fee</dt><dd>$0.00</dd></div></dl>
      <h3 class="sheet__h">What this is</h3><p class="sheet__p">${what}${t.status === 'Pending' ? ' It’s still on its way. Payments between Aztec accounts usually complete within a few minutes.' : ''}</p>
      <p class="sheet__p">Reference <b>TQ-11${String(26 - k).padStart(2, '0')}-${String(4810 + k * 37)}</b></p>
      <button type="button" class="a-btn a-btn--ghost a-btn--block" disabled>Report a problem</button>${PREVIEW}`);
  };

  /* ── learn: guides, read state remembered on this device ── */
  const LKEY = 'aztec.learn';
  let read = {}; try { read = JSON.parse(localStorage.getItem(LKEY) || '{}'); } catch (e) {}
  const drawGuides = () => {
    const n = SAMPLE.guides.filter(g => read[g.id]).length;
    $('[data-gd-count]').textContent = `${n} of ${SAMPLE.guides.length} read`;
    $('[data-gd-bar]').style.width = (n / SAMPLE.guides.length * 100) + '%';
    $('[data-guides]').innerHTML = SAMPLE.guides.map((g, k) => `
      <li data-q class="${read[g.id] ? 'is-done' : ''}"><button type="button" data-guide="${k}">
        <span class="gd__n" aria-hidden="true">${read[g.id] ? '<svg class="ic"><use href="#i-check"/></svg>' : k + 1}</span>
        <span><b>${g.t}</b><small>${g.s}</small></span>
        <span class="gd__m">${read[g.id] ? 'Read' : g.min + ' min'}</span>
      </button></li>`).join('');
    filterAll();
  };
  const guideSheet = k => {
    const g = SAMPLE.guides[k], next = SAMPLE.guides[k + 1];
    open(g.t, g.p.map(x => `<p>${x}</p>`).join('') +
      `<div class="tip"><span class="a-ico a-ico--sky"><svg class="ic"><use href="#i-spark"/></svg></span><p><b>The key idea</b>${g.key}</p></div>
      <div class="sheet__row">${next ? `<button type="button" class="a-btn a-btn--ghost" data-next>Next guide</button>` : ''}<button type="button" class="a-btn" data-read>${read[g.id] ? 'Done' : 'Mark as read'}</button></div>`, () => {
      const mark = () => {
        read[g.id] = true; try { localStorage.setItem(LKEY, JSON.stringify(read)); } catch (e) {}
        if (SAMPLE.guides.every(x => read[x.id]) && !isDone(SAMPLE.start[3])) { saved.done = Object.assign({}, saved.done, { learn: true }); save(); drawStart(); toast(`All ${SAMPLE.guides.length} guides read. “Learn the basics” is done.`); }
        drawGuides();
      };
      $('[data-read]', dBody).addEventListener('click', () => { const was = read[g.id]; mark(); close(); if (!was && !SAMPLE.guides.every(x => read[x.id])) toast(`Marked “${g.t}” as read`); });
      const nx = $('[data-next]', dBody); nx && nx.addEventListener('click', () => { mark(); guideSheet(k + 1); });
    });
  };
  $('[data-terms]').innerHTML = SAMPLE.terms.map(([t, d]) => `<div data-q><dt>${t}</dt><dd>${d}</dd></div>`).join('');

  /* ── wallet ── */
  $('[data-w-cash]').textContent = money(SAMPLE.parts[0].value);
  $('[data-copy-details]').addEventListener('click', async () => {
    try { await navigator.clipboard.writeText('Alex Rivera\nAccount number 0000 4827 1093\nRouting number 000 000 027'); } catch (e) {}
    toast('Account details copied');
  });
  $('[data-w-total]').textContent = 'Total ' + money(TOTAL);
  $('[data-w-bal]').innerHTML = [
    { ...SAMPLE.parts[0], icon: 'i-card', ic: 'b', sub: 'US dollars' },
    { ...SAMPLE.parts[2], icon: 'i-star', ic: 'c', sub: 'Rainy day fund' }
  ].map(p => `
    <div class="as__row as__row--static" data-q>
      <span class="a-ico a-ico--${p.ic} as__coin"><svg class="ic"><use href="#${p.icon}"/></svg></span>
      <span class="as__name"><b>${p.name}</b><small>${p.sub}</small></span>
      <span class="as__plain">${p.plain}</span>
      <span class="as__risk as__risk--none">Steady value</span>
      <span class="as__val"><b>${money(p.value)}</b><small>Ready</small></span>
    </div>`).join('') + $('[data-assets]').innerHTML;
  const sw = (el, fn) => el.addEventListener('click', () => { const on = el.getAttribute('aria-checked') !== 'true'; el.setAttribute('aria-checked', on); fn(on); });
  function setFreeze(on) {
    $$('[data-freeze]').forEach(x => x.setAttribute('aria-checked', on)); $$('[data-card]').forEach(c => c.classList.toggle('is-frozen', on));
    $$('[data-card-state]').forEach(c => { c.textContent = on ? 'Frozen' : 'Active'; c.className = 'st ' + (on ? 'st--pending' : 'st--on'); });
    const lb = $('.lost [data-lost]'); lb.textContent = on ? 'Your card is frozen' : 'Freeze my card'; lb.disabled = on;
    toast(on ? 'Card frozen. New card payments will be declined.' : 'Card unfrozen. You can pay with it again.');
  }
  $$('[data-freeze]').forEach(f => f.addEventListener('click', () => setFreeze(f.getAttribute('aria-checked') !== 'true')));
  $$('[data-cardno]').forEach(c => sw(c, on => { $$('[data-cardno]').forEach(x => x.setAttribute('aria-checked', on)); $$('[data-card-no]').forEach(n => { n.textContent = on ? '4000 1234 5678 2027' : '•••• 2027'; }); }));

  const saveSheet = () => open('Move to savings', `
    <div class="asd"><span class="a-ico a-ico--c"><svg class="ic"><use href="#i-star"/></svg></span><span><small>Rainy day fund</small><b>$919.00 <span class="goal__of">of $1,500</span></b></span></div>
    <p class="sheet__p">Money in savings stays yours and you can move it back at any time. Keeping it apart just makes it harder to spend by accident.</p>
    <div class="sheet__row"><button type="button" class="a-btn a-btn--ghost" disabled>$25</button><button type="button" class="a-btn" disabled>$50</button><button type="button" class="a-btn a-btn--ghost" disabled>$100</button></div>${PREVIEW}`);

  /* ── explore ── */
  const spark = (a, k) => {
    let seed = 11 + k * 31; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    const vol = a.sym === 'USDC' ? .0006 : .012, N = 28, pts = [];
    let v = 0; for (let i = 0; i < N; i++) { v += (rnd() - .5) * vol * 2; pts.push(v + a.week / 100 * i / (N - 1)); }
    const off = pts[0]; pts.forEach((p, i) => { pts[i] = p - off; });
    const lo = Math.min(...pts), hi = Math.max(...pts), span = Math.max(hi - lo, .04), mid = (hi + lo) / 2;
    const xy = pts.map((p, i) => `${(i / (N - 1) * 120).toFixed(1)},${(18 - (p - mid) / span * 30).toFixed(1)}`).join(' ');
    return `<svg class="ex__spark ${dirCls(a.week) || 'is-flat'}" viewBox="0 0 120 36" preserveAspectRatio="none" aria-hidden="true"><polyline points="${xy}"/></svg>`;
  };
  $('[data-explore]').innerHTML = MARKET.map((a, k) => `
    <button type="button" class="ex__c panel" data-asset="${k}" data-q data-kind="${a.risk === 'High' ? 'high' : 'lower'}${a.value ? ' owned' : ''}">
      <span class="ex__top"><span class="a-coin as__coin--${a.cls}">${a.glyph}</span><span class="ex__n"><b>${a.name}</b><small>${a.sym}</small></span><span class="as__risk as__risk--${a.risk.toLowerCase()}">${a.risk} risk</span></span>
      <span class="ex__plain">${a.plain}</span>
      <span class="ex__chart">${spark(a, k)}<span class="ex__p"><b>${money(a.price)}</b><small class="${dirCls(a.week)}">${pct(a.week)} this week</small></span></span>
      <span class="ex__own">${a.value ? `You own ${money(a.value)}` : 'You don’t own any'}</span>
    </button>`).join('');

  const stepSheet = k => {
    const s = SAMPLE.start[k];
    if (s.id === 'verify' && !isDone(s)) return kycSheet();
    open(s.title, s.body + (isDone(s) ? '' : `<button type="button" class="a-btn a-btn--block" data-mark>Mark as done</button>`), () => {
      const m = $('[data-mark]', dBody);
      m && m.addEventListener('click', () => {
        saved.done = Object.assign({}, saved.done, { [s.id]: true }); save(); drawStart(); close();
        toast(`Marked “${s.title}” as done`);
      });
    });
  };

  document.addEventListener('click', e => {
    const s = e.target.closest('[data-sheet]');
    if (s) return ({ send: sendSheet, receive: receiveSheet, add: addSheet, alerts: alertsSheet, account: accountSheet, save: saveSheet, kyc: kycSheet, request: requestSheet, schedule: scheduleSheet, statement: statementSheet, chat: chatSheet, close: closeSheet })[s.dataset.sheet]();
    const sn = e.target.closest('[data-soon]'); if (sn) return toast(`${sn.dataset.soon} isn’t available in this preview.`);
    const st2 = e.target.closest('[data-set]'); if (st2) return toggleSet(st2);
    if (e.target.closest('[data-lost]')) { setFreeze(true); if (dlg.open) close(); return; }
    if (e.target.closest('[data-hide]')) return setHide(!prefs.hide);
    if (e.target.closest('[data-signout]')) return signOut();
    const rm = e.target.closest('[data-rm]'); if (rm) { prefs.gone = (prefs.gone || []).concat(+rm.dataset.rm); savePrefs(); drawDevices(); return toast(`Signed out of ${SAMPLE.devices[+rm.dataset.rm].n}`); }
    const tx = e.target.closest('[data-tx]'); if (tx) return txSheet(+tx.dataset.tx);
    const g = e.target.closest('[data-guide]'); if (g) return guideSheet(+g.dataset.guide);
    if (e.target.closest('[data-clear]')) { search.value = ''; filterAll(); search.focus(); return; }
    const f = e.target.closest('[data-filter] [data-f]');
    if (f) { const grp = f.closest('[data-filter]'); filters[grp.dataset.filter] = f.dataset.f; $$('[data-f]', grp).forEach(b => b.setAttribute('aria-pressed', b === f)); return filterAll(); }
    const a = e.target.closest('[data-asset]'); if (a) { location.hash = 'asset/' + MARKET[+a.dataset.asset].sym.toLowerCase(); return; }
    const to = e.target.closest('[data-send-to]'); if (to) return sendSheet(+to.dataset.sendTo);
    if (e.target.closest('[data-autosave]')) return setAutosave(e.target.closest('[data-autosave]').getAttribute('aria-checked') !== 'true');
    const rp = e.target.closest('[data-rep]'); if (rp) { const r = PAY.repeat.find(x => x.id === rp.dataset.rep); r.on = !r.on; drawPayments(); $(`[data-rep="${r.id}"]`).focus(); return toast(r.on ? `${r.what} is back on` : `${r.what} is paused`); }
    const rq = e.target.closest('[data-rq]'); if (rq) { const r = PAY.requests[+rq.dataset.k], act = rq.dataset.rq;
      if (act === 'remind') return toast(`Reminder sent to ${r.who}`);
      r.state = act === 'pay' ? 'paid' : 'declined'; drawPayments(); return toast(act === 'pay' ? `Paid ${r.who} ${money(r.amt)}` : `Declined ${r.who}’s request`); }
    const bd = e.target.closest('[data-budget]'); if (bd) return budgetSheet(bd.dataset.budget);
    const st = e.target.closest('[data-step]'); if (st) return stepSheet(+st.dataset.step);
  });

  /* ── settings ── */
  ['security', 'notify', 'prefs', 'card'].forEach(g => { $(`[data-sets="${g}"]`).innerHTML = setSwitches(g); });
  function drawDevices() {
    $('[data-devices]').innerHTML = SAMPLE.devices.map((d, k) => (prefs.gone || []).includes(k) ? '' : `<li><span class="a-ico a-ico--b"><svg class="ic"><use href="#i-device"/></svg></span><span><b>${d.n}</b><small>${d.s}</small></span>${d.me ? '<span class="st st--on">This device</span>' : `<button type="button" class="a-pill" data-rm="${k}">Sign out</button>`}</li>`).join('');
  }
  drawDevices();
  const TOASTS = { twostep: ['2-step verification is on', '2-step verification is off. Your account is easier to get into.'], faceid: ['Face ID sign-in is on', 'Face ID sign-in is off. You’ll use your passcode.'], bigpay: ['We’ll check payments over $500', 'Large payments won’t ask twice'] };
  function toggleSet(el) {
    const k = el.dataset.set, on = el.getAttribute('aria-checked') !== 'true';
    if (k === 'hide') return setHide(on);
    $$(`[data-set="${k}"]`).forEach(x => x.setAttribute('aria-checked', on));
    prefs.sets[k] = on; savePrefs();
    TOASTS[k] ? toast(TOASTS[k][on ? 0 : 1]) : toast('Saved');
  }
  /* hide balances: blurs every amount */
  const hideBtn = $('[data-hide]');
  function setHide(on) {
    prefs.hide = on; savePrefs();
    root.classList.toggle('hide-bal', on);
    hideBtn.setAttribute('aria-pressed', on); hideBtn.setAttribute('aria-label', on ? 'Show balances' : 'Hide balances'); hideBtn.title = hideBtn.getAttribute('aria-label');
    $('use', hideBtn).setAttribute('href', on ? '#i-eyeoff' : '#i-eye');
    $$('[data-set="hide"]').forEach(x => x.setAttribute('aria-checked', on));
  }
  setHide(!!prefs.hide);

  /* help: questions and answers */
  $('[data-faq]').innerHTML = SAMPLE.faq.map(([q, a]) => `<details data-q><summary>${q}<svg class="ic" aria-hidden="true"><use href="#i-chevd"/></svg></summary><p>${a}</p></details>`).join('');

  /* signed out screen */
  const lock = $('[data-lock]'), shell = $('.shell'), tabs = $('.tabs');
  function signOut() {
    opener = null; if (dlg.open) close();
    lock.hidden = false; shell.inert = true; tabs.inert = true;
    requestAnimationFrame(() => lock.classList.add('is-on'));
    $('[data-signin]').focus();
  }
  $('[data-signin]').addEventListener('click', () => {
    loader.classList.add('is-swap'); AztecLoader.run();
    setTimeout(() => {
      lock.classList.remove('is-on'); lock.hidden = true; shell.inert = false; tabs.inert = false;
      $('#main').focus({ preventScroll: true }); loader.classList.add('is-done'); loader.classList.remove('is-swap'); toast('Welcome back, Alex');
    }, AztecLoader.SWAP_MS);
  });
  addEventListener('keydown', e => { if (e.key === '/' && !/INPUT|TEXTAREA/.test(document.activeElement.tagName) && !dlg.open && lock.hidden && innerWidth >= 720) { e.preventDefault(); search.focus(); } });

  /* ── search + filters: one pass over everything marked data-q ── */
  const search = $('[data-search]');
  const filters = { explore: 'all', activity: 'all' };
  function filterAll() {
    const q = search.value.trim().toLowerCase();
    $$('[data-q]').forEach(el => {
      const view = el.closest('[data-view]').dataset.view, f = filters[view];
      const byF = !f || f === 'all' || (el.dataset.kind || '').split(' ').includes(f);
      el.hidden = !byF || (!!q && !el.textContent.toLowerCase().includes(q));
      if (el.tagName === 'DETAILS' && q) el.open = !el.hidden;
    });
    $$('[data-empty]').forEach(e => { e.hidden = $$('[data-q]', $(e.dataset.empty)).some(x => !x.hidden); });
    const shown = $$('[data-activity-all] tr').filter(r => !r.hidden).map(r => SAMPLE.activity[+$('[data-tx]', r).dataset.tx]);
    const inn = shown.filter(t => t.amount > 0).reduce((a, t) => a + t.amount, 0), out = shown.filter(t => t.amount < 0).reduce((a, t) => a - t.amount, 0);
    $('[data-act-sum]').textContent = shown.length ? `${shown.length} ${shown.length === 1 ? 'transaction' : 'transactions'}. In ${money(inn)}, out ${money(out)}.` : '';
  }
  search.addEventListener('input', filterAll);
  search.addEventListener('keydown', e => { if (e.key === 'Enter') e.preventDefault(); });
  drawGuides();

  /* ═════════ ASSET PAGE: #asset/btc ═════════ */
  const AD = {
    BTC: { cost: 590.00, since: '2009', move: 'About 3%', vol: .012, ch: { D: .6, W: 2.4, M: 8.1, Y: 41.2 } },
    ETH: { cost: 330.00, since: '2015', move: 'About 4%', vol: .015, ch: { D: -.4, W: -1.8, M: 5.3, Y: 18.6 } },
    USDC: { cost: 282.90, since: '2018', move: 'Less than 0.1%', vol: .0004, ch: { D: 0, W: 0, M: 0, Y: 0 } },
    SOL: { cost: 0, since: '2020', move: 'About 6%', vol: .022, ch: { D: 1.2, W: 6.1, M: 14.5, Y: 62.0 } },
    LTC: { cost: 0, since: '2011', move: 'About 4%', vol: .014, ch: { D: -.3, W: -.6, M: 3.2, Y: -8.4 } }
  };
  const NOW = new Date(2026, 10, 25, 19, 0);
  const RANGES = { D: { n: 49, step: 1800e3, lab: 'in the past day' }, W: { n: 43, step: 4 * 3600e3, lab: 'in the past week' }, M: { n: 31, step: 864e5, lab: 'in the past month' }, Y: { n: 53, step: 7 * 864e5, lab: 'in the past year' } };
  const fmtD = (d, o) => d.toLocaleDateString('en-GB', o);
  const hhmm = d => d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  const pointTime = (r, i) => {
    const d = new Date(NOW - (RANGES[r].n - 1 - i) * RANGES[r].step);
    return r === 'D' ? hhmm(d) : r === 'W' ? `${fmtD(d, { weekday: 'short', day: 'numeric', month: 'short' })}, ${hhmm(d)}` : r === 'M' ? fmtD(d, { day: 'numeric', month: 'short' }) : fmtD(d, { month: 'short', year: 'numeric' });
  };
  const startLabel = r => { const d = new Date(NOW - (RANGES[r].n - 1) * RANGES[r].step); return r === 'D' ? 'Yesterday, ' + hhmm(d) : r === 'Y' ? fmtD(d, { month: 'short', year: 'numeric' }) : fmtD(d, { day: 'numeric', month: 'short' }); };
  // a repeatable random walk that ends on today's sample price and starts where the range's change says it should
  const series = (a, r) => {
    const x = AD[a.sym], n = RANGES[r].n;
    let seed = a.sym.charCodeAt(0) * 97 + a.sym.length * 31 + r.charCodeAt(0) * 13;
    const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    const walk = [0]; for (let i = 1; i < n; i++) walk.push(walk[i - 1] + (rnd() - .5) * 2 * x.vol);
    const p0 = a.price / (1 + x.ch[r] / 100), end = walk[n - 1];
    return walk.map((w, i) => { const t = i / (n - 1); return (p0 + (a.price - p0) * t) * (1 + w - end * t); });
  };
  const chartEl = $('[data-ad-chart]');
  let adK = 0, adR = 'W', adPts = [], adIdx = -1, adGeo = null;
  const drawChart = (animate = false) => {
    const a = MARKET[adK]; adPts = series(a, adR);
    const n = adPts.length, lo = Math.min(...adPts), hi = Math.max(...adPts), span = (hi - lo) || hi * .002;
    const X = i => i / (n - 1) * 100, Y = p => 8 + (1 - (p - lo) / span) * 84;
    adGeo = { X, Y };
    const line = adPts.map((p, i) => `${X(i).toFixed(2)},${Y(p).toFixed(2)}`).join(' ');
    const ch = AD[a.sym].ch[adR];
    chartEl.className = 'adc__chart ' + (dirCls(ch) || 'is-flat') + (animate && !reduced ? ' is-draw' : '');
    chartEl.innerHTML = `<svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><defs><linearGradient id="adg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="currentColor" stop-opacity=".24"/><stop offset="1" stop-color="currentColor" stop-opacity="0"/></linearGradient></defs><polygon points="0,100 ${line} 100,100" fill="url(#adg)"/><polyline class="adc__line" points="${line}"/></svg><i class="adc__x" hidden></i><i class="adc__dot" hidden></i><span class="adc__tip" hidden></span>`;
    $('[data-ad-from]').textContent = startLabel(adR);
    $('[data-ad-hilo]').textContent = `High ${money(hi)}, low ${money(lo)}`;
    adIdx = -1; readout(-1);
  };
  const readout = i => {
    const n = adPts.length, on = i >= 0, j = on ? i : n - 1, p = adPts[j], d = p - adPts[0], pc = d / adPts[0] * 100;
    $('[data-ad-price]').textContent = money(p);
    const dl = $('[data-ad-delta]');
    dl.textContent = `${money(Math.abs(d) < .005 ? 0 : d, true)} (${pct(+pc.toFixed(1))}) ${on ? 'since ' + startLabel(adR) : RANGES[adR].lab}`;
    dl.className = 'adc__d ' + dirCls(+pc.toFixed(1));
    const dot = $('.adc__dot', chartEl), x = $('.adc__x', chartEl), tip = $('.adc__tip', chartEl);
    [dot, x, tip].forEach(e => { e.hidden = !on; });
    if (!on) return;
    const px = adGeo.X(j);
    dot.style.left = x.style.left = px + '%'; dot.style.top = adGeo.Y(p) + '%';
    tip.style.left = Math.min(88, Math.max(12, px)) + '%'; tip.textContent = pointTime(adR, j);
  };
  chartEl.addEventListener('pointermove', e => { const r = chartEl.getBoundingClientRect(); adIdx = Math.round(Math.min(1, Math.max(0, (e.clientX - r.left) / r.width)) * (adPts.length - 1)); readout(adIdx); });
  chartEl.addEventListener('pointerleave', () => { adIdx = -1; readout(-1); });
  chartEl.addEventListener('blur', () => { adIdx = -1; readout(-1); });
  chartEl.addEventListener('keydown', e => {
    const last = adPts.length - 1, m = { ArrowLeft: -1, ArrowRight: 1, Home: -1e3, End: 1e3 }[e.key];
    if (e.key === 'Escape') { adIdx = -1; return readout(-1); }
    if (m === undefined) return;
    e.preventDefault(); adIdx = Math.min(last, Math.max(0, (adIdx < 0 ? last : adIdx) + m)); readout(adIdx);
  });
  $$('[data-ad-range] button').forEach(b => b.addEventListener('click', () => {
    adR = b.dataset.r; $$('[data-ad-range] button').forEach(x => x.setAttribute('aria-pressed', x === b)); drawChart(true);
  }));
  prefs.alerts = prefs.alerts || {};
  const drawAsset = sym => {
    const k = Math.max(0, MARKET.findIndex(a => a.sym.toLowerCase() === sym)), a = MARKET[k], x = AD[a.sym];
    adK = k;
    const coin = $('[data-ad-coin]'); coin.className = `a-coin ad__coin as__coin--${a.cls}`; coin.textContent = a.glyph;
    $('[data-ad-name]').textContent = a.name;
    $('[data-ad-plain]').textContent = a.plain;
    $('[data-ad-k]').textContent = `Price for 1 ${a.sym}`;
    $('[data-ad-worth]').textContent = money(a.value);
    $('[data-ad-own]').textContent = a.value ? `${a.amount}. That’s ${Math.round(a.value / SAMPLE.parts[1].value * 100)}% of your digital assets.` : `You don’t own any ${a.name} yet. You could start with as little as $10.`;
    const gain = a.value - x.cost;
    $('[data-ad-kv]').innerHTML = (a.value
      ? [['You paid', money(x.cost)], ['Gain or loss', `${money(Math.abs(gain) < .005 ? 0 : gain, true)}`], [`Price for 1 ${a.sym}`, money(a.price)]]
      : [[`Price for 1 ${a.sym}`, money(a.price)], ['Smallest buy', '$10.00']]).map(([t, v]) => `<div><dt>${t}</dt><dd>${v}</dd></div>`).join('');
    const sell = $('[data-ad-trade="sell"]'); sell.disabled = !a.value; sell.title = a.value ? '' : 'You can sell once you own some';
    $('[data-ad-risk]').className = `a-risk ad__risk a-risk--${a.risk.toLowerCase()}`;
    $('[data-ad-wrong]').textContent = a.wrong;
    $('[data-ad-facts]').innerHTML = [['Risk', `${a.risk} risk`], ['Typical move in a day', x.move], ['Around since', x.since]].map(([t, v]) => `<div><dt>${t}</dt><dd>${v}</dd></div>`).join('');
    const al = $('[data-ad-alert]'); al.setAttribute('aria-checked', a.sym in prefs.alerts ? prefs.alerts[a.sym] : !!a.value);
    $('[data-ad-al-s]').textContent = `When ${a.name} moves more than ${a.sym === 'USDC' ? '1%' : '5%'} in a day`;
    $('[data-ad-hist-t]').textContent = `Your ${a.name} activity`;
    const rows = SAMPLE.activity.map((t, i) => [t, i]).filter(([t]) => t.what === a.name);
    $('[data-ad-hist]').innerHTML = rows.map(([t, i]) => txRow(t, i)).join('');
    const none = $('[data-ad-none]'); none.hidden = !!rows.length; none.textContent = `You haven’t bought or sold any ${a.name} yet.`;
    adR = 'W'; $$('[data-ad-range] button').forEach(b => b.setAttribute('aria-pressed', b.dataset.r === 'W'));
    drawChart();
  };
  $$('[data-ad-trade]').forEach(b => b.addEventListener('click', () => tradeSheet(adK, b.dataset.adTrade)));
  $('[data-ad-alert]').addEventListener('click', e => {
    const b = e.currentTarget, on = b.getAttribute('aria-checked') !== 'true', a = MARKET[adK];
    b.setAttribute('aria-checked', on); prefs.alerts[a.sym] = on; savePrefs();
    toast(on ? `We’ll tell you when ${a.name} moves a lot` : `No more price alerts for ${a.name}`);
  });

  /* ═════════ PAYMENTS ═════════ */
  const PAY = {
    requests: [
      { in: true, who: 'Maya Chen', i: 'M', amt: 12.00, note: 'Lunch on Friday', when: 'Today', state: 'open' },
      { in: false, who: 'Jon Park', i: 'J', amt: 30.00, note: 'Concert tickets', when: '2 days ago', state: 'open' }
    ],
    repeat: [
      { id: 'rent', what: 'Rent to Harbour Homes', icon: 'i-home', cls: 'd', amt: 950.00, every: 'Monthly on the 1st', day: 1, on: true },
      { id: 'save', what: 'Rainy day fund', icon: 'i-star', cls: 'c', amt: 50.00, every: 'Every Friday', weekly: 5, on: true },
      { id: 'power', what: 'City Power', icon: 'i-bank', cls: 'b', amt: 88.00, every: 'Monthly on the 12th. The amount can change', day: 12, on: true },
      { id: 'phone', what: 'Cell Mobile', icon: 'i-cell', cls: 'a', amt: 35.00, every: 'Monthly on the 18th', day: 18, on: true }
    ],
    last: ['Sent you $25.00 yesterday', 'You sent $18.00 on 23 Nov', 'Sent you $12.50 on 17 Nov']
  };
  const dayStr = d => fmtD(d, { weekday: 'short', day: 'numeric', month: 'short' });
  const nextDates = (r, days) => {
    const out = [], end = new Date(NOW.getTime() + days * 864e5);
    for (let d = new Date(NOW.getFullYear(), NOW.getMonth(), NOW.getDate() + 1); d <= end; d.setDate(d.getDate() + 1))
      if (r.weekly !== undefined ? d.getDay() === r.weekly : d.getDate() === r.day) out.push(new Date(d));
    return out;
  };
  const nextOne = r => nextDates(r, 40)[0];
  const drawPayments = () => {
    const ask = PAY.requests.filter(r => r.in && r.state === 'open').length;
    $('[data-rq-count]').textContent = ask ? `${ask} to answer` : 'All answered';
    $('[data-requests]').innerHTML = PAY.requests.map((r, k) => {
      const st = r.state === 'paid' ? '<span class="st st--on">Paid</span>' : r.state === 'declined' ? '<span class="st st--completed">Declined</span>' : r.in ? '' : '<span class="st st--pending">Waiting</span>';
      const acts = r.state !== 'open' ? '' : r.in
        ? `<div class="pr__acts"><button type="button" class="a-pill" data-rq="decline" data-k="${k}">Decline</button><button type="button" class="a-pill a-pill--sky" data-rq="pay" data-k="${k}">Pay ${money(r.amt)}</button></div>`
        : `<div class="pr__acts"><button type="button" class="a-pill" data-rq="remind" data-k="${k}">Send a reminder</button></div>`;
      return `<li class="${r.fresh ? 'is-new' : ''}"><span class="a-avatar">${r.i}</span><span class="pr__t"><b>${r.in ? `${r.who} asked you for ${money(r.amt)}` : `You asked ${r.who} for ${money(r.amt)}`}</b><small>${esc(r.note)}. ${r.when}</small></span><span class="pr__end">${st}</span>${acts}</li>`;
    }).join('');
    PAY.requests.forEach(r => { r.fresh = false; });
    const monthly = PAY.repeat.filter(r => r.on).reduce((s, r) => s + (r.weekly !== undefined ? r.amt * 52 / 12 : r.amt), 0);
    $('[data-sc-total]').textContent = `About ${money(Math.round(monthly))} a month`;
    $('[data-scheduled]').innerHTML = PAY.repeat.map(r => `
      <li class="${r.on ? '' : 'is-off'}${r.fresh ? ' is-new' : ''}"><span class="a-ico a-ico--${r.cls}"><svg class="ic"><use href="#${r.icon}"/></svg></span><span class="pr__t"><b id="rp-${r.id}">${esc(r.what)}</b><small>${r.every}. ${r.on ? 'Next: ' + dayStr(nextOne(r)) : 'Paused'}</small></span>
      <span class="pr__end"><b class="pr__v">${money(r.amt)}</b><button type="button" class="sw" role="switch" aria-checked="${r.on}" aria-labelledby="rp-${r.id}" ${r.id === 'save' ? 'data-autosave' : `data-rep="${r.id}"`}><i></i></button></span></li>`).join('');
    PAY.repeat.forEach(r => { r.fresh = false; });
    const due = PAY.repeat.filter(r => r.on).flatMap(r => nextDates(r, 14).map(d => ({ r, d }))).sort((a, b) => a.d - b.d);
    $('[data-coming]').innerHTML = due.length ? due.map(({ r, d }) => `<li><span class="cu__d">${fmtD(d, { weekday: 'short' })}<b>${d.getDate()}</b></span><span class="pr__t"><b>${esc(r.what)}</b><small>${fmtD(d, { day: 'numeric', month: 'long' })}</small></span><b class="cu__v">${money(-r.amt, true)}</b></li>`).join('') : '<li><span class="pr__t"><small>Nothing in the next two weeks.</small></span></li>';
    const out = due.reduce((s, x) => s + x.r.amt, 0);
    $('[data-cu-left]').innerHTML = `<b>${money(out)} goes out in the next two weeks</b>If nothing else changes, you’d still have ${money(SAMPLE.parts[0].value - out)} in cash.`;
    $('[data-people]').innerHTML = SAMPLE.contacts.map((c, k) => `<li><span class="a-avatar">${c.i}</span><span class="pr__t"><b>${c.n}</b><small>${c.tag}. ${PAY.last[k]}</small></span><button type="button" class="a-pill" data-send-to="${k}"><svg class="ic"><use href="#i-send"/></svg>Send</button></li>`).join('');
  };
  function setAutosave(on, quiet) {
    PAY.repeat.find(r => r.id === 'save').on = on;
    $$('[data-autosave]').forEach(x => x.setAttribute('aria-checked', on));
    drawPayments();
    quiet || toast(on ? 'Saving $50 every Friday' : 'Weekly saving paused');
  }
  drawPayments();
  const pickPeople = who => `<div class="send__to" role="radiogroup" aria-label="Who">${SAMPLE.contacts.map((c, k) => `<button type="button" role="radio" aria-checked="${k === who}" data-who="${k}"><span class="a-avatar">${c.i}</span>${c.n.split(' ')[0]}</button>`).join('')}</div>`;
  const requestSheet = () => {
    let who = 0;
    open('Ask for money', `${pickPeople(who)}${amtField(20, 'Amount to ask for in US dollars')}
      <p class="send__help" id="amt-help">They’ll get a request they can pay in one tap.</p>
      <label class="fld"><span>What it’s for</span><input value="Dinner" maxlength="40" data-note></label>
      <button type="button" class="a-btn a-btn--block" data-go></button>${PREVIEW}`, () => {
      let v = 0;
      const draw = () => { const go = $('[data-go]', dBody); go.textContent = `Ask ${SAMPLE.contacts[who].n.split(' ')[0]} for ${money(v)}`; go.disabled = !v; };
      $$('[data-who]', dBody).forEach(b => b.addEventListener('click', () => { who = +b.dataset.who; $$('[data-who]', dBody).forEach(x => x.setAttribute('aria-checked', x === b)); draw(); }));
      bindAmt(x => { v = x; draw(); });
      $('[data-go]', dBody).addEventListener('click', () => {
        const c = SAMPLE.contacts[who];
        PAY.requests.unshift({ in: false, who: c.n, i: c.i, amt: v, note: $('[data-note]', dBody).value.trim() || 'No note', when: 'Just now', state: 'open', fresh: true });
        drawPayments();
        doneView('Request sent', `You asked ${c.n} for ${money(v)}`, `In the real app ${c.n.split(' ')[0]} would get a notification to pay you.`);
      });
    });
  };
  const scheduleSheet = () => {
    let who = 0, often = 'week';
    open('Repeat a payment', `${pickPeople(who)}${amtField(25, 'Amount each time in US dollars')}
      <div class="seg" role="group" aria-label="How often" data-often><button type="button" aria-pressed="true" data-o="week">Every Friday</button><button type="button" aria-pressed="false" data-o="month">On the 1st of each month</button></div>
      <p class="send__help" id="amt-help">You can pause or change it any time.</p>
      <button type="button" class="a-btn a-btn--block" data-go></button>${PREVIEW}`, () => {
      let v = 0;
      const draw = () => { const go = $('[data-go]', dBody); go.textContent = `Send ${money(v)} ${often === 'week' ? 'every week' : 'every month'}`; go.disabled = !v; };
      $$('[data-who]', dBody).forEach(b => b.addEventListener('click', () => { who = +b.dataset.who; $$('[data-who]', dBody).forEach(x => x.setAttribute('aria-checked', x === b)); }));
      $$('[data-o]', dBody).forEach(b => b.addEventListener('click', () => { often = b.dataset.o; $$('[data-o]', dBody).forEach(x => x.setAttribute('aria-pressed', x === b)); draw(); }));
      bindAmt(x => { v = x; draw(); });
      $('[data-go]', dBody).addEventListener('click', () => {
        const c = SAMPLE.contacts[who], id = 'n' + PAY.repeat.length;
        PAY.repeat.push(Object.assign({ id, what: `To ${c.n}`, icon: 'i-send', cls: 'b', amt: v, on: true, fresh: true }, often === 'week' ? { every: 'Every Friday', weekly: 5 } : { every: 'Monthly on the 1st', day: 1 }));
        drawPayments();
        doneView('Payment set up', `${money(v)} to ${c.n}, ${often === 'week' ? 'every Friday' : 'on the 1st of each month'}`, 'It’s in Repeating payments. Switch it off there to pause it.');
      });
    });
  };

  /* ═════════ INSIGHTS ═════════ */
  const CAT_META = { 'Home and bills': ['i-home', 'd'], 'Eating out': ['i-fork', 'a'], Travel: ['i-plane', 'b'], Transport: ['i-bus', 'c'], Shopping: ['i-bag', 'c'], Other: ['i-more', 'b'] };
  const MONTHS = {
    sep: { name: 'September', note: 'All of September', inc: 3180.00, weeks: [530.20, 488.60, 610.40, 475.40],
      cats: { 'Home and bills': 598.00, 'Eating out': 455.20, Travel: 420.00, Transport: 92.10, Shopping: 356.30, Other: 183.00 },
      places: [['Skyline Air', 'i-plane', 'b', 420.00, 1], ['Harbour Kitchen', 'i-fork', 'a', 188.70, 4], ['Corner Market', 'i-bag', 'd', 150.20, 6], ['Northside Mall', 'i-bag', 'c', 140.00, 1]],
      xp: [['i-plane', 'b', 'Travel was your biggest cost after bills', 'One flight with Skyline Air took $420.00.'], ['i-fork', 'a', 'Eating out went $55.20 over budget', 'Four visits to Harbour Kitchen made up most of it.'], ['i-info', 'sky', 'This is the earliest month in the preview', 'Compare it with October and November using the months above.']] },
    oct: { name: 'October', note: 'All of October', inc: 3180.00, weeks: [402.30, 455.00, 520.40, 388.10, 199.30],
      cats: { 'Home and bills': 612.00, 'Eating out': 520.50, Travel: 0, Transport: 88.40, Shopping: 512.80, Other: 231.40 },
      places: [['Northside Mall', 'i-bag', 'c', 312.50, 2], ['Harbour Kitchen', 'i-fork', 'a', 210.30, 5], ['Corner Market', 'i-bag', 'd', 158.90, 7], ['City Power', 'i-bank', 'b', 88.00, 1]],
      xp: [['i-check', 'sky', 'You spent $139.50 less than in September', 'No flights this month made the biggest difference.'], ['i-bag', 'c', 'Shopping went $212.80 over budget', 'Two trips to Northside Mall came to $312.50.'], ['i-fork', 'a', 'Eating out was $120.50 over budget', 'It was your second biggest cost after bills.']] },
    nov: { name: 'November', note: '1 to 25 November so far', inc: 3240.00, weeks: [512.40, 618.20, 401.50, 310.20],
      cats: { 'Home and bills': 612.00, 'Eating out': 384.50, Travel: 310.80, Transport: 64.20, Shopping: 290.40, Other: 180.40 },
      places: [['Skyline Air', 'i-plane', 'b', 310.80, 1], ['Harbour Kitchen', 'i-fork', 'a', 168.40, 4], ['Corner Market', 'i-bag', 'd', 142.60, 6], ['City Power', 'i-bank', 'b', 88.00, 1]],
      xp: [['i-check', 'sky', 'You spent $122.80 less than in October', 'With six days still to go, so keep an eye on it.'], ['i-fork', 'a', 'Eating out is down $136.00 on October', 'It’s now back under its $400 budget.'], ['i-plane', 'b', 'Travel went $10.80 over budget', 'One flight with Skyline Air came to $310.80.']] }
  };
  const BUDGET0 = { 'Home and bills': 650, 'Eating out': 400, Travel: 300, Transport: 100, Shopping: 300, Other: 200 };
  prefs.budgets = prefs.budgets || {};
  const budget = c => prefs.budgets[c] || BUDGET0[c];
  let month = 'nov';
  const drawInsights = () => {
    const m = MONTHS[month], keys = Object.keys(MONTHS), prev = MONTHS[keys[keys.indexOf(month) - 1]];
    const out = Object.values(m.cats).reduce((s, v) => s + v, 0), kept = m.inc - out;
    $('[data-in-note]').textContent = m.note;
    $('[data-io-in]').textContent = money(m.inc);
    $('[data-io-out]').textContent = money(out);
    $('[data-io-kept]').innerHTML = `${money(kept)}<small>${Math.round(kept / m.inc * 100)}% of what came in</small>`;
    const top = Math.max(...m.weeks), scale = Math.max(...Object.values(MONTHS).flatMap(x => x.weeks));
    $('[data-weeks]').innerHTML = m.weeks.map((w, i) => `<div class="wk__b ${w === top ? 'is-top' : ''}"><b>${money(w).replace(/\.\d\d$/, '')}</b><i style="--p:${(w / scale).toFixed(3)}"></i><span>Week ${i + 1}</span></div>`).join('');
    $('[data-wk-note]').textContent = `Your busiest week was week ${m.weeks.indexOf(top) + 1}, at ${money(top)}.` + (prev ? ` In ${prev.name} you spent about ${money(Object.values(prev.cats).reduce((s, v) => s + v, 0) / prev.weeks.length).replace(/\.\d\d$/, '')} a week.` : '');
    const totB = Object.keys(m.cats).reduce((s, c) => s + budget(c), 0);
    $('[data-bd-sum]').textContent = `${money(out).replace(/\.\d\d$/, '')} of ${money(totB).replace(/\.\d\d$/, '')}`;
    $('[data-budgets]').innerHTML = Object.entries(m.cats).map(([c, v]) => {
      const b = budget(c), over = v > b, [ic, cls] = CAT_META[c];
      return `<li><button type="button" data-budget="${c}"><span class="a-ico a-ico--${cls}"><svg class="ic"><use href="#${ic}"/></svg></span><span class="bd__t"><b>${c}</b><small>${money(v)} of ${money(b).replace(/\.00$/, '')}</small></span><span class="bd__v ${over ? 'is-over' : ''}">${over ? money(v - b) + ' over' : money(b - v) + ' left'}</span><span class="a-meter ${over ? 'is-over' : ''}"><i style="--w:${Math.min(100, v / b * 100).toFixed(1)}%"></i></span></button></li>`;
    }).join('');
    $('[data-explained]').innerHTML = m.xp.map(([ic, cls, b, t]) => `<li><span class="a-ico a-ico--${cls}"><svg class="ic"><use href="#${ic}"/></svg></span><p><b>${b}</b>${t}</p></li>`).join('');
    $('[data-places]').innerHTML = m.places.map(([n, ic, cls, v, c]) => `<li><span class="a-ico a-ico--${cls}"><svg class="ic"><use href="#${ic}"/></svg></span><span class="pr__t"><b>${n}</b><small>${c} ${c === 1 ? 'payment' : 'payments'}</small></span><b class="pr__v">${money(v)}</b></li>`).join('');
  };
  drawInsights();
  const insView = $('[data-view="insights"]');
  $$('[data-months] button').forEach(b => b.addEventListener('click', () => {
    if (b.dataset.m === month) return;
    $$('[data-months] button').forEach(x => x.setAttribute('aria-pressed', x === b));
    month = b.dataset.m;
    if (reduced) return drawInsights();
    insView.classList.add('is-swapping');
    setTimeout(() => { drawInsights(); insView.classList.remove('is-swapping'); }, 160);
  }));
  const budgetSheet = c => open(`${c} budget`, `<p class="sheet__p">How much do you want to spend on ${c.toLowerCase()} each month? We’ll tell you when you get close.</p>
    ${amtField(budget(c), `Monthly budget for ${c} in US dollars`)}<p class="send__help" id="amt-help">In ${MONTHS[month].name} you spent ${money(MONTHS[month].cats[c])}.</p>
    <button type="button" class="a-btn a-btn--block" data-go>Save budget</button>`, () => {
    let v = 0;
    bindAmt(x => { v = x; $('[data-go]', dBody).disabled = !v; });
    $('[data-go]', dBody).addEventListener('click', () => { prefs.budgets[c] = Math.round(v); savePrefs(); drawInsights(); close(); toast(`${c} budget set to ${money(Math.round(v)).replace(/\.00$/, '')} a month`); });
  });

  /* ═════════ CARD ═════════ */
  const limEl = $('[data-lim]');
  const SPENT = 1842.30;
  const drawLimit = () => {
    const v = +limEl.value;
    limEl.style.setProperty('--f', ((v - 500) / 4500 * 100).toFixed(1) + '%');
    $('[data-lim-v]').textContent = money(v).replace(/\.00$/, '');
    $$('[data-lim-spent]').forEach(e => { e.innerHTML = `${money(SPENT)} <span>of ${money(v).replace(/\.00$/, '')} limit</span>`; });
    $$('[data-lim-bar]').forEach(e => { e.style.setProperty('--w', Math.min(100, SPENT / v * 100).toFixed(1) + '%'); e.closest('.wc__lim').classList.toggle('is-over', SPENT > v); });
  };
  if (prefs.limit) limEl.value = prefs.limit;
  limEl.addEventListener('input', drawLimit);
  limEl.addEventListener('change', () => { prefs.limit = +limEl.value; savePrefs(); toast(SPENT > +limEl.value ? `Limit set to ${money(+limEl.value).replace(/\.00$/, '')}. You’ve already spent more, so new card payments will be declined.` : `Monthly limit set to ${money(+limEl.value).replace(/\.00$/, '')}`); });
  drawLimit();
  $$('[data-atm] button').forEach(b => b.addEventListener('click', () => { $$('[data-atm] button').forEach(x => x.setAttribute('aria-pressed', x === b)); toast(`Cash machine limit set to $${b.dataset.v} a day`); }));
  // PIN: press and hold for 0.9s to show it, then it hides again after 3s
  const pin = $('[data-pin]'), pinV = $('[data-pin-v]'), pinS = $('[data-pin-s]');
  let pinT, pinHide;
  const pinShow = () => {
    pin.classList.remove('is-hold'); pin.classList.add('is-shown'); pinV.textContent = '4827'; pinS.textContent = 'Hidden again in 3 seconds';
    clearTimeout(pinHide); pinHide = setTimeout(() => { pin.classList.remove('is-shown'); pinV.textContent = '••••'; pinS.textContent = 'Press and hold to see it'; }, 3000);
  };
  const pinStart = () => { if (pin.classList.contains('is-shown')) return; pin.classList.add('is-hold'); pinT = setTimeout(pinShow, reduced ? 0 : 900); };
  const pinStop = () => { clearTimeout(pinT); pin.classList.remove('is-hold'); };
  pin.addEventListener('pointerdown', pinStart);
  ['pointerup', 'pointerleave', 'pointercancel'].forEach(t => pin.addEventListener(t, pinStop));
  pin.addEventListener('keydown', e => { if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) { e.preventDefault(); pinStart(); } });
  pin.addEventListener('keyup', e => { if (e.key === ' ' || e.key === 'Enter') pinStop(); });
  pin.addEventListener('contextmenu', e => e.preventDefault());
  // online-only card
  let vcOn = !!prefs.vc;
  const drawVc = () => {
    $('[data-vc]').innerHTML = vcOn
      ? `<div class="vc__card"><div class="a-tcard a-tcard--virt"><span class="a-tcard__lines"></span><svg class="a-tcard__logo" viewBox="0 0 1289 267" aria-hidden="true"><use href="#i-logo"/></svg><span class="a-tcard__no">4000 9921 3307 5108</span><span class="a-tcard__type">Online</span></div>
         <div class="vc__row"><button type="button" class="a-pill" data-vc-copy><svg class="ic"><use href="#i-copy"/></svg>Copy number</button><button type="button" class="a-pill" data-vc-del><svg class="ic"><use href="#i-del"/></svg>Delete</button></div></div>`
      : `<button type="button" class="a-btn a-btn--ghost vc__new" data-vc-new><svg class="ic"><use href="#i-plus"/></svg>Create an online card</button>`;
  };
  drawVc();
  $('[data-vc]').addEventListener('click', async e => {
    if (e.target.closest('[data-vc-new]')) { vcOn = prefs.vc = true; savePrefs(); drawVc(); $('[data-vc-copy]').focus(); return toast('Online card ready. Use it for shopping on websites.'); }
    if (e.target.closest('[data-vc-copy]')) { try { await navigator.clipboard.writeText('4000992133075108'); } catch (er) {} return toast('Card number copied'); }
    if (e.target.closest('[data-vc-del]')) { vcOn = prefs.vc = false; savePrefs(); drawVc(); $('[data-vc-new]').focus(); return toast('Online card deleted. Your main card still works.'); }
  });
  $('[data-card-tx]').innerHTML = SAMPLE.activity.map((t, i) => [t, i]).filter(([t]) => t.type === 'Card payment').slice(0, 4).map(([t, i]) => txRow(t, i)).join('');

  /* ═════════ FEES ═════════ */
  const FEE_TABLE = [['Opening an account', 'Look around before you add any money', 'Free'], ['Monthly fee', 'No plan to pick, no minimum balance', '$0'], ['Sending to anyone on Aztec', 'Arrives in seconds', 'Free'], ['Adding money by bank transfer', 'Usually within one working day', 'Free'], ['Adding money by debit card', 'Arrives right away', '1.5%'], ['Buying or selling digital assets', 'Shown in dollars before you confirm', '1%']];
  $('[data-fee-table]').innerHTML = FEE_TABLE.map(([t, s, v]) => `<li><span><b>${t}</b><small>${s}</small></span><span class="ft__v ${/Free|\$0/.test(v) ? 'is-free' : ''}">${v}</span></li>`).join('');
  const paid = SAMPLE.activity.filter(t => kindOf(t) === 'asset').map(t => ({ t, fee: Math.round(Math.abs(t.amount)) / 100 }));
  const feeTotal = paid.reduce((s, x) => s + x.fee, 0);
  $('[data-fm-total]').textContent = money(feeTotal);
  $('[data-fm-note]').textContent = `1% on ${paid.length} digital asset ${paid.length === 1 ? 'trade' : 'trades'}. Everything else you did this month was free.`;
  $('[data-fm-list]').innerHTML = paid.map(({ t, fee }) => `<li><span class="a-ico a-ico--${t.cls}"><svg class="ic"><use href="#${t.icon}"/></svg></span><span class="pr__t"><b>${t.type.split(' ')[0]} ${t.what}</b><small>${t.date}. Fee on ${money(Math.abs(t.amount))}</small></span><b class="pr__v">${money(fee)}</b></li>`).join('');
  const cnt = f => SAMPLE.activity.filter(f).length;
  const sent = cnt(t => t.type === 'Sent'), got = cnt(t => t.type === 'Received'), added = SAMPLE.activity.filter(t => t.type === 'Added money');
  $('[data-free]').innerHTML = [['i-send', 'c', `${sent} ${sent === 1 ? 'payment' : 'payments'} to friends`, 'Sending on Aztec is free'], ['i-receive', 'b', `${got} ${got === 1 ? 'payment' : 'payments'} received`, 'Getting paid is free'], ['i-bank', 'b', `${added.length} bank top-up of ${money(added.reduce((s, t) => s + t.amount, 0))}`, 'Adding by bank transfer is free'], ['i-star', 'c', 'Monthly fee', 'There isn’t one']].map(([ic, cls, b, s]) => `<li><span class="a-ico a-ico--${cls}"><svg class="ic"><use href="#${ic}"/></svg></span><span class="pr__t"><b>${b}</b><small>${s}</small></span><b class="pr__v is-pos">$0.00</b></li>`).join('');
  // fee calculator, same pricing as the website's "Work it out"
  let fcHow = 'send';
  const fcAmt = $('[data-fc-amt]');
  const drawFc = () => {
    const v = +fcAmt.value || 0, rate = { send: 0, card: .015, buy: .01 }[fcHow], fee = Math.round(v * rate * 100) / 100;
    $('[data-fc-fee]').textContent = money(fee);
    $('[data-fc-get-l]').textContent = { send: 'They get', card: 'You pay', buy: 'You get in crypto' }[fcHow];
    $('[data-fc-get]').textContent = money(fcHow === 'card' ? v + fee : fcHow === 'buy' ? v - fee : v);
  };
  fcAmt.addEventListener('input', () => { const c = fcAmt.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1'); if (c !== fcAmt.value) fcAmt.value = c; drawFc(); });
  $$('[data-fc-how] button').forEach(b => b.addEventListener('click', () => { fcHow = b.dataset.h; $$('[data-fc-how] button').forEach(x => x.setAttribute('aria-pressed', x === b)); drawFc(); }));
  drawFc();

  /* ── sliding pill for every segmented control, the same as the website's "Work it out" switch ── */
  const placeThumb = (seg, still) => {
    let t = seg.querySelector(':scope > .seg__thumb');
    if (!t) { t = document.createElement('span'); t.className = 'seg__thumb'; t.setAttribute('aria-hidden', 'true'); seg.prepend(t); still = true; }
    const b = seg.querySelector('button[aria-pressed="true"]');
    if (!b || !b.offsetWidth) return;
    t.classList.toggle('is-still', !!still || reduced);
    t.style.setProperty('--tw', b.offsetWidth + 'px'); t.style.setProperty('--tx', b.offsetLeft + 'px');
  };
  const placeAll = still => $$('.seg').forEach(s => placeThumb(s, still));
  new MutationObserver(ms => ms.forEach(m => {
    if (m.type === 'attributes') { const s = m.target.closest('.seg'); if (s) placeThumb(s); }
    else m.addedNodes.forEach(n => { if (n.nodeType === 1) (n.matches('.seg') ? [n] : $$('.seg', n)).forEach(s => placeThumb(s, true)); });
  })).observe(document.body, { subtree: true, childList: true, attributes: true, attributeFilter: ['aria-pressed'] });
  addEventListener('resize', () => placeAll(true));
  if (document.fonts) document.fonts.ready.then(() => placeAll(true));

  /* ── router: #dashboard, #wallet, #payments, #explore, #asset/btc, #activity, #insights, #learn, #card, #fees ── */
  const views = Object.fromEntries($$('[data-view]').map(v => [v.dataset.view, v]));
  let current = null;
  const show = name => {
    Object.entries(views).forEach(([k, v]) => { v.hidden = k !== name; });
    const navName = name === 'asset' ? 'explore' : name;
    $$('[data-nav]').forEach(a => { const on = a.dataset.nav === navName; a.classList.toggle('is-on', on); on ? a.setAttribute('aria-current', 'page') : a.removeAttribute('aria-current'); });
    document.title = (name === 'dashboard' ? 'Dashboard' : views[name].querySelector('h1').textContent) + ' – Aztec preview';
    current = name;
    placeAll(true);
  };
  const ITEMS = '.pf__dial, .pf__legend li, .qa__b, .as__row, .ins__sum, .ins__cats li, .tip, .tbl tbody tr, .start__list li, .gd li, .faq details, .kv > div, .sets .wc__row, .row-btn, .dev li, .docs li, .terms > div, .safe li, .wc__card, .wc__row, .wc__lim, .goal__v, .goal .a-meter, .wb__v, .wb__acts > *, .ex__top, .ex__chart, .out-row > *, .prof__head, .prof__cta, .pr li, .cu li, .bd li, .xp li, .ft li, .wk__b, .io__sum > div, .pm__b, .adc__chart, .ado__v, .cd__card, .lim, .vc__slot > *';
  /* chrome: sidebar, top bar and tab bar items step in once after the first load */
  $$('.side__logo, .side__nav a, .side__foot > *, .top > *, .tabs a').forEach((el, i, all) => {
    el.setAttribute('data-chrome', '');
    el.style.setProperty('--c', el.closest('.tabs') ? $$('.tabs a').indexOf(el) : el.closest('.top') ? $$('.top > *').indexOf(el) : Math.min(i, 12));
  });
  /* one entrance for every page: each block rises in on the shared step (aIn in core.css) */
  const enter = v => {
    const blocks = [];
    [...v.children].forEach(c => {
      if (c.classList.contains('grid')) [...c.children].forEach(g => g.classList.contains('col') ? blocks.push(...g.children) : blocks.push(g));
      else if (c.classList.contains('ex')) blocks.push(...c.children);
      else blocks.push(c);
    });
    blocks.forEach((b, i) => {
      b.style.setProperty('--i', Math.min(i, 9)); b.setAttribute('data-in', '');
      // then the rows inside each block, one by one
      $$(ITEMS, b).forEach((it, j) => { it.setAttribute('data-in-item', ''); it.style.setProperty('--j', Math.min(j, 12)); });
    });
    v.classList.remove('is-entering'); void v.offsetWidth; v.classList.add('is-entering');
  };
  let curArg = '';
  const route = (first = false) => {
    const [id, arg = ''] = location.hash.slice(1).split('/');
    const name = views[id] ? id : 'dashboard';
    if (first) { curArg = arg; if (name === 'asset') drawAsset(arg); return show(name); }
    if (name === current && arg === curArg) return;
    curArg = arg;
    if (dlg.open) close();
    loader.classList.add('is-swap'); AztecLoader.run();
    setTimeout(() => {
      if (name === 'asset') drawAsset(arg);
      show(name); scrollTo(0, 0); $('#main').focus({ preventScroll: true });
      setTimeout(() => { loader.classList.add('is-done'); loader.classList.remove('is-swap'); enter(views[name]); }, reduced ? 0 : 200);
    }, AztecLoader.SWAP_MS);
  };
  addEventListener('hashchange', () => route());

  /* ── boot ── */
  route(true);
  AztecLoader.run();
  setTimeout(() => { loader.classList.add('is-done'); root.classList.add('is-in'); enter(views[current]); }, AztecLoader.LOAD_MS);
})();
