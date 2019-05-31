import path from 'path'
import chain from 'object-path'
import merge from 'lodash/merge'
import compose from 'compose-function'
import loaderUtils from 'loader-utils'
import resolveFrom from 'resolve-from'
import ensurePosix from 'ensure-posix-path'
import Debug from 'debug'
import * as helpers from '../helpers'

const debug = Debug('loaders:mina')

const rawLoaderPath = require.resolve('raw-loader')
const selectorLoaderPath = require.resolve('./selector')
const parserLoaderPath = require.resolve('./parser')

import {
  DEFAULT_EXTENSIONS,
  TAGS_FOR_FILE_LOADER,
  TAGS_FOR_OUTPUT,
  DEFAULT_CONTENT_OF_TAG,
  LOADERS,
  Tag,
  LoaderOptions,
} from '../constants'
import webpack = require('webpack')

async function getBlocks(
  loaderContext: webpack.loader.LoaderContext,
  request: string
): Promise<any> {
  request = `!${parserLoaderPath}!${request}`
  const source = await helpers.loadModule.call(loaderContext, request)
  return loaderContext.exec(source, request)
}

type LoaderAttributes = {
  lang: string
  src: string
}

const getLoaders = (
  loaderContext: webpack.loader.LoaderContext,
  tag: Tag,
  options: LoaderOptions,
  attributes: Partial<LoaderAttributes> = {}
) => {
  let loader = LOADERS[tag](options) || ''
  let lang = attributes.lang

  /**
   * Because we can't add built-in loaders if we satisfy the [inline url rule](https://webpack.js.org/concepts/loaders/#inline) (especially by overriding the original rule with an `!` in the header), at this point when the users are using the `src` attribute, we can't automatically add built-in loaders for them and instead they need to manually set the rules themselves.
   */
  if (attributes.src) {
    return ''
  }

  // append custom loader
  let custom = lang
    ? (options.languages || {})[lang] || `${lang}-loader`
    : (options.loaders ||
        ({} as Record<Tag, string | (string | LoaderOptions)[]>))[tag]
  if (custom) {
    custom = helpers.stringifyLoaders(
      helpers.parseLoaders(custom).map(object => {
        return merge({}, object, {
          loader: resolveFrom(loaderContext.rootContext, object.loader || ''),
        })
      })
    )
    loader = loader ? `${loader}!${custom}` : custom
  }

  return loader
}

function select(originalRequest: string, tag: string) {
  return `${selectorLoaderPath}?tag=${tag}!${originalRequest}`
}

type BlockResult = {
  tag: Tag
  content: string
}

const mina: webpack.loader.Loader = function mina() {
  this.cacheable()

  const done = this.async()
  const webpackOptions = loaderUtils.getOptions(this) || {}
  const extensions: Partial<Record<Tag, string>> = {
    config: DEFAULT_EXTENSIONS.CONFIG,
    template: DEFAULT_EXTENSIONS.TEMPLATE,
    style: DEFAULT_EXTENSIONS.STYLE,
  }
  const options = merge(
    {},
    {
      loaders: {
        config: '',
        template: '',
        script: '',
        style: '',
      },
      languages: {},
      extensions,
      transform: (ast: any, opts?: object) => ast,
      publicPath: helpers.getPublicPath(webpackOptions, this),
      useWxssUrl: true,
      context: this.rootContext,
      minimize: process.env.NODE_ENV === 'production',
      enforceRelativePath: true,
    },
    webpackOptions
  )

  if (options.translations) {
    this.emitWarning(
      new Error(
        'The api `translations` of mina-loader is deprecated. Please use `transform` instead.'
      )
    )
  }

  const originalRequest = loaderUtils.getRemainingRequest(this)
  const filePath = this.resourcePath
  const dirname = compose(
    ensurePosix,
    helpers.toSafeOutputPath,
    path.dirname
  )(path.relative(this.rootContext, filePath))

  getBlocks(this, originalRequest)
    .then(blocks =>
      Promise.all(
        [...TAGS_FOR_FILE_LOADER, ...TAGS_FOR_OUTPUT].map(async (tag: Tag) => {
          let result: BlockResult = {
            tag,
            content: DEFAULT_CONTENT_OF_TAG[tag],
          }

          if (
            !blocks[tag] ||
            !(
              blocks[tag].content ||
              (blocks[tag].attributes && blocks[tag].attributes.src)
            )
          ) {
            return Promise.resolve(result)
          }

          let request =
            '!!' +
            [
              rawLoaderPath,
              getLoaders(
                this,
                tag,
                options,
                chain.get(blocks, `${tag}.attributes`)
              ),
              select(originalRequest, tag),
            ]
              .filter(Boolean)
              .join('!')
          const raw = await helpers.loadModule.call(this, request)
          const content = this.exec(raw, originalRequest)
          result.content = content
          return result
        })
      )
        .then(async blocks => {
          let ast = {
            name: loaderUtils.interpolateName(this, `${dirname}/[name]`, {}),
            blocks,
          }
          let warning = (error: Error) => this.emitWarning(error)
          return await options.transform(ast, { warning })
        })
        .then(({ blocks }) => {
          // emit files
          blocks
            .filter(
              ({ tag }: BlockResult) => ~TAGS_FOR_FILE_LOADER.indexOf(tag)
            )
            .forEach(({ tag, content }: BlockResult) => {
              let name = loaderUtils.interpolateName(
                this,
                `${dirname}/[name]${options.extensions[tag]}`,
                {}
              )
              this.emitFile(name, content, /* source map */ undefined)
            })

          // pipe out
          let output: string = blocks
            .filter(({ tag }: BlockResult) => ~TAGS_FOR_OUTPUT.indexOf(tag))
            .reduce(
              (memo: string, { content }: BlockResult) => `${memo};${content}`,
              ''
            )

          if (done) {
            done(null, output)
          }
        })
    )
    .catch(error => {
      debug('error', error)
      if (done) {
        done(error)
      }
    })
}

export default mina
