/* Evidence-based milestones. Rewards are permanent; equipment bonuses are bounded. */
(function(root){'use strict';
 const keys=['observation','persistence','cooperation','knowledge','creativity','vitality'];
 const titles=[
  ['first','첫 의뢰의 주인공','completed',1,'persistence',1,'과제 1개 완료'],
  ['scholar','룬 해독가','correct',3,'knowledge',2,'학습 퀴즈 3개 정답'],
  ['writer','이야기 직조자','creative',3,'creativity',2,'글쓰기·독서 과제 3개 제출'],
  ['trusted','신뢰받는 기사','reviewed',3,'persistence',2,'과제 3개 교사 확인'],
  ['explorer','경계 너머의 탐험가','places',5,'observation',2,'서로 다른 장소 5곳 방문'],
  ['walker','바람을 걷는 자','walk',100,'vitality',2,'서로 다른 길 100칸 이동'],
  ['steady','꺼지지 않는 불씨','streak',3,'persistence',2,'3일 연속 출석'],
  ['regular','마을의 수호자','attendance',7,'vitality',2,'누적 7일 출석'],
  ['guardian','숲의 길잡이','forest',3,'observation',2,'숲 수호자 도전 3일 완료'],
  ['voice','마음을 잇는 사절','polls',3,'cooperation',2,'학급 투표 3개 참여']
 ].map(([id,name,metric,target,stat,bonus,condition])=>({id,name,metric,target,stat,bonus,condition}));
 const items=[
  ['compass','초심자의 나침반','🧭','completed',1,'observation',1,'과제 1개 완료'],
  ['crystal','지혜의 수정','💎','correct',3,'knowledge',2,'학습 퀴즈 3개 정답'],
  ['quill','상상의 깃펜','🪶','creative',3,'creativity',2,'글쓰기·독서 과제 3개 제출'],
  ['badge','신뢰의 문장','🏅','reviewed',3,'cooperation',2,'과제 3개 교사 확인'],
  ['boots','여행자의 장화','🥾','places',3,'vitality',1,'서로 다른 장소 3곳 방문'],
  ['map','별길 지도','🗺️','walk',100,'observation',2,'서로 다른 길 100칸 이동'],
  ['shield','인내의 방패','🛡️','streak',3,'persistence',2,'3일 연속 출석'],
  ['stone','태양의 심장석','☀️','attendance',7,'vitality',2,'누적 7일 출석'],
  ['lantern','수호자의 등불','🏮','forest',1,'knowledge',1,'숲 수호자 도전 1일 완료'],
  ['pendant','인연의 펜던트','🔗','completed',10,'cooperation',2,'과제 10개 완료']
 ].map(([id,name,icon,metric,target,stat,bonus,condition])=>({id,name,icon,metric,target,stat,bonus,condition}));
 function streak(days){let best=0,run=0,last=0;for(const day of [...new Set(days)].sort()){const t=Date.parse(day+'T00:00:00Z');if(!Number.isFinite(t))continue;run=t-last===86400000?run+1:1;best=Math.max(best,run);last=t;}return best;}
 function evidence(person={},submissions={},activities=[],name=''){
  const m={completed:0,correct:0,creative:0,reviewed:0,polls:0,places:Object.keys(person.journey?.places||{}).length,walk:0,streak:streak(Object.keys(person.attendance||{})),attendance:Object.keys(person.attendance||{}).length,forest:Object.values(person.exploration?.days||{}).filter(d=>d.done).length};
  for(const days of Object.values(person.journey?.walk||{}))m.walk+=Math.min(200,Object.keys(days||{}).length);
  for(const [id,people] of Object.entries(submissions)){const r=people?.[name];if(!r)continue;const a=activities.find(a=>id===a.id||id.startsWith(a.id+'@'));if(r.correct!==false)m.completed++;if(r.correct===true)m.correct++;if(r.reviewed&&r.correct!==false)m.reviewed++;if(a&&['text','reading'].includes(a.kind))m.creative++;if(a?.kind==='poll')m.polls++;}
  return m;
 }
 function earned(catalog,m){return catalog.filter(t=>(m[t.metric]||0)>=t.target).map(t=>t.id);}
 function growth(m){return {observation:Math.min(3,Math.floor(m.places/3)+Math.floor(m.walk/200)),persistence:Math.min(3,Math.floor(m.completed/5)+Math.floor(m.streak/3)),cooperation:Math.min(3,Math.floor(m.reviewed/3)+Math.floor(m.polls/3)),knowledge:0,creativity:0,vitality:Math.min(2,Math.floor(m.walk/150))};}
 function bonuses(record={}){const b=Object.fromEntries(keys.map(k=>[k,0]));const t=titles.find(t=>t.id===record.title&&record.titles?.includes(t.id));if(t)b[t.stat]+=t.bonus;for(const id of [...new Set(record.equipment||[])].slice(0,2)){const i=items.find(i=>i.id===id&&record.items?.includes(id));if(i)b[i.stat]+=i.bonus;}return b;}
 const api={keys,titles,items,streak,evidence,earned,growth,bonuses};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.MoonJourneyCore=api;
})(typeof window!=='undefined'?window:globalThis);
