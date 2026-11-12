/* One student task home. Uses existing submission, attendance and reward functions. */
(()=>{'use strict';if(new URLSearchParams(location.search).has('visit'))return;
let view='today',place='',selected=null,feedback='',identity='',rendering=false;
const teacher=()=>$('#role').value==='teacher';
const baseSwitch=switchTab,baseActivities=cw09Render,baseClass=cw06RenderClassroomPanel;
const steps=[['classroom','교실 과제','교실 활동 1개 제출','classroom'],['reading','독서 기록','책을 읽고 생각 남기기','library'],['dungeon','탐구 문제','한 분야의 문제 3개 풀기','lab']];
function progress(){return MoonLearningCore.status(schoolToday(),actorName(),campusPerson(),cw09Data.submissions,cw09Data.items);}
function meta(){cw09Tab.hidden=!teacher();cw09Tab.textContent='학급 관리';dailyTab.textContent='오늘의 과제';$('.sideTitle strong').textContent=teacher()?'학급 관리':'나의 학교생활';$('.sideTitle .tiny').textContent='MOONSCHOOL';cw09StageBtn.textContent='오늘의 과제';cw09StageBtn.title='오늘 할 일과 제출 기록';}
function navigate(next='today'){view=next;selected=null;feedback='';switchTab(next==='classroom'?'classroom':'dailyWelcome');}
function nav(parent){const n=cw09El('nav','todayNav','',parent);n.setAttribute('aria-label','과제 메뉴');for(const [id,label]of [['today','오늘 할 일'],['tasks','전체 과제'],['records','제출 기록'],['classroom','우리 교실']]){const b=cw09Button(n,label,()=>{place='';navigate(id);},view===id?'selected':'');b.setAttribute('aria-pressed',String(view===id));}}
function openTask(a){selected=a.id;view='tasks';render();}
function showWorld(){schoolPanelOpen(false);if(matchMedia('(max-width:850px)').matches)$('#stage')?.scrollIntoView({block:'start'});}
function actStep(id,destination){
 if(currentMap!==destination){goMap(destination);feedback=currentMap===destination?'도착했어요. 시작할 과제를 골라 주세요.':'문 가까이에서 E 또는 입장을 눌러 들어가 주세요.';render();if(currentMap!==destination)showWorld();return;}
 if(id==='dungeon'){MoonKnowledgeDungeon.open();return;}
 place=destination;navigate('tasks');
}
function taskList(parent,records=false){
 const filter=cw09El('div','todayFilter','',parent);
 if(!records){for(const [id,label]of [['','전체'],['classroom','교실'],['library','독서'],['here','이 공간']]){const b=cw09Button(filter,label,()=>{place=id;selected=null;render();},place===id?'selected':'');b.setAttribute('aria-pressed',String(place===id));}}
 const items=cw09Data.items.filter(a=>!place||a.place===(place==='here'?currentMap:place));
 if(records){
  const rows=Object.entries(cw09Data.submissions).flatMap(([key,people])=>people?.[actorName()]?[{key,rec:people[actorName()],a:cw09Data.items.find(a=>key===a.id||key.startsWith(a.id+'@'))}]:[]).sort((a,b)=>b.rec.at-a.rec.at);
  if(!rows.length)cw09El('p','todayHint','아직 제출한 기록이 없어요. 오늘 할 일부터 시작해 보세요.',parent);
  for(const {rec,a}of rows){const d=cw09El('details','todayRecord','',parent);cw09El('summary','',(a?.title||'지난 활동')+' · '+(rec.correct===false?'다시 살펴보기':rec.reviewed?'선생님 확인':'제출 완료'),d);cw09El('p','todayHint',new Date(rec.at).toLocaleString('ko-KR',{timeZone:'Asia/Seoul'})+' · 받은 보상 '+(rec.reward??0)+' MC',d);cw09El('p','schoolAnswer',rec.answer,d);if(rec.feedback)cw09El('p','schoolAnswer','선생님 답장: '+rec.feedback,d);}
  return;
 }
 const sorted=[...items].sort((a,b)=>Number(!!schoolSubs(a)[actorName()])-Number(!!schoolSubs(b)[actorName()]));
 if(!sorted.length)cw09El('p','todayHint','이곳에 등록된 과제가 없어요. 전체 과제를 확인해 보세요.',parent);
 for(const a of sorted){const rec=schoolSubs(a)[actorName()],row=cw09El('article','todayTask','',parent),copy=cw09El('div','','',row);cw09El('strong','',a.title,copy);cw09El('small','',cw09PlaceLabel(a.place)+' · '+(rec?'제출 완료':a.daily?'매일 1회':'최초 1회')+' · '+(rec?'받은 보상 '+(rec.reward??0):a.reward)+' MC',copy);cw09Button(row,selected===a.id?'접기':rec?'기록 보기':'과제 보기',()=>{selected=selected===a.id?null:a.id;render();});if(selected===a.id){const detail=cw09El('div','todayTaskDetail','',parent);cw09FormFor(a,detail);}}
}
function render(){if(rendering)return;rendering=true;try{
 const day=schoolToday(),who=actorName()+'|'+day;if(identity!==who){identity=who;view='today';place='';selected=null;feedback='';}
 dailySignature=who;dailyCard.replaceChildren();meta();
 cw09El('h2','','오늘의 과제',dailyCard);const date=cw09El('time','todayDate',new Date(day+'T12:00:00+09:00').toLocaleDateString('ko-KR',{timeZone:'Asia/Seoul',year:'numeric',month:'long',day:'numeric',weekday:'long'}),dailyCard);date.dateTime=day;
 nav(dailyCard);
 cw09Button(dailyCard,'마을 화면 보기',showWorld,'todayWorld');
 if(teacher()){cw09El('p','todayHint','학급 관리에서 과제를 만들고 학생 제출을 확인하세요.',dailyCard);cw09Button(dailyCard,'과제 만들기 · 제출 확인',()=>switchTab('activities'),'todayPrimary');return;}
 if(feedback)cw09El('p','todayFeedback',feedback,dailyCard).setAttribute('role','status');
 if(view==='tasks'||view==='records'){taskList(dailyCard,view==='records');return;}
 const person=campusPerson(),r=progress(),attended=!!person.attendance?.[day];
 const attendance=cw09El('div','todayAttendance','',dailyCard);cw09El('strong','',attended?'✓ 오늘 출석 완료':'오늘도 반가워요!',attendance);
 if(!attended)cw09Button(attendance,'출석하기 · 5 MC',()=>{const result=campusAttendance('😐 보통이에요','');feedback=result?.error||result?.message||'출석 완료!';render();});
 const bar=cw09El('div','todayProgress','',dailyCard);cw09El('strong','',r.complete?'오늘 할 일을 모두 마쳤어요!':'오늘 할 일 '+r.count+' / 3 완료',bar);const meter=cw09El('progress','','',bar);meter.max=3;meter.value=r.count;meter.setAttribute('aria-label','오늘의 필수 학습 완료 수');
 if(!r.complete)cw09El('p','todayHint','아래에서 아직 하지 않은 과제를 시작해 보세요.',dailyCard);
 for(const [id,label,hint,destination] of steps){const row=cw09El('article','todayStep'+(r[id]?' done':''),'',dailyCard),copy=cw09El('div','','',row);cw09El('strong','',(r[id]?'✓ ':steps.findIndex(x=>x[0]===id)+1+'. ')+label,copy);cw09El('small','',r[id]?'오늘 완료':hint,copy);const b=cw09Button(row,r[id]?'완료':currentMap===destination?'시작하기':'입구로 가기',()=>actStep(id,destination));b.disabled=r[id];}
 const finish=cw09El('div','todayFinish','',dailyCard);cw09El('strong','',r.complete?'이제 모험을 즐겨요':'3가지를 마치면 모험이 열려요',finish);
 if(r.complete){cw09Button(finish,'숲 탐험',()=>MoonForest.show());cw09Button(finish,'탑 도전',()=>MoonTower.open());}
 if(cw09Data.notice){const notice=cw09El('details','todayRecord','',dailyCard);cw09El('summary','','학급 알림',notice);cw09El('p','schoolAnswer',cw09Data.notice,notice);}
 cw09Button(dailyCard,'선생님 과제 · 다른 활동 모두 보기',()=>{place='';navigate('tasks');},'todayLink');
 }finally{rendering=false;}}
dailyRender=render;
const refreshLearning=MoonLearning.refresh;MoonLearning.refresh=function(...args){const result=refreshLearning(...args);render();return result;};
switchTab=function(id){
 if(!teacher()&&id==='activities'){view='tasks';place=CW09.filter==='here'?'here':'';selected=CW09.selected;id='dailyWelcome';}
 if(id==='mission')id='dailyWelcome';
 if(id==='classroom')view='classroom';else if(view==='classroom')view='today';
 const result=baseSwitch(id);$('#mission').classList.remove('active');if(id==='dailyWelcome')render();meta();return result;
};
cw09Render=function(...args){if(teacher())return baseActivities(...args);if(targetTab==='dailyWelcome')render();};
cw06RenderClassroomPanel=function(...args){const result=baseClass(...args);const panel=$('#classroom');panel.querySelector('.learningNav')?.remove();panel.querySelector('.todayNav')?.remove();const wrap=cw09El('div');nav(wrap);panel.prepend(wrap.firstElementChild);return result;};
const refreshStage=cw09RefreshStage;cw09RefreshStage=function(...args){const result=refreshStage(...args);meta();return result;};
cw09StageBtn.onclick=()=>navigate();dailyTab.onclick=()=>navigate();cw09Tab.onclick=()=>switchTab('activities');
// The separate classroom shortcut keeps its doorway action and a distinct label.
if(typeof classroomEntry!=='undefined'){classroomEntry.textContent='교실 입구';classroomEntry.title='교실 문 앞으로 이동';}
const style=cw09El('style');style.textContent=`
.tabs button[hidden]{display:none!important}.todayDate{display:block;color:#53665c;font-size:13px;margin:-6px 0 14px}.todayNav{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:4px;margin:0 0 16px;padding:4px;background:#e7eee8;border-radius:10px}.todayNav button{border:0;border-radius:7px;background:transparent;color:#314b40;padding:9px 2px;font-size:12px;min-height:40px}.todayNav .selected{background:#244b46;color:white;font-weight:700}.todayAttendance,.todayStep,.todayTask{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:13px 12px;border:1px solid #cad7ca;border-radius:10px;background:#fffef8;margin:9px 0}.todayAttendance{background:#edf5e9}.todayStep>div,.todayTask>div{min-width:0;flex:1}.todayStep strong,.todayTask strong{display:block;font-size:14px;line-height:1.5;overflow-wrap:anywhere}.todayStep small,.todayTask small{display:block;font-size:12px;color:#52665b;margin-top:4px;line-height:1.5}.todayStep button,.todayTask button,.todayAttendance button,.todayFinish button,.todayPrimary{min-height:40px;padding:8px 10px;border:1px solid #2e6251;border-radius:8px;background:#2e6251;color:#fff;font-size:12px;flex-shrink:0}.todayStep.done{background:#f0f3ec}.todayStep button:disabled{background:#e4ece2;color:#466149;border-color:#c7d5c4;opacity:1}.todayProgress{margin-top:16px}.todayProgress strong{font-size:14px}.todayProgress progress{display:block;width:100%;height:9px;accent-color:#2e6251;margin:8px 0}.todayHint,.todayFeedback{font-size:13px;line-height:1.6;color:#52665b}.todayFeedback{color:#214c39}.todayFinish{margin:16px 0;padding:12px 0;border-top:1px solid #d5ded3;font-size:13px}.todayFinish strong{display:block;margin-bottom:9px}.todayFinish button{margin-right:6px}.todayLink{border:0;background:transparent;color:#325e4e;padding:10px 0;text-align:left;font-size:13px}.todayFilter{display:flex;flex-wrap:wrap;gap:5px}.todayFilter button{padding:8px;border:1px solid #bdcbbb;border-radius:7px;background:#fffdf3;color:#3c5146}.todayFilter .selected{background:#dce9db;font-weight:bold}.todayRecord{border-bottom:1px solid #d4ded1;padding:12px 0;font-size:13px;line-height:1.6}.todayRecord summary{cursor:pointer;font-weight:700}.todayTaskDetail .cw09Form{margin:0 0 14px!important}.todayTaskDetail input,.todayTaskDetail textarea{box-sizing:border-box;max-width:100%}.todayTaskDetail .cw09Form p{font-size:13px;line-height:1.6}.todayTaskDetail button{min-height:40px}.todayTaskDetail h3{font-size:15px}.todayTaskDetail{overflow-wrap:anywhere}.todayAttendance strong{font-size:13px}@media(max-width:450px){.todayNav button{font-size:11px}.todayStep,.todayTask{padding:10px 9px;gap:6px}.todayTask button{font-size:11px;padding:8px}.todayStep strong,.todayTask strong{font-size:13px}}
@media(max-width:850px){body.cwUiOpen .layout>.side{order:-1}}.todayWorld{display:block;margin:-6px 0 12px auto;padding:5px 0;background:none;border:0;color:#436454;font-size:12px;text-decoration:underline}
`;document.head.append(style);
for(const id of ['role','studentChoice'])$('#'+id).addEventListener('change',()=>{identity='';navigate();});
window.MoonToday={open:()=>navigate(),render,progress};navigate();
})();

