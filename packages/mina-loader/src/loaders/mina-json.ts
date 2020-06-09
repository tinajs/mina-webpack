import fs from 'fs'
import path from 'path'
import JSON5 from 'json5'
import resolve from 'resolve'
import merge from 'lodash/merge'
import mapValues from 'lodash/mapValues'
import compose from 'compose-function'
import replaceExt from 'replace-ext'
import loaderUtils from 'loader-utils'
import ensurePosix from 'ensure-posix-path'
import pMap from 'p-map'
import Debug from 'debug'
const debug = Debug('loaders:mina')

import * as helpers from '../helpers'

import { RESOLVABLE_EXTENSIONS } from '../constants'
import webpack from 'webpack'

const pluginPrefixReg = /^(plugin|dynamicLib):\/\//;

function stripExt(path: string): string {
  return replaceExt(path, '')
}

function resolveFile(
  source: string,
  target: string,
  context: string,
  subpackageMapping: Record<string, string>,
  workdir: string = './'
): string {
  let resolve = (target: string) =>
    compose(
      ensurePosix,
      helpers.toSafeOutputPath,
      stripExt
    )(resolveFromModule(context, target))

  target = helpers.getResourcePathFromRequest(target)

  let transformedSource = resolve(path.relative(context, source))

  let transformedTarget = resolve(
    path.relative(
      context,
      target.startsWith('/')
        ? path.resolve(context, target.slice(1))
        : path.resolve(path.dirname(source), target)
    )
  )

  // because entry plugin move some files into subpackages references in `.json` should also update
  if (subpackageMapping[transformedTarget]) {
    transformedTarget = subpackageMapping[transformedTarget]
  }
  // when we moved an mina to a subpackage in during mina-webpack-plugin, this.resourcePath context is
  // not updated, this would cause resolving target end up getting incorrect calculated path in `.json`.
  // it’s complicated to update this.resourcePath in the plugin as it’s handled by webpack, so compensate
  // the change here in the loader.
  if (subpackageMapping[transformedSource]) {
    transformedSource = subpackageMapping[transformedSource]
  }

  debug('resolve file in mina-json', {
    source,
    target,
    context,
    workdir,
    transformedSource,
    transformedTarget,
  })

  // relative url
  return ensurePosix(
    path.relative(
      path.resolve(path.dirname(transformedSource), workdir),
      transformedTarget
    )
  )
}

function tryResolveFile(
  source: string,
  target: string,
  context: string,
  subpackageMapping: Record<string, string>,
  workdir?: string
) {
  try {
    return resolveFile(source, target, context, subpackageMapping, workdir)
  } catch (error) {
    if (error.code === 'MODULE_NOT_FOUND') {
      return target
    } else {
      throw error
    }
  }
}

function resolveFromModule(context: string, filename: string): string {
  return path.relative(
    context,
    fs.realpathSync(
      resolve.sync(loaderUtils.urlToRequest(filename), {
        basedir: context,
        extensions: RESOLVABLE_EXTENSIONS,
      })
    )
  )
}

type PageConfig = string

type WindowConfig = {
  navigationBarBackgroundColor: string
  navigationBarTextStyle: 'black' | 'white'
  navigationBarTitleText: string
  backgroundColor: string
  backgroundTextStyle: 'light' | 'dark'
}

type TabConfig = {
  pagePath: string
  iconPath?: string
  selectedIconPath?: string
  text: string
}

type TabBarConfig = {
  custom?: boolean
  position: 'bottom' | 'top'
  list: TabConfig[]
}

type MinaJsonConfig = {
  usingComponents?: Record<string, string>
  publicComponents?: Record<string, string>
  pages: PageConfig[]
  tabBar?: TabBarConfig
  subPackages?: {
    root: string
    independent?: boolean
    pages: string[]
  }[]
  window: WindowConfig
  networkTimeout?: Partial<{
    request: number
    downloadFile: number
  }>
  debug?: boolean
  navigateToMiniProgramAppIdList?: string[]
}

