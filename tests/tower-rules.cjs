// Isolated Firebase predicate tests, not emulator or deployed-server verification.
const assert=require('node:assert/strict'),all=require('../database.rules.json').rules.classes.$class.tower;
String.prototype.matches=function(r){return r.test(String(this));};
const run='-------------------1',hit='-------------------2',cls='ABCDEF123456',base=`classes/${cls}/tower/runs/${run}`,now=10000;
const initial=()=>({classes:{[cls]:{info:{owner:'teacher'},members:{student:true},tower:{config:{runId:run},runs:{}}}}});
const at=(tree,p)=>p.reduce((v,k)=>v?.[k],tree);
function snap(tree,path=[]){const v=at(tree,path);return {val:()=>v??null,exists:()=>v!==undefined&&v!==null,parent:()=>snap(tree,path.slice(0,-1)),child:p=>snap(tree,path.concat(String(p).split('/'))),hasChildren:ks=>ks.every(k=>v?.[k]!==undefined),isNumber:()=>typeof v==='number',isString:()=>typeof v==='string',isBoolean:()=>typeof v==='boolean'};}
function check(expr,old,next,path,uid='student',target='student',title='mentor-knowledge'){return Function('auth','root','data','newData','$class','$uid','$run','$hit','$title','now',`return (${expr});`)(uid?{uid,token:{firebase:{sign_in_provider:'google.com'}}}:null,snap(old),snap(old,path.split('/')),snap(next,path.split('/')),cls,target,run,hit,title,now);}
function fixture(){const old=initial(),next=structuredClone(old);next.classes[cls].tower.runs[run]={hits:{student:{[hit]:{floor:1,stat:'observation',power:3,name:'별빛',at:now}}},cooldowns:{student:{key:hit,at:now}}};return {old,next};}
function validateRecord(rule,old,next,path,uid,target){if(!check(rule['.write'],old,next,path,uid,target)||!check(rule['.validate'],old,next,path,uid,target))return false;for(const [key,val] of Object.entries(at(next,path.split('/'))||{})){if(!rule[key])return false;if(!check(rule[key]['.validate'],old,next,path+'/'+key,uid,target))return false;}return true;}
const hr=all.runs.$run.hits.$uid.$hit,cr=all.runs.$run.cooldowns.$uid;
let {old,next}=fixture(),hp=base+'/hits/student/'+hit,cp=base+'/cooldowns/student';assert.equal(validateRecord(hr,old,next,hp,'student','student'),true);assert.equal(validateRecord(cr,old,next,cp,'student','student'),true);
for(const uid of [null,'outsider','teacher'])assert.equal(check(hr['.write'],old,next,hp,uid,'student'),false);
assert.equal(check(all['.read'],old,next,'classes/'+cls+'/tower','outsider'),false);assert.equal(check(all['.read'],old,next,'classes/'+cls+'/tower','student'),true);
next.classes[cls].tower.runs[run].hits.student[hit].power=999;assert.equal(validateRecord(hr,old,next,hp,'student','student'),false);
({old,next}=fixture());next.classes[cls].tower.runs[run].cooldowns.student.key='different';assert.equal(validateRecord(hr,old,next,hp,'student','student'),false);
({old,next}=fixture());old.classes[cls].tower.runs[run]={cooldowns:{student:{key:'old',at:9000}}};assert.equal(validateRecord(cr,old,next,cp,'student','student'),false);assert.equal(validateRecord(hr,old,next,hp,'student','student'),false);
({old,next}=fixture());old.classes[cls].tower.runs[run]=structuredClone(next.classes[cls].tower.runs[run]);assert.equal(check(hr['.write'],old,next,hp,'student','student'),false);
({old,next}=fixture());delete next.classes[cls].tower.runs[run].hits.student[hit];assert.equal(check(hr['.write'],old,next,hp,'student','student'),false);
({old,next}=fixture());next.classes[cls].tower.awards={student:{'mentor-knowledge':true}};const ap=`classes/${cls}/tower/awards/student/mentor-knowledge`,ar=all.awards.$uid.$title;
assert.equal(check(ar['.write'],old,next,ap,'student','student'),false);assert.equal(check(ar['.write'],old,next,ap,'teacher','student'),true);assert.equal(check(ar['.validate'],old,next,ap,'teacher','student'),true);assert.equal(check(ar['.validate'],old,next,ap,'teacher','student','tower-0'),false);
console.log('PASS isolated predicates: class membership, own append-only hit, bounded power, paired cooldown, rate limit, no replay/delete, owner-only award; not emulator integration');
