import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';

const el = {
  game: document.getElementById('game'),
  chapterTitle: document.getElementById('chapterTitle'),
  objective: document.getElementById('objective'),
  prompt: document.getElementById('prompt'),
  dialogue: document.getElementById('dialogue'),
  speaker: document.getElementById('speaker'),
  line: document.getElementById('line'),
  choices: document.getElementById('choices'),
  nextLine: document.getElementById('nextLine'),
  minigame: document.getElementById('minigame'),
  galleryBtn: document.getElementById('galleryBtn'),
  gallery: document.getElementById('gallery'),
  sketches: document.getElementById('sketches'),
  closeGallery: document.getElementById('closeGallery'),
  joystick: document.getElementById('joystick'),
  stick: document.getElementById('stick'),
  mobileInteract: document.getElementById('mobileInteract')
};

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
el.game.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0xd8c7b3, 25, 140);
const camera = new THREE.PerspectiveCamera(65, innerWidth / innerHeight, 0.1, 400);
camera.position.set(0, 6, 10);

const hemi = new THREE.HemisphereLight(0xffe5bf, 0x4d4e67, 0.8);
scene.add(hemi);
const sun = new THREE.DirectionalLight(0xffd08a, 1.2);
sun.position.set(12, 20, 4);
scene.add(sun);

const sky = new THREE.Mesh(new THREE.SphereGeometry(260, 24, 12), new THREE.MeshBasicMaterial({ side: THREE.BackSide, color: 0xf0c89d }));
scene.add(sky);

const ground = new THREE.Mesh(new THREE.PlaneGeometry(220, 220), new THREE.MeshStandardMaterial({ color: 0x8f7f70, roughness: 1 }));
ground.rotation.x = -Math.PI / 2;
scene.add(ground);

function box(w,h,d,c,x,y,z){
  const m = new THREE.Mesh(new THREE.BoxGeometry(w,h,d), new THREE.MeshStandardMaterial({ color: c, roughness: .9 }));
  m.position.set(x,y,z); scene.add(m); return m;
}

// Slum map + landmarks
const home = box(4,2.2,4,0x7f7268,-8,1.1,20);
const bath = box(8,2.5,4,0xa8b1b8,-20,1.25,4);
const school = box(9,3,6,0x928779,22,1.5,0);
const shop = box(8,2.8,4,0x8a735f,12,1.4,18);
const rooftopHome = box(6,5,6,0x6e6b82,-26,2.5,24);
const smelter = box(7,3,7,0x7a4f3f,15,1.5,-18);
const factory = box(10,3.5,8,0x656b73,-10,1.75,-20);
const farms = box(10,2,8,0x6e7c62,-28,1,-12);

// great wall + uppercity
const wall = box(120,10,3,0x50505f,0,5,-40);
const uppercity = new THREE.Group();
scene.add(uppercity);
for(let i=0;i<40;i++){
  const h=THREE.MathUtils.randFloat(8,22);
  const b= new THREE.Mesh(new THREE.BoxGeometry(2.2,h,2.2), new THREE.MeshStandardMaterial({ color: new THREE.Color().setHSL(0.58+Math.random()*0.08,0.35,0.62), emissive: 0x112244, emissiveIntensity: .4 }));
  b.position.set(-50+Math.random()*100,h/2,-65-Math.random()*30);
  uppercity.add(b);
}
const spire = new THREE.Mesh(new THREE.CylinderGeometry(1,2.5,35,16), new THREE.MeshStandardMaterial({ color: 0x89c7ff, emissive: 0x33aaff, emissiveIntensity: .8 }));
spire.position.set(0,17,-78); uppercity.add(spire);

// 30+ NPCs
const npcs=[];
for(let i=0;i<36;i++){
  const n = new THREE.Mesh(new THREE.CapsuleGeometry(0.35,1.0,4,8), new THREE.MeshStandardMaterial({ color: new THREE.Color().setHSL(Math.random(),0.35,0.55) }));
  n.position.set(-30+Math.random()*60,1,-28+Math.random()*56);
  n.userData={phase:Math.random()*Math.PI*2,speed:.3+Math.random()*.4,base:n.position.clone()};
  scene.add(n); npcs.push(n);
}

const lira = new THREE.Group();
const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.45,1.1,4,8), new THREE.MeshStandardMaterial({ color: 0x8b92c3 }));
const head = new THREE.Mesh(new THREE.SphereGeometry(0.35,14,12), new THREE.MeshStandardMaterial({ color: 0x6a4335 }));
head.position.y=1.1;
lira.add(body,head); lira.position.set(-8,1,22); scene.add(lira);

