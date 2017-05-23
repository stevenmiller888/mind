
/**
 * Turn the # into 1s and . into 0s.
 */

module.exports = (string) => {
  return string
    .trim()
    .split('')
    .map((symbol) => {
      if (symbol === '#') return 1
      if (symbol === '.') return 0
    })
}
