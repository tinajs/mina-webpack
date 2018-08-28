const path = require('path')
const replaceExt = require('replace-ext')
const resolve = require('resolve')
const ensurePosix = require('ensure-posix-path')
const { urlToRequest } = require('loader-utils')
const SingleEntryPlugin = require('webpack/lib/SingleEntryPlugin')
const MultiEntryPlugin = require('webpack/lib/MultiEntryPlugin')
const compose = require('compose-function')

const { MinaConfigReader, ClassicalConfigReader } = require('./config-readers')
const {
  values,
  uniq,
  toSafeOutputPath,
  getResourceUrlFromRequest,
} = require('./helpers')

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

function getItems(rootContext, entry) {
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
      request = `!${require.resolve('@tinajs/mina-loader')}!${require.resolve(
        './virtual-mina-loader.js'
      )}!${resourcePath}`
      isClassical = true
    }

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

    let config = isClassical
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

module.exports = class MinaEntryWebpackPlugin {
  constructor(options = {}) {
    this.map =
      options.map ||
      function(entry) {
        return entry
      }

    /**
     * cache items to prevent duplicate `addEntry` operations
     */
    this._items = []
  }

  rewrite(compiler, done) {
    try {
      let { context, entry } = compiler.options

      // assume the latest file in array is the app.mina
      if (Array.isArray(entry)) {
        entry = entry[entry.length - 1]
      }

      getItems(context, entry).forEach(item => {
        if (this._items.some(({ request }) => request === item.request)) {
          return
        }
        this._items.push(item)

        addEntry(context, this.map(ensurePosix(item.request)), item.name).apply(
          compiler
        )
      })
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
  }
}
