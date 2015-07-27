
/**
 * Dependencies.
 */

var sigmoidPrime = require('sigmoid-prime');
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

  // parameters
  this.learningRate = opts.learningRate || 0.7;
  this.hiddenNeurons = opts.hiddenNeurons || 3;
  this.iterations = opts.iterations || 10000;

  if (opts.activator === 'sigmoid') {
    this.activate = sigmoid;
    this.activatePrime = sigmoid;
  } else {
    this.activate = htan;
    this.activatePrime = htanPrime;
  }
}

/**
 * Learn.
 *
 * This function is responsible for the following, in order:
 *
 * 	(1) Processing the examples by applying a transformation function, if necessary
 * 	(2) Turning them into matrices so we can use vector notation
 * 	(3) Setting up the weights between layers with random values and appropriate sizes
 * 	(4) Forward propagating the input (to generate a prediction)
 * 	(5) Back propagating the output (to adjust the weights)
 *
 * These five steps allows our network to learn the relationship
 * between the inputs and the outputs.
 *
 * @param {Array} examples
 * @return {Object} this
 */

Mind.prototype.learn = function(examples) {
  var transformer = this.transformer;

  // process the examples
  var output = [];
  var input = [];
  examples.forEach(function(example) {
    if (transformer) {
      output.push(example.output.map(transformer.before));
      input.push(example.input.map(transformer.before));
    } else {
      output.push(example.output);
      input.push(example.input);
    }
  });

  // create the output matrix, create the input matrix
  var outputMatrix = Matrix(output);
  var inputMatrix = Matrix(input);

  // setup the weights for the hidden layer to the output layer
  this.hiddenOutputWeights = Matrix({
    columns: examples[0].output.length,
    rows: this.hiddenNeurons,
    values: sample
  });

  // setup the weights for the input layer to the hidden layer
  this.inputHiddenWeights = Matrix({
    columns: this.hiddenNeurons,
    rows: examples[0].input.length,
    values: sample
  });

  this.inputMatrix = inputMatrix;

  // forward propagate, back propagate
  for (var i = 0; i < this.iterations; i++) {
    this.forward(inputMatrix);
    this.back(outputMatrix);
  }

  // allow chaining
  return this;
};

/**
 * Forward propagate.
 *
 * @param {Object} inputMatrix
 * @return {Object} this
 */

Mind.prototype.forward = function(inputMatrix) {
  var activate = this.activate;

  // compute hidden layer sum
  this.hiddenSum = multiply(this.inputHiddenWeights, inputMatrix);

  // apply activation function to hidden layer sum
  this.hiddenResult = this.hiddenSum.transform(activate);

  // compute output layer sum
  this.outputSum = multiply(this.hiddenOutputWeights, this.hiddenResult);

  // apply activation function to output layer sum
  this.outputResult = this.outputSum.transform(activate);

  // allow chaining
  return this;
};

/**
 * Back propagate.
 *
 * @param {Object} outputMatrix
 */

Mind.prototype.back = function(outputMatrix) {
  var activatePrime = this.activatePrime;

  // compute output layer changes
  var errorOutputLayer = subtract(outputMatrix, this.outputResult);
  var deltaOutputLayer = dot(this.outputSum.transform(activatePrime), errorOutputLayer);
  var hiddenOutputWeightsChanges = scalar(multiply(deltaOutputLayer, this.hiddenResult.transpose()), this.learningRate);

  // compute hidden layer changes
  var multiplied = multiply(this.hiddenOutputWeights.transpose(), deltaOutputLayer);
  var deltaHiddenLayer = dot(multiplied, this.hiddenSum.transform(activatePrime));
  var inputHiddenWeightsChanges = scalar(multiply(deltaHiddenLayer, this.inputMatrix.transpose()), this.learningRate);

  // compute the new weights
  this.inputHiddenWeights = add(this.inputHiddenWeights, inputHiddenWeightsChanges);
  this.hiddenOutputWeights = add(this.hiddenOutputWeights, hiddenOutputWeightsChanges);

  // allow chaining
  return this;
};

/**
 * Predict.
 *
 * 	- This forward propagates the input data through the trained network
 * 	and returns the predicted output.
 *
 * @param {Array} input
 */

Mind.prototype.predict = function(input) {
  var transformer = this.transformer;

  // apply `before` transform
  if (transformer) {
    for (var i = 0; i < input.length; i++) {
      input[i] = transformer.before(input[i]);
    }
  }

  // matrix-ify input data
  var inputMatrix = Matrix([input]);

  // forward propagate
  this.forward(inputMatrix);

  // prediction reference
  var prediction = this.outputResult;

  // apply `after` transform
  if (transformer) {
    for (var j = 0; j < prediction.numRows; j++) {
      prediction[j] = transformer.after(prediction[j]);
    }
  }

  return prediction[0];
};

/**
 * Upload.
 *
 * 	- This gives a hook for the user to plug-in the weights from a
 * 	previously trained network.
 *
 * @param {Object} obj
 * @return {Object} this
 */

Mind.prototype.upload = function(obj) {
  this.hiddenOutputWeights = obj.hiddenOutputWeights;
  this.inputHiddenWeights = obj.inputHiddenWeights;

  // allow chaining
  return this;
};

/**
 * Download.
 *
 * 	- This gives a hook for the user to download the
 * 	network's weights.
 *
 * @param {Object} obj
 * @return {Object} this
 */

Mind.prototype.download = function() {
  return {
    hiddenOutputWeights: this.hiddenOutputWeights,
    inputHiddenWeights: this.inputHiddenWeights
  };
};

/**
 * Transform.
 *
 * 	- This gives a hook for the user to transform the dataset before and
 * 	after training.
 *
 * @param {Object} obj
 * @return {Object} this
 */

Mind.prototype.transform = function(obj) {
  this.transformer = obj;

  // allow chaining
  return this;
};
