
/**
 * Dependencies.
 */

var xor = require('mind-xor');
var Mind = require('../..');

/**
 * Upload xor.
 */

var mind = Mind().upload(xor);
var result = mind.predict([0, 1]);
console.log(result);  // ~ 1
