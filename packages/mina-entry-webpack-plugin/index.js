const path = require('path')
const fs = require('fs-extra')
const { urlToRequest } = require('loader-utils')
const { parseComponent } = require('vue-template-compiler')
const SingleEntryPlugin = require('webpack/lib/SingleEntryPlugin')
const MultiEntryPlugin = require('webpack/lib/MultiEntryPlugin')

function basename (fullpath) {
  return path.basename(fullpath, path.extname(fullpath))
}

function addEntry (context, item, name) {
	if (Array.isArray(item)) {
    return new MultiEntryPlugin(context, item, name)
	}
	return new SingleEntryPlugin(context, item, name)
}

function getConfigAsync (file) {
  return fs.readFile(file)
    .then((buffer) => {
      let blocks = parseComponent(buffer.toString()).customBlocks
      let matched = blocks.find((block) => block.type === 'config')
      if (!matched) {
        return {}
      }
      return JSON.parse(matched.content)
    })
}

function getItemsFromConfig (config) {
  if (config && Array.isArray(config.pages)) {
    return config.pages.map((page) => `${page}.mina`)
  }
  return []
}

function getItems (context, entry) {
  return Promise.resolve(path.resolve(context, entry))
    .then(getConfigAsync)
    .then(getItemsFromConfig)
    .then((entries) => {
      if (entries.length === 0) {
        return urlToRequest(entry)
      }
      return Promise.all([ Promise.resolve(entry), ...(entries.map((entry) => getItems(context, entry))) ])
    })
}

module.exports = class MinaEntryWebpackPlugin {
  rewrite (compiler, callback) {
    let { context, entry } = compiler.options

    getItems(context, entry)
      .then((items) => {
        items.forEach((item) => {
          compiler.apply(addEntry(context, item, basename(item)))
        })
        callback()
      })
      .catch(callback)
  }

  apply (compiler) {
    compiler.plugin('run', this.rewrite)
    compiler.plugin('watch-run', this.rewrite)

    compiler.plugin('entry-option', () => true)
  }
}
