import React from 'react';
import { Coins, X, Sword, Shield, Apple, Target, CircleDot, Flame, Axe } from 'lucide-react';

interface ShopItem {
  id: string;
  name: string;
  type: string;
  price: number;
  icon: React.ReactNode;
  description: string;
}

const SHOP_ITEMS: ShopItem[] = [
  { id: 'sword', name: 'Iron Sword', type: 'weapon', price: 50, icon: <Sword size={20} />, description: '+10 attack damage' },
  { id: 'axe', name: 'Woodcutter Axe', type: 'axe', price: 40, icon: <Axe size={20} />, description: 'Cuts trees faster' },
  { id: 'bow', name: 'Hunter Bow', type: 'bow', price: 75, icon: <Target size={20} />, description: 'Ranged attacks' },
  { id: 'arrows', name: 'Arrows (x10)', type: 'arrows', price: 20, icon: <CircleDot size={20} />, description: 'Ammunition for bow' },
  { id: 'shield', name: 'Steel Shield', type: 'shield', price: 40, icon: <Shield size={20} />, description: 'Doubles defense' },
  { id: 'torch', name: 'Torch', type: 'torch', price: 15, icon: <Flame size={20} />, description: 'Light in darkness' },
  { id: 'apple', name: 'Fresh Apple', type: 'apple', price: 5, icon: <Apple size={20} />, description: 'Restores 10 hunger' },
];

interface ShopPanelProps {
  playerGold: number;
  onBuyItem: (type: string, cost: number) => boolean;
  onClose: () => void;
  stopProp: (e: any) => void;
  merchantName: string;
}

export const ShopPanel: React.FC<ShopPanelProps> = ({ playerGold, onBuyItem, onClose, stopProp, merchantName }) => {
  const [message, setMessage] = React.useState<string | null>(null);

  const handleBuy = (item: ShopItem) => {
    if (playerGold < item.price) {
      setMessage("Not enough gold!");
      setTimeout(() => setMessage(null), 2000);
      return;
    }
    
    const success = onBuyItem(item.type, item.price);
    if (success) {
      setMessage(`Bought ${item.name}!`);
      setTimeout(() => setMessage(null), 2000);
    }
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
          {SHOP_ITEMS.map(item => (
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
                {item.icon}
              </div>
              <div className="flex-1">
                <div className="font-bold text-white">{item.name}</div>
                <div className="text-sm text-amber-300/80">{item.description}</div>
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
