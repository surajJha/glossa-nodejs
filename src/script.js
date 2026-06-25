'use strict';

/** Script detection for Indian languages using Unicode ranges. */

const { Script, scriptCandidateLanguages } = require('./lang');
const { isWhitespace, isAsciiPunctuation, chars } = require('./chars');

/** A Unicode code-point range (inclusive). */
class UnicodeRange {
  constructor(start, end) {
    this.start = start;
    this.end = end;
  }

  contains(ch) {
    const cp = ch.codePointAt(0);
    return cp >= this.start && cp <= this.end;
  }
}

const r = (start, end) => new UnicodeRange(start, end);

// Iteration order matters: detection breaks on the first matching script.
const SCRIPT_RANGES = [
  [Script.Devanagari, [r(0x0900, 0x097f), r(0xa8e0, 0xa8ff)]],
  [Script.Bengali, [r(0x0980, 0x09ff)]],
  [Script.Tamil, [r(0x0b80, 0x0bff)]],
  [Script.Telugu, [r(0x0c00, 0x0c7f)]],
  [Script.Gujarati, [r(0x0a80, 0x0aff)]],
  [Script.Kannada, [r(0x0c80, 0x0cff)]],
  [Script.Malayalam, [r(0x0d00, 0x0d7f)]],
  [Script.Odia, [r(0x0b00, 0x0b7f)]],
  [Script.Gurmukhi, [r(0x0a00, 0x0a7f)]],
  [
    Script.Arabic,
    [r(0x0600, 0x06ff), r(0x0750, 0x077f), r(0xfb50, 0xfdff), r(0xfe70, 0xfeff)],
  ],
  [
    Script.Latin,
    [r(0x0041, 0x005a), r(0x0061, 0x007a), r(0x00c0, 0x00ff), r(0x0100, 0x017f)],
  ],
];

const SCRIPT_RANGE_MAP = new Map(SCRIPT_RANGES);

function rangesContain(ranges, ch) {
  for (const range of ranges) {
    if (range.contains(ch)) return true;
  }
  return false;
}

/** Count script occurrences in text (ignoring whitespace and ASCII punctuation). */
function countScripts(text) {
  const counts = new Map();
  for (const c of chars(text)) {
    if (isWhitespace(c) || isAsciiPunctuation(c)) continue;
    for (const [scriptName, ranges] of SCRIPT_RANGES) {
      if (rangesContain(ranges, c)) {
        counts.set(scriptName, (counts.get(scriptName) || 0) + 1);
        break;
      }
    }
  }
  return counts;
}

function dominantScript(counts) {
  let best = Script.Unknown;
  let bestCount = -1;
  for (const [scriptName, count] of counts) {
    if (count > bestCount) {
      bestCount = count;
      best = scriptName;
    }
  }
  return counts.size === 0 ? Script.Unknown : best;
}

/** Detect the dominant script in text. */
function detectScript(text) {
  return dominantScript(countScripts(text));
}

/** Detect dominant script along with per-script counts. */
function detectScriptWithCounts(text) {
  const counts = countScripts(text);
  return { script: dominantScript(counts), counts };
}

/** Get candidate languages based on the detected script. */
function getCandidateLanguages(text) {
  return scriptCandidateLanguages(detectScript(text));
}

/** Whether text contains any character of the given script. */
function containsScript(text, scriptName) {
  const ranges = SCRIPT_RANGE_MAP.get(scriptName);
  if (!ranges) return false;
  for (const c of chars(text)) {
    if (rangesContain(ranges, c)) return true;
  }
  return false;
}

/** Ratio of characters belonging to the given script (ignoring ws/punct). */
function scriptRatio(text, scriptName) {
  const ranges = SCRIPT_RANGE_MAP.get(scriptName);
  if (!ranges) return 0.0;

  let total = 0;
  let inScript = 0;
  for (const c of chars(text)) {
    if (isWhitespace(c) || isAsciiPunctuation(c)) continue;
    total += 1;
    if (rangesContain(ranges, c)) inScript += 1;
  }
  return total === 0 ? 0.0 : inScript / total;
}

module.exports = {
  UnicodeRange,
  detectScript,
  detectScriptWithCounts,
  getCandidateLanguages,
  containsScript,
  scriptRatio,
};