const interactables=[];
function makeInteract(name, pos, radius, onInteract){ interactables.push({name,pos,radius,onInteract}); }

const state = {
  chapter: 0,
  objective: '',
  busy: false,
  sketches: new Set(),
  keys: {},
  mobileAxis: new THREE.Vector2(),
  canInteract: null,
  playedCrash: false,
  camYaw: 0,
  camPitch: .3,
};

const chapters = [
  { title:'Chapter 1: Morning Light', objective:'Open the window and prepare for the day.', start(){
      lira.position.set(-8,1,22);
      setPalette(0xf1c590,0xffdfa8,0x4e5f78);
      clearInteractables();
      makeInteract('Window (E)', new THREE.Vector3(-6.5,1.5,18.3), 2.3, ()=>{
        say('Lira','Soft light spills in. The slum wakes in warm sounds.', [{t:'Beautiful morning.'}]);
        state.windowOpened=true; addSketch('Ch1 Sketch: Family dawn in one tiny room.');
      });
      makeInteract('Wilting flower', new THREE.Vector3(-9,1.2,20.8), 1.5, ()=>say('Lira','I gave it water. Hold on, little bloom.'));
      makeInteract('Family drawing', new THREE.Vector3(-7.4,1.2,21.8), 1.6, ()=>say('Lira','Mom drew this with coal and chalk.'));
      makeInteract('Toothbrush & towel', new THREE.Vector3(-8.8,1.1,19.5), 1.5, ()=>{ if(state.windowOpened){nextChapter();} else say('Lira','I should open the window first.'); });
    }, tick(){ if(!state.windowOpened) setObjective('Open the window.'); else setObjective('Take toothbrush & towel.'); }},
  { title:'Chapter 2: Wash & Ready', objective:'Visit the public baths.', start(){
      setPalette(0xe7cf9e,0xffefc8,0x5f6780); clearInteractables(); lira.position.set(-12,1,14);
      makeInteract('Neighbor in line', new THREE.Vector3(-21,1,5),2,()=>say('Neighbor','Uppercity says rain in three days. They always know first.'));
      makeInteract('Stray cat', new THREE.Vector3(-18.5,1,3),1.8,()=>say('Lira','Soft fur, sharp bones. It purrs anyway.'));
      makeInteract('Crack in wall view', new THREE.Vector3(-24,1,-1),2.3,()=>say('Lira','Nova Meridian looks so close from here.'));
      makeInteract('Bath curtain', new THREE.Vector3(-20,1,4),2,()=>say('Narration','Water runs. Lira hums quietly behind the curtain.'));
      makeInteract('Communal sink', new THREE.Vector3(-16,1,4),2,()=>{ addSketch('Ch2 Sketch: Reflections in scratched steel sink.'); nextChapter(); });
    }, tick(){ setObjective('Queue, wash, brush teeth, then return home.'); }},
  { title:'Chapter 3: Packed with Love', objective:'Walk to school through the slum.', start(){
      setPalette(0xeecf96,0xffefcc,0x5d708a); clearInteractables(); lira.position.set(-8,1,20);
      makeInteract('Mother', new THREE.Vector3(-8,1,21),2,()=>say('Mother','Rice, vegetables, dried fish. Eat with friends, okay?'));
      makeInteract('Dropped fruit', new THREE.Vector3(0,1,11),2,()=>{ say('Vendor','Thanks, Lira! Take one sweet pear.'); state.helpedVendor=true; });
      makeInteract('Memory sketch', new THREE.Vector3(4,1,6),1.6,()=>addSketch('Ch3 Sketch: Morning market lanes and laundry lines.'));
      makeInteract('School gate', new THREE.Vector3(21,1,4),2.5,()=>nextChapter());
    }, tick(){ setObjective('Head to school. (Optional: help vendor, collect sketch)'); }},
  { title:'Chapter 4: Lessons & Laughter', objective:'Attend class and finish the drawing activity.', start(){
      setPalette(0xe2c88e,0xf9e9c2,0x6a7890); clearInteractables(); lira.position.set(19,1,1);
      makeInteract('Teacher Pako', new THREE.Vector3(22,1,0),2.4,()=>say('Mr. Pako','Earth history: very long, very dramatic, occasionally snack-sized!'));
      makeInteract('Senna drawing game', new THREE.Vector3(24,1,1.5),2.4,runDrawingGame);
      makeInteract('Lunch circle', new THREE.Vector3(20,1,5),2.4,()=>say('Tombi','I shared bread. You shared fish. Friendship cuisine!'));
      makeInteract('Class sketch', new THREE.Vector3(17,1,0),2,()=>addSketch('Ch4 Sketch: Alien doodles and laughing friends.'));
    }, tick(){ setObjective(state.didDraw ? 'Share lunch and leave for father\'s shop.' : 'Talk to Senna to draw aliens.'); if(state.didDraw&&dist(lira.position,shop.position)<8) nextChapter(); }},
  { title:'Chapter 5: The Little Shop', objective:'Help father organize alien toys.', start(){
      setPalette(0xd89f5e,0xf6c782,0x694a3a); clearInteractables(); lira.position.set(12,1,15);
      makeInteract('Father', new THREE.Vector3(12,1,18),2,()=>say('Father','Curiosities keep us going, little star.'));
      makeInteract('Open shipment boxes', new THREE.Vector3(14,1,18),2,runSortGame);
      makeInteract('Find customer item', new THREE.Vector3(10,1,18),2,()=>say('Customer','A charger coil? Ah! There it is—thank you.'));
      makeInteract('Shop sketch', new THREE.Vector3(13,1,20),2,()=>addSketch('Ch5 Sketch: Plastic aliens on rusty shelves.'));
    }, tick(){ setObjective(state.sortedToys ? 'Tasks done. Visit Mira at sunset.' : 'Open and sort alien toy shipment.'); if(state.sortedToys&&dist(lira.position,rooftopHome.position)<8) nextChapter(); }},
  { title:'Chapter 6: Sunset Between Us', objective:'Talk with Mira on the rooftop.', start(){
      setPalette(0xd57b63,0xffb08f,0x4d4f8a); clearInteractables(); lira.position.set(-24,1,18);
      makeInteract('Mira', new THREE.Vector3(-26,5.5,24),2.5,()=>runMiraDialogue());
      makeInteract('Cracked telescope', new THREE.Vector3(-24,5.5,23),2,()=>say('Mira','Look—pods and drones around the central spire.'));
      makeInteract('Final sketch', new THREE.Vector3(-28,5.5,23),2,()=>addSketch('Ch6 Sketch: Two friends watching sunset.'));
    }, tick(){ setObjective(state.miraDone ? 'Stay a little longer... then look up.' : 'Climb up and talk with Mira.'); if(state.miraDone) nextChapter(); }},
  { title:'Chapter 7: When Stars Fell', objective:'Witness the sky.', start(){
      setPalette(0x20325a,0x5b6ea1,0x101326); clearInteractables(); lira.position.set(-25,5.5,24);
      startCrash();
    }, tick(){ setObjective('A strange light descends toward Nova Meridian...'); }}
];

