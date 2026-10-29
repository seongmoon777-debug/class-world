/* Daily welcome card. Local browser records; no remote synchronization. */
'use strict';
const DAILY_QUIZZES=[
 [
 ['수학','7 + 5는 얼마일까요?',['12','10','13'],0,'7에 3을 더해 10, 다시 2를 더하면 12예요.'],
 ['수학','세모의 꼭짓점은 몇 개일까요?',['4개','3개','2개'],1,'삼각형의 꼭짓점은 3개예요.'],
 ['국어','“작다”와 반대되는 말은?',['빠르다','길다','크다'],2,'크기가 작다와 크다는 서로 반대되는 말이에요.'],
 ['생활','손을 씻을 때 사용하는 것은?',['비누와 물','모래','물감'],0,'비누와 흐르는 물로 손을 깨끗하게 씻어요.'],
 ['수학','10에서 4를 빼면?',['5','6','7'],1,'10 - 4 = 6이에요.'],
 ['자연','다음 중 식물은?',['고양이','참새','해바라기'],2,'해바라기는 뿌리와 줄기, 잎이 있는 식물이에요.'],
 ['국어','문장이 끝날 때 쓰는 마침표는?',['.','?',','],0,'설명하는 문장 끝에는 마침표(.)를 써요.'],
 ['생활','도서관에서 책을 다 읽은 뒤에는?',['아무 데나 숨겨요','정해진 반납 장소에 놓아요','책장을 찢어요'],1,'함께 쓰는 책은 정해진 장소에 반납해요.']
 ],
 [
 ['수학','연필 24자루를 6명에게 똑같이 나누면?',['3자루','4자루','6자루'],1,'24 ÷ 6 = 4예요.'],
 ['과학','얼음이 녹으면 무엇이 될까요?',['돌','수증기만 돼요','물'],2,'얼음은 물의 고체 상태이며 녹으면 액체인 물이 돼요.'],
 ['수학','1m는 몇 cm일까요?',['100cm','10cm','1000cm'],0,'1m = 100cm예요.'],
 ['국어','“왜냐하면” 뒤에 이어질 내용은?',['제목','이유','인사'],1,'왜냐하면은 앞에서 말한 내용의 이유를 이어 줘요.'],
 ['사회','지도에서 방향을 알아보는 표시는?',['범례만','축척만','방위표'],2,'방위표는 동서남북의 방향을 알려 줘요.'],
 ['수학','오후 2시에서 1시간 30분 뒤는?',['오후 3시 30분','오후 2시 30분','오후 4시'],0,'1시간 뒤는 3시, 30분 더 지나면 3시 30분이에요.'],
 ['과학','자석에 잘 붙는 물체는?',['나무 막대','철 못','플라스틱 자'],1,'철은 자석에 잘 붙는 물질이에요.'],
 ['디지털','인터넷에서 찾은 정보를 과제에 쓰기 전에는?',['무조건 믿어요','제목만 봐요','출처와 내용을 확인해요'],2,'누가 만든 정보인지, 내용이 맞는지 확인해요.']
 ],
 [
 ['수학','1/2 + 1/4은?',['3/4','2/6','1/8'],0,'1/2을 2/4로 바꾸면 2/4 + 1/4 = 3/4이에요.'],
 ['과학','식물이 빛을 이용해 양분을 만드는 과정은?',['증발','광합성','응결'],1,'식물은 광합성을 통해 빛에너지를 이용하여 양분을 만들어요.'],
 ['수학','가로 8cm, 세로 5cm인 직사각형의 넓이는?',['26㎠','13㎠','40㎠'],2,'직사각형의 넓이는 가로 × 세로이므로 8 × 5 = 40㎠예요.'],
 ['사회','학급회의에서 서로 다른 의견이 나왔을 때는?',['근거를 듣고 함께 결정해요','큰 목소리만 따라요','다른 의견을 막아요'],0,'다른 의견을 존중하며 이유를 듣는 것이 민주적인 태도예요.'],
 ['수학','10, 20, 30의 평균은?',['30','20','60'],1,'합계 60을 자료 수 3으로 나누면 20이에요.'],
 ['국어','주장을 설득력 있게 만드는 것은?',['같은 말 반복','큰 글씨만 쓰기','주장을 뒷받침하는 근거'],2,'이유나 자료 등 근거가 있으면 주장을 이해하고 판단하기 쉬워요.'],
 ['과학','물에 녹은 소금을 다시 얻는 방법은?',['물을 증발시켜요','체로만 걸러요','물을 더 넣어요'],0,'물이 증발하고 나면 녹아 있던 소금을 얻을 수 있어요.'],
 ['수학','전체 20개 중 5개는 몇 %일까요?',['20%','25%','50%'],1,'5 ÷ 20 = 0.25이므로 25%예요.']
 ]
];
function dailyOrder(block,level){let seed=(Math.imul(block,1664525)^Math.imul(level,1013904223))>>>0;const a=[0,1,2,3,4,5,6,7];for(let i=7;i>0;i--){seed=(Math.imul(seed,1664525)+1013904223)>>>0;const j=seed%(i+1);[a[i],a[j]]=[a[j],a[i]];}return a;}
function dailyQuestion(day,level){const serial=Math.floor(Date.parse(day+'T00:00:00Z')/86400000),bank=DAILY_QUIZZES[level-1];if(!bank||!Number.isFinite(serial))return null;const block=Math.floor(serial/8),order=dailyOrder(block,level);if(order[0]===dailyOrder(block-1,level)[7])[order[0],order[1]]=[order[1],order[0]];const index=order[((serial%8)+8)%8],q=bank[index];const shift=((serial+level)%3+3)%3;return {id:level+'-'+index,subject:q[0],prompt:q[1],options:q[2].map((_,i)=>q[2][(i+shift)%3]),correct:(q[3]-shift+3)%3,explanation:q[4]};}
function dailyAnswer(day,level,id,choice){return campusTransaction((p,s,name)=>{if(day!==schoolToday())return {error:'날짜가 바뀌었어요. 오늘 문제를 다시 확인해 주세요.'};const q=dailyQuestion(day,level);if(!q||q.id!==id||!Number.isInteger(choice)||choice<0||choice>2||level!==2)return {error:'현재 문제를 다시 확인해 주세요.'};const mark='campus-daily-quiz|'+name+'|'+day;p.dailyQuiz=p.dailyQuiz||{};if(p.dailyQuiz[day]||s.rewards[mark])return {message:'오늘 퀴즈 보상은 이미 받았어요.'};if(choice!==q.correct)return {error:'조금만 더 생각해 볼까요? 다시 골라도 괜찮아요.'};p.dailyQuiz[day]={id,level,choice,at:Date.now(),reward:10};s.rewards[mark]=true;s.coins[name]=(Number(s.coins[name])||0)+10;return {message:'정답! 문코인 10 MC를 받았어요. '+q.explanation};});}
const dailyCard=cw09El('section','panel dailyWelcome','',$('.side'));dailyCard.id='dailyWelcome';const dailyTab=cw09El('button','','☀️ 오늘',$('.tabs'));dailyTab.dataset.tab='dailyWelcome';dailyTab.onclick=()=>{dailyRender();switchTab('dailyWelcome');};let dailyFeedback='',dailySignature='',dailyPreviewLevel=2;
function dailyRender(){if(new URLSearchParams(location.search).get('visit')==='home'){dailyCard.hidden=true;return;}dailyCard.hidden=false;const day=schoolToday(),teacher=$('#role').value!=='student',person=campusPerson(),level=2,done=!!person.dailyQuiz?.[day],attended=!!person.attendance?.[day],wasOpen=dailyCard.open;dailyCard.replaceChildren();cw09El('h2','',teacher?'오늘의 출석·퀴즈 · 교사용 미리보기':`오늘의 출석·퀴즈 ${attended?'✓ 출석':'출석 +5 MC'} · ${done?'✓ 퀴즈':'정답 +10 MC'}`,dailyCard);dailySignature=actorName()+'|'+day;
 const body=cw09El('div','dailyBody','',dailyCard),row=cw09El('div','dailyRow','',body);
 const mood=cw09El('select','','',row);mood.setAttribute('aria-label','출석 기분');for(const text of ['😐 보통이에요','😊 즐거워요','😌 편안해요','😟 걱정돼요','😴 피곤해요'])cw09El('option','',text,mood);mood.disabled=teacher||attended;const attendance=cw09Button(row,attended?'출석 완료 ✓':'출석하기 · 5 MC',()=>{const r=campusAttendance(mood.value,'');dailyFeedback=r.error||r.message;dailyRender();});attendance.disabled=teacher||attended;
 if(teacher)cw09El('p','', '학생 모드에서 출석하고 정답을 맞히면 보상을 받아요.',body);
 if(done&&!teacher){cw09El('p','','오늘 퀴즈 완료! 내일 새로운 문제로 만나요.',body);}else{const q=dailyQuestion(day,level);cw09El('p','dailyQuestion',q.subject+' · '+q.prompt,body);const choices=cw09El('div','dailyChoices','',body);q.options.forEach((label,i)=>{const b=cw09Button(choices,label,()=>{const r=dailyAnswer(day,level,q.id,i);dailyFeedback=r.error||r.message;dailyRender();});b.disabled=teacher;});}
 const status=cw09El('p','dailyFeedback',dailyFeedback,body);status.setAttribute('role','status');}
