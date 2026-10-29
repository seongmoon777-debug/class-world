/* Original rounded MoonSchool characters. Static raster heads + articulated bodies.
 * Rendering only: never migrate, reset or write student records here. */
'use strict';
const ROUND_SCHOOL={ready:false,failed:false,parts:new Map(),frames:new Map(),previews:new Map(),image:new Image()};
// Source rectangles are measured against the approved 1536x1024 turnaround atlas.
const roundRects={boy:[[197,36,188,185,223,220,134,144],[668,36,187,184,720,220,108,145],[1141,36,198,183,1175,219,136,145]],girl:[[170,549,234,174,223,716,133,114],[674,549,178,174,719,716,101,114],[1133,549,214,176,1176,716,135,114]]};
function roundCanvas(w=96,h=152){const c=document.createElement('canvas');c.width=w;c.height=h;return c;}
function roundRGB(hex){return hex.match(/[a-f\d]{2}/gi).map(x=>parseInt(x,16));}
function roundPart(av,dir,body=false){
 const gender=av.gender==='girl'?'girl':'boy',view=dir==='up'?2:dir==='right'||dir==='left'?1:0;
 const key=JSON.stringify([gender,view,body,av.hairColor||0,av.cloth||0]);if(ROUND_SCHOOL.parts.has(key))return ROUND_SCHOOL.parts.get(key);
 const rect=roundRects[gender][view],r=body?rect.slice(4):rect.slice(0,4),c=roundCanvas(r[2],r[3]),g=c.getContext('2d',{willReadFrequently:true});g.drawImage(ROUND_SCHOOL.image,...r,0,0,c.width,c.height);
 const im=g.getImageData(0,0,c.width,c.height),p=im.data,color=roundRGB(body?clothColors[av.cloth||0]:hairColors[av.hairColor||0]);
 for(let i=0;i<p.length;i+=4){
  // Discard the generated near-transparent studio halo; keep opaque artwork edges.
  if(p[i+3]<125){p[i+3]=0;continue;}p[i+3]=Math.min(255,(p[i+3]-125)*2);
  const [r,g,b]=[p[i],p[i+1],p[i+2]],isHair=!body&&r<155&&g<105&&b<90&&r>g*1.12;
  const isCloth=body&&(gender==='boy'?b>r*1.3&&b>g*1.08:r>g*1.25&&r>b*1.2);
  if((isHair&&(av.hairColor||0)!==0)||(isCloth&&(av.cloth||0)!==0)){
   const light=body?(r+g+b)/270:(r+g+b)/160;for(let k=0;k<3;k++)p[i+k]=Math.min(255,color[k]*light);
  }
 }
 g.putImageData(im,0,0);ROUND_SCHOOL.parts.set(key,c);return c;
}
function roundPose(frame=0,run=false,moving=false){const wave=moving?Math.sin(frame/12*Math.PI*2):0;return {wave,stride:moving?(run?13:7):0,lift:moving?(run?8:2.4):0,bend:run&&moving?8:0};}
function roundAvatar(av,dir='down',frame=0,run=false,moving=false){
 const key=JSON.stringify([av,dir,frame,run,moving]);if(ROUND_SCHOOL.frames.has(key))return ROUND_SCHOOL.frames.get(key);
 if(!ROUND_SCHOOL.ready)return schoolPixel(av,dir,Math.floor(frame*8/12),run);
 const c=roundCanvas(),g=c.getContext('2d'),girl=av.gender==='girl',side=dir==='left'||dir==='right',back=dir==='up';
 if(dir==='left'){g.translate(96,0);g.scale(-1,1);}
 const pose=roundPose(frame,run,moving),cloth=(av.cloth||0)?clothColors[av.cloth]:girl?'#f67c68':'#285dc2',skin='#edb58c',pants=girl?'#205565':'#dca040',shoes=['#243e66','#387cbc','#b34f76','#39825c'][av.shoes||0];
 function gradient(x,y,w,color){const a=g.createLinearGradient(x-w/2,y,x+w/2,y);a.addColorStop(0,color);a.addColorStop(.4,color);a.addColorStop(1,'rgb('+roundRGB(color).map(v=>Math.round(v*.73)).join(',')+')');return a;}
 function capsule(x,y,xx,yy,w,color){g.lineCap='round';g.strokeStyle=gradient((x+xx)/2,(y+yy)/2,w*2,color);g.lineWidth=w;g.beginPath();g.moveTo(x,y);g.lineTo(xx,yy);g.stroke();}
 function ellipse(x,y,rx,ry,color){g.fillStyle=color;g.beginPath();g.ellipse(x,y,rx,ry,0,0,Math.PI*2);g.fill();}
 function leg(sign){const swing=pose.wave*sign,hip=48+(side?sign*3:sign*10),foot=hip+(side?swing*pose.stride:swing*2),fy=143-Math.max(0,swing)*pose.lift;
  const knee=hip+(side?swing*pose.stride*.45:0),ky=123-Math.max(0,swing)*pose.bend;
  capsule(hip,103,knee,ky,12,skin);capsule(knee,ky,foot,fy-5,10,skin);capsule(foot,fy-10,foot,fy-3,11,'#fff4df');
  ellipse(foot+(side?3:0),fy+1,side?10:8,4.5,'#fff8e8');ellipse(foot+(side?2:0),fy-2,side?9:7,5,shoes);
  if(!back){g.strokeStyle='#f9f4e7';g.lineWidth=1.4;for(let n=0;n<2;n++){g.beginPath();g.moveTo(foot-3,fy-5+n*3);g.lineTo(foot+4,fy-5+n*3);g.stroke();}}
 }
 function arm(sign){const swing=-pose.wave*sign,x=48+(side?sign*3:sign*19),ex=x+(side?swing*pose.stride*.55:sign*4),ey=85-Math.max(0,swing)*pose.bend*.4,hx=ex+(side?swing*pose.stride*.5:0),hy=103-pose.bend-Math.max(0,swing)*pose.lift*.7;
  capsule(x,68,ex,ey,14,cloth);capsule(ex,ey,hx,hy-5,12,cloth);capsule(hx,hy-5,hx,hy+1,10,skin);ellipse(hx+(side?2:sign),hy+2,4.5,5.5,skin);
 }
 leg(-1);leg(1);arm(-1);
 // Rounded shorts, neck and the original textured cardigan/sweater torso.
 capsule(48+(side?-4:-10),98,48+(side?-4:-10),108,side?19:20,pants);capsule(48+(side?4:10),98,48+(side?4:10),108,side?19:20,pants);
 capsule(48,54,48,65,13,skin);
 const torso=roundPart(av,dir,true);g.save();g.beginPath();g.roundRect(side?34:27,59,side?29:42,43,8);g.clip();g.drawImage(torso,side?34:27,59,side?29:42,43);g.restore();
 arm(1);
 // Head and hair are drawn at fixed coordinates, independent of gait or speed.
 const hair=hairColors[av.hairColor||0],style=av.hair||0;
 if(style===2){ellipse(20,44,9,15,hair);if(!side)ellipse(76,44,9,15,hair);}if(style===4){ellipse(25,48,8,17,hair);if(!side)ellipse(71,48,8,17,hair);}
 const head=roundPart(av,dir),hw=girl?(side?60:74):(side?64:64);g.drawImage(head,48-hw/2,3,hw,57);
 if(style===1){ellipse(side?30:29,13,8,6,hair);}if(style===3){g.strokeStyle=hair;g.lineWidth=5;g.lineCap='round';g.beginPath();g.moveTo(31,13);g.quadraticCurveTo(48,2,65,13);g.stroke();}
 if(!back&&(av.face||0)>0){g.strokeStyle='#8e4d37';g.lineWidth=1.1;g.beginPath();const mx=side?70:48;g.moveTo(mx-3,51);g.quadraticCurveTo(mx,av.face===1?55:50,mx+3,51);g.stroke();}
 if(av.acc===1){ellipse(73,21,6,4,'#dc426b');ellipse(73,21,3,7,'#fa84a1');}
 if(av.acc===2&&!back){g.strokeStyle='#273c55';g.lineWidth=1.7;for(const x of side?[66]:[37,58]){g.beginPath();g.roundRect(x-6,34,12,10,4);g.stroke();}if(!side){g.beginPath();g.moveTo(43,38);g.lineTo(52,38);g.stroke();}}
 if(av.acc===3){g.fillStyle='#245b91';g.beginPath();g.ellipse(48,15,27,11,0,Math.PI,0);g.fill();capsule(24,16,72,16,5,'#498ac0');}
 ROUND_SCHOOL.frames.set(key,c);if(ROUND_SCHOOL.frames.size>360)ROUND_SCHOOL.frames.delete(ROUND_SCHOOL.frames.keys().next().value);return c;
}
const roundPreviousSprite=sprite;
sprite=function(x,y,av,step=0,small=false,dir='down',moving=false){
 if(!ROUND_SCHOOL.ready)return roundPreviousSprite(x,y,av,step,small,dir,moving);
 const run=moving&&CW_MOVE.running&&!small,frame=moving?Math.floor(step*(run?1.5:1.05))%12:0,base=roundAvatar({...av,gender:ms093Gender(av,small)},dir,frame,run,moving),img=base,scale=small?.45:.57,pad=0;
 ctx.save();ctx.imageSmoothingEnabled=true;ctx.fillStyle='#18271d38';ctx.beginPath();ctx.ellipse(x,y,small?8:13,2.6,0,0,Math.PI*2);ctx.fill();
 const pose=roundPose(frame,run,moving),side=dir==='left'||dir==='right';for(const sign of [-1,1]){const swing=pose.wave*sign;if(swing>.05)continue;const foot=(side?sign*3+swing*pose.stride:sign*10+swing*2)*(dir==='left'?-1:1)*scale;ctx.fillStyle='#18271d80';ctx.beginPath();ctx.ellipse(x+foot,y,side?5:4,1.35,0,0,Math.PI*2);ctx.fill();}
 ctx.drawImage(img,x-(48+pad)*scale,y-(148.5+pad)*scale,img.width*scale,img.height*scale);ctx.restore();
};
function roundPreview(c,av){
 const gender=c.id==='creatorPreview'?(document.querySelector('[name=newGender]:checked')?.value||'boy'):ms093Gender(av,false);
 if(!ROUND_SCHOOL.ready){ROUND_SCHOOL.previews.set(c,{...av,gender});schoolPixelPreview(c,{...av,gender});return;}
 const g=c.getContext('2d');g.clearRect(0,0,c.width,c.height);g.fillStyle='#edf3f5';g.fillRect(0,0,c.width,c.height);g.imageSmoothingEnabled=true;
 const img=roundAvatar({...av,gender}),scale=Math.min(c.width/102,c.height/158);g.drawImage(img,(c.width-img.width*scale)/2,(c.height-img.height*scale)/2,img.width*scale,img.height*scale);
}
drawPreview=roundPreview;campusDrawPreview=roundPreview;
ROUND_SCHOOL.image.onload=()=>{ROUND_SCHOOL.ready=true;for(const [c,av] of ROUND_SCHOOL.previews)if(c.isConnected)roundPreview(c,av);ROUND_SCHOOL.previews.clear();document.dispatchEvent(new Event('round-avatar-ready'));};
ROUND_SCHOOL.image.onerror=()=>{ROUND_SCHOOL.failed=true;ROUND_SCHOOL.previews.clear();};
ROUND_SCHOOL.image.src=window.MOON_ROUND_ATLAS||'';
document.title='문스쿨 | 우리들의 캠퍼스';
showCreatorPreview();renderAvatar();

presentationStyle.textContent+='canvas{image-rendering:auto}';
