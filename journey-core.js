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
 const extra=[
 ['monocle','새벽의 외눈안경','observation','places',6],['owl-eye','올빼미의 눈','observation','places',7],['star-glass','별빛 망원경','observation','walk',300],['seeker-key','숨은 문의 열쇠','observation','walk',600],['north-star','북극성 조각','observation','forest',7],['oracle','예언자의 수정안','observation','forest',14],
 ['candle','새벽의 촛불','persistence','completed',20],['anchor','흔들리지 않는 닻','persistence','completed',30],['knot','약속의 매듭','persistence','attendance',14],['ember','영원의 불씨','persistence','streak',7],['clock','모래시계의 심장','persistence','streak',14],['seed','천년나무의 씨앗','persistence','streak',21],['iron-heart','강철의 심장','persistence','completed',50],
 ['silver-bell','은빛 우정의 종','cooperation','reviewed',7],['red-thread','인연의 붉은 실','cooperation','reviewed',14],['friend-ring','동료의 반지','cooperation','reviewed',21],['bridge-charm','무지개 다리 부적','cooperation','polls',7],['twin-moon','쌍둥이 달의 목걸이','cooperation','polls',14],['banner','용기의 깃발','cooperation','completed',40],
 ['rune-book','고대 룬의 서','knowledge','correct',7],['rune-lens','현자의 룬 렌즈','knowledge','correct',14],['ink-stone','기억을 새기는 벼루','knowledge','correct',21],['memory-orb','기억의 구슬','knowledge','correct',30],['astrolabe','별을 읽는 천문구','knowledge','correct',50],['scholar-key','진리의 황금 열쇠','knowledge','forest',7],['wisdom-crown','현자의 작은 왕관','knowledge','completed',60],
 ['pigment','무지개 안료','creativity','creative',7],['mask','꿈꾸는 가면','creativity','creative',14],['dream-brush','꿈을 그리는 붓','creativity','creative',21],['prism','일곱 빛 프리즘','creativity','creative',30],['star-ink','별가루 잉크병','creativity','creative',40],['muse-harp','뮤즈의 작은 하프','creativity','creative',50],['dream-catcher','달빛 꿈그물','creativity','attendance',21],['palette','아침노을 팔레트','creativity','forest',14],
 ['dew','생명의 이슬병','vitality','walk',300],['sun-leaf','햇살나무 잎사귀','vitality','walk',600],['wind-horn','질풍의 뿔피리','vitality','attendance',14],['spring-water','정령샘의 물병','vitality','attendance',21],['phoenix-token','불사조의 깃털','vitality','attendance',30],['thunder-shard','천둥의 심장 조각','vitality','streak',10]
 ];
 const conditions={places:'서로 다른 장소 {n}곳 방문',walk:'서로 다른 길 {n}칸 이동',forest:'숲 수호자 도전 {n}일 완료',completed:'과제 {n}개 완료',attendance:'누적 {n}일 출석',streak:'{n}일 연속 출석',reviewed:'과제 {n}개 교사 확인',polls:'학급 투표 {n}개 참여',correct:'학습 퀴즈 {n}개 정답',creative:'글쓰기·독서 과제 {n}개 제출'};
 for(const [index,[id,name,stat,metric,target]] of extra.entries())items.push({id,name,icon:'✦',metric,target,stat,bonus:index%5===4?3:index%3===0?1:2,condition:conditions[metric].replace('{n}',target)});
 const treasureIds=new Set(['north-star','oracle','seed','iron-heart','twin-moon','astrolabe','wisdom-crown','star-ink','dream-catcher','phoenix-token']);
 for(const item of items){item.rarity=item.bonus===3?'영웅':item.bonus===2?'희귀':'일반';item.source=treasureIds.has(item.id)?'treasure':'activity';if(item.source==='treasure')item.condition='탐험 유물';}
 function streak(days){let best=0,run=0,last=0;for(const day of [...new Set(days)].sort()){const t=Date.parse(day+'T00:00:00Z');if(!Number.isFinite(t))continue;run=t-last===86400000?run+1:1;best=Math.max(best,run);last=t;}return best;}
 function evidence(person={},submissions={},activities=[],name=''){
  const m={completed:0,correct:0,creative:0,reviewed:0,polls:0,places:Object.keys(person.journey?.places||{}).length,walk:0,streak:streak(Object.keys(person.attendance||{})),attendance:Object.keys(person.attendance||{}).length,forest:Object.values(person.exploration?.days||{}).filter(d=>d.done).length};
  for(const days of Object.values(person.journey?.walk||{}))m.walk+=Math.min(200,Object.keys(days||{}).length);
  for(const [id,people] of Object.entries(submissions)){const r=people?.[name];if(!r)continue;const a=activities.find(a=>id===a.id||id.startsWith(a.id+'@'));if(r.correct!==false)m.completed++;if(r.correct===true)m.correct++;if(r.reviewed&&r.correct!==false)m.reviewed++;if(a&&['text','reading'].includes(a.kind))m.creative++;if(a?.kind==='poll')m.polls++;}
  return m;
 }
 function earned(catalog,m){return catalog.filter(t=>t.source!=='treasure'&&(m[t.metric]||0)>=t.target).map(t=>t.id);}
 function growth(m){return {observation:Math.min(3,Math.floor(m.places/3)+Math.floor(m.walk/200)),persistence:Math.min(3,Math.floor(m.completed/5)+Math.floor(m.streak/3)),cooperation:Math.min(3,Math.floor(m.reviewed/3)+Math.floor(m.polls/3)),knowledge:0,creativity:0,vitality:Math.min(2,Math.floor(m.walk/150))};}
 function bonuses(record={}){const b=Object.fromEntries(keys.map(k=>[k,0]));const t=titles.find(t=>t.id===record.title&&record.titles?.includes(t.id));if(t)b[t.stat]+=t.bonus;for(const id of [...new Set(record.equipment||[])].slice(0,2)){const i=items.find(i=>i.id===id&&record.items?.includes(id));if(i)b[i.stat]+=i.bonus;}return b;}
 const api={keys,titles,items,streak,evidence,earned,growth,bonuses};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.MoonJourneyCore=api;
})(typeof window!=='undefined'?window:globalThis);
