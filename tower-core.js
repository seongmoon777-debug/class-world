/* Deterministic replay: only hits before a boss falls count, including on reload. */
(function(root){
 'use strict';
 const keys=['observation','persistence','cooperation','knowledge','creativity','vitality'];
 const names=['감지','인내','유대','지능','영감','체력'];
 const bosses=['안개 눈 수호자','철갑 바위 골렘','외로운 그림자','수수께끼 현자','무채색 마법사','폭풍의 거인'];
 const titles=['안개를 꿰뚫은 눈','꺾이지 않는 방패','우정을 잇는 별','탑의 해독자','빛을 그린 모험가','폭풍을 넘은 용사'];
 const floors=keys.map((stat,i)=>({floor:i+1,name:bosses[i],hp:240+i*120,weak:stat,resist:keys[(i+2)%6],title:titles[i]}));
 const catalog=Object.fromEntries(keys.flatMap((stat,i)=>[[`tower-${i}`,{name:titles[i],stat,bonus:2,source:'층별 최다 기여'}],[`mentor-${stat}`,{name:['예리한 관찰자','꾸준한 도전자','다정한 동료','배움의 탐구자','반짝이는 창작자','건강한 모험가'][i],stat,bonus:2,source:'교사 수여'}]]));
 function damage(boss,stat,power){if(!keys.includes(stat)||!Number.isInteger(power)||power<1||power>30)return 0;return Math.max(1,Math.floor((4+power*2)*(stat===boss.weak?2:stat===boss.resist?0.5:1)));}
 function replay(run={}){
  const results=floors.map(f=>({...f,remaining:f.hp,scores:{},names:{},winners:[],done:false}));
  const events=[];for(const [uid,hits] of Object.entries(run.hits||{}))for(const [id,hit] of Object.entries(hits||{}))if(hit&&Number.isFinite(hit.at))events.push({...hit,uid,id});
  const order=(a,b)=>a<b?-1:a>b?1:0;events.sort((a,b)=>a.at-b.at||order(a.id,b.id)||order(a.uid,b.uid));let active=0;
  for(const hit of events){const f=results[active];if(!f||hit.floor!==f.floor)continue;const dealt=Math.min(f.remaining,damage(f,hit.stat,hit.power));if(!dealt)continue;f.remaining-=dealt;f.scores[hit.uid]=(f.scores[hit.uid]||0)+dealt;f.names[hit.uid]=String(hit.name||'친구').slice(0,16);
   if(f.remaining===0){f.done=true;f.clearedAt=hit.at;const top=Math.max(...Object.values(f.scores));f.winners=Object.keys(f.scores).filter(uid=>f.scores[uid]===top).sort();active++;}}
  return {floors:results,active,complete:active===floors.length};
 }
 function unlocked(tower,uid){const ids=new Set();for(const run of Object.values(tower.runs||{}))for(const f of replay(run).floors)if(f.done&&f.winners.includes(uid))ids.add('tower-'+(f.floor-1));for(const [id,value] of Object.entries(tower.awards?.[uid]||{}))if(value===true&&id.startsWith('mentor-')&&catalog[id])ids.add(id);return [...ids];}
 const api={keys,names,floors,catalog,damage,replay,unlocked};if(typeof module!=='undefined')module.exports=api;else root.MoonTowerCore=api;
})(typeof window!=='undefined'?window:globalThis);
