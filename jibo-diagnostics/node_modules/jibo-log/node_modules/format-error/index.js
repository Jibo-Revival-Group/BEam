var _toJSON = Error.prototype.toJSON;

var patchError = function(){
  Error.prototype.toJSON = function() {
    var alt = {};
    var storeKey = function(key) {
      var value = this[key];

      // assume message is duped in stack
      if (key === 'message') return;

      if (key === 'stack') {
        if (value.indexOf('Error: ') === 0)
          value = value.substr(7);
        key = 'Error';
      }

      alt[key] = value;
    }
    Object.getOwnPropertyNames(this).forEach(storeKey, this);
    return alt;
  }
};

var unpatchError = function(){
  Error.prototype.toJSON = _toJSON;
};

var format = function(error, options){
  var prettyjson = require('prettyjson');

  patchError();

  var makeSimple = function(error){
    // prettyjson doesn't like it otherwise
    return JSON.parse(JSON.stringify(error));
  };

  var simpleError = makeSimple(error);
  var message = prettyjson.render(simpleError, options);

  // revert in case the rest of the consumers code
  // doesn't play well with this
  unpatchError();

  return message;
};

module.exports = {
  format: format,
  patchError: patchError,
  unpatchError: unpatchError
};

