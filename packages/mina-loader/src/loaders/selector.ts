import loaderUtils from 'loader-utils'
import { dirname } from 'path'
import resolve from 'resolve'
import webpack from 'webpack'
import { TAGS_FOR_FILE_LOADER, TAGS_FOR_OUTPUT } from '../constants'
import { loadModule } from '../helpers'

const parserLoaderPath: string = require.resolve('./parser')

function isSameDiretory(
  currentResourcePath: string,
  requestUrl: string
): boolean {
  let requestPath = requestUrl.split('!').slice(-1)[0]
  let currentDiretory = dirname(currentResourcePath)
  let requestFullpath = resolve.sync(requestPath, { basedir: currentDiretory })
  return currentDiretory === dirname(requestFullpath)
}

const selector: webpack.loader.Loader = function selector() {
  this.cacheable()
  const cb = this.async()
  const { tag } = loaderUtils.getOptions(this) || { tag: '' }
  const { resourcePath } = this
  const url = `!!${parserLoaderPath}!${loaderUtils.getRemainingRequest(this)}`
  loadModule
    .call(this, url)
    .then((source: string) => {
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
              .then((source: string) => this.exec(source, request))
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
    .then((content: string) => cb && cb(null, content))
    .catch(cb)
}

export default selector
