(()=>{
'use strict';
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const reduce=matchMedia('(prefers-reduced-motion:reduce)').matches;
const touch=matchMedia('(hover:none)').matches;
let lang='ru'; try{lang=localStorage.getItem('lang')||(navigator.language||'').startsWith('en')&&'en'||'ru'}catch(e){}
let sound=false, actx=null;
/* ---------- background music ---------- */
const VOL=.22, VOL_DUCK=.05;
let pref='off'; try{pref=localStorage.getItem('music')||'off'}catch(e){} /* music is OFF by default: clients often browse at work */
const bgm=new Audio('assets/audio/bgm.mp3'); bgm.loop=true; bgm.preload='auto'; bgm.volume=0;
window.__bgm=bgm; let musicOn=false, started=false, fadeT=null, target=0;
function setBtn(){ const b=$('#sndBtn'); b.classList.toggle('on',musicOn); b.setAttribute('aria-pressed',musicOn); $('#sndState').textContent=musicOn?'ON':'OFF'; sound=musicOn; }
function fadeTo(v,ms){ clearInterval(fadeT); const from=bgm.volume,t0=performance.now(); target=v;
  fadeT=setInterval(()=>{const k=Math.min(1,(performance.now()-t0)/ms); bgm.volume=Math.max(0,Math.min(1,from+(v-from)*k)); if(k>=1){clearInterval(fadeT); if(v===0&&!musicOn)bgm.pause();}},50); }
function desired(){ return !musicOn?0:(isDucked()?VOL_DUCK:VOL); }
function isDucked(){ const m=document.getElementById('modal'); const rvp=document.getElementById('reelVideo'), vk=document.getElementById('vkVideo'); return (m&&!m.hidden)||(rvp&&!rvp.paused&&!rvp.muted)||(vk&&!vk.paused&&!vk.muted); }
function applyDuck(){ if(started&&musicOn&&!document.hidden) fadeTo(desired(),600); }
async function startMusic(fadeMs=2500){
  if(pref==='off'||musicOn&&started&&!bgm.paused) return;
  try{ await bgm.play(); started=true; musicOn=true; setBtn(); fadeTo(desired(),fadeMs); }catch(e){ /* blocked until a gesture */ }
}
function toggleMusic(){
  if(musicOn){ musicOn=false; pref='off'; try{localStorage.setItem('music','off')}catch(e){} setBtn(); fadeTo(0,500); }
  else{ musicOn=true; pref='on'; try{localStorage.setItem('music','on')}catch(e){} setBtn(); bgm.play().then(()=>{started=true;fadeTo(desired(),1200)}).catch(()=>{}); }
}
$('#sndBtn').onclick=()=>{toggleMusic(); blip(880,.12,'sawtooth',.05)};
document.addEventListener('visibilitychange',()=>{ if(document.hidden){ if(!bgm.paused)bgm.pause(); } else if(started&&musicOn){ bgm.play().catch(()=>{}); fadeTo(desired(),1200);} });
/* fallback: first gesture anywhere starts music if it has not started yet */
['pointerdown','keydown','touchstart','wheel'].forEach(ev=>addEventListener(ev,function f(){ if(!started&&pref!=='off'&&bootDone){ startMusic(); } if(started) removeEventListener(ev,f); },{passive:true}));
if(pref==='off') setBtn();
else bgm.play().then(()=>{started=true;musicOn=true;setBtn();fadeTo(VOL,2500)}).catch(()=>{}); /* try autoplay first */

function blip(f=660,d=.06,type='square',v=.03){
  if(!sound) return;
  try{ actx=actx||new (window.AudioContext||window.webkitAudioContext)();
    const o=actx.createOscillator(),g=actx.createGain(); o.type=type;o.frequency.value=f;
    g.gain.setValueAtTime(v*.6,actx.currentTime);g.gain.exponentialRampToValueAtTime(.0001,actx.currentTime+d);
    o.connect(g).connect(actx.destination);o.start();o.stop(actx.currentTime+d);}catch(e){}
}

/* ---------- i18n ---------- */
function applyLang(){
  const T=I18N[lang]; document.documentElement.lang=lang;
  $$('[data-i]').forEach(el=>{const k=el.dataset.i; if(T[k]!==undefined){el.textContent=T[k]; if(el.dataset.text!==undefined) el.dataset.text=T[k];}});
  const be=$('#bootEnter span'); if(be) be.textContent=lang==='ru'?'ВОЙТИ В СИСТЕМУ':'ENTER SYSTEM';
  const sp=$$('#langBtn span'); sp[0].className=lang==='ru'?'on':''; sp[1].className=lang==='en'?'on':'';
  $$('[data-pdf]').forEach(el=>{const f='GONAR_Portfolio_'+(lang==='ru'?'RU':'EN')+'.pdf'; el.href='assets/docs/'+f; el.setAttribute('download',f);});
  $('#expFields').innerHTML=T.expf.map(x=>'<div class="holo-mini">'+x+'</div>').join(''); $('#apprList').innerHTML=T.appr.map(x=>'<li>'+x+'</li>').join('');
  buildFilters(); buildGrid(); buildFl(); buildGFilters(); buildGallery();
  const L=o=>o[lang]||o.ru;
  $('#priceGrid').innerHTML=PRICES.map(p=>`<div class="frame price reveal in${p.hot?' hot':''}"><div class="corner tl"></div><div class="corner br"></div>${p.hot?`<span class="ptag">${T.hot}</span>`:''}<h3>${L(p.t)}</h3><b class="pp">${L(p.p)}</b><small>${L(p.s)}</small><p>${L(p.d)}</p><a class="btn${p.hot?'':' ghost'}" href="https://t.me/aid99999" target="_blank" rel="noopener">${T.order}</a></div>`).join('');
  $('#revGrid').innerHTML=REVIEWS.map(r=>`<figure class="frame rev reveal in"><b class="stars">★★★★★</b><blockquote>«${L(r.q)}»</blockquote><figcaption>${L(r.t)} · Freelancehunt</figcaption></figure>`).join('');
  try{localStorage.setItem('lang',lang)}catch(e){}
}
$('#langBtn').onclick=()=>{lang=lang==='ru'?'en':'ru'; applyLang(); glitchScreen(); blip(520,.1)};

/* ---------- boot ---------- */
const bootLines=['> GONAR.OS v2.6 // BOOT SEQUENCE','> checking memory ........ [ OK ]','> mounting /deep-field/01 .. [ OK ]','> loading holo-renderer ... [ OK ]','> calibrating star-field .. [ OK ]','> linking channels: PARANORMA, GONAR FORCE','> signal locked.','> WELCOME, OPERATOR_'];
let bootDone=false;
function endBoot(){ if(bootDone)return; bootDone=true; try{sessionStorage.setItem('booted','1')}catch(e){} startMusic(2500); $('#boot').classList.add('out'); document.body.classList.remove('booting'); setTimeout(()=>$('#boot').remove(),700); heroIn(); }
(function boot(){
  const log=$('#bootLog'),fill=$('#bootFill'); let i=0,c=0;
  let seen=false; try{seen=!!sessionStorage.getItem('booted')}catch(e){}
  if(reduce||seen){ log.textContent=bootLines.join('\n'); fill.style.width='100%'; setTimeout(endBoot,seen?0:300); return; }
  $('#boot').addEventListener('click',endBoot);
  (function tick(){
    if(bootDone) return;
    if(i>=bootLines.length){ setTimeout(endBoot,250); return; }
    const L=bootLines[i]; c+=7; log.textContent=bootLines.slice(0,i).join('\n')+(i?'\n':'')+L.slice(0,c)+'█';
    if(c>=L.length){ i++; c=0; fill.style.width=(i/bootLines.length*100)+'%'; blip(300+i*70,.04); setTimeout(tick,45);} else setTimeout(tick,10);
  })();
})();
$('#bootSkip').onclick=endBoot;
$('#bootEnter').onclick=endBoot;
function showEnter(){ if(bootDone)return; $('#bootFill').style.width='100%'; $('#bootSkip').hidden=true; $('#bootEnter').hidden=false; $('#bootEnter').focus(); }
function heroIn(){ $$('#hero .glitch').forEach(g=>g.classList.add('g')); setTimeout(()=>$$('#hero .glitch').forEach(g=>g.classList.remove('g')),800); }

/* ---------- screen glitch ---------- */
const sg=$('#screenGlitch');
function glitchScreen(){ if(reduce)return; sg.classList.remove('on'); void sg.offsetWidth; sg.classList.add('on'); document.body.classList.add('shake'); setTimeout(()=>document.body.classList.remove('shake'),300); blip(90,.15,'sawtooth',.04); }
if(!reduce){ (function loop(){ setTimeout(()=>{ if(!document.hidden && !bootDone===false) glitchScreen(); loop(); },9000+Math.random()*9000); })();
  setInterval(()=>{ const hs=$$('.sec-head h2,.logo'); const h=hs[Math.random()*hs.length|0]; h.classList.add('g'); setTimeout(()=>h.classList.remove('g'),700); },3500); }

/* ---------- cursor ---------- */
const cur=$('#cursor'); let mx=innerWidth/2,my=innerHeight/2,cx=mx,cy=my,nx=0,ny=0;
addEventListener('pointermove',e=>{mx=e.clientX;my=e.clientY;nx=mx/innerWidth-.5;ny=my/innerHeight-.5;cur.style.opacity=1});
(function cl(){cx+=(mx-cx)*.25;cy+=(my-cy)*.25;cur.style.transform=`translate(${cx}px,${cy}px)`;requestAnimationFrame(cl)})();
document.addEventListener('pointerover',e=>{cur.classList.toggle('hover',!!e.target.closest('a,button,.holo,input,textarea'))});

/* ---------- content builders ---------- */
const catName=c=>CATS[c][lang==='ru'?0:1];
let filter='all';
function buildFilters(){
  const f=$('#filters'); f.innerHTML='';
  const used=new Set(PROJECTS.map(p=>p.cat)); Object.keys(CATS).filter(k=>k==='all'||used.has(k)).forEach(k=>{const b=document.createElement('button');b.className='chip'+(k===filter?' act':'');b.textContent=catName(k);b.onclick=()=>{filter=k;blip(700,.05);buildFilters();buildGrid()};f.append(b)});
}
const projById={}; PROJECTS.forEach(p=>projById[p.id]=p);
function buildGrid(){
  const g=$('#grid'); g.innerHTML='';
  PROJECTS.filter(p=>filter==='all'||p.cat===filter).forEach((p,i)=>{
    const t=p[lang]; const a=document.createElement('a');
    a.className='holo tilt reveal'+((p.ar||1.78)<1?' vert':''); a.href='#'+p.id; a.dataset.id=p.id;
    a.innerHTML=`<span class="tag">${catName(p.cat).toUpperCase()} / ${p.year}</span>${p.variants?'<span class="fmtb">'+['16:9'].concat(p.variants.map(v=>v.label)).join(' · ')+'</span>':''}<div class="media" style="aspect-ratio:${(p.ar||1.78)<1?'3/4':(p.ar<1.2?'1/1':'16/9')}"><img src="assets/poster/${p.id}.jpg" alt="${t[0]}" loading="lazy"><video muted loop playsinline preload="none" data-src="assets/loop/${p.id}.mp4"></video></div><span class="watch">▶ ${I18N[lang].watch}</span><div class="holo-body"><small>#${String(i+1).padStart(2,'0')}</small><h3>${t[0]}</h3><p>${t[1]}</p></div>`;
    a.onclick=e=>{e.preventDefault();openModal(p.id)};
    g.append(a);
  });
  bindTilt(); observe();
}

/* video hover preview */
document.addEventListener('pointerenter',e=>{const c=e.target.closest&&e.target.closest('.holo[data-id]'); if(!c)return; const v=$('video',c); if(!v)return; if(!v.src){v.src=v.dataset.src} v.play().catch(()=>{}); blip(1200,.03,'sine',.02)},true);
document.addEventListener('pointerleave',e=>{const c=e.target.closest&&e.target.closest('.holo[data-id]'); if(!c)return; const v=$('video',c); if(v) v.pause()},true);
/* touch: play loops of visible cards */
if(touch){ const io=new IntersectionObserver(es=>es.forEach(en=>{const v=$('video',en.target); if(!v)return; if(en.isIntersecting){if(!v.src)v.src=v.dataset.src; v.style.opacity=1; v.play().catch(()=>{})}else v.pause()}),{threshold:.6}); new MutationObserver(()=>$$('.holo[data-id]').forEach(c=>io.observe(c))).observe($('#grid'),{childList:true}); }

/* tilt */
function bindTilt(){ if(touch)return; $$('.tilt:not([data-t])').forEach(el=>{el.dataset.t=1;
  el.addEventListener('pointermove',e=>{const r=el.getBoundingClientRect(),x=(e.clientX-r.left)/r.width,y=(e.clientY-r.top)/r.height;
    el.style.setProperty('--ry',((x-.5)*14)+'deg');el.style.setProperty('--rx',((.5-y)*14)+'deg');el.style.setProperty('--mx',x*100+'%');el.style.setProperty('--my',y*100+'%')});
  el.addEventListener('pointerleave',()=>{el.style.setProperty('--ry','0deg');el.style.setProperty('--rx','0deg')});
});}

/* skills */
function buildSkills(){
  const g=$('#skillGrid'); const ws=[88,82,76,90,84,70,92,80,86,78,74,83];
  SKILLS.forEach((s,i)=>{const d=document.createElement('div');d.className='skill reveal';d.style.setProperty('--w',ws[i]+'%');
    d.innerHTML=`<h4>${s[0]}</h4><small>${s[1].toUpperCase()}</small><div class="meter"><i></i></div><span class="st">ACTIVE</span>`;g.append(d)});
}

/* freelance terminal */
let flTimer;
function buildFl(){
  const T=I18N[lang], el=$('#termFl'); clearTimeout(flTimer);
  const txt=`<span class="c">$</span> whoami\n${T.flhead}\n<span class="c">$</span> ls ./services\n`+T.fl.map(s=>'  ▸ '+s).join('\n')+`\n<span class="c">$</span> cat portfolio.link\nfreelancehunt.com/freelancer/gonar.html\n<span class="d">${T.flnote}</span>`;
  if(reduce){el.innerHTML=txt;return;}
  // type visible chars, keep tags intact
  const parts=txt.split(/(<[^>]+>)/); let pi=0,ci=0,out='';
  (function step(){
    if(pi>=parts.length){el.innerHTML=out+'<span class="c">█</span>';return;}
    const p=parts[pi];
    if(p.startsWith('<')){out+=p;pi++;return step();}
    ci+=3; out+=p.slice(ci-3,ci); el.innerHTML=out+'█';
    if(ci>=p.length){pi++;ci=0}
    flTimer=setTimeout(step,12);
  })();
}

/* reveal + counters + skills + lazy */
let io;
function observe(){
  io=io||new IntersectionObserver(es=>es.forEach(en=>{ if(!en.isIntersecting)return; const t=en.target; t.classList.add('in'); if(t.classList.contains('skill'))t.classList.add('in'); if(t.classList.contains('holo'))t.classList.add('glow-in'); io.unobserve(t);
    $$('[data-count]',t).forEach(c=>{const n=+c.dataset.count;let k=0;const s=setInterval(()=>{k++;c.textContent=Math.min(n,k);if(k>=n)clearInterval(s)},900/n)}); }),{threshold:.12});
  $$('.reveal:not(.in)').forEach(el=>io.observe(el));
}

/* ---------- showreel ---------- */
const rv=$('#reelVideo'), rf=$('#reelFrame');
$('#reelPlay').onclick=()=>{ if(!rv.src)rv.src=rv.dataset.src; rv.muted=false; rv.loop=false; rv.controls=true; rv.play().catch(()=>{rv.muted=true;rv.play()}); rf.classList.add('playing'); blip(900,.1); };
rv.addEventListener('timeupdate',()=>{const t=rv.currentTime|0;$('#reelTime').textContent=String(t/60|0).padStart(2,'0')+':'+String(t%60).padStart(2,'0')});
['play','pause','volumechange'].forEach(e=>rv.addEventListener(e,applyDuck)); rv.addEventListener('ended',()=>{rf.classList.remove('playing');rv.controls=false});
new IntersectionObserver(es=>es.forEach(e=>{if(!e.isIntersecting&&!rv.paused)rv.pause()}),{threshold:.1}).observe(rf);
/* ---------- hero business card video (Portfolio Sylar TG) ---------- */
const vk=$('#vkVideo'), vkB=$('#vkSnd'), vkT=$('#vkSndT');
if(vk){
  const setVk=()=>{ const on=!vk.muted; vkB.classList.toggle('on',on); vkB.setAttribute('aria-pressed',on); vkT.dataset.i=on?'vk_off':'vk_on'; vkT.textContent=((I18N[lang]||{})[vkT.dataset.i]||vkT.textContent); $('.vk-ico',vkB).textContent=on?'🔇':'🔊'; };
  vkB.onclick=()=>{ if(vk.muted){ vk.currentTime=0; vk.muted=false; vk.loop=false; vk.play().catch(()=>{vk.muted=true;}); } else { vk.muted=true; vk.loop=true; vk.play().catch(()=>{}); } setVk(); applyDuck(); blip(900,.1); };
  vk.addEventListener('ended',()=>{ vk.muted=true; vk.loop=true; vk.currentTime=0; vk.play().catch(()=>{}); setVk(); applyDuck(); });
  ['play','pause','volumechange'].forEach(e=>vk.addEventListener(e,applyDuck));
  new IntersectionObserver(es=>es.forEach(e=>{ if(e.isIntersecting){ vk.play().catch(()=>{}); } else if(!vk.paused){ if(!vk.muted){vk.muted=true;vk.loop=true;setVk();} vk.pause(); } }),{threshold:.15}).observe(vk);
}

/* ---------- modal ---------- */
const modal=$('#modal'), mv=$('#mVideo');
function setFmt(p,vid,ar,btn){
  mv.pause(); mv.poster='assets/poster/'+vid+'.jpg'; mv.src='assets/video/'+vid+'.mp4'; mv.style.aspectRatio=ar; mv.classList.toggle('vert',ar<1);
  $$('#mFmts button').forEach(b=>b.classList.toggle('act',b===btn)); mv.muted=false; mv.play().catch(()=>{mv.muted=true;mv.play()});
}
function openModal(id){
  const p=projById[id],t=p[lang]; const fm=$('#mFmts'); fm.innerHTML='';
  const forms=[{id:id,label:'16:9',ar:p.variants?(p.ar||1.778):(p.ar||1.778)}].concat(p.variants||[]);
  if(forms.length>1){ forms.forEach((f,i)=>{const b=document.createElement('button');b.className='chip';b.textContent=f.label;b.onclick=()=>{setFmt(p,f.id,f.ar,b);blip(800,.05)};fm.append(b)}); }
  $('#mTitle').textContent=t[0]; $('#mDesc').textContent=t[1]; $('#mMeta').textContent=catName(p.cat).toUpperCase()+' / '+p.year;
  modal.hidden=false; document.body.style.overflow='hidden'; applyDuck(); blip(700,.1,'sawtooth'); history.replaceState(null,'','#'+id);
  setFmt(p,id,p.ar||1.778,fm.firstChild);
}
function closeModal(){ mv.pause(); mv.removeAttribute('src'); mv.load(); modal.hidden=true; document.body.style.overflow=''; applyDuck(); blip(400,.08); history.replaceState(null,'','#projects'); }
$('#mClose').onclick=closeModal; modal.addEventListener('click',e=>{if(e.target===modal)closeModal()});
addEventListener('keydown',e=>{if(e.key==='Escape'&&!modal.hidden)closeModal()});


/* ---------- gallery ---------- */
let gf='all', gList=[];
const gName=g=>(lang==='en'&&g.en)||g.title;
function buildGFilters(){ const f=$('#gFilters'); f.innerHTML='';
  Object.keys(GCATS).forEach(k=>{const b=document.createElement('button');b.className='chip'+(k===gf?' act':'');b.textContent=GCATS[k][lang==='ru'?0:1];b.onclick=()=>{gf=k;blip(700,.05);buildGFilters();buildGallery()};f.append(b)}); }
function buildGallery(){
  const g=$('#gal'); g.innerHTML='';
  gList=GALLERY.filter(x=>gf==='all'||x.ch===gf||x.type===gf);
  gList.forEach((x,i)=>{ const f=document.createElement('figure'); f.className='gi tilt reveal '+x.type;
    f.innerHTML=`<img src="assets/img/t_${x.id}.webp" alt="${gName(x)}" loading="lazy" width="600" height="${Math.round(600/x.ar)}"><figcaption><small>${x.ch==='gonar'?'GONAR FORCE':'PARANORMA'} / ${x.type.toUpperCase()}</small>${gName(x)}</figcaption>`;
    f.tabIndex=0; f.onclick=()=>openLb(i); f.onkeydown=e=>{if(e.key==='Enter')openLb(i)}; g.append(f); });
  bindTilt(); observe();
}
let lbI=0; const lb=$('#lb');
function showLb(){ const x=gList[lbI]; $('#lbImg').src='assets/img/'+x.id+'.webp'; $('#lbCap').textContent=gName(x); }
function openLb(i){ lbI=i; showLb(); lb.hidden=false; document.body.style.overflow='hidden'; blip(700,.08); }
function closeLb(){ lb.hidden=true; document.body.style.overflow=''; }
$('#lbClose').onclick=closeLb; lb.addEventListener('click',e=>{if(e.target===lb)closeLb()});
$('#lbPrev').onclick=()=>{lbI=(lbI-1+gList.length)%gList.length;showLb();blip(600,.04)};
$('#lbNext').onclick=()=>{lbI=(lbI+1)%gList.length;showLb();blip(600,.04)};
addEventListener('keydown',e=>{ if(lb.hidden)return; if(e.key==='Escape')closeLb(); if(e.key==='ArrowLeft')$('#lbPrev').click(); if(e.key==='ArrowRight')$('#lbNext').click(); });

/* ---------- nav ---------- */
$('#burger').onclick=()=>$('#nav').classList.toggle('open');
$$('#nav a').forEach(a=>a.addEventListener('click',()=>{$('#nav').classList.remove('open');blip(500,.05);glitchScreen()}));
const secs=$$('main section'); const navA=$$('#nav a');
new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting)navA.forEach(a=>a.classList.toggle('act',a.getAttribute('href')==='#'+e.target.id))}),{rootMargin:'-45% 0px -50% 0px'}).observe&&secs.forEach(s=>new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting)navA.forEach(a=>a.classList.toggle('act',a.getAttribute('href')==='#'+e.target.id))}),{rootMargin:'-45% 0px -50% 0px'}).observe(s));

