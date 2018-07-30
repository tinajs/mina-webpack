const fs = require('fs')
const { parseComponent } = require('vue-template-compiler')
const JSON5 = require('json5')

function readConfig(fullPath) {
  if (fullPath.endsWith('.mina')) {
    return readConfigFromMinaFile(fullPath)
  } else {
    return readConfigFromJsonFile(fullPath)
  } 
}

function readConfigFromMinaFile (fullPath) {
  let buffer = fs.readFileSync(fullPath)
  let blocks = parseComponent(buffer.toString()).customBlocks
  let matched = blocks.find(block => block.type === 'config')
  if (!matched || !matched.content || !matched.content.trim()) {
    return {}
  }
  // TODO: 解析异常
  return JSON5.parse(matched.content)
}

function readConfigFromJsonFile (fullPath) {
  let content = fs.readFileSync(fullPath).toString()
  if (content.trim() === '') {
    return {}
  }
  // TODO: 解析异常
  return JSON5.parse(content)
}

module.exports = readConfig
