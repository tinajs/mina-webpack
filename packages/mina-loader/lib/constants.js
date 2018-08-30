const resolve = module => require.resolve(module)

const EXTNAMES = {
  template: 'wxml',
  style: 'wxss',
  script: 'js',
  config: 'json',
}

const TYPES_FOR_FILE_LOADER = ['template', 'style', 'config']
const TYPES_FOR_OUTPUT = ['script']

const LOADERS = {
  template: ({ publicPath, context }) =>
    `${resolve('@tinajs/wxml-loader')}?${JSON.stringify({
      publicPath,
      enforceRelativePath: true,
      root: context,
      raw: true,
    })}`,
  style: ({ publicPath }) =>
    `${resolve('extract-loader')}?${JSON.stringify({ publicPath })}!${resolve(
      'css-loader'
    )}`,
  script: () => '',
  config: ({ publicPath }) =>
    `${resolve('./loaders/mina-json-file')}?${JSON.stringify({ publicPath })}`,
}

exports.EXTNAMES = EXTNAMES
exports.TYPES_FOR_FILE_LOADER = TYPES_FOR_FILE_LOADER
exports.TYPES_FOR_OUTPUT = TYPES_FOR_OUTPUT
exports.LOADERS = LOADERS
