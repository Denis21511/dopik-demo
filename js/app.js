/* допик — демо согласования доп. работ. Без сервера: всё хранится в браузере посетителя.
   Персонализация: ?k=код → название, город и стиль компании из js/companies.js */
'use strict';
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const LS = {
  get(k) { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* без сохранения */ } },
};
const KEY = 'dopik.demo.v1', DEF_CO = 'Ваша компания', DAY = 864e5;
const rub = n => Math.round(n).toLocaleString('ru-RU').replace(/ /g, ' ') + ' ₽';
const dt = t => new Date(t).toLocaleString('ru-RU', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' }).replace(',', ' в');
const day = t => new Date(t).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });
const sumOf = it => it.reduce((a, i) => a + i.q * i.p, 0);

const IC = {
  check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>', x: '<path d="M6 6l12 12M18 6L6 18"/>', chat: '<path d="M4 5h16v11H9l-5 4z"/>',
  pin: '<path d="M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>', plus: '<path d="M12 5v14M5 12h14"/>', moon: '<path d="M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5z"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6L7 7M17 17l1.4 1.4M5.6 18.4L7 17M17 7l1.4-1.4"/>',
  img: '<rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="9" cy="10" r="1.6"/><path d="M4 18l5-5 4 4 3-3 4 4"/>', send: '<path d="M4 12l16-8-6 16-3-6.5z"/>',
  shield: '<path d="M12 3l8 3v6c0 4.5-3.2 7.6-8 9-4.8-1.4-8-4.5-8-9V6z"/><path d="M8.5 12l2.5 2.5L15.5 10"/>',
};
const icon = (n, s = 18) => `<svg class="ic" width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${IC[n] || ''}</svg>`;

/* ---------- данные демо ---------- */
function seed(company = DEF_CO, city = '') {
  const now = Date.now();
  const w = (n, q, u, p) => ({ n, k: 'work', q, u, p }), m = (n, q, u, p) => ({ n, k: 'mat', q, u, p });
  return {
    v: 1, company, city, seq: 4, viewed: false,
    obj: { name: 'Квартира 62 м², ремонт под ключ', addr: (city ? city + ', ' : '') + 'ул. Ленина, 24, кв. 17', client: 'Ирина Соколова' },
    props: [
      { id: 1, no: 'ДР-0001', title: 'Выравнивание стен в санузле под плитку',
        desc: 'После демонтажа старой плитки выяснилось: стены неровные, перепад до 18 мм. Без выравнивания плитка ляжет волной, а швы поведёт. Фото вскрытия приложены.',
        items: [w('Штукатурка стен по маякам', 14, 'м²', 950), w('Грунтовка в два слоя', 14, 'м²', 120), m('Штукатурная смесь, мешки 25 кг', 8, 'шт', 640), m('Маяки, грунтовка', 1, 'компл.', 1450)],
        due: 'плюс 3 рабочих дня к графику', terms: 'Оплата по факту выполнения. Сроки основных работ сдвигаются на 3 дня.', status: 'sent', at: now - 3 * 36e5, ver: 1, comments: [] },
      { id: 2, no: 'ДР-0002', title: 'Перенос двух розеток на кухне',
        desc: 'Заказчик попросил перенести розетки под встроенную технику.',
        items: [w('Штроба и перенос розетки', 2, 'шт', 1800), m('Кабель, подрозетники, гофра', 1, 'компл.', 1100)],
        due: 'в течение 1 дня', terms: 'Оплата вместе с этапом «черновые работы».', status: 'approved', at: now - 5 * DAY, ver: 1, signer: 'Ирина Соколова', decidedAt: now - 5 * DAY + 2.5 * 36e5, comments: [], hash: 'a41f09c7e2' + 'b8d35f1a60c4e97d2b13f8a05c6e7d90a4b2' },
      { id: 3, no: 'ДР-0003', title: 'Тёплый пол в коридоре',
        desc: 'Электрический тёплый пол под плитку, 4,6 м².',
        items: [w('Монтаж тёплого пола', 4.6, 'м²', 1500), m('Мат, терморегулятор, гофра', 1, 'компл.', 9800)],
        due: 'до 20 числа', terms: 'Предоплата 50% за материалы.', status: 'declined', at: now - 9 * DAY, ver: 1, signer: 'Ирина Соколова', decidedAt: now - 8.6 * DAY, comments: [{ who: 'client', t: now - 8.6 * DAY, text: 'Пока не нужно, сделаем позже своими силами.' }] },
    ],
    log: [
      { t: now - 9 * DAY, text: 'ДР-0003 отправлено клиенту' }, { t: now - 8.6 * DAY, text: 'ДР-0003: клиент отказался' },
      { t: now - 5 * DAY, text: 'ДР-0002 отправлено клиенту' }, { t: now - 5 * DAY + 2.5 * 36e5, text: 'ДР-0002: клиент согласовал, 4 700 ₽' },
      { t: now - 3 * 36e5, text: 'ДР-0001 отправлено клиенту' },
    ],
  };
}
const Store = {
  s: null, tab: 'client',
  load() {
    const q = new URLSearchParams(location.search);
    const co = (window.COMPANIES || {})[(q.get('k') || '').toLowerCase()];
    const saved = LS.get(KEY);
    this.s = saved && saved.v === 1 ? saved : seed();
    if (co) { this.s.company = co.n; this.s.city = co.c || ''; this.s.obj.addr = (co.c ? co.c + ', ' : '') + 'ул. Ленина, 24, кв. 17'; }
    else if (!q.get('n')) { this.s.company = DEF_CO; this.s.city = ''; }
    Brand.apply(co && co.t);
    if (q.get('n')) this.s.company = q.get('n').trim().slice(0, 40) || this.s.company;
    this.save();
  },
  save() { LS.set(KEY, this.s); },
  reset() { this.s = seed(this.s.company, this.s.city); this.tab = 'client'; this.save(); },
  prop(id) { return this.s.props.find(p => p.id === +id); },
  current() { return this.s.props.find(p => ['sent', 'question'].includes(p.status)); },
  logPush(text) { this.s.log.push({ t: Date.now(), text }); },
};

