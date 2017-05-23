const Matrix = require('node-matrix')
const test = require('ava')
const Mind = require('./')

test('is a constructor', t => {
  const mind = new Mind()
  t.truthy(mind instanceof Mind)
})

test('accepts the number of hidden layer units as an option', t => {
  const mind = new Mind({ hiddenUnits: 2 })
  t.is(mind.hiddenUnits, 2)
})

test('accepts the number of hidden layer neurons as an option', t => {
  const mind = new Mind({ hiddenLayers: 3 })
  t.is(mind.hiddenLayers, 3)
})

test('accepts the learning rate as an option', t => {
  const mind = new Mind({ learningRate: 0.7 })
  t.is(mind.learningRate, 0.7)
})

test('accepts the number of learning iterations as an option', t => {
  const mind = new Mind({ iterations: 100000 })
  t.is(mind.iterations, 100000)
})

test('accepts the kind of activation function as an option', t => {
  const mind = new Mind({ activator: 'htan' })
  t.is(typeof mind.activate, 'function')
})

test('initializes with an activation function by default', t => {
  const mind = new Mind()
  t.is(typeof mind.activate, 'function')
})

test('initializes with the derivative of the activation function by default', t => {
  const mind = new Mind()
  t.is(typeof mind.activatePrime, 'function')
})

test('downloads the weights', t => {
  const plugin = new Mind().learn([{ input: [ 0 ], output: [ 0 ] }]).download()
  t.is(plugin[0].numRows, 1)
  t.is(plugin[0].numCols, 3)
  t.is(plugin[1].numRows, 3)
  t.is(plugin[1].numCols, 1)
})

test('uploads the weights', t => {
  const mind = new Mind().upload({ inputHidden: [], hiddenOutput: [] })
  t.deepEqual(mind.weights.inputHidden, [])
  t.deepEqual(mind.weights.hiddenOutput, [])
})

test('creates a weights matrix for the hidden layer to the output layer', t => {
  const mind = new Mind()
      .learn([
        { input: [0, 0], output: [ 0 ] },
        { input: [0, 1], output: [ 1 ] },
        { input: [1, 0], output: [ 1 ] },
        { input: [1, 1], output: [ 0 ] }
      ])

  t.truthy(mind.weights[1] instanceof Matrix)
})

test('creates a weights matrix for the input layer to the hidden layer', t => {
  const mind = new Mind()
      .learn([
        { input: [0, 0], output: [ 0 ] },
        { input: [0, 1], output: [ 1 ] },
        { input: [1, 0], output: [ 1 ] },
        { input: [1, 1], output: [ 0 ] }
      ])

  t.truthy(mind.weights[0] instanceof Matrix)
})

test('forward propagates the array argument and returns the output', t => {
  const mind = new Mind()
      .learn([
        { input: [0, 0], output: [ 0 ] },
        { input: [0, 1], output: [ 1 ] },
        { input: [1, 0], output: [ 1 ] },
        { input: [1, 1], output: [ 0 ] }
      ])

  t.truthy(mind.predict([0, 0]) instanceof Array)
})
