const { resolve } = require('path')
const MinaEntryPlugin = require('../../')

module.exports = {
  context: resolve(__dirname, '.'),
  entry: './app.mina',
  output: {
    path: resolve(__dirname, 'dist'),
    filename: '[name]'
  },
  module: {
    rules: [
      {
        test: /\.mina$/,
        use: 'raw-loader'
      },
      {
        test: /\.(json|wxml|wxss)$/,
        use: {
          loader: 'file-loader',
          options: {
            name: '[path][name].[ext]'
          }
        }
      }
    ]
  },
  plugins: [
    new MinaEntryPlugin()
  ]
}