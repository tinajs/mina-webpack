const { parseComponent } = require('vue-template-compiler')
const loaderUtils = require('loader-utils')

const selectorLoaderPath = require.resolve('./selector')
const bundleLoaderPath = require.resolve('./bundle')
const parserLoaderPath = require.resolve('./parser')

const defaultLoaders = {
  wxml: 'wxml-loader',
  wxss: 'extract-loader!css-loader',
  // js: 'babel-loader',
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

    let promise = Promise.resolve()

    // for (let type in parts) {
    let types = ['wxml', 'wxss', 'json']
    types.forEach((type) => {
      if (type in parts) {
        let request = `!!file-loader?name=[path][name].${type}!${getPartLoader(type)}${selectorLoaderPath}?type=${type}!${url}`
        promise = promise.then(() => {
          return new Promise((resolve, reject) => {
            this.loadModule(request, (err, source) => {
              resolve()
            })
          })
        })
      }
    })


    let request = `!!${bundleLoaderPath}!!${selectorLoaderPath}?type=js!${url}`
    output += `require(${loaderUtils.stringifyRequest(this, request)});`
    // promise = promise.then(() => {
    //   return new Promise((resolve, reject) => {
    //     this.loadModule(request, (err, source) => {
    //       console.log(err, source)
    //       this.exec(source, request)
    //       resolve()
    //     })
    //   })
    // })

    // output += `module.exports = function () { return import(/* webpackChunkName: "${loaderUtils.interpolateName(this, '[path][name].js', { context })}" */${loaderUtils.stringifyRequest(this, request)}) }`
    // console.log(output)
    // promise = promise.then(() => {
    //   return new Promise((resolve, reject) => {
    //     this.loadModule(request, (err, source) => {
    //       console.log(err, source)
    //       resolve()
    //     })
    //   })
    // })

    // }

    promise.then(() => {
      done(null, output)
    })
  })
}
