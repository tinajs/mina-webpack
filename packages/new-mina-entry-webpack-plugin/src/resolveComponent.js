const fs = require('fs')
const { resolve, relative } = require('path')

function resolveComponent (rootContext, componentRequest, currentContext) {
  const component = resolveModuleComponent(componentRequest)
  if (component) {
    return component
  }
  return resolveContextComponent(rootContext, componentRequest, currentContext)
}

function resolveContextComponent (rootContext, componentRequest, currentContext) {
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
      configPath: fullPath,
      isModule: false
    }
  } else if (fs.existsSync(fullPath + '.mina')) {
    return {
      name: componentName,
      extensions: '.mina',
      configPath: fullPath + '.mina',
      isModule: false
    }
  } else if (fs.existsSync(fullPath + '.js')) {
    let otherExtensions = ['.json', '.wxml', '.wxss']
    otherExtensions = otherExtensions.filter(extension => fs.existsSync(fullPath + extension))
    return {
      name: componentName,
      extensions: ['.js', ...otherExtensions],
      configPath: otherExtensions.indexOf('.json') !== -1 ? fullPath + '.json' : null,
      isModule: false
    }
  } else {
    return false
  }
}

function resolveModuleComponent (request) {
  if (request.startsWith('~')) {
    request = request.slice(1)
  } else if (request.startsWith('./') || request.startsWith('../') || request.startsWith('/')) {
    return false
  }

  let fullPath = null
  if (request.endsWith('.mina')) {
    fullPath = resolveModuleRequest(request)
  } else {
    fullPath = resolveModuleRequest(request + '.mina') || resolveModuleRequest(request + '.js')
  }
  if (!fullPath) {
    return false
  }

  if (fullPath.endsWith('.mina')) {
    return {
      name: request.replace(/\.mina$/, ''),
      extensions: '.mina',
      configPath: fullPath,
      isModule: true
    }
  } else {
    fullPath = fullPath.replace(/\.js$/, '')
    otherExtensions = ['.json', '.wxml', '.wxss'].filter(extension => fs.existsSync(fullPath + extension))
    return {
      name: request,
      extensions: ['.js', ...otherExtensions],
      configPath: otherExtensions.indexOf('.json') > -1 ? fullPath + '.json' : null,
      isModule: true
    }
  }
}

function resolveModuleRequest (request) {
  try {
    return require.resolve(request)
  } catch (error) {
    return false
  }
}

module.exports = resolveComponent
