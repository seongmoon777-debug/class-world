/* MoonSchool 0.9.4: additive migration; existing save keys and records stay intact. */
'use strict';
const SCHOOL_KINDS = {text:'짧은 답·의견',reading:'독서 기록',quiz:'학습 퀴즈',poll:'학급 투표',check:'실천 체크리스트'};
const schoolToday = () => new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
const schoolKey = a => a.daily ? a.id+'@'+schoolToday() : a.id;
// Read all supported types on reload and on same-browser storage events.
cw09Load = function(){
 let d={version:1,items:structuredClone(cw09Default),submissions:{},notice:''};
 try {const s=JSON.parse(localStorage.getItem(CW09.storageKey)||'null');if(s&&Array.isArray(s.items)&&s.submissions&&typeof s.submissions==='object')d={...d,...s};}catch(e){console.warn('활동 읽기 실패',e);}
 d.items=d.items.filter(a=>a&&typeof a.id==='string'&&SCHOOL_KINDS[a.kind]).map(a=>({...a,options:Array.isArray(a.options)?a.options:[]}));return d;
};
cw09Data=cw09Load();
const schoolSeeds=[
 {id:'ms094_reading',title:'책 속 마음을 발견해요',kind:'reading',place:'library',prompt:'책 제목, 읽은 쪽수와 기억에 남는 장면을 기록하세요.',reward:20,options:[]},
 {id:'ms094_fair',title:'안전하게 함께 운동하기',kind:'quiz',place:'gym',prompt:'운동하다 친구가 넘어졌어요. 가장 먼저 할 행동은?',reward:15,options:['그대로 경기를 계속한다','멈추고 친구 상태를 살피며 선생님께 알린다','친구를 놀린다'],correct:1,explanation:'운동보다 친구의 안전이 먼저예요. 선생님께 도움을 요청해요.'},
 {id:'ms094_ai',title:'AI가 알려주면 모두 사실일까요?',kind:'quiz',place:'lab',prompt:'AI가 과제에 쓸 정보를 알려 주었어요. 어떻게 할까요?',reward:20,options:['무조건 그대로 복사한다','책이나 믿을 만한 자료로 다시 확인한다','내 이름과 비밀번호를 알려 준다'],correct:1,explanation:'AI도 틀릴 수 있어요. 출처를 확인하고 개인정보는 입력하지 않아요.'},
 {id:'ms094_privacy',title:'AI와 개인정보',kind:'quiz',place:'lab',prompt:'AI에게 질문할 때 빼야 하는 정보는 무엇일까요?',reward:15,options:['식물이 자라는 조건','우리 집 주소와 전화번호','재활용하는 방법'],correct:1,explanation:'주소·전화번호·비밀번호 같은 개인정보는 AI에 입력하지 않아요.'},
 {id:'ms094_math',title:'교실 생각 퀴즈',kind:'quiz',place:'classroom',prompt:'연필 24자루를 6명에게 똑같이 나누면 한 명이 몇 자루를 받나요?',reward:15,options:['3자루','4자루','6자루'],correct:1,explanation:'24 ÷ 6 = 4이므로 한 명이 4자루를 받아요.'},
 {id:'ms094_reflect',title:'배운 것을 내 말로',kind:'text',place:'classroom',prompt:'오늘 새롭게 배운 것과 더 알고 싶은 질문을 한 가지씩 적어 보세요.',reward:15,options:[]},
 {id:'ms094_voice',title:'우리 반을 더 좋게 만드는 제안',kind:'text',place:'plaza',prompt:'친구들과 함께 바꾸고 싶은 점과 실천 방법을 제안하세요. 친구의 이름 대신 상황을 적어요.',reward:10,options:[]},
 {id:'ms094_daily',title:'하루를 여는 작은 실천',kind:'check',place:'classroom',prompt:'오늘 실제로 실천한 항목을 모두 체크하세요. 매일 새로운 기록을 남길 수 있어요.',reward:10,daily:true,options:['오늘의 학급 알림 읽기','학습 준비물 챙기기','친구에게 따뜻한 인사하기']},
 {id:'ms094_stretch',title:'오늘의 몸 돌보기',kind:'check',place:'gym',prompt:'무리하지 않는 범위에서 실천하고 기록하세요. 불편하면 멈추고 선생님께 알려요.',reward:10,daily:true,options:['내 몸 상태 확인하기','편안하게 몸 풀기','활동 후 물 마시고 쉬기']}
];
if(!cw09Data.school094){
 for(const a of schoolSeeds)if(!cw09Data.items.some(x=>x.id===a.id))cw09Data.items.push(a);
 cw09Data.school094=true;cw09Save();
}
cw09Rewarded=(id,person)=>!!cw09Data.submissions[schoolKey(cw09Data.items.find(a=>a.id===id)||{id})]?.[person];
const schoolSubs=a=>cw09Data.submissions[schoolKey(a)]||{};
const schoolField=cw09Field;let schoolFieldId=0;
cw09Field=function(parent,...args){const el=schoolField(parent,...args);el.id='school-field-'+(++schoolFieldId);const label=el.previousElementSibling;if(label?.tagName==='LABEL')label.htmlFor=el.id;return el;};
// Commit both existing stores together, rolling back if browser storage is full.
function schoolSubmit(activityId,value){
 if($('#role').value!=='student')return {error:'학생 모드에서 제출해 주세요.'};
 const data=cw09Load(),a=data.items.find(x=>x.id===activityId);
 if(!a||a.place!==currentMap)return {error:'활동 공간에 먼저 방문해 주세요.'};
 const key=schoolKey(a),user=actorName();if(data.submissions[key]?.[user])return {error:'이미 제출한 활동이에요.'};
 let answer='',correct=null;
 if(a.kind==='quiz'||a.kind==='poll'){
  if(!Number.isInteger(value)||value<0||value>=a.options.length)return {error:'답을 하나 선택해 주세요.'};
  answer=a.options[value];if(a.kind==='quiz')correct=value===a.correct;
 }else if(a.kind==='check'){
  if(!Array.isArray(value)||!a.options.length||!a.options.every((_,i)=>value.includes(i)))return {error:'실천한 항목을 모두 체크해 주세요.'};
  answer=a.options.join(' / ');
 }else if(a.kind==='reading'){
  if(!value||typeof value.title!=='string'||!value.title.trim()||!Number.isInteger(value.pages)||value.pages<1||value.pages>2000||typeof value.thought!=='string'||value.thought.trim().length<5)return {error:'책 제목, 읽은 쪽수(1~2000), 감상 5글자 이상을 입력해 주세요.'};
  answer=`『${value.title.trim().slice(0,100)}』 · ${value.pages}쪽 · ${value.thought.trim().slice(0,350)}`;
 }else{
  if(typeof value!=='string'||value.trim().length<5)return {error:'내 생각을 5글자 이상 적어 주세요.'};answer=value.trim().slice(0,500);
 }
 const oldState=localStorage.getItem(dataKey),oldData=localStorage.getItem(CW09.storageKey);
 let next;try{next=Object.assign(fresh(),JSON.parse(oldState||'null')||state);}catch{return {error:'학생 저장 정보를 읽지 못했어요. 새로고침 후 다시 시도해 주세요.'};}
 const mark='cw09-'+key,r=next.rewards[user]||(next.rewards[user]={});
 // Quiz rewards follow the existing quiz rule: correct answers earn coins once.
 const reward=correct===false?0:Math.max(0,Math.min(40,Number(a.reward)||0));
 const rec={answer,at:Date.now(),correct,reward:r[mark]?0:reward,reviewed:false};
 if(!r[mark]){r[mark]=true;next.coins[user]=(Number(next.coins[user])||0)+reward;next.xp[user]=(Number(next.xp[user])||0)+(correct===false?0:10);}
 (data.submissions[key]||(data.submissions[key]={}))[user]=rec;
 try{
  localStorage.setItem(dataKey,JSON.stringify(next));localStorage.setItem(CW09.storageKey,JSON.stringify(data));
 }catch(e){
  try{if(oldState===null)localStorage.removeItem(dataKey);else localStorage.setItem(dataKey,oldState);if(oldData===null)localStorage.removeItem(CW09.storageKey);else localStorage.setItem(CW09.storageKey,oldData);}catch{}
  return {error:'저장 공간이 부족해 제출하지 못했어요. 공간을 확보한 뒤 다시 시도해 주세요.'};
 }
 state=next;cw09Data=data;updateCoin();return {record:rec};
}
cw09FormFor=function(a,parent){
 const box=cw09El('div','cw09Form','',parent),rec=schoolSubs(a)[actorName()];
 cw09El('h3','',a.title,box);cw09El('p','',a.prompt,box);
 cw09El('p','cw09Info',`${cw09PlaceLabel(a.place)} · ${a.daily?'오늘 1회':'최초 1회'} · ${a.reward} MC${a.kind==='quiz'?' (정답 시)':''}`,box);
 if(rec){
  cw09El('p','cw09Done','✓ 제출 완료'+(rec.correct===true?' · 정답':rec.correct===false?' · 다시 배워요':''),box);
  cw09El('p','schoolAnswer',rec.answer,box);
  if(a.kind==='quiz')cw09El('p','',`정답: ${a.options[a.correct]} · ${a.explanation||''}`,box);
  cw09El('p','cw09Info',`${rec.reviewed?'교사 확인 완료':'교사 확인 대기'}${rec.reward!==undefined?' · 받은 보상 '+rec.reward+' MC':''}`,box);
  if(rec.feedback){cw09El('h3','','💌 선생님 답장',box);cw09El('p','schoolAnswer',rec.feedback,box);}return;
 }
 if(a.place!==currentMap){cw09Button(box,`${cw09PlaceLabel(a.place)}에서 참여하기`,()=>{goMap(a.place);CW09.selected=a.id;switchTab('activities');cw09Render();},'primary');return;}
 let read,write,inputs=[];
 if(a.kind==='text')write=cw09Field(box,'내 생각','textarea','',500);
 if(a.kind==='reading')read={title:cw09Field(box,'책 제목','input','',100),pages:cw09Field(box,'읽은 쪽수','input','',4),thought:cw09Field(box,'기억에 남는 장면과 이유','textarea','',350)};
 if(read){read.pages.type='number';read.pages.min='1';read.pages.max='2000';}
 if(['quiz','poll','check'].includes(a.kind))a.options.forEach((opt,i)=>{
  const lab=cw09El('label','cw09Choice','',box),input=cw09El('input','','',lab);input.type=a.kind==='check'?'checkbox':'radio';input.name='school-'+a.id;input.value=i;inputs.push(input);cw09El('span','',opt,lab);
 });
 const msg=cw09El('p','cw09Info','',box);msg.setAttribute('role','status');
 cw09Button(box,'활동 제출',()=>{
  const value=read?{title:read.title.value,pages:Number(read.pages.value),thought:read.thought.value}:write?write.value:a.kind==='check'?inputs.flatMap((x,i)=>x.checked?[i]:[]):inputs.findIndex(x=>x.checked);
  const result=schoolSubmit(a.id,value);if(result.error){msg.textContent=result.error;return;}renderShop();renderAvatar();cw09Render();
 },'primary');
};
function schoolTeacherForm(parent){
 const fold=cw09El('details','cw09Form','',parent);cw09El('summary','','+ 활동 만들기',fold);
 const title=cw09Field(fold,'활동 제목','input','',55),prompt=cw09Field(fold,'수행할 내용','textarea','',350);
 const kind=cw09Field(fold,'유형','select'),place=cw09Field(fold,'공간','select');
 Object.entries(SCHOOL_KINDS).forEach(([v,t])=>{const o=cw09El('option','',t,kind);o.value=v;});
 Object.entries(maps).forEach(([v,m])=>{const o=cw09El('option','',m.name,place);o.value=v;});place.value=currentMap;
 const options=cw09Field(fold,'퀴즈·투표·체크 항목 (한 줄에 하나, 2~6개)','textarea','',450);
 const correct=cw09Field(fold,'퀴즈 정답 번호 (1부터)','input','1',1);correct.type='number';correct.min=1;correct.max=6;
 const explanation=cw09Field(fold,'퀴즈 해설','textarea','',250),reward=cw09Field(fold,'문코인 (0~40)','input','15',2);reward.type='number';reward.min=0;reward.max=40;
 const lab=cw09El('label','cw09Choice','',fold),daily=cw09El('input','','',lab);daily.type='checkbox';cw09El('span','','매일 1회 활동으로 만들기 (한국 날짜 기준)',lab);
 const msg=cw09El('p','cw09Info','',fold);msg.setAttribute('role','status');
 cw09Button(fold,'새 활동 게시',()=>{
  if($('#role').value!=='teacher')return;
  const opts=options.value.split(/\r?\n/).map(x=>x.trim()).filter(Boolean),q=kind.value==='quiz',choice=['quiz','poll','check'].includes(kind.value),c=Number(correct.value)-1;
  if(title.value.trim().length<2||prompt.value.trim().length<3){msg.textContent='제목과 수행할 내용을 입력해 주세요.';return;}
  if(choice&&(opts.length<2||opts.length>6||new Set(opts).size!==opts.length)){msg.textContent='서로 다른 항목을 2~6개 입력해 주세요.';return;}
  if(q&&(!Number.isInteger(c)||c<0||c>=opts.length)){msg.textContent='실제 선택지의 정답 번호를 입력해 주세요.';return;}
  cw09Data=cw09Load();cw09Data.items.unshift({id:'ms094-'+crypto.randomUUID(),title:title.value.trim(),prompt:prompt.value.trim(),kind:kind.value,place:place.value,options:choice?opts:[],correct:q?c:null,explanation:q?explanation.value.trim():'',reward:Math.min(40,Math.max(0,Number(reward.value)||0)),daily:daily.checked});cw09Save();cw09Render();cw09RefreshStage();
 },'primary');
 const notice=cw09El('details','cw09Form','',parent);cw09El('summary','','학급 알림 수정',notice);const field=cw09Field(notice,'알림','textarea',cw09Data.notice,250);
 cw09Button(notice,'알림 저장',()=>{if($('#role').value!=='teacher')return;cw09Data=cw09Load();cw09Data.notice=field.value.trim();cw09Save();cw09Render();});
}
cw09Render=function(){
 if(!cw09Panel.classList.contains('active'))return;cw09Panel.replaceChildren();const teacher=$('#role').value==='teacher';
 cw09El('h2','',teacher?'우리 반 활동 관리':'나의 학교 활동',cw09Panel);
 if(cw09Data.notice){const f=cw09El('details','cw09Form','',cw09Panel);cw09El('summary','','📣 학급 알림',f);cw09El('p','',cw09Data.notice,f);}
 if(teacher)schoolTeacherForm(cw09Panel);
 const daily=cw09Data.items.filter(a=>a.daily),done=daily.filter(a=>cw09Rewarded(a.id,actorName())).length;
 if(!teacher)cw09El('p','cw09Info',`오늘의 실천 ${done}/${daily.length} · ${schoolToday()}`,cw09Panel);
 const filter=cw09El('div','cw09Two','',cw09Panel);
 for(const [v,t] of [['here','이 공간'],['all','전체 활동']])cw09Button(filter,t,()=>{CW09.filter=v;CW09.selected=null;cw09Render();},CW09.filter===v?'primary':'secondary');
 const items=cw09Data.items.filter(a=>CW09.filter!=='here'||a.place===currentMap);
 if(!items.length)cw09El('p','','이 공간에는 아직 활동이 없어요.',cw09Panel);
 for(const a of items){
  const sub=schoolSubs(a),rec=sub[actorName()],row=cw09El('div','cw09ActivityRow','',cw09Panel),name=cw09El('div','','',row);
  cw09El('div','title',(!teacher&&rec?'✓ ':'')+a.title,name);
  cw09El('div','meta',`${cw09PlaceLabel(a.place)} · ${SCHOOL_KINDS[a.kind]}${a.daily?' · 매일':''}${teacher?' · 제출 '+Object.keys(sub).length+'명':''}`,name);
  cw09Button(row,teacher?'현황':rec?'기록':'열기',()=>{CW09.selected=CW09.selected===a.id?null:a.id;cw09Render();});
  if(CW09.selected!==a.id)continue;
  if(!teacher){cw09FormFor(a,cw09Panel);continue;}
  const box=cw09El('div','cw09Form','',cw09Panel);cw09El('p','',a.prompt,box);
  if(a.kind==='poll'){for(const opt of a.options)cw09El('p','',`${opt}: ${Object.values(sub).filter(r=>r.answer===opt).length}표`,box);}
  // Keep every daily record available to the teacher, including earlier days.
  const history=Object.entries(cw09Data.submissions).filter(([key])=>key===a.id||key.startsWith(a.id+'@'));
  let count=0;for(const [key,records] of history)for(const [person,r] of Object.entries(records)){
   count++;const entry=cw09El('div','schoolRecord','',box);cw09El('strong','',person+(a.daily?' · '+key.split('@')[1]:''),entry);cw09El('p','schoolAnswer',r.answer,entry);
   cw09El('small','',new Date(r.at).toLocaleString('ko-KR',{timeZone:'Asia/Seoul'})+(r.correct===null||r.correct===undefined?'':r.correct?' · 정답':' · 오답'),entry);
   cw09Button(entry,r.reviewed?'확인 완료':'교사 확인',()=>{if($('#role').value!=='teacher')return;cw09Data=cw09Load();const latest=cw09Data.submissions[key]?.[person];if(latest){latest.reviewed=true;cw09Save();cw09Render();}});
   const reply=cw09Field(entry,'선생님 답장 · '+person,'textarea',r.feedback||'',300);
   cw09Button(entry,'답장 저장',()=>{if($('#role').value!=='teacher')return;cw09Data=cw09Load();const latest=cw09Data.submissions[key]?.[person];if(latest){latest.feedback=reply.value.trim();latest.feedbackAt=Date.now();latest.reviewed=true;cw09Save();cw09Render();}});
  }
  if(!count)cw09El('p','','아직 제출한 학생이 없어요.',box);
  cw09Button(box,'활동 삭제',()=>{if($('#role').value!=='teacher'||!confirm('활동을 삭제할까요? 기존 제출 기록과 문코인은 보존됩니다.'))return;cw09Data=cw09Load();cw09Data.items=cw09Data.items.filter(x=>x.id!==a.id);cw09Save();CW09.selected=null;cw09Render();cw09RefreshStage();});
 }
};
// Artwork contains three still views, not separate limb frames. Keep feet planted:
// horizontal mirroring only, no vertical bounce, stretch, rotation or fake back view.
sprite=function(cx,cy,av,step=0,small=false,dir='down',moving=false){
 const image=moonStyle1Image(ms093Gender(av,small),dir);
 if(!image?.complete||!image.naturalWidth){moonStyle1OldSprite(cx,cy,av,0,small,dir,false);return;}
 const h=small?62:83,w=h*image.naturalWidth/image.naturalHeight;
 ctx.save();ctx.fillStyle='#18261a47';ctx.beginPath();ctx.ellipse(cx,cy+3,small?13:16,4,0,0,Math.PI*2);ctx.fill();ctx.imageSmoothingEnabled=true;
 ctx.translate(cx,cy);if(dir==='right')ctx.scale(-1,1);ctx.drawImage(image,-w/2,-h,w,h);ctx.restore();
};
// Input focus / creator modal must not move an unseen character.
document.addEventListener('focusin',()=>pressed.clear());
document.addEventListener('keydown',e=>{if($('#creatorOverlay').classList.contains('open')){pressed.clear();e.stopImmediatePropagation();}},true);
document.addEventListener('visibilitychange',()=>{if(document.hidden)pressed.clear();});
const schoolStyle=document.createElement('style');schoolStyle.textContent=`
 .floatTop,.floatBottom,.cw06Float,.cw06MapNotice,.cw071Hover,.v05Online,.v05Legend{display:none!important}
 .cw09ActivityBar{position:static!important;transform:none!important;width:auto!important;max-width:none!important;font-size:12px!important;padding:9px 12px!important;min-height:40px;box-shadow:none}
 .schoolHelp{padding:8px 14px;font-size:12px;background:#fff9ed;color:#445c49}
 .schoolHelp summary,.cw09Form summary{cursor:pointer;font-weight:700}
 .schoolHelp p{margin:8px 0}.schoolAnswer{white-space:pre-wrap;overflow-wrap:anywhere;color:#40533e}
 .schoolRecord{padding:10px 0;border-bottom:1px solid #ddd}.schoolRecord small{display:block;margin-bottom:8px}
 .cw09ActivityRow{gap:8px}.cw09ActivityRow>div{min-width:0;overflow-wrap:anywhere}
 .cw09Choice input{width:20px;height:20px;flex-shrink:0}.cw09Choice{min-height:44px}
 .actionBtn{font-size:12px}button:focus-visible,summary:focus-visible{outline:3px solid #5277c8;outline-offset:3px}
 @media(max-width:650px){.schoolHelp{font-size:11px}}
 @media(prefers-reduced-motion:reduce){*{scroll-behavior:auto!important;transition:none!important}}
`;document.head.append(schoolStyle);
$('.gameTop').append(cw09StageBtn);
const help=cw09El('details','schoolHelp');cw09El('summary','','조작 도움말',help);cw09El('p','','방향키·WASD 또는 화면 방향 버튼으로 이동하고 E로 문에 들어가요. 장소 버튼으로 바로 이동할 수도 있어요. 활동 버튼을 눌러 작성하고 제출하세요.',help);$('.gameShell').append(help);
if(!cw08MiniCollapsed)miniToggle.click();
const schoolOldRefresh=cw09RefreshStage;
cw09RefreshStage=function(){schoolOldRefresh();$('.sideTitle .tiny').textContent='v0.9.4';$('.sideTitle strong').textContent='학교 활동';cw09StageBtn.textContent=`📋 이 공간 활동 ${cw09CountHere()}`;};
const schoolOldInteract=interact;
interact=function(){if(nearby()){schoolOldInteract();return;}if(shops[currentMap]){switchTab('shop');return;}CW09.filter='here';CW09.selected=null;switchTab('activities');cw09Render();};
// Remove permanent speech/name balloons; a small player name remains useful.
const schoolLabel=label;label=function(x,y,name,bg){if(bg==='#fff8ee')schoolLabel(x,y,name,bg);};
$('.footnote').textContent='이 브라우저에만 저장되는 체험판 · 다른 기기와 실시간 동기화되지 않습니다 · 교사/학생은 체험용 역할입니다.';
document.title='문스쿨 | 학교 활동 v0.9.4';CW09.filter='here';cw09RefreshStage();cw09Render();
