const fs = require('fs')
const JSON5 = require('json5')
const { parseComponent } = require('vue-template-compiler')
const ConfigReader = require('../interfaces/config-reader')

class MinaConfigReader extends ConfigReader {
  static getConfig(filePath) {
    let plain = fs.readFileSync(filePath, 'utf8')
    let blocks = parseComponent(plain).customBlocks
    let matched = blocks.find(block => block.type === 'config')
    if (!matched || !matched.content || !matched.content.trim()) {
      return {}
    }
    return JSON5.parse(matched.content)
  }
}

module.exports = MinaConfigReader
