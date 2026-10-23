const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const http=require('node:http'),fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),reports=path.resolve(root,'../qa');fs.mkdirSync(reports,{recursive:true});
const server=http.createServer((req,res)=>{const name=req.url.split('?')[0]==='/'?'index.html':req.url.split('?')[0].slice(1);if(!['index.html','school.js'].includes(name)){res.writeHead(404);res.end();return;}res.setHeader('Content-Type',name.endsWith('.js')?'text/javascript; charset=utf-8':'text/html; charset=utf-8');res.end(fs.readFileSync(path.join(root,name)));});
(async()=>{
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH||'C:/Program Files/Google/Chrome/Application/chrome.exe'});
 const context=await browser.newContext({viewport:{width:1440,height:1000}}),page=await context.newPage(),errors=[],passed=[];
 page.on('pageerror',e=>errors.push(e.message));
 const origin='http://127.0.0.1:'+server.address().port;
 const check=(name,fn)=>Promise.resolve().then(fn).then(()=>{passed.push(name);console.log('PASS '+name);});
 await page.goto(origin);await page.waitForFunction(()=>typeof schoolSubmit==='function'&&MOON_STYLE1.loaded===8);
 await page.locator('#newNickname').fill('선생님');await page.locator('#createAvatar').click();await page.waitForTimeout(100);
 await check('fresh install seeds nine activities exactly once',async()=>{assert.equal(await page.evaluate(()=>cw09Data.items.length),15);await page.reload();assert.equal(await page.evaluate(()=>cw09Data.items.length),15);});
 await page.selectOption('#role','student');await page.locator('#newNickname').fill('달빛학생');await page.locator('[name=newGender][value=girl]').check();await page.locator('#createAvatar').click();await page.waitForTimeout(100);
 await check('girl choice and wardrobe persist',async()=>{assert.equal(await page.evaluate(()=>profileOf(actorName()).gender),'girl');assert.ok(await page.evaluate(()=>state.owned[actorName()].cloth.length));});
 await check('place and input validation',async()=>{
  assert.ok(await page.evaluate(()=>schoolSubmit('ms094_ai',1).error));
  await page.evaluate(()=>goMap('library'));assert.ok(await page.evaluate(()=>schoolSubmit('ms094_reading',{title:'책',pages:0,thought:'좋았던 책이에요'}).error));
 });
 await check('reading form submits once through visible UI',async()=>{
  await page.evaluate(()=>{CW09.selected='ms094_reading';switchTab('activities');cw09Render();});
  const form=page.locator('#activities .cw09Form').filter({has:page.getByRole('heading',{name:'책 속 마음을 발견해요',exact:true})});
  await form.locator('input').nth(0).fill('어린 왕자');await form.locator('input').nth(1).fill('12');await form.locator('textarea').fill('친구를 소중히 여기는 장면이 기억에 남아요.');
  const before=await page.evaluate(()=>coinsOf(actorName()));await form.getByRole('button',{name:'활동 제출',exact:true}).click();
  assert.equal(await page.evaluate(()=>coinsOf(actorName())),before+20);
  assert.ok(await page.evaluate(()=>schoolSubmit('ms094_reading',{title:'다시',pages:2,thought:'다시 쓴 감상문이에요'}).error));
  await page.reload();assert.equal(await page.evaluate(()=>cw09Data.items.length),15);
  await page.selectOption('#role','student');assert.equal(await page.evaluate(()=>coinsOf(actorName())),before+20);
 });
 await check('correct quiz rewards once; wrong quiz keeps explanation and no reward',async()=>{
  await page.evaluate(()=>goMap('lab'));const before=await page.evaluate(()=>coinsOf(actorName()));
  assert.equal(await page.evaluate(()=>schoolSubmit('ms094_ai',1).record.reward),20);
  assert.ok(await page.evaluate(()=>schoolSubmit('ms094_ai',1).error));
  assert.equal(await page.evaluate(()=>schoolSubmit('ms094_privacy',0).record.reward),0);
  assert.equal(await page.evaluate(()=>coinsOf(actorName())),before+20);
  await page.evaluate(()=>{CW09.selected='ms094_privacy';switchTab('activities');cw09Render();});assert.match(await page.locator('#activities').innerText(),/정답: 우리 집 주소와 전화번호/);
 });
 await check('daily resets per date and preserves yesterday',async()=>{
  await page.clock.setFixedTime(new Date('2026-10-23T03:00:00Z'));await page.evaluate(()=>goMap('classroom'));
  assert.equal(await page.evaluate(()=>schoolSubmit('ms094_daily',[0,1,2]).record.reward),10);
  assert.ok(await page.evaluate(()=>schoolSubmit('ms094_daily',[0,1,2]).error));
  await page.clock.setFixedTime(new Date('2026-10-24T03:00:00Z'));assert.equal(await page.evaluate(()=>schoolSubmit('ms094_daily',[0,1,2]).record.reward),10);
  assert.ok(await page.evaluate(()=>cw09Data.submissions['ms094_daily@2026-10-23']['학생 1']));
 });
 await check('separate students receive separate rewards',async()=>{
  await page.selectOption('#studentChoice','학생 2');await page.locator('#newNickname').fill('별빛학생');await page.locator('#createAvatar').click();await page.waitForTimeout(100);
  await page.evaluate(()=>goMap('lab'));assert.equal(await page.evaluate(()=>schoolSubmit('ms094_ai',1).record.reward),20);
  await page.selectOption('#studentChoice','학생 1');assert.ok(await page.evaluate(()=>cw09Rewarded('ms094_ai',actorName())));
 });
 await check('teacher creates quiz through form and reviews records',async()=>{
  await page.selectOption('#role','teacher');await page.evaluate(()=>{CW09.filter='all';switchTab('activities');cw09Render();});
  const fold=page.locator('#activities details').filter({has:page.locator('summary').filter({hasText:'+ 활동 만들기'})});await fold.locator('summary').click();
  const fields=fold.locator('input');await fields.nth(0).fill('선생님 새 퀴즈');await fold.locator('textarea').nth(0).fill('다음 중 올바른 행동은?');
  await fold.locator('select').nth(0).selectOption('quiz');await fold.locator('select').nth(1).selectOption('lab');await fold.locator('textarea').nth(1).fill('확인하기\n그대로 믿기');await fold.locator('textarea').nth(2).fill('출처를 확인해요.');
  await fold.getByRole('button',{name:'새 활동 게시',exact:true}).click();assert.ok(await page.evaluate(()=>cw09Data.items.some(a=>a.title==='선생님 새 퀴즈'&&a.correct===0)));
  await page.evaluate(()=>{CW09.selected='ms094_ai';cw09Render();});await page.getByRole('button',{name:'교사 확인',exact:true}).first().click();assert.ok(await page.evaluate(()=>schoolSubs(cw09Data.items.find(a=>a.id==='ms094_ai'))['학생 1'].reviewed));
  assert.ok(await page.evaluate(()=>schoolSubmit('ms094_ai',1).error));
 });
 await check('storage failure rolls back coin and submission',async()=>{
  await page.selectOption('#role','student');await page.evaluate(()=>goMap('classroom'));
  const result=await page.evaluate(()=>{const before=localStorage.getItem(dataKey),old=Storage.prototype.setItem;Storage.prototype.setItem=function(k,v){if(k===CW09.storageKey)throw new DOMException('full','QuotaExceededError');return old.call(this,k,v);};const res=schoolSubmit('ms094_math',1);Storage.prototype.setItem=old;return {error:res.error,same:before===localStorage.getItem(dataKey),submitted:!!cw09Load().submissions.ms094_math?.[actorName()]};});
  assert.ok(result.error);assert.ok(result.same);assert.equal(result.submitted,false);
 });
 await check('movement, directions and idle retain grounded illustration',async()=>{
  await page.evaluate(()=>{goMap('plaza');player.x=31;player.y=40;});await page.locator('#game').click({position:{x:30,y:30}});
  const before=await page.evaluate(()=>player.x);await page.keyboard.down('ArrowRight');await page.waitForTimeout(250);await page.keyboard.up('ArrowRight');
  assert.ok(await page.evaluate(()=>player.x)>before);assert.equal(await page.evaluate(()=>CW05.facing),'right');
  const transforms=await page.evaluate(()=>{const calls=[],old=ctx.drawImage;ctx.drawImage=function(...args){calls.push(args.slice(1));};sprite(100,100,currentAvatar(),0,false,'down',false);sprite(100,100,currentAvatar(),2,false,'down',true);ctx.drawImage=old;return calls;});assert.deepEqual(transforms[0],transforms[1]);
  await page.locator('.schoolHelp summary').click();await page.locator('.schoolHelp summary').click();assert.equal(await page.locator('.floatTop').isVisible(),false);assert.equal(await page.locator('.cw071Hover').isVisible(),false);
 });
 await check('class vote tallies and previous daily records remain reviewable',async()=>{
  await page.evaluate(()=>goMap('plaza'));assert.equal(await page.evaluate(()=>schoolSubmit('c09_vote',1).record.reward),10);
  await page.selectOption('#role','teacher');await page.evaluate(()=>{CW09.filter='all';CW09.selected='c09_vote';switchTab('activities');cw09Render();});assert.match(await page.locator('#activities').innerText(),/도서 교환: 1표/);
  await page.evaluate(()=>{CW09.selected='ms094_daily';cw09Render();});assert.match(await page.locator('#activities').innerText(),/2026-10-23/);assert.match(await page.locator('#activities').innerText(),/2026-10-24/);
  await page.selectOption('#role','student');
 });
 await page.clock.setFixedTime(new Date('2026-10-23T03:00:00Z'));
 await page.evaluate(()=>{goMap('classroom');CW09.filter='here';switchTab('activities');cw09Render();});await page.screenshot({path:path.join(reports,'desktop.png'),fullPage:true});
 await check('mobile layout fits viewport and keeps help collapsed',async()=>{
  await page.setViewportSize({width:390,height:844});await page.waitForTimeout(600);await page.screenshot({path:path.join(reports,'mobile.png'),fullPage:true});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));assert.equal(await page.locator('.schoolHelp').getAttribute('open'),null);assert.ok(await page.evaluate(()=>{const foot=(player.y+.7)*TILE;return Math.abs(foot-cw05LastCamera.y)*CW05.zoom<height/2-8;}));
 });
 await check('legacy migration preserves existing keys and records',async()=>{
  const legacy=await browser.newContext();const p=await legacy.newPage();await p.addInitScript(()=>{localStorage.setItem('classworld2d-v03',JSON.stringify({coins:{'학생 1':345},profiles:{'학생 1':{nickname:'기존학생',gender:'girl',created:true}},owned:{'학생 1':{cloth:[0,2]}},avatars:{'학생 1':{cloth:2}},answers:{'학생 1':0},rewards:{'학생 1|1':true}}));localStorage.setItem('classworld2d-v09-activities',JSON.stringify({items:[{id:'old',title:'기존 과제',kind:'text',place:'library',prompt:'기존 설명',reward:20,options:[]}],submissions:{old:{'학생 1':{answer:'기존 독서 기록',at:1}}}}));});
  await p.goto(origin);await p.waitForFunction(()=>typeof schoolSubmit==='function');assert.equal(await p.evaluate(()=>state.coins['학생 1']),345);assert.equal(await p.evaluate(()=>cw09Data.submissions.old['학생 1'].answer),'기존 독서 기록');assert.equal(await p.evaluate(()=>cw09Data.items.length),10);assert.deepEqual(await p.evaluate(()=>state.owned['학생 1'].cloth),[0,2]);assert.equal(await p.evaluate(()=>state.answers['학생 1']),0);await legacy.close();
 });
 assert.deepEqual(errors,[]);passed.push('no browser JavaScript errors');fs.writeFileSync(path.join(reports,'results.json'),JSON.stringify({passed,errors,base:'e54f5f6',date:new Date().toISOString()},null,2));
 await browser.close();server.close();
})().catch(e=>{console.error(e);server.close();process.exit(1);});
