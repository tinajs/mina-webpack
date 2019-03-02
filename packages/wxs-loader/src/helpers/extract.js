const vm = require('vm')
/**
 * Forked from:
 * https://github.com/peerigon/extract-loader/blob/f5a1946a7b54ef962e5af56aaf29d318efaabf66/src/extractLoader.js#L110
 * https://github.com/Cap32/wxml-loader/blob/986c2a07f195c0f8f4e35169148e4965061a50f6/src/index.js#L21
 */
module.exports = function(src, publicPath = '') {
  const script = new vm.Script(src, {
    displayErrors: true,
  })
  const sandbox = {
    module: {},
    __webpack_public_path__: publicPath,
  }

  script.runInNewContext(sandbox)
  return sandbox.module.exports.toString()
}
