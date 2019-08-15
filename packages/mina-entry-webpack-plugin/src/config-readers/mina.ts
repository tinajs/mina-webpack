import fs from 'fs'
import JSON5 from 'json5'
import { parseComponent } from 'vue-template-compiler'
import ConfigReader from '../interfaces/config-reader'

class MinaConfigReader extends ConfigReader {
  static getConfig(filePath: string) {
    let plain = fs.readFileSync(filePath, 'utf8')
    let blocks = parseComponent(plain).customBlocks
    let matched = blocks.find(block => block.type === 'config')
    if (!matched || !matched.content || !matched.content.trim()) {
      return {}
    }
    return JSON5.parse(matched.content)
  }
}

export default MinaConfigReader
