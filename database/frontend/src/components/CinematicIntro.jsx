import React, { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';

export default function CinematicIntro({ onComplete }) {
  const [stage, setStage] = useState(0);

  useEffect(() => {
    // Stage 1: Glow & Logo reveal (0ms)
    // Stage 2: Tagline fade in (600ms)
    // Stage 3: Smooth dissolve to dashboard (1500ms)
    const t1 = setTimeout(() => setStage(1), 300);
    const t2 = setTimeout(() => setStage(2), 800);
    const t3 = setTimeout(() => {
      setStage(3);
      if (onComplete) onComplete();
    }, 1600);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [onComplete]);

  if (stage === 3) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#07090e] flex items-center justify-center overflow-hidden transition-opacity duration-500 ease-out">
      {/* Background Radial Glow */}
      <div className="absolute w-[500px] h-[500px] bg-gradient-to-tr from-indigo-600/30 via-purple-600/20 to-cyan-500/30 rounded-full blur-3xl animate-pulse" />

      {/* Cinematic Logo Container */}
      <div className="relative z-10 text-center space-y-4 px-4">
        <div className="inline-flex items-center justify-center p-4 rounded-3xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-cyan-400 shadow-2xl shadow-indigo-500/40 animate-bounce">
          <Sparkles className="w-12 h-12 text-cyan-300" />
        </div>

        <h1 className={`text-4xl md:text-5xl font-extrabold tracking-tight transition-all duration-700 ${
          stage >= 1 ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-95'
        }`}>
          <span className="bg-gradient-to-r from-white via-indigo-200 to-cyan-300 bg-clip-text text-transparent">
            CampusPulse AI
          </span>
        </h1>

        <p className={`text-sm md:text-base font-semibold tracking-wider text-indigo-300 transition-all duration-700 ${
          stage >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
        }`}>
          Turn Attendance Into Insight.
        </p>
      </div>
    </div>
  );
}
