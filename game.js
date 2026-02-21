import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.164.1/build/three.module.js';

const canvas = document.querySelector('#game-canvas');
const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0xffdeb5, 30, 260);
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.toneMappingExposure = 1.0;

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 800);
camera.position.set(0, 8, 14);

const world = new THREE.Group();
scene.add(world);

const sky = new THREE.Mesh(
  new THREE.SphereGeometry(350, 32, 16),
  new THREE.MeshBasicMaterial({ color: 0xffd7b7, side: THREE.BackSide })
);
scene.add(sky);

const hemi = new THREE.HemisphereLight(0xfff4d6, 0x334455, 0.9);
scene.add(hemi);
const sun = new THREE.DirectionalLight(0xffe3bc, 1.4);
sun.position.set(60, 80, 20);
sun.castShadow = true;
scene.add(sun);

const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(300, 220),
  new THREE.MeshStandardMaterial({ color: 0x8f7a67, roughness: 1 })
);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
world.add(ground);

const wall = new THREE.Mesh(
  new THREE.BoxGeometry(220, 22, 4),
  new THREE.MeshStandardMaterial({ color: 0x726f83 })
);
wall.position.set(0, 11, -82);
world.add(wall);

const upperCity = new THREE.Group();
for (let i = 0; i < 40; i++) {
  const h = 10 + Math.random() * 40;
  const tower = new THREE.Mesh(
    new THREE.BoxGeometry(4 + Math.random() * 6, h, 4 + Math.random() * 6),
    new THREE.MeshStandardMaterial({ color: new THREE.Color().setHSL(0.56 + Math.random() * .08, .4, .6), emissive: 0x223355, emissiveIntensity: .35 })
  );
  tower.position.set(-90 + Math.random() * 180, h / 2, -120 - Math.random() * 60);
  upperCity.add(tower);
}
const spire = new THREE.Mesh(new THREE.CylinderGeometry(1.8, 5, 80, 14), new THREE.MeshStandardMaterial({ color: 0x87d1ff, emissive: 0x3ca9ff, emissiveIntensity: 0.8 }));
spire.position.set(0, 40, -145);
upperCity.add(spire);
world.add(upperCity);

const regionAnchors = {
  home: new THREE.Vector3(-30, 0, 35),
  bath: new THREE.Vector3(-46, 0, 2),
  school: new THREE.Vector3(20, 0, 8),
  shop: new THREE.Vector3(40, 0, 30),
  rooftop: new THREE.Vector3(-3, 0, 46),
  smelter: new THREE.Vector3(42, 0, -18),
  market: new THREE.Vector3(8, 0, 30),
};

function shack(x, z, color = 0x8c7b6a) {
  const g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.BoxGeometry(8, 5, 8), new THREE.MeshStandardMaterial({ color, roughness: .95 }));
  body.position.y = 2.5;
  const roof = new THREE.Mesh(new THREE.ConeGeometry(6, 3, 4), new THREE.MeshStandardMaterial({ color: 0x6a5a49 }));
  roof.position.y = 6.3;
  roof.rotation.y = Math.PI / 4;
  g.add(body, roof);
  g.position.set(x, 0, z);
  return g;
}
for (let i = 0; i < 28; i++) world.add(shack(-62 + (i % 7) * 18, -10 + Math.floor(i / 7) * 18, i % 3 ? 0x8f7b67 : 0x7c8d8f));

const lira = new THREE.Group();
const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.7, 2.1, 4, 10), new THREE.MeshStandardMaterial({ color: 0xd8ae82 }));
body.position.y = 2.1;
const backpack = new THREE.Mesh(new THREE.BoxGeometry(0.8, 1, .4), new THREE.MeshStandardMaterial({ color: 0x4f6679 }));
backpack.position.set(0, 2.4, -0.6);
const head = new THREE.Mesh(new THREE.SphereGeometry(0.68, 16, 16), new THREE.MeshStandardMaterial({ color: 0xc88f66 }));
head.position.y = 3.6;
lira.add(body, backpack, head);
lira.position.copy(regionAnchors.home).add(new THREE.Vector3(0, 0, 2));
lira.castShadow = true;
world.add(lira);

