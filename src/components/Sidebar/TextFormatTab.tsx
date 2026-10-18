import React from 'react';
import { Editor } from '@tiptap/react';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Subscript as SubscriptIcon,
  Superscript as SuperscriptIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  Quote,
  Code,
  RemoveFormatting,
  Palette,
  Highlighter,
  SlidersVertical,
} from 'lucide-react';

interface Props {
  editor: Editor | null;
}

const FONTS = [
  { name: 'Inter (Výchozí moderní)', value: 'Inter, sans-serif' },
  { name: 'Roboto (Google standard)', value: 'Roboto, sans-serif' },
  { name: 'Montserrat (Geometrický bezpatkový)', value: 'Montserrat, sans-serif' },
  { name: 'Merriweather (Klasické knižní patkové)', value: 'Merriweather, serif' },
  { name: 'Playfair Display (Elegantní titulkové)', value: 'Playfair Display, serif' },
  { name: 'EB Garamond (Historické knižní)', value: 'EB Garamond, serif' },
  { name: 'Lora (Čtivé esejistické)', value: 'Lora, serif' },
  { name: 'JetBrains Mono (Programátorské)', value: 'JetBrains Mono, monospace' },
  { name: 'Fira Code (Moderní kód)', value: 'Fira Code, monospace' },
  { name: 'Segoe UI (Microsoft moderní)', value: '"Segoe UI", -apple-system, BlinkMacSystemFont, Roboto, sans-serif' },
  { name: 'Arial', value: 'Arial, Helvetica, sans-serif' },
  { name: 'Georgia', value: 'Georgia, serif' },
  { name: 'Times New Roman', value: '"Times New Roman", Times, serif' },
];

const FONT_SIZES = [
  '9pt', '10pt', '11pt', '12pt', '14pt', '16pt', '18pt', '20pt', '24pt', '28pt', '32pt', '36pt', '48pt'
];

const PRESET_COLORS = [
  '#000000', '#1e293b', '#475569', '#dc2626', '#ea580c', '#d97706',
  '#16a34a', '#059669', '#0284c7', '#2563eb', '#7c3aed', '#db2777'
];

const HIGHLIGHT_COLORS = [
  '#fef08a', '#bbf7d0', '#bfdbfe', '#fbcfe8', '#fed7aa', '#e9d5ff'
];

