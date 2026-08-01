#!/usr/bin/env node
/**
 * Replace wasm2js SAFE_HEAP_* helpers with direct HEAP* accesses.
 * Even with bounds checks stripped, every memory op was still a JS call —
 * ~59k call sites, fatal on Jibo's old V8.
 */
'use strict';

const fs = require('fs');
const path = require('path');

const srcPath = process.argv[2] || path.join(
  __dirname, '..', 'resources', 'engine', 'websockets-doom.wasm2js.js'
);

const PREFIX = 'SAFE_HEAP_';

function findMatchingParen(s, openIdx) {
  let depth = 0;
  for (let i = openIdx; i < s.length; i++) {
    const c = s[i];
    if (c === '(') depth++;
    else if (c === ')') {
      depth--;
      if (depth === 0) return i;
    }
  }
  throw new Error('unbalanced paren at ' + openIdx);
}

function splitArgs(argStr) {
  const args = [];
  let depth = 0;
  let start = 0;
  for (let i = 0; i < argStr.length; i++) {
    const c = argStr[i];
    if (c === '(') depth++;
    else if (c === ')') depth--;
    else if (c === ',' && depth === 0) {
      args.push(argStr.slice(start, i).trim());
      start = i + 1;
    }
  }
  args.push(argStr.slice(start).trim());
  return args;
}

function addr(a, b) {
  return '((' + a + ') + (' + b + ') | 0)';
}

