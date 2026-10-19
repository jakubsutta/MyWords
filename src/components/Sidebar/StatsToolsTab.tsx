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
    <div className="space-y-3.5 text-xs">
      {/* Live Statistics Cards - 4 in a grid */}
      <div>
        <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
          <BarChart2 className="w-3.5 h-3.5 text-blue-600" />
          Statistika dokumentu
        </label>
        <div className="grid grid-cols-2 gap-1.5">
          <div className="p-2 bg-white border border-slate-200 rounded-lg shadow-2xs">
            <div className="text-[10px] text-slate-400 font-medium">Slov</div>
            <div className="text-base font-bold text-slate-800 leading-tight">{stats.words}</div>
          </div>
          <div className="p-2 bg-white border border-slate-200 rounded-lg shadow-2xs">
            <div className="text-[10px] text-slate-400 font-medium">Znaků (vč. mezer)</div>
            <div className="text-base font-bold text-slate-800 leading-tight">{stats.characters}</div>
          </div>
          <div className="p-2 bg-white border border-slate-200 rounded-lg shadow-2xs">
            <div className="text-[10px] text-slate-400 font-medium">Znaků (bez mezer)</div>
            <div className="text-base font-bold text-slate-800 leading-tight">{stats.charactersNoSpaces}</div>
          </div>
          <div className="p-2 bg-white border border-slate-200 rounded-lg shadow-2xs">
            <div className="text-[10px] text-slate-400 font-medium">Odstavců</div>
            <div className="text-base font-bold text-slate-800 leading-tight">{stats.paragraphs}</div>
          </div>
        </div>

        <div className="mt-1.5 p-1.5 bg-blue-50/70 rounded-lg border border-blue-100 flex items-center gap-1.5 text-[11px] text-blue-800">
          <Clock className="w-3.5 h-3.5 text-blue-600 shrink-0" />
          <span>
            Odhadovaná doba čtení: <strong>{stats.readingTimeMinutes} min</strong>
          </span>
        </div>
      </div>

      {/* Editor Tools */}
      <div>
        <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
          Nástroje & Historie
        </label>
        <div className="space-y-1.5">
          <button
            type="button"
            onClick={onOpenFindReplace}
            className="w-full flex items-center justify-between px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <div className="flex items-center gap-1.5">
              <Search className="w-3.5 h-3.5 text-blue-600" />
              <span>Najít a nahradit...</span>
            </div>
            <kbd className="px-1 py-0.5 text-[9px] bg-slate-100 border border-slate-200 rounded text-slate-500 font-mono">
              Ctrl+F
            </kbd>
          </button>

          <div className="grid grid-cols-2 gap-1.5">
            <button
              type="button"
              onClick={() => editor.chain().focus().undo().run()}
              disabled={!editor.can().undo()}
              className="flex items-center justify-center gap-1 py-1.5 px-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none transition-colors shadow-2xs"
            >
              <Undo2 className="w-3.5 h-3.5" />
              Zpět
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().redo().run()}
              disabled={!editor.can().redo()}
              className="flex items-center justify-center gap-1 py-1.5 px-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none transition-colors shadow-2xs"
            >
              <Redo2 className="w-3.5 h-3.5" />
              Znovu
            </button>
          </div>

          <button
            type="button"
            onClick={handleClear}
            className="w-full flex items-center justify-center gap-1.5 py-1.5 px-2 text-[11px] font-medium text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-colors mt-1"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Vymazat celý dokument
          </button>
        </div>
      </div>

      {/* Useful Shortcuts */}
      <div className="p-2 bg-slate-50 rounded-lg border border-slate-200">
        <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-700 mb-1.5">
          <Keyboard className="w-3 h-3 text-slate-500" />
          Zkratky
        </div>
        <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[10px] text-slate-600">
          <div className="flex justify-between items-center">
            <span>Tučné:</span>
            <kbd className="font-mono bg-white px-1 border border-slate-200 rounded">Ctrl+B</kbd>
          </div>
          <div className="flex justify-between items-center">
            <span>Kurzíva:</span>
            <kbd className="font-mono bg-white px-1 border border-slate-200 rounded">Ctrl+I</kbd>
          </div>
          <div className="flex justify-between items-center">
            <span>Podtržení:</span>
            <kbd className="font-mono bg-white px-1 border border-slate-200 rounded">Ctrl+U</kbd>
          </div>
          <div className="flex justify-between items-center">
            <span>Tisk:</span>
            <kbd className="font-mono bg-white px-1 border border-slate-200 rounded">Ctrl+P</kbd>
          </div>
        </div>
      </div>
    </div>
  );
};
