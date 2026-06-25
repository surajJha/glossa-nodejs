'use strict';

/** Model routing and selection logic. */

const { ModelType } = require('../config');
const { DetectorError } = require('../error');
const { DetectionResult } = require('../models/index');
const { detectScriptWithCounts } = require('../script');
const { scriptCandidateLanguages, code } = require('../lang');

/** Script-only detection (no ML model). */
function detectScriptOnly(text) {
  const { script } = detectScriptWithCounts(text);
  const candidates = scriptCandidateLanguages(script);
  if (candidates.length === 0) {
    return DetectionResult.unknown();
  }
  return DetectionResult.of(candidates[0], 0.6, code(candidates[0]));
}

/**
 * Run the configured ML model for language detection.
 */
function runModel(modelType, whatlang, ensemble, text) {
  switch (modelType) {
    case ModelType.Whatlang:
      return whatlang.detect(text);
    case ModelType.Cld2:
      // CLD2 is not bundled; use the lightweight built-in provider.
      return whatlang.detect(text);
    case ModelType.Cld3:
    case ModelType.Lingua:
      throw DetectorError.invalidConfig("Lingua provider requires the 'lingua' feature");
    case ModelType.FastText:
      throw DetectorError.invalidConfig("fastText provider requires the 'fasttext' feature");
    case ModelType.Ensemble:
      return ensemble.detect(text);
    case ModelType.ScriptOnly:
      return detectScriptOnly(text);
    default:
      return whatlang.detect(text);
  }
}

module.exports = { runModel, detectScriptOnly };
