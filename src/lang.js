'use strict';

/** Language definitions and mappings for Indian languages. */

/**
 * Supported languages. Values are stable string identifiers used internally.
 * @enum {string}
 */
const Language = Object.freeze({
  English: 'English',
  Hindi: 'Hindi',
  Marathi: 'Marathi',
  Bengali: 'Bengali',
  Assamese: 'Assamese',
  Tamil: 'Tamil',
  Telugu: 'Telugu',
  Gujarati: 'Gujarati',
  Kannada: 'Kannada',
  Malayalam: 'Malayalam',
  Odia: 'Odia',
  Punjabi: 'Punjabi',
  Urdu: 'Urdu',
  Maithili: 'Maithili',
  Unknown: 'Unknown',
});

/**
 * Scripts used by Indian languages.
 * @enum {string}
 */
const Script = Object.freeze({
  Latin: 'Latin',
  Devanagari: 'Devanagari',
  Bengali: 'Bengali',
  Tamil: 'Tamil',
  Telugu: 'Telugu',
  Gujarati: 'Gujarati',
  Kannada: 'Kannada',
  Malayalam: 'Malayalam',
  Odia: 'Odia',
  Gurmukhi: 'Gurmukhi',
  Arabic: 'Arabic',
  Unknown: 'Unknown',
});

const LANGUAGE_CODES = {
  [Language.English]: 'en',
  [Language.Hindi]: 'hi',
  [Language.Marathi]: 'mr',
  [Language.Bengali]: 'bn',
  [Language.Assamese]: 'as',
  [Language.Tamil]: 'ta',
  [Language.Telugu]: 'te',
  [Language.Gujarati]: 'gu',
  [Language.Kannada]: 'kn',
  [Language.Malayalam]: 'ml',
  [Language.Odia]: 'or',
  [Language.Punjabi]: 'pa',
  [Language.Urdu]: 'ur',
  [Language.Maithili]: 'mai',
  [Language.Unknown]: 'unknown',
};

const CODE_TO_LANGUAGE = {
  en: Language.English,
  hi: Language.Hindi,
  mr: Language.Marathi,
  bn: Language.Bengali,
  as: Language.Assamese,
  ta: Language.Tamil,
  te: Language.Telugu,
  gu: Language.Gujarati,
  kn: Language.Kannada,
  ml: Language.Malayalam,
  or: Language.Odia,
  ory: Language.Odia,
  pa: Language.Punjabi,
  ur: Language.Urdu,
  mai: Language.Maithili,
};

const LANGUAGE_SCRIPT = {
  [Language.English]: Script.Latin,
  [Language.Hindi]: Script.Devanagari,
  [Language.Marathi]: Script.Devanagari,
  [Language.Maithili]: Script.Devanagari,
  [Language.Bengali]: Script.Bengali,
  [Language.Assamese]: Script.Bengali,
  [Language.Tamil]: Script.Tamil,
  [Language.Telugu]: Script.Telugu,
  [Language.Gujarati]: Script.Gujarati,
  [Language.Kannada]: Script.Kannada,
  [Language.Malayalam]: Script.Malayalam,
  [Language.Odia]: Script.Odia,
  [Language.Punjabi]: Script.Gurmukhi,
  [Language.Urdu]: Script.Arabic,
  [Language.Unknown]: Script.Unknown,
};

const ALL_LANGUAGES = [
  Language.English,
  Language.Hindi,
  Language.Marathi,
  Language.Bengali,
  Language.Assamese,
  Language.Tamil,
  Language.Telugu,
  Language.Gujarati,
  Language.Kannada,
  Language.Malayalam,
  Language.Odia,
  Language.Punjabi,
  Language.Urdu,
  Language.Maithili,
];

const SCRIPT_UNICODE_NAME = {
  [Script.Latin]: 'Latin',
  [Script.Devanagari]: 'Devanagari',
  [Script.Bengali]: 'Bengali',
  [Script.Tamil]: 'Tamil',
  [Script.Telugu]: 'Telugu',
  [Script.Gujarati]: 'Gujarati',
  [Script.Kannada]: 'Kannada',
  [Script.Malayalam]: 'Malayalam',
  [Script.Odia]: 'Oriya',
  [Script.Gurmukhi]: 'Gurmukhi',
  [Script.Arabic]: 'Arabic',
  [Script.Unknown]: 'Unknown',
};

const SCRIPT_CANDIDATES = {
  [Script.Latin]: [Language.English],
  [Script.Devanagari]: [Language.Hindi, Language.Marathi, Language.Maithili],
  [Script.Bengali]: [Language.Bengali, Language.Assamese],
  [Script.Tamil]: [Language.Tamil],
  [Script.Telugu]: [Language.Telugu],
  [Script.Gujarati]: [Language.Gujarati],
  [Script.Kannada]: [Language.Kannada],
  [Script.Malayalam]: [Language.Malayalam],
  [Script.Odia]: [Language.Odia],
  [Script.Gurmukhi]: [Language.Punjabi],
  [Script.Arabic]: [Language.Urdu],
  [Script.Unknown]: [],
};

/** Get the ISO 639-1 code for a language. */
function code(lang) {
  return LANGUAGE_CODES[lang] || 'unknown';
}

/** Get a language from its ISO 639-1 code (case-insensitive). Returns null if unknown. */
function fromCode(c) {
  if (typeof c !== 'string') return null;
  const lang = CODE_TO_LANGUAGE[c.toLowerCase()];
  return lang === undefined ? null : lang;
}

/** Get the script used by a language. */
function script(lang) {
  return LANGUAGE_SCRIPT[lang] || Script.Unknown;
}

/** Get all supported languages (excludes Unknown). */
function all() {
  return ALL_LANGUAGES.slice();
}

/** Get languages that share the same script (disambiguation candidates). */
function sameScriptLanguages(lang) {
  switch (script(lang)) {
    case Script.Devanagari:
      return [Language.Hindi, Language.Marathi, Language.Maithili];
    case Script.Bengali:
      return [Language.Bengali, Language.Assamese];
    default:
      return [];
  }
}

/** Whether a language requires same-script disambiguation. */
function needsDisambiguation(lang) {
  return (
    lang === Language.Hindi ||
    lang === Language.Marathi ||
    lang === Language.Maithili ||
    lang === Language.Bengali ||
    lang === Language.Assamese
  );
}

/** Get the Unicode script name. */
function scriptUnicodeName(s) {
  return SCRIPT_UNICODE_NAME[s] || 'Unknown';
}

/** Get candidate languages for a script. */
function scriptCandidateLanguages(s) {
  const list = SCRIPT_CANDIDATES[s];
  return list ? list.slice() : [];
}

module.exports = {
  Language,
  Script,
  code,
  fromCode,
  script,
  all,
  sameScriptLanguages,
  needsDisambiguation,
  scriptUnicodeName,
  scriptCandidateLanguages,
};
