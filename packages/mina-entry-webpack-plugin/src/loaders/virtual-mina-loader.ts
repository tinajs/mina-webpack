import webpack from 'webpack'
import { dirname } from 'path'
import fs from 'fs-extra'
import loaderUtils from 'loader-utils'
import replaceExt from 'replace-ext'
// @ts-ignore
import pProps from 'p-props'
import pAny from 'p-any'

let JavascriptGenerator: any, JavascriptParser: any
try {
  JavascriptGenerator = require('webpack/lib/JavascriptGenerator')
  JavascriptParser = require('webpack/lib/Parser')
} catch (error) {
  if (error.code !== 'MODULE_NOT_FOUND') {
    throw error
  }
}

const template = (parts: Record<string, string> = {}) => {
  let result =
    Object.keys(parts)
      .map(tag => {
        if (!parts[tag]) {
          return ''
        }
        /**
         * We can assume that the generated virtual files are in the same directory as the source files,
         * so there is no need to consider the problem of resolving relative paths here.
         */
        return `<${tag}>${parts[tag]}</${tag}>`
      })
      .join('') || ''
  return result
}

const virtualMinaLoader: webpack.loader.Loader = function() {
  this.cacheable()

  /**
   * forked from https://github.com/lingui/js-lingui/commit/f804335ce502cca65bdcab72f4b0021711fbf3b9
   * see:
   * - https://github.com/webpack/webpack/issues/7057#issuecomment-381883220
   * - https://github.com/webpack/webpack/issues/6572#issuecomment-374987270
   */
  if (
    JavascriptGenerator &&
    JavascriptParser &&
    this._module.type !== 'javascript/auto'
  ) {
    this._module.type = 'javascript/auto'
    this._module.generator = new JavascriptGenerator()
    this._module.parser = new JavascriptParser()
  }

  const done = this.async()!

  const options = loaderUtils.getOptions(this) || {
    extensions: {},
  }

  this.addContextDependency(dirname(this.resourcePath))

  pProps(options.extensions, (extnames: Array<string>) => {
    let findFileWithExtname = (extname: string) => {
      let filePath = replaceExt(this.resourcePath, `.${extname}`)
      // @ts-ignore
      return fs.exists(filePath).then(isExist => ({ isExist, filePath }))
    }
    return pAny(extnames.map(findFileWithExtname), {
      filter: ({ isExist }) => isExist,
    }).then(
      ({ filePath }) => {
        this.addDependency(filePath)
        return fs.readFile(filePath, 'utf8')
      },
      () => {}
    )
  })
    .then((parts: Record<string, string>) => done(null, template(parts)))
    .catch(done)
}

module.exports = virtualMinaLoader
