import path from 'path'
import fs from 'fs'
import merge from 'lodash/merge'
import replaceExt from 'replace-ext'
import resolve from 'resolve'
import ensurePosix from 'ensure-posix-path'
import { urlToRequest } from 'loader-utils'
// @ts-ignore
import SingleEntryPlugin from 'webpack/lib/SingleEntryPlugin'
// @ts-ignore
import MultiEntryPlugin from 'webpack/lib/MultiEntryPlugin'
// @ts-ignore
import WebpackError from 'webpack/lib/WebpackError'
import compose from 'compose-function'
import { Minimatch } from 'minimatch'

import ConfigReader from './interfaces/config-reader'
import MinaConfigReader from './config-readers/mina'
import ClassicalConfigReader from './config-readers/classical'
import {
  values,
  uniq,
  toSafeOutputPath,
  getResourceUrlFromRequest,
} from './helpers'
import webpack = require('webpack')

const minaLoader = require.resolve('@tinajs/mina-loader')
const virtualMinaLoader = require.resolve('./loaders/virtual-mina-loader.js')

interface Extensions {
  template: Array<string>
  style: Array<string>
  script: Array<string>
  config: Array<string>
  resolve: Array<string>
}

const DEFAULT_EXTENSIONS: Extensions = {
  template: ['wxml'],
  style: ['wxss'],
  script: ['js'],
  config: ['json'],
  resolve: ['.js', '.wxml', '.json', '.wxss'],
}

function isAbsoluteUrl(url: string) {
  return !!url.startsWith('/')
}

function addEntry(context: string, item: string | Array<string>, name: string) {
  if (Array.isArray(item)) {
    return new MultiEntryPlugin(context, item, name)
  }
  return new SingleEntryPlugin(context, item, name)
}

function getRequestsFromConfig(config: any) {
  let requests: Array<string> = []
  if (!config) {
    return requests
  }

  ;['pages', 'usingComponents', 'publicComponents'].forEach(key => {
    if (typeof config[key] !== 'object') {
      return
    }
    requests = [...requests, ...values(config[key])]
  })

  if (Array.isArray(config.subPackages)) {
    config.subPackages.forEach((subPackage: any) => {
      const { root, pages } = subPackage
      if (Array.isArray(pages)) {
        requests = [
          ...requests,
          ...pages.map(page => path.join(root || '', page)),
        ]
      }
    })
  }

  return uniq(requests)
}

function getSubpackageRootsFromConfig(config: any): Array<string> {
  if (!config) {
    return []
  }
  const subpackages = config.subpackages || config.subPackages || []
  return subpackages.map((item: { root?: string }) => item.root).filter(Boolean)
}

interface GetItemsSuccessResult {
  name: string
  request: string
  resourcePath: string
  dependents: Array<string>
}

const MAIN_PACKAGE = 'MAIN_PACKAGE'

const computeDependentPackages = (
  dependents: Array<string>,
  subpackageRoots: Array<string>
): string | undefined => {
  const packagesSet = new Set<string>()
  for (const dependent of dependents) {
    const matchedSubpackageRoot = subpackageRoots.find(root =>
      dependent.startsWith(`${root}/`)
    )
    packagesSet.add(matchedSubpackageRoot || MAIN_PACKAGE)
  }
  if (packagesSet.size === 1 && !packagesSet.has(MAIN_PACKAGE)) {
    return Array.from(packagesSet)[0]
  }
}

