/* MoonSchool 0.10 — local school life, personal yards and learning expeditions. */
'use strict';
const CAMPUS_KEY='classworld2d-campus-v010';
function campusLoad(){
 const empty={version:1,students:{}};
 try{const d=JSON.parse(localStorage.getItem(CAMPUS_KEY)||'null');return d&&d.students&&typeof d.students==='object'?{...empty,...d}:empty;}catch{return empty;}
}
let campusData=campusLoad(),campusView='life',campusOwner=null,campusPage=0,campusPlace=null,campusRoute='reading',campusMessage='';
const CAMPUS_DECOR=[
 {id:'flowers',name:'봄꽃 화단',icon:'🌷',price:15,color:'#e9a6a0'},
 {id:'tree',name:'작은 사과나무',icon:'🌳',price:30,color:'#6e9871'},
 {id:'bench',name:'나무 벤치',icon:'🪑',price:20,color:'#b38660'},
 {id:'pond',name:'작은 연못',icon:'💧',price:45,color:'#7eb7c8'},
 {id:'lamp',name:'별빛 가로등',icon:'💡',price:25,color:'#dfbf71'},
 {id:'books',name:'야외 책장',icon:'📚',price:35,color:'#967454'},
 {id:'tent',name:'독서 텐트',icon:'⛺',price:40,color:'#c6996d'},
 {id:'cat',name:'고양이 조각상',icon:'🐈',price:25,color:'#d9b78d'},
 {id:'sign',name:'환영 표지판',icon:'🪧',price:10,color:'#a9946e'},
 {id:'fountain',name:'달빛 분수',icon:'⛲',price:65,color:'#91bac0'},
 {id:'roof-blue',name:'바다빛 지붕',icon:'🏡',price:50,color:'#668ba5',roof:true},
 {id:'roof-pink',name:'벚꽃빛 지붕',icon:'🏠',price:50,color:'#b88284',roof:true}
];
const CAMPUS_GEAR=[
 {id:'focus',name:'관찰 돋보기',icon:'🔍',price:30,stat:'observation',bonus:2,desc:'관찰력 +2 · 독서 동굴의 힌트 사용'},
 {id:'bottle',name:'꾸준한 물병',icon:'🧴',price:30,stat:'persistence',bonus:2,desc:'끈기 +2 · 자연 숲의 힌트 사용'},
 {id:'friend',name:'협력 배지',icon:'🤝',price:30,stat:'cooperation',bonus:2,desc:'협력 +2 · 함께 탑의 힌트 사용'}
];
const CAMPUS_STATS={observation:'관찰력',persistence:'끈기',cooperation:'협력'};
const CAMPUS_ROUTES={
 reading:{name:'지식의 동굴',icon:'💎',stat:'observation',color:'#626c83',questions:[
  {q:'글을 읽다가 모르는 낱말이 나왔어요.',options:['앞뒤 문장을 살피거나 뜻을 찾아본다','모든 글을 외운다','책을 버린다'],correct:0,hint:'앞뒤 문장에는 낱말의 뜻을 짐작할 단서가 있어요.'},
  {q:'도서관에서 책을 읽을 때는?',options:['큰 소리로 이야기한다','다른 사람을 배려하며 조용히 읽는다','책장을 접어 표시한다'],correct:1,hint:'함께 사용하는 공간이에요.'},
  {q:'책을 읽고 감상을 쓸 때 가장 좋은 방법은?',options:['친구의 감상을 베낀다','제목만 쓴다','장면과 내 생각, 이유를 함께 적는다'],correct:2,hint:'나의 생각에 이유를 더해 보세요.'}]},
 nature:{name:'초록빛 탐험 숲',icon:'🌲',stat:'persistence',color:'#537766',questions:[
  {q:'화분의 흙이 말랐는지 확인했어요. 다음은?',options:['식물에 맞게 물을 준다','물을 계속 붓는다','뿌리를 뽑아본다'],correct:0,hint:'식물마다 필요한 물의 양이 달라요.'},
  {q:'탐험 중 쓰레기를 발견했어요.',options:['모르는 척 지나간다','안전한 쓰레기는 분리수거하고 위험한 것은 어른께 알린다','아무거나 맨손으로 줍는다'],correct:1,hint:'환경도 지키고 내 안전도 지켜요.'},
  {q:'관찰 일기를 꾸준히 쓰려면?',options:['하루에 모든 변화를 예상한다','생각날 때만 쓴다','비슷한 시간에 조금씩 살피고 기록한다'],correct:2,hint:'작은 기록을 여러 날 이어가 보세요.'}]},
 teamwork:{name:'함께 오르는 탑',icon:'🏰',stat:'cooperation',color:'#8b728b',questions:[
  {q:'모둠 친구들의 의견이 달라요.',options:['서로 이유를 듣고 함께 결정한다','내 의견만 말한다','아무것도 하지 않는다'],correct:0,hint:'친구가 왜 그렇게 생각했는지 들어 보세요.'},
  {q:'친구가 어려운 문제 앞에서 멈췄어요.',options:['답을 대신 써준다','어떤 부분이 어려운지 묻고 함께 생각한다','느리다고 놀린다'],correct:1,hint:'스스로 해낼 수 있도록 함께 생각해요.'},
  {q:'함께 만든 결과를 소개할 때는?',options:['내가 다 했다고 한다','잘한 친구만 말한다','각자 기여한 점을 함께 소개한다'],correct:2,hint:'모두의 작은 도움이 모였어요.'}]}
};
function campusStudent(data,name){return data.students[name]||(data.students[name]={attendance:{},decor:[],layout:{},gear:[],runs:{},readReplies:{},roof:null});}
function campusPerson(name=actorName()){const p=campusData.students[name]||{};return {attendance:{},decor:[],layout:{},gear:[],runs:{},readReplies:{},roof:null,...p};}
function campusStats(name=actorName()){
 const p=campusPerson(name),s={observation:1,persistence:1,cooperation:1};
 for(const item of CAMPUS_GEAR)if(p.gear.includes(item.id))s[item.stat]+=item.bonus;
 return s;
}
// Coins and new student records are committed together; no reset or migration of old keys.
function campusTransaction(change){
 if($('#role').value!=='student')return {error:'학생 모드에서 사용할 수 있어요.'};
 const a=localStorage.getItem(dataKey),b=localStorage.getItem(CAMPUS_KEY);let next,data;
 try{next=Object.assign(fresh(),JSON.parse(a||'null')||state);data=campusLoad();}catch{return {error:'저장 정보를 읽지 못했어요.'};}
 const person=actorName(),p=campusStudent(data,person),result=change(p,next,person,data)||{};
 if(result.error)return result;
 try{localStorage.setItem(dataKey,JSON.stringify(next));localStorage.setItem(CAMPUS_KEY,JSON.stringify(data));}
 catch(e){try{if(a===null)localStorage.removeItem(dataKey);else localStorage.setItem(dataKey,a);if(b===null)localStorage.removeItem(CAMPUS_KEY);else localStorage.setItem(CAMPUS_KEY,b);}catch{}return {error:'저장 공간이 부족해 변경하지 못했어요.'};}
 state=next;campusData=data;updateCoin();return result;
}
function campusAttendance(mood,note){
 if(!['😊 즐거워요','😌 편안해요','😐 보통이에요','😟 걱정돼요','😴 피곤해요'].includes(mood))return {error:'오늘의 기분을 골라 주세요.'};
 return campusTransaction((p,s,name)=>{
  const day=schoolToday(),first=!p.attendance[day],mark='campus-attendance|'+name+'|'+day;
  p.attendance[day]={mood,note:String(note||'').trim().slice(0,150),at:Date.now()};
  if(first&&!s.rewards[mark]){s.coins[name]=(Number(s.coins[name])||0)+5;s.rewards[mark]=true;}
  return {message:first?'출석했어요! 5 MC를 받았어요.':'오늘의 기분을 수정했어요. 추가 코인은 지급되지 않아요.'};
 });
}
function campusBuy(id){
 const item=[...CAMPUS_DECOR,...CAMPUS_GEAR].find(x=>x.id===id);if(!item)return {error:'없는 아이템이에요.'};
 return campusTransaction((p,s,name)=>{
  const inventory=CAMPUS_GEAR.includes(item)?p.gear:p.decor;if(inventory.includes(id))return {error:'이미 보유한 아이템이에요.'};
  if((Number(s.coins[name])||0)<item.price)return {error:'문코인이 부족해요. 학교 활동에 참여해 모아 보세요.'};
  s.coins[name]-=item.price;inventory.push(id);if(item.roof)p.roof=id;return {message:item.name+' 구매 완료!'};
 });
}
function campusPlaceItem(id,cell,owner=campusOwner||actorName()){
 return campusTransaction(p=>{
  if(owner!==actorName())return {error:'내 집의 공터만 꾸밀 수 있어요.'};
  const item=CAMPUS_DECOR.find(x=>x.id===id);if(!item||item.roof||!p.decor.includes(id))return {error:'보관함의 장식을 골라 주세요.'};
  if(cell===null){delete p.layout[id];return {message:'장식을 보관함으로 옮겼어요.'};}
  if(!Number.isInteger(cell)||cell<0||cell>=24)return {error:'공터 안에 배치해 주세요.'};
  if(Object.entries(p.layout).some(([other,pos])=>other!==id&&pos===cell))return {error:'이미 다른 장식이 있는 칸이에요.'};
  p.layout[id]=cell;return {message:'공터에 배치했어요.'};
 });
}
function campusBuyCosmetic(key,index){
 if(!['hair','hairColor','cloth','acc','shoes'].includes(key)||!Number.isInteger(index)||!itemLabels[key]?.[index])return {error:'없는 꾸미기 아이템이에요.'};
 return campusTransaction((p,s,name)=>{
  const owned=s.owned[name]||(s.owned[name]={}),av={...baseAvatar,...s.avatars[name]},list=owned[key]||(owned[key]=[Number(av[key])||0]);
  const price=key==='shoes'?20+index*10:prices[key]+(index>2?20:0);
  if(!list.includes(index)){if((Number(s.coins[name])||0)<price)return {error:'문코인이 부족해요.'};s.coins[name]-=price;list.push(index);}
  s.avatars[name]={...av,[key]:index,renderMode:'custom'};return {message:itemLabels[key][index]+' 착용 완료!'};
 });
}
function campusRun(route=campusRoute){return campusPerson().runs[schoolToday()+'|'+route]||{step:0,answers:[],done:false};}
function campusAnswer(route,index){
 const info=CAMPUS_ROUTES[route];if(!info||currentMap!=='expedition'||route!==campusRoute)return {error:'선택한 탐험 공간에서 도전해 주세요.'};
 return campusTransaction((p,s,name)=>{
  const key=schoolToday()+'|'+route,run=p.runs[key]||(p.runs[key]={step:0,answers:[],done:false});
  if(run.done)return {error:'오늘 이미 완료한 탐험이에요. 내일 다시 만나요.'};
  const q=info.questions[run.step];if(index!==q.correct)return {error:'다시 생각해 볼까요? 코인은 줄어들지 않아요.'};
  run.answers.push(index);run.step++;const done=run.step===info.questions.length;
  if(done){run.done=true;run.at=Date.now();const mark='campus-expedition|'+name+'|'+key;if(!s.rewards[mark]){s.rewards[mark]=true;s.coins[name]=(Number(s.coins[name])||0)+20;s.xp[name]=(Number(s.xp[name])||0)+15;}}
  return {message:done?'탐험 완료! 20 MC와 15 XP를 받았어요.':'관문을 통과했어요! 다음 문제로 가 볼까요?'};
 });
}
itemLabels.shoes=['기본 구두','하늘 운동화','벚꽃 운동화','숲빛 장화'];
const campusTab=cw09El('button','','🏡 생활');campusTab.dataset.tab='campus';$('.tabs').append(campusTab);
const campusPanel=cw09El('section','panel','',$('.side'));campusPanel.id='campus';
function campusOpen(view='life'){campusView=view;campusMessage='';switchTab('campus');campusRender();}
campusTab.onclick=()=>campusOpen();
function campusAct(result){campusMessage=result.error||result.message||'저장했어요.';renderAvatar();renderShop();campusRender();}
function campusReplies(){const result=[];for(const [key,people] of Object.entries(cw09Data.submissions)){const rec=people[actorName()];if(rec?.feedback){const a=cw09Data.items.find(x=>key===x.id||key.startsWith(x.id+'@'));result.push({key,rec,title:a?.title||'지난 활동'});}}return result.sort((a,b)=>(b.rec.feedbackAt||0)-(a.rec.feedbackAt||0));}
function campusUpdateBadge(){const unread=$('#role').value==='student'?campusReplies().filter(({key,rec})=>(campusPerson().readReplies[key]||0)<(rec.feedbackAt||1)).length:0;campusTab.textContent='🏡 생활'+(unread?' · 새 답장 '+unread:'');}
function campusRender(){
 if(!campusPanel.classList.contains('active'))return;campusData=campusLoad();campusPanel.replaceChildren();const teacher=$('#role').value==='teacher';
 cw09El('h2','',teacher?'우리 반 생활 기록':'나의 문스쿨 생활',campusPanel);
 const nav=cw09El('div','campusNav','',campusPanel);
 for(const [v,t] of [['life','출석·답장'],['home','내 집·공터'],['style','꾸미기'],['explore','성장·탐험']])cw09Button(nav,t,()=>campusOpen(v),campusView===v?'primary':'secondary');
 if(campusMessage){const m=cw09El('p','note',campusMessage,campusPanel);m.setAttribute('role','status');}
 if(campusView==='life'){
  if(teacher){
   const entries=Object.entries(campusData.students),day=schoolToday();cw09El('p','',day+' · 출석 '+entries.filter(([,p])=>p.attendance?.[day]).length+'명 / 체험 학생 30명',campusPanel);
   const date=cw09Field(campusPanel,'기록 날짜','input',day,10);date.type='date';const list=cw09El('div','','',campusPanel);
   const show=()=>{list.replaceChildren();for(let i=1;i<=30;i++){const name='학생 '+i,r=campusData.students[name]?.attendance?.[date.value];const row=cw09El('div','schoolRecord','',list);cw09El('strong','',name+(r?' · '+r.mood:' · 미출석'),row);if(r?.note)cw09El('p','schoolAnswer',r.note,row);}};date.onchange=show;show();
   cw09El('p','cw09Info','과제 답장은 활동 탭 → 전체 활동 → 현황에서 작성해요.',campusPanel);
  }else{
   const old=campusPerson().attendance[schoolToday()],box=cw09El('div','cw09Form','',campusPanel);cw09El('h3','',old?'오늘 출석 완료 ✓':'오늘도 반가워요!',box);
   const mood=cw09Field(box,'오늘의 기분','select');for(const t of ['😊 즐거워요','😌 편안해요','😐 보통이에요','😟 걱정돼요','😴 피곤해요']){const o=cw09El('option','',t,mood);o.value=t;}mood.value=old?.mood||'😊 즐거워요';
   const note=cw09Field(box,'선생님께 전하고 싶은 말 (선택)','textarea',old?.note||'',150);cw09Button(box,old?'기분 수정':'출석하기 · 5 MC',()=>campusAct(campusAttendance(mood.value,note.value)),'primary');
   const replies=campusReplies();cw09El('h3','','💌 선생님 답장 '+replies.length+'개',campusPanel);
   if(!replies.length)cw09El('p','','활동에 참여하면 선생님의 답장을 여기서 볼 수 있어요.',campusPanel);
   for(const {key,rec,title} of replies){const f=cw09El('div','cw09Form','',campusPanel);cw09El('strong','',title,f);cw09El('p','schoolAnswer',rec.feedback,f);}
   if(replies.some(({key,rec})=>(campusPerson().readReplies[key]||0)<(rec.feedbackAt||1)))campusTransaction(p=>{for(const {key,rec} of replies)p.readReplies[key]=rec.feedbackAt||1;});
  }
 }else if(campusView==='home')campusRenderHome(teacher);
 else if(campusView==='style')campusRenderStyle(teacher);
 else campusRenderExplore(teacher);
 cw09El('p','cw09Info','이 브라우저의 체험 기록입니다. 다른 기기·친구에게 실시간 공유되지 않아요.',campusPanel);
 campusUpdateBadge();
}
function campusRenderHome(teacher){
 const owner=campusOwner||(teacher?'학생 1':actorName()),mine=!teacher&&owner===actorName(),person=campusPerson(owner);
 cw09El('h3','',owner+'의 집과 공터',campusPanel);cw09El('p','','각 학생에게 집 1채와 24칸의 공터가 있어요. 장식은 한 종류씩 보유하며 회수해 다시 놓을 수 있어요.',campusPanel);
 if(typeof renderHomeShareControls==='function')renderHomeShareControls(campusPanel,owner,person);
 const ownerField=cw09Field(campusPanel,'방문할 집','select');for(let i=1;i<=30;i++){const n='학생 '+i,o=cw09El('option','',n,ownerField);o.value=n;}ownerField.value=owner==='선생님'?'학생 1':owner;ownerField.onchange=()=>{campusOwner=ownerField.value;campusPage=Math.floor((Number(campusOwner.replace('학생 ',''))-1)/6);campusPlace=null;campusRender();};
 cw09Button(campusPanel,'우리 동네 걸어보기',()=>{campusPage=Math.floor((Number((campusOwner||actorName()).replace('학생 ',''))-1)/6)||0;goMap('neighborhood');campusOpen('home');});
 if(!mine&&!teacher)cw09Button(campusPanel,'내 집으로',()=>{campusOwner=actorName();campusPage=Math.floor((Number(actorName().replace('학생 ',''))-1)/6);campusPlace=null;campusRender();});
 const yard=cw09El('div','campusYard','',campusPanel);const roof=CAMPUS_DECOR.find(x=>x.id===person.roof)?.color||'#8a7863';
 const house=cw09El('div','campusHouse','🏠 '+owner,yard);house.style.borderTopColor=roof;
 for(let cell=0;cell<24;cell++){
  const item=CAMPUS_DECOR.find(x=>person.layout[x.id]===cell),button=cw09El('button','campusCell',item?.icon||'·',yard);button.type='button';button.setAttribute('aria-label','공터 '+(cell+1)+'번 칸'+(item?' '+item.name:''));button.title=item?.name||'빈 공터';button.disabled=!mine;
  button.onclick=()=>{if(campusPlace)campusAct(campusPlaceItem(campusPlace,cell,owner));else{campusMessage='보관함에서 장식을 먼저 골라 주세요.';campusRender();}};
 }
 if(!mine){cw09El('p','cw09Info','방문 중인 집의 배치는 바꿀 수 없어요.',campusPanel);return;}
 cw09El('h3','','장식 보관함',campusPanel);
 cw09Button(campusPanel,'기본 지붕으로',()=>campusAct(campusTransaction(p=>{p.roof=null;})));
 if(!person.decor.length)cw09El('p','','아래 상점에서 첫 장식을 골라 보세요.',campusPanel);
 for(const id of person.decor){const item=CAMPUS_DECOR.find(x=>x.id===id);if(!item)continue;const row=cw09El('div','shopItem','',campusPanel);cw09El('span','',item.icon+' '+item.name,row);
  if(item.roof)cw09Button(row,person.roof===id?'사용 중':'지붕 바꾸기',()=>campusAct(campusTransaction(p=>{p.roof=id;})));
  else{cw09Button(row,campusPlace===id?'선택됨':'배치·이동',()=>{campusPlace=id;campusMessage=item.name+' 선택 · 공터의 빈 칸을 눌러 주세요.';campusRender();});if(person.layout[id]!==undefined)cw09Button(row,'회수',()=>campusAct(campusPlaceItem(id,null,owner)));}
 }
 const shop=cw09El('details','cw09Form','',campusPanel);cw09El('summary','','🛒 집 꾸미기 상점 · '+coinsOf(actorName())+' MC',shop);
 for(const item of CAMPUS_DECOR){const row=cw09El('div','shopItem','',shop);cw09El('span','',item.icon+' '+item.name+' · '+item.price+' MC',row);const b=cw09Button(row,person.decor.includes(item.id)?'보유':'구매',()=>campusAct(campusBuy(item.id)));b.disabled=person.decor.includes(item.id)||coinsOf(actorName())<item.price;}
}
function campusRenderStyle(teacher){
 if(teacher){cw09El('p','','학생 모드에서 문코인으로 구매하고 미리 볼 수 있어요.',campusPanel);return;}
 cw09El('p','','기존 일러스트 또는 옷·헤어·신발이 반영되는 꾸미기 전용 그림체를 선택해요. 기존 구매 기록을 그대로 사용해요.',campusPanel);
 const cv=cw09El('canvas','campusPreview','',campusPanel);cv.width=180;cv.height=220;campusDrawPreview(cv,currentAvatar());
 for(const [mode,title] of [['illustration','기존 일러스트'],['custom','꾸미기 캐릭터']]){const b=cw09Button(campusPanel,title,()=>campusAct(campusTransaction((p,s,n)=>{s.avatars[n]={...baseAvatar,...s.avatars[n],renderMode:mode};})));b.disabled=(currentAvatar().renderMode||'illustration')===mode;}
 for(const [key,title] of [['hair','헤어스타일'],['hairColor','머리색'],['cloth','의상'],['shoes','신발'],['acc','액세서리']]){
  const section=cw09El('details','cw09Form','',campusPanel);cw09El('summary','',title,section);
  itemLabels[key].forEach((label,i)=>{const price=key==='shoes'?20+i*10:prices[key]+(i>2?20:0),owned=owns(actorName(),key,i)||(Number(currentAvatar()[key])||0)===i,row=cw09El('div','shopItem','',section);cw09El('span','',label+(owned?' · 보유':' · '+price+' MC'),row);
   const b=cw09Button(row,owned?'착용':'구매·착용',()=>campusAct(campusBuyCosmetic(key,i)));b.disabled=!owned&&coinsOf(actorName())<price;
  });
 }
}
function campusRenderExplore(teacher){
 cw09El('h3','','나의 성장 도구',campusPanel);const stats=campusStats();cw09El('p','',Object.entries(stats).map(([k,v])=>CAMPUS_STATS[k]+' '+v).join(' · '),campusPanel);
 cw09El('p','','성장 도구는 해당 탐험의 힌트를 열어 줍니다. 이동 속도나 과제 점수에는 영향을 주지 않아요.',campusPanel);
 for(const item of CAMPUS_GEAR){const row=cw09El('div','cw09Form','',campusPanel);cw09El('strong','',item.icon+' '+item.name,row);cw09El('p','',item.desc+' · '+item.price+' MC',row);const b=cw09Button(row,campusPerson().gear.includes(item.id)?'사용 중':'도구 구매',()=>campusAct(campusBuy(item.id)));b.disabled=teacher||campusPerson().gear.includes(item.id)||coinsOf(actorName())<item.price;}
 cw09El('h3','','🗝️ 학습 던전',campusPanel);cw09El('p','','전투 대신 3개의 지식 관문을 통과하는 탐험이에요. 각 탐험은 하루 1회, 완료 시 20 MC와 15 XP를 받아요.',campusPanel);
 for(const [id,info] of Object.entries(CAMPUS_ROUTES)){const b=cw09Button(campusPanel,info.icon+' '+info.name+(campusRun(id).done?' · 오늘 완료':''),()=>{campusRoute=id;goMap('expedition');campusOpen('explore');},'primary');b.disabled=teacher;}
 if(currentMap!=='expedition'||teacher)return;
 const info=CAMPUS_ROUTES[campusRoute],run=campusRun(),box=cw09El('div','cw09Form','',campusPanel);cw09El('h3','',info.name+' · 관문 '+Math.min(run.step+1,3)+'/3',box);
 if(run.done){cw09El('p','cw09Done','탐험 완료 ✓ 오늘 보상은 이미 받았어요.',box);return;}
 const q=info.questions[run.step];cw09El('p','',q.q,box);const choices=[];q.options.forEach((text,i)=>{const lab=cw09El('label','cw09Choice','',box),r=cw09El('input','','',lab);r.type='radio';r.name='campus-puzzle';r.value=i;choices.push(r);cw09El('span','',text,lab);});
 if(stats[info.stat]>=2)cw09Button(box,'성장 도구로 힌트 보기',()=>{hint.textContent=q.hint;});
 const hint=cw09El('p','cw09Info','',box);hint.setAttribute('role','status');
 cw09Button(box,'관문 답하기',()=>{const i=choices.findIndex(x=>x.checked);if(i<0){hint.textContent='답을 선택해 주세요.';return;}campusAct(campusAnswer(campusRoute,i));},'primary');
}
// Personal neighborhood and dungeon use room-sized geometry, preserving plaza bounds.
maps.neighborhood={name:'우리 반 작은 동네',icon:'🏘️',desc:'집마다 작은 공터가 있어요.',spawn:[11,12]};
maps.expedition={name:'지식 탐험 던전',icon:'🗝️',desc:'세 개의 관문을 함께 배워요.',spawn:[11,12]};
portals.neighborhood=[{x:11,y:13,to:'plaza',label:'광장'}];portals.expedition=[{x:11,y:13,to:'plaza',label:'광장'}];
const campusLots=Array.from({length:6},(_,i)=>({x:4+(i%3)*7,y:4+Math.floor(i/3)*5}));
const campusOldSolid=solid;solid=function(x,y){if(!['neighborhood','expedition'].includes(currentMap))return campusOldSolid(x,y);return x<.8||x>21||y<2||y>13.3;};
const campusOldWorld=worldBase;worldBase=function(){
 if(!['neighborhood','expedition'].includes(currentMap))return campusOldWorld();
 ctx.save();ctx.fillStyle=currentMap==='neighborhood'?'#9fb990':CAMPUS_ROUTES[campusRoute].color;ctx.fillRect(0,0,MW*TILE,MH*TILE);
 if(currentMap==='neighborhood'){
  rounded(15,35,MW*TILE-30,MH*TILE-55,20,'#cfdbc2');rect(0,10.6*TILE,MW*TILE,30,'#d8c9ad');
  txt('우리 반 작은 동네 · '+(campusPage*6+1)+'~'+(campusPage*6+6)+'번 집',MW*TILE/2,53,22,'#365443');
  campusLots.forEach((lot,i)=>{const owner='학생 '+(campusPage*6+i+1),p=campusPerson(owner),x=lot.x*TILE,y=lot.y*TILE,roof=CAMPUS_DECOR.find(d=>d.id===p.roof)?.color||'#987b66';
   rounded(x-125,y-10,250,142,12,'#acc396');ctx.strokeStyle=owner===actorName()?'#c4953d':'#819975';ctx.lineWidth=3;ctx.strokeRect(x-125,y-10,250,142);
   ctx.fillStyle='#54725335';ctx.beginPath();ctx.ellipse(x+4,y+8,73,12,0,0,Math.PI*2);ctx.fill();
   const wall=ctx.createLinearGradient(x,y-65,x,y);wall.addColorStop(0,'#fff2d7');wall.addColorStop(1,'#dfca9e');rounded(x-56,y-62,112,65,5,wall);rect(x-59,y-4,118,8,'#9e9174');
   ctx.fillStyle=roof;ctx.beginPath();ctx.moveTo(x-69,y-57);ctx.lineTo(x,y-105);ctx.lineTo(x+69,y-57);ctx.closePath();ctx.fill();
   ctx.strokeStyle='#f4e1b64d';ctx.lineWidth=2;for(let tile=0;tile<4;tile++){ctx.beginPath();ctx.moveTo(x-48+tile*14,y-68-tile*8);ctx.lineTo(x+48-tile*14,y-68-tile*8);ctx.stroke();}
   rect(x+32,y-97,13,28,'#9a8267');rounded(x-14,y-38,28,42,4,'#5c7771');rect(x-9,y-33,18,30,'#73918a');rect(x+6,y-16,3,3,'#ead4a0');
   for(const wx of [x-39,x+25]){rounded(wx-2,y-40,19,23,3,'#a38c69');rect(wx,y-38,15,18,'#a3c8cc');rect(wx+6,y-38,2,18,'#f5e4bf');rect(wx,y-30,15,2,'#f5e4bf');rounded(wx-4,y-16,23,7,2,'#a88965');txt('🌼',wx+7,y-15,13);}
   for(let post=0;post<7;post++){const px=x-120+post*40;rect(px,y+120,5,17,'#f0e7ce');}rect(x-120,y+125,245,4,'#e2d9bf');
   for(let stone=0;stone<3;stone++)rounded(x-10,y+14+stone*17,20,9,3,'#ddd3b8');
   txt(owner+(owner===actorName()?' · 내 집':''),x,y-111,14,'#324d3e');
   for(const [id,cell] of Object.entries(p.layout)){const d=CAMPUS_DECOR.find(d=>d.id===id);if(d)txt(d.icon,x-103+(cell%6)*40,y+34+Math.floor(cell/6)*25,22);}
  });
 }else{
  const info=CAMPUS_ROUTES[campusRoute],run=campusRun();txt(info.icon+' '+info.name,MW*TILE/2,100,30,'#fff2cb');
  rounded(8*TILE,3*TILE,6*TILE,9*TILE,24,'#b2a991');
  for(let i=0;i<3;i++){const x=11*TILE,y=(4+i*2.6)*TILE;rounded(x-95,y-35,190,70,15,i<run.step?'#91b797':'#e5d4ae');txt(i<run.step?'✓ 통과':i===run.step?'✦ 도전 중':'🔒 다음 관문',x,y+7,20,'#3c5147');}
 }
 rounded(9.5*TILE,12.8*TILE,3*TILE,28,8,'#536d59');txt('광장으로',11*TILE,13.22*TILE,13,'#fff6df');ctx.restore();
};
const campusOldMini=cw05MiniDraw;cw05MiniDraw=function(now){if(!['neighborhood','expedition'].includes(currentMap))return campusOldMini(now);const c=$('#v05Mini'),g=c.getContext('2d');g.fillStyle='#a6bc99';g.fillRect(0,0,c.width,c.height);g.fillStyle='#47654e';for(const lot of campusLots)g.fillRect(lot.x/MW*c.width-7,lot.y/MH*c.height-5,14,10);g.fillStyle='#fff4c9';g.beginPath();g.arc(player.x/MW*c.width,player.y/MH*c.height,5,0,Math.PI*2);g.fill();$('.v05MiniLabel').textContent=currentMap==='neighborhood'?'우리 반 동네':'탐험 지도';};
canvas.addEventListener('click',e=>{if(currentMap!=='neighborhood'||$('#creatorOverlay').classList.contains('open'))return;const r=canvas.getBoundingClientRect(),x=(e.clientX-r.left-width/2)/CW05.zoom+cw05LastCamera.x,y=(e.clientY-r.top-height/2)/CW05.zoom+cw05LastCamera.y;const i=campusLots.findIndex(l=>Math.abs(x-l.x*TILE)<125&&y>l.y*TILE-105&&y<l.y*TILE+132);if(i>=0){campusOwner='학생 '+(campusPage*6+i+1);campusPlace=null;campusOpen('home');}});
const campusOldInteract=interact;interact=function(){if(nearby())return campusOldInteract();if(currentMap==='neighborhood'){let nearest=0,d=Infinity;campusLots.forEach((l,i)=>{const n=Math.hypot(player.x-l.x,player.y-l.y);if(n<d){d=n;nearest=i;}});campusOwner='학생 '+(campusPage*6+nearest+1);campusOpen('home');return;}if(currentMap==='expedition'){campusOpen('explore');return;}campusOldInteract();};
const campusOldGo=goMap;goMap=function(id){campusOldGo(id);if(['neighborhood','expedition'].includes(id)){if(id==='neighborhood'&&!campusOwner)campusOwner=actorName();campusOpen(id==='neighborhood'?'home':'explore');}else if(targetTab==='campus')campusRender();};
const campusOldRefresh=cw09RefreshStage;cw09RefreshStage=function(){campusOldRefresh();$('.sideTitle .tiny').textContent='v0.10';if(['neighborhood','expedition'].includes(currentMap)){cw09StageBtn.textContent=currentMap==='neighborhood'?'🏡 집·공터 보기':'🗝️ 탐험 관문 보기';cw09StageBtn.onclick=()=>campusOpen(currentMap==='neighborhood'?'home':'explore');}else cw09StageBtn.onclick=()=>{CW09.filter='here';CW09.selected=null;switchTab('activities');cw09Render();};};
// Optional code-drawn dress-up renderer; default approved illustration is retained.
const campusArtCache=new Map(),campusOldSprite=sprite,campusOldPreview=drawPreview;
function campusArt(av,dir='down',frame=0,small=false){
 const gender=ms093Gender(av,small),key=JSON.stringify([gender,av.hair,av.hairColor,av.cloth,av.face,av.acc,av.shoes,dir,frame]);if(campusArtCache.has(key))return campusArtCache.get(key);
 const c=document.createElement('canvas');c.width=90;c.height=120;const g=c.getContext('2d');g.drawImage(ms093Frame({...av,gender},dir,frame,small),0,0);
 const shoe=Number(av.shoes)||0;if(shoe){const wave=[0,2,0,-2][frame],left=wave===2?1:wave===-2?-2:0;if(dir==='left'){g.translate(90,0);g.scale(-1,1);}g.fillStyle=['#514439','#6a9aba','#cd8d9c','#61856c'][shoe];g.strokeStyle='#493e36';g.lineWidth=1.5;for(const [x,offset] of [[28,left],[48,-left]]){g.beginPath();g.roundRect(x+offset,101,13,10,3);g.fill();g.stroke();g.fillStyle='#f4e8d2';g.fillRect(x+offset,108,13,2);g.fillStyle=['#514439','#6a9aba','#cd8d9c','#61856c'][shoe];}}
 campusArtCache.set(key,c);if(campusArtCache.size>300)campusArtCache.clear();return c;
}
sprite=function(x,y,av,step=0,small=false,dir='down',moving=false){if(av.renderMode!=='custom')return campusOldSprite(x,y,av,step,small,dir,moving);const frame=moving?Math.floor(step)%4:0,s=small?.60:.72;ctx.save();ctx.imageSmoothingEnabled=true;ctx.drawImage(campusArt(av,dir,frame,small),x-45*s,y-116*s,90*s,120*s);ctx.restore();};
function campusDrawPreview(c,av){if(av.renderMode!=='custom')return campusOldPreview(c,av);const g=c.getContext('2d');g.clearRect(0,0,c.width,c.height);g.fillStyle='#f3ebdb';g.fillRect(0,0,c.width,c.height);const h=c.height*.90,w=h*.75;g.drawImage(campusArt(av),c.width/2-w/2,c.height*.94-h,w,h);}
drawPreview=function(c,av){return campusDrawPreview(c,av);};
const campusOldRenderAvatar=renderAvatar;renderAvatar=function(){campusOldRenderAvatar();const el=$('#avatar');cw09Button(el,'옷·헤어·신발 꾸미기 열기',()=>campusOpen('style'),'primary');};
const campusOldRenderShop=renderShop;renderShop=function(){campusOldRenderShop();cw09Button($('#shop'),'집 꾸미기·성장 도구 상점',()=>{campusOwner=actorName();campusOpen('home');},'primary');};
for(const id of ['role','studentChoice'])$('#'+id).addEventListener('change',()=>{campusOwner=null;campusPlace=null;campusMessage='';if(id==='studentChoice'&&currentMap==='neighborhood')campusPage=Math.floor((Number(actorName().replace('학생 ',''))-1)/6)||0;campusRender();campusUpdateBadge();});
window.addEventListener('storage',e=>{if([CAMPUS_KEY,dataKey,CW09.storageKey].includes(e.key)){campusData=campusLoad();campusRender();}});
const campusStyle=cw09El('style');campusStyle.textContent=`
 .tabs{display:flex;overflow-x:auto;gap:4px}.tabs button{flex:1 0 auto;min-width:48px}
 .campusNav{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:6px;margin-bottom:12px}.campusNav button{margin:0;font-size:12px}
 .campusYard{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:3px;padding:10px;background:#b0c29a;border:2px solid #82976f;border-radius:12px;margin:12px 0}
 .campusHouse{grid-column:1/-1;text-align:center;border-top:18px solid;padding:10px;background:#f0dfbf;border-radius:7px;margin:0 30px 8px;color:#3e5748;font-weight:700}
 .campusCell{height:38px;background:#d1dcb9;border:1px solid #96ab83;border-radius:5px;font-size:23px;color:#617655}.campusCell:disabled{opacity:1;cursor:default}
 .campusPreview{display:block;width:150px;height:183px;margin:10px auto;border-radius:15px}.campusNav~.primary{margin-top:8px}
 .campusPager{display:flex;gap:6px;flex-wrap:wrap}.campusPager button{font-size:12px}.schoolRecord textarea{margin:8px 0}.shopItem span{font-size:12px;overflow-wrap:anywhere}
`;document.head.append(campusStyle);
// Neighborhood pages contain six homes each; no fictitious online neighbors.
const campusBaseHome=campusRenderHome;campusRenderHome=function(teacher){campusBaseHome(teacher);const nav=cw09El('div','campusPager','',campusPanel);for(let page=0;page<5;page++){const b=cw09Button(nav,(page*6+1)+'~'+(page*6+6)+'번 동네',()=>{campusPage=page;goMap('neighborhood');});b.disabled=currentMap==='neighborhood'&&campusPage===page;}};
const campusOldActivities=cw09Render;cw09Render=function(){campusOldActivities();campusUpdateBadge();};
renderQuick();renderWorld();renderAvatar();renderShop();cw09RefreshStage();campusUpdateBadge();document.title='문스쿨 | 우리 반 생활 v0.10';
