# mina-runtime-webpack-plugin
> A runtime patch for compiling mina project by [Webpack](https://webpack.js.org/).

[![npm](https://img.shields.io/npm/v/@tinajs/mina-runtime-webpack-plugin.svg?style=flat-square)](https://www.npmjs.com/package/@tinajs/mina-runtime-webpack-plugin)
[![npm](https://img.shields.io/npm/dw/@tinajs/mina-runtime-webpack-plugin.svg?style=flat-square)](https://www.npmjs.com/package/@tinajs/mina-runtime-webpack-plugin)
[![license](https://img.shields.io/npm/l/@tinajs/mina-runtime-webpack-plugin.svg?style=flat-square)](./LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](http://makeapullrequest.com)

*Heavily inspired by and forked from [Cap32/wxapp-webpack-plugin](https://github.com/Cap32/wxapp-webpack-plugin).*

## Installation
```bash
npm i --save-dev @tinajs/mina-runtime-webpack-plugin
```

## Usage
```javascript
/**
 * webpack.config.js
 */
const webpack = require('webpack')
const MinaRuntimePlugin = require('@tinajs/mina-runtime-webpack-plugin')

const resolve = require('path').resolve

module.exports = {
  context: resolve('src'),
  entry: {
    'app.mina': './app.mina',
    'pages/home.mina': './pages/home.mina',
  },
  output: {
    path: resolve('dist'),
    filename: '[name]',
    publicPath: '/',
  },
  module: {
    rules: [
      {
        test: /\.mina$/,
        use: {
          loader: 'mina-loader',
        },
      },
    ],
  },
  plugins: [
    new MinaRuntimePlugin({
      runtime: './common.js',
    }),
    new webpack.optimize.CommonsChunkPlugin({
      name: 'common.js',
      minChunks: 2,
    }),
  ],
}
```

For the best particle, you might also be interested in [mina-webpack](https://github.com/tinajs/mina-webpack/).

## Options
|  Name   |  Default  |                         Description                          |
| ------- | --------- | ------------------------------------------------------------ |
| runtime | undefined | The file which the runtime included. (usually ``common.js``) |

## Example
- [mina-webpack - Full Example](https://github.com/tinajs/mina-webpack/tree/master/example)
- [TinaJS - HackerNews Reader](https://github.com/tinajs/tina-hackernews)

## License
MIT &copy; [yelo](https://github.com/imyelo), 2017 - present
