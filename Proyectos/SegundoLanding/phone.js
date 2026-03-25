/**
 * phone.js
 * Three.js scene: geometry, materials, lights, controls, render loop.
 * Depends on: phoneStyle.js (drawScreen, draw* functions)
 */

// ── Global app state (shared with phoneStyle.js) ──────────────────────────
window.currentApp    = 'home';
window.ariaMessages  = [];
window.ariaThinking  = false;
window.solarWatts    = 2.3;
window.compassAngle  = 0;
window.mapSats       = Array.from({ length: 9 }, () => ({
  x: Math.random() * 440, y: Math.random() * 900,
  vx: (Math.random() - .5) * .4, vy: (Math.random() - .5) * .4
}));

let compassTarget = 38;

// ── Renderer ──────────────────────────────────────────────────────────────
const cv  = document.getElementById('c');
const RE  = new THREE.WebGLRenderer({ canvas: cv, antialias: true, alpha: true });
RE.setPixelRatio(Math.min(devicePixelRatio, 2));
RE.setSize(innerWidth, innerHeight);
RE.toneMapping         = THREE.ACESFilmicToneMapping;
RE.toneMappingExposure = 1.1;
RE.outputEncoding      = THREE.sRGBEncoding;

const SC = new THREE.Scene();
const CA = new THREE.PerspectiveCamera(36, innerWidth / innerHeight, .01, 200);
CA.position.set(0, 0, 9.5);
const raycaster = new THREE.Raycaster();
const mouse     = new THREE.Vector2();

// ── Environment map ───────────────────────────────────────────────────────
function buildEnv() {
  const W = 512, H = 256;
  const ec = document.createElement('canvas'); ec.width = W; ec.height = H;
  const x  = ec.getContext('2d');
  const bg = x.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, '#8a9aaa'); bg.addColorStop(.4, '#4a5870'); bg.addColorStop(1, '#181e2c');
  x.fillStyle = bg; x.fillRect(0, 0, W, H);
  [[W * .76, H * .04, W * .38, 'rgba(255,255,252,.96)'],
   [W * .02, H * .45, W * .22, 'rgba(110,140,220,.55)'],
   [W * .5,  H * .05, W * .20, 'rgba(255,245,210,.4)'],
   [W * .95, H * .5,  W * .13, 'rgba(180,210,255,.35)']
  ].forEach(([cx, cy, r, col]) => {
    const g = x.createRadialGradient(cx, cy, 0, cx, cy, r);
    g.addColorStop(0, col); g.addColorStop(1, 'transparent');
    x.fillStyle = g; x.fillRect(0, 0, W, H);
  });
  const tex = new THREE.CanvasTexture(ec);
  tex.mapping  = THREE.EquirectangularReflectionMapping;
  tex.encoding = THREE.sRGBEncoding;
  const pm  = new THREE.PMREMGenerator(RE);
  pm.compileEquirectangularShader();
  const env = pm.fromEquirectangular(tex).texture;
  pm.dispose(); tex.dispose();
  return env;
}
const ENV = buildEnv();
SC.environment = ENV;

// ── Lights ────────────────────────────────────────────────────────────────
SC.add(new THREE.AmbientLight(0x223344, 1.1));
[{ c: 0xffffff, i: 3.8, p: [5, 7, 8]   },
 { c: 0x8899cc, i: 2.0, p: [-5, 1, 5]  },
 { c: 0xfff0dd, i: 2.8, p: [.5, -3,-9] },
 { c: 0x445566, i: 1.4, p: [0, 2, -8]  }
].forEach(({ c, i, p }) => {
  const l = new THREE.DirectionalLight(c, i);
  l.position.set(...p); SC.add(l);
});

// Background gradient
RE.setClearColor(0x000000, 0); // fully transparent


