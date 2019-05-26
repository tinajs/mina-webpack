import { OptionObject } from 'loader-utils'

const resolve = (module: string) => require.resolve(module)

export const DEFAULT_EXTENSIONS = {
  TEMPLATE: '.wxml',
  STYLE: '.wxss',
  CONFIG: '.json',
}

export type Tag = 'config' | 'template' | 'style' | 'script'

export const RESOLVABLE_EXTENSIONS = ['.js', '.wxml', '.json', '.wxss']

export const TAGS_FOR_FILE_LOADER: Tag[] = ['template', 'style', 'config']

export const TAGS_FOR_OUTPUT: Tag[] = ['script']

export const DEFAULT_CONTENT_OF_TAG: Record<Tag, string> = {
  template: '',
  style: '',
  config: '{}',
  script: '',
}

export type LoaderOptions = Partial<{
  minimize: boolean
  enforceRelativePath: boolean
  useWxssUrl: boolean
  languages: Record<string, string>
  loader: string
  loaders: Record<Tag, string | (string | LoaderOptions)[]>
}> &
  Partial<{
    context: any
    publicPath: string
    options: OptionObject
  }>

export const LOADERS: Record<Tag, (options: LoaderOptions) => string> = {
  template: ({ publicPath, context, minimize, enforceRelativePath }) =>
    `${resolve('@tinajs/wxml-loader')}?${JSON.stringify({
      publicPath,
      enforceRelativePath,
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