/* ---------- form -> mailto ---------- */
$('#form').addEventListener('submit',e=>{e.preventDefault();const f=new FormData(e.target);
  location.href='mailto:gonar777@gmail.com?subject='+encodeURIComponent('Заказ с сайта — '+f.get('name'))+'&body='+encodeURIComponent(f.get('msg'));});

/* ---------- telemetry ---------- */
let frames=0,last=performance.now(),fps=60;
function tele(){ const h=document.documentElement; const p=Math.round(scrollY/Math.max(1,h.scrollHeight-innerHeight)*100); $('#tScroll').textContent=String(p).padStart(3,'0'); $('#tBar').style.width=p+'%'; }
addEventListener('scroll',tele,{passive:true});


/* ---------- Three.js space ---------- */
function space(){
  if(typeof THREE==='undefined'){ return; }
  const cv=$('#space'); const R=new THREE.WebGLRenderer({canvas:cv,antialias:false,alpha:false,powerPreference:'low-power'});
  R.setPixelRatio(Math.min(devicePixelRatio,1.5)); R.setClearColor(0x030611,1);
  const sc=new THREE.Scene(); sc.fog=new THREE.FogExp2(0x030611,.012);
  const cam=new THREE.PerspectiveCamera(60,1,.1,400); cam.position.z=30;
  // stars
  const N=reduce?900:2600, pos=new Float32Array(N*3), col=new Float32Array(N*3);
  for(let i=0;i<N;i++){pos[i*3]=(Math.random()-.5)*260;pos[i*3+1]=(Math.random()-.5)*260;pos[i*3+2]=-Math.random()*320+40;
    const c=new THREE.Color().setHSL([.52,.55,.78,.85][Math.random()*4|0],.8,.55+Math.random()*.35);col.set([c.r,c.g,c.b],i*3);}
  const sg=new THREE.BufferGeometry();sg.setAttribute('position',new THREE.BufferAttribute(pos,3));sg.setAttribute('color',new THREE.BufferAttribute(col,3));
  const stars=new THREE.Points(sg,new THREE.PointsMaterial({size:.7,vertexColors:true,transparent:true,opacity:.9,depthWrite:false,blending:THREE.AdditiveBlending,sizeAttenuation:true}));
  sc.add(stars);
  // nebulae sprites
  function neb(c1,c2){const k=document.createElement('canvas');k.width=k.height=256;const x=k.getContext('2d');const g=x.createRadialGradient(128,128,0,128,128,128);g.addColorStop(0,c1);g.addColorStop(.5,c2);g.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=g;x.fillRect(0,0,256,256);return new THREE.CanvasTexture(k)}
  const nebs=[[ 'rgba(122,60,255,.55)','rgba(60,20,160,.2)',-60,25,-120,160],['rgba(34,230,255,.35)','rgba(10,80,140,.15)',70,-30,-150,170],['rgba(192,64,255,.4)','rgba(90,20,120,.15)',10,-55,-100,120]];
  nebs.forEach(n=>{const s=new THREE.Sprite(new THREE.SpriteMaterial({map:neb(n[0],n[1]),transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,opacity:.8}));s.position.set(n[2],n[3],n[4]);s.scale.set(n[5],n[5],1);sc.add(s)});
  // hologram
  const holo=new THREE.Group(); holo.position.set(0,2,0);
  const wm=c=>new THREE.MeshBasicMaterial({color:c,wireframe:true,transparent:true,opacity:.35,blending:THREE.AdditiveBlending,depthWrite:false});
  const ico=new THREE.Mesh(new THREE.IcosahedronGeometry(9,2),wm(0x22e6ff)); holo.add(ico);
  const ico2=new THREE.Mesh(new THREE.OctahedronGeometry(13,1),wm(0xc040ff)); holo.add(ico2);
  const rings=[0,1,2].map(i=>{const r=new THREE.Mesh(new THREE.TorusGeometry(15+i*3,.05,6,90),new THREE.MeshBasicMaterial({color:i==1?0xc040ff:0x22e6ff,transparent:true,opacity:.7,blending:THREE.AdditiveBlending}));r.rotation.x=Math.PI/2+(i-1)*.35;holo.add(r);return r});
  const grid=new THREE.GridHelper(120,40,0x7a3cff,0x1a2a6a);grid.position.y=-16;grid.material.transparent=true;grid.material.opacity=.45;holo.add(grid);
  sc.add(holo);
  function size(){const w=innerWidth,h=innerHeight;R.setSize(w,h,false);cam.aspect=w/h;cam.updateProjectionMatrix();holo.scale.setScalar(w<900?.62:1)}
  size(); addEventListener('resize',size);
  let run=true; document.addEventListener('visibilitychange',()=>{run=!document.hidden; if(run)loop()});
  let sy=0,t0=performance.now();
  function loop(){
    if(!run)return; requestAnimationFrame(loop);
    const now=performance.now(),dt=(now-t0)/1000;t0=now; const t=now/1000;
    frames++; if(now-last>1000){fps=frames;frames=0;last=now;$('#tFps').textContent=fps}
    sy+=(scrollY-sy)*.08; const hv=Math.min(1,sy/innerHeight);
    cam.position.x+=(nx*6-cam.position.x)*.04; cam.position.y+=(-ny*4-sy*.004-cam.position.y)*.04; cam.position.z=30-sy*.012;
    cam.lookAt(0,-sy*.004,0);
    if(!reduce){ ico.rotation.y=t*.25;ico.rotation.x=t*.12;ico2.rotation.y=-t*.18;ico2.rotation.z=t*.1;
      rings.forEach((r,i)=>r.rotation.z=t*(.3+i*.15)*(i%2?-1:1)); stars.rotation.z=t*.004; stars.position.z=(t*1.5)%40; }
    holo.visible=hv<.98; holo.position.y=2+hv*14+Math.sin(t)*.5;
    ico.material.opacity=.35*(1-hv);ico2.material.opacity=.3*(1-hv);
    // glitch pulse on hologram
    holo.position.x=(Math.sin(t*37)>.995)?(Math.random()-.5)*2:0;
    R.render(sc,cam);
  }
  loop();
}

/* ---------- init ---------- */
$('#cntWorks').dataset.count=PROJECTS.length; buildSkills(); applyLang(); observe(); tele();
try{space()}catch(e){console.warn('webgl off',e)}
if(location.hash&&projById[location.hash.slice(1)]) setTimeout(()=>openModal(location.hash.slice(1)),1500);
// reel autoload poster-only; lazy video on demand
})();
