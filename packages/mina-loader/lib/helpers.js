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
