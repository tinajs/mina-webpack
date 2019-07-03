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

// implement yourself if necessary
const CustomFileTypeConfigReader = require('./custom-file-type-config-loader')

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
          loader: '@tinajs/mina-loader',
        },
      },
    ],
  },
  plugins: [
    new MinaEntryPlugin({
      map: (entry) => ['es6-promise/dist/es6-promise.auto.js', entry],
      rules: [{
        {
          pattern: '**/*.custom-file-type',
          reader: CustomFileTypeConfigReader,
        },
      }],
    }),
  ],
}
```

For the best particle, you might also be interested in [mina-webpack](https://github.com/tinajs/mina-webpack/).

## Options

| Name                | Default                              | Description                                                                                                                                                  |
| ------------------- | ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| map                 | (e) => e                             | Mapper function for each entry. Useful for adding polyfill scripts.                                                                                          |
| rules               | []                                   | Rules of custom config readers. See https://github.com/tinajs/mina-webpack/blob/master/packages/mina-loader/test/mina-entry-plugin.js#L204-L264 for examples |
| rules[].pattern     | ''                                   | [Pattern, using glob expressions](https://www.npmjs.com/package/minimatch)                                                                                   |
| rules[].reader      | ConfigReader                         | Custom config reader, should inherit from [ConfigReader](./lib/interfaces/config-reader.js) and implement its `getConfig` interface                          |
| extensions          | ...                                  | The extension names of each block for the separation (classical) files.                                                                                      |
| extensions.template | `['.wxml']`                          | The extension name of the `<template>` block                                                                                                                 |
| extensions.style    | `['.wxss']`                          | The extension name of the `<style>` block                                                                                                                    |
| extensions.script   | `['.js']`                            | The extension name of the `<script>` block                                                                                                                   |
| extensions.config   | `['.json']`                          | The extension name of the `<config>` block                                                                                                                   |
| extensions.resolve  | `['.js', '.wxml', '.json', '.wxss']` | The resolving order of extensions for the separation (classical) files.                                                                                      |
| minaLoaderOptions   | {}                                   | Options of `mina-loader` for classical components, usually you can just leave it by default.                                                                 |

## Example

- [mina-webpack - Full Example](https://github.com/tinajs/mina-webpack/tree/master/example)
- [TinaJS - HackerNews Reader](https://github.com/tinajs/tina-hackernews)

## License

Apache-2.0 &copy; [yelo](https://github.com/imyelo), 2017 - present
