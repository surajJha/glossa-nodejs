'use strict';

/**
 * Main language detector.
 *
 * Hybrid approach:
 *  1. Script detection to narrow candidates
 *  2. Same-script disambiguation for close pairs (hi/mr, bn/as)
 *  3. ML model inference (whatlang / ensemble) as fallback
 */

const { Language, code } = require('../lang');
const { DetectorConfig } = require('../config');
const { ErrorKind } = require('../error');
const { WhatlangProvider } = require('../models/whatlangProvider');
const { EnsembleProvider, EnsembleStrategy } = require('../models/ensemble');
const { NgramHiMrDisambiguator, NgramBnAsDisambiguator } = require('../models/disambiguation');
const { runDetectionPipeline } = require('./pipeline');

class LanguageDetector {
  /**
   * @param {DetectorConfig} [config]
   */
  constructor(config = DetectorConfig.default()) {
    this.config = config;
    this.whatlang = WhatlangProvider.new();
    this.ensemble = EnsembleProvider.withStrategy(EnsembleStrategy.MaxConfidence);
    this.hiMrDisambiguator = NgramHiMrDisambiguator.new();
    this.bnAsDisambiguator = NgramBnAsDisambiguator.new();
  }

  static new(config) {
    return new LanguageDetector(config);
  }

  /** Create a detector with the default configuration. */
  static defaultDetector() {
    return new LanguageDetector(DetectorConfig.default());
  }

  /**
   * Detect the language of text.
   * @returns {string|null} Language identifier, or null when detection fails.
   */
  detect(text) {
    const result = this.detectWithConfidence(text);
    return result === null ? null : result[0];
  }

  /**
   * Detect language with confidence score.
   * @returns {[string, number]|null} [language, confidence] or null.
   */
  detectWithConfidence(text) {
    let result;
    try {
      result = this._detectInternal(text);
    } catch (_e) {
      return null;
    }
    if (result.language === Language.Unknown) {
      return null;
    }
    return [result.language, result.confidence];
  }

  _detectInternal(text) {
    return runDetectionPipeline(
      this.config,
      text,
      this.hiMrDisambiguator,
      this.bnAsDisambiguator,
      this.whatlang,
      this.ensemble
    );
  }

  /**
   * Get the source language code for text (compatibility API).
   * @returns {string} ISO 639-1 code, or "unknown".
   */
  getSrcLanguage(text) {
    const lang = this.detect(text);
    return lang === null ? 'unknown' : code(lang);
  }
}

module.exports = { LanguageDetector, ErrorKind };
