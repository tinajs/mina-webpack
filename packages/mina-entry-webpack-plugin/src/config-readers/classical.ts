import fs from 'fs'
import replaceExt from 'replace-ext'
import ConfigReader from '../interfaces/config-reader'

const CONFIG_EXTENSION = '.json'

export default class ClassicalConfigReader extends ConfigReader {
  static getConfig(filePath: string) {
    let configPath = replaceExt(filePath, CONFIG_EXTENSION)
    if (!fs.existsSync(configPath)) {
      return {}
    }
    let plain = fs.readFileSync(configPath, 'utf8')
    return JSON.parse(plain)
  }
}
