// 深度递归地添加组件依赖到components中去（包括自己）

const { dirname } = require('path')
const getComponents = require('./getComponents')

function addComponents (rootContext, entryComponent, resolvedComponents) {
  if (entryComponent.fullPath in resolvedComponents) {
    return resolvedComponents
  }

  resolvedComponents[entryComponent.fullPath] = entryComponent // add

  let components = getComponents(rootContext, dirname(entryComponent.fullPath), entryComponent.configPath)
  // console.log('getComponents', rootContext, dirname(entryComponent.fullPath), entryComponent.configPath, components)
  for (const component of components) {
    addComponents(rootContext, component, resolvedComponents)
  }

  return resolvedComponents
}

module.exports = addComponents
