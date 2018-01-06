# mina-entry-webpack-plugin
> Automaticly generates entries-list from mina files for [Webpack](https://webpack.js.org/)

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

## Options
| Name | Default  |                             Description                             |
| ---- | -------- | ------------------------------------------------------------------- |
| map  | (e) => e | Mapper function for each entry. Useful for adding polyfill scripts. |

## Example
- [mina-webpack - Full Example](https://github.com/tinajs/mina-webpack/example)
- [TinaJS - HackerNews Client](https://github.com/tinajs/tina-hackernews)

## License
Apache-2.0 &copy; [yelo](https://github.com/imyelo), 2017 - present
