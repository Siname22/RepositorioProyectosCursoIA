// ── helpers ────────────────────────────────────────────────────────────────
const mk=(w,h)=>{const c=document.createElement('canvas');c.width=w;c.height=h;return c;}
function rr(c,x,y,w,h,r){
  c.beginPath();c.moveTo(x+r,y);c.lineTo(x+w-r,y);c.quadraticCurveTo(x+w,y,x+w,y+r);
  c.lineTo(x+w,y+h-r);c.quadraticCurveTo(x+w,y+h,x+w-r,y+h);c.lineTo(x+r,y+h);
  c.quadraticCurveTo(x,y+h,x,y+h-r);c.lineTo(x,y+r);c.quadraticCurveTo(x,y,x+r,y);
  c.closePath();
}
function rShape(w,h,r){
  const s=new THREE.Shape();
  s.moveTo(-w/2+r,-h/2);s.lineTo(w/2-r,-h/2);s.quadraticCurveTo(w/2,-h/2,w/2,-h/2+r);
  s.lineTo(w/2,h/2-r);s.quadraticCurveTo(w/2,h/2,w/2-r,h/2);s.lineTo(-w/2+r,h/2);
  s.quadraticCurveTo(-w/2,h/2,-w/2,h/2-r);s.lineTo(-w/2,-h/2+r);s.quadraticCurveTo(-w/2,-h/2,-w/2+r,-h/2);
  return s;
}
function rBoxGeo(w,h,d,r){
  const sh=rShape(w,h,r);
  const geo=new THREE.ExtrudeGeometry(sh,{depth:d,bevelEnabled:false,curveSegments:18});
  geo.translate(0,0,-d/2);
  return geo;
}
const p3=(m,x,y,z)=>{m.position.set(x,y,z);return m;}

// ── SCREEN (live clock) ────────────────────────────────────────────────────
const frontCanvas=mk(512,1024);
const frontCtx=frontCanvas.getContext('2d');
let frontTex=null;

