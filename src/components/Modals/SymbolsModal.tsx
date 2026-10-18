import React, { useState } from 'react';
import { X, Sparkles } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onInsertSymbol: (symbol: string) => void;
}

const CATEGORIES = [
  {
    name: 'Typografie',
    symbols: ['„', '“', '‚', '‘', '»', '«', '—', '–', '…', '©', '®', '™', '•', '§', '°', '¶', '†', '‡', '№', '‹', '›'],
  },
  {
    name: 'Měny',
    symbols: ['Kč', '€', '$', '£', '¥', '¢', '₽', '₩', '₿', '₺', '₴', '₹'],
  },
  {
    name: 'Matematika & Věda',
    symbols: ['±', '×', '÷', '≠', '≈', '≤', '≥', '∑', '∏', '√', '∞', 'π', 'µ', '∆', 'Ω', '‰', '¼', '½', '¾', '²', '³', 'ⁿ', '∂', '∫'],
  },
  {
    name: 'Šipky',
    symbols: ['←', '→', '↑', '↓', '↔', '↕', '⇐', '⇒', '⇑', '⇓', '⇔', '➔', '➜', '↗', '↘', '↖', '↙'],
  },
  {
    name: 'Značky & Emojis',
    symbols: ['✓', '✔', '✕', '✖', '★', '☆', '✦', '✧', '♦', '♥', '♠', '♣', '💡', '📌', '📎', '📝', '📄', '⚠️', 'ℹ️', '🔔', '🚀', '🎯', '✅'],
  },
];

export const SymbolsModal: React.FC<Props> = ({ isOpen, onClose, onInsertSymbol }) => {
  const [activeTab, setActiveTab] = useState(0);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2 text-slate-800 font-semibold text-sm">
            <Sparkles className="w-4 h-4 text-blue-600" />
            Vložit speciální znak a symbol
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Category Tabs */}
        <div className="flex overflow-x-auto border-b border-slate-200 px-3 pt-2 gap-1 scrollbar-none bg-slate-50/40">
          {CATEGORIES.map((cat, idx) => (
            <button
              key={cat.name}
              type="button"
              onClick={() => setActiveTab(idx)}
              className={`px-3 py-1.5 text-xs font-medium rounded-t-lg transition-colors whitespace-nowrap ${
                activeTab === idx
                  ? 'bg-white border-t border-x border-slate-200 text-blue-600 font-semibold -mb-px'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Symbols Grid */}
        <div className="p-4 max-h-64 overflow-y-auto">
          <div className="grid grid-cols-6 sm:grid-cols-8 gap-2">
            {CATEGORIES[activeTab].symbols.map((sym) => (
              <button
                key={sym}
                type="button"
                onClick={() => {
                  onInsertSymbol(sym);
                  onClose();
                }}
                className="w-10 h-10 flex items-center justify-center text-lg font-medium rounded-lg border border-slate-200 hover:border-blue-500 hover:bg-blue-50 hover:text-blue-600 transition-all text-slate-800"
              >
                {sym}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 bg-slate-50/50">
          <span className="text-[11px] text-slate-400">Klepnutím na znak jej vložíte na pozici kurzoru</span>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1 text-xs font-medium text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
          >
            Zavřít
          </button>
        </div>
      </div>
    </div>
  );
};
