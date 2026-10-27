import React from 'react';
import { Sparkles, X, Compass, Star } from 'lucide-react';

interface VedicSageComingSoonModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VedicSageComingSoonModal: React.FC<VedicSageComingSoonModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div 
        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-orange-200/80 overflow-hidden text-center p-6 sm:p-8 transform transition-all animate-scaleUp"
        role="dialog"
        aria-modal="true"
        aria-labelledby="sage-modal-title"
      >
        {/* Decorative celestial background accent */}
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-orange-500/10 via-amber-500/5 to-transparent pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          aria-label="Close modal"
        >
          <X size={18} />
        </button>

        {/* 3D Floating Sage Representation Box */}
        <div className="relative mx-auto w-28 h-28 sm:w-32 sm:h-32 mb-5 flex items-center justify-center">
          {/* Glowing orbital aura */}
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-orange-400 to-amber-300 opacity-20 blur-xl animate-pulse" />
          
          {/* Cute Square Chatbot Container */}
          <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-gradient-to-br from-[#162058] to-[#1F2B6C] border-2 border-orange-400/50 shadow-xl flex flex-col items-center justify-center overflow-hidden group">
            {/* Ambient Stars */}
            <Star size={10} className="absolute top-2 left-2 text-amber-300 animate-ping opacity-60" />
            <Sparkles size={12} className="absolute bottom-2 right-2 text-orange-300 animate-pulse" />

            {/* Floating 3D Sage Avatar Icon */}
            <div className="text-4xl sm:text-5xl transform transition-transform duration-700 group-hover:scale-110 drop-shadow-md select-none animate-bounce">
              🧘‍♂️
            </div>
            
            <div className="text-[10px] uppercase tracking-widest font-bold text-amber-300 mt-1">
              VEDIC SAGE
            </div>
          </div>

          {/* Floating Badge */}
          <span className="absolute -bottom-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow-md flex items-center gap-1 border border-white">
            <Sparkles size={10} />
            3D Model
          </span>
        </div>

        {/* Title & Tag */}
        <div className="space-y-1.5 mb-4">
          <h2 id="sage-modal-title" className="text-xl sm:text-2xl font-serif font-bold text-[#162058]">
            3D Vedic Sage Companion
          </h2>
          <p className="text-xs font-semibold text-orange-600 uppercase tracking-wider flex items-center justify-center gap-1.5">
            <Compass size={13} className="text-orange-500" />
            Interactive 3D Chatbot Coming Soon
          </p>
        </div>

        {/* Narrative Description */}
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-6">
          You clicked <span className="font-bold text-orange-600">Chat Now</span>! This button is specifically reserved for our upcoming{' '}
          <span className="font-semibold text-slate-800">floating square 3D Vedic Sage avatar</span>. 
          He is currently in deep Himalayan meditation while our 3D engine is being crafted. 
          Soon, he will float by your side on every page to answer your questions with real-time 3D animations and canonical Jyotish wisdom!
        </p>

        {/* Action Button */}
        <div className="flex flex-col sm:flex-row gap-2 justify-center">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-xs uppercase tracking-wider shadow-md shadow-orange-500/20 transition-all hover:scale-102 cursor-pointer"
          >
            Got It! Can't Wait ✨
          </button>
        </div>
      </div>
    </div>
  );
};
