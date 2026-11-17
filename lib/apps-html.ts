// /apps: one home screen for every part of Gulit. All Gulit pages share one installed app
// (manifest.webmanifest, scope "/"), and this page links them together. The start page choice is kept
// in localStorage ('gulitHome') and read by the shop page when the installed app opens.
// The owner dashboard is deliberately not listed here; staff pages still need their own login.

const I: Record<string, string> = {
  cart: '<circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>',
  box: '<path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/>',
  shirt: '<path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z"/>',
  wrench: '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>',
  car: '<path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/>',
  plane: '<path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/>',
  truck: '<path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.62l-3.48-4.35A1 1 0 0 0 17.52 8H14"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/>',
  bulb: '<path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/>',
  bike: '<circle cx="18.5" cy="17.5" r="3.5"/><circle cx="5.5" cy="17.5" r="3.5"/><circle cx="15" cy="5" r="1"/><path d="M12 17.5V14l-3-3 4-3 2 3h2"/>',
  store: '<path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"/><path d="M2 7h20"/><path d="M22 7v3a2 2 0 0 1-2 2 2.7 2.7 0 0 1-2-1 2.7 2.7 0 0 1-4 0 2.7 2.7 0 0 1-4 0 2.7 2.7 0 0 1-4 0 2.7 2.7 0 0 1-2 1 2 2 0 0 1-2-2V7"/>',
  nav: '<polygon points="3 11 22 2 13 21 11 13 3 11"/>',
  zap: '<path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"/>',
  clip: '<rect width="8" height="4" x="8" y="2" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="m9 14 2 2 4-4"/>',
  chat: '<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/>',
  info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>',
  send: '<path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/>',
  note: '<path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"/>',
  arrow: '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
  chev: '<path d="m9 18 6-6-6-6"/>',
  phone: '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/>',
};
const svg = (k: string, s = 24) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${I[k]}</svg>`;

type Item = [icon: string, en: string, am: string, href: string, tone: string];
const services: Item[] = [
  ['box', 'My orders', 'ትዕዛዞቼ', '/?orders=1', 't1'],
  ['shirt', 'Laundry', 'እጥበት', '/laundry', 't2'],
  ['wrench', 'Home repair', 'የቤት ጥገና', '/mep', 't3'],
  ['car', 'Garage', 'ጋራዥ', '/garage', 't4'],
  ['plane', 'Import', 'ከውጭ', '/import', 't2'],
  ['truck', 'Wholesale', 'ጅምላ', '/wholesale', 't1'],
  ['bulb', 'Suggest', 'ይጠቁሙ', '/suggest', 't4'],
  ['store', 'Sell on Gulit', 'ሱቅዎን', '/partners', 't3'],
];
type Row = [icon: string, en: string, am: string, href: string, note: string];
const staff: Row[] = [
  ['nav', 'Driver app', 'የሾፌር መተግበሪያ', '/driver', 'Drivers & riders'],
  ['zap', 'MEP engineer', 'የMEP መሀንዲስ', '/engineer', 'Job assignments'],
  ['clip', 'Storekeeper', 'የመጋዘን ሰራተኛ', '/storekeeper', 'Stock control'],
];
const help: Row[] = [
  ['chat', 'Help & support', 'እርዳታ', '/support', 'Chat with customer care'],
  ['info', 'About Gulit', 'ስለ ጉሊት', '/about', 'Delivery fees · FAQ'],
  ['send', 'Telegram', 'ቴሌግራም', 'https://t.me/gulitonline1', '@gulitonline1'],
  ['note', 'TikTok', 'ቲክቶክ', 'https://www.tiktok.com/@gulitonline', '@gulitonline'],
];
const starts: [string, string][] = [['/', 'Shop · ገበያ'], ['/driver', 'Driver app · ሾፌር'], ['/engineer', 'MEP engineer · መሀንዲስ'], ['/storekeeper', 'Storekeeper · መጋዘን'], ['/partners', 'Shop partner · የሱቅ አጋር']];

const ext = (h: string) => (h.startsWith('http') ? ' target="_blank" rel="noopener"' : '');
const tile = ([ic, en, am, href, tone]: Item) => `<a class="svc" href="${href}"><span class="ic ${tone}">${svg(ic, 24)}</span><b>${en}</b><span class="am">${am}</span></a>`;
const row = ([ic, en, am, href, note]: Row) => `<a class="row" href="${href}"${ext(href)}><span class="ric">${svg(ic, 20)}</span><span class="rt"><b>${en} <span class="am">· ${am}</span></b><small>${note}</small></span><span class="chev">${svg('chev', 18)}</span></a>`;

export const appsHtml = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><title>All Gulit apps | ጉሊት</title><meta name="description" content="Every part of Gulit Online in one app: shop, orders, laundry, home repair, import, wholesale, rider and partner sign-up, and staff apps."><link rel="canonical" href="https://gulitonline.com/apps"><link rel="manifest" href="/manifest.webmanifest"><meta name="theme-color" content="#0f3329"><link rel="icon" href="/favicon.svg"><link rel="apple-touch-icon" href="/icon-180.png"><meta name="apple-mobile-web-app-capable" content="yes"><meta name="apple-mobile-web-app-title" content="Gulit">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700;800&family=Noto+Sans+Ethiopic:wght@400;500;600&display=swap" rel="stylesheet">
<style>
:root{--g:#133d32;--g2:#0f3329;--l:#d5ed84;--bg:#f4f5f0;--ink:#10241d;--mut:#6a7a72;--line:#e6e9e2;--r:22px}
*{box-sizing:border-box;-webkit-tap-highlight-color:transparent}
body{margin:0;background:var(--bg);color:var(--ink);font-family:"Plus Jakarta Sans","Noto Sans Ethiopic",system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;-webkit-font-smoothing:antialiased;letter-spacing:-.01em}
.am{font-family:"Noto Sans Ethiopic","Plus Jakarta Sans",system-ui,sans-serif;letter-spacing:0}
a{color:inherit;text-decoration:none}
.hero{position:relative;overflow:hidden;background:radial-gradient(120% 90% at 100% 0%,#1f5a49 0%,var(--g) 45%,var(--g2) 100%);color:#fff;padding:max(20px,env(safe-area-inset-top)) 20px 92px}
.hero:after{content:"";position:absolute;right:-60px;top:-60px;width:220px;height:220px;border-radius:50%;background:var(--l);opacity:.08}
.bar{display:flex;align-items:center;justify-content:space-between;max-width:760px;margin:0 auto;position:relative;z-index:1}
.logo{display:flex;align-items:center;gap:10px;font-weight:800;font-size:24px;letter-spacing:-.04em}.logo img{width:36px;height:36px;border-radius:10px}.logo i{color:var(--l);font-style:normal}
.back{display:inline-flex;align-items:center;gap:6px;font-weight:600;font-size:14px;color:var(--l);padding:9px 14px;border-radius:999px;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.12)}
.hi{max-width:760px;margin:26px auto 0}.hi h1{margin:0;font-size:30px;line-height:1.15;font-weight:800;letter-spacing:-.035em}.hi p{margin:8px 0 0;opacity:.78;font-size:15px}
main{max-width:760px;margin:-68px auto 0;padding:0 16px 48px;position:relative}
.feat{display:grid;grid-template-columns:1.25fr 1fr;gap:12px}
.fc{position:relative;border-radius:var(--r);padding:18px;min-height:156px;display:flex;flex-direction:column;justify-content:space-between;box-shadow:0 10px 30px -12px rgba(16,36,29,.35);overflow:hidden;transition:transform .15s}
.fc:active,.svc:active,.row:active{transform:scale(.97)}
.fc.shop{background:var(--l);color:var(--g)}.fc.rider{background:#fff;color:var(--ink);border:1px solid var(--line)}
.fc .k{font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;opacity:.7}
.fc h2{margin:6px 0 2px;font-size:22px;font-weight:800;letter-spacing:-.03em;line-height:1.15}.fc .am{font-size:13px;opacity:.75}
.go{width:38px;height:38px;border-radius:50%;display:grid;place-items:center;background:var(--g);color:var(--l);align-self:flex-end;position:relative;z-index:1}
.fc.rider .go{background:var(--l);color:var(--g)}
.fc .big{position:absolute;right:-14px;bottom:-14px;opacity:.12}
.sec{display:flex;align-items:baseline;justify-content:space-between;margin:30px 4px 12px}.sec h3{margin:0;font-size:18px;font-weight:800;letter-spacing:-.025em}.sec span{font-size:13px;color:var(--mut)}
.grid{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;background:#fff;border:1px solid var(--line);border-radius:var(--r);padding:16px 8px}
.svc{display:flex;flex-direction:column;align-items:center;text-align:center;gap:6px;padding:6px 2px;border-radius:16px;transition:transform .15s}
.svc b{font-size:13px;font-weight:700;line-height:1.2}.svc .am{font-size:11px;color:var(--mut);margin-top:-3px}
.ic{width:54px;height:54px;border-radius:18px;display:grid;place-items:center}
.t1{background:#e8f3c4;color:#2f5a0c}.t2{background:#dcefe8;color:var(--g)}.t3{background:#fbe9d7;color:#9a4b0b}.t4{background:#e4e9fb;color:#2f47a3}
.list{background:#fff;border:1px solid var(--line);border-radius:var(--r);overflow:hidden}
.row{display:flex;align-items:center;gap:14px;padding:15px 16px;transition:transform .15s}.row+.row{border-top:1px solid var(--line)}
.ric{width:42px;height:42px;border-radius:14px;background:#eef1ea;color:var(--g);display:grid;place-items:center;flex:none}
.rt{flex:1;min-width:0;display:flex;flex-direction:column;gap:2px}.rt b{font-size:15px;font-weight:700}.rt b .am{font-weight:500;color:var(--mut);font-size:13px}.rt small{font-size:12.5px;color:var(--mut)}
.chev{color:#a5b0aa}
.pill{display:inline-flex;align-items:center;font-size:11px;font-weight:700;color:var(--g)!important;background:#e3e8df;border-radius:999px;padding:3px 9px;margin-left:8px;vertical-align:2px}
.card{margin-top:30px;background:var(--g);color:#fff;border-radius:var(--r);padding:20px;position:relative;overflow:hidden}
.card h3{margin:0 0 6px;font-size:18px;font-weight:800;letter-spacing:-.02em}.card p{margin:0;opacity:.78;font-size:13.5px;line-height:1.55}
.ctl{display:flex;gap:8px;margin-top:14px;flex-wrap:wrap}
select,.btn{font:inherit;font-size:14px;border-radius:12px;padding:12px 14px;border:0}
select{flex:1;min-width:180px;background:rgba(255,255,255,.1);color:#fff;border:1px solid rgba(255,255,255,.18)}select option{color:#10241d}
.btn{background:var(--l);color:var(--g);font-weight:800;cursor:pointer}.btn.ghost{background:transparent;color:var(--l);border:1px solid rgba(213,237,132,.5)}
.ok{font-size:13px;color:var(--l);margin-top:8px;min-height:18px}
.call{display:flex;align-items:center;justify-content:center;gap:8px;margin:26px auto 0;font-weight:700;color:var(--g);font-size:14px}
footer{text-align:center;color:var(--mut);font-size:12px;margin-top:14px}
@media(min-width:620px){.grid{grid-template-columns:repeat(8,1fr)}.hi h1{font-size:36px}}
@media(max-width:360px){.feat{grid-template-columns:1fr}.svc b{font-size:12px}.ic{width:48px;height:48px}}
</style></head>
<body><header class="hero"><div class="bar"><a class="logo" href="/"><img src="/icon-192.png" alt=""><span>gulit<i>.</i></span></a><a class="back" href="/">${svg('cart', 16)} Shop</a></div>
<div class="hi"><h1>Everything Gulit,<br>in one app.</h1><p class="am">ሁሉም የጉሊት አገልግሎቶች በአንድ መተግበሪያ</p></div></header>
<main>
<div class="feat"><a class="fc shop" href="/?from=apps"><div><div class="k">Shop</div><h2>Your market, delivered</h2><div class="am">ገበያዎ እቤትዎ</div></div><span class="go">${svg('arrow', 18)}</span><span class="big">${svg('cart', 110)}</span></a>
<a class="fc rider" href="/?rider=1"><div><div class="k">We're hiring</div><h2>Become a rider</h2><div class="am">አሽከርካሪ ይሁኑ</div></div><span class="go">${svg('arrow', 18)}</span><span class="big">${svg('bike', 110)}</span></a></div>
<div class="sec"><h3>Services</h3><span class="am">አገልግሎቶች</span></div><div class="grid">${services.map(tile).join('')}</div>
<div class="sec"><h3>Staff<span class="pill">Login needed</span></h3><span class="am">ሰራተኞች</span></div><div class="list">${staff.map(row).join('')}</div>
<div class="sec"><h3>Help</h3><span class="am">እርዳታ</span></div><div class="list">${help.map(row).join('')}</div>
<section class="card"><h3>Install Gulit once</h3><p>iPhone: Safari → Share → Add to Home Screen. Android: Chrome → Menu → Install app. Every part of Gulit opens inside the same app.</p><p class="am" style="margin-top:6px">ጉሊትን አንዴ ይጫኑ፤ ሁሉም በአንድ መተግበሪያ ይከፈታል።</p>
<div class="ctl"><button class="btn" id="install" hidden>Install Gulit</button></div>
<p style="margin-top:16px;opacity:1;font-weight:700">When the app opens, start at</p><div class="ctl"><select id="home" aria-label="Start page">${starts.map(([v, l]) => `<option value="${v}">${l}</option>`).join('')}</select><button class="btn ghost" id="save">Save</button></div><div class="ok" id="saved"></div></section>
<a class="call" href="tel:0909225566">${svg('phone', 16)} 0909 225 566</a><footer>© Gulit Online · M O M Manufacturing PLC · Addis Ababa</footer>
</main><script>
var KEY='gulitHome',sel=document.getElementById('home'),out=document.getElementById('saved');
try{sel.value=localStorage.getItem(KEY)||'/'}catch(e){}
document.getElementById('save').onclick=function(){try{if(sel.value==='/')localStorage.removeItem(KEY);else localStorage.setItem(KEY,sel.value);out.textContent='Saved ✓ · ተቀምጧል'}catch(e){out.textContent='Could not save on this browser.'}};
var deferred;window.addEventListener('beforeinstallprompt',function(e){e.preventDefault();deferred=e;var b=document.getElementById('install');b.hidden=false;b.onclick=function(){deferred.prompt();deferred=null;b.hidden=true}});
if('serviceWorker' in navigator)navigator.serviceWorker.register('/sw.js').catch(function(){});
</script></body></html>`;
