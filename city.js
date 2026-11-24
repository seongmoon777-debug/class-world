/* Moon School city: cached scenery only; account and activity records stay intact. */
(()=>{'use strict';
// Keep legacy room IDs and records, but expose exactly one shop on the village map.
for(let i=portals.plaza.length-1;i>=0;i--)if(['salon','accessory'].includes(portals.plaza[i].to))portals.plaza.splice(i,1);
const names={classroom:'해솔 교실',library:'책숲 도서관',gym:'튼튼 체육관',lab:'생각 배움터',accessory:'별별 소품집',outfit:'반짝 상점',salon:'단정 미용실'};
const colors={classroom:'#ce6849',library:'#378c88',gym:'#357cb1',lab:'#7760ad',accessory:'#d69231',outfit:'#bd5881',salon:'#659c52'};
const cv=document.createElement('canvas');cv.width=82*TILE;cv.height=74*TILE;const g=cv.getContext('2d'),T=TILE;
function box(x,y,w,h,c,r=0){g.fillStyle=c;g.beginPath();g.roundRect(x,y,w,h,r);g.fill();}
function oval(x,y,rx,ry,c){g.fillStyle=c;g.beginPath();g.ellipse(x,y,rx,ry,0,0,Math.PI*2);g.fill();}
function line(points,c,w){g.strokeStyle=c;g.lineWidth=w;g.lineCap='round';g.lineJoin='round';g.beginPath();points.forEach(([x,y],i)=>i?g.lineTo(x*T,y*T):g.moveTo(x*T,y*T));g.stroke();}
function label(s,x,y,size=26,c='#254238'){g.font=`400 ${size}px "Malgun Gothic","Apple SD Gothic Neo","Noto Sans CJK KR","Nanum Gothic",sans-serif`;g.textAlign='center';g.textBaseline='middle';g.fillStyle=c;g.fillText(s,x,y);}
function tree(x,y,size=1){x*=T;y*=T;oval(x+8,y+8,25*size,12*size,'#254e3820');box(x-4,y-28*size,8,30*size,'#8b6744',3);oval(x,y-43*size,27*size,31*size,'#307251');oval(x-8,y-51*size,18*size,21*size,'#4c9860');}
function bench(x,y){x*=T;y*=T;box(x-28,y,56,12,'#785337',3);box(x-28,y-13,56,10,'#ba8551',3);box(x-23,y+10,5,10,'#4b5848');box(x+18,y+10,5,10,'#4b5848');}
function lamp(x,y){x*=T;y*=T;oval(x,y,10,5,'#26453625');box(x-3,y-48,6,48,'#354f50',3);box(x-11,y-61,22,18,'#fff0af',5);box(x-14,y-65,28,6,'#354f50',3);}

const roads=[[[13.5,28.7],[23,27],[31.5,28.7],[40,30],[49.5,28.7]],[[31.5,12.7],[29,20],[31.5,28.7],[33,37],[31.5,47.7]],[[19.5,17.7],[16.5,22],[13.5,28.7]],[[13.5,28.7],[17,34],[19.5,40.7]],[[43.5,17.7],[47,22],[49.5,28.7]],[[49.5,28.7],[46,35],[43.5,40.7]],[[19.5,17.7],[25,18.7],[31.5,12.7],[38,15],[43.5,17.7]],[[19.5,40.7],[25,43],[31.5,47.7],[37,44],[43.5,40.7]],[[13.5,28.7],[9,34],[11,43],[20,51],[31.5,54],[44,55],[55,52],[69,52]],[[49.5,28.7],[56,28.7],[68,28.7],[71,39],[69,52]],[[31.5,47.7],[31.5,54]],[[43.5,40.7],[50,44],[55,52]]];
function riverX(y){return 61+Math.sin(y*.15)*1.7;}
function cottage(x,y,c){x*=T;y*=T;oval(x+8,y+10,99,22,'#24483220');box(x-77,y-104,154,106,'#f8e8c9',12);box(x-77,y-15,154,18,'#d7ba91',3);box(x+32,y-178,19,56,'#bd8268',3);g.fillStyle=c;g.beginPath();g.moveTo(x-95,y-100);g.quadraticCurveTo(x-53,y-168,x,y-186);g.quadraticCurveTo(x+54,y-164,x+95,y-100);g.closePath();g.fill();line([[(x-95)/T,(y-100)/T],[(x+95)/T,(y-100)/T]],'#714f4433',7);oval(x,y-135,16,17,'#ffe9b9');box(x-22,y-61,44,64,'#846b51',20);box(x-17,y-55,34,55,'#b8c8a0',15);oval(x+10,y-24,3,3,'#fff5cb');for(const a of [-49,49]){box(x+a-15,y-78,30,34,'#659ea6',9);box(x+a-2,y-77,4,32,'#fff7dd');box(x+a-20,y-41,40,9,'#bb7d58',3);for(let i=-1;i<=1;i++){oval(x+a+i*12,y-46,8,9,'#578e57');oval(x+a+i*12,y-52,5,5,'#f1a3a1');}}}
function fence(x,y,n){for(let i=0;i<n;i++)box((x+i*.38)*T,y*T,8,26,'#fff1d0',4);box(x*T,(y+.15)*T,(n-1)*.38*T+8,5,'#e8d5ad');}
function drawScene(){
box(0,0,cv.width,cv.height,'#568b65');
oval(40*T,36*T,38*T,34*T,'#a6c881');
oval(40*T,36*T,37.5*T,33.5*T,'#98bd78');
// Soft meadow patches break the old campus grid into an inhabited landscape.
for(const [x,y,rx,ry,c]of [[16,23,10,12,'#a9c987'],[39,18,12,9,'#b2ce8e'],[27,44,17,13,'#a8c783'],[49,42,10,15,'#bad092'],[70,40,7,20,'#a9c783']])oval(x*T,y*T,rx*T,ry*T,c);
for(let i=0;i<950;i++){const x=(i*37.37)%80+1,y=(i*19.17)%70+2;if(((x-40)/37)**2+((y-36)/33)**2>1)continue;oval(x*T,y*T,2+(i%3),1.5,i%2?'#e5e7a64a':'#679c6644');}
const river=Array.from({length:59},(_,i)=>[riverX(i+8),i+8]);line(river,'#d3dda9',5*T);line(river,'#68b9bc',3.9*T);line(river,'#9bd6cb',2.8*T);
for(let y=11;y<64;y+=2.7){line([[riverX(y)-.7,y],[riverX(y)+.3,y]],'#e9faf0aa',3);}
for(const r of roads){line(r,'#cbb48a',2.3*T);line(r,'#efddb8',2.06*T);line(r,'#f5e5c8',1.6*T);}
for(const y of [28.7,52]){const x=riverX(y);box((x-2.7)*T,(y-.9)*T,5.4*T,1.8*T,'#b98a56',7);for(let i=0;i<14;i++)box((x-2.65+i*.4)*T,(y-.85)*T,2,1.7*T,'#875f40');for(const dy of [-1,1]){box((x-2.85)*T,(y+dy)*T,5.7*T,8,'#765b3f',3);for(let i=0;i<5;i++)box((x-2.7+i*1.35)*T,(y+dy)*T-13,8,25,'#866544',3);}}
// Flower gardens and cottage lanes are scenery; personal houses remain in 우리 동네.
for(const [x,y,c]of [[9,33,'#b86651'],[12,43,'#4e8e81'],[20,51,'#bd8751'],[29,57,'#9a6985'],[42,55,'#b56351'],[52,47,'#748a55'],[70,37,'#598b99'],[69,48,'#b7914d']]){oval(x*T,(y+.5)*T,3.3*T,2*T,'#c2d298');cottage(x,y,c);fence(x-2.8,y+1.2,7);for(let k=0;k<7;k++){oval((x+2+k%2*.35)*T,(y+.1+Math.floor(k/2)*.3)*T,7,7,k%2?'#eaa291':'#fff2b7');}}
for(let i=0;i<90;i++){const a=i*Math.PI*2/90;tree(40+Math.cos(a)*(37.4+(i%2)*.3),36+Math.sin(a)*(33.1+(i%3)*.15),1.1+(i%3)*.2);}
for(const [x,y]of [[8,25],[11,20],[20,10],[24,12],[39,8],[49,15],[54,19],[55,36],[55,60],[45,62],[36,61],[20,58],[13,48],[73,31],[73,45],[67,57]]){tree(x,y,1.25);tree(x+1.2,y+.5,.85);}
// Central square and fountain retain their existing collision/raid interaction.
oval(31*T,29.5*T,5.3*T,5.5*T,'#ceb995');oval(31*T,29.5*T,5.1*T,5.3*T,'#f2e1bf');
for(let x=27;x<=36;x++)for(let y=25;y<=34;y++)box(x*T,y*T,2,2,'#c7b89b');
oval(31*T,29.2*T,2.45*T,2*T,'#b4a98d');oval(31*T,29*T,2.25*T,1.85*T,'#fdf7df');oval(31*T,29*T,1.95*T,1.55*T,'#3d9daf');oval(31*T,28.8*T,1.7*T,1.25*T,'#7bd0d0');
box(31*T-12,27.9*T,24,45,'#e5d9b8',6);oval(31*T,27.9*T,40,13,'#fff3d6');oval(31*T,27.85*T,31,7,'#56b8c2');
// Small planted squares, instead of scattered clutter over the walking paths.
for(const [x,y] of [[25,22],[37,22],[25,36],[37,36]]){box((x-1)*T,(y-1)*T,2*T,2*T,'#e9d7b4',20);box((x-.8)*T,(y-.8)*T,1.6*T,1.6*T,'#77aa67',16);for(let i=0;i<7;i++)oval((x-.6+(i%3)*.6)*T,(y-.5+Math.floor(i/3)*.5)*T,6,6,i%2?'#fff7cd':'#ed906a');}
for(const [x,y] of [[15,22],[15,35],[23,12],[39,12],[48,22],[48,35],[26,44],[36,44]])tree(x,y,1.1);
for(const [x,y] of [[27,32],[35,32],[23,25],[39,25]])bench(x,y);
for(const [x,y] of [[28,20],[35,20],[25,28],[38,28],[28,38],[35,38]])lamp(x,y);
function building(p){const x=(p.x+.5)*T,y=(p.y+.7)*T,c=colors[p.to],w=p.to==='classroom'?236:198;
 oval(x,y+9,w*.58,22,'#284b3826');box(x-w/2-12,y-10,w+24,28,'#c8baa0',8);
 box(x-w/2,y-128,w,123,'#fff4d9',8);box(x-w/2,y-48,w,43,'#e9d5b2',3);
 // Strong silhouettes, low roofs, clear door aligned to the interaction point.
 g.fillStyle=c;g.beginPath();g.moveTo(x-w/2-16,y-125);g.quadraticCurveTo(x-w*.32,y-195,x,y-211);g.quadraticCurveTo(x+w*.32,y-195,x+w/2+16,y-125);g.closePath();g.fill();
 for(let z=-w/2+28;z<w/2;z+=33)line([[(x+z)/T,(y-179)/T],[(x+z-9)/T,(y-131)/T]],'#ffffff25',3);
 box(x-w/2-16,y-130,w+32,10,'#384c46',3);
 box(x+w*.25,y-207,18,49,'#a66d54',3);for(const dx of [-w*.32,w*.32]){box(x+dx-20,y-98,40,45,'#fffdf0',4);box(x+dx-16,y-94,32,35,'#6cb6c8',2);box(x+dx-1,y-94,3,35,'#f9f2dc');box(x+dx-16,y-77,32,3,'#f9f2dc');box(x+dx-24,y-49,48,9,'#b67e53',3);for(let i=-1;i<=1;i++){oval(x+dx+i*13,y-51,8,8,'#649957');oval(x+dx+i*13,y-57,5,5,i%2?'#eeac9d':'#fff0b1');}}
 box(x-24,y-61,48,61,'#47655d',5);box(x-17,y-53,34,47,'#a7c8b6',3);oval(x+11,y-24,3,3,'#fbe7a2');box(x-30,y,60,7,'#fffae9',2);
 const title=names[p.to];g.font='700 28px "Jua","Gowun Dodum","Malgun Gothic",sans-serif';const tw=Math.max(164,g.measureText(title).width+36);box(x-tw/2-3,y-127,tw+6,45,'#92734e',10);box(x-tw/2,y-125,tw,39,'#fff9e9',8);label(title,x,y-105,28,'#294237');
 if(p.to==='classroom'){box(x-25,y-225,50,45,'#fff5d9',6);oval(x,y-203,17,17,'#384f51');oval(x,y-203,14,14,'#fff9e5');line([[x/T,(y-213)/T],[x/T,(y-203)/T],[(x+8)/T,(y-200)/T]],'#384f51',3);}
 if(p.to==='library'){for(let i=0;i<6;i++)box(x-38+i*13,y-167,9,22,['#ffe6a1','#df997c','#abcda5'][i%3],2);}
 if(p.to==='gym'){oval(x,y-158,18,18,'#f1ba64');line([[(x-17)/T,(y-158)/T],[(x+17)/T,(y-158)/T]],'#87604a',2);}
 if(p.to==='lab')label('✦',x,y-157,32,'#fff0ac');
}
for(const p of portals.plaza)if(names[p.to])building(p);
// Home approach intentionally remains the existing, live neighborhood entrance.
box(28*T,44.5*T,7*T,1.3*T,'#fff5db',15);label('우리 동네 ↓',31.5*T,45.15*T,25);
for(const [s,x,y] of [['꽃잎 골목',23,23],['반짝 상점길',17,36],['책숲 산책길',49,21],['달빛 광장',31,33.6],['개울 산책길',68,32],['오솔길',45,58]])label(s,x*T,y*T,25,'#586d55');
}
drawScene();
CW05_DIM.plaza=[82,74];
const before=worldBase;worldBase=function(){if(currentMap==='plaza'){ctx.drawImage(cv,0,0);return;}before();};
maps.plaza.name='달빛 마을';maps.plaza.desc='꽃잎 골목 · 반짝 상점길 · 개울 산책길 · 우리 동네';
for(const p of portals.plaza)if(names[p.to]){p.label=names[p.to];maps[p.to].name=names[p.to];}
window.MoonCity={version:'0.38.0',names,roads,riverX,dimensions:[82,74],redraw:drawScene};
const cottageLots=[[9,33],[12,43],[20,51],[29,57],[42,55],[52,47],[70,37],[69,48]];
const priorSolid=solid;
solid=function(x,y){if(currentMap!=='plaza')return priorSolid(x,y);if(((x-40)/37)**2+((y-36)/33)**2>1||Math.hypot(x-31,y-29)<2.45)return true;if(y>=8&&y<=66&&Math.abs(x-riverX(y))<1.95&&!([28.7,52].some(b=>Math.abs(y-b)<.85)))return true;if(cottageLots.some(([a,b])=>Math.abs(x-a)<1.7&&y>b-2.2&&y<b+.05))return true;return portals.plaza.some(p=>names[p.to]&&Math.abs(x-(p.x+.5))<(p.to==='classroom'?2.57:2.15)&&y>p.y-3.3&&y<p.y-.05);};
if(currentMap==='plaza'&&solid(player.x,player.y)){player={x:31,y:35};cw05LastCamera=null;}
const ui=document.createElement('style');ui.textContent=`
body,button,input,select,textarea,.panel,.gameTop{font-family:'Gowun Dodum','Malgun Gothic',sans-serif!important;letter-spacing:0!important}
h1,h2,h3,.gameTop,.villageToolbar button{font-weight:600!important}
.villageToolbar button{font-size:14px!important;border-radius:14px!important;min-height:40px;background:#fff9eb!important;color:#425a45!important;border-color:#d8c8aa!important}
body{background:#f2efdf!important;color:#405244!important}.gameTop{background:#edf1dc!important;color:#3c5949!important;border-color:#c4cfb0!important}
#mapName{font-size:22px!important;font-weight:600!important}.gameTop .villageToolbar{gap:8px!important}
#stage{border-color:#b0bea0!important}button{font-size:14px}.panel h2{font-size:21px!important}
`;document.head.append(ui);
if(currentMap==='plaza')$('#mapName').textContent=maps.plaza.icon+' '+maps.plaza.name;
})();

