// Monthly driver bonus: 200 deliveries in an Addis calendar month → fixed bonus, plus extra per delivery above.
import assert from 'node:assert/strict';import fs from 'node:fs';
const src=fs.readFileSync('lib/driver-bonus.ts','utf8');
assert.match(src,/driver_id!='yango'/);
// pure maths, transpiled
const ts=(await import('/home/claude/gulit-online/node_modules/typescript/lib/typescript.js')).default;
const js=ts.transpileModule(src.replace(/^import .*$/mg,''),{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText;
const m=await import('data:text/javascript,'+encodeURIComponent('const database=()=>null,opsSettings=async()=>({});'+js));
const ops={driverBonusTarget:200,driverBonusFixed:200000,driverBonusPerExtra:2000};
assert.equal(m.bonusFor(199,ops),0);assert.equal(m.bonusFor(200,ops),200000);assert.equal(m.bonusFor(250,ops),200000+50*2000);
// Addis month boundaries: 1 Dec 2026 00:00 Addis = 30 Nov 21:00 UTC
const r=m.monthRange(Date.UTC(2026,10,30,21,30));assert.equal(r.label,'2026-12');assert.equal(r.start,Date.UTC(2026,10,30,21));
const p=m.monthRange(Date.UTC(2026,10,30,21,30),1);assert.equal(p.label,'2026-11');assert.equal(p.end,r.start);
const jan=m.monthRange(Date.UTC(2027,0,5),1);assert.equal(jan.label,'2026-12');
// settings defaults and pages
const st=fs.readFileSync('lib/settings.ts','utf8');assert.match(st,/driverBonusTarget: 200, driverBonusFixed: 200000, driverBonusPerExtra: 2000/);
assert.match(fs.readFileSync('app/driver/route.ts','utf8'),/Monthly bonus/);assert.match(fs.readFileSync('app/admin/drivers/route.ts','utf8'),/Driver bonus/);assert.match(fs.readFileSync('lib/admin-live-html.ts','utf8'),/driverBonusPerExtra/);
console.log('PASS: driver bonus — target, fixed + per-extra amounts, Addis month boundaries, rider and owner pages');
