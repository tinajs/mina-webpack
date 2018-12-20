const utils = require('loader-utils')
const extract = require('./helpers/extract')
const getPublicPath = require('./helpers/get-public-path')
const loadModule = require('./helpers/load-module')
const resolve = require('./helpers/resolve')
const visit = require('./helpers/visit')

module.exports = function loader(source) {
  const done = this.async()
  const webpackOptions = utils.getOptions(this) || {}
  const publicPath = getPublicPath(webpackOptions, this)

  let dependencies = new Map()

  visit(source, () => ({
    CallExpression(path) {
      if (path.node.callee.name === 'require') {
        dependencies.set(path.node.arguments[0].value)
      }
    },
  }))

  Promise.all(
    Array.from(dependencies.keys()).map(dependency =>
      resolve(this, dependency)
        .then(path => loadModule(this, path))
        .then(code => extract(code, publicPath))
        .then(dest => {
          this.addDependency(dependency)
          dependencies.set(dependency, dest)
        })
    )
  )
    .then(() => {
      let { code } = visit(source, t => ({
        CallExpression(path) {
          if (path.node.callee.name === 'require') {
            path.node.arguments[0] = t.stringLiteral(
              dependencies.get(path.node.arguments[0].value)
            )
          }
        },
      }))
      done(null, code)
    })
    .catch(error => {
      done(error)
    })
}
