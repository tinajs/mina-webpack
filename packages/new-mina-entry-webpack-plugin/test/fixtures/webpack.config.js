const { resolve } = require('path')
const MinaEntryPlugin = require('../../')

const relativeFileLoader = function () {
  return {
    loader: 'file-loader',
    options: {
      useRelativePath: true,
      name: '[name].[ext]'
    }
  }
}

module.exports = {
  context: resolve(__dirname, '.'),
  entry: './app.mina',
  output: {
    path: resolve(__dirname, 'dist'),
    filename: '[name].js'
  },
  module: {
    rules: [
      {
        test: /\.mina$/,
        use: 'raw-loader'
      },
      {
        test: /\.(json|wxml|wxss)$/,
        use: relativeFileLoader()
      }
    ]
  },
  plugins: [
    new MinaEntryPlugin()
  ]
}