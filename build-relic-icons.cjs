/* Rebuild the small vector sprite from the permanent relic catalog. */
const fs=require('node:fs'),{items}=require('./journey-core.js');
const colors={observation:['#294e69','#9dd7ef'],persistence:['#514860','#dbc4ee'],cooperation:['#725139','#f1c795'],knowledge:['#314779','#a6c4ff'],creativity:['#6a4274','#eeb5e8'],vitality:['#69512f','#f8d87d']};
const shapes={
 compass:'<path d="M16 6 21 16 16 26 11 16Z"/><path d="m7 16 9-5 9 5-9 5Z" fill="#fff1b5"/><path d="m16 7 3 9-3-2-3 2Z" fill="#d78873"/>',
 gem:'<path d="m9 7 14 0 5 8-12 13L4 15Z"/><path d="m9 7 3 8 4-8 4 8 3-8M4 15h24M12 15l4 13 4-13" fill="none" stroke="#fff2cb"/>',
 feather:'<path d="M7 26 12 11 24 5 27 11 20 21Z"/><path d="m7 27 15-16M12 20l6 1M15 15l6 1" stroke="#fff0b5" fill="none"/>',
 badge:'<path d="m9 20-2 9 8-4 8 4-1-9" fill="#b88270"/><path d="m16 4 4 4 6 1-1 7 1 5-7 1-3 4-4-4-7-1 1-6-1-6 7-1Z"/><path d="m16 9 2 4 5 1-4 3 1 5-4-3-4 3 1-5-4-3 5-1Z" fill="#fff0b1"/>',
 boots:'<path d="M8 6h10v12l8 4v5H7v-7h3V11H8Z"/><path d="M9 11h8M9 15h8M7 25h19" fill="none" stroke="#fff0b5"/>',
 map:'<path d="m4 8 8-3 8 3 8-3v21l-8 3-8-3-8 3Z"/><path d="M12 5v21M20 8v21M8 18l4-4 5 4 7-5" fill="none" stroke="#fff0b5"/><path d="m21 10 5 5m0-5-5 5" stroke="#c7746c"/>',
 shield:'<path d="m16 4 11 5-1 12-10 8L6 21 5 9Z"/><path d="M16 8v17M9 14h14" stroke="#fff0b5"/>',
 sun:'<path d="M16 2v5m0 18v5M2 16h5m18 0h5M6 6l4 4m12 12 4 4M26 6l-4 4M10 22l-4 4" stroke="#fff0b5"/><circle cx="16" cy="16" r="8"/><circle cx="14" cy="13" r="2" fill="#fff4cc"/>',
 lantern:'<path d="M12 8V5h8v3M8 9h16v16H8Z" fill="none" stroke="#fff0b5" stroke-width="2"/><path d="M6 8h20v4H6Zm0 16h20v4H6Z"/><path d="m16 12 4 8-4 3-4-3Z" fill="#fff0b5"/>',
 ring:'<circle cx="16" cy="19" r="8" fill="none" stroke="#ffe097" stroke-width="4"/><path d="m11 7 5-4 5 4-5 7Z"/>',
 eye:'<path d="M3 16q13-18 26 0-13 18-26 0Z"/><circle cx="16" cy="16" r="6" fill="#fff0b5"/><circle cx="16" cy="16" r="3" fill="#263c56"/>',
 telescope:'<path d="m7 20 12-12 8 8-12 12Z"/><path d="m17 6 5-3 8 8-3 5Z" fill="#fff0b5"/><path d="M15 22v7m0-6-6 6m6-6 6 6" stroke="#fff0b5" fill="none"/>',
 key:'<circle cx="11" cy="11" r="7" fill="none" stroke="#ffe097" stroke-width="4"/><path d="m15 16 12 12m-6-6 4-4m0 8 4-4" fill="none" stroke="#ffe097" stroke-width="4"/>',
 star:'<path d="m16 3 4 9 10 1-8 7 3 10-9-5-9 5 3-10-8-7 10-1Z"/><path d="m16 8 1 8-5 4 4-1 5 2-4-5Z" fill="#fff0b5"/>',
 candle:'<path d="M10 13h12v14H10Z"/><path d="m16 2 5 7-5 5-5-5Z" fill="#fff0b5"/><path d="M7 28h18M13 17v7" stroke="#fff0b5"/>',
 anchor:'<circle cx="16" cy="7" r="4" fill="none" stroke="#fff0b5" stroke-width="2"/><path d="M16 11v17M5 19q0 10 11 9 11 1 11-9M9 15h14M2 20l3-4 4 4m14 0 4-4 3 4" fill="none" stroke="#fff0b5" stroke-width="3"/>',
 knot:'<path d="m9 4 17 17-5 6L4 10Zm14 0L6 21l5 6L28 10Z"/><path d="m8 10 14 14m2-14L10 24" stroke="#fff0b5" fill="none"/>',
 clock:'<path d="M7 4h18M7 28h18M9 5q0 7 7 11-7 5-7 11m14-22q0 7-7 11 7 5 7 11" fill="none" stroke="#fff0b5" stroke-width="2"/><path d="m11 8 5 6 5-6Zm0 17 5-6 5 6Z"/>',
 leaf:'<path d="M5 24Q3 4 27 4q2 24-18 23Z"/><path d="M5 29 23 9m-13 9v-6m7 8h6" stroke="#fff0b5" fill="none"/>',
 heart:'<path d="M16 28 4 16Q0 3 10 5l6 6 6-6q10-2 6 11Z"/><path d="m5 17 6 0 3-5 4 9 3-4h7" stroke="#fff0b5" fill="none"/>',
 bell:'<path d="M7 22q4-4 3-11 6-11 12 0-1 7 3 11Z"/><path d="M5 23h22M12 27h8M16 3v4" stroke="#fff0b5" stroke-width="2"/>',
 book:'<path d="M5 5h21v24H5Z"/><path d="M10 5v24M14 11h8m-8 5h8m-8 5h6" stroke="#fff0b5" fill="none"/>',
 orb:'<circle cx="16" cy="13" r="10"/><path d="M10 23h12l3 5H7Z" fill="#fff0b5"/><path d="m16 5 3 5 5 3-5 3-3 5-3-5-5-3 5-3Z" fill="#fff1b5"/>',
 crown:'<path d="M5 9 10 16 16 5 22 16 27 9l-3 18H8Z"/><path d="M8 23h16M16 17v4" stroke="#fff0b5" stroke-width="2"/>',
 bottle:'<path d="M11 4h10v7q9 5 5 16H6q-4-11 5-16Z"/><path d="M11 6h10M7 20q9-6 18 0" stroke="#fff0b5" fill="none"/><path d="m16 13 3 5-3 3-3-3Z" fill="#fff0b5"/>',
 horn:'<path d="M4 8q4 20 24 13V8q-13 14-20-3Z"/><path d="M24 8v16M8 9l4 9" stroke="#fff0b5" fill="none"/>',
 mask:'<path d="M5 5q11 5 22 0v14L16 29 5 19Z"/><path d="m9 13 5 2m4 0 5-2m-10 9h6" stroke="#fff0b5" stroke-width="2" fill="none"/>',
 palette:'<path d="M24 5Q4 0 3 19q2 14 13 8 4-2 1-6-2-5 5-3 12 0 2-13Z"/><circle cx="10" cy="12" r="3" fill="#f5a787"/><circle cx="19" cy="10" r="3" fill="#fff0b5"/><circle cx="9" cy="21" r="3" fill="#b8d8ee"/>',
 harp:'<path d="M6 5q16 15 21-1L23 28H9Z" fill="none" stroke="#fff0b5" stroke-width="3"/><path d="M12 13v13m5-12v12m5-15v15" stroke="#fff0b5"/>',
 flag:'<path d="M8 3v27M9 5h18l-5 7 5 7H9"/><path d="M8 3v27" stroke="#fff0b5" stroke-width="3"/><path d="m15 9 5 3-5 3Z" fill="#fff0b5"/>'};
