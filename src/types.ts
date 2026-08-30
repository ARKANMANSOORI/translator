export interface LanguageDetection {
  name: string;
  nativeName: string;
  code: string;
  confidence: number;
  family: string;
  script: string;
  direction: 'ltr' | 'rtl' | string;
  formatDetected: string;
  formatNotes?: string;
}

export interface TranslationStats {
  originalLines: number;
  translatedLines: number;
  originalWords: number;
  translatedWords: number;
  originalChars: number;
  translatedChars: number;
}

export interface UploadedFile {
  name: string;
  size: number;
  type: string;
  previewUrl?: string;
  base64Data?: string;
}

export interface TargetLanguage {
  code: string;
  name: string;
  nativeName: string;
  flag?: string;
  direction?: 'ltr' | 'rtl';
}

export interface TranslationResult {
  id?: string;
  originalText: string;
  translatedText: string;
  detectedLanguage: LanguageDetection;
  detectedDialect?: string;
  isOriginalEnglish: boolean;
  targetLanguage?: TargetLanguage;
  timestamp: number;
  stats: TranslationStats;
  favorite?: boolean;
  uploadedFile?: UploadedFile;
}

export interface SamplePreset {
  id: string;
  title: string;
  category: 'code' | 'markdown' | 'poetry' | 'json' | 'list' | 'table' | 'dialogue';
  languageName: string;
  languageCode: string;
  formatType: string;
  text: string;
  description: string;
}
