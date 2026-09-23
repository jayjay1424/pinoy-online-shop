import * as THREE from 'three';

// ============================================================================
// PHOTOREALISTIC PROCEDURAL TEXTURE GENERATORS
// ============================================================================

// 1. Dual-Tone Woven Palm Leaf (Pandan & Buri Herringbone Weave)
function createWovenPalmTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');

  // Neutral golden straw base
  ctx.fillStyle = '#C8A878';
  ctx.fillRect(0, 0, 1024, 1024);

  const tileSize = 32;
  const numTiles = 1024 / tileSize;

  for (let row = 0; row < numTiles; row++) {
    for (let col = 0; col < numTiles; col++) {
      const x = col * tileSize;
      const y = row * tileSize;
      const isDiagonalA = ((col + row) % 2 === 0);

      // Natural variation in dried palm leaf strand hue
      const naturalShadeVar = (Math.sin(col * 3.7 + row * 2.1) + Math.cos(col * 1.3 - row * 4.2)) * 0.09;
      const baseLuma = isDiagonalA ? 205 : 172;
      const luma = Math.min(255, Math.max(75, Math.floor(baseLuma + naturalShadeVar * 65)));

      const grad = isDiagonalA
        ? ctx.createLinearGradient(x, y, x + tileSize, y + tileSize)
        : ctx.createLinearGradient(x, y + tileSize, x + tileSize, y);

      grad.addColorStop(0, `rgb(${Math.floor(luma * 0.76)}, ${Math.floor(luma * 0.63)}, ${Math.floor(luma * 0.43)})`);
      grad.addColorStop(0.35, `rgb(${Math.floor(luma * 1.08)}, ${Math.floor(luma * 0.95)}, ${Math.floor(luma * 0.74)})`);
      grad.addColorStop(0.68, `rgb(${Math.floor(luma * 0.94)}, ${Math.floor(luma * 0.81)}, ${Math.floor(luma * 0.58)})`);
      grad.addColorStop(1, `rgb(${Math.floor(luma * 0.68)}, ${Math.floor(luma * 0.56)}, ${Math.floor(luma * 0.36)})`);

      ctx.fillStyle = grad;
      ctx.fillRect(x + 1, y + 1, tileSize - 2, tileSize - 2);

      // Deep interlocking weave shadow seams
      ctx.strokeStyle = 'rgba(32, 18, 10, 0.60)';
      ctx.lineWidth = 1.8;
      ctx.strokeRect(x + 0.5, y + 0.5, tileSize - 1, tileSize - 1);

      // Microscopic parallel leaf fiber striations
      ctx.strokeStyle = 'rgba(60, 38, 20, 0.25)';
      ctx.lineWidth = 0.9;
      for (let s = 3; s < tileSize; s += 4) {
        ctx.beginPath();
        if (isDiagonalA) {
          ctx.moveTo(x + s, y);
          ctx.lineTo(x + tileSize, y + tileSize - s);
        } else {
          ctx.moveTo(x, y + s);
          ctx.lineTo(x + tileSize - s, y + tileSize);
        }
        ctx.stroke();
      }

      // Specular highlight fiber ridge
      ctx.strokeStyle = 'rgba(255, 250, 230, 0.28)';
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      if (isDiagonalA) {
        ctx.moveTo(x + 8, y + 2);
        ctx.lineTo(x + tileSize - 2, y + tileSize - 8);
      } else {
        ctx.moveTo(x + 2, y + 8);
        ctx.lineTo(x + tileSize - 8, y + tileSize - 2);
      }
      ctx.stroke();
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(1, 1);
  texture.anisotropy = 16;
  return texture;
}

// Tangent-Space Normal Map for deep woven Pandan twill relief
function createWovenPalmNormalTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = 'rgb(128, 128, 255)';
  ctx.fillRect(0, 0, 512, 512);

  const tileSize = 32;
  for (let y = 0; y < 512; y += tileSize) {
    for (let x = 0; x < 512; x += tileSize) {
      const isEven = ((x / tileSize) + (y / tileSize)) % 2 === 0;
      const grad = isEven
        ? ctx.createLinearGradient(x, y, x + tileSize, y + tileSize)
        : ctx.createLinearGradient(x, y + tileSize, x + tileSize, y);
      
      grad.addColorStop(0, 'rgb(75, 75, 235)');
      grad.addColorStop(0.5, 'rgb(128, 128, 255)');
      grad.addColorStop(1, 'rgb(185, 185, 245)');

      ctx.fillStyle = grad;
      ctx.fillRect(x + 1, y + 1, tileSize - 2, tileSize - 2);

      ctx.strokeStyle = 'rgb(105, 105, 205)';
      ctx.lineWidth = 2.0;
      ctx.strokeRect(x, y, tileSize, tileSize);
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(1, 1);
  texture.anisotropy = 16;
  return texture;
}

// Bump map specifically tuned for woven relief
function createWovenPalmBumpTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#808080';
  ctx.fillRect(0, 0, 512, 512);

  const tileSize = 32;
  for (let y = 0; y < 512; y += tileSize) {
    for (let x = 0; x < 512; x += tileSize) {
      const isEven = ((x / tileSize) + (y / tileSize)) % 2 === 0;
      const grad = ctx.createLinearGradient(x, y, x + tileSize, y + tileSize);
      if (isEven) {
        grad.addColorStop(0, '#1E1E1E');
        grad.addColorStop(0.5, '#FDFDFD');
        grad.addColorStop(1, '#1E1E1E');
      } else {
        grad.addColorStop(0, '#F5F5F5');
        grad.addColorStop(0.5, '#181818');
        grad.addColorStop(1, '#F5F5F5');
      }
      ctx.fillStyle = grad;
      ctx.fillRect(x + 1, y + 1, tileSize - 2, tileSize - 2);

      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 2.5;
      ctx.strokeRect(x, y, tileSize, tileSize);
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(1, 1);
  texture.anisotropy = 16;
  return texture;
}

// 2. Full-Grain Vachetta Leather
function createLeatherBumpTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#808080';
  ctx.fillRect(0, 0, 512, 512);

  // Organic cellular pebble grain
  const cellCount = 2200;
  for (let i = 0; i < cellCount; i++) {
    const cx = Math.random() * 512;
    const cy = Math.random() * 512;
    const radius = 2.2 + Math.random() * 4.2;

    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
    grad.addColorStop(0, '#D0D0D0');
    grad.addColorStop(0.65, '#909090');
    grad.addColorStop(1, '#484848');

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fill();
  }

  // Micro-creases
  ctx.strokeStyle = 'rgba(35, 35, 35, 0.45)';
  ctx.lineWidth = 1;
  for (let c = 0; c < 100; c++) {
    const sx = Math.random() * 512;
    const sy = Math.random() * 512;
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.bezierCurveTo(
      sx + (Math.random() - 0.5) * 40,
      sy + (Math.random() - 0.5) * 40,
      sx + (Math.random() - 0.5) * 60,
      sy + (Math.random() - 0.5) * 60,
      sx + (Math.random() - 0.5) * 80,
      sy + (Math.random() - 0.5) * 80
    );
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(4, 4);
  return texture;
}

// 3. Ilocos Inabel Cotton Lining Texture (Interior cavity for Bayong)
function createInabelLiningTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  // Natural unbleached ecru cotton
  ctx.fillStyle = '#E8DFD1';
  ctx.fillRect(0, 0, 512, 512);

  // Traditional Inabel diamond twill warp & weft micro-pattern
  const step = 16;
  for (let y = 0; y < 512; y += step) {
    for (let x = 0; x < 512; x += step) {
      const isLight = ((x / step) + (y / step)) % 2 === 0;
      ctx.fillStyle = isLight ? '#F0E8DC' : '#DFCDB9';
      ctx.fillRect(x, y, step, step);

      // Fine woven thread striations
      ctx.strokeStyle = 'rgba(120, 100, 80, 0.2)';
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.moveTo(x, y + step / 2);
      ctx.lineTo(x + step, y + step / 2);
      ctx.moveTo(x + step / 2, y);
      ctx.lineTo(x + step / 2, y + step);
      ctx.stroke();
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(6, 6);
  return texture;
}

// 4. Native Kamagong (Philippine Ebony) Wood Grain Texture
function createKamagongWoodTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');

  // Deep dark ebony foundation
  ctx.fillStyle = '#160C07';
  ctx.fillRect(0, 0, 1024, 1024);

  // Wavy vertical heartwood grain bands with rich amber figures
  const numBands = 95;
  for (let i = 0; i < numBands; i++) {
    const xBase = (i / numBands) * 1024;
    const isAmberStreak = (i % 6 === 0 || i % 9 === 0);

    ctx.beginPath();
    ctx.moveTo(xBase, 0);

    for (let y = 0; y <= 1024; y += 24) {
      const wave = Math.sin(y * 0.007 + i * 0.45) * 26 + Math.cos(y * 0.014) * 14;
      ctx.lineTo(xBase + wave, y);
    }

    if (isAmberStreak) {
      ctx.strokeStyle = 'rgba(175, 115, 58, 0.46)';
      ctx.lineWidth = 4 + Math.random() * 7;
    } else {
      ctx.strokeStyle = Math.random() > 0.5 ? 'rgba(36, 20, 12, 0.7)' : 'rgba(8, 5, 3, 0.75)';
      ctx.lineWidth = 2.5 + Math.random() * 5;
    }
    ctx.stroke();
  }

  // Micro fiber pores
  ctx.fillStyle = 'rgba(4, 2, 1, 0.55)';
  for (let p = 0; p < 5000; p++) {
    const px = Math.random() * 1024;
    const py = Math.random() * 1024;
    ctx.fillRect(px, py, 1.2, 6 + Math.random() * 9);
  }

  // Satin lacquer reflective sheen
  const glossGrad = ctx.createLinearGradient(0, 0, 1024, 0);
  glossGrad.addColorStop(0, 'rgba(255, 230, 190, 0.02)');
  glossGrad.addColorStop(0.3, 'rgba(255, 240, 210, 0.09)');
  glossGrad.addColorStop(0.7, 'rgba(255, 240, 210, 0.04)');
  glossGrad.addColorStop(1, 'rgba(255, 230, 190, 0.07)');
  ctx.fillStyle = glossGrad;
  ctx.fillRect(0, 0, 1024, 1024);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(1.5, 1.5);
  return texture;
}

// 5. Authentic Philippine 6-Way Solihiya (Rattan Cane Webbing) Texture
function createSolihiyaCaneTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');

  // Void behind the open cane weave
  ctx.fillStyle = '#140B06';
  ctx.fillRect(0, 0, 1024, 1024);

  const step = 64; // size of each Solihiya weave cell
  const caneWidth = 11;

  function drawCaneStrip(x1, y1, x2, y2, width) {
    ctx.save();
    // Shadow under strip
    ctx.strokeStyle = 'rgba(10, 5, 2, 0.7)';
    ctx.lineWidth = width + 3.5;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();

    // Base cane color (warm honey peeled rattan)
    ctx.strokeStyle = '#D9B478';
    ctx.lineWidth = width;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();

    // Gloss specular ridge along center of curved cane strip
    ctx.strokeStyle = 'rgba(255, 248, 225, 0.85)';
    ctx.lineWidth = width * 0.35;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();

    // Edge definition
    ctx.strokeStyle = 'rgba(100, 65, 30, 0.45)';
    ctx.lineWidth = width;
    ctx.setLineDash([width * 0.85, width * 0.15]);
    ctx.stroke();
    ctx.restore();
  }

  // 1 & 2: Diagonal Cross Strands (45 and 135 degrees)
  for (let d = -1024; d <= 2048; d += step) {
    drawCaneStrip(d, 0, d + 1024, 1024, caneWidth * 0.85);
    drawCaneStrip(d + 1024, 0, d, 1024, caneWidth * 0.85);
  }

  // 3: Vertical Cane Strands
  for (let x = 0; x <= 1024; x += step) {
    drawCaneStrip(x, 0, x, 1024, caneWidth);
  }

  // 4: Horizontal Cane Strands (interlaced, creating the iconic octagonal eyelets)
  for (let y = 0; y <= 1024; y += step) {
    drawCaneStrip(0, y, 1024, y, caneWidth);
  }

  // Natural cane nodal joints and fiber texture
  for (let j = 0; j < 70; j++) {
    const jx = Math.random() * 1024;
    const jy = Math.random() * 1024;
    ctx.fillStyle = 'rgba(130, 80, 35, 0.4)';
    ctx.fillRect(jx, jy, 9, 3);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(4, 4);
  return texture;
}

// 6. Authentic T'boli Sacred T'nalak Ikat Weave Pattern Texture
// Features ancestral Kleng (crab) & Sawo (python) diamond geometry in authentic natural dyes
function createTnalakIkatTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');

  // Sacred River Mud Charcoal/Noir base (#151110)
  ctx.fillStyle = '#151110';
  ctx.fillRect(0, 0, 1024, 1024);

  const cell = 128;
  for (let row = 0; row < 1024 / cell; row++) {
    for (let col = 0; col < 1024 / cell; col++) {
      const cx = col * cell + cell / 2;
      const cy = row * cell + cell / 2;

      // 1. Outer Madder Root Crimson Ikat Diamond (#8C281B)
      ctx.fillStyle = '#8C281B';
      ctx.beginPath();
      ctx.moveTo(cx, cy - 54);
      ctx.lineTo(cx + 54, cy);
      ctx.lineTo(cx, cy + 54);
      ctx.lineTo(cx - 54, cy);
      ctx.closePath();
      ctx.fill();

      // Stepped ikat saw-tooth chevron border along diamond edges
      ctx.fillStyle = '#8C281B';
      for (let s = -4; s <= 4; s++) {
        const offset = s * 11;
        ctx.fillRect(cx + offset - 4, cy - Math.abs(offset) - 8, 8, 8);
        ctx.fillRect(cx + offset - 4, cy + Math.abs(offset), 8, 8);
      }

      // 2. Inner Sacred Mud Charcoal Diamond
      ctx.fillStyle = '#151110';
      ctx.beginPath();
      ctx.moveTo(cx, cy - 36);
      ctx.lineTo(cx + 36, cy);
      ctx.lineTo(cx, cy + 36);
      ctx.lineTo(cx - 36, cy);
      ctx.closePath();
      ctx.fill();

      // 3. Raw Golden Abaca Sacred Core Symbol (Bangala human figure / Sawo diamond eye) (#DEC390)
      ctx.fillStyle = '#DEC390';
      ctx.beginPath();
      ctx.moveTo(cx, cy - 18);
      ctx.lineTo(cx + 18, cy);
      ctx.lineTo(cx, cy + 18);
      ctx.lineTo(cx - 18, cy);
      ctx.closePath();
      ctx.fill();

      // Fine golden ikat bleed teeth
      ctx.strokeStyle = '#DEC390';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cx - 24, cy);
      ctx.lineTo(cx + 24, cy);
      ctx.moveTo(cx, cy - 24);
      ctx.lineTo(cx, cy + 24);
      ctx.stroke();

      // Corner abaca cross-accents between diamonds
      ctx.fillStyle = 'rgba(222, 195, 144, 0.85)';
      ctx.fillRect(col * cell, row * cell, 12, 12);
      ctx.fillRect(col * cell + cell - 12, row * cell, 12, 12);
    }
  }

  // Distinct abaca textile warp & weft ribbing (hand-scraped plant fiber weave)
  ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
  for (let i = 0; i < 1024; i += 3) {
    ctx.fillRect(0, i, 1024, 1.2);
    ctx.fillRect(i, 0, 1.2, 1024);
  }

  // Traditional cowrie-shell friction burnishing ("smook") subtle waxy sheen
  const waxyGrad = ctx.createLinearGradient(0, 0, 1024, 1024);
  waxyGrad.addColorStop(0, 'rgba(255, 240, 210, 0.04)');
  waxyGrad.addColorStop(0.5, 'rgba(255, 240, 210, 0.08)');
  waxyGrad.addColorStop(1, 'rgba(255, 240, 210, 0.03)');
  ctx.fillStyle = waxyGrad;
  ctx.fillRect(0, 0, 1024, 1024);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(3, 3);
  return texture;
}

// 7. Natural Iridescent Capiz Shell (Placuna placenta) Texture
function createCapizShellTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#FFFDF7';
  ctx.fillRect(0, 0, 1024, 1024);

  // Concentric shell growth rings
  const cx = 512;
  const cy = 1200;
  for (let r = 200; r < 1400; r += 14) {
    const alpha = 0.08 + Math.sin(r * 0.1) * 0.05;
    ctx.strokeStyle = `rgba(215, 195, 160, ${alpha})`;
    ctx.lineWidth = 2.5 + (r % 28 === 0 ? 3 : 0);
    ctx.beginPath();
    ctx.arc(cx, cy, r, -Math.PI * 0.8, -Math.PI * 0.2);
    ctx.stroke();
  }

  // Radiating nacre prismatic rays
  for (let angle = -Math.PI * 0.8; angle <= -Math.PI * 0.2; angle += 0.035) {
    const rayAlpha = 0.04 + Math.random() * 0.05;
    ctx.strokeStyle = (Math.random() > 0.5)
      ? `rgba(255, 235, 190, ${rayAlpha})`
      : `rgba(200, 240, 245, ${rayAlpha})`;
    ctx.lineWidth = 3 + Math.random() * 6;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(angle) * 300, cy + Math.sin(angle) * 300);
    ctx.lineTo(cx + Math.cos(angle) * 1300, cy + Math.sin(angle) * 1300);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  return texture;
}

