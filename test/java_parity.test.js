'use strict';
const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const {
  detectLanguage,
  detectLanguageWithConfidence,
  Language,
  allLanguages,
} = require('../src/index');

test('supported languages contains core languages', () => {
  const supported = allLanguages();
  for (const l of ['English', 'Hindi', 'Marathi', 'Bengali', 'Tamil']) {
    assert.ok(supported.includes(l), `missing ${l}`);
  }
});

const codeCases = [
  ['Hello, how are you today?', 'en'],
  ['मैं ठीक हूँ आप कैसे हैं', 'hi'],
  ['मी ठीक आहे तू कसा आहेस', 'mr'],
  ['வணக்கம் நீங்கள் எப்படி இருக்கிறீர்கள்', 'ta'],
  ['Hello world how are you', 'en'],
  ['నమస్కారం మీరు ఎలా ఉన్నారు', 'te'],
  ['ನಮಸ್ಕಾರ ನೀವು ಹೇಗಿದ್ದೀರಿ', 'kn'],
  ['നമസ്കാരം നിങ്ങൾ എങ്ങനെയുണ്ട്', 'ml'],
  ['નમસ્તે તમે કેમ છો', 'gu'],
  ['ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ ਤੁਸੀਂ ਕਿਵੇਂ ਹੋ', 'pa'],
  ['ନମସ୍କାର ଆପଣ କେମିତି ଅଛନ୍ତି', 'or'],
  ['السلام علیکم آپ کیسے ہیں', 'ur'],
];
for (const [text, expected] of codeCases) {
  test(`detectLanguage -> ${expected}`, () => {
    assert.strictEqual(detectLanguage(text), expected);
  });
}

for (const input of ['', null, undefined, '   ', '\t', '\n']) {
  test(`empty/null/ws -> unknown (${JSON.stringify(input)})`, () => {
    assert.strictEqual(detectLanguage(input), 'unknown');
  });
}

test('detectWithConfidence English > 0.5', () => {
  const r = detectLanguageWithConfidence('Hello world');
  assert.strictEqual(r.language, 'en');
  assert.ok(r.confidence > 0.5);
});

test('detectWithConfidence empty -> unknown 0.0', () => {
  const r = detectLanguageWithConfidence('');
  assert.strictEqual(r.language, 'unknown');
  assert.strictEqual(r.confidence, 0.0);
});

test('detectWithConfidence null -> unknown', () => {
  const r = detectLanguageWithConfidence(null);
  assert.strictEqual(r.language, 'unknown');
});

test('accuracy >= 93% on public test data', () => {
  const file = path.join(__dirname, 'fixtures', 'public_test_data.tsv');
  const rows = fs
    .readFileSync(file, 'utf8')
    .split('\n')
    .filter(Boolean)
    .map((l) => l.split('\t'));
  let total = 0;
  let correct = 0;
  const per = {};
  for (const [text, expected] of rows) {
    const got = detectLanguage(text);
    total++;
    per[expected] = per[expected] || [0, 0];
    per[expected][1]++;
    if (got === expected) {
      correct++;
      per[expected][0]++;
    }
  }
  const accuracy = correct / total;
  // Maithili uses the same script as Hindi/Marathi and needs a larger model.
  assert.ok(
    accuracy >= 0.93,
    `accuracy ${(accuracy * 100).toFixed(2)}% < 93% (${correct}/${total})`
  );
});