/** @type {Record<string, (args: string[]) => string|null>} */
const transformers = {
  LOAD_i32_1_1: ([a, b]) => '(HEAP8[' + addr(a, b) + ' >> 0] | 0)',
  LOAD_i32_1_U_1: ([a, b]) => '(HEAPU8[' + addr(a, b) + ' >> 0] | 0)',
  LOAD_i32_2_1: ([a, b]) => {
    const p = addr(a, b);
    return '((((HEAPU8[' + p + ' >> 0] | 0 | ((HEAPU8[(' + p + ' + 1 | 0) >> 0] | 0) << 8 | 0) | 0) << 16 | 0) >> 16) | 0)';
  },
  LOAD_i32_2_2: ([a, b]) => '(HEAP16[' + addr(a, b) + ' >> 1] | 0)',
  LOAD_i32_2_U_1: ([a, b]) => {
    const p = addr(a, b);
    return '(HEAPU8[' + p + ' >> 0] | 0 | ((HEAPU8[(' + p + ' + 1 | 0) >> 0] | 0) << 8 | 0) | 0)';
  },
  LOAD_i32_2_U_2: ([a, b]) => '(HEAPU16[' + addr(a, b) + ' >> 1] | 0)',
  LOAD_i32_4_1: ([a, b]) => {
    const p = addr(a, b);
    return '(HEAPU8[' + p + ' >> 0] | 0 | ((HEAPU8[(' + p + ' + 1 | 0) >> 0] | 0) << 8 | 0) | 0 | ((HEAPU8[(' + p + ' + 2 | 0) >> 0] | 0) << 16 | 0 | ((HEAPU8[(' + p + ' + 3 | 0) >> 0] | 0) << 24 | 0) | 0) | 0)';
  },
  LOAD_i32_4_4: ([a, b]) => '(HEAP32[' + addr(a, b) + ' >> 2] | 0)',
  LOAD_i64_1_1: ([a, b]) => {
    const p = addr(a, b);
    return '(i64toi32_i32$HIGH_BITS = (HEAP8[' + p + ' >> 0] | 0) >> 31 | 0, HEAP8[' + p + ' >> 0] | 0)';
  },
  LOAD_i64_1_U_1: ([a, b]) => {
    const p = addr(a, b);
    return '(i64toi32_i32$HIGH_BITS = 0, HEAPU8[' + p + ' >> 0] | 0)';
  },
  LOAD_i64_2_2: ([a, b]) => {
    const p = addr(a, b);
    return '(i64toi32_i32$HIGH_BITS = (HEAP16[' + p + ' >> 1] | 0) >> 31 | 0, HEAP16[' + p + ' >> 1] | 0)';
  },
  LOAD_i64_2_U_2: ([a, b]) => {
    const p = addr(a, b);
    return '(i64toi32_i32$HIGH_BITS = 0, HEAPU16[' + p + ' >> 1] | 0)';
  },
  LOAD_i64_4_4: ([a, b]) => {
    const p = addr(a, b);
    return '(i64toi32_i32$HIGH_BITS = (HEAP32[' + p + ' >> 2] | 0) >> 31 | 0, HEAP32[' + p + ' >> 2] | 0)';
  },
  LOAD_i64_4_U_4: ([a, b]) => {
    const p = addr(a, b);
    return '(i64toi32_i32$HIGH_BITS = 0, HEAP32[' + p + ' >> 2] | 0)';
  },
  LOAD_i64_8_1: ([a, b]) => {
    const p = addr(a, b);
    const lo = '(HEAPU8[' + p + ' >> 0] | 0 | ((HEAPU8[(' + p + ' + 1 | 0) >> 0] | 0) << 8 | 0) | 0 | ((HEAPU8[(' + p + ' + 2 | 0) >> 0] | 0) << 16 | 0 | ((HEAPU8[(' + p + ' + 3 | 0) >> 0] | 0) << 24 | 0) | 0) | 0)';
    const hi = '(HEAPU8[(' + p + ' + 4 | 0) >> 0] | 0 | ((HEAPU8[(' + p + ' + 5 | 0) >> 0] | 0) << 8 | 0) | 0 | ((HEAPU8[(' + p + ' + 6 | 0) >> 0] | 0) << 16 | 0 | ((HEAPU8[(' + p + ' + 7 | 0) >> 0] | 0) << 24 | 0) | 0) | 0)';
    return '(i64toi32_i32$HIGH_BITS = ' + hi + ', ' + lo + ')';
  },
  LOAD_i64_8_2: ([a, b]) => {
    const p = addr(a, b);
    const lo = '(HEAPU16[' + p + ' >> 1] | 0 | ((HEAPU16[(' + p + ' + 2 | 0) >> 1] | 0) << 16 | 0) | 0)';
    const hi = '(HEAPU16[(' + p + ' + 4 | 0) >> 1] | 0 | ((HEAPU16[(' + p + ' + 6 | 0) >> 1] | 0) << 16 | 0) | 0)';
    return '(i64toi32_i32$HIGH_BITS = ' + hi + ', ' + lo + ')';
  },
  LOAD_i64_8_4: ([a, b]) => {
    const p = addr(a, b);
    return '(i64toi32_i32$HIGH_BITS = HEAP32[(' + p + ' + 4 | 0) >> 2] | 0, HEAP32[' + p + ' >> 2] | 0)';
  },
  LOAD_i64_8_8: ([a, b]) => {
    const p = addr(a, b);
    return '(i64toi32_i32$HIGH_BITS = HEAP32[(' + p + ' + 4 | 0) >> 2] | 0, HEAP32[' + p + ' >> 2] | 0)';
  },
  LOAD_f32_4_4: ([a, b]) => '(Math_fround(HEAPF32[' + addr(a, b) + ' >> 2]))',
  LOAD_f64_8_1: () => null,
  LOAD_f64_8_8: ([a, b]) => '(+HEAPF64[' + addr(a, b) + ' >> 3])',

  STORE_i32_1_1: ([a, b, c]) => '(HEAP8[' + addr(a, b) + ' >> 0] = ' + c + ')',
  // Multi-byte stores that re-read the value stay as helpers (avoid double-eval).
  STORE_i32_2_1: () => null,
  STORE_i32_2_2: ([a, b, c]) => '(HEAP16[' + addr(a, b) + ' >> 1] = ' + c + ')',
  STORE_i32_4_1: () => null,
  STORE_i32_4_2: () => null,
  STORE_i32_4_4: ([a, b, c]) => '(HEAP32[' + addr(a, b) + ' >> 2] = ' + c + ')',
  STORE_i64_1_1: ([a, b, c]) => '(HEAP8[' + addr(a, b) + ' >> 0] = ' + c + ')',
  STORE_i64_2_2: ([a, b, c]) => '(HEAP16[' + addr(a, b) + ' >> 1] = ' + c + ')',
  STORE_i64_4_4: ([a, b, c]) => '(HEAP32[' + addr(a, b) + ' >> 2] = ' + c + ')',
  STORE_i64_8_1: () => null,
  STORE_i64_8_2: () => null,
  STORE_i64_8_4: ([a, b, c, hi]) => {
    const p = addr(a, b);
    return '((HEAP32[' + p + ' >> 2] = ' + c + '), (HEAP32[(' + p + ' + 4 | 0) >> 2] = ' + hi + '), ' + c + ')';
  },
  STORE_i64_8_8: ([a, b, c, hi]) => {
    const p = addr(a, b);
    return '((HEAP32[' + p + ' >> 2] = ' + c + '), (HEAP32[(' + p + ' + 4 | 0) >> 2] = ' + hi + '), ' + c + ')';
  },
  STORE_f32_4_4: ([a, b, c]) => '(HEAPF32[' + addr(a, b) + ' >> 2] = Math_fround(' + c + '))',
  STORE_f64_8_1: () => null,
  STORE_f64_8_8: ([a, b, c]) => '(HEAPF64[' + addr(a, b) + ' >> 3] = +(' + c + '))',
};

