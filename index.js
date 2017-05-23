const sigmoidPrime = require('sigmoid-prime')
const Emitter = require('emitter-component')
const htanPrime = require('htan-prime')
const Matrix = require('node-matrix')
const sigmoid = require('sigmoid')
const sample = require('samples')
const htan = require('htan')

class Mind extends Emitter {
  /**
   * Initialize a new `Mind`.
   *
   * @param {Object} options
   * @return {Object} this
   * @api public
   */

  constructor (options) {
    super()

    options = options || {}

    if (options.activator === 'sigmoid') {
      this.activate = sigmoid
      this.activatePrime = sigmoidPrime
    } else {
      this.activate = htan
      this.activatePrime = htanPrime
    }

    // hyperparameters
    this.learningRate = options.learningRate || 0.7
    this.hiddenLayers = options.hiddenLayers || 1
    this.hiddenUnits = options.hiddenUnits || 3
    this.iterations = options.iterations || 10000
  }

  /**
   * Learn.
   *
   *  1. Normalize examples
   *  2. Setup weights
   *  3. Forward propagate to generate a prediction
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

  learn (examples) {
    examples = normalize(examples)

    if (!this.weights) {
      this.setup(examples)
    }

    for (let i = 0; i < this.iterations; i++) {
      const results = this.forward(examples)
      const errors = this.back(examples, results)
      this.emit('data', i, errors, results)
    }

    return this
  }

  /**
   * Setup the weights.
   *
   * @param {Object} examples
   * @api private
   */

  setup (examples) {
    this.weights = []

    // input > hidden
    this.weights.push(
      Matrix({
        rows: examples.input[0].length,
        columns: this.hiddenUnits,
        values: sample
      })
    )

    // hidden > hidden
    for (let i = 1; i < this.hiddenLayers; i++) {
      this.weights.push(
        Matrix({
          rows: this.hiddenUnits,
          columns: this.hiddenUnits,
          values: sample
        })
      )
    }

    // hidden > output
    this.weights.push(
      Matrix({
        rows: this.hiddenUnits,
        columns: examples.output[0].length,
        values: sample
      })
    )
  }

  /**
   * Forward propagate.
   *
   * @param {Object} examples
   * @return {Array} results
   * @api private
   */

  forward (examples) {
    const activate = this.activate
    const weights = this.weights
    const results = []

    // sum the weight and input
    function sum (w, i) {
      const res = {}

      res.sum = Matrix.multiply(w, i)
      res.result = res.sum.transform(activate)

      return res
    };

    // input > hidden
    results.push(
      sum(weights[0], examples.input)
    )

    // hidden > hidden
    for (let i = 1; i < this.hiddenLayers; i++) {
      results.push(
        sum(weights[i], results[i - 1].result)
      )
    }

    // hidden > output
    results.push(
      sum(weights[weights.length - 1], results[results.length - 1].result)
    )

    return results
  }

  /**
   * Back propagate.
   *
   * @param {Object} outputMatrix
   * @api private
   */

  back (examples, results) {
    const activatePrime = this.activatePrime
    const hiddenLayers = this.hiddenLayers
    const learningRate = this.learningRate
    const weights = this.weights

    // output > hidden
    const error = Matrix.subtract(examples.output, results[results.length - 1].result)
    let delta = Matrix.multiplyElements(results[results.length - 1].sum.transform(activatePrime), error)
    let changes = Matrix.multiplyScalar(Matrix.multiply(delta, results[hiddenLayers - 1].result.transpose()), learningRate)
    weights[weights.length - 1] = Matrix.add(weights[weights.length - 1], changes)

    // hidden > hidden
    for (let i = 1; i < hiddenLayers; i++) {
      delta = Matrix.multiplyElements(Matrix.multiply(weights[weights.length - i].transpose(), delta), results[results.length - (i + 1)].sum.transform(activatePrime))
      changes = Matrix.multiplyScalar(Matrix.multiply(delta, results[results.length - (i + 1)].result.transpose()), learningRate)
      weights[weights.length - (i + 1)] = Matrix.add(weights[weights.length - (i + 1)], changes)
    }

    // hidden > input
    delta = Matrix.multiplyElements(Matrix.multiply(weights[1].transpose(), delta), results[0].sum.transform(activatePrime))
    changes = Matrix.multiplyScalar(Matrix.multiply(delta, examples.input.transpose()), learningRate)
    weights[0] = Matrix.add(weights[0], changes)

    return error
  }

  /**
   * Predict.
   *
   * @param {Array} input
   * @api public
   */

  predict (input) {
    const results = this.forward({ input: Matrix([input]) })
    return results[results.length - 1].result[0]
  }

  /**
   * Upload weights.
   *
   * @param {Object} weights
   * @return {Object} this
   * @api public
   */

  upload (weights) {
    this.weights = weights
    return this
  }

  /**
   * Download weights.
   *
   * @return {Object} weights
   * @api public
   */

  download () {
    return this.weights
  }
}

module.exports = Mind

/**
 * Normalize the data.
 *
 * @param {Array} data
 * @return {Object} ret
 */

function normalize (data) {
  const ret = { input: [], output: [] }

  for (let i = 0; i < data.length; i++) {
    ret.output.push(data[i].output)
    ret.input.push(data[i].input)
  }

  ret.output = Matrix(ret.output)
  ret.input = Matrix(ret.input)

  return ret
}
