/* 从app.mina文件中提取出pages. pages的写法是从context开始计算的相对路径，可以是如下形式：
 * 
 * 1. /pages/page1
 * 2. pages/page1
 * 3. ./pages/page1
 *
 */

const { resolve } = require('path')
const readConfig = require('./readConfig')
const resolveComponent = require('./resolveComponent')

function getPages (rootContext) {
  // TODO: pages如果不是数组
  const configPath = resolve(rootContext, 'app.mina')
  const pageRequests = readConfig(configPath).pages || []
  
  return pageRequests.map(pageRequest => 
    resolveComponent(rootContext, pageRequest)
  ).filter(pageComponent => pageComponent)
}

module.exports = getPages
