export type PageFormat = 'A4' | 'A5' | 'Letter' | 'Legal';
export type PageOrientation = 'portrait' | 'landscape';
export type MarginPreset = 'normal' | 'narrow' | 'wide' | 'custom';

export interface PageMargins {
  top: number; // in mm
  bottom: number; // in mm
  left: number; // in mm
  right: number; // in mm
}

export interface PageSettings {
  format: PageFormat;
  orientation: PageOrientation;
  marginPreset: MarginPreset;
  margins: PageMargins;
  paperColor: string; // hex
  showRuler: boolean;
}

export type PageNumberFormat = 'none' | 'page' | 'page_of_total' | 'dash';
export type TextAlignment = 'left' | 'center' | 'right';

export interface HeaderFooterSettings {
  showHeader: boolean;
  headerText: string;
  headerAlign: TextAlignment;
  showFooter: boolean;
  footerText: string;
  footerAlign: TextAlignment;
  pageNumbering: PageNumberFormat;
  pageNumberPosition: TextAlignment;
  differentFirstPage: boolean;
}

export interface DocumentStats {
  words: number;
  characters: number;
  charactersNoSpaces: number;
  paragraphs: number;
  readingTimeMinutes: number;
}

export type SidebarTab = 'text' | 'insert' | 'page' | 'headerFooter' | 'export' | 'stats';

export interface DocumentTemplate {
  id: string;
  name: string;
  description: string;
  content: string;
  pageSettings?: Partial<PageSettings>;
}
