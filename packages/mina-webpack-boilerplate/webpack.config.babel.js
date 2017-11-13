import path from 'path'
import MinaEntryPlugin from '@tinajs/mina-entry-webpack-plugin'

const MODULE_DIRNAME = 'mina_modules'

export default {
  context: path.resolve(__dirname, 'src'),
  entry: './app.mina',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name]',
    publicPath: '/',
  },
  module: {
    rules: [
      {
        test: /\.mina$/,
        exclude: /node_modules/,
        use: [{
          loader: '@tinajs/mina-loader',
          options: {
            // todo
            name: '[path][name]',
            // todo
            module: MODULE_DIRNAME,
          },
        }],
      },
      {
        test: /\.mina$/,
        include: /node_modules/,
        use: [{
          loader: '@tinajs/mina-loader',
          options: {
            // todo
            name: `${MODULE_DIRNAME}/[path][name]`
          },
        }],
      },
      {
        test: /\.png$/,
        use: {
          loader: "file-loader",
          options: {
            name: 'assets/[name].[hash:6].[ext]',
          },
        },
      },
    ],
  },
  resolve: {
    symlinks: true,
  },
  plugins: [
    new MinaEntryPlugin({
      // todo
      module: MODULE_DIRNAME,
    }),
  ],
}
