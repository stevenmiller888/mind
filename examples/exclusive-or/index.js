
/**
 * Dependencies.
 */

const Mind = require('../..')

/**
 * Learn the XOR gate.
 */

const mind = new Mind()
  .learn([
    { input: [0, 0], output: [ 0 ] },
    { input: [0, 1], output: [ 1 ] },
    { input: [1, 0], output: [ 1 ] },
    { input: [1, 1], output: [ 0 ] }
  ])

const result = mind.predict([ 1, 0 ])
console.log(result) // ~ 1