// ── Material helpers ──────────────────────────────────────────────────────
const EI = 2.2;
const M = (col, met, rgh, em, emI) => {
  const p = { color: col, metalness: met, roughness: rgh, envMap: ENV, envMapIntensity: EI };
  if (em != null) { p.emissive = new THREE.Color(em); p.emissiveIntensity = emI || 1; }
  return new THREE.MeshStandardMaterial(p);
};
const silv    = M(0xC8CDD5, .97, .022);
const silvBtn = M(0xBEC4CC, .97, .038);
const silvEdge= M(0xD8DEE6, .98, .010);
const camHsg  = M(0x0c1016, .95, .04);
const lensM   = M(0x010203, .04, .003);
const portM   = new THREE.MeshStandardMaterial({ color: 0x040608, metalness: .4, roughness: .75 });
const satBtnM = M(0x14223a, .92, .06, 0x001044, 1.6);
const irMat   = M(0x150904, .3,  .7,  0x0d0300, .7);
const fpBtnM  = M(0xB8C0CE, .96, .03);
const chromeM = M(0x9aa0aa, .97, .024);

// ── Shape helpers ─────────────────────────────────────────────────────────
function rrs(w, h, r) {
  const s = new THREE.Shape();
  s.moveTo(-w/2+r, -h/2); s.lineTo(w/2-r, -h/2);
  s.quadraticCurveTo(w/2, -h/2, w/2, -h/2+r);
  s.lineTo(w/2, h/2-r);
  s.quadraticCurveTo(w/2, h/2, w/2-r, h/2);
  s.lineTo(-w/2+r, h/2);
  s.quadraticCurveTo(-w/2, h/2, -w/2, h/2-r);
  s.lineTo(-w/2, -h/2+r);
  s.quadraticCurveTo(-w/2, -h/2, -w/2+r, -h/2);
  return s;
}

// ── Phone dimensions ──────────────────────────────────────────────────────
const PW = 1.52, PH = 3.30, PD = 0.18, PR = 0.19;
const FZ = PD / 2 + 0.036, BZ = -(PD / 2 + 0.036);
const BODY_COL = '#0c1728';

const pg = new THREE.Group(); SC.add(pg);

// Body
const bodyGeo = new THREE.ExtrudeGeometry(rrs(PW, PH, PR), {
  depth: PD, bevelEnabled: true, bevelSegments: 14,
  bevelSize: .024, bevelThickness: .024, curveSegments: 28
});
bodyGeo.center();
pg.add(new THREE.Mesh(bodyGeo, silv));

// ── Screen canvas ─────────────────────────────────────────────────────────
const SW = 480, SH = 1040, SCR_CORNER = 88;
const scrCv   = document.createElement('canvas');
scrCv.width   = SW; scrCv.height = SH;
const sctx    = scrCv.getContext('2d');
let   scrTex  = null;
let   dirty   = true;

// First draw
window.drawScreen(scrCv, sctx, null);
scrTex = new THREE.CanvasTexture(scrCv);
scrTex.encoding = THREE.sRGBEncoding;

// UV-mapped screen geometry
const SCR_W = PW - .04, SCR_H = PH - .04, SCR_R = 0.19;
const scrShape = rrs(SCR_W, SCR_H, SCR_R);
const scrGeo   = new THREE.ShapeGeometry(scrShape, 32);
const pos      = scrGeo.attributes.position;
const uvArr    = [];
for (let i = 0; i < pos.count; i++) {
  uvArr.push((pos.getX(i) + SCR_W / 2) / SCR_W, (pos.getY(i) + SCR_H / 2) / SCR_H);
}
scrGeo.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(uvArr), 2));

const scrMat = new THREE.MeshStandardMaterial({
  map: scrTex, emissiveMap: scrTex,
  emissive: new THREE.Color(0.08, 0.18, 0.35),
  emissiveIntensity: 1.0,
  roughness: .03, metalness: 0, transparent: true
});
const scrMesh = new THREE.Mesh(scrGeo, scrMat);
scrMesh.position.z = FZ + .006; pg.add(scrMesh);

// Glass reflection
const glGeo = new THREE.ShapeGeometry(rrs(SCR_W, SCR_H, SCR_R), 32);
const glPos = glGeo.attributes.position;
const glUV  = [];
for (let i = 0; i < glPos.count; i++) { glUV.push((glPos.getX(i) + SCR_W/2) / SCR_W, (glPos.getY(i) + SCR_H/2) / SCR_H); }
glGeo.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(glUV), 2));
const glMesh = new THREE.Mesh(glGeo, new THREE.MeshStandardMaterial({
  color: 0xffffff, metalness: .05, roughness: .01,
  transparent: true, opacity: .04, envMap: ENV, envMapIntensity: 3
}));
glMesh.position.z = FZ + .009; pg.add(glMesh);
const scrGlL = new THREE.PointLight(0x0055cc, 3.5, 4.5);
scrGlL.position.set(0, 0, FZ + .7); pg.add(scrGlL);

