/* Uichang Elementary lunch, from the public NEIS API. No student data is sent. */
(()=>{'use strict';
const dateKey=(d=new Date())=>new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit'}).format(d).replace(/-/g,'');
const split=s=>String(s||'').split(/<br\s*\/?\s*>/i).map(s=>s.replace(/<[^>]*>/g,'').replace(/&amp;/g,'&').trim()).filter(Boolean);
const parse=(body,date)=>{
  if(body.RESULT?.CODE==='INFO-200')return [];
  const rows=body.mealServiceDietInfo?.flatMap(p=>p.row||[]);
  if(!rows)throw Error('meal unavailable');
  return rows.filter(r=>r.SD_SCHUL_CODE==='9022479'&&r.MLSV_YMD===date&&r.MMEAL_SC_CODE==='2').flatMap(r=>split(r.DDISH_NM));
};
let day='',items=[],status='불러오는 중…',busy=false,last=0,art=null;
const cacheKey='moon-school-meal-v1';
function panel(){
 const lines=items.length?items.map(s=>s.replace(/\s*\([\d.\s]+\)/g,'')):[status];
 const c=document.createElement('canvas'),g=c.getContext('2d'),width=280,font='700 20px "Malgun Gothic","Apple SD Gothic Neo",sans-serif';
 g.font=font;const wrapped=[];for(const line of lines){let row='';for(const char of line){if(g.measureText(row+char).width>248){wrapped.push(row);row='';}row+=char;}wrapped.push(row);}
 const height=90+wrapped.length*27;c.width=width*2;c.height=height*2;g.scale(2,2);
 const box=(x,y,w,h,color,r=8)=>{g.fillStyle=color;g.beginPath();g.roundRect(x,y,w,h,r);g.fill();};
 box(22,height-24,10,24,'#765238',2);box(248,height-24,10,24,'#765238',2);
 box(0,0,width,height-18,'#856043');box(5,5,width-10,height-28,'#fffbed');box(5,5,width-10,42,'#294e3a');
 g.textAlign='center';g.textBaseline='middle';g.font=font;g.fillStyle='#fffbed';g.fillText('의창초 오늘의 식단',140,27);
 g.font='600 16px "Malgun Gothic","Apple SD Gothic Neo",sans-serif';g.fillStyle='#4c5548';g.fillText(day.slice(4,6)+'월 '+day.slice(6,8)+'일 · 점심',140,62);
 g.font=font;g.fillStyle='#203b2c';wrapped.forEach((s,i)=>g.fillText(s,140,89+i*27));art=c;
}
async function refresh(){
  const today=dateKey();if(busy||today===day&&Date.now()-last<30*60*1000)return;
  busy=true;last=Date.now();
  if(today!==day){day=today;items=[];status='불러오는 중…';try{const c=JSON.parse(localStorage.getItem(cacheKey));if(c?.day===day&&Array.isArray(c.items))items=c.items;}catch{}panel();}
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),10000);
  try{
    const response=await fetch(`https://open.neis.go.kr/hub/mealServiceDietInfo?Type=json&ATPT_OFCDC_SC_CODE=S10&SD_SCHUL_CODE=9022479&MMEAL_SC_CODE=2&MLSV_YMD=${today}`,{signal:controller.signal,credentials:'omit'});
    if(!response.ok)throw Error('meal unavailable');
    const next=parse(await response.json(),today);
    if(today!==dateKey())return;
    items=next;status='등록된 급식이 없어요';try{localStorage.setItem(cacheKey,JSON.stringify({day,items}));}catch{}
  }catch{status=items.length?'':'급식을 불러오지 못했어요';}
  finally{clearTimeout(timer);busy=false;panel();}
}
const before=worldBase;worldBase=function(){before();if(currentMap==='plaza'&&art)ctx.drawImage(art,34.4*TILE,14.9*TILE-art.height*.35,art.width*.35,art.height*.35);};
setInterval(refresh,1500);
document.addEventListener('visibilitychange',()=>{if(!document.hidden)refresh();});
Promise.resolve(window.MoonSignReady).then(panel);refresh();
window.MoonMeals={dateKey,parse,refresh};
})();