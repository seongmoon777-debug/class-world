/* Original pixel artwork: articulated limbs, four directions and distinct run poses. */
'use strict';
const PIXEL_SCHOOL={cache:new Map()};
function schoolPixel(av,dir='down',frame=0,run=false){
 const gender=av.gender||'boy',key=JSON.stringify([av,dir,frame,run]);if(PIXEL_SCHOOL.cache.has(key))return PIXEL_SCHOOL.cache.get(key);
 const c=document.createElement('canvas');c.width=48;c.height=64;const g=c.getContext('2d');g.imageSmoothingEnabled=false;
 const edge='#252c36',skin='#f3c59d',shade='#ce9579',hair=hairColors[(av.hairColor||0)%hairColors.length],cloth=clothColors[(av.cloth||0)%clothColors.length],shoe=['#394053','#5c91c4','#bc6583','#54855d'][av.shoes||0],side=['left','right'].includes(dir),back=dir==='up';
 const R=(x,y,w,h,color)=>{g.fillStyle=color;g.fillRect(Math.round(x),Math.round(y),w,h);};
 const wave=Math.sin(frame/8*Math.PI*2),stride=run?8:4,lift=run?5:2,lean=run&&side?3:0;
 if(dir==='left'){g.translate(48,0);g.scale(-1,1);}
 function limb(x,y,kneeX,kneeY,endX,endY,color,width=5){g.lineCap='square';for(const [w,col] of [[width+2,edge],[width,color]]){g.strokeStyle=col;g.lineWidth=w;g.beginPath();g.moveTo(x,y);g.lineTo(kneeX,kneeY);g.lineTo(endX,endY);g.stroke();}}
 const hip=side?25:24,legY=46;
 for(const sign of [-1,1]){const swing=wave*sign,footX=hip+(side?swing*stride:sign*5+swing*2),footY=59-Math.max(0,swing)*lift;limb(hip+(side?sign*2:sign*4),legY,hip+(side?swing*stride*.6:sign*4),52-Math.max(0,swing)*2,footX,footY,'#555875',5);R(footX-3,footY-1,9,4,edge);R(footX-2,footY,7,2,shoe);R(footX-2,footY+2,8,1,'#f1e9d8');}
 // Rear arm, uniform and front arm swing in opposite directions to the legs.
 const shoulderY=35;limb(31,shoulderY,33+wave*stride*.6,42,32+wave*stride,run?39:47,skin,4);
 R(15+lean,32,18,17,edge);R(17+lean,33,14,13,cloth);R(17+lean,44,14,3,'#38475e');R(22+lean,33,3,9,'#fff0d1');R(23+lean,34,2,6,'#a87251');R(18+lean,35,2,7,'#ffffff55');
 limb(16+lean,shoulderY,14-wave*stride*.6,41,15-wave*stride,run?38:47,skin,4);R(12-wave*stride,run?36:45,5,4,skin);
 // Strong stepped silhouette and restrained face: no glossy illustration assets.
 const hx=lean,hy=0;R(11+hx,8+hy,26,22,edge);R(9+hx,12,30,14,edge);R(12+hx,10,24,20,skin);R(10+hx,16,3,8,shade);R(35+hx,16,3,8,shade);R(15+hx,29,18,2,shade);
 R(11+hx,8,26,8,hair);R(14+hx,5,20,5,edge);R(15+hx,6,18,5,hair);R(9+hx,11,5,11,hair);R(34+hx,11,5,11,hair);
 const h=av.hair||0;if(h===1){R(8+hx,7,8,6,edge);R(9+hx,8,7,4,hair);R(27+hx,3,8,5,hair);}if(h===2){R(6+hx,15,6,15,edge);R(7+hx,16,4,13,hair);R(37+hx,15,6,15,edge);R(38+hx,16,4,13,hair);}if(h===4||gender==='girl'&&h===0){R(10+hx,18,5,17,hair);R(34+hx,18,5,17,hair);}if(h===3){R(15+hx,5,19,5,hair);R(12+hx,8,6,7,hair);}else{R(15+hx,13,7,5,hair);R(25+hx,13,7,3,hair);}
 R(16+hx,8,14,2,'#ffffff24');
 if(back){R(12+hx,12,24,16,hair);R(16+hx,26,17,3,hair);}else{for(const ex of side?[29]:[18,29]){R(ex+hx-1,19,5,6,'#fff3dc');R(ex+hx+1,20,3,6,edge);R(ex+hx+1,20,1,2,'#fff');}R((side?31:23)+hx,28,3,1,'#865a55');}
 if(av.acc===1){R(33+hx,10,8,5,'#a94e69');R(35+hx,8,3,9,'#df8aa4');}if(av.acc===2&&!back){g.strokeStyle=edge;g.lineWidth=1;g.strokeRect(16+hx,18,9,9);if(!side)g.strokeRect(27+hx,18,9,9);}if(av.acc===3){R(10+hx,6,29,7,'#3d607f');R(8+hx,12,34,3,'#6798bb');}
 PIXEL_SCHOOL.cache.set(key,c);if(PIXEL_SCHOOL.cache.size>400)PIXEL_SCHOOL.cache.clear();return c;
}
sprite=function(x,y,av,step=0,small=false,dir='down',moving=false){const run=moving&&CW_MOVE.running&&!small,frame=moving?Math.floor(step*(run?1.55:1))%8:0,img=schoolPixel({...av,gender:av.gender||ms093Gender(av,small)},dir,frame,run),scale=small?1.1:1.65;ctx.save();ctx.imageSmoothingEnabled=false;ctx.fillStyle='#19293455';ctx.beginPath();ctx.ellipse(x,y+3,small?14:21,5,0,0,Math.PI*2);ctx.fill();if(!small){ctx.shadowColor='#fff3b7';ctx.shadowBlur=7;}ctx.drawImage(img,Math.round(x-24*scale),Math.round(y-63*scale),48*scale,64*scale);ctx.restore();};
function schoolPixelPreview(c,av){const g=c.getContext('2d');g.clearRect(0,0,c.width,c.height);g.fillStyle='#e9eddc';g.fillRect(0,0,c.width,c.height);g.imageSmoothingEnabled=false;const scale=Math.min(c.width/58,c.height/70);g.drawImage(schoolPixel({...av,gender:av.gender||ms093Gender(av,false)}),Math.round((c.width-48*scale)/2),Math.round(c.height-65*scale),48*scale,64*scale);}
drawPreview=schoolPixelPreview;campusDrawPreview=schoolPixelPreview;
// A compact world-first layout. Activities open when chosen, instructions stay tucked away.
const presentationStyle=cw09El('style');presentationStyle.textContent=`
body:not(.cwUiOpen) .layout{grid-template-columns:minmax(0,1fr)}body:not(.cwUiOpen) .side .panel{display:none!important}body:not(.cwUiOpen) .sideTitle{display:none}.sideTitle .tiny,#avatarSummary,.footnote,.brand .tiny{display:none!important}.side{min-width:0}.gameTop{padding:8px 12px;gap:6px}.gameTop button{min-height:36px}.gameTop .zone{font-size:16px}.quick{gap:4px}.quick button{font-size:11px;padding:6px 9px}.worldNav{padding:7px 12px;font-size:12px}.worldNav summary{cursor:pointer}.schoolHelp{font-size:11px;padding:6px 12px}.cwUiOpen .layout{grid-template-columns:minmax(0,1fr) 350px}@media(max-width:850px){.cwUiOpen .layout{grid-template-columns:minmax(0,1fr)}.gameTop .zone{font-size:14px}}`;
document.head.append(presentationStyle);
const nav=cw09El('details','worldNav'),summary=cw09El('summary','','지도',nav);$('#quick').before(nav);nav.append($('#quick'));
const panelToggle=cw09El('button','actionBtn','가방');panelToggle.type='button';panelToggle.setAttribute('aria-label','활동 가방 열기');panelToggle.setAttribute('aria-expanded','false');$('.gameTop').append(panelToggle);
function schoolPanelOpen(open){document.body.classList.toggle('cwUiOpen',open);panelToggle.textContent=open?'접기':'가방';panelToggle.setAttribute('aria-expanded',String(open));window.dispatchEvent(new Event('resize'));}
panelToggle.onclick=()=>schoolPanelOpen(!document.body.classList.contains('cwUiOpen'));
const presentationOldTab=switchTab;switchTab=function(id){schoolPanelOpen(true);return presentationOldTab(id);};
const presentationOldRefresh=cw09RefreshStage;cw09RefreshStage=function(){presentationOldRefresh();cw09StageBtn.textContent='활동';};cw09RefreshStage();
// Keep the character identifiable with a bright edge, without an always-on name balloon.
label=function(){};
renderAvatar();document.title='문스쿨 | 픽셀 캠퍼스';

presentationStyle.textContent+=`.gameTop>.actionBtn{position:static!important;inset:auto!important;transform:none!important;padding:7px 11px;min-height:36px;font-size:12px}.worldNav{color:#fff1d1}.worldNav summary{color:#fff1d1}.gameTop .zone{margin-right:auto}`;
presentationStyle.textContent+=`body:not(.cwUiOpen) .side{min-height:0!important;height:auto!important}.gameTop>.actionBtn{padding:6px 8px}.gameTop .zone{min-width:0}@media(max-width:540px){.gameTop{gap:5px}.gameTop .zone{font-size:13px}.gameTop>.actionBtn{font-size:11px;min-height:34px}}`;
schoolRunRefresh=function(){runButton.textContent=CW_MOVE.running?'🏃 달리기':'🚶 걷기';runButton.title=CW_MOVE.running?'달리기 끄기':'달리기 켜기 · Shift';runButton.setAttribute('aria-pressed',String(CW_MOVE.running));};schoolRunRefresh();
