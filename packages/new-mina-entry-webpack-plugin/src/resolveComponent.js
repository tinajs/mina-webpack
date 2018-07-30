const fs = require('fs')
const { resolve } = require('path')

function resolveComponent (rootContext, componentName) {
  if (fs.existsSync(resolve(rootContext, componentName + '.mina'))) {
    return {
      name: componentName,
      paths: [
        './' + componentName + '.mina'
      ]
    }
  } else {
    let extensions = ['.js', '.json', '.wxml', '.wxss']
    extensions = extensions.filter(extension => {
      const fullPath = resolve(rootContext, componentName + extension)
      return fs.existsSync(fullPath)
    })
    return {
      name: componentName,
      paths: extensions.map(extension => './' + componentName + extension)
    }
  }
}

module.exports = resolveComponent
