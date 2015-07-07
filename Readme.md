
# Mind
[![NPM version][npm-image]][npm-url]
[![build status][circle-image]][circle-url]
[![license][license-image]][license-url]

Mind is a flexible neural network library.

## Features

- Optimized - uses a vectorized implementation to optimize computation
- Pluggable - apply transforms so you can pass in diverse datasets
- Configurable - allows you to choose the network parameters

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

Use transformation plugins so you can perform analysis on any dataset. A transform is just an object with a `before` function and an `after` function, which will be applied to the data before and after analysis. Here's an example currency transform:

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

```
[
  { input: ["$1500", "$870"], output: [ "$1010" ] },
  { input: ["$1400", "$700"], output: [ "$1140" ] },
  { input: ["$2000", "$1100"], output: [ "$1432" ] },
  { input: ["$1800", "$1000"], output: [ "$910" ] }
]
```

## License

[MIT](https://tldrlegal.com/license/mit-license)

[npm-image]: https://img.shields.io/npm/v/node-mind.svg?style=flat-square
[npm-url]: https://npmjs.org/package/node-mind
[circle-image]: https://img.shields.io/circleci/project/stevenmiller888/mind.svg
[circle-url]: https://circleci.com/gh/stevenmiller888/mind
[license-image]: https://img.shields.io/npm/l/express.svg
[license-url]: https://tldrlegal.com/license/mit-license