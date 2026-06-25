'use strict';

/**
 * Lightweight language model provider.
 *
 * The detection pipeline reaches this stage after script filtering and
 * deterministic disambiguation, so script evidence is enough for a fast,
 * dependency-free fallback.
 */

const { Language } = require('../lang');
const { DetectorError } = require('../error');
const { DetectionResult } = require('./index');
const { detectScript, scriptRatio } = require('../script');
const { scriptCandidateLanguages } = require('../lang');

const WHATLANG_CODES = {
  [Language.English]: 'eng',
  [Language.Hindi]: 'hin',
  [Language.Marathi]: 'mar',
  [Language.Bengali]: 'ben',
  [Language.Tamil]: 'tam',
  [Language.Telugu]: 'tel',
  [Language.Gujarati]: 'guj',
  [Language.Kannada]: 'kan',
  [Language.Malayalam]: 'mal',
  [Language.Odia]: 'ori',
  [Language.Punjabi]: 'pan',
  [Language.Urdu]: 'urd',
};

class WhatlangProvider {
  static new() {
    return new WhatlangProvider();
  }

  name() {
    return 'whatlang';
  }

  static getWhatlangCode(lang) {
    return WHATLANG_CODES[lang] || null;
  }

  detect(text) {
    if (text.trim().length === 0) {
      throw DetectorError.emptyInput();
    }

    const script = detectScript(text);
    const candidates = scriptCandidateLanguages(script);
    if (candidates.length === 0) {
      return DetectionResult.unknown();
    }

    const language = candidates[0];
    const ratio = scriptRatio(text, script);
    const confidence = Math.min(0.99, 0.5 + 0.5 * ratio);
    const rawCode = WhatlangProvider.getWhatlangCode(language) || language.toLowerCase();

    return DetectionResult.of(language, confidence, rawCode);
  }

  detectTopN(text) {
    return [this.detect(text)];
  }

  supportsLanguage(lang) {
    return WhatlangProvider.getWhatlangCode(lang) !== null;
  }
}

module.exports = { WhatlangProvider };
