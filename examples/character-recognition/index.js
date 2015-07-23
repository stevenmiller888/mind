
/**
 * Dependencies.
 */

var character = require('./character');
var Mind = require('../..');

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
