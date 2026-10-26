/* PikoSite — app.js
   Все запросы идут из браузера к открытым публичным API:
   DNS-over-HTTPS (Cloudflare/Google), RDAP, ipwho.is, crt.sh, Wayback Machine. */
(() => {
'use strict';

const VERSION = '1.0';
const $  = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const sleep = ms => new Promise(r => setTimeout(r, ms));
const uniq = a => [...new Set(a)];
const RES = window.PIKO_RESOURCES || [];
const CATS = uniq(RES.map(x => x.c));
const resUrl = (x, d) => x.u.replace(/\{d\}/g, encodeURIComponent(d));

/* ------------------------------------------------------------ icons */
const I = {
  res: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5M8.5 11h5M11 8.5v5"/></svg>',
  id:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="16" rx="3"/><path d="M7 9h6M7 13h10M7 16h4"/></svg>',
  dns: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="6" rx="2"/><rect x="3" y="14" width="18" height="6" rx="2"/><path d="M7 7h.01M7 17h.01"/></svg>',
  ip:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/></svg>',
  mail:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="3"/><path d="m4 7 8 6 8-6"/></svg>',
  sub: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="6" cy="6" r="2.5"/><circle cx="18" cy="12" r="2.5"/><circle cx="6" cy="18" r="2.5"/><path d="M8.5 6H12a3 3 0 0 1 3 3v0M8.5 18H12a3 3 0 0 0 3-3v0"/></svg>',
  cert:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z"/><path d="m9 12 2 2 4-4"/></svg>',
  arch:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
  sec: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>',
  tech:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="m8 8-4 4 4 4M16 8l4 4-4 4M13.5 5l-3 14"/></svg>',
  dl:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4v11m0 0-4-4m4 4 4-4M5 20h14"/></svg>',
  cp:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V6a2 2 0 0 1 2-2h9"/></svg>',
  up:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V5m0 0-5 5m5-5 5 5"/></svg>'
};

/* ------------------------------------------------------------ bg glow + title */
(() => {
  const g = $('#glow'); let tx = innerWidth / 2, ty = innerHeight * .3, x = tx, y = ty;
  addEventListener('pointermove', e => { tx = e.clientX; ty = e.clientY; }, { passive: true });
  (function loop() { x += (tx - x) * .08; y += (ty - y) * .08; g.style.transform = `translate3d(${x}px,${y}px,0)`; requestAnimationFrame(loop); })();

  const t = $('#title');
  'PikoSite'.split('').forEach((c, i) => {
    const s = document.createElement('span'); s.className = 'ch'; s.textContent = c; s.style.setProperty('--i', i); t.appendChild(s);
  });
  setTimeout(() => t.classList.add('shine'), 2200);
})();

/* ------------------------------------------------------------ toast */
let toastT;
function toast(msg) {
  const t = $('#toast'); t.textContent = msg; t.classList.add('show');
  clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('show'), 2200);
}

/* ------------------------------------------------------------ terminal */
const out = $('#out'), cmd = $('#cmd'), tb = $('#termBody'), prompt = $('.t-prompt');
const hist = []; let hi = 0, busy = false, lastReport = null;

function ln(html, cls = '') {
  const d = document.createElement('div'); d.className = 'ln ' + cls; d.innerHTML = html;
  out.appendChild(d); tb.scrollTop = tb.scrollHeight; return d;
}
async function typeLn(text, cls = '', speed = 14) {
  const d = document.createElement('div'); d.className = 'ln ' + cls; out.appendChild(d);
  for (const ch of text) { d.textContent += ch; tb.scrollTop = tb.scrollHeight; await sleep(speed); }
  return d;
}
function setBusy(b) { busy = b; prompt.classList.toggle('busy', b); cmd.disabled = b; if (!b) cmd.focus({ preventScroll: true }); }

tb.addEventListener('click', () => { if (!getSelection().toString()) cmd.focus({ preventScroll: true }); });

cmd.addEventListener('keydown', e => {
  if (e.key === 'Enter') {
    const v = cmd.value.trim(); cmd.value = '';
    if (v) { hist.push(v); hi = hist.length; }
    run(v);
  } else if (e.key === 'ArrowUp') { e.preventDefault(); if (hi > 0) cmd.value = hist[--hi] || ''; }
  else if (e.key === 'ArrowDown') { e.preventDefault(); hi < hist.length - 1 ? cmd.value = hist[++hi] : (hi = hist.length, cmd.value = ''); }
  else if (e.key === 'l' && e.ctrlKey) { e.preventDefault(); out.innerHTML = ''; }
});

$$('.chip-btn').forEach(b => b.addEventListener('click', async () => {
  if (busy) return;
  const text = 'Piko --' + b.dataset.ex; cmd.value = '';
  tb.scrollIntoView({ behavior: 'smooth', block: 'center' });
  for (const ch of text) { cmd.value += ch; await sleep(28); }
  await sleep(220); const v = cmd.value; cmd.value = ''; hist.push(v); hi = hist.length; run(v);
}));

function normalizeDomain(raw) {
  let s = String(raw || '').trim().toLowerCase().replace(/^["']|["']$/g, '');
  s = s.replace(/^[a-z][a-z0-9+.-]*:\/\//, '').replace(/^[^@/]*@/, '').split(/[/?#]/)[0].replace(/:\d+$/, '').replace(/\.$/, '');
  if (!s) return null;
  try { s = new URL('http://' + s).hostname; } catch { return null; }
  return /^(?=.{3,253}$)([a-z0-9_](?:[a-z0-9_-]{0,61}[a-z0-9_])?\.)+[a-z0-9-]{2,63}$/.test(s) && !/^\d+(\.\d+)+$/.test(s) ? s : null;
}

async function run(raw) {
  ln(`<span class="ps">piko@site</span><span class="pc">:~$</span> ${esc(raw)}`, 'cmd');
  if (!raw) return;
  const parts = raw.split(/\s+/); let head = parts[0].toLowerCase();

  if (head === 'help' || head === '?' || (head === 'piko' && /^(-h|--help|help)$/i.test(parts[1] || ''))) {
    ln('Команды:', 'ok');
    ln('  <b>Piko --example.com</b>     полный отчёт по домену', 'mut');
    ln('  <b>export txt</b>             скачать последний отчёт (TXT)', 'mut');
    ln('  <b>export json</b>            скачать последний отчёт (JSON)', 'mut');
    ln('  <b>resources</b>              список категорий ресурсов', 'mut');
    ln('  <b>history</b>                история команд', 'mut');
    ln('  <b>about</b>                  о проекте', 'mut');
    ln('  <b>clear</b>                  очистить терминал (Ctrl+L)', 'mut');
    return;
  }
  if (head === 'clear' || head === 'cls') { out.innerHTML = ''; return; }
  if (head === 'resources' || head === 'sources' || head === 'res') {
    ln(`Ресурсов в базе: <b>${RES.length}</b> · категорий: ${CATS.length}`, 'ok');
    CATS.forEach(c => ln(`  ${esc(c)} <span class="dim">— ${RES.filter(x => x.c === c).length}</span>`, 'mut'));
    ln('Ссылки с подставленным доменом — в отчёте, раздел «Ресурсы».', 'dim'); return;
  }
  if (head === 'history') { hist.length ? hist.forEach((h, i) => ln(`${String(i + 1).padStart(3)}  ${esc(h)}`, 'mut')) : ln('История пуста', 'dim'); return; }
  if (head === 'about') {
    ln(`PikoSite v${VERSION} — домены без лишнего шума.`, 'ok');
    ln('Сайт создан @incidum · канал @pikodev', 'mut'); return;
  }
  if (head === 'export' || head === 'download') {
    const f = (parts[1] || '').toLowerCase();
    if (!lastReport) return ln('Нет данных для экспорта. Сначала: Piko --example.com', 'err');
    if (f !== 'txt' && f !== 'json') return ln('Формат: export txt | export json', 'err');
    download(f); ln(`Файл ${f.toUpperCase()} сохранён.`, 'ok'); return;
  }

  let target = null;
  if (head === 'piko') target = parts.slice(1).join('').replace(/^-+/, '');
  else if (/^--?\S/.test(raw)) target = raw.replace(/^-+/, '');
  else target = raw; // допускаем просто домен
  const domain = normalizeDomain(target);
  if (!domain) return ln(`Не похоже на домен: «${esc(target || '')}». Пример: <b>Piko --example.com</b>`, 'err');
  await scan(domain);
}

/* ------------------------------------------------------------ network */
async function jfetch(url, opts = {}, ms = 12000) {
  const c = new AbortController(), t = setTimeout(() => c.abort(), ms);
  try {
    const r = await fetch(url, { ...opts, signal: c.signal });
    if (!r.ok) { const e = new Error('HTTP ' + r.status); e.status = r.status; throw e; }
    return await r.json();
  } finally { clearTimeout(t); }
}
async function doh(name, type) {
  const q = encodeURIComponent(name);
  for (const u of [`https://cloudflare-dns.com/dns-query?name=${q}&type=${type}`, `https://dns.google/resolve?name=${q}&type=${type}`]) {
    try { return await jfetch(u, { headers: { accept: 'application/dns-json' } }, 8000); } catch {}
  }
  throw new Error('DoH недоступен');
}
const TYPES = { A: 1, AAAA: 28, NS: 2, MX: 15, TXT: 16, CNAME: 5, SOA: 6, CAA: 257 };
const dot = s => String(s).replace(/\.$/, '');
function cleanData(type, d) {
  d = String(d);
  if (type === 'TXT') return d.replace(/^"|"$/g, '').replace(/"\s+"/g, '');
  if (type === 'NS' || type === 'CNAME') return dot(d);
  if (type === 'MX') { const [p, ...h] = d.split(/\s+/); return `${p} ${dot(h.join(' '))}`; }
  if (type === 'SOA') return d.split(/\s+/).map((x, i) => i < 2 ? dot(x) : x).join(' ');
  return d;
}

async function modDNS(domain) {
  const res = {}; let status = 0, ad = false;
  await Promise.all(Object.entries(TYPES).map(async ([name, code]) => {
    try {
      const j = await doh(domain, name);
      if (name === 'A') { status = j.Status; ad = !!j.AD; }
      res[name] = (j.Answer || []).filter(a => a.type === code).map(a => ({ value: cleanData(name, a.data), ttl: a.TTL }));
    } catch { res[name] = []; }
  }));
  const order = ['A', 'AAAA', 'CNAME', 'NS', 'MX', 'TXT', 'SOA', 'CAA'];
  const records = {}; order.forEach(k => records[k] = res[k] || []);
  const total = Object.values(records).reduce((n, a) => n + a.length, 0);
  return { data: { records, rcode: status, dnssecAD: ad, total }, note: `${total} записей` };
}

function parseRdap(j) {
  const ev = {}; (j.events || []).forEach(e => ev[e.eventAction] = e.eventDate);
  const reg = (j.entities || []).find(e => (e.roles || []).includes('registrar'));
  const vc = (e, key) => (e?.vcardArray?.[1] || []).find(x => x[0] === key)?.[3];
  const abuseEnt = (reg?.entities || []).find(e => (e.roles || []).includes('abuse'));
  return {
    domain: dot(j.ldhName || ''), handle: j.handle || null,
    registrar: vc(reg, 'fn') || null,
    ianaId: reg?.publicIds?.find(p => /IANA/i.test(p.type))?.identifier || null,
    abuseEmail: vc(abuseEnt, 'email') || null,
    registered: ev.registration || null, updated: ev['last changed'] || null,
    expires: ev.expiration || null, rdapUpdated: ev['last update of RDAP database'] || null,
    status: j.status || [], nameservers: (j.nameservers || []).map(n => dot(n.ldhName || '').toLowerCase()),
    dnssecSigned: j.secureDNS ? !!j.secureDNS.delegationSigned : null
  };
}
async function modRDAP(domain) {
  const labels = domain.split('.'); const cands = [];
  for (let i = 0; i <= labels.length - 2 && cands.length < 4; i++) cands.push(labels.slice(i).join('.'));
  let lastErr;
  for (const c of cands) {
    try {
      const j = await jfetch('https://rdap.org/domain/' + encodeURIComponent(c), { headers: { accept: 'application/rdap+json, application/json' } }, 14000);
      const d = parseRdap(j); d.queried = c;
      return { data: d, note: d.registrar || 'данные получены' };
    } catch (e) { lastErr = e; }
  }
  throw lastErr || new Error('RDAP недоступен');
}

function expandV6(ip) {
  let [h, t] = ip.split('::'); const a = h ? h.split(':') : [], b = t ? t.split(':') : [];
  const mid = ip.includes('::') ? Array(8 - a.length - b.length).fill('0') : [];
  return [...a, ...mid, ...b].map(x => x.padStart(4, '0')).join('');
}
function ptrName(ip) {
  return ip.includes(':') ? expandV6(ip).split('').reverse().join('.') + '.ip6.arpa' : ip.split('.').reverse().join('.') + '.in-addr.arpa';
}
async function ipInfo(ip) {
  const o = { ip, family: ip.includes(':') ? 'IPv6' : 'IPv4' };
  const [geo, ptr] = await Promise.allSettled([jfetch('https://ipwho.is/' + ip, {}, 9000), doh(ptrName(ip), 'PTR')]);
  if (geo.status === 'fulfilled' && geo.value.success !== false) {
    const g = geo.value;
    Object.assign(o, {
      country: g.country || null, countryCode: g.country_code || null, region: g.region || null, city: g.city || null,
      asn: g.connection?.asn ? 'AS' + g.connection.asn : null, org: g.connection?.org || null, isp: g.connection?.isp || null,
      timezone: g.timezone?.id || null
    });
  }
  if (ptr.status === 'fulfilled') { const a = (ptr.value.Answer || []).filter(x => x.type === 12); o.ptr = a.length ? dot(a[0].data) : null; }
  return o;
}
async function modIP(dns) {
  const ips = [...dns.records.A.map(a => a.value).slice(0, 4), ...dns.records.AAAA.map(a => a.value).slice(0, 2)];
  const list = await Promise.all(ips.map(ipInfo));
  return { data: list, note: `${list.length} IP` };
}

async function modMail(domain, dns) {
  const mx = dns.records.MX.map(m => { const [p, h] = m.value.split(' '); return { priority: +p, host: h }; }).sort((a, b) => a.priority - b.priority);
  const spfRaw = dns.records.TXT.map(t => t.value).find(t => /^v=spf1/i.test(t)) || null;
  let spfPolicy = null;
  if (spfRaw) { const m = spfRaw.match(/([-~?+]?)all\b/i); spfPolicy = m ? ({ '-': 'fail (-all)', '~': 'softfail (~all)', '?': 'neutral (?all)', '+': 'pass (+all)', '': 'pass (all)' })[m[1]] : 'без all'; }
  const spfIncludes = spfRaw ? [...spfRaw.matchAll(/include:([^\s]+)/gi)].map(m => m[1]) : [];
  let dmarcRaw = null, dmarcPolicy = null;
  try { const j = await doh('_dmarc.' + domain, 'TXT'); dmarcRaw = (j.Answer || []).filter(a => a.type === 16).map(a => cleanData('TXT', a.data)).find(t => /^v=DMARC1/i.test(t)) || null; } catch {}
  if (dmarcRaw) dmarcPolicy = (dmarcRaw.match(/;\s*p=([a-z]+)/i) || dmarcRaw.match(/^v=DMARC1;\s*p=([a-z]+)/i) || [])[1] || null;
  const selectors = ['default', 'google', 'selector1', 'selector2', 'k1', 's1', 'mail', 'dkim'];
  const dk = await Promise.all(selectors.map(async s => {
    try { const j = await doh(`${s}._domainkey.${domain}`, 'TXT'); return (j.Answer || []).some(a => a.type === 16 && /v=DKIM1|p=/i.test(a.data)) ? s : null; } catch { return null; }
  }));
  return { data: { mx, spf: spfRaw, spfPolicy, spfIncludes, dmarc: dmarcRaw, dmarcPolicy, dkimSelectors: dk.filter(Boolean) }, note: mx.length ? `${mx.length} MX` : 'MX не найден' };
}

async function modSubs(domain) {
  const rows = await jfetch(`https://crt.sh/?q=%25.${encodeURIComponent(domain)}&output=json`, {}, 28000);
  const names = new Set();
  rows.forEach(r => String(r.name_value || '').split('\n').forEach(n => {
    n = n.trim().toLowerCase().replace(/^\*\./, '');
    if (n && (n === domain || n.endsWith('.' + domain))) names.add(n);
  }));
  const seen = new Set(), certs = [];
  rows.sort((a, b) => String(b.not_before).localeCompare(String(a.not_before))).forEach(r => {
    const k = r.common_name + '|' + r.issuer_name + '|' + r.not_before;
    if (seen.has(k)) return; seen.add(k);
    certs.push({ id: r.id, commonName: r.common_name, issuer: (String(r.issuer_name).match(/O=([^,]+)/) || [, r.issuer_name])[1].replace(/"/g, ''), notBefore: r.not_before, notAfter: r.not_after });
  });
  return { data: { subdomains: [...names].sort(), certTotal: rows.length, certs: certs.slice(0, 12) }, note: `${names.size} поддоменов` };
}

const tsToISO = t => `${t.slice(0, 4)}-${t.slice(4, 6)}-${t.slice(6, 8)}T${t.slice(8, 10)}:${t.slice(10, 12)}:${t.slice(12, 14)}Z`;
async function modArchive(domain) {
  const base = `https://web.archive.org/cdx/search/cdx?url=${encodeURIComponent(domain)}&output=json&fl=timestamp,statuscode`;
  const [f, l] = await Promise.allSettled([jfetch(base + '&limit=1', {}, 15000), jfetch(base + '&limit=-1', {}, 15000)]);
  const pick = r => r.status === 'fulfilled' && r.value[1] ? { ts: r.value[1][0], status: r.value[1][1] } : null;
  const first = pick(f), last = pick(l);
  if (!first && !last) return { data: { found: false }, note: 'снимков нет' };
  const mk = x => x && { date: tsToISO(x.ts), status: x.status, url: `https://web.archive.org/web/${x.ts}/http://${domain}/` };
  return { data: { found: true, first: mk(first), last: mk(last || first) }, note: 'есть снимки' };
}

/* ------------------------------------------------------------ analysis */
const TECH = [
  ['Cloudflare', /cloudflare/i], ['Google (Workspace/Cloud)', /google|aspmx|1e100|gmail/i], ['Microsoft 365 / Azure', /outlook|protection\.outlook|microsoft|azure|office365/i],
  ['Amazon AWS', /amazon|aws|route53|awsdns|cloudfront/i], ['Fastly', /fastly/i], ['Akamai', /akamai/i], ['Vercel', /vercel/i], ['Netlify', /netlify/i],
  ['GitHub Pages', /github\.io|github/i], ['DigitalOcean', /digitalocean/i], ['Hetzner', /hetzner/i], ['OVH', /ovh/i], ['Namecheap', /namecheap|registrar-servers/i],
  ['GoDaddy', /godaddy|domaincontrol/i], ['Yandex', /yandex/i], ['VK / Mail.ru', /mail\.ru|vk\.com/i], ['Zoho', /zoho/i], ['Proton', /proton/i],
  ['Mailgun', /mailgun/i], ['SendGrid', /sendgrid/i], ['Fly.io', /fly\.io/i], ['Heroku', /heroku/i], ['Squarespace', /squarespace/i], ['Wix', /wix/i]
];
function analyze(rep) {
  const d = rep.dns?.records || {}, w = rep.whois, m = rep.mail, c = rep.certificates;
  const hay = [
    ...(d.NS || []).map(x => x.value), ...(d.CNAME || []).map(x => x.value), ...(d.MX || []).map(x => x.value),
    ...(rep.hosting || []).flatMap(h => [h.org, h.isp, h.ptr]), ...(m?.spfIncludes || []), w?.registrar
  ].filter(Boolean).join(' | ');
  rep.tech = TECH.filter(([, re]) => re.test(hay)).map(([n]) => n);

  const checks = [];
  const add = (st, title, desc) => checks.push({ status: st, title, desc });
  const signed = w?.dnssecSigned ?? (rep.dns?.dnssecAD || null);
  add(signed ? 'ok' : 'warn', 'DNSSEC', signed ? 'Подпись DNSSEC включена' : 'DNSSEC не обнаружен');
  const ns = (d.NS || []).length;
  add(ns >= 2 ? 'ok' : ns === 1 ? 'warn' : 'bad', 'Серверы имён', ns ? `${ns} NS — ${ns >= 2 ? 'есть резервирование' : 'нет резервирования'}` : 'NS не найдены');
  add((d.AAAA || []).length ? 'ok' : 'warn', 'IPv6', (d.AAAA || []).length ? 'Есть записи AAAA' : 'Записей AAAA нет');
  add((d.CAA || []).length ? 'ok' : 'warn', 'CAA', (d.CAA || []).length ? 'Ограничение выпуска сертификатов задано' : 'CAA не задан');
  if (m) {
    const sp = m.spf ? (/-all/i.test(m.spf) ? 'ok' : 'warn') : 'bad';
    add(sp, 'SPF', m.spf ? `Политика: ${m.spfPolicy}` : 'SPF не найден');
    const dm = m.dmarc ? (/reject|quarantine/i.test(m.dmarcPolicy || '') ? 'ok' : 'warn') : 'bad';
    add(dm, 'DMARC', m.dmarc ? `Политика: ${m.dmarcPolicy || 'не указана'}` : 'DMARC не найден');
    add(m.dkimSelectors.length ? 'ok' : 'warn', 'DKIM', m.dkimSelectors.length ? `Селекторы: ${m.dkimSelectors.join(', ')}` : 'Типовые селекторы не найдены');
  }
  if (w) {
    const locked = (w.status || []).some(s => /transfer\s?prohibited/i.test(s));
    add(locked ? 'ok' : 'warn', 'Защита от переноса', locked ? 'Включён transfer lock' : 'Lock не обнаружен');
    if (w.expires) { const days = Math.round((new Date(w.expires) - Date.now()) / 864e5); add(days > 60 ? 'ok' : days > 0 ? 'warn' : 'bad', 'Срок домена', days > 0 ? `Осталось ${days} дн.` : 'Срок истёк'); }
  }
  if (c?.certs?.length) { const active = c.certs.some(x => new Date(x.notAfter) > Date.now()); add(active ? 'ok' : 'bad', 'TLS-сертификат', active ? 'Есть действующий сертификат' : 'Действующих сертификатов не найдено'); }
  const pts = checks.reduce((s, x) => s + (x.status === 'ok' ? 1 : x.status === 'warn' ? .5 : 0), 0);
  rep.security = { score: checks.length ? Math.round(pts / checks.length * 100) : 0, checks };
}

/* ------------------------------------------------------------ scan */
const STEPS = [
  ['DNS-записи', 'dns'], ['Регистрация (RDAP)', 'whois'], ['IP и хостинг', 'hosting'],
  ['Почта SPF/DMARC/DKIM', 'mail'], ['Поддомены и сертификаты', 'subs'], ['Web Archive', 'archive']
];

async function scan(domain) {
  setBusy(true);
  out.querySelector('.scanbar')?.remove();
  ln(`Цель: <b>${esc(domain)}</b>`, 'ok');
  const bar = ln('<span class="mut">Сканирование</span><span class="bar"><i></i></span>', 'scanbar');
  const fill = bar.querySelector('i'); let done = 0;
  const rep = { meta: { tool: 'PikoSite', version: VERSION, target: domain, generatedAt: new Date().toISOString(), credit: 'Сайт создан @incidum · канал @pikodev' } };
  const errors = {};

  const track = async (label, key, p) => {
    try {
      const r = await p; rep[key] = r.data;
      ln(`<span class="tag">OK</span>${esc(label)} <span class="dim">— ${esc(r.note)}</span>`);
    } catch (e) {
      errors[key] = e.message || 'ошибка'; rep[key] = null;
      ln(`<span class="tag fail">ERR</span>${esc(label)} <span class="dim">— ${esc(e.message || 'недоступно')}</span>`, 'mut');
    }
    fill.style.width = Math.round(++done / STEPS.length * 100) + '%';
  };

  const pDNS = track(STEPS[0][0], 'dns', modDNS(domain));
  const pRDAP = track(STEPS[1][0], 'whois', modRDAP(domain));
  const pSubs = track(STEPS[4][0], 'subs', modSubs(domain));
  const pArch = track(STEPS[5][0], 'archive', modArchive(domain));
  await pDNS;
  const pIP = rep.dns ? track(STEPS[2][0], 'hosting', modIP(rep.dns.records)) : track(STEPS[2][0], 'hosting', Promise.reject(new Error('нет DNS')));
  const pMail = rep.dns ? track(STEPS[3][0], 'mail', modMail(domain, rep.dns)) : track(STEPS[3][0], 'mail', Promise.reject(new Error('нет DNS')));
  await Promise.all([pRDAP, pSubs, pArch, pIP, pMail]);

  rep.subdomains = rep.subs?.subdomains || [];
  rep.certificates = rep.subs ? { total: rep.subs.certTotal, certs: rep.subs.certs } : null;
  delete rep.subs;
  rep.errors = errors;
  rep.resources = RES.map(x => ({ name: x.n, category: x.c, openSource: !!x.oss, url: resUrl(x, domain) }));

  const nx = rep.dns && rep.dns.rcode === 3 && !rep.whois;
  if (!rep.dns && !rep.whois) { ln('Источники недоступны. Проверьте соединение и повторите запрос.', 'err'); return setBusy(false); }
  if (nx) { ln(`Домен <b>${esc(domain)}</b> не найден (NXDOMAIN) и не зарегистрирован.`, 'err'); return setBusy(false); }

  analyze(rep);
  rep.summary = {
    registered: rep.whois?.registered || null, expires: rep.whois?.expires || null, registrar: rep.whois?.registrar || null,
    dnsRecords: rep.dns?.total || 0, ips: (rep.hosting || []).length, subdomains: rep.subdomains.length,
    certificates: rep.certificates?.total || 0, resources: RES.length, securityScore: rep.security.score, technologies: rep.tech
  };
  lastReport = rep;
  ln(`Готово. Отчёт ниже ↓  ·  <b>export txt</b> / <b>export json</b>`, 'ok');
  render(rep);
  setBusy(false);
  await sleep(250);
  $('#report').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/* ------------------------------------------------------------ render */
const fd = iso => iso ? new Date(iso).toLocaleDateString('ru-RU', { day: '2-digit', month: 'long', year: 'numeric' }) : '—';
const fdt = iso => iso ? new Date(iso).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '—';
function age(iso) {
  if (!iso) return null; const ms = Date.now() - new Date(iso); if (ms < 0) return null;
  const mo = Math.floor(ms / 2629800000), y = Math.floor(mo / 12), m = mo % 12;
  return y ? `${y} ${plural(y, 'год', 'года', 'лет')}${m ? ` ${m} мес.` : ''}` : `${m} мес.`;
}
const plural = (n, a, b, c) => { n = Math.abs(n) % 100; const k = n % 10; return n > 10 && n < 20 ? c : k > 1 && k < 5 ? b : k === 1 ? a : c; };

function sec(id, icon, title, cnt, body, extra = '') {
  return `<section class="sec" id="${id}"><div class="sec-h"><div class="sec-i">${icon}</div><h2>${title}</h2>${cnt != null ? `<span class="cnt">${cnt}</span>` : ''}<span class="sp"></span>${extra}</div>${body}</section>`;
}
const kv = items => `<div class="kv">${items.filter(Boolean).map(([k, v, m], i) => `<div class="it" style="--i:${i}"><div class="k">${esc(k)}</div><div class="v${m ? ' m' : ''}">${v == null || v === '' ? '—' : esc(v)}</div></div>`).join('')}</div>`;

function render(r) {
  const el = $('#report'); const w = r.whois, nav = [];
  const ageStr = age(w?.registered);
  const badges = [
    w ? '<span class="badge hi">Зарегистрирован</span>' : '<span class="badge">RDAP недоступен</span>',
    ageStr ? `<span class="badge">Возраст: ${esc(ageStr)}</span>` : '',
    ...r.tech.slice(0, 4).map(t => `<span class="badge">${esc(t)}</span>`)
  ].join('');

  let h = `
  <div class="r-head">
    <div>
      <div class="r-tag">Отчёт · ${esc(fd(r.meta.generatedAt))}</div>
      <div class="r-domain">${esc(r.meta.target)}</div>
      <div class="badges">${badges}</div>
    </div>
    <div class="ring"><svg viewBox="0 0 120 120" width="132" height="132"><circle class="bgc" cx="60" cy="60" r="54"/><circle class="fgc" id="ringFg" cx="60" cy="60" r="54"/></svg>
      <div class="val"><div><span data-count="${r.security.score}">0</span><small>security</small></div></div></div>
  </div>
  <div class="stats">
    <div class="stat"><div class="n" data-count="${r.summary.dnsRecords}">0</div><div class="l">DNS записей</div></div>
    <div class="stat"><div class="n" data-count="${r.summary.ips}">0</div><div class="l">IP адресов</div></div>
    <div class="stat"><div class="n" data-count="${r.summary.subdomains}">0</div><div class="l">Поддоменов</div></div>
    <div class="stat"><div class="n" data-count="${r.summary.certificates}">0</div><div class="l">Сертификатов</div></div>
    <div class="stat"><div class="n" data-count="${RES.length}">0</div><div class="l">Ресурсов</div></div>
  </div>
  <div class="dl">
    <span class="lbl">Скачать отчёт</span>
    <div class="acts">
      <button class="btn pri" data-dl="txt">${I.dl} TXT</button>
      <button class="btn pri" data-dl="json">${I.dl} JSON</button>
      <button class="btn" data-copy>${I.cp} Копировать JSON</button>
      <button class="btn" data-top>${I.up} Новый поиск</button>
    </div>
  </div>
  <nav class="nav" id="rnav"></nav>`;

  /* WHOIS */
  nav.push(['whois', 'Регистрация']);
  const exp = w?.expires ? Math.round((new Date(w.expires) - Date.now()) / 864e5) : null;
  h += sec('whois', I.id, 'Регистрация', null, w ? kv([
    ['Домен', w.domain || r.meta.target, 1], w.queried !== r.meta.target ? ['Корневой домен', w.queried, 1] : null,
    ['Регистратор', w.registrar], ['IANA ID', w.ianaId, 1], ['Дата регистрации', fd(w.registered)], ['Обновлён', fd(w.updated)],
    ['Истекает', w.expires ? `${fd(w.expires)}${exp != null ? ` (${exp > 0 ? 'через ' + exp + ' дн.' : 'истёк'})` : ''}` : null],
    ['Статусы', (w.status || []).join(', ') || null, 1], ['Abuse-контакт', w.abuseEmail, 1], ['Handle', w.handle, 1],
    ['NS из RDAP', (w.nameservers || []).join(', ') || null, 1], ['DNSSEC', w.dnssecSigned == null ? null : w.dnssecSigned ? 'Подписан' : 'Не подписан']
  ]) : '<div class="empty">// данные RDAP недоступны для этой зоны</div>');

  /* DNS */
  nav.push(['dns', 'DNS']);
  const recs = r.dns?.records || {}; const types = Object.keys(recs).filter(t => recs[t].length);
  const rows = types.flatMap(t => recs[t].map(x => ({ t, ...x })));
  h += sec('dns', I.dns, 'DNS-записи', rows.length, rows.length ? `
    <div class="chips" id="dnsChips"><button class="chip on" data-t="*">Все<sup>${rows.length}</sup></button>${types.map(t => `<button class="chip" data-t="${t}">${t}<sup>${recs[t].length}</sup></button>`).join('')}</div>
    <div class="tw"><table class="tbl"><thead><tr><th>Тип</th><th>Значение</th><th>TTL</th></tr></thead><tbody>
    ${rows.map((x, i) => `<tr data-t="${x.t}" style="--i:${Math.min(i, 24)}"><td><span class="type">${x.t}</span></td><td class="m">${esc(x.value)}</td><td class="m">${x.ttl ?? '—'}</td></tr>`).join('')}
    </tbody></table></div>` : '<div class="empty">// записи не найдены</div>');

  /* Hosting */
  nav.push(['hosting', 'Хостинг']);
  h += sec('hosting', I.ip, 'IP и хостинг', (r.hosting || []).length, (r.hosting || []).length ? `<div class="cards">${r.hosting.map((x, i) => `
    <div class="ipc" style="--i:${i}"><span class="fam">${x.family}</span><div class="ip">${esc(x.ip)}</div>
    <dl><dt>Страна</dt><dd>${esc([x.country, x.city].filter(Boolean).join(', ') || '—')}</dd>
    <dt>Регион</dt><dd>${esc(x.region || '—')}</dd><dt>ASN</dt><dd>${esc(x.asn || '—')}</dd>
    <dt>Организация</dt><dd>${esc(x.org || x.isp || '—')}</dd><dt>PTR</dt><dd>${esc(x.ptr || '—')}</dd><dt>Часовой пояс</dt><dd>${esc(x.timezone || '—')}</dd></dl></div>`).join('')}</div>` : '<div class="empty">// IP-адреса не найдены</div>');

  /* Mail */
  nav.push(['mail', 'Почта']);
  const m = r.mail;
  h += sec('mail', I.mail, 'Почта', m ? m.mx.length : null, m ? `
    ${m.mx.length ? `<div class="tw"><table class="tbl"><thead><tr><th>Приоритет</th><th>Почтовый сервер</th></tr></thead><tbody>${m.mx.map((x, i) => `<tr style="--i:${i}"><td class="m">${x.priority}</td><td class="m">${esc(x.host)}</td></tr>`).join('')}</tbody></table></div>` : '<div class="empty">// MX-записей нет — домен не принимает почту</div>'}
    <div class="mono-box"><span class="lab">SPF · ${esc(m.spfPolicy || 'нет')}</span>${esc(m.spf || '—')}</div>
    <div class="mono-box"><span class="lab">DMARC · ${esc(m.dmarcPolicy || 'нет')}</span>${esc(m.dmarc || '—')}</div>
    <div class="mono-box"><span class="lab">DKIM — найденные селекторы</span>${esc(m.dkimSelectors.join(', ') || '—')}</div>` : '<div class="empty">// не удалось получить данные</div>');

  /* Subdomains */
  nav.push(['subs', 'Поддомены']);
  const subs = r.subdomains;
  h += sec('subs', I.sub, 'Поддомены', subs.length, subs.length ? `<div class="pill-list" id="subList">${subs.slice(0, 400).map((s, i) => `<span class="pill" style="--i:${i}">${esc(s)}</span>`).join('')}</div>${subs.length > 400 ? `<div class="more">Показано 400 из ${subs.length}. Полный список — в экспорте.</div>` : ''}` : '<div class="empty">// поддомены в CT-логах не найдены</div>',
    subs.length > 8 ? '<input class="search" id="subSearch" placeholder="Фильтр поддоменов…" aria-label="Фильтр поддоменов">' : '');

  /* Certs */
  nav.push(['certs', 'Сертификаты']);
  const cs = r.certificates?.certs || [];
  h += sec('certs', I.cert, 'Сертификаты (CT-логи)', r.certificates?.total ?? null, cs.length ? `<div class="tw"><table class="tbl"><thead><tr><th>Имя</th><th>Издатель</th><th>С</th><th>По</th></tr></thead><tbody>
    ${cs.map((c, i) => `<tr style="--i:${i}"><td class="m">${esc(c.commonName)}</td><td>${esc(c.issuer)}</td><td class="m">${esc(fdt(c.notBefore))}</td><td class="m">${esc(fdt(c.notAfter))}</td></tr>`).join('')}</tbody></table></div>` : '<div class="empty">// сертификаты не найдены или crt.sh недоступен</div>');

  /* Archive */
  nav.push(['archive', 'Архив']);
  const a = r.archive;
  h += sec('archive', I.arch, 'Web Archive', null, a?.found ? `<div class="timeline">
    <div class="stat"><div class="l">Первый снимок</div><div class="n" style="font-size:22px;margin-top:8px">${esc(fd(a.first.date))}</div><p style="margin-top:8px"><a class="btn" target="_blank" rel="noopener" href="${esc(a.first.url)}">Открыть</a></p></div>
    <div class="stat"><div class="l">Последний снимок</div><div class="n" style="font-size:22px;margin-top:8px">${esc(fd(a.last.date))}</div><p style="margin-top:8px"><a class="btn" target="_blank" rel="noopener" href="${esc(a.last.url)}">Открыть</a></p></div></div>` : '<div class="empty">// в Wayback Machine снимков не найдено</div>');

  /* Security */
  nav.push(['security', 'Безопасность']);
  h += sec('security', I.sec, 'Безопасность', r.security.score + '/100', `<div class="checks">${r.security.checks.map((c, i) => `
    <div class="chk ${c.status}" style="--i:${i}"><div class="ic">${c.status === 'ok' ? '✓' : c.status === 'warn' ? '!' : '✕'}</div><div><b>${esc(c.title)}</b><span>${esc(c.desc)}</span></div></div>`).join('')}</div>`);

  /* Tech */
  nav.push(['tech', 'Технологии']);
  h += sec('tech', I.tech, 'Провайдеры и технологии', r.tech.length, r.tech.length ? `<div class="pill-list">${r.tech.map((t, i) => `<span class="pill" style="--i:${i}">${esc(t)}</span>`).join('')}</div><div class="more">Определено по NS, MX, CNAME, SPF, ASN и регистратору.</div>` : '<div class="empty">// известные провайдеры не определены</div>');

  /* Resources */
  nav.push(['res', 'Ресурсы']);
  const resCard = (x, i) => `<a class="res" href="${esc(resUrl(x, r.meta.target))}" target="_blank" rel="noopener noreferrer" data-c="${esc(x.c)}" data-q="${esc((x.n + ' ' + x.t + ' ' + x.c).toLowerCase())}" style="--i:${Math.min(i, 30)}"><div class="res-top"><b>${esc(x.n)}</b><span class="arr">↗</span></div><p>${esc(x.t)}</p><div class="res-tags"><span>${esc(x.c)}</span>${x.oss ? '<span class="oss">open source</span>' : ''}${x.u.includes('{d}') ? '<span>с доменом</span>' : ''}</div></a>`;
  h += sec('res', I.res, 'Ресурсы для поиска', RES.length, RES.length ? `
    <div class="chips" id="resChips"><button class="chip on" data-c="*">Все<sup>${RES.length}</sup></button>${CATS.map(c => `<button class="chip" data-c="${esc(c)}">${esc(c)}<sup>${RES.filter(x => x.c === c).length}</sup></button>`).join('')}</div>
    <div class="res-grid" id="resGrid">${RES.map(resCard).join('')}</div>` : '<div class="empty">// база ресурсов не загружена</div>',
    '<input class="search" id="resSearch" placeholder="Поиск по ресурсам…" aria-label="Поиск по ресурсам">');

  el.hidden = false; el.innerHTML = h; document.body.classList.add('has-report');
  $('#rnav').innerHTML = nav.map(([id, n]) => `<a href="#${id}" data-n="${id}">${n}</a>`).join('');
  bind(el, r);
}

function bind(el, r) {
  /* downloads */
  $$('[data-dl]', el).forEach(b => b.onclick = () => { download(b.dataset.dl); toast(`${b.dataset.dl.toUpperCase()} сохранён`); });
  $('[data-copy]', el).onclick = async () => { try { await navigator.clipboard.writeText(JSON.stringify(lastReport, null, 2)); toast('JSON скопирован'); } catch { toast('Не удалось скопировать'); } };
  $('[data-top]', el).onclick = () => { scrollTo({ top: 0, behavior: 'smooth' }); setTimeout(() => cmd.focus({ preventScroll: true }), 600); };

  /* dns filter */
  const chips = $('#dnsChips', el);
  chips?.addEventListener('click', e => {
    const c = e.target.closest('.chip'); if (!c) return;
    $$('.chip', chips).forEach(x => x.classList.toggle('on', x === c));
    $$('.tbl tbody tr', $('#dns', el)).forEach(tr => tr.hidden = c.dataset.t !== '*' && tr.dataset.t !== c.dataset.t);
  });
  /* subdomain filter */
  const ss = $('#subSearch', el);
  ss?.addEventListener('input', () => {
    const q = ss.value.trim().toLowerCase(), box = $('#subList', el);
    box.innerHTML = r.subdomains.filter(s => s.includes(q)).slice(0, 400).map((s, i) => `<span class="pill" style="--i:${i}">${esc(s)}</span>`).join('') || '<span class="empty">// ничего не найдено</span>';
  });
  /* resources filter */
  const rc = $('#resChips', el), rs = $('#resSearch', el);
  const applyRes = () => {
    const cat = $('.chip.on', rc)?.dataset.c || '*', q = (rs?.value || '').trim().toLowerCase();
    $$('.res', el).forEach(a => a.hidden = !((cat === '*' || a.dataset.c === cat) && (!q || a.dataset.q.includes(q))));
  };
  rc?.addEventListener('click', e => { const c = e.target.closest('.chip'); if (!c) return; $$('.chip', rc).forEach(x => x.classList.toggle('on', x === c)); applyRes(); });
  rs?.addEventListener('input', applyRes);

  /* reveal */
  const secs = $$('.sec', el);
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: .08, rootMargin: '0px 0px -40px 0px' });
    secs.forEach(s => io.observe(s));
    const links = $$('#rnav a', el);
    const so = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) links.forEach(l => l.classList.toggle('on', l.dataset.n === e.target.id)); }), { rootMargin: '-35% 0px -55% 0px' });
    secs.forEach(s => so.observe(s));
  } else secs.forEach(s => s.classList.add('in'));

  /* counters + ring */
  $$('[data-count]', el).forEach(n => {
    const to = +n.dataset.count, t0 = performance.now(), dur = 1400;
    (function f(t) { const p = Math.min(1, (t - t0) / dur); n.textContent = Math.round(to * (1 - Math.pow(1 - p, 4))); if (p < 1) requestAnimationFrame(f); })(t0);
  });
  requestAnimationFrame(() => { const fg = $('#ringFg', el); fg.style.strokeDashoffset = 339.3 * (1 - r.security.score / 100); });
}

/* ------------------------------------------------------------ export */
function buildTxt(r) {
  const L = []; const bar = '='.repeat(64), thin = '-'.repeat(64);
  const sect = t => { L.push('', bar, t.toUpperCase(), bar); };
  L.push(bar, 'PIKOSITE — ОТЧЁТ ПО ДОМЕНУ', bar, `Домен:      ${r.meta.target}`, `Сформирован: ${r.meta.generatedAt}`, `Версия:     PikoSite v${r.meta.version}`, `Источник:   ${r.meta.credit}`);
  const s = r.summary;
  sect('Сводка');
  L.push(`Security score : ${s.securityScore}/100`, `DNS записей    : ${s.dnsRecords}`, `IP адресов     : ${s.ips}`, `Поддоменов     : ${s.subdomains}`, `Сертификатов   : ${s.certificates}`, `Технологии     : ${s.technologies.join(', ') || '—'}`);
  const w = r.whois; sect('Регистрация (RDAP)');
  if (w) L.push(`Регистратор    : ${w.registrar || '—'}`, `IANA ID        : ${w.ianaId || '—'}`, `Зарегистрирован: ${w.registered || '—'}`, `Обновлён       : ${w.updated || '—'}`, `Истекает       : ${w.expires || '—'}`, `Статусы        : ${(w.status || []).join(', ') || '—'}`, `NS             : ${(w.nameservers || []).join(', ') || '—'}`, `DNSSEC         : ${w.dnssecSigned == null ? '—' : w.dnssecSigned ? 'да' : 'нет'}`, `Abuse          : ${w.abuseEmail || '—'}`);
  else L.push('Данные недоступны');
  sect('DNS-записи');
  Object.entries(r.dns?.records || {}).forEach(([t, a]) => a.forEach(x => L.push(`${t.padEnd(6)} ${x.value}  (TTL ${x.ttl})`)));
  sect('IP и хостинг');
  (r.hosting || []).forEach(x => { L.push(`${x.ip} [${x.family}]`, `  Страна: ${[x.country, x.city].filter(Boolean).join(', ') || '—'}`, `  ASN: ${x.asn || '—'}  Орг: ${x.org || x.isp || '—'}`, `  PTR: ${x.ptr || '—'}`, thin); });
  const m = r.mail; sect('Почта');
  if (m) { m.mx.forEach(x => L.push(`MX ${x.priority} ${x.host}`)); L.push(`SPF   : ${m.spf || '—'}`, `DMARC : ${m.dmarc || '—'}`, `DKIM  : ${m.dkimSelectors.join(', ') || '—'}`); }
  sect(`Поддомены (${r.subdomains.length})`); r.subdomains.forEach(x => L.push(x));
  sect('Сертификаты (последние)'); (r.certificates?.certs || []).forEach(c => L.push(`${c.commonName} | ${c.issuer} | ${c.notBefore} → ${c.notAfter}`));
  sect('Web Archive');
  if (r.archive?.found) L.push(`Первый:   ${r.archive.first.date}  ${r.archive.first.url}`, `Последний: ${r.archive.last.date}  ${r.archive.last.url}`); else L.push('Снимков нет');
  sect('Безопасность'); r.security.checks.forEach(c => L.push(`[${c.status === 'ok' ? 'OK' : c.status === 'warn' ? '! ' : 'XX'}] ${c.title}: ${c.desc}`));
  sect(`Ресурсы для поиска (${(r.resources || []).length})`);
  uniq((r.resources || []).map(x => x.category)).forEach(c => {
    L.push('', `# ${c}`);
    r.resources.filter(x => x.category === c).forEach(x => L.push(`${x.name}${x.openSource ? ' [OSS]' : ''} — ${x.url}`));
  });
  L.push('', bar, 'Сайт создан @incidum · канал @pikodev', bar);
  return L.join('\n');
}
function download(fmt) {
  if (!lastReport) return;
  const body = fmt === 'json' ? JSON.stringify(lastReport, null, 2) : buildTxt(lastReport);
  const blob = new Blob([body], { type: fmt === 'json' ? 'application/json' : 'text/plain;charset=utf-8' });
  const a = document.createElement('a'); const d = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  a.href = URL.createObjectURL(blob); a.download = `pikosite_${lastReport.meta.target}_${d}.${fmt}`;
  document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 1500);
}

