/* ==========================================================================
   URUS AT ITS PEAK — Media registration · front-end logic
   Invitation link format:
   index.html?wave=A&email=jane@media.com&title=Ms.&first_name=Jane&last_name=Doe&token=XYZ
   Decline link:  index.html?rsvp=no&wave=A&email=...&title=...&last_name=...&token=XYZ
   ========================================================================== */
(() => {
  'use strict';

  /* ---------- CONFIG (single source of truth — edit here) ---------- */
  const CONFIG = {
    location: 'Seville',              // ⚠ mockups say "Costa del Sol" — confirm with client
    defaultDates: '2 – 4 March 2027',
    endpoint: '',                     // e.g. '/api/registrations' — empty = demo mode (no network call)
    freeNavigation: false,            // true = any step reachable without completing the previous ones (validation runs at Confirm)
    declineEndpoint: '',              // e.g. '/api/registrations/decline'
    waves: {
      A: { from: '2027-02-26', to: '2027-02-28' },
      B: { from: '2027-02-27', to: '2027-03-01' },
      C: { from: '2027-02-28', to: '2027-03-02' },
      D: { from: '2027-03-01', to: '2027-03-03' },
      E: { from: '2027-03-02', to: '2027-03-04' },
    },
    lastEventDay: '2027-03-04',
    concierge: {
      phone: '+34 XXX XXX XXX',       // ⚠ pending: number not provided in brief
      hours: 'Mon – Fri · 9:00 – 14:00 / 15:00 – 18:00 CET',
      email: 'concierge@urusdynamic.com',
    },
  };

  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const form = $('#regForm');
  const steps = $$('.step', form);
  const stepperItems = $$('#stepper li');
  const prevBtn = $('#prevBtn');
  const nextBtn = $('#nextBtn');
  let current = 0;
  let maxReached = 0;
  let currentSection = 'registration';

  /* ---------- Dates ---------- */
  const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const d = iso => { const [y, m, day] = iso.split('-').map(Number); return new Date(y, m - 1, day); };
  const fmt = iso => { const x = d(iso); return `${x.getDate()} ${months[x.getMonth()]} ${x.getFullYear()}`; };
  const range = w => {
    const a = d(w.from), b = d(w.to);
    return a.getMonth() === b.getMonth()
      ? `${a.getDate()} – ${b.getDate()} ${months[b.getMonth()]} ${b.getFullYear()}`
      : `${a.getDate()} ${months[a.getMonth()]} – ${b.getDate()} ${months[b.getMonth()]} ${b.getFullYear()}`;
  };

  /* ---------- Prefill from invitation link ---------- */
  const params = new URLSearchParams(location.search);
  const waveKey = (params.get('wave') || '').toUpperCase();
  const wave = CONFIG.waves[waveKey];
  form.wave.value = wave ? waveKey : '';
  form.token.value = params.get('token') || '';
  if (params.get('subcategory')) form.subcategory.value = params.get('subcategory');

  const email = params.get('email');
  if (email) form.email.value = email;
  else form.email.removeAttribute('readonly');   // no preset → let them type it (fallback)
  if (!email) $('.f .lock')?.remove();

  const titleRaw = params.get('title') || '';
  const titleP = /^ms/i.test(titleRaw) ? 'Ms.' : /^mr/i.test(titleRaw) ? 'Mr.' : '';
  if (titleP) form.title.value = titleP;
  ['first_name', 'last_name'].forEach(k => { if (params.get(k)) form[k].value = params.get(k); });

  $$('[data-location]').forEach(el => (el.textContent = CONFIG.location));
  $$('[data-hero-dates]').forEach(el => (el.textContent = wave ? range(wave) : CONFIG.defaultDates));
  $$('[data-wave-from]').forEach(el => wave && (el.textContent = fmt(wave.from)));
  $$('[data-wave-to]').forEach(el => wave && (el.textContent = fmt(wave.to)));
  $$('[data-wave-range]').forEach(el => (el.textContent = wave ? `from ${range(wave)}` : ''));

  const c = CONFIG.concierge;
  $$('[data-concierge]').forEach(el => {
    el.innerHTML = `<b><svg class="ico" aria-hidden="true" focusable="false"><use href="#i-headset"/></svg>Lamborghini Concierge</b>Hotline: ${c.phone} · ${c.hours}<br>E-mail: <a href="mailto:${c.email}">${c.email}</a>`;
  });

  /* ---------- Countries (datalist) ---------- */
  const COUNTRIES = 'Afghanistan|Albania|Algeria|Andorra|Angola|Argentina|Armenia|Australia|Austria|Azerbaijan|Bahamas|Bahrain|Bangladesh|Barbados|Belarus|Belgium|Belize|Benin|Bhutan|Bolivia|Bosnia and Herzegovina|Botswana|Brazil|Brunei|Bulgaria|Burkina Faso|Burundi|Cambodia|Cameroon|Canada|Cape Verde|Central African Republic|Chad|Chile|China|Colombia|Comoros|Congo|Costa Rica|Côte d\'Ivoire|Croatia|Cuba|Cyprus|Czech Republic|Denmark|Djibouti|Dominica|Dominican Republic|DR Congo|Ecuador|Egypt|El Salvador|Equatorial Guinea|Eritrea|Estonia|Eswatini|Ethiopia|Fiji|Finland|France|Gabon|Gambia|Georgia|Germany|Ghana|Greece|Grenada|Guatemala|Guinea|Guinea-Bissau|Guyana|Haiti|Honduras|Hong Kong|Hungary|Iceland|India|Indonesia|Iran|Iraq|Ireland|Israel|Italy|Jamaica|Japan|Jordan|Kazakhstan|Kenya|Kiribati|Kosovo|Kuwait|Kyrgyzstan|Laos|Latvia|Lebanon|Lesotho|Liberia|Libya|Liechtenstein|Lithuania|Luxembourg|Macau|Madagascar|Malawi|Malaysia|Maldives|Mali|Malta|Marshall Islands|Mauritania|Mauritius|Mexico|Micronesia|Moldova|Monaco|Mongolia|Montenegro|Morocco|Mozambique|Myanmar|Namibia|Nauru|Nepal|Netherlands|New Zealand|Nicaragua|Niger|Nigeria|North Korea|North Macedonia|Norway|Oman|Pakistan|Palau|Palestine|Panama|Papua New Guinea|Paraguay|Peru|Philippines|Poland|Portugal|Puerto Rico|Qatar|Romania|Russia|Rwanda|Saint Kitts and Nevis|Saint Lucia|Saint Vincent and the Grenadines|Samoa|San Marino|São Tomé and Príncipe|Saudi Arabia|Senegal|Serbia|Seychelles|Sierra Leone|Singapore|Slovakia|Slovenia|Solomon Islands|Somalia|South Africa|South Korea|South Sudan|Spain|Sri Lanka|Sudan|Suriname|Sweden|Switzerland|Syria|Taiwan|Tajikistan|Tanzania|Thailand|Timor-Leste|Togo|Tonga|Trinidad and Tobago|Tunisia|Turkey|Turkmenistan|Tuvalu|Uganda|Ukraine|United Arab Emirates|United Kingdom|United States|Uruguay|Uzbekistan|Vanuatu|Vatican City|Venezuela|Vietnam|Yemen|Zambia|Zimbabwe'.split('|');
  $('#countries').innerHTML = COUNTRIES.map(n => `<option value="${n}">`).join('');

  /* ---------- Conditional blocks: data-when="field:val1|val2" ---------- */
  const conditionals = $$('[data-when]');
  const valuesOf = name => $$(`[name="${CSS.escape(name)}"]`, form)
    .filter(el => (el.type === 'checkbox' || el.type === 'radio') ? el.checked : true)
    .map(el => el.value);
  function syncConditionals() {
    conditionals.forEach(block => {
      const [field, vals] = block.dataset.when.split(':');
      const show = valuesOf(field).some(v => vals.split('|').includes(v));
      const wasHidden = block.hidden;
      block.hidden = !show;
      $$('input,select,textarea', block).forEach(i => (i.disabled = !show));
      if (show && wasHidden) { block.classList.remove('reveal'); void block.offsetWidth; block.classList.add('reveal'); }
      if (!show) {
        $$('input[type=checkbox],input[type=radio]', block).forEach(i => (i.checked = false));
      }
    });
  }
  form.addEventListener('change', syncConditionals);
  syncConditionals();

  /* ---------- Validation ---------- */
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const lastDay = d(CONFIG.lastEventDay);
  const eventEnd = wave ? d(wave.to) : lastDay;

  function fieldError(el) {
    if (el.disabled) return '';
    if (el.validity.valueMissing) return el.type === 'radio' ? 'Please choose an option.' : 'This field is required.';
    if (el.validity.typeMismatch && el.type === 'email') return 'Please enter a valid e-mail address.';
    if (el.validity.patternMismatch && el.type === 'tel') return 'Please enter a valid phone number, including country code.';
    if (el.type === 'date' && el.value) {
      const v = d(el.value);
      if (el.hasAttribute('data-past') && v > today) return 'This date cannot be in the future.';
      if (el.hasAttribute('data-after-event') && v <= eventEnd) return `The document must be valid beyond ${fmt((wave || { to: CONFIG.lastEventDay }).to)}.`;
    }
    if (el.list && el.value && !COUNTRIES.includes(el.value) && el.id !== 'birth_place') return 'Please select a country from the list.';
    return '';
  }
  function softWarning(el) {
    if (el.hasAttribute('data-six-months') && el.value && form.doc_type.value === 'Passport') {
      const six = new Date(eventEnd); six.setMonth(six.getMonth() + 6);
      if (d(el.value) < six) return 'Heads-up: non-EU travellers usually need a passport valid at least 6 months beyond the trip.';
    }
    return '';
  }
  function paint(el, msg) {
    const wrap = el.closest('.f') || el.closest('.choices') || el.closest('.consent');
    if (!wrap) return;
    wrap.classList.toggle('is-invalid', !!msg);
    const host = wrap.classList.contains('consent') ? null : wrap;
    if (host) {
      let e = host.nextElementSibling?.classList?.contains('err') ? host.nextElementSibling : null;
      if (host.classList.contains('f')) e = $('.err', host);
      if (!e) { e = document.createElement('span'); e.className = 'err'; e.setAttribute('role', 'alert');
        host.classList.contains('f') ? host.appendChild(e) : host.after(e); }
      e.textContent = msg;
    }
    if (el.type !== 'radio' && el.type !== 'checkbox') el.setAttribute('aria-invalid', msg ? 'true' : 'false');
    // soft warnings
    if (wrap.classList.contains('f')) {
      let w = $('.warn', wrap); const wm = msg ? '' : softWarning(el);
      if (wm && !w) { w = document.createElement('span'); w.className = 'warn'; wrap.appendChild(w); }
      if (w) w.textContent = wm;
    }
  }
  function validateStep(i) {
    const els = $$('input,select,textarea', steps[i]).filter(el => !el.disabled && el.type !== 'hidden');
    let first = null; const seenRadio = new Set();
    els.forEach(el => {
      if (el.type === 'radio') { if (seenRadio.has(el.name)) return; seenRadio.add(el.name); }
      const msg = fieldError(el);
      paint(el, msg);
      if (msg && !first) first = el;
    });
    if (i === steps.length - 1) {
      const missing = $$('.consent input', steps[i]).filter(x => !x.checked);
      $('#consentErr').textContent = missing.length ? 'Please accept all mandatory declarations to confirm.' : '';
    }
    if (first) {
      first.focus({ preventScroll: true });
      (first.closest('.f,.choices,.consent') || first).scrollIntoView({ behavior: 'smooth', block: 'center' });
      return false;
    }
    return true;
  }
  form.addEventListener('input', e => { if (e.target.closest('.is-invalid')) paint(e.target, fieldError(e.target)); });
  form.addEventListener('change', e => {
    const t = e.target;
    if (t.closest('.is-invalid') || t.type === 'date') paint(t, fieldError(t));
    if (t.name === 'doc_type') paint(form.doc_expiry, fieldError(form.doc_expiry));
  });

  /* ---------- Summary ---------- */
  const J = (sep, ...a) => a.filter(x => x && String(x).trim()).join(sep);
  const SECTIONS = [
    { step: 0, title: 'Personal data', fields: [
      ['Name', f => J(' ', f.get('title'), f.get('first_name'), f.get('last_name'))],
      ['E-mail', 'email'], ['Mobile', 'mobile'],
      ['Address', f => J(', ', f.get('address'), J(' ', f.get('postal_code'), f.get('city')), f.get('state'))],
      ['Company', f => J(' · ', f.get('company'), f.get('position'))]] },
    { step: 1, title: 'Documents', fields: [
      ['Driving licence', f => J(' · ', mask(f.get('dl_number')), f.get('dl_country'), f.get('dl_expiry') && 'exp. ' + dateOut(f.get('dl_expiry')))],
      ['Name on document', f => J(' ', f.get('doc_first_name'), f.get('doc_last_name'))],
      ['Born', f => J(', ', dateOut(f.get('birth_date')), f.get('birth_place'))],
      ['Nationality / residence', f => J(' / ', f.get('nationality'), f.get('residence_country'))],
      ['Document', f => J(' · ', J(' ', f.get('doc_type'), mask(f.get('doc_number'))), f.get('doc_country'), f.get('doc_expiry') && 'exp. ' + dateOut(f.get('doc_expiry')))],
      ['Visa assistance', f => f.get('visa_assistance') ? 'Yes' : '']] },
    { step: 2, title: 'Travel & stay', fields: [
      ['Travel', f => J(' · ', f.get('travel_pref'), f.get('travel_origin'), f.get('parking') ? 'parking required' : '')],
      ['Comments', 'travel_comments'], ['Hotel room', 'hotel'],
      ['Food', f => J(', ', ...f.getAll('food').filter(x => x !== 'Other'), f.get('food_other'))]] },
    { step: 3, title: 'Activities', fields: [
      ['Media activities', f => f.get('activities') === 'Yes' ? (f.getAll('activity').join(', ') || 'Yes — to be defined') : (f.get('activities') || '')],
      ['Interview details', 'interview_detail'], ['Comments', 'comments']] },
  ];
  const esc = s => String(s ?? '').replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
  const mask = v => !v ? '' : v.length <= 4 ? v : '•••• ' + v.slice(-4);
  const dateOut = v => v ? fmt(v) : '';
  function buildSummary() {
    const f = new FormData(form);
    $('#summary').innerHTML = SECTIONS.map(s => {
      const rows = s.fields.map(([label, get]) => {
        const v = typeof get === 'function' ? get(f) : f.get(get);
        return v && String(v).trim() ? `<dt>${esc(label)}</dt><dd>${esc(v)}</dd>` : '';
      }).join('');
      const body = rows ? `<dl>${rows}</dl>` : '<p class="summary__empty">Not completed yet.</p>';
      return `<section><header><h3>${esc(s.title)}</h3><button type="button" data-goto="${s.step}">${rows ? 'Edit' : 'Complete'}</button></header>${body}</section>`;
    }).join('');
  }

  /* ---------- Navigation ---------- */
  const bgLayers = $$('.bg__layer');
  function setBg(key) { bgLayers.forEach(l => l.classList.toggle('is-active', l.dataset.bg === key)); }
  function go(i, { focus = true } = {}) {
    current = Math.max(0, Math.min(i, steps.length - 1));
    maxReached = Math.max(maxReached, current);
    steps.forEach((s, k) => s.classList.toggle('is-current', k === current));
    stepperItems.forEach((li, k) => {
      li.classList.toggle('is-current', k === current);
      li.classList.toggle('is-done', k !== current && (CONFIG.freeNavigation || k <= maxReached));
      li.querySelector('button').setAttribute('aria-current', k === current ? 'step' : 'false');
    });
    $('#progressLabel').textContent = steps[current].dataset.label;
    $('#progressCount').textContent = `${current + 1} / ${steps.length}`;
    $('#progressBar').style.width = `${((current + 1) / steps.length) * 100}%`;
    prevBtn.hidden = current === 0;
    nextBtn.innerHTML = current === steps.length - 1 ? 'Confirm <span class="arrow" aria-hidden="true">→</span>' : 'Continue <span class="arrow" aria-hidden="true">→</span>';
    if (current === steps.length - 1) buildSummary();
    setBg(steps[current].dataset.bg);
    if (focus) {
      form.scrollTo({ top: 0, behavior: 'smooth' });
      steps[current].querySelector('.step__title')?.setAttribute('tabindex', '-1');
      steps[current].querySelector('.step__title')?.focus({ preventScroll: true });
    }
  }
  // Silent check (no painting) used to find the first incomplete step
  function stepIsValid(i) {
    const els = $$('input,select,textarea', steps[i]).filter(el => !el.disabled && el.type !== 'hidden');
    const okFields = els.every(el => !fieldError(el));
    const okConsents = i !== steps.length - 1 || $$('.consent input', steps[i]).every(x => x.checked);
    return okFields && okConsents;
  }
  nextBtn.addEventListener('click', () => {
    const last = current === steps.length - 1;
    if (!CONFIG.freeNavigation && !validateStep(current)) return;
    if (!last) { go(current + 1); return; }
    // Confirm: every step must be complete
    const bad = steps.findIndex((_, i) => !stepIsValid(i));
    if (bad === -1) { submit(); return; }
    if (bad !== current) {
      go(bad);
      requestAnimationFrame(() => validateStep(bad));
      $('#consentErr').textContent = '';
    } else validateStep(current);
  });
  prevBtn.addEventListener('click', () => go(current - 1));
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-goto]');
    if (!b) return;
    const target = +b.dataset.goto;
    if (CONFIG.freeNavigation || target <= maxReached) go(target);
  });
  form.addEventListener('keydown', e => {
    if (e.key === 'Enter' && e.target.tagName === 'INPUT' && e.target.type !== 'checkbox' && e.target.type !== 'radio') {
      e.preventDefault(); nextBtn.click();
    }
  });

  /* ---------- Submit ---------- */
  function payload() {
    const f = new FormData(form); const o = {};
    for (const [k, v] of f.entries()) o[k] = o[k] !== undefined ? [].concat(o[k], v) : v;
    o.food = f.getAll('food'); o.activity = f.getAll('activity');
    o.submitted_at = new Date().toISOString();
    return o;
  }
  const salutation = () => `${form.title.value || ''} ${form.first_name.value} ${form.last_name.value}`.trim();
  async function submit() {
    nextBtn.disabled = true; nextBtn.textContent = 'Sending…';
    try {
      if (CONFIG.endpoint) {
        const r = await fetch(CONFIG.endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(payload()), credentials: 'same-origin' });
        if (!r.ok) throw new Error(r.status);
      } else {
        console.info('[demo] registration payload', payload());
        await new Promise(r => setTimeout(r, 600));
      }
      showFinal('#doneScreen', salutation());
    } catch (err) {
      nextBtn.disabled = false; nextBtn.innerHTML = 'Confirm <span class="arrow" aria-hidden="true">→</span>';
      $('#consentErr').textContent = `We couldn't send your registration. Please try again or contact ${CONFIG.concierge.email}.`;
    }
  }
  function showFinal(sel, name) {
    form.hidden = true; $('#stepper').hidden = true; $('.progress').hidden = true;
    const s = $(sel); s.hidden = false;
    $$('[data-salutation]', s).forEach(el => (el.textContent = name || 'guest'));
    $$('[data-email-echo]', s).forEach(el => (el.textContent = form.email.value));
    if (currentSection === 'registration') setBg('peak');
    s.focus({ preventScroll: true });
    s.scrollTop = 0;
  }

  /* ---------- Decline flow (?rsvp=no) ---------- */
  if ((params.get('rsvp') || '').toLowerCase() === 'no') {
    const name = [titleP, params.get('first_name'), params.get('last_name')].filter(Boolean).join(' ');
    if (CONFIG.declineEndpoint) {
      fetch(CONFIG.declineEndpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: form.token.value, email, wave: form.wave.value, rsvp: 'no' }) }).catch(() => {});
    }
    showFinal('#declineScreen', name);
  } else {
    go(0, { focus: false });
  }

  /* ---------- Program: real dates for Day 1 / 2 / 3 from the guest's wave ---------- */
  const WEEKDAYS = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  $$('[data-day]').forEach(el => {
    if (!wave) return;
    const x = d(wave.from); x.setDate(x.getDate() + Number(el.dataset.day));
    el.textContent = `${WEEKDAYS[x.getDay()]} ${x.getDate()} ${months[x.getMonth()]}`;
  });

  /* ---------- Sections: Registration · Program · Travel & Accommodation · FAQ ---------- */
  const sections = $$('[data-section]');
  const secBtn = $('#secnavBtn'), secMenu = $('#secnavMenu'), secLabel = $('#secnavLabel');
  function regBg() {
    const finalOpen = !$('#doneScreen').hidden || !$('#declineScreen').hidden;
    return finalOpen ? 'peak' : steps[current].dataset.bg;
  }
  /* Crossfade between sections: the box on screen fades out, then the new one fades in */
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const OUT_MS = 280, IN_MS = 520, EASE_IN = 'cubic-bezier(.4,0,1,1)', EASE_OUT = 'cubic-bezier(.22,1,.36,1)';
  let swapToken = 0;
  const visibleSection = () => sections.find(s => !s.hidden);
  const fadeTargets = sec => sec.classList.contains('reg')
    ? [...sec.children].filter(el => !el.hidden && getComputedStyle(el).display !== 'none')
    : [sec];
  function showSection(name, { updateHash = true, focus = false, animate = true } = {}) {
    const target = sections.find(s => s.dataset.section === name);
    if (!target) return false;
    const prev = visibleSection();
    currentSection = name;
    secLabel.textContent = target.dataset.label;
    $$('[data-section-link]', secMenu).forEach(a => {
      if (a.dataset.sectionLink === name) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
    });
    setBg(name === 'registration' ? regBg() : target.dataset.bg);
    if (updateHash && location.hash !== '#' + name) history.replaceState(null, '', '#' + name);
    const token = ++swapToken;
    const swapIn = () => {
      if (token !== swapToken) return;
      sections.forEach(s => (s.hidden = s !== target));
      if (name !== 'registration') target.scrollTop = 0;
      if (animate && !reduceMotion && prev !== target) {
        fadeTargets(target).forEach(el => el.animate(
          [{ opacity: 0, transform: 'translateY(12px)' }, { opacity: 1, transform: 'none' }],
          { duration: IN_MS, easing: EASE_OUT }));
      }
      if (focus) {
        const h = target.querySelector('.step__title') || target.querySelector('h2');
        if (h) { h.setAttribute('tabindex', '-1'); h.focus({ preventScroll: true }); }
      }
    };
    if (!prev || prev === target || !animate || reduceMotion) { swapIn(); return true; }
    const outs = fadeTargets(prev);
    Promise.all(outs.map(el => el.animate(
      [{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'translateY(-8px)' }],
      { duration: OUT_MS, easing: EASE_IN, fill: 'forwards' }).finished.catch(() => {})))
      .then(() => {
        swapIn();
        outs.forEach(el => el.getAnimations().forEach(a => { if (a.effect && a.effect.getTiming().fill === 'forwards') a.cancel(); }));
      });
    return true;
  }
  function setMenu(open) {
    secMenu.hidden = !open; secBtn.setAttribute('aria-expanded', String(open));
    if (open) (secMenu.querySelector('[aria-current="page"]') || secMenu.querySelector('a')).focus();
  }
  secBtn.addEventListener('click', () => setMenu(secMenu.hidden));
  secMenu.addEventListener('click', e => {
    const a = e.target.closest('[data-section-link]'); if (!a) return;
    e.preventDefault(); setMenu(false); showSection(a.dataset.sectionLink, { focus: true });
  });
  secMenu.addEventListener('keydown', e => {
    const items = $$('a', secMenu); const i = items.indexOf(document.activeElement);
    if (e.key === 'ArrowDown') { e.preventDefault(); items[(i + 1) % items.length].focus(); }
    if (e.key === 'ArrowUp') { e.preventDefault(); items[(i - 1 + items.length) % items.length].focus(); }
    if (e.key === 'Escape') { setMenu(false); secBtn.focus(); }
  });
  document.addEventListener('click', e => { if (!secMenu.hidden && !e.target.closest('.secnav')) setMenu(false); });

  /* ---------- FAQ: smooth, exclusive accordion ---------- */
  const faqItems = $$('.faq details');
  const OPEN_MS = 460, CLOSE_MS = 340;
  function animateFaq(d, open) {
    const summary = d.querySelector('summary'), body = d.querySelector('p');
    d._anim?.cancel(); d._fade?.cancel();
    const start = d.getBoundingClientRect().height;
    const frame = d.offsetHeight - d.clientHeight;            // borders
    if (open) d.open = true;
    const end = open ? (d.style.height = 'auto', d.getBoundingClientRect().height) : summary.getBoundingClientRect().height + frame;
    d.style.height = ''; d.style.overflow = 'hidden';
    d.classList.toggle('is-opening', open); d.classList.toggle('is-closing', !open);
    d._anim = d.animate([{ height: start + 'px' }, { height: end + 'px' }],
      { duration: open ? OPEN_MS : CLOSE_MS, easing: open ? 'cubic-bezier(.22,1,.36,1)' : 'cubic-bezier(.4,0,.2,1)' });
    d._fade = body.animate(open
      ? [{ opacity: 0, transform: 'translateY(-6px)' }, { opacity: 1, transform: 'none' }]
      : [{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'translateY(-4px)' }],
      { duration: open ? OPEN_MS : CLOSE_MS * .7, easing: 'ease', fill: 'both' });
    d._anim.onfinish = () => {
      if (!open) d.open = false;
      d.style.overflow = ''; d.classList.remove('is-opening', 'is-closing');
      d._fade?.cancel(); d._anim = d._fade = null;
      if (open) {                                                 // keep the answer in view inside the scrolling card
        const card = d.closest('.card'), r = d.getBoundingClientRect(), c = card.getBoundingClientRect();
        if (r.bottom > c.bottom - 16) card.scrollBy({ top: Math.min(r.bottom - c.bottom + 24, r.top - c.top - 16), behavior: 'smooth' });
      }
    };
    d._anim.oncancel = () => { d.style.overflow = ''; };
  }
  faqItems.forEach(d => {
    d.querySelector('summary').addEventListener('click', e => {
      e.preventDefault();
      const willOpen = !d.open || d.classList.contains('is-closing');
      if (reduceMotion) { faqItems.forEach(o => { if (o !== d) o.open = false; }); d.open = willOpen; return; }
      if (willOpen) faqItems.forEach(o => { if (o !== d && o.open && !o.classList.contains('is-closing')) animateFaq(o, false); });
      animateFaq(d, willOpen);
    });
  });

  /* ---------- Legal documents (client texts) in a modal ---------- */
  const LEGAL = window.URUS_LEGAL || {};
  const modal = $('#legalModal'), mBody = $('#legalBody'), mFoot = $('#legalFoot');
  let lastFocus = null, consentFor = null;
  function renderBlocks(blocks) {
    let html = '', list = '';
    const flush = () => { if (list) { html += `<ul>${list}</ul>`; list = ''; } };
    blocks.forEach(([kind, t]) => {
      if (kind === 'li') { list += `<li>${esc(t)}</li>`; return; }
      flush();
      if (kind === 'h') html += `<h3>${esc(t)}</h3>`;
      else if (kind === 'table') html += `<div class="tbl"><table><thead><tr>${t.head.map(h => `<th>${esc(h)}</th>`).join('')}</tr></thead><tbody><tr><td colspan="${t.head.length}">${esc(t.empty)}</td></tr></tbody></table></div>`;
      else html += `<p>${esc(t).replace(/([\w.+-]+@[\w-]+\.[\w.]+[a-z])/gi, '<a href="mailto:$1">$1</a>')}</p>`;
    });
    flush(); return html;
  }
  function openLegal(id, consentName = null) {
    const doc = LEGAL[id]; if (!doc) return false;
    lastFocus = document.activeElement; consentFor = consentName;
    $('#legalKicker').textContent = doc.kicker;
    $('#legalTitle').textContent = doc.title;
    mBody.innerHTML = renderBlocks(doc.blocks); mBody.scrollTop = 0;
    mFoot.hidden = !consentName;
    modal.hidden = false;
    $('.modal__close', modal).focus();
    return true;
  }
  function closeLegal() {
    if (modal.hidden) return;
    modal.hidden = true;
    if (lastFocus && document.contains(lastFocus)) lastFocus.focus({ preventScroll: true });
  }
  modal.addEventListener('click', e => { if (e.target.closest('[data-modal-close]')) closeLegal(); });
  $('#legalAccept').addEventListener('click', () => {
    const box = consentFor && form.querySelector(`input[name="${consentFor}"]`);
    if (box) { box.checked = true; box.dispatchEvent(new Event('change', { bubbles: true })); }
    if ($$('.consent input', form).every(x => x.checked)) $('#consentErr').textContent = '';
    box?.closest('.consent')?.classList.remove('is-invalid');
    closeLegal();
  });
  modal.addEventListener('keydown', e => {
    if (e.key === 'Escape') { e.preventDefault(); closeLegal(); return; }
    if (e.key !== 'Tab') return;
    const f = $$('button:not([hidden]), a[href], [tabindex="0"]', modal).filter(el => el.offsetParent !== null);
    if (!f.length) return;
    const first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });
  document.addEventListener('click', e => {
    const a = e.target.closest('[data-legal]'); if (!a) return;
    e.preventDefault(); e.stopPropagation();
    openLegal(a.dataset.legal, a.dataset.consent || null);
  }, true);

  /* ---------- Deep links: #program, #faq, #privacy-policy … ---------- */
  function route(animate) {
    const h = decodeURIComponent(location.hash.slice(1));
    if (!h) return;
    if (LEGAL[h]) { openLegal(h); return; }
    showSection(h, { updateHash: false, animate });
  }
  window.addEventListener('hashchange', () => route(true));
  showSection(currentSection, { updateHash: false, animate: false });
  route(false);

  /* ---------- Intro motion ---------- */
  requestAnimationFrame(() => requestAnimationFrame(() => document.documentElement.classList.add('is-ready')));
})();
