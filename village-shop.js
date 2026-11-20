/* One physical shop entrance, preserving old room identifiers and student saves. */
(()=>{'use strict';
const aliases=new Set(['salon','outfit','accessory']);
maps.outfit.name='반짝 상점';maps.outfit.icon='🛍️';
const entrance=portals.plaza.find(p=>p.to==='outfit');if(entrance)entrance.label='반짝 상점';
const previousGo=goMap;
goMap=function(id){
 if(!aliases.has(id))return previousGo(id);
 if(currentMap!=='plaza')return previousGo('outfit');
 if(!MoonLearning.require('상점'))return false;
 if(nearby()?.to!=='outfit'){doorApproach('outfit');return false;}
 MoonMarket.open();return true;
};
const oldQuick=renderQuick;renderQuick=function(){oldQuick();const keys=Object.keys(maps),buttons=[...$('#quick').children];for(let i=0;i<keys.length;i++){if(['salon','accessory'].includes(keys[i]))buttons[i]?.remove();else if(keys[i]==='outfit'&&buttons[i])buttons[i].textContent='🛍️ 반짝 상점';}};renderQuick();
// Jua's rounded, heavier Korean strokes are for signs; the UI retains Gowun Dodum.
const link=document.createElement('link');link.rel='stylesheet';link.href='https://fonts.googleapis.com/css2?family=Jua&display=swap';document.head.append(link);
window.MoonSignReady=new Promise(resolve=>{link.onerror=()=>resolve(false);link.onload=async()=>{try{const faces=await document.fonts.load('28px Jua');if(!faces.length){resolve(false);return;}MoonCity.redraw();resolve(true);}catch{resolve(false);}};});
})();
/* Stable village plots; purchases share the existing atomic coin/save transaction. */
(()=>{'use strict';
const tiers=[null,{name:'포근 초가집',cost:500,roof:'#c4a14e',wall:'#f2deaf'},{name:'숲속 나무집',cost:800,roof:'#538575',wall:'#c69666'},{name:'꽃담 벽돌집',cost:1200,roof:'#b85752',wall:'#f1c3aa'},{name:'달빛 이층집',cost:2000,roof:'#686ca8',wall:'#e8e1fb'}];
const oldSolid=solid,plots=[];let seed=39017,selected=null;
const rand=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);
function roadDistance(x,y){let best=Infinity;for(const road of MoonCity.roads)for(let i=1;i<road.length;i++){const [a,b]=road[i-1],[c,d]=road[i],dx=c-a,dy=d-b,t=Math.max(0,Math.min(1,((x-a)*dx+(y-b)*dy)/(dx*dx+dy*dy||1)));best=Math.min(best,Math.hypot(x-a-t*dx,y-b-t*dy));}return best;}
// Fixed seed and geometry make plot IDs stable across reloads and devices.
const before=currentMap;currentMap='plaza';
for(let i=0;i<15000&&plots.length<30;i++){const x=Math.round(7+rand()*66),y=Math.round(9+rand()*53);if(plots.some(p=>Math.hypot(x-p.x,y-p.y)<6)||roadDistance(x,y)<3.4||roadDistance(x,y)>8)continue;if(portals.plaza.some(p=>Math.hypot(x-p.x,y-p.y)<6))continue;let clear=true;for(let a=-2;a<=2;a+=.5)for(let b=-3;b<=2;b+=.5)if(oldSolid(x+a,y+b))clear=false;if(clear)plots.push({id:'village-'+plots.length,x,y});}
currentMap=before;
const decorated=p=>!!(p.houseName||p.wallColor||p.roof||p.decor?.length||Object.keys(p.layout||{}).length);
let legacyNames=[];try{const key='moonschool-housing-legacy-v1',saved=localStorage.getItem(key);legacyNames=saved?JSON.parse(saved):Object.keys(campusData.students).filter(n=>decorated(campusData.students[n]));if(!saved)localStorage.setItem(key,JSON.stringify(legacyNames));}catch{legacyNames=[];}
const legacy=(p,n=actorName())=>!p.homestead&&legacyNames.includes(n)&&decorated(p);
const ownerOf=(id,data=campusData)=>window.MoonSharedHomes?.active()?MoonSharedHomes.ownerOf(id):Object.keys(data.students).find(n=>data.students[n].homestead?.plot===id);
function buy(id){return campusTransaction((p,s,n,data)=>{if(!plots.some(l=>l.id===id))return {error:'집터를 다시 골라 주세요.'};if(p.homestead)return {error:'이미 내 집이 있어요.'};if(ownerOf(id,data))return {error:'이미 분양된 집터예요.'};const price=legacy(p)?0:500;if((Number(s.coins[n])||0)<price)return {error:'집을 사려면 500 MC가 필요해요.'};s.coins[n]=(Number(s.coins[n])||0)-price;p.homestead={plot:id,level:1,boughtAt:Date.now(),legacy:price===0};return {message:price?'초가집이 생겼어요! 공터도 꾸며 보세요.':'기존 집과 장식을 새 집터로 옮겼어요.'};});}
function upgrade(expected){return campusTransaction((p,s,n)=>{const h=p.homestead;if(!h||h.level!==expected||!tiers[h.level+1])return {error:'현재 집 단계를 다시 확인해 주세요.'};const t=tiers[h.level+1];if((Number(s.coins[n])||0)<t.cost)return {error:'문코인이 부족해요.'};s.coins[n]-=t.cost;h.level++;return {message:t.name+'으로 업그레이드했어요!'};});}
function open(id){selected=id;campusOwner=ownerOf(id)||actorName();campusOpen('home');schoolPanelOpen(true);}
const priorHome=campusRenderHome;
campusRenderHome=function(teacher){const owner=campusOwner||actorName(),p=campusPerson(owner),h=p.homestead,mine=owner===actorName()&&!teacher;const box=cw09El('div','cw09Form','',campusPanel);cw09El('h3','',h?'🏡 '+tiers[h.level].name:'🌱 마을 집터 분양',box);cw09El('p','cw09Info',(window.MoonSharedHomes?.status()||'집 공유 연결을 확인하고 있어요.'),box);
if(!h){cw09El('p','',legacy(p)?'기존 집과 장식은 무료로 새 집터에 옮길 수 있어요.':'500 MC로 초가집과 꾸미기 공터를 마련해요.',box);const choice=cw09Field(box,'빈 집터 고르기','select');for(const [i,l] of plots.entries())if(!ownerOf(l.id)){const o=cw09El('option','',(i+1)+'번 집터',choice);o.value=l.id;}if(selected&&!ownerOf(selected))choice.value=selected;const b=cw09Button(box,legacy(p)?'기존 집 옮기기':'초가집 구입 · 500 MC',()=>{const result=buy(choice.value);selected=choice.value;campusOwner=actorName();campusAct(result);});b.disabled=!mine||!choice.value||(!legacy(p)&&coinsOf(actorName())<500);if(!legacy(p))return;
}else{const t=tiers[h.level+1];if(mine&&t){const level=h.level;const b=cw09Button(box,t.name+'으로 · '+t.cost+' MC',()=>campusAct(upgrade(level)));b.disabled=coinsOf(actorName())<t.cost;}else if(!t)cw09El('p','','최고 단계의 집이에요 ✨',box);cw09El('p','','초가집 → 나무집 → 벽돌집 → 이층집',box);}
priorHome(teacher);const text=[...campusPanel.querySelectorAll('p')].find(e=>e.textContent.startsWith('각 학생에게 집 1채'));if(text)text.textContent='공터 24칸에 보유한 장식을 배치할 수 있어요.';const house=campusPanel.querySelector('.campusHouse');if(h&&house){house.textContent=tiers[h.level].name;house.style.borderTopColor=tiers[h.level].roof;}
};
homeVisitMine=function(){campusOwner=actorName();selected=campusPerson().homestead?.plot||null;campusOpen('home');schoolPanelOpen(true);};renderQuick();
const previousInteract=interact;interact=function(){if(currentMap==='plaza'){const l=plots.find(p=>Math.hypot(player.x-p.x,player.y-(p.y+1.3))<1.9);if(l){open(l.id);return;}}return previousInteract();};
solid=function(x,y){if(oldSolid(x,y))return true;return currentMap==='plaza'&&plots.some(l=>ownerOf(l.id)&&Math.abs(x-l.x)<1.35&&y>l.y-1.7&&y<l.y+.1);};
const previousWorld=worldBase;worldBase=function(){previousWorld();if(currentMap!=='plaza')return;ctx.save();for(const [i,l] of plots.entries()){const owner=ownerOf(l.id),p=owner?campusPerson(owner):null,h=p?.homestead,t=h?tiers[h.level]:null,x=l.x*TILE,y=l.y*TILE;rounded(x-86,y-95,172,159,15,'#d3cd9b');ctx.strokeStyle='#b2a678';ctx.lineWidth=2;ctx.setLineDash([8,7]);ctx.strokeRect(x-78,y-87,156,143);ctx.setLineDash([]);
if(t){ctx.fillStyle='rgba(43,55,43,.18)';ctx.beginPath();ctx.ellipse(x,y+8,65,16,0,0,Math.PI*2);ctx.fill();const height=h.level===4?100:62;rounded(x-52,y-height,104,height,5,p.wallColor||t.wall);ctx.fillStyle=t.roof;ctx.beginPath();ctx.moveTo(x-67,y-height+4);ctx.quadraticCurveTo(x-45,y-height-40,x,y-height-47);ctx.quadraticCurveTo(x+45,y-height-40,x+67,y-height+4);ctx.closePath();ctx.fill();if(h.level===1){ctx.strokeStyle='#e8cd81';for(let j=-48;j<=48;j+=12){ctx.beginPath();ctx.moveTo(x+j*.6,y-height-29);ctx.lineTo(x+j,y-height+1);ctx.stroke();}}rounded(x-12,y-34,24,34,5,'#75513d');rounded(x-39,y-45,19,22,3,'#a9e2e5');rounded(x+20,y-45,19,22,3,'#a9e2e5');if(h.level===4){rounded(x-32,y-84,23,23,3,'#a9e2e5');rounded(x+10,y-84,23,23,3,'#a9e2e5');}for(const [id,cell] of Object.entries(p.layout||{})){const item=CAMPUS_DECOR.find(a=>a.id===id&&!a.roof);if(item)txt(item.icon,x-65+(cell%6)*26,y+25+Math.floor(cell/6)*9,16,'#3f5143');}}
else{txt('🌱',x,y-33,28,'#426945');rounded(x-61,y-14,122,34,6,'#fff9df');txt('집터 '+(i+1)+' · 500 MC',x,y+7,13,'#465847');}
if(t){rounded(x-74,y+45,148,25,5,'#fff8e3');txt((p.houseName||owner)+(owner===actorName()?' · 내 집':''),x,y+63,13,'#3b5042');}if(Math.hypot(player.x-l.x,player.y-l.y-1.3)<1.9)txt('E · '+(t?'집 꾸미기':'집터 보기'),x,y+91,16,'#284837');}ctx.restore();};
window.MoonHousing={plots,tiers,buy,upgrade,open,legacy,ownerOf,version:'0.39.0'};
})();

