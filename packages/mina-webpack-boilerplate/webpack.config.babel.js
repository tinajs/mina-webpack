import path from 'path'

export default {
  context: path.resolve(__dirname, 'src'),
  entry: {
    basic: './basic.mina',
  },
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
}
