import { dirname } from 'path'
import fs from 'fs-extra'
import replaceExt from 'replace-ext'
import pProps from 'p-props'

let JavascriptGenerator: any, JavascriptParser: any
try {
  JavascriptGenerator = require('webpack/lib/JavascriptGenerator')
  JavascriptParser = require('webpack/lib/Parser')
} catch (error) {
  if (error.code !== 'MODULE_NOT_FOUND') {
    throw error
  }
}

type Tag = 'template' | 'style' | 'script' | 'config'

const EXTNAMES: Record<Tag, string> = {
  template: 'wxml',
  style: 'wxss',
  script: 'js',
  config: 'json',
}

const template = (parts: Partial<Record<Tag, string>> = {}) => {
  let result =
    Object.keys(parts)
      .map(tag => {
        if (!parts[tag as Tag]) {
          return ''
        }
        /**
         * We can assume that the generated virtual files are in the same directory as the source files,
         * so there is no need to consider the problem of resolving relative paths here.
         */
        return `<${tag}>${parts[tag as Tag]}</${tag}>`
      })
      .join('') || ''
  return result
}

export default function VirtualMinaLoader(this: any) {
  this.cacheable()

  /**
   * forked from https://github.com/lingui/js-lingui/commit/f804335ce502cca65bdcab72f4b0021711fbf3b9
   * see:
   * - https://github.com/webpack/webpack/issues/7057#issuecomment-381883220
   * - https://github.com/webpack/webpack/issues/6572#issuecomment-374987270
   */
  if (
    JavascriptGenerator &&
    JavascriptParser &&
    this._module.type !== 'javascript/auto'
  ) {
    this._module.type = 'javascript/auto'
    this._module.generator = new JavascriptGenerator()
    this._module.parser = new JavascriptParser()
  }

  const done = this.async()

  this.addContextDependency(dirname(this.resourcePath))

  pProps(EXTNAMES, (extname: string) => {
    let filePath = replaceExt(this.resourcePath, `.${extname}`)
    return fs.pathExists(filePath).then((isExist: boolean) => {
      if (!isExist) {
        return ''
      }
      this.addDependency(filePath)
      return fs.readFile(filePath, 'utf8')
    })
  })
    .then((parts: Partial<Record<Tag, string>>) => done(null, template(parts)))
    .catch(done)
}
