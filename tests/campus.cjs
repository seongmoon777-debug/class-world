const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),reports=path.resolve(root,'../qa');
fs.mkdirSync(reports,{recursive:true});
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH||'C:/Program Files/Google/Chrome/Application/chrome.exe'});
 const page=await browser.newPage({viewport:{width:1440,height:1050}}),passed=[],errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 const test=async(name,fn)=>{await fn();passed.push(name);console.log('PASS '+name);};
 const reload=async()=>{await page.reload();await page.selectOption('#role','student');};
 await page.clock.setFixedTime(new Date('2026-10-23T03:00:00Z'));
 await page.goto(require('node:url').pathToFileURL(path.join(root,'index.html')).href);
 await page.waitForFunction(()=>typeof campusTransaction==='function'&&MOON_STYLE1.loaded===8);
 await page.locator('#newNickname').fill('선생님');await page.locator('#createAvatar').click();await page.waitForTimeout(100);
 await page.selectOption('#role','student');await page.locator('#newNickname').fill('달빛학생');await page.locator('[name=newGender][value=girl]').check();await page.locator('#createAvatar').click();await page.waitForTimeout(100);
 // Test currency belongs to a disposable browser context only.
 await page.evaluate(()=>{state.coins[actorName()]=1000;save();campusOpen('life');});
 await test('attendance UI rewards only once, mood can change',async()=>{
  await page.getByRole('combobox',{name:'오늘의 기분',exact:true}).selectOption('😊 즐거워요');await page.getByRole('button',{name:'출석하기 · 5 MC',exact:true}).click();assert.equal(await page.evaluate(()=>coinsOf(actorName())),1005);
  await page.getByRole('combobox',{name:'오늘의 기분',exact:true}).selectOption('😌 편안해요');await page.getByRole('button',{name:'기분 수정',exact:true}).click();assert.equal(await page.evaluate(()=>coinsOf(actorName())),1005);
  assert.equal(await page.evaluate(()=>campusPerson().attendance[schoolToday()].mood),'😌 편안해요');
 });
 await test('daily attendance survives reload and rewards next day once',async()=>{
  await reload();assert.equal(await page.evaluate(()=>coinsOf(actorName())),1005);await page.clock.setFixedTime(new Date('2026-10-24T03:00:00Z'));assert.ok(!await page.evaluate(()=>campusAttendance('😊 즐거워요','').error));assert.equal(await page.evaluate(()=>coinsOf(actorName())),1010);await page.clock.setFixedTime(new Date('2026-10-23T03:00:00Z'));
 });
 await test('teacher views attendance, replies to real submission and student sees new reply',async()=>{
  await page.evaluate(()=>{goMap('library');schoolSubmit('ms094_reading',{title:'어린 왕자',pages:12,thought:'친구를 소중히 하는 장면이 좋았어요.'});});
  await page.selectOption('#role','teacher');await page.evaluate(()=>campusOpen('life'));assert.match(await page.locator('#campus').innerText(),/출석 1명/);
  await page.evaluate(()=>{CW09.filter='all';CW09.selected='ms094_reading';switchTab('activities');cw09Render();});
  await page.getByRole('textbox',{name:'선생님 답장 · 학생 1',exact:true}).fill('장면과 이유를 잘 연결했어요!');await page.getByRole('button',{name:'답장 저장',exact:true}).click();
  await page.selectOption('#role','student');assert.match(await page.locator('[data-tab=campus]').innerText(),/새 답장 1/);await page.evaluate(()=>campusOpen('life'));assert.match(await page.locator('#campus').innerText(),/장면과 이유를 잘 연결했어요/);assert.ok(!/새 답장/.test(await page.locator('[data-tab=campus]').innerText()));
 });
 await test('decor purchase deducts once; duplicate purchase and insufficient funds rejected',async()=>{
  const before=await page.evaluate(()=>coinsOf(actorName()));assert.ok(!await page.evaluate(()=>campusBuy('flowers').error));assert.equal(await page.evaluate(()=>coinsOf(actorName())),before-15);assert.ok(await page.evaluate(()=>campusBuy('flowers').error));
  const result=await page.evaluate(()=>{const n=coinsOf(actorName());state.coins[actorName()]=0;save();const r=campusBuy('pond');state.coins[actorName()]=n;save();return r;});assert.ok(result.error);assert.ok(!await page.evaluate(()=>campusPerson().decor.includes('pond')));
 });
 await test('yard placement collision, movement, retrieval and roof customization',async()=>{
  await page.evaluate(()=>{campusOwner=actorName();campusOpen('home');campusPlace='flowers';});await page.getByRole('button',{name:'공터 1번 칸',exact:true}).click();assert.equal(await page.evaluate(()=>campusPerson().layout.flowers),0);
  await page.evaluate(()=>campusBuy('bench'));assert.ok(await page.evaluate(()=>campusPlaceItem('bench',0).error));assert.ok(!await page.evaluate(()=>campusPlaceItem('flowers',1).error));assert.ok(!await page.evaluate(()=>campusPlaceItem('bench',0).error));assert.ok(!await page.evaluate(()=>campusPlaceItem('flowers',null).error));assert.equal(await page.evaluate(()=>campusPerson().layout.flowers),undefined);
  await page.evaluate(()=>{campusPlaceItem('flowers',7);campusBuy('roof-blue');campusRender();});assert.equal(await page.evaluate(()=>campusPerson().roof),'roof-blue');
 });
 await test('student two cannot decorate student one yard',async()=>{
  await page.selectOption('#studentChoice','학생 2');await page.locator('#newNickname').fill('별빛학생');await page.locator('#createAvatar').click();await page.waitForTimeout(100);
  assert.ok(await page.evaluate(()=>campusPlaceItem('flowers',2,'학생 1').error));assert.equal(await page.evaluate(()=>campusPerson('학생 1').layout.flowers),7);assert.equal(await page.evaluate(()=>campusPerson().decor.length),0);await page.selectOption('#studentChoice','학생 1');
 });
 await test('neighborhood has 30 independent lots and safely switches pages',async()=>{
  await page.evaluate(()=>{campusPage=4;campusOwner='학생 30';goMap('neighborhood');});assert.equal(await page.evaluate(()=>currentMap),'neighborhood');assert.equal(await page.locator('#campus .campusCell').count(),24);assert.ok(await page.locator('#campus .campusCell').first().isDisabled());
  await page.evaluate(()=>{campusPage=0;campusOwner=actorName();goMap('neighborhood');});await page.waitForTimeout(600);await page.screenshot({path:path.join(reports,'neighborhood.png'),fullPage:true});
  const point=await page.evaluate(()=>{const r=canvas.getBoundingClientRect();return {x:r.left+width/2+(4*TILE-cw05LastCamera.x)*CW05.zoom,y:r.top+height/2+(4*TILE-cw05LastCamera.y)*CW05.zoom};});await page.mouse.click(point.x,point.y);assert.equal(await page.evaluate(()=>campusOwner),'학생 1');
 });
 await test('hair clothes and shoes equip visibly and preserve gender and old ownership',async()=>{
  const oldOwned=await page.evaluate(()=>structuredClone(state.owned[actorName()]));const before=await page.evaluate(()=>coinsOf(actorName()));
  assert.ok(!await page.evaluate(()=>campusBuyCosmetic('hair',1).error));assert.ok(!await page.evaluate(()=>campusBuyCosmetic('cloth',2).error));assert.ok(!await page.evaluate(()=>campusBuyCosmetic('shoes',1).error));assert.ok(await page.evaluate(()=>coinsOf(actorName()))<before);
  assert.equal(await page.evaluate(()=>profileOf(actorName()).gender),'girl');assert.equal(await page.evaluate(()=>currentAvatar().renderMode),'custom');assert.equal(await page.evaluate(()=>currentAvatar().shoes),1);
  for(const [key,values] of Object.entries(oldOwned))for(const v of values)assert.ok(await page.evaluate(([k,i])=>owns(actorName(),k,i),[key,v]));
  const images=await page.evaluate(()=>{const a=currentAvatar();return [campusArt(a).toDataURL(),campusArt({...a,shoes:0}).toDataURL(),campusArt({...a,hair:0,cloth:0}).toDataURL()];});assert.notEqual(images[0],images[1]);assert.notEqual(images[0],images[2]);
  const balance=await page.evaluate(()=>coinsOf(actorName()));await page.evaluate(()=>campusBuyCosmetic('shoes',1));assert.equal(await page.evaluate(()=>coinsOf(actorName())),balance);
  await page.evaluate(()=>campusOpen('style'));await page.screenshot({path:path.join(reports,'dress-up.png'),fullPage:true});
 });
 await test('growth tool raises real stat and opens correct expedition hint',async()=>{
  const before=await page.evaluate(()=>campusStats().observation);assert.ok(!await page.evaluate(()=>campusBuy('focus').error));assert.equal(await page.evaluate(()=>campusStats().observation),before+2);assert.ok(await page.evaluate(()=>campusBuy('focus').error));
  await page.evaluate(()=>{campusRoute='reading';goMap('expedition');campusOpen('explore');});await page.getByRole('button',{name:'성장 도구로 힌트 보기',exact:true}).click();assert.match(await page.locator('#campus').innerText(),/낱말의 뜻을 짐작/);
 });
 await test('wrong expedition answer never charges; completion rewards once',async()=>{
  const before=await page.evaluate(()=>coinsOf(actorName()));assert.ok(await page.evaluate(()=>campusAnswer('reading',2).error));assert.equal(await page.evaluate(()=>coinsOf(actorName())),before);assert.equal(await page.evaluate(()=>campusRun().step),0);
  for(const correct of [0,1,2])assert.ok(!await page.evaluate(i=>campusAnswer('reading',i).error,correct));assert.equal(await page.evaluate(()=>coinsOf(actorName())),before+20);assert.ok(await page.evaluate(()=>campusAnswer('reading',2).error));assert.equal(await page.evaluate(()=>coinsOf(actorName())),before+20);
  await page.evaluate(()=>campusRender());await page.screenshot({path:path.join(reports,'expedition.png'),fullPage:true});
 });
 await test('route mismatch rejected, separate routes and next day award independently',async()=>{
  assert.ok(await page.evaluate(()=>campusAnswer('nature',0).error));await page.evaluate(()=>{campusRoute='nature';goMap('expedition');});for(const i of [0,1,2])assert.ok(!await page.evaluate(i=>campusAnswer('nature',i).error,i));
  await page.clock.setFixedTime(new Date('2026-10-24T03:00:00Z'));await page.evaluate(()=>{campusRoute='reading';goMap('expedition');});assert.equal(await page.evaluate(()=>campusRun().step),0);for(const i of [0,1,2])assert.ok(!await page.evaluate(i=>campusAnswer('reading',i).error,i));await page.clock.setFixedTime(new Date('2026-10-23T03:00:00Z'));
 });
 await test('all new purchases placements stats and feedback persist after reload',async()=>{
  const before=await page.evaluate(()=>coinsOf(actorName()));await reload();assert.equal(await page.evaluate(()=>coinsOf(actorName())),before);assert.equal(await page.evaluate(()=>campusPerson().layout.flowers),7);assert.equal(await page.evaluate(()=>campusPerson().roof),'roof-blue');assert.equal(await page.evaluate(()=>currentAvatar().shoes),1);assert.equal(await page.evaluate(()=>campusStats().observation),3);assert.equal(await page.evaluate(()=>cw09Data.submissions.ms094_reading['학생 1'].feedback),'장면과 이유를 잘 연결했어요!');
 });
 await test('teamwork expedition completes through visible choices and awards XP',async()=>{
  await page.evaluate(()=>{campusBuy('friend');campusRoute='teamwork';goMap('expedition');campusOpen('explore');});const before=await page.evaluate(()=>({coins:coinsOf(actorName()),xp:state.xp[actorName()]||0}));
  assert.equal(await page.evaluate(()=>campusStats().cooperation),3);await page.getByRole('button',{name:'성장 도구로 힌트 보기',exact:true}).click();assert.match(await page.locator('#campus').innerText(),/친구가 왜/);
  for(const i of [0,1,2]){await page.locator('#campus input[name=campus-puzzle]').nth(i).check();await page.getByRole('button',{name:'관문 답하기',exact:true}).click();}
  assert.equal(await page.evaluate(()=>coinsOf(actorName())),before.coins+20);assert.equal(await page.evaluate(()=>state.xp[actorName()]),before.xp+15);assert.match(await page.locator('#campus').innerText(),/오늘 보상은 이미 받았어요/);
 });
 await test('teacher cannot buy place earn attendance or expedition rewards',async()=>{
  await page.selectOption('#role','teacher');assert.ok(await page.evaluate(()=>campusBuy('tree').error));assert.ok(await page.evaluate(()=>campusAttendance('😊 즐거워요','').error));assert.ok(await page.evaluate(()=>campusPlaceItem('flowers',0).error));await page.evaluate(()=>{campusRoute='teamwork';goMap('expedition');});assert.ok(await page.evaluate(()=>campusAnswer('teamwork',0).error));await page.selectOption('#role','student');
 });
 await test('storage failure rolls back coins and new inventory together',async()=>{
  const before=await page.evaluate(()=>coinsOf(actorName()));const r=await page.evaluate(()=>{const fn=Storage.prototype.setItem;Storage.prototype.setItem=function(k,v){if(k===CAMPUS_KEY)throw new DOMException('full','QuotaExceededError');return fn.call(this,k,v);};const r=campusBuy('tree');Storage.prototype.setItem=fn;return r;});assert.ok(r.error);assert.equal(await page.evaluate(()=>coinsOf(actorName())),before);assert.ok(!await page.evaluate(()=>campusLoad().students[actorName()].decor.includes('tree')));
 });
 await test('house shop purchase works through visible UI',async()=>{
  await page.evaluate(()=>{campusOwner=actorName();campusOpen('home');});await page.locator('#campus details').filter({hasText:'집 꾸미기 상점'}).locator('summary').click();const item=page.locator('#campus .shopItem').filter({hasText:'별빛 가로등'});const before=await page.evaluate(()=>coinsOf(actorName()));await item.getByRole('button',{name:'구매',exact:true}).click();assert.equal(await page.evaluate(()=>coinsOf(actorName())),before-25);assert.ok(await page.evaluate(()=>campusPerson().decor.includes('lamp')));
 });
 await test('new room movement stays visible at mobile viewport and tabs do not overflow page',async()=>{
  await page.setViewportSize({width:390,height:844});await page.evaluate(()=>{campusOwner=actorName();goMap('neighborhood');});await page.waitForTimeout(700);await page.screenshot({path:path.join(reports,'campus-mobile.png'),fullPage:true});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));assert.ok(await page.evaluate(()=>{const y=height/2+((player.y+.7)*TILE-cw05LastCamera.y)*CW05.zoom;return y>90&&y<height-5;}));
 });
 await test('student-entered mood note renders as text',async()=>{
  await page.evaluate(()=>campusAttendance('😊 즐거워요','<img src=x onerror=alert(1)>'));await page.selectOption('#role','teacher');await page.evaluate(()=>campusOpen('life'));assert.equal(await page.locator('#campus img').count(),0);assert.match(await page.locator('#campus').innerText(),/<img src=x/);
 });
 assert.deepEqual(errors,[]);passed.push('no browser JavaScript errors');fs.writeFileSync(path.join(reports,'campus-results.json'),JSON.stringify({passed,errors,base:'b7dd89a',date:new Date().toISOString()},null,2));await browser.close();
})().catch(e=>{console.error(e);process.exit(1);});

