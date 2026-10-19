import React, { useState, useRef, useEffect, useCallback } from 'react';
import { X, Image as ImageIcon, Upload, Link as LinkIcon } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onInsert: (url: string, alt?: string) => void;
}

export const InsertImageModal: React.FC<Props> = ({ isOpen, onClose, onInsert }) => {
  const [tab, setTab] = useState<'upload' | 'url'>('upload');
  const [imageUrl, setImageUrl] = useState('');
  const [altText, setAltText] = useState('');
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClose = useCallback(() => {
    setImageUrl('');
    setAltText('');
    setPreview(null);
    onClose();
  }, [onClose]);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleClose]);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        setPreview(result);
        setImageUrl(result);
        if (!altText) setAltText(file.name.replace(/\.[^/.]+$/, ''));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInsert = () => {
    if (imageUrl.trim()) {
      onInsert(imageUrl.trim(), altText.trim());
      handleClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-2xs p-4 animate-in fade-in duration-150"
      onClick={handleClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2 text-slate-800 font-semibold text-sm">
            <ImageIcon className="w-4 h-4 text-blue-600" />
            Vložit obrázek
          </div>
          <button
            onClick={handleClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
            title="Zavřít (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5">
          {/* Tabs */}
          <div className="flex border-b border-slate-200 mb-4">
            <button
              type="button"
              onClick={() => setTab('upload')}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium border-b-2 -mb-px transition-colors ${
                tab === 'upload'
                  ? 'border-blue-600 text-blue-600 font-semibold'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              Nahrát ze zařízení
            </button>
            <button
              type="button"
              onClick={() => setTab('url')}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium border-b-2 -mb-px transition-colors ${
                tab === 'url'
                  ? 'border-blue-600 text-blue-600 font-semibold'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              <LinkIcon className="w-3.5 h-3.5" />
              Webový odkaz (URL)
            </button>
          </div>

          {tab === 'upload' ? (
            <div className="space-y-4">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-xl p-6 text-center cursor-pointer transition-colors bg-slate-50/50 hover:bg-blue-50/30"
              >
                <Upload className="w-8 h-8 mx-auto text-slate-400 mb-2" />
                <p className="text-xs font-medium text-slate-700">
                  Klepnutím vyberte obrázek (PNG, JPG, SVG, WebP)
                </p>
                <p className="text-[11px] text-slate-400 mt-1">nebo jej přetáhněte sem</p>
              </div>

              {preview && (
                <div className="mt-3 relative rounded-lg overflow-hidden border border-slate-200 bg-slate-100 max-h-48 flex items-center justify-center p-2">
                  <img src={preview} alt="Náhled" className="max-h-40 max-w-full object-contain rounded" />
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Adresa URL obrázku
                </label>
                <input
                  type="url"
                  placeholder="https://priklad.cz/obrazek.png"
                  value={imageUrl}
                  onChange={(e) => {
                    setImageUrl(e.target.value);
                    setPreview(e.target.value);
                  }}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              {preview && (
                <div className="mt-2 rounded-lg overflow-hidden border border-slate-200 bg-slate-100 max-h-40 flex items-center justify-center p-2">
                  <img
                    src={preview}
                    alt="Náhled"
                    onError={() => setPreview(null)}
                    className="max-h-36 max-w-full object-contain rounded"
                  />
                </div>
              )}
            </div>
          )}

          <div className="mt-4">
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Popisek obrázku (Alt text)
            </label>
            <input
              type="text"
              placeholder="Popis pro čtečky obrazovky a tisk..."
              value={altText}
              onChange={(e) => setAltText(e.target.value)}
              className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 mt-5">
            <button
              type="button"
              onClick={handleClose}
              className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Zrušit
            </button>
            <button
              type="button"
              onClick={handleInsert}
              disabled={!imageUrl.trim()}
              className="px-4 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:pointer-events-none rounded-lg shadow-xs transition-colors"
            >
              Vložit do dokumentu
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
