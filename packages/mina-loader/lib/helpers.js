const vm = require('vm')
const loaderUtils = require('loader-utils')

exports.loadModule = function loadModule (request) {
  return new Promise((resolve, reject) => {
    this.loadModule(request, (err, source) => {
      if (err) {
        return reject(err)
      }
      resolve(source)
    })
  })
}

exports.ensureBang = function ensureBang (loader) {
  if (loader.charAt(loader.length - 1) !== '!') {
    return loader + '!'
  } else {
    return loader
  }
}

exports.stringifyLoaders = function stringifyLoaders (loaders) {
  return loaders
    .map(
      obj =>
        obj && typeof obj === 'object' && typeof obj.loader === 'string'
          ? obj.loader +
            (obj.options ? '?' + JSON.stringify(obj.options) : '')
          : obj
    )
    .join('!')
}

exports.parseLoaders = function parseLoaders (loaders) {
  if (!loaders) {
    return []
  }
  if (typeof loaders === 'string') {
    loaders = loaders.split('!')
  }
  if (!Array.isArray(loaders)) {
    loaders = [loaders]
  }
  return loaders.map((raw) => {
    if (typeof raw !== 'string') {
      return raw
    }
    let [loader, options] = raw.split('!')
    options = loaderUtils.getOptions({ query: `?${options || ''}` })
    return { loader, options }
  })
}

exports.toSafeOutputPath = function (original) {
  return (original || '')
    .replace(/\.\./g, '_')
    .replace(/node_modules([\/\\])/g, '_node_modules_$1')
}

/**
 * Forked from:
 * https://github.com/peerigon/extract-loader/blob/f5a1946a7b54ef962e5af56aaf29d318efaabf66/src/extractLoader.js#L110
 * https://github.com/Cap32/wxml-loader/blob/986c2a07f195c0f8f4e35169148e4965061a50f6/src/index.js#L21
 */
exports.extract = function (src, publicPath = '') {
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
