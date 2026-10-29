'use strict';
const fs = require('fs'), path = require('path');
const sm = require('../../../node_modules/source-map');
const root = path.join(__dirname, '..');
const map = JSON.parse(fs.readFileSync(path.join(root, 'index.js.map')));
const lines = fs.readFileSync(path.join(root, 'index.js'), 'utf8').split('\n');
const source = fs.readFileSync(path.join(root, 'src/states/ProcessCloud.ts'), 'utf8');
const i = map.sources.indexOf('src/states/ProcessCloud.ts');
if (i < 0 || map.sourcesContent[i] !== source) throw Error('stale ProcessCloud source');
const consumer = new sm.SourceMapConsumer(map);
['const PERSONAL_REPORT_TIMEOUT = 20000;', 'const responseTimeout = isPersonalReport'].forEach(function (text) {
    const line = lines.findIndex(function (s) { return s.indexOf(text) !== -1; }) + 1;
    if (!line) throw Error('missing generated line: ' + text);
    const position = consumer.originalPositionFor({line: line, column: lines[line - 1].indexOf('const')});
    if (position.source !== 'src/states/ProcessCloud.ts' || source.split('\n')[position.line - 1].indexOf(text) < 0) throw Error(JSON.stringify(position));
});
console.log('Nimbus source map matches generated and source timeout lines');
