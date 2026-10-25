/* Read-only house snapshots. No account, coin, attendance or assignment data. */
'use strict';
function homeShareSnapshot(owner,person=campusPerson(owner)){
 const av={...baseAvatar,...state.avatars[owner],gender:profileOf(owner)?.gender||state.avatars[owner]?.gender||'boy'};
 return {v:1,name:String(profileOf(owner)?.nickname||owner).slice(0,12),at:Date.now(),avatar:{gender:av.gender,hair:av.hair,hairColor:av.hairColor,cloth:av.cloth,face:av.face,acc:av.acc,shoes:av.shoes||0,renderMode:av.renderMode||'illustration'},roof:person.roof||null,layout:Object.entries(person.layout).filter(([id])=>CAMPUS_DECOR.some(x=>x.id===id&&!x.roof))};
}
function homeShareEncode(data){const bytes=new TextEncoder().encode(JSON.stringify(data));return btoa(String.fromCharCode(...bytes)).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');}
function homeShareDecode(encoded){
 try{
  if(typeof encoded!=='string'||!encoded.length||encoded.length>8192||!/^[A-Za-z0-9_-]+$/.test(encoded))return null;
  const bytes=Uint8Array.from(atob(encoded.replace(/-/g,'+').replace(/_/g,'/')),x=>x.charCodeAt(0));
  const d=JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(bytes));
  if(!d||d.v!==1||typeof d.name!=='string'||d.name.length>12||!d.name.trim()||!d.avatar||!Array.isArray(d.layout)||d.layout.length>24)return null;
  const a=d.avatar;if(!['boy','girl'].includes(a.gender)||!['illustration','custom'].includes(a.renderMode))return null;
  for(const [key,max] of [['hair',4],['hairColor',4],['cloth',4],['face',2],['acc',3],['shoes',3]])if(!Number.isInteger(a[key])||a[key]<0||a[key]>max)return null;
  if(d.roof!==null&&!CAMPUS_DECOR.some(x=>x.roof&&x.id===d.roof))return null;
  const ids=new Set(),cells=new Set();
  for(const row of d.layout){if(!Array.isArray(row)||row.length!==2)return null;const [id,cell]=row;if(!CAMPUS_DECOR.some(x=>x.id===id&&!x.roof)||ids.has(id)||!Number.isInteger(cell)||cell<0||cell>=24||cells.has(cell))return null;ids.add(id);cells.add(cell);}
  const avatar=Object.fromEntries(['gender','hair','hairColor','cloth','face','acc','shoes','renderMode'].map(k=>[k,a[k]]));
  return {v:1,name:d.name,avatar,roof:d.roof,layout:d.layout.map(([id,cell])=>[id,cell]),at:Number.isFinite(d.at)&&d.at>0&&d.at<Date.now()+86400000?d.at:null};
 }catch{return null;}
}
function homeShareLink(owner,person){
 const data=homeShareSnapshot(owner,person);if(!homeShareDecode(homeShareEncode(data)))throw new Error('집 정보를 확인한 뒤 다시 공유해 주세요.');
 const url=new URL(location.href);url.searchParams.set('visit','home');url.hash='home='+homeShareEncode(data);return url.href;
}
function renderHomeShareControls(parent,owner,person){
 const box=cw09El('details','cw09Form homeShareControls','',parent);cw09El('summary','','🔗 다른 사람에게 집 보여 주기',box);
 cw09El('p','','별명·캐릭터·배치한 장식만 담은 구경 링크예요. 로그인 없이 열 수 있고 코인·출석·과제는 포함하지 않아요.',box);
 cw09El('p','cw09Info','링크를 만든 시점의 모습입니다. 집을 바꿨다면 새 링크를 만들어 보내 주세요.',box);
 const field=cw09Field(box,'집 구경 링크','textarea','',8192);field.readOnly=true;field.rows=3;field.placeholder='아래 버튼으로 링크를 만들어 주세요.';
 const message=cw09El('p','cw09Info','',box);message.setAttribute('role','status');
 cw09Button(box,'집 공유 링크 만들기·복사',async()=>{
  try{field.value=homeShareLink(owner,person);try{await navigator.clipboard.writeText(field.value);message.textContent='링크를 복사했어요. 다른 사람에게 보내 주세요.';}catch{field.focus();field.select();message.textContent='링크가 준비됐어요. 선택된 주소를 복사해서 보내 주세요.';}}
  catch(e){message.textContent=e.message;}
 },'primary');
}
function homeShareViewer(data){
 document.body.classList.add('homeShareMode');pressed.clear();
 document.addEventListener('keydown',e=>{if(dirs[e.key]||dirs[e.key.toLowerCase()]||e.key.toLowerCase()==='e'){pressed.clear();e.stopImmediatePropagation();}},true);
 const root=cw09El('main','','',document.body);root.id='homeShareViewer';
 const top=cw09El('header','','',root);cw09El('strong','','✦ 문스쿨 · 집 구경',top);const schoolURL=new URL(location.href);schoolURL.hash='';schoolURL.searchParams.delete('visit');const back=cw09El('a','','문스쿨 들어가기',top);back.href=schoolURL.href;
 const card=cw09El('section','homeShareCard','',root);
 if(!data){cw09El('h1','','집 링크를 확인해 주세요',card);cw09El('p','','링크가 잘렸거나 지원하지 않는 형식이에요. 집 주인에게 새 공유 링크를 받아 주세요.',card);document.title='문스쿨 | 집 구경 링크 확인';return;}
 document.title=data.name+'의 집 구경 | 문스쿨';cw09El('div','homeShareTag','🏡 친구의 작은 공간',card);cw09El('h1','',data.name+'의 집에 오신 걸 환영해요',card);
 cw09El('p','','공유한 시점의 집과 캐릭터를 구경하는 화면이에요. 집을 수정하거나 코인을 사용할 수 없어요.',card);
 const scene=cw09El('div','homeShareScene','',card),roof=CAMPUS_DECOR.find(x=>x.id===data.roof)?.color||'#947d66';
 const house=cw09El('div','homeShareHouse','',scene);house.style.setProperty('--share-roof',roof);cw09El('span','homeShareWindow','✦',house);cw09El('span','homeShareDoor','',house);cw09El('span','homeShareWindow','✦',house);
 const yard=cw09El('div','homeShareYard','',scene);yard.setAttribute('aria-label',data.name+'의 공터');
 for(let cell=0;cell<24;cell++){const found=data.layout.find(([,pos])=>pos===cell),item=found&&CAMPUS_DECOR.find(x=>x.id===found[0]),tile=cw09El('div','homeShareTile',item?.icon||'·',yard);tile.setAttribute('aria-label',(cell+1)+'번 칸 '+(item?.name||'빈 공터'));tile.title=item?.name||'빈 공터';}
 const profile=cw09El('div','homeShareProfile','',scene),cv=cw09El('canvas','','',profile);cv.width=180;cv.height=220;cv.setAttribute('role','img');cv.setAttribute('aria-label',data.name+'의 캐릭터');cw09El('strong','',data.name,profile);
  // Illustration images may still be decoding on a first visit.
 const paint=()=>campusDrawPreview(cv,data.avatar);paint();
 if(data.avatar.renderMode==='illustration'){const img=moonStyle1Image(data.avatar.gender,'down');if(img&&!img.complete)img.addEventListener('load',paint,{once:true});}
 const legend=cw09El('div','homeShareLegend','',card);const names=data.layout.map(([id])=>CAMPUS_DECOR.find(x=>x.id===id).name);cw09El('p','',names.length?'놓아 둔 장식: '+names.join(' · '):'장식을 놓기 전의 아늑한 공터예요.',legend);
 if(data.at)cw09El('p','cw09Info','공유한 때: '+new Date(data.at).toLocaleString('ko-KR',{timeZone:'Asia/Seoul'}),card);
 cw09El('p','cw09Info','실시간 학급 동기화가 아닌 집 구경 링크입니다. 코인·과제·출석 정보는 전달되지 않아요.',card);
}
const homeShareCSS=cw09El('style');homeShareCSS.textContent=`
 body.homeShareMode{background:linear-gradient(145deg,#e6ead9,#f5ecdb);min-height:100vh}.homeShareMode>:not(#homeShareViewer){display:none!important}
 #homeShareViewer{max-width:860px;margin:auto;padding:20px;color:#314e40}#homeShareViewer header{padding:4px 0 20px;display:flex;justify-content:space-between;gap:16px}#homeShareViewer a{color:#375e48;font-size:13px}
 .homeShareCard{background:#fffaf0;border:1px solid #d2c9ad;box-shadow:0 16px 50px #3d513321;border-radius:24px;padding:30px}.homeShareCard h1{font-size:25px;line-height:1.4;margin:8px 0}.homeShareCard p{color:#63775e;font-size:13px}.homeShareTag{font-size:12px;color:#8c7049;font-weight:700}
 .homeShareScene{background:linear-gradient(#e2e9d1,#bfd0ab);border:2px solid #9fb18c;border-radius:18px;min-height:420px;padding:75px 30px 20px;margin:24px 0 16px;position:relative;overflow:hidden}
 .homeShareHouse{position:relative;width:200px;height:100px;margin:0 auto 16px;background:#f2dfb8;border:3px solid #b3a078;border-radius:5px;display:flex;align-items:center;justify-content:space-around;box-shadow:4px 8px 0 #60784b22}
 .homeShareHouse:before{content:'';position:absolute;left:-24px;top:-56px;border-left:122px solid transparent;border-right:122px solid transparent;border-bottom:56px solid var(--share-roof)}
 .homeShareWindow{background:#a9ced0;border:4px solid #bda477;color:#fff5cc;width:38px;height:40px;text-align:center;padding-top:7px;border-radius:4px}.homeShareDoor{align-self:end;width:40px;height:68px;background:#6b8b7a;border:4px solid #bca17b;border-bottom:0;border-radius:8px 8px 0 0}
 .homeShareYard{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:5px;border:3px solid #8ea47e;padding:9px;border-radius:10px;background:#d8e2bd}.homeShareTile{height:45px;background:#c8d7af;border:1px solid #b1c397;border-radius:6px;display:grid;place-items:center;color:#a8ba93;font-size:29px}
 .homeShareProfile{display:flex;align-items:center;justify-content:center;gap:10px;margin-top:12px}.homeShareProfile canvas{width:72px;height:88px;border-radius:10px}.homeShareProfile strong{font-size:14px}.homeShareLegend{border-bottom:1px solid #ddd9c5;padding-bottom:8px}.homeShareControls textarea{font-size:11px;overflow-wrap:anywhere}
 @media(max-width:540px){#homeShareViewer{padding:12px}.homeShareCard{padding:20px 14px;border-radius:18px}.homeShareCard h1{font-size:20px}.homeShareScene{padding:65px 10px 12px;min-height:390px}.homeShareHouse{width:160px;height:85px}.homeShareHouse:before{left:-20px;top:-47px;border-left-width:97px;border-right-width:97px;border-bottom-width:47px}.homeShareTile{height:36px;font-size:24px}.homeShareYard{gap:3px;padding:5px}}
`;document.head.append(homeShareCSS);
if(new URL(location.href).searchParams.get('visit')==='home')homeShareViewer(homeShareDecode(location.hash.startsWith('#home=')?location.hash.slice(6):''));
window.addEventListener('hashchange',()=>{if(new URL(location.href).searchParams.get('visit')==='home')location.reload();});
