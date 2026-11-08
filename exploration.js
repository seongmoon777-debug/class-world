/* Personal exploration progress uses the existing campus transaction and save keys. */
(() => {
 'use strict';
 const MAP='moonforest',stats=['observation','persistence','cooperation'];
 const nodes=[
  {id:'coin1',x:7,y:11,icon:'🪙',name:'문코인 주머니'},
  {id:'obs1',x:4,y:9,stat:0,icon:'🔍',name:'발견의 조각'},
  {id:'per1',x:8,y:7,stat:1,icon:'🌱',name:'끈기의 씨앗'},
  {id:'coop1',x:15,y:10,stat:2,icon:'⭐',name:'우정의 별'},
  {id:'coin2',x:18,y:7,icon:'🪙',name:'문코인 주머니'},
  {id:'obs2',x:5,y:5,stat:0,icon:'🔍',name:'발견의 조각'},
  {id:'per2',x:15,y:5,stat:1,icon:'🌱',name:'끈기의 씨앗'},
  {id:'coop2',x:8,y:3,stat:2,icon:'⭐',name:'우정의 별'},
  {id:'bonus',x:19,y:3,icon:'🎁',name:'별빛 보물상자',level:2}
 ];
 const record=p=>p.exploration||{shards:{},days:{}};
 const today=p=>record(p).days?.[schoolToday()]||{picked:[],step:0,done:false};
 const xp=()=>Math.max(0,Number(state.xp[actorName()])||0);
 const level=()=>1+Math.floor(xp()/100);
 const oldStats=campusStats;campusStats=function(name=actorName()){const s=oldStats(name),r=record(campusPerson(name));for(const k of stats)s[k]+=Math.min(5,Math.floor((Number(r.shards?.[k])||0)/3));return s;};
 function transact(change){return campusTransaction((p,s,name)=>{p.exploration||={shards:{},days:{}};p.exploration.shards||={};p.exploration.days||={};const d=p.exploration.days[schoolToday()]||={picked:[],step:0,done:false};return change(p,s,name,d);});}
 const distance=n=>Math.hypot(player.x-n.x,player.y-n.y);
 const guardian={x:11,y:3};
 function collect(id){if(window.MoonLearning&&!MoonLearning.require('숲 탐험'))return {error:'오늘의 학습을 먼저 마쳐 주세요.'};
  const n=nodes.find(n=>n.id===id);if(!n||currentMap!==MAP||distance(n)>1.2)return {error:'수집물 가까이 다가가 주세요.'};
  if(level()<(n.level||1))return {error:'레벨 2가 되면 열 수 있어요.'};
  return transact((p,s,name,d)=>{if(d.picked.includes(id))return {error:'오늘 이미 주웠어요.'};d.picked.push(id);
   const coins=n.stat===undefined?(id==='bonus'?10:5):0;s.coins[name]=(Number(s.coins[name])||0)+coins;s.xp[name]=(Number(s.xp[name])||0)+10;
   if(n.stat!==undefined){const k=stats[n.stat];p.exploration.shards[k]=(Number(p.exploration.shards[k])||0)+1;}
   return {message:n.name+' 획득! '+(coins?coins+' MC · ':'')+'10 XP'+(n.stat!==undefined?' · 조각 3개마다 능력치 +1':'')};
  });
 }
 function answer(){if(window.MoonLearning&&!MoonLearning.require('숲 탐험'))return {error:'오늘의 학습을 먼저 마쳐 주세요.'};if(currentMap!==MAP||distance(guardian)>1.5)return {error:'숲의 안내자에게 다가가 주세요.'};return transact((p,s,name,d)=>{if(d.done)return {error:'오늘의 수집 도전을 마쳤어요.'};if(d.picked.length<3)return {error:'수집물 3개를 먼저 찾아 주세요.'};d.done=true;d.step=3;s.xp[name]=(Number(s.xp[name])||0)+40;s.coins[name]=(Number(s.coins[name])||0)+20;if(!p.decor.includes('lamp'))p.decor.push('lamp');return {message:'수집 도전 완료! 20 MC · 40 XP'};});}

 maps[MAP]={name:'잃어버린 도서관 숲',icon:'🌲',desc:'수집하고 성장하는 개인 탐험',spawn:[11,12]};portals[MAP]=[{x:11,y:13,to:'plaza',label:'광장'}];
 const oldSolid=solid;solid=function(x,y){return currentMap===MAP?x<1||x>21||y<2||y>13.3:oldSolid(x,y);};
 const oldWorld=worldBase;worldBase=function(){if(currentMap!==MAP)return oldWorld();ctx.save();rect(0,0,MW*TILE,MH*TILE,'#245d56');
  rounded(2*TILE,2*TILE,18*TILE,11*TILE,45,'#4b8971');rounded(9.7*TILE,3*TILE,2.6*TILE,10*TILE,24,'#d5c99e');rounded(4*TILE,6*TILE,15*TILE,1.4*TILE,22,'#c2bc8c');
  for(let i=0;i<22;i++){const x=(i%11)*2*TILE+TILE,y=i<11?1.2*TILE:14*TILE;txt('🌲',x,y,48);}
  const d=today(campusPerson());for(const n of nodes){if(d.picked.includes(n.id))continue;ctx.fillStyle='#183e453e';ctx.beginPath();ctx.ellipse((n.x+.5)*TILE,(n.y+.7)*TILE,23,9,0,0,Math.PI*2);ctx.fill();txt(level()<(n.level||1)?'🔒':n.icon,(n.x+.5)*TILE,(n.y+.5)*TILE,32);}
  rounded(9.5*TILE,2*TILE,3*TILE,1.6*TILE,18,'#253c68');txt(d.done?'🌟':'🦊',11.5*TILE,3.2*TILE,48);txt('숲의 안내자',11.5*TILE,2.25*TILE,15,'#fff4cd');
  rounded(9.5*TILE,12.8*TILE,3*TILE,28,8,'#294b49');txt('광장으로',11*TILE,13.22*TILE,13,'#fff6df');ctx.restore();};
 const dialog=document.createElement('dialog');dialog.id='forestDialog';dialog.setAttribute('aria-label','도서관 숲 탐험');document.body.append(dialog);
 function show(message=''){if(window.MoonLearning&&!MoonLearning.require('숲 탐험'))return;pressed.clear();dialog.replaceChildren();cw09Button(dialog,'닫기',()=>dialog.close());cw09El('h2','','🌲 도서관 숲 탐험',dialog);const d=today(campusPerson());cw09El('p','',`Lv.${level()} · ${xp()%100}/100 XP · 오늘 수집 ${d.picked.length}/${nodes.length}`,dialog);
  if(message)cw09El('p','',message,dialog).setAttribute('role','status');
  if(currentMap!==MAP){cw09El('p','','숲에서 수집물 3개를 모아 북쪽 안내자에게 전해 주세요.',dialog);cw09Button(dialog,'탐험 시작',()=>{if($('#role').value!=='student'){show('학생 모드에서 탐험할 수 있어요.');return;}goMap(MAP);if(currentMap===MAP){schoolPanelOpen(false);dialog.close();}else show('교실 안에서는 아래쪽 문으로 먼저 나가 주세요.');});}
  else if(distance(guardian)<=1.5){if(d.done)cw09El('p','','오늘 수집 도전 완료 ✓',dialog);else if(d.picked.length<3)cw09El('p','','수집물 3개를 먼저 찾아 주세요.',dialog);else cw09Button(dialog,'수집 보고하기',()=>{const r=answer();show(r.error||r.message);});}
  else cw09El('p','','수집물 옆에서 E 또는 줍기. 안내자는 숲 북쪽에 있어요.',dialog);
  cw09El('p','forestNote','하루 1회씩 개인별 획득 · 조각 3개 = 능력치 +1(성장 최대 +5). 현재 기기에 저장됩니다.',dialog);
  if(!dialog.open)dialog.showModal();
  document.dispatchEvent(new CustomEvent('forest-menu',{detail:dialog}));
 }
 const button=cw09Button(document.querySelector('.gameTop'),'🌲 탐험',()=>show());button.className='actionBtn';
 const oldInteract=interact;interact=function(){if(currentMap!==MAP)return oldInteract();if(nearby())return oldInteract();const n=nodes.find(n=>!today(campusPerson()).picked.includes(n.id)&&distance(n)<=1.2);if(n){const r=collect(n.id);doorMessage(r.error||r.message);return;}show();};
 const oldRefresh=cw09RefreshStage;cw09RefreshStage=function(){oldRefresh();if(currentMap===MAP){cw09StageBtn.textContent='탐험 기록';cw09StageBtn.onclick=()=>show();}};
 const badge=document.createElement('span');badge.className='forestLevel';document.querySelector('.moonGrowth summary').before(badge);
 function refresh(){badge.textContent=`Lv.${level()} · ${xp()%100}/100 XP`;document.querySelector('.moonGrowth summary').append(badge);document.querySelectorAll('.moonStat meter').forEach(m=>m.max=8);const note=document.querySelector('.moonGrowthBody p');if(note)note.textContent='기본 1 + 도구 2 + 수집 성장 최대 5. 조각 3개마다 +1, 능력치 3부터 수호자 기술 사용. 이 기기에 저장됩니다.';}
 const oldCoin=updateCoin;updateCoin=function(...args){const r=oldCoin(...args);refresh();return r;};document.addEventListener('change',refresh);document.querySelector('.moonGrowth').addEventListener('toggle',refresh);refresh();
 const style=document.createElement('style');style.textContent='#forestDialog{width:min(440px,88vw);max-height:80vh;overflow:auto;border:2px solid #47856b;border-radius:18px;background:#fffbed;color:#254c43;padding:20px}#forestDialog::backdrop{background:#142b4366}#forestDialog button{display:block;margin:10px 0;padding:10px 14px;border-radius:10px}#forestDialog p{line-height:1.6}.forestNote{font-size:12px;color:#53685b}.forestLevel{float:right;font-weight:800;color:#235585;padding:3px 0}';document.head.append(style);
 window.MoonForest={collect,answer,level,nodes,show};
 style.textContent+='#interact[data-forest-label]{font-size:0}#interact[data-forest-label]::after{content:attr(data-forest-label);font-size:13px}';
 setInterval(()=>{const b=document.querySelector('#interact');if(currentMap===MAP){b.dataset.forestLabel=nearby()?'광장으로 E':'줍기 / 도전 E';b.setAttribute('aria-label',b.dataset.forestLabel);}else if(b.hasAttribute('data-forest-label')){delete b.dataset.forestLabel;b.removeAttribute('aria-label');}},250);
})();
