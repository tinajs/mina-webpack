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

interface Entry {
  // name: for example `packageA/pages/index.js` or `_/_/another-package/comp.js`
  // TODO: should we remove `.js` in entry name ?
  name: string
  // realPath: the full real path of resource
  realPath: string
  // request: requst with loaders for SingleEntryPlugin
  request: string
  parents: Array<Entry>
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
    // mina component
    if (isMinaRequest(originalRequest)) {
      resourcePath = resolve.sync(originalRequest, {
        basedir: context,
        extensions: [],
      })
    } else {
      // classic component
      resourcePath = resolve.sync(originalRequest, {
        basedir: context,
        extensions: extensions.resolve,
      })
    }
    return fs.realpathSync(resourcePath)
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

const MAIN_PACKAGE = 'MAIN_PACKAGE'

const getSubpackageRootsFromConfig = (config: any): Array<string> => {
  if (!config) {
    return []
  }
  const subpackages = config.subpackages || config.subPackages || []
  return subpackages.map((item: { root?: string }) => item.root).filter(Boolean)
}

// from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set#Implementing_basic_set_operations
const unionSet = <T>(setA: Set<T>, setB: Set<T>) => {
  var _union = new Set(setA)
  for (var elem of setB) {
    _union.add(elem)
  }
  return _union
}

// if a component was only used in the same subpackage
// it can be moved into that subpackage to reduce the bundle size of main package
// for example `components/myComponent` is only used by `packageA/pages/index`
// we can move it to `packageA/_/_/components/myComponent`
const moveIntoSubpackage = (
  rootContext: string,
  subpackageRoots: Array<string>,
  rootEntry: Entry,
  entries: Array<Entry>
) => {
  const subpackageSets: Record<string, Set<string>> = {}

  const computeSubpackages = (entry: Entry) => {
    // remove `.js` in entry name
    const entryName = replaceExt(entry.name, '')
    if (subpackageSets[entryName]) {
      // already computed
      return
    }
    subpackageSets[entryName] = new Set<string>()
    if (entry === rootEntry) {
      // ignore if entry is app
      return
    } else if (entry.parents.length === 1 && entry.parents[0] === rootEntry) {
      // entry is page
      const relativeRealPath = path.relative(rootContext, entry.realPath)
      const matchedSubpackageRoot = subpackageRoots.find(root =>
        relativeRealPath.startsWith(`${root}/`)
      )
      const currentSubpackage = matchedSubpackageRoot || MAIN_PACKAGE
      subpackageSets[entryName].add(currentSubpackage)
    } else {
      // entry is component
      entry.parents.forEach(parentEntry => {
        computeSubpackages(parentEntry)
        // remove `.js` in entry name
        const parentEntryName = replaceExt(parentEntry.name, '')
        subpackageSets[entryName] = unionSet(
          subpackageSets[entryName],
          subpackageSets[parentEntryName]
        )
      })
    }
  }

  // move components into subpackage as possiable
  for (const entry of entries) {
    computeSubpackages(entry)
  }
  const subpackageMapping: Record<string, string> = {}
  for (const entry of entries) {
    // remove `.js` in entry name
    const entryName = replaceExt(entry.name, '')
    const subpackageSet = subpackageSets[entryName]
    if (subpackageSet.size === 1 && !subpackageSet.has(MAIN_PACKAGE)) {
      const subpackage = [...subpackageSet][0]
      const movedEntryName = path.join(
        subpackage,
        toSafeOutputPath(path.relative(subpackage, entry.name))
      )
      if (entry.name === movedEntryName) {
        // skip if entry name doesn't changed
        continue
      }
      entry.name = movedEntryName
      // save mapping
      subpackageMapping[entryName] = replaceExt(movedEntryName, '')
    }
  }
  return { subpackageMapping }
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
    // mina or classic
    const isClassical = !isMinaRequest(originalResourceUrl)
    // `/components/demo` => `/path/to/src/components/demo` => `../components/demo`
    const resourceUrl = resolveAbsoluteUrl(
      rootContext,
      currentContext,
      originalResourceUrl
    )

    // resolve symlink
    let realPath: string
    try {
      realPath = resolveRealPath(extensions, currentContext, resourceUrl)
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
