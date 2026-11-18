/* Cumulative XP remains unchanged; a one-time offset preserves existing levels. */
(()=>{'use strict';
const threshold=level=>{const n=Math.max(0,Math.floor(level)-1);return 100*n+10*n*(n-1);};
function progress(value,offset=0){const xp=Math.max(0,Number(value)||0)+Math.max(0,Number(offset)||0),n=Math.max(0,Math.floor((-90+Math.sqrt(8100+40*xp))/20));return {level:n+1,current:xp-threshold(n+1),required:100+20*n};}
try{const data=campusLoad();let changed=false;for(const name of Object.keys(state.xp||{})){const p=campusStudent(data,name);if(p.xpCurveV1===undefined){const xp=Math.max(0,Number(state.xp[name])||0),oldLevel=1+Math.floor(xp/100);p.xpCurveV1=threshold(oldLevel)-(oldLevel-1)*100;changed=true;}}if(changed){localStorage.setItem(CAMPUS_KEY,JSON.stringify(data));campusData=data;}}catch{console.warn('기존 레벨 보존 정보를 저장하지 못했습니다.');}
const transaction=campusTransaction;campusTransaction=function(change){return transaction((p,...args)=>{if(p.xpCurveV1===undefined)p.xpCurveV1=0;return change(p,...args);});};
window.MoonLevels={threshold,progress,current:(name=actorName(),xp=state.xp[name])=>progress(xp,campusPerson(name).xpCurveV1)};
})();

