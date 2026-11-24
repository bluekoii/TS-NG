import React from 'react';
import { X, ShieldCheck, AlertTriangle, Waves, Anchor } from 'lucide-react';
import { NPARKS_STANDARD_RULES, PUB_STANDARD_RULES } from '../data/fishingGrounds';

interface RulesGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RulesGuideModal: React.FC<RulesGuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-[2px] p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="rules-guide-title"
    >
      <div className="bg-white border border-slate-200 rounded-xl shadow-xl max-w-3xl w-full max-h-[85vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div>
            <h2 id="rules-guide-title" className="text-lg font-bold text-slate-900">
              Singapore Recreational Fishing Regulations
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              PUB Water Catchment Rules · NParks Coastal &amp; Marine Guidelines · Up to SGD 3,000 Fines
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close regulations guide"
            className="p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto px-6 py-5 space-y-6 text-sm text-slate-700">
          <section className="space-y-2.5">
            <div className="flex items-center gap-2 text-sky-700 font-semibold">
              <Waves className="w-4 h-4 shrink-0" />
              <h3>PUB Reservoirs &amp; ABC Waterways (Freshwater)</h3>
            </div>
            <p className="text-xs text-slate-500">
              Applies to all 15 designated PUB reservoirs, canals, and river decks. Always look for official blue railings and fishing-zone signs.
            </p>
            <ul className="space-y-2 border-t border-slate-100 pt-3">
              {PUB_STANDARD_RULES.map((rule, i) => (
                <li key={i} className="flex items-start gap-2.5 text-slate-700">
                  <ShieldCheck className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                  <span>{rule}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="space-y-2.5 border-t border-slate-200 pt-5">
            <div className="flex items-center gap-2 text-emerald-700 font-semibold">
              <Anchor className="w-4 h-4 shrink-0" />
              <h3>NParks Coastal Parks, Jetties &amp; Offshore Islands (Saltwater)</h3>
            </div>
            <p className="text-xs text-slate-500">
              Applies to permitted beachfronts, public jetties, and Southern / Northern Island seawalls.
            </p>
            <ul className="space-y-2 border-t border-slate-100 pt-3">
              {NPARKS_STANDARD_RULES.map((rule, i) => (
                <li key={i} className="flex items-start gap-2.5 text-slate-700">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{rule}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="space-y-2.5 border-t border-slate-200 pt-5">
            <div className="flex items-center gap-2 text-red-700 font-semibold">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <h3>Strictly Prohibited &amp; No-Take Zones</h3>
            </div>
            <p className="text-slate-600 leading-relaxed">
              Fishing is banned year-round inside <strong>Sisters’ Islands Marine Park</strong>,{' '}
              <strong>Chek Jawa Wetlands (Pulau Ubin)</strong>, <strong>Coney Island Park</strong>, nature reserves, mangrove creeks, swimming lagoons, and any unmarked reservoir banks. When in doubt on-site, if no fishing-zone sign or blue railing is present, do not cast.
            </p>
          </section>
        </div>

        <div className="px-6 py-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-xs text-slate-600">
            <a
              href="https://www.pub.gov.sg/Public/Our-Waters/Recreation/Fishing"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-slate-900"
            >
              PUB Official Fishing Guidelines
            </a>
            <span aria-hidden="true">·</span>
            <a
              href="https://www.nparks.gov.sg/activities/fun-and-recreation/fishing"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-slate-900"
            >
              NParks Fishing Etiquette
            </a>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