function clearInteractables(){ interactables.length=0; }
function setObjective(t){ state.objective=t; el.objective.textContent=t; }
function addSketch(text){
  if(!state.sketches.has(text)){
    state.sketches.add(text);
    say('Memory Sketch','Collected: '+text);
    renderSketches();
  }
}
function renderSketches(){
  el.sketches.innerHTML='';
  [...state.sketches].forEach(s=>{const d=document.createElement('div');d.className='sketch';d.textContent=s;el.sketches.appendChild(d);});
}

let queue=[];
function say(speaker, line, choices){
  queue = [{speaker,line,choices}];
  state.busy = true;
  showLine();
}
function showLine(){
  const q=queue[0]; if(!q){el.dialogue.classList.add('hidden'); state.busy=false; return;}
  el.dialogue.classList.remove('hidden'); el.speaker.textContent=q.speaker; el.line.textContent=q.line;
  el.choices.innerHTML='';
  if(q.choices){ q.choices.forEach(c=>{ const b=document.createElement('button'); b.className='choice'; b.textContent=c.t; b.onclick=()=>{ if(c.on) c.on(); queue.shift(); showLine(); }; el.choices.appendChild(b); }); }
}
el.nextLine.onclick=()=>{ queue.shift(); showLine(); };

function runDrawingGame(){
  state.busy=true;
  el.minigame.classList.remove('hidden');
  el.minigame.innerHTML=`<h3>Alien Drawing Mini-Game</h3><p>Draw your alien idea:</p><textarea id="drawInput" rows="4" placeholder="Big eyes, floating fins, glowing stripes..."></textarea><button id="doneDraw">Show friends</button>`;
  document.getElementById('doneDraw').onclick=()=>{
    const t=document.getElementById('drawInput').value||'A mysterious noodle-shaped alien.';
    el.minigame.classList.add('hidden'); state.didDraw=true; state.busy=false;
    say('Kel',`Whoa! "${t}" would totally invade with style.`);
  };
}
function runSortGame(){
  state.busy=true;
  el.minigame.classList.remove('hidden');
  el.minigame.innerHTML=`<h3>Toy Shelf Organizer</h3><p>Sort the shipment:</p>
  <label><input type="checkbox" id="c1"> Cute blue aliens on left shelf</label><br>
  <label><input type="checkbox" id="c2"> Rare crimson figurine on top rack</label><br>
  <label><input type="checkbox" id="c3"> Discount bin toys near register</label><br>
  <button id="doneSort">Finish</button>`;
  document.getElementById('doneSort').onclick=()=>{
    if(['c1','c2','c3'].every(id=>document.getElementById(id).checked)){
      state.sortedToys=true; el.minigame.classList.add('hidden'); state.busy=false;
      say('Father','Perfect arrangement. This one rare piece might sell today!');
    } else say('Father','Not yet—check each shelf placement.');
  };
}
function runMiraDialogue(){
  say('Mira','I wish we went to the same school every day.',[
    {t:'Me too. I saved you stories from class.'},
    {t:'One day, we’ll build our own school on this roof.'},
    {t:'I drew aliens today. They looked ridiculous.'}
  ]);
  state.miraDone=true;
}

