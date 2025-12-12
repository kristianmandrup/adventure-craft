import React from 'react';
import { InventoryItem } from '../../types';
import { Sword } from './Sword';
import { Axe } from './Axe';
import { Pickaxe } from './Pickaxe';
import { Bow } from './Bow';
import { GenericItem } from './GenericItem';

interface HandWeaponProps {
  activeItem: InventoryItem | undefined;
}

export const HandWeapon: React.FC<HandWeaponProps> = ({ activeItem }) => {
  if (!activeItem) {
     // Empty Hand (Fist)
     return (
        <mesh>
           <sphereGeometry args={[0.06]} />
           <meshStandardMaterial color="#eecfa1" />
        </mesh>
     );
  }

  const { type, color } = activeItem;

  if (type === 'sword' || type === 'weapon') return <Sword />;
  if (type === 'axe') return <Axe />;
  if (type === 'pickaxe' || type === 'pick') return <Pickaxe />;
  if (type === 'bow') return <Bow />;

  return <GenericItem color={color} />;
};
