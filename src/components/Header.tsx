import React, { useState } from 'react';
import { Editor } from '@tiptap/react';
import {
  FileText,
  Undo2,
  Redo2,
  Printer,
  Download,
  Check,
  Edit2,
  FileCheck,
  Maximize2,
  Minimize2,
  Eye,
  EyeOff,
  BookOpen,
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
  onPageSettingsChange?: (settings: PageSettings) => void;
  headerFooterSettings: HeaderFooterSettings;
  viewMode: 'pages' | 'continuous';
  onViewModeChange: (mode: 'pages' | 'continuous') => void;
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
  onFitToWidth?: () => void;
}

export const Header: React.FC<Props> = ({
  title,
  onTitleChange,
  editor,
  zoom: _zoom,
  onZoomChange: _onZoomChange,
  pageSettings,
  onPageSettingsChange,
  headerFooterSettings,
  viewMode,
  onViewModeChange,
  isSidebarOpen: _isSidebarOpen,
  onToggleSidebar: _onToggleSidebar,
  onFitToWidth: _onFitToWidth,
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
    <header className="no-print h-13 bg-sky-50/70 backdrop-blur-xs border-b border-blue-200/60 px-2 sm:px-4 flex items-center justify-between z-30 shrink-0 select-none shadow-xs gap-2">
      {/* Brand & Document Name */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0">
        {/* Logo & Brand */}
        <div className="flex items-center gap-2 pr-2 border-r border-blue-200/60">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-xs shrink-0">
            <FileText className="w-4 h-4" />
          </div>
          <span className="font-bold text-sm bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent tracking-tight hidden md:inline">
            MyWords
          </span>
        </div>

        {/* Document Title Editable */}
        <div className="flex items-center min-w-0">
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
                className="px-2 py-0.5 text-xs sm:text-sm font-semibold text-slate-800 bg-slate-100 border border-blue-400 rounded-md focus:outline-none max-w-[140px] sm:max-w-xs"
              />
              <button
                onClick={handleTitleSubmit}
                className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
              >
                <Check className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                setTempTitle(title);
                setIsEditingTitle(true);
              }}
              className="group flex items-center gap-1 px-1.5 py-1 rounded-md hover:bg-slate-100 transition-colors text-left max-w-[130px] sm:max-w-[220px] md:max-w-xs truncate"
              title="Klepnutím přejmenujete dokument"
            >
              <span className="text-xs sm:text-sm font-semibold text-slate-800 truncate">
                {title}
              </span>
              <Edit2 className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 hidden sm:inline" />
            </button>
          )}

          <div className="hidden xl:flex items-center gap-1 text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 rounded-full ml-1.5 shrink-0">
            <FileCheck className="w-3 h-3" />
            <span>Uloženo</span>
          </div>
        </div>
      </div>

      {/* Center Actions: Undo / Redo & View Mode */}
      <div className="flex items-center gap-0.5 sm:gap-1">
        <button
          type="button"
          onClick={() => editor?.chain().focus().undo().run()}
          disabled={!editor?.can().undo()}
          className="p-1.5 rounded-lg text-slate-600 hover:text-blue-700 hover:bg-white/80 disabled:opacity-30 disabled:pointer-events-none transition-colors"
          title="Zpět (Ctrl+Z)"
        >
          <Undo2 className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor?.chain().focus().redo().run()}
          disabled={!editor?.can().redo()}
          className="p-1.5 rounded-lg text-slate-600 hover:text-blue-700 hover:bg-white/80 disabled:opacity-30 disabled:pointer-events-none transition-colors"
          title="Znovu (Ctrl+Y)"
        >
          <Redo2 className="w-4 h-4" />
        </button>

        <div className="h-4 w-px bg-blue-200/80 mx-1 hidden sm:block" />

        {/* View Mode Switcher */}
        <div className="hidden sm:flex items-center p-0.5 bg-blue-100/60 border border-blue-200/50 rounded-lg text-xs">
          <button
            type="button"
            onClick={() => onViewModeChange('pages')}
            className={`px-2 py-1 rounded-md transition-all text-xs ${
              viewMode === 'pages'
                ? 'bg-white text-blue-700 font-semibold shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Stránky
          </button>
          <button
            type="button"
            onClick={() => onViewModeChange('continuous')}
            className={`px-2 py-1 rounded-md transition-all text-xs ${
              viewMode === 'continuous'
                ? 'bg-white text-blue-700 font-semibold shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Plynulý
          </button>
        </div>
      </div>

      {/* Right Actions: Quick Export, Okraje, Print */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        {/* Book Spread View Quick Toggle (When in book mode) */}
        {onPageSettingsChange && pageSettings.layoutType === 'book' && (
          <button
            type="button"
            onClick={() =>
              onPageSettingsChange({
                ...pageSettings,
                bookSpreadView: !(pageSettings.bookSpreadView ?? true),
              })
            }
            className={`hidden md:flex items-center gap-1.5 px-2 py-1 rounded-lg border text-xs font-medium transition-colors ${
              (pageSettings.bookSpreadView ?? true)
                ? 'bg-indigo-100/80 border-indigo-300 text-indigo-700 font-semibold shadow-2xs'
                : 'bg-white/80 border-blue-200/80 text-slate-700 hover:bg-white'
            }`}
            title="Přepnout mezi náhledem celé dvojstránky a jednou stránkou"
          >
            <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
            <span>{(pageSettings.bookSpreadView ?? true) ? 'Dvojstrana' : '1 stránka'}</span>
          </button>
        )}

        {/* Toggle Margin Guides */}
        {onPageSettingsChange && (
          <button
            type="button"
            onClick={() =>
              onPageSettingsChange({
                ...pageSettings,
                showMarginGuides: !pageSettings.showMarginGuides,
              })
            }
            className={`hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-medium transition-colors ${
              pageSettings.showMarginGuides
                ? 'bg-rose-50 border-rose-300 text-rose-700 font-semibold shadow-2xs hover:bg-rose-100'
                : 'bg-white/80 border-slate-200/80 text-slate-700 hover:bg-white hover:border-slate-300'
            }`}
            title="Zobrazit/skrýt vodítka okrajů a hřbetu"
          >
            {pageSettings.showMarginGuides ? (
              <Eye className="w-3.5 h-3.5 text-rose-600" />
            ) : (
              <EyeOff className="w-3.5 h-3.5 text-slate-400" />
            )}
            <span>Okraje</span>
          </button>
        )}

        {/* Quick Print */}
        <button
          type="button"
          onClick={triggerPrint}
          className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-blue-200/80 bg-white/80 text-slate-700 hover:bg-white text-xs font-medium transition-colors shadow-2xs"
          title="Tisk (Ctrl+P)"
        >
          <Printer className="w-3.5 h-3.5 text-blue-600" />
          <span className="hidden md:inline">Tisk</span>
        </button>

        {/* Quick DOCX */}
        <button
          type="button"
          onClick={handleQuickDocx}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium shadow-xs transition-colors"
          title="Stáhnout Word (.docx)"
        >
          <Download className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Stáhnout DOCX</span>
        </button>

        {/* Fullscreen */}
        <button
          type="button"
          onClick={toggleFullscreen}
          className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors hidden sm:block"
          title={isFullscreen ? 'Ukončit režim celé obrazovky' : 'Režim celé obrazovky'}
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>
      </div>
    </header>
  );
};
