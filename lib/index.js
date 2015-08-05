
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
 */

Mind.prototype.learn = function(examples) {
  examples = normalize(examples);

  this.weights = {
    inputHidden: Matrix({
      columns: this.hiddenUnits,
      rows: examples.input[0].length,
      values: sample
    }),
    hiddenOutput: Matrix({
      columns: examples.output[0].length,
      rows: this.hiddenUnits,
      values: sample
    })
  };

  for (var i = 0; i < this.iterations; i++) {
    var results = this.forward(examples);
    var errors = this.back(examples, results);

    this.emit('data', i, errors, results);
  }

  return this;
};

/**
 * Forward propagate.
 *
 * @param {Object} examples
 * @return {Object} this
 */

Mind.prototype.forward = function(examples) {
  var activate = this.activate;
  var weights = this.weights;
  var ret = {};

  // compute hidden layer sum
  ret.hiddenSum = multiply(weights.inputHidden, examples.input);

  // compute hidden layer result
  ret.hiddenResult = ret.hiddenSum.transform(activate);

  // compute output layer sum
  ret.outputSum = multiply(weights.hiddenOutput, ret.hiddenResult);

  // compute output layer result
  ret.outputResult = ret.outputSum.transform(activate);

  return ret;
};

/**
 * Back propagate.
 *
 * @param {Object} outputMatrix
 */

Mind.prototype.back = function(examples, results) {
  var activatePrime = this.activatePrime;
  var learningRate = this.learningRate;
  var weights = this.weights;

  // compute weight adjustments
  var errorOutputLayer = subtract(examples.output, results.outputResult);
  var deltaOutputLayer = dot(results.outputSum.transform(activatePrime), errorOutputLayer);
  var hiddenOutputChanges = scalar(multiply(deltaOutputLayer, results.hiddenResult.transpose()), learningRate);
  var deltaHiddenLayer = dot(multiply(weights.hiddenOutput.transpose(), deltaOutputLayer), results.hiddenSum.transform(activatePrime));
  var inputHiddenChanges = scalar(multiply(deltaHiddenLayer, examples.input.transpose()), learningRate);

  // adjust weights
  weights.inputHidden = add(weights.inputHidden, inputHiddenChanges);
  weights.hiddenOutput = add(weights.hiddenOutput, hiddenOutputChanges);

  return errorOutputLayer;
};

/**
 * Predict.
 *
 * @param {Array} input
 */

Mind.prototype.predict = function(input) {
  var results = this.forward({ input: Matrix([input]) });

  return results.outputResult[0];
};

/**
 * Upload weights.
 *
 * @param {Object} obj
 * @return {Object} this
 */

Mind.prototype.upload = function(obj) {
  this.weights = {
    hiddenOutput: obj.hiddenOutput,
    inputHidden: obj.inputHidden
  };

  return this;
};

/**
 * Download weights.
 *
 * @return {Object} weights
 */

Mind.prototype.download = function() {
  var weights = this.weights;

  return {
    hiddenOutput: weights.hiddenOutput,
    inputHidden: weights.inputHidden
  };
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