const npcs = [];
const npcGroup = new THREE.Group();
for (let i = 0; i < 34; i++) {
  const npc = new THREE.Mesh(new THREE.CapsuleGeometry(0.45, 1.5, 4, 8), new THREE.MeshStandardMaterial({ color: new THREE.Color().setHSL(0.03 + Math.random() * 0.4, 0.4, 0.55) }));
  npc.position.set(-70 + Math.random() * 140, 1.2, -20 + Math.random() * 80);
  npc.userData.base = npc.position.clone();
  npc.userData.speed = 0.3 + Math.random() * 0.45;
  npcGroup.add(npc);
  npcs.push(npc);
}
world.add(npcGroup);

const interactables = [];
function addInteractable(id, label, position, radius = 4) {
  interactables.push({ id, label, position, radius });
}
addInteractable('window', 'Open window', regionAnchors.home.clone().add(new THREE.Vector3(1, 0, -1)));
addInteractable('flower', 'Water flower', regionAnchors.home.clone().add(new THREE.Vector3(-1, 0, -1)));
addInteractable('photo', 'Look at family drawing', regionAnchors.home.clone().add(new THREE.Vector3(2, 0, 1)));
addInteractable('bathLine', 'Join bathing queue', regionAnchors.bath.clone());
addInteractable('cat', 'Pet stray cat', regionAnchors.bath.clone().add(new THREE.Vector3(3, 0, 2)));
addInteractable('crack', 'Look through wall crack', regionAnchors.bath.clone().add(new THREE.Vector3(4, 0, -2)));
addInteractable('mother', 'Speak with mother', regionAnchors.home.clone().add(new THREE.Vector3(-2, 0, 2)));
addInteractable('vendor', 'Help vendor with fruit', regionAnchors.market.clone());
addInteractable('sketchC3', 'Collect Memory Sketch', regionAnchors.market.clone().add(new THREE.Vector3(-3, 0, 3)));
addInteractable('teacher', 'Join class', regionAnchors.school.clone());
addInteractable('draw', 'Alien drawing mini-game', regionAnchors.school.clone().add(new THREE.Vector3(2, 0, 2)));
addInteractable('lunch', 'Share lunch', regionAnchors.school.clone().add(new THREE.Vector3(-2, 0, -1)));
addInteractable('sketchC4', 'Collect Memory Sketch', regionAnchors.school.clone().add(new THREE.Vector3(-4, 0, 2)));
addInteractable('father', 'Talk to father', regionAnchors.shop.clone());
addInteractable('toys', 'Organize toy shipment', regionAnchors.shop.clone().add(new THREE.Vector3(2, 0, 2)));
addInteractable('customer', 'Help customer find item', regionAnchors.shop.clone().add(new THREE.Vector3(-2, 0, 1)));
addInteractable('sketchC5', 'Collect Memory Sketch', regionAnchors.shop.clone().add(new THREE.Vector3(0, 0, -3)));
addInteractable('mira', 'Talk with Mira', regionAnchors.rooftop.clone());
addInteractable('telescope', 'Use cracked telescope', regionAnchors.rooftop.clone().add(new THREE.Vector3(2, 0, -2)));
addInteractable('sketchC6', 'Collect Memory Sketch', regionAnchors.rooftop.clone().add(new THREE.Vector3(-2, 0, -1)));

const keys = new Set();
const moveTouch = new Set();
window.addEventListener('keydown', (e) => keys.add(e.key.toLowerCase()));
window.addEventListener('keyup', (e) => keys.delete(e.key.toLowerCase()));

