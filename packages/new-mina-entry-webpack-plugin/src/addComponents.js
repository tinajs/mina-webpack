// 深度递归地添加组件依赖到components中去（包括自己）

const getComponents = require('./getComponents')

function addComponents (rootContext, entryComponent, resolvedComponents) {
  if (entryComponent.name in resolvedComponents) {
    return resolvedComponents
  }

  resolvedComponents[entryComponent.name] = entryComponent.extensions

  let components = getComponents(rootContext, entryComponent.name, entryComponent.configPath)
  for (const component of components) {
    addComponents(rootContext, component, resolvedComponents)
  }

  return resolvedComponents
}

module.exports = addComponents
