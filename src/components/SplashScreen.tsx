import React from 'react';
import { useFoodRescue } from '../context/FoodRescueContext';
import { FoodRescueLogo } from './FoodRescueLogo';
import { ArrowRight, Sparkles } from 'lucide-react';

export const SplashScreen: React.FC = () => {
  const { setActiveScreen } = useFoodRescue();

  return (
    <div className="flex-1 w-full flex flex-col justify-between items-center px-6 py-8 relative bg-gradient-to-b from-[#FFFDF2] via-[#FFFDF2] to-[#EEF8EE] overflow-hidden text-center select-none">
      {/* Decorative background leaves floating */}
      <div className="absolute top-6 left-6 text-emerald-600/20 text-3xl select-none pointer-events-none rotate-12">
        🍃
      </div>
      <div className="absolute top-16 right-8 text-emerald-600/20 text-2xl select-none pointer-events-none -rotate-12">
        🌿
      </div>

      {/* Center Hero: Logo & Branding */}
      <div className="flex-1 flex flex-col items-center justify-center pt-8 pb-4">
        {/* Animated Green Bowl Logo with shadow */}
        <div className="relative mb-6 transform hover:scale-105 transition-transform duration-300">
          <div className="absolute -inset-4 bg-emerald-100/60 rounded-full blur-xl animate-pulse" />
          <FoodRescueLogo size={130} className="relative drop-shadow-md" />
        </div>

        {/* Brand Name */}
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight font-heading flex items-center justify-center">
          <span className="text-[#087A28]">Food</span>
          <span className="text-[#F5A623]">Rescue</span>
        </h1>

        {/* Tagline matching reference poster */}
        <p className="mt-2 text-base font-semibold text-slate-700 italic tracking-wide">
          Share Food... Save Tomorrow
        </p>

        {/* Mission statement */}
        <p className="mt-3 text-xs text-slate-500 max-w-xs leading-relaxed font-medium">
          Reduce Food Waste • Fight Hunger • Build a Sustainable Future
        </p>
      </div>

      {/* Bottom Scenic City Landscape & Action Buttons */}
      <div className="w-full flex flex-col items-center relative z-10">
        {/* City & Tree landscape vector silhouette matching reference poster */}
        <div className="w-full mb-6 opacity-75">
          <svg viewBox="0 0 320 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
            {/* Soft rolling hills */}
            <path
              d="M0 65C40 55 90 70 140 60C190 50 250 68 320 58V80H0V65Z"
              fill="#D1E7D1"
            />
            {/* Foreground hill */}
            <path
              d="M0 72C60 66 120 74 180 68C240 62 290 75 320 70V80H0V72Z"
              fill="#A3D9A5"
            />
            {/* Skyline silhouettes */}
            <rect x="35" y="40" width="14" height="25" rx="1" fill="#7CBD80" />
            <rect x="52" y="30" width="16" height="35" rx="1" fill="#69AF70" />
            <rect x="71" y="44" width="12" height="21" rx="1" fill="#7CBD80" />
            <rect x="130" y="36" width="18" height="29" rx="1" fill="#69AF70" />
            <rect x="151" y="24" width="15" height="41" rx="1" fill="#58A260" />
            <rect x="169" y="42" width="14" height="23" rx="1" fill="#7CBD80" />
            <rect x="235" y="32" width="20" height="33" rx="1" fill="#69AF70" />
            <rect x="258" y="45" width="15" height="20" rx="1" fill="#7CBD80" />
            {/* Little trees */}
            <circle cx="25" cy="58" r="6" fill="#388E3C" />
            <circle cx="105" cy="56" r="7" fill="#43A047" />
            <circle cx="210" cy="55" r="8" fill="#388E3C" />
            <circle cx="295" cy="60" r="6" fill="#43A047" />
          </svg>
        </div>

        {/* Get Started Button */}
        <button
          onClick={() => setActiveScreen('home')}
          className="w-full py-3.5 px-6 bg-[#087A28] hover:bg-[#066521] text-white font-bold rounded-2xl shadow-md hover:shadow-lg transition-all transform active:scale-95 flex items-center justify-center gap-2 text-sm tracking-wide"
        >
          <span>Get Started</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        {/* Login Option */}
        <button
          onClick={() => setActiveScreen('login')}
          className="mt-3 py-2 px-4 text-xs font-semibold text-slate-600 hover:text-[#087A28] transition"
        >
          Already have an account? <span className="text-[#087A28] underline underline-offset-2">Login</span>
        </button>
      </div>
    </div>
  );
};
