var gulp = require('gulp');
require('jibo-gulp')(gulp, {
  coverage: true,
  coverageSourceMaps: true,
    typings: [
        'typings/index.d.ts',
        'typings-local/index.d.ts'
    ]
});
