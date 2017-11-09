const { parseComponent } = require('vue-template-compiler')
const loaderUtils = require('loader-utils')

const selectorLoaderPath = require.resolve('./selector')
const fileLoaderPath = require.resolve('./file')
const parserLoaderPath = require.resolve('./parser')

const defaultLoaders = {
  wxml: 'wxml-loader',
  wxss: '',
  wxs: '',
  json: '',
}

function getPartLoader (type) {
  return defaultLoaders[type] ? (defaultLoaders[type] + '!') : ''
}

module.exports = function (source) {
  this.cacheable()

  const done = this.async()
  const options = loaderUtils.getOptions(this) || {}
  const context = options.context || this.options.context

  const url = loaderUtils.getRemainingRequest(this)
  const parsedUrl = `!!${parserLoaderPath}!${url}`

  this.loadModule(parsedUrl, (err, source) => {
    if (err) {
      return done(err)
    }

    let output = ''
    let parts = this.exec(source, parsedUrl)

    for (let type in parts) {
      output += `require(${loaderUtils.stringifyRequest(this, `!!${fileLoaderPath}?ext=${type}!${getPartLoader(type)}${selectorLoaderPath}?type=${type}!${url}`)});`
    }

    done(null, output)
  })
}
