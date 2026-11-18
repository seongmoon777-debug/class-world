/* One physical shop entrance, preserving old room identifiers and student saves. */
(()=>{'use strict';
const aliases=new Set(['salon','outfit','accessory']);
maps.outfit.name='반짝 상점';maps.outfit.icon='🛍️';
const entrance=portals.plaza.find(p=>p.to==='outfit');if(entrance)entrance.label='반짝 상점';
const previousGo=goMap;
goMap=function(id){
 if(!aliases.has(id))return previousGo(id);
 if(currentMap!=='plaza')return previousGo('outfit');
 if(!MoonLearning.require('상점'))return false;
 if(nearby()?.to!=='outfit'){doorApproach('outfit');return false;}
 MoonMarket.open();return true;
};
const oldQuick=renderQuick;renderQuick=function(){oldQuick();const keys=Object.keys(maps),buttons=[...$('#quick').children];for(let i=0;i<keys.length;i++){if(['salon','accessory'].includes(keys[i]))buttons[i]?.remove();else if(keys[i]==='outfit'&&buttons[i])buttons[i].textContent='🛍️ 반짝 상점';}};renderQuick();
// Jua's rounded, heavier Korean strokes are for signs; the UI retains Gowun Dodum.
const link=document.createElement('link');link.rel='stylesheet';link.href='https://fonts.googleapis.com/css2?family=Jua&display=swap';document.head.append(link);
window.MoonSignReady=new Promise(resolve=>{link.onerror=()=>resolve(false);link.onload=async()=>{try{const faces=await document.fonts.load('28px Jua');if(!faces.length){resolve(false);return;}MoonCity.redraw();resolve(true);}catch{resolve(false);}};});
})();

