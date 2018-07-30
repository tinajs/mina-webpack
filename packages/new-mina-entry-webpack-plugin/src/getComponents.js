/* 从page或component中读取usingComponents的内容。usingComponent中的路径支持两种形式：
 * 
 * 1. 从context起步（"component"或"/component"均可）
 * 2. 从当前文件起步（"./componet"或"../component")
 * 
 */

const path = require('path')
const readConfig = require('./readConfig')

// rootContext"pages/page1”这样的格式，另外pagePath也可以是component的path
function getComponents (rootContext, pagePath) {
  const fullPagePath = path.resolve(rootContext, pagePath)
  const config = readConfig(fullPagePath)
  const componentsConfig = config.usingComponents || {}
  const componentPaths = []
  for (componentName in componentsConfig) {
    componentPaths.push(componentsConfig[componentName])
  }
  const fullPageDir = path.dirname(fullPagePath)
  return componentPaths.map(componentPath => {
    let componentContext = rootContext
    if (componentPath.startsWith('./') || componentPath.startsWith('../')) {
      componentContext = fullPageDir
    }
    if (componentPath.startsWith('/')) {
      componentPath = componentPath.slice(1)
    }
    const fullComponentPath = path.resolve(componentContext, componentPath)
    return path.relative(rootContext, fullComponentPath)
  })
}

module.exports = getComponents
