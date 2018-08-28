const fs = require('fs')
const JSON5 = require('json5')
const replaceExt = require('replace-ext')
const { parseComponent } = require('vue-template-compiler')

const CONFIG_EXTENSION = '.json'

class ConfigReader {
  static getConfig() {
    throw new Error('getConfig method not implemented')
  }
}

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

class ClassicalConfigReader extends ConfigReader {
  static getConfig(filePath) {
    let configPath = replaceExt(filePath, CONFIG_EXTENSION)
    if (!fs.existsSync(configPath)) {
      return {}
    }
    let plain = fs.readFileSync(configPath, 'utf8')
    return JSON.parse(plain)
  }
}

exports.ConfigReader = ConfigReader
exports.MinaConfigReader = MinaConfigReader
exports.ClassicalConfigReader = ClassicalConfigReader