function drawFront(){
  const W=512,H=1024,g=frontCtx;
  g.clearRect(0,0,W,H);
  let gr=g.createLinearGradient(0,0,W,H);
  gr.addColorStop(0,'#000c2e');gr.addColorStop(.45,'#001650');gr.addColorStop(1,'#000a24');
  g.fillStyle=gr;g.fillRect(0,0,W,H);
  let gl=g.createRadialGradient(W/2,H*.38,10,W/2,H*.38,380);
  gl.addColorStop(0,'rgba(0,100,255,.55)');gl.addColorStop(.5,'rgba(0,60,200,.18)');gl.addColorStop(1,'transparent');
  g.fillStyle=gl;g.fillRect(0,0,W,H);
  g.fillStyle='rgba(0,30,80,.06)';
  for(let y=0;y<H;y+=4){g.fillRect(0,y,W,2);}
  [[27,'#000510'],[19,'#010818'],[10,'#00030c']].forEach(([r,col])=>{
    g.beginPath();g.arc(W/2,56,r,0,Math.PI*2);g.fillStyle=col;g.fill();
  });
  g.beginPath();g.arc(W/2-6,50,4,0,Math.PI*2);g.fillStyle='rgba(80,160,255,.28)';g.fill();
  const bat=82,sol=71;
  g.font='600 24px Arial';g.textAlign='left';g.fillStyle='rgba(220,240,255,.85)';
  g.fillText(`☀ ${sol}%`,W*.06,70);
  g.textAlign='right';g.fillText(`🔋 ${bat}%`,W*.94,70);
  const now=new Date();
  const hh=String(now.getHours()).padStart(2,'0');
  const mm=String(now.getMinutes()).padStart(2,'0');
  const ss=String(now.getSeconds()).padStart(2,'0');
  const dateStr=now.toLocaleDateString('es-ES',{weekday:'long',day:'numeric',month:'long'});
  g.textAlign='center';
  g.shadowColor='#0066ff';g.shadowBlur=32;
  g.fillStyle='#cce0ff';g.font='bold 130px Arial';
  g.fillText(`${hh}:${mm}`,W/2,H*.22);
  g.shadowBlur=0;
  g.fillStyle='rgba(80,160,255,.75)';g.font='bold 44px Arial';
  g.fillText(':'+ss,W/2+128,H*.22-52);
  g.font='300 30px Arial';g.fillStyle='rgba(100,170,255,.6)';
  g.fillText(dateStr,W/2,H*.22+52);
  g.strokeStyle='rgba(0,100,255,.3)';g.lineWidth=1;
  g.beginPath();g.moveTo(W*.1,H*.27);g.lineTo(W*.9,H*.27);g.stroke();
  g.shadowColor='#0055ff';g.shadowBlur=70;
  g.fillStyle='rgba(40,120,255,.25)';g.font='bold 74px Arial';g.fillText('Link-IA One',W/2,H*.4);
  g.shadowBlur=30;g.fillStyle='rgba(100,180,255,.65)';g.fillText('Link-IA One',W/2,H*.4);
  g.shadowBlur=8;g.fillStyle='#e0f0ff';g.fillText('Link-IA One',W/2,H*.4);
  g.shadowBlur=0;
  g.font='300 23px Arial';g.fillStyle='rgba(60,140,255,.52)';
  g.fillText('A I  ·  S O L A R  ·  O N E',W/2,H*.4+54);
  g.strokeStyle='rgba(0,80,200,.25)';
  g.beginPath();g.moveTo(W*.1,H*.46);g.lineTo(W*.9,H*.46);g.stroke();
  const bx=W*.1,barW=W*.8,barH=40,br=10;
  const by=H*.5;
  rr(g,bx,by,barW,barH,br);g.fillStyle='rgba(0,20,60,.7)';g.fill();
  rr(g,bx,by,barW*(bat/100),barH,br);
  let bg=g.createLinearGradient(bx,0,bx+barW,0);
  bg.addColorStop(0,'rgba(0,180,100,.9)');bg.addColorStop(1,'rgba(0,230,120,.7)');
  g.fillStyle=bg;g.fill();
  g.fillStyle='rgba(255,255,255,.9)';g.font='bold 23px Arial';g.textAlign='left';
  g.fillText('🔋  Batería',bx+14,by+27);
  g.textAlign='right';g.fillText(`${bat}%`,bx+barW-14,by+27);
  const sy=H*.5+60;
  rr(g,bx,sy,barW,barH,br);g.fillStyle='rgba(0,20,60,.7)';g.fill();
  rr(g,bx,sy,barW*(sol/100),barH,br);
  let sg=g.createLinearGradient(bx,0,bx+barW,0);
  sg.addColorStop(0,'rgba(0,160,255,.9)');sg.addColorStop(1,'rgba(40,220,255,.7)');
  g.fillStyle=sg;g.fill();
  g.fillStyle='rgba(255,255,255,.9)';g.textAlign='left';
  g.fillText('☀  Solar',bx+14,sy+27);
  g.textAlign='right';g.fillText(`${sol}%`,bx+barW-14,sy+27);
  rr(g,W*.3,H-68,W*.4,9,4);g.fillStyle='rgba(80,160,255,.28)';g.fill();
}
function makeFront(){
  drawFront();
  frontTex=new THREE.CanvasTexture(frontCanvas);
  return frontTex;
}

// ── BACK ──────────────────────────────────────────────────────────────────
function makeBack(){
  const W=512,H=1024,c=mk(W,H),g=c.getContext('2d');
  const gr=g.createLinearGradient(W,0,0,H);
  gr.addColorStop(0,'#1a1a1a');gr.addColorStop(.4,'#141414');gr.addColorStop(1,'#0e0e0e');
  g.fillStyle=gr;g.fillRect(0,0,W,H);
  g.strokeStyle='rgba(255,255,255,.03)';g.lineWidth=1;
  for(let y=0;y<H;y+=3){g.beginPath();g.moveTo(0,y);g.lineTo(W,y);g.stroke();}
  return new THREE.CanvasTexture(c);
}

