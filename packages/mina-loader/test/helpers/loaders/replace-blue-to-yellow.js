/**
 * A loader for testing, replacing the `blue` in the code to `yellow`
 */

module.exports = function(source) {
  return source.replace(/blue/g, 'yellow')
}
