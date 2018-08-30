const vm = require('vm')
const Module = require('module')
const loaderUtils = require('loader-utils')

/**
 * Retrieves the public path from the loader options, context.options (webpack <4) or context._compilation (webpack 4+).
 * context._compilation is likely to get removed in a future release, so this whole function should be removed then.
 * See: https://github.com/peerigon/extract-loader/issues/35
 *
 * @deprecated
 * @param {Object} options - Extract-loader options
 * @param {Object} context - Webpack loader context
 * @returns {string}
 */
exports.getPublicPath = function getPublicPath(options, context) {
  const property = 'publicPath'

  if (property in options) {
    return options[property]
  }

  if (
    context.options &&
    context.options.output &&
    property in context.options.output
  ) {
    return context.options.output[property]
  }

  if (
    context._compilation &&
    context._compilation.outputOptions &&
    property in context._compilation.outputOptions
  ) {
    return context._compilation.outputOptions[property]
  }

  return ''
}

exports.loadModule = function loadModule(request) {
  return new Promise((resolve, reject) => {
    this.loadModule(request, (err, source) => {
      if (err) {
        return reject(err)
      }
      resolve(source)
    })
  })
}

exports.ensureBang = function ensureBang(loader) {
  if (loader.charAt(loader.length - 1) !== '!') {
    return loader + '!'
  } else {
    return loader
  }
}

exports.stringifyLoaders = function stringifyLoaders(loaders) {
  return loaders
    .map(
      obj =>
        obj && typeof obj === 'object' && typeof obj.loader === 'string'
          ? obj.loader + (obj.options ? '?' + JSON.stringify(obj.options) : '')
          : obj
    )
    .join('!')
}

exports.parseLoaders = function parseLoaders(loaders) {
  if (!loaders) {
    return []
  }
  if (typeof loaders === 'string') {
    loaders = loaders.split('!')
  }
  if (!Array.isArray(loaders)) {
    loaders = [loaders]
  }
  return loaders.map(raw => {
    if (typeof raw !== 'string') {
      return raw
    }
    let [loader, options] = raw.split('!')
    options = loaderUtils.getOptions({ query: `?${options || ''}` })
    return { loader, options }
  })
}

exports.toSafeOutputPath = function(original) {
  return (original || '')
    .replace(/\.\./g, '_')
    .replace(/node_modules([\/\\])/g, '_node_modules_$1')
}

/**
 * Forked from:
 * https://github.com/peerigon/extract-loader/blob/f5a1946a7b54ef962e5af56aaf29d318efaabf66/src/extractLoader.js#L110
 * https://github.com/Cap32/wxml-loader/blob/986c2a07f195c0f8f4e35169148e4965061a50f6/src/index.js#L21
 */
exports.extract = function(src, publicPath = '') {
  const script = new vm.Script(src, {
    displayErrors: true,
  })
  const sandbox = {
    module: {},
    __webpack_public_path__: publicPath,
  }

  script.runInNewContext(sandbox)
  return sandbox.module.exports.toString()
}

/**
 * Forked from:
 * https://github.com/webpack/webpack.js.org/issues/1268#issuecomment-313513988
 */
exports.exec = function exec(context, code, filename) {
  const module = new Module(filename, context)
  module.paths = Module._nodeModulePaths(context.context)
  module.filename = filename
  module._compile(code, filename)
  delete require.cache[filename]
  return module.exports
}
