# Glossa Node.js

High-accuracy language detection for Indian languages, built for Node.js 20+.

Glossa Node.js is dependency-free, fast to start, and suitable for production APIs, CLIs, data pipelines, search indexing, routing, moderation, analytics, and content-localization workflows.

## Highlights

- Detects 14 languages: English, Hindi, Marathi, Bengali, Assamese, Tamil, Telugu, Gujarati, Kannada, Malayalam, Odia, Punjabi, Urdu, and Maithili.
- Strong script detection for Indian scripts.
- Same-script disambiguation for Hindi/Marathi and Bengali/Assamese.
- Code-mixed input handling for Latin + Indic text.
- Zero runtime dependencies.
- CommonJS package with TypeScript declarations.
- CLI included.
- Node.js 20 and above.

## Installation

```bash
npm install glossa-nodejs
```

## Quick start

```js
const { detectLanguage, detectLanguageWithConfidence } = require('glossa-nodejs');

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
| `unknown` | Unknown / not enough signal | - |

## Examples

### Detect language code

```js
const { detectLanguage } = require('glossa-nodejs');

detectLanguage('Hello, how are you today?');
//=> 'en'

detectLanguage('வணக்கம் நீங்கள் எப்படி இருக்கிறீர்கள்');
//=> 'ta'

detectLanguage('السلام علیکم آپ کیسے ہیں');
//=> 'ur'
```

### Detect with confidence

```js
const { detectLanguageWithConfidence } = require('glossa-nodejs');

detectLanguageWithConfidence('નમસ્તે તમે કેમ છો');
//=> { language: 'gu', confidence: 0.9 }
```

Confidence is a value from `0` to `1`. Script-distinct languages usually return high confidence. Same-script pairs use additional grammar and n-gram signals.

### Batch detection

```js
const { detectLanguage } = require('glossa-nodejs');

const texts = [
  'Hello world',
  'नमस्ते दुनिया',
  'নমস্কাৰ মই ভালে আছো',
  'నమస్కారం మీరు ఎలా ఉన్నారు',
];

const results = texts.map((text) => ({
  text,
  language: detectLanguage(text),
}));

console.log(results);
```

### Handle unknown and short input

```js
const { detectLanguage, detectLanguageWithConfidence } = require('glossa-nodejs');

detectLanguage('');
//=> 'unknown'

detectLanguage('??');
//=> 'unknown'

detectLanguageWithConfidence(null);
//=> { language: 'unknown', confidence: 0 }
```

### Restrict allowed languages

```js
const {
  LanguageDetector,
  DetectorConfig,
  Language,
} = require('glossa-nodejs');

const config = DetectorConfig.builder()
  .allowedLanguages([Language.Hindi, Language.Marathi])
  .minConfidence(0.6)
  .build();

const detector = new LanguageDetector(config);

detector.getSrcLanguage('मी ठीक आहे');
//=> 'mr'
```

### Same-script disambiguation

```js
const { detectLanguage } = require('glossa-nodejs');

detectLanguage('मैं ठीक हूँ आप कैसे हैं');
//=> 'hi'

detectLanguage('मी ठीक आहे तू कसा आहेस');
//=> 'mr'

detectLanguage('আমি বাড়ি থেকে এসেছি');
//=> 'bn'

detectLanguage('নমস্কাৰ মই ভালে আছো');
//=> 'as'
```

### Code-mixed text

```js
const { detectLanguage } = require('glossa-nodejs');

detectLanguage('hello नमस्ते आप कैसे हैं');
//=> 'hi'
```

## Full language example set

```js
const { detectLanguage } = require('glossa-nodejs');

const examples = {
  en: 'The weather is beautiful today',
  hi: 'मैं ठीक हूँ आप कैसे हैं',
  mr: 'मी ठीक आहे तू कसा आहेस',
  bn: 'আমি বাড়ি থেকে এসেছি',
  as: 'নমস্কাৰ মই ভালে আছো',
  ta: 'வணக்கம் நீங்கள் எப்படி இருக்கிறீர்கள்',
  te: 'నమస్కారం మీరు ఎలా ఉన్నారు',
  gu: 'નમસ્તે તમે કેમ છો',
  kn: 'ನಮಸ್ಕಾರ ನೀವು ಹೇಗಿದ್ದೀರಿ',
  ml: 'നമസ്കാരം നിങ്ങൾ എങ്ങനെയുണ്ട്',
  or: 'ନମସ୍କାର ଆପଣ କେମିତି ଅଛନ୍ତି',
  pa: 'ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ ਤੁਸੀਂ ਕਿਵੇਂ ਹੋ',
  ur: 'السلام علیکم آپ کیسے ہیں',
};