function startCrash(){
  if(state.playedCrash) return;
  state.playedCrash=true;
  const ship = new THREE.Mesh(new THREE.IcosahedronGeometry(1.4,1), new THREE.MeshStandardMaterial({ color: 0x66ffcc, emissive: 0x22ffcc, emissiveIntensity: 1.2 }));
  ship.position.set(35,34,-20); scene.add(ship);
  let t=0;
  const trail=[];
  const timer=setInterval(()=>{
    t+=0.02;
    ship.position.lerp(new THREE.Vector3(0,20,-70),0.03);
    ship.rotation.x += .2; ship.rotation.y += .15;
    const p = new THREE.Mesh(new THREE.SphereGeometry(0.13,6,6), new THREE.MeshBasicMaterial({ color: 0x66ffee }));
    p.position.copy(ship.position); scene.add(p); trail.push(p);
    if(trail.length>120){ const old=trail.shift(); scene.remove(old); }
    if(ship.position.distanceTo(new THREE.Vector3(0,20,-70))<4){
      clearInterval(timer);
      scene.remove(ship);
      const boom = new THREE.Mesh(new THREE.SphereGeometry(1,14,14), new THREE.MeshBasicMaterial({ color: 0x88fffd }));
      boom.position.set(0,20,-70); scene.add(boom);
      let b=1;
      const bt=setInterval(()=>{
        b+=2; boom.scale.setScalar(b); boom.material.opacity=1-b/30; boom.material.transparent=true;
        camera.position.x += (Math.random()-0.5)*0.3; camera.position.y += (Math.random()-0.5)*0.2;
        if(b>28){ clearInterval(bt); scene.remove(boom); titleCard(); }
      },30);
    }
  },30);
}
function titleCard(){
  say('TITLE','WHEN STARS FELL\nChapter 1 Complete — To Be Continued...');
}

function setPalette(skyColor,sunColor,fogColor){
  sky.material.color.setHex(skyColor); sun.color.setHex(sunColor); scene.fog.color.setHex(fogColor);
}
function nextChapter(){
  state.chapter = Math.min(state.chapter + 1, chapters.length-1);
  startChapter(state.chapter);
}
function startChapter(i){
  const ch = chapters[i];
  el.chapterTitle.textContent=ch.title;
  ch.start();
}

// Input
addEventListener('keydown', e=>state.keys[e.key.toLowerCase()]=true);
addEventListener('keyup', e=>state.keys[e.key.toLowerCase()]=false);

