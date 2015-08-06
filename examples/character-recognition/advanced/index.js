
/**
 * Dependencies.
 */

var Picture = require('png-img');
var Mind = require('../../..');
var path = require('path');
var fs = require('fs');

/**
 * Learn.
 */

var mind = Mind({ iterations: 10, activator: 'sigmoid', hiddenLayers: 2 })
  .learn([
    { input: letter('A'), output: map('A') },
    { input: letter('B'), output: map('B') },
    { input: letter('C'), output: map('C') },
    { input: letter('D'), output: map('D') }
  ]);

var result = mind.predict(letter('C'));
console.log(result); // ~ 0.5

/**
 * Get an image of the letter.
 */

function letter(character) {
  var letterImg = new Picture(fs.readFileSync(path.join(__dirname, './' + character + '.png')));
  var height = letterImg.img_.height;
  var width = letterImg.img_.width;
  var values = [];

  for (var i = 0; i < width; i++) {
    for (var j = 0; j < height; j++) {
      var k = letterImg.get(i, j);
      values.push(k.r / 255);
      values.push(k.g / 255);
      values.push(k.b / 255);
      values.push(k.a / 255);
    }
  }
  
  return values;
}

/**
 * Map the letter to a number.
 */

function map(character) {
  if (character === 'A') return [ 0.1 ];
  if (character === 'B') return [ 0.3 ];
  if (character === 'C') return [ 0.5 ];
  if (character === 'D') return [ 0.7 ];
  return 0;
}