for (const [expected, text] of Object.entries(examples)) {
  console.log(expected, detectLanguage(text));
}
```

## API reference

### `detectLanguage(text)`

Returns an ISO-style language code, or `unknown`.

```js
detectLanguage(text: string): string
```

### `detectLanguageWithConfidence(text)`

Returns a language code and confidence score.

```js
detectLanguageWithConfidence(text: string): {
  language: string;
  confidence: number;
}
```

### `detectLanguageWithModel(text, model)`

Runs detection with a specific model type.

```js
const { detectLanguageWithModel, ModelType } = require('glossa-nodejs');

detectLanguageWithModel('Hello world', ModelType.ScriptOnly);
//=> 'en'
```

Available model values:

| Model | Notes |
|---|---|
| `ModelType.Whatlang` | Default lightweight provider |
| `ModelType.Ensemble` | Ensemble wrapper over available providers |
| `ModelType.ScriptOnly` | Script-based detection only |
| `ModelType.Cld2` | Accepted for compatibility; uses built-in fallback |
| `ModelType.Cld3` | Accepted for compatibility; external provider not bundled |
| `ModelType.Lingua` | Accepted for compatibility; external provider not bundled |
| `ModelType.FastText` | Accepted for compatibility; external model not bundled |

### `LanguageDetector`

Reusable detector class for custom configuration.

```js
const detector = new LanguageDetector(DetectorConfig.default());

detector.detect('Hello world');
//=> 'English'

detector.detectWithConfidence('Hello world');
//=> ['English', 0.9]

detector.getSrcLanguage('Hello world');
//=> 'en'
```

### `DetectorConfig`

```js
const config = DetectorConfig.builder()
  .model(ModelType.Whatlang)
  .minConfidence(0.5)
  .minTextLength(3)
  .enableDisambiguation(true)
  .disambiguationThreshold(0.7)
  .allowedLanguages([])
  .build();
```

`minTextLength` is measured in UTF-8 bytes. An empty `allowedLanguages` list means all supported languages are allowed.

### Exports

```js
const {
  VERSION,
  detectLanguage,
  detectLanguageWithConfidence,
  detectLanguageWithModel,
  LanguageDetector,
  DetectorConfig,
  DetectorConfigBuilder,
  ModelType,
  DetectionResult,
  Language,
  Script,
  code,
  fromCode,
  languageScript,
  allLanguages,
  modelName,
  modelFromString,
} = require('glossa-nodejs');
```

## CLI

Install globally:

```bash
npm install -g glossa-nodejs
```

Or run with `npx`:

```bash
npx glossa-nodejs "नमस्ते आप कैसे हैं"
# hi
```

The command name is `glossa`.

```bash
glossa "नमस्ते आप कैसे हैं"
# hi

glossa --confidence "Hello world"
# en    0.9000

glossa --format json "আমি বাড়ি থেকে এসেছি"
# {"text":"আমি বাড়ি থেকে এসেছি","language":"bn"}

printf "வணக்கம்\nالسلام علیکم\n" | glossa --lines
# ta
# ur
```

CLI options:

| Option | Description |
|---|---|
| `-c`, `--confidence` | Include confidence score |
| `-f`, `--format <fmt>` | `text` or `json` |
| `-m`, `--model <model>` | `whatlang`, `ensemble`, `script_only`, `script-only`, `script`, or `cld2` |
| `-l`, `--lines` | Read stdin and detect one input line at a time |
| `-h`, `--help` | Show help |

## TypeScript

Type declarations are bundled.

```ts
import { detectLanguage, detectLanguageWithConfidence } from 'glossa-nodejs';
import type { LanguageCode } from 'glossa-nodejs';

const language: LanguageCode = detectLanguage('નમસ્તે તમે કેમ છો');
const result = detectLanguageWithConfidence('Hello world');
```

## Accuracy and limitations

Glossa Node.js is strongest for script-distinct Indian languages and includes deterministic disambiguation for common same-script pairs.

Maithili shares Devanagari with Hindi and Marathi. Without a larger external model, short Maithili text may be classified as Hindi or Marathi. For user-facing flows, treat `mai` as best-effort unless text is long and distinctive.

The test suite includes 1,161 multilingual cases and currently passes a 93%+ accuracy gate on public test data.

## Production notes

- Reuse `LanguageDetector` for high-throughput services with custom config.
- Use `detectLanguage` for simple one-off calls.
- Inputs that are empty, too short, punctuation-only, or unsupported return `unknown`.
- No network calls are made at runtime.
- No model download is required.

## Development

```bash
npm test
npm run lint
npm pack --dry-run
```

## Author

Suraj Kumar Jha

## License

MIT