const ui = {
  chapter: document.querySelector('#chapter-card'),
  objective: document.querySelector('#objective'),
  prompt: document.querySelector('#interact-prompt'),
  nextBtn: document.querySelector('#next-btn'),
  dialogue: document.querySelector('#dialogue'),
  speaker: document.querySelector('#speaker'),
  line: document.querySelector('#line'),
  choices: document.querySelector('#choices'),
  dialogueNext: document.querySelector('#dialogue-next'),
  minigame: document.querySelector('#minigame'),
  miniTitle: document.querySelector('#minigame-title'),
  miniText: document.querySelector('#minigame-text'),
  miniContent: document.querySelector('#minigame-content'),
  miniClose: document.querySelector('#minigame-close'),
  gallery: document.querySelector('#gallery'),
  galleryBtn: document.querySelector('#gallery-btn'),
  sketchList: document.querySelector('#sketch-list'),
  galleryClose: document.querySelector('#gallery-close'),
};

const chapters = [
  { title: 'Chapter 1: Morning Light', objective: 'Open the window to start the day.', required: ['window'], time: 0.1, anchor: 'home' },
  { title: 'Chapter 2: Wash & Ready', objective: 'Visit the bathing area and get ready.', required: ['bathLine'], time: 0.18, anchor: 'bath' },
  { title: 'Chapter 3: Packed with Love', objective: 'Talk with mother and head to school life.', required: ['mother', 'sketchC3'], time: 0.25, anchor: 'market' },
  { title: 'Chapter 4: Lessons & Laughter', objective: 'Attend class and complete the drawing mini-game.', required: ['teacher', 'draw', 'sketchC4'], time: 0.36, anchor: 'school' },
  { title: 'Chapter 5: The Little Shop', objective: 'Help father organize alien figurines.', required: ['father', 'toys', 'sketchC5'], time: 0.55, anchor: 'shop' },
  { title: 'Chapter 6: Sunset Between Us', objective: 'Meet Mira on the rooftop at sunset.', required: ['mira', 'telescope', 'sketchC6'], time: 0.72, anchor: 'rooftop' },
  { title: 'Chapter 7: When Stars Fell', objective: 'Witness the sky and the crash.', required: ['crash'], time: 0.9, anchor: 'rooftop' },
];

let chapterIndex = 0;
const completed = new Set();
const memorySketches = [];
let currentInteractable = null;
let activeDialogue = null;
let dialogueIdx = 0;
let inMiniGame = false;
let crashState = 0;

function setChapter() {
  const chap = chapters[chapterIndex];
  ui.chapter.textContent = chap.title;
  ui.objective.textContent = chap.objective;
  ui.nextBtn.hidden = true;
  lira.position.copy(regionAnchors[chap.anchor]).add(new THREE.Vector3(0, 0, 2));
  setLighting(chap.time);
}
setChapter();

function setLighting(t) {
  const c1 = new THREE.Color().setHSL(0.08, .56, 0.74 - t * 0.28);
  const c2 = new THREE.Color().setHSL(0.62, .45, 0.35 + t * 0.2);
  sky.material.color.copy(c1);
  hemi.color.copy(c1);
  hemi.groundColor.copy(c2);
  sun.color.copy(new THREE.Color().setHSL(0.09 + t * 0.22, 0.74, 0.72 - t * 0.2));
  sun.intensity = 1.6 - t * 0.75;
  scene.fog.color.copy(c1);
}

function showDialogue(lines, speaker = 'Lira') {
  activeDialogue = lines;
  dialogueIdx = 0;
  ui.dialogue.classList.remove('hidden');
  ui.speaker.textContent = speaker;
  renderDialogueLine();
}
function renderDialogueLine() {
  if (!activeDialogue) return;
  const entry = activeDialogue[dialogueIdx];
  ui.line.textContent = typeof entry === 'string' ? entry : entry.text;
  ui.choices.innerHTML = '';
  if (typeof entry !== 'string' && entry.choices) {
    entry.choices.forEach((c) => {
      const b = document.createElement('button');
      b.textContent = c;
      b.onclick = () => {
        ui.line.textContent = `You chose: "${c}"`;
        ui.choices.innerHTML = '';
      };
      ui.choices.appendChild(b);
    });
  }
}
ui.dialogueNext.onclick = () => {
  if (!activeDialogue) return;
  dialogueIdx++;
  if (dialogueIdx >= activeDialogue.length) {
    ui.dialogue.classList.add('hidden');
    activeDialogue = null;
    return;
  }
  renderDialogueLine();
};

