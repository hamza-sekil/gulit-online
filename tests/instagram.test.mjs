// Instagram auto-posting: caption conversion, settings validation, cron + Telegram wiring, token never sent to the browser.
import assert from 'node:assert/strict';import fs from 'node:fs';
const ts=(await import('/home/claude/gulit-online/node_modules/typescript/lib/typescript.js')).default;
const src=fs.readFileSync('lib/instagram.ts','utf8').replace(/^import .*$/mg,'');
const out=ts.transpileModule(src,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText.replace(/^export /mg,'');
const M=new Function('env','MEDIA_BASE',out+';return {igCaption,validateIG,DEFAULT_IG};')({},'https://gulitonline.com/social/');
const c=M.igCaption('🧺 <b>ጉሊት</b> &amp; more\n🌐 <a href="https://gulitonline.com/tg">gulitonline.com</a>');
assert.ok(!/[<>]/.test(c));assert.match(c,/ጉሊት & more/);assert.match(c,/#Gulit/);assert.ok(c.length<=2150);
assert.equal(M.igCaption('Hi #Gulit').match(/#Gulit/g).length,1);
assert.throws(()=>M.validateIG({enabled:true,userId:''},M.DEFAULT_IG),/user ID/);assert.throws(()=>M.validateIG({userId:'abc'},M.DEFAULT_IG),/digits/);
assert.equal(M.validateIG({enabled:true,userId:'17841400000000000'},M.DEFAULT_IG).enabled,true);
assert.match(fs.readFileSync('worker/index.ts','utf8'),/processInstagram\(\)/);
assert.equal((fs.readFileSync('lib/telegram.ts','utf8').match(/queueForInstagram\(POSTS\[i\]\)/g)||[]).length,2);
const api=fs.readFileSync('app/api/admin/instagram/route.ts','utf8');assert.match(api,/guard\(r\)/);assert.ok(!/token\(\)/.test(api)&&!/INSTAGRAM_ACCESS_TOKEN/.test(api));
assert.match(src,/media_type: 'REELS'/);assert.match(src,/media_publish/);assert.match(src,/refresh_access_token/);
import {readdirSync} from 'node:fs';for(const f of readdirSync('public/social').filter(f=>/^gulit-.*\.jpg$/.test(f)))assert.ok(fs.existsSync('public/social/ig/'+f),'missing Instagram copy of '+f);
console.log('PASS: Instagram auto-posting — captions, settings, cron wiring, token stays server-side');
