/**
 * 找出其中的所有数字，每个乘以2.
 */

module.exports = function(source) {
  return source.replace(/\d+/g, val => Number(val) * 2)
}
