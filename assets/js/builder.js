/* Pizza Manch Haifa: builder engine + cart (progressive enhancement). Needs builder-config.js. */
/* BUILDER ENGINE (progressive enhancement). The pizza already works without this script:
   the controls are native radios/checkboxes and CSS shows each topping layer. This adds the live summary,
   natural re-placement of pieces, mirror classes for browsers without :has(), and the cart. */
(function(){var C=window.MANCH_BUILDER_CONFIG,d=document,h=d.documentElement,$=function(i){return d.getElementById(i)},G=window.gsap;
try{
var TX={he:{pv:'תצוגת הפיצה',pvLoad:'תצוגת הפיצה עדיין נטענת…',pvErr:'לא הצלחנו לטעון את תצוגת הפיצה. אפשר להמשיך לבחור ולהוסיף לסל.',none:'בלי תוספות',sizeName:function(s){return 'פיצה '+s},rmItem:'הסרה',edit:'עריכה',dec:'הפחתת כמות',inc:'הגדלת כמות',add:'הוספה לסל',upd:'עדכון הפיצה בסל',added:'הפיצה נוספה לסל. אפשר לבנות עוד אחת.',updated:'הפיצה בסל עודכנה.',editing:'עורכים פיצה מהסל',count:function(n){return n==1?'פיצה אחת':n+' פיצות'},pizzas:'פיצות',price:'מחיר',total:'סה״כ',priceNote:'המחיר נקבע ב-Wolt',copied:'פירוט ההזמנה הועתק.',copyFail:'לא הצלחנו להעתיק. אפשר לסמן את הטקסט ידנית.',cleared:'הסל רוקן.',removed:'הוסר מהסל.',orderTitle:'הזמנה מפיצה מאנצ׳'},
 en:{pv:'Pizza preview',pvLoad:'The pizza preview is still loading…',pvErr:'The pizza preview could not be loaded. You can still choose your pizza and add it to the cart.',none:'No toppings',sizeName:function(s){return s+' pizza'},rmItem:'Remove',edit:'Edit',dec:'Decrease quantity',inc:'Increase quantity',add:'Add to cart',upd:'Update pizza in cart',added:'Pizza added to your cart. You can build another one.',updated:'The pizza in your cart was updated.',editing:'Editing a pizza from your cart',count:function(n){return n==1?'1 pizza':n+' pizzas'},pizzas:'Pizzas',price:'Price',total:'Total',priceNote:'Price is set on Wolt',copied:'Order details copied.',copyFail:'Could not copy. You can select the text manually.',cleared:'Cart emptied.',removed:'Removed from cart.',orderTitle:'Order from Pizza Manch'}};
function L(){return h.lang=='en'?'en':'he'}function T(){return TX[L()]}
function motion(){return !(window.matchMedia&&matchMedia('(prefers-reduced-motion:reduce)').matches)}
function byId(list,id){for(var i=0;i<list.length;i++)if(list[i].id==id)return list[i]}
function rng(a){return function(){a|=0;a=a+0x6D2B79F5|0;var t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
function seed(){return (Math.random()*1e9)|0}
function clone(o){return JSON.parse(JSON.stringify(o))}
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
function img(urls){var i=new Image(),k=0,res=null;i.__u=urls;i.__st='idle';i.__p=window.Promise?new Promise(function(r){res=r}):null;
 var fin=function(st){i.__st=st;res&&res();pvUpdate()};
 i.onload=function(){fin('ok')};i.onerror=function(){if(/\.avif(\?|$)/.test(urls[k]))h.classList.add('no-avif');if(++k<urls.length)i.src=urls[k];else fin('fail')};return i}
/* URLs come from probe elements: they resolve like every other CSS image URL, and are not affected by the builder's .near gate */
var pvSlow=false,pvLabel='',pvErrSaid=false,pvSlowSaid=false,pvMsg=null;
var IMG={base:img(clsUrls('pvw')),white:img(clsUrls('pw')),cheese:img(clsUrls('ly-cheese'))},NV={};
tops.forEach(function(t){if(t.layer)return;IMG[t.id]=[];for(var i=0;i<8;i++){var u=clsUrls('v-'+t.id+'-'+i);if(!u.length)break;IMG[t.id].push(img(u))}NV[t.id]=IMG[t.id].length});
probe.className='';

/* ---------- state ---------- */
var pieces={},editing=null,cart=[],KEY='manch.cart.v1';
function read(){var s={size:null,sauce:null,top:{}};C.sizes.forEach(function(x){if(inp('bs-'+x.id).checked)s.size=x.id});C.sauces.forEach(function(x){if(inp('bsc-'+x.id).checked)s.sauce=x.id});
 C.toppings.forEach(function(t){if(inp('bt-'+t.id).checked)s.top[t.id]=true});s.size=s.size||'m';s.sauce=s.sauce||'tomato';return s}
function write(s){C.sizes.forEach(function(x){inp('bs-'+x.id).checked=s.size==x.id});C.sauces.forEach(function(x){inp('bsc-'+x.id).checked=s.sauce==x.id});C.toppings.forEach(function(t){inp('bt-'+t.id).checked=!!s.top[t.id]})}
function selected(s){return C.toppings.filter(function(t){return s.top[t.id]}).map(function(t){return t.id})}
/* ---------- saved-cart validation: everything read from storage is untrusted ---------- */
var QMAX=20,ID_RE=/^[a-z0-9]{1,40}$/,THUMB_RE=/^data:image\/jpeg;base64,[A-Za-z0-9+\/]+={0,2}$/;
function known(list,id){return typeof id=='string'&&!!byId(list,id)}
function okThumb(t){return typeof t=='string'&&t.length<400000&&THUMB_RE.test(t)?t:''}
function inRange(v,lo,hi){return typeof v=='number'&&isFinite(v)&&v>=lo&&v<=hi}
/* stored piece layouts end up in inline styles, so every field must be a number in range; any doubt -> null (re-placed) */
function cleanPieces(ps){if(!ps||typeof ps!='object'||Array.isArray(ps))return null;var out={};
 for(var k=0;k<tops.length;k++){var t=tops[k];if(t.layer)continue;var a=ps[t.id];if(!Array.isArray(a)||a.length>200)return null;out[t.id]=[];
  for(var j=0;j<a.length;j++){var p=a[j];if(!p||typeof p!='object')return null;
   if(!inRange(p.x,0,1)||!inRange(p.y,0,1)||!inRange(p.rot,-720,720)||!inRange(p.sc,.1,3)||!inRange(p.v,0,(NV[t.id]||1)-1)||!inRange(p.d,0,2))return null;
   out[t.id].push({x:p.x,y:p.y,rot:Math.round(p.rot),sc:p.sc,v:Math.floor(p.v),f:p.f?1:0,d:p.d})}}
 return out}
/* returns a safe copy of one saved pizza, or null if it cannot be represented with the current menu config.
   Unknown size or sauce -> the item is dropped. Unknown toppings -> removed, and the thumbnail is regenerated. */
function cleanItem(o,seen){if(!o||typeof o!='object'||Array.isArray(o))return null;
 if(!known(C.sizes,o.size)||!known(C.sauces,o.sauce)||!Array.isArray(o.tops))return null;
 var want={},lost=false;o.tops.forEach(function(t){if(known(C.toppings,t))want[t]=true;else lost=true});
 var tp=C.toppings.filter(function(t){return want[t.id]}).map(function(t){return t.id}),top={};tp.forEach(function(t){top[t]=true});
 var q=Math.floor(Number(o.qty));q=isFinite(q)?Math.min(QMAX,Math.max(1,q)):1;
 var id=typeof o.id=='string'&&ID_RE.test(o.id)&&!seen[o.id]?o.id:uid();seen[id]=true;
 return {size:o.size,sauce:o.sauce,tops:tp,top:top,pieces:cleanPieces(o.pieces),qty:q,thumb:lost?'':okThumb(o.thumb),id:id}}
function parseCart(raw){var a;try{a=JSON.parse(raw||'[]')}catch(e){return []}if(!Array.isArray(a))return [];
 var seen={},out=[];a.forEach(function(o){var c=cleanItem(o,seen);c&&out.push(c)});return out}
function readStore(){try{return localStorage.getItem(KEY)}catch(e){return null}}
var rawCart=readStore();cart=parseCart(rawCart);
function save(){try{localStorage.setItem(KEY,JSON.stringify(cart))}catch(e){}}
/* write the cleaned cart back so invalid data does not linger */
if(rawCart!=null&&JSON.stringify(cart)!==rawCart)save();

/* ---------- pieces ---------- */
function makePieces(sd){var placed=[],ps={};tops.forEach(function(t){if(t.layer)return;ps[t.id]=C.place(t,NV[t.id]||1,rng(sd+t.z*7919),placed,C.radius);placed.push({w:t.w,ps:ps[t.id]})});return ps}
function placeAll(sd){pieces=makePieces(sd)}
function f2(n){return +n.toFixed(2)}
function draw(t){var ly=LY[t.id],w=t.w*100,html='';(pieces[t.id]||[]).forEach(function(p){var s=w*p.sc;
 html+='<i class="pc" style="left:'+f2(p.x*100)+'%;top:'+f2(p.y*100)+'%;width:'+f2(s)+'%;height:'+f2(s)+'%;margin:'+f2(-s/2)+'% 0 0 '+f2(-s/2)+'%;--d:'+p.d+'s"><b class="v-'+t.id+'-'+p.v+'" style="--r:'+p.rot+'deg'+(p.f?';--f:-1':'')+'"></b></i>'});ly.innerHTML=html}
function drawAll(){tops.forEach(function(t){if(!t.layer)draw(t)})}

/* ---------- live state → classes, summary ---------- */
var CLS=[];C.toppings.forEach(function(t){CLS.push('t-'+t.id)});C.sizes.forEach(function(s){CLS.push('s-'+s.id)});CLS.push('sc-none','any-top');
function priceOf(it){if(!C.prices)return null;var p=(C.prices.size||{})[it.size]||0;it.tops.forEach(function(t){p+=(C.prices.topping||{})[t]||0});p+=(C.prices.sauce||{})[it.sauce]||0;return p}
function desc(it){var l=L(),ts=it.tops.filter(function(id){return byId(C.toppings,id)}),tp=ts.length?ts.map(function(id){return byId(C.toppings,id)[l]}).join(', '):T().none,sc=byId(C.sauces,it.sauce);return (sc?sc[l]:'')+' · '+tp}
function sync(){var s=read(),l=L(),S=byId(C.sizes,s.size),sel=selected(s);
 CLS.forEach(function(c){bd.classList.remove(c)});sel.forEach(function(id){bd.classList.add('t-'+id)});bd.classList.add('s-'+s.size);if(s.sauce=='none')bd.classList.add('sc-none');if(sel.length)bd.classList.add('any-top');
 var it={size:s.size,sauce:s.sauce,tops:sel},pr=priceOf(it);
 $('sum').innerHTML='<b>'+T().sizeName(S[l])+'</b> · '+desc(it)+(pr!=null?'<br>'+T().price+': <b>₪'+pr+'</b>':'');
 pvLabel=T().pv+': '+T().sizeName(S[l])+', '+desc(it);pvUpdate();
 $('baddt').textContent=editing?T().upd:T().add}
$('bctl').addEventListener('change',sync);
/* WCAG 2.4.11: the real radio/checkbox is visually hidden; when it gets keyboard focus, bring its visible label into view */
$('bctl').addEventListener('focusin',function(e){var t=e.target;if(!t.matches||!t.matches('input.vh'))return;var l=d.querySelector('#bctl label[for="'+t.id+'"]');l&&l.scrollIntoView({block:'nearest'})});
/* re-place a topping each time it is switched on, so every pizza looks hand-made */
$('bctl').addEventListener('change',function(e){var t=e.target;if(t.name!='btop'||!t.checked)return;var tp=byId(C.toppings,t.value);if(!tp||tp.layer)return;
 var placed=[];tops.forEach(function(o){if(!o.layer&&o.id!=tp.id&&read().top[o.id])placed.push({w:o.w,ps:pieces[o.id]})});
 pieces[tp.id]=C.place(tp,NV[tp.id]||1,rng(seed()),placed,C.radius);draw(tp)});
$('bshuf').addEventListener('click',function(){placeAll(seed());drawAll();sync()});
$('bnew').addEventListener('click',function(){editing=null;newPizza()});
function defaults(){var s={size:'m',sauce:'tomato',top:{}};C.sizes.forEach(function(x){if(x.def)s.size=x.id});C.sauces.forEach(function(x){if(x.def)s.sauce=x.id});return s}
function newPizza(){write(defaults());placeAll(seed());drawAll();sync();renderCart()}

/* ---------- thumbnail (canvas render of the same layers) ---------- */
function thumb(s,ps){if(!needed(s).every(function(i){return i.__st=='ok'}))return '';var N=136,c=d.createElement('canvas');c.width=c.height=N;var x=c.getContext('2d');
 try{x.fillStyle='#1e1b18';x.fillRect(0,0,N,N);var k=byId(C.sizes,s.size).k,o=N*(1-k)/2,W=N*k;
  x.drawImage(IMG.base,o,o,W,W);if(s.sauce=='none')x.drawImage(IMG.white,o,o,W,W);if(s.top.cheese)x.drawImage(IMG.cheese,o,o,W,W);
  tops.forEach(function(t){if(t.layer||!s.top[t.id])return;(ps[t.id]||[]).forEach(function(p){var g=IMG[t.id][p.v]||IMG[t.id][0];if(!g)return;var sz=t.w*p.sc*W,ar=g.naturalWidth/g.naturalHeight||1,w=ar>=1?sz:sz*ar,hh=ar>=1?sz/ar:sz;
   x.save();x.translate(o+p.x*W,o+p.y*W);x.rotate(p.rot*Math.PI/180);if(p.f)x.scale(-1,1);x.drawImage(g,-w/2,-hh/2,w,hh);x.restore()})});
  return c.toDataURL('image/jpeg',.84)}catch(e){return ''}}

/* ---------- cart ---------- */
function toast(m){var t=$('btoast');t.textContent='';setTimeout(function(){t.textContent=m},30)}
function uid(){return Date.now().toString(36)+Math.floor(Math.random()*1e4)}
$('badd').addEventListener('click',function(){var s=read(),it={size:s.size,sauce:s.sauce,tops:selected(s),top:s.top,pieces:clone(pieces),qty:1},msg;it.thumb=imgsReady()?thumb(s,pieces):'';
 var i=-1;if(editing)for(var j=0;j<cart.length;j++)if(cart[j].id==editing)i=j;
 if(i>-1){it.id=editing;it.qty=cart[i].qty;cart[i]=it;msg=T().updated}else{it.id=uid();cart.push(it);msg=T().added}
 editing=null;save();renderCart(it.id);fly(it);toast(msg);sync();if(!it.thumb)ensureThumbs()});
function fly(it){if(!G||!motion()||!it.thumb)return;var pv=$('pv').getBoundingClientRect(),row=rowOf(it.id),li=row&&row.querySelector('img');if(!li)return;var to=li.getBoundingClientRect();
 if(to.bottom<0||to.top>innerHeight)return;var f=new Image();f.src=it.thumb;f.className='fly';f.alt='';var s=Math.min(pv.width,pv.height);
 f.style.cssText='left:'+pv.left+'px;top:'+pv.top+'px;width:'+s+'px;height:'+s+'px';d.body.appendChild(f);G.set(li,{autoAlpha:0});
 G.to(f,{left:to.left,top:to.top,width:to.width,height:to.height,duration:.8,ease:'expo.inOut',onComplete:function(){f.parentNode&&f.parentNode.removeChild(f);G.set(li,{autoAlpha:1})}})}
/* the cart is built with DOM nodes + textContent: no stored value is ever parsed as HTML */
function el(tag,cls,txt){var e=d.createElement(tag);if(cls)e.className=cls;if(txt!=null)e.textContent=txt;return e}
function act(a,label,txt,cls,off){var b=el('button',cls,txt);b.type='button';b.setAttribute('data-a',a);if(label)b.setAttribute('aria-label',label);if(off)b.disabled=true;return b}
function rowOf(id){var r=$('clist').children;for(var i=0;i<r.length;i++)if(r[i].getAttribute('data-id')===id)return r[i];return null}
function renderCart(flash){var l=L(),n=0,ul=$('clist'),frag=d.createDocumentFragment();
 if(editing&&find(editing)<0)editing=null;
 cart.forEach(function(it){n+=it.qty;var S=byId(C.sizes,it.size)||C.sizes[0],nm=T().sizeName(S[l]),pr=priceOf(it);
  var li=el('li','ci'+(it.id==editing?' ed':''));li.setAttribute('data-id',it.id);
  var im=el('img');im.setAttribute('src',okThumb(it.thumb));im.setAttribute('alt','');li.appendChild(im);
  var tx=el('div');tx.appendChild(el('b',null,nm));tx.appendChild(el('p',null,desc(it)+(pr!=null?' · ₪'+pr*it.qty:'')));li.appendChild(tx);
  var ca=el('div','ca'),qt=el('span','qty'),o=el('output',null,String(it.qty));o.setAttribute('aria-live','polite');
  qt.appendChild(act('dec',T().dec+': '+nm,'−',null,it.qty<2));qt.appendChild(o);qt.appendChild(act('inc',T().inc+': '+nm,'+',null,it.qty>=QMAX));
  ca.appendChild(qt);ca.appendChild(act('edit',null,T().edit,'tb'));ca.appendChild(act('del',T().rmItem+': '+nm,T().rmItem,'tb'));li.appendChild(ca);
  frag.appendChild(li)});
 ul.textContent='';ul.appendChild(frag);$('cart').classList.toggle('empty',!cart.length);$('ccount').textContent=cart.length?T().count(n):'';
 var bySize={};cart.forEach(function(it){bySize[it.size]=(bySize[it.size]||0)+it.qty});
 var dl=$('csum');dl.textContent='';
 function pair(dt,dd,cls){dl.appendChild(el('dt',cls,dt));var v=el('dd',cls);if(typeof dd=='string')v.textContent=dd;else v.appendChild(dd);dl.appendChild(v)}
 C.sizes.forEach(function(s){if(bySize[s.id])pair(T().sizeName(s[l]),'×'+bySize[s.id])});
 var tot=0;cart.forEach(function(it){var p=priceOf(it);tot=(p==null||tot==null)?null:tot+p*it.qty});
 pair(T().pizzas,String(n),'tot');
 var tv;if(C.prices&&tot!=null)tv='₪'+tot;else{tv=el('span',null,T().priceNote);tv.style.fontWeight='500'}pair(T().total,tv);
 if(flash&&G&&motion()){var li=rowOf(flash);li&&G.from(li,{backgroundColor:'#4a3524',duration:1.2,ease:'power2.out',clearProps:'backgroundColor'})}}
function find(id){for(var i=0;i<cart.length;i++)if(cart[i].id==id)return i;return -1}
$('clist').addEventListener('click',function(e){var b=e.target.closest&&e.target.closest('button');if(!b)return;var li=b.closest('.ci'),id=li.getAttribute('data-id'),i=find(id),it=cart[i];if(!it)return;var a=b.getAttribute('data-a');
 if(a=='inc'&&it.qty<QMAX)it.qty++;else if(a=='dec'&&it.qty>1)it.qty--;
 else if(a=='del'){var go=function(){var k=find(id);if(k>-1)cart.splice(k,1);if(editing==id)editing=null;save();renderCart();sync();toast(T().removed);var nx=$('clist').querySelector('.ci button')||$('badd');nx.focus()};
  if(G&&motion())G.to(li,{autoAlpha:0,height:0,paddingTop:0,paddingBottom:0,marginTop:-12,duration:.3,ease:'power2.in',onComplete:go});else go();return}
 else if(a=='edit'){editing=id;var s={size:it.size,sauce:it.sauce,top:it.top||{}};if(!it.top)it.tops.forEach(function(t){s.top[t]=true});
  write(s);if(it.pieces){pieces=clone(it.pieces)}else placeAll(seed());drawAll();sync();renderCart();toast(T().editing);
  var pv=$('pv').getBoundingClientRect();if(pv.bottom<0||pv.top>innerHeight)$('build').scrollIntoView({behavior:motion()?'smooth':'auto',block:'start'});var fi=d.querySelector('#bctl input:checked');fi&&fi.focus({preventScroll:true});return}
 save();renderCart();var nr=rowOf(id),nb=nr&&nr.querySelector('[data-a="'+a+'"]');if(!nb||nb.disabled)nb=nr&&nr.querySelector('[data-a]:not(:disabled)');nb&&nb.focus()});
function orderText(){var l=L(),lines=[T().orderTitle+':'];cart.forEach(function(it){lines.push(it.qty+'× '+T().sizeName(byId(C.sizes,it.size)[l])+' – '+desc(it))});var n=0;cart.forEach(function(it){n+=it.qty});lines.push(T().pizzas+': '+n);return lines.join('\n')}
$('bcopy').addEventListener('click',function(){var t=orderText(),ok=function(){toast(T().copied)},bad=function(){var ta=d.createElement('textarea');ta.value=t;ta.setAttribute('readonly','');ta.style.cssText='position:fixed;opacity:0';d.body.appendChild(ta);ta.select();var r=false;try{r=d.execCommand('copy')}catch(x){}d.body.removeChild(ta);toast(r?T().copied:T().copyFail)};
 if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(t).then(ok,bad);else bad()});
$('bclear').addEventListener('click',function(){cart=[];editing=null;save();renderCart();sync();toast(T().cleared);$('badd').focus()});

/* ---------- init ---------- */
pvMsg=d.createElement('span');pvMsg.className='pv-msg';pvMsg.setAttribute('aria-hidden','true');$('pv').appendChild(pvMsg);
if('IntersectionObserver' in window)new IntersectionObserver(function(e){d.body.classList.toggle('in-build',e[0].isIntersecting)},{rootMargin:'-20% 0px -20% 0px'}).observe(d.querySelector('.bd-main'));
addEventListener('manchlang',function(){sync();renderCart()});
/* saved pizzas whose thumbnail was missing/invalid or whose toppings changed get a fresh thumbnail.
   Used on load and for carts arriving from another tab. Validation has already emptied any unsafe thumb. */
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
function imgsReady(){return started&&allImg.every(function(i){return i.complete&&i.naturalWidth})}
function imgsLoaded(){startImgs();return Promise.all(allImg.map(function(i){return i.__p}))}
function fillThumbs(){var ch=false;cart.forEach(function(it){if(it.thumb)return;if(!it.pieces)it.pieces=makePieces(seed());var t=thumb({size:it.size,sauce:it.sauce,top:it.top},it.pieces);if(t){it.thumb=t;ch=true}});if(ch)save();return ch}
/* images ready: fill now (synchronously, before the caller renders); otherwise fill + re-render once they have decoded */
function ensureThumbs(){if(!cart.some(function(it){return !it.thumb}))return;
 if(imgsReady()){fillThumbs();return}
 if(window.Promise)imgsLoaded().then(function(){try{if(fillThumbs())renderCart()}catch(x){}})}
/* another tab changed the cart: same validation as the initial load; key null = storage was cleared */
var stTok=0;
addEventListener('storage',function(e){if(e.key!==KEY&&e.key!==null)return;
 try{var tok=++stTok;cart=parseCart(readStore());if(editing&&find(editing)<0)editing=null;
  /* thumbnails needed but the builder images are not loaded yet: keep showing the current list until they can be drawn (never a blank thumbnail) */
  if(window.Promise&&!imgsReady()&&cart.some(function(it){return !it.thumb})){sync();imgsLoaded().then(function(){if(tok!==stTok)return;try{fillThumbs();renderCart();sync()}catch(x){}});return}
  ensureThumbs();renderCart();sync()}catch(x){window.console&&console.error('Could not apply the cart from another tab.',x)}});
/* request the builder images (and show its CSS images) once the builder is within ~1.5 screens of the viewport */
function near(){bd.classList.add('near');startImgs()}
if('IntersectionObserver' in window){var nio=new IntersectionObserver(function(e){if(e[0].isIntersecting){near();nio.disconnect()}},{rootMargin:'150% 0px'});nio.observe(bd)}else near();
placeAll(seed());drawAll();sync();ensureThumbs();renderCart();
window.MANCH_BUILDER={state:read,pieces:function(){return pieces},cart:function(){return cart},newPizza:newPizza,config:C};
}catch(err){h.classList.remove('js');window.console&&console.error('Pizza builder enhancement failed; the basic builder still works.',err)}
})();