// ── SOLAR ─────────────────────────────────────────────────────────────────
function makeSolar(){
  const W=512,H=806,c=mk(W,H),g=c.getContext('2d');
  g.fillStyle='#182838';g.fillRect(0,0,W,H);
  const cols=4,rows=6,gap=8,cw=118,ch=125;
  for(let r=0;r<rows;r++){
    for(let cc=0;cc<cols;cc++){
      const cx=gap+cc*(cw+gap),cy=gap+r*(ch+gap);
      const cg=g.createLinearGradient(cx,cy,cx+cw,cy+ch);
      cg.addColorStop(0,'#26405a');cg.addColorStop(.5,'#1c3050');cg.addColorStop(1,'#142438');
      g.fillStyle=cg;rr(g,cx,cy,cw,ch,5);g.fill();
      g.strokeStyle='rgba(140,190,255,.18)';g.lineWidth=1.2;
      for(let i=1;i<6;i++){const lx=cx+Math.round(cw*i/6);g.beginPath();g.moveTo(lx,cy+4);g.lineTo(lx,cy+ch-4);g.stroke();}
      g.strokeStyle='rgba(180,220,255,.3)';g.lineWidth=2;
      g.beginPath();g.moveTo(cx+4,cy+Math.round(ch/2));g.lineTo(cx+cw-4,cy+Math.round(ch/2));g.stroke();
      g.strokeStyle='rgba(160,210,255,.15)';g.lineWidth=1;
      [.25,.75].forEach(f=>{const ly=cy+Math.round(ch*f);g.beginPath();g.moveTo(cx+4,ly);g.lineTo(cx+cw-4,ly);g.stroke();});
      const sh=g.createLinearGradient(cx,cy,cx+cw*.55,cy+ch*.4);
      sh.addColorStop(0,'rgba(140,200,255,.1)');sh.addColorStop(1,'transparent');
      g.fillStyle=sh;rr(g,cx,cy,cw,ch,5);g.fill();
      g.strokeStyle='rgba(0,15,35,.7)';g.lineWidth=1;rr(g,cx,cy,cw,ch,5);g.stroke();
    }
  }
  const gl=g.createLinearGradient(0,0,W*.45,H*.28);
  gl.addColorStop(0,'rgba(200,230,255,.07)');gl.addColorStop(1,'transparent');
  g.fillStyle=gl;g.fillRect(0,0,W,H);
  return new THREE.CanvasTexture(c);
}

// ── FINGERPRINT ───────────────────────────────────────────────────────────
function makeFingerprint(){
  const S=256,c=mk(S,S),g=c.getContext('2d');
  const gr=g.createRadialGradient(S/2,S/2,0,S/2,S/2,S/2);
  gr.addColorStop(0,'#7e7e7e');gr.addColorStop(1,'#686868');
  g.fillStyle=gr;g.fillRect(0,0,S,S);
  g.strokeStyle='rgba(35,35,35,.92)';g.lineWidth=1.4;g.lineCap='round';
  const cx=S/2,cy=S/2;
  for(let i=0;i<13;i++){
    const r=5+i*8.5;if(r>S*.47)break;
    g.beginPath();g.arc(cx,cy-3,r,Math.PI*.07,Math.PI*.93);g.stroke();
    g.beginPath();g.arc(cx,cy+3,r,Math.PI*1.07,Math.PI*1.93);g.stroke();
  }
  g.beginPath();g.arc(cx,cy,4,0,Math.PI*2);g.fillStyle='rgba(30,30,30,.75)';g.fill();
  const rg=g.createRadialGradient(cx,cy,0,cx,cy,S*.45);
  rg.addColorStop(0,'rgba(60,140,255,.1)');rg.addColorStop(1,'transparent');
  g.fillStyle=rg;g.fillRect(0,0,S,S);
  return new THREE.CanvasTexture(c);
}

function makeLogoTex(){
  const W=48,H=512,c=mk(W,H),g=c.getContext('2d');
  g.save();g.translate(W/2,H/2);g.rotate(-Math.PI/2);
  g.textAlign='center';g.textBaseline='middle';
  g.font='300 20px Arial';g.fillStyle='rgba(80,80,80,.9)';
  g.fillText('LINK-IA  ONE',0,0);
  g.strokeStyle='rgba(75,75,75,.38)';g.lineWidth=.8;
  g.beginPath();g.moveTo(-185,14);g.lineTo(-115,14);g.stroke();
  g.beginPath();g.moveTo(115,14);g.lineTo(185,14);g.stroke();
  g.restore();
  return new THREE.CanvasTexture(c);
}

// ── RENDERER (transparent background) ─────────────────────────────────────
const renderer=new THREE.WebGLRenderer({antialias:true,alpha:true});
renderer.setSize(innerWidth,innerHeight);
renderer.setPixelRatio(Math.min(devicePixelRatio,2));
renderer.setClearColor(0x000000,0); // fully transparent
renderer.shadowMap.enabled=true;
renderer.shadowMap.type=THREE.PCFSoftShadowMap;
renderer.toneMapping=THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure=1.1;
document.body.appendChild(renderer.domElement);

