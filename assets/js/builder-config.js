/* Pizza Manch Haifa: builder configuration (sizes, sauces, toppings, placement). Must load before builder.js. */
/* shared by the build script (node) and pasted into the page engine */
window.MANCH_BUILDER_CONFIG={
 sizes:[{id:'s',he:'קטנה',en:'Small',k:.8},{id:'m',he:'בינונית',en:'Medium',k:.9,def:1},{id:'l',he:'גדולה',en:'Large',k:1}],
 sauces:[{id:'tomato',he:'רוטב עגבניות',en:'Tomato sauce',def:1},{id:'none',he:'ללא רוטב',en:'No sauce'}],
 /* n = pieces on the pizza, w = piece width as a share of the pizza image, z = stacking order */
 toppings:[
  {id:'cheese',he:'תוספת גבינה',en:'Extra cheese',layer:1,g:0,z:1},
  {id:'pepperoni',he:'פפרוני',en:'Pepperoni',n:14,w:.118,g:0,z:5},
  {id:'mushrooms',he:'פטריות',en:'Mushrooms',n:11,w:.118,g:1,z:4},
  {id:'olives',he:'זיתים שחורים',en:'Black olives',n:18,w:.066,g:1,z:6},
  {id:'onion',he:'בצל סגול',en:'Red onion',n:11,w:.13,g:1,z:2},
  {id:'pepper',he:'פלפל ירוק',en:'Green pepper',n:12,w:.118,g:1,z:3},
  {id:'corn',he:'תירס',en:'Corn',n:36,w:.034,g:1,z:7}],
 groups:[{he:'גבינה ובשר',en:'Cheese & meat'},{he:'ירקות',en:'Vegetables'}],
 radius:.335, /* max distance of a piece centre from the pizza centre (share of image width): keeps pieces inside the crust */
 prices:null, /* only verified menu prices, e.g. {size:{s:0,m:0,l:0},topping:{pepperoni:0},sauce:{none:0}} */
 /* best-candidate sampling: natural, non-grid spread that avoids pieces already on the pizza */
 place:function(t,variants,r,others,radius){var own=[],out=[],R=radius-t.w*.32,oth=[];
  others.forEach(function(o){o.ps.forEach(function(p){oth.push([p.x-.5,p.y-.5,o.w])})});
  for(var i=0;i<t.n;i++){var best=null,bs=-1;
   for(var c=0;c<24;c++){var a=r()*6.2832,dd=Math.sqrt(r())*R,x=dd*Math.cos(a),y=dd*Math.sin(a),s=9;
    own.forEach(function(q){var e=Math.hypot(q[0]-x,q[1]-y)/t.w;if(e<s)s=e});
    oth.forEach(function(q){var e=Math.hypot(q[0]-x,q[1]-y)/((t.w+q[2])*.5)*1.6;if(e<s)s=e});
    if(s>bs){bs=s;best=[x,y]}}
   own.push(best);out.push({x:+(.5+best[0]).toFixed(4),y:+(.5+best[1]).toFixed(4),rot:Math.round(r()*360),sc:+(.86+r()*.26).toFixed(2),v:Math.floor(r()*variants),f:r()<.5?1:0,d:+(r()*.28).toFixed(2)})}
  return out}
};
