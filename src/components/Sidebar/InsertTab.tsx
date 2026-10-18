import React from 'react';
import { Editor } from '@tiptap/react';
import {
  Table as TableIcon,
  Image as ImageIcon,
  Sparkles,
  Minus,
  Calendar,
  Link as LinkIcon,
  Trash2,
  Columns,
  Rows,
  FileDown,
} from 'lucide-react';

interface Props {
  editor: Editor | null;
  onOpenTableModal: () => void;
  onOpenImageModal: () => void;
  onOpenSymbolsModal: () => void;
}

export const InsertTab: React.FC<Props> = ({
  editor,
  onOpenTableModal,
  onOpenImageModal,
  onOpenSymbolsModal,
}) => {
  if (!editor) return null;

  const isTableActive = editor.isActive('table');

  const insertCurrentDate = () => {
    const now = new Date();
    const formatted = now.toLocaleDateString('cs-CZ', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
    editor.chain().focus().insertContent(formatted).run();
  };

  const handleInsertLink = () => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('Zadejte URL adresu odkazu (např. https://priklad.cz):', previousUrl);

    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  return (
    <div className="space-y-6">
      {/* Primary Insert Actions */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
          Objekty a prvky
        </label>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={onOpenTableModal}
            className="flex items-center gap-2 p-2.5 rounded-lg border border-slate-200 bg-white hover:border-blue-500 hover:bg-blue-50/40 text-slate-700 hover:text-blue-700 text-xs font-medium transition-all shadow-2xs"
          >
            <TableIcon className="w-4 h-4 text-blue-600" />
            Vložit tabulku
          </button>
          <button
            type="button"
            onClick={onOpenImageModal}
            className="flex items-center gap-2 p-2.5 rounded-lg border border-slate-200 bg-white hover:border-blue-500 hover:bg-blue-50/40 text-slate-700 hover:text-blue-700 text-xs font-medium transition-all shadow-2xs"
          >
            <ImageIcon className="w-4 h-4 text-emerald-600" />
            Vložit obrázek
          </button>
          <button
            type="button"
            onClick={onOpenSymbolsModal}
            className="flex items-center gap-2 p-2.5 rounded-lg border border-slate-200 bg-white hover:border-blue-500 hover:bg-blue-50/40 text-slate-700 hover:text-blue-700 text-xs font-medium transition-all shadow-2xs"
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            Symboly & Znaky
          </button>
          <button
            type="button"
            onClick={handleInsertLink}
            className="flex items-center gap-2 p-2.5 rounded-lg border border-slate-200 bg-white hover:border-blue-500 hover:bg-blue-50/40 text-slate-700 hover:text-blue-700 text-xs font-medium transition-all shadow-2xs"
          >
            <LinkIcon className="w-4 h-4 text-purple-600" />
            Webový odkaz
          </button>
        </div>
      </div>

      {/* Table Context Controls (Appears when table selected) */}
      {isTableActive && (
        <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-200/80 space-y-2.5 animate-in fade-in">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-blue-900 flex items-center gap-1.5">
              <TableIcon className="w-3.5 h-3.5 text-blue-600" />
              Nástroje vybrané tabulky
            </span>
          </div>

          <div className="grid grid-cols-2 gap-1.5 text-xs">
            <button
              type="button"
              onClick={() => editor.chain().focus().addRowBefore().run()}
              className="px-2 py-1 bg-white hover:bg-slate-100 rounded border border-blue-200 text-slate-700 flex items-center gap-1"
            >
              <Rows className="w-3 h-3 text-blue-500" /> + Řádek nad
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().addRowAfter().run()}
              className="px-2 py-1 bg-white hover:bg-slate-100 rounded border border-blue-200 text-slate-700 flex items-center gap-1"
            >
              <Rows className="w-3 h-3 text-blue-500" /> + Řádek pod
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().addColumnBefore().run()}
              className="px-2 py-1 bg-white hover:bg-slate-100 rounded border border-blue-200 text-slate-700 flex items-center gap-1"
            >
              <Columns className="w-3 h-3 text-blue-500" /> + Sloupec vlevo
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().addColumnAfter().run()}
              className="px-2 py-1 bg-white hover:bg-slate-100 rounded border border-blue-200 text-slate-700 flex items-center gap-1"
            >
              <Columns className="w-3 h-3 text-blue-500" /> + Sloupec vpravo
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().deleteRow().run()}
              className="px-2 py-1 bg-white hover:bg-red-50 text-red-600 rounded border border-red-200 flex items-center gap-1"
            >
              <Trash2 className="w-3 h-3" /> Smazat řádek
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().deleteColumn().run()}
              className="px-2 py-1 bg-white hover:bg-red-50 text-red-600 rounded border border-red-200 flex items-center gap-1"
            >
              <Trash2 className="w-3 h-3" /> Smazat sloupec
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleHeaderRow().run()}
              className="col-span-2 px-2 py-1 bg-white hover:bg-slate-100 rounded border border-blue-200 text-slate-700 text-center"
            >
              Přepnout záhlaví tabulky
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().deleteTable().run()}
              className="col-span-2 px-2 py-1 bg-red-100 hover:bg-red-200 text-red-700 font-medium rounded border border-red-300 flex items-center justify-center gap-1"
            >
              <Trash2 className="w-3 h-3" /> Smazat celou tabulku
            </button>
          </div>
        </div>
      )}

      {/* Dividers & Page breaks */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
          Oddělovače & Datum
        </label>
        <div className="space-y-1.5">
          <button
            type="button"
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <Minus className="w-4 h-4 text-slate-500" />
            Vodorovná oddělovací čára
          </button>
          <button
            type="button"
            onClick={insertCurrentDate}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <Calendar className="w-4 h-4 text-slate-500" />
            Vložit aktuální datum (český formát)
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().insertContent('<div style="page-break-after: always; height: 1px; border-bottom: 2px dashed #94a3b8; margin: 2rem 0; text-align: center; color: #94a3b8; font-size: 11px;">— Konec stránky —</div><p></p>').run()}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <FileDown className="w-4 h-4 text-slate-500" />
            Vložit zalomení stránky (Page break)
          </button>
        </div>
      </div>
    </div>
  );
};