const scene=new THREE.Scene();
// No background, no fog — transparent

const cam=new THREE.PerspectiveCamera(40,innerWidth/innerHeight,.1,100);
cam.position.set(0,.3,7.5);

scene.add(new THREE.AmbientLight(0xffffff,.38));
const kl=new THREE.DirectionalLight(0xffffff,1.1);
kl.position.set(3,5,4);kl.castShadow=true;kl.shadow.mapSize.set(2048,2048);scene.add(kl);
const fl2=new THREE.DirectionalLight(0x3a5080,.42);fl2.position.set(-4,2,-3);scene.add(fl2);
const rl=new THREE.DirectionalLight(0xaaccff,.18);rl.position.set(0,-3,-5);scene.add(rl);
const pl=new THREE.PointLight(0x4a9eff,.22,12);pl.position.set(0,4,2);scene.add(pl);

// ── DIMENSIONS ─────────────────────────────────────────────────────────────
const PW=1.85,PH=3.9,PD=0.22,CR=0.16,BV=0.022;
const FZ=PD/2-BV,BZ=-(PD/2-BV);

// ── PHONE GROUP ────────────────────────────────────────────────────────────
const phone=new THREE.Group();scene.add(phone);

const bodyShape=rShape(PW,PH,CR);
const extCfg={depth:PD,bevelEnabled:true,bevelThickness:BV,bevelSize:BV,bevelSegments:10,curveSegments:28};
const bodyGeo=new THREE.ExtrudeGeometry(bodyShape,extCfg);
bodyGeo.translate(0,0,-PD/2);
const metalMat=new THREE.MeshStandardMaterial({color:0x111111,metalness:.95,roughness:.12});
phone.add(new THREE.Mesh(bodyGeo,[metalMat,metalMat]));

const faceSh=rShape(PW-BV*.4,PH-BV*.4,CR-.008);

makeFront();
const fMesh=new THREE.Mesh(
  new THREE.ShapeGeometry(faceSh,28),
  new THREE.MeshStandardMaterial({map:frontTex,emissiveMap:frontTex,emissive:new THREE.Color(1,1,1),emissiveIntensity:1.15,roughness:.04,metalness:.02})
);
fMesh.position.z=FZ+.001;phone.add(fMesh);

const bkMesh=new THREE.Mesh(
  new THREE.ShapeGeometry(faceSh,28),
  new THREE.MeshStandardMaterial({map:makeBack(),roughness:.17,metalness:.82})
);
bkMesh.rotation.y=Math.PI;bkMesh.position.z=BZ-.001;phone.add(bkMesh);

// ── SOLAR PANEL ───────────────────────────────────────────────────────────
const sH=2.6,sW=PW-.2,sTk=.05;
const sY=-PH/2+sH/2+.08;
const sCZ=-(PD/2+sTk/2+.004);
const solarR=.08;

const solarBody=new THREE.Mesh(
  (()=>{const g=new THREE.ExtrudeGeometry(rShape(sW,sH,solarR),{depth:sTk,bevelEnabled:true,bevelThickness:.008,bevelSize:.008,bevelSegments:6,curveSegments:18});g.translate(0,0,-sTk/2);return g;})(),
  new THREE.MeshStandardMaterial({color:0x2a3a4a,metalness:.5,roughness:.35})
);
p3(solarBody,0,sY,sCZ);phone.add(solarBody);

const solarFace=new THREE.Mesh(
  new THREE.PlaneGeometry(sW,sH),
  new THREE.MeshStandardMaterial({map:makeSolar(),roughness:.22,metalness:.18})
);
solarFace.rotation.y=Math.PI;
p3(solarFace,0,sY,sCZ-sTk/2-.001);phone.add(solarFace);

const sFrameOuter=new THREE.Mesh(
  (()=>{const g=new THREE.ExtrudeGeometry(rShape(sW+.026,sH+.026,solarR+.01),{depth:.006,bevelEnabled:false,curveSegments:18});g.translate(0,0,-.003);return g;})(),
  new THREE.MeshStandardMaterial({color:0x383838,metalness:.7,roughness:.3})
);
p3(sFrameOuter,0,sY,sCZ-sTk/2-.003);phone.add(sFrameOuter);

