import React from 'react';

interface EquipmentHeaderProps {
    onClose: () => void;
}

export const EquipmentHeader: React.FC<EquipmentHeaderProps> = ({ onClose }) => {
    return (
        <div className="flex justify-between items-center border-b border-slate-700 pb-4">
            <h2 className="text-2xl font-bold text-white font-serif tracking-wide">Character Equipment</h2>
            <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>
    );
};
