# parser-download

Tool for download the [**jibo-parser**](https://github.com/jiborobot/jibo-parser/releases/), a native module used to read and write **.fst** and **.rule** files.

## Usage

Simply modify your package.json to match this:

```json
{
  "scripts": {
    "postinstall": "parser-download"
  },
  "parser": "0.12.2",
  "dependencies": {
    "parser-download": "latest"
  }
}
```

## Options

* **version** (String) Required to specify the version of the parser to download.
* **force32** (Boolean, default: `false`) Use to force 32-bit downloading, work around for Atom on 64-bit machines.
* **rename** (Boolean, default: `false`) Use to get around Atom's detection of native modules, renames download to .jibo file.
* **dir** (String, default: `'parser'`) Folder where to download parser.
* **temp** (String, default: `'tmp'`) Temporary folder to download parser. 
* **url** (String, default: `'https://github.com/jiborobot/jibo-parser/releases/download/'`)
* **type** (String) Optional to specify which type of module environment to download for. Use a value of `auto` to automatically detect the version.
* **verbose** (Boolean, default: `false`) For debugging purposes.

These options can be used either with the API, or on the commandline:

### Commandline

```bash
parser-download --version=0.12.0 --force32 --rename
```

Each parameter has a short name:

* **version** `-v`
* **force32** `-f`
* **rename** `-r`
* **dir**  `-d`
* **temp** `-c`
* **url**  `-u`
* **type** `-t`
* **verbose** `-b`

Sample example above:

```bash
parser-download -v 0.12.0 -f -r
```

### API

Options for the API are the same as the commandline arguments. Except that there's aditional argument called `logger` to handle the output.

```js
var parser = require('parser-download');

var options = {
    version: '0.12.0',
    force32: true,
    rename: true,
    logger: function(msg) {
        console.log('[parser-download]', msg);
    }
};

parser(options, function(err){
    if (err) {
        console.error("Something went wrong", err);
    }
});
```