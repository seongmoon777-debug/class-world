/* Pre-issued student identities. Passwords are never bundled in the app. */
(function(root){'use strict';
 const domain='students.moonschool.invalid',defaultClass='7CB421300685';
 function parse(value){const id=String(value||'').trim().toUpperCase(),m=/^MSCHOOL(0[1-9]|[12][0-9]|30)$/.exec(id);return m?{id,number:Number(m[1]),email:id.toLowerCase()+'@'+domain}:null;}
 function fromEmail(email){const parts=String(email||'').toLowerCase().split('@');return parts[1]===domain?parse(parts[0]):null;}
 function binding(email,profile){const account=fromEmail(email);return account&&profile&&profile.loginId===account.id&&profile.number===account.number&&/^[A-F0-9]{12}$/.test(profile.classCode)?{...account,classCode:profile.classCode}:null;}
 const api={domain,defaultClass,parse,fromEmail,binding};if(typeof module!=='undefined')module.exports=api;else root.MoonStudentAccounts=api;
})(typeof window!=='undefined'?window:globalThis);
