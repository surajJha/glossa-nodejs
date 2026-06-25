# Glossa

High-accuracy language detection for Indian languages, built for Node.js 20+.

Glossa is dependency-free, fast to start, and designed for production services, CLIs, data pipelines, and moderation workflows that need reliable Indian-language identification.

## Features

- Supports 14 languages: English, Hindi, Marathi, Bengali, Assamese, Tamil, Telugu, Gujarati, Kannada, Malayalam, Odia, Punjabi, Urdu, and Maithili.
- Same-script disambiguation for Hindi/Marathi and Bengali/Assamese.
- Handles mixed Latin + Indic text using script-aware routing.
- Zero runtime dependencies.
- CommonJS API with TypeScript declarations.
- CLI included.

## Installation

```bash
npm install glossa
```

## Quick start

```js
const { detectLanguage, detectLanguageWithConfidence } = require('glossa');

detectLanguage('नमस्ते आप कैसे हैं');
//=> 'hi'

detectLanguage('मी ठीक आहे तू कसा आहेस');
//=> 'mr'

detectLanguageWithConfidence('আমি বাড়ি থেকে এসেছি');
//=> { language: 'bn', confidence: 0.99 }
```

## Supported languages

| Code | Language | Script |
|---|---|---|
| `en` | English | Latin |
| `hi` | Hindi | Devanagari |
| `mr` | Marathi | Devanagari |
| `mai` | Maithili | Devanagari |
| `bn` | Bengali | Bengali |
| `as` | Assamese | Bengali |
| `ta` | Tamil | Tamil |
| `te` | Telugu | Telugu |
| `gu` | Gujarati | Gujarati |
| `kn` | Kannada | Kannada |
| `ml` | Malayalam | Malayalam |
| `or` | Odia | Odia |
| `pa` | Punjabi | Gurmukhi |
| `ur` | Urdu | Arabic |

## API

### `detectLanguage(text)`

Returns a language code, or `unknown` when detection fails.

```js
detectLanguage('வணக்கம் நீங்கள் எப்படி இருக்கிறீர்கள்');
//=> 'ta'
```

### `detectLanguageWithConfidence(text)`

Returns `{ language, confidence }`.

```js
detectLanguageWithConfidence('السلام علیکم آپ کیسے ہیں');
//=> { language: 'ur', confidence: 0.9 }
```

### `detectLanguageWithModel(text, model)`

Runs detection with a specific model type.

```js
const { detectLanguageWithModel, ModelType } = require('glossa');

detectLanguageWithModel('Hello world', ModelType.ScriptOnly);
//=> 'en'
```

Available model values:

- `ModelType.Whatlang` (default lightweight provider)
- `ModelType.Ensemble`
- `ModelType.ScriptOnly`
- `ModelType.Cld2`, `ModelType.Cld3`, `ModelType.Lingua`, `ModelType.FastText` (accepted for API compatibility; external model bundles are not included)

### `LanguageDetector`

Use `LanguageDetector` when you want a reusable detector with custom configuration.

```js
const { LanguageDetector, DetectorConfig, Language } = require('glossa');

const config = DetectorConfig.builder()
  .allowedLanguages([Language.Hindi, Language.Marathi])
  .minConfidence(0.6)
  .build();

const detector = new LanguageDetector(config);

detector.getSrcLanguage('मी ठीक आहे');
//=> 'mr'
```

## CLI

```bash
npx glossa "नमस्ते आप कैसे हैं"
# hi

npx glossa --confidence "Hello world"
# en    0.9000

echo "வணக்கம்
السلام علیکم" | npx glossa --lines
# ta
# ur

npx glossa --format json "আমি বাড়ি থেকে এসেছি"
# {"text":"আমি বাড়ি থেকে এসেছি","language":"bn"}
```

## Accuracy notes

Glossa is strongest for script-distinct Indian languages and includes deterministic disambiguation for the most common same-script pairs. Maithili shares Devanagari with Hindi and Marathi; without a larger external model, short Maithili text may be classified as Hindi or Marathi.

The test suite includes 1,161 multilingual cases and currently passes a 93%+ accuracy gate on the public test data.

## TypeScript

Type declarations are included:

```ts
import { detectLanguage, type LanguageCode } from 'glossa';

const lang: LanguageCode = detectLanguage('નમસ્તે તમે કેમ છો');
```

## Development

```bash
npm test
npm run lint
npm pack --dry-run
```

## License

MIT
