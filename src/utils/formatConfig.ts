export type PageFormat = 'A4' | 'A5' | 'A6' | 'B5' | 'Letter' | 'Legal';

export interface PageFormatInfo {
  id: PageFormat;
  name: string;
  category: 'iso' | 'book' | 'us';
  widthCm: number;
  heightCm: number;
  widthMm: number;
  heightMm: number;
  label: string;
  description: string;
}

export const PAGE_FORMATS: Record<PageFormat, PageFormatInfo> = {
  A4: {
    id: 'A4',
    name: 'A4',
    category: 'iso',
    widthCm: 21.0,
    heightCm: 29.7,
    widthMm: 210,
    heightMm: 297,
    label: 'A4 (21,0 × 29,7 cm)',
    description: 'Standardní kancelářský formát, úřední dokumenty, smlouvy',
  },
  A5: {
    id: 'A5',
    name: 'A5',
    category: 'book',
    widthCm: 14.8,
    heightCm: 21.0,
    widthMm: 148,
    heightMm: 210,
    label: 'A5 (14,8 × 21,0 cm)',
    description: 'Malá kniha, sešit, příručka, brožura',
  },
  A6: {
    id: 'A6',
    name: 'A6',
    category: 'book',
    widthCm: 10.5,
    heightCm: 14.8,
    widthMm: 105,
    heightMm: 148,
    label: 'A6 (10,5 × 14,8 cm)',
    description: 'Kapesní formát, kapesní knížka, zápisník',
  },
  B5: {
    id: 'B5',
    name: 'B5',
    category: 'book',
    widthCm: 17.6,
    heightCm: 25.0,
    widthMm: 176,
    heightMm: 250,
    label: 'B5 (17,6 × 25,0 cm)',
    description: 'Klasický knižní standard, monografie, beletrie',
  },
  Letter: {
    id: 'Letter',
    name: 'Letter',
    category: 'us',
    widthCm: 21.6,
    heightCm: 27.9,
    widthMm: 215.9,
    heightMm: 279.4,
    label: 'Letter (21,6 × 27,9 cm)',
    description: 'Americký formát Letter',
  },
  Legal: {
    id: 'Legal',
    name: 'Legal',
    category: 'us',
    widthCm: 21.6,
    heightCm: 35.6,
    widthMm: 215.9,
    heightMm: 355.6,
    label: 'Legal (21,6 × 35,6 cm)',
    description: 'Americký formát Legal pro právní dokumenty',
  },
};

export function getFormatDimensions(format: PageFormat, orientation: 'portrait' | 'landscape') {
  const config = PAGE_FORMATS[format] || PAGE_FORMATS.A4;
  const isLandscape = orientation === 'landscape';
  return {
    widthMm: isLandscape ? config.heightMm : config.widthMm,
    heightMm: isLandscape ? config.widthMm : config.heightMm,
    widthCm: isLandscape ? config.heightCm : config.widthCm,
    heightCm: isLandscape ? config.widthCm : config.heightCm,
    info: config,
  };
}
