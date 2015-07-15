
/**
 * Dependencies.
 */

var Mind = require('..');

/**
 * Mind.
 */

var mind = Mind({ learningRate: 0.3 })
  .learn([
    { input: [ 0, 0 ], output: [ 0 ] },
    { input: [ 0, 1 ], output: [ 1 ] },
    { input: [ 1, 0 ], output: [ 1 ] },
    { input: [ 1, 1 ], output: [ 0 ] }
  ]);

var result = mind.predict([ 1, 0 ]); // ~ 1
console.log(result);
