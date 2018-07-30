/* 从app.mina文件中提取出pages. pages的写法是从context开始计算的相对路径，可以是如下形式：
 * 
 * 1. /pages/page1
 * 2. pages/page1
 * 3. ./pages/page1
 *
 */

const readConfig = require('./readConfig')

function getPages (configPath) {
  // TODO: pages如果不是数组
  const pages = readConfig(configPath).pages || []
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