// Punch-hole
const phG = new THREE.CylinderGeometry(.030, .030, .02, 32); phG.rotateX(Math.PI / 2);
const phMesh = new THREE.Mesh(phG, new THREE.MeshStandardMaterial({ color: 0x010204, metalness: .1, roughness: .01 }));
phMesh.position.set(0, PH/2 - .215, FZ + .005); pg.add(phMesh);
const phRing = new THREE.Mesh(new THREE.RingGeometry(.030, .046, 32), silvEdge);
phRing.position.set(0, PH/2 - .215, FZ + .004); pg.add(phRing);

// ── Solar panel ───────────────────────────────────────────────────────────
const solH = 2.05, solY = -(PH/2 - solH/2 - .07);
const solCv = document.createElement('canvas'); solCv.width = 480; solCv.height = 840;
const slX = solCv.getContext('2d');
slX.fillStyle = '#080808'; slX.fillRect(0, 0, 480, 840);
const sh = slX.createLinearGradient(0, 0, 480, 840);
sh.addColorStop(0, 'rgba(255,255,255,0.04)'); sh.addColorStop(.4, 'rgba(255,255,255,0.01)');
sh.addColorStop(.6, 'rgba(0,0,0,0)');         sh.addColorStop(1, 'rgba(255,255,255,0.02)');
slX.fillStyle = sh; slX.fillRect(0, 0, 480, 840);
slX.strokeStyle = 'rgba(80,80,90,0.18)'; slX.lineWidth = .6;
for (let y = 70; y < 840; y += 76) { slX.beginPath(); slX.moveTo(6, y); slX.lineTo(474, y); slX.stroke(); }
slX.strokeStyle = 'rgba(100,100,110,0.35)'; slX.lineWidth = 2; slX.strokeRect(2, 2, 476, 836);
const solTex = new THREE.CanvasTexture(solCv); solTex.encoding = THREE.sRGBEncoding;

const solW = PW - .10, solR = .04;
const solShape = new THREE.Shape();
solShape.moveTo(-solW/2+solR, -solH/2); solShape.lineTo(solW/2-solR, -solH/2);
solShape.quadraticCurveTo(solW/2, -solH/2, solW/2, -solH/2+solR);
solShape.lineTo(solW/2, solH/2-solR); solShape.quadraticCurveTo(solW/2, solH/2, solW/2-solR, solH/2);
solShape.lineTo(-solW/2+solR, solH/2); solShape.quadraticCurveTo(-solW/2, solH/2, -solW/2, solH/2-solR);
solShape.lineTo(-solW/2, -solH/2+solR); solShape.quadraticCurveTo(-solW/2, -solH/2, -solW/2+solR, -solH/2);
const SOL_DEPTH = 0.018;
const solGeo = new THREE.ExtrudeGeometry(solShape, {
  depth: SOL_DEPTH, bevelEnabled: true, bevelSegments: 4,
  bevelSize: .006, bevelThickness: .006, curveSegments: 12
});
solGeo.center();
const solPosAttr = solGeo.attributes.position;
const solUVArr = new Float32Array(solPosAttr.count * 2);
for (let i = 0; i < solPosAttr.count; i++) {
  solUVArr[i*2]   = (solPosAttr.getX(i) + solW/2) / solW;
  solUVArr[i*2+1] = (solPosAttr.getY(i) + solH/2) / solH;
}
solGeo.setAttribute('uv', new THREE.BufferAttribute(solUVArr, 2));
const solFaceMat = new THREE.MeshStandardMaterial({
  map: solTex, color: 0x080808, roughness: .05, metalness: .15,
  envMap: ENV, envMapIntensity: 1.8,
  polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2
});
const solSideMat = new THREE.MeshStandardMaterial({ color: 0x0a1828, metalness: .85, roughness: .18, envMap: ENV, envMapIntensity: 1.8 });
const solMesh = new THREE.Mesh(solGeo, [solFaceMat, solSideMat]);
solMesh.rotation.y = Math.PI;
solMesh.position.set(0, solY, BZ - SOL_DEPTH/2 - .004); pg.add(solMesh);

