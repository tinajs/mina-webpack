/* 从page或component中读取usingComponents的内容。usingComponent中的路径支持两种形式：
 * 
 * 1. 从context起步（"component"或"/component"）
 * 2. 从当前文件起步（"./componet"或"../component")
 * 
 */

const { resolve, dirname } = require('path')
const readConfig = require('./readConfig')
const resolveComponent = require('./resolveComponent')

function getComponents (rootContext, entryComponentName, configPath) {
  const requests = configPath ? readComponentRequests(configPath) : []
  const currentContext = dirname(resolve(rootContext, entryComponentName))

  return requests.map(request => 
    resolveComponent(rootContext, request, currentContext)
  ).filter(component => component)
}

function readComponentRequests (configPath) {
  const config = configPath ? readConfig(configPath) : {}
  // TODO: usingComponents不是对象
  const componentsConfig = config.usingComponents || {}
  return Object.keys(componentsConfig).map(key => componentsConfig[key])
}

module.exports = getComponents
