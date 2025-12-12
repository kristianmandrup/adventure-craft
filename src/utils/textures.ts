// Simple procedural texture generation to Base64 Data URIs
// This avoids external dependencies or broken links.

const createNoiseTexture = (color: string, opacity = 1, type: 'noise' | 'lines' | 'smooth' = 'noise') => {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // Base fill
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, 64, 64);

  if (type === 'noise') {
    for (let i = 0; i < 400; i++) {
      ctx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.2})`;
      ctx.fillRect(Math.random() * 64, Math.random() * 64, 2, 2);
      ctx.fillStyle = `rgba(0, 0, 0, ${Math.random() * 0.2})`;
      ctx.fillRect(Math.random() * 64, Math.random() * 64, 2, 2);
    }
  } else if (type === 'lines') {
    // Wood-like
    for (let i = 0; i < 10; i++) {
        ctx.fillStyle = `rgba(0, 0, 0, 0.1)`;
        ctx.fillRect(i * 7, 0, 2, 64);
    }
    // Random knots
    for (let i=0; i<3; i++) {
        ctx.fillStyle = `rgba(0,0,0,0.15)`;
        const x = Math.random() * 60;
        const y = Math.random() * 60;
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI*2);
        ctx.fill();
    }
  }

  // Border for block definition
  ctx.strokeStyle = 'rgba(0,0,0,0.1)';
  ctx.strokeRect(0,0,64,64);

  return canvas.toDataURL();
};

export const TextureData = {
  grass: createNoiseTexture('#4ade80', 1, 'noise'),
  dirt: createNoiseTexture('#854d0e', 1, 'noise'),
  stone: createNoiseTexture('#9ca3af', 1, 'noise'),
  wood: createNoiseTexture('#451a03', 1, 'lines'),
  leaf: createNoiseTexture('#166534', 1, 'noise'),
  sand: createNoiseTexture('#fde047', 1, 'noise'),
  snow: createNoiseTexture('#f3f4f6', 1, 'noise'),
  water: createNoiseTexture('#3b82f6', 0.6, 'smooth'),
  // Fallback
  default: createNoiseTexture('#cccccc', 1, 'noise'),
};

export const getTextureType = (type?: string): string => {
  if (!type) return 'default';
  const t = type.toLowerCase();
  if (t.includes('grass')) return 'grass';
  if (t.includes('dirt') || t.includes('soil')) return 'dirt';
  if (t.includes('stone') || t.includes('rock') || t.includes('cobble')) return 'stone';
  if (t.includes('wood') || t.includes('log') || t.includes('plank') || t.includes('trunk')) return 'wood';
  if (t.includes('leaf') || t.includes('leaves') || t.includes('tree')) return 'leaf';
  if (t.includes('sand') || t.includes('desert')) return 'sand';
  if (t.includes('snow') || t.includes('ice')) return 'snow';
  if (t.includes('water') || t.includes('liquid') || t.includes('ocean')) return 'water';
  return 'default';
};