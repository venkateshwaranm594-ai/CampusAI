import React, { useEffect } from 'react';
import { Sparkles, X } from 'lucide-react';

export default function Toast({ message, onClose }) {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => {
      onClose();
    }, 4000);
    return () => clearTimeout(timer);
  }, [message, onClose]);

  if (!message) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 bg-slate-900/90 border border-indigo-500/50 text-white text-xs font-semibold rounded-2xl shadow-2xl backdrop-blur-xl animate-bounce">
      <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
      <span>{message}</span>
      <button onClick={onClose} className="p-1 hover:text-slate-300 ml-2">
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
