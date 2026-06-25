'use strict';

/** Error types for the language detector. */

const ErrorKind = Object.freeze({
  EmptyInput: 'EmptyInput',
  TextTooShort: 'TextTooShort',
  ModelLoadError: 'ModelLoadError',
  ModelNotFound: 'ModelNotFound',
  InvalidConfig: 'InvalidConfig',
  LowConfidence: 'LowConfidence',
  ScriptDetectionFailed: 'ScriptDetectionFailed',
  DisambiguationFailed: 'DisambiguationFailed',
  Io: 'Io',
  Json: 'Json',
  Internal: 'Internal',
});

/**
 * Error raised during language detection.
 */
class DetectorError extends Error {
  /**
   * @param {string} kind one of ErrorKind
   * @param {string} message human readable message
   * @param {object} [details] extra structured fields
   */
  constructor(kind, message, details = {}) {
    super(message);
    this.name = 'DetectorError';
    this.kind = kind;
    this.details = details;
  }

  static emptyInput() {
    return new DetectorError(
      ErrorKind.EmptyInput,
      'Input text is empty or contains only whitespace'
    );
  }

  static textTooShort(minChars) {
    return new DetectorError(
      ErrorKind.TextTooShort,
      `Input text is too short for reliable detection (minimum ${minChars} characters required)`,
      { minChars }
    );
  }

  static modelLoad(model, reason) {
    return new DetectorError(
      ErrorKind.ModelLoadError,
      `Failed to load model '${model}': ${reason}`,
      { model, reason }
    );
  }

  static modelNotFound(path) {
    return new DetectorError(ErrorKind.ModelNotFound, `Model file not found: ${path}`, { path });
  }

  static invalidConfig(reason) {
    return new DetectorError(ErrorKind.InvalidConfig, `Invalid model configuration: ${reason}`, {
      reason,
    });
  }

  static lowConfidence(confidence, threshold) {
    return new DetectorError(
      ErrorKind.LowConfidence,
      `Detection confidence too low: ${confidence.toFixed(2)} (threshold: ${threshold.toFixed(2)})`,
      { confidence, threshold }
    );
  }

  static scriptDetectionFailed() {
    return new DetectorError(
      ErrorKind.ScriptDetectionFailed,
      'Could not detect script from input text'
    );
  }

  static disambiguationFailed(lang1, lang2) {
    return new DetectorError(
      ErrorKind.DisambiguationFailed,
      `Disambiguation failed between ${lang1} and ${lang2}`,
      { lang1, lang2 }
    );
  }

  static internal(msg) {
    return new DetectorError(ErrorKind.Internal, `Internal error: ${msg}`, {});
  }
}

module.exports = { DetectorError, ErrorKind };
