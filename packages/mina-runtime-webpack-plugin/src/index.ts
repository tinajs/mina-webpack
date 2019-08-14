/*
 * forked from https://github.com/Cap32/wxapp-webpack-plugin/
 */
import webpack from 'webpack'
import fs from 'fs'
import path from 'path'
import ensurePosix from 'ensure-posix-path'
import { ConcatSource } from 'webpack-sources'
// @ts-ignore
import requiredPath from 'required-path'
import Debug from 'debug'

const debug = Debug('plugins:mina-runtime')

function isRuntimeExtracted(compilation: webpack.compilation.Compilation) {
  return compilation.chunks.some(
    chunk =>
      chunk.isOnlyInitial() && chunk.hasRuntime() && !chunk.hasEntryModule()
  )
}

function script({ dependencies }: { dependencies: Array<string> }) {
  return (
    ';' + dependencies.map(file => `require('${requiredPath(file)}');`).join('')
  )
}

const POLYFILL = fs.readFileSync(path.join(__dirname, '../polyfill.js'), 'utf8')

module.exports = class MinaRuntimeWebpackPlugin implements webpack.Plugin {
  runtime: string

  constructor(options: { runtime?: string } = {}) {
    this.runtime = options.runtime || ''
  }

  apply(compiler: webpack.Compiler) {
    compiler.hooks.compilation.tap('MinaRuntimePlugin', compilation => {
      // @ts-ignore
      compilation.chunkTemplate.hooks.renderWithEntry.tap(
        'MinaRuntimePlugin',
        (source: any, entry: webpack.compilation.Chunk) => {
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

          let dependencies: Array<string> = []
          entry.groupsIterable.forEach(group => {
            group.chunks.forEach((chunk: webpack.compilation.Chunk) => {
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

      // @ts-ignore
      compilation.mainTemplate.hooks.bootstrap.tap(
        'MinaRuntimePlugin',
        (source: any, chunk: webpack.compilation.Chunk) => {
          debug('bootstrap chunk name', chunk.name)
          return POLYFILL + source
        }
      )
    })
  }
}
