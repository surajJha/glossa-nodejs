'use strict';

const test = require('node:test');
const assert = require('node:assert');
const { normalize, removePunctuation, charNgrams, graphemeNgrams } = require('../src/normalize');
const { tokenize } = require('../src/tokenize');
const { NgramHiMrDisambiguator, NgramBnAsDisambiguator } = require('../src/models/disambiguation');
const { Language } = require('../src/lang');
const { LanguageDetector, DetectorConfig, ModelType, modelFromString } = require('../src/index');

test('normalize collapses whitespace', () => {
  assert.strictEqual(normalize('  hello   world  '), 'hello world');
  assert.strictEqual(normalize('hello\t\tworld\n\n'), 'hello world');
  assert.strictEqual(normalize(''), '');
  assert.strictEqual(normalize('   '), '');
});

test('remove punctuation (ascii + indic)', () => {
  assert.strictEqual(removePunctuation('hello, world!'), 'hello world');
  assert.strictEqual(removePunctuation('नमस्ते। दुनिया॥'), 'नमस्ते दुनिया');
});

test('char ngrams', () => {
  assert.deepStrictEqual(charNgrams('hello', 2), ['he', 'el', 'll', 'lo']);
  assert.deepStrictEqual(charNgrams('hi', 3), ['hi']);
});

test('grapheme ngrams over Devanagari', () => {
  const grams = graphemeNgrams('नमस्ते', 2);
  assert.ok(grams.length > 0);
  assert.ok(grams.every((g) => g.length > 0));
});

test('tokenize keeps punctuation as tokens', () => {
  assert.deepStrictEqual(tokenize('hello world'), ['hello', 'world']);
  assert.deepStrictEqual(tokenize('hello, world!'), ['hello', ',', 'world', '!']);
  assert.deepStrictEqual(tokenize(''), []);
});

test('hi/mr disambiguator: ळ is definitive Marathi', () => {
  const d = NgramHiMrDisambiguator.new();
  const [lang, conf] = d.disambiguate('काळ मोठी काळजी', [Language.Hindi, Language.Marathi]);
  assert.strictEqual(lang, Language.Marathi);
  assert.ok(conf > 0.95);
});

test('hi/mr disambiguator: हैं marks Hindi', () => {
  const d = NgramHiMrDisambiguator.new();
  const [lang] = d.disambiguate('मैं ठीक हूँ आप कैसे हैं', [Language.Hindi, Language.Marathi]);
  assert.strictEqual(lang, Language.Hindi);
});

test('bn/as disambiguator: ৰ is definitive Assamese', () => {
  const d = NgramBnAsDisambiguator.new();
  const [lang, conf] = d.disambiguate('মই ভাল আছো কৰিব পাৰো', [Language.Bengali, Language.Assamese]);
  assert.strictEqual(lang, Language.Assamese);
  assert.ok(conf > 0.95);
});

test('bn/as disambiguator: থেকে marks Bengali', () => {
  const d = NgramBnAsDisambiguator.new();
  const [lang] = d.disambiguate('আমি বাড়ি থেকে এসেছি', [Language.Bengali, Language.Assamese]);
  assert.strictEqual(lang, Language.Bengali);
});

test('config builder + getSrcLanguage', () => {
  const cfg = DetectorConfig.builder().model(ModelType.Ensemble).minConfidence(0.7).build();
  assert.strictEqual(cfg.model, ModelType.Ensemble);
  assert.strictEqual(cfg.minConfidence, 0.7);
  const detector = new LanguageDetector(cfg);
  assert.strictEqual(detector.getSrcLanguage('Hello world'), 'en');
  assert.strictEqual(detector.getSrcLanguage(''), 'unknown');
});

test('model parsing aliases', () => {
  assert.strictEqual(modelFromString('whatlang'), ModelType.Whatlang);
  assert.strictEqual(modelFromString('cld3'), ModelType.Lingua);
  assert.strictEqual(modelFromString('script-only'), ModelType.ScriptOnly);
  assert.strictEqual(modelFromString('script_only'), ModelType.ScriptOnly);
  assert.strictEqual(modelFromString('nope'), null);
});

test('allowed languages restriction', () => {
  const cfg = DetectorConfig.builder()
    .allowedLanguages([Language.Hindi, Language.Marathi])
    .build();
  assert.ok(cfg.isLanguageAllowed(Language.Hindi));
  assert.ok(!cfg.isLanguageAllowed(Language.English));
});
