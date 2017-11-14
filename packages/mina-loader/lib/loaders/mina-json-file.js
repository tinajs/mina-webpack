const path = require('path')
const loaderUtils = require('loader-utils')
const resolveFrom = require('resolve-from')

function mapObject (object, iteratee) {
  let result = {}
  for (let key in object) {
    result[key] = iteratee(object[key], key, object)
  }
  return result
}

function resolveFile (context, file) {
  if (file.match(/^~/)) {
    return resolveFromModule(context, file)
  }
  return file
}

function resolveFromModule (context, filename) {
  return path.relative(context, resolveFrom(context, loaderUtils.urlToRequest(`${filename}.mina`)))
    .replace(/\.\./g, '_')
    .replace(/\.mina$/, '')
}

module.exports = function (source) {
  let config = JSON.parse(source)

  if (!config) {
    return ''
  }

  if (Array.isArray(config.pages)) {
    config.pages = config.pages.map((page) => resolveFile(this.context, page))
  }

  if (typeof config.usingComponents === 'object') {
    config.usingComponents = mapObject(config.usingComponents, (file) => resolveFile(this.context, file))
  }

  return JSON.stringify(config, null, 2)
}
