'use strict';

/** Ensemble model that combines multiple detectors with voting. */

const { Language, code } = require('../lang');
const { DetectionResult } = require('./index');
const { WhatlangProvider } = require('./whatlangProvider');

/** Ensemble detection strategies. */
const EnsembleStrategy = Object.freeze({
  MajorityVoting: 'MajorityVoting',
  WeightedVoting: 'WeightedVoting',
  MaxConfidence: 'MaxConfidence',
  AverageConfidence: 'AverageConfidence',
});

/** Default model weights. */
function defaultWeights() {
  return { whatlang: 1.0, cld2: 1.2, lingua: 1.3, fasttext: 1.5 };
}

class EnsembleProvider {
  constructor(strategy = EnsembleStrategy.WeightedVoting) {
    this.whatlang = WhatlangProvider.new();
    this.strategy = strategy;
    this.weights = defaultWeights();
  }

  static new() {
    return new EnsembleProvider();
  }

  static withStrategy(strategy) {
    return new EnsembleProvider(strategy);
  }

  withWeights(weights) {
    this.weights = Object.assign(defaultWeights(), weights);
    return this;
  }

  name() {
    return 'ensemble';
  }

  combineResults(results) {
    if (results.length === 0) return DetectionResult.unknown();
    switch (this.strategy) {
      case EnsembleStrategy.MajorityVoting:
        return this._majorityVote(results);
      case EnsembleStrategy.WeightedVoting:
        return this._weightedVote(results);
      case EnsembleStrategy.MaxConfidence:
        return this._maxConfidence(results);
      case EnsembleStrategy.AverageConfidence:
        return this._averageConfidence(results);
      default:
        return this._weightedVote(results);
    }
  }

  _majorityVote(results) {
    const votes = new Map();
    let best = null;
    let bestCount = 0;
    for (const [result] of results) {
      const count = (votes.get(result.language) || 0) + 1;
      votes.set(result.language, count);
      if (count > bestCount) {
        bestCount = count;
        best = result;
      }
    }
    return best || DetectionResult.unknown();
  }

  _weightedVote(results) {
    const scores = new Map();
    for (const [result, weight] of results) {
      const score = result.confidence * weight;
      scores.set(result.language, (scores.get(result.language) || 0) + score);
    }

    let bestLang = Language.Unknown;
    let bestScore = 0.0;
    let first = true;
    for (const [lang, score] of scores) {
      if (first || score > bestScore) {
        bestScore = score;
        bestLang = lang;
        first = false;
      }
    }

    const totalWeight = results.reduce((acc, [, w]) => acc + w, 0);
    const confidence = totalWeight > 0 ? Math.min(bestScore / totalWeight, 1.0) : 0.0;
    return DetectionResult.of(bestLang, confidence, code(bestLang));
  }

  _maxConfidence(results) {
    let best = null;
    for (const [result] of results) {
      if (best === null || result.confidence > best.confidence) {
        best = result;
      }
    }
    return best || DetectionResult.unknown();
  }

  _averageConfidence(results) {
    const byLang = new Map();
    for (const [result] of results) {
      if (!byLang.has(result.language)) byLang.set(result.language, []);
      byLang.get(result.language).push(result.confidence);
    }

    let bestLang = Language.Unknown;
    let bestAvg = 0.0;
    let first = true;
    for (const [lang, confs] of byLang) {
      const avg = confs.reduce((a, b) => a + b, 0) / confs.length;
      if (first || avg > bestAvg) {
        bestAvg = avg;
        bestLang = lang;
        first = false;
      }
    }
    return DetectionResult.of(bestLang, bestAvg, code(bestLang));
  }

  detect(text) {
    const results = [];
    try {
      const result = this.whatlang.detect(text);
      results.push([result, this.weights.whatlang]);
    } catch (_e) {
      // Ignore failed providers so the ensemble can continue voting.
    }

    if (results.length === 0) return DetectionResult.unknown();
    return this.combineResults(results);
  }

  detectTopN(text, n) {
    const all = [];
    try {
      all.push(this.whatlang.detect(text));
    } catch (_e) {
      // ignore
    }
    all.sort((a, b) => b.confidence - a.confidence);
    return all.slice(0, n);
  }

  supportsLanguage(lang) {
    return this.whatlang.supportsLanguage(lang);
  }
}

module.exports = { EnsembleProvider, EnsembleStrategy };
