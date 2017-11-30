const path = require('path')
const compose = require('compose-function')
const loaderUtils = require('loader-utils')
const resolveFrom = require('resolve-from')
const ensurePosix = require('ensure-posix-path')

const helpers = require('../helpers')

function mapObject (object, iteratee) {
  let result = {}
  for (let key in object) {
    result[key] = iteratee(object[key], key, object)
  }
  return result
}

function resolveFile (dirname, target, context) {
  let relative = (target) => path.join(path.relative(dirname, context), helpers.toSafeOutputPath(target))
  if (target.match(/^~/)) {
    return compose(ensurePosix, relative)(resolveFromModule(context, target))
  }
  return compose(ensurePosix, relative)(target)
}

function resolveFromModule (context, filename) {
  return path.relative(context, resolveFrom(context, loaderUtils.urlToRequest(`${filename}.mina`)))
    .replace(/\.mina$/, '')
}

module.exports = function (source) {
  let config = JSON.parse(source)
  let relativeToRoot = path.relative(path.dirname(this.resource), this.options.context)

  if (!config) {
    return ''
  }

  if (Array.isArray(config.pages)) {
    config.pages = config.pages.map((page) => resolveFile(this.context, page, this.options.context))
  }

  if (typeof config.usingComponents === 'object') {
    config.usingComponents = mapObject(config.usingComponents, (file) => resolveFile(this.context, file, this.options.context))
  }

  return JSON.stringify(config, null, 2)
}