const solEdge = new THREE.LineSegments(new THREE.EdgesGeometry(solGeo),
  new THREE.LineBasicMaterial({ color: 0x4488bb, transparent: true, opacity: .2 }));
solEdge.rotation.y = Math.PI; solEdge.position.copy(solMesh.position); pg.add(solEdge);
const solBackGL = new THREE.PointLight(0x1133aa, 2.8, 4);
solBackGL.position.set(0, solY, -3); SC.add(solBackGL);

// ── Camera module ─────────────────────────────────────────────────────────
const CBW = .84, CBH = .84, CBD = .074, CBR = .09;
const camGeo = new THREE.ExtrudeGeometry(rrs(CBW, CBH, CBR), {
  depth: CBD, bevelEnabled: true, bevelSegments: 8,
  bevelSize: .01, bevelThickness: .01, curveSegments: 18
});
camGeo.center();
const camPX = -.17, camPY = PH/2 - .535, camPZ = BZ - CBD/2 - .004;
const camModule = new THREE.Mesh(camGeo, camHsg);
camModule.position.set(camPX, camPY, camPZ); camModule.rotation.y = Math.PI; pg.add(camModule);

function mkLens(lx, ly, rO) {
  const lz = camPZ - .002;
  const ring = new THREE.Mesh(new THREE.CylinderGeometry(rO+.013, rO+.013, CBD+.014, 38), chromeM);
  ring.rotation.x = Math.PI/2; ring.position.set(lx, ly, lz); pg.add(ring);
  const lens = new THREE.Mesh(new THREE.CylinderGeometry(rO, rO, CBD+.020, 38), lensM);
  lens.rotation.x = Math.PI/2; lens.position.set(lx, ly, lz); pg.add(lens);
  const glint = new THREE.Mesh(new THREE.CircleGeometry(rO*.30, 14),
    new THREE.MeshBasicMaterial({ color: 0x1a3060, transparent: true, opacity: .5, side: THREE.DoubleSide }));
  glint.position.set(lx - rO*.24, ly + rO*.24, lz - CBD/2 - .003); pg.add(glint);
}
mkLens(camPX - .178, camPY + .165, .148);
mkLens(camPX + .116, camPY + .180, .105);
mkLens(camPX + .038, camPY - .178, .082);

const flash = new THREE.Mesh(new THREE.CylinderGeometry(.037, .037, CBD+.012, 14),
  new THREE.MeshStandardMaterial({ color: 0x381e0a, metalness: .25, roughness: .5, emissive: new THREE.Color(0x221000), emissiveIntensity: .9 }));
flash.rotation.x = Math.PI/2; flash.position.set(camPX+.214, camPY-.196, camPZ-.002); pg.add(flash);

const satDot = new THREE.Mesh(new THREE.SphereGeometry(.022, 10, 10), M(0x081630, .7, .25, 0x0011aa, 2.4));
satDot.position.set(camPX - CBW/2 + .06, camPY + CBH/2 - .06, camPZ - CBD/2 - .002); pg.add(satDot);
const satDotGL = new THREE.PointLight(0x0055ff, .8, 1.0);
satDotGL.position.set(satDot.position.x, satDot.position.y, satDot.position.z - .05); pg.add(satDotGL);

// Logo on back
const lgCv = document.createElement('canvas'); lgCv.width = 512; lgCv.height = 80;
const lgX2 = lgCv.getContext('2d');
lgX2.fillStyle = 'rgba(195,206,220,.5)'; lgX2.font = 'bold 42px Courier New'; lgX2.textAlign = 'center'; lgX2.fillText('SOLAR X1', 256, 48);
lgX2.fillStyle = 'rgba(148,162,176,.28)'; lgX2.font = '13px Courier New'; lgX2.fillText('SAT-LINK · SOLAR CHARGE · AI OS', 256, 68);
const lgTex = new THREE.CanvasTexture(lgCv); lgTex.encoding = THREE.sRGBEncoding;
const lgMesh = new THREE.Mesh(new THREE.PlaneGeometry(1.10, .22),
  new THREE.MeshStandardMaterial({ map: lgTex, transparent: true, alphaTest: .01, envMap: ENV, envMapIntensity: .9, metalness: .92, roughness: .02 }));
lgMesh.rotation.y = Math.PI; lgMesh.position.set(.04, .56, BZ - .007); pg.add(lgMesh);

