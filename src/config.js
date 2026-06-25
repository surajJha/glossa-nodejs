'use strict';

/** Configuration for the language detector. */

/**
 * Model types available for language detection.
 * @enum {string}
 */
const ModelType = Object.freeze({
  /** CLD2 - Compact Language Detector 2 (falls back to whatlang). */
  Cld2: 'Cld2',
  /** Lingua (CLD3 alternative). Kept for backward compatibility. */
  Cld3: 'Cld3',
  /** Lingua - neural language detection. */
  Lingua: 'Lingua',
  /** fastText language identification model (lid.176). */
  FastText: 'FastText',
  /** whatlang - native trigram detector (default). */
  Whatlang: 'Whatlang',
  /** Ensemble of all models with voting. */
  Ensemble: 'Ensemble',
  /** Script-based detection only (no ML model). */
  ScriptOnly: 'ScriptOnly',
});

const MODEL_NAMES = {
  [ModelType.Cld2]: 'cld2',
  [ModelType.Cld3]: 'lingua',
  [ModelType.Lingua]: 'lingua',
  [ModelType.FastText]: 'fasttext',
  [ModelType.Whatlang]: 'whatlang',
  [ModelType.Ensemble]: 'ensemble',
  [ModelType.ScriptOnly]: 'script_only',
};

/** Get the model name as a lowercase string. */
function modelName(model) {
  return MODEL_NAMES[model] || 'whatlang';
}

/** Parse a model type from a string (case-insensitive). Returns null if unknown. */
function modelFromString(s) {
  if (typeof s !== 'string') return null;
  switch (s.toLowerCase()) {
    case 'cld2':
      return ModelType.Cld2;
    case 'cld3':
    case 'lingua':
      return ModelType.Lingua;
    case 'fasttext':
      return ModelType.FastText;
    case 'whatlang':
      return ModelType.Whatlang;
    case 'ensemble':
      return ModelType.Ensemble;
    case 'script_only':
    case 'script-only':
    case 'script':
      return ModelType.ScriptOnly;
    default:
      return null;
  }
}

/**
 * Configuration for the language detector.
 */
class DetectorConfig {
  constructor(opts = {}) {
    /** @type {string} */
    this.model = opts.model !== undefined ? opts.model : ModelType.Whatlang;
    /** @type {number} */
    this.minConfidence = opts.minConfidence !== undefined ? opts.minConfidence : 0.5;
    /** @type {number} minimum text length in UTF-8 bytes. */
    this.minTextLength = opts.minTextLength !== undefined ? opts.minTextLength : 3;
    /** @type {boolean} */
    this.enableDisambiguation =
      opts.enableDisambiguation !== undefined ? opts.enableDisambiguation : true;
    /** @type {number} */
    this.disambiguationThreshold =
      opts.disambiguationThreshold !== undefined ? opts.disambiguationThreshold : 0.7;
    /** @type {string[]} allowed languages (empty = all). */
    this.allowedLanguages = opts.allowedLanguages ? opts.allowedLanguages.slice() : [];
    /** @type {string|null} */
    this.fasttextModelPath =
      opts.fasttextModelPath !== undefined ? opts.fasttextModelPath : null;
    /** @type {string|null} */
    this.corpusPath = opts.corpusPath !== undefined ? opts.corpusPath : null;
    /** @type {boolean} */
    this.debug = opts.debug !== undefined ? opts.debug : false;
  }

  /** Create the default configuration. */
  static default() {
    return new DetectorConfig();
  }

  /** Create a new configuration builder. */
  static builder() {
    return new DetectorConfigBuilder();
  }

  /** Whether a language is allowed by this configuration. */
  isLanguageAllowed(lang) {
    return this.allowedLanguages.length === 0 || this.allowedLanguages.includes(lang);
  }

  clone() {
    return new DetectorConfig({
      model: this.model,
      minConfidence: this.minConfidence,
      minTextLength: this.minTextLength,
      enableDisambiguation: this.enableDisambiguation,
      disambiguationThreshold: this.disambiguationThreshold,
      allowedLanguages: this.allowedLanguages,
      fasttextModelPath: this.fasttextModelPath,
      corpusPath: this.corpusPath,
      debug: this.debug,
    });
  }
}

/**
 * Fluent builder for {@link DetectorConfig}.
 */
class DetectorConfigBuilder {
  constructor() {
    this._config = new DetectorConfig();
  }

  model(model) {
    this._config.model = model;
    return this;
  }

  minConfidence(confidence) {
    this._config.minConfidence = confidence;
    return this;
  }

  minTextLength(length) {
    this._config.minTextLength = length;
    return this;
  }

  enableDisambiguation(enable) {
    this._config.enableDisambiguation = enable;
    return this;
  }

  disambiguationThreshold(threshold) {
    this._config.disambiguationThreshold = threshold;
    return this;
  }

  allowedLanguages(languages) {
    this._config.allowedLanguages = languages ? languages.slice() : [];
    return this;
  }

  fasttextModelPath(path) {
    this._config.fasttextModelPath = path;
    return this;
  }

  fasttextModelPathOpt(path) {
    this._config.fasttextModelPath = path === undefined ? null : path;
    return this;
  }

  corpusPath(path) {
    this._config.corpusPath = path;
    return this;
  }

  debug(enable) {
    this._config.debug = enable;
    return this;
  }

  build() {
    return this._config.clone();
  }
}

module.exports = {
  ModelType,
  modelName,
  modelFromString,
  DetectorConfig,
  DetectorConfigBuilder,
};
