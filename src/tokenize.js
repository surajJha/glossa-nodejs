'use strict';

/** Tokenization utilities for language detection. */

const { isWhitespace, isAsciiUppercase, chars } = require('./chars');

const BOUNDARIES = new Set([
  ' ', ',', '.', '*', '_', '!', '@', '#', '$', '%', '+', '=', ':', '?', '>', '<',
  '{', '}', '[', ']', '\\', '|', '/', '&', ';', "'", '-', '"', '(', ')', '\n', '\r', '\t',
]);

/** Whether a character is a tokenization boundary. */
function isBoundary(c) {
  return BOUNDARIES.has(c) || isWhitespace(c);
}

/** Tokenize text into words, preserving punctuation as separate tokens. */
function tokenize(text) {
  const tokens = [];
  let current = '';

  for (const c of chars(text)) {
    if (isBoundary(c)) {
      if (current.length > 0) {
        tokens.push(current);
        current = '';
      }
      if (!isWhitespace(c)) {
        tokens.push(c);
      }
    } else {
      current += c;
    }
  }

  if (current.length > 0) {
    tokens.push(current);
  }

  return tokens;
}

/** Tokenize text, keeping only word tokens (no standalone punctuation). */
function tokenizeWordsOnly(text) {
  return tokenize(text).filter((t) => {
    const first = chars(t)[0] || ' ';
    // Keep multi-byte words and non-boundary single-character tokens.
    return Buffer.byteLength(t, 'utf8') > 1 || !BOUNDARIES.has(first);
  });
}

/** Whether all characters in a token are uppercase ASCII. */
function isAllCaps(token) {
  if (token.length === 0) return false;
  for (const c of chars(token)) {
    if (!isAsciiUppercase(c)) return false;
  }
  return true;
}

module.exports = {
  isBoundary,
  tokenize,
  tokenizeWordsOnly,
  isAllCaps,
};
