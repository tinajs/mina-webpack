const loaderUtils = require('loader-utils')
const { dirname } = require('path')
const resolve = require('resolve')
const parserLoaderPath = require.resolve('./parser')

const { TYPES_FOR_FILE_LOADER, TYPES_FOR_OUTPUT } = require('../constants')
const { loadModule } = require('../helpers')

function isSameDiretory(currentResourcePath, requestUrl) {
  let requestPath = requestUrl.split('!').slice(-1)[0]
  let currentDiretory = dirname(currentResourcePath)
  let requestFullpath = resolve.sync(requestPath, { basedir: currentDiretory })
  return currentDiretory === dirname(requestFullpath)
}

module.exports = function() {
  this.cacheable()
  const cb = this.async()
  const { type } = loaderUtils.getOptions(this) || {}
  const { resourcePath } = this
  const url = `!!${parserLoaderPath}!${loaderUtils.getRemainingRequest(this)}`
  loadModule
    .call(this, url)
    .then(source => {
      const parts = this.exec(source, url)
      const part = parts[type]
      if (part && part.attributes && part.attributes.src) {
        let request = part.attributes.src
        if (~TYPES_FOR_OUTPUT.indexOf(type)) {
          return loadModule.call(this, request)
        } else if (~TYPES_FOR_FILE_LOADER.indexOf(type)) {
          if (isSameDiretory(resourcePath, request)) {
            return loadModule
              .call(this, request)
              .then(source => this.exec(source, request))
          }
          this.emitError(
            new Error(
              `Block \`${type}\` does not support \`src\` file importing from different paths.`
            )
          )
        } else {
          this.emitWarning(
            new Error(
              `The use of src attribute with an unknown block \`${type}\` is not yet supported.`
            )
          )
        }
      }
      return parts[type].content
    })
    .then(content => cb(null, content))
    .catch(cb)
}
