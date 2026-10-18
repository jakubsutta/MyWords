import React, { useState } from 'react';
import { Editor } from '@tiptap/react';
import {
  FileText,
  Undo2,
  Redo2,
  Printer,
  Download,
  ZoomIn,
  ZoomOut,
  Check,
  Edit2,
  FileCheck,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import { triggerPrint } from '../utils/exportUtils';
import { exportToDocx } from '../utils/docxExport';
import type { PageSettings, HeaderFooterSettings } from '../types/editor';

interface Props {
  title: string;
  onTitleChange: (newTitle: string) => void;
  editor: Editor | null;
  zoom: number;
  onZoomChange: (newZoom: number) => void;
  pageSettings: PageSettings;
  headerFooterSettings: HeaderFooterSettings;
  viewMode: 'pages' | 'continuous';
  onViewModeChange: (mode: 'pages' | 'continuous') => void;
}

export const Header: React.FC<Props> = ({
  title,
  onTitleChange,
  editor,
  zoom,
  onZoomChange,
  pageSettings,
  headerFooterSettings,
  viewMode,
  onViewModeChange,
}) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState(title);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleTitleSubmit = () => {
    setIsEditingTitle(false);
    if (tempTitle.trim()) {
      onTitleChange(tempTitle.trim());
    } else {
      setTempTitle(title);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const handleQuickDocx = async () => {
    if (!editor) return;
    await exportToDocx(editor.getHTML(), title, pageSettings, headerFooterSettings);
  };

  return (
    <header className="no-print h-14 bg-white border-b border-slate-200 px-4 flex items-center justify-between z-30 shrink-0 select-none shadow-2xs">
      {/* Brand & Document Name */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 pr-3 border-r border-slate-200">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-xs">
            <FileText className="w-5 h-5" />
          </div>
          <span className="font-bold text-base bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent tracking-tight hidden sm:inline">
            MyWords
          </span>
        </div>

        {/* Document Title Editable */}
        <div className="flex items-center gap-1.5">
          {isEditingTitle ? (
            <div className="flex items-center gap-1">
              <input
                type="text"
                value={tempTitle}
                onChange={(e) => setTempTitle(e.target.value)}
                onBlur={handleTitleSubmit}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleTitleSubmit();
                  if (e.key === 'Escape') {
                    setIsEditingTitle(false);
                    setTempTitle(title);
                  }
                }}
                autoFocus
                className="px-2 py-1 text-sm font-semibold text-slate-800 bg-slate-100 border border-blue-400 rounded-md focus:outline-none"
              />
              <button
                onClick={handleTitleSubmit}
                className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
              >
                <Check className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                setTempTitle(title);
                setIsEditingTitle(true);
              }}
              className="group flex items-center gap-1.5 px-2 py-1 rounded-md hover:bg-slate-100 transition-colors text-left"
              title="Klepněte pro přejmenování dokumentu"
            >
              <span className="text-sm font-semibold text-slate-800 max-w-[180px] md:max-w-xs truncate">
                {title}
              </span>
              <Edit2 className="w-3.5 h-3.5 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          )}

          <div className="hidden lg:flex items-center gap-1 text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 rounded-full ml-2">
            <FileCheck className="w-3 h-3" />
            <span>Uloženo</span>
          </div>
        </div>
      </div>

      {/* Center Actions (Undo / Redo / View Mode) */}
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => editor?.chain().focus().undo().run()}
          disabled={!editor?.can().undo()}
          className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none transition-colors"
          title="Zpět (Ctrl+Z)"
        >
          <Undo2 className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor?.chain().focus().redo().run()}
          disabled={!editor?.can().redo()}
          className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none transition-colors"
          title="Znovu (Ctrl+Y)"
        >
          <Redo2 className="w-4 h-4" />
        </button>

        <div className="h-5 w-px bg-slate-200 mx-1 hidden sm:block" />

        {/* View Mode Switcher */}
        <div className="hidden md:flex items-center p-0.5 bg-slate-100 rounded-lg text-xs">
          <button
            type="button"
            onClick={() => onViewModeChange('pages')}
            className={`px-2.5 py-1 rounded-md transition-all ${
              viewMode === 'pages'
                ? 'bg-white text-blue-600 font-semibold shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Režim stránek (A4)
          </button>
          <button
            type="button"
            onClick={() => onViewModeChange('continuous')}
            className={`px-2.5 py-1 rounded-md transition-all ${
              viewMode === 'continuous'
                ? 'bg-white text-blue-600 font-semibold shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Plynulý
          </button>
        </div>
      </div>

      {/* Right Actions: Zoom & Quick Export */}
      <div className="flex items-center gap-2">
        {/* Zoom */}
        <div className="hidden sm:flex items-center gap-1 text-xs text-slate-600 bg-slate-50 border border-slate-200 px-2 py-1 rounded-lg">
          <button
            type="button"
            onClick={() => onZoomChange(Math.max(50, zoom - 10))}
            className="hover:text-blue-600 transition-colors"
            title="Oddálit"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="w-10 text-center font-medium font-mono text-[11px]">{zoom}%</span>
          <button
            type="button"
            onClick={() => onZoomChange(Math.min(160, zoom + 10))}
            className="hover:text-blue-600 transition-colors"
            title="Přiblížit"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Quick Print */}
        <button
          type="button"
          onClick={triggerPrint}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-medium transition-colors"
          title="Tisk (Ctrl+P)"
        >
          <Printer className="w-3.5 h-3.5 text-blue-600" />
          <span className="hidden lg:inline">Tisk</span>
        </button>

        {/* Quick DOCX */}
        <button
          type="button"
          onClick={handleQuickDocx}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium shadow-xs transition-colors"
          title="Stáhnout Word (.docx)"
        >
          <Download className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Stáhnout DOCX</span>
        </button>

        {/* Fullscreen */}
        <button
          type="button"
          onClick={toggleFullscreen}
          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors hidden sm:block"
          title={isFullscreen ? 'Ukončit celou obrazovku' : 'Celá obrazovka'}
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>
      </div>
    </header>
  );
};
