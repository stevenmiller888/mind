
/**
 * Dependencies.
 */

var Mind = require('../..');


var letterA = [
  0, 0, 1, 0, 0,
  0, 1, 0, 1, 0,
  1, 0, 0, 0, 1,
  1, 1, 1, 1, 1,
  1, 0, 0, 0, 1,
  1, 0, 0, 0, 1,
  1, 0, 0, 0, 1
];

var letterB = [
  1, 1, 1, 1, 0,
  1, 0, 0, 0, 1,
  1, 0, 0, 0, 1,
  1, 1, 1, 1, 0,
  1, 0, 0, 0, 1,
  1, 0, 0, 0, 1,
  1, 1, 1, 1, 0
];

var letterC = [
  1, 1, 1, 1, 1,
  1, 0, 0, 0, 0,
  1, 0, 0, 0, 0,
  1, 0, 0, 0, 0,
  1, 0, 0, 0, 0,
  1, 0, 0, 0, 0,
  1, 1, 1, 1, 1
];

/**
 * Learn the letters A through C.
 */

var mind = Mind()
  .learn([
    { input: letterA, output: [ 0.1 ] },
    { input: letterB, output: [ 0.2 ] },
    { input: letterC, output: [ 0.3 ] }
  ]);

/**
 * Predict the letter C, even with pixel off.
 */

var result = mind.predict([
  1, 1, 1, 1, 1,
  1, 0, 0, 0, 0,
  1, 0, 0, 0, 0,
  1, 0, 0, 0, 0,
  1, 0, 0, 0, 0,
  1, 1, 0, 0, 0,
  1, 1, 1, 1, 1
]);

console.log(result); // ~ 0.3