const dailyStyle=cw09El('style');dailyStyle.textContent='.dailyWelcome{margin:0;background:#fff9e9;border:1px solid #d7b568;border-radius:12px;padding:10px 14px;color:#213c50}.dailyWelcome summary{cursor:pointer;font-weight:bold}.dailyBody{padding-top:8px}.dailyRow,.dailyChoices{display:flex;gap:8px;flex-wrap:wrap}.dailyRow select,.dailyRow button,.dailyChoices button{min-height:40px}.dailyQuestion{margin:10px 0;font-weight:bold;font-size:16px;color:#213c50}.dailyFeedback{margin:8px 0 0;font-size:13px}.dailyFeedback:empty{display:none}.dailyChoices button{flex:1;min-width:100px}@media(max-width:540px){.dailyWelcome{margin:8px}.dailyRow select{max-width:140px}.dailyChoices{flex-direction:column}}';document.head.append(dailyStyle);
function dailyRefresh(){const signature=actorName()+'|'+schoolToday();if(signature!==dailySignature){dailyFeedback='';dailySignature='';dailyRender();}}
$('#role').addEventListener('change',()=>setTimeout(dailyRefresh,0));$('#studentChoice').addEventListener('change',()=>setTimeout(dailyRefresh,0));window.addEventListener('storage',e=>{if(e.key===CAMPUS_KEY||e.key===dataKey){campusData=campusLoad();dailyRender();}});window.addEventListener('focus',dailyRefresh);setInterval(dailyRefresh,30000);dailyRender();

const dailyOldAttendance=campusAttendance;campusAttendance=function(...args){const r=dailyOldAttendance(...args);dailyRender();return r;};
