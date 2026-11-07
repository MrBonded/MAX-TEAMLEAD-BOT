import React from 'react';

interface FloatingSticker {
  id: string;
  emoji: string;
  label: string;
  top: string;
  left?: string;
  right?: string;
  animationClass: string;
  delay: string;
  size: string;
}

const STICKERS: FloatingSticker[] = [
  { id: '1', emoji: '🤖', label: 'AI', top: '12%', left: '4%', animationClass: 'animate-float-slow', delay: '0s', size: 'text-2xl sm:text-3xl' },
  { id: '2', emoji: '⚡', label: '3.3V', top: '22%', right: '5%', animationClass: 'animate-float-reverse', delay: '1.2s', size: 'text-xl sm:text-2xl' },
  { id: '3', emoji: '💻', label: 'Code', top: '48%', left: '2%', animationClass: 'animate-float-fast', delay: '0.5s', size: 'text-2xl sm:text-3xl' },
  { id: '4', emoji: '🚀', label: 'Rocket', top: '68%', right: '4%', animationClass: 'animate-float-slow', delay: '2s', size: 'text-2xl sm:text-3xl' },
  { id: '5', emoji: '💡', label: 'Idea', top: '82%', left: '6%', animationClass: 'animate-float-reverse', delay: '1s', size: 'text-xl sm:text-2xl' },
  { id: '6', emoji: '🛡️', label: 'Shield', top: '35%', right: '3%', animationClass: 'animate-float-fast', delay: '2.5s', size: 'text-xl sm:text-2xl' },
  { id: '7', emoji: '📐', label: 'Flexbox', top: '90%', right: '8%', animationClass: 'animate-float-slow', delay: '0.8s', size: 'text-xl sm:text-2xl' },
];

export const FloatingBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 select-none">
      {/* Soft ambient gradient orbs */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 rounded-full bg-blue-500/10 dark:bg-blue-600/15 blur-3xl animate-pulse-glow" />
      <div className="absolute bottom-1/3 right-1/4 w-96 h-96 rounded-full bg-purple-500/10 dark:bg-purple-600/15 blur-3xl animate-pulse-glow" style={{ animationDelay: '3s' }} />
      <div className="absolute top-2/3 left-1/3 w-72 h-72 rounded-full bg-cyan-500/10 dark:bg-cyan-500/10 blur-3xl animate-pulse-glow" style={{ animationDelay: '1.5s' }} />

      {/* Floating Levitation Stickers */}
      {STICKERS.map((sticker) => (
        <div
          key={sticker.id}
          className={`absolute ${sticker.animationClass} opacity-40 dark:opacity-50 hover:opacity-100 transition-opacity duration-300 drop-shadow-md`}
          style={{
            top: sticker.top,
            left: sticker.left,
            right: sticker.right,
            animationDelay: sticker.delay,
          }}
        >
          <div className="backdrop-blur-md bg-white/40 dark:bg-slate-800/40 border border-white/40 dark:border-white/10 rounded-2xl p-2 shadow-sm flex items-center justify-center transform hover:scale-125 transition-transform">
            <span className={sticker.size}>{sticker.emoji}</span>
          </div>
        </div>
      ))}
    </div>
  );
};
