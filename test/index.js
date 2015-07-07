
/**
 * Dependencies.
 */

var Mind = require('..');
var assert = require('assert');

/**
 * Tests.
 */

describe('Mind()', function() {
  it('should be a function', function() {
    assert.equal(typeof Mind, 'function');
  });

  it('should be a constructor', function() {
    var mind = new Mind();
    assert(mind instanceof Mind);
  });

  it('should not require the new keyword', function() {
    var mind = Mind();
    assert(mind instanceof Mind);
  });

  it('should accept an options object', function() {
    var mind = Mind({ hiddenNeurons: 2, learningRate: 0.7 });
    assert(mind.hiddenNeurons === 2);
    assert(mind.learningRate === 0.7);
  });
});
