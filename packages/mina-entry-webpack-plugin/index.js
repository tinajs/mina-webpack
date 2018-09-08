const path = require('path')
const fs = require('fs-extra')
const JSON5 = require('json5')
const replaceExt = require('replace-ext')
const resolveFrom = require('resolve-from')
const ensurePosix = require('ensure-posix-path')
const { urlToRequest } = require('loader-utils')
const { parseComponent } = require('vue-template-compiler')
const SingleEntryPlugin = require('webpack/lib/SingleEntryPlugin')
const MultiEntryPlugin = require('webpack/lib/MultiEntryPlugin')

function isModuleUrl(url) {
  return !!url.match(/^~/)
}

function addEntry(context, item, name) {
  if (Array.isArray(item)) {
    return new MultiEntryPlugin(context, item, name)
  }
  return new SingleEntryPlugin(context, item, name)
}

function readConfig(fullpath) {
  let buffer = fs.readFileSync(fullpath)
  let blocks = parseComponent(buffer.toString()).customBlocks
  let matched = blocks.find(block => block.type === 'config')
  if (!matched || !matched.content || !matched.content.trim()) {
    return {}
  }
  return JSON5.parse(matched.content)
}

function getUrlsFromConfig(config) {
  let urls = []
  if (!config) {
    return urls
  }
  if (Array.isArray(config.pages)) {
    urls = [...urls, ...config.pages]
  }

  let components = ['pages', 'usingComponents', 'publicComponents'].map(
    c => config[c]
  )

  if (Array.isArray(config['subPages'])) {
    config['subPages'].forEach(subPage => {
      const { root, pages } = subPage
      if (Array.isArray(pages)) {
        pages.forEach(page => {
          components.push(path.join(root, page))
        })
      }
    })
  }

  components.filter(c => typeof c === 'object').forEach(c => {
    urls = [...urls, ...Object.keys(c).map(tag => c[tag])]
  })
  return urls
}

function getItems(rootContext, url) {
  let memory = []

  function search(context, url) {
    let isModule = isModuleUrl(url)
    let request = urlToRequest(
      path.relative(rootContext, path.resolve(context, url))
    )
    let current = {
      url,
      request,
      isModule: isModule,
      fullpath: isModule
        ? resolveFrom(context, request)
        : path.resolve(context, url),
    }

    if (memory.some(item => item.fullpath === current.fullpath)) {
      return
    }
    memory.push(current)

    let urls = getUrlsFromConfig(readConfig(current.fullpath))
    if (urls.length > 0) {
      urls.forEach(url => {
        if (url.startsWith('plugin://')) {
          return
        }
        if (url.startsWith('/')) {
          return search(rootContext, url.slice(1))
        }
        // relative url
        return search(path.dirname(current.fullpath), url)
      })
    }
  }

  search(rootContext, url)
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
        if (this._items.some(({ fullpath }) => fullpath === item.fullpath)) {
          return
        }
        this._items.push(item)
        let url = path
          .relative(context, item.fullpath)
          // replace '..' to '_'
          .replace(/\.\./g, '_')
          // replace 'node_modules' to '_node_modules_'
          .replace(/node_modules([\/\\])/g, '_node_modules_$1')
        let name = replaceExt(urlToRequest(url), '.js')
        addEntry(
          context,
          this.map(ensurePosix(item.request)),
          ensurePosix(name)
        ).apply(compiler)
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
