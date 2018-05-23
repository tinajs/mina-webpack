const path = require('path')
const fs = require('fs-extra')
const JSON5 = require('json5')
const flatten = require('flatten')
const replaceExt = require('replace-ext')
const resolveFrom = require('resolve-from')
const ensurePosix = require('ensure-posix-path')
const { urlToRequest } = require('loader-utils')
const { parseComponent } = require('vue-template-compiler')
const SingleEntryPlugin = require('webpack/lib/SingleEntryPlugin')
const MultiEntryPlugin = require('webpack/lib/MultiEntryPlugin')

function isModuleUrl (url) {
  return !!url.match(/^~/)
}

function addEntry (context, item, name) {
	if (Array.isArray(item)) {
    return new MultiEntryPlugin(context, item, name)
	}
	return new SingleEntryPlugin(context, item, name)
}

function readConfig (fullpath) {
  let buffer = fs.readFileSync(fullpath)
  let blocks = parseComponent(buffer.toString()).customBlocks
  let matched = blocks.find((block) => block.type === 'config')
  if (!matched || !matched.content || !matched.content.trim()) {
    return {}
  }
  return JSON5.parse(matched.content)
}

function getUrlsFromConfig (config) {
  let urls = []
  if (!config) {
    return urls
  }
  if (Array.isArray(config.pages)) {
    urls = [
      ...urls,
      ...config.pages,
    ]
  }
  if (typeof config.usingComponents === 'object') {
    urls = [
      ...urls,
      ...Object.keys(config.usingComponents).map((tag) => config.usingComponents[tag]),
    ]
  }
  return urls
}

function getItems (rootContext, url) {
  let memory = []

  function search (context, url) {
    if (memory.some((item) => item.url === url)) {
      return
    }

    let isModule = isModuleUrl(url)
    let request = urlToRequest(path.relative(rootContext, path.resolve(context, url)))
    let current = {
      url,
      request,
      isModule: isModule,
      fullpath: isModule ? resolveFrom(context, request) : path.resolve(context, url),
    }
    memory.push(current)

    let urls = getUrlsFromConfig(readConfig(current.fullpath))
    if (urls.length > 0) {
      urls.forEach((url) => {
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
  constructor (options = {}) {
    this.map = options.map || function (entry) {
      return entry
    }
  }

  rewrite (compiler, done) {
    try {
      let { context, entry } = compiler.options

      // assume the latest file in array is the app.mina
      if (Array.isArray(entry)) {
        entry = entry[entry.length - 1]
      }

      getItems(context, entry)
        .forEach(({ isModule, request, fullpath }) => {
          let url = path.relative(context, fullpath)
            // replace '..' to '_'
            .replace(/\.\./g, '_')
            // replace 'node_modules' to '_node_modules_'
            .replace(/node_modules([\/\\])/g, '_node_modules_$1')
          let name = replaceExt(urlToRequest(url), '.js')
          compiler.apply(addEntry(context, this.map(ensurePosix(request)), ensurePosix(name)))
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

  apply (compiler) {
    compiler.plugin('entry-option', () => this.rewrite(compiler))
    compiler.plugin('watch-run', ({ compiler }, done) => this.rewrite(compiler, done))
  }
}
