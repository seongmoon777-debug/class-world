const assert=require('assert/strict'),core=require('../journey-core.js'),loot=require('../treasure-core.js');
const legendary=core.items.filter(x=>x.rarity==='전설');assert.equal(legendary.length,3);assert.equal(new Set(core.items.map(x=>x.id)).size,core.items.length);
for(const item of legendary){assert(!core.earned(core.items,{[item.metric]:item.target-1}).includes(item.id));assert(core.earned(core.items,{[item.metric]:item.target}).includes(item.id));assert.equal(core.bonuses({items:[item.id],equipment:[item.id,item.id]})[item.stat],4);assert.equal(core.bonuses({items:[],equipment:[item.id]})[item.stat],0);}
for(let i=0;i<2000;i++){const r=loot.loot('test-'+i,[],core.items);assert(!legendary.some(x=>x.id===r.item));}
console.log('PASS legendary thresholds, duplicate and unowned equipment, activity-only acquisition');

