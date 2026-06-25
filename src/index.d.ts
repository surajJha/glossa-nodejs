// Type definitions for glossa.

export type LanguageCode =
  | 'en' | 'hi' | 'mr' | 'bn' | 'as' | 'ta' | 'te' | 'gu'
  | 'kn' | 'ml' | 'or' | 'pa' | 'ur' | 'mai' | 'unknown';

export type Language =
  | 'English' | 'Hindi' | 'Marathi' | 'Bengali' | 'Assamese' | 'Tamil'
  | 'Telugu' | 'Gujarati' | 'Kannada' | 'Malayalam' | 'Odia' | 'Punjabi'
  | 'Urdu' | 'Maithili' | 'Unknown';

export type ScriptName =
  | 'Latin' | 'Devanagari' | 'Bengali' | 'Tamil' | 'Telugu' | 'Gujarati'
  | 'Kannada' | 'Malayalam' | 'Odia' | 'Gurmukhi' | 'Arabic' | 'Unknown';

export type ModelType =
  | 'Cld2' | 'Cld3' | 'Lingua' | 'FastText' | 'Whatlang' | 'Ensemble' | 'ScriptOnly';

export const Language: Readonly<Record<string, Language>>;
export const Script: Readonly<Record<string, ScriptName>>;
export const ModelType: Readonly<Record<string, ModelType>>;

export interface DetectorConfigOptions {
  model?: ModelType;
  minConfidence?: number;
  /** Minimum text length in UTF-8 bytes. */
  minTextLength?: number;
  enableDisambiguation?: boolean;
  disambiguationThreshold?: number;
  allowedLanguages?: Language[];
  fasttextModelPath?: string | null;
  corpusPath?: string | null;
  debug?: boolean;
}

export class DetectorConfig {
  constructor(opts?: DetectorConfigOptions);
  model: ModelType;
  minConfidence: number;
  minTextLength: number;
  enableDisambiguation: boolean;
  disambiguationThreshold: number;
  allowedLanguages: Language[];
  fasttextModelPath: string | null;
  corpusPath: string | null;
  debug: boolean;
  static default(): DetectorConfig;
  static builder(): DetectorConfigBuilder;
  isLanguageAllowed(lang: Language): boolean;
  clone(): DetectorConfig;
}

export class DetectorConfigBuilder {
  model(model: ModelType): this;
  minConfidence(confidence: number): this;
  minTextLength(length: number): this;
  enableDisambiguation(enable: boolean): this;
  disambiguationThreshold(threshold: number): this;
  allowedLanguages(languages: Language[]): this;
  fasttextModelPath(path: string): this;
  fasttextModelPathOpt(path: string | undefined): this;
  corpusPath(path: string): this;
  debug(enable: boolean): this;
  build(): DetectorConfig;
}

export class DetectionResult {
  language: Language;
  confidence: number;
  rawCode: string;
  static of(language: Language, confidence: number, rawCode: string): DetectionResult;
  static unknown(): DetectionResult;
}

export class LanguageDetector {
  constructor(config?: DetectorConfig);
  static new(config?: DetectorConfig): LanguageDetector;
  static defaultDetector(): LanguageDetector;
  /** Returns the detected Language, or null when detection fails. */
  detect(text: string): Language | null;
  /** Returns [language, confidence], or null when detection fails. */
  detectWithConfidence(text: string): [Language, number] | null;
  /** Returns an ISO 639-1 code, or "unknown". */
  getSrcLanguage(text: string): LanguageCode;
}

export type ErrorKind =
  | 'EmptyInput' | 'TextTooShort' | 'ModelLoadError' | 'ModelNotFound'
  | 'InvalidConfig' | 'LowConfidence' | 'ScriptDetectionFailed'
  | 'DisambiguationFailed' | 'Io' | 'Json' | 'Internal';

export const ErrorKind: Readonly<Record<string, ErrorKind>>;

export class DetectorError extends Error {
  kind: ErrorKind;
  details: Record<string, unknown>;
}

export class WhatlangProvider {
  static new(): WhatlangProvider;
  name(): string;
  detect(text: string): DetectionResult;
  detectTopN(text: string, n?: number): DetectionResult[];
  supportsLanguage(lang: Language): boolean;
}

export type EnsembleStrategy =
  | 'MajorityVoting' | 'WeightedVoting' | 'MaxConfidence' | 'AverageConfidence';
export const EnsembleStrategy: Readonly<Record<string, EnsembleStrategy>>;

export class EnsembleProvider {
  constructor(strategy?: EnsembleStrategy);
  static new(): EnsembleProvider;
  static withStrategy(strategy: EnsembleStrategy): EnsembleProvider;
  name(): string;
  detect(text: string): DetectionResult;
  detectTopN(text: string, n: number): DetectionResult[];
  supportsLanguage(lang: Language): boolean;
}

export class NgramHiMrDisambiguator {
  static new(): NgramHiMrDisambiguator;
  languages(): Language[];
  disambiguate(text: string, candidates: Language[]): [Language, number];
}

export class NgramBnAsDisambiguator {
  static new(): NgramBnAsDisambiguator;
  languages(): Language[];
  disambiguate(text: string, candidates: Language[]): [Language, number];
}

/** Detect the language of text. Returns an ISO 639-1 code, or "unknown". */
export function detectLanguage(text: string): LanguageCode;

/** Detect language with a confidence score. */
export function detectLanguageWithConfidence(text: string): {
  language: LanguageCode;
  confidence: number;
};

/** Detect language using a specific model. Returns an ISO 639-1 code. */
export function detectLanguageWithModel(text: string, model: ModelType): LanguageCode;

export const VERSION: string;
export function code(lang: Language): LanguageCode;
export function fromCode(code: string): Language | null;
export function languageScript(lang: Language): ScriptName;
export function allLanguages(): Language[];
export function modelName(model: ModelType): string;
export function modelFromString(s: string): ModelType | null;
