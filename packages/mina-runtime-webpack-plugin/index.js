/*
 * forked from https://github.com/Cap32/wxapp-webpack-plugin/
 */
const fs = require('fs')
const path = require('path')
const ensurePosix = require('ensure-posix-path')
const { ConcatSource } = require('webpack-sources')
const requiredPath = require('required-path')
const debug = require('debug')('plugins:mina-runtime')

function isRuntimeExtracted(compilation) {
  return compilation.chunks.some(
    chunk =>
      chunk.isOnlyInitial() && chunk.hasRuntime() && !chunk.hasEntryModule()
  )
}

function script({ dependencies }) {
  return (
    ';' + dependencies.map(file => `require('${requiredPath(file)}');`).join('')
  )
}

const POLYFILL = fs.readFileSync(path.join(__dirname, './polyfill.js'), 'utf8')

module.exports = class MinaRuntimeWebpackPlugin {
  constructor(options = {}) {
    this.runtime = options.runtime || ''
  }

  apply(compiler) {
    compiler.hooks.compilation.tap('MinaRuntimePlugin', compilation => {
      for (let template of [
        compilation.mainTemplate,
        compilation.chunkTemplate,
      ]) {
        template.hooks.renderWithEntry.tap(
          'MinaRuntimePlugin',
          (source, entry) => {
            if (!isRuntimeExtracted(compilation)) {
              throw new Error(
                [
                  'Please reuse the runtime chunk to avoid duplicate loading of javascript files.',
                  "Simple solution: set `optimization.runtimeChunk` to `{ name: 'runtime.js' }` .",
                  'Detail of `optimization.runtimeChunk`: https://webpack.js.org/configuration/optimization/#optimization-runtimechunk .',
                ].join('\n')
              )
            }
            if (!entry.hasEntryModule()) {
              return source
            }

            let dependencies = []
            entry.groupsIterable.forEach(group => {
              group.chunks.forEach(chunk => {
                /**
                 * assume output.filename is chunk.name here
                 */
                let filename = ensurePosix(
                  path.relative(path.dirname(entry.name), chunk.name)
                )
                if (chunk === entry || ~dependencies.indexOf(filename)) {
                  return
                }
                dependencies.push(filename)
              })
            })
            debug(`dependencies of ${entry.name}:`, dependencies)
            source = new ConcatSource(script({ dependencies }), source)
            return source
          }
        )
      }

      compilation.mainTemplate.hooks.bootstrap.tap(
        'MinaRuntimePlugin',
        (source, chunk) => {
          debug('bootstrap chunk name', chunk.name)
          return POLYFILL + source
        }
      )
    })
  }
}
