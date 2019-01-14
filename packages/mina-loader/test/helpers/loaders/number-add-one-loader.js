/**
 * 找出其中的所有数字，每个加上1.
 */

module.exports = function(source) {
  return source.replace(/\d+/g, val => Number(val) + 1)
}
