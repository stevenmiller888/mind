
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

  it('should accept the number of hidden layer neurons as an option', function() {
    var mind = Mind({ hiddenNeurons: 2 });
    assert(mind.hiddenNeurons === 2);
  });

  it('should accept the learning rate as an option', function() {
    var mind = Mind({ learningRate: 0.7 });
    assert(mind.learningRate === 0.7);
  });

  it('should accept the number of learning iterations as an option', function() {
    var mind = Mind({ iterations: 100000 });
    assert(mind.iterations === 100000);
  });

  it('should accept the kind of activation function as an option', function() {
    var mind = Mind({ activator: 'htan' });
    assert(typeof mind.activate === 'function');
  });

  it('should initialize with an activation function by default', function() {
    var mind = Mind();
    assert(typeof mind.activate === 'function');
  });

  it('should initialize with the derivative of the activation function by default', function() {
    var mind = Mind();
    assert(typeof mind.activatePrime === 'function');
  });

  it('should download inputHiddenWeights and hiddenOutputWeights', function() {
    var mind = Mind().learn([{ input: [], output: [] }]).download();
    assert(mind.inputHiddenWeights, []);
    assert(mind.hiddenOutputWeights, []);
  });

  it('should upload inputHiddenWeights and hiddenOutputWeights', function() {
    var mind = Mind().upload({ inputHiddenWeights: [], hiddenOutputWeights: [] });
    assert.deepEqual(mind.inputHiddenWeights, []);
    assert.deepEqual(mind.hiddenOutputWeights, []);
  });

  it('should accept a transformation object', function() {
    var mind = Mind().transform({});
    assert.deepEqual(mind.transformer, {});
  });
});
