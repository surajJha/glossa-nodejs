'use strict';

/**
 * Glossa — high-accuracy language detection for Indian languages.
 *
 * Supports 14 languages with same-script disambiguation for Hindi/Marathi
 * and Bengali/Assamese.
 *
 * @example
 *   const { detectLanguage } = require('glossa');
 *   detectLanguage('नमस्ते दुनिया'); // => 'hi'
 */

const lang = require('./lang');
const config = require('./config');
const errors = require('./error');
const script = require('./script');
const normalize = require('./normalize');
const tokenize = require('./tokenize');
const { LanguageDetector } = require('./detector');
const { DetectionResult } = require('./models/index');
const { WhatlangProvider } = require('./models/whatlangProvider');
const { EnsembleProvider, EnsembleStrategy } = require('./models/ensemble');
const {
  NgramHiMrDisambiguator,
  NgramBnAsDisambiguator,
} = require('./models/disambiguation');

const { DetectorConfig, ModelType } = config;
const { code } = lang;
const defaultDetector = new LanguageDetector(DetectorConfig.default());

/**
 * Detect the language of text using the default configuration.
 * @param {string} text
 * @returns {string} ISO 639-1 code (e.g. "hi"), or "unknown".
 */
function detectLanguage(text) {
  const result = defaultDetector.detect(text);
  return result === null ? 'unknown' : code(result);
}

/**
 * Detect language with a confidence score.
 * @param {string} text
 * @returns {{ language: string, confidence: number }}
 */
function detectLanguageWithConfidence(text) {
  const result = defaultDetector.detectWithConfidence(text);
  if (result === null) {
    return { language: 'unknown', confidence: 0.0 };
  }
  return { language: code(result[0]), confidence: result[1] };
}

/**
 * Detect language using a specific model.
 * @param {string} text
 * @param {string} model one of ModelType
 * @returns {string} ISO 639-1 code, or "unknown".
 */
function detectLanguageWithModel(text, model) {
  const cfg = DetectorConfig.builder().model(model).build();
  const detector = new LanguageDetector(cfg);
  const result = detector.detect(text);
  return result === null ? 'unknown' : code(result);
}

module.exports = {
  VERSION: '1.0.0',

  // Convenience API
  detectLanguage,
  detectLanguageWithConfidence,
  detectLanguageWithModel,

  // Core classes
  LanguageDetector,
  DetectorConfig,
  DetectorConfigBuilder: config.DetectorConfigBuilder,
  ModelType,
  DetectionResult,

  // Enums / helpers
  Language: lang.Language,
  Script: lang.Script,
  code: lang.code,
  fromCode: lang.fromCode,
  languageScript: lang.script,
  allLanguages: lang.all,
  modelName: config.modelName,
  modelFromString: config.modelFromString,

  // Providers / disambiguators
  WhatlangProvider,
  EnsembleProvider,
  EnsembleStrategy,
  NgramHiMrDisambiguator,
  NgramBnAsDisambiguator,

  // Errors
  DetectorError: errors.DetectorError,
  ErrorKind: errors.ErrorKind,

  // Low-level modules
  scriptUtils: script,
  normalizeUtils: normalize,
  tokenizeUtils: tokenize,
};
