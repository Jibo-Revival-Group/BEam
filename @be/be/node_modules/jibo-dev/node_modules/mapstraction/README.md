# mapstraction

Browserify plugin to extract sourcemaps.

[![Build Status](https://travis-ci.org/jiborobot/mapstraction.svg?branch=master)](https://travis-ci.org/jiborobot/mapstraction)

This plugin was created to solve two problems: extract sourcemaps similar to [exorcist](https://www.npmjs.com/package/exorcist) but that would work without having to pipe results. 

## Usage

Include `mapstraction` as a Browserify plugin on the commandline. The name of the default file is the output name, (e.g., "bundle.js.map").

```bash
browserify main.js -o bundle.js -p mapstraction --debug
```

### Named Output

Pass in an optional argument with the name of the map file.

```bash
browserify main.js -o bundle.js -p [ mapstraction "custom.js.map" ] --debug
```