function getItems(
  rootContext: string,
  entryRequest: string,
  rules: Array<{ pattern: string; reader: typeof ConfigReader }>,
  extensions: Extensions,
  minaLoaderOptions: Record<string, any>
) {
  const entries: Array<GetItemsSuccessResult> = []
  const errors: Array<MinaEntryPluginError> = []
  let subpackageRoots: Array<string> = []

  function search(currentContext: string, originalRequest: string) {
    let resourceUrl = getResourceUrlFromRequest(originalRequest)
    let request = urlToRequest(
      isAbsoluteUrl(resourceUrl)
        ? resourceUrl.slice(1)
        : path.relative(rootContext, path.resolve(currentContext, resourceUrl))
    )

    let resourcePath: string, isClassical: boolean
    try {
      try {
        resourcePath = resolve.sync(request, {
          basedir: rootContext,
          extensions: [],
        })
        isClassical = false
      } catch (error) {
        resourcePath = resolve.sync(request, {
          basedir: rootContext,
          extensions: extensions.resolve,
        })
        request = `!${minaLoader}?${JSON.stringify(
          minaLoaderOptions
        )}!${virtualMinaLoader}?${JSON.stringify({
          extensions,
        })}!${resourcePath}`
        isClassical = true
      }
    } catch (error) {
      // Do not throw an exception when the module does not exist.
      // Just mark it up and move on to the next module.
      errors.push(new MinaEntryPluginError(error))
      return
    }

    resourcePath = fs.realpathSync(resourcePath)

    let name = compose(
      ensurePosix,
      path => replaceExt(path, '.js'),
      urlToRequest,
      toSafeOutputPath
    )(path.relative(rootContext, resourcePath))

    const relativeCurrentContext = path.relative(rootContext, currentContext)
    const found = entries.find(
      item => (item as GetItemsSuccessResult).request === request
    )
    if (found) {
      found.dependents.push(relativeCurrentContext)
      return
    }
    entries.push({
      name,
      request,
      resourcePath,
      dependents: [relativeCurrentContext],
    })

    let matchedRule = rules.find(({ pattern }) =>
      pattern.match(path.relative(rootContext, resourcePath))
    )

    let config = matchedRule
      ? matchedRule.reader.getConfig(resourcePath)
      : isClassical
      ? ClassicalConfigReader.getConfig(resourcePath)
      : MinaConfigReader.getConfig(resourcePath)

    let requests = getRequestsFromConfig(config)
    if (originalRequest === entryRequest) {
      subpackageRoots = getSubpackageRootsFromConfig(config)
    }
    if (requests.length > 0) {
      requests.forEach(req => {
        if (req.startsWith('plugin://')) {
          return
        }
        return search(path.dirname(resourcePath), req)
      })
    }
  }

  search(rootContext, entryRequest)

  // if a component was only used in the same subpackage
  // it can be moved into that subpackage to reduce the bundle size of main package
  // for example `components/myComponent` is only used by `packageA/pages/index`
  // we can move it to `packageA/_/_/components/myComponent`
  const subpackageMapping: Record<string, string> = {}
  for (const entry of entries) {
    const belongingSubpackage = computeDependentPackages(
      entry.dependents,
      subpackageRoots
    )
    if (belongingSubpackage) {
      const realEntryName = entry.name
      const relativeEntryName = toSafeOutputPath(
        belongingSubpackage +
          path.sep +
          path.relative(belongingSubpackage, entry.name)
      )
      // no ext in mapping
      subpackageMapping[replaceExt(realEntryName, '')] = replaceExt(
        relativeEntryName,
        ''
      )
      entry.name = relativeEntryName
    }
  }
  // save subpack mapping info in global variable so the mina-loader can read it
  // @ts-ignore
  global.__subpackageMapping = subpackageMapping

  return { entries, errors }
}

class MinaEntryPluginError extends WebpackError {
  name: string
  message: string
  error: Error

  constructor(error: Error) {
    super()

    this.name = 'MinaEntryPluginError'
    this.message = `MinaEntryPlugin: ${error.message}`
    this.error = error

    Error.captureStackTrace(this, this.constructor)
  }
}

interface MinaEntryWebpackPluginOptions {
  map: (entry: string) => string | Array<string>
  rules: Array<{ pattern: string; reader: typeof ConfigReader }>
  extensions: Extensions
  minaLoaderOptions: Record<string, any>
}

module.exports = class MinaEntryWebpackPlugin implements webpack.Plugin {
  private _errors: Array<MinaEntryPluginError>
  private _items: Array<any>
  private map: MinaEntryWebpackPluginOptions['map']
  private rules: MinaEntryWebpackPluginOptions['rules']
  private extensions: MinaEntryWebpackPluginOptions['extensions']
  private minaLoaderOptions: MinaEntryWebpackPluginOptions['minaLoaderOptions']

  constructor(options: Partial<MinaEntryWebpackPluginOptions> = {}) {
    this.map =
      options.map ||
      function(entry: string) {
        return entry
      }
    this.rules = (options.rules || []).map(rule => {
      return Object.assign({}, rule, {
        pattern: new Minimatch(rule.pattern, { matchBase: true }),
      })
    })
    this.extensions = merge({}, DEFAULT_EXTENSIONS, options.extensions)
    // TODO: redefine a better struct for this option
    this.minaLoaderOptions = options.minaLoaderOptions || {}

    this._errors = []

    /**
     * cache items to prevent duplicate `addEntry` operations
     */
    this._items = []
  }

  rewrite(compiler: webpack.Compiler, done?: Function) {
    try {
      let { context, entry } = compiler.options

      this._errors = []

      // assume the latest file in array is the app.mina
      if (Array.isArray(entry)) {
        entry = entry[entry.length - 1]
      }

      const { entries, errors } = getItems(
        context!,
        entry! as string,
        this.rules,
        this.extensions,
        this.minaLoaderOptions
      )
      this._errors.push(...errors)
      entries.forEach(item => {
        if (this._items.some(({ request }) => request === item.request)) {
          return
        }
        this._items.push(item)

        addEntry(
          context!,
          this.map(ensurePosix(item.request)),
          item.name
        ).apply(compiler)
      })
    } catch (error) {
      if (typeof done === 'function') {
        console.error(error)
        return done()
      }
      throw error
    }

    if (typeof done === 'function') {
      done()
    }

    return true
  }

  apply(compiler: webpack.Compiler) {
    compiler.hooks.entryOption.tap('MinaEntryPlugin', () =>
      this.rewrite(compiler)
    )
    compiler.hooks.watchRun.tap('MinaEntryPlugin', (compiler, done) =>
      this.rewrite(compiler, done)
    )
    compiler.hooks.compilation.tap('MinaEntryPlugin', compilation => {
      this._errors.forEach(error => compilation.errors.push(error))
    })
  }
}

module.exports.ConfigReader = ConfigReader
