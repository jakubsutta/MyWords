import React, { useState } from 'react';
import { X, Table as TableIcon } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onInsert: (rows: number, cols: number, withHeaderRow: boolean) => void;
}

export const InsertTableModal: React.FC<Props> = ({ isOpen, onClose, onInsert }) => {
  const [hoverRows, setHoverRows] = useState(3);
  const [hoverCols, setHoverCols] = useState(3);
  const [withHeader, setWithHeader] = useState(true);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2 text-slate-800 font-semibold text-sm">
            <TableIcon className="w-4 h-4 text-blue-600" />
            Vložit tabulku
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5">
          <p className="text-xs text-slate-500 mb-3 font-medium">
            Vyberte rozměr mřížky ({hoverRows} × {hoverCols}):
          </p>

          <div className="grid grid-cols-8 gap-1.5 p-3 bg-slate-50 rounded-lg border border-slate-200 mb-4 justify-items-center">
            {Array.from({ length: 8 }).map((_, r) =>
              Array.from({ length: 8 }).map((_, c) => {
                const isSelected = r < hoverRows && c < hoverCols;
                return (
                  <button
                    key={`${r}-${c}`}
                    type="button"
                    onMouseEnter={() => {
                      setHoverRows(r + 1);
                      setHoverCols(c + 1);
                    }}
                    onClick={() => {
                      onInsert(r + 1, c + 1, withHeader);
                      onClose();
                    }}
                    className={`w-6 h-6 rounded-xs border transition-all ${
                      isSelected
                        ? 'bg-blue-500 border-blue-600 shadow-xs'
                        : 'bg-white border-slate-200 hover:border-blue-300'
                    }`}
                  />
                );
              })
            )}
          </div>

          <label className="flex items-center gap-2.5 text-xs text-slate-700 cursor-pointer mb-5">
            <input
              type="checkbox"
              checked={withHeader}
              onChange={(e) => setWithHeader(e.target.checked)}
              className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            <span>Zahrnout záhlaví tabulky (první řádek)</span>
          </label>

          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Zrušit
            </button>
            <button
              type="button"
              onClick={() => {
                onInsert(hoverRows, hoverCols, withHeader);
                onClose();
              }}
              className="px-4 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors"
            >
              Vložit {hoverRows} × {hoverCols}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
