import * as THREE from 'three';

// 1. Procedural Dual-Octave Woven Palm Leaf Texture Generator (Pandan & Buri)
function createWovenBumpTexture() {
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
      
      // Diagonal weave gradient
      const grad = ctx.createLinearGradient(x, y, x + tileSize, y + tileSize);
      if (isEven) {
        grad.addColorStop(0, '#505050');
        grad.addColorStop(0.5, '#D5D5D5');
        grad.addColorStop(1, '#505050');
      } else {
        grad.addColorStop(0, '#D5D5D5');
        grad.addColorStop(0.5, '#404040');
        grad.addColorStop(1, '#D5D5D5');
      }
      ctx.fillStyle = grad;
      ctx.fillRect(x + 1, y + 1, tileSize - 2, tileSize - 2);

      // Organic leaf fiber striations
      ctx.strokeStyle = 'rgba(20, 15, 10, 0.22)';
      ctx.lineWidth = 1;
      for (let i = 0; i < tileSize; i += 3) {
        ctx.beginPath();
        if (isEven) {
          ctx.moveTo(x + i, y);
          ctx.lineTo(x + tileSize, y + tileSize - i);
        } else {
          ctx.moveTo(x, y + i);
          ctx.lineTo(x + tileSize - i, y + tileSize);
        }
        ctx.stroke();
      }

      // Micro-fiber noise speckles
      for (let s = 0; s < 4; s++) {
        const nx = x + Math.random() * tileSize;
        const ny = y + Math.random() * tileSize;
        ctx.fillStyle = Math.random() > 0.5 ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.18)';
        ctx.fillRect(nx, ny, 2, 2);
      }
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(4, 4);
  return texture;
}

