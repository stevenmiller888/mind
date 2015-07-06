
/**
 * Dependencies.
 */

var Matrix = require('node-matrix');

/**
 * References.
 */

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
}

/**
 * Use a transformation function.
 *
 * @param {Function} fn
 * @return {Object} this
 */

Mind.prototype.use = function(fn) {
  this.transform = fn;
  return this;
};

/**
 * Learn from examples.
 *
 * Analyze the training examples to learn the relationship between the inputs
 * and their corresponding outputs.
 *
 * @param {Array} examples
 * @return {Object} this
 */

Mind.prototype.learn = function(examples) {
  var transform = this.transform;

  // create the input/output matrices
  var input = [];
  var output = [];
  examples.forEach(function(example) {
    var currentInput = example.input;
    var currentOutput = example.output;

    if (transform) {
      currentInput = currentInput.map(transform.before);
      currentOutput = currentOutput.map(transform.before);
    }

    input.push(currentInput);
    output.push(currentOutput);
  });

  var inputMatrix = Matrix(input);
  var outputMatrix = Matrix(output);

  // setup the neurons
  var outputNeurons = examples[0].output.length;
  var inputNeurons = examples[0].input.length;
  var hiddenNeurons = this.hiddenNeurons;

  // setup the weights
  this.inputHiddenWeights = Matrix({ rows: inputNeurons, cols: hiddenNeurons, vals: sample });
  this.hiddenOutputWeights = Matrix({ rows: hiddenNeurons, cols: outputNeurons, vals: sample });

  // number of iterations
  for (var i = 0; i < 10000; i++) {
    // forward propagate
    this.forward(inputMatrix);

    // back propagate
    this.back(outputMatrix);
  }

  return this;
};

/**
 * Feedforward input through network.
 *
 * @param {Object} inputMatrix
 * @return {Object} this
 */

Mind.prototype.forward = function(inputMatrix) {
  this.inputMatrix = inputMatrix;

  // compute hidden layer sum
  this.hiddenSum = multiply(this.inputHiddenWeights, inputMatrix);

  // apply activation function to hidden layer sum
  this.hiddenOutput = this.hiddenSum.transform(sigmoid);

  // compute output layer sum
  this.outputSum = multiply(this.hiddenOutputWeights, this.hiddenOutput);

  // apply activation function to output layer sum
  this.outputResult = this.outputSum.transform(sigmoid);

  return this;
};

/**
 * Make a prediction.
 *
 * @param {Array} input
 */

Mind.prototype.predict = function(input) {
  var transform = this.transform;

  // apply `before` transform
  if (transform) {
    for (var i = 0; i < input.length; i++) {
      input[i] = transform.before(input[i]);
    }
  }

  // matrix-ify input data
  var inputMatrix = Matrix([input]);

  // forward propagate
  this.forward(inputMatrix);

  // prediction reference
  var prediction = this.outputResult;

  // apply `after` transform
  if (transform) {
    for (var j = 0; j < prediction.numRows; j++) {
      prediction[j] = transform.after(prediction[j]);
    }
  }

  return prediction[0];
};

/**
 * Backpropagate errors through the network.
 *
 * - Determines how to change the network weights in order to minimize the cost function
 *
 * @param {Object} target
 */

Mind.prototype.back = function(targetMatrix) {
  // compute output layer changes
  var errorOutputLayer = subtract(targetMatrix, this.outputResult);
  var deltaOutputLayer = dot(this.outputSum.transform(sigmoidPrime), errorOutputLayer.transform(negative));
  var hiddenOutputWeightsChanges = multiply(multiply(deltaOutputLayer, this.hiddenOutput.transpose()), this.learningRate);

  // compute hidden layer changes
  var multiplied = multiply(this.hiddenOutputWeights.transpose(), deltaOutputLayer);
  var deltaHiddenLayer = dot(multiplied, this.hiddenSum.transform(sigmoidPrime));
  var inputHiddenWeightsChanges = multiply(multiply(deltaHiddenLayer, this.inputMatrix.transpose()), this.learningRate);

  // compute the new weights
  this.inputHiddenWeights = add(this.inputHiddenWeights, inputHiddenWeightsChanges);
  this.hiddenOutputWeights = add(this.hiddenOutputWeights, hiddenOutputWeightsChanges);
};

/**
 * Generate a random sample from the Guassian distribution.
 *
 * - Uses the Box–Muller transform.
 */

function sample() {
  return Math.sqrt(-2 * Math.log(Math.random())) * Math.cos(2 * Math.PI * Math.random());
}

/**
 * Sigmoid activation function.
 *
 * - Non-linear, continuous, and differentiable logistic function.
 * - Useful for inputs between 0 and 1
 *
 * @param {Number} z
 */

function sigmoid(z) {
  return 1 / (1 + Math.exp(-z));
}

/**
 * Derivative of the sigmoid function.
 *
 * - Used to calculate the deltas.
 *
 * @param {Number} z
 */

function sigmoidPrime(z) {
  return Math.exp(-z) / Math.pow(1 + Math.exp(-z), 2);
}

/**
 * Return the negative of z.
 *
 * - Used in matrix transformation
 */

function negative(z) {
  return -z;
}
