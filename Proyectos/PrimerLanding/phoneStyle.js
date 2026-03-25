// Texturas "estilizadas" para el modelo del teléfono.
// Aquí estamos creando texturas con canvas, que se pueden usar como map en Three.js.

const mk = (w, h) => {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  return c;
};


const rr = (c, x, y, w, h, r) => {
  c.beginPath();
  c.moveTo(x + r, y);
  c.lineTo(x + w - r, y);
  c.quadraticCurveTo(x + w, y, x + w, y + r);
  c.lineTo(x + w, y + h - r);
  c.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  c.lineTo(x + r, y + h);
  c.quadraticCurveTo(x, y + h, x, y + h - r);
  c.lineTo(x, y + r);
  c.quadraticCurveTo(x, y, x + r, y);
  c.closePath();
};

const rShape = (w, h, r) => {
  const s = new THREE.Shape();
  s.moveTo(-w / 2 + r, -h / 2);
  s.lineTo(w / 2 - r, -h / 2);
  s.quadraticCurveTo(w / 2, -h / 2, w / 2, -h / 2 + r);
  s.lineTo(w / 2, h / 2 - r);
  s.quadraticCurveTo(w / 2, h / 2, w / 2 - r, h / 2);
  s.lineTo(-w / 2 + r, h / 2);
  s.quadraticCurveTo(-w / 2, h / 2, -w / 2, h / 2 - r);
  s.lineTo(-w / 2, -h / 2 + r);
  s.quadraticCurveTo(-w / 2, -h / 2, -w / 2 + r, -h / 2);
  return s;
};

let frontCanvas = null;
let frontCtx = null;
let frontTex = null;

function ensureFront() {
  if (!frontCanvas) {
    const W = 512;
    const H = 1024;
    frontCanvas = mk(W, H);
    frontCtx = frontCanvas.getContext("2d");
    frontTex = new THREE.CanvasTexture(frontCanvas);
    frontTex.encoding = THREE.sRGBEncoding;
    frontTex.flipY = false;
  }
  return { frontCanvas, frontCtx, frontTex };
}