// ── Buttons ───────────────────────────────────────────────────────────────
const LX = -(PW / 2);
function mkLBtn(y, h) {
  const g = new THREE.BoxGeometry(.030, h, .062);
  const m = new THREE.Mesh(g, silvBtn); m.position.set(LX - .015, y, 0); pg.add(m);
  const e = new THREE.LineSegments(new THREE.EdgesGeometry(g),
    new THREE.LineBasicMaterial({ color: 0xbbbbbb, transparent: true, opacity: .15 }));
  e.position.set(LX - .015, y, 0); pg.add(e);
}
mkLBtn(.84, .30); mkLBtn(.38, .30); mkLBtn(-.51, .20);

const simPin = new THREE.Mesh(new THREE.CylinderGeometry(.009, .009, .016, 8), portM);
simPin.rotation.z = Math.PI/2; simPin.position.set(LX - .002, -.51, .085); pg.add(simPin);

const RX = PW / 2;
const fpDisc = new THREE.Mesh(new THREE.CylinderGeometry(.076, .076, .032, 48), fpBtnM);
fpDisc.rotation.z = Math.PI/2; fpDisc.position.set(RX + .016, .70, 0); pg.add(fpDisc);
const fpOuter = new THREE.Mesh(new THREE.TorusGeometry(.076, .009, 12, 48), chromeM);
fpOuter.rotation.y = Math.PI/2; fpOuter.position.set(RX + .016, .70, 0); pg.add(fpOuter);
const fpCv = document.createElement('canvas'); fpCv.width = 128; fpCv.height = 128;
const fpCtx = fpCv.getContext('2d'); fpCtx.clearRect(0, 0, 128, 128);
fpCtx.strokeStyle = 'rgba(255,255,255,.14)'; fpCtx.lineWidth = 1.3;
for (let i = 1; i <= 5; i++) { fpCtx.beginPath(); fpCtx.arc(64, 64, i*9, 0, Math.PI*2); fpCtx.stroke(); }
const fpFace = new THREE.Mesh(new THREE.CircleGeometry(.073, 48),
  new THREE.MeshStandardMaterial({ map: new THREE.CanvasTexture(fpCv), transparent: true, envMap: ENV, envMapIntensity: 2, metalness: .95, roughness: .02 }));
fpFace.rotation.y = Math.PI/2; fpFace.position.set(RX + .033, .70, 0); pg.add(fpFace);

const satBtnMesh = new THREE.Mesh(new THREE.BoxGeometry(.030, .28, .062), satBtnM);
satBtnMesh.position.set(RX + .015, .10, 0); pg.add(satBtnMesh);
const satBtnGL = new THREE.PointLight(0x0044ff, 1.2, 2.2);
satBtnGL.position.set(RX + .3, .10, 0); pg.add(satBtnGL);

const TY = PH / 2;
const satPort = new THREE.Mesh(new THREE.CylinderGeometry(.034, .034, .054, 16), M(0x060f1c, .7, .22, 0x0011aa, 2.2));
satPort.position.set(-.44, TY + .027, 0); pg.add(satPort);
const satPortGL = new THREE.PointLight(0x0033ee, .9, 1.2);
satPortGL.position.set(-.44, TY + .1, 0); pg.add(satPortGL);
const topMic = new THREE.Mesh(new THREE.CylinderGeometry(.012, .012, .038, 8), portM);
topMic.position.set(.08, TY + .019, 0); pg.add(topMic);
const irB = new THREE.Mesh(new THREE.CylinderGeometry(.026, .026, .050, 12), irMat);
irB.position.set(.47, TY + .025, 0); pg.add(irB);
const irGL = new THREE.PointLight(0xaa2200, .6, 1.0);
irGL.position.set(.47, TY + .08, 0); pg.add(irGL);

const BY = -(PH / 2);
const usb = new THREE.Mesh(new THREE.BoxGeometry(.28, .048, .13), portM);
usb.position.set(0, BY - .024, 0); pg.add(usb);
function mkSpk(cx) {
  const sx = cx - 4 * .048/2;
  for (let c = 0; c < 5; c++) for (let r = 0; r < 2; r++) {
    const d = new THREE.Mesh(new THREE.CylinderGeometry(.010, .010, .044, 6), portM);
    d.position.set(sx + c * .048, BY - .022, -.012 + r * .048); pg.add(d);
  }
}
mkSpk(-.43); mkSpk(.43);
const botMic = new THREE.Mesh(new THREE.CylinderGeometry(.010, .010, .042, 8), portM);
botMic.position.set(.62, BY - .022, 0); pg.add(botMic);