let mouseLookActive = false;
let lastMouseX = null;
let lastMouseY = null;
renderer.domElement.addEventListener('mousedown', (e)=>{
  if (e.button === 0) {
    mouseLookActive = true;
    lastMouseX = e.clientX;
    lastMouseY = e.clientY;
  }
});
addEventListener('mouseup', ()=>{
  mouseLookActive = false;
  lastMouseX = null;
  lastMouseY = null;
});
addEventListener('mousemove', (e)=>{
  if (!mouseLookActive) return;
  if (lastMouseX === null || lastMouseY === null) {
    lastMouseX = e.clientX;
    lastMouseY = e.clientY;
    return;
  }
  const dx = e.clientX - lastMouseX;
  const dy = e.clientY - lastMouseY;
  lastMouseX = e.clientX;
  lastMouseY = e.clientY;
  state.camYaw -= dx * 0.003;
  state.camPitch = THREE.MathUtils.clamp(state.camPitch - dy * 0.002, -0.2, 0.9);
});

addEventListener('resize', ()=>{ camera.aspect=innerWidth/innerHeight; camera.updateProjectionMatrix(); renderer.setSize(innerWidth,innerHeight); });

function setupMobile(){
  let dragging=false;
  const center={x:60,y:60};
  const onMove=(cx,cy)=>{
    const r = el.joystick.getBoundingClientRect();
    let dx = cx-r.left-center.x, dy = cy-r.top-center.y;
    const len=Math.hypot(dx,dy); if(len>44){ dx=dx/len*44; dy=dy/len*44; }
    el.stick.style.left = `${32+dx}px`; el.stick.style.top = `${32+dy}px`;
    state.mobileAxis.set(dx/44,-dy/44);
  };
  el.joystick.addEventListener('touchstart',e=>{dragging=true;onMove(e.touches[0].clientX,e.touches[0].clientY);});
  el.joystick.addEventListener('touchmove',e=>{if(dragging) onMove(e.touches[0].clientX,e.touches[0].clientY);});
  el.joystick.addEventListener('touchend',()=>{dragging=false;state.mobileAxis.set(0,0);el.stick.style.left='32px';el.stick.style.top='32px';});
  el.mobileInteract.onclick=()=>doInteract();
}
setupMobile();

function dist(a,b){ return a.distanceTo(b); }
function doInteract(){ if(state.canInteract && !state.busy) state.canInteract.onInteract(); }
addEventListener('keydown', e=>{ if(e.key.toLowerCase()==='e') doInteract(); });
addEventListener('click', ()=>{ if(!state.busy && state.canInteract) doInteract(); });
el.galleryBtn.onclick=()=>el.gallery.classList.toggle('hidden');
el.closeGallery.onclick=()=>el.gallery.classList.add('hidden');

const clock = new THREE.Clock();
function animate(){
  requestAnimationFrame(animate);
  const dt = Math.min(clock.getDelta(), 0.05);

  if(!state.busy){
    const forward = (state.keys['w']||state.keys['arrowup']?1:0) - (state.keys['s']||state.keys['arrowdown']?1:0) + state.mobileAxis.y;
    const strafe = (state.keys['d']||state.keys['arrowright']?1:0) - (state.keys['a']||state.keys['arrowleft']?1:0) + state.mobileAxis.x;
    const dir = new THREE.Vector3(strafe,0,forward);
    if(dir.lengthSq()>0.001){
      dir.normalize().applyAxisAngle(new THREE.Vector3(0,1,0), state.camYaw);
      lira.position.addScaledVector(dir, dt*4.2);
      lira.lookAt(lira.position.clone().add(dir));
    } else {
      lira.rotation.y += Math.sin(performance.now()*0.003)*0.002;
    }
  }

  npcs.forEach((n,i)=>{
    const u=n.userData;
    n.position.x = u.base.x + Math.sin(performance.now()*0.0004*u.speed + u.phase)*(2+i%3);
    n.position.z = u.base.z + Math.cos(performance.now()*0.0005*u.speed + u.phase)*(2+i%2);
  });
  spire.material.emissiveIntensity = 0.7 + Math.sin(performance.now()*0.002)*0.35;

  state.canInteract = null;
  let best=1e9;
  for(const it of interactables){
    const d = dist(lira.position,it.pos);
    if(d<it.radius && d<best){ best=d; state.canInteract = it; }
  }
  el.prompt.textContent = state.canInteract ? `Interact: ${state.canInteract.name}` : '';

  const cOff = new THREE.Vector3(Math.sin(state.camYaw)*7,4+state.camPitch*2,Math.cos(state.camYaw)*7);
  camera.position.lerp(lira.position.clone().add(cOff),0.08);
  camera.lookAt(lira.position.x,lira.position.y+1.2,lira.position.z);

  const ch = chapters[state.chapter];
  ch.tick?.();

  renderer.render(scene,camera);
}

startChapter(0);
animate();
