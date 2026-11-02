/* Optional online layer. Existing local activities and economy are never uploaded. */
(() => {
 'use strict';
 if(new URLSearchParams(location.search).has('visit')) return;
 const config={apiKey:'AIzaSyBzCDQzfNsyGF8iO9IO2RnPqPpJRv8z-fQ',authDomain:'moonschool-class-world.firebaseapp.com',projectId:'moonschool-class-world',appId:'1:750686498820:web:e62e7f305a77647f814551',databaseURL:'https://moonschool-class-world-default-rtdb.asia-southeast1.firebasedatabase.app'};
 const root=document.createElement('dialog');root.id='onlineSchool';root.setAttribute('aria-label','온라인 학급');
 const style=document.createElement('style');style.textContent='#onlineSchool{width:min(440px,90vw);max-height:85vh;overflow:auto;border:2px solid #47654f;border-radius:18px;padding:22px;color:#263d34;background:#fffaf0}#onlineSchool::backdrop{background:#142b4366}#onlineSchool input,#onlineSchool textarea{display:block;box-sizing:border-box;width:100%;margin:8px 0;padding:10px}#onlineSchool button{margin:5px;padding:9px;border-radius:9px}#onlineSchool p{line-height:1.6}#onlineSchool .notice{font-size:13px;color:#526358}#onlineSchool code{user-select:all;font-size:18px}';document.head.append(style);document.body.append(root);
 const open=document.createElement('button');open.type='button';open.textContent='🌐 온라인 학급';document.querySelector('.gameTop').append(open);
 let sdk,auth,db,user=null,code='',meta=null,approved=false,connected=false,generation=0,offs=[],presence=null,timer=null,remote={},lastSent=0,busy=false;
 const el=(tag,text,parent=root)=>{const n=document.createElement(tag);if(text)n.textContent=text;parent.append(n);return n;};
 const btn=(text,fn,parent=root)=>{const n=el('button',text,parent);n.type='button';n.onclick=()=>act(fn);return n;};
 const field=(label,max=30)=>{const l=el('label',label),n=el('input','',l);n.maxLength=max;n.setAttribute('aria-label',label);return n;};
 const message=el('p','');message.setAttribute('role','status');
 const say=text=>{message.textContent=text;root.append(message);};
 const member=()=>approved||meta?.owner===user?.uid;
 const owner=()=>!!user&&meta?.owner===user.uid;
 const ref=path=>sdk.ref(db,path);
 const base=()=>`classes/${code}`;
 async function act(fn){if(busy)return;busy=true;try{await fn();}catch(e){const c=String(e.code||'');say(c.includes('popup-closed')?'로그인이 취소됐어요.':c.includes('popup-blocked')?'팝업을 허용한 뒤 다시 눌러 주세요.':c.includes('permission')||c.includes('PERMISSION')?'학급 접근 권한이 없거나 서버 연결 설정이 아직 준비되지 않았어요.':'연결하지 못했어요. 인터넷 연결을 확인하고 다시 시도해 주세요.');}finally{busy=false;}}
 async function init(){
  if(sdk)return;
  const url='https://www.gstatic.com/firebasejs/13.1.0/';
  const modules=await Promise.all(['app','auth','database'].map(x=>import(url+`firebase-${x}.js`)));
  sdk=Object.assign({},...modules);const app=sdk.initializeApp(config,'moonschool-online');auth=sdk.getAuth(app);db=sdk.getDatabase(app);
  await sdk.setPersistence(auth,sdk.browserSessionPersistence);
  sdk.onAuthStateChanged(auth,u=>{stop();user=u;code='';meta=null;render();});
 }
 function stop(){generation++;offs.splice(0).forEach(fn=>fn());if(timer)clearInterval(timer);timer=null;if(presence){sdk.remove(presence).catch(()=>{});presence=null;}approved=false;connected=false;remote={};for(const k of CW05.remote.keys())if(k.startsWith('net:'))CW05.remote.delete(k);open.textContent='🌐 온라인 학급';}
 function avatar(){const a=currentAvatar(),out={};for(const k of ['hair','face','hairColor','cloth','acc','shoes'])out[k]=Number.isInteger(a[k])&&a[k]>=0&&a[k]<=20?a[k]:0;out.gender=a.gender==='girl'?'girl':'boy';return out;}
 function drawPeers(){
  const ids=new Set();if(!connected||!member())return;
  for(const [uid,sessions] of Object.entries(remote)){if(uid===user.uid)continue;for(const [sid,p] of Object.entries(sessions||{})){
   if(!p||Date.now()-p.at>20000||p.map!==currentMap||p.page!==(currentMap==='neighborhood'?campusPage:0))continue;
   const id='net:'+uid+':'+sid;ids.add(id);const old=CW05.remote.get(id)||{rx:p.x,ry:p.y,phase:0};CW05.remote.set(id,{...old,...p,id,last:Date.now()});
  }}
  for(const k of CW05.remote.keys())if(k.startsWith('net:')&&!ids.has(k))CW05.remote.delete(k);
 }
 async function send(){if(!connected||!member()||!presence||document.hidden||Date.now()-lastSent<500)return;lastSent=Date.now();await sdk.set(presence,{name:displayName(),map:currentMap,x:player.x,y:player.y,dir:CW05.facing||'down',moving:!!CW05.moving,av:avatar(),page:currentMap==='neighborhood'?campusPage:0,at:sdk.serverTimestamp()});}
 function displayName(){return (sessionStorage.getItem('moon-online-name')||'친구').slice(0,16);}
 async function startPresence(token){
  if(timer||token!==generation||!member())return;
  // Local test-tab presence must not mix with an authenticated class.
  if(cw05Channel){cw05Channel.close();cw05Channel=null;}CW05.remote.clear();
  const p=sdk.push(ref(base()+'/presence/'+user.uid));presence=p;
  offs.push(sdk.onValue(ref(base()+'/presence'),s=>{if(token===generation)remote=s.val()||{};},()=>{stop();render();say('학급 연결이 해제됐어요. 다시 입장해 주세요.');}));
  offs.push(sdk.onValue(ref('.info/connected'),async s=>{
   if(token!==generation)return;connected=s.val()===true;open.textContent=connected?'🟢 학급 연결됨':'🌐 재연결 중';
   if(connected){try{await sdk.onDisconnect(p).remove();if(token===generation)await send();}catch{if(token===generation){connected=false;say('공유 연결을 설정하지 못했어요.');}}}
   else{remote={};for(const k of CW05.remote.keys())if(k.startsWith('net:'))CW05.remote.delete(k);}
  }));
  timer=setInterval(()=>{drawPeers();send().catch(()=>{if(token===generation){stop();render();say('연결이 끊겼어요. 다시 입장해 주세요.');}});},100);
 }
 async function enter(raw){
  const next=raw.trim().toUpperCase();if(!/^[A-F0-9]{12}$/.test(next)){say('학급 코드 12자리를 확인해 주세요.');return;}
  stop();code=next;meta=null;const token=generation;
  const s=await sdk.get(ref(base()+'/info'));if(token!==generation)return;
  if(!s.exists()){code='';render();say('해당 학급을 찾지 못했어요.');return;}
  meta=s.val();render();
  if(owner()){approved=true;await startPresence(token);watchTeacher(token);watchNotice(token);render();}
  else offs.push(sdk.onValue(ref(base()+'/members/'+user.uid),s=>{if(token!==generation)return;const ok=s.val()===true;if(approved&&!ok){stop();meta=null;render();say('학급 참여가 해제됐어요.');return;}approved=ok;if(ok){startPresence(token);watchNotice(token);}render();},()=>{stop();meta=null;render();}));
 }
 let noticeOff=null;
 function watchNotice(token){if(noticeOff)return;const off=sdk.onValue(ref(base()+'/notice'),s=>{if(token===generation){const n=root.querySelector('[data-notice]');if(n)n.textContent=s.val()||'아직 공지가 없어요.';}},()=>{});noticeOff=off;offs.push(()=>{off();noticeOff=null;});}
 function watchTeacher(token){offs.push(sdk.onValue(ref(base()+'/requests'),s=>{if(token!==generation)return;const box=root.querySelector('[data-requests]');if(!box)return;box.replaceChildren();for(const [uid,r] of Object.entries(s.val()||{})){const line=el('p',r.name,box);btn('참여 승인',async()=>{await sdk.set(ref(base()+'/members/'+uid),true);await sdk.remove(ref(base()+'/requests/'+uid));say('참여를 승인했어요.');},line);}},()=>{}));}
 function render(){
  root.replaceChildren();btn('닫기',()=>root.close());el('h2','온라인 학급');
  el('p','공유: 같은 공간의 캐릭터 위치·옷차림, 학급 공지. 출석·문코인·과제·집은 아직 이 기기에 저장됩니다.').className='notice';
  if(!user){const login=btn('Google 계정으로 로그인',async()=>{await sdk.signInWithPopup(auth,new sdk.GoogleAuthProvider());});login.disabled=!auth;el('p','공용 기기에서는 사용 후 로그아웃해 주세요.').className='notice';return;}
  el('p','구글 로그인됨');btn('로그아웃',async()=>{stop();await sdk.signOut(auth);});
  if(!meta){const n=field('학급에서 쓸 이름',16);n.value=displayName();const c=field('학급 코드',12);btn('학급 입장',async()=>{if(!n.value.trim()){say('학급에서 쓸 이름을 입력해 주세요.');return;}sessionStorage.setItem('moon-online-name',n.value.trim());await enter(c.value);});
   const detail=el('details');el('summary','교사: 새 학급 만들기',detail);const label=el('label','학급 이름',detail),name=el('input','',label);name.maxLength=30;name.setAttribute('aria-label','새 학급 이름');
   btn('새 학급 만들기',async()=>{if(!name.value.trim())return say('학급 이름을 입력해 주세요.');const bytes=crypto.getRandomValues(new Uint8Array(6));const id=Array.from(bytes,x=>x.toString(16).padStart(2,'0')).join('').toUpperCase();await sdk.set(ref(`classes/${id}/info`),{owner:user.uid,name:name.value.trim(),created:sdk.serverTimestamp()});await enter(id);},detail);return;
  }
  el('h3',meta.name);el('code',code);btn('학급 나가기',()=>{stop();meta=null;code='';render();});
  if(!member()){el('p','교사 승인 후 연결됩니다.');btn('참여 요청 보내기',async()=>{await sdk.set(ref(base()+'/requests/'+user.uid),{name:displayName()});say('교사에게 참여를 요청했어요.');});return;}
  el('h3','학급 공지');el('p','공지를 불러오는 중…').dataset.notice='';
  // Reload current notice after a UI render without accumulating listeners.
  sdk.get(ref(base()+'/notice')).then(s=>{const n=root.querySelector('[data-notice]');if(n&&member())n.textContent=s.val()||'아직 공지가 없어요.';}).catch(()=>{});
  if(owner()){const n=el('textarea');n.maxLength=500;n.setAttribute('aria-label','학급 공지 내용');btn('공지 저장',()=>sdk.set(ref(base()+'/notice'),n.value.trim()));el('h3','참여 요청');el('div').dataset.requests='';const token=generation;
   sdk.get(ref(base()+'/requests')).then(s=>{if(token!==generation)return;const box=root.querySelector('[data-requests]');if(!box)return;box.replaceChildren();for(const [uid,r] of Object.entries(s.val()||{})){const line=el('p',r.name,box);btn('참여 승인',async()=>{await sdk.set(ref(base()+'/members/'+uid),true);await sdk.remove(ref(base()+'/requests/'+uid));},line);}}).catch(()=>{});
  }
 }
 open.onclick=()=>{render();root.showModal();if(!sdk)act(async()=>{await init();render();});};root.addEventListener('close',()=>{pressed.clear();});
 window.addEventListener('pagehide',()=>{if(presence)sdk.remove(presence).catch(()=>{});});
 render();
})();
