
/**
 * Dependencies.
 */

var sigmoidPrime = require('sigmoid-prime');
var Emitter = require('emitter-component');
var htanPrime = require('htan-prime');
var Matrix = require('node-matrix');
var sigmoid = require('sigmoid');
var sample = require('samples');
var htan = require('htan');

/**
 * References.
 */

var scalar = Matrix.multiplyScalar;
var dot = Matrix.multiplyElements;
var multiply = Matrix.multiply;
var subtract = Matrix.subtract;
var add = Matrix.add;

/**
 * Export `Mind`.
 */

module.exports = Mind;

/**
 * Initialize a new `Mind`.
 *
 * @param {Object} opts
 * @return {Object} this
 * @api public
 */

function Mind(opts) {
  if (!(this instanceof Mind)) return new Mind(opts);
  opts = opts || {};

  opts.activator === 'sigmoid'
    ? (this.activate = sigmoid, this.activatePrime = sigmoidPrime)
    : (this.activate = htan, this.activatePrime = htanPrime);

  // hyperparameters
  this.learningRate = opts.learningRate || 0.7;
  this.iterations = opts.iterations || 10000;
  this.hiddenLayers = opts.hiddenLayers || 1;
  this.hiddenUnits = opts.hiddenUnits || 3;
}

/**
 * Mixin.
 */

Emitter(Mind.prototype);

/**
 * Learn.
 *
 * 	1. Normalize examples
 * 	2. Setup weights
 * 	3. Forward propagate to generate a prediction
 *  4. Back propagate to adjust weights
 *  5. Repeat (3) and (4) `this.iterations` times
 *
 *  These five steps enable our network to learn the relationship
 *  between inputs and outputs.
 *
 * @param {Array} examples
 * @return {Object} this
 * @api public
 */

Mind.prototype.learn = function(examples) {
  examples = normalize(examples);

  this.setup(examples);

  for (var i = 0; i < this.iterations; i++) {
    var results = this.forward(examples);
    var errors = this.back(examples, results);

    this.emit('data', i, errors, results);
  }

  return this;
};

/**
 * Setup the weights.
 *
 * @param {Object} examples
 * @api private
 */

Mind.prototype.setup = function(examples) {
  this.weights = [];

  // input > hidden
  this.weights.push(
    Matrix({
      rows: examples.input[0].length,
      columns: this.hiddenUnits,
      values: sample
    })
  );

  // hidden > hidden
  for (var i = 1; i < this.hiddenLayers; i++) {
    this.weights.push(
      Matrix({
        rows: this.hiddenUnits,
        columns: this.hiddenUnits,
        values: sample
      })
    );
  }

  // hidden > output
  this.weights.push(
    Matrix({
      rows: this.hiddenUnits,
      columns: examples.output[0].length,
      values: sample
    })
  );
};

/**
 * Forward propagate.
 *
 * @param {Object} examples
 * @return {Array} results
 * @api private
 */

Mind.prototype.forward = function(examples) {
  var activate = this.activate;
  var weights = this.weights;
  var results = [];

  // sum the weight and input
  function sum(w, i) {
    var res = {};

    res.sum = multiply(w, i);
    res.result = res.sum.transform(activate);

    return res;
  };

  // input > hidden
  results.push(
    sum(weights[0], examples.input)
  );

  // hidden > hidden
  for (var i = 1; i < this.hiddenLayers; i++) {
    results.push(
      sum(weights[i], results[i - 1].result)
    );
  }

  // hidden > output
  results.push(
    sum(weights[weights.length - 1], results[results.length - 1].result)
  );

  return results;
};

/**
 * Back propagate.
 *
 * @param {Object} outputMatrix
 * @api private
 */

Mind.prototype.back = function(examples, results) {
  var activatePrime = this.activatePrime;
  var hiddenLayers = this.hiddenLayers;
  var learningRate = this.learningRate;
  var weights = this.weights;

  // output > hidden
  var error = subtract(examples.output, results[results.length - 1].result);
  var delta = dot(results[results.length - 1].sum.transform(activatePrime), error);
  var changes = scalar(multiply(delta, results[0].result.transpose()), learningRate);
  weights[weights.length - 1] = add(weights[weights.length - 1], changes);

  // hidden > hidden
  for (var i = 1; i < hiddenLayers; i++) {
    delta = dot(multiply(weights[weights.length - i].transpose(), delta), results[results.length - (i + 1)].sum.transform(activatePrime));
    changes = scalar(multiply(delta, results[results.length - (i + 1)].result.transpose()), learningRate);
    weights[weights.length - (i + 1)] = add(weights[weights.length - (i + 1)], changes);
  }

  // hidden > input
  delta = dot(multiply(weights[1].transpose(), delta), results[0].sum.transform(activatePrime));
  changes = scalar(multiply(delta, examples.input.transpose()), learningRate);
  weights[0] = add(weights[0], changes);

  return error;
};

/**
 * Predict.
 *
 * @param {Array} input
 * @api public
 */

Mind.prototype.predict = function(input) {
  var results = this.forward({ input: Matrix([input]) });

  return results[results.length - 1].result[0];
};

/**
 * Upload weights.
 *
 * @param {Object} weights
 * @return {Object} this
 * @api public
 */

Mind.prototype.upload = function(weights) {
  this.weights = weights;

  return this;
};

/**
 * Download weights.
 *
 * @return {Object} weights
 * @api public
 */

Mind.prototype.download = function() {
  return this.weights;
};

/**
 * Normalize the data.
 *
 * @param {Array} data
 * @return {Object} ret
 */

function normalize(data) {
  var ret = { input: [], output: [] };

  for (var i = 0; i < data.length; i++) {
    var datum = data[i];

    ret.output.push(datum.output);
    ret.input.push(datum.input);
  }

  ret.output = Matrix(ret.output);
  ret.input = Matrix(ret.input);

  return ret;
}
