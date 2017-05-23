
/**
 * Dependencies.
 */

const xor = require('mind-xor')
const Mind = require('../..')

/**
 * Upload xor.
 */

const mind = new Mind().upload(xor)
const result = mind.predict([0, 1])
console.log(result)  // ~ 1