// Floor removed — transparent background
const gwCv = document.createElement('canvas'); gwCv.width = 256; gwCv.height = 256;
const gwGr = gwCv.getContext('2d').createRadialGradient(128, 128, 0, 128, 128, 128);
gwGr.addColorStop(0, 'rgba(60,80,120,.22)'); gwGr.addColorStop(1, 'rgba(0,0,0,0)');
gwCv.getContext('2d').fillStyle = gwGr; gwCv.getContext('2d').fillRect(0, 0, 256, 256);
const gw = new THREE.Mesh(new THREE.PlaneGeometry(3, 3),
  new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(gwCv), transparent: true, depthWrite: false }));
gw.rotation.x = -Math.PI/2; gw.position.y = -4.59; SC.add(gw);

// ── ARIA API ──────────────────────────────────────────────────────────────
async function sendAria() {
  const inp = document.getElementById('aria-inp');
  const msg = inp.value.trim(); if (!msg) return;
  inp.value = '';
  window.ariaMessages.push({ role: 'user', text: msg });
  window.ariaThinking = true; dirty = true;
  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514', max_tokens: 1000,
        system: 'Eres ARIA, la IA del SolarPhone X1 — smartphone con panel solar fotovoltaico y conectividad satelital pura. Responde en español, máximo 2-3 frases, tono tech-futurista.',
        messages: window.ariaMessages.map(m => ({ role: m.role, content: m.text }))
      })
    });
    const d = await r.json();
    window.ariaMessages.push({ role: 'assistant', text: d.content[0].text });
  } catch (e) {
    window.ariaMessages.push({ role: 'assistant', text: '⚠ Error de enlace satelital.' });
  }
  window.ariaThinking = false; dirty = true;
}
window.sendAria = sendAria;

// ── Navigation / view controls ─────────────────────────────────────────────
function setApp(app) {
  window.currentApp = app; dirty = true;
  const aw = document.getElementById('aria-wrap');
  if (app === 'aria') { aw.style.display = 'flex'; document.getElementById('aria-inp').focus(); }
  else aw.style.display = 'none';
}
window.setApp = setApp;

function handleClick(px, py) {
  mouse.x = (px / innerWidth) * 2 - 1;
  mouse.y = -(py / innerHeight) * 2 + 1;
  raycaster.setFromCamera(mouse, CA);
  const hits = raycaster.intersectObject(scrMesh);
  if (!hits.length) return;
  const uv = hits[0].uv;
  const cx = uv.x * SW, cy = (1 - uv.y) * SH;
  if (window.currentApp === 'home') {
    if (cx >= 22  && cx <= 230 && cy >= 442 && cy <= 576) setApp('solar');
    else if (cx >= 252 && cx <= 460 && cy >= 442 && cy <= 576) setApp('map');
    else if (cx >= 22  && cx <= 230 && cy >= 606 && cy <= 740) setApp('compass');
    else if (cx >= 252 && cx <= 460 && cy >= 606 && cy <= 740) setApp('aria');
  } else {
    if (cy >= 76 && cy <= 112 && cx >= 14 && cx <= 104) setApp('home');
  }
}

const VIEWS = {
  auto: [.38, -.07], front: [0, -.04], back: [Math.PI, -.04],
  left: [-Math.PI/2, 0], right: [Math.PI/2, 0], top: [0, 1.48], bot: [0, -1.48]
};
function sv(v, el) {
  document.querySelectorAll('.nb').forEach(b => b.classList.remove('a'));
  if (el) el.classList.add('a');
  [tRY, tRX] = VIEWS[v]; autoR = (v === 'auto');
}
window.sv = sv;

// ── Interaction state ─────────────────────────────────────────────────────
let drag = false, mx = 0, my = 0;
let rotY = .38, rotX = -.07, tRY = .38, tRX = -.07;
let zC = 9.5, zT = 9.5, autoR = true;
let mouseDownTime = 0, mouseDownPos = { x: 0, y: 0 }, dragged = false;