let replacements = 0;
let kept = 0;

function transform(s) {
  const parts = [];
  let i = 0;

  while (i < s.length) {
    const idx = s.indexOf(PREFIX, i);
    if (idx < 0) {
      parts.push(s.slice(i));
      break;
    }
    parts.push(s.slice(i, idx));

    // Skip function definitions: "function SAFE_HEAP_..."
    const before = idx >= 9 ? s.slice(idx - 9, idx) : s.slice(0, idx);
    if (/\bfunction\s*$/.test(before)) {
      parts.push(PREFIX);
      i = idx + PREFIX.length;
      continue;
    }

    let nameEnd = idx + PREFIX.length;
    while (nameEnd < s.length && /[A-Za-z0-9_]/.test(s[nameEnd])) nameEnd++;
    const fullName = s.slice(idx, nameEnd);
    const key = fullName.slice(PREFIX.length);

    let p = nameEnd;
    while (p < s.length && (s[p] === ' ' || s[p] === '\n' || s[p] === '\r' || s[p] === '\t')) p++;
    if (s[p] !== '(') {
      parts.push(fullName);
      i = nameEnd;
      continue;
    }

    const close = findMatchingParen(s, p);
    // Recurse into args first so nested calls are already inlined.
    const argStr = transform(s.slice(p + 1, close));
    const fn = transformers[key];
    if (!fn) {
      parts.push(fullName + '(' + argStr + ')');
      kept++;
      i = close + 1;
      continue;
    }
    const args = splitArgs(argStr);
    const repl = fn(args);
    if (repl == null) {
      parts.push(fullName + '(' + argStr + ')');
      kept++;
      i = close + 1;
      continue;
    }
    parts.push(repl);
    replacements++;
    i = close + 1;
  }

  return parts.join('');
}

console.log('Reading', srcPath);
let source = fs.readFileSync(srcPath, 'utf8');
const beforeCalls = (source.match(/SAFE_HEAP_(?:LOAD|STORE)_[A-Za-z0-9_]+\s*\(/g) || []).length;
console.log('SAFE_HEAP calls before:', beforeCalls);

const t0 = Date.now();
source = transform(source);
console.log('done in', Date.now() - t0, 'ms');
console.log('replaced', replacements, 'kept as helpers', kept);

const afterCalls = (source.match(/SAFE_HEAP_(?:LOAD|STORE)_[A-Za-z0-9_]+\s*\(/g) || []).length;
console.log('SAFE_HEAP calls after:', afterCalls);

if (source.indexOf('__DOOM_SAFE_HEAP_INLINED__') < 0) {
  source = '/* __DOOM_SAFE_HEAP_INLINED__ */\n' + source;
}

fs.writeFileSync(srcPath, source);
console.log('Wrote', srcPath, 'size', (source.length / 1e6).toFixed(1) + 'MB');