/* ------------------------------------------------------------ polish */
(() => {
  $('#resCount').textContent = RES.length;
  const names = RES.map(x => x.n);
  $('#marq').innerHTML = [...names, ...names].map(n => `<span>${esc(n)}</span>`).join('');

  const bar = $('#progress i');
  const upd = () => { const h = document.documentElement.scrollHeight - innerHeight; bar.style.width = (h > 0 ? scrollY / h * 100 : 0) + '%'; };
  addEventListener('scroll', upd, { passive: true }); addEventListener('resize', upd); upd();

  /* spotlight: карточки, статистика, ресурсы */
  document.addEventListener('pointermove', e => {
    const c = e.target.closest?.('.ipc,.stat,.res'); if (!c) return;
    const b = c.getBoundingClientRect(); c.style.setProperty('--mx', (e.clientX - b.left) + 'px'); c.style.setProperty('--my', (e.clientY - b.top) + 'px');
  }, { passive: true });
})();

/* ------------------------------------------------------------ intro */
(async () => {
  await sleep(1100);
  await typeLn('PikoSite terminal v' + VERSION, 'ok', 16);
  await typeLn('Введите команду:  Piko --example.com', 'mut', 12);
  await typeLn('help — все команды · ↑/↓ — история · Ctrl+L — очистка', 'dim', 8);
  if (matchMedia('(pointer:fine)').matches) cmd.focus({ preventScroll: true });
})();
})();
