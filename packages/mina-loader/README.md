# mina-loader
> [MINA single-file-component](https://tinajs.github.io/tina/#/guide/package-management-and-build-tools) loader for [Webpack](https://webpack.js.org/).

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
          },
        },
      },
    ],
  },
}
```

## Options
|       Name       | Default |                                        Description                                         |
| ---------------- | ------- | ------------------------------------------------------------------------------------------ |
| loaders          | {}      | A map of *Rules.use*. See [Webpack - Module - Rule.use](https://webpack.js.org/configuration/module/#rule-use) for details. |
| loaders.config   | undefined      | The *Rules.use* for ``<config>``.                                                   |
| loaders.template | undefined      | The *Rules.use* for ``<template>``                                                  |
| loaders.script   | undefined      | The *Rules.use* for ``<script>``                                                    |
| loaders.style    | undefined      | The *Rules.use* for ``<style>``                                                     |

## Example
- [mina-webpack - Full Example](https://github.com/tinajs/mina-webpack/example)
- [mina-loader - test](https://github.com/tinajs/mina-webpack/packages/mina-loader/test)
- [TinaJS - HackerNews Reader](https://github.com/tinajs/tina-hackernews)

## License
Apache-2.0 &copy; [yelo](https://github.com/imyelo), 2017 - present
