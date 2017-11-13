const { parseComponent } = require('vue-template-compiler')
const loaderUtils = require('loader-utils')

const selectorLoaderPath = require.resolve('./selector')
const parserLoaderPath = require.resolve('./parser')

const helpers = require('../helpers')

const defaultLoaders = {
  wxml: 'wxml-loader',
  wxss: 'extract-loader!css-loader',
  // js: 'babel-loader',
  json: '',
}

const TYPES_FOR_FILE_LOADER = ['wxml', 'wxss', 'json']
const TYPES_FOR_OUTPUT = ['js']

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

  const loadModule = helpers.loadModule.bind(this)

  loadModule(parsedUrl)
    .then((source) => {
      let parts = this.exec(source, parsedUrl)

      // compute output
      let output = TYPES_FOR_OUTPUT.map((type) => `require(${loaderUtils.stringifyRequest(this, `!!${selectorLoaderPath}?type=js!${url}`)})`).join(';')

      return Promise
        // emit files
        .all(TYPES_FOR_FILE_LOADER.map((type) => {
          if (!parts[type] || !parts[type].content) {
            return Promise.resolve()
          }
          let request = `!!file-loader?name=[path][name].${type}!${getPartLoader(type)}${selectorLoaderPath}?type=${type}!${url}`
          return loadModule(request)
        }))
        .then(() => done(null, output))
    })
    .catch(done)
}
