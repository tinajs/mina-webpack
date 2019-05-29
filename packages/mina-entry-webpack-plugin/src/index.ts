import path from 'path'
import fs from 'fs'
import replaceExt from 'replace-ext'
import resolve from 'resolve'
import ensurePosix from 'ensure-posix-path'
import { urlToRequest } from 'loader-utils'
import {
  SingleEntryPlugin,
  // @ts-ignore
  MultiEntryPlugin,
  // @ts-ignore
  WebpackError,
} from 'webpack'
import compose from 'compose-function'
import { Minimatch, IMinimatch } from 'minimatch'
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

const RESOLVE_EXTENSIONS = ['.js', '.wxml', '.json', '.wxss']

function isAbsoluteUrl(url: string) {
  return !!url.startsWith('/')
}

function addEntry(context: string, item: string, name: string) {
  if (Array.isArray(item)) {
    return new MultiEntryPlugin(context, item, name)
  }
  return new SingleEntryPlugin(context, item, name)
}

type ComponentConfig = {
  pages: any
  usingComponents: any
  publicComponents: any
  subPackages: {
    root: string
    pages: string[]
  }[]
}

function getRequestsFromConfig(config?: ComponentConfig): string[] {
  let requests: string[] = []
  if (!config) {
    return requests
  }

  const keys: (keyof ComponentConfig)[] = [
    'pages',
    'usingComponents',
    'publicComponents',
  ]
  keys.forEach((key: keyof ComponentConfig) => {
    if (typeof config[key] !== 'object') {
      return
    }
    requests = [...requests, ...values(config[key])]
  })

  if (Array.isArray(config.subPackages)) {
    config.subPackages.forEach(subPackage => {
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

type MinaLoaderOptions = Partial<{
  map: (i: string) => string
  rules: Rule[]
}>

type Rule = {
  pattern: string
  reader: ConfigReader
}

type Item = {
  name?: string
  error?: MinaEntryPluginError
  request?: string
}

function getItems(
  rootContext: string,
  entry: string,
  rules: Rule[],
  minaLoaderOptions: MinaLoaderOptions
): Item[] {
  let memory: Item[] = []

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
          extensions: RESOLVE_EXTENSIONS,
        })
        request = `!${minaLoader}?${JSON.stringify(
          minaLoaderOptions
        )}!${virtualMinaLoader}!${resourcePath}`
        isClassical = true
      }
    } catch (error) {
      // Do not throw an exception when the module does not exist.
      // Just mark it up and move on to the next module.
      memory.push({
        error: new MinaEntryPluginError(error),
      })
      return
    }

    resourcePath = fs.realpathSync(resourcePath)

    let name = compose(
      ensurePosix,
      path => replaceExt(path, '.js'),
      urlToRequest,
      toSafeOutputPath
    )(path.relative(rootContext, resourcePath))

    let current = {
      name,
      request,
    }

    if (memory.some(item => item.request === current.request)) {
      return
    }
    memory.push(current)

    let matchedRule: Rule | undefined = rules.find(
      ({ pattern }) => !!pattern.match(path.relative(rootContext, resourcePath))
    )

    let config
    if (matchedRule && matchedRule.reader) {
      // @ts-ignore
      config = matchedRule.reader.getConfig(resourcePath)
    } else if (isClassical) {
      config = ClassicalConfigReader.getConfig(resourcePath)
    } else {
      config = MinaConfigReader.getConfig(resourcePath)
    }

    let requests = getRequestsFromConfig(config)
    if (requests.length > 0) {
      requests.forEach(req => {
        if (req.startsWith('plugin://')) {
          return
        }
        return search(path.dirname(resourcePath), req)
      })
    }
  }

  search(rootContext, entry)
  return memory
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

type Compiler = webpack.Compiler

export default class MinaEntryWebpackPlugin {
  map: (i: string) => string
  rules: Rule[]
  minaLoaderOptions: MinaLoaderOptions
  _errors: Error[]
  _items: Item[]

  constructor(
    options: Partial<{
      minaLoaderOptions: MinaLoaderOptions
      map: (i: string) => string
      rules: Rule[]
    }> = {}
  ) {
    this.map =
      options.map ||
      function(entry) {
        return entry
      }
    this.rules = (options.rules || []).map(rule => {
      return Object.assign({}, rule, {
        pattern: new Minimatch(rule.pattern, { matchBase: true }),
      })
    })
    // TODO: redefine a better struct for this option
    this.minaLoaderOptions = options.minaLoaderOptions || {}

    this._errors = []

    /**
     * cache items to prevent duplicate `addEntry` operations
     */
    this._items = []
  }

  rewrite(compiler: any, done?: () => void) {
    try {
      let { context, entry } = compiler.options

      this._errors = []

      // assume the latest file in array is the app.mina
      if (Array.isArray(entry)) {
        entry = entry[entry.length - 1]
      }

      getItems(context, entry, this.rules, this.minaLoaderOptions).forEach(
        item => {
          if (item.error) {
            return this._errors.push(item.error)
          }
          if (this._items.some(({ request }) => request === item.request)) {
            return
          }
          this._items.push(item)

          addEntry(
            context,
            this.map(ensurePosix(item.request!)),
            item.name!
          ).apply(compiler)
        }
      )
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

  apply(compiler: Compiler) {
    compiler.hooks.entryOption.tap('MinaEntryPlugin', () =>
      this.rewrite(compiler)
    )
    compiler.hooks.watchRun.tap('MinaEntryPlugin', (compiler: Compiler, done) =>
      this.rewrite(compiler, done)
    )
    compiler.hooks.compilation.tap('MinaEntryPlugin', (compilation: any) => {
      this._errors.forEach(error => compilation.errors.push(error))
    })
  }
}

module.exports.ConfigReader = ConfigReader
