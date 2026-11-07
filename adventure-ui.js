/* Presentation only: retain activity IDs, reward transactions and saved records. */
(() => {
 'use strict';
 const stats={observation:['감지','🔭','관찰력 · 숨은 단서를 찾아요'],persistence:['인내','🛡️','끈기 · 포기하지 않고 도전해요'],cooperation:['유대','🔗','협력 · 친구와 힘을 모아요'],knowledge:['지능','📖','지식 · 퀴즈로 배움을 쌓아요'],creativity:['영감','✨','창의력 · 읽고 쓰며 상상해요'],vitality:['체력','⚡','활력 · 출석과 운동으로 성장해요']};
 for(const [key,[name]] of Object.entries(stats))CAMPUS_STATS[key]=name;
 for(const item of CAMPUS_GEAR){item.desc=item.desc.replace('관찰력','감지').replace('끈기','인내').replace('협력','유대');}
 const baseGrowth=MoonGrowth.render;
 function decorateGrowth(){
  const cards=document.querySelectorAll('.growthChip');
  Object.entries(campusStats()).forEach(([key,value],i)=>{
   const card=cards[i];if(!card)return;const [name,icon,hint]=stats[key];
   card.replaceChildren();card.title=hint;card.setAttribute('aria-label',`${name} ${value} · ${hint}`);
   cw09El('span','statIcon',icon,card);const body=cw09El('span','statBody','',card);
   cw09El('span','statName',name,body);const meter=cw09El('meter','statMeter','',body);meter.min=0;meter.max=8;meter.value=value;meter.setAttribute('aria-label',name);
   cw09El('strong','',String(value).padStart(2,'0'),card);
  });
  const heading=document.querySelector('.growthHeading strong');if(heading)heading.textContent='Lv. '+MoonForest.level();
 }
 const growthUpdate=updateCoin;updateCoin=function(...args){const r=growthUpdate(...args);decorateGrowth();return r;};
 MoonGrowth.render=function(){baseGrowth();decorateGrowth();};
 const statGuide=cw09El('details','statGuide','',document.querySelector('.growthDashboard'));
 cw09El('summary','','능력치 안내',statGuide);for(const [, [name,,hint]] of Object.entries(stats))cw09El('p','',name+' — '+hint,statGuide);
 // Rendering replaces dashboard children, so restore the guide after each refresh.
 const paintGrowth=decorateGrowth;decorateGrowth=function(){paintGrowth();document.querySelector('.growthDashboard').append(statGuide);};

 const tabs=document.querySelector('.tabs');
 tabs.querySelector('[data-tab="classroom"]')?.remove();tabs.querySelector('[data-tab="mission"]')?.remove();
 cw09Tab.textContent='📚 배움터';dailyTab.textContent='🎯 오늘의 모험';campusTab.textContent='🏡 내 공간';
 tabs.append(cw09Tab,dailyTab,campusTab);
 let learningView='activities';
 function learningNav(panel){
  panel.querySelector('.learningNav')?.remove();const nav=cw09El('nav','learningNav');nav.setAttribute('aria-label','배움터');
  for(const [id,label] of [['activities','활동 게시판'],['classroom','우리 교실']]){const b=cw09Button(nav,label,()=>switchTab(id),learningView===id?'selected':'');b.setAttribute('aria-pressed',String(learningView===id));}
  panel.prepend(nav);
 }
 const baseActivities=cw09Render;cw09Render=function(...args){const r=baseActivities(...args);learningNav(cw09Panel);return r;};
 const baseClass=cw06RenderClassroomPanel;cw06RenderClassroomPanel=function(...args){const r=baseClass(...args);learningNav(document.querySelector('#classroom'));return r;};
 const baseDaily=dailyRender;dailyRender=function(){baseDaily();dailyCard.querySelector('h2').textContent='오늘의 모험';
  const sub=cw09El('p','adventureSubtitle','출석하고, 도전하고, 보상을 모아요.');dailyCard.querySelector('h2').after(sub);
  const quest=cw09El('div','questRow','',dailyCard);cw09El('span','','🌲 퀴즈 탐험',quest);cw09El('strong','',campusPerson().dailyQuiz?.[schoolToday()]?'완료 ✓':'10 MC',quest);
  cw09Button(dailyCard,'💌 출석 기록·선생님 답장',()=>campusOpen('life'));
 };
 const baseSwitch=switchTab;switchTab=function(id){
  if(id==='mission'||id==='dailyWelcome'){
   dailyRender();renderMission();baseSwitch('dailyWelcome');
   document.querySelector('#mission').classList.add('active');dailyTab.classList.add('active');
  }else if(id==='activities'||id==='classroom'){
   learningView=id;baseSwitch(id);if(id==='activities')cw09Render();else cw06RenderClassroomPanel();cw09Tab.classList.add('active');
  }else baseSwitch(id);
  document.querySelector('.sideTitle strong').textContent=id==='campus'?'나만의 작은 아지트':id==='activities'||id==='classroom'?'배우며 성장하는 모험':'오늘의 모험 일지';
  document.querySelector('.sideTitle .tiny').textContent='MOONSCHOOL · v0.18.0';
 };
 cw09Tab.onclick=()=>switchTab(learningView);dailyTab.onclick=()=>switchTab('dailyWelcome');
 const baseCampusRender=campusRender;
 campusRender=function(){
  if(!campusPanel.classList.contains('active'))return;
  if(campusView==='hub'){
   campusPanel.replaceChildren();cw09El('span','eyebrow','MY HIDEOUT',campusPanel);cw09El('h2','','내 공간',campusPanel);
   const preview=cw09El('canvas','hideoutPortrait','',campusPanel);preview.width=144;preview.height=180;drawPreview(preview,currentAvatar());
   cw09El('p','adventureSubtitle','내 모습과 내 집을 꾸미는 곳',campusPanel);
   const actions=cw09El('div','hideoutActions','',campusPanel);
   for(const [icon,title,desc,action] of [['🎒','캐릭터 꾸미기','가진 옷과 소품 착용',()=>MoonGrowth.showBag()],['🏡','내 집 꾸미기','집 이름 · 외벽 · 마당 장식',()=>{campusOwner=actorName();campusPlace=null;campusOpen('home');}],['🛍️','상점','새 옷과 장식 둘러보기',()=>campusOpen('shop')]]){
    const b=cw09Button(actions,'',action,'hideoutAction');cw09El('span','actionIcon',icon,b);const text=cw09El('span','','',b);cw09El('strong','',title,text);cw09El('small','',desc,text);cw09El('span','','›',b);
   }
   cw09Button(campusPanel,'지도에서 내 집 찾기',homeVisitMine);return;
  }
  baseCampusRender();campusPanel.querySelector('.campusNav')?.remove();
  const back=cw09Button(campusPanel,campusView==='life'?'← 오늘의 모험':'← 내 공간',()=>campusView==='life'?switchTab('dailyWelcome'):campusOpen('hub'),'hideoutBack');campusPanel.prepend(back);
 };
 const baseCampusOpen=campusOpen;campusOpen=function(view='hub'){return baseCampusOpen(view);};campusTab.onclick=()=>campusOpen();
 const baseBadge=campusUpdateBadge;campusUpdateBadge=function(){baseBadge();campusTab.textContent='🏡 내 공간';};
 const style=cw09El('style');style.textContent=`
 .growthDashboard{background:#192f42;color:#edf7ee;padding:12px 16px;border-bottom:3px solid #c5a65e}.growthHeading strong{color:#ffe1a0;font-size:19px}.growthHeading progress{accent-color:#9bd9b1;flex:1;max-width:220px}.growthHeading>span{color:#bacfcf;font-size:11px}.growthSix{gap:7px}.growthChip{display:flex;align-items:center;background:#243f50;border:1px solid #45626a;color:#e8f2e7;padding:9px;border-radius:10px}.growthChip strong{color:#ffe1a0;font-size:17px;font-variant-numeric:tabular-nums}.statIcon{font-size:19px}.statBody{display:flex;flex:1;flex-direction:column;gap:4px;min-width:0}.statName{font-size:12px;font-weight:700}.statMeter{width:100%;height:6px}.statGuide{margin-top:8px;font-size:11px;color:#bfd1d3}.statGuide summary{cursor:pointer}.statGuide p{margin:6px 0}
 .tabs{display:flex!important;gap:5px;padding:8px!important;background:#edf1eb!important}.tabs button{min-height:44px;flex:1!important;font-size:13px!important;border-radius:10px!important;color:#53645c!important;background:transparent!important}.tabs button.active{background:#244b46!important;color:#fff4d4!important;box-shadow:0 2px 0 #183a36!important}.sideTitle{background:#24433f!important;padding:13px 16px!important}.sideTitle .tiny{font-size:10px;opacity:.7}.sideTitle strong{font-size:14px}.side .panel{padding:18px!important}.side .panel h2{font-size:21px;letter-spacing:-.5px;margin:8px 0 14px}.learningNav{display:flex;gap:6px;padding:5px;background:#e7ede5;border-radius:12px;margin-bottom:18px}.learningNav button{flex:1;min-height:40px;border:0;border-radius:8px;background:transparent;color:#516557}.learningNav button.selected{background:#fffdf3;color:#254c42;box-shadow:0 2px 5px #26432b18;font-weight:700}.adventureSubtitle{color:#617168;font-size:13px;line-height:1.6}.questRow{display:flex;justify-content:space-between;align-items:center;background:#edf2e7;border:1px solid #d3decb;padding:15px;border-radius:12px;margin:14px 0}.questRow strong{color:#84601a}.dailyRow{padding:13px;background:#fff7df;border-radius:12px}.dailyWelcome{border:0!important;border-bottom:1px solid #dce3d7!important;border-radius:0!important;background:#fffdf5!important}#mission.active{border-top:1px solid #dce3d7}.eyebrow{font-size:10px;font-weight:bold;letter-spacing:2px;color:#7d8e7d}.hideoutPortrait{display:block;margin:0 auto;width:108px;height:135px;background:#e8eee2;border-radius:50% 50% 18px 18px}.hideoutActions{display:grid;gap:10px;margin:18px 0}.hideoutAction{width:100%;display:flex;align-items:center;text-align:left;gap:13px;padding:17px!important;background:#fffdf6!important;border:1px solid #d3ddcf!important;border-radius:14px!important;color:#294e43!important;box-shadow:0 3px 0 #e0e7db}.hideoutAction>span:nth-child(2){flex:1}.hideoutAction strong,.hideoutAction small{display:block}.hideoutAction small{margin-top:5px;font-size:12px;font-weight:400;color:#738070}.actionIcon{font-size:26px}.hideoutBack{background:transparent!important;border:0!important;color:#517461!important;padding:4px 0!important;margin-bottom:12px}.hideoutAction:hover{border-color:#6a987f!important;transform:translateY(-1px)}button:focus-visible,summary:focus-visible{outline:3px solid #ca9d3f!important;outline-offset:3px}
 @media(max-width:650px){.growthSix{grid-template-columns:repeat(3,minmax(0,1fr))}.growthChip{gap:6px;padding:8px}.growthDashboard{padding:10px}.tabs button{font-size:12px!important}.side .panel{padding:14px!important}.growthHeading{flex-wrap:wrap}.statIcon{font-size:17px}}
 `;document.head.append(style);
 dailyRender();MoonGrowth.render();switchTab('activities');document.title='문스쿨 | 작은 모험, 매일의 성장';
})();
