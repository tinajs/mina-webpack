const path = require('path')
const fs = require('fs')
const replaceExt = require('replace-ext')
const resolve = require('resolve')
const ensurePosix = require('ensure-posix-path')
const { urlToRequest } = require('loader-utils')
const SingleEntryPlugin = require('webpack/lib/SingleEntryPlugin')
const MultiEntryPlugin = require('webpack/lib/MultiEntryPlugin')
const WebpackError = require('webpack/lib/WebpackError')
const compose = require('compose-function')
const { Minimatch } = require('minimatch')

const ConfigReader = require('./interfaces/config-reader')
const MinaConfigReader = require('./config-readers/mina')
const ClassicalConfigReader = require('./config-readers/classical')
const {
  values,
  uniq,
  toSafeOutputPath,
  getResourceUrlFromRequest,
} = require('./helpers')

const minaLoader = require.resolve('@tinajs/mina-loader')
const virtualMinaLoader = require.resolve('./loaders/virtual-mina-loader.js')

const RESOLVE_EXTENSIONS = ['.js', '.wxml', '.json', '.wxss']

function isAbsoluteUrl(url) {
  return !!url.startsWith('/')
}

function addEntry(context, item, name) {
  if (Array.isArray(item)) {
    return new MultiEntryPlugin(context, item, name)
  }
  return new SingleEntryPlugin(context, item, name)
}

function getRequestsFromConfig(config) {
  let requests = []
  if (!config) {
    return requests
  }

  ;['pages', 'usingComponents', 'publicComponents'].forEach(key => {
    if (typeof config[key] !== 'object') {
      return
    }
    requests = [...requests, ...values(config[key])]
  })

  if (Array.isArray(config.subPackages)) {
    config.subPackages.forEach(subPackage => {
      const { root, pages } = subPackage
      if (Array.isArray(pages)) {
        requests = [
          ...requests,
          ...pages.map(page => path.join(root || '', page)),
        ]
      }
    })
  }

  return uniq(requests)
}

function getItems(rootContext, entry, rules, minaLoaderOptions) {
  let memory = []

  function search(currentContext, originalRequest) {
    let resourceUrl = getResourceUrlFromRequest(originalRequest)
    let request = urlToRequest(
      isAbsoluteUrl(resourceUrl)
        ? resourceUrl.slice(1)
        : path.relative(rootContext, path.resolve(currentContext, resourceUrl))
    )

    let resourcePath, isClassical
    try {
      try {
        resourcePath = resolve.sync(request, {
          basedir: rootContext,
          extensions: [],
        })
        isClassical = false
      } catch (error) {
        resourcePath = resolve.sync(request, {
          basedir: rootContext,
          extensions: RESOLVE_EXTENSIONS,
        })
        request = `!${minaLoader}?${JSON.stringify(
          minaLoaderOptions
        )}!${virtualMinaLoader}!${resourcePath}`
        isClassical = true
      }
    } catch (error) {
      // Do not throw an exception when the module does not exist.
      // Just mark it up and move on to the next module.
      memory.push({
        error: new MinaEntryPluginError(error),
      })
      return
    }

    resourcePath = fs.realpathSync(resourcePath)

    let name = compose(
      ensurePosix,
      path => replaceExt(path, '.js'),
      urlToRequest,
      toSafeOutputPath
    )(path.relative(rootContext, resourcePath))

    let current = {
      name,
      request,
    }

    if (memory.some(item => item.request === current.request)) {
      return
    }
    memory.push(current)

    let matchedRule = rules.find(({ pattern }) =>
      pattern.match(path.relative(rootContext, resourcePath))
    )

    let config = matchedRule
      ? matchedRule.reader.getConfig(resourcePath)
      : isClassical
        ? ClassicalConfigReader.getConfig(resourcePath)
        : MinaConfigReader.getConfig(resourcePath)

    let requests = getRequestsFromConfig(config)
    if (requests.length > 0) {
      requests.forEach(req => {
        if (req.startsWith('plugin://')) {
          return
        }
        return search(path.dirname(resourcePath), req)
      })
    }
  }

  search(rootContext, entry)
  return memory
}

class MinaEntryPluginError extends WebpackError {
  constructor(error) {
    super()

    this.name = 'MinaEntryPluginError'
    this.message = `MinaEntryPlugin: ${error.message}`
    this.error = error

    Error.captureStackTrace(this, this.constructor)
  }
}

module.exports = class MinaEntryWebpackPlugin {
  constructor(options = {}) {
    this.map =
      options.map ||
      function(entry) {
        return entry
      }
    this.rules = (options.rules || []).map(rule => {
      return Object.assign({}, rule, {
        pattern: new Minimatch(rule.pattern, { matchBase: true }),
      })
    })
    // TODO: redefine a better struct for this option
    this.minaLoaderOptions = options.minaLoaderOptions || {}

    this._errors = []

    /**
     * cache items to prevent duplicate `addEntry` operations
     */
    this._items = []
  }

  rewrite(compiler, done) {
    try {
      let { context, entry } = compiler.options

      this._errors = []

      // assume the latest file in array is the app.mina
      if (Array.isArray(entry)) {
        entry = entry[entry.length - 1]
      }

      getItems(context, entry, this.rules, this.minaLoaderOptions).forEach(
        item => {
          if (item.error) {
            return this._errors.push(item.error)
          }
          if (this._items.some(({ request }) => request === item.request)) {
            return
          }
          this._items.push(item)

          addEntry(
            context,
            this.map(ensurePosix(item.request)),
            item.name
          ).apply(compiler)
        }
      )
    } catch (error) {
      if (typeof done === 'function') {
        console.error(error)
        return done()
      }
      throw error
    }

    if (typeof done === 'function') {
      done()
    }

    return true
  }

  apply(compiler) {
    compiler.hooks.entryOption.tap('MinaEntryPlugin', () =>
      this.rewrite(compiler)
    )
    compiler.hooks.watchRun.tap('MinaEntryPlugin', (compiler, done) =>
      this.rewrite(compiler, done)
    )
    compiler.hooks.compilation.tap('MinaEntryPlugin', compilation => {
      this._errors.forEach(error => compilation.errors.push(error))
    })
  }
}

module.exports.ConfigReader = ConfigReader
