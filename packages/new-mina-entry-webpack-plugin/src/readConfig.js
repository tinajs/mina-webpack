const fs = require('fs')
const { parseComponent } = require('vue-template-compiler')
const JSON5 = require('json5')

function readConfig(fullpath) {
  let buffer = fs.readFileSync(fullpath)
  let blocks = parseComponent(buffer.toString()).customBlocks
  let matched = blocks.find(block => block.type === 'config')
  if (!matched || !matched.content || !matched.content.trim()) {
    return {}
  }
  return JSON5.parse(matched.content)
}

module.exports = readConfig
