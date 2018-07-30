/* 从app.mina文件中提取出pages. pages支持的写法包括：
 * 
 * 1. 绝对路径（从context开始）
 * 2. 相对路径（以./开头，相对于context）
 * 3. 相对路径（不以./开头，相对于context）
 *
 */

function getPages (appPath) {
  // TODO: pages如果不是数组
  const pages = readConfig(appPath).pages || []
  return pages.map(pagePath => {
    if (pagePath.startsWith('./')) {
      return pagePath.slice(2)
    } else if (pagePath.startsWith('/')) {
      return pagePath.slice(1)
    } else {
      return pagePath
    }
  })
}

function readConfig(fullpath) {
  const fs = require('fs')
  const { parseComponent } = require('vue-template-compiler')
  const JSON5 = require('json5')

  let buffer = fs.readFileSync(fullpath)
  let blocks = parseComponent(buffer.toString()).customBlocks
  let matched = blocks.find(block => block.type === 'config')
  if (!matched || !matched.content || !matched.content.trim()) {
    return {}
  }
  return JSON5.parse(matched.content)
}

module.exports = getPages
