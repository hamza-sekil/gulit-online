// Gulit Agents: validation, Pulito seed job, owner page + nav, public page safety (textContent, no-referrer for the manage token).
import assert from 'node:assert/strict';import fs from 'node:fs';
const ts=(await import('/home/claude/gulit-online/node_modules/typescript/lib/typescript.js')).default;
const tx=f=>ts.transpileModule(fs.readFileSync(f,'utf8').replace(/^import .*$/mg,''),{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText.replace(/^export /mg,'');
const M=new Function(tx('lib/agents.ts')+';return {validatePost,validatePerson,REGIONS,MODELS};')();
const good={company:'Abay Cement',product:'Cement',category:'Building materials',model:'Buy & resell',cities:['Amhara','Nowhere'],terms:'Buy at 900, sell at 980',contactName:'Sara',phone:'0922334455'};
const p=M.validatePost(good);assert.deepEqual(p.cities,['Amhara']);
assert.throws(()=>M.validatePost({...good,cities:[]}),/region/);assert.throws(()=>M.validatePost({...good,phone:'12'}),/phone/);assert.throws(()=>M.validatePost({...good,model:'x'}),/earns/);
const a=M.validatePerson({name:'Abebe',phone:'0911223344',region:'Oromia',city:'Adama',categories:['Food & drinks','bad'],hasShop:true});assert.deepEqual(a.categories,['Food & drinks']);assert.equal(a.hasShop,true);
assert.throws(()=>M.validatePerson({name:'Abebe',phone:'0911223344',region:'All Ethiopia',city:'Adama'}),/region/);
const sql=fs.readFileSync('drizzle/0017_agents.sql','utf8');assert.match(sql,/CREATE TABLE `agent_posts`/);assert.match(sql,/CREATE TABLE `agent_people`/);assert.match(sql,/'AG-PULITO'.*'live'/s);assert.match(sql,/except Bale and Gamo Gofa/);
const j=JSON.parse(fs.readFileSync('drizzle/meta/_journal.json','utf8'));assert.ok(j.entries.some(e=>e.tag==='0017_agents'));
for(const f of ['lib/admin-html.ts','lib/admin-live-html.ts','lib/admin-partners-html.ts','app/admin/orders/route.ts'])assert.match(fs.readFileSync(f,'utf8'),/\/admin\/agents/);
const pub=fs.readFileSync('lib/agents-html.ts','utf8');assert.ok(!/innerHTML/.test(pub));assert.match(pub,/name="referrer" content="no-referrer"/);
assert.match(fs.readFileSync('app/api/admin/agents/route.ts','utf8'),/guard\(r\)/);assert.match(fs.readFileSync('lib/agents.ts','utf8'),/manage_hash=\?/);
console.log('PASS: Gulit Agents — validation, Pulito job seeded, owner page linked, public page safe');
