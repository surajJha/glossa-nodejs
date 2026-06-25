'use strict';

const test = require('node:test');
const assert = require('node:assert');
const {
  detectLanguage,
  detectLanguageWithConfidence,
  detectLanguageWithModel,
  ModelType,
} = require('../src/index');

test('detect English', () => {
  assert.strictEqual(detectLanguage('Hello, how are you?'), 'en');
});

test('detect Hindi', () => {
  assert.strictEqual(detectLanguage('नमस्ते आप कैसे हैं'), 'hi');
});

test('detect empty -> unknown', () => {
  assert.strictEqual(detectLanguage(''), 'unknown');
});

test('detect with confidence (English)', () => {
  const { language, confidence } = detectLanguageWithConfidence('Hello, how are you?');
  assert.strictEqual(language, 'en');
  assert.ok(confidence > 0.0 && confidence <= 1.0);
});

test('detect with confidence empty', () => {
  const { language, confidence } = detectLanguageWithConfidence('');
  assert.strictEqual(language, 'unknown');
  assert.strictEqual(confidence, 0.0);
});

test('detect with model whatlang', () => {
  assert.strictEqual(detectLanguageWithModel('Hello world', ModelType.Whatlang), 'en');
});

test('detect with model ensemble', () => {
  assert.strictEqual(detectLanguageWithModel('Hello world', ModelType.Ensemble), 'en');
});

test('detect with model script only (Devanagari)', () => {
  const lang = detectLanguageWithModel('नमस्ते', ModelType.ScriptOnly);
  assert.ok(['hi', 'mr', 'mai'].includes(lang));
});

test('detect multiple languages', () => {
  assert.strictEqual(detectLanguage('Hello'), 'en');
  assert.ok(['hi', 'mr', 'mai'].includes(detectLanguage('नमस्ते')));
  assert.strictEqual(detectLanguage('வணக்கம்'), 'ta');
  assert.ok(['bn', 'as'].includes(detectLanguage('নমস্কার')));
});

test('detect all unique scripts', () => {
  assert.strictEqual(detectLanguage('வணக்கம் உலகம்'), 'ta');
  assert.strictEqual(detectLanguage('నమస్కారం ప్రపంచం'), 'te');
  assert.strictEqual(detectLanguage('નમસ્તે વિશ્વ'), 'gu');
  assert.strictEqual(detectLanguage('ನಮಸ್ಕಾರ ಪ್ರಪಂಚ'), 'kn');
  assert.strictEqual(detectLanguage('നമസ്കാരം ലോകം'), 'ml');
  assert.strictEqual(detectLanguage('ନମସ୍କାର ବିଶ୍ୱ'), 'or');
  assert.strictEqual(detectLanguage('ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ'), 'pa');
  assert.strictEqual(detectLanguage('السلام علیکم آپ کیسے ہیں'), 'ur');
});

test('Marathi disambiguation', () => {
  assert.strictEqual(detectLanguage('मी आहे आणि तू आहेस'), 'mr');
});

test('Assamese disambiguation', () => {
  assert.strictEqual(detectLanguage('নমস্কাৰ মই ভালে আছো'), 'as');
});

test('Bengali disambiguation', () => {
  assert.strictEqual(detectLanguage('আমি বাড়ি থেকে এসেছি'), 'bn');
});
