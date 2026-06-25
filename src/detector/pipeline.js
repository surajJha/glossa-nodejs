'use strict';

/**
 * Detection pipeline logic.
 *
 * Stages:
 *  1. Normalization
 *  2. Script detection (with counts) + code-mixed resolution
 *  3. Candidate filtering
 *  4. Same-script disambiguation (hi/mr, bn/as)
 *  5. ML model inference (fallback)
 */

const { Language, Script, scriptCandidateLanguages, code } = require('../lang');
const { DetectorError } = require('../error');
const { byteLen } = require('../chars');
const { DetectionResult } = require('../models/index');
const { normalize } = require('../normalize');
const { detectScriptWithCounts } = require('../script');
const { resolveCodeMixedScript } = require('./codeMixed');
const { runModel } = require('./modelRouting');

/**
 * Run the detection pipeline.
 *
 * @returns {DetectionResult}
 */
function runDetectionPipeline(config, rawText, hiMrDisambiguator, bnAsDisambiguator, whatlang, ensemble) {
  // Stage 1: normalize
  const text = normalize(rawText);
  if (text.length === 0) {
    throw DetectorError.emptyInput();
  }

  // Minimum length is measured in UTF-8 bytes.
  if (byteLen(text) < config.minTextLength) {
    throw DetectorError.textTooShort(config.minTextLength);
  }

  // Stage 2: script detection + code-mixed resolution
  const { script, counts } = detectScriptWithCounts(text);
  const effectiveScript = resolveCodeMixedScript(counts, script);

  // Stage 3: candidate languages
  let candidates = scriptCandidateLanguages(effectiveScript);
  if (config.allowedLanguages.length > 0) {
    candidates = candidates.filter((lang) => config.allowedLanguages.includes(lang));
  }

  // Fast path: single candidate (unique script)
  if (candidates.length === 1) {
    return DetectionResult.of(candidates[0], 0.9, code(candidates[0]));
  }

  // Stage 4: same-script disambiguation
  if (config.enableDisambiguation) {
    const needsHiMr = candidates.some(
      (l) => l === Language.Hindi || l === Language.Marathi
    );
    const needsBnAs = candidates.some(
      (l) => l === Language.Bengali || l === Language.Assamese
    );

    if (needsHiMr && effectiveScript === Script.Devanagari) {
      const hiMrCandidates = candidates.filter(
        (l) => l === Language.Hindi || l === Language.Marathi
      );
      if (hiMrCandidates.length > 0) {
        const [lang, confidence] = hiMrDisambiguator.disambiguate(text, hiMrCandidates);
        if (lang !== Language.Unknown) {
          return DetectionResult.of(lang, confidence, code(lang));
        }
      }
    }

    if (needsBnAs && effectiveScript === Script.Bengali) {
      const bnAsCandidates = candidates.filter(
        (l) => l === Language.Bengali || l === Language.Assamese
      );
      if (bnAsCandidates.length > 0) {
        const [lang, confidence] = bnAsDisambiguator.disambiguate(text, bnAsCandidates);
        if (lang !== Language.Unknown) {
          return DetectionResult.of(lang, confidence, code(lang));
        }
      }
    }
  }

  // Stage 5: ML model fallback
  return runModel(config.model, whatlang, ensemble, text);
}

module.exports = { runDetectionPipeline };
