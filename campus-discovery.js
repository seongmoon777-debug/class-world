/* Calm campus UI and personal, date-stable rare discoveries. */
(() => {
 'use strict';
 const forest='moonforest';
 const hash=text=>{let h=2166136261;for(const c of text)h=Math.imul(h^c.charCodeAt(0),16777619);h^=h>>>16;return h>>>0;};
 function candidates(day=schoolToday(),name=actorName()){
  const found=[];for(let i=0;i<3;i++){const h=hash(day+'|'+name+'|plaza-v1|'+i);if(h%100<15)found.push({id:'spark-'+i,stat:i,x:0,y:0,icon:['🔍','🌱','⭐'][i]});}return found;
 }
 let signature='',spots=[];
 function discoveries(){if(window.MoonLearning&&!MoonLearning.complete())return [];if(currentMap!=='plaza')return [];const sig=schoolToday()+'|'+actorName();if(sig!==signature){signature=sig;const clear=[];for(let y=4;y<=12;y++)for(let x=3;x<=20;x++)if(!solid(x,y)&&!solid(x+.4,y+.4)&&!(portals.plaza||[]).some(p=>Math.hypot(x-p.x,y-p.y)<2))clear.push({x,y});spots=candidates().map((n,i)=>({...n,...clear[hash(sig+n.id)%Math.max(1,clear.length)]})).filter(n=>n.x&&n.y);}
  const picked=campusPerson().plazaFinds?.[schoolToday()]||[];return spots.filter(n=>!picked.includes(n.id));
 }
 function collect(id){if(window.MoonLearning&&!MoonLearning.require('탐험'))return {error:'오늘의 학습을 먼저 마쳐 주세요.'};if(currentMap!=='plaza')return {error:'광장에서 찾아 주세요.'};const n=discoveries().find(n=>n.id===id);if(!n||Math.hypot(n.x-player.x,n.y-player.y)>1.2)return {error:'반짝이는 수집물 가까이 다가가 주세요.'};
  return campusTransaction((p,s,name)=>{const picked=(p.plazaFinds||={})[schoolToday()]||=[];if(picked.includes(id))return {error:'이미 주운 수집물이에요.'};picked.push(id);p.exploration||={shards:{},days:{}};p.exploration.shards||={};const k=['observation','persistence','cooperation'][n.stat];p.exploration.shards[k]=(Number(p.exploration.shards[k])||0)+1;s.coins[name]=(Number(s.coins[name])||0)+3;s.xp[name]=(Number(s.xp[name])||0)+5;return {message:'희귀 발견! 조각 +1 · 3 MC · 5 XP'};});
 }
 const oldWorld=worldBase;worldBase=function(){oldWorld();if(currentMap!=='plaza')return;ctx.save();for(const n of discoveries()){const x=(n.x+.5)*TILE,y=(n.y+.5)*TILE;ctx.fillStyle='#fff5a766';ctx.beginPath();ctx.arc(x,y-6,22,0,Math.PI*2);ctx.fill();txt(n.icon,x,y,28);txt('✦',x+21,y-18,16,'#fff8c6');}ctx.restore();};
 const oldInteract=interact;interact=function(){if(currentMap==='plaza'&&!nearby()){const n=discoveries().find(n=>Math.hypot(n.x-player.x,n.y-player.y)<=1.2);if(n){const r=collect(n.id);doorMessage(r.error||r.message);return;}}return oldInteract();};
 // Quiz records and reward IDs stay intact when their play location changes.
 const oldLoad=cw09Load;cw09Load=function(){const d=oldLoad();const homes=new Map(schoolSeeds.filter(a=>a.kind==='quiz').map(a=>[a.id,a.place]));d.items=d.items.map(a=>a.kind==='quiz'?{...a,place:homes.get(a.id)||(a.place===forest?'classroom':a.place),title:a.title.replace(/퀴즈/g,'생각 확인')}:a.id==='ms094_reading'?{...a,daily:true}:a);return d;};cw09Data=cw09Load();
 const oldLabel=cw09PlaceLabel;cw09PlaceLabel=function(id){return id===forest?'도서관 숲':oldLabel(id);};
 dailyRender=function(){const attended=!!campusPerson().attendance?.[schoolToday()],teacher=$('#role').value!=='student';dailySignature=actorName()+'|'+schoolToday();dailyCard.replaceChildren();cw09El('h2','','☀️ 오늘의 출석',dailyCard);const row=cw09El('div','dailyRow','',dailyCard),mood=cw09El('select','','',row);mood.setAttribute('aria-label','출석 기분');for(const text of ['😐 보통이에요','😊 즐거워요','😌 편안해요','😟 걱정돼요','😴 피곤해요'])cw09El('option','',text,mood);mood.disabled=teacher||attended;const b=cw09Button(row,attended?'출석 완료 ✓':'출석하기 · 5 MC',()=>{const r=campusAttendance(mood.value,'');dailyFeedback=r.error||r.message;dailyRender();});b.disabled=teacher||attended;if(dailyFeedback)cw09El('p','dailyFeedback',dailyFeedback,dailyCard);cw09Button(dailyCard,'🌲 퀴즈 탐험으로',()=>MoonForest.show());};dailyTab.textContent='☀️ 출석';dailyRender();
 const oldMission=renderMission;renderMission=function(){if($('#role').value==='teacher'||currentMap===forest)return oldMission();const panel=document.querySelector('#mission');if(!panel)return;panel.replaceChildren();cw09El('h2','','퀴즈 탐험',panel);cw09Button(panel,'🌲 도서관 숲으로',()=>MoonForest.show());};
 // Secondary controls stay available in a compact menu.
 const top=document.querySelector('.gameTop'),more=cw09El('details','campusMore','',top);cw09El('summary','','☰ 메뉴',more);const options=cw09El('div','campusMoreItems','',more);
 for(const b of [runButton,classroomEntry,document.querySelector('.gameTop button')]){if(b===runButton||b===classroomEntry)options.append(b);}
 const online=[...top.querySelectorAll(':scope > button')].find(b=>b.textContent.includes('온라인 학급'));if(online)options.append(online);
 options.addEventListener('click',e=>{if(e.target.closest('button'))more.open=false;});document.addEventListener('pointerdown',e=>{if(!more.contains(e.target))more.open=false;});
 const style=cw09El('style');style.textContent=`
 .gameTop{position:relative;flex-wrap:wrap;padding:10px 14px!important;gap:7px!important}.gameTop .zone{flex:1;min-width:170px}.gameTop>button{background:#f6f5e9!important;color:#294f49!important;border:1px solid #cfdbd3!important;box-shadow:none!important;border-radius:10px!important;padding:8px 12px!important;font-size:12px!important}.campusMore{position:relative;color:#eef5ec;font-size:12px}.campusMore>summary{list-style:none;cursor:pointer;padding:10px;border:1px solid #ffffff55;border-radius:10px}.campusMoreItems{position:absolute;right:0;top:44px;z-index:50;min-width:180px;padding:9px;background:#fffbed;border:1px solid #b9ccbe;border-radius:12px;box-shadow:0 8px 24px #183d4933}.campusMoreItems button{display:block;position:static!important;transform:none!important;width:100%;margin:4px 0;padding:10px!important;font-size:13px!important;background:#edf4ef!important;color:#244b40!important;border:0!important;border-radius:8px!important}.moonGrowth{padding:4px 14px!important}.moonGrowth summary{font-size:0!important}.moonGrowth summary::before{content:'🌱 성장';font-size:12px}.moonGrowth .forestLevel{font-size:12px;float:right}.schoolHelp{margin:0}.v05MiniWrap{display:none!important}.forestQuizzes{margin-top:16px;border-top:1px solid #d5ddcb;padding-top:12px}.forestQuizzes summary{cursor:pointer;font-weight:bold}.brand .tagline{display:none}
 @media(max-width:600px){.gameTop .zone{flex-basis:100%;font-size:14px!important}.gameTop>button{flex:1;min-width:0;padding:8px 6px!important}.campusMore>summary{padding:9px 8px}.gameTop{gap:6px!important}.moonGrowthBody{max-width:100%}.headerControls{gap:5px}header{padding:10px 14px!important}}
 `;document.head.append(style);
 window.CampusDiscovery={candidates,discoveries,collect};
 style.textContent+='.plazaFindReady #interact{font-size:0}.plazaFindReady #interact::after{content:"발견 줍기 E";font-size:13px}';
 setInterval(()=>{const ready=currentMap==='plaza'&&!nearby()&&discoveries().some(n=>Math.hypot(n.x-player.x,n.y-player.y)<=1.2);document.querySelector('#stage').classList.toggle('plazaFindReady',ready);},250);
})();
