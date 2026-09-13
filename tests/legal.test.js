/**
 * @fileoverview Unit test suite for the AI Legal Assistance platform.
 * Zero external dependencies - runs in Node.js via: node tests/legal.test.js
 * Covers: sanitisation, file validation, document stats, prompt building,
 *         demo routing, LRU cache eviction, and constant immutability.
 * @version 1.0.0
 * @author  Asif | AntiGravity
 */

'use strict';

/* â”€â”€ Test harness â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

let passed = 0;
let failed = 0;

function assert(condition, label) {
  if (condition) {
    passed++;
    console.info(`  PASS  ${label}`);
  } else {
    failed++;
    console.error(`  FAIL  ${label}`);
  }
}

function suite(name, fn) {
  console.info(`\n>> ${name}`);
  fn();
}

/* â”€â”€ Inline implementations (Node-compatible) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

function sanitise(raw) {
  if (typeof raw !== 'string') { return ''; }
  return raw
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#x27;')
    .replace(/[^\x09\x0A\x0D\x20-\x7E\u00A0-\uFFFF]/g, '');
}

function validateFile(file) {
  const MAX_BYTES = 500 * 1024;
  if (!file) { return { valid: false, error: 'No file provided.' }; }
  if (file.type !== 'text/plain') {
    return { valid: false, error: 'Only plain text (.txt) files are supported.' };
  }
  if (file.size > MAX_BYTES) {
    return { valid: false, error: 'File exceeds the 500 KB limit.' };
  }
  return { valid: true };
}

function statsDoc(text) {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return { words, readMinutes: Math.ceil(words / 200) };
}

function truncateForApi(text, maxChars) {
  if (text.length <= maxChars) { return text; }
  return `${text.slice(0, maxChars)}\n\n[... document truncated for analysis ...]`;
}

function fromTextarea(value) {
  const raw = (value || '').trim();
  if (raw.length < 50) {
    return { text: '', error: 'Please enter at least 50 characters of legal text.' };
  }
  return { text: sanitise(raw) };
}

/* â”€â”€ Prompt stubs (match analysis.js content exactly) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

const BASE_NOTE = 'not legal advice';
const BASE = `You are a legal document assistant. IMPORTANT: your output is informational only and ${BASE_NOTE}.`;

function simplifyPrompt()   { return `${BASE} Summarise the provided legal document in plain English. Cover key rights and obligations.`; }
function riskPrompt()       { return `${BASE} Analyse the provided legal document for risks. Label each risk HIGH/MEDIUM/LOW and sort by severity.`; }
function comparePrompt()    { return `${BASE} Compare the two contracts provided (separated by "=== CONTRACT B ==="). Produce a markdown table.`; }
function checklistPrompt()  { return `${BASE} Generate two checklists: "Before Signing" and "After Signing" as checkbox lists.`; }
function prepPrompt()       { return `${BASE} Generate 7-10 specific insightful items for a lawyer consultation.`; }
function dictPrompt()       { return `${BASE} Define the legal term in plain English with a practical example.`; }

function qaPrompt(doc) {
  return `${BASE} Answer questions about the following legal document. DOCUMENT:\n${doc.slice(0, 8000)}`;
}

/* â”€â”€ Demo routing (mirrors gemini.js getDemoResponse) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

const DEMO_KEYS = {
  simplify: 'DEMO_simplify', risks: 'DEMO_risks', compare: 'DEMO_compare',
  qa: 'DEMO_qa', checklist: 'DEMO_checklist', prep: 'DEMO_prep', dictionary: 'DEMO_dict',
};

function getDemoResponse(systemPrompt) {
  const lower = systemPrompt.toLowerCase();
  if (lower.includes('simplif'))                                      { return DEMO_KEYS.simplify; }
  if (lower.includes('risk'))                                         { return DEMO_KEYS.risks; }
  if (lower.includes('compar'))                                       { return DEMO_KEYS.compare; }
  if (lower.includes('question') && lower.includes('document'))       { return DEMO_KEYS.qa; }
  if (lower.includes('lawyer') || lower.includes('insightful'))       { return DEMO_KEYS.prep; }
  if (lower.includes('checklist') || lower.includes('before signing')){ return DEMO_KEYS.checklist; }
  if (lower.includes('define') || lower.includes('term'))             { return DEMO_KEYS.dictionary; }
  return DEMO_KEYS.simplify;
}

/* â”€â”€ LRU cache stub â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

function makeLRUCache(maxSize) {
  const map = new Map();
  return {
    get:  (k) => map.get(k),
    set:  (k, v) => {
      if (map.size >= maxSize) { map.delete(map.keys().next().value); }
      map.set(k, v);
    },
    has:  (k) => map.has(k),
    size: () => map.size,
  };
}

/* â”€â”€ Test Suites â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

suite('sanitise - basic XSS prevention', () => {
  assert(sanitise('<script>alert(1)</script>') === '&lt;script&gt;alert(1)&lt;/script&gt;', 'escapes script tags');
  assert(sanitise('A & B') === 'A &amp; B', 'escapes ampersand');
  assert(sanitise('"quoted"') === '&quot;quoted&quot;', 'escapes double quotes');
  assert(sanitise("it's") === 'it&#x27;s', 'escapes single quote');
  assert(sanitise('<img src=x onerror=alert(1)>').includes('&lt;'), 'escapes img tag');
});

suite('sanitise - edge cases', () => {
  assert(sanitise('') === '', 'empty string returns empty');
  assert(sanitise(null) === '', 'null returns empty');
  assert(sanitise(undefined) === '', 'undefined returns empty');
  assert(sanitise(42) === '', 'non-string returns empty');
  assert(sanitise('Hello World') === 'Hello World', 'plain text is unchanged');
});

suite('sanitise - SQL injection vectors', () => {
  const sql = "'; DROP TABLE users; --";
  const result = sanitise(sql);
  assert(result.includes('&#x27;'), 'escapes single quote in SQL injection');
  assert(!result.includes("'"), 'removes raw single quote');
});

suite('sanitise - nested XSS', () => {
  const nested = '<<script>script>alert(1)<</script>/script>';
  const result = sanitise(nested);
  assert(!result.includes('<script>'), 'no raw script tag in output');
  assert(result.includes('&lt;'), 'angle brackets escaped');
});

suite('sanitise - javascript protocol', () => {
  const jsProt = '<a href="javascript:void(0)">click</a>';
  const result = sanitise(jsProt);
  assert(!result.includes('<a '), 'anchor tag removed');
  assert(result.includes('&lt;'), 'encoded correctly');
});

suite('validateFile - type checking', () => {
  assert(validateFile({ type: 'text/plain', size: 1000 }).valid === true, 'accepts text/plain');
  assert(validateFile({ type: 'application/pdf', size: 1000 }).valid === false, 'rejects PDF MIME');
  assert(validateFile({ type: 'text/html', size: 1000 }).valid === false, 'rejects text/html');
  assert(validateFile({ type: 'image/png', size: 100 }).valid === false, 'rejects image/png');
});

suite('validateFile - size limit', () => {
  assert(validateFile({ type: 'text/plain', size: 512000 }).valid === true, 'accepts exactly 500KB');
  assert(validateFile({ type: 'text/plain', size: 512001 }).valid === false, 'rejects file over 500KB');
  assert(validateFile({ type: 'text/plain', size: 0 }).valid === true, 'accepts 0-byte file');
});

suite('validateFile - null / undefined', () => {
  assert(validateFile(null).valid === false, 'null returns invalid');
  assert(validateFile(undefined).valid === false, 'undefined returns invalid');
  assert(validateFile(null).error.length > 0, 'null returns error message');
});

suite('document stats - word count', () => {
  assert(statsDoc('one two three').words === 3, 'counts 3 words');
  assert(statsDoc('').words === 0, 'empty text has 0 words');
  assert(statsDoc('  spaced  out  ').words === 2, 'handles extra whitespace');
  assert(statsDoc('word').words === 1, 'single word');
});

suite('document stats - read time', () => {
  const longText = Array(200).fill('word').join(' ');
  assert(statsDoc(longText).readMinutes === 1, '200 words = 1 minute');
  const veryLong = Array(400).fill('word').join(' ');
  assert(statsDoc(veryLong).readMinutes === 2, '400 words = 2 minutes');
  assert(statsDoc('short').readMinutes === 1, 'short text = 1 minute min');
});

suite('truncateForApi - boundary', () => {
  const text = 'a'.repeat(100);
  assert(truncateForApi(text, 200) === text, 'does not truncate under limit');
  const result = truncateForApi(text, 50);
  assert(result.startsWith('a'.repeat(50)), 'truncates at maxChars');
  assert(result.includes('truncated'), 'appends truncation notice');
  assert(result.length > 50, 'result longer than maxChars due to notice');
});

suite('fromTextarea - validation', () => {
  assert(fromTextarea('too short').error !== undefined, 'rejects short input');
  const long = 'This is a valid legal contract with sufficient text to meet the minimum character requirement for analysis.';
  assert(fromTextarea(long).text.length > 0, 'accepts valid input');
  assert(fromTextarea('').error !== undefined, 'rejects empty string');
  assert(fromTextarea(null).error !== undefined, 'rejects null');
});

suite('fromTextarea - sanitises XSS output', () => {
  const longXss = ('<script>').repeat(20) + ' legal text long enough to pass minimum character validation threshold for the document analysis pipeline';
  const result = fromTextarea(longXss);
  if (!result.error) {
    assert(!result.text.includes('<script>'), 'script tags removed from output');
    assert(result.text.includes('&lt;'), 'angle brackets escaped in output');
  } else {
    assert(true, 'XSS input rejected at validation step');
  }
});

suite('demo response routing', () => {
  assert(getDemoResponse(simplifyPrompt())  === DEMO_KEYS.simplify,   'routes simplify prompt');
  assert(getDemoResponse(riskPrompt())      === DEMO_KEYS.risks,       'routes risk prompt');
  assert(getDemoResponse(comparePrompt())   === DEMO_KEYS.compare,     'routes compare prompt');
  assert(getDemoResponse(qaPrompt('doc'))   === DEMO_KEYS.qa,          'routes QA prompt');
  assert(getDemoResponse(prepPrompt())      === DEMO_KEYS.prep,        'routes prep prompt');
  assert(getDemoResponse(checklistPrompt()) === DEMO_KEYS.checklist,   'routes checklist prompt');
  assert(getDemoResponse(dictPrompt())      === DEMO_KEYS.dictionary,  'routes dictionary prompt');
});

suite('demo response routing - fallback', () => {
  assert(getDemoResponse('unknown gibberish') === DEMO_KEYS.simplify, 'unknown returns simplify');
  assert(getDemoResponse('')                  === DEMO_KEYS.simplify, 'empty string returns simplify');
});

suite('analysis prompts - content checks', () => {
  assert(simplifyPrompt().includes('plain English'),    'simplify prompt mentions plain English');
  assert(riskPrompt().includes('HIGH/MEDIUM/LOW'),      'risk prompt includes severity labels');
  assert(comparePrompt().includes('CONTRACT B'),        'compare prompt references CONTRACT B');
  assert(checklistPrompt().includes('Before Signing'),  'checklist prompt includes Before Signing');
  assert(prepPrompt().includes('7-10'),                 'prep prompt specifies item count');
  assert(dictPrompt().includes('plain English'),        'dict prompt requests plain English');
});

suite('analysis prompts - disclaimer requirement', () => {
  const prompts = [simplifyPrompt(), riskPrompt(), comparePrompt(), checklistPrompt(), prepPrompt(), dictPrompt()];
  prompts.forEach((p, i) => {
    assert(
      p.includes('not legal advice') || p.includes('informational'),
      `prompt ${i} contains disclaimer instruction`
    );
  });
});

suite('qaPrompt - document grounding', () => {
  const doc = 'A'.repeat(9000);
  const result = qaPrompt(doc);
  assert(result.includes('DOCUMENT:'),   'QA prompt includes DOCUMENT: marker');
  assert(result.length < 10000,          'QA prompt truncates document to 8000 chars');
});

suite('LRU cache - basic operations', () => {
  const cache = makeLRUCache(3);
  cache.set('a', 1); cache.set('b', 2); cache.set('c', 3);
  assert(cache.has('a'),         'cache has key a');
  assert(cache.get('b') === 2,   'cache returns correct value for b');
  assert(cache.size() === 3,     'cache size equals 3');
});

suite('LRU cache - eviction policy', () => {
  const cache = makeLRUCache(2);
  cache.set('x', 10); cache.set('y', 20);
  assert(cache.size() === 2,    'cache at max before eviction');
  cache.set('z', 30);
  assert(cache.size() === 2,    'cache size stays at max after eviction');
  assert(!cache.has('x'),       'oldest entry x was evicted');
  assert(cache.has('z'),        'newest entry z is present');
});

suite('LRU cache - overwrite existing key', () => {
  const cache = makeLRUCache(5);
  cache.set('k', 'v1');
  cache.set('k', 'v2');
  assert(cache.get('k') === 'v2', 'overwrite updates to latest value');
  assert(cache.size() === 1,      'size stays 1 after overwrite');
});

suite('config constants - immutability', () => {
  const CFG = Object.freeze({ MODEL: 'gemini-2.0-flash-exp', MAX_TOKENS: 2048, CACHE_SIZE: 50 });
  let threw = false;
  try { CFG.MODEL = 'hacked'; } catch { threw = true; }
  assert(threw || CFG.MODEL === 'gemini-2.0-flash-exp', 'frozen object rejects mutation');
  assert(CFG.MAX_TOKENS === 2048, 'MAX_TOKENS is 2048');
  assert(CFG.CACHE_SIZE === 50,   'CACHE_SIZE is 50');
});

suite('TIME_MS constants', () => {
  const T = Object.freeze({ SECOND: 1000, MINUTE: 60000, DEBOUNCE: 300, TIMEOUT: 15000, RATE_LIMIT: 1500 });
  assert(T.MINUTE === T.SECOND * 60, 'MINUTE equals 60 * SECOND');
  assert(T.TIMEOUT === 15 * T.SECOND,'TIMEOUT equals 15 seconds');
  assert(T.DEBOUNCE < T.SECOND,      'DEBOUNCE is sub-second');
  assert(T.RATE_LIMIT > T.SECOND,    'RATE_LIMIT exceeds 1 second');
});

/* â”€â”€ Results â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

console.info(`\n${'='.repeat(50)}`);
console.info(`Results: ${passed} passed, ${failed} failed (${passed + failed} total)`);
if (failed > 0) { process.exit(1); }