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
} from 'lucide-react';

interface Props {
  editor: Editor | null;
}

const FONTS = [
  { name: 'Inter', value: 'Inter, sans-serif' },
  { name: 'Roboto', value: 'Roboto, sans-serif' },
  { name: 'Montserrat', value: 'Montserrat, sans-serif' },
  { name: 'Segoe UI', value: '"Segoe UI", -apple-system, BlinkMacSystemFont, Roboto, sans-serif' },
  { name: 'Merriweather', value: 'Merriweather, serif' },
  { name: 'Playfair Display', value: 'Playfair Display, serif' },
  { name: 'EB Garamond', value: 'EB Garamond, serif' },
  { name: 'Lora', value: 'Lora, serif' },
  { name: 'JetBrains Mono', value: 'JetBrains Mono, monospace' },
  { name: 'Fira Code', value: 'Fira Code, monospace' },
  { name: 'Arial', value: 'Arial, Helvetica, sans-serif' },
  { name: 'Georgia', value: 'Georgia, serif' },
  { name: 'Times New Roman', value: '"Times New Roman", Times, serif' },
];

const FONT_SIZES = [
  '9pt', '10pt', '11pt', '12pt', '14pt', '16pt', '18pt', '20pt', '24pt', '28pt', '32pt', '36pt', '48pt'
];

