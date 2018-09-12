const resolve = module => require.resolve(module)

const EXTNAMES = {
  template: '.wxml',
  style: '.wxss',
  script: '.js',
  config: '.json',
}

const RESOLVE_EXTENSIONS = [
  EXTNAMES.script,
  EXTNAMES.template,
  EXTNAMES.config,
  EXTNAMES.style,
]

const TAGS_FOR_FILE_LOADER = ['template', 'style', 'config']
const TAGS_FOR_OUTPUT = ['script']

const LOADERS = {
  template: ({ publicPath, context, minimize }) =>
    `${resolve('@tinajs/wxml-loader')}?${JSON.stringify({
      publicPath,
      enforceRelativePath: true,
      root: context,
      minimize,
      raw: false,
    })}`,
  style: () => resolve('css-loader'),
  script: () => '',
  config: ({ publicPath, minimize }) =>
    `${resolve('./loaders/mina-json-file')}?${JSON.stringify({
      publicPath,
      minimize,
    })}`,
}

exports.EXTNAMES = EXTNAMES
exports.RESOLVE_EXTENSIONS = RESOLVE_EXTENSIONS
exports.TAGS_FOR_FILE_LOADER = TAGS_FOR_FILE_LOADER
exports.TAGS_FOR_OUTPUT = TAGS_FOR_OUTPUT
exports.LOADERS = LOADERS
