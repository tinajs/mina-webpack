const fs = require('fs')
const { resolve, relative } = require('path')

function resolveComponent (rootContext, componentRequest, currentContext) {
  if (!currentContext) {
    currentContext = rootContext
  }

  let fullPath = null
  if (componentRequest.startsWith('/')) {
    fullPath = resolve(rootContext, componentRequest.slice(1))
  } else {
    fullPath = resolve(currentContext, componentRequest)
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
    extensions = extensions.filter(extension => fs.existsSync(fullPath + extension))
    if (extensions.length > 0) {
      return {
        name: componentName,
        extensions: extensions,
        configPath: extensions.indexOf('.json') !== -1 ? fullPath + '.json' : null
      }
    } else {
      return false
    }
  }
}

module.exports = resolveComponent
