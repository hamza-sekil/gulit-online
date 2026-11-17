// /apps: one home screen for every part of Gulit. All Gulit pages share one installed app
// (manifest.webmanifest, scope "/"), and this page links them together. The start page choice is kept
// in localStorage ('gulitHome') and read by the shop page when the installed app opens.
// The owner dashboard is deliberately not listed here; staff pages still need their own login.

type Tile = [icon: string, en: string, am: string, href: string, note?: string];
const groups: [string, string, Tile[]][] = [
  ['Shop & services', 'ግብይትና አገልግሎቶች', [
    ['🛒', 'Shop', 'ገበያ', '/?from=apps'],
    ['📦', 'My orders', 'ትዕዛዞቼ', '/?orders=1'],
    ['🧺', 'Laundry pickup', 'የልብስ እጥበት', '/laundry'],
    ['🛠', 'Home repair (MEP)', 'የቤት ጥገና', '/mep'],
    ['🚗', 'Garage', 'ጋራዥ', '/garage'],
    ['✈', 'Import for me', 'ከውጭ አስመጣልኝ', '/import'],
    ['🚚', 'Wholesale to your city', 'ጅምላ ወደ ከተማዎ', '/wholesale'],
    ['💡', 'Suggest a product', 'ዕቃ ይጠቁሙ', '/suggest'],
  ]],
  ['Work with Gulit', 'ከጉሊት ጋር ይስሩ', [
    ['🛵', 'Become a rider', 'አሽከርካሪ ይሁኑ', '/?rider=1', 'E-bike or your own electric motorbike'],
    ['🏪', 'Register your shop', 'ሱቅዎን ያስመዝግቡ', '/partners'],
  ]],
  ['Staff', 'ሰራተኞች', [
    ['🚚', 'Driver app', 'የሾፌር መተግበሪያ', '/driver', 'Drivers & riders · login needed'],
    ['🔧', 'MEP engineer', 'የMEP መሀንዲስ', '/engineer', 'Login needed'],
    ['🗃', 'Storekeeper', 'የመጋዘን ሰራተኛ', '/storekeeper', 'Login needed'],
  ]],
  ['Help', 'እርዳታ', [
    ['💬', 'Help & support', 'እርዳታ', '/support'],
    ['ℹ', 'About Gulit · fees · FAQ', 'ስለ ጉሊት', '/about'],
    ['✈', 'Telegram', 'ቴሌግራም', 'https://t.me/gulitonline1'],
    ['▶', 'TikTok', 'ቲክቶክ', 'https://www.tiktok.com/@gulitonline'],
  ]],
];
const starts: [string, string][] = [['/', 'Shop / ገበያ'], ['/driver', 'Driver app / ሾፌር'], ['/engineer', 'MEP engineer / መሀንዲስ'], ['/storekeeper', 'Storekeeper / መጋዘን'], ['/partners', 'Shop partner / የሱቅ አጋር']];

const tile = ([icon, en, am, href, note]: Tile) => {
  const ext = href.startsWith('http');
  return `<a class="tile" href="${href}"${ext ? ' target="_blank" rel="noopener"' : ''}><span class="i">${icon}</span><b>${en}</b><span class="am">${am}</span>${note ? `<small>${note}</small>` : ''}</a>`;
};

export const appsHtml = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><title>All Gulit apps | ጉሊት</title><meta name="description" content="Every part of Gulit Online in one app: shop, orders, laundry, home repair, import, wholesale, rider and partner sign-up, and staff apps."><link rel="canonical" href="https://gulitonline.com/apps"><link rel="manifest" href="/manifest.webmanifest"><meta name="theme-color" content="#133d32"><link rel="icon" href="/favicon.svg"><link rel="apple-touch-icon" href="/icon-180.png"><meta name="apple-mobile-web-app-capable" content="yes"><meta name="apple-mobile-web-app-title" content="Gulit">
<style>*{box-sizing:border-box}body{margin:0;font-family:system-ui,-apple-system,"Segoe UI",Roboto,"Noto Sans Ethiopic",sans-serif;background:#f6f5f0;color:#133d32}header{background:#133d32;color:#fff;padding:22px 18px 26px;padding-top:max(22px,env(safe-area-inset-top))}header a{color:#d5ed84;text-decoration:none;font-weight:700}h1{margin:10px 0 4px;font-size:28px}header p{margin:0;opacity:.85}main{max-width:900px;margin:0 auto;padding:16px 14px 40px}h2{font-size:17px;margin:22px 4px 10px}h2 span{font-weight:400;opacity:.7;margin-left:6px}.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:10px}.tile{display:flex;flex-direction:column;gap:3px;background:#fff;border:1px solid #e1e5dc;border-radius:16px;padding:14px;text-decoration:none;color:#133d32;min-height:110px}.tile:active{transform:scale(.98)}.tile .i{font-size:26px}.tile b{font-size:15px}.tile .am{font-size:13px;color:#4c6158}.tile small{font-size:11px;color:#7b8a82;margin-top:auto}.card{background:#fff;border:1px solid #e1e5dc;border-radius:16px;padding:16px;margin-top:22px}select,button{font:inherit;padding:10px 12px;border-radius:10px;border:1px solid #c9d1c5;background:#fff;color:#133d32}button{background:#133d32;color:#fff;border:0;font-weight:700}.row{display:flex;gap:8px;flex-wrap:wrap;margin-top:10px}.muted{color:#6b7a72;font-size:13px}</style></head>
<body><header><a href="/">← Gulit</a><h1>All Gulit apps</h1><p>ሁሉም የጉሊት መተግበሪያዎች በአንድ ቦታ · One app for everything</p></header><main>
${groups.map(([en, am, tiles]) => `<h2>${en}<span>${am}</span></h2><div class="grid">${tiles.map(tile).join('')}</div>`).join('')}
<section class="card"><b>Install Gulit once / ጉሊትን አንዴ ይጫኑ</b><p class="muted">iPhone: Safari → Share → Add to Home Screen. Android: Chrome → Menu → Install app. All parts above open inside the same app.</p><div class="row"><button id="install" hidden>Install Gulit</button></div>
<p style="margin-top:16px"><b>When the app opens, start at / መተግበሪያው ሲከፈት የሚጀምረው፦</b></p><div class="row"><select id="home">${starts.map(([v, l]) => `<option value="${v}">${l}</option>`).join('')}</select><button id="save">Save</button></div><p class="muted" id="saved"></p></section>
</main><script>
var KEY='gulitHome',sel=document.getElementById('home'),out=document.getElementById('saved');
try{sel.value=localStorage.getItem(KEY)||'/'}catch(e){}
document.getElementById('save').onclick=function(){try{if(sel.value==='/')localStorage.removeItem(KEY);else localStorage.setItem(KEY,sel.value);out.textContent='Saved ✓ / ተቀምጧል'}catch(e){out.textContent='Could not save on this browser.'}};
var deferred;window.addEventListener('beforeinstallprompt',function(e){e.preventDefault();deferred=e;var b=document.getElementById('install');b.hidden=false;b.onclick=function(){deferred.prompt();deferred=null;b.hidden=true}});
if('serviceWorker' in navigator)navigator.serviceWorker.register('/sw.js').catch(function(){});
</script></body></html>`;