function drawFront() {
  const { frontCanvas: c, frontCtx: g, frontTex: tex } = ensureFront();
  const W = c.width;
  const H = c.height;

  g.clearRect(0, 0, W, H);

  // Base gradient
  const gr = g.createLinearGradient(0, 0, W, H);
  gr.addColorStop(0, "#000c2e");
  gr.addColorStop(0.45, "#001650");
  gr.addColorStop(1, "#000a24");
  g.fillStyle = gr;
  g.fillRect(0, 0, W, H);

  // Glow
  const gl = g.createRadialGradient(W / 2, H * 0.38, 10, W / 2, H * 0.38, 380);
  gl.addColorStop(0, "rgba(0,100,255,0.55)");
  gl.addColorStop(0.5, "rgba(0,60,200,0.18)");
  gl.addColorStop(1, "transparent");
  g.fillStyle = gl;
  g.fillRect(0, 0, W, H);

  // Scanlines
  g.fillStyle = "rgba(0,30,80,0.06)";
  for (let y = 0; y < H; y += 4) {
    g.fillRect(0, y, W, 2);
  }

  // Punch-hole
  [[27, "#000510"], [19, "#010818"], [10, "#00030c"]].forEach(([r, col]) => {
    g.beginPath();
    g.arc(W / 2, 56, r, 0, Math.PI * 2);
    g.fillStyle = col;
    g.fill();
  });
  g.beginPath();
  g.arc(W / 2 - 6, 50, 4, 0, Math.PI * 2);
  g.fillStyle = "rgba(80,160,255,0.28)";
  g.fill();

  // Clock + text
  const now = new Date();
  const hh = String(now.getHours()).padStart(2, "0");
  const mm = String(now.getMinutes()).padStart(2, "0");
  const ss = String(now.getSeconds()).padStart(2, "0");
  const dateStr = now.toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" });

  g.textAlign = "center";
  g.shadowColor = "#0066ff";
  g.shadowBlur = 32;
  g.fillStyle = "#cce0ff";
  g.font = "bold 130px Arial";
  g.fillText(`${hh}:${mm}`, W / 2, H * 0.22);
  g.shadowBlur = 0;
  g.fillStyle = "rgba(80,160,255,0.75)";
  g.font = "bold 44px Arial";
  g.fillText(
    ":" + ss,
    W / 2 + 128,
    H * 0.22 - 52
  );
  g.font = "300 30px Arial";
  g.fillStyle = "rgba(100,170,255,0.6)";
  g.fillText(dateStr, W / 2, H * 0.22 + 52);

  // Divider
  g.strokeStyle = "rgba(0,100,255,0.3)";
  g.lineWidth = 1;
  g.beginPath();
  g.moveTo(W * 0.1, H * 0.27);
  g.lineTo(W * 0.9, H * 0.27);
  g.stroke();

  // Product name
  g.shadowColor = "#0055ff";
  g.shadowBlur = 70;
  g.fillStyle = "rgba(40,120,255,0.25)";
  g.font = "bold 74px Arial";
  g.fillText("Link-IA One", W / 2, H * 0.4);
  g.shadowBlur = 30;
  g.fillStyle = "rgba(100,180,255,0.65)";
  g.fillText("Link-IA One", W / 2, H * 0.4);
  g.shadowBlur = 8;
  g.fillStyle = "#e0f0ff";
  g.fillText("Link-IA One", W / 2, H * 0.4);
  g.shadowBlur = 0;

  g.font = "300 23px Arial";
  g.fillStyle = "rgba(60,140,255,0.52)";
  g.fillText("A I  ·  S O L A R  ·  O N E", W / 2, H * 0.4 + 54);

  // Divider 2
  g.strokeStyle = "rgba(0,80,200,0.25)";
  g.beginPath();
  g.moveTo(W * 0.1, H * 0.46);
  g.lineTo(W * 0.9, H * 0.46);
  g.stroke();

  // Battery + solar bars
  const bat = 82;
  const sol = 71;
  const bx = W * 0.1;
  const barW = W * 0.8;
  const barH = 40;
  const br = 10;

  const by = H * 0.5;
  rr(g, bx, by, barW, barH, br);
  g.fillStyle = "rgba(0,20,60,0.7)";
  g.fill();
  rr(g, bx, by, barW * (bat / 100), barH, br);
  const bg = g.createLinearGradient(bx, 0, bx + barW, 0);
  bg.addColorStop(0, "rgba(0,180,100,0.9)");
  bg.addColorStop(1, "rgba(0,230,120,0.7)");
  g.fillStyle = bg;
  g.fill();
  g.fillStyle = "rgba(255,255,255,0.9)";
  g.font = "bold 23px Arial";
  g.textAlign = "left";
  g.fillText(`🔋  Batería`, bx + 14, by + 27);
  g.textAlign = "right";
  g.fillText(`${bat}%`, bx + barW - 14, by + 27);

  const sy = H * 0.5 + 60;
  rr(g, bx, sy, barW, barH, br);
  g.fillStyle = "rgba(0,20,60,0.7)";
  g.fill();
  rr(g, bx, sy, barW * (sol / 100), barH, br);
  const sg = g.createLinearGradient(bx, 0, bx + barW, 0);
  sg.addColorStop(0, "rgba(0,160,255,0.9)");
  sg.addColorStop(1, "rgba(40,220,255,0.7)");
  g.fillStyle = sg;
  g.fill();
  g.fillStyle = "rgba(255,255,255,0.9)";
  g.textAlign = "left";
  g.fillText(`☀  Solar`, bx + 14, sy + 27);
  g.textAlign = "right";
  g.fillText(`${sol}%`, bx + barW - 14, sy + 27);

  return new THREE.CanvasTexture(c);
}

function makeFrontTexture() {
  drawFront();
  return ensureFront().frontTex;
}

function updateFrontTexture() {
  drawFront();
  const { frontTex } = ensureFront();
  frontTex.needsUpdate = true;
}

function makeBackTexture() {
  const W = 512;
  const H = 1024;
  const c = mk(W, H);
  const g = c.getContext("2d");

  const gr = g.createLinearGradient(W, 0, 0, H);
  gr.addColorStop(0, "#1a1a1a");
  gr.addColorStop(0.4, "#141414");
  gr.addColorStop(1, "#0e0e0e");

  g.fillStyle = gr;
  g.fillRect(0, 0, W, H);

  g.strokeStyle = "rgba(255,255,255,0.03)";
  g.lineWidth = 1;
  for (let y = 0; y < H; y += 3) {
    g.beginPath();
    g.moveTo(0, y);
    g.lineTo(W, y);
    g.stroke();
  }

  return new THREE.CanvasTexture(c);
}

