import React from 'react';
import { Box, User, Minus, Plus, Mic, Send, Briefcase, ChevronDown, ChevronUp } from 'lucide-react';
import { GenerationMode } from '../../types';
import { useGenerationInput } from '../../hooks/useGenerationInput';

interface GenerationInputProps {
  onGenerate: (prompt: string, mode: GenerationMode, count: number, isEnemy?: boolean) => void;
  count: number;
  setCount: React.Dispatch<React.SetStateAction<number>>;
  inputRef: React.RefObject<HTMLInputElement>;
  stopProp: (e: any) => void;
  showTooltip: (e: any, text: string) => void;
  hideTooltip: () => void;
}

export const GenerationInput: React.FC<GenerationInputProps> = ({ onGenerate, count, setCount, inputRef: externalInputRef, stopProp, showTooltip, hideTooltip }) => {
  const {
      prompt,
      setPrompt,
      mode,
      setMode,
      isEnemy,
      setIsEnemy,
      isListening,
      handleSend,
      toggleMic
  } = useGenerationInput({ onGenerate, count, setCount });

  // Use external ref if provided
  const ref = externalInputRef || React.createRef();

  /* State */
  const [isCollapsed, setIsCollapsed] = React.useState(false);

  return (
    <div className={`flex flex-col gap-2 bg-white/10 backdrop-blur-md p-3 rounded-xl border border-white/20 pointer-events-auto transition-all ${isCollapsed ? 'w-fit ml-auto' : 'w-full'}`} onPointerDown={stopProp} onClick={stopProp}>
      <div className="flex justify-between items-center">
         {/* Title / Collapse Toggle */}
         <div className="flex items-center gap-2 text-white/50 text-xs font-bold uppercase tracking-wider select-none">
            {!isCollapsed && <span>AI Generation</span>}
         </div>
         <button 
                onClick={() => setIsCollapsed(!isCollapsed)} 
                className="text-white/70 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
                title={isCollapsed ? "Expand AI Menu" : "Collapse AI Menu"}
            >
             {isCollapsed ? <div className="flex items-center gap-2 font-bold px-2 text-white/80 whitespace-nowrap"><span>AI Gen</span><ChevronUp size={16} /></div> : <ChevronDown size={16} />}
         </button>
      </div>

      {!isCollapsed && (
        <>
            <div className="flex justify-between items-end">
                <div className="flex gap-2 items-center flex-wrap">
                <button onClick={() => setMode('STRUCTURE')} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-bold transition-colors ${mode === 'STRUCTURE' ? 'bg-blue-600 text-white shadow-lg' : 'bg-black/30 text-white/70 hover:bg-black/50'}`} onMouseEnter={(e) => showTooltip(e, "Build Structures")} onMouseLeave={hideTooltip}>
                    <Box className="w-4 h-4" /> Structure
                </button>
                <button onClick={() => setMode('CHARACTER')} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-bold transition-colors ${mode === 'CHARACTER' ? 'bg-orange-600 text-white shadow-lg' : 'bg-black/30 text-white/70 hover:bg-black/50'}`} onMouseEnter={(e) => showTooltip(e, "Spawn Characters")} onMouseLeave={hideTooltip}>
                    <User className="w-4 h-4" /> Character
                </button>
                <button onClick={() => setMode('ITEM')} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-bold transition-colors ${mode === 'ITEM' ? 'bg-purple-600 text-white shadow-lg' : 'bg-black/30 text-white/70 hover:bg-black/50'}`} onMouseEnter={(e) => showTooltip(e, "Create Items")} onMouseLeave={hideTooltip}>
                    <Briefcase className="w-4 h-4" /> Item
                </button>
                
                {mode === 'CHARACTER' && (
                    <label className="flex items-center gap-2 cursor-pointer bg-black/40 px-2 py-1.5 rounded-lg border border-white/10 hover:bg-black/60 transition-colors" onMouseEnter={(e) => showTooltip(e, "Mark as Hostile Enemy")} onMouseLeave={hideTooltip}>
                        <input type="checkbox" checked={isEnemy} onChange={(e) => setIsEnemy(e.target.checked)} className="accent-red-500 w-4 h-4 cursor-pointer" />
                        <span className={`text-xs font-bold ${isEnemy ? 'text-red-400' : 'text-gray-400'}`}>Enemy</span>
                    </label>
                )}
                </div>

                <div className="flex items-center gap-1 bg-black/40 rounded-lg p-1 border border-white/10">
                <button onClick={() => setCount(c => Math.max(1, c - 1))} className="p-1 hover:bg-white/10 rounded text-white" onMouseEnter={(e) => showTooltip(e, "Decrease Count")} onMouseLeave={hideTooltip}><Minus className="w-3 h-3"/></button>
                <span className="text-white font-mono font-bold w-4 text-center text-sm">{count}</span>
                <button onClick={() => setCount(c => Math.min(10, c + 1))} className="p-1 hover:bg-white/10 rounded text-white" onMouseEnter={(e) => showTooltip(e, "Increase Count")} onMouseLeave={hideTooltip}><Plus className="w-3 h-3"/></button>
                </div>
            </div>

            <div className="flex items-center bg-white rounded-lg overflow-hidden h-12 gap-1 pr-1">
                <input
                    ref={ref}
                    type="text"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    placeholder={isListening ? "Listening..." : (mode === 'STRUCTURE' ? "Describe structure..." : mode === 'CHARACTER' ? "Describe character..." : "Describe item...")}
                    className="flex-1 px-4 h-full outline-none text-gray-800 placeholder-gray-500"
                />
                <button 
                    onClick={toggleMic} 
                    className={`flex items-center gap-2 px-3 py-1 rounded-md transition-all ${isListening ? 'bg-red-500 text-white animate-pulse' : 'text-gray-500 hover:bg-gray-100'}`}
                    onMouseEnter={(e) => showTooltip(e, "Click to Speak (Toggle)")} onMouseLeave={hideTooltip}
                >
                    <Mic className="w-5 h-5" />
                    {isListening && <span className="text-xs font-bold">Listening</span>}
                </button>
                <button onClick={handleSend} className="px-5 h-9 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors" onMouseEnter={(e) => showTooltip(e, "Send to AI")} onMouseLeave={hideTooltip}>
                    <Send className="w-5 h-5" />
                </button>
            </div>
        </>
      )}
    </div>
  );
};