
/**
 * Turn the # into 1s and . into 0s.
 */

module.exports = function(string) {
  return string
    .trim()
    .split('')
    .map(integer);

  function integer(symbol) {
    if (symbol === '#') return 1;
    if (symbol === '.') return 0;
  }
};