// 2. Procedural Calado Embroidery Texture Generator for Barong
function createCaladoEmbroideryTexture(motif = 'alon') {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#808080';
  ctx.fillRect(0, 0, 512, 512);

  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 4;
  ctx.fillStyle = '#E0E0E0';

  // Draw open-work Calado geometric floral lattice
  const step = 64;
  for (let y = 0; y < 512; y += step) {
    for (let x = 0; x < 512; x += step) {
      // Central open-work diamond
      ctx.beginPath();
      ctx.moveTo(x + step / 2, y + 8);
      ctx.lineTo(x + step - 8, y + step / 2);
      ctx.lineTo(x + step / 2, y + step - 8);
      ctx.lineTo(x + 8, y + step / 2);
      ctx.closePath();
      ctx.stroke();

      // Flower petal or wave accents
      ctx.beginPath();
      ctx.arc(x + step / 2, y + step / 2, 8, 0, Math.PI * 2);
      ctx.fill();

      // Connecting thread bars
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + 16, y + 16);
      ctx.moveTo(x + step, y);
      ctx.lineTo(x + step - 16, y + 16);
      ctx.stroke();
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(3, 3);
  return texture;
}

// 3. Dynamic Real-Time Monogram Texture Generator for Leather Tag
export function createMonogramCanvasTexture(text = 'JR') {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');

  // Background Vachetta leather tone
  ctx.fillStyle = '#8C5A3C';
  ctx.fillRect(0, 0, 256, 256);

  // Border stitch line
  ctx.strokeStyle = '#5C3A21';
  ctx.lineWidth = 4;
  ctx.strokeRect(16, 16, 224, 224);

  // 24K Gold Leaf Stamped Monogram
  ctx.fillStyle = '#E5C158'; // Radiant Gold
  ctx.shadowColor = '#4A2E1B';
  ctx.shadowBlur = 4;
  ctx.shadowOffsetX = 2;
  ctx.shadowOffsetY = 2;

  ctx.font = 'bold 72px "Cormorant Garamond", Georgia, serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text || 'LIKHA', 128, 120);

  // Atelier micro-stamp
  ctx.font = '16px "Montserrat", sans-serif';
  ctx.fillStyle = '#F2ECE4';
  ctx.shadowBlur = 0;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;
  ctx.fillText('MANILA • 2026', 128, 180);

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

const wovenBumpTexture = createWovenBumpTexture();
const caladoBumpTexture = createCaladoEmbroideryTexture();

export const MaterialsFactory = {
  // 1. Woven Palm Leaf Material (Pandan & Buri)
  createWovenLeafMaterial(colorHex = '#D8B781') {
    return new THREE.MeshStandardMaterial({
      color: new THREE.Color(colorHex),
      bumpMap: wovenBumpTexture,
      bumpScale: 0.045,
      roughness: 0.68,
      metalness: 0.04,
      flatShading: false,
    });
  },

  // 2. Vegetable-Tanned Vachetta Leather Material
  createVachettaLeatherMaterial(colorHex = '#8C5A3C') {
    return new THREE.MeshStandardMaterial({
      color: new THREE.Color(colorHex),
      roughness: 0.48,
      metalness: 0.08,
      bumpMap: wovenBumpTexture,
      bumpScale: 0.015,
    });
  },

  // 3. Antique Cast Philippine Brass Hardware
  createAntiqueBrassMaterial(colorHex = '#C4975D') {
    return new THREE.MeshStandardMaterial({
      color: new THREE.Color(colorHex),
      roughness: 0.28,
      metalness: 0.90,
    });
  },

  // 4. Luminous Palawan Golden South Sea Pearl (Nacre Iridescence)
  createPalawanPearlMaterial(tintHex = '#FDF7E7') {
    return new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(tintHex),
      roughness: 0.08,
      metalness: 0.08,
      transmission: 0.14,
      thickness: 1.4,
      clearcoat: 1.0,
      clearcoatRoughness: 0.04,
      reflectivity: 0.96,
      ior: 1.65,
      sheen: 0.5,
      sheenColor: new THREE.Color('#FFE4B5'),
    });
  },

  // 5. 18K Solid Filigree Gold
  createFiligreeGoldMaterial(colorHex = '#D4AF37') {
    return new THREE.MeshStandardMaterial({
      color: new THREE.Color(colorHex),
      roughness: 0.24,
      metalness: 0.94,
    });
  },

  // 6. Translucent Piña-Seda Sheer Fabric Material (Barong Couture)
  createPinaFabricMaterial(colorHex = '#FBF8F0') {
    return new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(colorHex),
      roughness: 0.64,
      metalness: 0.05,
      transmission: 0.44, // Gossamer sheer backlighting
      thickness: 0.28,
      ior: 1.34,
      side: THREE.DoubleSide,
      sheen: 0.35,
      sheenColor: new THREE.Color('#FFF8E7'),
    });
  },

  // 7. Raised Calado Embroidery Material
  createCaladoEmbroideryMaterial(threadHex = '#E5C158') {
    return new THREE.MeshStandardMaterial({
      color: new THREE.Color(threadHex),
      bumpMap: caladoBumpTexture,
      bumpScale: 0.08,
      roughness: 0.42,
      metalness: 0.35,
    });
  },

  // 8. Natural Translucent Mindoro Jade
  createJadeMaterial(tintHex = '#2D6A4F') {
    return new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(tintHex),
      roughness: 0.15,
      metalness: 0.05,
      transmission: 0.38,
      thickness: 0.8,
      ior: 1.61,
      clearcoat: 0.9,
    });
  },

  // 9. Natural Iridescent Capiz Shell (Placuna placenta)
  createCapizShellMaterial(tintHex = '#FFFDF8') {
    return new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(tintHex),
      roughness: 0.22,
      metalness: 0.04,
      transmission: 0.68,
      thickness: 0.45,
      ior: 1.52,
      clearcoat: 0.7,
    });
  },

  // 10. Native Philippine Kamagong Wood (Ebony)
  createKamagongWoodMaterial(colorHex = '#24140E') {
    return new THREE.MeshStandardMaterial({
      color: new THREE.Color(colorHex),
      roughness: 0.38,
      metalness: 0.04,
    });
  }
};
