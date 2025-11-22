// Fixed script.js — matches your neon HTML IDs and returns pure passwords only
document.addEventListener('DOMContentLoaded', () => {
  // Elements (IDs from your neon HTML)
  const userInput = qs('#userInput');
  const generateBtn = qs('#generateBtn');
  const regenBtn = qs('#regenBtn');
  const improveBtn = qs('#improveBtn');
  const lengthSlider = qs('#lengthSlider');
  const lengthValue = qs('#lengthValue');
  const meterFill = qs('#meterFill');
  const strengthText = qs('#strengthText');
  const improvedOutput = qs('#improvedOutput');
  const originalOutput = qs('#originalOutput');
  const copyButtons = Array.from(document.querySelectorAll('.copy'));
  const historyList = qs('#historyList');
  const clearHistoryBtn = qs('#clearHistory');
  const modeSelect = qs('#modeSelect');

  // checklist items (if present)
  const chkLength = qs('#chkLength');
  const chkUpper = qs('#chkUpper');
  const chkNumber = qs('#chkNumber');
  const chkSymbol = qs('#chkSymbol');

  // initialize
  lengthValue.innerText = lengthSlider.value;
  renderHistory();

  // events
  lengthSlider.addEventListener('input', () => lengthValue.innerText = lengthSlider.value);
  generateBtn.addEventListener('click', () => generate(false));
  regenBtn.addEventListener('click', () => generate(true));
  improveBtn.addEventListener('click', improveFromInput);
  clearHistoryBtn && clearHistoryBtn.addEventListener('click', () => { localStorage.removeItem('pw_history'); renderHistory(); });
  copyButtons.forEach(b => b.addEventListener('click', copyHandler));

  // MAIN: generate password
  function generate(isRegenerate = false) {
    const len = parseInt(lengthSlider.value, 10);
    const mode = modeSelect ? modeSelect.value : 'normal';
    const useUpper = qs('#useUpper') ? qs('#useUpper').checked : true;
    const useNumbers = qs('#useNumbers') ? qs('#useNumbers').checked : true;
    const useSymbols = qs('#useSymbols') ? qs('#useSymbols').checked : true;

    // decide seed: user input, or when regenerating use last improved pure pw
    let seed = userInput.value.trim();
    if (isRegenerate && improvedOutput.dataset && improvedOutput.dataset.password) {
      seed = improvedOutput.dataset.password || seed;
    }

    let purePassword = '';
    if (mode === 'normal') purePassword = genClient(seed, len, useUpper, useNumbers, useSymbols);
    else if (mode === 'ultra') purePassword = genUltra(len);
    else if (mode === 'human') purePassword = genHuman(len);
    else purePassword = genYannis(seed, len);

    const original = seed || '—';
    updateOutputs(purePassword, original);
    pushHistory(purePassword);
  }

  // Improve from user idea
  function improveFromInput() {
    const idea = userInput.value.trim();
    if (!idea) {
      alert('Type an idea first (e.g. FlySquad12345)');
      userInput.focus();
      return;
    }
    const len = parseInt(lengthSlider.value, 10);
    const improved = genYannis(idea, len);
    updateOutputs(improved, idea);
    pushHistory(improved);
  }

  // Update UI (IMPORTANT: we only display Yannis note visually if you want — here we DO NOT add it)
  function updateOutputs(passwordPure, original) {
    // Store pure password in dataset for safe copy/regenerate usage
    improvedOutput.innerText = passwordPure;                // show only pure password
    improvedOutput.dataset.password = passwordPure || '';

    originalOutput.innerText = original || '—';
    originalOutput.dataset.password = original || '';

    evaluateAndRender(passwordPure);
  }

  // Strength meter + checklist rendering
  function evaluateAndRender(password) {
    const s = evaluateStrength(password || '');
    meterFill.style.width = s.score + '%';

    if (s.score < 40) meterFill.style.background = 'linear-gradient(90deg,#ff3d81,#ff9a3d)';
    else if (s.score < 70) meterFill.style.background = 'linear-gradient(90deg,#ffb347,#ffd27f)';
    else meterFill.style.background = 'linear-gradient(90deg,#00f5a0,#00b3ff)';

    strengthText.innerText = `Strength: ${s.label}`;

    toggleClass(chkLength, s.rules.length);
    toggleClass(chkUpper, s.rules.upper);
    toggleClass(chkNumber, s.rules.number);
    toggleClass(chkSymbol, s.rules.symbol);
  }

  function toggleClass(el, cond) {
    if (!el) return;
    cond ? el.classList.add('check-ok') : el.classList.remove('check-ok');
  }

  // GENERATORS (return PURE passwords only)
  function genClient(suggestion, length, useUpper = true, useNumbers = true, useSymbols = true) {
    const lower = 'abcdefghijklmnopqrstuvwxyz';
    const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const nums = '0123456789';
    const syms = '!@#$%^&*()-_=+[]{};:,.<>?';

    let pool = lower + (useUpper ? upper : '') + (useNumbers ? nums : '') + (useSymbols ? syms : '');
    if (pool.length === 0) pool = lower;

    // seed mutate
    const base = suggestion ? suggestion.split('').map(c => mutate(c)) : [];
    while (base.length < length) base.push(pool[randomInt(pool.length)]);
    return shuffle(base).slice(0, length).join('');
  }

  function genUltra(length) {
    const pool = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()-_=+[]{};:,.<>?';
    const arr = Array.from({ length }, () => pool[randomInt(pool.length)]);
    return shuffle(arr).join('');
  }

  function genHuman(length) {
    const cons = 'bcdfghjklmnpqrstvwxyz';
    const vows = 'aeiou';
    let out = '';
    while (out.length < length - 2) {
      out += cons[randomInt(cons.length)];
      if (out.length < length - 2) out += vows[randomInt(vows.length)];
    }
    out = out.slice(0, length - 2) + ('' + (10 + randomInt(90)));
    return out;
  }

  function genYannis(suggestion, length) {
    const map = { 'a':'@','A':'@','s':'$','S':'$','i':'1','I':'1','o':'0','O':'0','e':'3','E':'3','t':'7','T':'7' };
    const arr = [];
    if (suggestion) {
      for (const ch of suggestion) arr.push(map[ch] || (Math.random() > 0.6 ? ch.toUpperCase() : ch));
    }
    const extras = '!@#$%^&*()-_=+[]{};:,.<>?';
    while (arr.length < length) {
      const r = Math.random();
      if (r < 0.35) arr.push(String.fromCharCode(97 + randomInt(26)));
      else if (r < 0.7) arr.push(String.fromCharCode(48 + randomInt(10)));
      else arr.push(extras[randomInt(extras.length)]);
    }
    return shuffle(arr).slice(0, length).join('');
  }

  // UTILITIES
  function mutate(ch) {
    const map = { 'a':'@','s':'$','i':'1','o':'0','e':'3','t':'7' };
    if (map[ch]) return map[ch];
    if (/[a-zA-Z]/.test(ch) && Math.random() > 0.5) return Math.random() > 0.5 ? ch.toUpperCase() : ch.toLowerCase();
    return ch;
  }
  function randomInt(max) { return Math.floor(Math.random() * max); }
  function shuffle(arr) {
    // arr can be array or string; ensure array
    const a = Array.isArray(arr) ? arr.slice() : String(arr).split('');
    for (let i = a.length - 1; i > 0; i--) {
      const j = randomInt(i + 1);
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  // Strength evaluator
  function evaluateStrength(password) {
    const pw = password || '';
    const res = { score: 0, label: 'Weak', rules: { length: false, upper: false, number: false, symbol: false } };

    if (pw.length >= 8) { res.score += Math.min(40, pw.length * 2); res.rules.length = true; }
    if (/[A-Z]/.test(pw)) { res.score += 20; res.rules.upper = true; }
    if (/[0-9]/.test(pw)) { res.score += 20; res.rules.number = true; }
    if (/[^A-Za-z0-9]/.test(pw)) { res.score += 20; res.rules.symbol = true; }

    res.score = Math.min(100, Math.round(res.score));
    res.label = res.score < 40 ? 'Weak' : res.score < 70 ? 'Medium' : 'Strong';
    return res;
  }

  // COPY HANDLER — copies pure password from dataset or text
  function copyHandler(e) {
    const target = e.currentTarget.dataset.target;
    let pure = '';
    if (target === 'improved') pure = improvedOutput.dataset.password || improvedOutput.innerText.trim();
    else pure = originalOutput.dataset.password || originalOutput.innerText.trim();

    if (!pure || pure === '—') return alert('Nothing to copy');
    navigator.clipboard.writeText(pure);
    flash('Copied to clipboard');
  }

  // HISTORY
  function pushHistory(pw) {
    if (!pw) return;
    let arr = JSON.parse(localStorage.getItem('pw_history') || '[]');
    arr.unshift({ pw, t: Date.now() });
    arr = arr.slice(0, 30);
    localStorage.setItem('pw_history', JSON.stringify(arr));
    renderHistory();
  }

  function renderHistory() {
    if (!historyList) return;
    historyList.innerHTML = '';
    const arr = JSON.parse(localStorage.getItem('pw_history') || '[]');
    arr.forEach(item => {
      const li = document.createElement('li');
      li.innerHTML = `<span>${item.pw}</span><div><button class="mini ghost" onclick="navigator.clipboard.writeText('${item.pw.replace(/'/g,"\\'")}')">COPY</button></div>`;
      historyList.appendChild(li);
    });
  }

  // tiny helpers
  function qs(sel) { return document.querySelector(sel); }
  function flash(msg) { /* small console flash (modify to show UI toast if you want) */ console.log(msg); }

  // expose for debugging
  window._generate = generate;
});
