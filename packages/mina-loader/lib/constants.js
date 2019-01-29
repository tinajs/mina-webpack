const resolve = module => require.resolve(module)

const DEFAULT_EXTENSIONS = {
  TEMPLATE: '.wxml',
  STYLE: '.wxss',
  CONFIG: '.json',
}

const RESOLVABLE_EXTENSIONS = ['.js', '.wxml', '.json', '.wxss']

const TAGS_FOR_FILE_LOADER = ['template', 'style', 'config']
const TAGS_FOR_OUTPUT = ['script']

const LOADERS = {
  template: ({ publicPath, context, minimize }) =>
    `${resolve('@tinajs/wxml-loader')}?${JSON.stringify({
      publicPath,
      enforceRelativePath: true,
      root: context,
      minimize,
      raw: true,
    })}`,
  style: ({ publicPath, useWxssUrl }) => {
    let arrLoader = [
      `${resolve('extract-loader')}?${JSON.stringify({ publicPath })}`,
      `${resolve('css-loader')}?${JSON.stringify({ url: !useWxssUrl })}`,
    ]
    if (useWxssUrl) {
      arrLoader.push(`${resolve('./loaders/wxss-url')}`)
    }
    return arrLoader.join('!')
  },
  script: () => '',
  config: ({ publicPath, minimize }) =>
    `${resolve('./loaders/mina-json')}?${JSON.stringify({
      publicPath,
      minimize,
    })}`,
}

exports.DEFAULT_EXTENSIONS = DEFAULT_EXTENSIONS
exports.RESOLVABLE_EXTENSIONS = RESOLVABLE_EXTENSIONS
exports.TAGS_FOR_FILE_LOADER = TAGS_FOR_FILE_LOADER
exports.TAGS_FOR_OUTPUT = TAGS_FOR_OUTPUT
exports.LOADERS = LOADERS
