import path from 'path'
import fs from 'fs'
import merge from 'lodash/merge'
import replaceExt from 'replace-ext'
import resolve from 'resolve'
import ensurePosix from 'ensure-posix-path'
import { urlToRequest } from 'loader-utils'
import webpack from 'webpack'
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
import { Entry, moveIntoSubpackage } from './helpers/entry'

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

const isMinaRequest = (request: string) => {
  return path.extname(request) === '.mina'
}

// rootContext: /path/to/src
// currentContext: /path/to/src/pages
// `/components/demo` => `/path/to/src/components/demo` => `../components/demo`
// keeps `~@scope/package` or `./path/to/comp`
const resolveAbsoluteUrl = (
  rootContext: string,
  currentContext: string,
  originalResourceUrl: string
) => {
  if (isAbsoluteUrl(originalResourceUrl)) {
    return path.relative(
      currentContext,
      path.resolve(rootContext, originalResourceUrl.slice(1))
    )
  }
  return originalResourceUrl
}

const resolveRealPath = (
  extensions: Extensions,
  context: string,
  originalUrl: string
) => {
  const originalRequest = urlToRequest(originalUrl)
  try {
    let resourcePath: string
    let isClassical: boolean
    // mina component
    try {
      resourcePath = resolve.sync(originalRequest, {
        basedir: context,
        extensions: [],
      })
      isClassical = false
    } catch (error) {
      // classic component
      resourcePath = resolve.sync(originalRequest, {
        basedir: context,
        extensions: extensions.resolve,
      })
      isClassical = true
    }
    return {
      realPath: fs.realpathSync(resourcePath),
      isClassical,
    }
  } catch (error) {
    throw new MinaEntryPluginError(error)
  }
}

const readConfig = (
  rules: Array<{ pattern: string; reader: typeof ConfigReader }>,
  rootContext: string,
  resourcePath: string,
  isClassical: boolean
) => {
  let matchedRule = rules.find(({ pattern }) =>
    pattern.match(path.relative(rootContext, resourcePath))
  )

  let config = matchedRule
    ? matchedRule.reader.getConfig(resourcePath)
    : isClassical
    ? ClassicalConfigReader.getConfig(resourcePath)
    : MinaConfigReader.getConfig(resourcePath)

  return config
}

const getSubpackageRootsFromConfig = (config: any): Array<string> => {
  if (!config) {
    return []
  }
  const subpackages = config.subpackages || config.subPackages || []
  return subpackages.map((item: { root?: string }) => item.root).filter(Boolean)
}

function getEntries(
  rootContext: string,
  entry: string,
  rules: Array<{ pattern: string; reader: typeof ConfigReader }>,
  extensions: Extensions,
  minaLoaderOptions: Record<string, any>
) {
  const entries: Array<Entry> = []
  const errors: Array<MinaEntryPluginError> = []
  let subpackageRoots: Array<string> = []

  function search(
    currentContext: string,
    originalRequest: string,
    parentEntry?: Entry
  ) {
    // `any-loader!./index.mina` => `./index.mina`
    const originalResourceUrl = getResourceUrlFromRequest(originalRequest)
    // `/components/demo` => `/path/to/src/components/demo` => `../components/demo`
    const resourceUrl = resolveAbsoluteUrl(
      rootContext,
      currentContext,
      originalResourceUrl
    )

    // resolve symlink
    let realPath: string
    // mina or classic
    let isClassical: boolean
    try {
      ({ realPath, isClassical } = resolveRealPath(extensions, currentContext, resourceUrl))
    } catch (error) {
      // Do not throw an exception when the module does not exist.
      // Just mark it up and move on to the next module.
      errors.push(error)
      return
    }

    // relative path from rootContext, used to generate entry request or name
    const relativeRealPath = path.relative(rootContext, realPath)
    const relativeRealRequest = urlToRequest(relativeRealPath)

    // generte request
    let request: string
    if (isClassical) {
      request = `!${minaLoader}?${JSON.stringify(
        minaLoaderOptions
      )}!${virtualMinaLoader}?${JSON.stringify({
        extensions,
      })}!${relativeRealRequest}`
    } else {
      request = relativeRealRequest
    }

    // entry name for SingleEntryPlugin
    // `../../path/to/comp` => `_/_/path/to/comp`
    const name = compose(
      ensurePosix,
      // FIXME: replace-ext will remove the leading `./` in path
      // see https://github.com/gulpjs/replace-ext/issues/5
      path => replaceExt(path, '.js'),
      urlToRequest,
      toSafeOutputPath
    )(relativeRealPath)

    // skip existing entries
    const existingEntry = entries.find(item => item.request === request)
    if (existingEntry) {
      if (parentEntry) {
        existingEntry.parents.push(parentEntry)
      }
      return
    }
    const entry: Entry = {
      name,
      realPath,
      request,
      parents: parentEntry ? [parentEntry] : [],
    }
    entries.push(entry)

    const config = readConfig(rules, rootContext, realPath, isClassical)

    let requests = getRequestsFromConfig(config)
    // extra subpackage roots from app.json
    if (!parentEntry) {
      subpackageRoots = getSubpackageRootsFromConfig(config)
    }
    if (requests.length > 0) {
      requests.forEach(req => {
        if (req.startsWith('plugin://')) {
          return
        }
        return search(path.dirname(realPath), req, entry)
      })
    }
  }

  search(rootContext, entry)

  const { subpackageMapping } = moveIntoSubpackage(
    rootContext,
    subpackageRoots,
    entries[0],
    entries
  )

  return { entries, errors, subpackageMapping }
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
  private _errors: Array<any>
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

      const { entries, errors, subpackageMapping } = getEntries(
        context!,
        entry! as string,
        this.rules,
        this.extensions,
        this.minaLoaderOptions
      )
      errors.forEach(item => {
        this._errors.push(item.error)
      })
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

      // inject subpackageMapping into loader context
      if (compiler.hooks) {
        compiler.hooks.compilation.tap('MinaEntryPlugin', compilation => {
          let normalModuleLoader
          if (Object.isFrozen(compilation.hooks)) {
            // webpack 5
            normalModuleLoader = require('webpack/lib/NormalModule').getCompilationHooks(
              compilation
            ).loader
          } else {
            // webpack 4
            normalModuleLoader = compilation.hooks.normalModuleLoader
          }
          normalModuleLoader.tap('MinaEntryPlugin', (loaderContext: any) => {
            loaderContext.subpackageMapping = subpackageMapping
          })
        })
      }
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
