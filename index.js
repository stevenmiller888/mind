!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.Mind=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){

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

  if (opts.activator === 'htan') {
    this.activate = htan;
    this.activatePrime = htanPrime;
  } else {
    this.activate = sigmoid;
    this.activatePrime = sigmoidPrime;
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
  this.inputHiddenWeights = obj.inputHiddenWeights;
  this.hiddenOutputWeights = obj.hiddenOutputWeights;

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
    inputHiddenWeights: this.inputHiddenWeights,
    hiddenOutputWeights: this.hiddenOutputWeights
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
  return this;
};

},{"htan":3,"htan-prime":2,"node-matrix":4,"samples":5,"sigmoid":7,"sigmoid-prime":6}],2:[function(require,module,exports){

/**
 * Expose `htanPrime`.
 */

module.exports = htanPrime;

/**
 * Derivative of the hyperbolic tangent function.
 *
 * @param {Number} z
 */

function htanPrime(z) {
  return 1 - Math.pow((Math.exp(2 * z) - 1) / (Math.exp(2 * z) + 1), 2);
}

},{}],3:[function(require,module,exports){

/**
 * Expose `htan`.
 */

module.exports = htan;

/**
 * Hyperbolic tangent function.
 *
 * - Useful for inputs between -1 and 1
 */

function htan(z) {
  return (Math.exp(2 * z) - 1) / (Math.exp(2 * z) + 1);
}
},{}],4:[function(require,module,exports){

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

},{}],5:[function(require,module,exports){

/**
 * Expose `sample`.
 */

module.exports = sample;

/**
 * Generate a random sample from the Guassian distribution.
 *
 * 	- Uses the Box–Muller transform: https://en.wikipedia.org/wiki/Box%E2%80%93Muller_transform
 */

function sample() {
  return Math.sqrt(-2 * Math.log(Math.random())) * Math.cos(2 * Math.PI * Math.random());
}

},{}],6:[function(require,module,exports){

/**
 * Expose `sigmoidPrime`.
 */

module.exports = sigmoidPrime;

/**
 * Derivative of the sigmoid function.
 *
 * - Used to calculate the deltas in neural networks.
 *
 * @param {Number} z
 */

function sigmoidPrime(z) {
  return Math.exp(-z) / Math.pow(1 + Math.exp(-z), 2);
}

},{}],7:[function(require,module,exports){

/**
 * Expose `sigmoid`.
 */

module.exports = sigmoid;

/**
 * sigmoid.
 *
 * 	- Non-linear, continuous, and differentiable logistic function.
 *
 * @param {Number} z
 */

function sigmoid(z) {
  return 1 / (1 + Math.exp(-z));
}

},{}]},{},[1])(1)
});