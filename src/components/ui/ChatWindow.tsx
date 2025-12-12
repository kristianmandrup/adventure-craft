import React, { useState, useRef, useEffect } from 'react';
import { X, Send } from 'lucide-react';
import { ChatMessage } from '../../types';

interface ChatWindowProps {
  npcId?: string; // Added for compatibility
  npcName: string;
  history: ChatMessage[];
  onSendMessage: (text: string) => void | Promise<void>;
  onClose: () => void;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ npcName, history, onSendMessage, onClose }) => {
  const stopProp = (e: any) => {
      e.stopPropagation();
      e.nativeEvent?.stopImmediatePropagation?.();
  };
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  const handleSend = () => {
    if (!input.trim()) return;
    onSendMessage(input);
    setInput('');
  };

  return (
    <div className="absolute bottom-20 left-1/2 -translate-x-1/2 w-96 h-80 bg-black/80 backdrop-blur-xl border border-white/20 rounded-xl flex flex-col shadow-2xl pointer-events-auto" onPointerDown={stopProp} onClick={stopProp}>
      <div className="flex justify-between items-center p-3 border-b border-white/10">
        <h3 className="text-white font-bold flex items-center gap-2">
           <div className="w-2 h-2 rounded-full bg-green-500"></div>
           {npcName}
        </h3>
        <button onClick={onClose} className="text-white/50 hover:text-white"><X size={16} /></button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {history.map((msg, idx) => (
           <div key={idx} className={`flex flex-col ${msg.sender === 'Player' ? 'items-end' : 'items-start'}`}>
              <div className={`max-w-[80%] px-3 py-2 rounded-lg text-sm ${msg.sender === 'Player' ? 'bg-blue-600 text-white rounded-br-none' : 'bg-white/10 text-gray-200 rounded-bl-none'}`}>
                 {msg.text}
              </div>
              <span className="text-[10px] text-gray-500 mt-1">{msg.sender}</span>
           </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-3 border-t border-white/10 flex gap-2">
         <input 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Say something..."
            className="flex-1 bg-black/50 border border-white/20 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-blue-500"
         />
         <button onClick={handleSend} className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg">
           <Send size={16} />
         </button>
      </div>
    </div>
  );
};