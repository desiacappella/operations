(this.webpackJsonpapp=this.webpackJsonpapp||[]).push([[0],{102:function(e,t,a){"use strict";a.r(t);var n=a(2),c=a(0),r=a(13),s=a.n(r),i=(a(92),a(15)),j=a(153),u=a(157),o=a(103),b=a(151),h=(a(93),a(52)),O=a(16),l=a(27),d=a.n(l),p="94642598479-g1na4rsqrj5vu6dram3r7k6k200s8j6m.apps.googleusercontent.com",m="AIzaSyBMZ3rGb7dWifD8QVjbidUpvxypn9XfiXA",x=["https://sheets.googleapis.com/$discovery/rest?version=v4"],g="https://www.googleapis.com/auth/spreadsheets.readonly";function f(){return window.gapi}var v=a(44),k=a(69),S=a(18),w=a.n(S),y=a(23),R=a(137),A=a(141),C=a(142),I=a(156),z=a(143),J=a(144),G=a(145),M=a(146),F=a(74),P=a(56),D=a(57),_=a(152),E=a(4),H={"18-19":{order:["jeena","anahat","sangeet","mehfil","sahana","gathe","awaazein"],names:{jeena:"Jeena",anahat:"Anahat",sangeet:"Sangeet Saagar",mehfil:"Mehfil",sahana:"Sahana",gathe:"Gathe Raho",awaazein:"Awaazein"},sheetIds:{anahat:"1iFCNADUpzFyqp5UjHsFdSJkSp5C5xU7C0YI3Asf_Q0k",awaazein:"1pLN6SKR444CdhzntJjDXnPMlqXtxr3dlTV5lnYWOFXI",gathe:"1cg6XptCMQsWfmu7RnncfWP1E5b_FSyFOrDehbwlFUFY",jeena:"1B1qh4kKSeAFTV1r3MO4Y5jikyYFGHOe7-c46ha3Y-qc",mehfil:"1k7F_gBNM1OfDta5_gT_cHovDmt32jbXw--YMoTk1yc4",sahana:"1m9l2EQS3h75dlXz7A8E2JKc5GMXJOHlBS3gPlrgI3b4",sangeet:"1pYyUIt2RvZ5AOZwwzIvZKd-KTuUE9uPOpT2BpReqkgo"}},"19-20":{order:["jeena","anahat","sahana","sangeet","sapna","gathe","awaazein"],names:{jeena:"Jeena",anahat:"Anahat",sangeet:"Sangeet Saagar",sapna:"Steel City Sapna",sahana:"Sahana",gathe:"Gathe Raho",awaazein:"Awaazein"},sheetIds:{jeena:"1PERpK3VvawDj-lpZGupI6k5H7aRd5WUrQ5emM6O7ZiQ",anahat:"1paQFjuvZSip1qe56qIWT5Un86Cv8BuyG1clHMvFArxg",sangeet:"15ok6-LsCmh8qWpZAA_Jw8fHspOITdFYRHfOlpuF9Ous",sapna:"11fmeZOdIDqEE3CxT_FeJO4xJV95JGuSi8VO5tvrmiUU",sahana:"1xeDesKJ_J9rshPYjGUuxPNSHxbF6cVIOGDgnhm0vJqw",gathe:"1RAqltt5vl4uk0gq3RCe4fNWu0taGokv2UP9vjWXO8JY",awaazein:"1KYCn0RWMxbWabw4AuZzzsIyKZyCRnadvqcZVi9t7oDM"}},2022:{order:["sangeet","sapna","jeena","awaazein"],names:{jeena:"Jeena",sangeet:"Sangeet Saagar",sapna:"Steel City Sapna",awaazein:"Awaazein"},sheetIds:{sangeet:"1HV0ytC_S8O1TrkPBjhH4Nnk43o_S8u-lz53krjFoDi4",sapna:"1x-60JJXicIrXA_m7x1652SSl7gJ_aKqDBNA22IcwF8w",jeena:"1Ul53wzbCMpO_nmZ-l4HDZUFHHTKNMvsHCSq1XH2mekU"}}},V="compDetails",q=function(){function e(){Object(P.a)(this,e)}return Object(D.a)(e,[{key:"parseV1",value:function(e){var t=e.length-2,a=Object(E.findIndex)(e[0],(function(e){return e.startsWith("Converted Scores")})),n=Object(E.findLastIndex)(e[0],(function(e){return e.indexOf("Scores")>=0&&e.indexOf("Converted Scores")<0})),c=a-n;return[Object(E.reduce)(e.slice(2,2+t),(function(e,t){return Object(E.set)(e,t[0],t.slice(n,a))}),{}),c]}},{key:"get_raw_scores",value:function(){var e=Object(y.a)(w.a.mark((function e(t,a){var n,c,r,s,j,u,o,b,h;return w.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:if(n=localStorage.getItem("".concat(V,"-").concat(t)),c=n?JSON.parse(n):{},!(r=Object(E.get)(c,a))){e.next=5;break}return e.abrupt("return",r);case 5:if(d.a.info("Had to fetch from Google sheets",t,a),s=H[t].sheetIds[a],e.prev=7,s){e.next=10;break}throw new Error("no spreadsheet");case 10:return e.next=12,f().client.sheets.spreadsheets.values.get({spreadsheetId:s,range:"Calculator"});case 12:return j=e.sent,u=this.parseV1(j.result.values),o=Object(i.a)(u,2),b=o[0],h=o[1],Object(E.set)(c,a,[b,h]),localStorage.setItem("".concat(V,"-").concat(t),JSON.stringify(c)),e.abrupt("return",[b,h]);case 19:return e.prev=19,e.t0=e.catch(7),d.a.error(e.t0),e.abrupt("return",[{},0]);case 23:case"end":return e.stop()}}),e,this,[[7,19]])})));return function(t,a){return e.apply(this,arguments)}}()}]),e}(),T=function(e,t){var a=Object(E.map)(Object(E.range)(t),(function(t){var a=Object(E.map)(e,(function(e){return e[t]}));return Object(_.b)(a)})),n=Object(E.mapValues)(e,(function(e){return Object(E.map)(e,(function(e,t){return 100*e/a[t]}))})),c=Object(E.mapValues)(e,(function(e){return Object(_.b)(e)})),r=Object(E.mapValues)(n,(function(e){return Object(_.b)(e)})),s=Object(E.mapValues)(n,(function(e){return Object(_.c)(e)})),i=Object(E.values)(r),j=i.length?Object(_.a)(i):0,u=i.length?Object(_.d)(i):0;return{raw:e,normal:n,rawAverages:c,normalAverages:r,normalMedians:s,max:j,min:u,judgeAvgs:a}},U=function(){var e=Object(y.a)(w.a.mark((function e(t,a){var n,c,r,s,j;return w.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return n=new q,e.next=3,n.get_raw_scores(t,a);case 3:return c=e.sent,r=Object(i.a)(c,2),s=r[0],j=r[1],e.abrupt("return",T(s,j));case 8:case"end":return e.stop()}}),e)})));return function(t,a){return e.apply(this,arguments)}}();function N(e){var t=Object(E.toPairs)(e),a=Object(E.reverse)(Object(E.sortBy)(Object(E.values)(t),[function(e){return e[1]}])),n={},c=1,r=void 0;return Object(E.forEach)(a,(function(e,t){void 0!=r&&r===e[1]||(c=t+1),n[e[0]]=c,r=e[1]})),n}var Y=function(){function e(t,a){var n;Object(P.a)(this,e),this.year=void 0,this.comps=void 0,this.compDetails={},this.groups=[],this.amed={},this.amean={},this.rmed={},this.rmean={},this.amedRank={},this.ameanRank={},this.rmedRank={},this.rmeanRank={},this.attended={},this.avgGroupsPerComp=0,this.avgJudgesPerComp=0,this.avgCompsPerGroup=0,this.year=a;var c=(null===(n=H[a])||void 0===n?void 0:n.order)||[];if(t>c.length)throw new Error("Illegal argument: num");t<0&&(t=c.length),this.comps=c.slice(0,t)}return Object(D.a)(e,[{key:"process",value:function(){var t=Object(y.a)(w.a.mark((function t(){var a,n,c,r,s,j,u,o,b,h,O,l,p,m,x,g,f=this;return w.a.wrap((function(t){for(;;)switch(t.prev=t.next){case 0:a={},n=Object(F.a)(this.comps),t.prev=2,n.s();case 4:if((c=n.n()).done){t.next=11;break}return r=c.value,t.next=8,U(this.year,r);case 8:a[r]=t.sent;case 9:t.next=4;break;case 11:t.next=16;break;case 13:t.prev=13,t.t0=t.catch(2),n.e(t.t0);case 16:return t.prev=16,n.f(),t.finish(16);case 19:this.compDetails=a,s=e.build_totals(this.compDetails),j=Object(i.a)(s,2),u=j[0],o=j[1],this.groups=Object(E.keys)(u),b=Z(u),h=Object(i.a)(b,2),O=h[0],l=h[1],p=Z(o),m=Object(i.a)(p,2),x=m[0],g=m[1],this.amed=O,this.amean=l,this.rmed=x,this.rmean=g,this.amedRank=N(this.amed),this.ameanRank=N(this.amean),this.rmedRank=N(this.rmed),this.rmeanRank=N(this.rmean),this.attended=Object(E.reduce)(this.groups,(function(e,t){return Object(E.set)(e,t,Object(E.filter)(f.comps,(function(e){return!!Object(E.has)(f.compDetails[e].raw,t)})))}),{});try{this.avgGroupsPerComp=Object(_.b)(Object(E.map)(this.compDetails,(function(e){return Object(E.size)(e.raw)}))),this.avgJudgesPerComp=Object(_.b)(Object(E.map)(this.compDetails,(function(e){return Object(E.size)(e.judgeAvgs)}))),this.avgCompsPerGroup=Object(_.b)(Object(E.map)(this.groups,(function(e){return Object(E.size)(f.attended[e])})))}catch(v){d.a.error(v),this.avgGroupsPerComp=0,this.avgJudgesPerComp=0,this.avgCompsPerGroup=0}case 34:case"end":return t.stop()}}),t,this,[[2,13,16,19]])})));return function(){return t.apply(this,arguments)}}()},{key:"getGroupStats",value:function(e){return{amed:this.amed[e]||0,amean:this.amean[e]||0,rmed:this.rmed[e]||0,rmean:this.rmean[e]||0}}},{key:"getGroupRanks",value:function(e){return{amed:this.amedRank[e]||this.groups.length+1,amean:this.ameanRank[e]||this.groups.length+1,rmed:this.rmedRank[e]||this.groups.length+1,rmean:this.rmeanRank[e]||this.groups.length+1,total:this.groups.length}}},{key:"getStandings",value:function(){var e=this,t={};return Object(E.forEach)(this.groups,(function(a){var n=Object(_.a)([Object(E.get)(e.amedRank,"[".concat(a,"]"),Object(E.size)(e.groups)),Object(E.get)(e.ameanRank,"[".concat(a,"]"),Object(E.size)(e.groups)),Object(E.get)(e.rmedRank,"[".concat(a,"]"),Object(E.size)(e.groups)),Object(E.get)(e.rmeanRank,"[".concat(a,"]"),Object(E.size)(e.groups))]);n&&(t[n]=n in t?Object(E.concat)(t[n],a):[a])})),Object(E.mapValues)(t,(function(e){return Object(E.sortBy)(e)}))}},{key:"getFullStandings",value:function(){var e=this,t=this.getStandings();return Object(E.mapValues)(t,(function(t){return Object(E.reduce)(t,(function(t,a){return t[a]={amed:e.amedRank[a],amean:e.ameanRank[a],rmed:e.rmedRank[a],rmean:e.rmeanRank[a]},t}),{})}))}},{key:"selectGroups",value:function(e){var t=this;return Object(E.filter)(this.groups,(function(a){return Object(E.get)(t.amedRank,"[".concat(a,"]"),Object(E.size)(t.groups))<=e&&Object(E.get)(t.ameanRank,"[".concat(a,"]"),Object(E.size)(t.groups))<=e&&Object(E.get)(t.rmedRank,"[".concat(a,"]"),Object(E.size)(t.groups))<=e&&Object(E.get)(t.rmeanRank,"[".concat(a,"]"),Object(E.size)(t.groups))<=e}))}}],[{key:"build_totals",value:function(e){var t={},a={};return Object(E.forEach)(e,(function(e){var n=e.raw,c=e.normal;Object(E.forEach)(n,(function(e,n){t[n]=n in t?Object(E.concat)(t[n],e):e,a[n]=n in a?Object(E.concat)(a[n],c[n]):c[n]}))})),[t,a]}}]),e}();function Z(e){var t={},a={};return Object(E.forEach)(e,(function(e,n){t[n]=Object(_.c)(e),a[n]=Object(_.b)(e)})),[t,a]}function B(e){var t,a=e.year,r=Object(c.useState)(new Y(0,"")),s=Object(i.a)(r,2),j=s[0],u=s[1],b=Object(c.useState)([]),h=Object(i.a)(b,2),O=h[0],l=h[1],d=Object(c.useState)(0),p=Object(i.a)(d,2),m=p[0],x=p[1];Object(c.useEffect)((function(){(function(){var e=Object(y.a)(w.a.mark((function e(){var t;return w.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return t=new Y(m,a),e.next=3,t.process();case 3:u(t);case 4:case"end":return e.stop()}}),e)})));return function(){return e.apply(this,arguments)}})()()}),[m,a]),Object(c.useEffect)((function(){l([{value:0}].concat(Object(k.a)(Object(E.map)(H[a].order,(function(e,t){return{value:t+1,label:H[a].names[e]}}))))),x(0)}),[a]);var g=j?j.getFullStandings():{},f=Object(E.reduce)(g,(function(e,t,a){var c=!0,r=Object(E.map)(t,(function(e,r){var s=Object(n.jsxs)(R.a,{children:[c&&Object(n.jsx)(A.a,{rowSpan:Object(E.size)(t),children:a}),Object(n.jsx)(A.a,{children:r}),Object(n.jsx)(A.a,{children:e.amed}),Object(n.jsx)(A.a,{children:e.amean}),Object(n.jsx)(A.a,{children:e.rmed}),Object(n.jsx)(A.a,{children:e.rmean})]},r);return c=!1,s}));return E.concat.apply(void 0,[e].concat(Object(k.a)(r)))}),[]);return Object(n.jsxs)("div",{children:[Object(n.jsx)(C.a,{container:!0,justify:"center",children:Object(n.jsx)(C.a,{item:!0,xs:11,children:Object(n.jsx)(I.a,{step:1,marks:O,min:0,max:(null===(t=Object(E.last)(O))||void 0===t?void 0:t.value)||0,value:m,onChange:function(e,t){Object(v.a)(e),x(t)}})})}),Object(n.jsxs)(C.a,{container:!0,justify:"center",children:[Object(n.jsx)(C.a,{item:!0,xs:12,children:Object(n.jsxs)(o.a,{children:[Object(n.jsxs)("b",{children:[Object(E.size)(Object(E.get)(j,"groups"))," groups"]}),": ",Object(E.join)(Object(E.sortBy)(Object(E.get)(j,"groups")),", ")]})}),Object(n.jsx)(C.a,{item:!0,xs:12,children:Object(n.jsxs)(o.a,{children:[Object(n.jsxs)("b",{children:[Object(E.size)(Object(E.get)(j,"comps"))," comps"]}),":"," ",Object(E.join)(Object(E.map)(null===j||void 0===j?void 0:j.comps,(function(e){return H[a].names[e]})),", ")]})})]}),Object(n.jsx)(z.a,{children:Object(n.jsxs)(J.a,{children:[Object(n.jsx)(G.a,{children:Object(n.jsxs)(R.a,{children:[Object(n.jsx)(A.a,{children:"Threshold"}),Object(n.jsx)(A.a,{children:"Team"}),Object(n.jsx)(A.a,{children:"Abs Median"}),Object(n.jsx)(A.a,{children:"Abs Mean"}),Object(n.jsx)(A.a,{children:"Rel Median"}),Object(n.jsx)(A.a,{children:"Rel Mean"})]})}),Object(n.jsx)(M.a,{children:f})]})})]})}a(99);var X=a(155),K=a(154),W=a(147),Q=a(148);function L(e){var t=e.year,a=Object(c.useState)(0),r=Object(i.a)(a,2),s=r[0],j=r[1],u=Object(c.useState)({}),b=Object(i.a)(u,2),h=b[0],O=b[1],l=Object(c.useState)(!0),d=Object(i.a)(l,2),p=d[0],m=d[1],x=H[t],g=x.order[s],f=x.sheetIds[g];Object(c.useEffect)((function(){(function(){var e=Object(y.a)(w.a.mark((function e(){return w.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.t0=O,e.next=3,U(t,g);case 3:e.t1=e.sent,(0,e.t0)(e.t1);case 5:case"end":return e.stop()}}),e)})));return function(){return e.apply(this,arguments)}})()()}),[g,t]);var k=p?h.raw:h.normal;return Object(n.jsxs)("div",{children:[Object(n.jsx)(o.a,{variant:"h4",children:"Raw Results from Competitions"}),Object(n.jsxs)(C.a,{component:"label",container:!0,justify:"center",alignItems:"center",spacing:1,children:[Object(n.jsx)(C.a,{item:!0,children:Object(n.jsx)(o.a,{children:"Normal"})}),Object(n.jsx)(C.a,{item:!0,children:Object(n.jsx)(X.a,{checked:p,onChange:function(e,t){Object(v.a)(e),m(t)}})}),Object(n.jsx)(C.a,{item:!0,children:Object(n.jsx)(o.a,{children:"Raw"})})]}),Object(n.jsx)(K.a,{value:s,onChange:function(e,t){Object(v.a)(e),j(t)},children:Object(E.map)(x.order,(function(e){return Object(n.jsx)(W.a,{label:x.names[e]},e)}))}),f&&Object(n.jsx)(o.a,{children:Object(n.jsx)(Q.a,{href:"https://docs.google.com/spreadsheets/d/".concat(f,"/edit"),target:"_blank",rel:"noopener",children:"Original Sheet"})}),Object(n.jsx)(z.a,{children:Object(n.jsxs)(J.a,{children:[Object(n.jsx)(G.a,{children:Object(n.jsxs)(R.a,{children:[Object(n.jsx)(A.a,{children:"Team"}),Object(E.map)(Object(E.values)(k)[0],(function(e,t){return Object(v.a)(e),Object(n.jsxs)(A.a,{children:["Judge ",t+1]})})),Object(n.jsx)(A.a,{children:"Average"})]})}),Object(n.jsxs)(M.a,{children:[Object(E.map)(k,(function(e,t){return Object(n.jsxs)(R.a,{children:[Object(n.jsx)(A.a,{children:t}),Object(E.map)(e,(function(e,t){return Object(n.jsx)(A.a,{children:e},t)})),Object(n.jsx)(A.a,{variant:"head",children:p?h.rawAverages[t]:h.normalAverages[t]})]},t)})),Object(n.jsxs)(R.a,{children:[Object(n.jsx)(A.a,{variant:"head",children:"Judge Average"}),Object(E.map)(h.judgeAvgs,(function(e,t){return Object(n.jsx)(A.a,{variant:"head",children:e},t)})),Object(n.jsx)(A.a,{})]})]})]})})]})}var $=a(149),ee=a(150),te=a.p+"static/media/logo.8d17df2f.png";function ae(e){var t=e.year,a=e.group,c=e.full,r=c.getGroupRanks(a),s=c.getGroupStats(a);return Object(n.jsxs)("div",{children:[Object(n.jsx)("div",{style:{display:"flex"},children:Object(n.jsx)("img",{style:{margin:"0 auto",height:100},src:te,alt:"ASA"})}),Object(n.jsxs)(o.a,{variant:"h1",children:["ASA Score Report ",t]}),Object(n.jsx)(o.a,{variant:"h2",children:a.replace("_"," ")}),Object(n.jsx)(z.a,{children:Object(n.jsxs)(J.a,{children:[Object(n.jsx)(G.a,{children:Object(n.jsxs)(R.a,{children:[Object(n.jsx)(A.a,{}),Object(n.jsx)(A.a,{children:"Abs. Median"}),Object(n.jsx)(A.a,{children:"Abs. Mean"}),Object(n.jsx)(A.a,{children:"Rel. Median"}),Object(n.jsx)(A.a,{children:"Rel. Mean"})]})}),Object(n.jsxs)(M.a,{children:[Object(n.jsxs)(R.a,{children:[Object(n.jsx)(A.a,{variant:"head",children:"Rank"}),Object(n.jsx)(A.a,{children:r.amed}),Object(n.jsx)(A.a,{children:r.amean}),Object(n.jsx)(A.a,{children:r.rmed}),Object(n.jsx)(A.a,{children:r.rmean})]}),Object(n.jsxs)(R.a,{children:[Object(n.jsx)(A.a,{variant:"head",children:"Score"}),Object(n.jsx)(A.a,{children:Object(E.round)(s.amed,2)}),Object(n.jsx)(A.a,{children:Object(E.round)(s.amean,2)}),Object(n.jsx)(A.a,{children:Object(E.round)(s.rmed,2)}),Object(n.jsx)(A.a,{children:Object(E.round)(s.rmean,2)})]})]})]})}),Object(n.jsx)(o.a,{variant:"h2",children:"Competitions"}),Object(n.jsx)(C.a,{container:!0,spacing:2,justify:"center",children:Object(E.map)(c.attended[a],(function(e){var r=c.compDetails[e];return Object(n.jsx)(C.a,{item:!0,xs:9,children:Object(n.jsxs)($.a,{children:[Object(n.jsx)(o.a,{variant:"h5",children:Object(E.find)(H[t].names,(function(t,a){return a===e}))}),Object(n.jsxs)(C.a,{container:!0,spacing:1,justify:"center",alignItems:"center",children:[Object(n.jsx)(C.a,{item:!0,children:Object(n.jsx)(o.a,{children:"Normalized Scores"})}),Object(n.jsxs)(C.a,{item:!0,children:[Object(n.jsx)(o.a,{children:"Max"}),Object(n.jsx)(o.a,{children:Object(E.round)(r.max,2)})]}),Object(n.jsxs)(C.a,{item:!0,children:[Object(n.jsx)(o.a,{children:"Min"}),Object(n.jsx)(o.a,{children:Object(E.round)(r.min,2)})]})]}),Object(n.jsx)(ee.a,{variant:"middle"}),Object(n.jsx)(z.a,{children:Object(n.jsxs)(J.a,{children:[Object(n.jsx)(G.a,{children:Object(n.jsxs)(R.a,{children:[Object(n.jsx)(A.a,{}),Object(E.map)(r.judgeAvgs,(function(e,t){return Object(n.jsx)(A.a,{children:t+1})}))]})}),Object(n.jsxs)(M.a,{children:[Object(n.jsxs)(R.a,{children:[Object(n.jsx)(A.a,{variant:"head",children:"Judge raw avg"}),Object(E.map)(r.judgeAvgs,(function(e){return Object(n.jsx)(A.a,{children:Object(E.round)(e,2)})}))]}),Object(n.jsxs)(R.a,{children:[Object(n.jsx)(A.a,{variant:"head",children:"Your raw"}),Object(E.map)(r.raw[a],(function(e){return Object(n.jsx)(A.a,{children:Object(E.round)(e,2)})}))]}),Object(n.jsxs)(R.a,{children:[Object(n.jsx)(A.a,{variant:"head",children:"Your normalized"}),Object(E.map)(r.normal[a],(function(e){return Object(n.jsx)(A.a,{children:Object(E.round)(e,2)})}))]})]})]})})]})})}))}),Object(n.jsx)(o.a,{variant:"h2",children:"General Circuit Stats"}),Object(n.jsx)(z.a,{children:Object(n.jsx)(J.a,{children:Object(n.jsxs)(M.a,{children:[Object(n.jsxs)(R.a,{children:[Object(n.jsx)(A.a,{children:"Total Groups"}),Object(n.jsx)(A.a,{children:"Avg. Groups/Competition"}),Object(n.jsx)(A.a,{children:"Avg. Judges/Competition"}),Object(n.jsx)(A.a,{children:"Avg. Competitions/Group"})]}),Object(n.jsxs)(R.a,{children:[Object(n.jsx)(A.a,{children:Object(E.size)(c.groups)}),Object(n.jsx)(A.a,{children:Object(E.round)(c.avgGroupsPerComp,2)}),Object(n.jsx)(A.a,{children:Object(E.round)(c.avgJudgesPerComp,2)}),Object(n.jsx)(A.a,{children:Object(E.round)(c.avgCompsPerGroup,2)})]})]})})})]})}function ne(e){var t=e.year,a=Object(c.useState)([]),r=Object(i.a)(a,2),s=r[0],b=r[1],h=Object(c.useState)(""),O=Object(i.a)(h,2),l=O[0],d=O[1];Object(c.useEffect)((function(){(function(){var e=Object(y.a)(w.a.mark((function e(){var a,n;return w.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return a=H[t].order.length,n=Object(E.map)(Object(E.range)(a),function(){var e=Object(y.a)(w.a.mark((function e(a){var n;return w.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return n=new Y(a+1,t),e.next=3,n.process();case 3:return e.abrupt("return",n);case 4:case"end":return e.stop()}}),e)})));return function(t){return e.apply(this,arguments)}}()),e.t0=b,e.next=5,Promise.all(n);case 5:e.t1=e.sent,(0,e.t0)(e.t1);case 7:case"end":return e.stop()}}),e)})));return function(){return e.apply(this,arguments)}})()()}),[t]);var p=Object(E.last)(s),m=null===p||void 0===p?void 0:p.groups;return Object(n.jsxs)(n.Fragment,{children:[Object(n.jsxs)(C.a,{container:!0,spacing:2,justify:"center",alignItems:"center",children:[Object(n.jsx)(C.a,{item:!0,children:Object(n.jsx)(o.a,{children:"Select a team:"})}),Object(n.jsx)(C.a,{item:!0,children:Object(n.jsx)(j.a,{select:!0,value:l,onChange:function(e){d(e.target.value)},children:Object(E.map)(m&&m.sort(),(function(e){return Object(n.jsx)(u.a,{value:e,children:e})}))})})]}),l&&p&&Object(n.jsx)(ae,{group:l,full:p,year:t})]})}function ce(){var e=Object(c.useState)(!1),t=Object(i.a)(e,2),a=t[0],r=t[1],s=Object(c.useState)("2022"),l=Object(i.a)(s,2),v=l[0],k=l[1];Object(c.useEffect)((function(){f().load("client:auth2",(function(){f().client.init({apiKey:m,clientId:p,discoveryDocs:x,scope:g}).then((function(){f().auth2.getAuthInstance().isSignedIn.listen(r),r(f().auth2.getAuthInstance().isSignedIn.get())}),(function(e){d.a.error(JSON.stringify(e,null,2))}))}))}),[]);return Object(n.jsx)(h.a,{basename:"operations",children:Object(n.jsx)("div",{className:"App",children:a?Object(n.jsxs)(n.Fragment,{children:[Object(n.jsxs)(C.a,{container:!0,justify:"center",spacing:1,alignItems:"center",children:[Object(n.jsx)(C.a,{item:!0,children:Object(n.jsxs)(j.a,{select:!0,label:"Season",value:v,onChange:function(e){k(e.target.value)},children:[Object(n.jsx)(u.a,{value:"18-19",children:"2018-2019"}),Object(n.jsx)(u.a,{value:"19-20",children:"2019-2020"}),Object(n.jsx)(u.a,{value:"2022",children:"2022"})]})}),Object(n.jsx)(C.a,{item:!0,children:Object(n.jsx)(h.b,{to:"/",children:Object(n.jsx)(o.a,{children:"Bid Point System"})})}),Object(n.jsx)(C.a,{item:!0,children:Object(n.jsx)(h.b,{to:"/results",children:Object(n.jsx)(o.a,{children:"Comp Results"})})}),Object(n.jsx)(C.a,{item:!0,children:Object(n.jsx)(h.b,{to:"/report",children:Object(n.jsx)(o.a,{children:"Team Reports"})})}),Object(n.jsx)(C.a,{item:!0,children:Object(n.jsx)(b.a,{onClick:function(){localStorage.clear(),f().auth2.getAuthInstance().signOut()},variant:"outlined",children:"Sign Out!"})})]}),Object(n.jsx)(C.a,{container:!0,justify:"center",children:Object(n.jsxs)(O.c,{children:[Object(n.jsx)(O.a,{path:"/results",children:Object(n.jsx)(C.a,{item:!0,sm:12,children:Object(n.jsx)(L,{year:v})})}),Object(n.jsx)(O.a,{path:"/report",children:Object(n.jsx)(C.a,{item:!0,sm:12,lg:10,children:Object(n.jsx)(ne,{year:v})})}),Object(n.jsx)(O.a,{path:"/",children:Object(n.jsx)(C.a,{item:!0,sm:12,lg:8,children:Object(n.jsx)(B,{year:v})})})]})})]}):Object(n.jsxs)(b.a,{onClick:function(){f().auth2.getAuthInstance().signIn()},variant:"outlined",children:[" ","Sign In!"]})})})}d.a.setLevel("debug"),s.a.render(Object(n.jsx)(ce,{}),document.getElementById("root"))},92:function(e,t,a){},93:function(e,t,a){}},[[102,1,2]]]);
//# sourceMappingURL=main.48deb8f8.chunk.js.map