const PRESET_COLORS = [
  '#000000', '#334155', '#dc2626', '#ea580c', '#16a34a', '#0284c7', '#2563eb', '#7c3aed'
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
    : 'p';

  return (
    <div className="space-y-3.5 text-xs">
      {/* Font Family & Size in a compact row */}
      <div>
        <div className="flex items-center gap-1.5 mb-1">
          <select
            onChange={(e) => editor.chain().focus().setFontFamily(e.target.value).run()}
            className="select-custom flex-1 py-1.5 pl-2.5 bg-white border border-slate-200/90 hover:border-slate-300 rounded-lg shadow-2xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none text-xs font-medium cursor-pointer transition-all"
          >
            {FONTS.map((font) => (
              <option key={font.name} value={font.value} style={{ fontFamily: font.value }}>
                {font.name}
              </option>
            ))}
          </select>

          <select
            onChange={(e) => editor.chain().focus().setFontSize(e.target.value).run()}
            defaultValue="11pt"
            className="select-custom w-22 py-1.5 pl-2 bg-white border border-slate-200/90 hover:border-slate-300 rounded-lg shadow-2xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none text-xs font-mono cursor-pointer transition-all"
            title="Velikost písma"
          >
            {FONT_SIZES.map((sz) => (
              <option key={sz} value={sz}>
                {sz}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Paragraph Style / Headings - Compact pills */}
      <div className="flex items-center gap-1 p-0.5 bg-slate-100/90 rounded-lg border border-slate-200">
        <button
          type="button"
          onClick={() => editor.chain().focus().setParagraph().run()}
          className={`flex-1 py-1 rounded text-center transition-all ${
            currentHeading === 'p'
              ? 'bg-white shadow-2xs text-blue-700 font-semibold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Text
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={`flex-1 py-1 rounded text-center transition-all ${
            currentHeading === 'h1'
              ? 'bg-white shadow-2xs text-blue-700 font-bold'
              : 'text-slate-600 hover:text-slate-900 font-semibold'
          }`}
        >
          H1
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`flex-1 py-1 rounded text-center transition-all ${
            currentHeading === 'h2'
              ? 'bg-white shadow-2xs text-blue-700 font-bold'
              : 'text-slate-600 hover:text-slate-900 font-medium'
          }`}
        >
          H2
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={`flex-1 py-1 rounded text-center transition-all ${
            currentHeading === 'h3'
              ? 'bg-white shadow-2xs text-blue-700 font-bold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          H3
        </button>
      </div>

      {/* Basic Formatting Ribbon */}
      <div className="flex flex-wrap items-center gap-0.5 p-1 bg-slate-50 rounded-lg border border-slate-200">
        <button
          type="button"
          title="Tučné (Ctrl+B)"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-1.5 rounded transition-colors ${
            editor.isActive('bold')
              ? 'bg-white shadow-2xs text-blue-600 font-bold border border-slate-200'
              : 'text-slate-600 hover:bg-slate-200/60'
          }`}
        >
          <Bold className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          title="Kurzíva (Ctrl+I)"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-1.5 rounded transition-colors ${
            editor.isActive('italic')
              ? 'bg-white shadow-2xs text-blue-600 font-bold border border-slate-200'
              : 'text-slate-600 hover:bg-slate-200/60'
          }`}
        >
          <Italic className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          title="Podtržené (Ctrl+U)"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`p-1.5 rounded transition-colors ${
            editor.isActive('underline')
              ? 'bg-white shadow-2xs text-blue-600 font-bold border border-slate-200'
              : 'text-slate-600 hover:bg-slate-200/60'
          }`}
        >
          <UnderlineIcon className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          title="Přeškrtnuté"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={`p-1.5 rounded transition-colors ${
            editor.isActive('strike')
              ? 'bg-white shadow-2xs text-blue-600 font-bold border border-slate-200'
              : 'text-slate-600 hover:bg-slate-200/60'
          }`}
        >
          <Strikethrough className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          title="Dolní index"
          onClick={() => editor.chain().focus().toggleSubscript().run()}
          className={`p-1.5 rounded transition-colors ${
            editor.isActive('subscript')
              ? 'bg-white shadow-2xs text-blue-600 font-bold border border-slate-200'
              : 'text-slate-600 hover:bg-slate-200/60'
          }`}
        >
          <SubscriptIcon className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          title="Horní index"
          onClick={() => editor.chain().focus().toggleSuperscript().run()}
          className={`p-1.5 rounded transition-colors ${
            editor.isActive('superscript')
              ? 'bg-white shadow-2xs text-blue-600 font-bold border border-slate-200'
              : 'text-slate-600 hover:bg-slate-200/60'
          }`}
        >
          <SuperscriptIcon className="w-3.5 h-3.5" />
        </button>
        <div className="h-4 w-px bg-slate-200 mx-0.5" />
        <button
          type="button"
          title="Vymazat formátování"
          onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}
          className="p-1.5 rounded text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors ml-auto"
        >
          <RemoveFormatting className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Alignment & Line Spacing */}
      <div className="flex items-center gap-1.5">
        <div className="flex flex-1 items-center gap-0.5 p-0.5 bg-slate-50 rounded-lg border border-slate-200">
          <button
            type="button"
            title="Vlevo"
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            className={`flex-1 flex justify-center py-1 rounded transition-colors ${
              editor.isActive({ textAlign: 'left' })
                ? 'bg-white shadow-2xs text-blue-600 border border-slate-200 font-semibold'
                : 'text-slate-600 hover:bg-slate-200/60'
            }`}
          >
            <AlignLeft className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            title="Na střed"
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            className={`flex-1 flex justify-center py-1 rounded transition-colors ${
              editor.isActive({ textAlign: 'center' })
                ? 'bg-white shadow-2xs text-blue-600 border border-slate-200 font-semibold'
                : 'text-slate-600 hover:bg-slate-200/60'
            }`}
          >
            <AlignCenter className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            title="Vpravo"
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            className={`flex-1 flex justify-center py-1 rounded transition-colors ${
              editor.isActive({ textAlign: 'right' })
                ? 'bg-white shadow-2xs text-blue-600 border border-slate-200 font-semibold'
                : 'text-slate-600 hover:bg-slate-200/60'
            }`}
          >
            <AlignRight className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            title="Do bloku (Justify)"
            onClick={() => editor.chain().focus().setTextAlign('justify').run()}
            className={`flex-1 flex justify-center py-1 rounded transition-colors ${
              editor.isActive({ textAlign: 'justify' })
                ? 'bg-white shadow-2xs text-blue-600 border border-slate-200 font-semibold'
                : 'text-slate-600 hover:bg-slate-200/60'
            }`}
          >
            <AlignJustify className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Compact Line Spacing Pills */}
        <div className="flex items-center gap-0.5 bg-slate-100 p-0.5 rounded-lg border border-slate-200" title="Řádkování textu odstavce">
          {(['1.0', '1.15', '1.5', '2.0'] as const).map((spacing) => {
            const currentLH =
              editor?.getAttributes('paragraph')?.lineHeight ||
              editor?.getAttributes('heading')?.lineHeight;
            const isActive = currentLH ? currentLH === spacing : spacing === '1.15';
            return (
              <button
                key={spacing}
                type="button"
                onClick={() => editor?.chain().focus().setLineHeight(spacing).run()}
                className={`px-1.5 py-1 text-[10px] rounded transition-all ${
                  isActive
                    ? 'bg-white shadow-2xs text-blue-600 border border-slate-200 font-bold'
                    : 'hover:bg-white text-slate-600 hover:text-slate-800 font-medium'
                }`}
                title={`Řádkování ${spacing}`}
              >
                {spacing}
              </button>
            );
          })}
        </div>
      </div>

      {/* Colors & Highlighter - inline compact */}
      <div className="p-2 bg-slate-50 rounded-lg border border-slate-200 space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-slate-600 flex items-center gap-1">
            <Palette className="w-3 h-3 text-slate-500" />
            Písmo:
          </span>
          <div className="flex items-center gap-1">
            {PRESET_COLORS.map((col) => (
              <button
                key={col}
                type="button"
                onClick={() => editor.chain().focus().setColor(col).run()}
                style={{ backgroundColor: col }}
                className="w-4 h-4 rounded-full border border-black/10 hover:scale-115 transition-transform"
                title={col}
              />
            ))}
            <input
              type="color"
              onChange={(e) => editor.chain().focus().setColor(e.target.value).run()}
              className="w-4 h-4 rounded cursor-pointer border border-slate-300 ml-1"
              title="Vlastní barva"
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-1 border-t border-slate-200/70">
          <span className="text-[11px] font-semibold text-slate-600 flex items-center gap-1">
            <Highlighter className="w-3 h-3 text-slate-500" />
            Zvýraznit:
          </span>
          <div className="flex items-center gap-1">
            {HIGHLIGHT_COLORS.map((col) => (
              <button
                key={col}
                type="button"
                onClick={() => editor.chain().focus().setHighlight({ color: col }).run()}
                style={{ backgroundColor: col }}
                className="w-4 h-4 rounded-sm border border-slate-300 hover:scale-115 transition-transform"
                title={col}
              />
            ))}
            <button
              type="button"
              onClick={() => editor.chain().focus().unsetHighlight().run()}
              className="text-[10px] text-slate-400 hover:text-slate-700 ml-1 px-1"
              title="Zrušit zvýraznění"
            >
              ✕
            </button>
          </div>
        </div>
      </div>

      {/* Lists & Quotes & Code - Single row */}
      <div className="grid grid-cols-4 gap-1">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`flex items-center justify-center gap-1 py-1.5 rounded-lg border text-xs transition-all ${
            editor.isActive('bulletList')
              ? 'bg-blue-50 border-blue-400 text-blue-700 font-semibold'
              : 'border-slate-200 hover:bg-slate-50 text-slate-700'
          }`}
          title="Odrážkový seznam"
        >
          <List className="w-3.5 h-3.5" />
          <span>Odrážky</span>
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`flex items-center justify-center gap-1 py-1.5 rounded-lg border text-xs transition-all ${
            editor.isActive('orderedList')
              ? 'bg-blue-50 border-blue-400 text-blue-700 font-semibold'
              : 'border-slate-200 hover:bg-slate-50 text-slate-700'
          }`}
          title="Číslovaný seznam"
        >
          <ListOrdered className="w-3.5 h-3.5" />
          <span>Čísla</span>
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`flex items-center justify-center gap-1 py-1.5 rounded-lg border text-xs transition-all ${
            editor.isActive('blockquote')
              ? 'bg-blue-50 border-blue-400 text-blue-700 font-semibold'
              : 'border-slate-200 hover:bg-slate-50 text-slate-700'
          }`}
          title="Citace"
        >
          <Quote className="w-3.5 h-3.5" />
          <span>Citace</span>
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={`flex items-center justify-center gap-1 py-1.5 rounded-lg border text-xs transition-all ${
            editor.isActive('codeBlock')
              ? 'bg-blue-50 border-blue-400 text-blue-700 font-semibold'
              : 'border-slate-200 hover:bg-slate-50 text-slate-700'
          }`}
          title="Blok kódu"
        >
          <Code className="w-3.5 h-3.5" />
          <span>Kód</span>
        </button>
      </div>
    </div>
  );
};
