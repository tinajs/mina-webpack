const loaderUtils = require('loader-utils')

module.exports = function (source) {
  this.cacheable()

  const done = this.async()
  const options = loaderUtils.getOptions(this) || {}
  const context = options.context || this.options.context
  const url = loaderUtils.getRemainingRequest(this)

  this.emitFile(loaderUtils.interpolateName(this, `[path][name].${options.ext}`, {
    context,
    source,
  }), source)

  done(null, '')
}
