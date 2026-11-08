/* Pizza Manch Haifa: core UI (nav, mobile menu, skip link, language switch, no-GSAP reveal fallback). */
(function(){var d=document,$=function(s){return[].slice.call(d.querySelectorAll(s))},rm=matchMedia('(prefers-reduced-motion:reduce)').matches;
var gs=!!(window.gsap&&window.ScrollTrigger);if(!gs){if('IntersectionObserver' in window){var io=new IntersectionObserver(function(e){e.forEach(function(x){if(x.isIntersecting){x.target.classList.add('in');io.unobserve(x.target)}})},{threshold:.15});$('.rv,.sig').forEach(function(e){io.observe(e)})}else $('.rv,.sig').forEach(function(e){e.classList.add('in')});if(!rm){d.documentElement.classList.add('anim');setTimeout(function(){$('.rv').forEach(function(e){e.classList.add('in')})},2500)}}
var nav=d.getElementById('nav'),px=$('[data-px]');function sc(){nav.classList.toggle('s',scrollY>40);}addEventListener('scroll',sc,{passive:true});sc();
var lz=$('img[data-src]');if('IntersectionObserver' in window){var lo=new IntersectionObserver(function(e){e.forEach(function(x){if(x.isIntersecting){x.target.src=x.target.dataset.src;lo.unobserve(x.target)}})},{rootMargin:'800px'});lz.forEach(function(e){lo.observe(e)})}else lz.forEach(function(e){e.src=e.dataset.src});
var lk=d.getElementById('lk'),bg=d.getElementById('bg'),lb=d.getElementById('lang'),h=d.documentElement,en=false,inertEls=$('main,footer,.bar,.skip');
/* AVIF safety net: if a <picture> AVIF fails to load or decode, drop the AVIF sources (the <img> then uses its JPEG) and add
   .no-avif so every CSS background uses its JPEG/WebP too (main.css, builder.css) */
function noAvif(){if(h.classList.contains('no-avif'))return;h.classList.add('no-avif');$('picture source[type="image/avif"]').forEach(function(s){s.parentNode.removeChild(s)})}
$('picture img').forEach(function(i){var bad=function(){if(/\.avif(\?|$)/.test(i.currentSrc||''))noAvif()};if(i.complete&&i.currentSrc&&!i.naturalWidth)bad();else i.addEventListener('error',bad)});
var TT={he:{t:'פיצה מאנצ׳ חיפה | פיצה, פסטות וסלטים – משלוח ואיסוף',d:'הזמינו ב-Wolt מפיצה מאנצ׳ חיפה: פיצה, פסטות וסלטים למשלוח ולאיסוף. HaYam Road 3, חיפה. טלפון 04-810-2091.',o:'פתיחת תפריט',c:'סגירת תפריט'},en:{t:'Pizza Manch Haifa | Pizza, pasta and salads – delivery and pickup',d:'Order on Wolt from Pizza Manch Haifa: pizza, pasta and salads for delivery and pickup. HaYam Road 3, Haifa. Phone 04-810-2091.',o:'Open menu',c:'Close menu'}};
function menu(open){lk.classList.toggle('o',open);bg.setAttribute('aria-expanded',String(open));d.body.classList.toggle('nolock',open);inertEls.forEach(function(e){if(open)e.setAttribute('inert','');else e.removeAttribute('inert')});bg.setAttribute('aria-label',TT[en?'en':'he'][open?'c':'o']);bg.querySelector('path').setAttribute('d',open?'M2 1l14 10M16 1L2 11':'M0 1h18M4 6h14M0 11h18')}
bg.onclick=function(){var o=!lk.classList.contains('o');menu(o);if(o)lk.querySelector('a').focus()};
lk.addEventListener('click',function(e){if(e.target.closest('a'))menu(false)});
addEventListener('keydown',function(e){if(!lk.classList.contains('o'))return;if(e.key=='Escape'){menu(false);bg.focus();return}if(e.key=='Tab'){var f=[d.querySelector('.logo')].concat($('#lk a'),[lb,bg]);if(!e.shiftKey&&d.activeElement==f[f.length-1]){e.preventDefault();f[0].focus()}else if(e.shiftKey&&d.activeElement==f[0]){e.preventDefault();f[f.length-1].focus()}}});
/* older iOS Safari (<14) has no MediaQueryList.addEventListener: fall back to addListener */
var mqDesk=matchMedia('(min-width:861px)'),onDesk=function(m){if(m.matches&&lk.classList.contains('o'))menu(false)};if(mqDesk.addEventListener)mqDesk.addEventListener('change',onDesk);else if(mqDesk.addListener)mqDesk.addListener(onDesk);
d.getElementById('skip').addEventListener('click',function(){setTimeout(function(){d.getElementById('main').focus()},0)});
var els=$('[data-en]'),aes=$('[data-ae]'),mdesc=d.getElementById('mdesc');els.forEach(function(e){e.setAttribute('data-he',e.innerHTML)});aes.forEach(function(e){var a=e.hasAttribute('alt')?'alt':'aria-label';e.setAttribute('data-ah',e.getAttribute(a))});
function setLang(v){en=v;h.lang=en?'en':'he';h.dir=en?'ltr':'rtl';h.classList.toggle('en',en);els.forEach(function(e){e.innerHTML=e.getAttribute(en?'data-en':'data-he')});aes.forEach(function(e){e.setAttribute(e.hasAttribute('alt')?'alt':'aria-label',en?e.getAttribute('data-ae'):e.getAttribute('data-ah'))});var T=TT[en?'en':'he'];d.title=T.t;mdesc.setAttribute('content',T.d);lb.textContent=en?'עברית':'EN';lb.lang=en?'he':'en';lb.setAttribute('aria-label',en?'עברית – החלפה לעברית':'EN – Switch to English');bg.setAttribute('aria-label',T[lk.classList.contains('o')?'c':'o']);dispatchEvent(new Event('manchlang'))}
lb.onclick=function(){setLang(!en)};
/* ORDER-CLICK TRACKING, analytics-ready but sends nothing by itself. Every Wolt link carries data-order="<where on the page>".
   A click pushes {event:'order_click', order_platform:'wolt', order_location, page_language} to window.dataLayer (read by Google Tag
   Manager if it is ever added), calls gtag() only if an analytics script defined it, and fires a 'manch:order-click' DOM event.
   It never delays or blocks the navigation to Wolt. */
window.dataLayer=window.dataLayer||[];
function trackOrder(e){if(e.type=='auxclick'&&e.button!==1)return;var a=e.target.closest&&e.target.closest('a[data-order]');if(!a)return;
 var p={event:'order_click',order_platform:'wolt',order_location:a.getAttribute('data-order'),page_language:h.lang};
 try{window.dataLayer.push(p);if(typeof window.gtag=='function')window.gtag('event','order_click',{order_platform:p.order_platform,order_location:p.order_location,page_language:p.page_language,transport_type:'beacon'});
  window.dispatchEvent(new CustomEvent('manch:order-click',{detail:p}))}catch(x){}}
d.addEventListener('click',trackOrder,true);d.addEventListener('auxclick',trackOrder,true);
})();
