export type PageFormat = 'A4' | 'A5' | 'A6' | 'Letter' | 'Legal' | 'B5';
export type PageOrientation = 'portrait' | 'landscape';
export type MarginPreset = 'normal' | 'narrow' | 'wide' | 'book' | 'custom';
export type DocumentLayoutType = 'standard' | 'book'; // standard single page vs book/handbook (facing pages)

export interface PageMargins {
  top: number; // in mm
  bottom: number; // in mm
  left: number; // in mm (or inner margin for book mode)
  right: number; // in mm (or outer margin for book mode)
  gutter?: number; // binding gutter (hřbet vazby) in mm
}

export interface PageSettings {
  format: PageFormat;
  orientation: PageOrientation;
  marginPreset: MarginPreset;
  margins: PageMargins;
  paperColor: string; // hex
  showRuler: boolean;
  showMarginGuides: boolean; // Zobrazit vodící linky okrajů
  layoutType: DocumentLayoutType; // standard vs kniha/příručka
  gutter: number; // Hřbet vazby (mm)
  mirrorMargins: boolean; // Zrcadlové okraje pro dvoustranný tisk
  bookSpreadView?: boolean; // Zobrazit celou dvojstránku vedle sebe (levá + pravá)
}

export type PageNumberFormat = 'none' | 'page' | 'page_of_total' | 'dash' | 'roman';
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
  differentOddEven: boolean; // Rozdílné záhlaví/zápatí pro sudé a liché stránky (kniha/příručka)
  evenHeaderText?: string;
  evenFooterText?: string;
}

export interface DocumentStats {
  words: number;
  characters: number;
  charactersNoSpaces: number;
  paragraphs: number;
  readingTimeMinutes: number;
  pageCount?: number;
}

export type SidebarTab = 'projects' | 'text' | 'insert' | 'page' | 'headerFooter' | 'outline' | 'export' | 'stats';

export interface Project {
  id: string;
  title: string;
  content: string; // HTML format
  pageSettings: PageSettings;
  headerFooterSettings: HeaderFooterSettings;
  createdAt: number;
  updatedAt: number;
}

export interface DocumentTemplate {
  id: string;
  name: string;
  description: string;
  content: string;
  pageSettings?: Partial<PageSettings>;
}

export interface OutlineItem {
  id: string;
  text: string;
  level: number;
  pos: number;
}