// 8. Gossamer Piña-Seda Sheer Fabric Texture
function createPinaSedaTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#FCF9F2';
  ctx.fillRect(0, 0, 512, 512);

  // Fine hand-loomed pineapple leaf warp & weft threads
  ctx.strokeStyle = 'rgba(180, 160, 130, 0.28)';
  ctx.lineWidth = 0.8;

  for (let y = 0; y < 512; y += 4) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(512, y);
    ctx.stroke();
  }
  for (let x = 0; x < 512; x += 4) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 512);
    ctx.stroke();
  }

  // Natural organic fiber slubs
  ctx.fillStyle = 'rgba(195, 175, 140, 0.5)';
  for (let s = 0; s < 130; s++) {
    const sx = Math.random() * 512;
    const sy = Math.random() * 512;
    ctx.fillRect(sx, sy, 5 + Math.random() * 8, 1.6);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(8, 8);
  return texture;
}

// 9. Lumban Calado Open-Work Embroidery Color Map (Albedo Graphics)
function createCaladoColorMap() {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');

  // Translucent sheer piña foundation background
  ctx.fillStyle = '#FAF7EE';
  ctx.fillRect(0, 0, 1024, 1024);

  // Subtle hand-loomed pineapple fiber grid in background
  ctx.strokeStyle = 'rgba(195, 175, 140, 0.22)';
  ctx.lineWidth = 1.0;
  for (let y = 0; y < 1024; y += 8) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(1024, y);
    ctx.stroke();
  }
  for (let x = 0; x < 1024; x += 8) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 1024);
    ctx.stroke();
  }

  // Draw 2 symmetrical decorative Pechera embroidery vertical bands
  const leftX = 256;
  const rightX = 768;

  [leftX, rightX].forEach(cx => {
    // 1. Heavy Golden Satin Stitch Border Welts (Outer & Inner)
    const bandHalfW = 180;
    [-bandHalfW, bandHalfW].forEach(dx => {
      const bx = cx + dx;
      ctx.fillStyle = '#C89B38';
      ctx.fillRect(bx - 6, 0, 12, 1024);

      // Gold rope twist highlights
      ctx.fillStyle = '#F5D77F';
      for (let y = 0; y < 1024; y += 14) {
        ctx.beginPath();
        ctx.ellipse(bx, y + 7, 4, 6, Math.PI / 4, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    // 2. Center Column: Drawn-Thread Calado Open-Work Eyelet Grid
    const step = 48;
    for (let y = 32; y < 1024 - 32; y += step) {
      for (let x = cx - 110; x <= cx + 110; x += step) {
        // Pierced open eyelet (revealing sheer darkness beneath)
        ctx.fillStyle = 'rgba(40, 28, 18, 0.75)';
        ctx.beginPath();
        ctx.arc(x, y, 7, 0, Math.PI * 2);
        ctx.fill();

        // Eyelet satin-stitch ring
        ctx.strokeStyle = '#DDB250';
        ctx.lineWidth = 2.5;
        ctx.stroke();

        // Connecting lattice bars
        ctx.strokeStyle = '#EAD088';
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.moveTo(x - 14, y);
        ctx.lineTo(x + 14, y);
        ctx.moveTo(x, y - 14);
        ctx.lineTo(x, y + 14);
        ctx.stroke();
      }
    }

    // 3. Symmetrical Sampaguita Floral Rosettes & Foliate Vines
    const flowerStep = 160;
    for (let y = 80; y < 1024; y += flowerStep) {
      // Sampaguita central flower rosette
      ctx.fillStyle = '#FFF8E7';
      ctx.beginPath();
      ctx.arc(cx, y, 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#C4975D';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // 8 Radiating golden silk satin-stitch petals
      for (let p = 0; p < 8; p++) {
        const ang = (p / 8) * Math.PI * 2;
        const px = cx + Math.cos(ang) * 22;
        const py = y + Math.sin(ang) * 22;

        const grad = ctx.createRadialGradient(px, py, 1, px, py, 14);
        grad.addColorStop(0, '#FFF5D0');
        grad.addColorStop(0.6, '#DFB652');
        grad.addColorStop(1, '#A07624');

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.ellipse(px, py, 7, 12, ang + Math.PI / 2, 0, Math.PI * 2);
        ctx.fill();
      }

      // Scrolling acanthus vine tendrils flanking each flower
      [-1, 1].forEach(dir => {
        ctx.strokeStyle = '#D4AF37';
        ctx.lineWidth = 3.2;
        ctx.beginPath();
        ctx.moveTo(cx + dir * 35, y);
        ctx.bezierCurveTo(
          cx + dir * 85, y - 30,
          cx + dir * 110, y + 30,
          cx + dir * 70, y + 60
        );
        ctx.stroke();

        // Feathered leaf stitches along the vine
        for (let lf = 0; lf < 4; lf++) {
          const lx = cx + dir * (50 + lf * 14);
          const ly = y - 15 + lf * 18;
          ctx.fillStyle = '#EAC665';
          ctx.beginPath();
          ctx.ellipse(lx, ly, 4, 8, dir * 0.7, 0, Math.PI * 2);
          ctx.fill();
        }
      });
    }
  });

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(1, 1);
  texture.anisotropy = 16;
  return texture;
}

// Tangent-Space Normal Map for Calado Embroidery 3D Stitches
function createCaladoNormalMap() {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');

  // Flat neutral normal base (128, 128, 255)
  ctx.fillStyle = 'rgb(128, 128, 255)';
  ctx.fillRect(0, 0, 1024, 1024);

  const leftX = 256;
  const rightX = 768;

  [leftX, rightX].forEach(cx => {
    // Raised border welts: Normal map bevel
    const bandHalfW = 180;
    [-bandHalfW, bandHalfW].forEach(dx => {
      const bx = cx + dx;
      const grad = ctx.createLinearGradient(bx - 6, 0, bx + 6, 0);
      grad.addColorStop(0, 'rgb(75, 128, 240)');
      grad.addColorStop(0.5, 'rgb(128, 128, 255)');
      grad.addColorStop(1, 'rgb(185, 128, 240)');
      ctx.fillStyle = grad;
      ctx.fillRect(bx - 6, 0, 12, 1024);
    });

    // Eyelets depressed into mesh
    const step = 48;
    for (let y = 32; y < 1024 - 32; y += step) {
      for (let x = cx - 110; x <= cx + 110; x += step) {
        ctx.fillStyle = 'rgb(128, 128, 190)'; // Inward depression
        ctx.beginPath();
        ctx.arc(x, y, 7, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = 'rgb(160, 160, 255)'; // Raised stitch rim
        ctx.lineWidth = 2.5;
        ctx.stroke();
      }
    }

    // Raised floral petals
    const flowerStep = 160;
    for (let y = 80; y < 1024; y += flowerStep) {
      for (let p = 0; p < 8; p++) {
        const ang = (p / 8) * Math.PI * 2;
        const px = cx + Math.cos(ang) * 22;
        const py = y + Math.sin(ang) * 22;

        const grad = ctx.createRadialGradient(px, py, 1, px, py, 12);
        grad.addColorStop(0, 'rgb(128, 128, 255)');
        grad.addColorStop(0.8, 'rgb(170, 150, 245)');
        grad.addColorStop(1, 'rgb(90, 100, 220)');

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.ellipse(px, py, 7, 12, ang + Math.PI / 2, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  });

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(1, 1);
  texture.anisotropy = 16;
  return texture;
}

// 10. Brushed Fine Jewelry Metal Texture
function createBrushedMetalNormalMap() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = 'rgb(128, 128, 255)';
  ctx.fillRect(0, 0, 512, 512);

  for (let i = 0; i < 650; i++) {
    const y = Math.random() * 512;
    const len = 40 + Math.random() * 130;
    const x = Math.random() * (512 - len);
    const bumpR = Math.floor(128 + (Math.random() - 0.5) * 48);
    const bumpG = Math.floor(128 + (Math.random() - 0.5) * 48);

    ctx.strokeStyle = `rgb(${bumpR}, ${bumpG}, 245)`;
    ctx.lineWidth = 0.85;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + len, y);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(4, 4);
  return texture;
}

// 11. Dynamic Real-Time Monogram Texture Generator for Leather Tag (24K Gold Foil Debossed)
export function createMonogramCanvasTexture(text = 'JR') {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#7C4A2C';
  ctx.fillRect(0, 0, 512, 512);

  ctx.fillStyle = 'rgba(40, 20, 10, 0.18)';
  for (let i = 0; i < 1600; i++) {
    ctx.fillRect(Math.random() * 512, Math.random() * 512, 2, 2);
  }

  // Perimeter double debossed saddle-stitch border
  ctx.strokeStyle = '#4A2A14';
  ctx.lineWidth = 6;
  ctx.strokeRect(32, 32, 448, 448);

  ctx.strokeStyle = '#D9B464';
  ctx.lineWidth = 3;
  ctx.setLineDash([12, 8]);
  ctx.strokeRect(32, 32, 448, 448);
  ctx.setLineDash([]);

  ctx.save();
  ctx.shadowColor = 'rgba(25, 12, 6, 0.9)';
  ctx.shadowBlur = 8;
  ctx.shadowOffsetX = 3;
  ctx.shadowOffsetY = 4;

  const goldGrad = ctx.createLinearGradient(120, 160, 390, 320);
  goldGrad.addColorStop(0, '#FFE89E');
  goldGrad.addColorStop(0.3, '#E6C065');
  goldGrad.addColorStop(0.7, '#C89736');
  goldGrad.addColorStop(1, '#FFF2C6');
  ctx.fillStyle = goldGrad;

  ctx.font = 'bold 130px "Cormorant Garamond", Georgia, serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text || 'LIKHA', 256, 240);

  ctx.font = 'bold 24px "Montserrat", sans-serif';
  ctx.fillStyle = '#E6C065';
  ctx.shadowBlur = 4;
  ctx.shadowOffsetX = 1;
  ctx.shadowOffsetY = 2;
  ctx.fillText('• ATELIER MANILA •', 256, 350);

  ctx.font = '16px "Montserrat", sans-serif';
  ctx.fillStyle = '#D9B782';
  ctx.fillText('EDISYON LIMITADO 2026', 256, 385);
  ctx.restore();

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

// 12. Natural Rustic Linen / Burlap Canvas Lining Texture
function createRusticLinenTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  // Natural unbleached rustic burlap / linen tone
  ctx.fillStyle = '#8F7556';
  ctx.fillRect(0, 0, 512, 512);

  // Slub yarns and cross threads
  for (let i = 0; i < 512; i += 4) {
    ctx.fillStyle = (i % 8 === 0) ? 'rgba(70, 50, 30, 0.22)' : 'rgba(180, 155, 120, 0.18)';
    ctx.fillRect(0, i, 512, 1.5);
    ctx.fillRect(i, 0, 1.5, 512);
  }

  // Irregular natural slub flecks
  ctx.fillStyle = 'rgba(50, 35, 20, 0.25)';
  for (let j = 0; j < 300; j++) {
    const rx = Math.random() * 512;
    const ry = Math.random() * 512;
    ctx.fillRect(rx, ry, Math.random() * 6 + 2, 1.5);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(4, 4);
  return texture;
}

// Instantiate shared textures
const wovenPalmTexture = createWovenPalmTexture();
const wovenPalmNormalTexture = createWovenPalmNormalTexture();
const wovenPalmBumpTexture = createWovenPalmBumpTexture();
const leatherBumpTexture = createLeatherBumpTexture();
const inabelLiningTexture = createInabelLiningTexture();
const kamagongWoodTexture = createKamagongWoodTexture();
const solihiyaCaneTexture = createSolihiyaCaneTexture();
const tnalakIkatTexture = createTnalakIkatTexture();
const capizShellTexture = createCapizShellTexture();
const pinaSedaTexture = createPinaSedaTexture();
const caladoColorMap = createCaladoColorMap();
const caladoNormalMap = createCaladoNormalMap();
const brushedMetalNormalMap = createBrushedMetalNormalMap();
const rusticLinenTexture = createRusticLinenTexture();

// ============================================================================
// MATERIALS FACTORY: PHYSICALLY ACCURATE SHADERS
// ============================================================================
export const MaterialsFactory = {
  // 1. Woven Palm Leaf Material (Pandan & Buri Herringbone)
  createWovenLeafMaterial(colorHex = '#D8B781') {
    return new THREE.MeshStandardMaterial({
      color: new THREE.Color(colorHex),
      map: wovenPalmTexture,
      normalMap: wovenPalmNormalTexture,
      normalScale: new THREE.Vector2(0.85, 0.85),
      bumpMap: wovenPalmBumpTexture,
      bumpScale: 0.055,
      roughness: 0.70,
      metalness: 0.02,
      side: THREE.DoubleSide,
      flatShading: false,
    });
  },

  // 2. Vegetable-Tanned Vachetta Leather Material
  createVachettaLeatherMaterial(colorHex = '#8C5A3C') {
    return new THREE.MeshStandardMaterial({
      color: new THREE.Color(colorHex),
      roughness: 0.42,
      metalness: 0.05,
      bumpMap: leatherBumpTexture,
      bumpScale: 0.025,
    });
  },

  // 3. Antique Cast Philippine Brass Hardware
  createAntiqueBrassMaterial(colorHex = '#C4975D') {
    return new THREE.MeshStandardMaterial({
      color: new THREE.Color(colorHex),
      roughness: 0.28,
      metalness: 0.92,
      normalMap: brushedMetalNormalMap,
      normalScale: new THREE.Vector2(0.25, 0.25),
    });
  },

  // 4. Luminous Palawan Golden South Sea Pearl (Multi-layer Nacre Iridescence)
  createPalawanPearlMaterial(tintHex = '#FDF7E7') {
    return new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(tintHex),
      roughness: 0.04,
      metalness: 0.05,
      transmission: 0.12,
      thickness: 1.2,
      ior: 1.62,
      clearcoat: 1.0,
      clearcoatRoughness: 0.03,
      iridescence: 0.95,
      iridescenceIOR: 1.35,
      iridescenceThicknessRange: [120, 380],
      sheen: 0.85,
      sheenColor: new THREE.Color('#FFE7B5'),
      sheenRoughness: 0.15,
      reflectivity: 0.98,
    });
  },

  // 5. 18K Solid Filigree Yellow Gold
  createFiligreeGoldMaterial(colorHex = '#D4AF37') {
    return new THREE.MeshStandardMaterial({
      color: new THREE.Color(colorHex),
      roughness: 0.20,
      metalness: 0.96,
      normalMap: brushedMetalNormalMap,
      normalScale: new THREE.Vector2(0.2, 0.2),
    });
  },

  // 6. Translucent Piña-Seda Sheer Fabric Material (Barong Couture)
  createPinaFabricMaterial(colorHex = '#FBF8F0') {
    return new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(colorHex),
      map: pinaSedaTexture,
      roughness: 0.58,
      metalness: 0.03,
      transmission: 0.48, // Gossamer translucent backlighting
      thickness: 0.25,
      ior: 1.34,
      side: THREE.DoubleSide,
      sheen: 0.55,
      sheenColor: new THREE.Color('#FFF8EB'),
      sheenRoughness: 0.35,
    });
  },

  // 7. Raised Calado Embroidery Material with Authentic Albedo & Normal Relief
  createCaladoEmbroideryMaterial(threadHex = '#E5C158') {
    return new THREE.MeshStandardMaterial({
      color: new THREE.Color(threadHex),
      map: caladoColorMap,
      normalMap: caladoNormalMap,
      normalScale: new THREE.Vector2(1.25, 1.25),
      roughness: 0.35,
      metalness: 0.22, // Luster of genuine golden silk thread
      side: THREE.DoubleSide,
    });
  },

  // 7b. Photorealistic Barong Tagalog Real Pechera Embroidery Material
  createBarongPecheraPhotoMaterial() {
    if (!MaterialsFactory._barongTex) {
      const loader = new THREE.TextureLoader();
      MaterialsFactory._barongTex = loader.load('/textures/barong_source.png');
      MaterialsFactory._barongTex.colorSpace = THREE.SRGBColorSpace;
      MaterialsFactory._barongTex.anisotropy = 16;
    }
    return new THREE.MeshStandardMaterial({
      map: MaterialsFactory._barongTex,
      roughness: 0.52,
      metalness: 0.05,
      side: THREE.DoubleSide,
    });
  },

  // 7c. Meshy Haute Woven Pandan Herringbone Material with Tangent Normal Relief
  createMeshyWovenPandanMaterial(colorHex = '#C89D66') {
    return new THREE.MeshStandardMaterial({
      color: new THREE.Color(colorHex),
      map: wovenPalmTexture,
      normalMap: wovenPalmNormalTexture,
      normalScale: new THREE.Vector2(0.95, 0.95),
      bumpMap: wovenPalmBumpTexture,
      bumpScale: 0.065,
      roughness: 0.72,
      metalness: 0.02,
      side: THREE.DoubleSide,
    });
  },

  // 7d. Meshy Haute Imperial Magenta & Gold Silk Embroidery Border Material
  createMeshyMagentaEmbroideryMaterial() {
    if (!MaterialsFactory._meshyJacketTex) {
      const loader = new THREE.TextureLoader();
      MaterialsFactory._meshyJacketTex = loader.load('/textures/meshy_jacket.png');
      MaterialsFactory._meshyJacketTex.colorSpace = THREE.SRGBColorSpace;
      MaterialsFactory._meshyJacketTex.anisotropy = 16;
    }
    return new THREE.MeshPhysicalMaterial({
      map: MaterialsFactory._meshyJacketTex,
      roughness: 0.38,
      metalness: 0.08,
      sheen: 0.70,
      sheenColor: new THREE.Color('#FFD27D'),
      sheenRoughness: 0.22,
      side: THREE.DoubleSide,
    });
  },

  // 7e. Rustic Linen Canvas Lining Material (Visible through open tunic front & collar)
  createInnerLinenLiningMaterial() {
    return new THREE.MeshStandardMaterial({
      color: new THREE.Color('#94795B'),
      map: rusticLinenTexture,
      roughness: 0.88,
      metalness: 0.01,
      side: THREE.DoubleSide,
    });
  },

  // 7f. Cast Brass & Gold Frog Closures / Knot Toggles
  createGoldenFrogClosureMaterial(colorHex = '#D4AF37') {
    return new THREE.MeshStandardMaterial({
      color: new THREE.Color(colorHex),
      roughness: 0.28,
      metalness: 0.88,
      normalMap: brushedMetalNormalMap,
      normalScale: new THREE.Vector2(0.2, 0.2),
    });
  },

  // 7g. Full-Garment Photogrammetric Meshy PBR Material
  createMeshyGarmentPhotoMaterial() {
    if (!MaterialsFactory._meshyJacketTex) {
      const loader = new THREE.TextureLoader();
      MaterialsFactory._meshyJacketTex = loader.load('/textures/meshy_jacket.png');
      MaterialsFactory._meshyJacketTex.colorSpace = THREE.SRGBColorSpace;
      MaterialsFactory._meshyJacketTex.anisotropy = 16;
    }
    return new THREE.MeshPhysicalMaterial({
      map: MaterialsFactory._meshyJacketTex,
      roughness: 0.55,
      metalness: 0.04,
      sheen: 0.65,
      sheenColor: new THREE.Color('#FFDCA8'),
      sheenRoughness: 0.28,
      side: THREE.DoubleSide,
    });
  },

  // 8. Natural Translucent Mindoro Nephrite Jade
  createJadeMaterial(tintHex = '#2D6A4F') {
    return new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(tintHex),
      roughness: 0.10,
      metalness: 0.02,
      transmission: 0.45,
      thickness: 0.95,
      ior: 1.61,
      attenuationColor: new THREE.Color('#164230'),
      attenuationDistance: 0.45,
      clearcoat: 1.0,
      clearcoatRoughness: 0.05,
    });
  },

  // 9. Natural Iridescent Capiz Shell (Placuna placenta)
  createCapizShellMaterial(tintHex = '#FFFDF8') {
    return new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(tintHex),
      map: capizShellTexture,
      roughness: 0.18,
      metalness: 0.03,
      transmission: 0.65,
      thickness: 0.35,
      ior: 1.54,
      clearcoat: 0.85,
      clearcoatRoughness: 0.08,
      iridescence: 0.70,
      iridescenceIOR: 1.38,
      iridescenceThicknessRange: [100, 320],
      side: THREE.DoubleSide,
    });
  },

  // 10. Native Philippine Kamagong Wood (Ebony)
  createKamagongWoodMaterial(colorHex = '#24140E') {
    return new THREE.MeshStandardMaterial({
      color: new THREE.Color(colorHex),
      map: kamagongWoodTexture,
      bumpMap: kamagongWoodTexture,
      bumpScale: 0.012,
      roughness: 0.34,
      metalness: 0.03,
    });
  },

  // 11. Authentic Solihiya Cane Weave Material
  createSolihiyaCaneMaterial(caneHex = '#D8B781') {
    return new THREE.MeshStandardMaterial({
      color: new THREE.Color(caneHex),
      map: solihiyaCaneTexture,
      bumpMap: solihiyaCaneTexture,
      bumpScale: 0.055,
      roughness: 0.45,
      metalness: 0.04,
    });
  },

  // 12. Sacred T'boli T'nalak Ikat Weave Material
  createTnalakWeaveMaterial(weaveHex = '#2B211E') {
    return new THREE.MeshStandardMaterial({
      color: new THREE.Color(weaveHex),
      map: tnalakIkatTexture,
      bumpMap: tnalakIkatTexture,
      bumpScale: 0.045,
      roughness: 0.42,
      metalness: 0.03,
      sheen: 0.65,
      sheenColor: new THREE.Color('#F0DEC2'),
    });
  },

  // 13. Deep Emerald Heritage Velvet Lining
  createVelvetMaterial(colorHex = '#0F392B') {
    return new THREE.MeshStandardMaterial({
      color: new THREE.Color(colorHex),
      roughness: 0.88,
      metalness: 0.02,
    });
  },

  // 14. Ilocos Inabel Cotton Lining Material
  createInabelLiningMaterial() {
    return new THREE.MeshStandardMaterial({
      map: inabelLiningTexture,
      roughness: 0.78,
      metalness: 0.02,
      side: THREE.BackSide,
    });
  },

  // 15. Palawan Mother-of-Pearl (Madreperla) Iridescent Button Material
  createMotherOfPearlButtonMaterial(colorHex = '#FFFDF5') {
    return new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(colorHex),
      roughness: 0.12,
      metalness: 0.08,
      clearcoat: 1.0,
      clearcoatRoughness: 0.05,
      iridescence: 0.88,
      iridescenceIOR: 1.34,
      iridescenceThicknessRange: [100, 340],
      sheen: 0.85,
      sheenColor: new THREE.Color('#FFF5E6'),
      sheenRoughness: 0.10,
      reflectivity: 0.95,
      side: THREE.FrontSide,
    });
  },

  // 16. Heritage Camisa de Chino Supima Cotton Undershirt Material
  createCamisaDeChinoMaterial(colorHex = '#FAF9F5') {
    return new THREE.MeshStandardMaterial({
      color: new THREE.Color(colorHex),
      roughness: 0.86,
      metalness: 0.01,
      side: THREE.DoubleSide,
    });
  },
};
