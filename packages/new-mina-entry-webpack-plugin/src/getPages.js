/* 从app.mina文件中提取出pages. pages支持的写法包括：
 * 
 * 1. 绝对路径（从context开始）
 * 2. 相对路径（以./开头，相对于context）
 * 3. 相对路径（不以./开头，相对于context）
 *
 */

const readConfig = require('./readConfig')

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

module.exports = getPages
