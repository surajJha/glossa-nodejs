'use strict';

const test = require('node:test');
const assert = require('node:assert');
const {
  detectScript,
  detectScriptWithCounts,
  getCandidateLanguages,
  containsScript,
  scriptRatio,
} = require('../src/script');
const { Language, Script } = require('../src/lang');

test('detect each script', () => {
  assert.strictEqual(detectScript('नमस्ते दुनिया'), Script.Devanagari);
  assert.strictEqual(detectScript('নমস্কার বিশ্ব'), Script.Bengali);
  assert.strictEqual(detectScript('வணக்கம் உலகம்'), Script.Tamil);
  assert.strictEqual(detectScript('నమస్కారం ప్రపంచం'), Script.Telugu);
  assert.strictEqual(detectScript('નમસ્તે વિશ્વ'), Script.Gujarati);
  assert.strictEqual(detectScript('ನಮಸ್ಕಾರ ಪ್ರಪಂಚ'), Script.Kannada);
  assert.strictEqual(detectScript('നമസ്കാരം ലോകം'), Script.Malayalam);
  assert.strictEqual(detectScript('ନମସ୍କାର ବିଶ୍ୱ'), Script.Odia);
  assert.strictEqual(detectScript('ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ'), Script.Gurmukhi);
  assert.strictEqual(detectScript('السلام علیکم'), Script.Arabic);
  assert.strictEqual(detectScript('Hello World'), Script.Latin);
});

test('empty / punctuation / whitespace -> Unknown', () => {
  assert.strictEqual(detectScript(''), Script.Unknown);
  assert.strictEqual(detectScript('!@#$%'), Script.Unknown);
  assert.strictEqual(detectScript('   \t\n'), Script.Unknown);
});

test('candidate languages', () => {
  const c = getCandidateLanguages('नमस्ते');
  assert.ok(c.includes(Language.Hindi));
  assert.ok(c.includes(Language.Marathi));
  assert.ok(c.includes(Language.Maithili));
  assert.deepStrictEqual(getCandidateLanguages('Hello'), [Language.English]);
});

test('script ratio', () => {
  assert.strictEqual(scriptRatio('नमस्ते दुनिया', Script.Devanagari), 1.0);
  assert.strictEqual(scriptRatio('Hello World', Script.Devanagari), 0.0);
  assert.strictEqual(scriptRatio('', Script.Devanagari), 0.0);
  const mixed = scriptRatio('Hello नमस्ते', Script.Devanagari);
  assert.ok(mixed > 0.0 && mixed < 1.0);
});

test('contains script', () => {
  assert.ok(containsScript('नमस्ते', Script.Devanagari));
  assert.ok(containsScript('Hello नमस्ते', Script.Devanagari));
  assert.ok(!containsScript('Hello', Script.Devanagari));
});

test('detect script with counts', () => {
  const { script, counts } = detectScriptWithCounts('नमस्ते दुनिया');
  assert.strictEqual(script, Script.Devanagari);
  assert.ok(counts.get(Script.Devanagari) > 0);
});

test('code-mixed dominant by count', () => {
  // Devanagari char count (12) exceeds Latin (10) -> Devanagari dominant
  assert.strictEqual(detectScript('Hello नमस्ते World नमस्ते'), Script.Devanagari);
});
