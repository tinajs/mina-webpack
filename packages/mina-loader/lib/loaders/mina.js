const path = require('path')
const merge = require('lodash.merge')
const compose = require('compose-function')
const loaderUtils = require('loader-utils')
const resolveFrom = require('resolve-from')
const ensurePosix = require('ensure-posix-path')
const debug = require('debug')('loaders:mina')

const fileLoaderPath = require.resolve('file-loader')
const extractLoaderPath = require.resolve('extract-loader')
const selectorLoaderPath = require.resolve('./selector')
const parserLoaderPath = require.resolve('./parser')

const helpers = require('../helpers')
const {
  EXTNAMES,
  TAGS_FOR_FILE_LOADER,
  TAGS_FOR_OUTPUT,
  LOADERS,
} = require('../constants')

function getBlocks(loaderContext, request) {
  request = `!${parserLoaderPath}!${request}`
  return helpers.loadModule
    .call(loaderContext, request)
    .then(source => loaderContext.exec(source, request))
}

const getLoaders = (loaderContext, tag, options, attributes = {}) => {
  let loader = LOADERS[tag](options) || ''
  let lang = attributes.lang

  /**
   * Because we can't add built-in loaders if we satisfy the [inline url rule](https://webpack.js.org/concepts/loaders/#inline) (especially by overriding the original rule with an `!` in the header), at this point when the users are using the `src` attribute, we can't automatically add built-in loaders for them and instead they need to manually set the rules themselves.
   */
  if (attributes.src) {
    return ''
  }

  // append custom loader
  let custom = lang
    ? options.languages[lang] || `${lang}-loader`
    : options.loaders[tag] || ''
  if (custom) {
    custom = helpers.stringifyLoaders(
      helpers.parseLoaders(custom).map(object => {
        return merge({}, object, {
          loader: resolveFrom(loaderContext.rootContext, object.loader),
        })
      })
    )
    loader = loader ? `${loader}!${custom}` : custom
  }

  return loader
}

function select(originalRequest, tag) {
  return `${selectorLoaderPath}?tag=${tag}!${originalRequest}`
}

module.exports = function() {
  this.cacheable()

  const done = this.async()
  const webpackOptions = loaderUtils.getOptions(this) || {}
  const options = merge(
    {},
    {
      select: '',
      loaders: {},
      languages: {},
      publicPath: helpers.getPublicPath(webpackOptions, this),
      context: this.rootContext,
      minimize: process.env.NODE_ENV === 'production',
    },
    webpackOptions
  )

  const originalRequest = loaderUtils.getRemainingRequest(this)
  const filePath = this.resourcePath

  getBlocks(this, originalRequest)
    .then(blocks => {
      if (options.select) {
        let tag = options.select
        let request =
          '!!' +
          [
            getLoaders(this, tag, options, blocks[tag].attributes),
            select(originalRequest, tag),
          ]
            .filter(Boolean)
            .join('!')
        return helpers.loadModule
          .call(this, request)
          .then(source => done(null, source))
      }

      // compute output
      let output = TAGS_FOR_OUTPUT.reduce((result, tag) => {
        if (!blocks[tag]) {
          return result
        }

        let request =
          '!!' +
          [
            getLoaders(this, tag, options, blocks[tag].attributes),
            select(originalRequest, tag),
          ]
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
            TAGS_FOR_FILE_LOADER.map(tag => {
              if (
                !blocks[tag] ||
                !(
                  blocks[tag].content ||
                  (blocks[tag].attributes && blocks[tag].attributes.src)
                )
              ) {
                return Promise.resolve()
              }

              let dirname = compose(
                ensurePosix,
                helpers.toSafeOutputPath,
                path.dirname
              )(path.relative(this.rootContext, filePath))
              let request =
                '!!' +
                [
                  `${fileLoaderPath}?name=${dirname}/[name]${EXTNAMES[tag]}`,
                  `${extractLoaderPath}?${JSON.stringify({
                    publicPath: options.publicPath,
                  })}`,
                  getLoaders(this, tag, options, blocks[tag].attributes),
                  select(originalRequest, tag),
                ]
                  .filter(Boolean)
                  .join('!')
              return helpers.loadModule.call(this, request)
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