const sFrameInner=new THREE.Mesh(
  (()=>{const g=new THREE.ExtrudeGeometry(rShape(sW+.002,sH+.002,solarR+.003),{depth:.01,bevelEnabled:false,curveSegments:18});g.translate(0,0,-.005);return g;})(),
  new THREE.MeshStandardMaterial({color:0x2a3a4a,metalness:.4,roughness:.4})
);
p3(sFrameInner,0,sY,sCZ-sTk/2-.003);phone.add(sFrameInner);

const ledMat=new THREE.MeshStandardMaterial({color:0x3ecf60,emissive:0x3ecf60,emissiveIntensity:.9});
const ledMesh=new THREE.Mesh(new THREE.SphereGeometry(.034,10,10),ledMat);
p3(ledMesh,sW/2-.07,sY+sH/2-.1,sCZ-sTk/2-.01);phone.add(ledMesh);

// ── CAMERA MODULE ──────────────────────────────────────────────────────────
const cmW=.84,cmH=.76,cmD=.065,cmR=.09;
const cmX=-PW/2+cmW/2+.065,cmY2=PH/2-cmH/2-.1;
const CMZ=BZ-.002,cmFaceZ=CMZ-cmD;

const cmHouse=new THREE.Mesh(rBoxGeo(cmW,cmH,cmD,cmR),
  new THREE.MeshStandardMaterial({color:0x505050,metalness:.9,roughness:.2}));
p3(cmHouse,cmX,cmY2,CMZ-cmD/2);cmHouse.castShadow=true;phone.add(cmHouse);

const cmInner=new THREE.Mesh(rBoxGeo(cmW-.04,cmH-.04,.008,cmR-.012),
  new THREE.MeshStandardMaterial({color:0x464646,metalness:.86,roughness:.28}));
p3(cmInner,cmX,cmY2,cmFaceZ-.001);phone.add(cmInner);

function addLens(ox,oy,rO,rG,rI,col){
  const add=(geo,mat,z)=>{geo.rotateX(Math.PI/2);phone.add(p3(new THREE.Mesh(geo,mat),cmX+ox,cmY2+oy,z));};
  add(new THREE.CylinderGeometry(rO+.016,rO+.016,.026,32),new THREE.MeshStandardMaterial({color:0x303030,metalness:.93,roughness:.1}),cmFaceZ+.002);
  add(new THREE.CylinderGeometry(rO,rO,.046,32),new THREE.MeshStandardMaterial({color:0x222222,metalness:.9,roughness:.16}),cmFaceZ+.014);
  add(new THREE.CylinderGeometry(rG+.006,rG+.006,.012,32),new THREE.MeshStandardMaterial({color:col,metalness:.12,roughness:.02,transparent:true,opacity:.94}),cmFaceZ-.01);
  add(new THREE.CylinderGeometry(rG,rG,.007,32),new THREE.MeshStandardMaterial({color:0x04040a,roughness:.01,transparent:true,opacity:.97}),cmFaceZ-.015);
  phone.add(p3(new THREE.Mesh(new THREE.SphereGeometry(rI*.34,8,8),
    new THREE.MeshStandardMaterial({color:0xffffff,emissive:0xffffff,emissiveIntensity:.14,transparent:true,opacity:.28})),
    cmX+ox-rG*.3,cmY2+oy+rG*.3,cmFaceZ-.012));
}
addLens(-.05,.05,.215,.172,.092,0x0a0a1e);
addLens(.24,.22,.128,.098,.052,0x0c0c1c);
addLens(.24,-.16,.100,.078,.042,0x080818);

(()=>{
  const a=(g,m,z)=>{g.rotateX(Math.PI/2);phone.add(p3(new THREE.Mesh(g,m),cmX-.13,cmY2-.27,z));};
  a(new THREE.CylinderGeometry(.055,.055,.022,16),new THREE.MeshStandardMaterial({color:0xcdc898,emissive:0x221c04,emissiveIntensity:.3,roughness:.35}),cmFaceZ-.006);
  a(new THREE.CylinderGeometry(.040,.040,.006,16),new THREE.MeshStandardMaterial({color:0xeae6c4,emissive:0x3c3010,emissiveIntensity:.5}),cmFaceZ-.021);
})();
(()=>{
  const g=new THREE.CylinderGeometry(.028,.028,.014,12);g.rotateX(Math.PI/2);
  phone.add(p3(new THREE.Mesh(g,new THREE.MeshStandardMaterial({color:0x991010,emissive:0xcc1818,emissiveIntensity:.72})),cmX+.09,cmY2-.27,cmFaceZ-.006));
})();
(()=>{
  const g=new THREE.CylinderGeometry(.02,.02,.012,10);g.rotateX(Math.PI/2);
  phone.add(p3(new THREE.Mesh(g,new THREE.MeshStandardMaterial({color:0x1c1c1c,roughness:.7})),cmX+cmW/2-.022,cmY2,cmFaceZ-.006));
})();

