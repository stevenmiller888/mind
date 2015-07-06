
/**
 * Currency transform.
 */

module.exports = {
  before: function(value) {
    return Number(value.slice(1));
  },
  after: function(value) {
    return '$' + value;
  }
};
