// /agents: Gulit Agents. Agent jobs from businesses across Ethiopia, agent sign-up, a business posting form,
// and the business's private manage view (/agents?manage=<token>). All user text is rendered with textContent.

export const agentsHtml = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><title>Gulit Agents | Find agents across Ethiopia · ወኪሎች</title><meta name="description" content="Gulit Agents: businesses find sales agents and distributors in every region of Ethiopia, and people find agent work. Become an agent or post an agent job."><link rel="canonical" href="https://gulitonline.com/agents"><link rel="manifest" href="/manifest.webmanifest"><meta name="theme-color" content="#0f3329"><link rel="icon" href="/favicon.svg"><link rel="apple-touch-icon" href="/icon-180.png"><meta name="referrer" content="no-referrer">
<meta property="og:title" content="Gulit Agents · ጉሊት ወኪሎች"><meta property="og:description" content="Find agents across Ethiopia, or become one."><meta property="og:image" content="https://gulitonline.com/social/og.jpg">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700;800&family=Noto+Sans+Ethiopic:wght@400;500;600&display=swap" rel="stylesheet">
<style>
:root{--g:#133d32;--g2:#0f3329;--l:#d5ed84;--bg:#f4f5f0;--ink:#10241d;--mut:#6a7a72;--line:#e6e9e2;--r:20px}
*{box-sizing:border-box;-webkit-tap-highlight-color:transparent}[hidden]{display:none!important}
body{margin:0;background:var(--bg);color:var(--ink);font-family:"Plus Jakarta Sans","Noto Sans Ethiopic",system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;-webkit-font-smoothing:antialiased}
.am{font-family:"Noto Sans Ethiopic","Plus Jakarta Sans",system-ui,sans-serif}
a{color:inherit;text-decoration:none}
.hero{background:radial-gradient(120% 90% at 100% 0%,#1f5a49 0%,var(--g) 45%,var(--g2) 100%);color:#fff;padding:max(18px,env(safe-area-inset-top)) 18px 26px}
.bar{display:flex;align-items:center;justify-content:space-between;max-width:820px;margin:0 auto}
.logo{display:flex;align-items:center;gap:10px;font-weight:800;font-size:22px;letter-spacing:-.04em}.logo img{width:34px;height:34px;border-radius:10px}.logo i{color:var(--l);font-style:normal}
.pillbtn{font-weight:600;font-size:13px;color:var(--l);padding:8px 13px;border-radius:999px;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.14)}
.hi{max-width:820px;margin:22px auto 0}.hi h1{margin:0;font-size:30px;line-height:1.15;font-weight:800;letter-spacing:-.035em}.hi p{margin:8px 0 0;opacity:.8;font-size:15px}
.tabs{max-width:820px;margin:20px auto 0;display:grid;grid-template-columns:repeat(3,1fr);gap:6px;background:rgba(255,255,255,.08);padding:5px;border-radius:16px}
.tabs button{font:inherit;font-weight:700;font-size:13.5px;border:0;border-radius:12px;padding:11px 6px;background:transparent;color:#e7efe2;cursor:pointer;line-height:1.25}.tabs button small{display:block;font-weight:500;font-size:11px;opacity:.75}
.tabs button[aria-selected=true]{background:var(--l);color:var(--g)}
main{max-width:820px;margin:0 auto;padding:18px 14px 60px}
.filters{display:flex;gap:8px;margin-bottom:14px}.filters select{flex:1}
select,input,textarea{font:inherit;font-size:15px;width:100%;padding:12px 13px;border:1px solid #d3dacd;border-radius:12px;background:#fff;color:var(--ink)}textarea{min-height:84px;resize:vertical}
label{display:block;font-weight:700;font-size:13.5px;margin:14px 0 6px}label small{font-weight:500;color:var(--mut)}
.job{background:#fff;border:1px solid var(--line);border-radius:var(--r);padding:18px;margin-bottom:12px;box-shadow:0 6px 20px -16px rgba(16,36,29,.4)}
.job.feat{border:2px solid var(--l);box-shadow:0 10px 30px -18px rgba(16,36,29,.5)}
.top{display:flex;justify-content:space-between;gap:10px;align-items:flex-start}
.job h3{margin:0;font-size:18px;font-weight:800;letter-spacing:-.02em}.job .co{color:var(--mut);font-size:13.5px;margin-top:2px}
.badge{flex:none;font-size:11px;font-weight:800;letter-spacing:.04em;text-transform:uppercase;background:var(--l);color:var(--g);padding:5px 9px;border-radius:999px}
.chips{display:flex;flex-wrap:wrap;gap:6px;margin:12px 0}.chip{font-size:12px;font-weight:600;background:#eef1ea;color:var(--g);border-radius:999px;padding:5px 10px}.chip.m{background:#e8f3c4}
.job p{margin:8px 0 0;font-size:14px;line-height:1.55;color:#33463f}.job p b{color:var(--ink)}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;font:inherit;font-weight:800;font-size:15px;border:0;border-radius:14px;padding:13px 18px;background:var(--g);color:var(--l);cursor:pointer;width:100%;margin-top:14px}.btn.lime{background:var(--l);color:var(--g)}.btn.ghost{background:#eef1ea;color:var(--g)}.btn:disabled{opacity:.6}
.card{background:#fff;border:1px solid var(--line);border-radius:var(--r);padding:18px}
.card h2{margin:0 0 4px;font-size:20px;font-weight:800;letter-spacing:-.02em}.card .sub{color:var(--mut);font-size:14px;margin:0}
.checks{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:6px}.checks label{display:flex;align-items:center;gap:8px;margin:0;font-weight:600;font-size:13.5px;background:#f6f7f3;border:1px solid var(--line);border-radius:10px;padding:9px 10px}.checks input{width:auto;margin:0}
.fee{display:flex;align-items:center;justify-content:space-between;gap:10px;background:var(--g);color:#fff;border-radius:16px;padding:14px 16px;margin-top:14px}.fee b{color:var(--l);font-size:20px}
.msg{margin-top:12px;font-size:14px;font-weight:600}.msg.err{color:#a32323}.msg.ok{color:#2f6b2a}
.done{background:#e8f3c4;border-radius:16px;padding:16px;margin-top:14px;font-size:14px;line-height:1.55}.done code{display:block;word-break:break-all;background:#fff;border-radius:10px;padding:10px;margin:8px 0;font-size:12.5px}
.empty{text-align:center;color:var(--mut);padding:30px 10px}
.modal{position:fixed;inset:0;background:rgba(10,25,20,.55);display:flex;align-items:flex-end;justify-content:center;z-index:9}
.sheet{background:var(--bg);width:100%;max-width:560px;max-height:92vh;overflow:auto;border-radius:24px 24px 0 0;padding:20px 18px max(24px,env(safe-area-inset-bottom))}
.x{float:right;font:inherit;font-size:22px;background:#e6e9e2;border:0;border-radius:50%;width:36px;height:36px;cursor:pointer}
.person{background:#fff;border:1px solid var(--line);border-radius:16px;padding:14px;margin-top:10px}.person .row{display:flex;justify-content:space-between;gap:8px;align-items:center}.person b{font-size:15px}.person small{color:var(--mut)}
.person .acts{display:flex;gap:8px;margin-top:10px}.person .acts a,.person .acts select{flex:1;text-align:center;font-weight:700;font-size:14px;border-radius:12px;padding:10px;background:#eef1ea;color:var(--g)}
.how{display:grid;gap:10px;margin-top:16px}.how div{display:flex;gap:12px;align-items:flex-start;font-size:14px;line-height:1.5}.how span{flex:none;width:28px;height:28px;border-radius:50%;background:var(--l);color:var(--g);font-weight:800;display:grid;place-items:center}
</style></head><body>
<header class="hero"><div class="bar"><a class="logo" href="/apps"><img src="/icon-192.png" alt=""><span>gulit<i>.</i> agents</span></a><a class="pillbtn" href="/apps">☰ Apps</a></div>
<div class="hi"><h1>Find agents across Ethiopia.</h1><p class="am">በመላው ኢትዮጵያ ወኪል ያግኙ · ወኪል ይሁኑ</p></div>
<div class="tabs" role="tablist"><button role="tab" data-v="jobs" aria-selected="true">Agent jobs<small class="am">የወኪል ስራዎች</small></button><button role="tab" data-v="join" aria-selected="false">Become an agent<small class="am">ወኪል ይሁኑ</small></button><button role="tab" data-v="post" aria-selected="false">Post a job<small class="am">ለድርጅቶች</small></button></div></header>
<main>
<section id="v-jobs"><div class="filters"><select id="fRegion" aria-label="Region"><option value="">All regions · ሁሉም ክልል</option></select><select id="fCat" aria-label="Category"><option value="">All categories</option></select></div><div id="jobs"><div class="empty">Loading…</div></div></section>
<section id="v-join" hidden><div class="card"><h2>Become a Gulit agent</h2><p class="sub am">ወኪል ይሁኑ — በከተማዎ ያሉ ድርጅቶች ያገኙዎታል</p><form id="joinForm"></form></div></section>
<section id="v-post" hidden><div class="card"><h2>Find agents for your business</h2><p class="sub">Post once, reach agents in every region. <span class="am">ድርጅትዎ በየከተማው ወኪል ያግኝ።</span></p>
<div class="how"><div><span>1</span><p style="margin:0">Fill in the form below.</p></div><div><span>2</span><p style="margin:0">Our team calls you to collect the posting fee.</p></div><div><span>3</span><p style="margin:0">Your job goes live for <b id="days">30</b> days. You see every agent who applies on your private page.</p></div></div>
<form id="postForm"><label>Business name<input name="company" maxlength="100" required></label><label>Product or service the agent will sell<input name="product" maxlength="120" required placeholder="e.g. Laundry soap, cement, mobile cards"></label><label>Category<select name="category" required></select></label><label>How does the agent earn?<select name="model" required></select></label>
<label>Regions <small>(choose all that apply)</small></label><div class="checks" id="regionChecks"></div><label>Cities or areas <small>(optional)</small><input name="coverage" maxlength="200" placeholder="e.g. Adama, Hawassa · or: all except …"></label>
<label>What the agent earns<textarea name="terms" maxlength="500" required placeholder="e.g. Buy at wholesale price 80 birr, sell at 95 birr. Or: 5% commission on every sale."></textarea></label><label>What the agent needs <small>(optional)</small><textarea name="needs" maxlength="500" placeholder="e.g. A shop or store, a motorbike, a deposit"></textarea></label><label>About your business <small>(optional)</small><textarea name="description" maxlength="1000"></textarea></label>
<label>Contact person<input name="contactName" maxlength="100" required></label><label>Phone<input name="phone" type="tel" maxlength="25" required placeholder="09…"></label><label>TIN <small>(optional)</small><input name="tin" maxlength="30"></label>
<div class="fee"><span>Posting fee<br><small class="am">የማስታወቂያ ክፍያ</small></span><b id="fee">—</b></div><button class="btn" type="submit">Send job for review</button><div class="msg" id="postMsg"></div></form><div id="postDone" hidden></div></div></section>
<section id="v-manage" hidden></section>
</main>
<div class="modal" id="modal" hidden><div class="sheet"><button class="x" id="mClose" aria-label="Close">×</button><h2 id="mTitle" style="margin:4px 0 2px;font-size:20px"></h2><p class="sub" id="mSub" style="color:var(--mut);margin:0"></p><form id="applyForm"></form></div></div>
<script>
var $=function(id){return document.getElementById(id)},D={regions:[],categories:[],models:[],posts:[],fee:0,days:30},applyTo=null;
function h(tag,attrs,kids){var e=document.createElement(tag);for(var k in attrs||{}){if(k==='text')e.textContent=attrs[k];else if(k==='cls')e.className=attrs[k];else e.setAttribute(k,attrs[k])}(kids||[]).forEach(function(c){if(c)e.append(c)});return e}
function opt(sel,vals,keep){if(!keep)sel.replaceChildren();vals.forEach(function(v){sel.append(h('option',{value:v,text:v}))})}
async function api(path,opts){var r=await fetch(path,Object.assign({cache:'no-store',headers:{'Content-Type':'application/json'}},opts||{}));var d={};try{d=await r.json()}catch(e){}if(!r.ok)throw new Error(d.error||'Please try again.');return d}
function show(v){['jobs','join','post','manage'].forEach(function(k){$('v-'+k).hidden=k!==v});document.querySelectorAll('.tabs button').forEach(function(b){b.setAttribute('aria-selected',String(b.dataset.v===v))});try{history.replaceState(null,'',v==='jobs'?'/agents':'/agents?'+v)}catch(e){}scrollTo(0,0)}
document.querySelectorAll('.tabs button').forEach(function(b){b.onclick=function(){show(b.dataset.v)}});
function personFields(form,btnText,withMessage){var saved={};try{saved=JSON.parse(localStorage.getItem('gulitAgent')||'{}')}catch(e){}
 var regions=D.regions.filter(function(r){return r!=='All Ethiopia'});form.replaceChildren.apply(form,[
 h('label',{text:'Full name · ሙሉ ስም'},[h('input',{name:'name',maxlength:'100',required:''})]),
 h('label',{text:'Phone · ስልክ'},[h('input',{name:'phone',type:'tel',maxlength:'25',required:'',placeholder:'09…'})]),
 h('label',{text:'Region · ክልል'},[h('select',{name:'region',required:''})]),
 h('label',{text:'City or town · ከተማ'},[h('input',{name:'city',maxlength:'60',required:''})]),
 withMessage?null:h('label',{text:'What can you sell? '},[h('div',{cls:'checks',id:form.id+'Cats'})]),
 h('div',{cls:'checks',style:'margin-top:14px'},[h('label',{},[h('input',{type:'checkbox',name:'hasShop'}),document.createTextNode('I have a shop or store')]),h('label',{},[h('input',{type:'checkbox',name:'hasVehicle'}),document.createTextNode('I have a vehicle / motorbike')])]),
 h('label',{text:'Experience '},[h('small',{text:'(optional)'}),h('textarea',{name:'experience',maxlength:'500',placeholder:'e.g. 3 years selling to shops in Adama'})]),
 withMessage?h('label',{text:'Message to the business '},[h('small',{text:'(optional)'}),h('textarea',{name:'message',maxlength:'500'})]):null,
 h('button',{cls:'btn',type:'submit',text:btnText}),h('div',{cls:'msg'})].filter(Boolean));
 var rs=form.querySelector('[name=region]');rs.append(h('option',{value:'',text:'Choose region'}));opt(rs,regions,true);
 if(!withMessage){var c=form.querySelector('.checks');D.categories.forEach(function(k){c.append(h('label',{},[h('input',{type:'checkbox',name:'categories',value:k}),document.createTextNode(k)]))})}
 ['name','phone','region','city','experience'].forEach(function(k){if(saved[k])form.elements[k].value=saved[k]});if(saved.hasShop)form.elements.hasShop.checked=true;if(saved.hasVehicle)form.elements.hasVehicle.checked=true}
function readPerson(form){var f=form.elements,p={name:f.name.value,phone:f.phone.value,region:f.region.value,city:f.city.value,experience:f.experience.value,hasShop:f.hasShop.checked,hasVehicle:f.hasVehicle.checked,message:f.message?f.message.value:'',categories:[].slice.call(form.querySelectorAll('[name=categories]:checked')).map(function(x){return x.value})};try{localStorage.setItem('gulitAgent',JSON.stringify({name:p.name,phone:p.phone,region:p.region,city:p.city,experience:p.experience,hasShop:p.hasShop,hasVehicle:p.hasVehicle}))}catch(e){}return p}
async function submitPerson(form,body){var m=form.querySelector('.msg'),b=form.querySelector('button[type=submit]');m.className='msg';m.textContent='Sending…';b.disabled=true;try{var d=await api('/api/agents',{method:'POST',body:JSON.stringify(body)});form.replaceChildren(h('div',{cls:'done'},[h('b',{text:'Sent ✓ · ተልኳል'}),h('div',{text:'Reference: '+d.reference}),h('div',{text:'The business or our team will call you. Keep your phone on.'})]))}catch(e){m.className='msg err';m.textContent=e.message;b.disabled=false}}
function render(){var r=$('fRegion').value,c=$('fCat').value,box=$('jobs');box.replaceChildren();var list=D.posts.filter(function(p){return(!r||p.cities.indexOf(r)>=0||p.cities.indexOf('All Ethiopia')>=0)&&(!c||p.category===c)});
 if(!list.length){box.append(h('div',{cls:'empty',text:'No agent jobs here yet. Register as an agent and businesses will find you.'}));return}
 list.forEach(function(p){var chips=h('div',{cls:'chips'},[h('span',{cls:'chip m',text:p.model}),h('span',{cls:'chip',text:p.category})].concat(p.cities.map(function(x){return h('span',{cls:'chip',text:'📍 '+x})})));
 var btn=h('button',{cls:'btn',type:'button',text:'Apply · ያመልክቱ'});btn.onclick=function(){openApply(p)};
 box.append(h('article',{cls:'job'+(p.featured?' feat':'')},[h('div',{cls:'top'},[h('div',{},[h('h3',{text:p.product}),h('div',{cls:'co',text:p.company})]),p.featured?h('span',{cls:'badge',text:'Featured'}):null]),chips,
 p.coverage?h('p',{},[h('b',{text:'Where: '}),document.createTextNode(p.coverage)]):null,h('p',{},[h('b',{text:'You earn: '}),document.createTextNode(p.terms)]),p.needs?h('p',{},[h('b',{text:'You need: '}),document.createTextNode(p.needs)]):null,p.description?h('p',{text:p.description}):null,btn]))})}
function openApply(p){applyTo=p;$('mTitle').textContent=p.product;$('mSub').textContent=p.company;var f=$('applyForm');personFields(f,'Send application',true);f.onsubmit=function(e){e.preventDefault();var b=readPerson(f);b.kind='apply';b.postId=p.id;submitPerson(f,b)};$('modal').hidden=false;document.body.style.overflow='hidden'}
function closeApply(){$('modal').hidden=true;document.body.style.overflow=''}
$('mClose').onclick=closeApply;$('modal').onclick=function(e){if(e.target===$('modal'))closeApply()};
function setupPost(){var f=$('postForm');opt(f.elements.category,D.categories);opt(f.elements.model,D.models);var rc=$('regionChecks');D.regions.forEach(function(r){rc.append(h('label',{},[h('input',{type:'checkbox',name:'cities',value:r}),document.createTextNode(r)]))});
 $('fee').textContent=D.fee?D.fee.toLocaleString()+' birr / '+D.days+' days':'Free for now';$('days').textContent=D.days;
 f.onsubmit=async function(e){e.preventDefault();var m=$('postMsg'),b=f.querySelector('button[type=submit]'),el=f.elements;var body={kind:'post',company:el.company.value,product:el.product.value,category:el.category.value,model:el.model.value,coverage:el.coverage.value,terms:el.terms.value,needs:el.needs.value,description:el.description.value,contactName:el.contactName.value,phone:el.phone.value,tin:el.tin.value,cities:[].slice.call(f.querySelectorAll('[name=cities]:checked')).map(function(x){return x.value})};
 m.className='msg';m.textContent='Sending…';b.disabled=true;try{var d=await api('/api/agents',{method:'POST',body:JSON.stringify(body)});var link=location.origin+'/agents?manage='+d.token;f.hidden=true;var done=$('postDone');done.hidden=false;var copy=h('button',{cls:'btn lime',type:'button',text:'Copy my private link'});copy.onclick=function(){navigator.clipboard&&navigator.clipboard.writeText(link).then(function(){copy.textContent='Copied ✓'})};
 var open=h('a',{cls:'btn ghost',href:'/agents?manage='+d.token,text:'Open my job page'});
 done.replaceChildren(h('div',{cls:'done'},[h('b',{text:'Received ✓ Reference: '+d.id}),h('div',{text:'Our team will call '+body.phone+' to collect the posting fee'+(d.fee?' ('+d.fee.toLocaleString()+' birr)':'')+'. Your job goes live for '+d.days+' days after payment.'}),h('div',{style:'margin-top:8px;font-weight:700',text:'Save this private link. It shows the agents who apply. Do not share it.'}),h('code',{text:link})]),copy,open);try{localStorage.setItem('gulitAgentManage',link)}catch(e){}}catch(err){m.className='msg err';m.textContent=err.message;b.disabled=false}}}
async function manage(token){show('manage');var v=$('v-manage');v.replaceChildren(h('div',{cls:'empty',text:'Loading your job…'}));try{history.replaceState(null,'','/agents?manage='+token)}catch(e){}
 try{var d=await api('/api/agents/manage',{method:'POST',body:JSON.stringify({token:token})});var p=d.post,st={pending:'Waiting for payment · Our team will call you',live:'Live'+(p.expiresAt?' until '+new Date(p.expiresAt).toLocaleDateString():''),closed:'Closed',rejected:'Not approved · call 0909 225 566'}[p.status]||p.status;
 var list=h('div');if(!d.applicants.length)list.append(h('div',{cls:'empty',text:p.status==='live'?'No applicants yet. New applicants appear here.':'Applicants appear here after your job goes live.'}));
 d.applicants.forEach(function(a){var sel=h('select',{'aria-label':'Status'});['new','contacted','accepted','rejected'].forEach(function(s){var o=h('option',{value:s,text:s[0].toUpperCase()+s.slice(1)});if(s===a.status)o.selected=true;sel.append(o)});sel.onchange=function(){api('/api/agents/manage',{method:'PATCH',body:JSON.stringify({token:token,id:a.id,status:sel.value})}).catch(function(e){alert(e.message)})};
 list.append(h('div',{cls:'person'},[h('div',{cls:'row'},[h('b',{text:a.name}),h('small',{text:new Date(a.createdAt).toLocaleDateString()})]),h('div',{text:'📍 '+a.city+', '+a.region}),h('small',{text:[a.hasShop?'Has a shop':'',a.hasVehicle?'Has a vehicle':''].filter(Boolean).join(' · ')}),a.experience?h('p',{style:'margin:6px 0 0;font-size:14px',text:a.experience}):null,a.message?h('p',{style:'margin:6px 0 0;font-size:14px;font-style:italic',text:a.message}):null,h('div',{cls:'acts'},[h('a',{href:'tel:'+a.phone.replace(/[^0-9+]/g,''),text:'📞 '+a.phone}),sel])]))});
 v.replaceChildren(h('div',{cls:'card'},[h('h2',{text:p.product}),h('p',{cls:'sub',text:p.company+' · '+p.id}),h('div',{cls:'chips'},[h('span',{cls:'chip m',text:st})]),h('h3',{style:'margin:18px 0 0;font-size:16px',text:'Agents who applied ('+d.applicants.length+')'}),list]))}
 catch(e){v.replaceChildren(h('div',{cls:'card'},[h('h2',{text:'Link not found'}),h('p',{cls:'sub',text:e.message})]))}}
(async function(){try{var d=await api('/api/agents');D=d}catch(e){$('jobs').replaceChildren(h('div',{cls:'empty',text:'Could not load. Check your connection.'}));return}
 var fr=$('fRegion'),fc=$('fCat');opt(fr,D.regions.filter(function(r){return r!=='All Ethiopia'}),true);opt(fc,D.categories,true);fr.onchange=render;fc.onchange=render;render();
 var jf=$('joinForm');personFields(jf,'Register as an agent',false);jf.onsubmit=function(e){e.preventDefault();var b=readPerson(jf);b.kind='agent';submitPerson(jf,b)};setupPost();
 var q=new URLSearchParams(location.search);if(q.get('manage'))manage(q.get('manage'));else if(q.has('join'))show('join');else if(q.has('post'))show('post');else if(q.get('job')){var p=D.posts.find(function(x){return x.id===q.get('job')});if(p)openApply(p)}})();
if('serviceWorker' in navigator)navigator.serviceWorker.register('/sw.js').catch(function(){});
</script></body></html>`;
