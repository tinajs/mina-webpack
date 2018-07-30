const fs = require('fs')
const { resolve } = require('path')

function resolveComponent (rootContext, componentName) {
  if (fs.existsSync(resolve(rootContext, componentName + '.mina'))) {
    return {
      name: componentName,
      extensions: '.mina',
      configPath: resolve(rootContext, componentName + '.mina')
    }
  } else {
    let extensions = ['.js', '.json', '.wxml', '.wxss']
    extensions = extensions.filter(extension => {
      const fullPath = resolve(rootContext, componentName + extension)
      return fs.existsSync(fullPath)
    })
    return {
      name: componentName,
      extensions: extensions,
      configPath: extensions.indexOf('.json') !== -1 ? resolve(rootContext, componentName + '.json') : null
    }
  }
}

module.exports = resolveComponent
