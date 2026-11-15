// Shop shows Ethiopian supermarket items: Gulf-only brands and demo products are hidden unless a supermarket prices them.
import assert from 'node:assert/strict';import fs from 'node:fs';
const c=JSON.parse(fs.readFileSync('lib/catalog-defaults.json','utf8'));const visible=c.filter(p=>!p.hidden);
for(const bad of ['Almarai','Al Rawabi','Mai Dubai','Masafi','Carrefour','Americana','Al Kabeer','Lacnor','Wireless over-ear headphones','Dyson'])assert.ok(!visible.some(p=>p.name.includes(bad)),bad+' should be hidden');
for(const good of ['White teff','Injera','Berbere','Shiro','Tomoca','Red onion','Eggs','Ambo mineral water','Coca-Cola','Nitsuh'])assert.ok(visible.some(p=>p.name.includes(good)),good+' should be visible');
for(const p of c.filter(p=>p.id>=210000&&p.id<211000)){assert.ok(fs.existsSync('public'+p.image),p.image);assert.equal(p.draft,true);}
assert.equal(new Set(c.map(p=>p.id)).size,c.length,'unique ids');
const cat=fs.readFileSync('lib/catalog.ts','utf8');assert.match(cat,/!p\.hidden\|\|\(p\.storeStock\|\|\[\]\)\.some/);assert.match(cat,/hidden:all\.get\(row\.id\)\?\.hidden/);
console.log('PASS: Ethiopian catalogue — '+visible.length+' visible, Gulf/demo items hidden unless a supermarket prices them');
// While the product list is under construction (default), product orders are refused; laundry stays open; owner can switch it in Live.
const ord=fs.readFileSync('lib/orders.ts','utf8');assert.match(ord,/if\(!laundry&&ops\.shopOpen!==1\)throw Error\('Our product list is being updated/);
assert.match(fs.readFileSync('lib/settings.ts','utf8'),/shopOpen: 0 \}/);assert.match(fs.readFileSync('lib/admin-live-html.ts','utf8'),/Under construction \(services and registration only\)/);
const sf=fs.readFileSync('lib/storefront-html.ts','utf8');assert.match(sf,/Our product list is under construction/);assert.match(sf,/Become an e-bike rider/);
console.log('PASS: under-construction switch — orders blocked except laundry, owner toggle in Live, customer notice with registration links');
