!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.Mind=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){

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

},{"emitter-component":2,"htan":4,"htan-prime":3,"node-matrix":5,"samples":6,"sigmoid":8,"sigmoid-prime":7}],2:[function(require,module,exports){

/**
 * Expose `Emitter`.
 */

module.exports = Emitter;

/**
 * Initialize a new `Emitter`.
 *
 * @api public
 */

function Emitter(obj) {
  if (obj) return mixin(obj);
};

/**
 * Mixin the emitter properties.
 *
 * @param {Object} obj
 * @return {Object}
 * @api private
 */

function mixin(obj) {
  for (var key in Emitter.prototype) {
    obj[key] = Emitter.prototype[key];
  }
  return obj;
}

/**
 * Listen on the given `event` with `fn`.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.on =
Emitter.prototype.addEventListener = function(event, fn){
  this._callbacks = this._callbacks || {};
  (this._callbacks[event] = this._callbacks[event] || [])
    .push(fn);
  return this;
};

/**
 * Adds an `event` listener that will be invoked a single
 * time then automatically removed.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.once = function(event, fn){
  var self = this;
  this._callbacks = this._callbacks || {};

  function on() {
    self.off(event, on);
    fn.apply(this, arguments);
  }

  on.fn = fn;
  this.on(event, on);
  return this;
};

/**
 * Remove the given callback for `event` or all
 * registered callbacks.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.off =
Emitter.prototype.removeListener =
Emitter.prototype.removeAllListeners =
Emitter.prototype.removeEventListener = function(event, fn){
  this._callbacks = this._callbacks || {};

  // all
  if (0 == arguments.length) {
    this._callbacks = {};
    return this;
  }

  // specific event
  var callbacks = this._callbacks[event];
  if (!callbacks) return this;

  // remove all handlers
  if (1 == arguments.length) {
    delete this._callbacks[event];
    return this;
  }

  // remove specific handler
  var cb;
  for (var i = 0; i < callbacks.length; i++) {
    cb = callbacks[i];
    if (cb === fn || cb.fn === fn) {
      callbacks.splice(i, 1);
      break;
    }
  }
  return this;
};

/**
 * Emit `event` with the given args.
 *
 * @param {String} event
 * @param {Mixed} ...
 * @return {Emitter}
 */

Emitter.prototype.emit = function(event){
  this._callbacks = this._callbacks || {};
  var args = [].slice.call(arguments, 1)
    , callbacks = this._callbacks[event];

  if (callbacks) {
    callbacks = callbacks.slice(0);
    for (var i = 0, len = callbacks.length; i < len; ++i) {
      callbacks[i].apply(this, args);
    }
  }

  return this;
};

/**
 * Return array of callbacks for `event`.
 *
 * @param {String} event
 * @return {Array}
 * @api public
 */

Emitter.prototype.listeners = function(event){
  this._callbacks = this._callbacks || {};
  return this._callbacks[event] || [];
};

/**
 * Check if this emitter has `event` handlers.
 *
 * @param {String} event
 * @return {Boolean}
 * @api public
 */

Emitter.prototype.hasListeners = function(event){
  return !! this.listeners(event).length;
};

},{}],3:[function(require,module,exports){

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

},{}],4:[function(require,module,exports){

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
},{}],5:[function(require,module,exports){

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

},{}],6:[function(require,module,exports){

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

},{}],7:[function(require,module,exports){

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

},{}],8:[function(require,module,exports){

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