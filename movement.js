/* Movement controls use existing state and never write student records. */
'use strict';
window.CW_MOVE={shift:false,toggle:false,get running(){return this.shift||this.toggle;}};
function schoolTyping(){return ['INPUT','TEXTAREA','SELECT'].includes(document.activeElement?.tagName)||document.activeElement?.isContentEditable;}
const runButton=cw09El('button','actionBtn','🏃 달리기 꺼짐');runButton.type='button';runButton.setAttribute('aria-pressed','false');runButton.setAttribute('aria-label','달리기 전환');
function schoolRunRefresh(){runButton.textContent=CW_MOVE.running?'🏃 달리기 켜짐':'🏃 달리기 꺼짐';runButton.setAttribute('aria-pressed',String(CW_MOVE.running));}
runButton.onclick=()=>{CW_MOVE.toggle=!CW_MOVE.toggle;schoolRunRefresh();};$('.gameTop').append(runButton);
document.addEventListener('keydown',e=>{if(schoolTyping()||$('#creatorOverlay').classList.contains('open'))return;if(e.key==='Shift'){CW_MOVE.shift=true;schoolRunRefresh();}if(e.key.toLowerCase()==='e'){e.preventDefault();e.stopImmediatePropagation();if(!e.repeat)interact();}},true);
document.addEventListener('keyup',e=>{if(e.key==='Shift'){CW_MOVE.shift=false;schoolRunRefresh();}});
function schoolStopMoving(){CW_MOVE.shift=false;CW_MOVE.toggle=false;pressed.clear();schoolRunRefresh();}
window.addEventListener('blur',schoolStopMoving);document.addEventListener('visibilitychange',()=>{if(document.hidden)schoolStopMoving();});
// The old two-tile radius included the room entry spawn. Exit only at the door.
const movementOldNearby=nearby;nearby=function(){if(currentMap==='plaza')return movementOldNearby();return (portals[currentMap]||[]).find(p=>Math.hypot(p.x-player.x,p.y-player.y)<=.65);};
const movementOldGo=goMap;goMap=function(id){movementOldGo(id);if(id!=='plaza'&&!['neighborhood','expedition'].includes(id)&&maps[id]){player.x=11;player.y=10.5;maps[id].spawn=[11,10.5];}pressed.clear();CW05.moving=false;};
// The existing button had captured an older interact function during startup.
$('#interact').addEventListener('click',e=>{e.stopImmediatePropagation();interact();},true);
const movementHelp=document.querySelector('.schoolHelp p');if(movementHelp)movementHelp.textContent='방향키·WASD 또는 화면 방향 버튼으로 이동해요. Shift를 누르며 이동하거나 달리기 버튼을 켜면 빨리 달려요. 실내에서는 아래쪽 문 앞까지 걸어간 뒤 E 또는 나가기를 눌러요. 활동은 활동 버튼에서 열어요.';
