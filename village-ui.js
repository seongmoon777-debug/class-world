/* A consistent village toolbar, compact quest journal and decorative town scenery. */
(() => {
 'use strict';
 const top=document.querySelector('.gameTop'),toolbar=cw09El('nav','villageToolbar');toolbar.setAttribute('aria-label','마을 메뉴');
 const buttons=[...top.querySelectorAll(':scope > button')];
 for(const b of buttons){
  if(b===panelToggle){b.textContent='가방';b.title='내 가방 열기';}
  else if(b.textContent.includes('친구 레벨'))b.textContent='친구 레벨';
  else if(b.textContent.includes('탐험'))b.textContent='숲 탐험';
  else b.textContent='배움터';
  toolbar.append(b);
 }
 const more=top.querySelector('.campusMore');if(more){more.querySelector('summary').textContent='☰';more.querySelector('summary').setAttribute('aria-label','더 보기');toolbar.append(more);}top.append(toolbar);
 const oldPanel=schoolPanelOpen;schoolPanelOpen=function(...args){const result=oldPanel(...args);panelToggle.textContent='가방';panelToggle.setAttribute('aria-label','빠른 가방 열기');panelToggle.removeAttribute('aria-expanded');return result;};
 function quest(parent,icon,title,reward,done,action,label){
  const card=cw09El('article','villageQuest'+(done?' isDone':''),'',parent);cw09El('span','questIcon',icon,card);
  const copy=cw09El('div','questCopy','',card);cw09El('h3','',title,copy);cw09El('small','',done?'오늘 완료':reward,copy);
  if(action){const b=cw09Button(card,done?'완료 ✓':label,action,'questAction');b.disabled=done;}
  return card;
 }
 const oldDaily=dailyRender;dailyRender=function(){
  oldDaily();const row=dailyCard.querySelector('.dailyRow'),feedback=dailyCard.querySelector('.dailyFeedback');
  dailyCard.replaceChildren();cw09El('span','journalKicker','DAILY QUEST',dailyCard);cw09El('h2','','오늘의 모험 일지',dailyCard);
  const day=schoolToday(),person=campusPerson(),attended=!!person.attendance?.[day],quizDone=!!person.dailyQuiz?.[day];
  const progress=cw09El('div','journalProgress','',dailyCard);cw09El('span','',`${schoolToday().slice(5).replace('-','.')} · 오늘의 도장`,progress);cw09El('strong','',`${Number(attended)+Number(quizDone)} / 2`,progress);
  const list=cw09El('div','journalList','',dailyCard);
  const attendance=quest(list,'☀','마을 출석','+5 MC',attended,null);
  if(row){row.classList.add('villageAttendance');attendance.append(row);}
  quest(list,'🌲','숲속 퀴즈','+10 MC',quizDone,()=>MoonForest.show(),'떠나기');
  if(feedback)dailyCard.append(feedback);
  const foot=cw09El('div','journalFooter','',dailyCard);cw09Button(foot,'출석 기록 · 선생님 답장',()=>campusOpen('life'),'journalLink');
 };
 document.querySelector('#mission').before(dailyCard);
 const oldMission=renderMission;renderMission=function(){
  if($('#role').value==='teacher'||currentMap==='moonforest')return oldMission();
  const panel=document.querySelector('#mission');panel.replaceChildren();cw09El('span','journalKicker','VILLAGE BOARD',panel);cw09El('h2','','마을 의뢰 게시판',panel);
  const list=cw09El('div','journalList','',panel);
  quest(list,'📚','배움터 의뢰','읽고, 쓰고, 함께 배우기',false,()=>{CW09.filter='all';CW09.selected=null;switchTab('activities');},'살펴보기');
  quest(list,'🧭','도서관 숲 탐험','조각 수집 · 수호자 도전',false,()=>MoonForest.show(),'탐험하기');
 };
 const style=cw09El('style');style.textContent=`
 body,button,select,input,textarea{font-family:'Malgun Gothic','Segoe UI',sans-serif!important}
 .gameTop{display:block!important;background:#24483e!important;padding:9px 12px!important;border-bottom:2px solid #bfa36a}.gameTop .zone{display:flex;align-items:center;gap:7px;margin-bottom:8px;font-size:14px!important;min-height:22px}.villageToolbar{display:grid;grid-template-columns:repeat(4,minmax(0,1fr)) 36px;gap:6px;align-items:stretch}.villageToolbar>button,.villageToolbar>.campusMore>summary{position:static!important;inset:auto!important;transform:none!important;box-sizing:border-box;display:flex!important;align-items:center;justify-content:center;min-width:0!important;width:100%;height:36px!important;min-height:36px!important;margin:0!important;padding:0 4px!important;white-space:nowrap;font-size:11px!important;font-weight:700!important;line-height:1!important;border:1px solid #a8bda5!important;border-radius:8px!important;background:#f5f3e6!important;color:#294b3e!important;box-shadow:none!important}.villageToolbar>button:hover{background:#e2eacb!important;border-color:#e7c377!important}.villageToolbar>.campusMore{height:36px}.villageToolbar>.campusMore>summary{font-size:17px!important;background:#31584b!important;color:#f5eacb!important}.villageToolbar .campusMoreItems{top:42px}.sideTitle strong{font-size:12px}.tabs button{font-size:11px!important}.journalKicker{display:block;letter-spacing:1.8px;font-size:9px;color:#8c7e5b;font-weight:700}.side #dailyWelcome h2,.side #mission h2{font-size:19px;margin:5px 0 14px}.journalProgress{display:flex;justify-content:space-between;align-items:center;padding:10px 12px;margin-bottom:12px;border-radius:8px;background:#e7ecdb;font-size:11px;color:#526951}.journalProgress strong{font-size:14px;color:#2b5747}.journalList{display:grid;gap:9px}.villageQuest{display:grid;grid-template-columns:29px minmax(0,1fr) auto;gap:8px;align-items:center;border:1px solid #d7dcca;background:#fffdf3;border-radius:11px;padding:12px 10px;box-shadow:0 2px 0 #e5e6d5}.questIcon{font-size:22px;text-align:center;color:#b98a32}.questCopy{min-width:0}.questCopy h3{font-size:12px;margin:0 0 5px!important;color:#2c4f40;line-height:1.4}.questCopy small{display:block;font-size:10px;color:#8b794d;line-height:1.5}.villageQuest button.questAction,.villageAttendance button{margin:0!important;border:1px solid #b6c6a7!important;border-radius:7px!important;background:#e8efdd!important;color:#36583c!important;padding:7px 9px!important;min-height:32px!important;font-size:10px!important;box-shadow:none!important;white-space:nowrap}.villageQuest.isDone{background:#eff2e4}.villageQuest.isDone button{opacity:.7}.villageAttendance{grid-column:2/-1;display:grid!important;grid-template-columns:minmax(0,1fr) auto;gap:7px;padding:0!important;background:none!important}.villageAttendance select{width:100%;max-width:none!important;min-width:0;font-size:11px;min-height:32px!important;padding:5px;border:1px solid #d2dac7;border-radius:7px;background:#fffef7}.journalFooter{margin-top:12px}.journalLink{width:100%;padding:8px!important;border:0!important;background:none!important;color:#69816b!important;font-size:10px!important;text-align:left}.dailyWelcome .dailyFeedback{font-size:11px;color:#446950}#mission.active{border-top:1px dashed #c6ceb9}.side .panel{background:#f9f7e9}.brand .eyebrow{font-size:9px;letter-spacing:1px}.brand h1{font-size:18px}
 @media(max-width:850px){.gameTop{padding:8px!important}.villageToolbar{gap:5px;grid-template-columns:repeat(4,minmax(0,1fr)) 32px}.villageToolbar>button{font-size:10px!important}.villageToolbar>button,.villageToolbar>.campusMore>summary{height:34px!important;min-height:34px!important}.villageToolbar>.campusMore{height:34px}.side .panel{padding:14px!important}}
 @media(min-width:851px){.stage{height:calc(100dvh - 370px)!important}}
 `;document.head.append(style);
 const header=document.querySelector('.brand h1');if(header)header.textContent='MOONSCHOOL 모험마을';
 maps.plaza.name='달빛 모험마을';if(currentMap==='plaza')$('#mapName').textContent=maps.plaza.name;
 dailyRender();if(targetTab==='mission'||targetTab==='dailyWelcome')renderMission();
 // Scenery is drawn off the main roads; collision/portal coordinates remain unchanged.
 const oldWorld=worldBase;let scenery=null;
 function makeScenery(){
  const c=document.createElement('canvas');c.width=62*TILE;c.height=58*TILE;const g=c.getContext('2d');
  const circle=(x,y,r,color)=>{g.fillStyle=color;g.beginPath();g.arc(x,y,r,0,Math.PI*2);g.fill();};
  function tree(x,y,size=1){g.save();g.translate(x,y);g.scale(size,size);g.fillStyle='#294b3c25';g.beginPath();g.ellipse(6,9,26,10,0,0,Math.PI*2);g.fill();g.fillStyle='#896642';g.fillRect(-5,-29,10,38);circle(-12,-36,19,'#367957');circle(12,-39,21,'#438762');circle(0,-57,24,'#589669');circle(-7,-63,10,'#6ca575');g.restore();}
  const cx=31,cy=29,ps=portals.plaza.filter(p=>p.to!=='neighborhood');
  function clear(x,y){const r=Math.hypot(x-cx,y-cy);if(r<5||Math.abs(r-18)<2.5||portals.plaza.some(p=>Math.hypot(x-p.x,y-p.y)<5.5))return false;
   for(const p of ps){const dx=p.x-cx,dy=p.y-cy,t=Math.max(0,Math.min(1,((x-cx)*dx+(y-cy)*dy)/(dx*dx+dy*dy)));if(Math.hypot(x-cx-t*dx,y-cy-t*dy)<2)return false;}return true;}
  let count=0;
  for(let y=5;y<55;y+=3)for(let x=4;x<59;x+=3){const n=(x*73+y*41)%101,px=(x+.25)*TILE,py=(y+.3)*TILE;if(!clear(x,y))continue;if(n<48){tree(px,py,.8+(n%4)*.13);count++;}else if(n<75){g.fillStyle='#5e965b';g.beginPath();g.ellipse(px,py,22,9,0,0,Math.PI*2);g.fill();for(let j=0;j<5;j++){const a=j*2.4;circle(px+Math.cos(a)*15,py+Math.sin(a)*6-5,3,['#f0c86c','#f3cfcd','#e8e9b4'][n%3]);}count++;}}
  // Small stone edging, lamp posts and benches around the central meeting square.
  for(let i=0;i<36;i++){const a=i*Math.PI/18;g.save();g.translate((cx+3.3*Math.cos(a))*TILE,(cy+3.3*Math.sin(a))*TILE);g.rotate(a);g.fillStyle=i%2?'#ded5ba':'#f2e9ce';g.fillRect(-7,-5,14,10);g.restore();}
  for(const [x,y] of [[27,24],[35,24],[27,34],[35,34]]){const px=x*TILE,py=y*TILE;g.fillStyle='#314f43';g.fillRect(px-3,py-45,6,48);circle(px,py-48,13,'#fff0ad44');g.fillStyle='#f3d789';g.fillRect(px-7,py-57,14,17);g.fillStyle='#385c49';g.fillRect(px-10,py-60,20,5);}
  for(const [x,y] of [[25,28],[36,28]]){g.fillStyle='#6b5036';g.fillRect(x*TILE,y*TILE,44,12);g.fillRect(x*TILE+4,y*TILE+11,4,12);g.fillRect(x*TILE+36,y*TILE+11,4,12);g.fillStyle='#af8657';g.fillRect(x*TILE-2,y*TILE-10,48,8);}
  let stalls=0,lastStall=-8;
  for(let i=0;i<24&&stalls<5;i++){if(i-lastStall<4)continue;const a=i*Math.PI/12+.12,x=cx+8*Math.cos(a),y=cy+8*Math.sin(a);if(!clear(x,y))continue;stalls++;lastStall=i;const px=x*TILE,py=y*TILE;
   g.fillStyle='#30493622';g.beginPath();g.ellipse(px,py+8,39,12,0,0,Math.PI*2);g.fill();g.fillStyle='#765637';g.fillRect(px-27,py-12,54,26);g.fillRect(px-28,py-52,4,52);g.fillRect(px+24,py-52,4,52);
   const color=['#c48769','#7b9e8a','#a197b6','#c7ac64','#7c9dab'][stalls-1];g.fillStyle=color;g.beginPath();g.moveTo(px-36,py-40);g.lineTo(px-27,py-61);g.lineTo(px+27,py-61);g.lineTo(px+36,py-40);g.closePath();g.fill();
   for(let j=0;j<5;j++){g.fillStyle=j%2?'#f4e5bc':color;g.fillRect(px-35+j*14,py-40,14,8);}g.fillStyle='#bb9563';g.fillRect(px-30,py-14,60,6);
   for(let j=0;j<4;j++){circle(px-19+j*12,py-22,5,['#f1c46a','#cd8d75','#8ca86e'][j%3]);}tree(px+43,py+8,.55);
  }
  // Bunting gives each destination a recognisable village entrance.
  for(const p of ps){const x=(p.x+.5)*TILE,y=(p.y+.7)*TILE;g.strokeStyle='#6f6249';g.lineWidth=2;g.beginPath();g.moveTo(x-62,y-94);g.quadraticCurveTo(x,y-70,x+62,y-94);g.stroke();for(let i=0;i<7;i++){const xx=x-54+i*18,yy=y-89+9*Math.sin(i*Math.PI/6);g.fillStyle=['#d99c73','#e6c579','#75a691'][i%3];g.beginPath();g.moveTo(xx,yy);g.lineTo(xx+12,yy+1);g.lineTo(xx+6,yy+15);g.fill();}}
  window.MoonVillage={decorations:count};return c;
 }
 worldBase=function(){oldWorld();if(currentMap!=='plaza')return;if(!scenery)scenery=makeScenery();ctx.drawImage(scenery,0,0);};
 window.dispatchEvent(new Event('resize'));
})();
