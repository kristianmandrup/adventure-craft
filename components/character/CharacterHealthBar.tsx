import React from 'react';
import { Html } from '@react-three/drei';
import { Character } from '../../types';

interface CharacterHealthBarProps {
  character: Character;
}

export const CharacterHealthBar: React.FC<CharacterHealthBarProps> = ({ character }) => {
  if (character.hp >= character.maxHp) return null; // Hide if full health

  // Determine height offset based on scale (Giant vs Normal)
  // Assuming character group scale is handled by parent, this HTML is relative to group origin (0,0,0)
  // If scale is 3, HTML at 2 is at 6 world units.
  // Giant is ~4.5 units tall? Character is ~1.8 units tall.
  // If we want it above head:
  // Normal: ~2.0y. Giant: ~2.5y (scaled) or just 2.0y relative?
  // Let's keep 2.2 which is safe for normal.
  
  return (
    <Html position={[0, 2.2, 0]} center style={{ pointerEvents: 'none', whiteSpace: 'nowrap' }} zIndexRange={[100, 0]}>
      <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          background: 'rgba(0,0,0,0.6)', 
          padding: '4px', 
          borderRadius: '4px',
          backdropFilter: 'blur(2px)'
      }}>
         <div style={{ 
             width: '60px', 
             height: '6px', 
             background: '#333', 
             border: '1px solid #000', 
             borderRadius: '2px', 
             overflow: 'hidden' 
         }}>
             <div style={{ 
                 width: `${(Math.max(0, character.hp) / character.maxHp) * 100}%`, 
                 height: '100%', 
                 background: character.isFriendly ? '#4ade80' : '#ef4444',
                 transition: 'width 0.2s ease-out'
             }} />
         </div>
      </div>
    </Html>
  );
};