const type={compass:'compass',crystal:'gem',quill:'feather',badge:'badge',boots:'boots',map:'map',shield:'shield',stone:'sun',lantern:'lantern',pendant:'ring',monocle:'eye','owl-eye':'eye','star-glass':'telescope','seeker-key':'key','north-star':'star',oracle:'orb',candle:'candle',anchor:'anchor',knot:'knot',ember:'candle',clock:'clock',seed:'leaf','iron-heart':'heart','silver-bell':'bell','red-thread':'knot','friend-ring':'ring','bridge-charm':'badge','twin-moon':'orb',banner:'flag','rune-book':'book','rune-lens':'eye','ink-stone':'book','memory-orb':'orb',astrolabe:'compass','scholar-key':'key','wisdom-crown':'crown',pigment:'palette',mask:'mask','dream-brush':'feather',prism:'gem','star-ink':'bottle','muse-harp':'harp','dream-catcher':'knot',palette:'palette',dew:'bottle','sun-leaf':'leaf','wind-horn':'horn','spring-water':'bottle','phoenix-token':'feather','thunder-shard':'heart'};
let svg='<svg xmlns="http://www.w3.org/2000/svg">';for(const [i,item]of items.entries()){const [dark,light]=colors[item.stat],border=item.rarity==='영웅'?'#d6a8ec':item.rarity==='희귀'?'#a9d3e9':'#dac895';svg+=`<symbol id="${item.id}" viewBox="0 0 32 32"><rect x=".5" y=".5" width="31" height="31" rx="5" fill="${dark}" stroke="${border}"/><g transform="translate(3 3) scale(.81)" fill="${light}">${shapes[type[item.id]]}</g><rect x="${3+i%5*5}" y="29" width="3" height="1" fill="${border}"/></symbol>`;}svg+='</svg>';fs.mkdirSync('assets',{recursive:true});fs.writeFileSync('assets/relic-icons.svg',svg);console.log('Built '+items.length+' relic symbols');
