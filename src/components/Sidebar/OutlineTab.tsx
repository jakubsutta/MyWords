import React, { useState, useEffect } from 'react';
import { Editor } from '@tiptap/react';
import type { OutlineItem } from '../../types/editor';
import { ListTree, ChevronRight, Hash } from 'lucide-react';

interface Props {
  editor: Editor | null;
}

export const OutlineTab: React.FC<Props> = ({ editor }) => {
  const [headings, setHeadings] = useState<OutlineItem[]>([]);

  useEffect(() => {
    if (!editor) return;

    const extractHeadings = () => {
      const items: OutlineItem[] = [];
      editor.state.doc.descendants((node, pos) => {
        if (node.type.name === 'heading') {
          const text = node.textContent;
          if (text.trim()) {
            items.push({
              id: `heading-${pos}`,
              text,
              level: node.attrs.level || 1,
              pos,
            });
          }
        }
      });
      setHeadings(items);
    };

    extractHeadings();
    editor.on('update', extractHeadings);
    return () => {
      editor.off('update', extractHeadings);
    };
  }, [editor]);

  if (!editor) return null;

  const scrollToHeading = (pos: number) => {
    editor.chain().focus().setTextSelection(pos + 1).run();
  };

  const handleInsertTOC = () => {
    if (headings.length === 0) {
      alert('V dokumentu nejsou žádné nadpisy pro vytvoření obsahu.');
      return;
    }

    let tocHtml = `
      <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 1.25rem; margin: 1.5rem 0;">
        <h3 style="margin-top: 0; margin-bottom: 0.75rem; color: #1e293b; font-size: 1.1rem; border-bottom: 1px solid #cbd5e1; padding-bottom: 0.5rem;">Obsah dokumentu</h3>
        <ul style="list-style: none; padding-left: 0; margin: 0; line-height: 1.8;">
    `;

    headings.forEach((h) => {
      const indent = (h.level - 1) * 1.5;
      const weight = h.level === 1 ? '600' : '400';
      const color = h.level === 1 ? '#0f172a' : '#475569';
      tocHtml += `
        <li style="margin-left: ${indent}rem; display: flex; justify-content: space-between; align-items: baseline; font-weight: ${weight}; color: ${color};">
          <span>${h.text}</span>
          <span style="flex: 1; border-bottom: 1px dotted #94a3b8; margin: 0 0.5rem; height: 1px;"></span>
        </li>
      `;
    });

    tocHtml += `
        </ul>
      </div>
      <p></p>
    `;

    editor.chain().focus().insertContent(tocHtml).run();
  };

  return (
    <div className="space-y-3.5 text-xs">
      {/* Table of contents actions */}
      <div>
        <button
          type="button"
          onClick={handleInsertTOC}
          className="w-full flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-lg border border-blue-200 bg-blue-50/70 hover:bg-blue-100/70 text-blue-800 text-xs font-semibold transition-all shadow-2xs"
        >
          <ListTree className="w-3.5 h-3.5 text-blue-600" />
          Vložit generovaný obsah do textu
        </button>
      </div>

      {/* Headings navigation list */}
      <div>
        <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1 flex items-center justify-between">
          <span className="flex items-center gap-1">
            <Hash className="w-3 h-3 text-slate-400" />
            Struktura kapitol ({headings.length})
          </span>
        </div>

        {headings.length === 0 ? (
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-center text-[11px] text-slate-400">
            Dokument zatím nemá nadpisy (H1, H2, H3).
          </div>
        ) : (
          <div className="space-y-0.5 max-h-[500px] overflow-y-auto pr-1">
            {headings.map((h, i) => (
              <button
                key={`${h.id}-${i}`}
                type="button"
                onClick={() => scrollToHeading(h.pos)}
                style={{ paddingLeft: `${(h.level - 1) * 10 + 6}px` }}
                className={`w-full text-left py-1 pr-2 rounded text-[11px] hover:bg-blue-50 hover:text-blue-700 flex items-center gap-1 transition-colors group ${
                  h.level === 1
                    ? 'font-semibold text-slate-800'
                    : h.level === 2
                    ? 'font-medium text-slate-700'
                    : 'text-slate-500'
                }`}
              >
                <ChevronRight className="w-3 h-3 text-slate-400 group-hover:text-blue-500 shrink-0" />
                <span className="truncate">{h.text}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
