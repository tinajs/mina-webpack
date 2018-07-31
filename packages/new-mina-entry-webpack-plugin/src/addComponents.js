// 深度递归地添加组件依赖到components中去（包括自己）

const resolveComponent = require('./resolveComponent')
const getComponents = require('./getComponents')

function addComponents (rootContext, entryComponentName, addedComponents) {
  if (entryComponentName in addedComponents) {
    return addedComponents
  }

  const entryComponent = resolveComponent(rootContext, entryComponentName)
  if (!entryComponent) {
    return addedComponents
  }

  addedComponents[entryComponentName] = entryComponent.extensions
  let componentNames = getComponents(rootContext, entryComponentName, entryComponent.configPath)
  componentNames = componentNames.map(component => component.name)
  for (const componentName of componentNames) {
    addComponents(rootContext, componentName, addedComponents)
  }
  return addedComponents
}

module.exports = addComponents