export const TextFormatTab: React.FC<Props> = ({ editor }) => {
  if (!editor) return null;

  const currentHeading = editor.isActive('heading', { level: 1 })
    ? 'h1'
    : editor.isActive('heading', { level: 2 })
    ? 'h2'
    : editor.isActive('heading', { level: 3 })
    ? 'h3'
    : editor.isActive('blockquote')
    ? 'quote'
    : editor.isActive('codeBlock')
    ? 'code'
    : 'p';

  return (
    <div className="space-y-5">
      {/* Font Family & Size */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
          Písmo a velikost
        </label>
        <div className="space-y-1.5">
          <select
            onChange={(e) => editor.chain().focus().setFontFamily(e.target.value).run()}
            className="w-full text-xs py-2 px-2.5 bg-white border border-slate-200 rounded-lg shadow-2xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            {FONTS.map((font) => (
              <option key={font.name} value={font.value} style={{ fontFamily: font.value }}>
                {font.name}
              </option>
            ))}
          </select>

          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-slate-500">Velikost:</span>
            <select
              onChange={(e) => editor.chain().focus().setFontSize(e.target.value).run()}
              defaultValue="11pt"
              className="flex-1 text-xs py-1.5 px-2 bg-white border border-slate-200 rounded-lg shadow-2xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              {FONT_SIZES.map((sz) => (
                <option key={sz} value={sz}>
                  {sz}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => editor.chain().focus().unsetFontSize().run()}
              className="text-[10px] text-slate-500 hover:text-slate-800 px-2 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg"
              title="Resetovat výchozí velikost"
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Paragraph Style / Headings */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
          Styl textu & Nadpisy
        </label>
        <div className="grid grid-cols-2 gap-1.5">
          <button
            type="button"
            onClick={() => editor.chain().focus().setParagraph().run()}
            className={`px-2.5 py-1.5 text-xs text-left rounded-lg border transition-all ${
              currentHeading === 'p'
                ? 'bg-blue-50 border-blue-400 text-blue-700 font-medium'
                : 'border-slate-200 hover:bg-slate-50 text-slate-700'
            }`}
          >
            Normální text
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className={`px-2.5 py-1.5 text-xs text-left rounded-lg border transition-all ${
              currentHeading === 'h1'
                ? 'bg-blue-50 border-blue-400 text-blue-700 font-bold'
                : 'border-slate-200 hover:bg-slate-50 text-slate-700 font-bold'
            }`}
          >
            Nadpis 1
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={`px-2.5 py-1.5 text-xs text-left rounded-lg border transition-all ${
              currentHeading === 'h2'
                ? 'bg-blue-50 border-blue-400 text-blue-700 font-semibold'
                : 'border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold'
            }`}
          >
            Nadpis 2
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            className={`px-2.5 py-1.5 text-xs text-left rounded-lg border transition-all ${
              currentHeading === 'h3'
                ? 'bg-blue-50 border-blue-400 text-blue-700 font-medium'
                : 'border-slate-200 hover:bg-slate-50 text-slate-700'
            }`}
          >
            Nadpis 3
          </button>
        </div>
      </div>

      {/* Basic Styles */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
          Formátování písma
        </label>
        <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-50 rounded-lg border border-slate-200">
          <button
            type="button"
            title="Tučné (Ctrl+B)"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`p-2 rounded-md transition-colors ${
              editor.isActive('bold')
                ? 'bg-white shadow-2xs text-blue-600 font-bold border border-slate-200'
                : 'text-slate-600 hover:bg-slate-200/60'
            }`}
          >
            <Bold className="w-4 h-4" />
          </button>
          <button
            type="button"
            title="Kurzíva (Ctrl+I)"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`p-2 rounded-md transition-colors ${
              editor.isActive('italic')
                ? 'bg-white shadow-2xs text-blue-600 font-bold border border-slate-200'
                : 'text-slate-600 hover:bg-slate-200/60'
            }`}
          >
            <Italic className="w-4 h-4" />
          </button>
          <button
            type="button"
            title="Podtržené (Ctrl+U)"
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={`p-2 rounded-md transition-colors ${
              editor.isActive('underline')
                ? 'bg-white shadow-2xs text-blue-600 font-bold border border-slate-200'
                : 'text-slate-600 hover:bg-slate-200/60'
            }`}
          >
            <UnderlineIcon className="w-4 h-4" />
          </button>
          <button
            type="button"
            title="Přeškrtnuté"
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={`p-2 rounded-md transition-colors ${
              editor.isActive('strike')
                ? 'bg-white shadow-2xs text-blue-600 font-bold border border-slate-200'
                : 'text-slate-600 hover:bg-slate-200/60'
            }`}
          >
            <Strikethrough className="w-4 h-4" />
          </button>
          <button
            type="button"
            title="Dolní index"
            onClick={() => editor.chain().focus().toggleSubscript().run()}
            className={`p-2 rounded-md transition-colors ${
              editor.isActive('subscript')
                ? 'bg-white shadow-2xs text-blue-600 font-bold border border-slate-200'
                : 'text-slate-600 hover:bg-slate-200/60'
            }`}
          >
            <SubscriptIcon className="w-4 h-4" />
          </button>
          <button
            type="button"
            title="Horní index"
            onClick={() => editor.chain().focus().toggleSuperscript().run()}
            className={`p-2 rounded-md transition-colors ${
              editor.isActive('superscript')
                ? 'bg-white shadow-2xs text-blue-600 font-bold border border-slate-200'
                : 'text-slate-600 hover:bg-slate-200/60'
            }`}
          >
            <SuperscriptIcon className="w-4 h-4" />
          </button>
          <button
            type="button"
            title="Vymazat formátování"
            onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}
            className="p-2 rounded-md text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors ml-auto"
          >
            <RemoveFormatting className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Alignment & Line Spacing */}
      <div className="space-y-2">
        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
          Zarovnání & Řádkování
        </label>
        <div className="flex items-center gap-1 p-1 bg-slate-50 rounded-lg border border-slate-200">
          <button
            type="button"
            title="Zarovnat vlevo"
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            className={`flex-1 flex justify-center py-1.5 rounded-md transition-colors ${
              editor.isActive({ textAlign: 'left' })
                ? 'bg-white shadow-2xs text-blue-600 font-bold border border-slate-200'
                : 'text-slate-600 hover:bg-slate-200/60'
            }`}
          >
            <AlignLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            title="Zarovnat na střed"
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            className={`flex-1 flex justify-center py-1.5 rounded-md transition-colors ${
              editor.isActive({ textAlign: 'center' })
                ? 'bg-white shadow-2xs text-blue-600 font-bold border border-slate-200'
                : 'text-slate-600 hover:bg-slate-200/60'
            }`}
          >
            <AlignCenter className="w-4 h-4" />
          </button>
          <button
            type="button"
            title="Zarovnat vpravo"
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            className={`flex-1 flex justify-center py-1.5 rounded-md transition-colors ${
              editor.isActive({ textAlign: 'right' })
                ? 'bg-white shadow-2xs text-blue-600 font-bold border border-slate-200'
                : 'text-slate-600 hover:bg-slate-200/60'
            }`}
          >
            <AlignRight className="w-4 h-4" />
          </button>
          <button
            type="button"
            title="Do bloku (Justify)"
            onClick={() => editor.chain().focus().setTextAlign('justify').run()}
            className={`flex-1 flex justify-center py-1.5 rounded-md transition-colors ${
              editor.isActive({ textAlign: 'justify' })
                ? 'bg-white shadow-2xs text-blue-600 font-bold border border-slate-200'
                : 'text-slate-600 hover:bg-slate-200/60'
            }`}
          >
            <AlignJustify className="w-4 h-4" />
          </button>
        </div>

        {/* Line spacing selector */}
        <div className="flex items-center gap-1.5 pt-1">
          <SlidersVertical className="w-3.5 h-3.5 text-slate-500" />
          <span className="text-[11px] text-slate-600 font-medium">Řádkování:</span>
          {(['1.0', '1.15', '1.5', '2.0'] as const).map((spacing) => (
            <button
              key={spacing}
              type="button"
              onClick={() => editor.chain().focus().setLineHeight(spacing).run()}
              className="flex-1 py-1 text-xs rounded border border-slate-200 bg-white hover:bg-blue-50 hover:text-blue-700 text-slate-700 font-medium transition-colors"
            >
              {spacing}
            </button>
          ))}
        </div>
      </div>

      {/* Colors */}
      <div className="space-y-3">
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-slate-500" />
              Barva písma
            </span>
            <input
              type="color"
              onChange={(e) => editor.chain().focus().setColor(e.target.value).run()}
              className="w-5 h-5 rounded cursor-pointer border border-slate-300"
              title="Vlastní barva"
            />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {PRESET_COLORS.map((col) => (
              <button
                key={col}
                type="button"
                onClick={() => editor.chain().focus().setColor(col).run()}
                style={{ backgroundColor: col }}
                className="w-5 h-5 rounded-full border border-black/10 hover:scale-115 transition-transform"
                title={col}
              />
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Highlighter className="w-3.5 h-3.5 text-slate-500" />
              Zvýraznění textu
            </span>
            <button
              type="button"
              onClick={() => editor.chain().focus().unsetHighlight().run()}
              className="text-[10px] text-slate-400 hover:text-slate-700"
            >
              Zrušit
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {HIGHLIGHT_COLORS.map((col) => (
              <button
                key={col}
                type="button"
                onClick={() => editor.chain().focus().setHighlight({ color: col }).run()}
                style={{ backgroundColor: col }}
                className="w-5 h-5 rounded-md border border-slate-300 hover:scale-115 transition-transform"
                title={col}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Lists & Quotes */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
          Seznamy & Bloky
        </label>
        <div className="grid grid-cols-2 gap-1.5">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`flex items-center gap-2 px-2.5 py-1.5 text-xs rounded-lg border transition-all ${
              editor.isActive('bulletList')
                ? 'bg-blue-50 border-blue-400 text-blue-700 font-medium'
                : 'border-slate-200 hover:bg-slate-50 text-slate-700'
            }`}
          >
            <List className="w-3.5 h-3.5 text-slate-500" />
            Odrážky
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`flex items-center gap-2 px-2.5 py-1.5 text-xs rounded-lg border transition-all ${
              editor.isActive('orderedList')
                ? 'bg-blue-50 border-blue-400 text-blue-700 font-medium'
                : 'border-slate-200 hover:bg-slate-50 text-slate-700'
            }`}
          >
            <ListOrdered className="w-3.5 h-3.5 text-slate-500" />
            Číslování
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={`flex items-center gap-2 px-2.5 py-1.5 text-xs rounded-lg border transition-all ${
              editor.isActive('blockquote')
                ? 'bg-blue-50 border-blue-400 text-blue-700 font-medium'
                : 'border-slate-200 hover:bg-slate-50 text-slate-700'
            }`}
          >
            <Quote className="w-3.5 h-3.5 text-slate-500" />
            Citace
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            className={`flex items-center gap-2 px-2.5 py-1.5 text-xs rounded-lg border transition-all ${
              editor.isActive('codeBlock')
                ? 'bg-blue-50 border-blue-400 text-blue-700 font-medium'
                : 'border-slate-200 hover:bg-slate-50 text-slate-700'
            }`}
          >
            <Code className="w-3.5 h-3.5 text-slate-500" />
            Blok kódu
          </button>
        </div>
      </div>
    </div>
  );
};
