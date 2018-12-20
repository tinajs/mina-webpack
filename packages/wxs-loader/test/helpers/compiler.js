import path from 'path'
import webpack from 'webpack'
import Config from 'webpack-chain'
import MemoryFS from 'memory-fs'

const root = path.resolve(__dirname, '..')

export default (use = () => {}) => {
  const mfs = new MemoryFS()
  const config = new Config()

  config.mode('none').context(root)

  config.output.path('/').publicPath('/')

  config.module
    .rule('wxs')
    .test(/\.wxs$/)
    .use('file')
    .loader(require.resolve('file-loader'))
    .options({
      name: 'assets/[name].[hash:6].[ext]',
    })
    .end()
    .use('wxs')
    .loader(require.resolve('../..'))
    .end()

  use(config)

  return {
    mfs,
    compile() {
      const compiler = webpack(config.toConfig())
      compiler.outputFileSystem = mfs
      return new Promise((resolve, reject) =>
        compiler.run((err, stats) => {
          if (err) {
            return reject(err)
          }
          resolve(stats)
        })
      )
    },
  }
}
