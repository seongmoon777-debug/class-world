/* Deterministic replay: only hits before a boss falls count, including on reload. */
(function(root){
 'use strict';
 const keys=['observation','persistence','cooperation','knowledge','creativity','vitality'];
 const names=['감지','인내','유대','지능','영감','체력'];
 const bosses=['고블린 약탈왕','오크 군주','돌가죽 트롤','미궁의 미노타우로스','독안의 바실리스크','저주의 메두사','지옥문 케르베로스','독룡 히드라','망각의 리치왕','태고의 흑룡'];
 const titles=['고블린 추적자','오크 분쇄자','트롤 사냥꾼','미궁의 정복자','독안의 파훼자','저주를 깬 용사','지옥문의 수호자','히드라 토벌자','망각을 밝힌 별','흑룡을 꺾은 영웅'];
 const floors=bosses.map((name,i)=>({floor:i+1,name,hp:240+i*120,weak:keys[i%6],resist:keys[(i+2)%6],title:titles[i],icon:['👺','🪓','🪨','🐂','🐍','🪞','🐕','🐲','💀','🐉'][i]}));
 const catalog=Object.fromEntries([...floors.map((f,i)=>[`tower-${i}`,{name:f.title,stat:f.weak,bonus:2,source:'층별 최다 기여'}]),...keys.map((stat,i)=>[`mentor-${stat}`,{name:['예리한 관찰자','꾸준한 도전자','다정한 동료','배움의 탐구자','반짝이는 창작자','건강한 모험가'][i],stat,bonus:2,source:'교사 수여'}])]);
 const extraNames=[['숲길의 추적자','새벽의 정찰자','별빛 관측자','숨은 길 발견자','진실을 보는 눈'],['다시 일어선 용사','약속의 파수꾼','끝까지 가는 기사','불굴의 개척자','꺼지지 않는 등불'],['마음의 연결자','모둠의 나침반','다정한 중재자','함께 걷는 동료','우정의 수호기사'],['룬을 읽는 학자','질문의 탐험가','지식의 항해사','비밀의 해독자','작은 현자'],['이야기의 마법사','색채의 연금술사','꿈을 짓는 장인','발상의 불꽃','상상의 날개'],['활기찬 모험가','바람의 달리미','아침의 수호자','튼튼한 개척자','태양의 전령']];
 extraNames.forEach((rows,k)=>rows.forEach((name,i)=>{catalog['mentor-extra-'+String(k*5+i+1).padStart(2,'0')]={name,stat:keys[k],bonus:i<2?1:i<4?2:3,source:'교사 수여'};}));
 const dayIndex=at=>Math.floor((at+32400000)/86400000);
 function usedToday(tower,uid,now=Date.now()){const day=dayIndex(now);if(Number.isFinite(tower.dailyAttacks?.[uid]?.at)&&dayIndex(tower.dailyAttacks[uid].at)===day)return true;for(const run of Object.values(tower.runs||{})){if(Number.isFinite(run.cooldowns?.[uid]?.at)&&dayIndex(run.cooldowns[uid].at)===day)return true;for(const hit of Object.values(run.hits?.[uid]||{}))if(Number.isFinite(hit.at)&&dayIndex(hit.at)===day)return true;}return false;}
 function validTitle(t){return !!t&&typeof t.name==='string'&&t.name.trim().length>0&&t.name.length<=30&&t.bonuses&&Object.keys(t.bonuses).length===6&&keys.every(k=>Number.isInteger(t.bonuses[k])&&t.bonuses[k]>=0&&t.bonuses[k]<=10)&&keys.some(k=>t.bonuses[k]>0);}
 function getTitle(tower,id){return catalog[id]||(validTitle(tower.customTitles?.[id])?{...tower.customTitles[id],source:'교사 제작'}:null);}
 function titleBonuses(t){return Object.fromEntries(keys.map(k=>[k,t?.stat===k?t.bonus:(t?.bonuses?.[k]||0)]));}
 function damage(boss,stat,power){if(!keys.includes(stat)||!Number.isInteger(power)||power<1||power>30)return 0;return Math.max(1,Math.floor((4+power*2)*(stat===boss.weak?2:stat===boss.resist?0.5:1)));}
 function validStats(stats){return !!stats&&Object.keys(stats).length===6&&keys.every(k=>Number.isInteger(stats[k])&&stats[k]>=1&&stats[k]<=30);}
 function totalDamage(boss,stats){if(!validStats(stats))return 0;return Math.max(1,Math.floor(4+keys.reduce((sum,k)=>sum+stats[k]*(k===boss.weak?4:k===boss.resist?1:2),0)));}
 // Server-assigned immutable timestamp supplies the roll: no client critical flag or reroll.
 function critical(hit){return hit.version===2&&Number.isFinite(hit.at)&&hit.at%100<15;}
 function hitDamage(boss,hit){if(hit.version!==2)return damage(boss,hit.stat,hit.power);const base=totalDamage(boss,hit.stats);return base*(critical(hit)?3:1);}
 function replay(run={}){
  const results=floors.map(f=>({...f,remaining:f.hp,scores:{},names:{},winners:[],done:false}));
  const credits={};const events=[];for(const [uid,hits] of Object.entries(run.hits||{}))for(const [id,hit] of Object.entries(hits||{}))if(hit&&Number.isFinite(hit.at))events.push({...hit,uid,id});
  const order=(a,b)=>a<b?-1:a>b?1:0;events.sort((a,b)=>a.at-b.at||order(a.id,b.id)||order(a.uid,b.uid));let active=0;
  for(const hit of events){const f=results[hit.floor-1];if(!f||f.done||hit.floor!==f.floor)continue;const dealt=Math.min(f.remaining,hitDamage(f,hit));if(!dealt)continue;(credits[hit.uid]||={})[hit.id]=dealt;f.remaining-=dealt;f.scores[hit.uid]=(f.scores[hit.uid]||0)+dealt;f.names[hit.uid]=String(hit.name||'친구').slice(0,16);
   if(f.remaining===0){f.done=true;f.clearedAt=hit.at;const top=Math.max(...Object.values(f.scores));f.winners=Object.keys(f.scores).filter(uid=>f.scores[uid]===top).sort();active++;}}
  active=results.findIndex(f=>!f.done);if(active<0)active=results.length;return {floors:results,active,complete:active===floors.length,credits};
 }
 function unlocked(tower,uid){const ids=new Set();for(const run of Object.values(tower.runs||{}))for(const f of replay(run).floors)if(f.done&&f.winners.includes(uid))ids.add('tower-'+(f.floor-1));for(const [id,value] of Object.entries(tower.awards?.[uid]||{}))if(value===true&&!id.startsWith('tower-')&&getTitle(tower,id))ids.add(id);return [...ids];}
 const api={keys,names,floors,catalog,damage,replay,unlocked,dayIndex,usedToday,validTitle,getTitle,titleBonuses,validStats,totalDamage,critical,hitDamage};if(typeof module!=='undefined')module.exports=api;else root.MoonTowerCore=api;
})(typeof window!=='undefined'?window:globalThis);
