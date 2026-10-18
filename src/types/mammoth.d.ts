declare module 'mammoth' {
  export interface MammothResult {
    value: string;
    messages: Array<{
      type: string;
      message: string;
    }>;
  }

  export function convertToHtml(
    input: { arrayBuffer?: ArrayBuffer; path?: string },
    options?: any
  ): Promise<MammothResult>;
}
