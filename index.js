const sigmoidPrime = require('sigmoid-prime')
const Emitter = require('emitter-component')
const htanPrime = require('htan-prime')
const math = require('mathjs')
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
    this.weights.push(math.ones(examples.input[0].length, this.hiddenUnits))

    // hidden > hidden
    for (let i = 1; i < this.hiddenLayers; i++) {
      this.weights.push(math.ones(this.hiddenUnits, this.hiddenUnits))
    }

    // hidden > output
    this.weights.push(math.ones(this.hiddenUnits, examples.output[0].length))
  }

  // ones: cols x row

  /**
   * Forward propagate.
   *
   * @param {Object} examples
   * @return {Array} results
   * @api private
   */

  forward (examples) {
    const results = []

    // input > hidden
    results.push(this.sum(this.weights[0], examples.input))

    // hidden > hidden
    for (let i = 1; i < this.hiddenLayers; i++) {
      results.push(this.sum(this.weights[i], results[i - 1].result))
    }

    // hidden > output
    results.push(this.sum(this.weights[this.weights.length - 1], results[results.length - 1].result))

    return results
  }

  /**
   * Sum `weight` and `input`.
   *
   * @param {Matrix} weight
   * @param {Array} input
   * @return {Object}
   * @api private
   */

  sum (weight, input) {
    const res = {}

    res.sum = math.multiply(input, weight)
    res.result = res.sum.map((value) => this.activate(value))

    return res
  }

  /**
   * Back propagate.
   *
   * @param {Object} outputMatrix
   * @api private
   */

  back (examples, results) {
    const hiddenLayers = this.hiddenLayers
    const learningRate = this.learningRate
    const weights = this.weights

    // output > hidden
    const error = math.subtract(examples.output, results[results.length - 1].result)
    let delta = math.dotMultiply(results[results.length - 1].sum.map(value => this.activatePrime(value)), error)
    let changes = math.multiply(math.transpose(results[hiddenLayers - 1].result), delta).map(value => value * learningRate)
    weights[weights.length - 1] = math.add(weights[weights.length - 1], changes)

    // hidden > hidden
    for (let i = 1; i < hiddenLayers; i++) {
      delta = math.dotMultiply(math.multiply(delta, math.transpose(weights[weights.length - i])), results[results.length - (i + 1)].sum.map(value => this.activatePrime(value)))
      changes = math.multiply(math.transpose(results[results.length - (i + 1)].result), delta).map(value => value * learningRate)
      weights[weights.length - (i + 1)] = math.add(weights[weights.length - (i + 1)], changes)
    }

    // hidden > input
    delta = math.dotMultiply(math.multiply(delta, math.transpose(weights[1])), results[0].sum.map(value => this.activatePrime(value)))
    changes = math.multiply(math.transpose(examples.input), delta).map(value => value * learningRate)
    weights[0] = math.add(weights[0], changes)

    return error
  }

  /**
   * Predict.
   *
   * @param {Array} input
   * @api public
   */

  predict (input) {
    const results = this.forward({ input: [ input ] })
    return results[results.length - 1].result._data[0]
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

  ret.output = ret.output
  ret.input = ret.input

  return ret
}
