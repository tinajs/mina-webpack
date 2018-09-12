const fs = require('fs')
const fm = require('front-matter')
const { ConfigReader } = require('@tinajs/mina-entry-webpack-plugin')

class YamlConfigReader extends ConfigReader {
  static getConfig(filePath) {
    let plain = fs.readFileSync(filePath, 'utf8')
    return fm(plain).attributes
  }
}

module.exports = YamlConfigReader
