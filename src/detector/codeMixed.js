'use strict';

/** Code-mixed text handling. */

const { Script } = require('../lang');

const INDIC_SCRIPTS = [
  Script.Devanagari,
  Script.Bengali,
  Script.Tamil,
  Script.Telugu,
  Script.Gujarati,
  Script.Kannada,
  Script.Malayalam,
  Script.Odia,
  Script.Gurmukhi,
  Script.Arabic,
];

/**
 * Resolve code-mixed script detection.
 *
 * If the dominant script is Latin but there is significant Indic content,
 * prioritise the Indic script (important for Indian-language detection).
 *
 * @param {Map<string, number>} counts per-script counts
 * @param {string} dominant the dominant script
 * @returns {string} effective script
 */
function resolveCodeMixedScript(counts, dominant) {
  if (dominant !== Script.Latin) {
    return dominant;
  }

  const latinCount = counts.get(Script.Latin) || 0;

  let bestScript = null;
  let bestCount = 0;
  for (const script of INDIC_SCRIPTS) {
    const count = counts.get(script);
    if (count && count > 0) {
      if (bestScript === null || count > bestCount) {
        bestScript = script;
        bestCount = count;
      }
    }
  }

  if (bestScript !== null) {
    const threshold = Math.max(Math.floor(latinCount / 5), 3);
    if (bestCount >= threshold) {
      return bestScript;
    }
  }

  return dominant;
}

module.exports = { resolveCodeMixedScript };
