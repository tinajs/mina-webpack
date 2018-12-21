const utils = require('loader-utils')
const extract = require('./helpers/extract')
const getPublicPath = require('./helpers/get-public-path')
const loadModule = require('./helpers/load-module')
const relative = require('./helpers/relative')
const resolve = require('./helpers/resolve')
const visit = require('./helpers/visit')

module.exports = function loader(source) {
  const done = this.async()
  const options = Object.assign(
    {},
    {
      name: '',
      context: '',
      regExp: '',
    },
    utils.getOptions(this)
  )
  const publicPath = getPublicPath({}, this)
  const interpolateName = (content = 'PLACEHOLDER') =>
    utils.interpolateName(this, options.name, {
      context: options.context || this.rootContext,
      content,
      regExp: options.regExp,
    })

  let dependencies = new Map()

  // find untransformed dependencies
  visit(source, () => ({
    CallExpression(path) {
      if (path.node.callee.name === 'require') {
        dependencies.set(path.node.arguments[0].value)
      }
    },
  }))

  // generate a mock filename with placeholder input
  let target = interpolateName()

  Promise.resolve()
    // transform dependencies's pathes
    .then(() =>
      Promise.all(
        Array.from(dependencies.keys()).map(dependency =>
          resolve(this, dependency)
            .then(path => loadModule(this, path))
            .then(code => extract(code, publicPath))
            .then(dest => {
              this.addDependency(dependency)
              dependencies.set(dependency, relative(publicPath + target, dest))
            })
        )
      )
    )
    .then(() => {
      // generate code with transformed dependencies's pathes
      let { code } = visit(source, t => ({
        CallExpression(path) {
          if (path.node.callee.name === 'require') {
            path.node.arguments[0] = t.stringLiteral(
              dependencies.get(path.node.arguments[0].value)
            )
          }
        },
      }))
      // generate the correct filename
      target = interpolateName(code)

      // emit file
      this.emitFile(target, code)

      // and also export the filename in the form of javascript
      done(
        null,
        `module.exports = __webpack_public_path__ + ${JSON.stringify(target)}`
      )
    })
    .catch(error => done(error))
}
