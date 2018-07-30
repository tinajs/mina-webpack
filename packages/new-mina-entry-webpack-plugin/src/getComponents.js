/* 从page或component中读取usingComponents的内容。usingComponent中的路径支持两种形式：
 * 
 * 1. 从context起步（"component"或"/component"）
 * 2. 从当前文件起步（"./componet"或"../component")
 * 
 */

const path = require('path')
const readConfig = require('./readConfig')

function getComponents (rootContext, entryComponentName, configPath) {
  const config = configPath ? readConfig(configPath) : {}
  const componentsConfig = config.usingComponents || {}
  const componentPaths = Object.values(componentsConfig)
  const fulllEntryComponentPath = path.resolve(rootContext, entryComponentName)
  const fullEntryComponentDir = path.dirname(fulllEntryComponentPath)
  return componentPaths.map(componentPath => {
    let componentContext = rootContext
    if (componentPath.startsWith('./') || componentPath.startsWith('../')) {
      componentContext = fullEntryComponentDir
    }
    if (componentPath.startsWith('/')) {
      componentPath = componentPath.slice(1)
    }
    const fullComponentPath = path.resolve(componentContext, componentPath)
    return path.relative(rootContext, fullComponentPath)
  })
}

module.exports = getComponents
