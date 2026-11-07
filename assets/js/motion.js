/* Pizza Manch Haifa: GSAP motion layer. Needs the GSAP scripts; does nothing if they did not load. */
/* MOTION ENGINE (GSAP 3 + ScrollTrigger + SplitText + ScrollToPlugin).
   Progressive enhancement: if GSAP fails to load, the page keeps its original CSS reveal system.
   All scroll animations live in one gsap.matchMedia() so they are reverted/rebuilt on breakpoint
   or reduced-motion changes; window.MANCH_FX.destroy() tears everything down. */
(function(){
var d=document,h=d.documentElement,ld=d.getElementById('ld'),ld2=d.getElementById('ld2');
function unInert(){[].forEach.call(d.querySelectorAll('[data-ld-inert]'),function(e){e.removeAttribute('inert');e.removeAttribute('data-ld-inert')})}
function dropLoader(){[ld,ld2].forEach(function(e){e&&e.parentNode&&e.parentNode.removeChild(e)});h.classList.remove('mo');unInert()}
if(!window.gsap||!window.ScrollTrigger){dropLoader();return}
window.__mfx=true;
var G=gsap,ST=ScrollTrigger,hasSplit=!!window.SplitText;
G.registerPlugin(ST);hasSplit&&G.registerPlugin(SplitText);window.ScrollToPlugin&&G.registerPlugin(ScrollToPlugin);
h.classList.add('gs');
ST.config({ignoreMobileResize:true});
var $=function(s,c){return [].slice.call((c||d).querySelectorAll(s))},q=function(s,c){return (c||d).querySelector(s)};
var reduce=function(){return matchMedia('(prefers-reduced-motion:reduce)').matches};
var cleanups=[];function on(t,e,f,o){t.addEventListener(e,f,o);cleanups.push(function(){t.removeEventListener(e,f,o)})}

/* ---------- split-text line reveals (language-switch safe) ---------- */
var live=[];
function lines(el,vars){vars=vars||{};
 if(!hasSplit||!el.hasAttribute('data-en'))return G.from(el,Object.assign({y:36,opacity:0,duration:1.1,ease:'expo.out'},vars));
 var s=SplitText.create(el,{type:'lines',mask:'lines',linesClass:'sl'}),rec={el:el,s:s};live.push(rec);
 var user=vars.onComplete;
 rec.tw=G.from(s.lines,Object.assign({yPercent:118,rotation:vars.rot||0,duration:1.2,ease:'expo.out',stagger:.11},vars,{onComplete:function(){var i=live.indexOf(rec);if(i>-1){live.splice(i,1);s.revert()}user&&user()}}));
 return rec.tw}
/* the language toggle swaps innerHTML: finish split animations and restore the new language text */
function flushSplits(){live.splice(0).forEach(function(r){r.tw.kill();r.s.revert();r.el.innerHTML=r.el.getAttribute(h.lang=='en'?'data-en':'data-he')})}
on(window,'manchlang',function(){flushSplits();requestAnimationFrame(function(){ST.refresh()})});

/* element list -> cascading timeline */
function cascade(items,o){o=o||{};var tl=G.timeline();items.forEach(function(el,i){var at=i?'<'+(o.gap||.12):0;
 if(el.matches('h1,h2,p[data-en]'))tl.add(lines(el,el.matches('p')?{stagger:.07,duration:1}:{}),at);
 else tl.from(el,{y:o.y||30,opacity:0,duration:1,ease:'expo.out'},at)});return tl}
function list(sel,root){return function(){return $(sel,root).filter(function(e){return e.offsetParent!==null||getComputedStyle(e).position=='fixed'})}}

/* ---------- loader + hero entrance (runs once, outside matchMedia) ---------- */
var hero=q('.hero'),nav=q('#nav'),pz=q('.hero .pz'),wm=q('.hero .wm'),seal=q('.hero .seal'),strip=q('.hero .strip'),bar=q('.bar');
var ht=q('.hero .hti');
function intro(){var tl=G.timeline({defaults:{ease:'expo.out'}});
 var h1=q('h1',ht),rest=[q('p',ht)].concat($('.cta>*',ht),$('.chips>*',ht));
 tl.from(pz,{scale:.62,rotation:-70,autoAlpha:0,duration:2.1},0)
  .from(wm,{yPercent:28,opacity:0,duration:2},.05)
  .from(q('.eye',ht),{autoAlpha:0,y:18,duration:1},.25)
  .add(lines(h1,{duration:1.35,stagger:.13}),.32)
  .from(rest,{autoAlpha:0,y:26,stagger:.08,duration:1.1},.7)
  .from(strip,{yPercent:101,duration:1.3,ease:'expo.inOut'},.3)
  .from(strip?strip.children:[],{autoAlpha:0,y:18,stagger:.07,duration:1},.95)
  .from(seal,{scale:0,rotation:-140,autoAlpha:0,duration:1.6,ease:'back.out(1.25)'},.85)
  .from(nav,{yPercent:-100,autoAlpha:0,duration:1.1},.55)
  .from(bar,{yPercent:140,duration:1.1},1)
  .call(function(){G.set([pz,wm,seal,strip,nav,bar].concat(strip?[].slice.call(strip.children):[],rest,[q('.eye',ht)]),{clearProps:'transform,opacity,visibility'})});
 return tl}
var motion=!reduce();
if(motion){
 /* the seal's ring of text keeps turning slowly */
 /* WCAG 2.2.2: auto-moving content must stop within 5 s, so the ring makes one slow turn that settles (was an endless loop) */
 var ring=seal&&q('text',seal);ring&&G.to(ring,{rotation:-90,svgOrigin:'80 80',duration:4.8,ease:'sine.inOut',delay:1.2});
}
if(motion&&ld&&h.classList.contains('mo')){
 var quick=false;try{quick=sessionStorage.getItem('mfx')=='1';sessionStorage.setItem('mfx','1')}catch(e){}
 /* PERFORMANCE: same choreography, shorter: sp scales the intro of the loader, so its exit (first visit ~1.2 s to the hero, repeat ~0.9 s; was ~2.4 s / ~1.7 s) */
 /* if the page took long to get here (slow connection), the visitor already waited: play a much shorter version */
 var late=window.performance&&performance.now()>1800;
 var sp=late?.12:quick?.25:.4,so=late?.45:quick?.5:.6,n={v:0},ldn=q('#ldn'),ldb=q('.ld-b i');
 var fonts=Promise.race([d.fonts&&d.fonts.ready?d.fonts.ready:Promise.resolve(),new Promise(function(r){setTimeout(r,700)})]);
 var L=G.timeline();
 L.from('.ld-w span',{yPercent:115,duration:1*sp,stagger:.07*sp,ease:'expo.out'},0)
  .from('.ld-m',{autoAlpha:0,y:12,duration:.7*sp,ease:'power3.out'},.25*sp)
  .to(n,{v:100,duration:1.25*sp,ease:'power2.inOut',onUpdate:function(){ldn.textContent=(n.v<10?'0':'')+Math.round(n.v);G.set(ldb,{scaleX:n.v/100})}},.1*sp);
 var inDone=new Promise(function(r){L.eventCallback('onComplete',r)});
 Promise.all([fonts,inDone]).then(function(){
  var out=G.timeline();unInert();
  out.to('.ld-w span',{yPercent:-115,duration:.7*so,stagger:.045*so,ease:'expo.in'},0)
   .to('.ld-m,.ld-b',{autoAlpha:0,duration:.4*so},.15*so)
   .to(ld,{clipPath:'inset(0% 0% 100% 0%)',duration:1.15*so,ease:'expo.inOut'},.55*so)
   .to(ld2,{clipPath:'inset(0% 0% 100% 0%)',duration:1.15*so,ease:'expo.inOut'},.68*so)
   .add(intro(),1.05*so)
   .call(function(){dropLoader();ST.refresh()},null,1.85*so);
 });
}else{dropLoader();if(motion&&scrollY<80&&!window.__mfxLate)(d.fonts&&d.fonts.ready?d.fonts.ready:Promise.resolve()).then(intro)}

/* ---------- global UI motion (not breakpoint specific) ---------- */
var prog=d.createElement('div');prog.className='prog';prog.setAttribute('aria-hidden','true');d.body.appendChild(prog);
var progTw=G.to(prog,{scaleX:1,ease:'none',scrollTrigger:{start:0,end:'max',scrub:.3}});
/* nav hides while scrolling down, returns on scroll up / focus (never while the mobile menu is open) */
var lk=q('#lk'),navHidden=false;
function showNav(show){if(navHidden===!show)return;navHidden=!show;h.classList.toggle('nav-off',navHidden);G.to(nav,{yPercent:show?0:-110,duration:show?.55:.45,ease:show?'expo.out':'power3.in',overwrite:'auto',onComplete:function(){if(!navHidden)G.set(nav,{clearProps:'transform'})}})}
var navST=ST.create({start:0,end:'max',onUpdate:function(s){if(lk.classList.contains('o'))return showNav(true);showNav(!(s.direction===1&&s.scroll()>innerHeight*.7))}});
on(nav,'focusin',function(){showNav(true)});
/* mobile menu: stagger links in when it opens */
on(q('#bg'),'click',function(){if(lk.classList.contains('o')){G.set(nav,{clearProps:'transform'});navHidden=false;if(!reduce())G.from($('a',lk),{y:40,autoAlpha:0,duration:.8,stagger:.06,ease:'expo.out',clearProps:'all'})}});
/* anchor links glide (ScrollToPlugin), instant with reduced motion; focus moves to the target for keyboard users */
on(d,'click',function(e){var a=e.target.closest&&e.target.closest('a[href^="#"]');if(!a||a.id=='skip'||!window.ScrollToPlugin)return;
 var id=a.getAttribute('href'),t=id=='#home'||id=='#'?null:q(id);if(id!='#home'&&id!='#'&&!t)return;e.preventDefault();
 G.to(window,{scrollTo:{y:t||0,offsetY:t?60:0,autoKill:true},duration:reduce()?0:1.3,ease:'expo.inOut',overwrite:true,onComplete:function(){var f=t||q('#main');if(!f.hasAttribute('tabindex'))f.setAttribute('tabindex','-1');f.focus({preventScroll:true})}});
 history.pushState&&history.pushState(null,'',id)});
/* builder: toppings drop onto the pizza */
on(q('#bctl')||d,'pointerdown',function(e){var b=e.target.closest&&e.target.closest('#bctl label');if(b&&!b.disabled&&!reduce())G.fromTo(b,{scale:.9},{scale:1,duration:.6,ease:'back.out(3)',clearProps:'transform'})});

/* ---------- scroll choreography ---------- */
var done=new WeakSet(),mm=G.matchMedia();
mm.add({desk:'(min-width:861px)',mob:'(max-width:860px)',motion:'(prefers-reduced-motion:no-preference)',fine:'(hover:hover) and (pointer:fine)'},function(ctx){
 var c=ctx.conditions;if(!c.motion){G.set(prog,{autoAlpha:0});return}
 var off=[];function lis(t,e,f){t.addEventListener(e,f);off.push(function(){t.removeEventListener(e,f)})}

 /* reveal: hide now, animate once the trigger enters; never re-hides something already revealed.
    ACCESSIBILITY: hidden with opacity (not visibility), so links/buttons inside stay reachable with Tab; if keyboard focus
    gets there first, the block is shown at once without animation (focusin handler below). */
 var pend=[];
 function reveal(trigger,items,o){o=o||{};if(!trigger||done.has(trigger))return;var get=typeof items=='function'?items:function(){return items.filter(Boolean)};
  var g0=get();g0.length&&G.set(g0,{opacity:0});
  var st=ST.create({trigger:trigger,start:o.start||'top 80%',once:true,onEnter:function(){ctx.add(function(){if(done.has(trigger))return;done.add(trigger);var els=get();els.length&&G.set(els,{opacity:1});var tl=cascade(els,o);o.then&&o.then(tl)})}});
  pend.push({trigger:trigger,get:get,st:st})}
 lis(d,'focusin',function(e){var t=e.target;if(!t||!t.closest)return;
  pend.forEach(function(x){if(!x.trigger.contains(t))return;var els=x.get();
   if(!done.has(x.trigger)){done.add(x.trigger);x.st.kill();els.length&&G.set(els,{clearProps:'opacity,visibility,transform'})}
   else els.forEach(function(el){if(el.contains(t)){G.killTweensOf(el);G.set(el,{clearProps:'opacity,visibility,transform'})}})});  /* already animating in: show the focused one now */
  var card=t.closest('.mc');if(card&&!done.has(card)){done.add(card);G.set(card,{clearProps:'clipPath'})}
  var row=t.closest('.mp .row');if(row){done.add(row);G.set($('.row a',mp),{yPercent:0})}});

 /* HERO: pizza spins & text drifts as you scroll away */
 var pzi=q('i',pz);
 G.timeline({scrollTrigger:{trigger:hero,start:'top top',end:'bottom top',scrub:.5}})
  .to(pzi,{rotation:c.desk?55:35,scale:c.desk?1.08:1,ease:'none'},0)
  .to(ht,{yPercent:c.desk?-22:-8,opacity:c.desk?.1:1,ease:'none'},0);

 /* SIGNATURE: image opens from a framed window, slow parallax, line reveal */
 var sig=q('.sig'),sim=q('.im',sig);
 G.fromTo(sim,{clipPath:'inset(12% 9% 12% 9% round 28px)',scale:1.28},{clipPath:'inset(0% 0% 0% 0% round 0px)',scale:1.06,ease:'none',scrollTrigger:{trigger:sig,start:'top bottom',end:'top 10%',scrub:.6}});
 G.fromTo(sim,{yPercent:0},{yPercent:(parseFloat(sim.getAttribute('data-px'))||.08)*100,ease:'none',immediateRender:false,scrollTrigger:{trigger:sig,start:'top top',end:'bottom top',scrub:true}});
 reveal(q('.t',sig),list('.eye,h2,p',q('.t',sig)),{start:'top 75%'});

 /* MENU: header, then cards open bottom-up with an image settle */
 var menu=q('.menu');reveal(q('.top',menu),list('.eye,h2,p',q('.top',menu)));
 var cards=$('.mc',menu).filter(function(e){return !done.has(e)});
 if(cards.length){G.set(cards,{clipPath:'inset(100% 0% 0% 0% round 6px)'});
  ST.batch(cards,{start:'top 88%',once:true,onEnter:function(b){ctx.add(function(){b=b.filter(function(e){return !done.has(e)});if(!b.length)return;b.forEach(function(e){done.add(e)});
   G.timeline().to(b,{clipPath:'inset(0% 0% 0% 0% round 6px)',duration:1.4,ease:'expo.inOut',stagger:.13,clearProps:'clipPath'},0)
    .from(b.map(function(e){return q('.im',e)}),{scale:1.4,duration:1.8,ease:'expo.out',stagger:.13,clearProps:'transform'},.15)
    .from(b.map(function(e){return [q('.n',e),q('h3',e),q('span',e)]}).flat(),{y:34,opacity:0,duration:1,ease:'expo.out',stagger:.05,clearProps:'transform,opacity'},.55)})}})}
 /* card hover: soft 3D tilt, inner-image drift and a pointer spotlight (precise pointers only) */
 if(c.fine)$('.mc',menu).forEach(function(card){var im=q('.im',card);G.set(card,{transformPerspective:1100});
  var rx=G.quickTo(card,'rotationX',{duration:.6,ease:'power3'}),ry=G.quickTo(card,'rotationY',{duration:.6,ease:'power3'}),ix=G.quickTo(im,'x',{duration:.8,ease:'power3'}),iy=G.quickTo(im,'y',{duration:.8,ease:'power3'});
  lis(card,'pointerenter',function(){G.to(im,{scale:1.09,duration:1.1,ease:'expo.out',overwrite:'auto'})});
  lis(card,'pointermove',function(e){var r=card.getBoundingClientRect(),px=(e.clientX-r.left)/r.width-.5,py=(e.clientY-r.top)/r.height-.5;
   rx(-py*6);ry(px*7);ix(-px*16);iy(-py*16);card.style.setProperty('--mx',(px+.5)*100+'%');card.style.setProperty('--my',(py+.5)*100+'%')});
  lis(card,'pointerleave',function(){rx(0);ry(0);ix(0);iy(0);G.to(im,{scale:1,duration:1.1,ease:'expo.out',overwrite:'auto'})});
  off.push(function(){G.set([card,im],{clearProps:'transform'})})});

 /* MORE THAN PIZZA: words rise out of the rule, then drift in opposite directions */
 var mp=q('.mp');reveal(q('.rv',mp),list('.eye,h2',q('.rv',mp)));
 var words=$('.row a',mp);
 if(!done.has(q('.row',mp)))G.set(words,{yPercent:105});
 reveal(q('.row',mp),function(){return []},{start:'top 85%',then:function(){G.fromTo($('.row a',mp),{yPercent:105},{yPercent:0,duration:1.3,ease:'expo.out',stagger:.12})}});
 if(c.desk)words.forEach(function(w,i){G.fromTo(w,{x:0},{x:(i%2?-1:1)*40,ease:'none',immediateRender:false,scrollTrigger:{trigger:mp,start:'top bottom',end:'bottom top',scrub:true}})});

 /* LAYER BY LAYER: pinned scene on desktop, scrubbed zoom-out on touch */
 var ex=q('.ex'),ph=q('.ph',ex),ext=q('.t',ex);
 if(c.desk){var xt=G.timeline({scrollTrigger:{trigger:ex,start:'top top',end:'+=110%',pin:true,scrub:.7,anticipatePin:1}});
  xt.fromTo(ph,{scale:1.45,opacity:.35},{scale:1,opacity:.95,ease:'none',duration:1},0)
   .from(q('.eye',ext),{autoAlpha:0,y:24,duration:.25},.1)
   .from(q('h2',ext),{autoAlpha:0,yPercent:60,scale:.92,duration:.4,ease:'power2.out'},.12)
   .to(ext,{yPercent:-25,duration:.3,ease:'none'},.7);
 }else{G.fromTo(ph,{scale:1.3},{scale:1,ease:'none',scrollTrigger:{trigger:ex,start:'top bottom',end:'bottom 30%',scrub:.5}});
  reveal(ext,list('.eye,h2',ext),{start:'top 80%'})}

 /* BUILDER: the pizza rolls in, controls cascade */
 var bd=q('#build'),pv=q('#pv'),bh=q('.bd-hd',bd),bc=q('.bd-ctl',bd),cartEl=q('#cart');
 reveal(bh,list('.eye,h2,p',bh));
 if(!done.has(pv)){G.set(pv,{autoAlpha:0});ST.create({trigger:pv,start:'top 85%',once:true,onEnter:function(){ctx.add(function(){done.add(pv);G.set(pv,{autoAlpha:1});
  G.from(pv,c.desk?{scale:.72,rotation:-90,autoAlpha:0,duration:1.8,ease:'expo.out',clearProps:'transform'}:{y:40,autoAlpha:0,duration:1.2,ease:'expo.out',clearProps:'transform'})})}})}
 reveal(bc,function(){return $('#bctl h3,#bctl label',bc).concat($('.bd-add',bc))},{gap:.03,y:22,start:'top 82%'});
 reveal(cartEl,[cartEl],{start:'top 88%'});

 /* WHY / REVIEWS / FINAL / FOOTER */
 var why=q('.why .rv');reveal(why,list('.eye,h2,p,li',why));
 var rev=q('.rev'),big=q('.big',rev);
 if(big&&!done.has(big)){var tn=big.firstChild,fin=tn.nodeValue,val=parseFloat(fin)||0;
  reveal(big,[big],{start:'top 85%',then:function(){var o={v:0};G.from(big,{scale:.8,duration:1.6,ease:'expo.out',transformOrigin:'50% 80%'});G.to(o,{v:val,duration:1.8,ease:'expo.out',onUpdate:function(){tn.nodeValue=o.v.toFixed(1)},onComplete:function(){tn.nodeValue=fin}})}});
  off.push(function(){tn.nodeValue=fin})}
 var rv2=$('.rv',rev)[1];reveal(rv2,list('.eye,p,a',rv2),{start:'top 85%'});
 var f=q('.fin'),fim=q('.im',f),ft=q('.t',f);
 G.fromTo(fim,{scale:1.3,yPercent:-6},{scale:1,yPercent:6,ease:'none',scrollTrigger:{trigger:f,start:'top bottom',end:'bottom top',scrub:true}});
 reveal(ft,list('h2,p,.row .btn',ft),{start:'top 75%'});
 var foot=q('footer');reveal(foot,$('footer>div'),{start:'top 92%',gap:.08});

 /* any other .rv block not covered above */
 $('.rv').forEach(function(e){if(!e.closest('.sig,.menu,.mp,.ex,.bd,.why,.rev,.fin'))reveal(e,[e])});

 /* magnetic buttons (precise pointers only) */
 if(c.fine)$('.btn').forEach(function(b){var xs=G.quickTo(b,'x',{duration:.5,ease:'power3'}),ys=G.quickTo(b,'y',{duration:.5,ease:'power3'}),ar=q('svg',b);
  lis(b,'pointermove',function(e){var r=b.getBoundingClientRect();xs((e.clientX-r.left-r.width/2)*.28);ys((e.clientY-r.top-r.height/2)*.38)});
  lis(b,'pointerenter',function(){ar&&G.to(ar,{x:h.dir=='ltr'?6:-6,duration:.5,ease:'expo.out',overwrite:'auto'})});
  lis(b,'pointerleave',function(){G.to(b,{x:0,y:0,duration:1,ease:'elastic.out(1,.4)',overwrite:true});ar&&G.to(ar,{x:0,duration:.6,ease:'expo.out',overwrite:'auto'})});
  off.push(function(){G.set([b,ar],{clearProps:'transform'})})});

 return function(){off.forEach(function(f){f()});flushSplits()};
});

/* layout can shift once fonts/images settle */
on(window,'load',function(){ST.refresh()});
d.fonts&&d.fonts.ready&&d.fonts.ready.then(function(){ST.refresh()});

window.MANCH_FX={mm:mm,refresh:function(){ST.refresh()},destroy:function(){mm.revert();flushSplits();progTw.scrollTrigger.kill();progTw.kill();navST.kill();cleanups.forEach(function(f){f()});prog.remove();h.classList.remove('gs')}};
})();
