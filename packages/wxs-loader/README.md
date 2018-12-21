# wxs-loader

> [wxs](https://developers.weixin.qq.com/miniprogram/dev/framework/view/wxs/01wxs-module.html) loader for [Webpack](https://webpack.js.org/).

[![npm](https://img.shields.io/npm/v/@tinajs/wxs-loader.svg?style=flat-square)](https://www.npmjs.com/package/@tinajs/wxs-loader)
[![npm](https://img.shields.io/npm/dw/@tinajs/wxs-loader.svg?style=flat-square)](https://www.npmjs.com/package/@tinajs/wxs-loader)
[![license](https://img.shields.io/npm/l/@tinajs/wxs-loader.svg?style=flat-square)](./LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](http://makeapullrequest.com)

## Installation

```bash
npm i --save-dev @tinajs/wxs-loader
```

## Usage

```javascript
/**
 * webpack.config.js
 */
module.exports = {
  context: resolve('src'),
  mode: 'production',
  entry: {
    'app.mina': './app.mina',
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
          loader: '@tinajs/mina-loader',
        },
      },
      {
        test: /\.wxs$/,
        use: [
          {
            loader: '@tinajs/wxs-loader',
            options: {
              name: 'wxs/[name].[hash:6].[ext]',
            },
          },
        ],
      },
    ],
  },
}
```

For the best particle, you might also be interested in [mina-webpack](https://github.com/tinajs/mina-webpack/).

## Options

| Name    | Default        | Description                                                                                                 |
| ------- | -------------- | ----------------------------------------------------------------------------------------------------------- |
| name    | `[hash].[ext]` | Custom filename template, same as [file-loader - name](https://github.com/webpack-contrib/file-loader#name) |
| context | `context`      | Same as [file-loader - context](https://github.com/webpack-contrib/file-loader#context)                     |
| regExp  | `undefined`    | Same as [file-loader - regExp](https://github.com/webpack-contrib/file-loader#regexp)                       |

## Example

- [mina-webpack - Full Example](https://github.com/tinajs/mina-webpack/tree/master/example)
- [wxs-loader - test](https://github.com/tinajs/mina-webpack/tree/master/packages/wxs-loader/test)

## License

Apache-2.0 &copy; [yelo](https://github.com/imyelo), 2018 - present
