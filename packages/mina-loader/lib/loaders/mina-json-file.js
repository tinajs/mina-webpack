const path = require('path')
const loaderUtils = require('loader-utils')
const resolveFrom = require('resolve-from')

module.exports = function (source) {
  let config = JSON.parse(source)

  if (config && Array.isArray(config.pages)) {
    config.pages = config.pages.map((page) => {
      if (page.match(/^~/)) {
        return resolveFromModule(this.context, page)
      }
      return page
    })
  }

  return JSON.stringify(config, null, 2)
}

function resolveFromModule (context, filename) {
  return path.relative(context, resolveFrom(context, loaderUtils.urlToRequest(`${filename}.mina`)))
    .replace(/\.\./g, '_')
    .replace(/\.mina$/, '')
}
