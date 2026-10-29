/* All visible building navigation meets at a physical doorway. No student writes. */
'use strict';
const schoolIndoor=new Set(['classroom','library','gym','lab','salon','outfit','accessory']);
const doorBaseGo=goMap;
const doorNotice=cw09El('div','doorNotice');doorNotice.setAttribute('role','status');doorNotice.hidden=true;$('#stage').append(doorNotice);let doorNoticeTimer;
function doorMessage(text){doorNotice.textContent=text;doorNotice.hidden=false;clearTimeout(doorNoticeTimer);doorNoticeTimer=setTimeout(()=>{doorNotice.hidden=true;},2300);}
// The threshold is on the rendered bottom door, not in the middle of the aisle.
for(const id of schoolIndoor)portals[id]=[{x:10.55,y:12.65,to:'plaza',label:'광장'}];
nearby=function(){return (portals[currentMap]||[]).find(p=>Math.abs(p.x-player.x)<=.55&&Math.abs(p.y-player.y)<=.5);};
function doorApproach(id){const p=portals.plaza.find(p=>p.to===id);if(!p)return false;player={x:p.x,y:p.y+.45};pressed.clear();CW05.moving=false;CW05.facing='up';cw05LastCamera={x:player.x*TILE,y:player.y*TILE};doorMessage('문 앞에서 E 또는 입장을 눌러요');return true;}
goMap=function(id){
 if(!maps[id]||id===currentMap)return false;
 const from=currentMap,at=nearby();
 if(schoolIndoor.has(from)){
  if(id!=='plaza'||!at||at.to!=='plaza'){doorMessage('아래쪽 문으로 나가 주세요');return false;}
  doorBaseGo('plaza');const p=portals.plaza.find(p=>p.to===from);if(p){player={x:p.x,y:p.y+1.25};CW05.facing='down';cw05LastCamera={x:player.x*TILE,y:player.y*TILE};}return true;
 }
 if(schoolIndoor.has(id)){
  if(from!=='plaza'){doorMessage('광장을 거쳐 문으로 입장해 주세요');return false;}
  if(!at||at.to!==id){doorApproach(id);return false;}
  doorBaseGo(id);doorNotice.hidden=true;clearTimeout(doorNoticeTimer);player={x:10.55,y:11.35};CW05.facing='up';cw05LastCamera=null;schoolPanelOpen(false);return true;
 }
 doorBaseGo(id);return true;
};
// Capture the old whole-building click handler. Only the door itself is clickable.
canvas.addEventListener('click',e=>{
 if(currentMap!=='plaza'&&!schoolIndoor.has(currentMap))return;
 if(currentMap==='plaza')e.stopImmediatePropagation();
 if(!cw05LastCamera||$('#creatorOverlay').classList.contains('open'))return;
 const r=canvas.getBoundingClientRect(),wx=(e.clientX-r.left-width/2)/CW05.zoom+cw05LastCamera.x,wy=(e.clientY-r.top-height/2)/CW05.zoom+cw05LastCamera.y;
 if(schoolIndoor.has(currentMap)){const d=portals[currentMap][0],dx=(d.x+.5)*TILE,dy=(d.y+.7)*TILE;if(Math.abs(wx-dx)<=55&&wy>=dy-8&&wy<=dy+80){e.stopImmediatePropagation();if(nearby())goMap('plaza');else doorMessage('출입문 가까이 다가가 주세요');}return;}
 const hit=portals.plaza.find(p=>Math.abs(wx-(p.x+.5)*TILE)<=22&&wy>=(p.y+.7)*TILE-43&&wy<=(p.y+.7)*TILE+5);
 if(hit){if(nearby()?.to===hit.to)goMap(hit.to);else doorMessage('문 가까이 다가가 주세요');}
},true);
const doorOldQuick=renderQuick;renderQuick=function(){doorOldQuick();for(const b of $('#quick').children){const id=Object.keys(maps)[Array.from($('#quick').children).indexOf(b)];if(schoolIndoor.has(id))b.textContent=maps[id].icon+' '+maps[id].name+' 입구';}};renderQuick();
const classroomEntry=cw09El('button','actionBtn','교실 입구');classroomEntry.type='button';classroomEntry.onclick=()=>{if(currentMap==='classroom'){schoolPanelOpen(false);return;}goMap('classroom');};$('.gameTop').append(classroomEntry);
const doorStyle=cw09El('style');doorStyle.textContent='.doorNotice{position:absolute;left:50%;bottom:76px;transform:translateX(-50%);max-width:85%;padding:8px 12px;border-radius:8px;background:#203749ed;color:white;font-size:13px;pointer-events:none;z-index:10}.doorNotice[hidden]{display:none}';document.head.append(doorStyle);
const doorHelp=document.querySelector('.schoolHelp p');if(doorHelp)doorHelp.textContent='교실 입구나 지도는 문 앞으로 안내해요. 문 가까이에서 E 또는 입장·나가기를 누르면 출입해요. 교실은 언제든 무료로 이용할 수 있는 별도 공간이에요. 방향키·WASD로 이동하고 Shift로 달려요.';
