# mina-loader

> [MINA single-file-component](https://tinajs.github.io/tina/#/guide/package-management-and-build-tools) loader for [Webpack](https://webpack.js.org/).

[![npm](https://img.shields.io/npm/v/@tinajs/mina-loader.svg?style=flat-square)](https://www.npmjs.com/package/@tinajs/mina-loader)
[![npm](https://img.shields.io/npm/dw/@tinajs/mina-loader.svg?style=flat-square)](https://www.npmjs.com/package/@tinajs/mina-loader)
[![license](https://img.shields.io/npm/l/@tinajs/mina-loader.svg?style=flat-square)](./LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](http://makeapullrequest.com)

_Inspired by [zezhipeng/mina-loader](https://github.com/zezhipeng/mina-loader)._

## Installation

```bash
npm i --save-dev @tinajs/mina-loader
```

## Usage

```javascript
/**
 * webpack.config.js
 */
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
          /**
           * see Options
           */
          options: {
            loaders: {
              script: 'babel-loader',
              style: {
                loader: 'postcss-loader',
                options: {
                  config: {
                    path: resolve('./postcss.config.js'),
                  },
                },
              },
            },
            languages: {
              less: 'less-loader',
            },
          },
        },
      },
    ],
  },
}
```

For the best particle, you might also be interested in [mina-webpack](https://github.com/tinajs/mina-webpack/).

## Options

| Name             | Default                                                                             | Description                                                                                                                                                                   |
| ---------------- | ----------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| loaders          | `{}`                                                                                | A map of _Rules.use_. See [Webpack - Module - Rule.use](https://webpack.js.org/configuration/module/#rule-use) for details.                                                   |
| loaders.config   | `undefined`                                                                         | The _Rules.use_ for `<config>`.                                                                                                                                               |
| loaders.template | `undefined`                                                                         | The _Rules.use_ for `<template>`                                                                                                                                              |
| loaders.script   | `undefined`                                                                         | The _Rules.use_ for `<script>`                                                                                                                                                |
| loaders.style    | `undefined`                                                                         | The _Rules.use_ for `<style>`                                                                                                                                                 |
| languages        | `{}`                                                                                | Used in the `.mina` file with the lang attribute. A map of _Rules.use_. See [Webpack - Module - Rule.use](https://webpack.js.org/configuration/module/#rule-use) for details. |
| publicPath       | [output.publicPath](https://webpack.js.org/configuration/output/#output-publicpath) | Useful for relative `publicPath`, see [extract-loader - options](https://github.com/peerigon/extract-loader#options)                                                          |

## Example

- [mina-webpack - Full Example](https://github.com/tinajs/mina-webpack/tree/master/example)
- [mina-loader - test](https://github.com/tinajs/mina-webpack/tree/master/packages/mina-loader/test)
- [TinaJS - HackerNews Reader](https://github.com/tinajs/tina-hackernews)

## License

Apache-2.0 &copy; [yelo](https://github.com/imyelo), 2017 - present
