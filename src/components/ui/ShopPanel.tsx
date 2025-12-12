import React from 'react';
import { Coins, X, Sword, Shield, Apple, Target, CircleDot, Flame, Axe, Heart, Zap, Swords as SwordsIcon, Waves } from 'lucide-react';

interface ShopItem {
  id: string;
  name: string;
  type: string;
  price: number;
  icon?: React.ReactNode;
  description?: string;
  color?: string;
}

const SHOP_ITEMS: ShopItem[] = [
  { id: 'sword', name: 'Iron Sword', type: 'weapon', price: 50, icon: <Sword size={20} />, description: '+10 attack damage' },
  { id: 'axe', name: 'Woodcutter Axe', type: 'axe', price: 40, icon: <Axe size={20} />, description: 'Cuts trees faster' },
  { id: 'bow', name: 'Hunter Bow', type: 'bow', price: 75, icon: <Target size={20} />, description: 'Ranged attacks' },
  { id: 'arrows', name: 'Arrows (x10)', type: 'arrows', price: 20, icon: <CircleDot size={20} />, description: 'Ammunition for bow' },
  { id: 'shield', name: 'Steel Shield', type: 'shield', price: 40, icon: <Shield size={20} />, description: 'Doubles defense' },
  { id: 'armor', name: 'Iron Armor', type: 'iron_armor', price: 150, icon: <Shield size={20} />, description: 'Reduces heavy damage' },
  { id: 'torch', name: 'Torch', type: 'torch', price: 15, icon: <Flame size={20} />, description: 'Light in darkness' },
  { id: 'apple', name: 'Fresh Apple', type: 'apple', price: 5, icon: <Apple size={20} />, description: 'Restores 10 hunger' },
  { id: 'health_potion', name: 'Health Potion', type: 'health_potion', price: 25, icon: <Heart size={20} className="text-red-400" />, description: 'Restore 50 HP' },
  { id: 'speed_potion', name: 'Speed Potion', type: 'speed_potion', price: 35, icon: <Zap size={20} className="text-blue-400" />, description: '2x speed for 10s' },
  { id: 'strength_potion', name: 'Strength Potion', type: 'strength_potion', price: 40, icon: <SwordsIcon size={20} className="text-orange-400" />, description: '2x attack for 10s' },
  { id: 'swimming_potion', name: 'Swimming Potion', type: 'swimming_potion', price: 30, icon: <Waves size={20} className="text-cyan-400" />, description: 'Water walk for 10s' },
];

interface ShopPanelProps {
  playerGold: number;
  onBuy: (item: ShopItem) => void; // App.tsx passes entire item or type? App.tsx: onBuy={(item) => ... handleGiveItem(item.type)}
  onClose: () => void;
  merchantName?: string;
  items?: ShopItem[];
}

export const ShopPanel: React.FC<ShopPanelProps> = ({ playerGold, onBuy, onClose, merchantName = 'Merchant', items = SHOP_ITEMS }) => {
  const [message, setMessage] = React.useState<string | null>(null);

  const stopProp = (e: any) => e.stopPropagation();

  const handleBuy = (item: ShopItem) => {
    if (playerGold < item.price) {
      setMessage("Not enough gold!");
      setTimeout(() => setMessage(null), 2000);
      return;
    }
    
    // App.tsx uses onBuy(item) then checks gold outside. 
    // Wait, App.tsx logic: 
    // onBuy={(item) => { if(playerGold >= item.price) { onGoldGain(-item.price); handleGiveItem(item.type, 1); } }}
    // So here we should just call onBuy(item).
    // BUT this component seems to have its own internal check logic?
    // "const success = onBuyItem(item.type, item.price)"
    
    // Let's defer to the prop. If the prop handles the transaction, we just call it.
    // However, for UI feedback (setMessage), we might need to know if it succeeded.
    // App.tsx implementation simply does it.
    
    // Let's trust the prop to do the work.
    onBuy(item);
    setMessage(`Bought ${item.name}!`);
    setTimeout(() => setMessage(null), 2000);
  };

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-100 pointer-events-auto"
      onClick={onClose}
      onPointerDown={stopProp}
    >
      <div 
        className="bg-linear-to-b from-amber-900/95 to-amber-950/95 rounded-2xl border-2 border-amber-600/50 shadow-2xl p-6 max-w-md w-full mx-4"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-amber-200">{merchantName}'s Shop</h2>
            <div className="flex items-center gap-2 text-amber-400">
              <Coins size={16} />
              <span className="font-bold">{playerGold} gold</span>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-amber-400 hover:text-white transition-colors p-2"
          >
            <X size={24} />
          </button>
        </div>

        {/* Message */}
        {message && (
          <div className={`mb-4 p-2 rounded-lg text-center font-bold ${message.includes('Not') ? 'bg-red-600/80 text-white' : 'bg-green-600/80 text-white'}`}>
            {message}
          </div>
        )}

        {/* Items Grid */}
        <div className="grid grid-cols-1 gap-3 max-h-80 overflow-y-auto pr-2">
          {items.map(item => (
            <div 
              key={item.id}
              className={`bg-black/30 rounded-xl p-3 flex items-center gap-4 border transition-all ${
                playerGold >= item.price 
                  ? 'border-amber-600/30 hover:border-amber-400/50 hover:bg-black/50 cursor-pointer' 
                  : 'border-red-900/30 opacity-60'
              }`}
              onClick={() => handleBuy(item)}
            >
              <div className="w-10 h-10 bg-amber-800/50 rounded-lg flex items-center justify-center text-amber-300">
                {/* 
                   Dynamic icon support is tricky if passed from App.tsx as plain objects.
                   App.tsx passes: { id: '1', name: 'Sword', type: 'weapon', price: 50, color: '#06b6d4' }
                   It does NOT pass 'icon' ReactNode.
                   We need a fallback logic for icons. 
                */}
                {item.icon ? item.icon : <CircleDot size={20} />}
              </div>
              <div className="flex-1">
                <div className="font-bold text-white">{item.name}</div>
                <div className="text-sm text-amber-300/80">{item.description || 'Rare item'}</div>
              </div>
              <div className="flex items-center gap-1 text-yellow-400 font-bold">
                <Coins size={14} />
                {item.price}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-4 pt-4 border-t border-amber-700/50 text-center text-amber-400/80 text-sm">
          Click an item to purchase
        </div>
      </div>
    </div>
  );
};