// ── BUTTONS ───────────────────────────────────────────────────────────────
const pBH=PH*.13,pBD=PD*.52,pBX=PW/2+BV+.001;
phone.add(p3(new THREE.Mesh(new THREE.CylinderGeometry(.01,.01,pBH,16),
  new THREE.MeshStandardMaterial({color:0x222222,metalness:.7,roughness:.5})),pBX-.008,.06,0));
const fpFace=new THREE.Mesh(new THREE.PlaneGeometry(pBD*.9,pBH*.92),
  new THREE.MeshStandardMaterial({map:makeFingerprint(),roughness:.14,metalness:.65}));
fpFace.rotation.y=Math.PI/2;p3(fpFace,pBX+.002,.06,0);phone.add(fpFace);

const volMat=new THREE.MeshStandardMaterial({color:0xb8b8b8,metalness:.82,roughness:.18});
[-.46,-.80].forEach(y=>{
  phone.add(p3(new THREE.Mesh(new THREE.CylinderGeometry(.017,.017,PH*.088,16),volMat),PW/2+BV+.018,y,0));
});

const logoM=new THREE.Mesh(new THREE.PlaneGeometry(PD*.62,PH*.36),
  new THREE.MeshStandardMaterial({map:makeLogoTex(),roughness:.48,metalness:.42,transparent:true,opacity:.9}));
logoM.rotation.y=-Math.PI/2;p3(logoM,-(PW/2+BV+.002),-.05,0);phone.add(logoM);

phone.add(p3(new THREE.Mesh(new THREE.BoxGeometry(.38,.042,.068),
  new THREE.MeshStandardMaterial({color:0x505050,metalness:.9,roughness:.3})),0,-PH/2-BV+.002,0));
phone.add(p3(new THREE.Mesh(new THREE.BoxGeometry(.26,.024,.044),
  new THREE.MeshStandardMaterial({color:0x181818,roughness:.8})),0,-PH/2-BV+.002,0));

phone.rotation.y=-.38;phone.rotation.x=.12;

// ── INTERACTION ────────────────────────────────────────────────────────────
let drag=false,px=0,py=0;
const dn=(x,y)=>{drag=true;px=x;py=y;};
const mv=(x,y)=>{
  if(!drag)return;
  phone.rotation.y+=(x-px)*.007;
  phone.rotation.x=Math.max(-1.4,Math.min(1.4,phone.rotation.x+(y-py)*.007));
  px=x;py=y;
};
renderer.domElement.addEventListener('mousedown',e=>dn(e.clientX,e.clientY));
window.addEventListener('mousemove',e=>mv(e.clientX,e.clientY));
window.addEventListener('mouseup',()=>drag=false);
renderer.domElement.addEventListener('touchstart',e=>{e.preventDefault();dn(e.touches[0].clientX,e.touches[0].clientY);},{passive:false});
window.addEventListener('touchmove',e=>mv(e.touches[0].clientX,e.touches[0].clientY));
window.addEventListener('touchend',()=>drag=false);
renderer.domElement.addEventListener('wheel',e=>{
  cam.position.z=Math.max(2.8,Math.min(14,cam.position.z+e.deltaY*.004));
});
window.addEventListener('resize',()=>{
  cam.aspect=innerWidth/innerHeight;cam.updateProjectionMatrix();
  renderer.setSize(innerWidth,innerHeight);
});

// ── RENDER LOOP ────────────────────────────────────────────────────────────
let t=0,lastSec=-1;
(function loop(){
  requestAnimationFrame(loop);t+=.018;
  const sec=new Date().getSeconds();
  if(sec!==lastSec){lastSec=sec;drawFront();frontTex.needsUpdate=true;}
  ledMat.emissiveIntensity=.46+Math.sin(t)*.44;
  if(!drag)phone.rotation.y+=.0015;
  renderer.render(scene,cam);
})();
