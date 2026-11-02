/* Touch controls and a read-only view of the existing growth equipment. */
(() => {
 'use strict';
 const pad=document.querySelector('#pad');
 if(!pad)return;
 pad.replaceChildren();pad.className='moonJoystick';pad.tabIndex=0;
 pad.setAttribute('role','group');pad.setAttribute('aria-label','이동 조이스틱. 드래그하거나 방향키로 이동');
 const knob=document.createElement('span');knob.className='moonJoystickKnob';knob.setAttribute('aria-hidden','true');pad.append(knob);
 const held=new Set(),touch=new Set();let pointer=null;
 const directions={ArrowUp:'up',ArrowDown:'down',ArrowLeft:'left',ArrowRight:'right',w:'up',a:'left',s:'down',d:'right'};
 const direction=e=>directions[e.key]||directions[e.key.toLowerCase()];
 function apply(next){for(const d of touch)if(!next.has(d)&&!held.has(d))pressed.delete(d);touch.clear();for(const d of next){touch.add(d);pressed.add(d);}}
 function reset(){pointer=null;apply(new Set());knob.style.transform='translate(0px,0px)';pad.classList.remove('active');}
 function move(e){
  const r=pad.getBoundingClientRect(),limit=r.width*.30;let x=e.clientX-r.left-r.width/2,y=e.clientY-r.top-r.height/2;
  const length=Math.hypot(x,y);if(length>limit){x*=limit/length;y*=limit/length;}
  knob.style.transform=`translate(${x}px,${y}px)`;
  const next=new Set();if(length>r.width*.12){if(Math.abs(x)>Math.abs(y)*.45)next.add(x>0?'right':'left');if(Math.abs(y)>Math.abs(x)*.45)next.add(y>0?'down':'up');}apply(next);
 }
 pad.addEventListener('pointerdown',e=>{if(pointer!==null||e.button!==0||document.querySelector('dialog[open],#creatorOverlay.open'))return;e.preventDefault();pointer=e.pointerId;pad.setPointerCapture(pointer);pad.classList.add('active');move(e);});
 pad.addEventListener('pointermove',e=>{if(e.pointerId===pointer){e.preventDefault();move(e);}});
 for(const event of ['pointerup','pointercancel','lostpointercapture'])pad.addEventListener(event,e=>{if(e.pointerId===pointer)reset();});
 document.addEventListener('keydown',e=>{const d=direction(e);if(d&&!schoolTyping()&&!document.querySelector('dialog[open],#creatorOverlay.open'))held.add(d);},true);
 document.addEventListener('keyup',e=>{const d=direction(e);if(d){held.delete(d);queueMicrotask(()=>{if(touch.has(d))pressed.add(d);});}});
 const stop=()=>{held.clear();reset();};window.addEventListener('blur',stop);document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});document.addEventListener('focusin',e=>{if(e.target!==pad)stop();});
 const oldMap=goMap;goMap=function(...args){stop();return oldMap(...args);};
 const growth=document.createElement('details');growth.className='moonGrowth';
 const summary=document.createElement('summary');summary.textContent='🌱 나의 능력치';growth.append(summary);
 const body=document.createElement('div');body.className='moonGrowthBody';growth.append(body);document.querySelector('.gameTop').after(growth);
 const icons={observation:'🔍',persistence:'🌿',cooperation:'🤝'};
 let signature='';
 function refresh(){const values=campusStats(),sig=JSON.stringify([actorName(),values]);if(sig===signature)return;signature=sig;
  summary.textContent='🌱 능력치 · '+Object.entries(values).map(([k,v])=>icons[k]+' '+v).join('  ');
  body.replaceChildren();const name=document.createElement('strong');name.textContent=actorName()+'의 성장 도구';body.append(name);
  for(const [k,value] of Object.entries(values)){const row=document.createElement('div');row.className='moonStat';const label=document.createElement('span');label.textContent=icons[k]+' '+CAMPUS_STATS[k];const meter=document.createElement('meter');meter.min=0;meter.max=3;meter.value=value;meter.setAttribute('aria-label',CAMPUS_STATS[k]);const number=document.createElement('strong');number.textContent=String(value);row.append(label,meter,number);body.append(row);}
  const note=document.createElement('p');note.textContent='기본 1 + 성장 도구 2. 해당 능력치가 2 이상이면 탐험에서 힌트를 볼 수 있어요. 이 기기에 저장됩니다.';body.append(note);
 }
 const oldCoin=updateCoin;updateCoin=function(...args){const result=oldCoin(...args);refresh();return result;};
 document.addEventListener('change',refresh);growth.addEventListener('toggle',refresh);window.addEventListener('storage',()=>queueMicrotask(refresh));refresh();
 const style=document.createElement('style');style.textContent=`
 .moonJoystick{position:absolute;left:18px;bottom:18px;width:106px;height:106px;border:2px solid #f4f8ffbb;border-radius:50%;background:radial-gradient(circle,#244f6c55,#17375099);box-shadow:0 3px 12px #13283b44;touch-action:none;user-select:none;display:grid;place-items:center;z-index:10;cursor:grab;box-sizing:border-box}
 .moonJoystick:focus-visible{outline:3px solid #ffd458;outline-offset:3px}.moonJoystick.active{cursor:grabbing;background:#24516caa}
 .moonJoystickKnob{display:block;width:46px;height:46px;border-radius:50%;background:linear-gradient(#fffef4,#cce4e7);border:2px solid #fff;box-shadow:0 3px 6px #17375066;pointer-events:none;box-sizing:border-box}
 .moonGrowth{background:#f5faf5;color:#244536;border-bottom:1px solid #c9d9cd;padding:7px 14px;font-size:12px}.moonGrowth summary{cursor:pointer;font-weight:800;min-height:22px;line-height:22px}.moonGrowthBody{max-width:360px;padding:10px 0}.moonStat{display:flex;align-items:center;gap:12px;margin-top:9px}.moonStat span{width:82px}.moonStat meter{flex:1;accent-color:#398461;height:14px}.moonGrowth p{font-size:12px;line-height:1.5;margin-bottom:0}
 @media(max-width:540px){.moonJoystick{width:94px;height:94px;left:12px;bottom:14px}.moonJoystickKnob{width:42px;height:42px}}
 `;document.head.append(style);
 if(movementHelp)movementHelp.textContent='방향키·WASD 또는 왼쪽 조이스틱을 드래그해 이동해요. Shift 또는 달리기 버튼으로 달려요. 문 앞에서 E 또는 나가기를 누르면 출입할 수 있어요.';
})();
