![Mind Logo](https://cldup.com/D1yUfBz7Iu.png)

A flexible neural network library for Node.js and the browser. Check out a live [demo](http://www.mindjs.net/) of a movie recommendation engine built with Mind.

[![NPM version][npm-image]][npm-url]
[![build status][circle-image]][circle-url]
[![license][license-image]][license-url]

## Features

- Vectorized - uses a matrix implementation to efficiently process training data
- Transformable - apply transforms so you can pass in diverse datasets
- Configurable - allows you to customize the network topology
- Pluggable - download/upload minds that have already learned

## Installation

    $ npm install node-mind

## Usage

```js
var Mind = require('node-mind');

/**
 * Letters.
 *
 * - Imagine these # and . represent black and white pixels.
 */

var a = character(
  '.####.' +
  '#....#' +
  '#....#' +
  '######' +
  '#....#' +
  '#....#' +
  '#....#'
);

var b = character(
  '#####.' +
  '#....#' +
  '#....#' +
  '#####.' +
  '#....#' +
  '#....#' +
  '#####.'
);

var c = character(
  '######' +
  '#.....' +
  '#.....' +
  '#.....' +
  '#.....' +
  '#.....' +
  '######'
);

/**
 * Learn the letters A through C.
 */

var mind = Mind()
  .learn([
    { input: a, output: [ 0.1 ] },
    { input: b, output: [ 0.2 ] },
    { input: c, output: [ 0.3 ] }
  ]);

/**
 * Predict the letter C, even with a pixel off.
 */

var result = mind.predict(character(
  '######' +
  '#.....' +
  '#.....' +
  '#.....' +
  '#.....' +
  '##....' +
  '######'
));

console.log(result); // ~ 0.3

/**
 * Turn the # into 1s and . into 0s.
 */

function character(string) {
  return string
    .trim()
    .split('')
    .map(integer);

  function integer(symbol) {
    if ('#' === symbol) return 1;
    if ('.' === symbol) return 0;
  }
};
```

You can use Mind in the browser by requiring it with Duo or Browserify. Or you can simply use the prebuilt root `index.js` file directly, which will expose `Mind` on the `window` object.

## Plugins

Use plugins created by the Mind community to configure pre-trained networks that can go straight to making predictions.

Here's a cool example of the way you could use a hypothetical `mind-ocr` plugin:

```js
var Mind = require('node-mind');
var ocr = require('mind-ocr');

var mind = Mind()
  .upload(ocr)
  .predict(
    '.####.' +
    '#....#' +
    '#....#' +
    '######' +
    '#....#' +
    '#....#' +
    '#....#'
  );
```

To create a plugin, simply call `download` on your trained mind:

```js
var Mind = require('node-mind');

var mind = Mind()
  .learn([
    { input: [0, 0], output: [ 0 ] },
    { input: [0, 1], output: [ 1 ] },
    { input: [1, 0], output: [ 1 ] },
    { input: [1, 1], output: [ 0 ] }
  ]);

var xor = mind.download();
```

Here's a list of available plugins:

- [xor](https://github.com/stevenmiller888/mind-xor)

## Transforms

Use transforms so you can perform analysis on any dataset. A transform is just an object with a `before` function and an `after` function, which will be applied to each data point before and after analysis. Here's an example currency transform:

```js
var currency = {
  before: function(value) {
    return Number(value.slice(1));
  },
  after: function(value) {
    return '$' + value;
  }
};
```

You can apply this transform to the dataset in the following way:

```js
var currency = require('mind-currency');
var Mind = require('node-mind');

var mind = Mind()
  .transform(currency)
  .learn([
    { input: ["$1500", "$870"], output: [ "$1010" ] },
    { input: ["$1400", "$700"], output: [ "$1140" ] },
    { input: ["$2000", "$1100"], output: [ "$1432" ] },
    { input: ["$1800", "$1000"], output: [ "$910" ] }
  ])
  .predict([ "$3288", "$170" ]);
```

Here's a list of available transforms:

- [currency](https://github.com/stevenmiller888/mind-currency)

## API

### Mind(options)
Create a new instance of Mind that can learn to make predictions.

The available options are:
* `learningRate`: how quickly the network should learn.
* `hiddenNeurons`: how many neurons are in the hidden layer.
* `activator`: which activation function to use, `sigmoid` or `htan`.
* `iterations`: the number of iterations to run.

#### .learn()

Learn from training data:

```js
mind.learn([
  { input: [0, 0], output: [ 0 ] },
  { input: [0, 1], output: [ 1 ] },
  { input: [1, 0], output: [ 1 ] },
  { input: [1, 1], output: [ 0 ] }
]);
```

#### .predict()

Make a new prediction:

```js
mind.predict([0, 1]);
```

#### .download()

Download the mind:

```js
var xor = mind.download();
```

#### .upload()

Upload a mind:

```js
mind.upload(xor);
```

## Note

This is a very simple library and there are far more sophisticated neural network libraries out there. Why did I build Mind then? Because I love figuring out how things work and sometimes you just need to build shit in order to understand how they work. Also, I wanted to write a library with clear, readable code that wouldn't scare newcomers away from the wonderful world of machine learning :)

If you're interested in learning more about neural networks, you'll definitely want to check out these fantastic libraries:

- [convnetjs](https://github.com/karpathy/convnetjs)
- [synaptic](https://github.com/cazala/synaptic)
- [brain](https://github.com/harthur/brain)

## License

[MIT](https://tldrlegal.com/license/mit-license)

[npm-image]: https://img.shields.io/npm/v/node-mind.svg?style=flat-square
[npm-url]: https://npmjs.org/package/node-mind
[circle-image]: https://img.shields.io/circleci/project/stevenmiller888/mind.svg
[circle-url]: https://circleci.com/gh/stevenmiller888/mind
[license-image]: https://img.shields.io/npm/l/express.svg
[license-url]: https://tldrlegal.com/license/mit-license
