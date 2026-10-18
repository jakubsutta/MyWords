import React, { useRef } from 'react';
import { Editor } from '@tiptap/react';
import type { PageSettings, HeaderFooterSettings } from '../../types/editor';
import { exportToDocx } from '../../utils/docxExport';
import {
  triggerPrint,
  exportToPdf,
  exportToTxt,
  exportToHtml,
  exportToMarkdown,
  exportToProjectJson,
} from '../../utils/exportUtils';
import { SAMPLE_TEMPLATES } from '../../utils/sampleDocuments';
import {
  Printer,
  FileDown,
  FileType,
  Code,
  FileText,
  Save,
  FolderOpen,
  Sparkles,
} from 'lucide-react';

interface Props {
  editor: Editor | null;
  title: string;
  pageSettings: PageSettings;
  headerFooterSettings: HeaderFooterSettings;
  pageRef: React.RefObject<HTMLDivElement | null>;
  onLoadTemplate: (content: string, title?: string) => void;
  onLoadProject: (projectData: any) => void;
}

export const ExportPrintTab: React.FC<Props> = ({
  editor,
  title,
  pageSettings,
  headerFooterSettings,
  pageRef,
  onLoadTemplate,
  onLoadProject,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [exportingDocx, setExportingDocx] = React.useState(false);
  const [exportingPdf, setExportingPdf] = React.useState(false);

  if (!editor) return null;

  const handleDocxExport = async () => {
    try {
      setExportingDocx(true);
      const html = editor.getHTML();
      await exportToDocx(html, title, pageSettings, headerFooterSettings);
    } catch (err) {
      console.error('Chyba při exportu do DOCX:', err);
      alert('Nepodařilo se vygenerovat DOCX soubor.');
    } finally {
      setExportingDocx(false);
    }
  };

  const handlePdfExport = async () => {
    if (!pageRef.current) return;
    try {
      setExportingPdf(true);
      await exportToPdf(pageRef.current, title, pageSettings);
    } catch (err) {
      console.error('Chyba při exportu do PDF:', err);
      // Fallback to print
      triggerPrint();
    } finally {
      setExportingPdf(false);
    }
  };

  const handleSaveProject = () => {
    const projectData = {
      version: '1.0',
      title,
      html: editor.getHTML(),
      pageSettings,
      headerFooterSettings,
      updatedAt: new Date().toISOString(),
    };
    exportToProjectJson(projectData, title);
  };

  const handleFileOpen = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          onLoadProject(parsed);
        } catch {
          alert('Neplatný formát souboru MyWords (.mywords).');
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="space-y-6">
      {/* Tisk a primární export */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
          Tisk & Hlavní export
        </label>
        <div className="space-y-2">
          <button
            type="button"
            onClick={triggerPrint}
            className="w-full flex items-center justify-between p-3 rounded-xl border border-blue-200 bg-blue-50/70 hover:bg-blue-100/70 text-blue-900 transition-all font-medium text-xs shadow-2xs group"
          >
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-blue-600 text-white rounded-lg group-hover:scale-105 transition-transform">
                <Printer className="w-4 h-4" />
              </div>
              <div className="text-left">
                <div className="font-semibold text-blue-900">Vytisknout dokument</div>
                <div className="text-[11px] text-blue-700/80">Přímý tisk nebo uložení jako vektorové PDF</div>
              </div>
            </div>
          </button>

          <button
            type="button"
            onClick={handleDocxExport}
            disabled={exportingDocx}
            className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-white hover:border-blue-500 hover:bg-slate-50 transition-all font-medium text-xs shadow-2xs group"
          >
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-blue-700 text-white rounded-lg group-hover:scale-105 transition-transform">
                <FileType className="w-4 h-4" />
              </div>
              <div className="text-left">
                <div className="font-semibold text-slate-800">Exportovat do DOCX</div>
                <div className="text-[11px] text-slate-500">Kompatibilní s Word, Pages a LibreOffice</div>
              </div>
            </div>
            {exportingDocx && <span className="text-xs text-blue-600 animate-pulse">Generuji...</span>}
          </button>

          <button
            type="button"
            onClick={handlePdfExport}
            disabled={exportingPdf}
            className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-white hover:border-red-500 hover:bg-slate-50 transition-all font-medium text-xs shadow-2xs group"
          >
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-red-600 text-white rounded-lg group-hover:scale-105 transition-transform">
                <FileDown className="w-4 h-4" />
              </div>
              <div className="text-left">
                <div className="font-semibold text-slate-800">Stáhnout PDF soubor</div>
                <div className="text-[11px] text-slate-500">Vizuální formátovaný PDF dokument</div>
              </div>
            </div>
            {exportingPdf && <span className="text-xs text-red-600 animate-pulse">Generuji...</span>}
          </button>
        </div>
      </div>

      {/* Další textové formáty */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
          Další textové formáty
        </label>
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => exportToTxt(editor.getHTML(), title)}
            className="flex flex-col items-center justify-center p-2.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-colors shadow-2xs"
          >
            <FileText className="w-4 h-4 text-slate-600 mb-1" />
            <span className="text-xs font-medium">Text (.txt)</span>
          </button>
          <button
            type="button"
            onClick={() => exportToHtml(editor.getHTML(), title, pageSettings)}
            className="flex flex-col items-center justify-center p-2.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-colors shadow-2xs"
          >
            <Code className="w-4 h-4 text-emerald-600 mb-1" />
            <span className="text-xs font-medium">HTML (.html)</span>
          </button>
          <button
            type="button"
            onClick={() => exportToMarkdown(editor.getHTML(), title)}
            className="flex flex-col items-center justify-center p-2.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-colors shadow-2xs"
          >
            <FileText className="w-4 h-4 text-indigo-600 mb-1" />
            <span className="text-xs font-medium">Markdown</span>
          </button>
        </div>
      </div>

      {/* Uložení / Otevření projektu MyWords */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
          Projektový soubor MyWords
        </label>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={handleSaveProject}
            className="flex items-center justify-center gap-1.5 p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium transition-colors shadow-2xs"
          >
            <Save className="w-3.5 h-3.5 text-blue-600" />
            Uložit projekt (.mywords)
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".mywords,.json"
            onChange={handleFileOpen}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center justify-center gap-1.5 p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium transition-colors shadow-2xs"
          >
            <FolderOpen className="w-3.5 h-3.5 text-amber-600" />
            Otevřít projekt...
          </button>
        </div>
      </div>

      {/* Vzorové šablony */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          Rychlé vzory & Šablony
        </label>
        <div className="space-y-1.5">
          {SAMPLE_TEMPLATES.map((tpl) => (
            <button
              key={tpl.id}
              type="button"
              onClick={() => {
                if (window.confirm(`Chcete načíst šablonu "${tpl.name}"? Neuložené změny v aktuálním dokumentu budou přepsány.`)) {
                  onLoadTemplate(tpl.content, tpl.name);
                }
              }}
              className="w-full text-left p-2.5 rounded-lg border border-slate-200 bg-white hover:border-blue-400 hover:bg-blue-50/30 transition-all text-xs"
            >
              <div className="font-semibold text-slate-800">{tpl.name}</div>
              <div className="text-[11px] text-slate-500 line-clamp-1">{tpl.description}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
