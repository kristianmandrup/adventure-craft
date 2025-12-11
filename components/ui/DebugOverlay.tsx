import React, { useImperativeHandle, forwardRef, useRef, useState } from 'react';

export interface DebugInfo {
  speed: number;
  moving: boolean;
  locked: boolean;
  keys: string;
  direction: string;
  heading: number;
  lastKey: string;
  keyDuration: string;
  pitch: number;
  yaw: number;
  mode?: string;
}

export interface DebugOverlayRef {
  update: (info: DebugInfo) => void;
}

export const DebugOverlay = forwardRef<DebugOverlayRef, {}>((props, ref) => {
  const [info, setInfo] = useState<DebugInfo | null>(null);
  
  useImperativeHandle(ref, () => ({
    update: (newInfo: DebugInfo) => {
      // We use a functional state update or optimization here if needed
      // But simply isolating state to this leaf component is enough to fix the App-wide re-render
      setInfo(newInfo);
    }
  }));

  if (!info) return null;

  return (
    <div className="fixed bottom-5 left-1/2 ml-[420px] pointer-events-none p-2 rounded-lg bg-black/50 text-white/80 font-mono text-xs z-50">
        <div className="font-bold border-b border-white/20 mb-1">MOVEMENT</div>
        <div>STATUS: {info.locked ? 'LOCKED' : 'UNLOCKED'}</div>
        <div>DIR: {info.direction} ({info.heading}°)</div>
        <div>SPEED: {info.speed.toFixed(1)}</div>
        <div className="text-[10px] text-blue-300">MODE: {info.mode}</div>
        <div>STATE: {info.speed > 10.5 ? 'SPRINTING' : info.moving ? 'WALKING' : 'IDLE'}</div>
        <div className="mt-1 font-bold text-yellow-400">LAST KEY: {info.lastKey}</div>
        <div className="text-yellow-400">DURATION: {info.keyDuration}</div>
        <div className="mt-1 text-[10px] text-gray-400">ACTIVE: {info.keys || 'NONE'}</div>
        <div className="mt-1 pt-1 border-t border-white/10">
            <div>PITCH: {info.pitch}° {Math.abs(info.pitch) < 2 && <span className="text-green-400 font-bold ml-2">[LEVEL]</span>}</div>
            <div>YAW: {info.yaw}°</div>
            <div className="text-[9px] text-gray-500 mt-1">PRESS 'H' TO LEVEL VIEW</div>
        </div>
    </div>
  );
});

DebugOverlay.displayName = 'DebugOverlay';
