'use strict';

/** Golden parity regression test for language code and confidence outputs. */

const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const { LanguageDetector, DetectorConfig, code } = require('../src/index');

const fixturePath = path.join(__dirname, 'fixtures', 'golden_parity.tsv');
const rows = fs
  .readFileSync(fixturePath, 'utf8')
  .split('\n')
  .filter((l) => l.length > 0)
  .map((l) => l.split('\t'));

test(`matches golden reference on ${rows.length} cases`, () => {
  const detector = new LanguageDetector(DetectorConfig.default());
  let langMismatches = 0;
  let confMismatches = 0;
  const examples = [];

  for (const [textInput, expLang, expConf] of rows) {
    const result = detector.detectWithConfidence(textInput);
    const gotLang = result === null ? 'unknown' : code(result[0]);
    const gotConf = (result === null ? 0.0 : result[1]).toFixed(4);

    if (gotLang !== expLang) {
      langMismatches += 1;
      if (examples.length < 10) {
        examples.push(`LANG "${textInput}" exp=${expLang} got=${gotLang}`);
      }
    } else if (gotConf !== expConf) {
      confMismatches += 1;
      if (examples.length < 10) {
        examples.push(`CONF "${textInput}" ${expLang} exp=${expConf} got=${gotConf}`);
      }
    }
  }

  assert.strictEqual(
    langMismatches,
    0,
    `language mismatches: ${langMismatches}\n${examples.join('\n')}`
  );
  assert.strictEqual(
    confMismatches,
    0,
    `confidence mismatches: ${confMismatches}\n${examples.join('\n')}`
  );
});
