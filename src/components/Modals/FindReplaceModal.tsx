import React, { useState, useEffect } from 'react';
import { X, Search, Replace } from 'lucide-react';
import { Editor } from '@tiptap/react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  editor: Editor | null;
}

export const FindReplaceModal: React.FC<Props> = ({ isOpen, onClose, editor }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [replaceTerm, setReplaceTerm] = useState('');
  const [matchCount, setMatchCount] = useState<number | null>(null);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSearch = () => {
    if (!editor || !searchTerm) return;
    const text = editor.getText();
    const regex = new RegExp(searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    const matches = text.match(regex);
    setMatchCount(matches ? matches.length : 0);
  };

  const handleReplaceAll = () => {
    if (!editor || !searchTerm) return;
    const currentHtml = editor.getHTML();
    const escaped = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escaped, 'g');
    const newHtml = currentHtml.replace(regex, replaceTerm);
    editor.commands.setContent(newHtml);
    setMatchCount(0);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-2xs p-4 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2 text-slate-800 font-semibold text-sm">
            <Search className="w-4 h-4 text-blue-600" />
            Najít a nahradit
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
            title="Zavřít (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Hledat text:</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setMatchCount(null);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSearch();
              }}
              placeholder="Zadejte hledaný výraz..."
              autoFocus
              className="w-full px-3 py-1.5 border border-slate-200 hover:border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Nahradit za:</label>
            <input
              type="text"
              value={replaceTerm}
              onChange={(e) => setReplaceTerm(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleReplaceAll();
              }}
              placeholder="Nový text..."
              className="w-full px-3 py-1.5 border border-slate-200 hover:border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none transition-all"
            />
          </div>

          {matchCount !== null && (
            <p className="text-xs text-slate-500 bg-slate-50 px-2.5 py-1.5 rounded-md border border-slate-200">
              Nalezeno výskytů: <strong className="text-slate-800">{matchCount}</strong>
            </p>
          )}

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={handleSearch}
              disabled={!searchTerm.trim()}
              className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 disabled:pointer-events-none rounded-lg transition-colors"
            >
              Najít
            </button>
            <button
              type="button"
              onClick={handleReplaceAll}
              disabled={!searchTerm.trim()}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:pointer-events-none rounded-lg shadow-xs transition-colors"
            >
              <Replace className="w-3.5 h-3.5" />
              Nahradit vše
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
