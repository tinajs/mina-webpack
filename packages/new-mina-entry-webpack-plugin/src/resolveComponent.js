const fs = require('fs')
const { resolve, relative } = require('path')

function resolveComponent (rootContext, componentRequest, currentContext) {
  if (!currentContext) {
    currentContext = rootContext
  }

  if (componentRequest.startsWith('/')) {
    componentRequest = componentRequest.slice(1)
  }

  let fullPath = null
  if (componentRequest.startsWith('./') || componentRequest.startsWith('../')) {
    fullPath = resolve(currentContext, componentRequest)
  } else {
    fullPath = resolve(rootContext, componentRequest)
  }

  let componentName = relative(rootContext, fullPath)

  if (fs.existsSync(fullPath) && fullPath.endsWith('.mina')) {
    componentName = componentName.replace(/\.mina$/, '')
    return {
      name: componentName,
      extensions: '.mina',
      configPath: fullPath
    }
  } else if (fs.existsSync(fullPath + '.mina')) {
    return {
      name: componentName,
      extensions: '.mina',
      configPath: fullPath + '.mina'
    }
  } else {
    let extensions = ['.js', '.json', '.wxml', '.wxss']
    extensions = extensions.filter(extension => {
      const fullPath = resolve(rootContext, componentName + extension)
      return fs.existsSync(fullPath)
    })
    if (extensions.length > 0) {
      return {
        name: componentName,
        extensions: extensions,
        configPath: extensions.indexOf('.json') !== -1 ? resolve(rootContext, componentRequest + '.json') : null
      }
    } else {
      return false
    }
  }
}

module.exports = resolveComponent
