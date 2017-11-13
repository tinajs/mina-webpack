import path from 'path'
import MinaEntryPlugin from '@tinajs/mina-entry-webpack-plugin'

export default {
  context: path.resolve(__dirname, 'src'),
  entry: './app.mina',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
  },
  module: {
    rules: [
      {
        test: /\.mina$/,
        use: [{
          loader: '@tinajs/mina-loader',
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
  plugins: [
    new MinaEntryPlugin(),
  ],
}
