const loaderUtils = require('loader-utils')

module.exports = {}
module.exports.pitch = function (source) {
  this.cacheable()

  const options = loaderUtils.getOptions(this) || {}
  const context = options.context || this.options.context
  const url = loaderUtils.getRemainingRequest(this)

  const output = `import(/* webpackChunkName: "${loaderUtils.interpolateName(this, '[path][name].js', { context })}" */ ${loaderUtils.stringifyRequest(this, `!!${url}`)})`

  return output
}
