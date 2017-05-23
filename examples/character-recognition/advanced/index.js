
/**
 * Dependencies.
 */

const Picture = require('png-img')
const Mind = require('../../..')
const path = require('path')
const fs = require('fs')

/**
 * Learn.
 */

const mind = new Mind({ iterations: 100, activator: 'sigmoid' })
  .learn([
    { input: letter('A'), output: map('A') },
    { input: letter('B'), output: map('B') },
    { input: letter('C'), output: map('C') },
    { input: letter('D'), output: map('D') }
  ])

const result = mind.predict(letter('C'))
console.log(result) // ~ 0.5

/**
 * Get an image of the letter.
 */

function letter (character) {
  const letterImg = new Picture(fs.readFileSync(path.join(__dirname, './' + character + '.png')))
  const height = letterImg.img_.height
  const width = letterImg.img_.width
  const values = []

  for (let i = 0; i < width; i++) {
    for (let j = 0; j < height; j++) {
      const k = letterImg.get(i, j)
      values.push(k.r / 255)
      values.push(k.g / 255)
      values.push(k.b / 255)
      values.push(k.a / 255)
    }
  }

  return values
}

/**
 * Map the letter to a number.
 */

function map (character) {
  if (character === 'A') return [ 0.1 ]
  if (character === 'B') return [ 0.3 ]
  if (character === 'C') return [ 0.5 ]
  if (character === 'D') return [ 0.7 ]
  return 0
}
