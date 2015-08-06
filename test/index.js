
/**
 * Dependencies.
 */

var Matrix = require('node-matrix');
var assert = require('assert');
var Mind = require('..');

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

  it('should accept the number of hidden layer units as an option', function() {
    var mind = Mind({ hiddenUnits: 2 });
    assert(mind.hiddenUnits === 2);
  });

  it('should accept the number of hidden layer neurons as an option', function() {
    var mind = Mind({ hiddenLayers: 3 });
    assert(mind.hiddenLayers === 3);
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

  it('should download the weights', function() {
    var plugin = Mind().learn([{ input: [ 0 ], output: [ 0 ] }]).download();
    assert(plugin[0].numRows === 1);
    assert(plugin[0].numCols === 3);
    assert(plugin[1].numRows === 3);
    assert(plugin[1].numCols === 1);
  });

  it('should upload the weights', function() {
    var mind = Mind().upload({ inputHidden: [], hiddenOutput: [] });
    assert.deepEqual(mind.weights.inputHidden, []);
    assert.deepEqual(mind.weights.hiddenOutput, []);
  });
});

describe('Mind#learn()', function() {
  it('should create a weights matrix for the hidden layer to the output layer', function() {
    var mind = Mind()
      .learn([
        { input: [0, 0], output: [ 0 ] },
        { input: [0, 1], output: [ 1 ] },
        { input: [1, 0], output: [ 1 ] },
        { input: [1, 1], output: [ 0 ] }
      ]);

    assert(mind.weights[1] instanceof Matrix);
  });

  it('should create a weights matrix for the input layer to the hidden layer', function() {
    var mind = Mind()
      .learn([
        { input: [0, 0], output: [ 0 ] },
        { input: [0, 1], output: [ 1 ] },
        { input: [1, 0], output: [ 1 ] },
        { input: [1, 1], output: [ 0 ] }
      ]);

    assert(mind.weights[0] instanceof Matrix);
  });
});

describe('Mind#predict()', function() {
  it('should forward propagate the array argument and return the output', function() {
    var mind = Mind()
      .learn([
        { input: [0, 0], output: [ 0 ] },
        { input: [0, 1], output: [ 1 ] },
        { input: [1, 0], output: [ 1 ] },
        { input: [1, 1], output: [ 0 ] }
      ]);

    assert(mind.predict([0, 0]) instanceof Array);
  });
});
