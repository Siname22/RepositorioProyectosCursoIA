/**
 * phoneStyle.js
 * Screen app rendering — all canvas draw functions for the phone UI.
 * Depends on globals set by phone.js: solarWatts, compassAngle, mapSats,
 * ariaMessages, ariaThinking, currentApp.
 */

// ── Shared canvas helpers ────────────────────────────────────────────────
function rr(c, x, y, w, h, r) {
  c.beginPath();
  c.moveTo(x + r, y); c.lineTo(x + w - r, y);
  c.quadraticCurveTo(x + w, y, x + w, y + r);
  c.lineTo(x + w, y + h - r);
  c.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  c.lineTo(x + r, y + h);
  c.quadraticCurveTo(x, y + h, x, y + h - r);
  c.lineTo(x, y + r);
  c.quadraticCurveTo(x, y, x + r, y);
  c.closePath();
}

function wrapText(c, text, maxW, font) {
  c.font = font;
  const words = text.split(' ');
  const lines = []; let cur = '';
  words.forEach(w => {
    const test = cur ? cur + ' ' + w : w;
    if (c.measureText(test).width > maxW && cur) { lines.push(cur); cur = w; }
    else cur = test;
  });
  if (cur) lines.push(cur);
  return lines.length ? lines : [''];
}

// ── Shared screen primitives ─────────────────────────────────────────────
function drawBg(c, W, H) {
  c.fillStyle = '#020810'; c.fillRect(0, 0, W, H);
  c.strokeStyle = '#00d4ff08'; c.lineWidth = 1;
  for (let x = 0; x < W; x += 36) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, H); c.stroke(); }
  for (let y = 0; y < H; y += 36) { c.beginPath(); c.moveTo(0, y); c.lineTo(W, y); c.stroke(); }
  const grd = c.createRadialGradient(240, 400, 20, 240, 400, 380);
  grd.addColorStop(0, '#002244cc'); grd.addColorStop(1, 'transparent');
  c.fillStyle = grd; c.fillRect(0, 0, W, H);
}

function drawStatusBar(c, W) {
  c.fillStyle = '#000000aa'; c.fillRect(0, 0, W, 64);
  const ts = new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  c.fillStyle = '#00d4ffee'; c.font = 'bold 26px Courier New'; c.textAlign = 'left'; c.fillText(ts, 24, 44);
  c.fillStyle = '#00ff88cc'; c.font = '17px Courier New'; c.textAlign = 'right'; c.fillText('⊛ SAT', W - 58, 43);
  c.strokeStyle = '#00d4ff99'; c.lineWidth = 2; c.strokeRect(W - 50, 20, 36, 20);
  c.fillStyle = '#00d4ff77'; c.fillRect(W - 48, 22, 28, 16);
  c.fillStyle = '#00d4ffaa'; c.fillRect(W - 14, 27, 4, 10);
  c.beginPath(); c.arc(240, 32, 22, 0, Math.PI * 2); c.fillStyle = '#010306'; c.fill();
}

function drawHomeBar(c, W, H) {
  c.fillStyle = '#00000077'; c.fillRect(0, H - 68, W, 68);
  c.beginPath(); c.roundRect(166, H - 54, 148, 7, 3.5); c.fillStyle = '#00d4ff88'; c.fill();
}

function drawBackBtn(c) {
  c.beginPath(); c.roundRect(14, 76, 90, 36, 8);
  c.fillStyle = '#00d4ff12'; c.fill();
  c.strokeStyle = '#00d4ff33'; c.lineWidth = 1; c.stroke();
  c.fillStyle = '#00d4ffcc'; c.font = 'bold 17px Courier New'; c.textAlign = 'left'; c.fillText('← BACK', 24, 100);
}

