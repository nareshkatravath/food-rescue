import React from 'react';
import { SDG_DETAILS } from '../data/mockData';
import { FoodRescueLogo, GlobeIllustration } from './FoodRescueLogo';
import { X, Award, CheckCircle2, HeartHandshake, ShieldCheck } from 'lucide-react';

export const SDGModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 z-50 overflow-y-auto">
      <div className="bg-[#FFFDF2] rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-5 sm:p-6 shadow-2xl border border-emerald-100 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800 shadow-2xs transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <FoodRescueLogo size={40} />
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 font-heading">
              Supported UN Sustainable Development Goals
            </h2>
            <p className="text-xs text-slate-500">
              FoodRescue aligns with the United Nations 2030 Agenda for Sustainable Development
            </p>
          </div>
        </div>

        {/* Hero Mission Banner */}
        <div className="bg-gradient-to-r from-[#087A28] to-[#179539] text-white p-4 rounded-2xl mb-5 flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-bold">
              Global Impact
            </span>
            <h3 className="text-lg font-black mt-1 font-heading">
              Small Action... Big Impact!
            </h3>
            <p className="text-xs text-emerald-100 max-w-md mt-0.5">
              FoodRescue: Together for a Zero Hunger World. Every meal saved prevents greenhouse gases and directly nourishes human lives.
            </p>
          </div>
          <div className="w-16 h-16 shrink-0 hidden sm:block">
            <GlobeIllustration className="w-full h-full" />
          </div>
        </div>

        {/* The 5 SDGs matching reference poster */}
        <div className="space-y-3 mb-6">
          {SDG_DETAILS.map((sdg) => (
            <div
              key={sdg.number}
              className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center gap-3"
            >
              <div
                className="w-14 h-14 rounded-xl flex flex-col items-center justify-center text-white font-extrabold shrink-0 shadow-xs"
                style={{ backgroundColor: sdg.color }}
              >
                <span className="text-[10px] uppercase opacity-90 leading-none">SDG</span>
                <span className="text-2xl font-black leading-none">{sdg.number}</span>
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-extrabold text-slate-900">{sdg.title}</h4>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${sdg.badgeBg}`}>
                    {sdg.code}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">{sdg.description}</p>
                <p className="text-xs text-emerald-900 font-semibold mt-1 bg-emerald-50/70 p-1.5 rounded-lg border border-emerald-200/50">
                  <span className="font-bold">How FoodRescue delivers: </span>
                  {sdg.impactText}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Key Benefits & Highlights Section matching bottom of reference poster */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
            <h4 className="text-xs font-black text-slate-900 uppercase tracking-wide mb-2 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#087A28]" />
              Key Platform Benefits
            </h4>
            <ul className="space-y-1.5 text-xs text-slate-600 font-medium">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#087A28]" />
                Reduces landfill methane & food wastage
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#087A28]" />
                Directly feeds people and shelters in need
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#087A28]" />
                Supports community equality & NGO coordination
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#087A28]" />
                Enforces food safety and rapid pickup deadlines
              </li>
            </ul>
          </div>

          <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
            <h4 className="text-xs font-black text-slate-900 uppercase tracking-wide mb-2 flex items-center gap-1.5">
              <HeartHandshake className="w-4 h-4 text-[#087A28]" />
              How It Works Workflow
            </h4>
            <ol className="space-y-1.5 text-xs text-slate-600 font-medium list-decimal list-inside">
              <li>Donors post surplus food with photo & expiry</li>
              <li>Receivers & NGOs browse nearby food & request</li>
              <li>Donors approve; status updates in real time</li>
              <li>Food collected safely & recorded in community stats</li>
            </ol>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 bg-[#087A28] text-white font-bold rounded-xl text-xs hover:bg-[#066521] transition shadow-xs"
        >
          Close SDG Guide
        </button>
      </div>
    </div>
  );
};
