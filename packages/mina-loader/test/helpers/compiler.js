import path from 'path'
import webpack from 'webpack'
import merge from 'webpack-merge'
import MemoryFS from 'memory-fs'

const root = path.resolve(__dirname, '..')

export default (options = {}) => {
  const mfs = new MemoryFS()

  options = merge.smart(
    {
      mode: 'none',
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
              // TODO this should'be add .loaders to configure different loaders for script/style
            },
          },
          {
            test: /\.png$/,
            use: {
              loader: 'file-loader',
              options: {
                name: 'assets/[name].[hash:6].[ext]',
              },
            },
          },
          {
            test: /\.wxml$/,
            use: [
              {
                loader: 'file-loader',
                options: {
                  name: 'wxml/[name].[hash:6].[ext]',
                },
              },
              {
                loader: '@tinajs/wxml-loader',
                options: {
                  raw: true,
                },
              },
            ],
          },
        ],
      },
    },
    options
  )

  return {
    mfs,
    compile() {
      const compiler = webpack(options)
      compiler.outputFileSystem = mfs
      return new Promise((resolve, reject) => {
        compiler.run((err, stats) => {
          if (err) {
            reject(err)
          } else {
            resolve(stats)
          }
        })
      })
    },
  }
}
