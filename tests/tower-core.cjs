const assert=require('node:assert/strict'),c=require('../tower-core.js');
assert.equal(c.floors.length,6);for(const f of c.floors){assert.equal(c.damage(f,f.weak,3),20);assert.equal(c.damage(f,f.resist,3),5);assert.equal(c.damage(f,'bad',3),0);assert.equal(c.damage(f,f.weak,999),0);}
const run={hits:{a:{},b:{}}};let t=1000,id=0;
function hit(uid,floor,stat,power){run.hits[uid][String(++id).padStart(20,'0')]={floor,stat,power,at:t++,name:uid};}
hit('a',2,c.floors[1].weak,30); // locked-floor attacks never count later
hit('a',1,c.floors[0].weak,30);hit('b',1,c.floors[0].weak,30);
let r=c.replay(run);assert.equal(r.active,1);assert.deepEqual(r.floors[0].scores,{a:128,b:112});assert.deepEqual(r.floors[0].winners,['a']);assert.equal(r.floors[1].remaining,360);
hit('b',1,c.floors[0].weak,30);r=c.replay(run);assert.deepEqual(r.floors[0].scores,{a:128,b:112});
for(let floor=2;floor<=6;floor++){while(!c.replay(run).floors[floor-1].done)hit(id%2?'a':'b',floor,c.floors[floor-1].weak,30);}assert.equal(c.replay(run).complete,true);
assert.deepEqual(c.replay(JSON.parse(JSON.stringify(run))),c.replay(run));const tower={runs:{old:run},awards:{a:{'mentor-knowledge':true,'mentor-vitality':false,'tower-5':true}}};assert.ok(c.unlocked(tower,'a').includes('tower-0'));assert.ok(c.unlocked(tower,'a').includes('mentor-knowledge'));assert.ok(!c.unlocked(tower,'a').includes('mentor-vitality'));
const tied={hits:{a:{a:{floor:1,stat:c.floors[0].weak,power:28,at:1,name:'a'}},b:{b:{floor:1,stat:c.floors[0].weak,power:28,at:2,name:'b'}}}};assert.deepEqual(c.replay(tied).floors[0].winners,['a','b']);
console.log('PASS six weaknesses/resistances, ordered cooperative damage, overkill cap, frozen MVP, locked floors, all-floor progression, ties, reload and title unlocks');