cv.addEventListener('mousedown', e => {
  drag = true; dragged = false; cv.classList.add('drag');
  mx = e.clientX; my = e.clientY;
  mouseDownTime = Date.now(); mouseDownPos = { x: e.clientX, y: e.clientY }; autoR = false;
});
window.addEventListener('mouseup', e => {
  drag = false; cv.classList.remove('drag');
  if (!dragged && Date.now() - mouseDownTime < 300) {
    const dx = e.clientX - mouseDownPos.x, dy = e.clientY - mouseDownPos.y;
    if (Math.sqrt(dx * dx + dy * dy) < 8) handleClick(e.clientX, e.clientY);
  }
});
window.addEventListener('mousemove', e => {
  if (!drag) return;
  const dx = e.clientX - mx, dy = e.clientY - my;
  if (Math.abs(dx) > 3 || Math.abs(dy) > 3) dragged = true;
  tRY += dx * .009; tRX += dy * .007; tRX = Math.max(-1.4, Math.min(1.4, tRX));
  mx = e.clientX; my = e.clientY;
});
cv.addEventListener('wheel', e => { zT = Math.max(4, Math.min(16, zT + e.deltaY * .007)); e.preventDefault(); }, { passive: false });

let tc = null;
cv.addEventListener('touchstart', e => { tc = { x: e.touches[0].clientX, y: e.touches[0].clientY }; autoR = false; });
cv.addEventListener('touchmove', e => {
  if (!tc) return;
  tRY += (e.touches[0].clientX - tc.x) * .009;
  tRX += (e.touches[0].clientY - tc.y) * .007;
  tRX = Math.max(-1.4, Math.min(1.4, tRX));
  tc = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  e.preventDefault();
}, { passive: false });
cv.addEventListener('touchend', e => {
  if (e.changedTouches.length) handleClick(e.changedTouches[0].clientX, e.changedTouches[0].clientY);
});

window.addEventListener('resize', () => {
  RE.setSize(innerWidth, innerHeight);
  CA.aspect = innerWidth / innerHeight;
  CA.updateProjectionMatrix();
});

// ── Render loop ───────────────────────────────────────────────────────────
const clk = new THREE.Clock(); let lastMin = -1;
(function loop() {
  requestAnimationFrame(loop);
  const t = clk.getElapsedTime();
  const mn = Math.floor(t / 60);
  const h  = new Date().getHours() + new Date().getMinutes() / 60;

  // Update app state
  window.solarWatts = Math.max(0, Math.sin((h - 6) / 12 * Math.PI) * 4.8 + Math.sin(t * .3) * .2);
  compassTarget += (Math.random() - .5) * 1.2;
  window.compassAngle += (compassTarget - window.compassAngle) * .04;
  window.compassAngle = ((window.compassAngle % 360) + 360) % 360;
  window.mapSats.forEach(s => {
    s.x += s.vx; s.y += s.vy;
    if (s.x < 0) s.x = 440; if (s.x > 440) s.x = 0;
    if (s.y < 0) s.y = 900; if (s.y > 900) s.y = 0;
  });

  if (mn !== lastMin) { lastMin = mn; dirty = true; }
  if (dirty || window.currentApp === 'map' || window.currentApp === 'compass') {
    window.drawScreen(scrCv, sctx, scrTex); dirty = false;
  }

  if (autoR) tRY += .003;
  rotY += (tRY - rotY) * .075;
  rotX += (tRX - rotX) * .075;
  zC   += (zT - zC) * .065;
  pg.rotation.y = rotY;
  pg.rotation.x = rotX;
  pg.position.y = Math.sin(t * .48) * .05;
  CA.position.z = zC;

  satBtnGL.intensity  = 1.1 + Math.sin(t * 2.4) * .55;
  satPortGL.intensity = .75 + Math.sin(t * 3.1) * .32;
  irGL.intensity      = .52 + Math.sin(t * 3.8) * .26;
  satDotGL.intensity  = .8  + Math.sin(t * 2.8) * .3;
  scrGlL.intensity    = 3.5 + Math.sin(t * .8)  * .6;
  solBackGL.intensity = 2.2 + Math.sin(t * .6)  * .5;
  gw.position.y = -4.59 + pg.position.y * .08;

  RE.render(SC, CA);
})();
