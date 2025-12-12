import React from 'react';

// Exposed from vite.config.ts
declare const APP_VERSION: string;

export const VersionBadge: React.FC = () => {
    // Fallback if not defined for some reason (e.g. tests running without full Vite env)
    const version = typeof APP_VERSION !== 'undefined' ? APP_VERSION : '0.0.0';

    return (
        <div className="fixed top-4 left-4 z-50 pointer-events-none select-none">
            <div className="
                w-10 h-10 
                rounded-full 
                bg-gray-900/90 
                border-2 border-yellow-500/80 
                flex items-center justify-center 
                shadow-lg shadow-black/50
                backdrop-blur-sm
            ">
                <span className="text-[10px] font-bold text-yellow-400 font-mono tracking-tighter">
                    v{version}
                </span>
            </div>
        </div>
    );
};
