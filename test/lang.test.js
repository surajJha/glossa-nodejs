'use strict';

const test = require('node:test');
const assert = require('node:assert');
const lang = require('../src/lang');
const { Language, Script } = lang;

test('language codes', () => {
  assert.strictEqual(lang.code(Language.English), 'en');
  assert.strictEqual(lang.code(Language.Hindi), 'hi');
  assert.strictEqual(lang.code(Language.Marathi), 'mr');
  assert.strictEqual(lang.code(Language.Bengali), 'bn');
  assert.strictEqual(lang.code(Language.Assamese), 'as');
  assert.strictEqual(lang.code(Language.Odia), 'or');
  assert.strictEqual(lang.code(Language.Maithili), 'mai');
  assert.strictEqual(lang.code(Language.Unknown), 'unknown');
});

test('from code (case-insensitive, aliases)', () => {
  assert.strictEqual(lang.fromCode('en'), Language.English);
  assert.strictEqual(lang.fromCode('HI'), Language.Hindi);
  assert.strictEqual(lang.fromCode('Hi'), Language.Hindi);
  assert.strictEqual(lang.fromCode('ory'), Language.Odia);
  assert.strictEqual(lang.fromCode('or'), Language.Odia);
  assert.strictEqual(lang.fromCode('invalid'), null);
  assert.strictEqual(lang.fromCode(''), null);
});

test('script mapping', () => {
  assert.strictEqual(lang.script(Language.English), Script.Latin);
  assert.strictEqual(lang.script(Language.Hindi), Script.Devanagari);
  assert.strictEqual(lang.script(Language.Maithili), Script.Devanagari);
  assert.strictEqual(lang.script(Language.Assamese), Script.Bengali);
  assert.strictEqual(lang.script(Language.Punjabi), Script.Gurmukhi);
  assert.strictEqual(lang.script(Language.Urdu), Script.Arabic);
});

test('all languages count', () => {
  assert.strictEqual(lang.all().length, 14);
});

test('same script languages', () => {
  assert.deepStrictEqual(
    lang.sameScriptLanguages(Language.Hindi),
    [Language.Hindi, Language.Marathi, Language.Maithili]
  );
  assert.deepStrictEqual(
    lang.sameScriptLanguages(Language.Bengali),
    [Language.Bengali, Language.Assamese]
  );
  assert.deepStrictEqual(lang.sameScriptLanguages(Language.English), []);
});

test('needs disambiguation', () => {
  assert.ok(lang.needsDisambiguation(Language.Hindi));
  assert.ok(lang.needsDisambiguation(Language.Assamese));
  assert.ok(!lang.needsDisambiguation(Language.English));
  assert.ok(!lang.needsDisambiguation(Language.Tamil));
});

test('script unicode names', () => {
  assert.strictEqual(lang.scriptUnicodeName(Script.Odia), 'Oriya');
  assert.strictEqual(lang.scriptUnicodeName(Script.Devanagari), 'Devanagari');
});

test('script candidate languages', () => {
  assert.deepStrictEqual(lang.scriptCandidateLanguages(Script.Latin), [Language.English]);
  assert.deepStrictEqual(
    lang.scriptCandidateLanguages(Script.Devanagari),
    [Language.Hindi, Language.Marathi, Language.Maithili]
  );
  assert.deepStrictEqual(lang.scriptCandidateLanguages(Script.Unknown), []);
});
