const { dirname } = require('path')
const fs = require('fs-extra')
const loaderUtils = require('loader-utils')
const replaceExt = require('replace-ext')
const pProps = require('p-props')
const pAny = require('p-any')

let JavascriptGenerator, JavascriptParser
try {
  JavascriptGenerator = require('webpack/lib/JavascriptGenerator')
  JavascriptParser = require('webpack/lib/Parser')
} catch (error) {
  if (error.code !== 'MODULE_NOT_FOUND') {
    throw error
  }
}

const template = (parts = {}) => {
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

module.exports = function() {
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

  const done = this.async()

  const options = loaderUtils.getOptions(this) || {
    extensions: {},
  }

  this.addContextDependency(dirname(this.resourcePath))

  pProps(options.extensions, extnames => {
    let findFileWithExtname = extname => {
      let filePath = replaceExt(this.resourcePath, `.${extname}`)
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
    .then(parts => done(null, template(parts)))
    .catch(done)
}
