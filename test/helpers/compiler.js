import path from 'path'
import webpack from 'webpack'
import mfs from './mfs'

const root = path.resolve(__dirname, '..')

function extname (fullpath, ext) {
  return path.format({
    dir: path.dirname(fullpath),
    name: path.basename(fullpath, path.extname(fullpath)),
    ext: ext,
  })
}

export default (fixture, options = {}) => {
  const compiler = webpack({
    context: root,
    entry: `./${fixture}`,
    output: {
      path: '/',
      filename: extname(fixture, '.js'),
    },
    module: {
      rules: [
        {
          test: /\.mina$/,
          use: [{
            loader: require.resolve('../..'),
            options: {
            },
          }],
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
