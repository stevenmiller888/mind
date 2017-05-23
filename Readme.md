![Mind Logo](https://cldup.com/D1yUfBz7Iu.png)

A flexible neural network library for Node.js and the browser. Check out a live [demo](http://stevenmiller888.github.io/mindjs.net/) of a movie recommendation engine built with Mind.

[![NPM version][npm-image]][npm-url]
[![build status][circle-image]][circle-url]
[![license][license-image]][license-url]

## Features

- Vectorized - uses a matrix implementation to process training data
- Configurable - allows you to customize the network topology
- Pluggable - download/upload minds that have already learned

## Installation

```bash
$ yarn add node-mind
```

## Usage

```js
const Mind = require('node-mind');

/**
 * Letters.
 *
 * - Imagine these # and . represent black and white pixels.
 */

const a = character(
  '.#####.' +
  '#.....#' +
  '#.....#' +
  '#######' +
  '#.....#' +
  '#.....#' +
  '#.....#'
)

const b = character(
  '######.' +
  '#.....#' +
  '#.....#' +
  '######.' +
  '#.....#' +
  '#.....#' +
  '######.'
)

const c = character(
  '#######' +
  '#......' +
  '#......' +
  '#......' +
  '#......' +
  '#......' +
  '#######'
)

/**
 * Learn the letters A through C.
 */

const mind = Mind()
  .learn([
    { input: a, output: map('a') },
    { input: b, output: map('b') },
    { input: c, output: map('c') }
  ])

/**
 * Predict the letter C, even with a pixel off.
 */

const result = mind.predict(character(
  '#######' +
  '#......' +
  '#......' +
  '#......' +
  '#......' +
  '##.....' +
  '#######'
))

console.log(result) // ~ 0.5

/**
 * Turn the # into 1s and . into 0s.
 */

function character(string) {
  return string
    .trim()
    .split('')
    .map(integer)

  function integer(symbol) {
    if ('#' === symbol) return 1
    if ('.' === symbol) return 0
  }
}

/**
 * Map letter to a number.
 */

function map(letter) {
  if (letter === 'a') return [ 0.1 ]
  if (letter === 'b') return [ 0.3 ]
  if (letter === 'c') return [ 0.5 ]
  return 0
}
```

## Plugins

Use plugins created by the Mind community to configure pre-trained networks that can go straight to making predictions.

Here's a cool example of the way you could use a hypothetical `mind-ocr` plugin:

```js
const Mind = require('node-mind')
const ocr = require('mind-ocr')

const mind = Mind()
  .upload(ocr)
  .predict(
    '.#####.' +
    '#.....#' +
    '#.....#' +
    '#######' +
    '#.....#' +
    '#.....#' +
    '#.....#'
  )
```

To create a plugin, simply call `download` on your trained mind:

```js
const Mind = require('node-mind')

const mind = Mind()
  .learn([
    { input: [0, 0], output: [ 0 ] },
    { input: [0, 1], output: [ 1 ] },
    { input: [1, 0], output: [ 1 ] },
    { input: [1, 1], output: [ 0 ] }
  ]);

const xor = mind.download()
```

Here's a list of available plugins:

- [xor](https://github.com/stevenmiller888/mind-xor)

## API

### Mind(options)
Create a new instance of Mind that can learn to make predictions.

The available options are:
* `activator`: the activation function to use, `sigmoid` or `htan`
* `learningRate`: the speed at which the network will learn
* `hiddenUnits`: the number of units in the hidden layer/s
* `iterations`: the number of iterations to run
* `hiddenLayers`: the number of hidden layers

#### .learn()

Learn from training data:

```js
mind.learn([
  { input: [0, 0], output: [ 0 ] },
  { input: [0, 1], output: [ 1 ] },
  { input: [1, 0], output: [ 1 ] },
  { input: [1, 1], output: [ 0 ] }
])
```

#### .predict()

Make a prediction:

```js
mind.predict([0, 1])
```

#### .download()

Download a mind:

```js
const xor = mind.download()
```

#### .upload()

Upload a mind:

```js
mind.upload(xor)
```

#### .on()

Listen for the 'data' event, which is fired with each iteration:

```js
mind.on('data', (iteration, errors, results) => {
  // ...
})
```

## Releasing / Publishing

CircleCI will handle publishing to npm. To cut a new release, just do:

```
$ git changelog --tag <version>
$ vim package.json # enter <version>
$ git release <version>
```

Where `<version>` follows the [semver](http://semver.org/) spec.

## Note

If you're interested in learning more, I wrote a blog post on how to build your own neural network:

- [How to Build a Neural Network](http://stevenmiller888.github.io/mind-how-to-build-a-neural-network/)

Also, here are some fantastic libraries you can check out:

- [convnetjs](https://github.com/karpathy/convnetjs)
- [synaptic](https://github.com/cazala/synaptic)
- [brain](https://github.com/harthur-org/brain.js)

## License

[MIT](https://tldrlegal.com/license/mit-license)

[npm-image]: https://img.shields.io/npm/v/node-mind.svg?style=flat-square
[npm-url]: https://npmjs.org/package/node-mind
[circle-image]: https://img.shields.io/circleci/project/stevenmiller888/mind.svg
[circle-url]: https://circleci.com/gh/stevenmiller888/mind
[license-image]: https://img.shields.io/npm/l/express.svg
[license-url]: https://tldrlegal.com/license/mit-license
