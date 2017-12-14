<h1 align="center">mina-webpack</h1>
<p align="center"> Mina single-file-component meets Webpack</p>
<p align="center"><img src="https://github.com/tinajs/assets/raw/master/images/mina-webpack/equation.png" /></p>

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
- [mina-runtime-webpack-plugin](./packages/mina-runtime-webpack-plugin)
- [mina-entry-webpack-plugin](./packages/mina-entry-webpack-plugin)

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
    "page"
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
- [TinaJS - HackerNews Client](https://github.com/tinajs/tina-hackernews)

## Related Projects
- [TinaJS](https://github.com/tinajs/tina)
- [template-mina](https://github.com/tinajs/template-mina)
- [gulp-mina](https://github.com/tinajs/gulp-mina)
- [Cap32/wxapp-webpack-plugin](https://github.com/Cap32/wxapp-webpack-plugin)
- [CantonJS/wxapp-boilerplate](https://github.com/cantonjs/wxapp-boilerplate)
