'use strict';

/** Shared character and string helpers. */

/** UTF-8 byte length of a string. */
function byteLen(s) {
  return Buffer.byteLength(s, 'utf8');
}

/** UTF-8 byte length of a single code point. */
function charByteLen(ch) {
  return Buffer.byteLength(ch, 'utf8');
}

/**
 * Whether a code point is Unicode whitespace.
 */
const WHITESPACE = new Set([
  0x0009, 0x000a, 0x000b, 0x000c, 0x000d, 0x0020, 0x0085, 0x00a0, 0x1680, 0x2000, 0x2001, 0x2002,
  0x2003, 0x2004, 0x2005, 0x2006, 0x2007, 0x2008, 0x2009, 0x200a, 0x2028, 0x2029, 0x202f, 0x205f,
  0x3000,
]);

function isWhitespace(ch) {
  const cp = ch.codePointAt(0);
  return WHITESPACE.has(cp);
}

/** Whether a code point is ASCII punctuation. */
function isAsciiPunctuation(ch) {
  const cp = ch.codePointAt(0);
  return (
    (cp >= 0x21 && cp <= 0x2f) ||
    (cp >= 0x3a && cp <= 0x40) ||
    (cp >= 0x5b && cp <= 0x60) ||
    (cp >= 0x7b && cp <= 0x7e)
  );
}

/** Whether a code point is ASCII uppercase A-Z. */
function isAsciiUppercase(ch) {
  const cp = ch.codePointAt(0);
  return cp >= 0x41 && cp <= 0x5a;
}

/** Iterate code points of a string. */
function chars(s) {
  return Array.from(s);
}

/** Number of code points. */
function charCount(s) {
  let n = 0;
  // eslint-disable-next-line no-unused-vars
  for (const _ of s) n += 1;
  return n;
}

/** Split on runs of Unicode whitespace, dropping empty segments. */
function splitWhitespace(s) {
  const out = [];
  let current = '';
  for (const c of s) {
    if (isWhitespace(c)) {
      if (current.length > 0) {
        out.push(current);
        current = '';
      }
    } else {
      current += c;
    }
  }
  if (current.length > 0) out.push(current);
  return out;
}

let _segmenter = null;
function getSegmenter() {
  if (_segmenter === null) {
    _segmenter = new Intl.Segmenter(undefined, { granularity: 'grapheme' });
  }
  return _segmenter;
}

/** Split into grapheme clusters (mirrors unicode-segmentation `graphemes(true)`). */
function graphemes(s) {
  if (s.length === 0) return [];
  const out = [];
  for (const seg of getSegmenter().segment(s)) {
    out.push(seg.segment);
  }
  return out;
}

module.exports = {
  byteLen,
  charByteLen,
  isWhitespace,
  isAsciiPunctuation,
  isAsciiUppercase,
  chars,
  charCount,
  splitWhitespace,
  graphemes,
};
