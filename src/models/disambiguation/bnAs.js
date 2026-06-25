'use strict';

/**
 * Bengali/Assamese language disambiguator.
 *
 * Strategy:
 *  1. Definitive character check: ৰ (U+09F0) and ৱ (U+09F1) only appear in Assamese.
 *  2. Apostrophe verb forms (ক'ব, হ'ব).
 *  3. Assamese suffix patterns.
 *  4. Grammar markers.
 *  5. Word-level distinguishing patterns.
 */

const { Language, code } = require('../../lang');
const { byteLen, charCount, splitWhitespace } = require('../../chars');
const { ASSAMESE_GRAMMAR, BENGALI_GRAMMAR } = require('./data');

const APOSTROPHES = ["\u0027", "\u02BC"];

class NgramBnAsDisambiguator {
  static new() {
    return new NgramBnAsDisambiguator();
  }

  languages() {
    return [Language.Bengali, Language.Assamese];
  }

  /** ৰ (U+09F0) and ৱ (U+09F1) only appear in Assamese. */
  hasAssameseChars(text) {
    return text.includes('ৰ') || text.includes('ৱ');
  }

  /** Apostrophe verb forms are distinctive to Assamese. */
  hasAssameseApostrophe(text) {
    return APOSTROPHES.some((a) => text.includes(a));
  }

  /** Distinctive Assamese suffix patterns. */
  checkAssameseSuffixes(text) {
    const words = splitWhitespace(text);
    let score = 0.0;

    for (const word of words) {
      const len = charCount(word);
      if (len < 2) continue;

      if (
        word.endsWith('ত') &&
        !word.endsWith('তে') &&
        !word.endsWith('তা') &&
        len > 3
      ) {
        score += 8.0;
      }

      if (word.endsWith('খন') && len > 3) score += 40.0;
      if (word.endsWith('টো') && len > 3) score += 30.0;
      if (word.endsWith('জন') && len > 3) score += 15.0;
      if (word.endsWith('লৈ')) score += 35.0;
    }

    return score;
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

  /** Combine all features: returns [bengaliScore, assameseScore]. */
  calculateScores(text) {
    let bnScore = 0.0;
    let asScore = 0.0;

    if (this.hasAssameseChars(text)) asScore += 500.0;
    if (this.hasAssameseApostrophe(text)) asScore += 100.0;
    asScore += this.checkAssameseSuffixes(text);

    if (text.includes('মই')) asScore += 100.0;
    if (text.includes('আমি') && !text.includes('মই')) bnScore += 50.0;

    const [asExact, asPartial] = this.grammarScore(text, ASSAMESE_GRAMMAR);
    const [bnExact, bnPartial] = this.grammarScore(text, BENGALI_GRAMMAR);

    asScore += asExact * 30.0;
    bnScore += bnExact * 30.0;
    asScore += asPartial * 5.0;
    bnScore += bnPartial * 5.0;

    if (text.includes('নেই')) bnScore += 50.0;
    if (text.includes('নাই')) asScore += 50.0;
    if (text.includes('থেকে')) bnScore += 40.0;
    if (text.includes('এবং')) bnScore += 30.0;
    if (text.includes('আৰু')) asScore += 40.0;
    if (text.includes('লৈ')) asScore += 40.0;

    const words = splitWhitespace(text);
    for (const word of words) {
      if (word === 'লাগে' || word === 'লাগিছে' || word === 'লাগিসে') asScore += 30.0;
      if (word === 'জদি') asScore += 50.0;
      if (word === 'যদি') bnScore += 30.0;
      if (word === 'আজি') asScore += 40.0;
      if (word === 'আজ') bnScore += 25.0;
      if (word === 'কিবা') asScore += 40.0;
      if (word === 'কিছু') bnScore += 25.0;
      if (word === 'সদায়') asScore += 35.0;
      if (word === 'খাম' || word === 'খালো') asScore += 30.0;
      if (word === 'আহা' || word === 'আহে') asScore += 30.0;
      if (word === 'উলাইছে' || word === 'উলাই') asScore += 40.0;
      if (word === 'রাতিপুয়া') asScore += 40.0;
      if (word.endsWith('কালত') || word === 'শিতকালত') asScore += 35.0;

      if (word.endsWith('ছেন') || word.endsWith('ছিল') || word.endsWith('ছিলেন')) bnScore += 25.0;
      if (word.includes('চ্ছ') || word.endsWith('ছে')) bnScore += 20.0;
      if (word.endsWith('েছে') || word.endsWith('েছি') || word.endsWith('েছ')) bnScore += 20.0;
      if (word.endsWith('বে') || word.endsWith('বো') || word.endsWith('বেন')) bnScore += 15.0;
      if (word.endsWith('তে') && charCount(word) > 2) bnScore += 20.0;
      if (word.endsWith('টা') || word.endsWith('টি')) bnScore += 15.0;
      if (word.endsWith('ের') || (word.endsWith('র') && charCount(word) > 2)) bnScore += 10.0;
      if (word.endsWith('ুন')) bnScore += 20.0;
      if (word.endsWith('িস') || word.endsWith('বি') || word === 'দিবি') bnScore += 30.0;
      if (word.endsWith('ান') && charCount(word) > 3) bnScore += 10.0;
      if (word === 'করসি' || word === 'করছিস') bnScore += 30.0;
    }

    if (text.includes('লাগছে')) bnScore += 25.0;
    if (text.includes('আছেন') || text.includes('আছি')) bnScore += 20.0;
    if (text.includes('ভালো')) bnScore += 20.0;
    if (text.includes('এখন')) bnScore += 15.0;
    if (text.includes('উচিত')) bnScore += 15.0;
    if (text.includes('ভারতের') || text.includes('বাংলার')) bnScore += 25.0;
    if (text.includes('অসম') || text.includes('অসমীয়া')) asScore += 50.0;
    if (text.includes('তাহলে')) bnScore += 30.0;
    if (text.includes('কোথায়')) bnScore += 30.0;

    return [bnScore, asScore];
  }

  /**
   * Disambiguate between candidate languages.
   * @returns {[string, number]} [language, confidence]
   */
  disambiguate(text, candidates) {
    const hasBengali = candidates.includes(Language.Bengali);
    const hasAssamese = candidates.includes(Language.Assamese);

    if (!hasBengali && !hasAssamese) return [Language.Unknown, 0.0];
    if (hasBengali && !hasAssamese) return [Language.Bengali, 0.9];
    if (hasAssamese && !hasBengali) return [Language.Assamese, 0.9];

    if (this.hasAssameseChars(text)) return [Language.Assamese, 0.99];

    const [bnScore, asScore] = this.calculateScores(text);
    const total = bnScore + asScore;

    if (total < 0.001) {
      return [Language.Bengali, 0.5];
    }

    const bnRatio = bnScore / total;
    const asRatio = asScore / total;

    if (asRatio > bnRatio) {
      return [Language.Assamese, Math.min(0.5 + asRatio * 0.5, 0.99)];
    }
    return [Language.Bengali, Math.min(0.5 + bnRatio * 0.5, 0.99)];
  }
}

module.exports = { NgramBnAsDisambiguator, code };