function openMinigame(title, text, builder) {
  inMiniGame = true;
  ui.minigame.classList.remove('hidden');
  ui.miniTitle.textContent = title;
  ui.miniText.textContent = text;
  ui.miniContent.innerHTML = '';
  builder(ui.miniContent);
}
ui.miniClose.onclick = () => {
  ui.minigame.classList.add('hidden');
  inMiniGame = false;
};

function collectSketch(id, title) {
  if (memorySketches.some((s) => s.id === id)) return;
  memorySketches.push({ id, title, text: `Sketch: ${title}` });
}
function renderGallery() {
  ui.sketchList.innerHTML = '';
  if (!memorySketches.length) {
    ui.sketchList.innerHTML = '<p>No sketches yet.</p>';
    return;
  }
  memorySketches.forEach((s) => {
    const d = document.createElement('div');
    d.className = 'sketch';
    d.innerHTML = `<strong>${s.title}</strong><p>${s.text}</p>`;
    ui.sketchList.appendChild(d);
  });
}
ui.galleryBtn.onclick = () => {
  renderGallery();
  ui.gallery.classList.remove('hidden');
};
ui.galleryClose.onclick = () => ui.gallery.classList.add('hidden');

function handleInteract(id) {
  switch (id) {
    case 'window':
      showDialogue(['Lira opens the wooden shutter. Dawn light pours in with dust motes.', 'The Gray awakens beyond the frame.']);
      break;
    case 'flower':
      showDialogue(['You pour a little water on the wilting flower. Its stem lifts slightly.']);
      break;
    case 'photo':
      showDialogue(['A hand-drawn family portrait: three smiles and one patched blanket.']);
      break;
    case 'bathLine':
      showDialogue(['Neighbor: "Morning, Lira. Heard Nova Meridian launched another floating garden."', 'Lira waits patiently, then washes behind the curtain.']);
      break;
    case 'cat':
      showDialogue(['The stray cat leans into your hand and purrs like a tiny engine.']);
      break;
    case 'crack':
      showDialogue(['Through a wall crack, the Uppercity glows like a distant dream.']);
      break;
    case 'mother':
      showDialogue(['Mother: "Rice, vegetables, and dried fish. Not much, but made with love."', 'She kisses Lira\'s forehead and tightens her backpack strap.']);
      break;
    case 'vendor':
      showDialogue(['You help gather dropped fruit as the vendor thanks you warmly.']);
      break;
    case 'sketchC3':
      collectSketch('c3', 'Market Morning');
      showDialogue(['Memory Sketch collected: a lively market lane with laundry overhead.']);
      break;
    case 'teacher':
      showDialogue([{ text: 'Mr. Pako drops chalk. Again.', choices: ['Laugh softly', 'Help pick up chalk', 'Ask about Earth history'] }, 'Class erupts in giggles while the lesson drifts into wild stories.'], 'Mr. Pako');
      break;
    case 'draw':
      openMinigame('Alien Drawing Mini-Game', 'Doodle your alien idea. Senna and friends react!', (root) => {
        const c = document.createElement('canvas');
        c.id = 'draw-canvas';
        c.width = 480;
        c.height = 220;
        root.appendChild(c);
        const ctx = c.getContext('2d');
        ctx.fillStyle = '#fff';
        ctx.fillRect(0, 0, c.width, c.height);
        let painting = false;
        const draw = (x, y) => {
          ctx.fillStyle = '#443';
          ctx.beginPath();
          ctx.arc(x, y, 3, 0, Math.PI * 2);
          ctx.fill();
        };
        const pos = (e) => {
          const r = c.getBoundingClientRect();
          const p = e.touches ? e.touches[0] : e;
          return [p.clientX - r.left, p.clientY - r.top];
        };
        c.onpointerdown = (e) => { painting = true; const [x, y] = pos(e); draw(x, y); };
        c.onpointermove = (e) => { if (!painting) return; const [x, y] = pos(e); draw(x, y); };
        c.onpointerup = () => { painting = false; };
        const note = document.createElement('p');
        note.textContent = 'Senna: "It looks adorable... and terrifying!"';
        root.appendChild(note);
      });
      break;
    case 'lunch':
      showDialogue([{ text: 'Who gets a share of your lunch?', choices: ['Tombi (always hungry)', 'Senna (forgot spoon)', 'Kel (saving for later)'] }]);
      break;
    case 'sketchC4':
      collectSketch('c4', 'Classroom Doodles');
      showDialogue(['Memory Sketch collected: doodled alien invasion plans.']);
      break;
    case 'father':
      showDialogue(['Father hums while sorting stock.', '"Years ago I saw a strange light. Probably my tired eyes."']);
      break;
    case 'toys':
      openMinigame('Toy Organizing', 'Drag alien figurines into shelf slots.', (root) => {
        const shelf = document.createElement('div');
        shelf.id = 'shelf-grid';
        for (let i = 0; i < 8; i++) {
          const slot = document.createElement('div');
          slot.className = 'slot';
          slot.ondragover = (e) => e.preventDefault();
          slot.ondrop = (e) => {
            const id = e.dataTransfer.getData('text/plain');
            const toy = document.getElementById(id);
            if (toy) slot.appendChild(toy);
          };
          shelf.appendChild(slot);
        }
        const bin = document.createElement('div');
        ['Nebby', 'Rokto', 'Viri', 'Mako', 'Zee', 'Rara', 'Ixo'].forEach((n, i) => {
          const t = document.createElement('span');
          t.className = 'toy';
          t.textContent = n;
          t.id = `toy-${i}`;
          t.draggable = true;
          t.ondragstart = (e) => e.dataTransfer.setData('text/plain', t.id);
          bin.appendChild(t);
        });
        root.appendChild(bin);
        root.appendChild(shelf);
      });
      break;
    case 'customer':
      showDialogue(['Customer: "Do you have old radio coils?"', 'You find one on the upper shelf and earn a grateful smile.']);
      break;
    case 'sketchC5':
      collectSketch('c5', 'Shop of Curiosities');
      showDialogue(['Memory Sketch collected: shelves of colorful alien toys.']);
      break;
    case 'mira':
      showDialogue([{ text: 'Mira grins: "Tell me everything about your day!"', choices: ['Talk about class', 'Talk about toys', 'Talk about missing each other'] }, 'You both imagine Uppercity schools with holographic teachers.']);
      break;
    case 'telescope':
      camera.position.set(0, 9, 38);
      showDialogue(['Through cracked glass: aerial lanes of flying pods and drones around the central spire.']);
      break;
    case 'sketchC6':
      collectSketch('c6', 'Two Friends at Sunset');
      showDialogue(['Memory Sketch collected: Mira and Lira under coral skies.']);
      break;
  }
  completed.add(id);
  checkChapterProgress();
}

