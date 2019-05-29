import postcss from 'postcss'
import postcssUrl from 'postcss-url'
import webpack from 'webpack'

const wxssUrlLoader: webpack.loader.Loader = function wxssUrlLoader(source) {
  const done = this.async()

  const file = this.resourcePath

  const options = {
    from: file,
  }

  const plugins = [postcssUrl({ url: 'inline' })]

  postcss(plugins)
    .process(source, options)
    .then(({ css }) => {
      if (done) {
        done(null, css)
      }
    })
    .catch((error: Error) => done && done(error))
}

export default wxssUrlLoader
