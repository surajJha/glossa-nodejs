#!/usr/bin/env node
'use strict';

/**
 * glossa CLI — quick language detection from the command line.
 *
 * Usage:
 *   glossa "नमस्ते दुनिया"          Detect language, print code
 *   glossa -c "Hello world"         Include confidence
 *   glossa -f json "வணக்கம்"        JSON output
 *   glossa -m ensemble "text"       Use a specific model
 *   echo "line1" | glossa -l        Batch: one detection per input line
 */

const {
  LanguageDetector,
  DetectorConfig,
  modelFromString,
  code,
} = require('../src/index');

function printUsage() {
  process.stdout.write(
    [
      'glossa — Indian language detection',
      '',
      'Usage: glossa [options] [text]',
      '',
      'Options:',
      '  -c, --confidence     Include confidence score',
      '  -f, --format <fmt>   Output format: text (default) | json',
      '  -m, --model <model>  Model: whatlang | ensemble | script_only | cld2',
      '  -l, --lines          Read stdin, detect one language per line',
      '  -h, --help           Show this help',
      '',
    ].join('\n')
  );
}

function parseArgs(argv) {
  const opts = { confidence: false, format: 'text', model: null, lines: false, text: null };
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    switch (a) {
      case '-c':
      case '--confidence':
        opts.confidence = true;
        break;
      case '-f':
      case '--format':
        opts.format = argv[++i];
        break;
      case '-m':
      case '--model':
        opts.model = argv[++i];
        break;
      case '-l':
      case '--lines':
        opts.lines = true;
        break;
      case '-h':
      case '--help':
        opts.help = true;
        break;
      default:
        opts.text = opts.text === null ? a : `${opts.text} ${a}`;
    }
  }
  return opts;
}

function buildDetector(opts) {
  const builder = DetectorConfig.builder();
  if (opts.model) {
    const m = modelFromString(opts.model);
    if (m === null) {
      process.stderr.write(`Unknown model: ${opts.model}\n`);
      process.exit(2);
    }
    builder.model(m);
  }
  return new LanguageDetector(builder.build());
}

function formatResult(detector, text, opts) {
  const result = detector.detectWithConfidence(text);
  const langCode = result === null ? 'unknown' : code(result[0]);
  const confidence = result === null ? 0.0 : result[1];
  if (opts.format === 'json') {
    const obj = opts.confidence
      ? { text, language: langCode, confidence }
      : { text, language: langCode };
    return JSON.stringify(obj);
  }
  return opts.confidence ? `${langCode}\t${confidence.toFixed(4)}` : langCode;
}

function runLines(detector, opts) {
  let buffer = '';
  process.stdin.setEncoding('utf8');
  process.stdin.on('data', (chunk) => {
    buffer += chunk;
    let idx;
    while ((idx = buffer.indexOf('\n')) !== -1) {
      const line = buffer.slice(0, idx).replace(/\r$/, '');
      buffer = buffer.slice(idx + 1);
      if (line.length > 0) {
        process.stdout.write(`${formatResult(detector, line, opts)}\n`);
      }
    }
  });
  process.stdin.on('end', () => {
    const last = buffer.replace(/\r$/, '');
    if (last.trim().length > 0) {
      process.stdout.write(`${formatResult(detector, last, opts)}\n`);
    }
  });
}

function main() {
  const opts = parseArgs(process.argv.slice(2));
  if (opts.help) {
    printUsage();
    return;
  }
  const detector = buildDetector(opts);

  if (opts.lines) {
    runLines(detector, opts);
    return;
  }

  if (opts.text === null) {
    printUsage();
    process.exit(1);
  }

  process.stdout.write(`${formatResult(detector, opts.text, opts)}\n`);
}

main();
