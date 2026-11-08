/* Stable daily rolls: visiting/reloading never rerolls a chest or its reward. */
(function(root){'use strict';
 const maps=['plaza','classroom','library','gym','lab','moonforest','expedition'],rate=6,slots=2,dailyLimit=3;
 function hash(text){let h=2166136261;for(const c of String(text))h=Math.imul(h^c.charCodeAt(0),16777619);h^=h>>>16;return h>>>0;}
 function candidates(day,actor,map){if(!maps.includes(map))return [];const rows=[];for(let slot=0;slot<slots;slot++){const seed=`moon-chest-v1|${day}|${actor}|${map}|${slot}`;if(hash(seed+'|spawn')%100<rate)rows.push({id:map+'-'+slot,seed});}return rows;}
 function place(rows,tiles){const used=new Set();return rows.flatMap(row=>{const free=tiles.filter(t=>!used.has(t.x+','+t.y));if(!free.length)return [];const tile=free[hash(row.seed+'|position')%free.length];used.add(tile.x+','+tile.y);return [{...row,...tile}];});}
 function loot(seed,owned,catalog){const available=catalog.filter(i=>!owned.includes(i.id));if(hash(seed+'|type')%100<20&&available.length)return {kind:'item',item:available[hash(seed+'|item')%available.length].id};return {kind:'coins',coins:3+hash(seed+'|coins')%5};}
 const api={maps,rate,slots,dailyLimit,hash,candidates,place,loot};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.MoonTreasureCore=api;
})(typeof window!=='undefined'?window:globalThis);
