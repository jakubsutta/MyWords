import React from 'react';
import { Editor } from '@tiptap/react';
import type { DocumentStats } from '../../types/editor';
import {
  BarChart2,
  Clock,
  Search,
  Undo2,
  Redo2,
  Trash2,
  Keyboard,
} from 'lucide-react';

interface Props {
  editor: Editor | null;
  stats: DocumentStats;
  onOpenFindReplace: () => void;
}

export const StatsToolsTab: React.FC<Props> = ({ editor, stats, onOpenFindReplace }) => {
  if (!editor) return null;

  const handleClear = () => {
    if (window.confirm('Opravdu si přejete vymazat celý obsah dokumentu?')) {
      editor.chain().focus().clearContent().run();
    }
  };

  return (
    <div className="space-y-6">
      {/* Live Statistics Cards */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <BarChart2 className="w-3.5 h-3.5 text-blue-600" />
          Statistika dokumentu
        </label>
        <div className="grid grid-cols-2 gap-2">
          <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-2xs">
            <div className="text-[11px] text-slate-500 font-medium">Počet slov</div>
            <div className="text-xl font-bold text-slate-800 mt-0.5">{stats.words}</div>
          </div>
          <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-2xs">
            <div className="text-[11px] text-slate-500 font-medium">Znaků (s mezerami)</div>
            <div className="text-xl font-bold text-slate-800 mt-0.5">{stats.characters}</div>
          </div>
          <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-2xs">
            <div className="text-[11px] text-slate-500 font-medium">Znaků (bez mezer)</div>
            <div className="text-xl font-bold text-slate-800 mt-0.5">{stats.charactersNoSpaces}</div>
          </div>
          <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-2xs">
            <div className="text-[11px] text-slate-500 font-medium">Odstavců</div>
            <div className="text-xl font-bold text-slate-800 mt-0.5">{stats.paragraphs}</div>
          </div>
        </div>

        <div className="mt-2 p-2.5 bg-blue-50/60 rounded-xl border border-blue-100 flex items-center gap-2 text-xs text-blue-800">
          <Clock className="w-4 h-4 text-blue-600 shrink-0" />
          <span>
            Odhadovaná doba čtení: <strong>{stats.readingTimeMinutes} min</strong>
          </span>
        </div>
      </div>

      {/* Editor Tools */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
          Nástroje & Historie
        </label>
        <div className="space-y-2">
          <button
            type="button"
            onClick={onOpenFindReplace}
            className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-blue-600" />
              <span>Najít a nahradit v textu...</span>
            </div>
            <kbd className="px-1.5 py-0.5 text-[10px] bg-slate-100 border border-slate-200 rounded text-slate-500">
              Ctrl+F
            </kbd>
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => editor.chain().focus().undo().run()}
              disabled={!editor.can().undo()}
              className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none transition-colors shadow-2xs"
            >
              <Undo2 className="w-3.5 h-3.5" />
              Zpět (Undo)
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().redo().run()}
              disabled={!editor.can().redo()}
              className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none transition-colors shadow-2xs"
            >
              <Redo2 className="w-3.5 h-3.5" />
              Znovu (Redo)
            </button>
          </div>

          <button
            type="button"
            onClick={handleClear}
            className="w-full flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-colors mt-2"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Vymazat celý dokument
          </button>
        </div>
      </div>

      {/* Useful Shortcuts */}
      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 mb-2">
          <Keyboard className="w-3.5 h-3.5 text-slate-500" />
          Klávesové zkratky
        </div>
        <div className="space-y-1 text-[11px] text-slate-600">
          <div className="flex justify-between">
            <span>Tučné písmo:</span>
            <kbd className="font-mono bg-white px-1 border border-slate-200 rounded">Ctrl+B</kbd>
          </div>
          <div className="flex justify-between">
            <span>Kurzíva:</span>
            <kbd className="font-mono bg-white px-1 border border-slate-200 rounded">Ctrl+I</kbd>
          </div>
          <div className="flex justify-between">
            <span>Podtržení:</span>
            <kbd className="font-mono bg-white px-1 border border-slate-200 rounded">Ctrl+U</kbd>
          </div>
          <div className="flex justify-between">
            <span>Zpět:</span>
            <kbd className="font-mono bg-white px-1 border border-slate-200 rounded">Ctrl+Z</kbd>
          </div>
          <div className="flex justify-between">
            <span>Tisk / Export do PDF:</span>
            <kbd className="font-mono bg-white px-1 border border-slate-200 rounded">Ctrl+P</kbd>
          </div>
        </div>
      </div>
    </div>
  );
};
