declare module 'pdf-parse' {
  interface PDFParseOptions {
    max?: number;
    version?: string;
    pagerender?: (pageData: any) => Promise<string>;
    password?: string;
  }

  interface PDFParseResult {
    numpages: number;
    numrender: number;
    info: {
      PDFFormatVersion?: string;
      IsAcroFormPresent?: boolean;
      IsXFAPresent?: boolean;
      IsCollectionPresent?: boolean;
      Title?: string;
      Author?: string;
      Subject?: string;
      Keywords?: string;
      Creator?: string;
      Producer?: string;
      CreationDate?: string;
      ModDate?: string;
      [key: string]: any;
    };
    metadata: any;
    text: string;
    version: string;
  }

  function PDFParse(
    dataBuffer: Buffer,
    options?: PDFParseOptions
  ): Promise<PDFParseResult>;

  export = PDFParse;
}