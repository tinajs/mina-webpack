const path = require('path')
const merge = require('lodash.merge')
const compose = require('compose-function')
const loaderUtils = require('loader-utils')
const resolveFrom = require('resolve-from')
const ensurePosix = require('ensure-posix-path')
const pMap = require('p-map')
const pAll = require('p-all')

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
  const done = this.async()

  const options = merge({}, {
    publicPath: this.options.output.publicPath,
  }, loaderUtils.getOptions(this) || {})
  const relativeToRoot = path.relative(path.dirname(this.resource), this.options.context)
  const loadModule = helpers.loadModule.bind(this)

  let config = JSON.parse(source)

  if (!config) {
    return done(null, '')
  }

  Promise.resolve(config)
    /**
     * pages
     */
    .then((config) => {
      if (!Array.isArray(config.pages)) {
        return config
      }
      return Object.assign(config, {
        pages: config.pages.map((page) => resolveFile(this.context, page, this.options.context)),
      })
    })
    /**
     * usingComponent
     */
    .then((config) => {
      if (typeof config.usingComponents !== 'object') {
        return config
      }
      return Object.assign(config, {
        usingComponents: mapObject(config.usingComponents, (file) => resolveFile(this.context, file, this.options.context)),
      })
    })
    /**
     * tabBar
     */
    .then((config) => {
      if (!config.tabBar || !Array.isArray(config.tabBar.list)) {
        return config
      }
      const extract = (source) => helpers.extract(source, options.publicPath)
      return pMap(config.tabBar.list, (tab) => {
        let files = []
        if (tab.iconPath) {
          files.push(() => loadModule(tab.iconPath).then(extract))
        }
        if (tab.selectedIconPath) {
          files.push(() => loadModule(tab.selectedIconPath).then(extract))
        }
        return pAll(files)
      })
        .then((files) => {
          console.log(files)
          // TODO: flatten
          return config
        })
    })
    .then((config) => done(null, JSON.stringify(config, null, 2)))
    .catch((error) => done(error))
}
