/* Moon School city: cached scenery only; account and activity records stay intact. */
(()=>{'use strict';
const names={classroom:'해솔 교실',library:'책숲 도서관',gym:'튼튼 체육관',lab:'생각 배움터',accessory:'별별 소품집',outfit:'알록 옷가게',salon:'단정 미용실'};
const colors={classroom:'#ce6849',library:'#378c88',gym:'#357cb1',lab:'#7760ad',accessory:'#d69231',outfit:'#bd5881',salon:'#659c52'};
const cv=document.createElement('canvas');cv.width=62*TILE;cv.height=58*TILE;const g=cv.getContext('2d'),T=TILE;
function box(x,y,w,h,c,r=0){g.fillStyle=c;g.beginPath();g.roundRect(x,y,w,h,r);g.fill();}
function oval(x,y,rx,ry,c){g.fillStyle=c;g.beginPath();g.ellipse(x,y,rx,ry,0,0,Math.PI*2);g.fill();}
function line(points,c,w){g.strokeStyle=c;g.lineWidth=w;g.lineCap='round';g.lineJoin='round';g.beginPath();points.forEach(([x,y],i)=>i?g.lineTo(x*T,y*T):g.moveTo(x*T,y*T));g.stroke();}
function label(s,x,y,size=23,c='#254238'){g.font=`800 ${size}px "Malgun Gothic",sans-serif`;g.textAlign='center';g.textBaseline='middle';g.fillStyle=c;g.fillText(s,x,y);}
function tree(x,y,size=1){x*=T;y*=T;oval(x+8,y+8,25*size,12*size,'#254e3820');box(x-4,y-28*size,8,30*size,'#8b6744',3);oval(x,y-43*size,27*size,31*size,'#307251');oval(x-8,y-51*size,18*size,21*size,'#4c9860');}
function bench(x,y){x*=T;y*=T;box(x-28,y,56,12,'#785337',3);box(x-28,y-13,56,10,'#ba8551',3);box(x-23,y+10,5,10,'#4b5848');box(x+18,y+10,5,10,'#4b5848');}
function lamp(x,y){x*=T;y*=T;oval(x,y,10,5,'#26453625');box(x-3,y-48,6,48,'#354f50',3);box(x-11,y-61,22,18,'#fff0af',5);box(x-14,y-65,28,6,'#354f50',3);}
box(0,0,cv.width,cv.height,'#5b926b');
// A wooded boundary frames a broad, bright pedestrian town.
oval(31*T,29*T,24*T,24*T,'#accd83');
oval(31*T,29*T,23.5*T,23.5*T,'#86b66d');
// Distinct garden courtyards: shops west, learning east, homes south.
box(8*T,13*T,16*T,30*T,'#c9d99b',90);box(36*T,13*T,18*T,30*T,'#b4d6ae',90);
box(25*T,9*T,12*T,12*T,'#d1dfa7',60);box(25*T,38*T,12*T,12*T,'#cbdca2',60);
const roads=[[[13.5,28.7],[49.5,28.7]],[[31.5,12.7],[31.5,47.7]],[[19.5,17.7],[19.5,40.7]],[[43.5,17.7],[43.5,40.7]],[[19.5,17.7],[43.5,17.7]],[[19.5,40.7],[43.5,40.7]]];
for(const r of roads){line(r,'#b8ae90',3.2*T);line(r,'#f4e8c9',2.8*T);line(r,'#fff4db',.10*T);}
// Central square and fountain retain their existing collision/raid interaction.
box(26*T,24*T,11*T,11*T,'#d4c3a0',65);box(26.3*T,24.3*T,10.4*T,10.4*T,'#f7ecd4',58);
for(let x=27;x<=36;x++)for(let y=25;y<=34;y++)box(x*T,y*T,2,2,'#c7b89b');
oval(31*T,29.2*T,2.45*T,2*T,'#b4a98d');oval(31*T,29*T,2.25*T,1.85*T,'#fdf7df');oval(31*T,29*T,1.95*T,1.55*T,'#3d9daf');oval(31*T,28.8*T,1.7*T,1.25*T,'#7bd0d0');
box(31*T-12,27.9*T,24,45,'#e5d9b8',6);oval(31*T,27.9*T,40,13,'#fff3d6');oval(31*T,27.85*T,31,7,'#56b8c2');
// Small planted squares, instead of scattered clutter over the walking paths.
for(const [x,y] of [[25,22],[37,22],[25,36],[37,36]]){box((x-1)*T,(y-1)*T,2*T,2*T,'#e9d7b4',20);box((x-.8)*T,(y-.8)*T,1.6*T,1.6*T,'#77aa67',16);for(let i=0;i<7;i++)oval((x-.6+(i%3)*.6)*T,(y-.5+Math.floor(i/3)*.5)*T,6,6,i%2?'#fff7cd':'#ed906a');}
for(let i=0;i<52;i++){const a=i*Math.PI*2/52,r=23.8+(i%3)*.2;tree(31+Math.cos(a)*r,29+Math.sin(a)*r,1.15);}
for(const [x,y] of [[15,22],[15,35],[23,12],[39,12],[48,22],[48,35],[26,44],[36,44]])tree(x,y,1.1);
for(const [x,y] of [[27,32],[35,32],[23,25],[39,25]])bench(x,y);
for(const [x,y] of [[28,20],[35,20],[25,28],[38,28],[28,38],[35,38]])lamp(x,y);
function building(p){const x=(p.x+.5)*T,y=(p.y+.7)*T,c=colors[p.to],w=p.to==='classroom'?236:198;
 oval(x,y+9,w*.58,22,'#284b3826');box(x-w/2-12,y-10,w+24,28,'#c8baa0',8);
 box(x-w/2,y-128,w,123,'#fff4d9',8);box(x-w/2,y-48,w,43,'#e9d5b2',3);
 // Strong silhouettes, low roofs, clear door aligned to the interaction point.
 g.fillStyle=c;g.beginPath();g.moveTo(x-w/2-16,y-125);g.lineTo(x-w/2+10,y-183);g.lineTo(x+w/2-10,y-183);g.lineTo(x+w/2+16,y-125);g.closePath();g.fill();
 for(let z=-w/2+28;z<w/2;z+=33)line([[(x+z)/T,(y-179)/T],[(x+z-9)/T,(y-131)/T]],'#ffffff25',3);
 box(x-w/2-16,y-130,w+32,10,'#384c46',3);
 for(const dx of [-w*.32,w*.32]){box(x+dx-20,y-98,40,45,'#fffdf0',4);box(x+dx-16,y-94,32,35,'#6cb6c8',2);box(x+dx-1,y-94,3,35,'#f9f2dc');box(x+dx-16,y-77,32,3,'#f9f2dc');}
 box(x-24,y-61,48,61,'#47655d',5);box(x-17,y-53,34,47,'#a7c8b6',3);oval(x+11,y-24,3,3,'#fbe7a2');box(x-30,y,60,7,'#fffae9',2);
 const title=names[p.to];g.font='800 23px "Malgun Gothic",sans-serif';const tw=Math.max(148,g.measureText(title).width+30);box(x-tw/2,y-123,tw,36,'#fffdf3',7);label(title,x,y-105);
 if(p.to==='classroom'){box(x-25,y-225,50,45,'#fff5d9',6);oval(x,y-203,17,17,'#384f51');oval(x,y-203,14,14,'#fff9e5');line([[x/T,(y-213)/T],[x/T,(y-203)/T],[(x+8)/T,(y-200)/T]],'#384f51',3);}
 if(p.to==='library'){for(let i=0;i<6;i++)box(x-38+i*13,y-167,9,22,['#ffe6a1','#df997c','#abcda5'][i%3],2);}
 if(p.to==='gym'){oval(x,y-158,18,18,'#f1ba64');line([[(x-17)/T,(y-158)/T],[(x+17)/T,(y-158)/T]],'#87604a',2);}
 if(p.to==='lab')label('✦',x,y-157,32,'#fff0ac');
}
for(const p of portals.plaza)if(names[p.to])building(p);
// Home approach intentionally remains the existing, live neighborhood entrance.
box(28*T,44.5*T,7*T,1.3*T,'#fff5db',15);label('우리 동네 ↓',31.5*T,45.15*T,25);
for(const [s,x,y] of [['학교길',31.5,21.5],['상점길',16,31.5],['배움길',46,32],['달빛 광장',31,33.6]])label(s,x*T,y*T,25,'#586d55');
const before=worldBase;worldBase=function(){if(currentMap==='plaza'){ctx.drawImage(cv,0,0);return;}before();};
maps.plaza.name='문스쿨 달빛 도시';maps.plaza.desc='학교길 · 상점길 · 배움길 · 우리 동네';
for(const p of portals.plaza)if(names[p.to]){p.label=names[p.to];maps[p.to].name=names[p.to];}
window.MoonCity={version:'0.36.0',names,roads};
const priorSolid=solid;
solid=function(x,y){if(currentMap!=='plaza')return priorSolid(x,y);if(priorSolid(x,y))return true;return portals.plaza.some(p=>names[p.to]&&Math.abs(x-(p.x+.5))<(p.to==='classroom'?2.57:2.15)&&y>p.y-3.3&&y<p.y-.05);};
if(currentMap==='plaza'&&solid(player.x,player.y)){player={x:31,y:35};cw05LastCamera=null;}
if(currentMap==='plaza')$('#mapName').textContent=maps.plaza.icon+' '+maps.plaza.name;
})();

