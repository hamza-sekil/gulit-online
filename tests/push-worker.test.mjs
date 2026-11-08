import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';
const handlers={},notices=[],opened=[];let focused=0,messages=[];
const self={location:{origin:'https://gulit.test'},addEventListener:(name,fn)=>handlers[name]=fn,registration:{showNotification:async(title,options)=>notices.push({title,options})},clients:{matchAll:async()=>[],openWindow:async url=>opened.push(url)}};
vm.runInNewContext(fs.readFileSync('public/sw.js','utf8'),{self,URL,caches:{},fetch(){throw Error('Unexpected fetch')}});
let pending;handlers.push({data:null,waitUntil:p=>pending=p});await pending;assert.equal(notices[0].title,'Gulit MEP');assert.equal(notices[0].options.data.url,'/engineer');assert.ok(!JSON.stringify(notices).includes('Customer'));
let closed=false;handlers.notificationclick({notification:{close:()=>closed=true,data:{url:'https://evil.test/'}},waitUntil:p=>pending=p});await pending;assert.equal(closed,true);assert.deepEqual(opened,['https://gulit.test/engineer']);
self.clients.matchAll=async()=>[{url:'https://gulit.test/engineer',focus:async()=>focused++,postMessage:m=>messages.push(m)}];handlers.notificationclick({notification:{close(){},data:{}},waitUntil:p=>pending=p});await pending;assert.equal(focused,1);assert.equal(messages[0].type,'GULIT_MEP_REFRESH');assert.equal(opened.length,1);
console.log('PASS: payload-free push displays a generic alert, notification click opens only the engineer app, existing engineer tab is focused/refreshed');
// Customer role: order notification, opens the shop's order list, never the engineer app.
{const store=new Map();const caches2={open:async()=>({put:async(k,v)=>store.set(k,await v.text()),match:async k=>store.has(k)?new Response(store.get(k)):undefined})};
const h2={},n2=[],o2=[];const self2={location:{origin:'https://gulit.test'},addEventListener:(n,f)=>h2[n]=f,registration:{showNotification:async(t,o)=>n2.push({t,o})},clients:{matchAll:async()=>[],openWindow:async u=>o2.push(u)}};
vm.runInNewContext(fs.readFileSync('public/sw.js','utf8'),{self:self2,URL,Response,caches:caches2,fetch(){throw Error('x')}});
let p;h2.message({data:{type:'GULIT_PUSH_ROLE',role:'customer'},waitUntil:x=>p=x});await p;h2.message({data:{type:'GULIT_PUSH_ROLE',role:'admin'},waitUntil:x=>p=x});
h2.push({data:null,waitUntil:x=>p=x});await p;assert.equal(n2[0].t,'Gulit Online');assert.equal(n2[0].o.data.url,'/?orders=1');assert.ok(!/engineer/i.test(JSON.stringify(n2)));
h2.notificationclick({notification:{close(){},data:{url:'/?orders=1'}},waitUntil:x=>p=x});await p;assert.deepEqual(o2,['https://gulit.test/?orders=1']);
console.log('PASS: customer push role shows an order update and opens My orders');}
