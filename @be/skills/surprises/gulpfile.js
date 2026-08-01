var gulp = require('gulp');

require('jibo-gulp')(gulp, {
  name: 'surprises',
  typings: ['../../node_modules/jibo/typings/index.d.ts', 'typings/index.d.ts'],
  coverage: true,
  coverageSourceMaps: true
});
