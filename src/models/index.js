'use strict';

/** Model providers for language detection. */

const { Language, code } = require('../lang');

/** Detection result from a model. */
class DetectionResult {
  constructor(language, confidence, rawCode) {
    this.language = language;
    this.confidence = confidence;
    this.rawCode = rawCode;
  }

  static of(language, confidence, rawCode) {
    return new DetectionResult(language, confidence, String(rawCode));
  }

  static unknown() {
    return new DetectionResult(Language.Unknown, 0.0, 'unknown');
  }
}

module.exports = { DetectionResult, code };
