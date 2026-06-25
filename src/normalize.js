'use strict';

/** Text normalization utilities for Indian languages. */

const { isWhitespace, isAsciiPunctuation, chars, graphemes } = require('./chars');

/** Trim leading/trailing Unicode whitespace. */
function trim(text) {
  const cs = chars(text);
  let start = 0;
  let end = cs.length;
  while (start < end && isWhitespace(cs[start])) start += 1;
  while (end > start && isWhitespace(cs[end - 1])) end -= 1;
  return cs.slice(start, end).join('');
}

/**
 * Normalize text for language detection: trims whitespace and collapses
 * runs of whitespace into a single space.
 */
function normalize(text) {
  const trimmed = trim(text);
  if (trimmed.length === 0) return '';

  let result = '';
  let prevWhitespace = false;
  for (const c of chars(trimmed)) {
    if (isWhitespace(c)) {
      if (!prevWhitespace) {
        result += ' ';
        prevWhitespace = true;
      }
    } else {
      result += c;
      prevWhitespace = false;
    }
  }
  return result;
}

/** Normalize Devanagari text (nukta combinations) for Hindi/Marathi comparison. */
function normalizeDevanagari(text) {
  let result = '';
  for (const c of chars(text)) {
    switch (c) {
      case '\u0929':
        result += '\u0928\u093C';
        break;
      case '\u0931':
        result += '\u0930\u093C';
        break;
      case '\u0934':
        result += '\u0933\u093C';
        break;
      default:
        result += c;
    }
  }
  return result;
}

/** Normalize Bengali text for Bengali/Assamese comparison. */
function normalizeBengali(text) {
  return normalize(text);
}

const INDIC_PUNCTUATION = new Set(['।', '॥', '॰', '৷', '؟', '،', '؛']);

function isIndicPunctuation(c) {
  return INDIC_PUNCTUATION.has(c);
}

/** Remove all ASCII and Indic punctuation from text. */
function removePunctuation(text) {
  let result = '';
  for (const c of chars(text)) {
    if (!isAsciiPunctuation(c) && !isIndicPunctuation(c)) {
      result += c;
    }
  }
  return result;
}

/** Character n-grams (code-point windows). */
function charNgrams(text, n) {
  const cs = chars(text);
  if (cs.length < n) {
    return [text];
  }
  const out = [];
  for (let i = 0; i + n <= cs.length; i += 1) {
    out.push(cs.slice(i, i + n).join(''));
  }
  return out;
}

/** Grapheme n-grams (better for Indic scripts). */
function graphemeNgrams(text, n) {
  const gs = graphemes(text);
  if (gs.length < n) {
    return [text];
  }
  const out = [];
  for (let i = 0; i + n <= gs.length; i += 1) {
    out.push(gs.slice(i, i + n).join(''));
  }
  return out;
}

module.exports = {
  normalize,
  normalizeDevanagari,
  normalizeBengali,
  removePunctuation,
  graphemes,
  charNgrams,
  graphemeNgrams,
};
