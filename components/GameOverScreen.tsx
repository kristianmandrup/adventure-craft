import { useState, useEffect } from 'react';
import { getLeaderboard, saveScore, isHighScore, ScoreEntry } from '../utils/storage';

interface GameOverScreenProps {
  onRestart: () => void;
  reason?: string;
  score: number;
}

export const GameOverScreen: React.FC<GameOverScreenProps> = ({ onRestart, reason = "You have perished.", score }) => {
  const [leaderboard, setLeaderboard] = useState<ScoreEntry[]>([]);
  const [isHigh, setIsHigh] = useState(false);
  const [name, setName] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    setLeaderboard(getLeaderboard());
    setIsHigh(isHighScore(score));
  }, [score]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    saveScore(name.trim(), score);
    setLeaderboard(getLeaderboard());
    setSubmitted(true);
    setIsHigh(false); // Hide form
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/95 flex flex-col items-center justify-center animate-in fade-in duration-1000 p-4">
      <h1 className="text-6xl md:text-8xl font-black text-red-600 tracking-widest mb-2 drop-shadow-[0_0_15px_rgba(220,38,38,0.8)]" style={{ fontFamily: 'Cinzel, serif' }}>
        GAME OVER
      </h1>
      
      <div className="text-3xl text-yellow-400 font-bold mb-8 tracking-widest drop-shadow-md">
         SCORE: {score}
      </div>

      <p className="text-xl text-gray-400 mb-8 tracking-wider font-light italic text-center max-w-lg">
          "{reason}"
      </p>

      {/* Leaderboard Section */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-6 w-full max-w-md mb-8 backdrop-blur-sm">
          <h2 className="text-white text-xl font-bold mb-4 text-center border-b border-white/10 pb-2">LEGENDARY HEROES</h2>
          
          {leaderboard.length === 0 ? (
              <p className="text-center text-gray-500 italic">No legends recorded yet.</p>
          ) : (
              <div className="space-y-2">
                  {leaderboard.map((entry, idx) => (
                      <div key={idx} className={`flex justify-between items-center text-sm ${idx === 0 ? 'text-yellow-300 font-bold' : 'text-gray-300'}`}>
                          <div className="flex items-center gap-3">
                              <span className="w-4">{idx + 1}.</span>
                              <span>{entry.name}</span>
                          </div>
                          <span>{entry.score}</span>
                      </div>
                  ))}
              </div>
          )}
      </div>

      {/* High Score Input */}
      {isHigh && !submitted && (
          <div className="mb-8 w-full max-w-sm animate-pulse-slow">
              <p className="text-green-400 text-center mb-2 font-bold text-lg">NEW HIGH SCORE!</p>
              <form onSubmit={handleSubmit} className="flex gap-2">
                  <input 
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)} 
                    placeholder="Enter your name, Hero"
                    className="flex-1 bg-black/50 border border-white/30 rounded px-4 py-2 text-white focus:outline-none focus:border-yellow-500"
                    maxLength={15}
                    autoFocus
                  />
                  <button 
                    type="submit"
                    className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded font-bold transition-colors"
                  >
                    SAVE
                  </button>
              </form>
          </div>
      )}
      
      <button 
        onClick={onRestart}
        className="group relative px-8 py-4 bg-transparent border border-white/20 hover:border-white/50 hover:bg-white/5 transition-all duration-300 rounded-lg overflow-hidden"
      >
        <div className="absolute inset-0 w-0 bg-red-800 transition-all duration-[250ms] ease-out group-hover:w-full opacity-20"></div>
        <span className="relative text-white font-bold tracking-[0.2em] text-lg">RESTART LEGEND</span>
      </button>
      
      <div className="mt-8 text-white/20 text-xs tracking-widest uppercase">
          Press any key to restart
      </div>
    </div>
  );
};
