!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.mind=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){

/**
 * Dependencies.
 */

var Matrix = require('node-matrix');

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
  this.activate = opts.activator === 'tanh' ? tanh : sigmoid;
  this.activatePrime = opts.activator === 'tanh' ? tanhPrime : sigmoidPrime;
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
  this.inputHiddenWeights = Matrix({ rows: inputNeurons, columns: hiddenNeurons, values: sample });
  this.hiddenOutputWeights = Matrix({ rows: hiddenNeurons, columns: outputNeurons, values: sample });

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
  var activate = this.activate;

  // compute hidden layer sum
  this.hiddenSum = multiply(this.inputHiddenWeights, inputMatrix);

  // apply activation function to hidden layer sum
  this.hiddenResult = this.hiddenSum.transform(activate);

  // compute output layer sum
  this.outputSum = multiply(this.hiddenOutputWeights, this.hiddenResult);

  // apply activation function to output layer sum
  this.outputResult = this.outputSum.transform(activate);

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
  var activate = this.activate;
  var activatePrime = this.activatePrime;

  // compute output layer changes
  var errorOutputLayer = subtract(targetMatrix, this.outputResult); // what did you predict, NN? what should it be? what's the differnce?
  var deltaOutputLayer = dot(this.outputSum.transform(activatePrime), errorOutputLayer);  //
  var hiddenOutputWeightsChanges = scalar(multiply(deltaOutputLayer, this.hiddenResult.transpose()), this.learningRate);

  // compute hidden layer changes
  var multiplied = multiply(this.hiddenOutputWeights.transpose(), deltaOutputLayer);
  var deltaHiddenLayer = dot(multiplied, this.hiddenSum.transform(activatePrime));
  var inputHiddenWeightsChanges = scalar(multiply(deltaHiddenLayer, this.inputMatrix.transpose()), this.learningRate);

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
 * Sigmoid function.
 *
 * - Non-linear, continuous, and differentiable logistic function.
 * - Useful for inputs between 0 and 1
 * - Serves as the activation function
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
 * Hyperbolic tangent function.
 *
 * - Useful for inputs between -1 and 1
 */

function tanh(z) {
  return (Math.exp(2 * z) - 1) / (Math.exp(2 * z) + 1)
}

/**
 * Derivative of the hyperbolic tangent function.
 */

function tanhPrime(z) {
  return 1 - Math.pow((Math.exp(2 * z) - 1) / (Math.exp(2 * z) + 1), 2)
}

},{"node-matrix":2}],2:[function(require,module,exports){

/**
 * Expose `Matrix`.
 */

module.exports = Matrix;

/**
 * Matrix.
 *
 * @param {Object|Array} opts
 * @return {Object} this
 */

function Matrix(opts) {
  if (!(this instanceof Matrix)) return new Matrix(opts);

  if (Array.isArray(opts)) { // Passing in values
    this.numRows = opts.length;
    this.numCols = opts[0].length;

    for (var i = 0; i < this.numRows; i++) {
      this[i] = [];

      for (var j = 0; j < this.numCols; j++) {
        this[i][j] = opts[i][j];
      }
    }
  } else if (typeof opts === 'object') {  // Passing in dimensions
    this.numRows = opts.rows;
    this.numCols = opts.columns;

    for (var i = 0; i < this.numRows; i++) {
      this[i] = [];

      for (var j = 0; j < this.numCols; j++) {
        if (typeof opts.values === 'function') {
          this[i][j] = opts.values();
        } else if (typeof opts.values === 'number') {
          this[i][j] = opts.values;
        } else {
          this[i][j] = 0;
        }
      }
    }
  } else {
    throw new Error('You must supply an object or an array');
  }

  this.dimensions = [this.numRows, this.numCols];
}

/**
 * Add.
 *
 * @param {Matrix} m1
 * @param {Matrix} m2
 * @return {Matrix} result
 */

Matrix.add = function(m1, m2) {
  if (!(m1 instanceof Matrix) || !(m2 instanceof Matrix)) {
    throw new Error('You must supply two valid matrices');
  }

  // Number of rows and columns in first must equal number of rows and columns in second
  if (m1.numRows !== m2.numRows || m1.numCols !== m2.numCols) {
    throw new Error('You can only add matrices with equal dimensions');
  }

  var result = new Matrix({ rows: m1.numRows, columns: m1.numCols });

  for (var i = 0; i < m1.numRows; i++) {
		for (var j = 0; j < m1.numCols; j++) {
			result[i][j] = m1[i][j] + m2[i][j];
		}
	}

  return result;
};

/**
 * Subtract.
 *
 * @param {Matrix} m1
 * @param {Matrix} m2
 * @return {Matrix} result
 */

Matrix.subtract = function(m1, m2) {
  if (!(m1 instanceof Matrix) || !(m2 instanceof Matrix)) {
    throw new Error('You must supply two valid matrices');
  }

  // Number of rows and number of columns in first must equal number of rows and number of columns in second
  if (m1.numRows !== m2.numRows || m1.numCols !== m2.numCols) {
    throw new Error('You can only subtract matrices with equal dimensions');
  }

  var result = new Matrix({ rows: m1.numRows, columns: m1.numCols });

  for (var i = 0; i < m1.numRows; i++) {
		for (var j = 0; j < m1.numCols; j++) {
			result[i][j] = m1[i][j] - m2[i][j];
		}
	}

  return result;
};

/**
 * Matrix multiplication.
 *
 * @param {Matrix} m1
 * @param {Matrix} m2
 * @return {Matrix} result
 */

Matrix.multiply = function(m1, m2) {
  if (!(m1 instanceof Matrix) || !(m2 instanceof Matrix)) {
    throw new Error('You must supply two valid matrices');
  }

  var result = Matrix({ rows: m2.numRows, columns: m1.numCols });

  for (var i = 0; i < m2.numRows; i++) {
    result[i] = [];

    for (var j = 0; j < m1.numCols; j++) {
      var sum = 0;

      for (var k = 0; k < m1.numRows; k++) {
        sum += m1[k][j] * m2[i][k];
      }

      result[i][j] = sum;
    }
  }

  return result;
};

/**
 * Scalar multiplication.
 *
 * @param {Matrix} m1
 * @param {Number} num
 * @return {Matrix} result
 */

Matrix.multiplyScalar = function(m1, num) {
  if (!(m1 instanceof Matrix) || !(typeof num === 'number')) {
    throw new Error('You must supply a valid matrix and a number');
  }

  var result = Matrix({ rows: m1.numRows, columns: m1.numCols });

  for (var i = 0; i < m1.numRows; i++) {
    for (var j = 0; j < m1.numCols; j++) {
      result[i][j] = m1[i][j] * num;
    }
  }

  return result;
};

/**
 * Element-wise multiplcation.
 *
 * @param {Matrix} m1
 * @param {Matrix} m2
 * @return {Matrix} result
 */

Matrix.multiplyElements = function(m1, m2) {
  if (!(m1 instanceof Matrix) || !(m2 instanceof Matrix)) {
    throw new Error('You must supply two valid matrices');
  }

  var result = Matrix({ rows: m1.numRows, columns: m1.numCols })

  for (var i = 0; i < m1.numRows; i++) {
   result[i] = [];

   for (var j = 0; j < m1[i].length; j++) {
     result[i][j] = m1[i][j] * m2[i][j];
   }
  }

  return result;
};

/**
 * Compute the tranpose.
 *
 * @return {Matrix} result
 */

Matrix.prototype.transpose = function() {
  var result = Matrix({ rows: this.numCols, columns: this.numRows });

  for (var i = 0; i < this.numCols; i++) {
    result[i] = [];

    for (var j = 0; j < this.numRows; j++) {
      result[i][j] = this[j][i];
    }
  }

  return result;
};

/**
 * Call a function on each element in the matrix.
 *
 * @param {Function} fn
 * @return {Matrix} result
 */

Matrix.prototype.transform = function(fn) {
  var result = Matrix({ rows: this.numRows, columns: this.numCols });

  for (var i = 0; i < result.numRows; i++) {
		for (var j = 0; j < result.numCols; j++) {
			result[i][j] = fn(this[i][j]);
		}
	}

  return result;
};

},{}]},{},[1])(1)
});