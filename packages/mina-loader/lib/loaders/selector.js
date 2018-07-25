const loaderUtils = require('loader-utils')
const parserLoaderPath = require.resolve('./parser')

module.exports = function() {
  this.cacheable()
  const cb = this.async()
  const { type } = loaderUtils.getOptions(this) || {}
  const url = `!!${parserLoaderPath}!${loaderUtils.getRemainingRequest(this)}`
  this.loadModule(url, (err, source) => {
    if (err) {
      return cb(err)
    }
    const parts = this.exec(source, url)
    const part = parts[type]
    if (part && part.attributes && part.attributes.src) {
      this.loadModule(part.attributes.src, (err, source) => {
        if (err) {
          return cb(err)
        }
        cb(null, source)
      })
      return
    }
    cb(null, parts[type].content)
  })
}