/* ---------- фирменный стиль (тот же разбор, что в «Заявках для ремонта») ---------- */
const Brand = {
  t: null,
  hex(c) { const n = parseInt(c.slice(1), 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; },
  mix(a, b, k) { const x = this.hex(a), y = this.hex(b); return '#' + x.map((v, i) => Math.round(v * (1 - k) + y[i] * k).toString(16).padStart(2, '0')).join(''); },
  lum(c) { const [r, g, b] = this.hex(c).map(v => { v /= 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); }); return .2126 * r + .7152 * g + .0722 * b; },
  apply(t) {
    this.t = t || null;
    if (!t) return;
    const p = t.p, pi = t.pi || (this.lum(p) > .45 ? '#141414' : '#ffffff');
    const head = t.h || (this.lum(p) < .2 ? p : '#1b1d21');
    const fh = t.font ? `'${t.font}', var(--font)` : 'var(--font)';
    const common = `--navy:${p};--on-navy:${pi};--blue:${p};--font-h:${fh};--logo-bg:${t.lb || '#ffffff'};--logo-ink:${t.li || (this.lum(t.lb || '#ffffff') > .5 ? '#1b1d21' : '#ffffff')};`
      + (t.hero ? `--hero:url("${new URL(t.hero, location.href).href}");` : `--hero:${t.hb || '#1c1c1c'};`);
    const css = `:root{${common}--navy-2:${this.mix(p, '#000000', .12)};--blue-2:${this.lum(p) > .45 ? this.mix(p, '#000000', .45) : p};--blue-50:${this.mix(p, '#ffffff', .88)};--brand:${head};}`
      + `:root[data-theme="dark"]{${common}--navy-2:${this.mix(p, '#ffffff', .12)};--blue-2:${this.lum(p) < .08 ? '#e6e6e6' : p};--blue-50:${this.mix(p, '#141c1f', .8)};--brand:#f1f3f5;}`
      + (this.lum(p) < .08 ? `:root[data-theme="dark"]{--navy:#e9e9e9;--on-navy:#141414;--blue:#bdbdbd;}` : '');
    let st = $('#brand-css'); if (!st) { st = document.createElement('style'); st.id = 'brand-css'; document.head.appendChild(st); }
    st.textContent = css;
    if (t.font && !$('#brand-font')) {
      const l = document.createElement('link'); l.id = 'brand-font'; l.rel = 'stylesheet';
      l.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(t.font).replace(/%20/g, '+')}:wght@300;400;600;700;800&display=swap`;
      document.head.appendChild(l);
    }
    document.documentElement.classList.toggle('is-up', !!t.up);
    if (t.dark && !Theme.saved()) Theme.apply('dark');
  },
  logo() { const t = this.t, c = Store.s.company; return t.logo ? `<img src="${esc(t.logo)}" alt="${esc(c)}">${t.lt ? `<span class="blogo">${esc(t.lt)}</span>` : ''}` : `<span class="blogo">${t.lt ? esc(t.lt).replace(/\*(.+?)\*/g, '<i>$1</i>') : esc(c)}</span>`; },
  hero(inner, note) { return `<div class="bwrap"><div class="bhead">${this.logo()}${note ? `<small>${note}</small>` : ''}</div><div class="bhero">${inner}</div></div>`; },
};
const Theme = {
  KEY: 'dopik.theme',
  saved() { try { const t = localStorage.getItem(this.KEY); return t === 'dark' || t === 'light' ? t : null; } catch (e) { return null; } },
  apply(t) { document.documentElement.dataset.theme = t; },
  toggle() { const t = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'; try { localStorage.setItem(this.KEY, t); } catch (e) { /* без сохранения */ } this.apply(t); },
  init() { document.addEventListener('click', e => { if (e.target.closest('[data-theme-toggle]')) this.toggle(); }); },
};

/* ---------- вспомогательное ---------- */
function toast(title, text = '') {
  const el = document.createElement('div'); el.className = 'toast';
  el.innerHTML = `<b>${esc(title)}</b>${text ? `<p>${esc(text)}</p>` : ''}`;
  $('#toasts').appendChild(el);
  setTimeout(() => { el.classList.add('out'); setTimeout(() => el.remove(), 250); }, 5500);
}
function modal({ title, body, foot, onMount }) {
  const el = document.createElement('div'); el.className = 'back';
  el.innerHTML = `<div class="modal" role="dialog" aria-modal="true"><h3>${esc(title)}</h3>${body}<div class="foot">${foot}</div></div>`;
  const close = () => el.remove();
  el.addEventListener('mousedown', e => { if (e.target === el) close(); });
  $$('[data-close]', el).forEach(b => b.onclick = close);
  document.body.appendChild(el);
  onMount && onMount(el, close);
}
async function fingerprint(o) {
  const s = JSON.stringify(o);
  try {
    const b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s));
    return [...new Uint8Array(b)].map(x => x.toString(16).padStart(2, '0')).join('');
  } catch (e) {
    let h = 5381; for (const ch of s) h = (h * 33 ^ ch.charCodeAt(0)) >>> 0;
    return h.toString(16).padStart(8, '0').repeat(8);
  }
}
const short = h => h ? h.slice(0, 16) + '…' + h.slice(-8) : '';
const STATUS = { sent: ['wait', 'Ждёт ответа'], question: ['wait', 'Есть вопрос'], approved: ['ok', 'Согласовано'], declined: ['bad', 'Отказ'] };
const co = () => Store.s.company;
const topbar = () => {
  const b = Brand.t;
  const mark = b && b.logo ? `<span class="logo__img"><img src="${esc(b.logo)}" alt=""></span>` : '<span class="logo__m">' + icon('check', 16) + '</span>';
  return `<header class="top"><a class="logo" href="#/">${mark}<span>${b ? esc(co()) : 'допик'}</span></a>
    <button class="themebtn" data-theme-toggle aria-label="Светлая или тёмная тема"><span class="i-moon">${icon('moon', 16)}</span><span class="i-sun">${icon('sun', 16)}</span><span class="t-dark">Тёмная</span><span class="t-light">Светлая</span></button></header>`;
};

/* ---------- экраны ---------- */
function intro() {
  const s = Store.s, themed = !!Brand.t;
  const kicker = `<span class="kicker">допик · доп. работы без споров</span>`;
  const h = 'Доп. работа согласована письменно, а не «на словах»';
  const p = `Так ваш клиент${s.city ? ' в городе ' + esc(s.city) : ''} получит ссылку на доп. работы от «${esc(co())}», согласует их в один клик, а время и сумма останутся в истории.`;
  return themed ? Brand.hero(`${kicker}<h1>${h}</h1><p>${p}</p>`, s.city ? esc(s.city) : '')
    : `<section class="plain">${kicker}<h1>${h}</h1><p>${p}</p></section>`;
}
function proposalCard(pr, mode) {
  const s = Store.s, tot = sumOf(pr.items), works = sumOf(pr.items.filter(i => i.k === 'work')), mats = tot - works;
  const photos = pr.id === 1 ? ['Стена после демонтажа', 'Замер перепада 18 мм'] : [];
  return `<article class="card">
    <div class="eyebrow"><b>${esc(pr.no)}</b><span>версия ${pr.ver}</span><span>· ${esc(dt(pr.at))}</span><span class="pill ${STATUS[pr.status][0]}">${STATUS[pr.status][1]}</span></div>
    <div class="obj">${icon('pin', 16)}<div><b>${esc(s.obj.name)}</b><br>${esc(s.obj.addr)}</div></div>
    <h2>${esc(pr.title)}</h2><p class="desc">${esc(pr.desc)}</p>
    ${photos.length ? `<div class="photos">${photos.map(x => `<div class="photo">${icon('img', 34)}<i>${esc(x)}</i></div>`).join('')}</div>` : ''}
    <div class="sec-t">Состав и стоимость</div>
    <div>${pr.items.map(i => `<div class="item"><div><div class="nm">${esc(i.n)}</div><small>${i.k === 'work' ? 'Работа' : 'Материал'} · ${String(i.q).replace('.', ',')} ${esc(i.u)} × ${rub(i.p)}</small></div><span class="money">${rub(i.q * i.p)}</span></div>`).join('')}</div>
    <div class="sum"><div><span>Работы</span><span>${rub(works)}</span></div><div><span>Материалы</span><span>${rub(mats)}</span></div><div class="big"><span>Итого</span><b>${rub(tot)}</b></div></div>
    <div class="terms"><div class="term"><small>Срок</small><b>${esc(pr.due)}</b></div><div class="term"><small>Действует</small><b>до ${esc(day(pr.at + 3 * DAY))}</b></div><div class="term wide"><small>Условия</small><p>${esc(pr.terms)}</p></div></div>
  </article>`;
}
function banner(pr) {
  if (pr.status === 'approved') return `<div class="banner is-ok">${icon('check', 22)}<div><b>Вы согласовали эти работы</b><p>${esc(pr.signer)}, ${esc(dt(pr.decidedAt))}. Версия ${pr.ver}, ${rub(sumOf(pr.items))}.</p></div></div>`;
  if (pr.status === 'declined') return `<div class="banner is-bad">${icon('x', 22)}<div><b>Вы отказались от этих работ</b><p>${esc(dt(pr.decidedAt))}. Если передумаете, подрядчик пришлёт новую версию.</p></div></div>`;
  return '';
}
function thread(pr) {
  if (!pr.comments.length) return '';
  return `<section class="card"><div class="sec-t">Вопросы и ответы</div><div class="thread">${pr.comments.map(c => `<div class="msg ${c.who === 'client' ? 'me' : ''}"><small>${c.who === 'client' ? 'Вы' : esc(co())} · ${esc(dt(c.t))}</small>${esc(c.text)}</div>`).join('')}</div></section>`;
}
function clientView() {
  const s = Store.s;
  const pr = Store.prop(Store.sel) || Store.current() || s.props[s.props.length - 1];
  const open = ['sent', 'question'].includes(pr.status);
  return `${banner(pr)}${proposalCard(pr, 'client')}${thread(pr)}
    ${s.props.length > 1 ? `<section class="card"><div class="sec-t">Другие доп. работы по объекту</div>${s.props.filter(x => x.id !== pr.id).map(x => `<button class="lrow" data-open="${x.id}"><div class="t"><b>${esc(x.title)}</b><small>${esc(x.no)} · ${esc(day(x.at))}</small></div><span class="money">${rub(sumOf(x.items))}</span><span class="pill ${STATUS[x.status][0]}">${STATUS[x.status][1]}</span></button>`).join('')}</section>` : ''}
    <p class="hint">Страница нужна, чтобы договорённость не потерялась. Она не заменяет договор.</p>
    ${open ? `<div class="bar"><div class="in"><div class="tot"><small>Итого</small><b>${rub(sumOf(pr.items))}</b></div>
      <button class="btn btn--ghost" data-decline="${pr.id}">Отказаться</button><button class="btn" data-ask="${pr.id}">${icon('chat', 16)}Вопрос</button>
      <button class="btn btn--primary btn--lg" data-approve="${pr.id}">${icon('check', 18)}Согласовать</button></div></div>` : ''}`;
}
function ownerView() {
  const s = Store.s;
  const ok = s.props.filter(p => p.status === 'approved'), wait = s.props.filter(p => ['sent', 'question'].includes(p.status)), bad = s.props.filter(p => p.status === 'declined');
  const S = a => a.reduce((x, p) => x + sumOf(p.items), 0);
  return `<div class="kpis"><div class="kpi ok"><small>Согласовано доп. работ</small><b>${rub(S(ok))}</b></div><div class="kpi wait"><small>Ждут ответа клиента</small><b>${rub(S(wait))}</b></div><div class="kpi"><small>Клиент отказался</small><b>${rub(S(bad))}</b></div></div>
    <section class="card"><div class="row"><div class="sec-t grow">Доп. работы · ${esc(s.obj.name)}</div><button class="btn btn--primary btn--sm" data-new>${icon('plus', 16)}Новое предложение</button></div>
      <div>${s.props.slice().reverse().map(x => `<button class="lrow" data-open="${x.id}" data-go="client"><div class="t"><b>${esc(x.title)}</b><small>${esc(x.no)} · ${esc(day(x.at))}${x.signer ? ' · ' + esc(x.signer) : ''}</small></div><span class="money">${rub(sumOf(x.items))}</span><span class="pill ${STATUS[x.status][0]}">${STATUS[x.status][1]}</span></button>`).join('')}</div></section>
    <section class="card"><div class="sec-t">История, которую не переписать</div><div class="log">${s.log.slice().reverse().map(l => `<div><time>${esc(dt(l.t))}</time><span>${esc(l.text)}</span></div>`).join('')}</div>
      <p class="hint">Каждая запись хранит отпечаток предыдущей. Если кто-то поменяет сумму задним числом, это будет видно.</p></section>`;
}
function render() {
  const s = Store.s;
  const tabs = `<div class="tabs" role="tablist"><button data-tab="client" class="${Store.tab === 'client' ? 'is-on' : ''}">Глазами клиента</button><button data-tab="owner" class="${Store.tab === 'owner' ? 'is-on' : ''}">Кабинет подрядчика</button></div>`;
  $('#root').innerHTML = `${topbar()}<main class="wrap">${intro()}${tabs}${Store.tab === 'client' ? clientView() : ownerView()}
    <section class="cta"><b>Так это выглядело бы у «${esc(co())}»</b><p>Подрядчик отправляет ссылку в WhatsApp или MAX, клиент нажимает «Согласовать», вы получаете уведомление. Без регистрации для клиента.</p><button class="btn" id="reset">Начать демо заново</button></section>
  </main>`;
  $$('[data-tab]').forEach(b => b.onclick = () => { Store.tab = b.dataset.tab; render(); window.scrollTo(0, 0); });
  $$('[data-open]').forEach(b => b.onclick = () => { Store.sel = +b.dataset.open; Store.tab = 'client'; render(); window.scrollTo(0, 0); });
  $$('[data-approve]').forEach(b => b.onclick = () => approve(+b.dataset.approve));
  $$('[data-decline]').forEach(b => b.onclick = () => decline(+b.dataset.decline));
  $$('[data-ask]').forEach(b => b.onclick = () => ask(+b.dataset.ask));
  $$('[data-new]').forEach(b => b.onclick = newProposal);
  $('#reset').onclick = () => { Store.sel = null; Store.reset(); render(); window.scrollTo(0, 0); };
}

/* ---------- действия клиента ---------- */
function approve(id) {
  const pr = Store.prop(id), tot = sumOf(pr.items);
  modal({
    title: 'Согласовать доп. работы',
    body: `<div class="receipt"><div><span>Работа</span><b style="text-align:right">${esc(pr.title)}</b></div><div><span>Объект</span><span style="text-align:right">${esc(Store.s.obj.name)}</span></div><div><span>Срок</span><span>${esc(pr.due)}</span></div><div><span style="color:var(--ink)">Итого</span><b>${rub(tot)}</b></div></div>
      <label class="field">Ваше имя<input class="input" id="nm" value="${esc(Store.s.obj.client)}" maxlength="80"></label>
      <label class="check"><input type="checkbox" id="ag"><span>Я ознакомился с составом и стоимостью работ (${rub(tot)}) и согласую их на этих условиях</span></label><div class="err" id="er"></div>`,
    foot: `<button class="btn" data-close>Назад</button><button class="btn btn--primary" id="ok">${icon('check', 16)}Согласовать ${rub(tot)}</button>`,
    onMount(m, close) {
      $('#ok', m).onclick = async () => {
        const name = $('#nm', m).value.trim();
        if (!name) return $('#er', m).textContent = 'Укажите ваше имя';
        if (!$('#ag', m).checked) return $('#er', m).textContent = 'Отметьте, что согласны с условиями';
        const at = Date.now();
        pr.status = 'approved'; pr.signer = name; pr.decidedAt = at;
        pr.hash = await fingerprint({ no: pr.no, ver: pr.ver, items: pr.items, due: pr.due, terms: pr.terms, total: tot, signer: name, at });
        Store.logPush(`${pr.no}: клиент согласовал, ${rub(tot)}`); Store.save(); close();
        receipt(pr);
      };
    },
  });
}
function receipt(pr) {
  window.scrollTo(0, 0);
  $('#root').innerHTML = `${topbar()}<main class="wrap"><section class="card done"><span class="bi">${icon('check', 32)}</span><h2 style="font-size:26px">Согласовано</h2>
    <p class="muted">Подрядчик получил ваше подтверждение. Условия зафиксированы.</p>
    <div class="receipt" style="width:100%"><div><span>Предложение</span><b>${esc(pr.no)}</b></div><div><span>Работа</span><span style="text-align:right">${esc(pr.title)}</span></div><div><span>Дата и время</span><span>${esc(dt(pr.decidedAt))}</span></div><div><span>Согласовал</span><span>${esc(pr.signer)}</span></div><div><span style="color:var(--ink)">Сумма</span><b>${rub(sumOf(pr.items))}</b></div><div><span>Отпечаток условий</span><span class="code">${esc(short(pr.hash))}</span></div></div>
    <div class="row"><button class="btn btn--primary" id="to-owner">Посмотреть, что увидит подрядчик</button><button class="btn" id="to-client">К предложению</button></div></section></main>`;
  $('#to-owner').onclick = () => { Store.tab = 'owner'; render(); window.scrollTo(0, 0); toast('Уведомление подрядчику', `Клиент согласовал ${pr.no} на ${rub(sumOf(pr.items))}`); };
  $('#to-client').onclick = () => { Store.sel = pr.id; Store.tab = 'client'; render(); };
}
function decline(id) {
  const pr = Store.prop(id);
  modal({
    title: 'Отказаться от доп. работ?',
    body: `<label class="field">Причина (необязательно)<textarea class="textarea" id="cm" rows="3" maxlength="400" placeholder="Например: сделаем позже своими силами"></textarea></label>`,
    foot: '<button class="btn" data-close>Назад</button><button class="btn btn--danger" id="ok">Отказаться</button>',
    onMount(m, close) {
      $('#ok', m).onclick = () => {
        const t = $('#cm', m).value.trim();
        pr.status = 'declined'; pr.signer = Store.s.obj.client; pr.decidedAt = Date.now();
        if (t) pr.comments.push({ who: 'client', t: pr.decidedAt, text: t });
        Store.logPush(`${pr.no}: клиент отказался`); Store.save(); close(); render(); window.scrollTo(0, 0);
        toast('Подрядчик получил ответ', 'Отказ сохранён в истории');
      };
    },
  });
}
function ask(id) {
  const pr = Store.prop(id);
  modal({
    title: 'Вопрос подрядчику',
    body: `<label class="field">Сообщение<textarea class="textarea" id="q" rows="4" maxlength="500" placeholder="Например: можно ли взять смесь подешевле?"></textarea></label><div class="err" id="er"></div>`,
    foot: `<button class="btn" data-close>Отмена</button><button class="btn btn--primary" id="ok">${icon('send', 16)}Отправить</button>`,
    onMount(m, close) {
      $('#ok', m).onclick = () => {
        const t = $('#q', m).value.trim(); if (!t) return $('#er', m).textContent = 'Напишите вопрос';
        pr.comments.push({ who: 'client', t: Date.now(), text: t });
        pr.comments.push({ who: 'co', t: Date.now() + 1, text: 'Добрый день! Посмотрим и вернёмся к вам в течение часа. Если нужно, пришлём новую версию.' });
        pr.status = 'question'; Store.logPush(`${pr.no}: вопрос от клиента`); Store.save(); close(); render();
        toast('Вопрос отправлен', 'Ответ появится на этой странице');
      };
    },
  });
}

/* ---------- кабинет: новое предложение ---------- */
const PRESETS = [['Перенос розетки', 'work', 1, 'шт', 1800], ['Доп. слой грунтовки', 'work', 20, 'м²', 120], ['Демонтаж стяжки', 'work', 10, 'м²', 700], ['Выравнивание откосов', 'work', 6, 'м.п.', 650], ['Материалы', 'mat', 1, 'компл.', 2500]];
function newProposal() {
  const rows = [PRESETS[0].slice()];
  modal({
    title: 'Новое предложение клиенту',
    body: `<label class="field">Что нужно сделать<input class="input" id="t" maxlength="90" value="Дополнительные работы на кухне"></label>
      <div class="chips" id="pre">${PRESETS.map((p, i) => `<button type="button" class="chip" data-p="${i}">+ ${esc(p[0])}</button>`).join('')}</div>
      <div id="rows" style="display:grid;gap:6px"></div><div class="row"><span class="muted small grow">Итого</span><b id="tt"></b></div><div class="err" id="er"></div>`,
    foot: `<button class="btn" data-close>Отмена</button><button class="btn btn--primary" id="ok">${icon('send', 16)}Отправить клиенту</button>`,
    onMount(m, close) {
      const paint = () => {
        $('#rows', m).innerHTML = rows.map((r, i) => `<div class="irow"><input class="input" data-f="0" data-i="${i}" value="${esc(r[0])}" aria-label="Название"><input class="input" data-f="2" data-i="${i}" value="${r[2]}" inputmode="decimal" aria-label="Количество"><input class="input" data-f="4" data-i="${i}" value="${r[4]}" inputmode="numeric" aria-label="Цена"><button type="button" class="btn btn--ghost btn--sm" data-rm="${i}" aria-label="Убрать" style="padding:0">×</button></div>`).join('');
        $$('#rows input', m).forEach(inp => inp.oninput = () => { const r = rows[+inp.dataset.i], f = +inp.dataset.f; r[f] = f === 0 ? inp.value : +String(inp.value).replace(',', '.') || 0; tot(); });
        $$('[data-rm]', m).forEach(b => b.onclick = () => { rows.splice(+b.dataset.rm, 1); paint(); });
        tot();
      };
      const tot = () => $('#tt', m).textContent = rub(rows.reduce((a, r) => a + r[2] * r[4], 0));
      $$('[data-p]', m).forEach(b => b.onclick = () => { rows.push(PRESETS[+b.dataset.p].slice()); paint(); });
      paint();
      $('#ok', m).onclick = () => {
        const title = $('#t', m).value.trim(), items = rows.filter(r => r[0].trim() && r[2] > 0 && r[4] > 0).map(r => ({ n: r[0].trim(), k: r[1], q: r[2], u: r[3], p: r[4] }));
        if (!title) return $('#er', m).textContent = 'Напишите, что за работа';
        if (!items.length) return $('#er', m).textContent = 'Добавьте хотя бы одну позицию с ценой';
        const s = Store.s, id = s.seq++, now = Date.now();
        s.props.push({ id, no: 'ДР-' + String(id).padStart(4, '0'), title, desc: 'Работа обнаружена в процессе ремонта. Состав и стоимость ниже.', items, due: 'по согласованию', terms: 'Оплата по факту выполнения.', status: 'sent', at: now, ver: 1, comments: [] });
        Store.logPush(`ДР-${String(id).padStart(4, '0')} отправлено клиенту`);
        Store.sel = id; Store.tab = 'client'; Store.save(); close(); render(); window.scrollTo(0, 0);
        toast('Ссылка ушла клиенту', 'Так предложение видит заказчик');
      };
    },
  });
}

Theme.init();
Store.load();
render();
