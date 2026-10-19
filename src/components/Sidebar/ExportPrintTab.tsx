import React, { useRef } from 'react';
import { Editor } from '@tiptap/react';
import mammoth from 'mammoth';
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
  FileUp,
} from 'lucide-react';

interface Props {
  editor: Editor | null;
  title: string;
  pageSettings: PageSettings;
  headerFooterSettings: HeaderFooterSettings;
  pageRef: React.RefObject<HTMLDivElement | null>;
  onLoadTemplate: (content: string, title?: string, asNewProject?: boolean) => void;
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
  const docxInputRef = useRef<HTMLInputElement>(null);
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

  const handleDocxImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.convertToHtml({ arrayBuffer });
        if (result.value) {
          const docTitle = file.name.replace(/\.[^/.]+$/, '');
          onLoadTemplate(result.value, docTitle);
        } else {
          alert('Zvolený dokument je prázdný.');
        }
      } catch (err) {
        console.error('Chyba importu DOCX:', err);
        alert('Nepodařilo se načíst soubor Word (.docx). Ujistěte se, že jde o platný dokument DOCX.');
      }
    }
  };

  return (
    <div className="space-y-3.5 text-xs">
      {/* Tisk a hlavní export - Compact grid */}
      <div>
        <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
          Tisk & Export
        </label>
        <div className="grid grid-cols-3 gap-1.5">
          <button
            type="button"
            onClick={triggerPrint}
            className="flex flex-col items-center justify-center p-2 rounded-lg border border-blue-200 bg-blue-50/70 hover:bg-blue-100 text-blue-900 transition-all shadow-2xs text-center"
            title="Tisk nebo Uložit jako PDF"
          >
            <Printer className="w-4 h-4 text-blue-600 mb-1" />
            <span className="font-semibold text-[11px]">Tisk</span>
          </button>

          <button
            type="button"
            onClick={handleDocxExport}
            disabled={exportingDocx}
            className="flex flex-col items-center justify-center p-2 rounded-lg border border-slate-200 bg-white hover:border-blue-400 hover:bg-slate-50 transition-all text-slate-800 shadow-2xs text-center"
            title="Word (.docx)"
          >
            <FileType className="w-4 h-4 text-blue-600 mb-1" />
            <span className="font-semibold text-[11px]">Word (.docx)</span>
          </button>

          <button
            type="button"
            onClick={handlePdfExport}
            disabled={exportingPdf}
            className="flex flex-col items-center justify-center p-2 rounded-lg border border-slate-200 bg-white hover:border-red-400 hover:bg-slate-50 transition-all text-slate-800 shadow-2xs text-center"
            title="PDF dokument"
          >
            <FileDown className="w-4 h-4 text-red-600 mb-1" />
            <span className="font-semibold text-[11px]">PDF soubor</span>
          </button>
        </div>
      </div>

      {/* Import Word .docx souboru */}
      <div>
        <input
          ref={docxInputRef}
          type="file"
          accept=".docx"
          onChange={handleDocxImport}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => docxInputRef.current?.click()}
          className="w-full flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-lg border border-indigo-200 bg-indigo-50/70 hover:bg-indigo-100/70 text-indigo-900 text-[11px] font-semibold transition-all shadow-2xs"
        >
          <FileUp className="w-3.5 h-3.5 text-indigo-600" />
          Importovat soubor Word (.docx)
        </button>
      </div>

      {/* Další textové formáty - Compact 3 column row */}
      <div>
        <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
          Rychlý export textu
        </label>
        <div className="grid grid-cols-3 gap-1.5">
          <button
            type="button"
            onClick={() => exportToTxt(editor.getHTML(), title)}
            className="flex items-center justify-center gap-1 py-1.5 px-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-colors shadow-2xs text-[11px] font-medium"
          >
            <FileText className="w-3.5 h-3.5 text-slate-500" />
            <span>.txt</span>
          </button>
          <button
            type="button"
            onClick={() => exportToHtml(editor.getHTML(), title, pageSettings)}
            className="flex items-center justify-center gap-1 py-1.5 px-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-colors shadow-2xs text-[11px] font-medium"
          >
            <Code className="w-3.5 h-3.5 text-emerald-600" />
            <span>.html</span>
          </button>
          <button
            type="button"
            onClick={() => exportToMarkdown(editor.getHTML(), title)}
            className="flex items-center justify-center gap-1 py-1.5 px-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-colors shadow-2xs text-[11px] font-medium"
          >
            <FileText className="w-3.5 h-3.5 text-indigo-600" />
            <span>.md</span>
          </button>
        </div>
      </div>

      {/* Uložení / Otevření projektu MyWords */}
      <div className="pt-1">
        <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
          Projektový soubor
        </label>
        <div className="grid grid-cols-2 gap-1.5">
          <button
            type="button"
            onClick={handleSaveProject}
            className="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-[11px] font-medium transition-colors shadow-2xs"
          >
            <Save className="w-3.5 h-3.5 text-blue-600" />
            Uložit (.mywords)
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
            className="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-[11px] font-medium transition-colors shadow-2xs"
          >
            <FolderOpen className="w-3.5 h-3.5 text-amber-600" />
            Otevřít projekt...
          </button>
        </div>
      </div>

      {/* Vzorové šablony */}
      <div className="pt-1 border-t border-slate-200">
        <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          Vzory dokumentů
        </label>
        <div className="grid grid-cols-1 gap-1.5">
          {SAMPLE_TEMPLATES.map((tpl) => (
            <div
              key={tpl.id}
              className="p-2 rounded-lg border border-slate-200 bg-white hover:border-blue-300 transition-all text-xs flex flex-col gap-1.5 group"
            >
              <div>
                <div className="font-semibold text-slate-800 text-[11px]">{tpl.name}</div>
                <div className="text-[10px] text-slate-400 line-clamp-1">{tpl.description}</div>
              </div>
              <div className="flex items-center gap-1.5 pt-1 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => onLoadTemplate(tpl.content, tpl.name, true)}
                  className="px-2 py-0.5 text-[10px] font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded transition-colors"
                >
                  + Otevřít jako nový projekt
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm(`Chcete načíst šablonu "${tpl.name}" do aktuálního projektu? Neuložené změny budou přepsány.`)) {
                      onLoadTemplate(tpl.content, tpl.name, false);
                    }
                  }}
                  className="px-2 py-0.5 text-[10px] text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded transition-colors"
                >
                  Přepsat aktuální
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
