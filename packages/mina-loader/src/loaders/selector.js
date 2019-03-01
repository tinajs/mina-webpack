const loaderUtils = require('loader-utils')
const { dirname } = require('path')
const resolve = require('resolve')
const parserLoaderPath = require.resolve('./parser')

const { TAGS_FOR_FILE_LOADER, TAGS_FOR_OUTPUT } = require('../constants')
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
  const { tag } = loaderUtils.getOptions(this) || {}
  const { resourcePath } = this
  const url = `!!${parserLoaderPath}!${loaderUtils.getRemainingRequest(this)}`
  loadModule
    .call(this, url)
    .then(source => {
      const blocks = this.exec(source, url)
      const block = blocks[tag]
      if (block && block.attributes && block.attributes.src) {
        let request = block.attributes.src
        if (~TAGS_FOR_OUTPUT.indexOf(tag)) {
          return loadModule.call(this, request)
        } else if (~TAGS_FOR_FILE_LOADER.indexOf(tag)) {
          if (isSameDiretory(resourcePath, request)) {
            return loadModule
              .call(this, request)
              .then(source => this.exec(source, request))
          }
          this.emitError(
            new Error(
              `Block \`${tag}\` does not support \`src\` file importing from different paths.`
            )
          )
        } else {
          this.emitWarning(
            new Error(
              `The use of src attribute with an unknown block \`${tag}\` is not yet supported.`
            )
          )
        }
      }
      return blocks[tag].content
    })
    .then(content => cb(null, content))
    .catch(cb)
}
