import { useEffect, useState } from 'react';

interface NotificationToastProps {
  message: string | null;
  subMessage?: string | null;
  type?: 'BOSS' | 'MERCHANT' | 'INFO' | 'COMBAT_HIT' | 'COMBAT_MISS' | 'COMBAT_BLOCK' | 'COMBAT_DAMAGE' | 'WARNING';
  icon?: string;
  duration?: number;
  onClose: () => void;
}

export const NotificationToast = ({ message, subMessage, type = 'INFO', icon, duration = 4000, onClose }: NotificationToastProps) => {
  const [visible, setVisible] = useState(false);
  const [displayMsg, setDisplayMsg] = useState<{msg: string, sub: string | null | undefined, type: string, icon?: string} | null>(null);

  useEffect(() => {
    if (message) {
      setDisplayMsg({ msg: message, sub: subMessage, type: type || 'INFO', icon });
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        setTimeout(onClose, 500); 
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [message, subMessage, type, icon, duration, onClose]);

  if (!displayMsg) return null;

  let bgClass = "bg-blue-600/90";
  let borderClass = "border-blue-400/50";
  let defaultIcon = "ℹ️";

  switch (displayMsg.type) {
      case 'BOSS':
          bgClass = "bg-red-900/95";
          borderClass = "border-red-500/80";
          defaultIcon = "☠️";
          break;
      case 'MERCHANT':
          bgClass = "bg-green-700/95";
          borderClass = "border-green-400/50";
          defaultIcon = "💰"; // Bag or coin
          break;
      case 'COMBAT_HIT':
          bgClass = "bg-orange-600/90";
          borderClass = "border-orange-400/50";
          defaultIcon = "⚔️";
          break;
      case 'COMBAT_MISS':
          bgClass = "bg-gray-600/90";
          borderClass = "border-gray-400/50";
          defaultIcon = "💨";
          break;
      case 'COMBAT_BLOCK':
          bgClass = "bg-blue-800/90";
          borderClass = "border-blue-400/50";
          defaultIcon = "🛡️";
          break;
      case 'COMBAT_DAMAGE':
          bgClass = "bg-red-700/90";
          borderClass = "border-red-400/50";
          defaultIcon = "🩸";
          break;
      case 'WARNING':
          bgClass = "bg-yellow-600/90";
          borderClass = "border-yellow-400/50";
          defaultIcon = "⚠️";
          break;
      case 'INFO':
      default:
           // No icon for simple info, or infer from message content
           if (displayMsg.msg.toLowerCase().includes('sword')) defaultIcon = "⚔️";
           else if (displayMsg.msg.toLowerCase().includes('shield')) defaultIcon = "🛡️";
           else if (displayMsg.msg.toLowerCase().includes('health') || displayMsg.msg.toLowerCase().includes('hp')) defaultIcon = "❤️";
           else if (displayMsg.msg.toLowerCase().includes('food') || displayMsg.msg.toLowerCase().includes('eat')) defaultIcon = "🍖";
           else if (displayMsg.msg.toLowerCase().includes('gold') || displayMsg.msg.toLowerCase().includes('coin')) defaultIcon = "💰";
           else defaultIcon = ""; // Empty by default for generic Info as requested
           break;
  }

  const finalIcon = displayMsg.icon || defaultIcon;

  return (
    <div 
        className={`fixed top-24 left-1/2 -translate-x-1/2 transform transition-all duration-500 pointer-events-none z-50
        ${visible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 -translate-y-8 scale-95'}
        `}
    >
        <div className={`${bgClass} backdrop-blur-md px-5 py-3 rounded-xl shadow-2xl border-2 ${borderClass} flex flex-col items-center text-center max-w-sm`}>
            <span className="text-2xl mb-1 filter drop-shadow-md">{finalIcon}</span>
            <h2 className="text-xl font-bold text-white tracking-widest uppercase drop-shadow-lg leading-tight" style={{ fontFamily: 'Cinzel, serif' }}>
                {displayMsg.msg}
            </h2>
            {displayMsg.sub && <p className="text-white/90 text-sm font-semibold mt-1 tracking-wider">{displayMsg.sub}</p>}
        </div>
    </div>
  );
};
