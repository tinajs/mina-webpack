const path = require('path')
const fs = require('fs-extra')
const flatten = require('flatten')
const resolveFrom = require('resolve-from')
const ensurePosix = require('ensure-posix-path')
const { urlToRequest } = require('loader-utils')
const { parseComponent } = require('vue-template-compiler')
const SingleEntryPlugin = require('webpack/lib/SingleEntryPlugin')
const MultiEntryPlugin = require('webpack/lib/MultiEntryPlugin')

function basename (fullpath) {
  return path.basename(fullpath, path.extname(fullpath))
}

function extname (fullpath, ext) {
  return path.format({
    dir: path.dirname(fullpath),
    name: basename(fullpath),
    ext: ext,
  })
}

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
  return JSON.parse(matched.content)
}

function getUrlsFromConfig (config) {
  let urls = []
  if (!config) {
    return urls
  }
  if (Array.isArray(config.pages)) {
    urls = [
      ...urls,
      ...config.pages.map((page) => `${page}.mina`),
    ]
  }
  if (typeof config.usingComponents === 'object') {
    urls = [
      ...urls,
      ...Object.keys(config.usingComponents).map((tag) => {
        return `${config.usingComponents[tag]}.mina`
      }),
    ]
  }
  return urls
}

function getItems (context, url) {
  let memory = []

  function search (context, url) {
    let isModule = isModuleUrl(url)
    let request = urlToRequest(url)
    let current = {
      url,
      request,
      isModule: isModule,
      fullpath: isModule ? resolveFrom(context, request) : path.resolve(context, url),
    }
    memory.push(current)

    let urls = getUrlsFromConfig(readConfig(current.fullpath))
    if (urls.length > 0) {
      urls.filter((url) => !memory.some((item) => item.url === url)).forEach((url) => search(context, url))
    }
  }

  search(context, url)
  return memory
}

module.exports = class MinaEntryWebpackPlugin {
  constructor (options = {}) {
    this.map = options.map || function (entry) {
      return entry
    }
  }

  rewrite (compiler) {
    let { context, entry } = compiler.options

    getItems(context, entry)
      .forEach(({ isModule, request, fullpath }) => {
        let url = path.relative(context, fullpath)
          // replace '..' to '_'
          .replace(/\.\./g, '_')
          // replace 'node_modules' to '_node_modules_'
          .replace(/node_modules([\/\\])/g, '_node_modules_$1')
        let name = extname(urlToRequest(url), '.js')
        compiler.apply(addEntry(context, this.map(ensurePosix(request)), ensurePosix(name)))
      })

    return true
  }

  apply (compiler) {
    compiler.plugin('entry-option', () => this.rewrite(compiler))
  }
}
