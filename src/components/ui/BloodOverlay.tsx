import { useEffect, useState } from 'react';

export const BloodOverlay = ({ hp }: { hp: number }) => {
  const [opacity, setOpacity] = useState(0);
  const [prevHp, setPrevHp] = useState(hp);

  useEffect(() => {
    if (hp < prevHp) {
      // Taken damage
      setOpacity(0.6); // Flash red
      const timer = setTimeout(() => setOpacity(0), 300);
      return () => clearTimeout(timer);
    }
    setPrevHp(hp);
  }, [hp, prevHp]);

  return (
    <div 
        className="fixed inset-0 pointer-events-none z-40 transition-opacity duration-300 bg-red-600 mix-blend-multiply"
        style={{ opacity: opacity }}
    />
  );
};
