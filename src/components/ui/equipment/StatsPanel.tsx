import React from 'react';

interface StatsPanelProps {
    stats: {
        attack: number;
        defense: number;
        speed: number;
        specials: string[];
    };
}

export const StatsPanel: React.FC<StatsPanelProps> = ({ stats }) => {
    return (
        <div className="bg-slate-800/80 p-4 rounded-lg border border-slate-600 text-sm">
            <h3 className="text-slate-400 font-bold mb-3 uppercase tracking-wider text-xs">Current Stats</h3>
            <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center">
                    <span className="text-slate-300">Attack Power</span>
                    <span className="text-red-400 font-mono font-bold">{stats.attack > 0 ? '+' : ''}{stats.attack}</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-slate-300">Protection</span>
                    <span className="text-blue-400 font-mono font-bold">{stats.defense > 0 ? '+' : ''}{stats.defense}</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-slate-300">Speed Boost</span>
                    <span className="text-green-400 font-mono font-bold">{stats.speed > 0 ? '+' : ''}{stats.speed}%</span>
                </div>
            </div>
            
            {stats.specials.length > 0 && (
                <div className="mt-4 pt-3 border-t border-slate-700">
                        <h4 className="text-xs text-yellow-500 font-bold mb-1 uppercase">Special Powers</h4>
                        <ul className="list-disc list-inside text-xs text-yellow-100/80">
                            {stats.specials.map((s, i) => <li key={i}>{s}</li>)}
                        </ul>
                </div>
            )}
        </div>
    );
};
