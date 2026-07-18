var format = require('./index.js').format;
var assert = require('assertive');

describe('format-error#format', function(){
  before(function(){
    var error = new Error('something broke');
    error.inner = new Error('some inner thing broke');
    error.code = '500c';
    error.severity = 'high';

    this.message = format(error, {noColor: true});
  });

  it('finds the stack', function(){
    assert.include('Error:    something broke', this.message);
  });

  it('finds inner stacks', function(){
    assert.include('Error: some inner thing broke', this.message);
  });

  it('finds metadata', function(){
    assert.include('code:     500c', this.message);
    assert.include('severity: high', this.message);
  });
});