const minaJson: webpack.loader.Loader = function minaJson(source) {
  const loaderContext = this
  // read subpackageMapping from context
  const subpackageMapping: Record<string, string> =
    // @ts-ignore
    loaderContext.subpackageMapping || {}
  const done = this.async()
  const webpackOptions = loaderUtils.getOptions(this) || {}
  const options = merge(
    {},
    {
      publicPath: helpers.getPublicPath(webpackOptions, this),
    },
    webpackOptions
  )

  const loadModule = helpers.loadModule.bind(this)

  let config: MinaJsonConfig
  try {
    config = JSON5.parse(source as string)
  } catch (error) {
    if (done) done(error)
    return
  }

  if (!config) {
    if (done) done(null, '')
    return
  }

  Promise.resolve(config)
    /**
     * pages
     */
    .then((config: MinaJsonConfig) => {
      const { pages } = config
      if (!Array.isArray(pages) && typeof pages !== 'object') {
        return config
      }

      const map = Array.isArray(pages)
        ? [].map.bind(pages)
        : mapValues.bind(null, pages)
      return Object.assign(config, {
        pages: map((page: string) =>
          tryResolveFile(
            this.resourcePath,
            page,
            this.rootContext,
            subpackageMapping
          )
        ),
      })
    })
    /**
     * subPackages
     */
    .then((config: MinaJsonConfig) => {
      const { subPackages } = config
      if (!Array.isArray(subPackages)) {
        return config
      }

      return Object.assign(config, {
        subPackages: subPackages.map(({ root, independent, pages }) => ({
          root,
          pages: pages.map((page: string) =>
            tryResolveFile(
              this.resourcePath,
              path.join(root, page),
              this.rootContext,
              subpackageMapping,
              root
            )
          ),
          independent,
        })),
      })
    })
    /**
     * usingComponents
     */
    .then((config: MinaJsonConfig) => {
      if (typeof config.usingComponents !== 'object') {
        return config
      }

      return Object.assign(config, {
        usingComponents: mapValues(config.usingComponents, (file: string) => {
          if (pluginPrefixReg.test(file)) {
            return file
          }

          return (
            './' +
            tryResolveFile(
              this.resourcePath,
              file,
              this.rootContext,
              subpackageMapping
            )
          )
        }),
      })
    })
    /**
     * publicComponents
     */
    .then((config: MinaJsonConfig) => {
      if (typeof config.publicComponents !== 'object') {
        return config
      }

      return Object.assign(config, {
        publicComponents: mapValues(config.publicComponents, (file: string) =>
          tryResolveFile(
            this.resourcePath,
            file,
            this.rootContext,
            subpackageMapping
          )
        ),
      })
    })
    /**
     * tabBar
     */
    .then((config: MinaJsonConfig) => {
      if (!config.tabBar || !Array.isArray(config.tabBar.list)) {
        return config
      }

      async function loadAndReplace(tab: TabConfig, field: keyof TabConfig) {
        const source = await loadModule(tab[field])
        const outputPath = helpers.extract(source, options.publicPath)
        return Object.assign(tab, {
          [field]: outputPath,
        })
      }

      const result: Promise<MinaJsonConfig> = pMap(
        config.tabBar.list,
        async (tab: TabConfig) => {
          if (tab.pagePath) {
            tab = Object.assign(tab, {
              pagePath: ensurePosix(stripExt(tab.pagePath)),
            })
          }
          const tab_1 = await Promise.resolve(tab)
          if (!tab_1.iconPath) {
            return tab_1
          }
          const tab_3 = await loadAndReplace(tab_1, 'iconPath')
          if (!tab_3.selectedIconPath) {
            return tab_3
          }
          return loadAndReplace(tab_3, 'selectedIconPath')
        }
      ).then(
        (list: TabConfig[]) =>
          Object.assign(config, {
            tabBar: Object.assign(config.tabBar, {
              list,
            }),
          }) as MinaJsonConfig
      )
      return result
    })
    .then((config: MinaJsonConfig) => {
      if (done) {
        done(
          null,
          JSON.stringify(config, null, webpackOptions.minimize ? 0 : 2)
        )
      }
    })
    .catch((error: Error) => {
      if (done) {
        done(error)
      }
    })
}

export default minaJson