// ── App: Home ────────────────────────────────────────────────────────────
function drawHome(c, W, H) {
  drawBg(c, W, H); drawStatusBar(c, W);
  const now = new Date();
  const ts = now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  c.shadowBlur = 35; c.shadowColor = '#00d4ff';
  c.fillStyle = '#eaf4ffff'; c.font = 'bold 100px Courier New'; c.textAlign = 'center'; c.fillText(ts, 240, 240);
  c.shadowBlur = 0;
  c.fillStyle = '#3a6a88'; c.font = '18px Courier New';
  c.fillText(now.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' }).toUpperCase(), 240, 278);

  // Stats strip
  c.beginPath(); c.roundRect(22, 306, 436, 108, 14);
  c.fillStyle = '#00d4ff0c'; c.fill(); c.strokeStyle = '#00d4ff20'; c.lineWidth = 1; c.stroke();
  c.fillStyle = '#00d4ffdd'; c.font = 'bold 30px Courier New'; c.textAlign = 'center';
  c.fillText((window.solarWatts || 2.3).toFixed(1) + 'W', 110, 358);
  c.fillStyle = '#3a6a88'; c.font = '14px Courier New'; c.fillText('☀ SOLAR', 110, 382);
  c.fillStyle = '#00ff88dd'; c.font = 'bold 30px Courier New'; c.fillText('⊛ 8', 290, 358);
  c.fillStyle = '#3a6a88'; c.font = '14px Courier New'; c.fillText('SATÉLITES', 290, 382);
  c.fillStyle = '#aabbcc'; c.font = 'bold 26px Courier New'; c.fillText('72%', 440, 358);
  c.fillStyle = '#3a6a88'; c.font = '14px Courier New'; c.fillText('BATERÍA', 440, 382);

  // App icons
  const apps = [['☀️','SOLAR',22,442],['🛰️','SAT MAP',252,442],['🧭','BRÚJULA',22,606],['🤖','ARIA AI',252,606]];
  apps.forEach(([em, lb, x, y]) => {
    c.beginPath(); c.roundRect(x, y, 208, 134, 22);
    c.fillStyle = '#00d4ff0b'; c.fill(); c.strokeStyle = '#00d4ff1a'; c.lineWidth = 1; c.stroke();
    c.font = '54px serif'; c.textAlign = 'center'; c.fillText(em, x + 104, y + 74);
    c.fillStyle = '#4a7a9b'; c.font = '16px Courier New'; c.fillText(lb, x + 104, y + 114);
  });
  drawHomeBar(c, W, H);
}

// ── App: Solar Monitor ───────────────────────────────────────────────────
function drawSolar(c, W, H) {
  drawBg(c, W, H); drawStatusBar(c, W); drawBackBtn(c);
  c.fillStyle = '#00d4ffcc'; c.font = 'bold 18px Courier New'; c.textAlign = 'center'; c.fillText('☀ MONITOR SOLAR', W / 2, 108);

  // Solar panel grid visual
  const px = 30, py = 136, pw = 420, ph = 220, cols = 6, rows = 4;
  c.fillStyle = '#040e1c'; c.fillRect(px, py, pw, ph);
  const h = new Date().getHours();
  const active = Math.max(0, Math.sin((h - 6) / 12 * Math.PI));
  for (let r = 0; r < rows; r++) for (let cc = 0; cc < cols; cc++) {
    const cx = px + cc * (pw / cols) + 2, cy = py + r * (ph / rows) + 2;
    const cw = pw / cols - 4, ch = ph / rows - 4;
    const v = active * (0.4 + Math.random() * 0.6);
    const bg = c.createLinearGradient(cx, cy, cx + cw, cy + ch);
    bg.addColorStop(0, `rgba(${10 + v * 40},${30 + v * 80},${180 + v * 50},${0.3 + v * 0.6})`);
    bg.addColorStop(1, `rgba(${5 + v * 20},${20 + v * 50},${150 + v * 40},${0.25 + v * 0.5})`);
    c.fillStyle = bg; c.fillRect(cx, cy, cw, ch);
    c.strokeStyle = `rgba(0,212,255,${0.1 + v * 0.25})`; c.lineWidth = .7; c.strokeRect(cx + .5, cy + .5, cw - 1, ch - 1);
    for (let b = 1; b < 4; b++) {
      c.strokeStyle = `rgba(200,210,220,${0.08 + v * 0.14})`; c.lineWidth = .8;
      c.beginPath(); c.moveTo(cx, cy + ch * b / 4); c.lineTo(cx + cw, cy + ch * b / 4); c.stroke();
    }
  }
  c.strokeStyle = '#00d4ff33'; c.lineWidth = 1.5; c.strokeRect(px, py, pw, ph);

  // Stats
  const sw = window.solarWatts || 2.3;
  const stats = [['WATTS', sw.toFixed(1) + 'W', '#00d4ff'], ['VOLTAJE', '5.4V', '#00d4ff'], ['EFICIENCIA', '23.8%', '#00ff88'], ['TEMP PANEL', '38°C', '#ffaa44']];
  stats.forEach(([lb, val, col], i) => {
    const sx = 30 + i * 112, sy = 390;
    c.beginPath(); c.roundRect(sx, sy, 104, 76, 10); c.fillStyle = '#00d4ff08'; c.fill(); c.strokeStyle = '#00d4ff18'; c.lineWidth = 1; c.stroke();
    c.fillStyle = col; c.font = 'bold 22px Courier New'; c.textAlign = 'center'; c.fillText(val, sx + 52, sy + 38);
    c.fillStyle = '#3a6a88'; c.font = '12px Courier New'; c.fillText(lb, sx + 52, sy + 60);
  });

  // Battery bar
  c.fillStyle = '#3a6a88'; c.font = '13px Courier New'; c.textAlign = 'left'; c.fillText('BATERÍA  72%', 30, 510);
  c.fillStyle = '#0a1828'; c.fillRect(30, 520, 420, 22); c.strokeStyle = '#00d4ff22'; c.lineWidth = 1; c.strokeRect(30, 520, 420, 22);
  const g2 = c.createLinearGradient(30, 0, 30 + 420 * .72, 0);
  g2.addColorStop(0, '#0044cc'); g2.addColorStop(1, '#00d4ff');
  c.fillStyle = g2; c.fillRect(31, 521, 420 * .72, 20);
  drawHomeBar(c, W, H);
}

// ── App: Satellite Map ───────────────────────────────────────────────────
function drawMap(c, W, H) {
  drawBg(c, W, H); drawStatusBar(c, W); drawBackBtn(c);
  c.fillStyle = '#00d4ffcc'; c.font = 'bold 18px Courier New'; c.textAlign = 'center'; c.fillText('🛰️ SAT MAP — OFFLINE', W / 2, 108);

  const mx = 20, my = 130, mw = 440, mh = 780;
  c.fillStyle = '#030912'; c.fillRect(mx, my, mw, mh);
  c.strokeStyle = '#00d4ff0a'; c.lineWidth = 1;
  for (let x = mx; x < mx + mw; x += 40) { c.beginPath(); c.moveTo(x, my); c.lineTo(x, my + mh); c.stroke(); }
  for (let y = my; y < my + mh; y += 40) { c.beginPath(); c.moveTo(mx, y); c.lineTo(mx + mw, y); c.stroke(); }

  // Terrain blobs
  [[.25,.35,80,40],[.7,.25,55,30],[.15,.7,70,35],[.8,.65,45,25],[.5,.85,60,28]].forEach(([rx,ry,rw,rh]) => {
    c.beginPath(); c.ellipse(mx + rx * mw, my + ry * mh, rw, rh, 0, 0, Math.PI * 2);
    c.fillStyle = '#0a1f30'; c.fill();
  });

  // Satellites
  (window.mapSats || []).forEach(s => {
    const sx = mx + s.x / 440 * mw, sy = my + s.y / 900 * mh;
    c.strokeStyle = '#00d4ff33'; c.lineWidth = .7; c.beginPath(); c.arc(sx, sy, 10, 0, Math.PI * 2); c.stroke();
    c.fillStyle = '#00d4ffee'; c.beginPath(); c.arc(sx, sy, 2, 0, Math.PI * 2); c.fill();
    c.strokeStyle = '#00d4ff55'; c.lineWidth = .5;
    c.beginPath(); c.moveTo(sx - 6, sy); c.lineTo(sx + 6, sy); c.stroke();
    c.beginPath(); c.moveTo(sx, sy - 6); c.lineTo(sx, sy + 6); c.stroke();
  });

  // User position pulse
  const t = Date.now() / 1000, pu = (Math.sin(t * 2) + 1) / 2;
  c.strokeStyle = `rgba(0,255,136,${0.3 + pu * 0.5})`; c.lineWidth = 1.5;
  c.beginPath(); c.arc(mx + mw / 2, my + mh / 2, 10 + pu * 10, 0, Math.PI * 2); c.stroke();
  c.fillStyle = '#00ff88'; c.beginPath(); c.arc(mx + mw / 2, my + mh / 2, 4, 0, Math.PI * 2); c.fill();
  c.strokeStyle = '#00ff88aa'; c.lineWidth = 2; c.beginPath(); c.arc(mx + mw / 2, my + mh / 2, 6, 0, Math.PI * 2); c.stroke();
  c.fillStyle = '#00d4ff66'; c.font = '12px Courier New'; c.textAlign = 'center';
  c.fillText('40.4168°N  3.7038°O', mx + mw / 2, my + mh / 2 - 18);

  // Scan line
  const sly = my + ((t * 60) % mh);
  const sg = c.createLinearGradient(0, sly - 20, 0, sly + 4);
  sg.addColorStop(0, 'transparent'); sg.addColorStop(1, 'rgba(0,212,255,.06)');
  c.fillStyle = sg; c.fillRect(mx, sly - 20, mw, 24);
  c.strokeStyle = '#00d4ff22'; c.lineWidth = 1.5; c.strokeRect(mx, my, mw, mh);
  drawHomeBar(c, W, H);
}

// ── App: Compass ─────────────────────────────────────────────────────────
function drawCompass(c, W, H) {
  drawBg(c, W, H); drawStatusBar(c, W); drawBackBtn(c);
  c.fillStyle = '#00d4ffcc'; c.font = 'bold 18px Courier New'; c.textAlign = 'center'; c.fillText('🧭 BRÚJULA + GPS', W / 2, 108);

  const ca = window.compassAngle || 0;
  c.shadowBlur = 20; c.shadowColor = '#00d4ff';
  c.fillStyle = '#00d4ffee'; c.font = 'bold 72px Courier New'; c.textAlign = 'center'; c.fillText(Math.round(ca) + '°', W / 2, 228);
  c.shadowBlur = 0;
  const dirs = ['N','NE','E','SE','S','SO','O','NO'];
  c.fillStyle = '#3a6a88'; c.font = '22px Courier New'; c.fillText(dirs[Math.round(ca / 45) % 8], W / 2, 268);

  // Rose
  const CR = 168, CX = W / 2, CY = 520;
  c.save(); c.translate(CX, CY); c.rotate(-ca * Math.PI / 180);
  const rg = c.createRadialGradient(0, 0, CR - 18, 0, 0, CR + 6);
  rg.addColorStop(0, '#00d4ff18'); rg.addColorStop(1, 'transparent');
  c.fillStyle = rg; c.beginPath(); c.arc(0, 0, CR + 6, 0, Math.PI * 2); c.fill();
  c.strokeStyle = '#00d4ff33'; c.lineWidth = 1.2; c.beginPath(); c.arc(0, 0, CR, 0, Math.PI * 2); c.stroke();
  for (let i = 0; i < 72; i++) {
    const a = i * 5 * Math.PI / 180, big = i % 18 === 0, mid = i % 9 === 0;
    const l = big ? 18 : mid ? 10 : 5;
    c.strokeStyle = big ? '#00d4ffcc' : mid ? '#00d4ff55' : '#00d4ff28';
    c.lineWidth = big ? 1.8 : mid ? .9 : .5;
    c.beginPath(); c.moveTo(Math.sin(a) * (CR - 1), -Math.cos(a) * (CR - 1));
    c.lineTo(Math.sin(a) * (CR - 1 - l), -Math.cos(a) * (CR - 1 - l)); c.stroke();
  }
  c.font = 'bold 18px Courier New'; c.textAlign = 'center'; c.textBaseline = 'middle';
  [['N',0,'#ff5555'],['E',90,'#00d4ff'],['S',180,'#00d4ff'],['O',270,'#00d4ff']].forEach(([lb,deg,col]) => {
    const a = deg * Math.PI / 180, dr = CR - 36;
    c.fillStyle = col; c.shadowBlur = lb === 'N' ? 12 : 0; c.shadowColor = col;
    c.fillText(lb, Math.sin(a) * dr, -Math.cos(a) * dr);
  });
  c.shadowBlur = 0; c.restore();

  // Needle
  c.save(); c.translate(CX, CY);
  c.fillStyle = '#ff4444'; c.shadowBlur = 12; c.shadowColor = '#ff4444';
  c.beginPath(); c.moveTo(0, -(CR - 28)); c.lineTo(-7, 0); c.lineTo(0, 9); c.lineTo(7, 0); c.closePath(); c.fill();
  c.fillStyle = '#223344'; c.shadowBlur = 0;
  c.beginPath(); c.moveTo(0, CR - 28); c.lineTo(-7, 0); c.lineTo(0, -9); c.lineTo(7, 0); c.closePath(); c.fill();
  c.fillStyle = '#00d4ff'; c.shadowBlur = 10; c.shadowColor = '#00d4ff';
  c.beginPath(); c.arc(0, 0, 7, 0, Math.PI * 2); c.fill(); c.restore();

  // Coords
  c.beginPath(); c.roundRect(14, 680, 452, 70, 10);
  c.fillStyle = '#00d4ff08'; c.fill(); c.strokeStyle = '#00d4ff18'; c.lineWidth = 1; c.stroke();
  c.fillStyle = '#00d4ffaa'; c.font = '14px Courier New'; c.textAlign = 'center';
  c.fillText('40.4168°N   3.7038°O   Alt: 667m', W / 2, 720);
  drawHomeBar(c, W, H);
}

// ── App: ARIA AI ──────────────────────────────────────────────────────────
function drawAria(c, W, H) {
  drawBg(c, W, H); drawStatusBar(c, W); drawBackBtn(c);
  c.beginPath(); c.roundRect(110, 76, 260, 40, 10); c.fillStyle = '#001888'; c.fill(); c.strokeStyle = '#00d4ff44'; c.lineWidth = 1; c.stroke();
  c.fillStyle = '#00d4ffcc'; c.font = 'bold 16px Courier New'; c.textAlign = 'center'; c.fillText('⚡ ARIA — IA SAT-LINK', W / 2, 103);

  const msgs = window.ariaMessages || [];
  let yp = 130;
  msgs.forEach(m => {
    const isU = m.role === 'user';
    const lines = wrapText(c, m.text, 360, '13px Courier New');
    const bh = lines.length * 20 + 20;
    c.font = '13px Courier New';
    const bw = Math.min(370, lines.reduce((a, l) => Math.max(a, c.measureText(l).width), 0) + 24);
    const bxl = isU ? W - 14 - bw : 14;
    if (yp + bh < 950) {
      c.beginPath(); c.roundRect(bxl, yp, bw, bh, isU ? [10, 3, 10, 10] : [3, 10, 10, 10]);
      c.fillStyle = isU ? '#003399' : '#0a1828'; c.fill();
      c.strokeStyle = isU ? '#0055cc33' : '#00d4ff22'; c.lineWidth = .8; c.stroke();
      c.fillStyle = isU ? '#cce4ff' : '#b0d0e8'; c.font = '13px Courier New';
      c.textAlign = isU ? 'right' : 'left';
      lines.forEach((l, i) => c.fillText(l, isU ? bxl + bw - 12 : bxl + 12, yp + 18 + i * 20));
      yp += bh + 8;
    }
  });
  if (window.ariaThinking) {
    c.beginPath(); c.roundRect(14, Math.min(yp, 900), 80, 36, [3, 10, 10, 10]);
    c.fillStyle = '#0a1828'; c.fill(); c.strokeStyle = '#00d4ff22'; c.lineWidth = .8; c.stroke();
    const t = Date.now() / 400;
    c.fillStyle = '#00d4ffcc'; c.font = '22px Courier New'; c.textAlign = 'left';
    c.fillText(['·  ', '·· ', '···'][Math.floor(t) % 3], 24, yp + 24);
  }
  drawHomeBar(c, W, H);
}

// ── Screen clip ───────────────────────────────────────────────────────────
function clipRounded(c, W, H, r) {
  c.beginPath();
  c.moveTo(r, 0); c.lineTo(W - r, 0); c.quadraticCurveTo(W, 0, W, r);
  c.lineTo(W, H - r); c.quadraticCurveTo(W, H, W - r, H);
  c.lineTo(r, H); c.quadraticCurveTo(0, H, 0, H - r);
  c.lineTo(0, r); c.quadraticCurveTo(0, 0, r, 0);
  c.closePath(); c.clip();
}

// ── Main draw dispatcher ──────────────────────────────────────────────────
function drawScreen(scrCv, sctx, scrTex) {
  const c = sctx, W = scrCv.width, H = scrCv.height;
  c.clearRect(0, 0, W, H);
  c.save();
  clipRounded(c, W, H, 88);
  c.fillStyle = '#020810'; c.fillRect(0, 0, W, H);
  const app = window.currentApp || 'home';
  if      (app === 'home')    drawHome(c, W, H);
  else if (app === 'solar')   drawSolar(c, W, H);
  else if (app === 'map')     drawMap(c, W, H);
  else if (app === 'compass') drawCompass(c, W, H);
  else if (app === 'aria')    drawAria(c, W, H);
  // Scanlines overlay
  for (let y = 0; y < H; y += 4) { c.fillStyle = '#00000015'; c.fillRect(0, y, W, 2); }
  c.restore();
  if (scrTex) scrTex.needsUpdate = true;
}

// Expose
window.drawScreen    = drawScreen;
window.drawHome      = drawHome;
window.drawSolar     = drawSolar;
window.drawMap       = drawMap;
window.drawCompass   = drawCompass;
window.drawAria      = drawAria;
