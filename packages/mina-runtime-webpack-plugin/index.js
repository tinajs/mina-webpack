/*
 * forked from https://github.com/Cap32/wxapp-webpack-plugin/blob/master/src/index.js
 */

const path = require('path')
const { ConcatSource } = require('webpack-sources')

const GLOBAL_VARIABLE = 'wx'

function isRuntimeExtracted (compilation) {
  return compilation.chunks.some((chunk) => chunk.isInitial() && !chunk.hasRuntime())
}

function runtimeChunk (compilation) {
  return compilation.chunks.find((chunk) => chunk.isInitial() && chunk.hasRuntime())
}

function script ({ runtime, namespace }) {
  return `; require('${runtime}'); var webpackJsonp = ${namespace}.webpackJsonp;`
}

module.exports = class MinaRuntimeWebpackPlugin {
  constructor (options = {}) {
    this.runtime = options.runtime || ''
  }

  apply (compiler) {
		compiler.plugin('compilation', (compilation) => {
      compilation.chunkTemplate.plugin('render-with-entry', (core, chunk) => {
        if (!isRuntimeExtracted(compilation) || !runtimeChunk(compilation)) {
          return core
        }
        if (!this.runtime) {
          throw new Error('options.runtime is required.')
        }
        // assume output.filename is chunk.name here
        let runtime = path.relative(path.dirname(chunk.name), this.runtime)
        let source = new ConcatSource(script({ runtime, namespace: GLOBAL_VARIABLE }), core)
        return source
      })

      compilation.mainTemplate.plugin('bootstrap', (source, chunk) => {
        if (!isRuntimeExtracted(compilation) || !runtimeChunk(compilation)) {
          return source
        }
        if (chunk !== runtimeChunk(compilation)) {
          return source
        }
        return source.replace(/window/g, GLOBAL_VARIABLE)
      })
    })
  }
}
