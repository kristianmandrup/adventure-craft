import { useEffect, useState, useRef, useMemo } from 'react';
import { Character, Block, SpawnMarker } from '../types';

export type FilterType = 'ALL' | 'FOES' | 'ANIMALS' | 'BUILDINGS' | 'TREES';

interface UseMinimapProps {
  playerPosRef: React.MutableRefObject<[number, number, number] | null>;
  characters: Character[];
  blocks: Block[];
  filter: FilterType;
  spawnMarkers: SpawnMarker[];
  portalPosition?: [number, number, number] | null;
}

export const useMinimap = ({ playerPosRef, characters, blocks, filter, spawnMarkers, portalPosition }: UseMinimapProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [identifiedEntity, setIdentifiedEntity] = useState<string | null>(null);

  const filterBlocks = useMemo(() => {
    const buildings: Block[] = [];
    const trees: Block[] = [];

    blocks.forEach(b => {
      if (!b.type) return;
      const type = b.type.toLowerCase();
      // Buildings: planks, bricks, stone (often used in structures), glass
      if (type.includes('plank') || type.includes('brick') || type.includes('stone') || type.includes('wood') || type.includes('cobble')) {
          buildings.push(b);
      }
      // Nature/Trees: Leaves
      if (type.includes('leaf') || type.includes('log')) {
          trees.push(b);
      }
    });
    return { buildings, trees };
  }, [blocks]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    const render = () => {
      if (!playerPosRef.current) {
        animationFrameId = requestAnimationFrame(render);
        return;
      }

      const [px, , pz] = playerPosRef.current;
      const range = 40; 
      const size = 150; 
      const center = size / 2;
      const scale = center / range;

      ctx.clearRect(0, 0, size, size);

      ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
      ctx.fillRect(0, 0, size, size);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.lineWidth = 1;
      ctx.strokeRect(0, 0, size, size);

      // Draw Blocks
      const drawBlock = (b: Block, color: string) => {
        const dx = b.x - px;
        const dz = b.z - pz;
        if (Math.abs(dx) < range && Math.abs(dz) < range) {
            const cx = center + dx * scale;
            const cy = center + dz * scale;
            ctx.fillStyle = color;
            ctx.fillRect(cx - 1, cy - 1, 2, 2);
        }
      };

      if (filter === 'ALL' || filter === 'BUILDINGS') {
         filterBlocks.buildings.forEach(b => drawBlock(b, '#9ca3af'));
      }
      if (filter === 'ALL' || filter === 'TREES') {
         filterBlocks.trees.forEach(b => drawBlock(b, '#15803d'));
      }

      // Draw Characters
      characters.forEach(char => {
        const dx = char.position[0] - px;
        const dz = char.position[2] - pz;
        
        if (Math.abs(dx) < range && Math.abs(dz) < range) {
             const cx = center + dx * scale;
             const cy = center + dz * scale;
             
             const isEnemy = char.isEnemy;
             
             let visible = false;
             if (filter === 'ALL') visible = true;
             else if (filter === 'FOES' && isEnemy) visible = true;
             else if (filter === 'ANIMALS' && !isEnemy) visible = true;

             if (visible) {
                 ctx.beginPath();
                 ctx.arc(cx, cy, 3, 0, Math.PI * 2);
                 ctx.fillStyle = isEnemy ? '#ef4444' : '#4ade80';
                 ctx.fill();
             }
        }
      });

      // Draw Spawn Markers (Yellow Fire Effect)
      const now = Date.now();
      spawnMarkers.forEach(m => {
          const dx = m.x - px;
          const dz = m.z - pz;
          if (Math.abs(dx) < range && Math.abs(dz) < range) {
             const cx = center + dx * scale;
             const cy = center + dz * scale;
             
             const age = now - m.timestamp;
             const maxAge = 30000;
             const timeLeft = Math.max(0, maxAge - age);
             if (timeLeft > 0) {
                 const opacity = timeLeft / maxAge;
                 const pulse = (Math.sin(now * 0.01) + 1) / 2;
                 const radius = 4 + pulse * 4;

                 // Glow
                 ctx.beginPath();
                 ctx.arc(cx, cy, radius, 0, Math.PI * 2);
                 ctx.fillStyle = `rgba(255, 204, 0, ${opacity * 0.6})`;
                 ctx.fill();

                 // Core
                 ctx.beginPath();
                 ctx.arc(cx, cy, 3, 0, Math.PI * 2);
                 ctx.fillStyle = `rgba(255, 255, 0, ${opacity})`;
                 ctx.fill();
             }
          }
      });

      // Portal Marker
      if (portalPosition) {
           const dx = portalPosition[0] - px;
           const dz = portalPosition[2] - pz;
           if (Math.abs(dx) < range && Math.abs(dz) < range) {
               const cx = center + dx * scale;
               const cy = center + dz * scale;
               
               // Core
               ctx.fillStyle = '#a855f7'; // Purple-500
               ctx.beginPath();
               ctx.arc(cx, cy, 4, 0, Math.PI * 2);
               ctx.fill();
               
               // Pulse ring
               const pulse = (Math.sin(Date.now() * 0.005) + 1) / 2;
               ctx.strokeStyle = `rgba(168, 85, 247, ${pulse})`;
               ctx.lineWidth = 1;
               ctx.beginPath();
               ctx.arc(cx, cy, 6 + pulse * 2, 0, Math.PI * 2);
               ctx.stroke();
           }
      }

      // Player
      ctx.save();
      ctx.translate(center, center);
      ctx.beginPath();
      ctx.moveTo(0, -5);
      ctx.lineTo(4, 4);
      ctx.lineTo(-4, 4);
      ctx.closePath();
      ctx.fillStyle = 'white';
      ctx.fill();
      ctx.restore();

      animationFrameId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationFrameId);
  }, [filter, characters, filterBlocks, playerPosRef, spawnMarkers]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
     if (!playerPosRef.current) return;
     const rect = e.currentTarget.getBoundingClientRect();
     const x = e.clientX - rect.left;
     const y = e.clientY - rect.top;
     
     const size = 150;
     const center = size / 2;
     const range = 40;
     const scale = center / range;

     const dx = (x - center) / scale;
     const dz = (y - center) / scale;
     
     const [px, , pz] = playerPosRef.current;
     const worldX = px + dx;
     const worldZ = pz + dz;

     let found = null;
     let minDist = 5;

     for (const char of characters) {
        const dist = Math.sqrt(Math.pow(char.position[0] - worldX, 2) + Math.pow(char.position[2] - worldZ, 2));
        if (dist < minDist) {
            minDist = dist;
            found = char.name;
        }
     }

     if (found) {
         setIdentifiedEntity(found);
         setTimeout(() => setIdentifiedEntity(null), 3000);
     }
  };

  return { canvasRef, identifiedEntity, handleCanvasClick };
};