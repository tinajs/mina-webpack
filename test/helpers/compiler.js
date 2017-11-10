import path from 'path'
import webpack from 'webpack'
import mfs from './mfs'

const root = path.resolve(__dirname, '..')

export default (fixture, options = {}) => {
  const compiler = webpack({
    context: root,
    entry: `./${fixture}`,
    output: {
      path: '/',
      filename: 'test.build.js',
      chunkFilename: '[name]',
    },
    module: {
      rules: [
        {
          test: /\.mina$/,
          use: {
            loader: require.resolve('../..'),
            options: {

            },
          },
        },
        {
          test: /\.png$/,
          use: {
            loader: "file-loader",
            options: {
              name: '[name].[hash:6].[ext]'
            },
          },
        },
      ],
    },
  })

  compiler.outputFileSystem = mfs

  return new Promise((resolve, reject) => {
    compiler.run((err, stats) => {
      if (err) reject(err)

      resolve(stats)
    })
  })
}
