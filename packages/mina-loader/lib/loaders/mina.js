const loaderUtils = require('loader-utils')
const merge = require('lodash.merge')
const resolveFrom = require('resolve-from')

const selectorLoaderPath = require.resolve('./selector')
const parserLoaderPath = require.resolve('./parser')
const minaJSONFileLoaderPath = require.resolve('./mina-json-file')

const resolve = (module) => require.resolve(module)

const helpers = require('../helpers')

const LOADERS = {
  template: resolve('wxml-loader'),
  style: `${resolve('extract-loader')}!${resolve('css-loader')}`,
  script: '',
  config: `${minaJSONFileLoaderPath}`,
}

const EXTNAMES = {
  template: 'wxml',
  style: 'wxss',
  script: 'js',
  config: 'json',
}

const TYPES_FOR_FILE_LOADER = ['template', 'style', 'config']
const TYPES_FOR_OUTPUT = ['script']

module.exports = function (source) {
  this.cacheable()

  const done = this.async()
  const options = merge({}, {
    loaders: {},
  }, loaderUtils.getOptions(this) || {})

  const url = loaderUtils.getRemainingRequest(this)
  const parsedUrl = `!!${parserLoaderPath}!${url}`

  const loadModule = helpers.loadModule.bind(this)

  const getLoaderOf = (type) => {
    let loader = LOADERS[type] || ''
    // append custom loader
    let custom = options.loaders[type] || ''
    if (custom) {
      custom = helpers.stringifyLoaders(helpers.parseLoaders(custom).map((object) => {
        return merge({}, object, {
          loader: resolveFrom(this.options.context, object.loader),
        })
      }))
      loader = loader ? `${loader}!${custom}` : custom
    }
    // add '!' at the end
    if (loader) {
      loader += '!'
    }
    return loader
  }

  loadModule(parsedUrl)
    .then((source) => {
      let parts = this.exec(source, parsedUrl)

      // compute output
      let output = parts.script && parts.script.content ?
        TYPES_FOR_OUTPUT.map((type) => `require(${loaderUtils.stringifyRequest(this, `!!${getLoaderOf(type)}${selectorLoaderPath}?type=script!${url}`)})`).join(';') :
        ''

      return Promise
        // emit files
        .all(TYPES_FOR_FILE_LOADER.map((type) => {
          if (!parts[type] || !parts[type].content) {
            return Promise.resolve()
          }
          let request = `!!${resolve('file-loader')}?name=[path][name].${EXTNAMES[type]}!${getLoaderOf(type)}${selectorLoaderPath}?type=${type}!${url}`
          console.log(request)
          return loadModule(request)
        }))
        .then(() => done(null, output))
    })
    .catch(done)
}
