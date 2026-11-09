/* Readable bottom-right campus map; existing movement and save data are untouched. */
(()=>{'use strict';
const shell=document.querySelector('.v05MiniWrap'),stage=$('#stage');if(!shell||!stage)return;
const oldDetails=shell.closest('details');stage.append(shell);if(oldDetails&&oldDetails.children.length===1)oldDetails.remove();
cw08MiniCollapsed=false;shell.classList.remove('cw08Folded');
function toggle(){shell.classList.toggle('cw08Folded',cw08MiniCollapsed);miniToggle.textContent=cw08MiniCollapsed?'지도':'−';miniToggle.setAttribute('aria-label',cw08MiniCollapsed?'미니맵 펼치기':'미니맵 접기');miniToggle.setAttribute('aria-expanded',String(!cw08MiniCollapsed));stage.classList.toggle('readableMiniOpen',!cw08MiniCollapsed);}
miniToggle.onclick=()=>{cw08MiniCollapsed=!cw08MiniCollapsed;toggle();};toggle();
const names={classroom:'교실',library:'도서관',gym:'체육관',lab:'배움터',salon:'미용실',outfit:'옷가게',accessory:'소품집',neighborhood:'우리 동네'};
const cv=$('#v05Mini');cv.width=600;cv.height=570;cv.setAttribute('role','img');cv.setAttribute('aria-label','학교 지도: 건물 이름과 내 위치');
cw05MiniDraw=function(){if(cw08MiniCollapsed)return;const g=cv.getContext('2d');g.save();g.setTransform(3,0,0,3,0,0);g.clearRect(0,0,200,190);g.fillStyle='#f4f8ef';g.fillRect(0,0,200,190);
const cx=100,cy=93,scale=3.15;g.fillStyle='#c6e1c4';g.beginPath();g.arc(cx,cy,77,0,Math.PI*2);g.fill();g.strokeStyle='#fff9e8';g.lineWidth=10;g.beginPath();g.arc(cx,cy,56,0,Math.PI*2);g.stroke();
g.fillStyle='#428fa6';g.beginPath();g.arc(cx,cy,9,0,Math.PI*2);g.fill();
g.textAlign='center';g.textBaseline='middle';
for(const p of portals.plaza){if(!names[p.to])continue;const x=cx+(p.x-31)*scale,y=cy+(p.y-29)*scale,active=currentMap===p.to;
g.fillStyle=active?'#b34d19':'#345e4d';g.beginPath();g.arc(x,y,4,0,Math.PI*2);g.fill();
const label=names[p.to],ly=y+(p.y>=29?13:-13);g.font='800 13px sans-serif';const w=g.measureText(label).width+10;g.fillStyle=active?'#fff0d2':'#ffffff';g.strokeStyle=active?'#bb6b2d':'#91b29b';g.lineWidth=1;g.beginPath();g.roundRect(x-w/2,ly-10,w,20,5);g.fill();g.stroke();g.fillStyle='#153b2b';g.fillText(label,x,ly);}
const spot=currentMap==='plaza'?player:portals.plaza.find(p=>p.to===currentMap);
if(spot){const x=cx+(spot.x-31)*scale,y=cy+(spot.y-29)*scale;g.fillStyle='#fff';g.beginPath();g.arc(x,y,6,0,Math.PI*2);g.fill();g.fillStyle='#d73935';g.beginPath();g.arc(x,y,4,0,Math.PI*2);g.fill();}
g.fillStyle='#203f35';g.font='700 11px sans-serif';g.fillText(spot?'● 내 위치':'현재: '+(maps[currentMap]?.name||'탐험'),100,181,188);g.restore();
};
const style=cw09El('style');style.textContent=`
.v05MiniWrap{display:block!important;position:absolute!important;left:auto!important;right:10px!important;top:auto!important;bottom:10px!important;padding:5px!important;max-width:none!important;border:2px solid #365e4d!important;border-radius:12px!important;background:#f4f8ef!important;z-index:7!important;pointer-events:none!important;box-shadow:0 3px 12px #17352633!important}
.v05MiniWrap .v05MiniLabel,.v05MiniWrap .v05Legend{display:none!important}
.v05MiniWrap #v05Mini{display:block;width:200px!important;height:190px!important;border-radius:7px!important;border:0!important;pointer-events:none}
.v05MiniWrap .cw08MiniToggle{pointer-events:auto!important;top:4px!important;right:4px!important;width:28px!important;height:28px!important;font-size:20px!important;line-height:24px!important;border-radius:8px!important;background:#214d3c!important;color:#fff!important;border:1px solid #fff!important;padding:0!important}
.v05MiniWrap.cw08Folded{width:46px!important;height:38px!important;padding:0!important}.v05MiniWrap.cw08Folded #v05Mini{display:none!important}.v05MiniWrap.cw08Folded .cw08MiniToggle{inset:0!important;width:46px!important;height:38px!important;font-size:12px!important}
#stage.readableMiniOpen #interact{bottom:220px!important;right:10px!important;min-height:38px!important;height:auto!important;font-size:13px!important}
@media(max-width:600px){.v05MiniWrap{right:8px!important;bottom:8px!important;padding:4px!important}.v05MiniWrap #v05Mini{width:184px!important;height:175px!important}.v05MiniWrap .cw08MiniToggle{width:32px!important;height:32px!important}#stage.readableMiniOpen #interact{bottom:202px!important;right:8px!important}}
`;document.head.append(style);cw05MiniDraw(performance.now());
})();