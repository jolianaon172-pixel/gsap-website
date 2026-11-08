/* Pizza Manch Haifa: pizza builder engine (preview only, progressive enhancement). Needs builder-config.js. */
/* BUILDER ENGINE. The builder is an inspiration preview, not an order: there is no cart, and nothing is saved or sent.
   Ordering happens on Wolt (the builder's "Order on Wolt" link). The pizza already works without this script:
   the controls are native radios/checkboxes and CSS shows each topping layer. This adds the live summary,
   natural re-placement of pieces, mirror classes for browsers without :has(), and the image-readiness states. */
(function(){var C=window.MANCH_BUILDER_CONFIG,d=document,h=d.documentElement,$=function(i){return d.getElementById(i)};
try{
var TX={he:{pv:'תצוגת הפיצה',pvLoad:'תצוגת הפיצה עדיין נטענת…',pvErr:'לא הצלחנו לטעון את תצוגת הפיצה. אפשר עדיין להזמין מהתפריט ב-Wolt.',none:'בלי תוספות',inPv:'בתצוגה:',sizeName:function(s){return 'פיצה '+s}},
 en:{pv:'Pizza preview',pvLoad:'The pizza preview is still loading…',pvErr:'The pizza preview could not be loaded. You can still order from the menu on Wolt.',none:'No toppings',inPv:'Preview:',sizeName:function(s){return s+' pizza'}}};
function L(){return h.lang=='en'?'en':'he'}function T(){return TX[L()]}
function byId(list,id){for(var i=0;i<list.length;i++)if(list[i].id==id)return list[i]}
function rng(a){return function(){a|=0;a=a+0x6D2B79F5|0;var t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
function seed(){return (Math.random()*1e9)|0}
var bd=$('build'),tops=C.toppings.slice().sort(function(a,b){return a.z-b.z}),LY={};
[].forEach.call(d.querySelectorAll('#lys .ly'),function(e){LY[e.getAttribute('data-t')]=e});
function inp(id){return $(id)}
/* image URLs come from the CSS (single copy of every asset) */
/* display:none: computed styles still give the URLs, but the browser does not fetch images for a hidden probe */
var probe=d.createElement('span');probe.style.cssText='position:absolute;width:0;height:0;overflow:hidden;display:none';d.body.appendChild(probe);
/* every url() of a computed background-image, in order: for image-set() that is the AVIF first, then the WebP/JPEG fallback */
function bgUrls(el){var v=getComputedStyle(el).backgroundImage||'',re=/url\(\s*["']?([^"')]+)["']?\s*\)/g,m,a=[];while((m=re.exec(v)))a.push(m[1]);return a}
function clsUrls(c){probe.className=c;return bgUrls(probe)}
/* builder images are created here but only requested by startImgs(); each tries its URLs in order (AVIF, then WebP) */
function img(urls){var i=new Image(),k=0;i.__u=urls;i.__st='idle';
 var fin=function(st){i.__st=st;pvUpdate()};
 i.onload=function(){fin('ok')};i.onerror=function(){if(/\.avif(\?|$)/.test(urls[k]))h.classList.add('no-avif');if(++k<urls.length)i.src=urls[k];else fin('fail')};return i}
/* URLs come from probe elements: they resolve like every other CSS image URL, and are not affected by the builder's .near gate */
var pvSlow=false,pvLabel='',pvErrSaid=false,pvSlowSaid=false,pvMsg=null;
var IMG={base:img(clsUrls('pvw')),white:img(clsUrls('pw')),cheese:img(clsUrls('ly-cheese'))},NV={};
tops.forEach(function(t){if(t.layer)return;IMG[t.id]=[];for(var i=0;i<8;i++){var u=clsUrls('v-'+t.id+'-'+i);if(!u.length)break;IMG[t.id].push(img(u))}NV[t.id]=IMG[t.id].length});
probe.className='';

/* ---------- state ---------- */
var pieces={};
/* the earlier version kept a cart in localStorage: remove it, the site no longer stores anything */
try{localStorage.removeItem('manch.cart.v1')}catch(e){}
function read(){var s={size:null,sauce:null,top:{}};C.sizes.forEach(function(x){if(inp('bs-'+x.id).checked)s.size=x.id});C.sauces.forEach(function(x){if(inp('bsc-'+x.id).checked)s.sauce=x.id});
 C.toppings.forEach(function(t){if(inp('bt-'+t.id).checked)s.top[t.id]=true});s.size=s.size||'m';s.sauce=s.sauce||'tomato';return s}
function write(s){C.sizes.forEach(function(x){inp('bs-'+x.id).checked=s.size==x.id});C.sauces.forEach(function(x){inp('bsc-'+x.id).checked=s.sauce==x.id});C.toppings.forEach(function(t){inp('bt-'+t.id).checked=!!s.top[t.id]})}
function selected(s){return C.toppings.filter(function(t){return s.top[t.id]}).map(function(t){return t.id})}
/* ---------- pieces ---------- */
function makePieces(sd){var placed=[],ps={};tops.forEach(function(t){if(t.layer)return;ps[t.id]=C.place(t,NV[t.id]||1,rng(sd+t.z*7919),placed,C.radius);placed.push({w:t.w,ps:ps[t.id]})});return ps}
function placeAll(sd){pieces=makePieces(sd)}
function f2(n){return +n.toFixed(2)}
function draw(t){var ly=LY[t.id],w=t.w*100,html='';(pieces[t.id]||[]).forEach(function(p){var s=w*p.sc;
 html+='<i class="pc" style="left:'+f2(p.x*100)+'%;top:'+f2(p.y*100)+'%;width:'+f2(s)+'%;height:'+f2(s)+'%;margin:'+f2(-s/2)+'% 0 0 '+f2(-s/2)+'%;--d:'+p.d+'s"><b class="v-'+t.id+'-'+p.v+'" style="--r:'+p.rot+'deg'+(p.f?';--f:-1':'')+'"></b></i>'});ly.innerHTML=html}
function drawAll(){tops.forEach(function(t){if(!t.layer)draw(t)})}

/* ---------- live state → classes, summary ---------- */
var CLS=[];C.toppings.forEach(function(t){CLS.push('t-'+t.id)});C.sizes.forEach(function(s){CLS.push('s-'+s.id)});CLS.push('sc-none','any-top');
function desc(it){var l=L(),ts=it.tops.filter(function(id){return byId(C.toppings,id)}),tp=ts.length?ts.map(function(id){return byId(C.toppings,id)[l]}).join(', '):T().none,sc=byId(C.sauces,it.sauce);return (sc?sc[l]:'')+' · '+tp}
function sync(){var s=read(),l=L(),S=byId(C.sizes,s.size),sel=selected(s);
 CLS.forEach(function(c){bd.classList.remove(c)});sel.forEach(function(id){bd.classList.add('t-'+id)});bd.classList.add('s-'+s.size);if(s.sauce=='none')bd.classList.add('sc-none');if(sel.length)bd.classList.add('any-top');
 var it={size:s.size,sauce:s.sauce,tops:sel};
 /* config strings only (no user or stored data) */
 $('sum').innerHTML=T().inPv+' <b>'+T().sizeName(S[l])+'</b> · '+desc(it);
 pvLabel=T().pv+': '+T().sizeName(S[l])+', '+desc(it);pvUpdate()}
$('bctl').addEventListener('change',sync);
/* WCAG 2.4.11: the real radio/checkbox is visually hidden; when it gets keyboard focus, bring its visible label into view */
$('bctl').addEventListener('focusin',function(e){var t=e.target;if(!t.matches||!t.matches('input.vh'))return;var l=d.querySelector('#bctl label[for="'+t.id+'"]');l&&l.scrollIntoView({block:'nearest'})});
/* re-place a topping each time it is switched on, so every pizza looks hand-made */
$('bctl').addEventListener('change',function(e){var t=e.target;if(t.name!='btop'||!t.checked)return;var tp=byId(C.toppings,t.value);if(!tp||tp.layer)return;
 var placed=[];tops.forEach(function(o){if(!o.layer&&o.id!=tp.id&&read().top[o.id])placed.push({w:o.w,ps:pieces[o.id]})});
 pieces[tp.id]=C.place(tp,NV[tp.id]||1,rng(seed()),placed,C.radius);draw(tp)});
$('bshuf').addEventListener('click',function(){placeAll(seed());drawAll();sync()});
$('bnew').addEventListener('click',newPizza);
function defaults(){var s={size:'m',sauce:'tomato',top:{}};C.sizes.forEach(function(x){if(x.def)s.size=x.id});C.sauces.forEach(function(x){if(x.def)s.sauce=x.id});return s}
function newPizza(){write(defaults());placeAll(seed());drawAll();sync()}

/* ---------- status messages (preview loading / error) ---------- */
function toast(m){var t=$('btoast');t.textContent='';setTimeout(function(){t.textContent=m},30)}
/* ---------- init ---------- */
pvMsg=d.createElement('span');pvMsg.className='pv-msg';pvMsg.setAttribute('aria-hidden','true');$('pv').appendChild(pvMsg);
if('IntersectionObserver' in window)new IntersectionObserver(function(e){d.body.classList.toggle('in-build',e[0].isIntersecting)},{rootMargin:'-20% 0px -20% 0px'}).observe(d.querySelector('.bd-main'));
addEventListener('manchlang',sync);
var allImg=[IMG.base,IMG.white,IMG.cheese];tops.forEach(function(t){if(!t.layer)allImg=allImg.concat(IMG[t.id])});
var started=false;function startImgs(){if(started)return;started=true;allImg.forEach(function(i){if(i.__u[0]){i.__st='loading';i.src=i.__u[0]}else i.__st='fail'});
 setTimeout(function(){pvSlow=true;pvUpdate()},8000);pvUpdate()}
/* the images the current pizza needs: base, no-sauce layer, cheese layer, every variant of each selected topping */
function needed(s){var a=[IMG.base];if(s.sauce=='none')a.push(IMG.white);if(s.top.cheese)a.push(IMG.cheese);tops.forEach(function(t){if(!t.layer&&s.top[t.id])a=a.concat(IMG[t.id])});return a}
/* The preview is shown (.ready) only when every image it needs has loaded, and the first reveal waits until all builder images
   have settled or 8 s have passed. A needed image that failed -> clear error state; still loading after 8 s -> loading state.
   Never an incomplete pizza. Re-evaluated on every image load/failure and every change of the selection (sync). */
function pvUpdate(){var pv=$('pv');if(!pv||!bd)return;var st='',gate=false;
 if(started){var n=needed(read());st=n.every(function(i){return i.__st=='ok'})?'ok':n.some(function(i){return i.__st=='fail'})?'fail':'wait';
  gate=pvSlow||allImg.every(function(i){return i.__st=='ok'||i.__st=='fail'})}
 var show=st=='ok'&&gate,err=st=='fail',slow=st=='wait'&&pvSlow,m=err?T().pvErr:slow?T().pvLoad:'';
 bd.classList.toggle('ready',show);bd.classList.toggle('pv-error',err);bd.classList.toggle('pv-slow',slow);
 if(started&&!show&&!err)pv.setAttribute('aria-busy','true');else pv.removeAttribute('aria-busy');
 if(pvMsg)pvMsg.textContent=m;pv.setAttribute('aria-label',pvLabel+(m?' – '+m:''));
 if(err&&!pvErrSaid){pvErrSaid=true;toast(T().pvErr)}else if(!err)pvErrSaid=false;
 if(slow&&!pvSlowSaid){pvSlowSaid=true;toast(T().pvLoad)}else if(!slow)pvSlowSaid=false}
/* request the builder images (and show its CSS images) once the builder is within ~1.5 screens of the viewport */
function near(){bd.classList.add('near');startImgs()}
if('IntersectionObserver' in window){var nio=new IntersectionObserver(function(e){if(e[0].isIntersecting){near();nio.disconnect()}},{rootMargin:'150% 0px'});nio.observe(bd)}else near();
placeAll(seed());drawAll();sync();
window.MANCH_BUILDER={state:read,pieces:function(){return pieces},newPizza:newPizza,config:C};
}catch(err){h.classList.remove('js');window.console&&console.error('Pizza builder enhancement failed; the basic builder still works.',err)}
})();
