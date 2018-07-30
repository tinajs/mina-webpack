/* 从json或者mina文件中读取config块。文件路径可以是：
 * 1. 带后缀的（.mina或.json）
 * 2. 不带后缀的
 *
 */

const fs = require('fs')
const { parseComponent } = require('vue-template-compiler')
const JSON5 = require('json5')

// fullPath支持：
// 1. 带后缀（.mina或.json）
// 2. 不带后缀
function readConfig(fullPath) {
  if (fs.existsSync(fullPath) && fullPath.endsWith('.mina')) {
    return readConfigFromMinaFile(fullPath)
  } else if (fs.existsSync(fullPath) && fullPath.endsWith('.json')) {
    return readConfigFromJsonFile(fullPath)
  } else if (fs.existsSync(fullPath + '.mina')) {
    return readConfigFromMinaFile(fullPath + '.mina')
  } else if (fs.existsSync(fullPath + '.json')) {
    return readConfigFromJsonFile(fullPath + '.json')
  } else {
    return {}
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
