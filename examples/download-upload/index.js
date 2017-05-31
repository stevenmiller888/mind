
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

/**
 * Download the mind.
 */

const downloadedMind = mind.download()

/**
 * Upload the downloaded mind.
 */

const uploadedMind = new Mind().upload(downloadedMind)

/**
 * Predict.
 */

const result = uploadedMind.predict([0, 1])
console.log(result)  // ~ 1
