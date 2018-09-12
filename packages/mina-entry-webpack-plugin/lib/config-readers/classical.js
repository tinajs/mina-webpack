const fs = require('fs')
const replaceExt = require('replace-ext')
const ConfigReader = require('../interfaces/config-reader')

const CONFIG_EXTENSION = '.json'

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

module.exports = ClassicalConfigReader
