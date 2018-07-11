<h1 align="center">mina-webpack</h1>
<p align="center"> Mina single-file-component meets Webpack</p>
<p align="center"><img src="https://github.com/tinajs/assets/raw/master/images/mina-webpack/equation.png" /></p>

[![Build Status](https://travis-ci.org/tinajs/mina-webpack.svg?branch=master)](https://travis-ci.org/tinajs/mina-webpack)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](http://makeapullrequest.com)
[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2Ftinajs%2Fmina-webpack.svg?type=small)](https://app.fossa.io/projects/git%2Bgithub.com%2Ftinajs%2Fmina-webpack?ref=badge_small)

## Get Started
We recommend you to get started with [template-mina](https://github.com/tinajs/template-mina):

```bash
npm i -g sao

sao mina my-app
cd my-app
npm start
```

And see how to use with [TinaJS](https://tinajs.github.io/tina/#/guide/package-management-and-build-tools)

## Packages included
- [mina-loader](./packages/mina-loader)

  [![npm](https://img.shields.io/npm/v/@tinajs/mina-loader.svg?style=flat-square)](https://www.npmjs.com/package/@tinajs/mina-loader)
  [![npm](https://img.shields.io/npm/dw/@tinajs/mina-loader.svg?style=flat-square)](https://www.npmjs.com/package/@tinajs/mina-loader)
  [![license](https://img.shields.io/npm/l/@tinajs/mina-loader.svg?style=flat-square)](./LICENSE)

- [mina-runtime-webpack-plugin](./packages/mina-runtime-webpack-plugin)

  [![npm](https://img.shields.io/npm/v/@tinajs/mina-runtime-webpack-plugin.svg?style=flat-square)](https://www.npmjs.com/package/@tinajs/mina-runtime-webpack-plugin)
  [![npm](https://img.shields.io/npm/dw/@tinajs/mina-runtime-webpack-plugin.svg?style=flat-square)](https://www.npmjs.com/package/@tinajs/mina-runtime-webpack-plugin)
  [![license](https://img.shields.io/npm/l/@tinajs/mina-runtime-webpack-plugin.svg?style=flat-square)](./LICENSE)

- [mina-entry-webpack-plugin](./packages/mina-entry-webpack-plugin)

  [![npm](https://img.shields.io/npm/v/@tinajs/mina-entry-webpack-plugin.svg?style=flat-square)](https://www.npmjs.com/package/@tinajs/mina-entry-webpack-plugin)
  [![npm](https://img.shields.io/npm/dw/@tinajs/mina-entry-webpack-plugin.svg?style=flat-square)](https://www.npmjs.com/package/@tinajs/mina-entry-webpack-plugin)
  [![license](https://img.shields.io/npm/l/@tinajs/mina-entry-webpack-plugin.svg?style=flat-square)](./LICENSE)

## Manual Installation
```bash
npm i --save-dev \
  @tinajs/mina-entry-webpack-plugin \
  @tinajs/mina-runtime-webpack-plugin \
  @tinajs/mina-loader
```

## Simplest Usage
**webpack.config.js**:
```javascript
const webpack = require('webpack')
const MinaEntryPlugin = require('@tinajs/mina-entry-webpack-plugin')
const MinaRuntimePlugin = require('@tinajs/mina-runtime-webpack-plugin')
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
          options: {
            loaders: {
              script: 'babel-loader',
            },
          },
        },
      },
    ],
  },
  plugins: [
    new MinaEntryPlugin({
      map: (entry) => ['es6-promise/dist/es6-promise.auto.js', entry],
    }),
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

**app.mina**:
```html
<config>
{
  "pages": [
    "page.mina"
  ]
}
</config>

<script>
require('./dependency.js')
App({
  onLaunch () {
    console.log(say({ text: 'Hello from App!' }))
  }
})
</script>
```

**page.mina**:
```html
<config>
{
  "window":{
    "navigationBarTitleText": "Hello, World!"
  }
}
</config>

<style>
.blue {
  color: #00f;
}
</style>

<template>
  <view>
    <text class="blue">{{ msg }}</text>
  </view>
</template>

<script>
require('./dependency.js')
Page({
  onLoad () {
    this.setData({
      msg: 'Hello from Page!',
    })
  },
})
</script>
```

## Examples
- [mina-webpack - Full Example](./example)
- [mina-loader - test](./packages/mina-loader/test)
- [TinaJS - HackerNews Reader](https://github.com/tinajs/tina-hackernews)

## Related Projects
### Best to use with
- [TinaJS](https://github.com/tinajs/tina)

### Scaffolds
- [template-mina](https://github.com/tinajs/template-mina)
- [ambar/new-mina](https://github.com/ambar/new-mina)

### Other package compiler (also alternatives)
- [gulp-mina](https://github.com/tinajs/gulp-mina)

### Got inspiration from
- [Cap32/wxapp-webpack-plugin](https://github.com/Cap32/wxapp-webpack-plugin)
- [CantonJS/wxapp-boilerplate](https://github.com/cantonjs/wxapp-boilerplate)
- [zezhipeng/mina-loader](https://github.com/zezhipeng/mina-loader)
- [Vue - Single File Component](https://vuejs.org/v2/guide/single-file-components.html)

[![](https://github.com/tinajs/assets/raw/master/images/banners/sponsored.png)](https://github.com/tinajs/tina)