function checkChapterProgress() {
  const chap = chapters[chapterIndex];
  const done = chap.required.every((r) => completed.has(r));
  if (done) {
    ui.nextBtn.hidden = false;
    ui.nextBtn.textContent = chapterIndex < chapters.length - 1 ? 'Continue Chapter' : 'Start Finale';
  }
}
ui.nextBtn.onclick = () => {
  if (chapterIndex < chapters.length - 1) {
    chapterIndex++;
    setChapter();
  }
};

function triggerCrash() {
  if (crashState) return;
  crashState = 1;
  completed.add('crash');
  showDialogue(['Mira: "What\'s that?"', 'A cyan-green streak tears across the sky.', 'The ship is huge. Damaged. Falling toward Nova Meridian.']);
}

document.addEventListener('keydown', (e) => {
  if (e.key.toLowerCase() === 'e' && currentInteractable && !activeDialogue && !inMiniGame) handleInteract(currentInteractable.id);
  if (e.key.toLowerCase() === 'e' && chapterIndex === 6 && !crashState) triggerCrash();
});
document.querySelector('#mobile-interact').onclick = () => {
  if (currentInteractable && !activeDialogue && !inMiniGame) handleInteract(currentInteractable.id);
};

document.querySelectorAll('#mobile-controls [data-move]').forEach((b) => {
  b.ontouchstart = () => moveTouch.add(b.dataset.move);
  b.ontouchend = () => moveTouch.delete(b.dataset.move);
});

