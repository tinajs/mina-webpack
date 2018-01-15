# mina-entry-webpack-plugin
> Automaticly generates entries-list from mina files for [Webpack](https://webpack.js.org/)

[![npm](https://img.shields.io/npm/v/@tinajs/mina-entry-webpack-plugin.svg?style=flat-square)](https://www.npmjs.com/package/@tinajs/mina-entry-webpack-plugin)
[![npm](https://img.shields.io/npm/dw/@tinajs/mina-entry-webpack-plugin.svg?style=flat-square)](https://www.npmjs.com/package/@tinajs/mina-entry-webpack-plugin)
[![license](https://img.shields.io/npm/l/@tinajs/mina-entry-webpack-plugin.svg?style=flat-square)](./LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](http://makeapullrequest.com)

## Installation
```bash
npm i --save-dev @tinajs/mina-entry-webpack-plugin
```

## Usage
```javascript
/**
 * webpack.config.js
 */
const webpack = require('webpack')
const MinaEntryPlugin = require('@tinajs/mina-entry-webpack-plugin')
const resolve = require('path').resolve

module.exports = {
  context: resolve('src'),
  entry: './app.mina',
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
    new MinaEntryPlugin({
      map: (entry) => ['es6-promise/dist/es6-promise.auto.js', entry],
    }),
  ],
}
```

For the best particle, you might also be interested in [mina-webpack](https://github.com/tinajs/mina-webpack/).

## Options
| Name | Default  |                             Description                             |
| ---- | -------- | ------------------------------------------------------------------- |
| map  | (e) => e | Mapper function for each entry. Useful for adding polyfill scripts. |

## Example
- [mina-webpack - Full Example](https://github.com/tinajs/mina-webpack/tree/master/example)
- [TinaJS - HackerNews Reader](https://github.com/tinajs/tina-hackernews)

## License
Apache-2.0 &copy; [yelo](https://github.com/imyelo), 2017 - present
