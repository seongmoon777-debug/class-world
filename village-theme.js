/* Loaded last so the village typography wins over historical interface themes. */
(()=>{'use strict';
const style=document.createElement('style');style.textContent=`
body,body button,body input,body select,body textarea,body h1,body h2,body h3,body .panel,body .gameTop,body #mapName,body .villageToolbar button{font-family:'Gowun Dodum','Malgun Gothic',sans-serif!important;letter-spacing:0!important}
body h1,body h2,body h3,body #mapName,body .villageToolbar button{font-weight:400!important}
body .gameTop{background:#edf1df!important;color:#354e3d!important;border-color:#c2cfb0!important}
body #mapName{font-size:23px!important;color:#354e3d!important;line-height:1.5!important}
body .villageToolbar button{font-size:15px!important;border-radius:14px!important;min-height:42px!important;background:#fffaf0!important;color:#3e5543!important;border:1px solid #c4c7a9!important}
body .villageToolbar{gap:8px!important}body .growthPanel,body #growthPanel{font-family:'Gowun Dodum','Malgun Gothic',sans-serif!important}
body .panel{font-size:15px!important;line-height:1.65!important}body .panel h2{font-size:22px!important}
body .growthDashboard,body .growthDashboard *{font-family:'Gowun Dodum','Malgun Gothic',sans-serif!important}
body .growthDashboard{background:#f7f4e7!important;color:#405640!important;border-color:#d6d9bf!important}
body .growthChip{background:#fffdf4!important;border-color:#d9dcc6!important;color:#405640!important;font-size:12px!important;border-radius:10px!important}
body .growthChip strong,body .growthHeading strong{color:#4a7150!important}.growthDashboard .statName{color:#405640!important;font-size:11px!important}.growthDashboard .statBonus{color:#548d70!important}
body .growthDashboard button{background:#e5ead8!important;color:#415b44!important;border-color:#bfcdae!important}
body .growthDashboard .growthHeading *,body .growthDashboard summary{color:#48614c!important}
body .growthDashboard .growthHeading small,body .growthDashboard .growthHeading span{font-size:11px!important}
`;document.head.append(style);
// Explicit FontFace loading also redraws canvas signs after the actual font arrives.
const face=new FontFace('Gowun Dodum','url(https://fonts.gstatic.com/s/gowundodum/v12/3Jn5SD_00GqwlBnWc1TUJF0F.ttf)',{weight:'400',style:'normal',display:'swap'});
document.fonts.add(face);
window.MoonVillageFontReady=face.load().then(()=>{MoonCity.redraw();return true;}).catch(()=>false);
})();

