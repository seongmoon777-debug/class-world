const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const assert=require('node:assert/strict'),path=require('node:path');
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'});
 const page=await browser.newPage({viewport:{width:1280,height:900}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route('https://school.test/**',r=>{const file=path.resolve(new URL(r.request().url()).pathname.slice(1)||'index.html');return r.fulfill({path:file,contentType:file.endsWith('.js')?'text/javascript':file.endsWith('.html')?'text/html':undefined});});
 await page.goto('https://school.test/');await page.evaluate(()=>{$('#creatorOverlay').classList.remove('open');$('#role').value='student';$('#studentChoice').value='학생 1';schoolPanelOpen(false);MoonGrowth.render();});
 assert.deepEqual(await page.locator('.tabs button').allTextContents(),['📚 배움터','🎯 오늘의 모험','🏡 내 공간']);
 assert.equal(await page.locator('.growthChip').count(),6);assert.match(await page.locator('.growthSix').innerText(),/감지/);
 await page.locator('[data-tab=activities]').click();
 await page.getByRole('button',{name:'우리 교실',exact:true}).click();assert.equal(await page.locator('#classroom').evaluate(e=>e.classList.contains('active')),true);
 await page.getByRole('button',{name:'활동 게시판',exact:true}).click();assert.equal(await page.locator('#activities').evaluate(e=>e.classList.contains('active')),true);
 await page.locator('[data-tab=dailyWelcome]').click();assert.equal(await page.locator('#mission').evaluate(e=>e.classList.contains('active')),true);
 const reward=await page.evaluate(()=>{const before=coinsOf(actorName());campusAttendance('😊 즐거워요','');campusAttendance('😊 즐거워요','');return coinsOf(actorName())-before;});assert.equal(reward,5);
 await page.locator('[data-tab=campus]').click();assert.equal(await page.locator('.hideoutAction').count(),3);
 await page.screenshot({path:'../../outputs/moonschool-hideout-desktop.png'});
 await page.getByRole('button',{name:/내 집 꾸미기/}).click();assert.equal(await page.evaluate(()=>campusView),'home');await page.getByRole('button',{name:'← 내 공간',exact:true}).click();
 await page.locator('.hideoutAction').first().click();assert.equal(await page.locator('#quickWardrobe').evaluate(e=>e.open),true);await page.getByRole('button',{name:'닫기',exact:true}).click();
 const levels=await page.evaluate(()=>{state.xp[actorName()]=250;save();const before=coinsOf(actorName());updateCoin();updateCoin();return coinsOf(actorName())-before;});assert.equal(levels,20);
 await page.reload();await page.evaluate(()=>{$('#creatorOverlay').classList.remove('open');$('#role').value='student';schoolPanelOpen(false);});assert.equal(await page.evaluate(()=>coinsOf(actorName())),25);
 await page.setViewportSize({width:390,height:844});for(const tab of ['activities','dailyWelcome','campus']){await page.locator(`[data-tab=${tab}]`).click();assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);await page.screenshot({path:`../../outputs/moonschool-${tab}-mobile.png`,fullPage:true});}
 const compact=await page.evaluate(()=>{const cards=[...document.querySelectorAll('.growthChip')].map(e=>e.getBoundingClientRect());return {height:document.querySelector('.growthDashboard').getBoundingClientRect().height,oneRow:cards.every(r=>Math.abs(r.top-cards[0].top)<1),stageBottom:document.querySelector('.gameShell').getBoundingClientRect().bottom};});assert.ok(compact.height<95);assert.equal(compact.oneRow,true);assert.ok(compact.stageBottom<=844);
 assert.deepEqual(errors,[]);await browser.close();console.log('PASS merged navigation, rewards/reload, compact single-row HUD, game fits mobile viewport, hideout/wardrobe, no JS errors');
})().catch(e=>{console.error(e);process.exit(1);});
