
/**
 * Dependencies.
 */

const character = require('./character')
const Mind = require('../../..')

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

const mind = new Mind({ activator: 'sigmoid' })
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
 * Map the letter to a number.
 */

function map (letter) {
  if (letter === 'a') return [ 0.1 ]
  if (letter === 'b') return [ 0.3 ]
  if (letter === 'c') return [ 0.5 ]
  return 0
}
