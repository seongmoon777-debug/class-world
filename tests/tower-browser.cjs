const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright'),assert=require('node:assert/strict'),path=require('node:path');
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.BROWSER_EXECUTABLE||'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'}),pages=[],errors=[];let data={},seq=0;
 async function broadcast(){await Promise.all(pages.map(p=>p.evaluate(d=>window.testReceive?.(d),data)));}
 for(const uid of ['teacher','student']){
  const p=await browser.newPage({viewport:{width:1280,height:900}});p.on('pageerror',e=>errors.push(e.message));
  await p.route('https://school.test/**',r=>{const file=path.resolve(new URL(r.request().url()).pathname.slice(1)||'index.html');return r.fulfill({path:file,contentType:file.endsWith('.js')?'text/javascript':file.endsWith('.html')?'text/html':undefined});});
  await p.exposeFunction('testWrite',async(type,payload)=>{
   if(type==='start'){if(uid!=='teacher')throw Error('permission-denied');data.config={runId:String(++seq).padStart(20,'0'),at:Date.now()};}
   if(type==='hit'){const run=(data.runs||={})[data.config.runId]||={hits:{}};const hits=run.hits[uid]||={};hits[String(++seq).padStart(20,'0')]={...payload,name:uid,at:Date.now()};}
   if(type==='award'){if(uid!=='teacher')throw Error('permission-denied');((data.awards||={})[payload.uid]||={})[payload.title]=payload.enabled;}
   await broadcast();
  });
  await p.goto('https://school.test/');pages.push(p);
  await p.evaluate(({uid,data})=>{
   $('#creatorOverlay').classList.remove('open');$('#role').value='student';$('#studentChoice').value='학생 1';currentMap='plaza';player={x:31,y:31.5};cw05LastCamera=null;
   window.MoonClass={session:()=>({uid,code:'ABCDEF123456',owner:uid==='teacher',connected:true,name:uid}),roster:()=>[{uid:'teacher',name:'교사'},{uid:'student',name:'별빛'}],open:()=>{},watchTower:(fn)=>{window.testReceive=fn;fn(data);return()=>{window.testReceive=null;};},startTower:()=>window.testWrite('start',{}),attack:(run,hit)=>window.testWrite('hit',hit),grantTitle:(uid,title,enabled)=>window.testWrite('award',{uid,title,enabled})};
   window.dispatchEvent(new Event('moon-class-change'));MoonTower.open();
  },{uid,data});
 }
 const [a,b]=pages;await a.getByRole('button',{name:'첫 원정 시작',exact:true}).click();await b.locator('.towerHP').waitFor();for(const page of [a,b]){await page.getByRole('button',{name:'10층',exact:true}).click();await page.getByRole('heading',{name:'태고의 흑룡',exact:true}).waitFor();await page.getByRole('button',{name:'1층',exact:true}).click();}assert.equal(await b.locator('.towerHP').getAttribute('max'),'240');
 await a.locator('.towerAttack').click();await b.waitForFunction(()=>document.querySelector('.towerHP')?.value===228);await b.locator('.towerAttack').click();await a.waitForFunction(()=>document.querySelector('.towerHP')?.value===216);assert.equal(await a.locator('.towerScore').count(),2);assert.match(await a.locator('.towerDamageLog').innerText(),/내가 준 피해 \+12/);
 // Finish the first floor with immutable server-style records. Late hits do not change its MVP.
 for(let i=0;i<18;i++){const hits=data.runs[data.config.runId].hits.teacher;hits[String(++seq).padStart(20,'0')]={floor:1,stat:'observation',power:1,name:'teacher',at:Date.now()+i+1};}await broadcast();await a.waitForFunction(()=>document.querySelector('.towerAttack')?.textContent.includes('공략 완료'));for(const page of [a,b])await page.getByRole('button',{name:'2층',exact:true}).click();
 await a.getByRole('button',{name:'내 호칭',exact:true}).click();await a.getByRole('button',{name:'장착',exact:true}).click();assert.equal(await a.evaluate(()=>campusStats().observation),3);await a.getByRole('button',{name:'호칭 해제',exact:true}).click();assert.equal(await a.evaluate(()=>campusStats().observation),1);
 await a.getByRole('button',{name:'교사 수여',exact:true}).click();await a.getByLabel('호칭 받을 친구').selectOption('student');await a.getByLabel('수여할 호칭').selectOption('mentor-knowledge');await a.getByRole('button',{name:'호칭 수여',exact:true}).click();
 await b.getByRole('button',{name:'내 호칭',exact:true}).click();await b.getByRole('button',{name:'장착',exact:true}).click();assert.equal(await b.evaluate(()=>campusStats().knowledge),3);
 await b.evaluate(()=>{$('#role').value='teacher';$('#role').dispatchEvent(new Event('change'));$('#creatorOverlay').classList.remove('open');});assert.equal(await b.getByRole('button',{name:'교사 수여',exact:true}).count(),0);
 await a.getByRole('button',{name:'선택한 호칭 회수',exact:true}).click();await b.waitForFunction(()=>campusStats().knowledge===1);
 await a.getByRole('button',{name:'탑 공략',exact:true}).click();await a.getByRole('button',{name:'10층',exact:true}).click();await a.screenshot({path:'../../outputs/moonschool-tower-ten-floors.png',fullPage:true});await b.setViewportSize({width:390,height:844});await b.getByRole('button',{name:'탑 공략',exact:true}).click();assert.equal(await b.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);await b.screenshot({path:'../../outputs/moonschool-tower-mobile.png',fullPage:true});
 await a.getByRole('button',{name:'닫기',exact:true}).click();await a.screenshot({path:'../../outputs/moonschool-tower-village.png',fullPage:true});assert.deepEqual(errors,[]);await browser.close();console.log('PASS two-client shared HP, floor progression/MVP, equip/remove bonus, owner grant/revoke, local teacher cannot grant, mobile fit and no JS errors');
})().catch(e=>{console.error(e);process.exit(1)});

