const resolve = (module: string) => require.resolve(module)

export const DEFAULT_EXTENSIONS = {
  TEMPLATE: '.wxml',
  STYLE: '.wxss',
  CONFIG: '.json',
}

export const RESOLVABLE_EXTENSIONS = ['.js', '.wxml', '.json', '.wxss']

export const TAGS_FOR_FILE_LOADER = ['template', 'style', 'config']
export const TAGS_FOR_OUTPUT = ['script']
export const DEFAULT_CONTENT_OF_TAG = {
  template: '',
  style: '',
  config: '{}',
  script: '',
}

export const LOADERS = {
  template: ({
    publicPath,
    context,
    minimize,
    enforceRelativePath,
  }: {
    publicPath: string
    context: any
    minimize: boolean
    enforceRelativePath: boolean,
  }) =>
    `${resolve('@tinajs/wxml-loader')}?${JSON.stringify({
      publicPath,
      enforceRelativePath,
      root: context,
      minimize,
      raw: true,
    })}`,
  style: ({
    publicPath,
    useWxssUrl,
  }: {
    publicPath: string
    useWxssUrl: boolean
  }) => {
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
  config: ({
    publicPath,
    minimize,
  }: {
    publicPath: string
    minimize: boolean
  }) =>
    `${resolve('./loaders/mina-json')}?${JSON.stringify({
      publicPath,
      minimize,
    })}`,
}
