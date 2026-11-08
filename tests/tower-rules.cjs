// Isolated Firebase predicate tests, not emulator or deployed-server verification.
const assert=require('node:assert/strict'),all=require('../database.rules.json').rules.classes.$class.tower;
String.prototype.matches=function(r){return r.test(String(this));};
const run='-------------------1',hit='-------------------2',cls='ABCDEF123456',base=`classes/${cls}/tower/runs/${run}`,now=10000;
const initial=()=>({classes:{[cls]:{info:{owner:'teacher'},members:{student:true},tower:{config:{runId:run},runs:{}}}}});
const at=(tree,p)=>p.reduce((v,k)=>v?.[k],tree);
function snap(tree,path=[]){const v=at(tree,path);return {val:()=>v??null,exists:()=>v!==undefined&&v!==null,parent:()=>snap(tree,path.slice(0,-1)),child:p=>snap(tree,path.concat(String(p).split('/'))),hasChildren:ks=>ks.every(k=>v?.[k]!==undefined),isNumber:()=>typeof v==='number',isString:()=>typeof v==='string',isBoolean:()=>typeof v==='boolean'};}
function check(expr,old,next,path,uid='student',target='student',title='mentor-knowledge'){return Function('auth','root','data','newData','$class','$uid','$run','$hit','$title','now',`return (${expr});`)(uid?{uid,token:{firebase:{sign_in_provider:'google.com'}}}:null,snap(old),snap(old,path.split('/')),snap(next,path.split('/')),cls,target,run,hit,title,now);}
function fixture(){const old=initial(),next=structuredClone(old);next.classes[cls].tower.runs[run]={hits:{student:{[hit]:{floor:1,version:2,stats:{observation:3,persistence:1,cooperation:1,knowledge:1,creativity:1,vitality:1},name:'별빛',at:now}}},cooldowns:{student:{key:hit,at:now}}};next.classes[cls].tower.dailyAttacks={student:{key:hit,runId:run,at:now}};return {old,next};}
function validateRecord(rule,old,next,path,uid,target){if(!check(rule['.write'],old,next,path,uid,target))return false;function walk(r,p){if(r['.validate']!==undefined&&!check(r['.validate'],old,next,p,uid,target))return false;const value=at(next,p.split('/'));if(value&&typeof value==='object')for(const key of Object.keys(value))if(!r[key]||!walk(r[key],p+'/'+key))return false;return true;}return walk(rule,path);}
const hr=all.runs.$run.hits.$uid.$hit,cr=all.runs.$run.cooldowns.$uid;
let {old,next}=fixture(),hp=base+'/hits/student/'+hit,cp=base+'/cooldowns/student';assert.equal(validateRecord(hr,old,next,hp,'student','student'),true);assert.equal(validateRecord(cr,old,next,cp,'student','student'),true);
for(const uid of [null,'outsider','teacher'])assert.equal(check(hr['.write'],old,next,hp,uid,'student'),false);
assert.equal(check(all['.read'],old,next,'classes/'+cls+'/tower','outsider'),false);assert.equal(check(all['.read'],old,next,'classes/'+cls+'/tower','student'),true);
next.classes[cls].tower.runs[run].hits.student[hit].stats.observation=999;assert.equal(validateRecord(hr,old,next,hp,'student','student'),false);
({old,next}=fixture());next.classes[cls].tower.runs[run].cooldowns.student.key='different';assert.equal(validateRecord(hr,old,next,hp,'student','student'),false);
({old,next}=fixture());old.classes[cls].tower.dailyAttacks={student:{key:'old',runId:run,at:9000}};old.classes[cls].tower.runs[run]={cooldowns:{student:{key:'old',at:9000}}};assert.equal(validateRecord(cr,old,next,cp,'student','student'),true);assert.equal(validateRecord(hr,old,next,hp,'student','student'),false);
({old,next}=fixture());old.classes[cls].tower.runs[run]=structuredClone(next.classes[cls].tower.runs[run]);assert.equal(check(hr['.write'],old,next,hp,'student','student'),false);
({old,next}=fixture());delete next.classes[cls].tower.runs[run].hits.student[hit];assert.equal(check(hr['.write'],old,next,hp,'student','student'),false);
({old,next}=fixture());next.classes[cls].tower.awards={student:{'mentor-knowledge':true}};const ap=`classes/${cls}/tower/awards/student/mentor-knowledge`,ar=all.awards.$uid.$title;
assert.equal(check(ar['.write'],old,next,ap,'student','student'),false);assert.equal(check(ar['.write'],old,next,ap,'teacher','student'),true);assert.equal(check(ar['.validate'],old,next,ap,'teacher','student'),true);assert.equal(check(ar['.validate'],old,next,ap,'teacher','student','tower-0'),false);
console.log('PASS isolated predicates: class membership, own append-only hit, bounded power, paired cooldown and global KST daily limit, no replay/delete, owner-only award; not emulator integration');