function makeSolarTexture() {
  const W = 512;
  const H = 768;
  const c = mk(W, H);
  const g = c.getContext("2d");

  g.fillStyle = "#b8b8b8";
  g.fillRect(0, 0, W, H);

  g.strokeStyle = "#a0a0a0";
  g.lineWidth = 0.9;
  for (let x = 0; x < W; x += 16) {
    g.beginPath();
    g.moveTo(x, 0);
    g.lineTo(x, H);
    g.stroke();
  }
  for (let y = 0; y < H; y += 16) {
    g.beginPath();
    g.moveTo(0, y);
    g.lineTo(W, y);
    g.stroke();
  }

  g.strokeStyle = "rgba(80,80,80,0.18)";
  g.lineWidth = 0.6;
  for (let i = -H; i < W + H; i += 26) {
    g.beginPath();
    g.moveTo(i, 0);
    g.lineTo(i + H, H);
    g.stroke();
  }

  g.fillStyle = "rgba(120,120,120,0.06)";
  for (let x = 0; x < W; x += 32) {
    for (let y = 0; y < H; y += 32) {
      if (((x / 32) + (y / 32)) % 2 === 0) {
        g.fillRect(x, y, 16, 16);
        g.fillRect(x + 16, y + 16, 16, 16);
      }
    }
  }

  return new THREE.CanvasTexture(c);
}

function makeFingerprintTexture() {
  const S = 256;
  const c = mk(S, S);
  const g = c.getContext("2d");

  const gr = g.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S / 2);
  gr.addColorStop(0, "#7e7e7e");
  gr.addColorStop(1, "#686868");
  g.fillStyle = gr;
  g.fillRect(0, 0, S, S);

  g.strokeStyle = "rgba(35,35,35,0.92)";
  g.lineWidth = 1.4;
  g.lineCap = "round";

  const cx = S / 2;
  const cy = S / 2;
  for (let i = 0; i < 13; i++) {
    const r = 5 + i * 8.5;
    if (r > S * 0.47) break;
    g.beginPath();
    g.arc(cx, cy - 3, r, Math.PI * 0.07, Math.PI * 0.93);
    g.stroke();
    g.beginPath();
    g.arc(cx, cy + 3, r, Math.PI * 1.07, Math.PI * 1.93);
    g.stroke();
  }

  g.beginPath();
  g.arc(cx, cy, 4, 0, Math.PI * 2);
  g.fillStyle = "rgba(30,30,30,0.75)";
  g.fill();

  const rg = g.createRadialGradient(cx, cy, 0, cx, cy, S * 0.45);
  rg.addColorStop(0, "rgba(60,140,255,0.1)");
  rg.addColorStop(1, "transparent");
  g.fillStyle = rg;
  g.fillRect(0, 0, S, S);

  return new THREE.CanvasTexture(c);
}

function makeLogoTexture() {
  const W = 48;
  const H = 512;
  const c = mk(W, H);
  const g = c.getContext("2d");

  g.save();
  g.translate(W / 2, H / 2);
  g.rotate(-Math.PI / 2);
  g.textAlign = "center";
  g.textBaseline = "middle";
  g.font = "300 20px Arial";
  g.fillStyle = "rgba(80,80,80,0.9)";
  g.fillText("LINK-IA  ONE", 0, 0);
  g.strokeStyle = "rgba(75,75,75,0.38)";
  g.lineWidth = 0.8;
  g.beginPath();
  g.moveTo(-185, 14);
  g.lineTo(-115, 14);
  g.stroke();
  g.beginPath();
  g.moveTo(115, 14);
  g.lineTo(185, 14);
  g.stroke();
  g.restore();

  return new THREE.CanvasTexture(c);
}

// Expose helpers for classic script loading
window.makeFrontTexture = makeFrontTexture;
window.updateFrontTexture = updateFrontTexture;
window.makeBackTexture = makeBackTexture;
window.makeSolarTexture = makeSolarTexture;
window.makeFingerprintTexture = makeFingerprintTexture;
window.makeLogoTexture = makeLogoTexture;
