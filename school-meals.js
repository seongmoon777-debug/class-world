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
  const c=document.createElement('canvas'),g=c.getContext('2d');c.width=336;
  g.font='28px "Malgun Gothic", sans-serif';
  const wrapped=[];
  for(const line of lines){let row='';for(const char of line){if(g.measureText(row+char).width>292){wrapped.push(row);row='';}row+=char;}wrapped.push(row);}
  c.height=114+wrapped.length*34;
  const box=(x,y,w,h,color,r=10)=>{g.fillStyle=color;g.beginPath();g.roundRect(x,y,w,h,r);g.fill();};
  box(26,c.height-26,12,26,'#765238',2);box(298,c.height-26,12,26,'#765238',2);
  box(0,0,336,c.height-20,'#856043');box(7,7,322,c.height-34,'#fff7df');
  box(7,7,322,58,'#38684f');
  g.textAlign='center';g.textBaseline='middle';g.fillStyle='#fff9e8';g.font='28px "Malgun Gothic", sans-serif';g.fillText('의창초 오늘의 식단',168,35);
  g.fillStyle='#6e6249';g.font='20px "Malgun Gothic", sans-serif';g.fillText(`${day.slice(4,6)}월 ${day.slice(6,8)}일 · 점심`,168,81);
  g.fillStyle='#284a39';g.font='28px "Malgun Gothic", sans-serif';wrapped.forEach((s,i)=>g.fillText(s,168,113+i*34));art=c;
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
const before=worldBase;worldBase=function(){before();if(currentMap==='plaza'&&art)ctx.drawImage(art,34.4*TILE,14.9*TILE-art.height*.7,art.width*.7,art.height*.7);};
setInterval(refresh,1500);
document.addEventListener('visibilitychange',()=>{if(!document.hidden)refresh();});
Promise.resolve(window.MoonSignReady).then(panel);refresh();
window.MoonMeals={dateKey,parse,refresh};
})();