'use strict';

/**
 * Hindi/Marathi language disambiguator.
 *
 * Strategy:
 *  1. Definitive character check: ळ (U+0933) is only used in Marathi.
 *  2. Grammar markers (आहे vs है, etc.).
 *  3. Verb suffix patterns.
 *  4. N-gram profiles.
 *  5. Multi-word phrase patterns.
 */

const { Language, code } = require('../../lang');
const { byteLen, charCount, isWhitespace, splitWhitespace } = require('../../chars');
const {
  MARATHI_TRIGRAMS,
  MARATHI_VERB_SUFFIXES,
  MARATHI_GRAMMAR,
  HINDI_TRIGRAMS,
  HINDI_GRAMMAR,
} = require('./data');

class NgramHiMrDisambiguator {
  static new() {
    return new NgramHiMrDisambiguator();
  }

  languages() {
    return [Language.Hindi, Language.Marathi];
  }

  /** ळ (U+0933) is only used in Marathi. */
  hasMarathiLa(text) {
    return text.includes('ळ');
  }

  /** Extract code-point n-grams, filtering whitespace. */
  extractNgrams(text, n) {
    const chs = [];
    for (const c of text) {
      if (!isWhitespace(c)) chs.push(c);
    }
    if (chs.length < n) return [];
    const out = [];
    for (let i = 0; i + n <= chs.length; i += 1) {
      out.push(chs.slice(i, i + n).join(''));
    }
    return out;
  }

  /** N-gram similarity score against a frequency profile. */
  ngramScore(text, profile, n) {
    const ngrams = this.extractNgrams(text, n);
    if (ngrams.length === 0) return 0.0;

    let score = 0.0;
    let matched = 0;
    for (const ngram of ngrams) {
      const freq = profile.get(ngram);
      if (freq !== undefined) {
        score += freq;
        matched += 1;
      }
    }

    if (matched > 0) {
      return (score / ngrams.length) * Math.sqrt(matched / ngrams.length);
    }
    return 0.0;
  }

  /** Count grammar marker matches: returns [exact, partial]. */
  grammarScore(text, markers) {
    const words = splitWhitespace(text);
    let exact = 0;
    let partial = 0;
    for (const word of words) {
      if (markers.has(word)) exact += 1;
      for (const marker of markers) {
        if (byteLen(marker) >= 2 && word.includes(marker) && word !== marker) {
          partial += 1;
        }
      }
    }
    return [exact, partial];
  }

  /** Verb suffix analysis: returns [hindiScore, marathiScore]. */
  verbSuffixScore(text) {
    const words = splitWhitespace(text);
    let mrScore = 0.0;
    let hiScore = 0.0;

    for (const word of words) {
      if (charCount(word) < 2) continue;

      for (const [suffix, weight] of MARATHI_VERB_SUFFIXES) {
        if (word.endsWith(suffix)) {
          mrScore += weight;
          break;
        }
      }

      if (word.endsWith('रहा') || word.endsWith('रही') || word.endsWith('रहे')) {
        hiScore += 50.0;
      }
      if (word.endsWith('गा') || word.endsWith('गी') || word.endsWith('गे')) {
        hiScore += 30.0;
      }
    }

    return [hiScore, mrScore];
  }

  /** Distinctive multi-word patterns: returns [hindiScore, marathiScore]. */
  checkPatterns(text) {
    let hi = 0.0;
    let mr = 0.0;

    if (text.includes('कर रहा') || text.includes('कर रही') || text.includes('कर रहे')) hi += 50.0;
    if (text.includes('हो रहा') || text.includes('हो रही') || text.includes('हो रहे')) hi += 50.0;
    if (text.includes('क्या है') || text.includes('क्या हो') || text.includes('क्या कर')) hi += 40.0;
    if (text.includes('में है') || text.includes('में हैं')) hi += 30.0;
    if (text.includes('को है') || text.includes('से है')) hi += 30.0;
    if (text.includes('हो गया') || text.includes('हो गयी') || text.includes('हो गए')) hi += 40.0;
    if (text.includes('कर दो') || text.includes('कर लो') || text.includes('कर दिया')) hi += 40.0;

    if (text.includes('करत आहे') || text.includes('करत आहेत')) mr += 50.0;
    if (text.includes('झाला आहे') || text.includes('झाली आहे') || text.includes('झाले आहे')) mr += 50.0;
    if (text.includes('काय आहे') || text.includes('कसे आहे')) mr += 40.0;
    if (text.includes('मध्ये आहे')) mr += 30.0;
    if (text.includes('नाही का') || text.includes('का नाही')) mr += 30.0;
    if (text.includes('नको')) mr += 25.0;

    return [hi, mr];
  }

  /** Combine all features: returns [hindiScore, marathiScore]. */
  calculateScores(text) {
    let hiScore = 0.0;
    let mrScore = 0.0;

    if (this.hasMarathiLa(text)) {
      mrScore += 500.0;
    }

    const [mrExact, mrPartial] = this.grammarScore(text, MARATHI_GRAMMAR);
    const [hiExact, hiPartial] = this.grammarScore(text, HINDI_GRAMMAR);

    mrScore += mrExact * 30.0;
    hiScore += hiExact * 30.0;
    mrScore += mrPartial * 5.0;
    hiScore += hiPartial * 5.0;

    const [hiPattern, mrPattern] = this.checkPatterns(text);
    hiScore += hiPattern;
    mrScore += mrPattern;

    const [hiVerb, mrVerb] = this.verbSuffixScore(text);
    hiScore += hiVerb;
    mrScore += mrVerb;

    const mrTrigram = this.ngramScore(text, MARATHI_TRIGRAMS, 3);
    const hiTrigram = this.ngramScore(text, HINDI_TRIGRAMS, 3);
    mrScore += mrTrigram * 2.0;
    hiScore += hiTrigram * 2.0;

    return [hiScore, mrScore];
  }

  /**
   * Disambiguate between candidate languages.
   * @returns {[string, number]} [language, confidence]
   */
  disambiguate(text, candidates) {
    const hasHindi = candidates.includes(Language.Hindi);
    const hasMarathi = candidates.includes(Language.Marathi);

    if (!hasHindi && !hasMarathi) return [Language.Unknown, 0.0];
    if (hasHindi && !hasMarathi) return [Language.Hindi, 0.9];
    if (hasMarathi && !hasHindi) return [Language.Marathi, 0.9];

    if (this.hasMarathiLa(text)) return [Language.Marathi, 0.99];

    const [hiScore, mrScore] = this.calculateScores(text);
    const total = hiScore + mrScore;

    if (total < 0.001) {
      return [Language.Hindi, 0.5];
    }

    const hiRatio = hiScore / total;
    const mrRatio = mrScore / total;

    if (mrRatio > hiRatio) {
      return [Language.Marathi, Math.min(0.5 + mrRatio * 0.5, 0.99)];
    }
    return [Language.Hindi, Math.min(0.5 + hiRatio * 0.5, 0.99)];
  }
}

module.exports = { NgramHiMrDisambiguator, code };
