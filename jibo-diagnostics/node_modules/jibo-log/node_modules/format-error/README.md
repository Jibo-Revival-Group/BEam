# format-error

Formats an error object such that:

* message is ignored; assumes it's in the stack
* full stack is displayed
* other properties on object are displayed
* nested errors are displayed

## install

```
npm install --save format-error
```

## example

```javascript
var format = require('format-error').format;

var error = new Error('something broke');
error.inner = new Error('some inner thing broke');
error.code = '500c';
error.severity = 'high';

var message = format(error);

console.error(message);

/*
Error:    something broke
    at Object.<anonymous> (/home/sean/demo/testium/err.js:28:13)
    at Module._compile (module.js:456:26)
    at Object.Module._extensions..js (module.js:474:10)
    at Module.load (module.js:356:32)
    at Function.Module._load (module.js:312:12)
    at Function.Module.runMain (module.js:497:10)
    at startup (node.js:119:16)
    at node.js:902:3
inner:
  Error: some inner thing broke
    at Object.<anonymous> (/home/sean/demo/testium/err.js:29:15)
    at Module._compile (module.js:456:26)
    at Object.Module._extensions..js (module.js:474:10)
    at Module.load (module.js:356:32)
    at Function.Module._load (module.js:312:12)
    at Function.Module.runMain (module.js:497:10)
    at startup (node.js:119:16)
    at node.js:902:3
code:     500c
severity: high
*/
```

## api

### format(error, prettyjsonOptions)

Formats an error for output.
`error` is an Error object.
`prettyjsonOptions` (optional) is passed directly to
[prettyjson](https://github.com/rafeca/prettyjson).

### patchError()

Permanently patches the error object
such that serialization (`toJSON` calls)
behave according to the goals
of this module.
This is not required
unless you want `JSON.stringify(error)`
to act somewhat like `format(error)`
in cases where you can't
control how the output is formatted directly.

This module only temporarily
patches Error in order to
produce the formatted output.

This can be undone by calling `unpatchError()`.

### unpatchError()

This reverts changes made to
`Error.prototype.toJSON`
by `patchError()`.

This should only be called if
you explictly called `patchError`.

## License

[MIT](LICENSE)

