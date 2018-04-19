import path from 'path'
import webpack from 'webpack'
import merge from 'webpack-merge'
import MemoryFS from 'memory-fs'

const root = path.resolve(__dirname, '..')

function extname (fullpath, ext) {
  return path.format({
    dir: path.dirname(fullpath),
    name: path.basename(fullpath, path.extname(fullpath)),
    ext: ext,
  })
}

export default (options = {}) => {
  const mfs = new MemoryFS()

  options = merge.smart({
    context: root,
    output: {
      path: '/',
      publicPath: '/',
    },
    module: {
      rules: [
        {
          test: /\.mina$/,
          use: {
            loader: require.resolve('../..'),
          },
        },
        {
          test: /\.png$/,
          use: {
            loader: "file-loader",
            options: {
              name: 'assets/[name].[hash:6].[ext]'
            },
          },
        },
        {
          test: /\.wxml$/,
          use: [{
            loader: 'relative-file-loader',
            options: {
              name: 'wxml/[name].[hash:6].[ext]',
            },
          }, 'wxml-loader'],
        },
      ],
    },
  }, options)

  return {
    mfs,
    compile () {
      const compiler = webpack(options)
      compiler.outputFileSystem = mfs
      return new Promise((resolve, reject) => {
        compiler.run((err, stats) => {
          if (err) reject(err)

          resolve(stats)
        })
      })
    },
  }
}
