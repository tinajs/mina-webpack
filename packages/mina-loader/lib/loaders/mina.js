const path = require('path')
const merge = require('lodash.merge')
const compose = require('compose-function')
const loaderUtils = require('loader-utils')
const resolveFrom = require('resolve-from')
const ensurePosix = require('ensure-posix-path')
const debug = require('debug')('loaders:mina')

const fileLoaderPath = require.resolve('file-loader')
const selectorLoaderPath = require.resolve('./selector')
const parserLoaderPath = require.resolve('./parser')

const helpers = require('../helpers')
const {
  EXTNAMES,
  TYPES_FOR_FILE_LOADER,
  TYPES_FOR_OUTPUT,
  LOADERS,
} = require('../constants')

module.exports = function(source) {
  this.cacheable()

  const done = this.async()
  const webpackOptions = loaderUtils.getOptions(this) || {}
  const options = merge(
    {},
    {
      loaders: {},
      languages: {},
      publicPath: helpers.getPublicPath(webpackOptions, this),
      context: this.rootContext,
      minimize: process.env.NODE_ENV === 'production',
    },
    webpackOptions
  )

  const url = loaderUtils.getRemainingRequest(this)
  const parsedUrl = `!!${parserLoaderPath}!${url}`

  const loadModule = helpers.loadModule.bind(this)

  const getLoaderOf = (type, options, attributes = {}) => {
    let loader = LOADERS[type](options) || ''
    let lang = attributes.lang
    if (attributes.src) {
      return ''
    }
    // append custom loader
    let custom = lang
      ? options.languages[lang] || `${lang}-loader`
      : options.loaders[type] || ''
    if (custom) {
      custom = helpers.stringifyLoaders(
        helpers.parseLoaders(custom).map(object => {
          return merge({}, object, {
            loader: resolveFrom(this.rootContext, object.loader),
          })
        })
      )
      loader = loader ? `${loader}!${custom}` : custom
    }
    return loader
  }

  loadModule(parsedUrl)
    .then(source => {
      let parts = this.exec(source, parsedUrl)

      // compute output
      let output = TYPES_FOR_OUTPUT.reduce((result, type) => {
        if (!parts[type]) {
          return result
        }
        // content can be defined either in a separate file or inline
        let loader = getLoaderOf(type, options, parts[type].attributes)
        debug('load modules', { result, type, loader })
        let request =
          '!!' +
          [loader, `${selectorLoaderPath}?type=${type}!${url}`]
            .filter(Boolean)
            .join('!')
        return `${result};require(${loaderUtils.stringifyRequest(
          this,
          request
        )})`
      }, '')

      return (
        Promise
          // emit files
          .all(
            TYPES_FOR_FILE_LOADER.map(type => {
              if (
                !parts[type] ||
                !(
                  parts[type].content ||
                  (parts[type].attributes && parts[type].attributes.src)
                )
              ) {
                return Promise.resolve()
              }
              let dirname = compose(
                ensurePosix,
                helpers.toSafeOutputPath,
                path.dirname
              )(path.relative(this.rootContext, url))
              let request =
                '!!' +
                [
                  `${fileLoaderPath}?name=${dirname}/[name].${EXTNAMES[type]}`,
                  getLoaderOf(type, options, parts[type].attributes),
                  `${selectorLoaderPath}?type=${type}!${url}`,
                ]
                  .filter(Boolean)
                  .join('!')
              return loadModule(request)
            })
          )
          .then(() => done(null, output))
      )
    })
    .catch(error => {
      debug('error', error)
      done(error)
    })
}
