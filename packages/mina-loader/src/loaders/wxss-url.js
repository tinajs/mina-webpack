const postcss = require('postcss')
const postcssUrl = require('postcss-url')

module.exports = function loader(source) {
  const done = this.async()

  const file = this.resourcePath

  const options = {
    from: file,
  }

  const plugins = [postcssUrl({ url: 'inline' })]

  postcss(plugins)
    .process(source, options)
    .then(({ css }) => done(null, css))
    .catch(error => done(error))
}