const clock = new THREE.Clock();
const ship = new THREE.Mesh(new THREE.IcosahedronGeometry(1.2, 1), new THREE.MeshStandardMaterial({ color: 0x66ffee, emissive: 0x1affc9, emissiveIntensity: 1.2 }));
ship.visible = false;
world.add(ship);

function animate() {
  requestAnimationFrame(animate);
  const dt = clock.getDelta();

  let mx = 0, mz = 0;
  if (keys.has('w') || keys.has('arrowup') || moveTouch.has('up')) mz -= 1;
  if (keys.has('s') || keys.has('arrowdown') || moveTouch.has('down')) mz += 1;
  if (keys.has('a') || keys.has('arrowleft') || moveTouch.has('left')) mx -= 1;
  if (keys.has('d') || keys.has('arrowright') || moveTouch.has('right')) mx += 1;
  if (!activeDialogue && !inMiniGame) {
    const v = new THREE.Vector3(mx, 0, mz).normalize().multiplyScalar(13 * dt);
    if (Number.isFinite(v.x)) {
      lira.position.add(v);
      lira.position.x = THREE.MathUtils.clamp(lira.position.x, -95, 95);
      lira.position.z = THREE.MathUtils.clamp(lira.position.z, -35, 80);
    }
  }

  const targetCam = new THREE.Vector3(lira.position.x + 10, lira.position.y + 10, lira.position.z + 12);
  camera.position.lerp(targetCam, 0.06);
  camera.lookAt(lira.position.x, lira.position.y + 2, lira.position.z);

  currentInteractable = null;
  let prompt = '';
  for (const it of interactables) {
    const dist = lira.position.distanceTo(it.position);
    if (dist < it.radius) {
      currentInteractable = it;
      prompt = `${it.label} (E)`;
      break;
    }
  }
  ui.prompt.style.display = currentInteractable && !activeDialogue && !inMiniGame ? 'block' : 'none';
  ui.prompt.textContent = prompt;

  npcs.forEach((n, i) => {
    n.position.x = n.userData.base.x + Math.sin(clock.elapsedTime * n.userData.speed + i) * 2;
    n.position.z = n.userData.base.z + Math.cos(clock.elapsedTime * n.userData.speed + i * 1.3) * 2;
  });

  if (chapterIndex === 6 && crashState) {
    ship.visible = true;
    ship.position.set(-80 + crashState * 1.8, 70 - crashState * 0.45, 35 - crashState * 2.4);
    ship.scale.setScalar(1 + crashState * 0.01);
    ship.rotation.x += 0.06;
    ship.rotation.y += 0.09;
    crashState += 0.7;
    scene.fog.color.lerp(new THREE.Color(0x234061), 0.01);
    if (crashState > 85) {
      upperCity.children.forEach((b, idx) => {
        b.position.y += Math.sin(clock.elapsedTime * 15 + idx) * 0.2;
        b.material.emissive.setHex(0x39ffcc);
      });
      ui.chapter.textContent = 'WHEN STARS FELL';
      ui.objective.textContent = 'Chapter 1 Complete — To Be Continued...';
      ui.nextBtn.hidden = true;
    }
  }

  renderer.render(scene, camera);
}
animate();

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
