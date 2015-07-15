![Mind Logo](https://cldup.com/D1yUfBz7Iu.png)

A flexible neural network library for Node.js and the browser.

[![NPM version][npm-image]][npm-url]
[![build status][circle-image]][circle-url]
[![license][license-image]][license-url]

## Features

- Vectorized - uses a matrix implementation to efficiently process training data
- Pluggable - apply transforms so you can pass in diverse datasets
- Configurable - allows you to customize the network topology

## Installation

    $ npm install node-mind

## Usage

```js
var Mind = require('node-mind');
var mind = Mind();

mind.learn([
  { input: [0, 0], output: [ 0 ] },
  { input: [0, 1], output: [ 1 ] },
  { input: [1, 0], output: [ 1 ] },
  { input: [1, 1], output: [ 0 ] }
]);

mind.predict([ 1, 0 ]); // ~ 1
```

## Plugins

Use transformation plugins so you can perform analysis on any dataset. A transform is just an object with a `before` function and an `after` function, which will be applied to each data point before and after analysis. Here's an example currency transform:

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

This lets you to pass it in the following training data:

```js
[
  { input: ["$1500", "$870"], output: [ "$1010" ] },
  { input: ["$1400", "$700"], output: [ "$1140" ] },
  { input: ["$2000", "$1100"], output: [ "$1432" ] },
  { input: ["$1800", "$1000"], output: [ "$910" ] }
]
```

Here's a list of available plugins:

- [currency](https://github.com/stevenmiller888/mind-currency)

## API

### Mind(options)
Create a new instance of Mind that can learn to make predictions.

The available options are:
* `learningRate`: how quickly the network should learn.
* `hiddenNeurons`: how many neurons are in the hidden layer.
* `activator`: which activation function to use, `sigmoid` or `tanh`.

#### .learn()

Learn from training data, which should look something like the following:

```js
[
  { input: [0, 0], output: [ 0 ] },
  { input: [0, 1], output: [ 1 ] },
  { input: [1, 0], output: [ 1 ] },
  { input: [1, 1], output: [ 0 ] }
]
```

#### .predict()

Make a new prediction after training is finished. You can pass an array:

```
[0, 0]
```

## License

[MIT](https://tldrlegal.com/license/mit-license)

[npm-image]: https://img.shields.io/npm/v/node-mind.svg?style=flat-square
[npm-url]: https://npmjs.org/package/node-mind
[circle-image]: https://img.shields.io/circleci/project/stevenmiller888/mind.svg
[circle-url]: https://circleci.com/gh/stevenmiller888/mind
[license-image]: https://img.shields.io/npm/l/express.svg
[license-url]: https://tldrlegal.com/license/mit-license