/**
 * Retrieves the public path from the loader options, context.options (webpack <4) or context._compilation (webpack 4+).
 * context._compilation is likely to get removed in a future release, so this whole function should be removed then.
 * See: https://github.com/peerigon/extract-loader/issues/35
 *
 * @deprecated
 * @param {Object} options - Extract-loader options
 * @param {Object} context - Webpack loader context
 * @returns {string}
 */
module.exports = function getPublicPath(options, context) {
  const property = 'publicPath'

  if (property in options) {
    return options[property]
  }

  if (
    context.options &&
    context.options.output &&
    property in context.options.output
  ) {
    return context.options.output[property]
  }

  if (
    context._compilation &&
    context._compilation.outputOptions &&
    property in context._compilation.outputOptions
  ) {
    return context._compilation.outputOptions[property]
  }

  return ''
}
